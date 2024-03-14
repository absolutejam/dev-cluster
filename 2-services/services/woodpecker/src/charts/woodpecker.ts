import { Construct } from "constructs";
import { ApiObject, Chart, ChartProps, JsonPatch } from "cdk8s";

import { VirtualService } from "@crashloopbackoff/shared/src/imports/istio/networking-virtualservices-networking.istio.io";
import {
  KubeNamespace,
  KubeSecret,
} from "@crashloopbackoff/shared/src/imports/k8s";
import { base64, CoreResourcesProps } from "@crashloopbackoff/shared";
import { Woodpecker } from "@crashloopbackoff/shared/src/imports/woodpecker";

export type WoodpeckerChartProps = {
  domain: string;
  agentSecret: string;
  giteaConfig: {
    url: string;
    adminUsername: string;
    secret: string;
    client: string;
  };
  istioGateway: string;
} & CoreResourcesProps &
  ChartProps;

export class WoodpeckerChart extends Chart {
  public helmChart: Woodpecker;
  public woodpeckerSecret: KubeSecret;
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

    this.woodpeckerSecret = new KubeSecret(
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

    this.helmChart = new Woodpecker(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "woodpecker",
      // https://github.com/woodpecker-ci/helm/blob/main/values.yaml
      values: {
        server: {
          enabled: true,
          image: { tag: "latest" },

          extraSecretNamesForEnvFrom: [this.woodpeckerSecret.metadata.name!],
          secrets: [],

          env: {
            WOODPECKER_HOST: `https://woodpecker.${domain}`,
            WOODPECKER_GITEA: true,
            WOODPECKER_ADMIN: giteaConfig.adminUsername,
            WOODPECKER_GITEA_SKIP_VERIFY: true,
          },
        },
        agent: {
          enabled: true,
          replicaCount: 2,

          extraSecretNamesForEnvFrom: ["woodpecker-secret"],
          secrets: [],

          extraVolumes: [
            {
              name: "build",
              emptyDir: {},
            },
            {
              name: "cert-bundle",
              configMap: {
                name: "bundle",
                optional: false,
                items: [
                  {
                    key: "certs.pem",
                    path: "ca-certificates.crt",
                  },
                ],
              },
            },
          ],
          extraVolumeMounts: [
            {
              name: "build",
              mountPath: "/tmp",
            },
            {
              name: "cert-bundle",
              mountPath: "/etc/ssl/certs/",
              readOnly: true,
            },
          ],
          env: {
            WOODPECKER_SERVER: `woodpecker-server.${props.namespace}.svc.cluster.local:9000`,

            WOODPECKER_BACKEND_K8S_NAMESPACE: props.namespace,
            WOODPECKER_BACKEND_K8S_STORAGE_CLASS: "",
            WOODPECKER_BACKEND_K8S_VOLUME_SIZE: "10G",
            WOODPECKER_BACKEND_K8S_STORAGE_RWX: false, // ReadWriteOnce
            // WOODPECKER_BACKEND_K8S_STORAGE_CLASS: "something",
            WOODPECKER_BACKEND_K8S_POD_LABELS: "",
            WOODPECKER_BACKEND_K8S_POD_ANNOTATIONS: "",
          },
        },
      },
    });

    const job = this.helmChart.node
      .tryFindChild("Helm")
      ?.node.tryFindChild("pre-install-agent-secret-check-job") as ApiObject;
    job.addJsonPatch(
      JsonPatch.add("/spec/template/metadata", {
        labels: { "sidecar.isito.io/inject": "false" },
      }),
      JsonPatch.add("/spec/template/metadata", {
        annotations: { "sidecar.isito.io/inject": "false" },
      }),
    );

    this.virtualService = new VirtualService(
      this,
      `${SERVICE}-virtual-service`,
      {
        metadata: {
          name: SERVICE,
          namespace: props.namespace,
        },
        spec: {
          hosts: ["woodpecker.dev-cluster.local"],
          gateways: [istioGateway],
          http: [
            {
              name: "http",
              route: [
                {
                  destination: {
                    host: `woodpecker-server.${props.namespace}.svc.cluster.local`,
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
      this.woodpeckerSecret.node.addDependency(namespace);
      this.helmChart.node.addDependency(namespace);
      this.virtualService.node.addDependency(namespace);
    }
  }
}
