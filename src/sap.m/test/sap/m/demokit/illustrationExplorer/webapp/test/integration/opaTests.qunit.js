sap.ui.define([
    "sap/ui/test/Opa5",
    "./arrangements/Startup",
    "./NavigationJourney"
], (Opa5, Startup) => {
    "use strict";

    document.cookie = "dk_approval_requested=1";

    Opa5.extendConfig({
        arrangements: new Startup(),
        viewNamespace: "sap.ui.demo.illustrationExplorer.view.",
        autoWait: true
    });
});