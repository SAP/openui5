sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/iconexplorer/test/integration/arrangements/Startup",
	"sap/ui/demo/iconexplorer/localService/mockserver",
	"sap/ui/test/opaQunit",
	"sap/ui/demo/iconexplorer/test/integration/HomeJourney",
	"sap/ui/demo/iconexplorer/test/integration/NavigationJourney",
	"sap/ui/demo/iconexplorer/test/integration/OverviewJourney"
], function (Opa5, Startup, mockserver) {
	"use strict";

	// set the cookie that states the user already set cookie preferences,
	// to prevent the cookie settings dialog interfere the test
	document.cookie = "dk_approval_requested=1";

	mockserver.init();

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.iconexplorer.view.",
		autoWait: true
	});
});
