/**
 * Cubox Plugin for OpenClaw
 * 
 * Save URLs to Cubox bookmark service.
 * 
 * Configuration:
 * - Set `apiUrl` in config.json OR
 * - Set `CUBOX_API_URL` environment variable
 * 
 * Get your API URL from: Cubox Settings → Extensions → API
 */

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    url: { type: "string", format: "uri", description: "The URL to save into Cubox." },
    title: { type: "string", minLength: 1, description: "Optional title override." },
    tags: {
      type: "array",
      items: { type: "string", minLength: 1 },
      maxItems: 20,
      description: "Optional tags for the saved URL."
    },
    folder: { type: "string", minLength: 1, description: "Optional Cubox folder name." },
    description: { type: "string", minLength: 1, description: "Optional description." }
  },
  required: ["url"],
  additionalProperties: false
} as const;

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 10000;
const REQUEST_TIMEOUT_MS = 15000;

function generateRequestId(): string {
  return `cubox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exponentialBackoff(attempt: number): number {
  const baseDelay = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
  const jitter = Math.floor(Math.random() * 500);
  return baseDelay + jitter;
}

function isErrorWithName(error: unknown): error is { name: string; message?: string } {
  return typeof error === "object" && error !== null && "name" in error;
}

function classifyNetworkError(error: unknown): { type: string; retryable: boolean } {
  const name = isErrorWithName(error) ? error.name : "";
  const message = isErrorWithName(error) && error.message ? String(error.message).toLowerCase() : "";

  if (name === "TimeoutError" || name === "AbortError") {
    return { type: "TIMEOUT", retryable: true };
  }
  if (message.includes("dns") || message.includes("enotfound") || message.includes("getaddrinfo")) {
    return { type: "DNS_FAILURE", retryable: true };
  }
  if (message.includes("econnrefused") || message.includes("connection refused")) {
    return { type: "CONNECTION_REFUSED", retryable: true };
  }
  if (message.includes("econnreset") || message.includes("connection reset")) {
    return { type: "CONNECTION_RESET", retryable: true };
  }
  if (message.includes("network") || message.includes("fetch failed")) {
    return { type: "NETWORK_ERROR", retryable: true };
  }

  return { type: "UNKNOWN_ERROR", retryable: false };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}

function getErrorName(error: unknown): string {
  if (isErrorWithName(error)) {
    return error.name;
  }
  return "UnknownError";
}

function log(requestId: string, level: "info" | "warn" | "error", message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${requestId}] [${level.toUpperCase()}] ${message}${data ? ` ${JSON.stringify(data)}` : ""}`;

  if (level === "error") {
    console.error(logLine);
  } else if (level === "warn") {
    console.warn(logLine);
  } else {
    console.log(logLine);
  }
}

function getApiUrl(pluginApiUrl?: string): string {
  const configured = (pluginApiUrl ?? process.env.CUBOX_API_URL ?? "").trim();
  if (!configured) {
    throw new Error("Missing CUBOX_API_URL. Set it to your full Cubox endpoint URL containing the token.");
  }
  return configured;
}

function buildPayload(input: { url: string; title?: string; tags?: string[]; folder?: string; description?: string }): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: "url",
    content: input.url
  };

  if (input.title) payload.title = input.title;
  if (input.folder) payload.folder = input.folder;
  if (input.description) payload.description = input.description;
  if (input.tags?.length) payload.tags = input.tags; // 保持为数组格式

  return payload;
}

function formatToolResult(payload: Record<string, unknown>): { content: Array<{ type: string; text: string }>; details: Record<string, unknown> } {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    details: payload
  };
}

function maskEndpoint(endpoint: string): string {
  try {
    const url = new URL(endpoint);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      const last = parts[parts.length - 1] ?? "";
      const tail = last.length > 3 ? last.slice(-3) : "***";
      parts[parts.length - 1] = `***${tail}`;
      url.pathname = `/${parts.join("/")}`;
    }
    url.search = "";
    return url.toString();
  } catch {
    return "***";
  }
}

function normalizeCuboxStatus(parsed: unknown): { success: boolean; code?: number | string; message?: string } {
  if (!parsed || typeof parsed !== "object") {
    return { success: true };
  }

  const record = parsed as Record<string, unknown>;
  const code = record.code;
  const message = typeof record.message === "string"
    ? record.message
    : typeof record.msg === "string"
      ? record.msg
      : undefined;

  if (typeof code === "number") {
    if (code !== 200) return { success: false, code, message };
    return { success: true, code, message };
  }

  if (typeof code === "string") {
    if (code !== "200" && code.toLowerCase() !== "ok") return { success: false, code, message };
    return { success: true, code, message };
  }

  return { success: true, message };
}

