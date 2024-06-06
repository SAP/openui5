/*!
 * ${copyright}
 */

/*eslint max-nested-callbacks: [2, 20]*/

sap.ui.define([
	"./ValueHelp.delegate",
	'sap/ui/mdc/p13n/StateUtil',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/OperatorName',
	'sap/ui/mdc/util/IdentifierUtil',
	'sap/ui/model/ParseException'
], function(
	BaseValueHelpDelegate, StateUtil, Condition, ConditionValidated, OperatorName, IdentifierUtil, ParseException
) {
	"use strict";

	var FilterbarInOutValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	FilterbarInOutValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		var oPayload = oValueHelp.getPayload();
		var aInParameters = oPayload.inParameters || [];
		var oConditions = BaseValueHelpDelegate.getFilterConditions(arguments);

		var oFilterField = (oConfig && oConfig.control) || (oContent && oContent.getControl());
		var oFilterBar = oFilterField && oFilterField.getParent();
		if (oFilterBar && oFilterBar.isA("sap.ui.mdc.filterbar.FilterBarBase")) {

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

	FilterbarInOutValueHelpDelegate.onConditionPropagation = function (oValueHelp, sReason, oConfig) {
		var oPayload = oValueHelp.getPayload();
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

					aAllOutValues.forEach(function(vValue) {
						var aFilters = oState.filter && oState.filter[sTarget] ? oState.filter[sTarget] : [];
						if (oOutParameter.mode !== "WhenEmpty" || aFilters.length === 0) {
							var oView = IdentifierUtil.getView(oValueHelp);
							var oOutValueHelp = oOutParameter.valueHelpId && oView.byId(oOutParameter.valueHelpId);
							var oOutFilterField = oFilterBar._getFilterField(oOutParameter.target);
							var oNewCondition;

							if (oOutValueHelp) {
								// valueHelpId provided to determine description and payload for out-parameter
								var oConfig = {
									value: vValue,
									parsedValue: vValue,
									// dataType: oType,
									checkKey: true,
									checkDescription: false,
									exception: ParseException,
									control: oOutFilterField
								};
								oNewCondition = oOutValueHelp.getItemForValue(oConfig).then(function(oItem) { // if this is an In-Parameter for another this update would need to wait until this one
									oNewCondition = Condition.createCondition(OperatorName.EQ, [oItem.key], undefined, undefined, ConditionValidated.Validated, oItem.payload);
									if (oItem.description) {
										oNewCondition.values.push(oItem.description);
									}
									return oNewCondition;
								}).catch(function(oError) { // if not found just use the given Out-value
									return Condition.createCondition(OperatorName.EQ, [vValue], undefined, undefined, ConditionValidated.Validated, {});
								});
							} else {
								oNewCondition = Condition.createCondition(OperatorName.EQ, [vValue], undefined, undefined, ConditionValidated.Validated, {});
							}
							Promise.all([oNewCondition]).then(function(aResult) {
								var oNewCondition = aResult[0];
								var iIndex = aFilters.findIndex(oNewCondition, (oFiltersCondition) => this.compareConditions(oNewCondition, oFiltersCondition)); // check if already exist
								if (iIndex < 0) {
									oState.filter[sTarget] = oState.filter && oState.filter[sTarget] || [];
									oState.filter[sTarget].push(oNewCondition);
								}
								StateUtil.applyExternalState(oFilterBar, oState);
							});
						}
					});
				});
			});
		}

	};

	return FilterbarInOutValueHelpDelegate;
});
