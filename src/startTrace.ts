import { addIdentifiers, initSpanProcessor, initializer } from "./trace";

export const startTrace = (enabled: boolean, endpoint: string, system: string, env: string, serviceName: string) => {
    if (!enabled) return;

    initSpanProcessor(endpoint, initializer);
    addIdentifiers(`${system} - ${serviceName}`, env, initializer);
    initializer.start();
};

process.on("exit", async (code) => {
    console.log(`About to exit with code: ${code}`);
    await initializer.shutdown();
});
