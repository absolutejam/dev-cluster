import * as fs from "fs";
import { App } from "cdk8s";
import { loadYamlConfig } from "@/config";
import { SealedSecretsChart } from "@/resources/core/01-sealed-secrets";
import { ReflectorChart } from "./resources/core/02-reflector";
import { CertManagerChart } from "./resources/core/03-cert-manager";
import { TrustManagerChart } from "./resources/core/04-trust-manager";
import { ClusterCertsChart } from "./resources/core/05-cluster-certs";
import { IstioChart } from "./resources/core/06-istio";
import { IstioGatewayChart } from "./resources/core/07-istio-gateway";
import { GiteaChart } from "./resources/core/08-gitea";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {
  vars: { core: CORE, domain: DOMAIN },
  pki: { rootCaName, rootCertName, selfSignedCaName, selfSignedBundleName },
  gitea: giteaConfig,
} = config;

console.log(config.pki);

//------------------------------------------------------------------------------

const app = new App();

const sealedSecrets = new SealedSecretsChart(app, `${CORE}-sealed-secrets`, {
  createNamespace: true,
  namespace: `${CORE}-sealed-secrets`,
});

const reflector = new ReflectorChart(app, `${CORE}-reflector`, {
  createNamespace: true,
  namespace: `${CORE}-reflector`,
});

reflector.addDependency(sealedSecrets);

const certManager = new CertManagerChart(app, `${CORE}-cert-manager`, {
  createNamespace: true,
  namespace: `${CORE}-cert-manager`,
});

certManager.addDependency(reflector);

const trustManager = new TrustManagerChart(app, `${CORE}-trust-manager`, {
  createNamespace: true,
  namespace: `${CORE}-trust-manager`,
  certManagerNamespace: certManager.namespace!,
});

trustManager.addDependency(certManager);

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
clusterCerts.addDependency(trustManager);

const istio = new IstioChart(app, `${CORE}-istio`, {
  createNamespace: true,
  namespace: `${CORE}-istio`,
});

// NOTE: No dependency on cluster certs as it was killing synth performance 😕

const istioGateway = new IstioGatewayChart(app, `${CORE}-istio-gateway`, {
  namespace: `${CORE}-istio`,
  tls: {
    issuerKind: clusterCerts.rootIssuer.kind,
    issuerName: clusterCerts.rootIssuer.metadata.name!,
    commonName: DOMAIN,
    certSecretName: "istio-gateway-dev-cluster-local-cert",
    hostnames: [DOMAIN],
  },
});
istioGateway.addDependency(istio);

const gitea = new GiteaChart(app, `${CORE}-gitea`, {
  namespace: `${CORE}-gitea`,
  createNamespace: true,

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
gitea.addDependency(istioGateway);

console.time();
app.synth();
console.timeEnd();
