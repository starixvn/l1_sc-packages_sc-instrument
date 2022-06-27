import { trace } from "@opentelemetry/api";

export const tracer = trace.getTracer("sc-instrument", "1.0.0");
