import { App } from "cdk8s";
import { MysqlOperatorChart, MysqlClusterChart } from "./charts";

const app = new App();

new MysqlOperatorChart(app, "inf-mysql-operator", {
  namespace: "inf-mysql-operator",
  createNamespace: true,
});

new MysqlClusterChart(app, "inf-mysql-cluster", {
  namespace: "inf-mysql-operator",
});

app.synth();
