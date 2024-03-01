// generated by cdk8s
import { ApiObject, ApiObjectMetadata, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';


/**
 *
 *
 * @schema Gateway
 */
export class Gateway extends ApiObject {
  /**
   * Returns the apiVersion and kind for "Gateway"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'networking.istio.io/v1alpha3',
    kind: 'Gateway',
  }

  /**
   * Renders a Kubernetes manifest for "Gateway".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: GatewayProps = {}): any {
    return {
      ...Gateway.GVK,
      ...toJson_GatewayProps(props),
    };
  }

  /**
   * Defines a "Gateway" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: GatewayProps = {}) {
    super(scope, id, {
      ...Gateway.GVK,
      ...props,
    });
  }

  /**
   * Renders the object to Kubernetes JSON.
   */
  public toJson(): any {
    const resolved = super.toJson();

    return {
      ...Gateway.GVK,
      ...toJson_GatewayProps(resolved),
    };
  }
}

/**
 * @schema Gateway
 */
export interface GatewayProps {
  /**
   * @schema Gateway#metadata
   */
  readonly metadata?: ApiObjectMetadata;

  /**
   * Configuration affecting edge load balancer. See more details at: https://istio.io/docs/reference/config/networking/gateway.html
   *
   * @schema Gateway#spec
   */
  readonly spec?: GatewaySpec;

}

/**
 * Converts an object of type 'GatewayProps' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewayProps(obj: GatewayProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'metadata': obj.metadata,
    'spec': toJson_GatewaySpec(obj.spec),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * Configuration affecting edge load balancer. See more details at: https://istio.io/docs/reference/config/networking/gateway.html
 *
 * @schema GatewaySpec
 */
export interface GatewaySpec {
  /**
   * One or more labels that indicate a specific set of pods/VMs on which this gateway configuration should be applied.
   *
   * @schema GatewaySpec#selector
   */
  readonly selector?: { [key: string]: string };

  /**
   * A list of server specifications.
   *
   * @schema GatewaySpec#servers
   */
  readonly servers?: GatewaySpecServers[];

}

/**
 * Converts an object of type 'GatewaySpec' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewaySpec(obj: GatewaySpec | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'selector': ((obj.selector) === undefined) ? undefined : (Object.entries(obj.selector).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {})),
    'servers': obj.servers?.map(y => toJson_GatewaySpecServers(y)),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * @schema GatewaySpecServers
 */
export interface GatewaySpecServers {
  /**
   * The ip or the Unix domain socket to which the listener should be bound to.
   *
   * @schema GatewaySpecServers#bind
   */
  readonly bind?: string;

  /**
   * @schema GatewaySpecServers#defaultEndpoint
   */
  readonly defaultEndpoint?: string;

  /**
   * One or more hosts exposed by this gateway.
   *
   * @schema GatewaySpecServers#hosts
   */
  readonly hosts: string[];

  /**
   * An optional name of the server, when set must be unique across all servers.
   *
   * @schema GatewaySpecServers#name
   */
  readonly name?: string;

  /**
   * The Port on which the proxy should listen for incoming connections.
   *
   * @schema GatewaySpecServers#port
   */
  readonly port: GatewaySpecServersPort;

  /**
   * Set of TLS related options that govern the server's behavior.
   *
   * @schema GatewaySpecServers#tls
   */
  readonly tls?: GatewaySpecServersTls;

}

/**
 * Converts an object of type 'GatewaySpecServers' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewaySpecServers(obj: GatewaySpecServers | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'bind': obj.bind,
    'defaultEndpoint': obj.defaultEndpoint,
    'hosts': obj.hosts?.map(y => y),
    'name': obj.name,
    'port': toJson_GatewaySpecServersPort(obj.port),
    'tls': toJson_GatewaySpecServersTls(obj.tls),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * The Port on which the proxy should listen for incoming connections.
 *
 * @schema GatewaySpecServersPort
 */
export interface GatewaySpecServersPort {
  /**
   * Label assigned to the port.
   *
   * @schema GatewaySpecServersPort#name
   */
  readonly name: string;

  /**
   * A valid non-negative integer port number.
   *
   * @schema GatewaySpecServersPort#number
   */
  readonly number: number;

  /**
   * The protocol exposed on the port.
   *
   * @schema GatewaySpecServersPort#protocol
   */
  readonly protocol: string;

  /**
   * @schema GatewaySpecServersPort#targetPort
   */
  readonly targetPort?: number;

}

/**
 * Converts an object of type 'GatewaySpecServersPort' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewaySpecServersPort(obj: GatewaySpecServersPort | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'name': obj.name,
    'number': obj.number,
    'protocol': obj.protocol,
    'targetPort': obj.targetPort,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * Set of TLS related options that govern the server's behavior.
 *
 * @schema GatewaySpecServersTls
 */
export interface GatewaySpecServersTls {
  /**
   * REQUIRED if mode is `MUTUAL` or `OPTIONAL_MUTUAL`.
   *
   * @schema GatewaySpecServersTls#caCertificates
   */
  readonly caCertificates?: string;

  /**
   * Optional: If specified, only support the specified cipher list.
   *
   * @schema GatewaySpecServersTls#cipherSuites
   */
  readonly cipherSuites?: string[];

  /**
   * For gateways running on Kubernetes, the name of the secret that holds the TLS certs including the CA certificates.
   *
   * @schema GatewaySpecServersTls#credentialName
   */
  readonly credentialName?: string;

  /**
   * If set to true, the load balancer will send a 301 redirect for all http connections, asking the clients to use HTTPS.
   *
   * @schema GatewaySpecServersTls#httpsRedirect
   */
  readonly httpsRedirect?: boolean;

  /**
   * Optional: Maximum TLS protocol version.
   *
   * @schema GatewaySpecServersTls#maxProtocolVersion
   */
  readonly maxProtocolVersion?: GatewaySpecServersTlsMaxProtocolVersion;

  /**
   * Optional: Minimum TLS protocol version.
   *
   * @schema GatewaySpecServersTls#minProtocolVersion
   */
  readonly minProtocolVersion?: GatewaySpecServersTlsMinProtocolVersion;

  /**
   * Optional: Indicates whether connections to this port should be secured using TLS.
   *
   * @schema GatewaySpecServersTls#mode
   */
  readonly mode?: GatewaySpecServersTlsMode;

  /**
   * REQUIRED if mode is `SIMPLE` or `MUTUAL`.
   *
   * @schema GatewaySpecServersTls#privateKey
   */
  readonly privateKey?: string;

  /**
   * REQUIRED if mode is `SIMPLE` or `MUTUAL`.
   *
   * @schema GatewaySpecServersTls#serverCertificate
   */
  readonly serverCertificate?: string;

  /**
   * A list of alternate names to verify the subject identity in the certificate presented by the client.
   *
   * @schema GatewaySpecServersTls#subjectAltNames
   */
  readonly subjectAltNames?: string[];

  /**
   * An optional list of hex-encoded SHA-256 hashes of the authorized client certificates.
   *
   * @schema GatewaySpecServersTls#verifyCertificateHash
   */
  readonly verifyCertificateHash?: string[];

  /**
   * An optional list of base64-encoded SHA-256 hashes of the SPKIs of authorized client certificates.
   *
   * @schema GatewaySpecServersTls#verifyCertificateSpki
   */
  readonly verifyCertificateSpki?: string[];

}

/**
 * Converts an object of type 'GatewaySpecServersTls' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewaySpecServersTls(obj: GatewaySpecServersTls | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'caCertificates': obj.caCertificates,
    'cipherSuites': obj.cipherSuites?.map(y => y),
    'credentialName': obj.credentialName,
    'httpsRedirect': obj.httpsRedirect,
    'maxProtocolVersion': obj.maxProtocolVersion,
    'minProtocolVersion': obj.minProtocolVersion,
    'mode': obj.mode,
    'privateKey': obj.privateKey,
    'serverCertificate': obj.serverCertificate,
    'subjectAltNames': obj.subjectAltNames?.map(y => y),
    'verifyCertificateHash': obj.verifyCertificateHash?.map(y => y),
    'verifyCertificateSpki': obj.verifyCertificateSpki?.map(y => y),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * Optional: Maximum TLS protocol version.
 *
 * @schema GatewaySpecServersTlsMaxProtocolVersion
 */
export enum GatewaySpecServersTlsMaxProtocolVersion {
  /** TLS_AUTO */
  TLS_UNDERSCORE_AUTO = "TLS_AUTO",
  /** TLSV1_0 */
  TLSV1_UNDERSCORE_0 = "TLSV1_0",
  /** TLSV1_1 */
  TLSV1_UNDERSCORE_1 = "TLSV1_1",
  /** TLSV1_2 */
  TLSV1_UNDERSCORE_2 = "TLSV1_2",
  /** TLSV1_3 */
  TLSV1_UNDERSCORE_3 = "TLSV1_3",
}

/**
 * Optional: Minimum TLS protocol version.
 *
 * @schema GatewaySpecServersTlsMinProtocolVersion
 */
export enum GatewaySpecServersTlsMinProtocolVersion {
  /** TLS_AUTO */
  TLS_UNDERSCORE_AUTO = "TLS_AUTO",
  /** TLSV1_0 */
  TLSV1_UNDERSCORE_0 = "TLSV1_0",
  /** TLSV1_1 */
  TLSV1_UNDERSCORE_1 = "TLSV1_1",
  /** TLSV1_2 */
  TLSV1_UNDERSCORE_2 = "TLSV1_2",
  /** TLSV1_3 */
  TLSV1_UNDERSCORE_3 = "TLSV1_3",
}

/**
 * Optional: Indicates whether connections to this port should be secured using TLS.
 *
 * @schema GatewaySpecServersTlsMode
 */
export enum GatewaySpecServersTlsMode {
  /** PASSTHROUGH */
  PASSTHROUGH = "PASSTHROUGH",
  /** SIMPLE */
  SIMPLE = "SIMPLE",
  /** MUTUAL */
  MUTUAL = "MUTUAL",
  /** AUTO_PASSTHROUGH */
  AUTO_UNDERSCORE_PASSTHROUGH = "AUTO_PASSTHROUGH",
  /** ISTIO_MUTUAL */
  ISTIO_UNDERSCORE_MUTUAL = "ISTIO_MUTUAL",
  /** OPTIONAL_MUTUAL */
  OPTIONAL_UNDERSCORE_MUTUAL = "OPTIONAL_MUTUAL",
}


/**
 *
 *
 * @schema GatewayV1Beta1
 */
export class GatewayV1Beta1 extends ApiObject {
  /**
   * Returns the apiVersion and kind for "GatewayV1Beta1"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'networking.istio.io/v1beta1',
    kind: 'Gateway',
  }

  /**
   * Renders a Kubernetes manifest for "GatewayV1Beta1".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: GatewayV1Beta1Props = {}): any {
    return {
      ...GatewayV1Beta1.GVK,
      ...toJson_GatewayV1Beta1Props(props),
    };
  }

  /**
   * Defines a "GatewayV1Beta1" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: GatewayV1Beta1Props = {}) {
    super(scope, id, {
      ...GatewayV1Beta1.GVK,
      ...props,
    });
  }

  /**
   * Renders the object to Kubernetes JSON.
   */
  public toJson(): any {
    const resolved = super.toJson();

    return {
      ...GatewayV1Beta1.GVK,
      ...toJson_GatewayV1Beta1Props(resolved),
    };
  }
}

/**
 * @schema GatewayV1Beta1
 */
export interface GatewayV1Beta1Props {
  /**
   * @schema GatewayV1Beta1#metadata
   */
  readonly metadata?: ApiObjectMetadata;

  /**
   * Configuration affecting edge load balancer. See more details at: https://istio.io/docs/reference/config/networking/gateway.html
   *
   * @schema GatewayV1Beta1#spec
   */
  readonly spec?: GatewayV1Beta1Spec;

}

/**
 * Converts an object of type 'GatewayV1Beta1Props' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewayV1Beta1Props(obj: GatewayV1Beta1Props | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'metadata': obj.metadata,
    'spec': toJson_GatewayV1Beta1Spec(obj.spec),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * Configuration affecting edge load balancer. See more details at: https://istio.io/docs/reference/config/networking/gateway.html
 *
 * @schema GatewayV1Beta1Spec
 */
export interface GatewayV1Beta1Spec {
  /**
   * One or more labels that indicate a specific set of pods/VMs on which this gateway configuration should be applied.
   *
   * @schema GatewayV1Beta1Spec#selector
   */
  readonly selector?: { [key: string]: string };

  /**
   * A list of server specifications.
   *
   * @schema GatewayV1Beta1Spec#servers
   */
  readonly servers?: GatewayV1Beta1SpecServers[];

}

/**
 * Converts an object of type 'GatewayV1Beta1Spec' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewayV1Beta1Spec(obj: GatewayV1Beta1Spec | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'selector': ((obj.selector) === undefined) ? undefined : (Object.entries(obj.selector).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {})),
    'servers': obj.servers?.map(y => toJson_GatewayV1Beta1SpecServers(y)),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * @schema GatewayV1Beta1SpecServers
 */
export interface GatewayV1Beta1SpecServers {
  /**
   * The ip or the Unix domain socket to which the listener should be bound to.
   *
   * @schema GatewayV1Beta1SpecServers#bind
   */
  readonly bind?: string;

  /**
   * @schema GatewayV1Beta1SpecServers#defaultEndpoint
   */
  readonly defaultEndpoint?: string;

  /**
   * One or more hosts exposed by this gateway.
   *
   * @schema GatewayV1Beta1SpecServers#hosts
   */
  readonly hosts: string[];

  /**
   * An optional name of the server, when set must be unique across all servers.
   *
   * @schema GatewayV1Beta1SpecServers#name
   */
  readonly name?: string;

  /**
   * The Port on which the proxy should listen for incoming connections.
   *
   * @schema GatewayV1Beta1SpecServers#port
   */
  readonly port: GatewayV1Beta1SpecServersPort;

  /**
   * Set of TLS related options that govern the server's behavior.
   *
   * @schema GatewayV1Beta1SpecServers#tls
   */
  readonly tls?: GatewayV1Beta1SpecServersTls;

}

/**
 * Converts an object of type 'GatewayV1Beta1SpecServers' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewayV1Beta1SpecServers(obj: GatewayV1Beta1SpecServers | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'bind': obj.bind,
    'defaultEndpoint': obj.defaultEndpoint,
    'hosts': obj.hosts?.map(y => y),
    'name': obj.name,
    'port': toJson_GatewayV1Beta1SpecServersPort(obj.port),
    'tls': toJson_GatewayV1Beta1SpecServersTls(obj.tls),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * The Port on which the proxy should listen for incoming connections.
 *
 * @schema GatewayV1Beta1SpecServersPort
 */
export interface GatewayV1Beta1SpecServersPort {
  /**
   * Label assigned to the port.
   *
   * @schema GatewayV1Beta1SpecServersPort#name
   */
  readonly name: string;

  /**
   * A valid non-negative integer port number.
   *
   * @schema GatewayV1Beta1SpecServersPort#number
   */
  readonly number: number;

  /**
   * The protocol exposed on the port.
   *
   * @schema GatewayV1Beta1SpecServersPort#protocol
   */
  readonly protocol: string;

  /**
   * @schema GatewayV1Beta1SpecServersPort#targetPort
   */
  readonly targetPort?: number;

}

/**
 * Converts an object of type 'GatewayV1Beta1SpecServersPort' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewayV1Beta1SpecServersPort(obj: GatewayV1Beta1SpecServersPort | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'name': obj.name,
    'number': obj.number,
    'protocol': obj.protocol,
    'targetPort': obj.targetPort,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * Set of TLS related options that govern the server's behavior.
 *
 * @schema GatewayV1Beta1SpecServersTls
 */
export interface GatewayV1Beta1SpecServersTls {
  /**
   * REQUIRED if mode is `MUTUAL` or `OPTIONAL_MUTUAL`.
   *
   * @schema GatewayV1Beta1SpecServersTls#caCertificates
   */
  readonly caCertificates?: string;

  /**
   * Optional: If specified, only support the specified cipher list.
   *
   * @schema GatewayV1Beta1SpecServersTls#cipherSuites
   */
  readonly cipherSuites?: string[];

  /**
   * For gateways running on Kubernetes, the name of the secret that holds the TLS certs including the CA certificates.
   *
   * @schema GatewayV1Beta1SpecServersTls#credentialName
   */
  readonly credentialName?: string;

  /**
   * If set to true, the load balancer will send a 301 redirect for all http connections, asking the clients to use HTTPS.
   *
   * @schema GatewayV1Beta1SpecServersTls#httpsRedirect
   */
  readonly httpsRedirect?: boolean;

  /**
   * Optional: Maximum TLS protocol version.
   *
   * @schema GatewayV1Beta1SpecServersTls#maxProtocolVersion
   */
  readonly maxProtocolVersion?: GatewayV1Beta1SpecServersTlsMaxProtocolVersion;

  /**
   * Optional: Minimum TLS protocol version.
   *
   * @schema GatewayV1Beta1SpecServersTls#minProtocolVersion
   */
  readonly minProtocolVersion?: GatewayV1Beta1SpecServersTlsMinProtocolVersion;

  /**
   * Optional: Indicates whether connections to this port should be secured using TLS.
   *
   * @schema GatewayV1Beta1SpecServersTls#mode
   */
  readonly mode?: GatewayV1Beta1SpecServersTlsMode;

  /**
   * REQUIRED if mode is `SIMPLE` or `MUTUAL`.
   *
   * @schema GatewayV1Beta1SpecServersTls#privateKey
   */
  readonly privateKey?: string;

  /**
   * REQUIRED if mode is `SIMPLE` or `MUTUAL`.
   *
   * @schema GatewayV1Beta1SpecServersTls#serverCertificate
   */
  readonly serverCertificate?: string;

  /**
   * A list of alternate names to verify the subject identity in the certificate presented by the client.
   *
   * @schema GatewayV1Beta1SpecServersTls#subjectAltNames
   */
  readonly subjectAltNames?: string[];

  /**
   * An optional list of hex-encoded SHA-256 hashes of the authorized client certificates.
   *
   * @schema GatewayV1Beta1SpecServersTls#verifyCertificateHash
   */
  readonly verifyCertificateHash?: string[];

  /**
   * An optional list of base64-encoded SHA-256 hashes of the SPKIs of authorized client certificates.
   *
   * @schema GatewayV1Beta1SpecServersTls#verifyCertificateSpki
   */
  readonly verifyCertificateSpki?: string[];

}

/**
 * Converts an object of type 'GatewayV1Beta1SpecServersTls' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_GatewayV1Beta1SpecServersTls(obj: GatewayV1Beta1SpecServersTls | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'caCertificates': obj.caCertificates,
    'cipherSuites': obj.cipherSuites?.map(y => y),
    'credentialName': obj.credentialName,
    'httpsRedirect': obj.httpsRedirect,
    'maxProtocolVersion': obj.maxProtocolVersion,
    'minProtocolVersion': obj.minProtocolVersion,
    'mode': obj.mode,
    'privateKey': obj.privateKey,
    'serverCertificate': obj.serverCertificate,
    'subjectAltNames': obj.subjectAltNames?.map(y => y),
    'verifyCertificateHash': obj.verifyCertificateHash?.map(y => y),
    'verifyCertificateSpki': obj.verifyCertificateSpki?.map(y => y),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * Optional: Maximum TLS protocol version.
 *
 * @schema GatewayV1Beta1SpecServersTlsMaxProtocolVersion
 */
export enum GatewayV1Beta1SpecServersTlsMaxProtocolVersion {
  /** TLS_AUTO */
  TLS_UNDERSCORE_AUTO = "TLS_AUTO",
  /** TLSV1_0 */
  TLSV1_UNDERSCORE_0 = "TLSV1_0",
  /** TLSV1_1 */
  TLSV1_UNDERSCORE_1 = "TLSV1_1",
  /** TLSV1_2 */
  TLSV1_UNDERSCORE_2 = "TLSV1_2",
  /** TLSV1_3 */
  TLSV1_UNDERSCORE_3 = "TLSV1_3",
}

/**
 * Optional: Minimum TLS protocol version.
 *
 * @schema GatewayV1Beta1SpecServersTlsMinProtocolVersion
 */
export enum GatewayV1Beta1SpecServersTlsMinProtocolVersion {
  /** TLS_AUTO */
  TLS_UNDERSCORE_AUTO = "TLS_AUTO",
  /** TLSV1_0 */
  TLSV1_UNDERSCORE_0 = "TLSV1_0",
  /** TLSV1_1 */
  TLSV1_UNDERSCORE_1 = "TLSV1_1",
  /** TLSV1_2 */
  TLSV1_UNDERSCORE_2 = "TLSV1_2",
  /** TLSV1_3 */
  TLSV1_UNDERSCORE_3 = "TLSV1_3",
}

/**
 * Optional: Indicates whether connections to this port should be secured using TLS.
 *
 * @schema GatewayV1Beta1SpecServersTlsMode
 */
export enum GatewayV1Beta1SpecServersTlsMode {
  /** PASSTHROUGH */
  PASSTHROUGH = "PASSTHROUGH",
  /** SIMPLE */
  SIMPLE = "SIMPLE",
  /** MUTUAL */
  MUTUAL = "MUTUAL",
  /** AUTO_PASSTHROUGH */
  AUTO_UNDERSCORE_PASSTHROUGH = "AUTO_PASSTHROUGH",
  /** ISTIO_MUTUAL */
  ISTIO_UNDERSCORE_MUTUAL = "ISTIO_MUTUAL",
  /** OPTIONAL_MUTUAL */
  OPTIONAL_UNDERSCORE_MUTUAL = "OPTIONAL_MUTUAL",
}

