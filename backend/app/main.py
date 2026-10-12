import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from app.config import OPENROUTER_API_KEY
from app.services.cleanup import clean_transcript

app = FastAPI()


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")


class CleanupRequest(BaseModel):
    text: str


class CleanupResponse(BaseModel):
    text: str


@app.post("/api/cleanup", response_model=CleanupResponse)
async def cleanup(body: CleanupRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="Add OPENROUTER_API_KEY to backend/.env")
    try:
        cleaned = await clean_transcript(body.text)
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=f"Cleanup failed: {error}")
    return CleanupResponse(text=cleaned)
