import {registerOTel} from "@vercel/otel";
import {metrics} from "@opentelemetry/api";
import {meterProvider} from "@/lib/meter-provider";


export function register() {
  registerOTel({
    serviceName: "unsub",
  });
  metrics.setGlobalMeterProvider(meterProvider)
}