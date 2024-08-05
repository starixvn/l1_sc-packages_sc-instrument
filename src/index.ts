import { tracer } from "./instrument";
import { initSpanProcessor } from "./trace";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { startTrace } from "./startTrace";

export { tracer, initSpanProcessor, NodeSDK, startTrace };
