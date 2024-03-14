import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { CoreResourcesProps } from "@crashloopbackoff/shared";
import { VirtualService } from "@crashloopbackoff/shared/src/imports/istio/networking-virtualservices-networking.istio.io";
import { Falco } from "@crashloopbackoff/shared/src/imports/falco";

type FalcoChartProps = {
  istioGateway: string;
} & CoreResourcesProps &
  ChartProps;

export class FalcoChart extends Chart {
  public helmChart: Falco;
  public virtualService: VirtualService;

  constructor(scope: Construct, id: string, props: FalcoChartProps) {
    const { istioGateway } = props;

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

    this.helmChart = new Falco(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "falco",
      helmFlags: ["--include-crds"],
      values: {},
    });

    this.virtualService = new VirtualService(
      this,
      `${SERVICE}-virtual-service`,
      {
        metadata: {
          name: SERVICE,
          namespace: props.namespace,
        },
        spec: {
          hosts: ["falco.dev-cluster.local"], // TODO:
          gateways: [istioGateway],
          http: [
            {
              name: "http",
              route: [
                {
                  destination: {
                    host: `kiali.${props.namespace}.svc.cluster.local`,
                    port: { number: 20001 },
                  },
                },
              ],
            },
          ],
        },
      },
    );

    if (namespace) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
