sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/documentation/sdk/test/arrangement/Arrangement",
	// QUnit additions
	"sap/ui/qunit/qunit-css",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	// Page Objects
	"sap/ui/documentation/sdk/test/pageobjects/App",
	"sap/ui/documentation/sdk/test/pageobjects/Welcome",
	"sap/ui/documentation/sdk/test/pageobjects/TopicMaster",
	"sap/ui/documentation/sdk/test/pageobjects/ApiMaster",
	"sap/ui/documentation/sdk/test/pageobjects/ControlsMaster",
	"sap/ui/documentation/sdk/test/pageobjects/DemoApps",
	"sap/ui/documentation/sdk/test/pageobjects/Tools",
	"sap/ui/documentation/sdk/test/pageobjects/ApiDetail",
	"sap/ui/documentation/sdk/test/pageobjects/SubApiDetail",
	"sap/ui/documentation/sdk/test/pageobjects/Entity",
	"sap/ui/documentation/sdk/test/pageobjects/Sample",
	"sap/ui/documentation/sdk/test/pageobjects/Code"
], function (Opa5, Arrangement) {
	"use strict";

	Opa5.extendConfig({
		arrangements : new Arrangement(),
		actions: new Opa5({
			iLookAtTheScreen : function () {
				return this;
			}
		}),
		viewNamespace: "sap.ui.documentation.sdk.view.",
		autoWait: true
	});
});

