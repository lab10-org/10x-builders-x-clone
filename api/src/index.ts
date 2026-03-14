import { createHealthPayload } from "./lib/health";

const status = createHealthPayload("ok", new Date().toISOString());
console.log("API server bootstrap", status);
