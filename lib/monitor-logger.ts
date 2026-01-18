export async function logEvent(level: "ERROR" | "SUCCESS", action: string, message: string, metadata?: any) {
  try {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "dev_finance_123", // your finance tracker API key
      },
      body: JSON.stringify({
        level,
        service: "finance-tracker",
        action,
        message,
        metadata,
      }),
    });
  } catch (e) {
    console.error("Failed to send event to monitoring platform", e);
  }
}
