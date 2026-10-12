---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Paste a rambling paragraph and get a cleaned version back**
  Becomes usable: Open the app, paste some messy text, click Clean up, and see the cleaned text on screen with a Copy transcript button. No audio yet.
  Why now: The cleanup step is the product's core value and the part whose quality is least certain (the spec's first check). Testing it first, together with the project scaffold, means a bad model result shows up before any audio code exists.
  PRD ref: `prd.md > What We're Building` (cleaned transcript on screen, with a copy action); `prd.md > Reading and copying the transcript`
  Spec ref: `spec.md > Stack`, `spec.md > File Structure`, `spec.md > API Contract (server endpoints)` (the `POST /api/cleanup` row), `spec.md > Look and Feel`
  Build: Scaffold the backend (FastAPI, `config.py` reading keys from `backend/.env`, `services/cleanup.py`, `main.py` with `POST /api/cleanup`, `backend/.env.example`) and the frontend (Vite, React, Tailwind, a `vite.config.js` proxy from `/api` to port 8000). Build a single screen with a paste box, a Clean up button, the cleaned text, and Copy transcript. Use the cleanup prompt from the spec's API Contract notes and the model `google/gemini-3.1-flash-lite-preview`. Before writing the prompt, confirm the model is still live on OpenRouter.
  Verify (mechanical): Start the server (`uvicorn app.main:app --reload --port 8000`) and the browser app (`npm run dev`); both start with no errors. Send a rambling paragraph to `POST /api/cleanup` and read the output yourself: fillers and false starts gone, meaning kept. Run `npm run build` in `frontend/` and confirm it passes.
  Learner check: Open http://localhost:5173, paste a messy paragraph of your own, click Clean up, and read the result. Click Copy transcript and paste it somewhere. Say whether the cleanup kept what you meant.
  Commit: `Add paste-to-clean transcript scaffold and cleanup endpoint`

- [x] **2. Upload one audio file and get its cleaned transcript**
  Becomes usable: Choose one audio file, watch the steps Uploading, Transcribing, and Cleaning up move in order, then read the cleaned transcript and copy it.
  Why now: This connects the whole path end to end with the riskiest outside service (AssemblyAI) before recording or batch logic exists. The spec's open format question gets answered here with real files.
  PRD ref: `prd.md > The Core Journey` (steps 2, 3, 6, 7); `prd.md > Processing` (the three steps in order)
  Spec ref: `spec.md > API Contract (server endpoints)` (the three AssemblyAI rows and their notes), `spec.md > Components` (`StepIndicator`, `batchRunner`, `api`), `spec.md > Data Model` (File entry)
  Build: Add `services/assemblyai.py` (upload the raw bytes, start a transcript with `speech_models`, get status) and the endpoints `POST /api/upload`, `POST /api/transcripts`, `GET /api/transcripts/{id}`. In the browser, add `lib/api.js`, `lib/batchRunner.js` (one file: upload, start, poll every 3 seconds, clean up, mark done), `components/StepIndicator.jsx`, and an `UploadButton.jsx` that takes one file for now.
  Verify (mechanical): Start both servers. Upload one real MP3 or M4A clip and one WebM clip. Each reaches Done with transcript text, and you read the transcript against the audio. Confirm the three steps appear in order. Run `npm run build` in `frontend/`.
  Learner check: Upload an audio file of yours (a few minutes, MP3 or M4A). Watch the steps move in order, then read the cleaned transcript. Say whether the words match what you said.
  Commit: `Transcribe an uploaded audio file and show the cleaned transcript`

