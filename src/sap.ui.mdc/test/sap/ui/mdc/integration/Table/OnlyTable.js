// Music AllJourneys
sap.ui.requireSync("sap.ui.qunit.qunit-css");
sap.ui.requireSync("sap.ui.thirdparty.qunit");
sap.ui.requireSync("sap.ui.qunit.qunit-junit");
sap.ui.requireSync("sap.ui.test.opaQunit");
sap.ui.requireSync("sap.ui.test.Opa5");

sap.ui.requireSync("sap.ui.mdc.integrations.pages.Common");
sap.ui.requireSync("sap.ui.mdc.integrations.pages.Main");

sap.ui.test.Opa5.extendConfig({
	arrangements: new sap.ui.mdc.integrations.pages.Common(),
	viewNamespace: "",
	autoWait: true
});


sap.ui.requireSync("sap.ui.mdc.integrations.Table.ResponsiveTableMainJourney");
sap.ui.requireSync("sap.ui.mdc.integrations.Table.ResponsiveTableViewSettingsJourney");

sap.ui.requireSync("sap.ui.mdc.integrations.Table.GridTableMainJourney");
sap.ui.requireSync("sap.ui.mdc.integrations.Table.GridTableViewSettingsJourney");
