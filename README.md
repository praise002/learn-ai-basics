# Voice Note to Clean Transcript

Record a voice note, or upload one or more audio files, and get back a clean, copy-ready transcript. Filler words and false starts are removed, and the meaning stays the same.

The app runs on your own computer. Two outside services do the work: AssemblyAI turns the audio into text, and OpenRouter cleans the text up.

## Demo

Watch a demo of the app in action: [Video Demo](https://drive.google.com/file/d/1RjuwarMKnCfuWy0J7lcLfYmRLKFXwN_U/view?usp=drivesdk)

## What you need

- Python 3.11 or newer
- Node.js 20 or newer
- An AssemblyAI API key
- An OpenRouter API key

## Setup (once)

1. **Add your keys.** Copy `backend/.env.example` to `backend/.env` and fill in both keys after the `=` signs. This file is never committed to git.

2. **Install the backend.**

   ```bash
   cd backend
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```

   On Windows, use `python -m venv .venv` and `.venv\Scripts\pip install -r requirements.txt`.

3. **Install the frontend.**

   ```bash
   cd frontend
   npm install
   ```

## Run it

Open two terminals and start one server in each.

**Terminal 1: the backend** (from the project folder):

```bash
cd backend
.venv/bin/uvicorn app.main:app --reload --port 8000
```

**Terminal 2: the app** (from the project folder):

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Run with Docker

Docker is an alternative to the two terminals above. It runs the backend and the browser app in containers, so you don't need Python or Node installed.

**What you need:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with the Compose plugin), and the keys in `backend/.env` from the setup steps above. The keys are passed to the container when it starts. They are never written into the image.

1. **Stop the local servers first** if they're running. Docker uses the same port (5173).

2. **Build and start both containers** from the project folder:

   ```bash
   docker compose up --build
   ```

   The first build takes a few minutes while it downloads the base images. Later starts are fast.

3. **Open http://localhost:5173** in your browser. The app works the same as in the local run.

4. **Stop everything** with `Ctrl+C` in the terminal, or run `docker compose down` from another terminal.

After you change code, run `docker compose up --build` again to rebuild the images.

## Notes

- Closing the tab cancels any batch that is still running. Nothing is saved between visits.
- The backend's API page is at http://localhost:8000/docs.
- Browser recording needs microphone access. If you block it, you can still upload files.