- [x] **3. Record a voice note in the browser**
  Becomes usable: Click Record, speak, click Stop, and the recording goes through the same steps as an upload.
  Why now: Recording is the second way in, and it reuses the pipeline proven in slice 2. It also tests which recording format the browser produces against AssemblyAI, a question the spec left open.
  PRD ref: `prd.md > Recording and uploading` (the recording bullet); `prd.md > The Core Journey` (step 2)
  Spec ref: `spec.md > Components` (`RecordButton`), `spec.md > Data Model` (Recording), `spec.md > Stack` (the recording-format note, feature detection in `checks.js`), `spec.md > Important Failure Modes` (microphone permission refused; recording format not accepted)
  Build: Add `components/RecordButton.jsx` using `MediaRecorder`. Pick the first supported type from `audio/mp4`, `audio/webm;codecs=opus`, `audio/webm` with `MediaRecorder.isTypeSupported`, and give the file a matching extension. Put that detection in `lib/checks.js`. When microphone access is refused, show a plain message that recording needs microphone access, and leave upload working. Add the recording to the list the same way an upload is added.
  Verify (mechanical): In Chrome, record about 20 seconds and confirm it reaches Done with a transcript that matches the speech. Block the microphone and confirm the message appears. Run `npm run build`. Safari cannot be tested from this environment, so note that as untested.
  Learner check: Click Record, talk for about thirty seconds, click Stop, and read the transcript. Then block the microphone in your browser settings, click Record, and check the message.
  Commit: `Record a voice note in the browser`

- [x] **4. Refuse files that are too long or unsupported before processing**
  Becomes usable: A file over 60 minutes, or in a type other than MP3, M4A, WAV, or WebM, is refused right away with a message saying why. Nothing starts processing.
  Why now: Bad input gets stopped before any paid AI call, and before the batch exists. The batch in the next slice will then only hold acceptable files.
  PRD ref: `prd.md > Recording and uploading` (the accepted-files checkboxes); `prd.md > States and Boundaries` (Too long or unsupported file); `prd.md > Open Questions` (1, the message wording and placement, is decided here)
  Spec ref: `spec.md > The Core Journey Through the System` (step 2), `spec.md > File Structure` (`lib/checks.js`)
  Build: In `lib/checks.js`, check the file type against the four accepted formats and read the duration from the audio element's metadata. Reject anything over 3600 seconds. Apply the same check to recordings. Show the message as a short line under the buttons, for example "That file type isn't supported. Use MP3, M4A, WAV, or WebM." and "That file is longer than 60 minutes."
  Verify (mechanical): Choose a text file, and confirm the rejection message appears with no `POST /api/upload` request in the browser network panel. Generate a file over 60 minutes (for example with `ffmpeg`, if installed) and confirm it is refused. Confirm a normal clip still processes. Run `npm run build`. If `ffmpeg` is not available, say so and verify the duration path another way.
  Learner check: Try to upload a text file or an image. Then try a file over an hour if you have one. Confirm you get a message and nothing starts.
  Commit: `Refuse unsupported or over-length files before processing`

- [x] **5. Upload several files as a batch, processed in order**
  Becomes usable: Select several files at once. They process one after another in the order selected. Each row shows its status, and the Record and Upload buttons are disabled until the batch finishes. Finished transcripts appear in batch order with their copy buttons.
  Why now: Batches are the POC's main working pattern, and they build directly on the single-file runner from slice 2.
  PRD ref: `prd.md > Processing` (all bullets except the notification and failure ones); `prd.md > Reading and copying the transcript` (the list in batch order); `prd.md > The Core Journey` (steps 2, 4)
  Spec ref: `spec.md > Components` (`App`, `UploadButton`, `BatchList`, `batchRunner`), `spec.md > Data Model` (Batch, File entry, Updates), `spec.md > Look and Feel`
  Build: Let `UploadButton` accept several files. `App` keeps the batch in state. `batchRunner` works through the queue one file at a time. `BatchList` renders rows in order with name, steps, status, and for a Done file its transcript and a Copy transcript button. Disable Record and Upload while a batch runs. Apply the slice 4 checks to every file.
  Verify (mechanical): Select three accepted clips together and confirm they process in order and each reaches Done. Click Upload while the batch runs and confirm the buttons are disabled. Run `npm run build`.
  Learner check: Select three audio files of yours together. Switch to another tab while they process, then come back. Confirm the list is in order, the current step is marked, and the add buttons are disabled until everything is done.
  Commit: `Process uploaded files as a batch, one at a time`

