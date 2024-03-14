// generated by cdk8s
import { Helm, HelmProps } from 'cdk8s';
import { Construct } from 'constructs';

export interface KialioperatorProps {
  readonly namespace?: string;
  readonly releaseName?: string;
  readonly helmExecutable?: string;
  readonly helmFlags?: string[];
  readonly values?: { [key: string]: any };
}

export class Kialioperator extends Construct {
  public constructor(scope: Construct, id: string, props: KialioperatorProps = {}) {
    super(scope, id);
    let updatedProps = {};

    if (props.values) {
      const { additionalValues, ...valuesWithoutAdditionalValues } = props.values;
      updatedProps = {
        ...props,
        values: {
          ...this.flattenAdditionalValues(valuesWithoutAdditionalValues),
          ...additionalValues,
        },
      };
    }

    const finalProps: HelmProps = {
      chart: 'kiali-operator',
      repo: 'https://kiali.org/helm-charts',
      version: '1.81.0',
      ...(Object.keys(updatedProps).length !== 0 ? updatedProps : props),
    };

    new Helm(this, 'Helm', finalProps);
  }

  private flattenAdditionalValues(props: { [key: string]: any }): { [key: string]: any } {
    for (let prop in props) {
      if (Array.isArray(props[prop])) {
        props[prop].map((item: any) => {
          if (typeof item === 'object' && prop !== 'additionalValues') {
            return this.flattenAdditionalValues(item);
          }
          return item;
        });
      }
      else if (typeof props[prop] === 'object' && prop !== 'additionalValues') {
        props[prop] = this.flattenAdditionalValues(props[prop]);
      }
    }

    const { additionalValues, ...valuesWithoutAdditionalValues } = props;

    return {
      ...valuesWithoutAdditionalValues,
      ...additionalValues,
    };
  }
}

