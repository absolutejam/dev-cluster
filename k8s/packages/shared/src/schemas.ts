import { z } from "zod";

export const UtilsConfig = z.object({
  sealedSecretsNamespace: z.string().default("secret-system"),
  reflectorNamespace: z.string().default("secrets-system"),
});

export const PkiConfig = z.object({
  rootCaCert: z.string().min(1),
  rootCaKey: z.string().min(1),
  rootCaSecretName: z.string().default("root-ca-certs"),

  issuerName: z.string().default("cluster-issuer"),
  caSecretName: z.string().default("cluster-ca-certs"),

  caName: z.string().default("cluster-ca"),
  bundleName: z.string().default("cluster-bundle"),

  certManagerNamespace: z.string().default("certs-system"),
  trustManagerNamespace: z.string().default("certs-system"),
});

export const IstioConfig = z.object({
  gatewayName: z.string().default("default-gateway"),
  istioNamespace: z.string().default("istio-system"),
  gatewayNamespace: z.string().default("istio-system"),
});

export const VaultConfig = z.object({
  namespace: z.string().default("vault-system"),
});
