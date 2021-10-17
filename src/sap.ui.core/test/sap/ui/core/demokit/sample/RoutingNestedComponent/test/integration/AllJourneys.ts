import Opa5 from "sap/ui/test/Opa5";
import Startup from "./arrangements/Startup";
Opa5.extendConfig({
    arrangements: new Startup(),
    viewNamespace: "sap.ui.core.sample.RoutingNestedComponent.view.",
    autoWait: true
});