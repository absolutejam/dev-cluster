// generated by cdk8s
import { ApiObject, ApiObjectMetadata, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';


/**
 * Order is a type to represent an Order with an ACME server
 *
 * @schema Order
 */
export class Order extends ApiObject {
  /**
   * Returns the apiVersion and kind for "Order"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'acme.cert-manager.io/v1',
    kind: 'Order',
  }

  /**
   * Renders a Kubernetes manifest for "Order".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: OrderProps): any {
    return {
      ...Order.GVK,
      ...toJson_OrderProps(props),
    };
  }

  /**
   * Defines a "Order" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: OrderProps) {
    super(scope, id, {
      ...Order.GVK,
      ...props,
    });
  }

  /**
   * Renders the object to Kubernetes JSON.
   */
  public toJson(): any {
    const resolved = super.toJson();

    return {
      ...Order.GVK,
      ...toJson_OrderProps(resolved),
    };
  }
}

/**
 * Order is a type to represent an Order with an ACME server
 *
 * @schema Order
 */
export interface OrderProps {
  /**
   * @schema Order#metadata
   */
  readonly metadata: ApiObjectMetadata;

  /**
   * @schema Order#spec
   */
  readonly spec: OrderSpec;

}

/**
 * Converts an object of type 'OrderProps' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_OrderProps(obj: OrderProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'metadata': obj.metadata,
    'spec': toJson_OrderSpec(obj.spec),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * @schema OrderSpec
 */
export interface OrderSpec {
  /**
   * CommonName is the common name as specified on the DER encoded CSR. If specified, this value must also be present in `dnsNames` or `ipAddresses`. This field must match the corresponding field on the DER encoded CSR.
   *
   * @schema OrderSpec#commonName
   */
  readonly commonName?: string;

  /**
   * DNSNames is a list of DNS names that should be included as part of the Order validation process. This field must match the corresponding field on the DER encoded CSR.
   *
   * @schema OrderSpec#dnsNames
   */
  readonly dnsNames?: string[];

  /**
   * Duration is the duration for the not after date for the requested certificate. this is set on order creation as pe the ACME spec.
   *
   * @schema OrderSpec#duration
   */
  readonly duration?: string;

  /**
   * IPAddresses is a list of IP addresses that should be included as part of the Order validation process. This field must match the corresponding field on the DER encoded CSR.
   *
   * @schema OrderSpec#ipAddresses
   */
  readonly ipAddresses?: string[];

  /**
   * IssuerRef references a properly configured ACME-type Issuer which should be used to create this Order. If the Issuer does not exist, processing will be retried. If the Issuer is not an 'ACME' Issuer, an error will be returned and the Order will be marked as failed.
   *
   * @schema OrderSpec#issuerRef
   */
  readonly issuerRef: OrderSpecIssuerRef;

  /**
   * Certificate signing request bytes in DER encoding. This will be used when finalizing the order. This field must be set on the order.
   *
   * @schema OrderSpec#request
   */
  readonly request: string;

}

/**
 * Converts an object of type 'OrderSpec' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_OrderSpec(obj: OrderSpec | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'commonName': obj.commonName,
    'dnsNames': obj.dnsNames?.map(y => y),
    'duration': obj.duration,
    'ipAddresses': obj.ipAddresses?.map(y => y),
    'issuerRef': toJson_OrderSpecIssuerRef(obj.issuerRef),
    'request': obj.request,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * IssuerRef references a properly configured ACME-type Issuer which should be used to create this Order. If the Issuer does not exist, processing will be retried. If the Issuer is not an 'ACME' Issuer, an error will be returned and the Order will be marked as failed.
 *
 * @schema OrderSpecIssuerRef
 */
export interface OrderSpecIssuerRef {
  /**
   * Group of the resource being referred to.
   *
   * @schema OrderSpecIssuerRef#group
   */
  readonly group?: string;

  /**
   * Kind of the resource being referred to.
   *
   * @schema OrderSpecIssuerRef#kind
   */
  readonly kind?: string;

  /**
   * Name of the resource being referred to.
   *
   * @schema OrderSpecIssuerRef#name
   */
  readonly name: string;

}

/**
 * Converts an object of type 'OrderSpecIssuerRef' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_OrderSpecIssuerRef(obj: OrderSpecIssuerRef | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'group': obj.group,
    'kind': obj.kind,
    'name': obj.name,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

