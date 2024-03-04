export type CoreResourcesProps =
  | {
      createNamespace: true;
      namespace: string;
    }
  | { createNamespace?: false };

export function base64(data: string): string {
  return Buffer.from(data, "utf-8").toString("base64");
}
