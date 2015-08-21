/*!
 * ${copyright}
 */
sap.ui.require(["sap/ui/test/Opa5", "sap/ui/test/opaQunit"], function (Opa5) {
	"use strict";
	module("sap.ui.core.sample.ViewTemplate.scenario");

	if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version === 9) {
		// Bug Fix: IE9 >>> http://bugs.jquery.com/ticket/13378
		return;
	}

	opaTest("Find view elements", function (Given, When, Then) {
		function onLoad() {
			Then.waitFor({
				controlType: "sap.m.CheckBox",
				matchers : new sap.ui.test.matchers.Properties({text : "bindTexts"}),
				success : function (aControls) {
					// tap on the "bindTexts" check box and trigger a reload w/ bindTexts
					aControls[0].ontap();
				},
				errorMessage : "'bindTexts' check box not found"
			});

			// check for existing controls
			[
				{controlType: "sap.ui.core.Title", text: "HeaderInfo"},
				{controlType: "sap.m.Text", text: "[Type Name] Business Partner"},
				{controlType: "sap.m.Text", text: "[Name] SAPAG"},
				{controlType: "sap.ui.core.Title", text: "Identification"},
				{controlType: "sap.m.Label", text: "ID"},
				{controlType: "sap.m.Text", text: "0100000000"},
				{controlType: "sap.m.Label", text: "Address"},
				{controlType: "sap.m.Label", text: "Link to"},
				{controlType: "sap.m.Link", text: "Google Maps"},
				{controlType: "sap.ui.core.Title", text: "Facets"},
				{controlType: "sap.ui.core.Title", text: "Contacts"},
				{controlType: "sap.ui.core.Title", text: "Products"},
				{controlType: "sap.m.Text", text: "Email"},
				{controlType: "sap.m.Text", text: "Category"}

			].forEach(function (oFixture) {
				Then.waitFor({
					controlType: oFixture.controlType,
					matchers : new sap.ui.test.matchers.Properties({ text: oFixture.text}),
					success : function () {
						Opa5.assert.ok(true, "found: " + oFixture.controlType + " with text: " +
							oFixture.text);
					},
					errorMessage : "not found: " + oFixture.controlType + " with text: " +
						oFixture.text
				});
			});

			// check for console log errors/warnings
			Then.waitFor({
				id: /selectInstance/,
				success : function (oControl) {
					// check no warnings and errors
					Opa5.getWindow().jQuery.sap.log.getLog().forEach(function (oLog) {
						var sComponent = oLog.component || "";

						if (( sComponent === "sap.ui.core.util.XMLPreprocessor"
								|| sComponent === "sap.ui.model.odata.AnnotationHelper"
								|| sComponent === "sap.ui.model.odata.ODataMetaModel"
								|| sComponent.indexOf("sap.ui.model.odata.type.") === 0)
								&& oLog.level <= jQuery.sap.log.Level.WARNING) {
							Opa5.assert.ok(false, "Warning or Error found: " + sComponent
								+ " Level: " + oLog.level + " Message: " + oLog.message );
						}
					});
				},
				errorMessage : "Instance selector not found"
			});

			Then.iTeardownMyAppFrame();
		}

		Given.iStartMyAppInAFrame("../../common/index.html?component=ViewTemplate.scenario");

		// wait for application to load before any interaction
		Then.waitFor({
			controlType: "sap.ui.core.Title",
			success : onLoad,
			errorMessage : "No title found, application did not load?!"
		});
	});
});
