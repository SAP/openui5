/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	'sap/ui/mdc/p13n/StateUtil',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/core/Core'
], function(
	BaseValueHelpDelegate, StateUtil, Condition, ConditionValidated, Core
) {
	"use strict";

	var FilterbarInOutValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);


	FilterbarInOutValueHelpDelegate.getInitialFilterConditions = function (oPayload, oContent, oControl) {

		var aInParameters = oPayload.inParameters || [];
		var oConditions = BaseValueHelpDelegate.getInitialFilterConditions(oPayload, oContent);

		var oFilterField = oControl;
		var oFilterBar = oFilterField.getParent();
		if (oFilterBar.isA("sap.ui.mdc.filterbar.FilterBarBase")) {

			return StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {
				var oInConditions = {};
				var sContentId = oContent.getId();
				aInParameters.forEach(function(oInParameter) {
					if (sContentId === oInParameter.contentId) {

						var aConditions = oState.filter[oInParameter.source];
						if (aConditions  && aConditions.length) {
							oInConditions[oInParameter.target] = aConditions;
						}
					}
				});

				return oInConditions;
			});
		}

		return oConditions;
	};

	FilterbarInOutValueHelpDelegate.onConditionPropagation = function (oPayload, oValueHelp, sReason) {

		var aOutParameters = oPayload.outParameters || [];

		//handle only ControlChange reason
		if (sReason !== "ControlChange") {
			return;
		}

		var oField = oValueHelp.getControl();
		var mAllOutValues = {};

		aOutParameters.forEach(function(oOutParameter) {

			// find all conditions carrying outParameter.source information
			var aOutValues = oField.getConditions().reduce(function (aResult, oCondition) {
				if (oCondition.payload) {
					Object.values(oCondition.payload).forEach(function (aSegments) {
						aSegments.forEach(function (oSegment) {
							var sSource = oSegment[oOutParameter.source];
							if (sSource && aResult.indexOf(sSource) === -1) {
								aResult.push(sSource);
							}
						});
					});
				}
				return aResult;
			}, []);

			mAllOutValues[oOutParameter.target || oOutParameter.targetFieldId] = aOutValues;
		});

		// update Filterbar filterFields via StateUtil
		var oFilterBar = oField.getParent();
		if (oFilterBar.isA("sap.ui.mdc.filterbar.FilterBarBase")) {

			StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {
				aOutParameters.forEach(function(oOutParameter) {

					var sTarget = oOutParameter.target;
					var aAllOutValues = mAllOutValues[oOutParameter.target];

					aAllOutValues.forEach(function(sValue) {
						var bExists = oState.filter && oState.filter[sTarget] && oState.filter[sTarget].find(function (oCondition) {
							return oCondition.values[0] === sValue;
						});
						var bAlways = oOutParameter.mode === "Always";
						if (!bExists || bAlways) {
							var oNewCondition = Condition.createCondition("EQ", [sValue], undefined, undefined, ConditionValidated.Validated);
							oState.filter[sTarget] = oState.filter && oState.filter[sTarget] || [];
							oState.filter[sTarget].push(oNewCondition);
						}
					});
				});

				StateUtil.applyExternalState(oFilterBar, oState);
			});
		}

	};

	return FilterbarInOutValueHelpDelegate;
});