- [x] **6. Get one notification when the whole batch is done**
  Becomes usable: When the last file in the batch finishes, a browser notification appears once. If notifications are blocked, the batch still finishes on screen.
  Why now: The "walk away and get told" promise depends on the batch from slice 5 already existing.
  PRD ref: `prd.md > Processing` (the notification and tab-switching bullets); `prd.md > What We're Building` (browser notification)
  Spec ref: `spec.md > Components` (`notify`), `spec.md > Important Failure Modes` (notification permission refused)
  Build: Add `lib/notify.js`. Ask for permission when the first batch starts. Show one notification at the end of the batch, not one per file. Do nothing harmful when permission is denied or unsupported. Call it from the end of `batchRunner`.
  Verify (mechanical): With permission granted, run a batch of two clips. Confirm exactly one notification after the second file is Done. Deny permission and run one clip: the batch still completes on screen, and the console shows no error. Run `npm run build`.
  Learner check: Allow notifications, start a batch of two, switch to another tab, and wait for the notification. Then block notifications and run one file to confirm it still finishes on screen.
  Commit: `Notify once when a batch finishes`

- [ ] **7. Show a failed file with a message and Try again**
  Becomes usable: A file that fails shows Failed at the step where it stopped, with a plain message. Try again reruns that file from Uploading. The rest of the batch keeps going.
  Why now: Failure is the last thing a real user hits. It comes after the batch, so the runner's states are already in place.
  PRD ref: `prd.md > Failure and retry` (both bullets); `prd.md > States and Boundaries` (Failed)
  Spec ref: `spec.md > Important Failure Modes` (the 401, no-speech, 429, upload, and OpenRouter entries), `spec.md > Data Model` (the original file is kept for Try again), `spec.md > API Contract (server endpoints)` (the Errors notes)
  Build: Map errors to messages in `batchRunner` and the server. A 401 shows "Check the AssemblyAI key in backend/.env". An empty transcript shows "No speech found in this recording". For a 429, the server waits for the `Retry-After` time. Upload and OpenRouter failures show Failed at their step. Try again reruns the file from Uploading using the kept original file.
  Verify (mechanical): Temporarily put a wrong AssemblyAI key in `backend/.env`. Confirm the file shows Failed at Uploading with the key message. Restore the real key and confirm Try again completes the file. Upload a silent clip and confirm the no-speech message and Try again. Keys are never printed or committed. Run `npm run build`.
  Learner check: Upload a silent or music-only clip. Confirm the Failed state and message, then click Try again and watch it rerun.
  Commit: `Show failed files with a message and Try again`

- [ ] **8. Start the app from the README on a fresh copy**
  Becomes usable: Someone who has never seen the project can follow the README, add their two keys, and run the app.
  Why now: The README is the last piece of the submission path. Checking it at the end catches anything the earlier slices assumed without writing down.
  PRD ref: `prd.md > What We're Building` (the whole list, as a final check)
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > File Structure` (`README.md`, `backend/.env.example`)
  Build: Write `README.md` with the run steps from the spec's "Where It Runs" section, the two keys, and how to open http://localhost:5173. Make sure `backend/.env` stays out of git (already set in `.gitignore`).
  Verify (mechanical): Follow the README exactly in a clean copy of the repo (a separate folder, not the working one) with a test `.env`. Confirm the app runs and a clip processes. Confirm `git status` shows no `.env` file.
  Learner check: Follow the README yourself from a fresh folder. Tell me where you got stuck, if anywhere.
  Commit: `Add README run steps`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2, the first real transcript from an audio file. The learner tries it with their own recording and gives feedback on the cleanup quality, the steps, and the layout before the recording and batch work begins.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Not yet run.
Route and stops: Not yet run.
Edit outcome: Not yet run.
Reflection: Not yet run.
Activity mode: Not yet run.

## Revisions

- Removed the paste box from the first screen when uploads arrived in slice 2 — the PRD's first screen holds only Record and Upload, and uploads now use the same cleanup path the paste box tested. The cleanup endpoint is still available through the docs page at /docs.
- Added a collapsed "Debug: raw transcript" view under the file, so the learner can compare the raw words with the cleaned text during testing. Remove it before `6-ship`.
- A new batch replaces the previous list once the old batch has finished. The PRD doesn't say what happens to earlier results, so this was the simplest reading; the learner accepted it during slice 5 testing.
- Added a playback control under each file (`frontend/src/components/AudioPlayer.jsx`), so the learner can hear the recording or upload before reading the transcript. Requested during slice 3 testing; not in the PRD, so decide at final review whether to keep it.

