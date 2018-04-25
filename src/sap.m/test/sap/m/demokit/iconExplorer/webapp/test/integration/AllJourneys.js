sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Arrangement",
	"sap/ui/demo/iconexplorer/localService/mockserver",
	"sap/ui/test/opaQunit",
	"./HomeJourney",
	"./NavigationJourney",
	"./OverviewJourney",
	"./PreviewJourney",
	"./NotFoundJourney",
	"./FavoriteJourney",
	"./SearchJourney"
	], function (Opa5, Arrangement, mockserver) {
	"use strict";

	mockserver.init();

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		viewNamespace: "sap.ui.demo.iconexplorer.view."
	});
});