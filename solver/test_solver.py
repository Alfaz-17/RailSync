"""
RailSync Solver & Validator Unit Tests
"""

import unittest
from scheduler import (
    TaskInput, WindowInput, CompatibilityRule, ResourceInput,
    LockedBlock, TrainOccupancy, ScheduleRequest, solve_schedule,
)
from validator import validate_plan, ValidationError

class TestRailSyncSolver(unittest.TestCase):
    def setUp(self):
        self.windows = [
            WindowInput(
                id="WIN-001",
                corridorId="COR-1",
                start="2026-09-28T01:00",
                end="2026-09-28T04:00",
                durationMin=180,
                dayOfWeek="Monday",
            ),
            WindowInput(
                id="WIN-002",
                corridorId="COR-1",
                start="2026-09-29T01:00",
                end="2026-09-29T04:00",
                durationMin=180,
                dayOfWeek="Tuesday",
            ),
            WindowInput(
                id="WIN-003",
                corridorId="COR-2",
                start="2026-09-28T02:00",
                end="2026-09-28T05:00",
                durationMin=180,
                dayOfWeek="Monday",
            ),
        ]

        self.rules = [
            CompatibilityRule(
                id="R-ENG-SIG",
                departments=["Engineering", "Signal"],
                requiredStates=["SHADOW", "PARALLEL", "ANY"],
                compatible=True,
                description="Engineering and Signal can share blocks",
            ),
            CompatibilityRule(
                id="R-ENG-TRD",
                departments=["Engineering", "Traction"],
                requiredStates=["SHADOW", "PARALLEL", "ANY"],
                compatible=True,
                description="Engineering and Traction can share if OHE isolated",
            ),
        ]

        self.resources = [
            ResourceInput(id="TAMPING_MACHINE_1", capacity=1),
            ResourceInput(id="TOWER_WAGON_1", capacity=1),
            ResourceInput(id="SIG_CREW_1", capacity=1),
        ]

    def test_basic_feasible_schedule(self):
        """Test that compatible tasks in same corridor get scheduled, potentially co-located."""
        tasks = [
            TaskInput(
                id="TSK-001",
                department="Engineering",
                corridorId="COR-1",
                durationMin=120,
                priorityScore=90,
                priorityBand="Critical",
                requiredResource="TAMPING_MACHINE_1",
                requiredState="SHADOW",
                dueDate="2026-09-30",
                title="Track Renewal",
            ),
            TaskInput(
                id="TSK-002",
                department="Signal",
                corridorId="COR-1",
                durationMin=90,
                priorityScore=75,
                priorityBand="High",
                requiredResource="SIG_CREW_1",
                requiredState="SHADOW",
                dueDate="2026-09-30",
                title="Point Machine Maintenance",
            ),
        ]

        req = ScheduleRequest(
            tasks=tasks,
            windows=self.windows,
            compatibilityRules=self.rules,
            resources=self.resources,
            timeLimitSeconds=5,
        )

        res = solve_schedule(req)
        self.assertIn(res.status, ["OPTIMAL", "FEASIBLE"])
        self.assertEqual(len(res.unscheduled), 0)
        total_assigned = sum(len(b.tasks) for b in res.blocks)
        self.assertEqual(total_assigned, 2)

        # Independent validation
        errors = validate_plan(
            res, tasks, self.windows, self.rules, self.resources, [], []
        )
        self.assertEqual(len(errors), 0, f"Validation errors: {[e.message for e in errors]}")

    def test_corridor_isolation(self):
        """Task in COR-2 cannot be assigned to window in COR-1."""
        tasks = [
            TaskInput(
                id="TSK-COR2",
                department="Engineering",
                corridorId="COR-2",
                durationMin=120,
                priorityScore=80,
                priorityBand="High",
                requiredResource="TAMPING_MACHINE_1",
                requiredState="ANY",
                dueDate="2026-09-30",
            ),
        ]
        # Only provide COR-1 windows
        windows_cor1 = [self.windows[0], self.windows[1]]
        req = ScheduleRequest(
            tasks=tasks,
            windows=windows_cor1,
            compatibilityRules=self.rules,
            resources=self.resources,
        )
        res = solve_schedule(req)
        self.assertEqual(len(res.blocks), 0)
        self.assertEqual(len(res.unscheduled), 1)
        self.assertEqual(res.unscheduled[0].reasonCode, "NO_ELIGIBLE_WINDOW")

    def test_resource_conflict_separation(self):
        """Two tasks needing the same capacity-1 resource cannot share the same window."""
        tasks = [
            TaskInput(
                id="TSK-TAMP-1",
                department="Engineering",
                corridorId="COR-1",
                durationMin=100,
                priorityScore=90,
                priorityBand="Critical",
                requiredResource="TAMPING_MACHINE_1",
                requiredState="ANY",
                dueDate="2026-09-30",
            ),
            TaskInput(
                id="TSK-TAMP-2",
                department="Engineering",
                corridorId="COR-1",
                durationMin=100,
                priorityScore=85,
                priorityBand="High",
                requiredResource="TAMPING_MACHINE_1",
                requiredState="ANY",
                dueDate="2026-09-30",
            ),
        ]
        # Give two windows in COR-1
        windows_cor1 = [self.windows[0], self.windows[1]]
        req = ScheduleRequest(
            tasks=tasks,
            windows=windows_cor1,
            compatibilityRules=self.rules,
            resources=self.resources,
        )
        res = solve_schedule(req)
        self.assertIn(res.status, ["OPTIMAL", "FEASIBLE"])
        self.assertEqual(len(res.unscheduled), 0)
        # Should be scheduled in different windows
        window_ids = [b.windowId for b in res.blocks if len(b.tasks) > 0]
        self.assertEqual(len(set(window_ids)), 2, "Tasks sharing capacity-1 resource must use distinct windows")

    def test_locked_block_adherence(self):
        """Locked task must be scheduled to designated window."""
        tasks = [
            TaskInput(
                id="TSK-LOCKED",
                department="Engineering",
                corridorId="COR-1",
                durationMin=100,
                priorityScore=50,
                priorityBand="Medium",
                requiredResource="TAMPING_MACHINE_1",
                requiredState="ANY",
                dueDate="2026-09-30",
            ),
        ]
        locks = [LockedBlock(taskId="TSK-LOCKED", windowId="WIN-002")]
        req = ScheduleRequest(
            tasks=tasks,
            windows=self.windows,
            compatibilityRules=self.rules,
            resources=self.resources,
            locks=locks,
        )
        res = solve_schedule(req)
        self.assertIn(res.status, ["OPTIMAL", "FEASIBLE"])
        block = next(b for b in res.blocks if any(t.taskId == "TSK-LOCKED" for t in b.tasks))
        self.assertEqual(block.windowId, "WIN-002")
        self.assertTrue(block.isLocked)

    def test_task_duration_exceeds_window(self):
        """Task longer than all available windows must be reported unscheduled with DURATION_EXCEEDED."""
        tasks = [
            TaskInput(
                id="TSK-HUGE",
                department="Engineering",
                corridorId="COR-1",
                durationMin=240,  # Windows are 180 min
                priorityScore=95,
                priorityBand="Critical",
                requiredResource="TAMPING_MACHINE_1",
                requiredState="ANY",
                dueDate="2026-09-30",
            ),
        ]
        req = ScheduleRequest(
            tasks=tasks,
            windows=self.windows,
            compatibilityRules=self.rules,
            resources=self.resources,
        )
        res = solve_schedule(req)
        self.assertEqual(len(res.blocks), 0)
        self.assertEqual(len(res.unscheduled), 1)
        self.assertEqual(res.unscheduled[0].reasonCode, "DURATION_EXCEEDS_WINDOW")

    def test_validator_detects_corridor_mismatch(self):
        """Validator independently catches corridor mismatch injected manually."""
        tasks = [
            TaskInput(
                id="TSK-001",
                department="Engineering",
                corridorId="COR-1",
                durationMin=60,
                priorityScore=80,
                priorityBand="High",
                requiredResource="TAMPING_MACHINE_1",
                requiredState="ANY",
                dueDate="2026-09-30",
            ),
        ]
        req = ScheduleRequest(
            tasks=tasks,
            windows=self.windows,
            compatibilityRules=self.rules,
            resources=self.resources,
        )
        res = solve_schedule(req)
        # Corrupt the block corridor to trigger validator
        res.blocks[0].corridorId = "COR-INVALID"
        errors = validate_plan(res, tasks, self.windows, self.rules, self.resources, [], [])
        corridor_errors = [e for e in errors if e.code == "CORRIDOR_MISMATCH"]
        self.assertTrue(len(corridor_errors) > 0)


if __name__ == "__main__":
    unittest.main()
