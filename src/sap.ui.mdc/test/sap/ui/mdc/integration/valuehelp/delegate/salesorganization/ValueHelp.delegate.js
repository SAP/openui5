/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate",
	"sap/ui/model/FilterType"
], function(
	BaseValueHelpDelegate,
	FilterType
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.getFilterConditions = function (oPayload, oContent, oConfig) {
		var oConditions = BaseValueHelpDelegate.getFilterConditions(oPayload, oContent, oConfig);

		if (oContent.getId() === "FB0-FH-D-Popover-MTable") {
			oConditions['distributionChannel'] = sap.ui.getCore().byId('FB0-DC').getConditions();
			oConditions['salesOrganization'] = sap.ui.getCore().byId('FB0-SO').getConditions();
		}

		return oConditions;
	};

	ValueHelpDelegate.updateBinding = function(oPayload, oListBinding, oBindingInfo) {	// JSON Binding in this example
		oListBinding.filter(oBindingInfo.filters, FilterType.Application);
		if (oListBinding.isSuspended()) {
			oListBinding.resume();
		}
	};

	// Exemplatory implementation of a condition merge strategy (shared condition between multiple collectiveSearch lists)
	ValueHelpDelegate.modifySelectionBehaviour = function (oValueHelp, oContent, oChange) {

		var oChangeCondition = oChange.conditions[0];
		var oCurrentConditions = oContent.getConditions();

		// Replace typeahead condition with existing one - we do not want duplicates in this scenario
		if (oContent.isTypeahead() && oChange.type === "Set") {
			return {
				type: "Set",
				conditions: oChange.conditions.map(function (oCondition) {
					var oExisting = oCurrentConditions.find(function (oCurrentCondition) {
						return oCurrentCondition.values[0] === oCondition.values[0];
					});

					return oExisting || oCondition;
				})
			};
		}

		var oExistingCondition = oCurrentConditions.find(function (oCondition) {
			return oCondition.values[0] === oChangeCondition.values[0];
		});

		// reuse and apply payload to existing condition for this value
		if (oChange.type === "Add" && oExistingCondition) {
			return {
				type: "Set",
				conditions: oCurrentConditions.slice().map(function (oCondition) {
					if (oCondition === oExistingCondition) {
						oChangeCondition.payload = Object.assign({}, oExistingCondition.payload, oChangeCondition.payload);
						return oChangeCondition;
					}
					return oCondition;
				})
			};
		}
		// remove payload from existing condition for this value, or delete the condition if it doesn't contain another payload
		if (oChange.type === "Remove" && oExistingCondition) {
			return {
				type: "Set",
				conditions: oCurrentConditions.slice().filter(function (oCondition) {
					return oCondition === oExistingCondition ? oExistingCondition.payload && Object.keys(oExistingCondition.payload).length > 1 : true; // keep existing condition if another payload exists
				}).map(function (oCondition) {
					if (oCondition === oExistingCondition) {
						delete oExistingCondition.payload[oContent.getId()];	// delete existing payload for this content
						return oExistingCondition;
					}
					return oCondition;
				})
			};
		}
		return oChange;
	};

	return ValueHelpDelegate;
});
