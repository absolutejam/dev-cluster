import * as fs from "fs";
import * as YAML from "yaml";
import { z } from "zod";

export const config = z.object({
  vars: z.object({
    core: z.string(),
    ext: z.string(),
    domain: z.string(),
  }),
  pki: z.object({
    rootCaName: z.string(),
    rootCertName: z.string(),
    selfSignedCaName: z.string(),
    selfSignedBundleName: z.string(),
  }),
  gitea: z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
  }),
});

export type Config = z.infer<typeof config>;

export function loadYamlConfig(path: string): Config {
  const configRaw = fs.readFileSync(path, { encoding: "utf-8" });
  const configYaml = YAML.parse(configRaw);
  return config.parse(configYaml);
}
