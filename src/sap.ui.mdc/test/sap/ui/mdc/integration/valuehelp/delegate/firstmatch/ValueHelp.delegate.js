/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate",
	"sap/ui/core/Element",
	"sap/ui/model/FilterType"
], function(
	BaseValueHelpDelegate,
	Element,
	FilterType
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.updateBinding = function(oPayload, oListBinding, oBindingInfo) {	// JSON Binding in this example
		oListBinding.filter(oBindingInfo.filters, FilterType.Application);
		if (oListBinding.isSuspended()) {
			oListBinding.resume();
		}
	};

	ValueHelpDelegate.isSearchSupported = function () {
		return true;
	};

	ValueHelpDelegate.findConditionsForContext = function (oValueHelp, oContent, oContext, aConditions) {
		return BaseValueHelpDelegate.findConditionsForContext(oValueHelp, oContent, oContext, aConditions).filter((oCondition) => {
			return oContext.getObject(oContent.getDescriptionPath()) === oCondition.values[1];
		});
	};


	return ValueHelpDelegate;
});
