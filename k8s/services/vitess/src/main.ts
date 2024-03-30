import { App } from "cdk8s";
import { VitessChart } from "./charts/vitess";
import { loadYamlConfig } from "@crashloopbackoff/shared";

//------------------------------------------------------------------------------

const config = loadYamlConfig(`${__dirname}/../config.yaml`);
const {} = config;

//------------------------------------------------------------------------------

const app = new App();

new VitessChart(app, `inf-vitess`, {
  namespace: `inf-vitess`,
  createNamespace: true,
});

app.synth();
