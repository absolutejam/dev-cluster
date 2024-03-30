import * as fs from "fs";
import { App } from "cdk8s";
import { loadYamlConfig } from "@crashloopbackoff/shared";
import {
  SealedSecretsChart,
  ReflectorChart,
  CertManagerChart,
  TrustManagerChart,
  ClusterCertsChart,
  IstioChart,
  IstioGatewayChart,
  VaultChart,
} from "./charts";

//------------------------------------------------------------------------------

const config = loadYamlConfig(`${__dirname}/../config.yaml`);
const {
  vars: { domain: DOMAIN },
  pki: {
    rootCaName,
    rootCertName,
    selfSignedCaName,
    selfSignedBundleName,
    certManagerNamespace,
    trustManagerNamespace,
  },
  istio: { gatewayName, istioNamespace, gatewayNamespace },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new SealedSecretsChart(app, "core-sealed-secrets", {
  createNamespace: true,
  namespace: "core-sealed-secrets",
  disableResourceNameHashes: true,
});

new ReflectorChart(app, "core-reflector", {
  createNamespace: true,
  namespace: "core-reflector",
  disableResourceNameHashes: true,
});

new CertManagerChart(app, "core-cert-manager", {
  createNamespace: true,
  namespace: certManagerNamespace,
  disableResourceNameHashes: true,
});

new TrustManagerChart(app, "core-trust-manager", {
  createNamespace: true,
  namespace: trustManagerNamespace,
  certManagerNamespace: certManagerNamespace,
  disableResourceNameHashes: true,
});

new ClusterCertsChart(app, "core-cluster-certs", {
  certManagerNamespace,
  trustManagerNamespace,

  caCert: fs.readFileSync("../../pki/ca.pem", { encoding: "utf-8" }),
  caCertKey: fs.readFileSync("../../pki/ca-key.pem", {
    encoding: "utf-8",
  }),

  rootCaName,
  rootCertName,
  selfSignedCaName,
  selfSignedBundleName,
});

new IstioChart(app, "core-istio", {
  createNamespace: true,
  namespace: istioNamespace,
  disableResourceNameHashes: true,
});

new IstioGatewayChart(app, "core-istio-gateway", {
  namespace: gatewayNamespace,
  disableResourceNameHashes: true,
  gatewayName,

  tls: {
    issuerName: rootCaName,
    commonName: DOMAIN,
    certSecretName: "istio-gateway-dev-cluster-local-cert",
    hostnames: [DOMAIN, `*.${DOMAIN}`],
  },
});

new VaultChart(app, "vault", {
  createNamespace: true,
  namespace: "core-vault",
});

app.synth();
