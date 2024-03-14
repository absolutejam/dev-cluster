import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { Reflector } from "@crashloopbackoff/shared/src/imports/reflector";
import { CoreResourcesProps } from "@crashloopbackoff/shared";

export type ReflectorChartProps = CoreResourcesProps & ChartProps;

export class ReflectorChart extends Chart {
  public helmChart: Reflector;

  constructor(scope: Construct, id: string, props: ReflectorChartProps) {
    super(scope, id, props);

    const SERVICE = "reflector";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
          labels: {
            "istio-injection": "enabled",
          },
        },
      });
    }

    this.helmChart = new Reflector(this, `${SERVICE}-chart`, {
      namespace: props.namespace,
      releaseName: "reflector",
      values: {},
    });

    if (namespace !== undefined) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
