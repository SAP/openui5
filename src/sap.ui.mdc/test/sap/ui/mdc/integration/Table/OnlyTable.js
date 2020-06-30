// Music AllJourneys
jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");
jQuery.sap.require("sap.ui.test.Opa5");

jQuery.sap.require("sap.ui.mdc.integrations.pages.Common");
jQuery.sap.require("sap.ui.mdc.integrations.pages.Main");

sap.ui.test.Opa5.extendConfig({
	arrangements: new sap.ui.mdc.integrations.pages.Common(),
	viewNamespace: "",
	autoWait: true
});


jQuery.sap.require("sap.ui.mdc.integrations.Table.ResponsiveTableMainJourney");
jQuery.sap.require("sap.ui.mdc.integrations.Table.ResponsiveTableViewSettingsJourney");

jQuery.sap.require("sap.ui.mdc.integrations.Table.GridTableMainJourney");
jQuery.sap.require("sap.ui.mdc.integrations.Table.GridTableViewSettingsJourney");
