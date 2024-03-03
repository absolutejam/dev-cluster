import { Certificate } from "@/imports/cert-manager/certificates-cert-manager.io";
import {
  Gateway as IstioGateway,
  GatewaySpecServersTlsMode,
} from "@/imports/istio/networking-gateways-networking.istio.io";
import { Gateway as IstioGatewayHelmChart } from "@/imports/gateway";
import { KubeNamespace } from "@/imports/k8s";
import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { CoreResourcesProps } from "../shared";

export type IstioGatewayChartProps = {
  gatewayName: string;
  tls: {
    commonName: string;
    issuerKind: string;
    issuerName: string;
    certSecretName: string;
    hostnames: string[];
  };
} & CoreResourcesProps &
  ChartProps;

export class IstioGatewayChart extends Chart {
  public helmChart: IstioGatewayHelmChart;
  public cert: Certificate;
  public istioGateway: IstioGateway;

  public gateway: string;

  constructor(scope: Construct, id: string, props: IstioGatewayChartProps) {
    const { tls } = props;

    super(scope, id);

    const SERVICE = "istio-gateway";

    this.gateway = `${props.namespace}/${props.gatewayName}`;

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
        },
      });
    }

    this.helmChart = new IstioGatewayHelmChart(this, `${SERVICE}-chart`, {
      namespace: props.namespace,
      releaseName: "istio-gateway",
      values: {
        autoscaling: {
          enabled: false,
        },
      },
    });

    this.cert = new Certificate(this, `${SERVICE}-certificate`, {
      metadata: {
        name: "istio-ingress-tls-cert",
        namespace: props.namespace,
      },
      spec: {
        secretName: tls.certSecretName,
        dnsNames: tls.hostnames,
        commonName: tls.commonName,
        issuerRef: {
          kind: tls.issuerKind,
          name: tls.issuerName,
          group: "cert-manager.io",
        },
      },
    });

    this.istioGateway = new IstioGateway(this, `${SERVICE}-gateway`, {
      metadata: {
        name: props.gatewayName,
        namespace: props.namespace,
      },
      spec: {
        selector: {
          istio: "gateway", // TODO:
        },
        servers: [
          {
            hosts: ["*"],
            port: {
              number: 80,
              name: "http",
              protocol: "HTTP",
            },
            tls: { httpsRedirect: true },
          },

          {
            port: {
              number: 443,
              name: "https",
              protocol: "HTTPS",
            },
            tls: {
              mode: GatewaySpecServersTlsMode.SIMPLE,
              credentialName: tls.certSecretName,
            },
            hosts: tls.hostnames,
          },
        ],
      },
    });

    if (namespace !== undefined) {
      this.helmChart.node.addDependency(namespace);
    }
  }
}
