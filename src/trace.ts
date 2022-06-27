import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { JaegerPropagator } from "@opentelemetry/propagator-jaeger";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { CompositePropagator, W3CTraceContextPropagator, W3CBaggagePropagator } from "@opentelemetry/core";
import { B3InjectEncoding, B3Propagator } from "@opentelemetry/propagator-b3";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { SocketIoInstrumentation } from "opentelemetry-instrumentation-socket.io";
import { MongooseInstrumentation } from "opentelemetry-instrumentation-mongoose";

export const initTrace = (serviceName: string, env: string, jaegerCollectorUri: string) => {
    return new NodeSDK({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: `${serviceName} Service`,
            [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env,
        }),
        spanProcessor: new BatchSpanProcessor(
            new JaegerExporter({
                tags: [],
                endpoint: jaegerCollectorUri,
            })
        ),
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
        instrumentations: [new HttpInstrumentation(), new SocketIoInstrumentation() as any, new MongooseInstrumentation()],
    });
};
