/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils",
		"sap/ui/test/matchers/Properties"
	], function (Any, Opa5, opaTest, TestUtils, Properties) {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

		QUnit.module("sap.ui.core.sample.ViewTemplate.scenario", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		opaTest("Find view elements", function (Given, When, Then) {
			function onLoad() {
				Then.waitFor({
					controlType : "sap.m.CheckBox",
					matchers : new Properties({text : "bindTexts"}),
					success : function (aControls) {
						// tap on the "bindTexts" check box and trigger a reload w/ bindTexts
						aControls[0].$().tap();
					},
					errorMessage : "'bindTexts' check box not found"
				});

				// check for existing controls
				[
					{controlType : "sap.ui.core.Title", text : "HeaderInfo"},
					{controlType : "sap.m.Text", text : "[Type Name] Business Partner"},
					{controlType : "sap.m.Text", text : "[Name] SAPSE"},
					{controlType : "sap.ui.core.Title", text : "Identification"},
					{controlType : "sap.m.Label", text : "ID"},
					{controlType : "sap.m.Text", text : "0100000000"},
					{controlType : "sap.m.Label", text : "Address"},
					{controlType : "sap.m.Label", text : "Link to"},
					{controlType : "sap.m.Link", text : "Google Maps"},
					{controlType : "sap.m.Panel", headerText : "Facets"},
					{controlType : "sap.m.Table", headerText : "Contacts"},
					{controlType : "sap.m.Table", headerText : "Products"},
					{controlType : "sap.m.Text", text : "Email"},
					{controlType : "sap.m.Text", text : "Category"}
				].forEach(function (oFixture) {
					Then.waitFor({
						controlType : oFixture.controlType,
						matchers : new Properties(oFixture.text
							? {text : oFixture.text}
							: {headerText : oFixture.headerText}),
						success : function () {
							Opa5.assert.ok(true, "found: " + oFixture.controlType + " with text: " +
								oFixture.text);
						},
						errorMessage : "not found: " + oFixture.controlType + " with text: " +
							oFixture.text
					});
				});
				Then.waitFor({
					id : /selectInstance/,
					success : function (aSelectInstances) {
						Opa5.assert.ok(aSelectInstances.length === 1, "Instance selector found");
					},
					errorMessage : "Instance selector not found"
				});
				Then.onAnyPage.analyzeSupportAssistant();

				Then.waitFor({
					id : /selectEntitySet/,
					success : function (aControls) {
						// reactivate support assistant
						When.onAnyPage.applySupportAssistant();
						aControls[0].$().tap();
						Opa5.assert.ok(true, "Open 'selectEntitySet'");
					},
					errorMessage : "'selectEntitySet' selector not found"
				});
				Then.waitFor({
					id : /selectEntitySet-1/,
					success : function (aControls) {
						aControls[0].$().tap();
						Opa5.assert.ok(true, "Select 2nd entry from 'selectEntitySet'");
					},
					errorMessage : "2nd entry from 'selectEntitySet' selector not found"
				});
				Then.waitFor({
					controlType : "sap.m.Table",
					matchers : new Properties({ headerText : "Product Dimensions"}),
					success : function () {
						Opa5.assert.ok(true, "found: sap.m.Table with headerText: Product Dimensions");
					},
					errorMessage : "sap.m.Table with headerText: Product Dimensions"
				});

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();

				Then.iTeardownMyUIComponent();
			}

			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.ViewTemplate.scenario"
				}
			});

			// wait for application to load before any interaction
			Then.waitFor({
				controlType : "sap.ui.core.Title",
				success : onLoad,
				errorMessage : "No title found, application did not load?!"
			});
		});

		QUnit.start();
	});
});
