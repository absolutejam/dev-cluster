import { Gitea } from "@/imports/gitea";
import { VirtualService } from "@/imports/istio/networking-virtualservices-networking.istio.io";
import { KubeNamespace, KubeSecret } from "@/imports/k8s";
import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { CoreResourcesProps, base64 } from "@/utils";

export type GiteaChartProps = {
  domain: string;
  istioGateway: string;
  adminCredentials: {
    username: string;
    password: string;
    email: string;
  };
  postgresConfig: {
    password: string;
    postgresPassword: string;
  };
} & CoreResourcesProps &
  ChartProps;

export class GiteaChart extends Chart {
  public helmChart: Gitea;
  public adminSecret: KubeSecret;
  public virtualService: VirtualService;
  public url: string;

  constructor(scope: Construct, id: string, props: GiteaChartProps) {
    const { domain, adminCredentials, postgresConfig, istioGateway } = props;

    super(scope, id);

    const SERVICE = "gitea";

    this.url = `https://gitea-http.${props.namespace}.svc.cluster.local:3000`;

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

    // NOTE: Regular `Secret` created here then encrypted via. `kubeseal`
    this.adminSecret = new KubeSecret(this, `${SERVICE}-admin-secret`, {
      metadata: {
        name: "gitea-admin-secret",
        namespace: props.namespace,
        annotations: {
          "seal-me": "true",
        },
      },
      data: {
        username: base64(adminCredentials.username),
        password: base64(adminCredentials.password),
        email: base64(adminCredentials.email),
      },
    });

    this.helmChart = new Gitea(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "gitea",
      values: {
        gitea: {
          config: {
            APP_NAME: "dev-cluster git",
            server: {
              DOMAIN: domain,
              ROOT_URL: `https://${domain}/gitea/`,
              STATIC_URL_PREFIX: `https://${domain}/gitea/`,
            },
          },
          admin: { existingSecret: "gitea-admin-secret" },
        },
        metrics: { enabled: true },
        test: { enabled: false },

        postgresql: {
          enabled: true,
          global: {
            postgresql: {
              auth: postgresConfig,
            },
          },
        },

        "postgresql-ha": {
          enabled: false,
        },

        "redis-cluster": {
          enabled: false,
          usePassword: false,
          cluster: {
            nodes: 3, // default: 6
            replicas: 0, // default: 1
          },
        },
      },
    });

    this.helmChart.node.addDependency(this.adminSecret);

    this.virtualService = new VirtualService(
      this,
      `${SERVICE}-virtual-service`,
      {
        metadata: {
          name: "gitea",
          namespace: props.namespace,
        },
        spec: {
          hosts: ["*"],
          gateways: [istioGateway],
          http: [
            {
              name: "http",
              match: [{ uri: { prefix: "/gitea/" } }],
              rewrite: { uri: "/" },
              route: [
                {
                  destination: {
                    host: `gitea-http.${props.namespace}.svc.cluster.local`,
                    port: { number: 3000 },
                  },
                },
              ],
            },
          ],
          tcp: [
            {
              match: [{ port: 22 }],
              route: [
                {
                  destination: {
                    host: `gitea-ssh.${props.namespace}.svc.cluster.local`,
                    port: { number: 22 },
                  },
                },
              ],
            },
          ],
        },
      },
    );

    if (namespace !== undefined) {
      this.adminSecret.node.addDependency(namespace);
      this.helmChart.node.addDependency(namespace);
      this.virtualService.node.addDependency(namespace);
    }
  }
}
