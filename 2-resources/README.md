# Resources

This uses [cdk8s](https://cdk8s.io) to generate manifests for resources.

## Layout

All of the typescript resources live under `src/...`

- `charts/` - All `Chart` definitions as used by cdk8s to generate a distinct
  manifest file (Not to be confused with Helm charts). These are essentially
  the abstractions around underlying resources (Kubernetes deployments,
  custom resources, Helm charts, etc.)

- `charts/core` - Core resources that are required to bootstrap the Kubernetes
  cluster into a usable state (CertManager, Istio, etc.)

- `charts/ext` - Services that would generally live outside the cluster, but are
  deployed into the cluster as a convenience measure (Gitea, Woodpecker).

- `charts/services` - Each individual service that can be deployed as needed.

- `stacks/` - The entrypoints for `cdk8s`, which will build all appropriate
  manifests.

## TODO:

- `05-cluster-certs` - Use `SealedSecrt` for the cert key

- More Gitea config:

  ```bash
  helm show values gitea-charts/gitea --version 10.1.3
  ```

```

### Core

- argocd
- gitea
- woodpecker

### Observability

- kiali
- kube-prometheus-stack
- kubernetes-dashboard
```
