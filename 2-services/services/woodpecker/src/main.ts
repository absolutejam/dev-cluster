import * as fs from "fs";
import { z } from "zod";
import { App } from "cdk8s";
import { loadYamlConfig } from "@crashloopbackoff/shared";
import { WoodpeckerChart } from "./charts/woodpecker";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { external: EXT, domain: DOMAIN },
  istio: { gatewayName, gatewayNamespace },
} = config;

const oauthClientParser = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  id: z.number(),
  name: z.string(),
  redirect_uris: z.array(z.string()),
});

const oauthClientFileJson = JSON.parse(
  fs.readFileSync(`${__dirname}/../woodpecker-oauth2-client.json`, {
    encoding: "utf-8",
  }),
);

const oauthClient = oauthClientParser.parse(oauthClientFileJson);

//------------------------------------------------------------------------------

const app = new App();

new WoodpeckerChart(app, `${EXT}-woodpecker`, {
  createNamespace: true,
  namespace: `${EXT}-woodpecker`,
  disableResourceNameHashes: true,

  domain: DOMAIN,
  agentSecret: "TODO",
  istioGateway: `${gatewayNamespace}/${gatewayName}`,

  giteaConfig: {
    url: `https://gitea.${DOMAIN}`,
    client: oauthClient.client_id,
    secret: oauthClient.client_secret,
    adminUsername: "gitea-admin",
  },
});

app.synth();
