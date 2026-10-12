import httpx

from app.config import CLEANUP_MODEL, OPENROUTER_API_KEY

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

CLEANUP_INSTRUCTIONS = (
    "You clean up raw speech-to-text transcripts. "
    "Remove filler words, false starts, and repeated phrases. "
    "Fix obvious transcription errors. "
    "Keep the speaker's meaning and order. "
    "Output only the cleaned text."
)


async def clean_transcript(text: str) -> str:
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            json={
                "model": CLEANUP_MODEL,
                "messages": [
                    {"role": "system", "content": CLEANUP_INSTRUCTIONS},
                    {"role": "user", "content": text},
                ],
            },
        )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()
