import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { CoreResourcesProps } from "@crashloopbackoff/shared";
import { VirtualService } from "@crashloopbackoff/shared/src/imports/istio/networking-virtualservices-networking.istio.io";
import { Kialioperator } from "@crashloopbackoff/shared/src/imports/kiali-operator";

type KialiChartProps = {
  istioGateway: string;
} & CoreResourcesProps &
  ChartProps;

export class KialiChart extends Chart {
  public helmChart: Kialioperator;
  public virtualService: VirtualService;

  constructor(scope: Construct, id: string, props: KialiChartProps) {
    const { istioGateway } = props;

    super(scope, id);

    const SERVICE = "kiali";

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

    this.helmChart = new Kialioperator(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "kiali-operator",
      helmFlags: ["--include-crds"],
      values: {
        cr: {
          create: true,
          name: "kiali",

          spec: {
            istio_namespace: "core-istio", // TODO:
            auth: {
              strategy: "anonymous",
            },
            external_services: {
              istio: {
                root_namespace: "core-istio",
                component_status: {
                  components: [
                    {
                      app_label: "istio-gateway",
                      is_core: true,
                      is_proxy: true,
                      namespace: "core-istio",
                    },
                  ],
                },
              },
            },
          },
        },
      },
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
          hosts: ["kiali.dev-cluster.local"], // TODO:
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
