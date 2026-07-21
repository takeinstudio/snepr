import urllib.request
import json
import zipfile
import io

repo = "takeinstudio/snepr" # or snepr-live-salon-app, let's try snepr first
try:
    url = f"https://api.github.com/repos/{repo}/actions/runs?per_page=1"
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github.v3+json")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        run_id = data['workflow_runs'][0]['id']
        print(f"Latest run ID: {run_id}")
        
        # Get logs
        log_url = f"https://api.github.com/repos/{repo}/actions/runs/{run_id}/logs"
        log_req = urllib.request.Request(log_url)
        # Note: logs endpoint redirects to a zip file download.
        # But for public repos, we can just download it.
        try:
            with urllib.request.urlopen(log_req) as log_response:
                zip_data = log_response.read()
                with zipfile.ZipFile(io.BytesIO(zip_data)) as z:
                    for filename in z.namelist():
                        if "Build Android AAB" in filename or "build" in filename:
                            print(f"\n--- {filename} ---")
                            print(z.read(filename).decode('utf-8')[-2000:]) # last 2000 chars
        except Exception as e:
            print("Could not fetch logs directly:", e)
except Exception as e:
    print("Error fetching run:", e)
