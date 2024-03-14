import { App } from "cdk8s";
import { FalcoChart } from "./charts/falco";
import { loadYamlConfig } from "@crashloopbackoff/shared";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { observability: OBS },
  istio: { gatewayName, gatewayNamespace },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new FalcoChart(app, `${OBS}-falco`, {
  namespace: `${OBS}-falco`,
  createNamespace: true,

  istioGateway: `${gatewayNamespace}/${gatewayName}`,
});

app.synth();
