import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";

import { Vault } from "@crashloopbackoff/shared/src/imports/vault";
import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { CoreResourcesProps } from "@crashloopbackoff/shared";

export type VaultChartProps = { bundleName: string } & CoreResourcesProps &
  ChartProps;

export class VaultChart extends Chart {
  public helmChart: Vault;

  constructor(scope: Construct, id: string, props: VaultChartProps) {
    super(scope, id, props);

    const { bundleName } = props;

    const SERVICE = "vault";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
        },
      });
    }

    this.helmChart = new Vault(this, `${SERVICE}-chart`, {
      namespace: props.namespace,
      releaseName: "vault",
      values: {
        global: {
          enabled: true,
          tlsDisable: false,
        },
        injector: {
          enabled: true,
          image: {
            repository: "hashicorp/vault-k8s",
            tag: "latest",
          },
        },
        server: {
          image: {
            repository: "hashicorp/vault",
            tag: "1.15.0",
          },
          readinessProbe: {
            enabled: true,
            // path: "/v1/sys/health?standbyok=true&sealedcode=204&uninitcode=204",
          },
          livenessProbe: {
            enabled: true,
            path: "/v1/sys/health?standbyok=true",
            initialDelaySeconds: 60,
          },
          extraEnvironmentVars: {
            VAULT_CACERT: "/vault/userconfig/tls-ca/ca.crt",
          },
          extraVolumes: [
            {
              type: "secret",
              name: bundleName,
            },
          ],
          auditStorage: {
            enabled: true,
          },
          standalone: {
            enabled: false,
          },
          ha: {
            enabled: true,
            replicas: 3,
            raft: {
              enabled: true,
              setNodeId: true,
              config: `
ui = true
cluster_name = "dev-cluster"

listener "tcp" {
  address = "[::]:8200"
  cluster_address = "[::]:8201"
  tls_cert_file = "/vault/userconfig/tls-server/fullchain.pem"
  tls_key_file = "/vault/userconfig/tls-server/server.key"
  tls_client_ca_file = "/vault/userconfig/tls-server/client-auth-ca.pem"
}

storage "raft" {
  path = "/vault/data"
    retry_join {
    leader_api_addr = "https://vault-0.vault-internal:8200"
    leader_ca_cert_file = "/vault/userconfig/tls-ca/ca.crt"
    leader_client_cert_file = "/vault/userconfig/tls-server/server.crt"
    leader_client_key_file = "/vault/userconfig/tls-server/server.key"
  }
  retry_join {
    leader_api_addr = "https://vault-1.vault-internal:8200"
    leader_ca_cert_file = "/vault/userconfig/tls-ca/ca.crt"
    leader_client_cert_file = "/vault/userconfig/tls-server/server.crt"
    leader_client_key_file = "/vault/userconfig/tls-server/server.key"
  }
  retry_join {
    leader_api_addr = "https://vault-2.vault-internal:8200"
    leader_ca_cert_file = "/vault/userconfig/tls-ca/ca.crt"
    leader_client_cert_file = "/vault/userconfig/tls-server/server.crt"
    leader_client_key_file = "/vault/userconfig/tls-server/server.key"
  }
  retry_join {
      leader_api_addr = "https://vault-3.vault-internal:8200"
      leader_ca_cert_file = "/vault/userconfig/tls-ca/ca.crt"
      leader_client_cert_file = "/vault/userconfig/tls-server/server.crt"
      leader_client_key_file = "/vault/userconfig/tls-server/server.key"
  }
  retry_join {
      leader_api_addr = "https://vault-4.vault-internal:8200"
      leader_ca_cert_file = "/vault/userconfig/tls-ca/ca.crt"
      leader_client_cert_file = "/vault/userconfig/tls-server/server.crt"
      leader_client_key_file = "/vault/userconfig/tls-server/server.key"
  }
}
`,
            },
          },
        },
        ui: {
          enabled: true,
          serviceType: "LoadBalancer",
          serviceNodePort: undefined,
          externalPort: 8200,
        },
      },
    });

    if (namespace !== undefined) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
