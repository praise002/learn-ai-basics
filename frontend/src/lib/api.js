async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

export async function cleanText(text) {
  const data = await postJson("/api/cleanup", { text });
  return data.text;
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Upload failed");
  }
  return data;
}

export function startTranscript(uploadUrl) {
  return postJson("/api/transcripts", { upload_url: uploadUrl });
}

export async function getTranscript(id) {
  const response = await fetch(`/api/transcripts/${id}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Could not check the transcript");
  }
  return data;
}
