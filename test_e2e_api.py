"""
End-to-End API Integration Verification for RailSync
Tests Next.js API Routes connected to Python OR-Tools FastAPI Backend.
"""

import urllib.request
import json

def test_api_e2e():
    print("==================================================")
    print("RAILSYNC END-TO-END API TEST RUN")
    print("==================================================")

    # 1. Test Next.js /api/optimize (Normal Scenario)
    print("\n[TEST 1] Testing Next.js /api/optimize calling Python OR-Tools solver...")
    opt_req = urllib.request.Request(
        "http://localhost:3000/api/optimize",
        data=json.dumps({"scenario": "NORMAL"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(opt_req, timeout=10) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        data = json.loads(resp.read().decode())
        print(f"  [PASS] HTTP Status: {resp.status}")
        print(f"  [PASS] Solver Engine: {data.get('solverLabel')}")
        print(f"  [PASS] Solver Status: {data.get('status')}")
        print(f"  [PASS] Solve Runtime: {data.get('runtimeLabel')}")
        print(f"  [PASS] Total Blocks Scheduled: {len(data.get('blocks', []))}")
        print(f"  [PASS] Unscheduled Tasks: {len(data.get('unscheduled', []))}")
        print(f"  [PASS] Validation Errors: {len(data.get('validationErrors', []))}")
        print(f"  [PASS] Metrics: {data.get('metrics')}")
        assert "OR-TOOLS" in data.get("solverLabel", "") or "CP-SAT" in data.get("solverLabel", ""), "Expected CP-SAT engine"
        assert data.get("status") in ["OPTIMAL", "FEASIBLE"], "Expected optimal or feasible status"
        assert len(data.get("blocks", [])) > 0, "Expected scheduled blocks"

    # 2. Test Next.js /api/validate (Valid Plan)
    print("\n[TEST 2] Testing Next.js /api/validate with clean plan...")
    val_req = urllib.request.Request(
        "http://localhost:3000/api/validate",
        data=json.dumps({"blocks": data["blocks"]}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(val_req, timeout=10) as resp:
        assert resp.status == 200
        val_data = json.loads(resp.read().decode())
        print(f"  [PASS] Valid: {val_data.get('valid')}")
        print(f"  [PASS] Error Count: {val_data.get('errorCount')}")
        assert val_data.get("valid") is True, "Plan should be valid"
        assert val_data.get("errorCount") == 0, "Plan should have 0 errors"

    # 3. Test Next.js /api/validate (Invalid Plan Detection)
    print("\n[TEST 3] Testing Next.js /api/validate with intentionally corrupted plan...")
    corrupted_blocks = [dict(b) for b in data["blocks"]]
    corrupted_blocks[0]["corridorId"] = "INVALID_CORRIDOR"
    val_bad_req = urllib.request.Request(
        "http://localhost:3000/api/validate",
        data=json.dumps({"blocks": corrupted_blocks}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(val_bad_req, timeout=10) as resp:
        assert resp.status == 200
        bad_val_data = json.loads(resp.read().decode())
        print(f"  [PASS] Correctly Flagged Invalid: {not bad_val_data.get('valid')}")
        print(f"  [PASS] Caught Error Codes: {[e['code'] for e in bad_val_data.get('errors', [])]}")
        assert bad_val_data.get("valid") is False, "Corrupted plan must be marked invalid"
        assert any(e["code"] == "CORRIDOR_MISMATCH" for e in bad_val_data.get("errors", [])), "Must flag CORRIDOR_MISMATCH"

    # 4. Test Re-optimization with Lock Preservation
    print("\n[TEST 4] Testing Re-optimization with Planner Lock Preservation under COA Disruption...")
    lock_id = data["blocks"][0]["id"]
    data["blocks"][0]["isLocked"] = True
    reopt_req = urllib.request.Request(
        "http://localhost:3000/api/optimize",
        data=json.dumps({
            "scenario": "COA_DISRUPTION",
            "lockedBlockIds": [lock_id],
            "existingBlocks": data["blocks"]
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(reopt_req, timeout=10) as resp:
        assert resp.status == 200
        reopt_data = json.loads(resp.read().decode())
        print(f"  [PASS] Disruption Re-plan Version: {reopt_data.get('version')}")
        print(f"  [PASS] Solver Status: {reopt_data.get('status')}")
        print(f"  [PASS] Audit Events: {len(reopt_data.get('auditEvents', []))}")
        locked_block = next((b for b in reopt_data.get("blocks", []) if b["id"] == lock_id), None)
        assert locked_block is not None, f"Locked block {lock_id} must be preserved"
        print(f"  [PASS] Preserved Locked Block: {locked_block['id']} in window {locked_block['windowId']}")

    print("\n==================================================")
    print("ALL 4 END-TO-END API INTEGRATION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_api_e2e()
