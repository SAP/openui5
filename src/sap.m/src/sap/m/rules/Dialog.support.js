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
		id: "dialogAriaLabelledBy",
		audiences: [Audiences.Application],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "*",
		title: "Dialog: The content will not be read if there is no focusable control inside it unless ariaLabelledBy is set",
		description: "When the Dialog is opened and ariaLabelledBy is not set, if there are focusable controls the first focusable control will be read, if there are no focusable controls in the content, JAWS will read only the footer and header of the Dialog ",
		resolution: "Add ariaLabelledBy for the Dialog, with value - IDs of the non focusable control(s) which are inside the Dialog content",
		resolutionurls: [{
			text: "Dialog controls: Accessibility",
			href: "https://ui5.sap.com/#/topic/5709e73d51f2401a9a5a89d8f5479132"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Dialog")
				.forEach(function(oElement) {
					if (!oElement.getAssociation("ariaLabelledBy")) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Dialog '" + sElementName + "' (" + sElementId + ") has no ariaLabelledBy association set",
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