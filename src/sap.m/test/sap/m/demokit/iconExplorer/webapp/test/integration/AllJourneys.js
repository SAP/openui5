sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"sap/ui/demo/iconexplorer/localService/mockserver",
	"sap/ui/test/opaQunit",
	"./HomeJourney",
	"./NavigationJourney",
	"./OverviewJourney",
	"./PreviewJourney",
	"./NotFoundJourney",
	"./FavoriteJourney",
	"./SearchJourney"
], function (Opa5, Startup, mockserver) {
	"use strict";

	mockserver.init();

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.iconexplorer.view.",
		autoWait: true
	});
});
