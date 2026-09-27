"""
RailSync Solver API
-------------------
FastAPI backend exposing the OR-Tools CP-SAT scheduler and plan validator.

Run with:
  cd solver && python -m uvicorn server:app --port 8787 --reload

Endpoints:
  POST /api/solve      – Run constraint-based scheduling
  POST /api/validate   – Validate an existing plan
  GET  /api/health     – Health check
"""

from __future__ import annotations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scheduler import ScheduleRequest, ScheduleResult, solve_schedule
from validator import validate_plan, ValidationError as VError

app = FastAPI(
    title="RailSync Solver",
    description="OR-Tools CP-SAT constraint-based maintenance block planner (prototype)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "solver": "ortools-cpsat", "prototype": True}


@app.post("/api/solve", response_model=ScheduleResult)
def solve(req: ScheduleRequest):
    """Run constraint-based scheduling and return the result with validation."""
    try:
        result = solve_schedule(req)

        # Run independent validation on the result
        v_errors = validate_plan(
            result, req.tasks, req.windows,
            req.compatibilityRules, req.resources,
            req.locks, req.trainOccupancy,
        )
        result.validationErrors = [e.message for e in v_errors]

        # Update metrics with validation info
        if result.metrics:
            result.metrics["hardViolations"] = len([
                e for e in v_errors
                if e.code not in ("TASK_UNACCOUNTED",)  # Unaccounted is solver incompleteness, not violation
            ])

        return result
    except Exception as e:
        return ScheduleResult(
            status="ERROR",
            solverRuntimeMs=0,
            validationErrors=[str(e)],
            metrics={"error": str(e)},
        )


class ValidateRequest(BaseModel):
    plan: ScheduleResult
    tasks: list[dict]
    windows: list[dict]
    compatibilityRules: list[dict] = []
    resources: list[dict] = []
    locks: list[dict] = []
    trainOccupancy: list[dict] = []


@app.post("/api/validate")
def validate(req: ValidateRequest):
    """Validate an existing plan against constraints."""
    try:
        from scheduler import TaskInput, WindowInput, CompatibilityRule, ResourceInput, LockedBlock, TrainOccupancy
        tasks_typed = [TaskInput(**t) for t in req.tasks]
        windows_typed = [WindowInput(**w) for w in req.windows]
        rules_typed = [CompatibilityRule(**r) for r in req.compatibilityRules]
        resources_typed = [ResourceInput(**r) for r in req.resources]
        locks_typed = [LockedBlock(**lk) for lk in req.locks]
        trains_typed = [TrainOccupancy(**tr) for tr in req.trainOccupancy]

        errors = validate_plan(
            req.plan, tasks_typed, windows_typed,
            rules_typed, resources_typed,
            locks_typed, trains_typed,
        )
        return {
            "valid": len(errors) == 0,
            "errorCount": len(errors),
            "errors": [e.to_dict() for e in errors],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8787)
