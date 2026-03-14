type ServiceStatus = "ok" | "degraded" | "down";

export type HealthPayload = {
  status: ServiceStatus;
  timestamp: string;
};

export function createHealthPayload(
  status: ServiceStatus,
  timestamp: string
): HealthPayload {
  return {
    status,
    timestamp
  };
}
