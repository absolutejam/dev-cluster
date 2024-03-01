import { Chart } from "cdk8s";
import { KubeSecret } from "@/imports/k8s";
import { Construct } from "constructs";
import {
  Certificate,
  CertificateSpecPrivateKeyAlgorithm,
} from "@/imports/cert-manager/certificates-cert-manager.io";
import { Issuer } from "@/imports/cert-manager/issuers-cert-manager.io";
import { Bundle } from "@/imports/trust-manager/bundles-trust.cert-manager.io";

export type TrustManagerChartProps = {
  caCert: string;
  caCertKey: string;
  rootCaName: string;
  rootCertName: string;
  selfSignedCaName: string;
  selfSignedBundleName: string;

  certManagerNamespace: string;
  trustManagerNamespace: string;
};

export class ClusterCertsChart extends Chart {
  public secret: KubeSecret;
  public rootIssuer: Issuer;
  public caCert: Certificate;
  public bundle: Bundle;

  constructor(scope: Construct, id: string, props: TrustManagerChartProps) {
    const {
      caCert,
      caCertKey,
      rootCaName,
      rootCertName,
      selfSignedCaName,
      selfSignedBundleName,

      certManagerNamespace,
      trustManagerNamespace,
    } = props;

    super(scope, id);

    const SERVICE = "cluster-certs";

    this.secret = new KubeSecret(this, `${SERVICE}-cert-secret`, {
      metadata: {
        name: rootCertName,
        namespace: certManagerNamespace,
      },
      data: {
        ["tls.crt"]: Buffer.from(caCert, "utf-8").toString("base64"),
        ["tls.key"]: Buffer.from(caCertKey, "utf-8").toString("base64"),
      },
    });

    this.rootIssuer = new Issuer(this, `${SERVICE}-issuer`, {
      metadata: {
        name: rootCaName,
        namespace: certManagerNamespace,
      },
      spec: {
        ca: {
          secretName: rootCertName,
        },
      },
    });
    this.rootIssuer.addDependency(this.secret);

    this.caCert = new Certificate(this, `${SERVICE}-self-signed-ca`, {
      metadata: {
        name: selfSignedCaName,
        namespace: certManagerNamespace,
      },
      spec: {
        secretTemplate: {
          annotations: {
            "reflector.v1.k8s.emberstack.com/reflection-allowed": "true",
            "reflector.v1.k8s.emberstack.com/reflection-auto-enabled": "true",
            "reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces":
              trustManagerNamespace,
            "reflector.v1.k8s.emberstack.com/reflection-auto-namespaces":
              trustManagerNamespace,
          },
        },
        isCa: true,
        commonName: selfSignedCaName,
        secretName: selfSignedCaName,
        privateKey: {
          algorithm: CertificateSpecPrivateKeyAlgorithm.ECDSA,
          size: 256,
        },
        issuerRef: {
          kind: "Issuer",
          name: rootCaName,
          group: "cert-manager.io",
        },
      },
    });
    this.caCert.addDependency(this.rootIssuer);

    this.bundle = new Bundle(this, `${SERVICE}-self-signed-bundle`, {
      metadata: {
        name: selfSignedBundleName,
        namespace: certManagerNamespace,
      },
      spec: {
        sources: [
          { useDefaultCAs: true },
          {
            secret: {
              name: selfSignedCaName,
              key: "ca.crt",
            },
          },
          {
            secret: {
              name: selfSignedCaName,
              key: "tls.crt",
            },
          },
        ],
        target: {
          configMap: {
            key: "certs.pem",
          },
          namespaceSelector: {
            matchLabels: {
              "istio-injection": "enabled",
            },
          },
        },
      },
    });
    this.bundle.addDependency(this.caCert);
  }
}
