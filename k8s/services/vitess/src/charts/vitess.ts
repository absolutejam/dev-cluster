import { Construct } from "constructs";
import { Chart, ChartProps, Include } from "cdk8s";

import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { CoreResourcesProps } from "@crashloopbackoff/shared";

type VitessChartProps = {} & CoreResourcesProps & ChartProps;

export class VitessChart extends Chart {
  public crds: Include;

  constructor(scope: Construct, id: string, props: VitessChartProps) {
    super(scope, id);

    const SERVICE = "vitess";
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

    this.crds = new Include(this, `${SERVICE}-crds`, {
      url: "https://raw.githubusercontent.com/vitessio/vitess/main/examples/operator/operator.yaml",
    });

    if (namespace) {
      this.crds.node.addDependency(namespace);
    }
  }
}
