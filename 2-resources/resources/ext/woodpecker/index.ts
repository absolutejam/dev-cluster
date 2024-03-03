import { VirtualService } from "@/imports/istio/networking-virtualservices-networking.istio.io";
import { KubeNamespace, KubeSecret } from "@/imports/k8s";
import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { base64, CoreResourcesProps } from "@/resources/shared";
import { Woodpecker } from "@/imports/woodpecker";

export type WoodpeckerChartProps = {
  domain: string;
  agentSecret: string;
  giteaConfig: {
    url: string;
    secret: string;
    client: string;
  };
  istioGateway: string;
} & CoreResourcesProps &
  ChartProps;

export class WoodpeckerChart extends Chart {
  public helmChart: Woodpecker;
  public woodpeckerSecrets: KubeSecret;
  public virtualService: VirtualService;

  constructor(scope: Construct, id: string, props: WoodpeckerChartProps) {
    const { domain, agentSecret, giteaConfig, istioGateway } = props;

    super(scope, id);

    const SERVICE = "woodpecker";

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

    this.woodpeckerSecrets = new KubeSecret(
      this,
      `${SERVICE}-woodpecker-secrets`,
      {
        metadata: {
          name: "woodpecker-secret",
          namespace: props.namespace,
          annotations: {
            "seal-me": "true",
          },
        },
        data: {
          WOODPECKER_AGENT_SECRET: base64(agentSecret),

          WOODPECKER_GITEA_URL: base64(giteaConfig.url),
          WOODPECKER_GITEA_SECRET: base64(giteaConfig.secret),
          WOODPECKER_GITEA_CLIENT: base64(giteaConfig.client),
        },
      },
    );

    this.helmChart = new Woodpecker(this, `${SERVICE}-chart`, {
      namespace: props.namespace,
      // https://github.com/woodpecker-ci/helm/blob/main/values.yaml
      values: {
        server: {
          enabled: true,
          image: { tag: "latest" },

          extraSecretNamesForEnvFrom: ["woodpecker-secret"],

          env: {
            WOODPECKER_HOST: `https://${domain}`,
            WOODPECKER_ROOT_URL: "/woodpecker",
            WOODPECKER_GITEA: true,
          },
        },
        agent: {
          enabled: true,
          replicaCount: 2,

          extraSecretNamesForEnvFrom: ["woodpecker-secret"],

          env: {
            WOODPECKER_SERVER: `woodpecker-server.${props.namespace}.svc.cluster.local:9000`,
            WOODPECKER_BACKEND_K8S_NAMESPACE: props.namespace,
            WOODPECKER_BACKEND_K8S_STORAGE_CLASS: "",
            WOODPECKER_BACKEND_K8S_VOLUME_SIZE: "10G",
            WOODPECKER_BACKEND_K8S_STORAGE_RWX: true,
            WOODPECKER_BACKEND_K8S_POD_LABELS: "",
            WOODPECKER_BACKEND_K8S_POD_ANNOTATIONS: "",
          },
        },
      },
    });

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
              match: [{ uri: { prefix: "/woodpecker/" } }],
              rewrite: { uri: "/" },
              route: [
                {
                  destination: {
                    host: `woodpecker-server.woodpecker.svc.cluster.local`,
                    port: { number: 80 },
                  },
                },
              ],
            },
          ],
        },
      },
    );

    if (namespace !== undefined) {
      this.woodpeckerSecrets.node.addDependency(namespace);
      this.helmChart.node.addDependency(namespace);
      this.virtualService.node.addDependency(namespace);
    }
  }
}
