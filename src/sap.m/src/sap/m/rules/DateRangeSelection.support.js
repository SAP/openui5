/*!
 * ${copyright}
 */
/**
 * Defines support rules of the DateRangeSelection control of sap.m library.
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
	 * Checks, if a either value or dateValue/secondDateValue properties are bound.
	 */
	var oExclusiveValueDateValueBindingRule = {
		id: "drsBindingRule",
		audiences: [Audiences.Control],
		categories: [Categories.Bindings],
		enabled: true,
		minversion: "1.28",
		title: "DateRangeSelection: Either value or dateValue/secondDateValue properties can be bound",
		description: "Either value or dateValue/secondDateValue properties can be bound",
		resolution: "Choose one option for binding - either value or dateValue/secondDateValue. They serve the same purpose",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: DateRangeSelection",
			href: "https://experience.sap.com/fiori-design-web/date-range-selection/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.DateRangeSelection")
				.forEach(function(oElement) {
					if (oElement.getBinding("value") && (oElement.getBinding("dateValue") || oElement.getBinding("secondDateValue"))) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "DateRangeSelection '" + sElementName + "' (" + sElementId + ") has value and dataValue/secondDateValue properties bound",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	/**
	 * Checks, if valueFormat property is set.
	 */
	var oDoNotSupportValueFormatRule = {
		id: "drsValueFormatRule",
		audiences: [Audiences.Control],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.28",
		title: "DateRangeSelection: valueFormat property is not supported",
		description: "valueFormat property is not supported.",
		resolution: "Do not use the valueFormat property.",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: DateRangeSelection",
			href: "https://experience.sap.com/fiori-design-web/date-range-selection/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.DateRangeSelection")
				.forEach(function(oElement) {
					if (oElement.getValueFormat()) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "DateRangeSelection '" + sElementName + "' (" + sElementId + ") has valueFormat property set.",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	return [
		oExclusiveValueDateValueBindingRule,
		oDoNotSupportValueFormatRule
	];

}, true);