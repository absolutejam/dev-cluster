import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { CoreResourcesProps } from "@crashloopbackoff/shared";
import { Kubernetesdashboard } from "@crashloopbackoff/shared/src/imports/kubernetes-dashboard";
import { VirtualService } from "@crashloopbackoff/shared/src/imports/istio/networking-virtualservices-networking.istio.io";

type KubePrometheusStackChartProps = {
  istioGateway: string;
} & CoreResourcesProps &
  ChartProps;

export class KubePrometheusStackChart extends Chart {
  public helmChart: Kubernetesdashboard;
  public virtualService: VirtualService;

  constructor(
    scope: Construct,
    id: string,
    props: KubePrometheusStackChartProps,
  ) {
    const { istioGateway } = props;

    super(scope, id);

    const SERVICE = "kube-prometheus-stack";

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

    this.helmChart = new Kubernetesdashboard(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "kubernetes-dashboard",
      values: {
        protocolHttp: true,
        extraArgs: ["--enable-skip-login", "--enable-insecure-login"],

        // Pinned CRDs that will be displayed in dashboard's menu
        pinnedCRDs: [
          {
            kind: "customresourcedefinition",
            name: "prometheuses.monitoring.coreos.com",
            displayName: "Prometheus",
            namespaced: false,
          },
        ],

        metricsScraper: {
          enabled: true,
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
          hosts: ["kubernetes-dashboard.dev-cluster.local"], // TODO:
          gateways: [istioGateway],
          http: [
            {
              name: "http",
              route: [
                {
                  destination: {
                    host: `kubernetes-dashboard-kong-proxy.${props.namespace}.svc.cluster.local`,
                    port: { number: 443 },
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
