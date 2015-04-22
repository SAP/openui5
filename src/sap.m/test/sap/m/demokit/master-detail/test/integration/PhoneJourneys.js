jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");
jQuery.sap.require("sap.ui.test.Opa5");

jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.pages.Common");
jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.pages.App");
jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.pages.Browser");
jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.pages.Master");
jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.pages.Detail");
jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.pages.NotFound");

sap.ui.test.Opa5.extendConfig({
	arrangements: new sap.ui.demo.masterdetail.test.integration.pages.Common(),
	viewNamespace: "sap.ui.demo.masterdetail.view."
});

jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.NavigationJourneyPhone");
jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.NotFoundJourneyPhone");
jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.BusyJourneyPhone");
