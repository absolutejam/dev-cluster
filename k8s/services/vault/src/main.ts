import { z } from "zod";
import { App } from "cdk8s";
import { VaultChart } from "./charts";
import { PkiConfig, VaultConfig } from "@crashloopbackoff/shared/src/config";

//------------------------------------------------------------------------------

export const Config = z.object({
  pki: PkiConfig,
  vault: VaultConfig,
});

const env = process.env;
const config = Config.parse({
  pki: {
    selfSignedBundleName: env.SELF_SIGNED_BUNDLE_NAME,
  },
  vault: {
    namespace: env.VAULT_NAMESPACE,
  },
});

const {
  pki: { selfSignedBundleName },
  vault: { namespace: vaultNamespace },
} = config;

//------------------------------------------------------------------------------

const app = new App();

new VaultChart(app, "vault", {
  createNamespace: true,
  namespace: vaultNamespace,
  bundleName: selfSignedBundleName,
});

app.synth();
