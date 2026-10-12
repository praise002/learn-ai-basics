export async function cleanText(text) {
  const response = await fetch("/api/cleanup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Cleanup failed");
  }
  return data.text;
}
