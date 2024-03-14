import { App } from "cdk8s";
import { KubePrometheusStackChart } from "./charts/kube-prometheus-stack";
import { loadYamlConfig } from "@crashloopbackoff/shared";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { observability: OBS },
  istio: { gatewayName, gatewayNamespace },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new KubePrometheusStackChart(app, `${OBS}-kube-prometheus`, {
  namespace: `${OBS}-prometheus`,
  createNamespace: true,

  istioGateway: `${gatewayNamespace}/${gatewayName}`,
});

app.synth();
