import { Construct } from "constructs";
import { ApiObject, JsonPatch } from "cdk8s";

export function base64(data: string): string {
  return Buffer.from(data, "utf-8").toString("base64");
}

export function forceNamespaceForHelmResources(
  c: Construct,
  namespace: string,
) {
  (c.node.tryFindChild("Helm")?.node.children as ApiObject[]).forEach((r) => {
    if (r.metadata.namespace != namespace) {
      console.log(`Patching ${r.metadata.name ?? r.name} namespace`);

      r.addJsonPatch(JsonPatch.replace("/metadata/namespace", namespace));
    }
  });
}
