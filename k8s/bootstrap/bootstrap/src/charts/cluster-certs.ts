import { Chart } from "cdk8s";
import { Construct } from "constructs";

import { KubeSecret } from "@crashloopbackoff/shared/src/imports/k8s";
import {
  Certificate,
  CertificateSpecPrivateKeyAlgorithm,
} from "@crashloopbackoff/shared/src/imports/cert-manager/certificates-cert-manager.io";
import { Bundle } from "@crashloopbackoff/shared/src/imports/trust-manager/bundles-trust.cert-manager.io";
import { ClusterIssuer } from "@crashloopbackoff/shared/src/imports/cert-manager/clusterissuers-cert-manager.io";

export type ClusterCertsChartProps = {
  rootCaCert: string;
  rootCaKey: string;
  rootCaSecretName: string;

  issuerName: string;
  caSecretName: string;

  caName: string;
  bundleName: string;

  certManagerNamespace: string;
  trustManagerNamespace: string;
};

export class ClusterCertsChart extends Chart {
  public secret: KubeSecret;
  public rootIssuer: ClusterIssuer;
  public caCert: Certificate;
  public bundle: Bundle;

  constructor(scope: Construct, id: string, props: ClusterCertsChartProps) {
    const {
      rootCaCert,
      rootCaKey,
      rootCaSecretName,

      issuerName,
      caSecretName,

      caName,
      bundleName,

      certManagerNamespace,
      trustManagerNamespace,
    } = props;

    super(scope, id);

    const SERVICE = "cluster-certs";

    this.secret = new KubeSecret(this, `${SERVICE}-cert-secret`, {
      metadata: {
        name: rootCaSecretName,
        namespace: certManagerNamespace,
      },
      data: {
        "tls.crt": Buffer.from(rootCaCert, "utf-8").toString("base64"),
        "tls.key": Buffer.from(rootCaKey, "utf-8").toString("base64"),
      },
    });

    this.rootIssuer = new ClusterIssuer(this, `${SERVICE}-issuer`, {
      metadata: {
        name: issuerName,
        namespace: certManagerNamespace,
      },
      spec: {
        ca: {
          secretName: rootCaSecretName,
        },
      },
    });
    this.rootIssuer.addDependency(this.secret);

    this.caCert = new Certificate(this, `${SERVICE}-self-signed-ca`, {
      metadata: {
        name: caName,
        namespace: certManagerNamespace,
      },
      spec: {
        secretTemplate: {
          annotations: {
            ...(props.certManagerNamespace != props.trustManagerNamespace
              ? {
                  "reflector.v1.k8s.emberstack.com/reflection-allowed": "true",
                  "reflector.v1.k8s.emberstack.com/reflection-auto-enabled":
                    "true",
                  "reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces":
                    trustManagerNamespace,
                  "reflector.v1.k8s.emberstack.com/reflection-auto-namespaces":
                    trustManagerNamespace,
                }
              : {}),
          },
        },
        isCa: true,
        commonName: caName,
        secretName: caSecretName,
        privateKey: {
          algorithm: CertificateSpecPrivateKeyAlgorithm.ECDSA,
          size: 256,
        },
        issuerRef: {
          kind: "ClusterIssuer",
          name: issuerName,
          group: "cert-manager.io",
        },
      },
    });
    this.caCert.addDependency(this.rootIssuer);

    this.bundle = new Bundle(this, `${SERVICE}-self-signed-bundle`, {
      metadata: {
        name: bundleName,
        namespace: certManagerNamespace,
      },
      spec: {
        sources: [
          { useDefaultCAs: true },
          {
            secret: {
              name: caSecretName,
              key: "ca.crt",
            },
          },
          {
            secret: {
              name: caSecretName,
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
