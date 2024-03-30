import { Construct } from "constructs";
import { Chart, ChartProps, Include } from "cdk8s";

import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { Mysqloperator } from "@crashloopbackoff/shared/src/imports/mysql-operator";
import { CoreResourcesProps } from "@crashloopbackoff/shared";

type MysqlOperatorChartProps = CoreResourcesProps & ChartProps;

export class MysqlOperatorChart extends Chart {
  public helmChart: Mysqloperator;
  public crds: Include;

  constructor(scope: Construct, id: string, props: MysqlOperatorChartProps) {
    super(scope, id);

    const SERVICE = "mysql-operator";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
        },
      });
    }

    this.crds = new Include(this, `${SERVICE}-crds`, {
      url: "https://raw.githubusercontent.com/mysql/mysql-operator/trunk/deploy/deploy-crds.yaml",
    });

    this.helmChart = new Mysqloperator(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "mysql-operator",
      values: {},
    });
    this.helmChart.node.addDependency(this.crds);

    // this.dbSecrets = new KubeSecret(this, `${SERVICE}-db-creds`, {
    //   metadata: {
    //     name: "db-creds",
    //     namespace: props.namespace,
    //   },
    //   data: {
    //     rootUser: base64("root"),
    //     rootHost: base64("%"),
    //     rootPassword: base64("password"),
    //   },
    // });
    // this.dbSecrets.addDependency(this.helmChart);

    // this dbCluster = new Mysqlinnodbcluster(this, `${SERVICE}-cluster`, {
    //   namespace: props.namespace,
    //
    // })

    if (namespace) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
