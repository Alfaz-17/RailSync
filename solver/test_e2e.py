"""
RailSync FastAPI Server End-to-End HTTP Integration Tests
"""

import unittest
import json
import urllib.request

BASE_URL = "http://127.0.0.1:8787"

class TestRailSyncAPI(unittest.TestCase):
    def test_01_health_check(self):
        req = urllib.request.Request(f"{BASE_URL}/api/health")
        with urllib.request.urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode())
            self.assertEqual(data["status"], "ok")
            self.assertEqual(data["solver"], "ortools-cpsat")

    def test_02_solve_and_validate(self):
        payload = {
            "tasks": [
                {
                    "id": "ENG-001",
                    "department": "Engineering",
                    "corridorId": "C001",
                    "durationMin": 120,
                    "priorityScore": 92,
                    "priorityBand": "Critical",
                    "requiredResource": "Track Gang A",
                    "requiredState": "Track Possession",
                    "dueDate": "2026-09-30",
                    "title": "Track Repair",
                },
                {
                    "id": "SIG-001",
                    "department": "Signal",
                    "corridorId": "C001",
                    "durationMin": 90,
                    "priorityScore": 75,
                    "priorityBand": "High",
                    "requiredResource": "Signal Crew 1",
                    "requiredState": "Track Possession",
                    "dueDate": "2026-09-30",
                    "title": "Point Machine Inspection",
                },
            ],
            "windows": [
                {
                    "id": "BW-001",
                    "corridorId": "C001",
                    "start": "2026-09-28T01:00",
                    "end": "2026-09-28T03:00",
                    "durationMin": 120,
                    "dayOfWeek": "Monday",
                }
            ],
            "compatibilityRules": [
                {
                    "id": "R-001",
                    "departments": ["Engineering", "Signal"],
                    "requiredStates": ["Track Possession"],
                    "compatible": True,
                }
            ],
            "resources": [
                {"id": "Track Gang A", "capacity": 1},
                {"id": "Signal Crew 1", "capacity": 1},
            ],
            "locks": [],
            "timeLimitSeconds": 5,
        }

        req = urllib.request.Request(
            f"{BASE_URL}/api/solve",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )

        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            result = json.loads(resp.read().decode())
            self.assertIn(result["status"], ["OPTIMAL", "FEASIBLE"])
            self.assertTrue(len(result["blocks"]) > 0)
            self.assertEqual(len(result["validationErrors"]), 0)
            print("API Solve Result Status:", result["status"], "Runtime:", result["solverRuntimeMs"], "ms")

    def test_03_standalone_validation_endpoint(self):
        plan = {
            "status": "FEASIBLE",
            "solverRuntimeMs": 10,
            "blocks": [
                {
                    "blockId": "BLOCK-001",
                    "windowId": "BW-001",
                    "corridorId": "C001",
                    "corridorName": "Ahmedabad → Nadiad",
                    "start": "2026-09-28T01:00",
                    "end": "2026-09-28T03:00",
                    "durationMin": 120,
                    "tasks": [
                        {
                            "taskId": "ENG-001",
                            "windowId": "BW-001",
                            "department": "Engineering",
                            "corridorId": "C001",
                            "durationMin": 120,
                        }
                    ],
                    "departments": ["Engineering"],
                    "isLocked": False,
                    "reasons": [],
                }
            ],
            "unscheduled": [],
            "trainImpacts": [],
            "metrics": {},
            "validationErrors": [],
        }

        tasks = [
            {
                "id": "ENG-001",
                "department": "Engineering",
                "corridorId": "C001",
                "durationMin": 120,
                "priorityScore": 90,
                "priorityBand": "Critical",
                "requiredResource": "Track Gang A",
                "requiredState": "Track Possession",
                "dueDate": "2026-09-30",
            }
        ]

        windows = [
            {
                "id": "BW-001",
                "corridorId": "C001",
                "start": "2026-09-28T01:00",
                "end": "2026-09-28T03:00",
                "durationMin": 120,
                "dayOfWeek": "Monday",
            }
        ]

        validate_payload = {
            "plan": plan,
            "tasks": tasks,
            "windows": windows,
            "compatibilityRules": [],
            "resources": [],
            "locks": [],
            "trainOccupancy": [],
        }

        req = urllib.request.Request(
            f"{BASE_URL}/api/validate",
            data=json.dumps(validate_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )

        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            res = json.loads(resp.read().decode())
            self.assertTrue(res["valid"])
            self.assertEqual(res["errorCount"], 0)

if __name__ == "__main__":
    unittest.main()
