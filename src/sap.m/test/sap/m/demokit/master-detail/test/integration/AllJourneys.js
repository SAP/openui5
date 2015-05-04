sap.ui.define([
	"sap/ui/base/Object"
], function (Ui5Object) {
	return Ui5Object.extend("sap.ui.demo.masterdetail.test.integration.AllJourneys", {
		start: function (oConfig) {
			oConfig = oConfig || {};

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
				arrangements: new sap.ui.demo.masterdetail.test.integration.pages.Common(oConfig),
				viewNamespace: "sap.ui.demo.masterdetail.view."
			});

			jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.MasterJourney");
			jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.NavigationJourney");
			jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.NotFoundJourney");
			jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.BusyJourney");

			if (oConfig.isFLP) {
				jQuery.sap.require("sap.ui.demo.masterdetail.test.integration.FLPIntegrationJourney");
			}
		}
	});
});
