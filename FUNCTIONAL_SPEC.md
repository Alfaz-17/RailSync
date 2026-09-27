# RailSync System Documentation — Functional Product Specification

**SIH26027 • Team CodeFreaks • Version 1.0 • 26 September 2026**

RailSync coordinates railway maintenance work across Engineering, S&T and TRD/OHE. It converts uploaded maintenance and operating data into dated block recommendations, explains selected and unscheduled work, and supports planner review and approval.

Only the datasets are synthetic. File ingestion, validation, scheduling, replanning, explanations, metrics, versioning and exports must run on the supplied inputs. Changing a relevant input must trigger a real evaluation; a static plan is never a valid fallback.

---

## Purpose and Audience

This specification is for Alfaz and the CodeFreaks development team, reviewers and demo presenters. It defines the target system and its acceptance criteria. API paths, schemas, numerical limits and implementation choices below are proposed contracts, not claims that those features already exist.

The last inspected repository snapshot was `e3e475c`. It contained an interactive frontend with preset plans. Later local changes have not been verified by this document. Completion requires the tests in Section 19.

### Reading Map

| Sections | What they explain |
| :--- | :--- |
| **02 to 04** | Scope, user workflow and architecture |
| **05 to 07** | Input contracts, example dataset and ingestion |
| **08 to 10** | Scheduling, independent validation and explanations |
| **11 to 12** | Disruptions, locks, approval and plan versions |
| **13 to 15** | API contracts, request examples and persistent records |
| **16 to 18** | Screens, metrics and a worked scheduling example |
| **19 to 21** | Acceptance tests, demonstration, delivery and references |

### System Boundary
RailSync recommends maintenance plans. Planner approval in this application is an internal review record; it does not issue a railway possession authority, change signals, control trains or replace operating procedures. Real railway use requires authorized data, expert-validated rules and operational integration.

---

## 02 Scope and Completion Criteria

The first release is a fully functional application exercised with synthetic railway data. It must accept a previously unseen valid dataset within its documented size limits and calculate a supported result.

| ID | Required Capability | Evidence of Completion |
| :--- | :--- | :--- |
| **F01** | **Import datasets** | Invalid rows are identified; valid input becomes a saved revision. |
| **F02** | **Unified workbank** | All imported departmental tasks are searchable and traceable. |
| **F03** | **Generate plan** | FastAPI invokes OR-Tools using the selected revision and horizon. |
| **F04** | **Validate and explain** | Assignments pass independent checks; omitted work has supported reasons. |
| **F05** | **Replan** | Changed windows, resources or task duration change the evaluated inputs. |
| **F06** | **Planner control** | Valid locks persist; edits require renewed approval. |
| **F07** | **Consistent reporting** | All screens and exports derive from the same plan version. |
| **F08** | **Persist and recover** | Server restart does not erase committed inputs or approved versions. |

### Included in the Functional Release
JSON import is the canonical input route. CSV or XLSX adapters may map the same schema later. Include dated 7-day and 30-day plans, a task editor, baseline comparison, structured explanations, version history, JSON export, resettable examples, error handling and an independently testable validator.

### Deferred Integrations
Live TMS, SMMS, TDMS and operating-system connectors, train rescheduling, signaling/control integration and Gemini narration are outside the initial required release. Source tags describe origin categories; they do not imply a live connection. Frontend visual polish must not take priority over scheduling correctness.

### Demonstrable Completion
A new uploaded file must affect the authoritative dataset. The backend must calculate its result, and the UI must show the matching input revision, solver outcome and plan version. If inputs lead to the same best assignment, an unchanged plan is legitimate. A response should never be changed arbitrarily merely to look dynamic.

Performance is a release target, not a measured claim: start with up to 100 tasks, 500 dated windows and a 30-day horizon; use a configurable 20-second solver budget. Record actual runtime and benchmark before increasing limits.

---

## 03 Users and the Complete Workflow

