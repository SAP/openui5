/*!
 * ${copyright}
 */
/**
 * Defines support rules of the StepInput control of sap.m library.
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
	 * Checks, if the value of the step property
	 * does not contain more digigs after the decimal point
	 * that the value of the displayValuePrecision
	 */
	var oStepInputStepProperty = {
		id: "stepInputStepProperty",
		audiences: [Audiences.Control],
		categories: [Categories.Consistency],
		enabled: true,
		minversion: "1.46",
		title: "StepInput: Step property precision is not greater than displayValuePrecision",
		description: "The value of the step property should not contain more digits after the decimal point than what is set to the displayValuePrecision property, as it may lead to an increase/decrease that is not visible",
		resolution: "Set step property to a value with less precision than the displayValuePrecision",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: StepInput",
			href: "https://experience.sap.com/fiori-design-web/step-input/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.StepInput")
				.forEach(function(oElement) {
					var sStep = oElement.getStep().toString();
					var iPrecision = sStep.indexOf(".") >= 0 ? sStep.split(".")[1].length : 0;
					if (iPrecision > oElement.getDisplayValuePrecision()) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "StepInput '" + sElementName + "' (" + sElementId + ")'s step precision is greater than displayValuePrecision",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	var oStepInputFieldWidth = {
		id: "stepInputFieldWidth",
		audiences: [Audiences.Control],
		categories: [Categories.Consistency],
		enabled: true,
		minversion: "1.46",
		title: "StepInput: The fieldWidth property takes effect only if the description property is also set.",
		description: "This property takes effect only if the description property is also set.",
		resolution: "Set fieldWidth when you want to control the availbale width for the description",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: StepInput",
			href: "https://experience.sap.com/fiori-design-web/step-input/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.StepInput")
				.forEach(function(oElement) {
					if (oElement.getFieldWidth() !== oElement.getMetadata().getAllProperties().fieldWidth.defaultValue && !oElement.getDescription()) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "StepInput '" + sElementName + "' (" + sElementId + ") fieldWidth property is set and description is not",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	return [
		oStepInputStepProperty,
		oStepInputFieldWidth
	];

}, true);