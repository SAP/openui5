sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"sap/ui/test/opaQunit",
	"./DownloadJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.cardExplorer.view."
	});
});
