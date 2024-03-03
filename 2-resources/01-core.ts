import * as fs from "fs";
import { App } from "cdk8s";
import { loadYamlConfig } from "@/config";
import { SealedSecretsChart, ReflectorChart } from "@/resources/core/secrets";
import {
  CertManagerChart,
  TrustManagerChart,
  ClusterCertsChart,
} from "@/resources/core/certs";
import { IstioChart, IstioGatewayChart } from "@/resources/core/istio";
import { GiteaChart } from "@/resources/ext/gitea";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { core: CORE, ext: EXT, domain: DOMAIN },
  pki: { rootCaName, rootCertName, selfSignedCaName, selfSignedBundleName },
  gitea: giteaConfig,
} = config;

console.log(config.pki);

//------------------------------------------------------------------------------

const app = new App();

new SealedSecretsChart(app, `${CORE}-sealed-secrets`, {
  createNamespace: true,
  namespace: `${CORE}-sealed-secrets`,
  disableResourceNameHashes: true,
});

new ReflectorChart(app, `${CORE}-reflector`, {
  createNamespace: true,
  namespace: `${CORE}-reflector`,
  disableResourceNameHashes: true,
});

const certManager = new CertManagerChart(app, `${CORE}-cert-manager`, {
  createNamespace: true,
  namespace: `${CORE}-cert-manager`,
  disableResourceNameHashes: true,
});

const trustManager = new TrustManagerChart(app, `${CORE}-trust-manager`, {
  createNamespace: true,
  namespace: `${CORE}-trust-manager`,
  certManagerNamespace: certManager.namespace!,
  disableResourceNameHashes: true,
});

const clusterCerts = new ClusterCertsChart(app, `${CORE}-cluster-certs`, {
  certManagerNamespace: certManager.namespace!,
  trustManagerNamespace: trustManager.namespace!,

  caCert: fs.readFileSync("../pki/ca.pem", { encoding: "utf-8" }),
  caCertKey: fs.readFileSync("../pki/ca-key.pem", { encoding: "utf-8" }),

  rootCaName,
  rootCertName,
  selfSignedCaName,
  selfSignedBundleName,
});

new IstioChart(app, `${CORE}-istio`, {
  createNamespace: true,
  namespace: `${CORE}-istio`,
  disableResourceNameHashes: true,
});

export const istioGateway = new IstioGatewayChart(
  app,
  `${CORE}-istio-gateway`,
  {
    namespace: `${CORE}-istio`,
    disableResourceNameHashes: true,
    gatewayName: "default-gateway",
    tls: {
      issuerKind: clusterCerts.rootIssuer.kind,
      issuerName: clusterCerts.rootIssuer.metadata.name!,
      commonName: DOMAIN,
      certSecretName: "istio-gateway-dev-cluster-local-cert",
      hostnames: [DOMAIN],
    },
  },
);

export const gitea = new GiteaChart(app, `${EXT}-gitea`, {
  namespace: `${EXT}-gitea`,
  createNamespace: true,
  disableResourceNameHashes: true,
  istioGateway: istioGateway.gateway,

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