// Plugin definition
const plugin = {
  id: "cubox",
  name: "cubox",
  description: "Save links to Cubox with one tool call",

  register(api: { pluginConfig?: { apiUrl?: string }; registerTool: (tool: unknown) => void }) {
    const pluginApiUrl = api?.pluginConfig?.apiUrl;

    api.registerTool({
      name: "cubox_save_url",
      label: "Cubox Save URL",
      description: "Save a URL to Cubox via the Cubox Save API.",
      parameters: INPUT_SCHEMA,
      optional: true,

      execute: async (_toolCallId: string, input: { url: string; title?: string; tags?: string[]; folder?: string; description?: string }) => {
        const requestId = generateRequestId();

        try {
          const endpoint = getApiUrl(pluginApiUrl);
          const payload = buildPayload(input);
          const maskedEndpoint = maskEndpoint(endpoint);

          log(requestId, "info", "Starting save request", {
            url: input.url,
            title: input.title,
            tags: input.tags,
            folder: input.folder,
            endpoint: maskedEndpoint
          });

          for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
              log(requestId, "info", `Attempt ${attempt + 1}/${MAX_RETRIES + 1}`);

              const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
              });

              let parsed: unknown;
              const text = await response.text();

              try {
                parsed = text ? JSON.parse(text) : {};
              } catch {
                parsed = { raw: text };
              }

              if (response.ok) {
                const normalized = normalizeCuboxStatus(parsed);
                if (normalized.success) {
                  log(requestId, "info", "Save succeeded", { status: response.status });
                  return formatToolResult({
                    ok: true,
                    status: response.status,
                    message: "saved",
                    requestId,
                    retryCount: attempt,
                    cubox: parsed
                  });
                } else {
                  log(requestId, "warn", "Cubox returned error status", { parsed });
                  return formatToolResult({
                    ok: false,
                    status: response.status,
                    message: "cubox_error",
                    requestId,
                    retryCount: attempt,
                    errorCode: "CUBOX_ERROR",
                    cubox: parsed
                  });
                }
              }

              // Non-2xx response
              if (!RETRYABLE_STATUS.has(response.status) || attempt === MAX_RETRIES) {
                log(requestId, "error", "Request failed", { status: response.status, body: text });
                return formatToolResult({
                  ok: false,
                  status: response.status,
                  message: "save_failed",
                  requestId,
                  retryCount: attempt,
                  errorCode: "HTTP_ERROR",
                  cubox: { error: `HTTP ${response.status}: ${text}` }
                });
              }

              // Retry
              const delay = exponentialBackoff(attempt);
              log(requestId, "warn", `Retrying after ${delay}ms`, { status: response.status });
              await sleep(delay);

            } catch (fetchError) {
              const classified = classifyNetworkError(fetchError);

              if (!classified.retryable || attempt === MAX_RETRIES) {
                log(requestId, "error", "Request failed", { error: getErrorMessage(fetchError), type: classified.type });
                return formatToolResult({
                  ok: false,
                  status: 0,
                  message: "save_failed",
                  requestId,
                  retryCount: attempt,
                  errorCode: classified.type,
                  cubox: { error: getErrorMessage(fetchError) }
                });
              }

              const delay = exponentialBackoff(attempt);
              log(requestId, "warn", `Retrying after ${delay}ms`, { error: getErrorMessage(fetchError) });
              await sleep(delay);
            }
          }

          // Should not reach here
          return formatToolResult({
            ok: false,
            status: 0,
            message: "save_failed",
            requestId,
            retryCount: MAX_RETRIES,
            errorCode: "MAX_RETRIES_EXCEEDED"
          });

        } catch (error) {
          log(requestId, "error", "Unexpected error", { error: getErrorMessage(error) });
          return formatToolResult({
            ok: false,
            status: 0,
            message: "save_failed",
            requestId,
            retryCount: 0,
            errorCode: "CONFIG_ERROR",
            cubox: { error: getErrorMessage(error) },
            error: { name: getErrorName(error), message: getErrorMessage(error) }
          });
        }
      }
    });
  }
};

export default plugin;