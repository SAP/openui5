sap.ui.define([
    "sap/ui/test/Opa5",
    "./arrangements/Startup",
    "./HomeJourney",
	"./OverviewJourney"
], function (Opa5, Startup) {
    "use strict";

    Opa5.extendConfig({
        arrangements: new Startup(),
        viewNamespace: "sap.ui.demo.iconexplorer.view.",
        autoWait: true
    });
});