/*!
 * ${copyright}
 */
/**
 * Defines support rules of the DatePicker control of sap.m library.
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
	 * Checks, if a only one of the value or dateValue properties is bound.
	 */
	var oExclusiveValueDateValueBindingRule = {
		id: "exclusiveValueDateValueBindingRule",
		audiences: [Audiences.Control],
		categories: [Categories.Bindings],
		enabled: true,
		minversion: "1.28",
		title: "DatePicker: Only one of the value or dateValue properties can be bound",
		description: "Only one of the value or dateValue properties can be bound",
		resolution: "Choose and bind one of the properties value or dateValue. They both serve the same purpose",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: DatePicker",
			href: "https://experience.sap.com/fiori-design-web/date-picker/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.DatePicker")
				.forEach(function(oElement) {
					if (oElement.getBinding("value") && oElement.getBinding("dateValue")) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "DatePicker '" + sElementName + "' (" + sElementId + ") has both value and dataValue properties bound.",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	/**
	 * Checks, if there is a constraint for the displayFormat, when type sap.ui.model.odata.type.DateTime is used for value binding.
	 */
	var oDateTimeBindingConstraintRule = {
		id: "dateTimeBindingConstraintRule",
		audiences: [Audiences.Control],
		categories: [Categories.Bindings],
		enabled: true,
		minversion: "1.28",
		title: "DatePicker: sap.ui.model.odata.type.DateTime value binding should use displayFormat:'Date' constraint",
		description: "sap.ui.model.odata.type.DateTime value binding should use displayFormat:'Date' constraint",
		resolution: "If you are using binding type sap.ui.model.odata.type.DateTime you also need to specify binding constraint like this:\n" +
			"value: {path : 'path_to_value', type : 'sap.ui.model.odata.type.DateTime', constraints : {displayFormat : 'Date'}}",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: DatePicker",
			href: "https://experience.sap.com/fiori-design-web/date-picker/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.DatePicker")
				.forEach(function(oElement) {
					var oValueBinding = oElement.getBinding("value");
					if (oValueBinding && oValueBinding.getType()
						&& oValueBinding.getType().isA("sap.ui.model.odata.type.DateTime")
						&& (!oValueBinding.getType().oConstraints || !oValueBinding.getType().oConstraints.isDateOnly)) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "DatePicker '" + sElementName + "' (" + sElementId
								+ ") is bound to a model of type sap.ui.model.odata.type.DateTime and the displayFormat is not 'Date'",
							context: {
								id: sElementId
							}
						});
					}
				}
				);
		}
	};

	/**
	 * Checks, if value binding type is correct for JSON binding.
	 */
	var oJSONValueBindingIsCorrect = {
		id: "jsonValueBindingIsCorrect",
		audiences: [Audiences.Control],
		categories: [Categories.Bindings],
		enabled: true,
		minversion: "1.28",
		title: "DatePicker: Binding type sap.ui.model.odata.type.Date is not correct for JSON binding",
		description: "sap.ui.model.odata.type.Date is not correct for JSON binding. The correct type is sap.ui.model.type.Date",
		resolution: "Use binding type sap.ui.model.type.Date for JSON binding",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: DatePicker",
			href: "https://experience.sap.com/fiori-design-web/date-picker/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.DatePicker")
				.forEach(function(oElement) {
					var oValueBinding = oElement.getBinding("value");
					if (oValueBinding
						&& oElement.getModel() && oElement.getModel().isA("sap.ui.model.json.JSONModel")
						&& oValueBinding.getType() && oValueBinding.getType().isA("sap.ui.model.odata.type.Date")) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "DatePicker '" + sElementName + "' (" + sElementId
								+ ") is bound to a model of type sap.ui.model.odata.type.Date but it should be sap.ui.model.type.Date",
							context: {
								id: sElementId
							}
						});
					}
				}
				);
		}
	};

	/**
	 *  Checks if a dateValue contains JS Date object with hours, minutes and seconds different than 0, 0, 0, local time - warxing.
	 */
	var oDateValueHasHoursMinutesSeconds = {
		id: "dateValueHasHoursMinutesSeconds",
		audiences: [Audiences.Control],
		categories: [Categories.Usage],
		enabled: true,
		minversion: "1.28",
		title: "DatePicker: dateValue has hours, minutes or seconds",
		description: "The dateValue contains JS Date object with hours, minutes and seconds different than 0, 0, 0, local time - warxing.",
		resolution: "Do not set hours, minutes and seconds, when you set dateValue",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: DatePicker",
			href: "https://experience.sap.com/fiori-design-web/date-picker/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.DatePicker")
				.forEach(function(oElement) {
					var dateValue = oElement.getDateValue();
					if (dateValue && (dateValue.getHours() || dateValue.getMinutes() || dateValue.getSeconds())) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "DatePicker '" + sElementName + "' (" + sElementId
								+ ")'s dateValue has hours, minutes or seconds set",
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
		oExclusiveValueDateValueBindingRule,
		oDateTimeBindingConstraintRule,
		oJSONValueBindingIsCorrect,
		oDateValueHasHoursMinutesSeconds
	];

}, true);