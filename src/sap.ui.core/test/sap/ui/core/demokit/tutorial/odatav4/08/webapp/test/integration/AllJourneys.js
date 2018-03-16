sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/core/tutorial/odatav4/test/integration/arrangements/Arrangement",
	"sap/ui/core/tutorial/odatav4/test/integration/TutorialJourney"
], function (Opa5, Arrangement) {
	"use strict";

	Opa5.extendConfig({
		arrangements : new Arrangement(),
		viewNamespace : "sap.ui.core.tutorial.odatav4.view.",
		autoWait : true,
		timeout : 15,
		debugTimeout : 15
	});
});