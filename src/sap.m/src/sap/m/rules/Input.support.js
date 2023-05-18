/*!
 * ${copyright}
 */
/**
 * Defines support rules of the List, Table and Tree controls of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	function isInsideFormOrTable(oControl) {
		var oParent = oControl.getParent();

		if (!oParent) {
			return false;
		}

		return oParent.isA("sap.ui.layout.form.SimpleForm") || oParent.isA("sap.m.Table") || isInsideFormOrTable(oParent);
	}

	function isLabelled(oInput, aLabels) {
		var bHasLabelForInput = aLabels.some(function (oLabel) {
			return oLabel.getLabelFor() === oInput.getId();
		});

		if (bHasLabelForInput) {
			return true;
		}

		// form and table manage the labelling automatically
		return isInsideFormOrTable(oInput);
	}

	/**
	 * Input field needs to have a label association
	 */
	var oInputNeedsLabelRule = {
		id: "inputNeedsLabel",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.28",
		title: "Input field: Missing label",
		description:"An input field needs a label",
		resolution: "Define a sap.m.Label for the input field in the xml view and set the labelFor property to this input field Id.",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: Input field",
			href:"https://experience.sap.com/fiori-design-web/input-field/#guidelines"
		}],
		check: function (issueManager, oCoreFacade, oScope) {
			var aLabels = oScope.getElementsByClassName("sap.m.Label");

			oScope.getElementsByClassName("sap.m.Input")
				.forEach(function(oInput) {
					if (!isLabelled(oInput, aLabels)) {
						issueManager.addIssue({
							severity: Severity.Medium,
							details: "Input field" + " (" + oInput.getId() + ") is missing a label.",
							context: {
								id: oInput.getId()
							}
						});
					}
				});
		}
	};

	return [oInputNeedsLabelRule];

}, true);