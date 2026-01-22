
export async function logEvent(level: "ERROR" | "SUCCESS", action: string, message: string, metadata?: any) {
  const baseUrl = (process.env.NEXT_PUBLIC_PERFORMANCE_BACKEND_URL || "http://localhost:3001");
  const url = `${baseUrl}/events`; // send directly to /events

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "dev_finance_123", // your finance tracker API key
      },
      body: JSON.stringify({
        level: level.toLowerCase(),
        source: "finance-tracker",
        action,
        message,
        metadata,
        occurredAt: new Date().toISOString(),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to send event, server responded with:", text);
      return;
    }

    console.log("Event successfully sent to monitoring backend");
  } catch (e) {
    console.error("Failed to send event to monitoring platform", e);
  }
}
