from server.main import app

import uvicorn

# Thanks:
# https://stackoverflow.com/questions/62856818/how-can-i-run-the-fast-api-server-using-pycharm
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)