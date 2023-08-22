sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/p13n/StateUtil"
], function(
	ValueHelpDelegate,StateUtil) {
	"use strict";

	var JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	// called when ValueHelp for one of the three FilterFields is called
	JSONValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {

		var oConditions = ValueHelpDelegate.getFilterConditions(oValueHelp, oContent, oConfig);
		var oFilterBar = oValueHelp.getParent().getParent();

		return StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {

			var oFilter = oState.filter;

			var oFilterConditions = oValueHelp.getPayload().filterConditions;

			oFilterConditions.forEach((filterCondition) => {
				oConditions[filterCondition.condition] = oFilter[filterCondition.filter];
			});
			return oConditions;
		});
	};

	return JSONValueHelpDelegate;

}

);