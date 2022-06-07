sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"sap/ui/test/opaQunit",
	"./DownloadJourney"
	// "./EditJourney",
	// "./NavigationJourney"
], function (Opa5, Startup) {
	"use strict";

	// set the cookie that states the user already set cookie preferences,
	// to prevent the cookie settings dialog interfere the test
	document.cookie = "dk_approval_requested=1";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.cardExplorer.view.",
		autoWait: true
	});
});
