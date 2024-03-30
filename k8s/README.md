# Resources

This uses [cdk8s](https://cdk8s.io) to generate manifests for resources.

## cdk8s

### Updating a Helm chart version

Because we import the Helm charts directly into cdk8s (therefore
generating) TypeScript code, we are pinned to the version that is generated.

To update these, update the `./cdk8s.yaml` chart version and run:

```bash
task cdk8s:import
```

If new versions of CRDs are produced, you will also need to export these
(once installed into the cluster) using:

```bash
task cdk8s:export-crds
```

Then import them back into cdk8s:

```bash
task cdk8s:import-crds
```
