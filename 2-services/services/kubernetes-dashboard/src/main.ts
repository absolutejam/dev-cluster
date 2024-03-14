import { App } from "cdk8s";
import { KubernetesDashboardChart } from "./charts/kubernetes-dashboard";
import { loadYamlConfig } from "@crashloopbackoff/shared";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { observability: OBS },
  istio: { gatewayName, gatewayNamespace },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new KubernetesDashboardChart(app, `${OBS}-kubernetes-dashboard`, {
  namespace: `${OBS}-kubernetes-dashboard`,
  createNamespace: true,

  istioGateway: `${gatewayNamespace}/${gatewayName}`,
});

app.synth();
