## TODO:

- Split `core` into multiple different projects

- `istio` - `ProxyConfig` is not ready immediately after deploying.

- `seled-secrets` - Implement post-render step

- `sealed-secrets` - BYOcert

  https://github.com/bitnami-labs/sealed-secrets/blob/main/docs/bring-your-own-certificates.md

- General - Cross-reference more data (ie. istio gateway name)

- General - Move away from config file and use env to decouple in pipelines(?)

- `gitea` - More config(?):

  ```bash
  helm show values gitea-charts/gitea --version 10.1.3
  ```

- `woodpecker` - Inject CA cert into the `plugin-git` image (Build locally?)

### Core

- [ ] argocd
- [x] gitea
- [x] woodpecker

### Observability

- [ ] kiali
- [ ] kube-prometheus-stack
- [ ] kubernetes-dashboard

### Misc

- [ ] Some kind if o
