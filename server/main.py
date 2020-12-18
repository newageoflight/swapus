from fastapi import FastAPI

app = FastAPI()

@app.get("/api/v1/")
async def root():
    return {"message": "Hello World!"}