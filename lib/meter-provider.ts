import {OTLPMetricExporter} from "@opentelemetry/exporter-metrics-otlp-http";
import {MeterProvider, PeriodicExportingMetricReader} from "@opentelemetry/sdk-metrics";
import {resourceFromAttributes} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME
} from "@opentelemetry/semantic-conventions/incubating";


const exporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
  headers: {Authorization: `Basic ${process.env.GRAFANA_AUTH_BASIC}`}
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: exporter,
  exportIntervalMillis: 10000,
});

export const meterProvider = new MeterProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "unsub",
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.NODE_ENV ?? 'development',
  }),
  readers: [metricReader],
});

export const meter = meterProvider.getMeter("unsub");