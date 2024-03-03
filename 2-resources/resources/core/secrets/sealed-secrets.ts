import { Construct } from "constructs";
import { KubeNamespace } from "@/imports/k8s";
import { Chart, ChartProps } from "cdk8s";
import { CoreResourcesProps } from "../shared";
import { Sealedsecrets } from "@/imports/sealed-secrets";

export type SealedSecretsChartProps = CoreResourcesProps & ChartProps;

export class SealedSecretsChart extends Chart {
  helmChart: Sealedsecrets;

  constructor(scope: Construct, id: string, props: SealedSecretsChartProps) {
    super(scope, id, props);

    const SERVICE = "sealed-secrets";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: { name: props.namespace },
      });
    }

    this.helmChart = new Sealedsecrets(this, `${SERVICE}-chart`, {
      namespace: props.namespace,
      releaseName: "sealed-secrets",
      helmFlags: ["--include-crds"],
      values: {},
    });

    if (namespace !== undefined) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
