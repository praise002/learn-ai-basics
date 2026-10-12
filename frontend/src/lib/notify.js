// Notifications are a nice-to-have. If the browser doesn't support them or
// permission is refused, nothing happens and the batch still finishes on screen.

export function requestNotificationPermission() {
  if (!("Notification" in window) || Notification.permission !== "default") return;
  Notification.requestPermission().catch(() => {});
}

export function notifyBatchFinished(done, total) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification("Your transcripts are ready", {
    body: `${done} of ${total} finished. Come back to copy them.`,
  });
}
