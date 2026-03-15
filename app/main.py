import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agents.supervisor_agent import process_relocation_stream

load_dotenv()

app = FastAPI(title="NexusMigrate Swarm API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RelocationQuery(BaseModel):
    prompt: str


@app.get("/")
def read_root():
    return {"status": "NexusMigrate Swarm API is online and waiting for orders."}


@app.post("/api/relocate")
async def relocate(query: RelocationQuery):
    async def event_generator():
        try:
            async for update in process_relocation_stream(query.prompt):
                yield f"data: {json.dumps(update)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    app_port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=app_port)
