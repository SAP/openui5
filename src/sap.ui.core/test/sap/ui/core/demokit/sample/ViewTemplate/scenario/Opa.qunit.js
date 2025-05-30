/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/Properties"
], function (Localization, Any, Opa5, opaTest, Properties) {
	"use strict";
	var sDefaultLanguage = Localization.getLanguage();

	QUnit.module("sap.ui.core.sample.ViewTemplate.scenario", {
		before : function () {
			Localization.setLanguage("en-US");
		},
		after : function () {
			Localization.setLanguage(sDefaultLanguage);
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
						Opa5.assert.ok(true, "found: " + oFixture.controlType + " with text: "
							+ oFixture.text);
					},
					errorMessage : "not found: " + oFixture.controlType + " with text: "
						+ oFixture.text
				});
			});
			Then.waitFor({
				id : /selectInstance/,
				success : function (aSelectInstances) {
					Opa5.assert.ok(aSelectInstances.length === 1, "Instance selector found");
				},
				errorMessage : "Instance selector not found"
			});

			Then.waitFor({
				id : /selectEntitySet/,
				actions : function (oSelect) {
					oSelect.setSelectedKey("ProductSet");
					oSelect.fireEvent("change");
				},
				errorMessage : "'selectEntitySet' selector not found"
			});
			Then.waitFor({
				controlType : "sap.m.Table",
				matchers : new Properties({headerText : "Product Dimensions"}),
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
});
