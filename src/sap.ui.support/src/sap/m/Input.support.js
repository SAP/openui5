/*!
 * ${copyright}
 */
/**
 * Defines support rules of the List, Table and Tree controls of sap.m library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * Input field needs to have a label association
	 */
	var oInputNeedsLabelRule = {
		id: "inputNeedsLabel",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
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

			var aInputIds = oScope.getElementsByClassName("sap.m.Input")
				.map(function(oInput) {
					return oInput.getId();
				});

			oScope.getElementsByClassName("sap.m.Label")
				.forEach(function (oLabel){
					var sLabelFor = oLabel.getLabelFor();
					if (aInputIds.indexOf(sLabelFor) > -1) {
						var iIndex = aInputIds.indexOf(sLabelFor);
						aInputIds.splice(iIndex, 1);
					}
				});

			if (aInputIds.length > 0) {
				aInputIds.forEach(function(sInputId) {
					issueManager.addIssue({
						severity: Severity.Medium,
						details: "Input field" + " (" + sInputId + ") is missing a label.",
						context: {
							id: sInputId
						}
					});
				});
			}
		}
	};

	return [oInputNeedsLabelRule];

}, true);
