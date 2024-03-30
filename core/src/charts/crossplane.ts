import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { CoreResourcesProps } from "@crashloopbackoff/shared";
import { Crossplane } from "@crashloopbackoff/shared/src/imports/crossplane";
import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";

export type CrossplaneChartProps = {} & CoreResourcesProps & ChartProps;

export class CrossplaneChart extends Chart {
  public helmChart: Crossplane;

  constructor(scope: Construct, id: string, props: CrossplaneChartProps) {
    super(scope, id);

    const SERVICE = "crossplane";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
        },
      });
    }

    this.helmChart = new Crossplane(this, `${SERVICE}-chart`, {
      namespace: props.namespace,
      releaseName: "crossplane",
      values: {
        args: [
          "--enable-composition-functions",
          "--enable-composition-webhook-schema-validation",
        ],
        metrics: {
          enabled: true,
        },
        provider: {
          packages: [],
        },
        configurations: {
          packages: [],
        },
      },
    });

    if (namespace !== undefined) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
