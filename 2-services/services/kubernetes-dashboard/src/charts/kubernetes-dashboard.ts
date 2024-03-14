import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { CoreResourcesProps } from "@crashloopbackoff/shared";
import { Kubernetesdashboard } from "@crashloopbackoff/shared/src/imports/kubernetes-dashboard";
import { VirtualService } from "@crashloopbackoff/shared/src/imports/istio/networking-virtualservices-networking.istio.io";
import {
  KubeClusterRoleBinding,
  KubeSecret,
  KubeServiceAccount,
} from "cdk8s-plus-25/lib/imports/k8s";

type KubernetesDashboardChartProps = {
  istioGateway: string;
} & CoreResourcesProps &
  ChartProps;

export class KubernetesDashboardChart extends Chart {
  public helmChart: Kubernetesdashboard;
  public virtualService: VirtualService;

  public dashboardAdminUser: KubeServiceAccount;
  public dashboardAdminClusterRoleBinding: KubeClusterRoleBinding;
  public dashboardAdminSecret: KubeSecret;

  constructor(
    scope: Construct,
    id: string,
    props: KubernetesDashboardChartProps,
  ) {
    const { istioGateway } = props;

    super(scope, id);

    const SERVICE = "k8s-dashboard";

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

    this.dashboardAdminUser = new KubeServiceAccount(
      this,
      `${SERVICE}-admin-user`,
      {
        metadata: {
          name: "dashboard-admin-user",
          namespace: props.namespace,
        },
      },
    );

    this.dashboardAdminClusterRoleBinding = new KubeClusterRoleBinding(
      this,
      `${SERVICE}-admin-user-cluster-admin`,
      {
        metadata: {
          name: "dashboard-admin-user",
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "ClusterRole",
          name: "cluster-admin",
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "dashboard-admin-user",
            namespace: props.namespace,
          },
        ],
      },
    );

    this.dashboardAdminSecret = new KubeSecret(
      this,
      `${SERVICE}-admin-user-token`,
      {
        type: "kubernetes.io/service-account-token",
        metadata: {
          name: "dashboard-admin-user",
          namespace: props.namespace,
          annotations: {
            "kubernetes.io/service-account.name": "dashboard-admin-user",
          },
        },
      },
    );

    // https://github.com/kubernetes/dashboard/blob/master/docs/common/arguments.md
    this.helmChart = new Kubernetesdashboard(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "kubernetes-dashboard",
      values: {
        app: {
          global: {
            clusterName: "dev-cluster.local",
          },

          // Pinned CRDs that will be displayed in dashboard's menu
          pinnedCRDs: [
            {
              kind: "customresourcedefinition",
              name: "prometheuses.monitoring.coreos.com",
              displayName: "Prometheus",
              namespaced: false,
            },
          ],
        },
        kong: {
          proxy: {
            http: {
              enabled: true,
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
          hosts: ["kubernetes-dashboard.dev-cluster.local"], // TODO:
          gateways: [istioGateway],
          http: [
            {
              name: "http",
              headers: {
                request: {
                  add: {
                    Authorization: `Bearer TODO`,
                  },
                },
              },
              route: [
                {
                  destination: {
                    host: `kubernetes-dashboard-kong-proxy.${props.namespace}.svc.cluster.local`,
                    port: { number: 80 },
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
