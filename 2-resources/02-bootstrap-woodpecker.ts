import { App } from "cdk8s";
import { loadYamlConfig } from "@/config";
import { WoodpeckerChart } from "./resources/ext/woodpecker";
import { gitea, istioGateway } from "./01-core";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { ext: EXT, domain: DOMAIN },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new WoodpeckerChart(app, `${EXT}-woodpecker`, {
  createNamespace: true,
  namespace: `${EXT}-woodpecker`,
  disableResourceNameHashes: true,

  domain: DOMAIN,
  agentSecret: "TODO",
  istioGateway: istioGateway.gateway,

  giteaConfig: {
    url: gitea.url,
    secret: "TODO",
    client: "TODO",
  },
});

app.synth();
