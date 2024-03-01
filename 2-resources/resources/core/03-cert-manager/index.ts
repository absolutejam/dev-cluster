import { Certmanager } from "@/imports/cert-manager";
import { KubeNamespace } from "@/imports/k8s";
import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { CoreResourcesProps } from "../shared";

export type CertManagerChartProps = CoreResourcesProps & ChartProps;

export class CertManagerChart extends Chart {
  public helmChart: Certmanager;

  constructor(scope: Construct, id: string, props: CertManagerChartProps) {
    super(scope, id, props);

    const SERVICE = "cert-manager";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
        },
      });
    }

    this.helmChart = new Certmanager(this, `${SERVICE}-chart`, {
      namespace: props.namespace,
      releaseName: "cert-manager",
      values: {
        installCRDs: true,
        replicas: 2,

        // Disabled due to depending on Helm hooks
        startupapicheck: { enabled: false },
      },
    });

    if (namespace !== undefined) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
