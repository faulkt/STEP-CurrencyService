'use strict';

// Init otel
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
//const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-proto');
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { AlwaysOnSampler } = require('@opentelemetry/core');

const propertiesReader = require('properties-reader')

const OTLPoptions = {
  url: process.env.OTEL_COLLECTOR_URL,
  headers: {
    Authorization: `Api-Token ${process.env.AUTH_HEADER}`
  },
};

let dtmetadata = new Resource({})
for (let name of [ 'dt_metadata_e617c525669e072eebe3d0f08212e8f2.properties', '/var/lib/dynatrace/enrichment/dt_metadata.properties' ]) {
  try {
    dtmetadata = dtmetadata.merge(new Resource(name.startsWith("/var") ? propertiesReader(name).getAllProperties() : propertiesReader(fs.readFileSync(name).toString()).getAllProperties()))
  } catch { }
}

const otlpExporter = new OTLPTraceExporter(OTLPoptions);

const sdk = new opentelemetry.NodeSDK({
  sampler: new AlwaysOnSampler(),
  traceExporter: otlpExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'Currency Service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }).merge(dtmetadata),
});

sdk.start()
  .then(() => console.log('Tracing initialized'))
  .catch((error) => console.log('Error initializing tracing', error));