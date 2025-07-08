#!/usr/bin/env python3
import requests
import time

# Wait a bit for server to be ready
time.sleep(5)

# Test July 5-8 (your example with 13 calls)
url = "http://localhost:3000/api/dashboard?startDate=2025-07-05&endDate=2025-07-08"
try:
    response = requests.get(url, timeout=30)
    if response.status_code == 200:
        data = response.json()
        metrics = data.get('data', {})
        print("July 5-8, 2025 Results:")
        print(f"  Booked Calls: {metrics.get('callsBooked', 'N/A')} (expected: 13)")
        
        # Also test July 1-8 for comparison
        url2 = "http://localhost:3000/api/dashboard?startDate=2025-07-01&endDate=2025-07-08"
        response2 = requests.get(url2, timeout=30)
        if response2.status_code == 200:
            data2 = response2.json()
            metrics2 = data2.get('data', {})
            print("\nJuly 1-8, 2025 Results:")
            print(f"  Applications: {metrics2.get('totalApplications', 'N/A')} (expected: 72)")
            print(f"  MQLs: {metrics2.get('totalMQLs', 'N/A')} (expected: 22)")
            print(f"  Booked Calls: {metrics2.get('callsBooked', 'N/A')} (expected: 33)")
            print(f"  Intros Taken: {metrics2.get('introsTaken', 'N/A')} (expected: 10)")
    else:
        print(f"Error: {response.status_code}")
except Exception as e:
    print(f"Error connecting to server: {e}")