sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/basicTemplate/test/integration/arrangements/Arrangement",
	"sap/ui/demo/basicTemplate/test/integration/navigationJourney"
], function (Opa5, Arrangement) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		viewNamespace: "sap.ui.demo.basicTemplate.view.",
		autoWait: true
	});
});
