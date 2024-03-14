import { App } from "cdk8s";
import { KialiChart } from "./charts/kiali";
import { loadYamlConfig } from "@crashloopbackoff/shared";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { observability: OBS },
  istio: { gatewayName, gatewayNamespace },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new KialiChart(app, `${OBS}-kiali`, {
  namespace: `${OBS}-kiali`,
  createNamespace: true,

  istioGateway: `${gatewayNamespace}/${gatewayName}`,
});

app.synth();
