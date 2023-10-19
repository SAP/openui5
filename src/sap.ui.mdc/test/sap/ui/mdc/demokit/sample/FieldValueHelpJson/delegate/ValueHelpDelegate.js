sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/p13n/StateUtil"
], function(
	ValueHelpDelegate,StateUtil) {
	"use strict";

	const JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	// called when ValueHelp for one of the three FilterFields is called
	JSONValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {

		const oConditions = ValueHelpDelegate.getFilterConditions(oValueHelp, oContent, oConfig);
		const oFilterBar = oValueHelp.getParent().getParent();

		return StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {

			const oFilter = oState.filter;

			const oFilterConditions = oValueHelp.getPayload().filterConditions;

			oFilterConditions.forEach((filterCondition) => {
				oConditions[filterCondition.condition] = oFilter[filterCondition.filter];
			});
			return oConditions;
		});
	};

	return JSONValueHelpDelegate;

}

);