import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { CoreResourcesProps } from "@crashloopbackoff/shared";
import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { Falco } from "@crashloopbackoff/shared/src/imports/falco";
import { Falcoexporter } from "@crashloopbackoff/shared/src/imports/falco-exporter";

type FalcoChartProps = {
  istioGateway: string;
} & CoreResourcesProps &
  ChartProps;

export class FalcoChart extends Chart {
  public helmChart: Falco;
  public exporterHelmChart: Falcoexporter;

  constructor(scope: Construct, id: string, props: FalcoChartProps) {
    super(scope, id);

    const SERVICE = "falco";

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

    // https://github.com/falcosecurity/charts/tree/master/charts/falco
    this.helmChart = new Falco(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "falco",
      helmFlags: ["--include-crds"],
      values: {
        driver: {
          kind: "ebpf",
        },
      },
    });

    // https://github.com/falcosecurity/charts/tree/master/charts/falco-exporter
    this.exporterHelmChart = new Falcoexporter(
      this,
      `${SERVICE}-exporter-helm-chart`,
      {
        namespace: props.namespace,
        releaseName: "falco-exporter",
        values: {},
      },
    );

    if (namespace) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
