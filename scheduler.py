import time
import subprocess
import os
from datetime import datetime, timedelta

def run_sync_command():
    manage_py_path = os.path.join(os.path.dirname(__file__), 'dropship_project', 'manage.py')
    subprocess.run(['python3', manage_py_path, 'sync_aliexpress_products'])

def main():
    while True:
        now = datetime.now()
        next_run = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        time_to_wait = (next_run - now).total_seconds()
        
        print(f"Next sync scheduled at {next_run}")
        time.sleep(time_to_wait)
        
        print("Running AliExpress product sync...")
        run_sync_command()

if __name__ == "__main__":
    main()

