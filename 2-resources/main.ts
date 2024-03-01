import { App } from "cdk8s";
import { SealedSecretsChart } from "@/resources/core/01-sealed-secrets";
import { ReflectorChart } from "./resources/core/02-reflector";
import { CertManagerChart } from "./resources/core/03-cert-manager";
import { TrustManagerChart } from "./resources/core/04-trust-manager";
import { ClusterCertsChart } from "./resources/core/05-cluster-certs";
import * as fs from "fs";
import { IstioChart } from "./resources/core/06-istio";
import { IstioGatewayChart } from "./resources/core/07-istio-gateway";

const app = new App();

const CORE = "cluster-core";

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

  rootCaName: "root-ca",
  rootCertName: "root-cert",
  selfSignedCaName: "ca",
  selfSignedBundleName: "bundle",
});
clusterCerts.addDependency(trustManager);

const istio = new IstioChart(app, `${CORE}-istio`, {
  createNamespace: true,
  namespace: `${CORE}-istio`,
});

// NOTE: No dependency on cluster certs as it was killing synth
//       performance 😕

const istioGateway = new IstioGatewayChart(app, `${CORE}-istio-gateway`, {
  namespace: `${CORE}-istio`,
  tls: {
    issuerKind: "ClusterIssuer",
    issuerName: "root-ca",
    commonName: "devcluster.local",
    certSecretName: "istio-gateway-devcluster-local-cert",
    hostnames: ["devcluster-lab.local"],
  },
});
istioGateway.addDependency(istio);

console.time();
app.synth();
console.timeEnd();
