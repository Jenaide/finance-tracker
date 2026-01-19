export async function logEvent(level: "ERROR" | "SUCCESS", action: string, message: string, metadata?: any) {
  const url = process.env.NEXT_PUBLIC_MONITORING_API + "/events";
  try {
    await fetch(url, {
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
        occurredAt: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error("Failed to send event to monitoring platform", e);
  }
}
