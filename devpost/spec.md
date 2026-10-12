---
doc: spec
status: approved
---

# Voice Note to Clean Transcript — Technical Spec

## How This Works, In Plain Language

The app has two halves. The **browser half** is what you see: the record and upload buttons, the list of files in the batch, and the cleaned transcript. It's built with React and Tailwind. The **server half** is a small FastAPI program that runs on your laptop. It holds your secret API keys and makes the calls to outside services, so the keys never reach the browser.

Two outside services do the AI work:

- **AssemblyAI** turns audio into raw text. You send it a recording, it returns a transcript. It's a speech-to-text service, not a language model.
- **OpenRouter** is a single door to many language models. The app sends it the raw transcript and a set of instructions ("remove filler words and false starts, keep the meaning"), and it returns the cleaned text. The cleanup is one request with text in and text out. There's no agent loop deciding what to do next. The app runs the three steps itself, in a fixed order.

The **browser drives the process**. It sends one file at a time through the steps: Uploading, Transcribing, Cleaning up. It checks on AssemblyAI's progress by asking the server every few seconds. Because the browser is the thing keeping track, closing the tab stops the process. Nothing is saved, which matches the PRD.

Why this shape: it's the smallest arrangement that keeps keys safe, runs the three steps in order, and lets you use the stack you already know. There's no database, no login, and no hosting, because the POC runs on your laptop.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. **You open the app** at `http://localhost:5173`. The browser shows the Record and Upload buttons. Nothing else is on the page.
2. **You record or choose files.** The browser checks each file's length and format before anything else happens. A file that's too long or in another format is refused on the spot with a message (`prd.md > Recording and uploading`).
3. **The batch starts.** The browser takes the first file and marks it **Uploading**. It sends the audio to the FastAPI server, which passes it to AssemblyAI and gets back a reference to the uploaded file.
4. **The file moves to Transcribing.** The server asks AssemblyAI to start a transcript job. The browser asks the server every few seconds whether it's done, and the server asks AssemblyAI.
5. **The file moves to Cleaning up.** When the raw transcript is ready, the browser sends it to the server, which sends it to OpenRouter with the cleanup instructions. The cleaned text comes back.
6. **The file is Done.** Its cleaned transcript appears in the batch list, with a **Copy transcript** button.
7. **The next file starts** (`prd.md > Processing`). When the last file finishes, the browser shows one notification (`prd.md > Processing`).
8. **You copy the text** with the Copy transcript button (`prd.md > Reading and copying the transcript`).

If a step fails, that file shows a failed state with **Try again**, which reruns the file from Uploading (`prd.md > Failure and retry`).

## Stack

| Layer | Choice | Why | Docs |
|---|---|---|---|
| Frontend | React, with Vite as the dev server and build tool | Your existing React experience. Vite is the current standard way to start a React app and has almost no setup. | https://react.dev, https://vite.dev |
| Styling | Tailwind CSS | Your existing experience. The PRD's Look and Feel fits Tailwind's defaults well. | https://tailwindcss.com/docs |
| Backend | Python with FastAPI | Your existing experience. Holds the keys and forwards calls. | https://fastapi.tiangolo.com |
| HTTP client (server side) | `httpx` | Makes the calls to AssemblyAI and OpenRouter from FastAPI. Async-friendly, simple to read. | https://www.python-httpx.org |
| Speech-to-text | AssemblyAI (your existing key), model `universal-3-5-pro` with `universal-2` as the fallback | Learner choice. The docs recommend `speech_models: ["universal-3-5-pro", "universal-2"]` on pre-recorded audio. The flagship is tried first; `universal-2` covers languages it doesn't support. | https://www.assemblyai.com/docs (source: `docs/assembly_ai_prompt.md` in this project) |
| Language model | Gemini 3.1 Flash Lite Preview, `google/gemini-3.1-flash-lite-preview`, through OpenRouter | Cheapest candidate with a confirmed price: $0.25 input and $1.50 output per million tokens, against $0.25 and $2.00 for GPT-5 Mini. OpenRouter lists it as released March 3, 2026. Context window of 1.0M tokens is far above what an hour of speech needs. | https://openrouter.ai/docs, https://openrouter.ai/models |
| Language model access | OpenRouter's OpenAI-compatible endpoint, called with plain `httpx` | Keeps the call to one request. Swapping models later is a config change. | https://openrouter.ai/docs/api-reference/overview |

