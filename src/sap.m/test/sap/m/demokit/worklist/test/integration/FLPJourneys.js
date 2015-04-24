jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");
jQuery.sap.require("sap.ui.test.Opa5");

jQuery.sap.require("sap.ui.demo.worklist.test.integration.pages.ShareOptions");

sap.ui.test.Opa5.extendConfig({
	arrangements: new sap.ui.demo.worklist.test.integration.pages.Common({
		isFLP: true
	}),
	viewNamespace: "sap.ui.demo.worklist.view."
});

// Start the tests
jQuery.sap.require("sap.ui.demo.worklist.test.integration.FLPIntegrationJourney");