### Roles and Responsibilities

| Role | Allowed Work | Boundary |
| :--- | :--- | :--- |
| **Planner** | Import, edit, generate, compare and lock recommendations | Must resolve validation errors before approval. |
| **Reviewer** | Inspect, reject or approve current versions | Approval is bound to exact inputs and plan content. |
| **Viewer** | Read plans, reasons and permitted exports | Cannot mutate or approve. |
| **Administrator** | Configure datasets, identities and prototype rule sets | Cannot silently overwrite history. |

For a private single-user demonstration, one operator may perform planner and reviewer actions using a disclosed demo identity. A public or shared deployment requires authenticated identities and server-enforced roles. A role selector alone is not authorization.

### Normal Workflow
1. Select a JSON file and preview its records, source tags and planning dates.
2. Validate all entities and references. Correct errors before an atomic import.
3. Review the unified workbank, priority factors, deadlines and resource requirements.
4. Choose a track/section scope, start date, horizon and rule-set version.
5. Generate a plan. The API creates a job tied to a frozen dataset revision.
6. Inspect block timelines, execution intervals, evidence and every unscheduled task.
7. Modify or lock a recommendation. Validate the resulting candidate version.
8. Approve the exact validated version and export it with its provenance.

### Changed Operating Conditions
A window cancellation, resource outage or task edit creates a new dataset revision. Any prior plan remains readable but is marked stale relative to that revision. The planner requests a new solve, compares changes and approves again. Historical approval remains attached to its historical version.

### Failure Workflow
Invalid import leaves the active dataset unchanged. A failed or unknown solve displays its status without inventing a plan. Invalid manual edits show field-level or rule-level errors and do not mutate the saved version. If a valid incumbent exists at a solver limit, it may be reviewed with an explicit non-optimal status.

---

## 04 Architecture and Technology Ownership

| Component | Responsibility |
| :--- | :--- |
| **Next.js & TypeScript** | Screens, forms, API requests, status polling and version-aware rendering. |
| **FastAPI & Python** | Canonical validation, imports, jobs, plan edits, approval and exports. |
| **OR-Tools CP-SAT** | Actual scheduling computation using integer time units and explicit constraints. |
| **Independent Validator** | Rechecks candidate schedules without trusting solver labels or UI state. |
| **Persistence Layer** | SQLite for a local durable demo; PostgreSQL is the recommended shared-deployment target. |
| **Optional Gemini Adapter** | Narrates structured evidence only. Failure cannot block planning or approval. |

A separate Express backend is not required. Next.js can optionally proxy API requests, but scheduling and authoritative state transitions belong to FastAPI. Zustand stores UI selections and cached responses; it must not become an alternative source of approved plan truth.

### Computation Boundary
Run solves in a worker process so they do not block API request handling. Persist job inputs and statuses. One worker is sufficient initially; a distributed queue is a later scaling choice. On restart, reconcile interrupted jobs instead of leaving them permanently `RUNNING`.

### Trust Boundary
Frontend checks improve feedback; backend checks decide validity. Backend exports and approval endpoints recalculate or verify canonical results. Uploaded files are untrusted input. No browser-provided status, violation count or identity is authoritative.

---

## 05 Input File Contract

Canonical format: UTF-8 JSON, `schema_version: "1.0"`, `timezone: "Asia/Kolkata"`, `synthetic: true` and one `dataset_id`. Timestamps are ISO 8601 with explicit offsets. IDs are strings; durations and quantities are positive integers. Arrays must be present even when empty.

