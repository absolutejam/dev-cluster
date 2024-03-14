import { App } from "cdk8s";
import { loadYamlConfig } from "@crashloopbackoff/shared";
import { GiteaChart } from "./charts";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { domain: DOMAIN },
  gitea: giteaConfig,
  istio: { gatewayName, gatewayNamespace },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new GiteaChart(app, "ext-gitea", {
  namespace: giteaConfig.namespace,
  createNamespace: true,
  disableResourceNameHashes: true,
  istioGateway: `${gatewayNamespace}/${gatewayName}`,

  domain: DOMAIN,
  adminCredentials: {
    username: giteaConfig.username,
    password: giteaConfig.password,
    email: giteaConfig.email,
  },
  postgresConfig: {
    password: "waffle123!",
    postgresPassword: "waffle123!",
  },
});

app.synth();
