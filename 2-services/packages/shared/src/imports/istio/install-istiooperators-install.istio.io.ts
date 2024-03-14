// generated by cdk8s
import { ApiObject, ApiObjectMetadata, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';


/**
 *
 *
 * @schema IstioOperator
 */
export class IstioOperator extends ApiObject {
  /**
   * Returns the apiVersion and kind for "IstioOperator"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'install.istio.io/v1alpha1',
    kind: 'IstioOperator',
  }

  /**
   * Renders a Kubernetes manifest for "IstioOperator".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: IstioOperatorProps = {}): any {
    return {
      ...IstioOperator.GVK,
      ...toJson_IstioOperatorProps(props),
    };
  }

  /**
   * Defines a "IstioOperator" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: IstioOperatorProps = {}) {
    super(scope, id, {
      ...IstioOperator.GVK,
      ...props,
    });
  }

  /**
   * Renders the object to Kubernetes JSON.
   */
  public toJson(): any {
    const resolved = super.toJson();

    return {
      ...IstioOperator.GVK,
      ...toJson_IstioOperatorProps(resolved),
    };
  }
}

/**
 * @schema IstioOperator
 */
export interface IstioOperatorProps {
  /**
   * @schema IstioOperator#metadata
   */
  readonly metadata?: ApiObjectMetadata;

}

/**
 * Converts an object of type 'IstioOperatorProps' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_IstioOperatorProps(obj: IstioOperatorProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'metadata': obj.metadata,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */
