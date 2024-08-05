import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";
import { IncomingMessage } from "http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { MongooseInstrumentation } from "@opentelemetry/instrumentation-mongoose";
import { FastifyInstrumentation } from "@opentelemetry/instrumentation-fastify";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation, ExpressLayerType } from "@opentelemetry/instrumentation-express";

export const initializer = (serviceName: string, env: string) => {
    return new NodeTracerProvider({
        resource: new Resource({
            [SEMRESATTRS_SERVICE_NAME]: serviceName,
            [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: env,
        }),
    });
};

export const initSpanProcessor = (tracerProvider: NodeTracerProvider, collectorUri: string) => {
    const exporter = new OTLPTraceExporter({
        url: collectorUri,
        headers: {},
        concurrencyLimit: 10,
    });

    tracerProvider.addSpanProcessor(
        new BatchSpanProcessor(exporter, {
            // The maximum queue size. After the size is reached spans are dropped.
            maxQueueSize: 1000,
            // The interval between two consecutive exports
            scheduledDelayMillis: 30000,
        })
    );
    tracerProvider.register();

    registerInstrumentations({
        tracerProvider,
        instrumentations: [
            new HttpInstrumentation({
                ignoreIncomingRequestHook: (req: IncomingMessage) => {
                    return req.method === "GET" && req.statusCode === 204;
                },
            }),
            new FastifyInstrumentation(),
            new SocketIoInstrumentation() as any,
            new MongooseInstrumentation(),
            new ExpressInstrumentation({ ignoreLayersType: [ExpressLayerType.REQUEST_HANDLER, ExpressLayerType.MIDDLEWARE] }),
        ],
    });
};
