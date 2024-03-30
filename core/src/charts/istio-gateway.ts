import { Construct } from "constructs";
import { Chart, ChartProps } from "cdk8s";

import { Certificate } from "@crashloopbackoff/shared/src/imports/cert-manager/certificates-cert-manager.io";
import {
  Gateway as IstioGateway,
  GatewaySpecServersTlsMode,
} from "@crashloopbackoff/shared/src/imports/istio/networking-gateways-networking.istio.io";
import { Gateway as IstioGatewayHelmChart } from "@crashloopbackoff/shared/src/imports/gateway";
import { KubeNamespace } from "@crashloopbackoff/shared/src/imports/k8s";
import { CoreResourcesProps } from "@crashloopbackoff/shared";

export type IstioGatewayChartProps = {
  gatewayName: string;
  tls: {
    commonName: string;
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

  constructor(scope: Construct, id: string, props: IstioGatewayChartProps) {
    const { tls } = props;

    super(scope, id);

    const SERVICE = "istio-gateway";

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
          kind: "ClusterIssuer",
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
