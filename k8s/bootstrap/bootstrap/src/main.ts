import { z } from "zod";
import { App } from "cdk8s";
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
import {
  UtilsConfig,
  PkiConfig,
  IstioConfig,
  VaultConfig,
} from "@crashloopbackoff/shared/src/schemas";

//------------------------------------------------------------------------------

export const Config = z.object({
  domain: z.string().default("dev-cluster"),
  utils: UtilsConfig,
  pki: PkiConfig,
  istio: IstioConfig,
  vault: VaultConfig,
});

const env = process.env;
const config = Config.parse({
  domain: env.DOMAIN,
  utils: {
    sealedSecretsNamespace: env.SEALED_SECRETS_NAMESPACE,
    reflectorNamespace: env.REFLECTOR_NAMESPACE,
  },
  pki: {
    rootCaCert: env.PKI_ROOT_CA_CERT,
    rootCaKey: env.PKI_ROOT_CA_KEY,
    rootCaSecretName: env.PKI_ROOT_CA_SECRET_NAME,

    issuerName: env.PKI_ISSUER_NAME,
    caSecretName: env.PKI_CA_SECRET_NAME,

    caName: env.PKI_CA_NAME,
    bundleName: env.PKI_BUNDLE_NAME,

    certManagerNamespace: env.PKI_CERT_MANAGER_NAMESPACE,
    trustManagerNamespace: env.PKI_TRUST_MANAGER_NAMESPACE,
  },
  istio: {
    gatewayName: env.ISTIO_GATEWAY_NAME,
    istioNamespace: env.ISTIO_NAMESPACE,
    gatewayNamespace: env.ISTIO_GATEWAY_NAMESPACE,
  },
  vault: {
    namespace: env.VAULT_NAMESPACE,
  },
});

const {
  domain,
  utils: { sealedSecretsNamespace, reflectorNamespace },
  pki: {
    rootCaCert,
    rootCaKey,
    rootCaSecretName,

    issuerName,
    caSecretName,

    caName,
    bundleName,

    certManagerNamespace,
    trustManagerNamespace,
  },
  istio: { gatewayName, istioNamespace, gatewayNamespace },
  vault: { namespace: vaultNamespace },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new SealedSecretsChart(app, "sealed-secrets", {
  createNamespace: true,
  namespace: sealedSecretsNamespace,
  disableResourceNameHashes: true,
});

new ReflectorChart(app, "reflector", {
  createNamespace: true,
  namespace: reflectorNamespace,
  disableResourceNameHashes: true,
});

new CertManagerChart(app, "cert-manager", {
  createNamespace: true,
  namespace: certManagerNamespace,
  disableResourceNameHashes: true,
});

new TrustManagerChart(app, "trust-manager", {
  createNamespace: true,
  namespace: trustManagerNamespace,
  certManagerNamespace: certManagerNamespace,
  disableResourceNameHashes: true,
});

new ClusterCertsChart(app, "cluster-certs", {
  rootCaCert,
  rootCaKey,
  rootCaSecretName,

  issuerName,
  caSecretName,

  caName,
  bundleName,

  certManagerNamespace,
  trustManagerNamespace,
});

new IstioChart(app, "istio", {
  createNamespace: true,
  namespace: istioNamespace,
  disableResourceNameHashes: true,
});

new IstioGatewayChart(app, "istio-gateway", {
  namespace: gatewayNamespace,
  disableResourceNameHashes: true,
  gatewayName,

  tls: {
    issuerName: "root",
    commonName: domain,
    certSecretName: "istio-gateway-dev-cluster-local-cert",
    hostnames: [domain, `*.${domain}`],
  },
});

new VaultChart(app, "vault", {
  createNamespace: true,
  namespace: vaultNamespace,
  bundleName,
});

app.synth();

console.log(
  JSON.stringify([
    {
      name: "vault",
    },
  ]),
);
