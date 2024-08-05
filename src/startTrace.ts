import { initSpanProcessor, initializer } from "./trace";
import { trace } from "@opentelemetry/api";

export const startTrace = (enabled: boolean, endpoint: string, system: string, env: string, serviceName: string) => {
    if (!enabled) return;

    const formattedServiceName = `${system} - ${serviceName} - ${env}`;
    const tracer = initializer(formattedServiceName, env);
    initSpanProcessor(tracer, endpoint);

    process.on("exit", async (code) => {
        console.log(`About to exit with code: ${code}`);
        await tracer.shutdown();
    });
};

export const getTracer = (system: string, env: string, serviceName: string) => {
    const formattedServiceName = `${system} - ${serviceName} - ${env}`;
    return trace.getTracer(formattedServiceName);
};
