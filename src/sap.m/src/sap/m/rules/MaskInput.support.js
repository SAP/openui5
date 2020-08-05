/*!
 * ${copyright}
 */
/**
 * Defines support rules of the MaskInput control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"], function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, Bindings, Consistency, FioriGuidelines, Functionality, Usability, DataModel, Modularization, Usage, Other
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 *  Checks if the rules are valid
	 */
	var oMaskUsesValidRules = {
		id: "maskUsesValidRules",
		audiences: [Audiences.Control],
		categories: [Categories.Usage],
		enabled: true,
		minversion: "1.34",
		title: "MaskInput: Check the rules",
		description: "Checks if the rules are valid",
		resolution: "Define valid rules",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: MaskInput",
			href: "https://experience.sap.com/fiori-design-web/generic-mask-input/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.MaskInput")
				.forEach(function(oElement) {
					var sValidationErrorMsg = oElement._validateDependencies();

					if (sValidationErrorMsg) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "MaskInput '" + sElementName + "' (" + sElementId + "): " + sValidationErrorMsg,
							context: {
								id: sElementId
							}
						});
					}
				}
				);
		}
	};

	return [
		oMaskUsesValidRules
	];

}, true);