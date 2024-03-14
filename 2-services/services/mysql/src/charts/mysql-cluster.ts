import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import {
  KubeNamespace,
  KubeSecret,
} from "@crashloopbackoff/shared/src/imports/k8s";
import { InnoDbCluster } from "@crashloopbackoff/shared/src/imports/mysql/innodbclusters-mysql.oracle.com";
import { base64, CoreResourcesProps } from "@crashloopbackoff/shared";

type MysqlClusterChartProps = CoreResourcesProps & ChartProps;

export class MysqlClusterChart extends Chart {
  public dbSecrets: KubeSecret;
  public innodbCluster: InnoDbCluster;

  constructor(scope: Construct, id: string, props: MysqlClusterChartProps) {
    super(scope, id);

    const SERVICE = "mysql";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
        },
      });
    }

    this.dbSecrets = new KubeSecret(this, `${SERVICE}-db-creds`, {
      metadata: {
        name: "db-creds",
        namespace: props.namespace,
      },
      data: {
        rootUser: base64("root"),
        rootHost: base64("%"),
        rootPassword: base64("password"),
      },
    });

    this.innodbCluster = new InnoDbCluster(this, `${SERVICE}-cluster`, {
      metadata: {
        name: "cluster",
        namespace: props.namespace,
      },
      spec: {
        secretName: this.dbSecrets.metadata.name!,
        tlsUseSelfSigned: true,
        instances: 3,
        router: {
          instances: 3,
        },
      },
    });
    this.innodbCluster.addDependency(this.dbSecrets);

    if (namespace) {
      this.dbSecrets.node.addDependency(namespace);
    }
  }
}
