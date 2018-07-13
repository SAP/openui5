/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Dialog control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
	"use strict";

	//shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	var oDialogRuleForJaws = {
		id: "dialogAriaDescribedBy",
		audiences: [Audiences.Application],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "*",
		title: "Dialog: The content will not be read unless ariaDescribedBy is set",
		description: "When the Dialog is opened and ariaDescribedBy is not set, JAWS will read only the title of the Dialog and the focused element",
		resolution: "Add ariaDescribedBy for the Dialog, with value - IDs of the controls which are inside the Dialog content",
		resolutionurls: [{
			text: "API Referance: sap.m.Dialog #ariaDescribedBy",
			href: "https://ui5.sap.com/#/api/sap.m.Dialog/associations"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Dialog")
				.forEach(function(oElement) {
					if (!oElement.getAssociation("ariaDescribedBy")) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "Dialog '" + sElementName + "' (" + sElementId + ") has no ariaDescribedBy association set",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	return [oDialogRuleForJaws];

}, true);