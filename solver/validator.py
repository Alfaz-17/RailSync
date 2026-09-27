"""
RailSync Plan Validator
-----------------------
Independent validation separate from the optimizer.
Applied to generated plans, manual edits, and approval requests.

Returns structured errors with affected IDs, rule codes, and readable messages.
"""

from __future__ import annotations
from scheduler import (
    ScheduleResult, ScheduledBlock, TaskInput, WindowInput,
    CompatibilityRule, ResourceInput, LockedBlock, TrainOccupancy,
    are_departments_compatible, parse_minutes,
)


class ValidationError:
    def __init__(self, code: str, message: str, affected_ids: list[str] | None = None):
        self.code = code
        self.message = message
        self.affected_ids = affected_ids or []

    def to_dict(self):
        return {
            "code": self.code,
            "message": self.message,
            "affectedIds": self.affected_ids,
        }


def validate_plan(
    result: ScheduleResult,
    tasks: list[TaskInput],
    windows: list[WindowInput],
    rules: list[CompatibilityRule],
    resources: list[ResourceInput],
    locks: list[LockedBlock],
    trains: list[TrainOccupancy],
) -> list[ValidationError]:
    """Validate a schedule result against all constraints. Returns list of errors."""

    errors: list[ValidationError] = []
    task_map = {t.id: t for t in tasks}
    window_map = {w.id: w for w in windows}
    lock_map = {lk.taskId: lk.windowId for lk in locks}
    res_cap = {r.id: r.capacity for r in resources}

    assigned_task_ids: set[str] = set()
    all_task_ids = {t.id for t in tasks}

    # ── Check each block ──
    for block in result.blocks:
        # 1. Window exists
        if block.windowId not in window_map:
            errors.append(ValidationError(
                "INVALID_WINDOW_REF",
                f"Block {block.blockId} references non-existent window {block.windowId}",
                [block.blockId, block.windowId],
            ))
            continue

        w = window_map[block.windowId]

        # 2. Corridor match
        if block.corridorId != w.corridorId:
            errors.append(ValidationError(
                "CORRIDOR_MISMATCH",
                f"Block {block.blockId} corridor {block.corridorId} doesn't match window {w.id} corridor {w.corridorId}",
                [block.blockId],
            ))

        # 3. Block containment — block times within window times
        block_start = parse_minutes(block.start)
        block_end = parse_minutes(block.end)
        win_start = parse_minutes(w.start)
        win_end = parse_minutes(w.end)

        if block_start < win_start or block_end > win_end:
            errors.append(ValidationError(
                "BLOCK_OUTSIDE_WINDOW",
                f"Block {block.blockId} ({block.start}–{block.end}) exceeds window {w.id} ({w.start}–{w.end})",
                [block.blockId, w.id],
            ))

        # 4. Check each task in the block
        resource_usage: dict[str, int] = {}

        for at in block.tasks:
            # Task exists
            if at.taskId not in task_map:
                errors.append(ValidationError(
                    "INVALID_TASK_REF",
                    f"Block {block.blockId} references non-existent task {at.taskId}",
                    [block.blockId, at.taskId],
                ))
                continue

            task = task_map[at.taskId]

            # Duplicate assignment check
            if at.taskId in assigned_task_ids:
                errors.append(ValidationError(
                    "DUPLICATE_ASSIGNMENT",
                    f"Task {at.taskId} is assigned to multiple blocks",
                    [at.taskId, block.blockId],
                ))
            assigned_task_ids.add(at.taskId)

            # Corridor match for task
            if task.corridorId != block.corridorId:
                errors.append(ValidationError(
                    "TASK_CORRIDOR_MISMATCH",
                    f"Task {at.taskId} (corridor {task.corridorId}) in block on corridor {block.corridorId}",
                    [at.taskId, block.blockId],
                ))

            # Duration fit
            if task.durationMin > w.durationMin:
                errors.append(ValidationError(
                    "DURATION_EXCEEDS_WINDOW",
                    f"Task {at.taskId} ({task.durationMin}min) exceeds window {w.id} ({w.durationMin}min)",
                    [at.taskId, w.id],
                ))

            # Resource tracking
            res = task.requiredResource
            resource_usage[res] = resource_usage.get(res, 0) + 1

        # 5. Resource capacity
        for res_name, usage in resource_usage.items():
            cap = res_cap.get(res_name, 1)
            if usage > cap:
                errors.append(ValidationError(
                    "RESOURCE_CAPACITY_EXCEEDED",
                    f"Resource {res_name} used {usage} times in block {block.blockId} (capacity: {cap})",
                    [block.blockId, res_name],
                ))

        # 6. Compatibility check
        block_tasks = [task_map[at.taskId] for at in block.tasks if at.taskId in task_map]
        for i, t1 in enumerate(block_tasks):
            for t2 in block_tasks[i+1:]:
                if t1.department != t2.department:
                    if not are_departments_compatible(
                        t1.department, t2.department,
                        t1.requiredState, t2.requiredState,
                        rules
                    ):
                        errors.append(ValidationError(
                            "INCOMPATIBLE_TASKS",
                            f"Tasks {t1.id} ({t1.department}) and {t2.id} ({t2.department}) are not compatible for sharing block {block.blockId}",
                            [t1.id, t2.id, block.blockId],
                        ))

        # 7. Department list accuracy
        actual_depts = sorted(set(
            task_map[at.taskId].department for at in block.tasks if at.taskId in task_map
        ))
        if actual_depts != sorted(block.departments):
            errors.append(ValidationError(
                "DEPARTMENT_MISMATCH",
                f"Block {block.blockId} declares departments {block.departments} but tasks have {actual_depts}",
                [block.blockId],
            ))

        # 8. Train occupancy conflicts
        for train in trains:
            if train.corridorId == block.corridorId:
                train_start = parse_minutes(train.start)
                train_end = parse_minutes(train.end)
                if train_start < block_end and train_end > block_start:
                    errors.append(ValidationError(
                        "TRAIN_CONFLICT",
                        f"Block {block.blockId} overlaps train {train.trainId} on {block.corridorId}",
                        [block.blockId, train.trainId],
                    ))

    # ── Lock consistency ──
    for task_id, window_id in lock_map.items():
        if task_id in task_map:
            found = False
            for block in result.blocks:
                for at in block.tasks:
                    if at.taskId == task_id and block.windowId == window_id:
                        found = True
                        break
            if not found:
                # Check if task is unscheduled
                is_unscheduled = any(u.taskId == task_id for u in result.unscheduled)
                errors.append(ValidationError(
                    "LOCK_VIOLATED",
                    f"Task {task_id} locked to window {window_id} but not assigned there"
                    + (" (task is unscheduled)" if is_unscheduled else ""),
                    [task_id, window_id],
                ))

    # ── Every eligible task accounted for ──
    unscheduled_ids = {u.taskId for u in result.unscheduled}
    for t in tasks:
        if t.id not in assigned_task_ids and t.id not in unscheduled_ids:
            errors.append(ValidationError(
                "TASK_UNACCOUNTED",
                f"Task {t.id} is neither scheduled nor in the unscheduled list",
                [t.id],
            ))

    # ── No spurious tasks ──
    for u in result.unscheduled:
        if u.taskId in assigned_task_ids:
            errors.append(ValidationError(
                "DUAL_STATUS",
                f"Task {u.taskId} appears in both scheduled and unscheduled lists",
                [u.taskId],
            ))

    return errors
