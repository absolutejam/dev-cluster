import { App, Chart } from "cdk8s";
import { Construct } from "constructs";
import { KubeDeployment } from "@/imports/k8s";

type NginxChartProps = { namespace: string };

export class NginxChart extends Chart {
  public deployment: KubeDeployment;

  constructor(scope: Construct, id: string, props: NginxChartProps) {
    super(scope, id);

    const SERVICE = "nginx";

    this.deployment = new KubeDeployment(this, `${SERVICE}-deployment`, {
      metadata: {
        name: "nginx",
        namespace: props.namespace,
      },
    });
  }
}

const app = new App();

new NginxChart(app, "nginx", { namespace: "service-nginx" });

app.synth();
