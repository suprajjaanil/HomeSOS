import threading
import time
import uvicorn
from test_e2e import run_tests

def start_server():
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, log_level="warning")

if __name__ == "__main__":
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    print("Waiting for HomeSOS backend server to start on 127.0.0.1:8000...")
    time.sleep(2.5)

    try:
        run_tests()
    except Exception as e:
        print(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
