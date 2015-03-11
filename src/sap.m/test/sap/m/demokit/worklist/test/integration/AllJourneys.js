sap.ui.define([], function () {
	return {
		start: function (oConfig) {
			oConfig = oConfig || {};

			jQuery.sap.require("sap.ui.qunit.qunit-css");
			jQuery.sap.require("sap.ui.thirdparty.qunit");
			jQuery.sap.require("sap.ui.qunit.qunit-junit");
			jQuery.sap.require("sap.ui.test.opaQunit");
			jQuery.sap.require("sap.ui.test.Opa5");

			jQuery.sap.require("sap.ui.demo.worklist.test.integration.pages.Common");
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.pages.Worklist");
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.pages.Object");
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.pages.NotFound");
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.pages.Browser");
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.pages.App");

			sap.ui.test.Opa5.extendConfig({
				arrangements: new sap.ui.demo.worklist.test.integration.pages.Common(oConfig),
				viewNamespace: "sap.ui.demo.worklist.view."
			});

			// Start the tests
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.WorklistJourney");
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.ObjectJourney");
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.NavigationJourney");
			jQuery.sap.require("sap.ui.demo.worklist.test.integration.NotFoundJourney");
		}
	};
}, /* bExport= */ true);
