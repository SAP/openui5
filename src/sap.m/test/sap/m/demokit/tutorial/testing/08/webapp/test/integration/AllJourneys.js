jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");
jQuery.sap.require("sap.ui.test.Opa5");

jQuery.sap.require("sap.ui.demo.bulletinboard.test.integration.pages.Common");
jQuery.sap.require("sap.ui.demo.bulletinboard.test.integration.pages.Browser");
jQuery.sap.require("sap.ui.demo.bulletinboard.test.integration.pages.Worklist");
jQuery.sap.require("sap.ui.demo.bulletinboard.test.integration.pages.Object");

sap.ui.test.Opa5.extendConfig({
	arrangements: new sap.ui.demo.bulletinboard.test.integration.pages.Common(),
	viewNamespace: "sap.ui.demo.bulletinboard.view."
});

// Start the tests
jQuery.sap.require("sap.ui.demo.bulletinboard.test.integration.WorklistJourney");
jQuery.sap.require("sap.ui.demo.bulletinboard.test.integration.ObjectJourney");