Things to verify early in the build (I couldn't check these from here):

- Whether `google/gemini-3.1-flash-lite-preview` is still live and priced the same on OpenRouter on the day you build. It's a preview model and can be replaced.
- Whether the cleanup quality is good enough. This is a lighter model than Gemini 3 Flash Preview. The first build step tests it on a pasted paragraph. If the cleanup drops meaning, switch to GPT-5 Mini (`openai/gpt-5-mini`) with a config change.
- Whether AssemblyAI accepts the recorder's output. The guide in `docs/` confirms the endpoints, auth, and limits, but not which pre-recorded formats are accepted. Chrome records WebM; Safari may record MP4 or WebM depending on version. Test one clip of each in the first build step.
- AssemblyAI pricing. The guide in `docs/` doesn't include it.

**Language choice:** plain JavaScript (`.jsx`), not TypeScript. This is my default to keep the POC small. If you'd rather use TypeScript, tell me before the build starts.

## Where It Runs and How Someone Tries It

PRD ref: `scope.md > What "Working" Looks Like`.

- **Runtime:** two local processes on your laptop, a browser, and internet access for the two AI services.
- **Requirements:** Python 3.11 or newer, Node.js 20 or newer, and two keys in a `.env` file in the `backend/` folder: `ASSEMBLYAI_API_KEY` and `OPENROUTER_API_KEY`. The `.env` file is never committed.
- **Start the server:** `cd backend && uvicorn app.main:app --reload --port 8000`
- **Start the browser app:** `cd frontend && npm run dev`, which serves on `http://localhost:5173`.
- **What to open:** `http://localhost:5173`. Vite forwards `/api` calls to the FastAPI server on port 8000, so the browser only talks to one address.
- **For the demo video:** record your screen while you record a voice note, watch the steps move, switch to another tab during processing, see the notification, then copy the text. Keep one run under three minutes.
- **Deployment:** none for the POC. Local run plus demo video is the submission path. Changing this later is a `6-ship` decision.

## Look and Feel

PRD ref: `prd.md > Look and Feel`, `scope.md > Inspiration & Identity`.

Clean and quiet, following the PRD default. Light background, one accent color, and a simple sans-serif font. The transcript sits in a comfortable reading width with generous space above and below. Tailwind utilities handle this directly. Accent color: pick one blue or teal in `index.css`. The interface copy is short and plain ("Record a voice note", "Upload audio", "Copy transcript").

## Components

Each component serves a PRD heading.

### `App` (page shell)
Holds the single screen. Shows the empty state (Record and Upload only) until a batch exists, then shows the batch list below. Owns the batch state.
PRD ref: `prd.md > Screens and Layout`, `prd.md > States and Boundaries`.

### `RecordButton` and `UploadButton`
Record starts and stops a browser recording and turns it into a file. Upload opens the file picker, accepting multiple files. Both pass files to the batch. Both are disabled while a batch is running.
PRD ref: `prd.md > Recording and uploading`, `prd.md > Processing`.

### `BatchList`
Shows each file in batch order with its name, current step, and status. For a Done file, shows its transcript and Copy transcript button. For a Failed file, shows the failure and Try again.
PRD ref: `prd.md > Reading and copying the transcript`, `prd.md > Failure and retry`.

### `StepIndicator`
Shows the three steps for the current file (Uploading, Transcribing, Cleaning up) in order, marking the current one.
PRD ref: `prd.md > Processing`.

### `batchRunner` (plain JavaScript module, no UI)
Runs the batch one file at a time: upload, start transcript, poll until done, clean up, mark Done or Failed, then move on. Handles the Try again rerun. Also fires the completion notification when the last file finishes.
PRD ref: `prd.md > Processing`, `prd.md > Failure and retry`.

### `api` (plain JavaScript module)
Thin wrappers around the four server endpoints below.

### `notify`
Asks for browser notification permission when the first batch starts, and shows the one notification at the end. If permission is refused, nothing breaks; the batch still finishes on screen.
PRD ref: `prd.md > Processing`.

### Server: `main.py`
The four endpoints, CORS not needed because Vite proxies `/api`.

### Server: `assemblyai.py`
Wrapper for AssemblyAI calls: upload audio, start a transcript, get transcript status.

### Server: `cleanup.py`
Wrapper for the OpenRouter call and the cleanup instructions.

### Server: `config.py`
Reads the two keys and the model ID from `.env` and from one constant.

## Data Model

There is no database. All data lives in browser memory for the duration of the page.

- **Batch:** an ordered list of file entries, created when the person records or selects files. Lives in `App` state.
- **File entry:** `{ id, name, file (the original Blob or File), step, status, transcriptId, rawText, cleanText, error }`.
  - `step` is one of `uploading`, `transcribing`, `cleaning`. `status` is `waiting`, `running`, `done`, or `failed`.
  - The original `file` stays in memory so Try again can reupload it.
- **Updates:** `batchRunner` updates each entry as it goes, and React re-renders the list.
- **Leaving and returning:** reloading or closing the tab clears everything. This is the PRD's stated behavior ("Closing the tab cancels the batch. Nothing is kept"). Switching tabs or apps does nothing to the state, because the page is still open and the runner keeps going.
- **Recording:** the recorder produces one file per recording, added to the batch the same way an upload is.

## File Structure

```
learn-ai-basics/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app and the four /api endpoints
│   │   ├── config.py          # Reads .env keys and the model ID
│   │   └── services/
│   │       ├── assemblyai.py  # Upload audio, start transcript, check status
│   │       └── cleanup.py     # Send raw transcript to OpenRouter for cleanup
│   ├── requirements.txt       # fastapi, uvicorn, httpx, python-dotenv
│   └── .env.example           # Empty key names, copy to .env
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Single screen, owns batch state
│   │   ├── index.css          # Tailwind import and the accent color
│   │   ├── components/
│   │   │   ├── RecordButton.jsx
│   │   │   ├── UploadButton.jsx
│   │   │   ├── BatchList.jsx
│   │   │   └── StepIndicator.jsx
│   │   └── lib/
│   │       ├── batchRunner.js # Runs files one at a time through the steps
│   │       ├── api.js         # Calls to the four /api endpoints
│   │       ├── checks.js      # Length and format checks before processing
│   │       └── notify.js      # Browser notification permission and alert
│   ├── index.html
│   ├── vite.config.js         # Dev server on 5173, proxies /api to 8000
│   └── package.json
├── devpost/                   # Devpost learning workspace
└── README.md                  # Run steps, copied from "Where It Runs"
```

## API Contract (server endpoints)

Base path `/api`. The server holds the keys; the browser never sees them.

| Endpoint | Request | Response | Calls outside |
|---|---|---|---|
| `POST /api/upload` | Multipart form from the browser, one audio file | `{ "upload_url": "..." }` | AssemblyAI `POST https://api.assemblyai.com/v2/upload`. Body is the raw file bytes, not multipart. Header `Authorization: <key>` (no `Bearer`), content type `application/octet-stream`. Response field: `upload_url`. |
| `POST /api/transcripts` | `{ "upload_url": "..." }` | `{ "id": "..." }` | AssemblyAI `POST https://api.assemblyai.com/v2/transcript`, JSON body `{ "audio_url": "<upload_url>", "speech_models": ["universal-3-5-pro", "universal-2"] }`. Response has `id` and `status: "queued"`. |
| `GET /api/transcripts/{id}` | none | `{ "status": "queued" \| "processing" \| "completed" \| "error", "text": "...", "error": "..." }` | AssemblyAI `GET https://api.assemblyai.com/v2/transcript/{id}`. `text` is set when completed; `error` when status is `error`. |
| `POST /api/cleanup` | `{ "text": "..." }` | `{ "text": "..." }` | OpenRouter `POST https://openrouter.ai/api/v1/chat/completions`, header `Authorization: Bearer <key>`, body with `model: "google/gemini-3.1-flash-lite-preview"` and a system message holding the cleanup instructions |

Notes:

- **Source:** every AssemblyAI row above comes from `docs/assembly_ai_prompt.md` (sections 4, 6, and 14). The `speech_models` field is optional in the API, but the guide says to set it explicitly, so the spec does.
- **Limits from the guide:** the upload endpoint accepts files up to 2.2 GB, and a transcript job accepts up to 5 GB or 10 hours. The PRD caps files at 60 minutes, so both are well above what we need.
- **Polling:** the guide's example checks every 3 seconds. The browser polls at the same interval.
- **Errors:** a 401 means the key is missing, wrong, or has a `Bearer` prefix, or the account has no balance. A 429 means rate-limited; respect the `Retry-After` header. A transcript with `status: "error"` carries the reason in `error`.
- **Webhooks** are supported (`webhook_url`), but they need a public address for the server, which this local POC doesn't have. Polling is the right choice here.
- **The sync API** (`sync.assemblyai.com`) is for clips up to 120 seconds, so it doesn't fit hour-long recordings. Not used.
- The cleanup prompt is written once in `cleanup.py` and kept short. It says: remove filler words, false starts, and repeated phrases; fix obvious transcription errors; keep the speaker's meaning and order; output only the cleaned text.

## External Services and Dependencies

- **AssemblyAI** — speech-to-text. Key: `ASSEMBLYAI_API_KEY`. Docs: https://www.assemblyai.com/docs (the project copy is `docs/assembly_ai_prompt.md`). Model: `universal-3-5-pro`, with `universal-2` as fallback. Calls listed in the API Contract above. Pricing and rate limits are not in the guide; check the AssemblyAI pricing page before the build.
- **OpenRouter** — language model access. Key: `OPENROUTER_API_KEY`. Docs: https://openrouter.ai/docs. Model: `google/gemini-3.1-flash-lite-preview` at $0.25 input and $1.50 output per million tokens. A one-hour recording comes to roughly 12,000 input tokens (my estimate) and a similar-sized cleaned transcript, so each file's cleanup costs a fraction of a cent. Rate limits: check the OpenRouter account page.
- **Python packages:** `fastapi`, `uvicorn`, `httpx`, `python-dotenv`.
- **JavaScript packages:** `react`, `react-dom`, `vite`, `tailwindcss`, and the Vite React plugin.

## Important Failure Modes

- **AssemblyAI is slow or times out** → the file stays in Transcribing with the step visible; if the job errors, the file shows Failed with Try again.
- **AssemblyAI rejects the key (401)** → the file shows Failed at Uploading with "Check the AssemblyAI key in backend/.env". Most often this is a stray `Bearer` prefix or a missing key.
- **AssemblyAI rate-limits (429)** → the server waits for the `Retry-After` time before the browser's next poll; the step stays visible.
- **Audio has no speech (silence or music only)** → the transcript comes back empty; the file shows Failed with the message "No speech found in this recording", and Try again is available.
- **Upload breaks partway** → the file shows Failed at Uploading with Try again (`prd.md > Failure and retry`).
- **OpenRouter fails or rate-limits** → the file shows Failed at Cleaning up; the raw transcript is kept in memory so Try again can rerun the file from Uploading. That's wasteful but simple for a POC.
- **Microphone permission refused** → a plain message says recording needs microphone access; upload still works.
- **Notification permission refused** → the batch still finishes on screen; no notification is shown.
- **Recording format not accepted by AssemblyAI** → the file shows Failed at Uploading with the server's error message. Verified early in the build (see Stack).

## What Was Simplified and Why

- **Browser drives the steps with polling** instead of AssemblyAI webhooks — the PRD says closing the tab cancels the batch, so there's no need for the server to remember jobs. Webhooks would need a public address for the server, which breaks the local-only POC. The fuller version would need hosting and a way to receive callbacks.
- **No database** — the PRD keeps nothing after the session. Memory is enough.
- **One language model call, no agent framework** — the cleanup is one fixed request. LangChain or LangGraph would add setup and wouldn't change the result. You can still use LangChain later as an exercise; it isn't needed for the POC.
- **Plain JavaScript, not TypeScript** — fewer moving parts for a proof of concept. Reversible if you prefer TypeScript.
- **Raw HTTP calls instead of the AssemblyAI Python SDK** — the guide says to prefer the SDK. The SDK's `transcribe()` call uploads, submits, and waits in one blocking call, but the browser needs to check progress between steps. So the server makes the three separate calls itself. The guide shows this raw pattern as its fallback. If you'd rather use the SDK, the step-by-step view has to change.
- **Local only, no hosting** — the submission accepts a local app with a demo video (see Where It Runs).

## Decisions and Open Issues

**Learner decisions made in this session:**

- **Frontend:** React with Tailwind, Vite as dev server. The learner said it was fine.
- **Backend:** FastAPI in Python, holding the keys. The learner said it was fine.
- **Speech-to-text:** AssemblyAI, using the learner's existing key.
- **Language model access:** OpenRouter, since the learner already has an account.
- **Cleanup model:** Gemini 3.1 Flash Lite Preview (`google/gemini-3.1-flash-lite-preview`). The learner asked me to pick the cheaper option, and the learner confirmed this model name for the $0.25/$1.50 price. Against GPT-5 Mini it costs the same on input and less on output. The tradeoffs: it's a preview model, and it's a lighter model, so cleanup quality needs a check in the first build step.
- **Where it runs:** locally, with a recorded demo. No public hosting.

**Settled by the learner's "ok" on the three open items:** the raw HTTP approach, plus the three items as they were presented (AssemblyAI endpoints and limits, Gemini availability, and Safari recording format). The spec above reflects them.

**Model price, resolved:**

- Earlier pastes gave three different prices for Gemini 3 Flash Preview: $0.10/$0.40, $0.50/$3.00, and no price. That model is no longer the candidate.
- The $0.25/$1.50 price belongs to `google/gemini-3.1-flash-lite-preview`, per the learner. It's now the choice under the "cheaper" rule.
- The ChatGPT answer's claim that the earlier $0.10/$0.40 figure was wrong doesn't matter now, since we're no longer using that model.

**Safari and recording format (implementation detail, not a choice):** the ChatGPT answer's approach is sound and I've adopted it. `checks.js` will feature-detect the first supported type from `audio/mp4`, `audio/webm;codecs=opus`, and `audio/webm` with `MediaRecorder.isTypeSupported`. The upload keeps that type and a matching file extension. The ChatGPT answer's claims about Safari's MP4 and WebM support, and about AssemblyAI's full format list, aren't in our docs folder, so the first build step still tests a real clip from each browser.

**Derived choices, for your review:**

- **Pipeline driven by the browser, with polling.** Follows from the PRD's "closing the tab cancels" rule.
- **Raw HTTP instead of the AssemblyAI SDK.** Explained under Simplified. It's a choice you should agree to, because the guide recommends the SDK.
- **Plain JavaScript.** My default; flagged above.
- **Layout (PRD Open Question 2):** Record and Upload buttons side by side at the top of the one screen. Below them, the batch list in order, each row showing the file name, the three steps, and then its transcript when Done. This resolves the PRD's open layout question; say if you want it arranged differently.

**Genuine learner uncertainty (from your stated goal to understand how the AI pieces fit):**

- **Question:** How does the language-model call fit with the rest of the app, and why isn't it an "agent"?
- **Clarified by:** the "How This Works" section above and the "One fixed request" note in Simplified.
- **Checked during the build:** in `5-build`, before any audio code, the app will call the cleanup endpoint with a pasted paragraph of rambling text. Seeing the text go in and come out is the check.

**Still open:**

- **PRD Open Question 1 (rejection message wording and placement):** left for `5-build`, as the PRD says.
- **Unverified facts:** `gemini-3.1-flash-lite-preview` availability and cleanup quality, AssemblyAI's accepted pre-recorded formats (WebM and MP4 from the browser), and AssemblyAI pricing. Each is listed in Stack to check early in the build. AssemblyAI's endpoints, auth, statuses, and limits are now confirmed against `docs/assembly_ai_prompt.md`.
