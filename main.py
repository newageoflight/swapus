from server.main import app

import argparse
import uvicorn

# Thanks:
# https://stackoverflow.com/questions/62856818/how-can-i-run-the-fast-api-server-using-pycharm
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("port")
    args = parser.parse_args()
    uvicorn.run(app, host="0.0.0.0", port=int(args.port))