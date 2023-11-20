sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/core/tutorial/odatav4/test/integration/arrangements/Startup",
	"sap/ui/core/tutorial/odatav4/test/integration/TutorialJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements : new Startup(),
		viewNamespace : "sap.ui.core.tutorial.odatav4.view.",
		autoWait : true
	});
});