| Entity | Required Fields | Meaning |
| :--- | :--- | :--- |
| **sections** | `id`, `name`; `tracks` with `id` | Physical conflict scope; shared resources may span tracks. |
| **tasks** | `id`, `source`, `department`, `track_id`, `duration_min`, `release_at`, `due_at`, `priority_inputs`, `resource_demands`, `work_type`, `required_state` | Work to assign. Use Engineering, Signal or Traction department enums. |
| **windows** | `id`, `track_id`, `start_at`, `end_at`, `availability`, `permitted_states`, `setup_min`, `clearance_min` | Approved synthetic candidate limits; unavailable windows cannot be selected. |
| **movements** | `id`, `train_type`, `track_id`, `start_at`, `end_at` | Occupancy interval on the specified track; no invented delay field. |
| **resources** | `id`, `capacity`, `available_intervals` | Each task demand references an existing resource and quantity. |
| **compatibility_rules** | `id`, `work_type_a`, `work_type_b`, `state`, `concurrent_allowed` | Explicit versioned allowlist for concurrent work. |
| **top-level** | `dataset_id`, `schema_version`, `timezone`, `synthetic`, `reference_at` | Provenance and consistent overdue calculations. |

---

## 06 Complete Minimal Input Example

```json
{
  "schema_version": "1.0",
  "dataset_id": "railsync-example-01",
  "timezone": "Asia/Kolkata",
  "synthetic": true,
  "reference_at": "2026-09-28T00:00:00+05:30",
  "sections": [
    {
      "id": "SEC-A",
      "name": "Demo section A",
      "tracks": [{ "id": "TRACK-A-UP" }]
    }
  ],
  "tasks": [
    {
      "id": "ENG-01",
      "source": "TMS",
      "department": "Engineering",
      "track_id": "TRACK-A-UP",
      "duration_min": 90,
      "release_at": "2026-09-28T00:00:00+05:30",
      "due_at": "2026-09-29T06:00:00+05:30",
      "priority_inputs": {
        "criticality": 90,
        "urgency": 70,
        "safety": 80,
        "availability": 60
      },
      "resource_demands": [{ "resource_id": "CREW-E", "quantity": 1 }],
      "work_type": "TRACK_INSPECTION",
      "required_state": "POSSESSION"
    }
  ],
  "windows": [
    {
      "id": "WIN-01",
      "track_id": "TRACK-A-UP",
      "start_at": "2026-09-28T01:00:00+05:30",
      "end_at": "2026-09-28T03:00:00+05:30",
      "availability": "AVAILABLE",
      "permitted_states": ["POSSESSION"],
      "setup_min": 10,
      "clearance_min": 10
    }
  ],
  "movements": [
    {
      "id": "TRAIN-01",
      "train_type": "PASSENGER",
      "track_id": "TRACK-A-UP",
      "start_at": "2026-09-28T03:10:00+05:30",
      "end_at": "2026-09-28T03:20:00+05:30"
    }
  ],
  "resources": [
    {
      "id": "CREW-E",
      "capacity": 1,
      "available_intervals": [
        {
          "start_at": "2026-09-28T00:00:00+05:30",
          "end_at": "2026-09-28T06:00:00+05:30"
        }
      ]
    }
  ],
  "compatibility_rules": []
}
```

---

## 07 Import and Normalization Workflow

Two-stage import:
1. `POST /api/v1/datasets/validate` parses file into temporary candidate and returns content hash, counts, errors, warnings.
2. `POST /api/v1/datasets` commits validated candidate with expected active revision.

---

## 08 Scheduling Model and Objectives

Proposed v1 model:
- CP-SAT solver integer minutes formulation.
- Multi-stage optimization:
  1. Maximize critical tasks scheduled.
  2. Maximize weighted task priority coverage.
  3. Minimize lateness vs soft deadlines.
  4. Minimize total blocked track minutes and block count.
  5. Minimal movement tie-break on replan.

---

## 09 Independent Plan Validation

Decoupled validator checking:
1. `REFERENCE_INVALID`
2. `TASK_DUPLICATED`
3. `DURATION_MISMATCH`
4. `WINDOW_CONTAINMENT`
5. `TRACK_CONFLICT`
6. `RESOURCE_CONFLICT`
7. `COMPATIBILITY_INVALID`
8. `PRECEDENCE_INVALID`
9. `LOCK_CONFLICT`
10. `TASK_UNACCOUNTED`

