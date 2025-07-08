from datetime import datetime

now = datetime.now()
print(f"Current date: {now}")
print(f"Current month: {now.month} (1=Jan, 7=July)")
print(f"Current year: {now.year}")
print(f"This month range: {datetime(now.year, now.month, 1)} to {now}")