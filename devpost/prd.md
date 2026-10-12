---
doc: prd
status: approved
---

# Voice Note to Clean Transcript — Product Requirements

A web app where someone records or uploads long voice notes and gets back a clean, copy-ready transcript. Built for the learner, who needs usable text from interviews and talk-through recordings.
Source: `scope.md > The Unique Kernel`, `The Core Loop`, `What "Working" Looks Like`, `The POC Boundary`, `Explicitly Cut`.

## The Core Journey
1. The person opens the app and sees two options: record a voice note, or upload audio files.
2. They either record a voice note in the browser, or select one or more audio files in a single batch.
3. Processing starts. The page shows the steps for the file in progress, in order: Uploading, Transcribing, Cleaning up.
4. They can switch to another tab or app while it works.
5. When the whole batch is finished, a browser notification pops up once.
6. They return to the app and read the cleaned transcript on screen.
7. They copy it out.

Success: a rambling recording comes out as clean, readable text, and the person can copy it.

## Screens and Layout
One screen. It holds the record and upload options, the processing steps, and the cleaned transcript with a visible **Copy transcript** button. How these are arranged on the screen is not yet decided.

## Look and Feel
Clean, quiet, and simple, matching scope's "one screen, one job." Light background, one accent color, a simple sans-serif font, and generous space around the transcript so it reads easily. The learner has no strong visual preferences yet, so this is a default the build can follow.

## Features and Behavior

### Recording and uploading
- The person can record a voice note in the browser, or upload one or more audio files in one batch.
- Accepted files: up to 60 minutes each, in MP3, M4A, WAV, or WebM.
  - [ ] A file over 60 minutes or in another format is not accepted (see Open Questions for what the person sees).
  - [ ] A batch of several accepted files is accepted in one go.

### Processing
- Each file moves through three visible steps, in this order: Uploading, Transcribing, Cleaning up.
- Files in a batch are processed one after another, in the order they were selected.
- Once a batch has started, no more files can be added until it finishes.
  - [ ] While a file is processing, the current step is visibly marked on the page.
  - [ ] Switching to another tab or app does not stop processing.
  - [ ] When the whole batch is finished, one browser notification appears.
  - [ ] Switching back to the app mid-process shows the same steps and the current position.
  - [ ] The person cannot start a new recording or upload while a batch is running.
  - [ ] Closing the tab cancels the batch. Nothing is kept, and the person must upload again.

### Reading and copying the transcript
- The cleaned transcript appears on screen. Filler and messy parts are removed, and the meaning is kept.
  - [ ] Filler words and false starts are gone from the cleaned text; the substance of what was said remains.
  - [ ] A visible **Copy transcript** button sits on the page next to each finished transcript.
  - [ ] Clicking Copy transcript puts the full cleaned text on the clipboard.
  - [ ] Finished files appear as a list in batch order. Each row shows its status, and a done file shows its transcript and copy action.

### Failure and retry
- If a step fails (for example, the upload breaks or the audio can't be transcribed), the file shows a failed state.
  - [ ] A failed file shows a failed state with a Try again action.
  - [ ] Try again reruns the file.

## States and Boundaries
- **First use (empty):** only the record and upload options. Nothing else on the page.
- **Processing:** the three steps for the current file, with the rest of the batch waiting. No way to add more files.
- **Done:** the cleaned transcript on screen, with a copy action.
- **Failed:** a failed state for that file, with Try again.
- **Too long or unsupported file:** rejected before processing starts, with a message saying why.
- **Tab closed mid-batch:** the batch is cancelled; nothing is saved and no notification is sent.

## Product Decisions
- Record or upload from one first screen — the learner wants both options at the start.
- Multiple uploads in one batch, processed one after another — the learner wants to upload several voice notes at once.
- No adding files mid-batch — the learner's choice: wait until the batch is done.
- Processing continues while the person is in another tab or app; a browser notification signals completion — the learner wants to get on with other work and be told when it's ready.
- Failure shows a failed state with Try again — the learner's choice.
- Limits: 60 minutes per file; MP3, M4A, WAV, WebM — the learner accepted this starting point.
- One batch notification, sent when the whole batch is finished — the learner's choice.
- Multiple results appear as one list in batch order — recommended and accepted by the learner.
- Closing the tab cancels the batch — the learner's choice for the POC. Keeping work alive server-side would also mean saving transcripts, which scope puts under Later.
- Rejected files (too long or unsupported format) are refused before processing — the learner agreed.
- Look and feel: clean and quiet, a default for the build to follow — the learner has no preferences yet.
- One screen, no accounts — from scope (a single-user experiment).

## What We're Building
- Record a voice note in the browser.
- Upload one or more audio files as a batch, within the limits above.
- Show the three steps (Uploading, Transcribing, Cleaning up) for each file, in order.
- Keep processing while the person is in another tab or app.
- Browser notification when a transcript is ready.
- Show the cleaned transcript on screen, with a copy action.
- Failed state with Try again.

## Deferred From the POC
- **Save and revisit past transcripts** — scope lists this under Later; the POC keeps only what the current session shows.
- **Talking back to the model about a transcript** — scope lists this under Later.
- **Turning a transcript into a post or article draft** — scope lists this under Later and cuts it from the POC.

## Possible Later Enhancements
- Saving transcripts so they can be revisited later.
- Asking the model questions about a transcript.
- Generating a post or article draft from a transcript.

## Non-Goals
- Accounts and sign-in — a single-user experiment doesn't need them (scope).
- Publishing or sharing integrations — copying text is enough for the POC (scope).
- Adding files to a batch while it's running — kept out to keep the POC small.

## Open Questions
1. **Exact wording and placement of the rejection message:** the message text and where it appears on screen are left for the build. Can wait until `5-build`.
2. **Exact layout and visual details:** the Look and Feel default is set, but the arrangement of the record and upload options on the screen is still open. Can wait until `4-spec`.