---

## 10 Solver Outcomes and Explanations

- Explicit solver statuses: `OPTIMAL`, `FEASIBLE`, `INFEASIBLE`, `UNKNOWN`, `MODEL_INVALID`.
- Explicit unscheduled reason diagnosis codes: `DURATION_EXCEEDS_WINDOW`, `NO_ELIGIBLE_WINDOW`, `RESOURCE_UNAVAILABLE`, `LOCK_CONFLICT`, `NOT_SELECTED_IN_CURRENT_SOLUTION`.

---

## 11 Disruptions and Controlled Replanning

- Input mutations create new input revisions.
- Base plan version + new revision + explicit locks.
- Version comparison by stable task IDs.

---

## 12 Plan Versions and Approval Lifecycle

- Immutable version numbers.
- Separate solver status, validation state, approval state, and staleness flag.
- Server-enforced approval transaction bound to version and content hash.

---

## 13 Backend API Contract (`/api/v1/...`)

- Dataset management: `POST /datasets/validate`, `POST /datasets`, `GET /datasets/{id}`, `PATCH /datasets/{id}/tasks/{taskId}`, `POST /datasets/{id}/changes`
- Planning jobs: `POST /planning-jobs`, `GET /planning-jobs/{jobId}`
- Plans & approvals: `GET /plans/{planId}/versions/{v}`, `POST /plans/{planId}/edits`, `POST /plans/{planId}/locks`, `POST /plans/{planId}/validate`, `POST /plans/{planId}/approve`, `POST /plans/{planId}/reject`, `GET /plans/{planId}/compare`, `GET /plans/{planId}/export`
- Health: `GET /health`, `GET /ready`

---

## 14 Persistent Records and Repository Structure

SQLite local persistence with SQLAlchemy models:
`DatasetRevision`, `TaskRecord`, `WindowRecord`, `PlanningJob`, `PlanVersion`, `BlockAssignment`, `TaskOutcome`, `ValidationReport`, `ApprovalEvent`, `AuditEvent`.

---

## 19 Acceptance Tests and Release Gates (A01–A20)

| ID | Scenario | Pass Condition |
| :--- | :--- | :--- |
| **A01** | Previously unseen valid JSON | Committed input revision is used by actual solver. |
| **A02** | Duplicate ID or malformed interval | 422 with field path; active dataset unchanged. |
| **A03** | Task longer than all gaps | Unscheduled with supported duration evidence. |
| **A04** | Compatible shared work | Valid group respects durations, states and resources. |
| **A05** | Incompatible work | No invalid concurrent group selected. |
| **A06** | Competing crew demand | Capacity is never exceeded. |
| **A07** | Train occupancy overlap | Candidate excluded; manual conflicting edit rejected. |
| **A08** | Cross-midnight block | Correct date arithmetic, containment and rendering. |
| **A09** | Removed window | Real revised inputs produce a fresh evaluated result. |
| **A10** | Valid and invalid locks | Valid lock retained; invalid lock identified explicitly. |
| **A11** | Edit approved plan | New review version; old approval not reused. |
| **A12** | Stale concurrent approval | 409; no approval of outdated content. |
| **A13** | Complete accounting | Every eligible task has exactly one outcome. |
| **A14** | Metrics and export | Values agree with canonical version and validation. |
| **A15** | Time-limited solve | Correct raw status and termination reason; no fake result. |
| **A16** | Backend down or reset during solve | Clear error; no static fallback or late overwrite. |
| **A17** | Seven versus thirty days | Horizon filters dated inputs and changes scope correctly. |
| **A18** | Restart and reload | Committed plans, inputs and approval history persist. |
| **A19** | Invalid edit rollback | Saved content/hash/version remain unchanged. |
| **A20** | Baseline fairness | Same inputs and feasibility rules; coverage disclosed. |
