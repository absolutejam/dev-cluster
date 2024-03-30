export type CoreResourcesProps =
  | {
      createNamespace: true;
      namespace: string;
    }
  | { createNamespace?: false };
