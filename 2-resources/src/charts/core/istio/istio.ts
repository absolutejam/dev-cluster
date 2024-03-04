import { Base } from "@/imports/base";
import { ProxyConfig } from "@/imports/istio/networking-proxyconfigs-networking.istio.io";
import { Istiod } from "@/imports/istiod";
import { KubeNamespace } from "@/imports/k8s";
import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { CoreResourcesProps } from "../shared";

export type IstioChartProps = CoreResourcesProps & ChartProps;

export class IstioChart extends Chart {
  public istioBaseHelmChart: Base;
  public istiodHelmChart: Istiod;
  public proxyConfig: ProxyConfig;

  constructor(scope: Construct, id: string, props: IstioChartProps) {
    super(scope, id);

    const SERVICE = "istio";

    var namespace: KubeNamespace | undefined = undefined;

    if (props.createNamespace) {
      namespace = new KubeNamespace(this, `${SERVICE}-namespace`, {
        metadata: {
          name: props.namespace,
        },
      });
    }

    this.istioBaseHelmChart = new Base(this, `${SERVICE}-base-helm-chart`, {
      namespace: props.namespace,
      releaseName: "istio-base",
      values: {
        base: { enableCRDTemplates: true },
        global: { istioNamespace: props.namespace },
      },
    });

    this.istiodHelmChart = new Istiod(this, `${SERVICE}-helm-chart`, {
      namespace: props.namespace,
      releaseName: "istiod",
      values: {
        global: { istioNamespace: props.namespace },
        sidecarInjectorWebhook: {
          // auto inject into all namespaces unless disabled with label
          enableNamespacesByDefault: false,
        },
        meshConfig: {
          enablePrometheusMerge: true,
        },
      },
    });

    this.proxyConfig = new ProxyConfig(this, `${SERVICE}-proxy`, {
      metadata: {
        name: "mesh-proxy-config",
        namespace: props.namespace,
      },
      spec: {
        environmentVariables: {
          ISTIO_META_DNS_CAPTURE: "true",
          ISTIO_META_DNS_AUTO_ALLOCATE: "true",
        },
      },
    });

    if (namespace !== undefined) {
      this.istioBaseHelmChart.node.addDependency(namespace);
      this.istiodHelmChart.node.addDependency(namespace);
      this.proxyConfig.node.addDependency(namespace);
    }
  }
}
