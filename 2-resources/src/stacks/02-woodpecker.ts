import { z } from "zod";
import { App } from "cdk8s";
import { loadYamlConfig } from "@/config";
import { WoodpeckerChart } from "@/charts/ext/woodpecker";
import { gitea, istioGateway } from "./01-core";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { ext: EXT, domain: DOMAIN },
} = config;

//------------------------------------------------------------------------------

const secrets = z
  .object({
    WOODPECKER_GITEA_CLIENT: z.string(),
    WOODPECKER_GITEA_SECRET: z.string(),
  })
  .parse(process.env);

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
    client: secrets.WOODPECKER_GITEA_CLIENT,
    secret: secrets.WOODPECKER_GITEA_SECRET,
  },
});

app.synth();
