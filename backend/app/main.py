import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from app.config import ASSEMBLYAI_API_KEY, OPENROUTER_API_KEY
from app.services import assemblyai
from app.services.cleanup import clean_transcript

app = FastAPI()


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")


class CleanupRequest(BaseModel):
    text: str


class CleanupResponse(BaseModel):
    text: str


class TranscriptStart(BaseModel):
    upload_url: str


class TranscriptStarted(BaseModel):
    id: str


class TranscriptStatus(BaseModel):
    status: str
    text: str | None = None
    error: str | None = None


def _require_assemblyai_key():
    if not ASSEMBLYAI_API_KEY:
        raise HTTPException(status_code=500, detail="Add ASSEMBLYAI_API_KEY to backend/.env")


def _outside_service_error(error: httpx.HTTPError) -> HTTPException:
    if isinstance(error, httpx.HTTPStatusError):
        return HTTPException(
            status_code=502,
            detail=f"AssemblyAI returned {error.response.status_code}",
        )
    return HTTPException(status_code=502, detail=f"AssemblyAI request failed: {error}")


@app.post("/api/cleanup", response_model=CleanupResponse)
async def cleanup(body: CleanupRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="Add OPENROUTER_API_KEY to backend/.env")
    try:
        cleaned = await clean_transcript(body.text)
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=f"Cleanup failed: {error}")
    return CleanupResponse(text=cleaned)


@app.post("/api/upload", response_model=TranscriptStart)
async def upload(file: UploadFile = File(...)):
    _require_assemblyai_key()
    try:
        upload_url = await assemblyai.upload_audio(await file.read())
    except httpx.HTTPError as error:
        raise _outside_service_error(error)
    return TranscriptStart(upload_url=upload_url)


@app.post("/api/transcripts", response_model=TranscriptStarted)
async def start_transcript(body: TranscriptStart):
    _require_assemblyai_key()
    try:
        transcript_id = await assemblyai.start_transcript(body.upload_url)
    except httpx.HTTPError as error:
        raise _outside_service_error(error)
    return TranscriptStarted(id=transcript_id)


@app.get("/api/transcripts/{transcript_id}", response_model=TranscriptStatus)
async def transcript_status(transcript_id: str):
    _require_assemblyai_key()
    try:
        data = await assemblyai.get_transcript(transcript_id)
    except httpx.HTTPError as error:
        raise _outside_service_error(error)
    return TranscriptStatus(status=data["status"], text=data.get("text"), error=data.get("error"))
