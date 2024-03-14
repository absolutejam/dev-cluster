import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { Trustmanager } from "@crashloopbackoff/shared/src/imports/trust-manager";
import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { CoreResourcesProps } from "@crashloopbackoff/shared";

export type TrustManagerChartProps = {
  certManagerNamespace: string;
} & CoreResourcesProps &
  ChartProps;

export class TrustManagerChart extends Chart {
  public helmChart: Trustmanager;

  constructor(scope: Construct, id: string, props: TrustManagerChartProps) {
    super(scope, id, props);

    const SERVICE = "trust-manager";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
        },
      });
    }

    this.helmChart = new Trustmanager(this, `${SERVICE}-chart`, {
      namespace: props.namespace,
      releaseName: "trust-manager",
      values: {
        app: {
          trust: {
            namespace: props.certManagerNamespace,
          },
        },
      },
    });

    if (namespace !== undefined) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
