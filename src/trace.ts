import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { JaegerPropagator } from "@opentelemetry/propagator-jaeger";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { CompositePropagator, W3CTraceContextPropagator, W3CBaggagePropagator } from "@opentelemetry/core";
import { B3InjectEncoding, B3Propagator } from "@opentelemetry/propagator-b3";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { SocketIoInstrumentation } from "opentelemetry-instrumentation-socket.io";
import { IncomingMessage } from "http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { MongooseInstrumentation } from "@opentelemetry/instrumentation-mongoose";

export const initializer = new NodeSDK({
    contextManager: new AsyncLocalStorageContextManager(),
    textMapPropagator: new CompositePropagator({
        propagators: [
            new JaegerPropagator(),
            new W3CTraceContextPropagator(),
            new W3CBaggagePropagator(),
            new B3Propagator({
                injectEncoding: B3InjectEncoding.MULTI_HEADER,
            }),
        ],
    }),
    instrumentations: [
        new HttpInstrumentation({
            ignoreIncomingRequestHook: (req: IncomingMessage) => {
                return req.method === "GET" || req.statusCode === 204;
            },
        }),
        new SocketIoInstrumentation() as any,
        new MongooseInstrumentation(),
    ],
});

export const initSpanProcessor = (collectorUri: string, trace: NodeSDK) => {
    trace.configureTracerProvider(
        null,
        new BatchSpanProcessor(
            new OTLPTraceExporter({
                url: collectorUri,
                headers: {},
            })
        )
    );
};

export const addIdentifiers = (serviceName: string, env: string, trace: NodeSDK) => {
    trace.addResource(
        new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: `${serviceName} - ${env}`,
            [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env,
        })
    );
};
