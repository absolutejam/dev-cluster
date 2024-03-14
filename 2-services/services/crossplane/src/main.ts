import { App } from "cdk8s";
import { loadYamlConfig } from "@crashloopbackoff/shared";
import { CrossplaneChart } from "./charts";

//------------------------------------------------------------------------------

const config = loadYamlConfig("../config.yaml");
const {} = config;

//------------------------------------------------------------------------------

const app = new App();

new CrossplaneChart(app, "inf-crossplane", {
  createNamespace: true,
  namespace: "inf-crossplane",
  disableResourceNameHashes: true,
});

app.synth();
