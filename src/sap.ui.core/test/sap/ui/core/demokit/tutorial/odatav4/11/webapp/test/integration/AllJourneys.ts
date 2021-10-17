import Opa5 from "sap/ui/test/Opa5";
import Startup from "sap/ui/core/tutorial/odatav4/test/integration/arrangements/Startup";
Opa5.extendConfig({
    arrangements: new Startup(),
    viewNamespace: "sap.ui.core.tutorial.odatav4.view.",
    autoWait: true
});