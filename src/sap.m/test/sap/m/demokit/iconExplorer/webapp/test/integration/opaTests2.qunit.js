sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/iconexplorer/test/integration/arrangements/Startup",
	"sap/ui/demo/iconexplorer/localService/mockserver",
	"sap/ui/test/opaQunit",
	"sap/ui/demo/iconexplorer/test/integration/PreviewJourney",
	"sap/ui/demo/iconexplorer/test/integration/NotFoundJourney",
	"sap/ui/demo/iconexplorer/test/integration/FavoriteJourney",
	"sap/ui/demo/iconexplorer/test/integration/SearchJourney"
], function (Opa5, Startup, mockserver) {
	"use strict";
	mockserver.init();

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.iconexplorer.view.",
		autoWait: true
	});
});
