import asyncio

import httpx

from app.config import ASSEMBLYAI_API_KEY

BASE_URL = "https://api.assemblyai.com/v2"
SPEECH_MODELS = ["universal-3-5-pro", "universal-2"]
MAX_STATUS_ATTEMPTS = 3
DEFAULT_RETRY_SECONDS = 5


def _auth_headers() -> dict:
    # AssemblyAI takes the raw key here, with no "Bearer" prefix.
    return {"Authorization": ASSEMBLYAI_API_KEY}


async def upload_audio(content: bytes) -> str:
    async with httpx.AsyncClient(timeout=300) as client:
        response = await client.post(
            f"{BASE_URL}/upload",
            headers={**_auth_headers(), "Content-Type": "application/octet-stream"},
            content=content,
        )
    response.raise_for_status()
    return response.json()["upload_url"]


async def start_transcript(upload_url: str) -> str:
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{BASE_URL}/transcript",
            headers=_auth_headers(),
            json={"audio_url": upload_url, "speech_models": SPEECH_MODELS},
        )
    response.raise_for_status()
    return response.json()["id"]


async def get_transcript(transcript_id: str) -> dict:
    async with httpx.AsyncClient(timeout=60) as client:
        # When AssemblyAI says "slow down" (429), wait as it asks and try again.
        for _ in range(MAX_STATUS_ATTEMPTS):
            response = await client.get(
                f"{BASE_URL}/transcript/{transcript_id}",
                headers=_auth_headers(),
            )
            if response.status_code != 429:
                break
            await asyncio.sleep(_retry_after_seconds(response))
    response.raise_for_status()
    return response.json()


def _retry_after_seconds(response: httpx.Response) -> float:
    try:
        return float(response.headers.get("Retry-After", DEFAULT_RETRY_SECONDS))
    except ValueError:
        return DEFAULT_RETRY_SECONDS
