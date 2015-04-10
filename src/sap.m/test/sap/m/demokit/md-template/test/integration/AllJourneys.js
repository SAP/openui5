jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");
jQuery.sap.require("sap.ui.test.Opa5");

jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.pages.Common");
jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.pages.App");
jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.pages.Browser");
jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.pages.Master");
jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.pages.Detail");
jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.pages.NotFound");

sap.ui.test.Opa5.extendConfig({
	arrangements: new sap.ui.demo.mdtemplate.test.integration.pages.Common(),
	viewNamespace: "sap.ui.demo.mdtemplate.view."
});

jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.MasterJourney");
jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.NavigationJourney");
//TODO Following test does not work on Firefox or IE. There seems to be a problem with OPA's back and forward in history simulation
//Also, the URL parameter 'sap-ui-xx-fakeOS=ios' does not seem to work in this case, the screen still shows the app in desktop mode.
if (sap.ui.Device.browser.chrome || sap.ui.Device.browser.phantomJS) {
	jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.NavigationJourneyPhone");
	jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.NotFoundJourney");
	jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.BusyJourney");
	jQuery.sap.require("sap.ui.demo.mdtemplate.test.integration.BusyJourneyPhone");
}
