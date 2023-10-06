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
	'sap/ui/model/ParseException',
	'sap/ui/core/Core'
], function(
	BaseValueHelpDelegate, StateUtil, Condition, ConditionValidated, OperatorName, ParseException, Core
) {
	"use strict";

	var FieldInOutValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	FieldInOutValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		var oPayload = oValueHelp.getPayload();
		var aInParameters = oPayload.inParameters || [];
		var oConditions = BaseValueHelpDelegate.getFilterConditions(arguments);

		var oField = (oConfig && oConfig.control) || (oContent && oContent.getControl());
		if (oField && oField.isA("sap.ui.mdc.Field")) {
			var sContentId = oContent.getId();
			var aPropertyPromises = [];
			var aPropertyPromiseTargets = [];

			aInParameters.forEach(function(oInParameter) {
				if (sContentId === oInParameter.contentId) {
					if (oInParameter.sourceFieldId) {
						var sSourceFieldId = oInParameter.sourceFieldId;
						var oSourceField = Core.byId(sSourceFieldId);

						var aConditions = oSourceField.getConditions();
						if (aConditions  && aConditions.length) {
							oConditions[oInParameter.target] = aConditions;
						}
					} else {
						var oContext = oField.getBindingContext();
						aPropertyPromises.push(oContext.requestProperty(oInParameter.source));
						aPropertyPromiseTargets.push(oInParameter.target);
					}

				}
			});

			if (aPropertyPromises.length > 0) {
				return Promise.all(aPropertyPromises).then(function(aResults) {
					aResults.forEach(function(vResult, index){
						oConditions[aPropertyPromiseTargets[index]] = [Condition.createCondition(OperatorName.EQ, [vResult], null, null, ConditionValidated.Validated, null)];
					});
					return oConditions;
				});
			} else {
				return oConditions;
			}

		}

		return oConditions;
	};


	FieldInOutValueHelpDelegate.onConditionPropagation = function (oValueHelp, sReason) {
		var oPayload = oValueHelp.getPayload();
		var aOutParameters = oPayload.outParameters || [];
		var oField = oValueHelp.getControl();

		//handle only ControlChange reason
		if (!oField || sReason !== "ControlChange") {
			return;
		}

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

		aOutParameters.forEach(function(oOutParameter) {

			var sTarget = oOutParameter.target || oOutParameter.targetFieldId;
			var aAllOutValues = mAllOutValues[sTarget];
			if (aAllOutValues && aAllOutValues.length) {
				var vValue = aAllOutValues[0];
				var bAlways = oOutParameter.mode === "Always";
				if (oOutParameter.targetFieldId) {
					// update field by Id
					var sTargetFieldId = oOutParameter.targetFieldId;
					var oTargetField = Core.byId(sTargetFieldId);
					if (oTargetField && (bAlways || !oTargetField.getValue())) {
						var sOutValueHelpId = oTargetField && oTargetField.getValueHelp();
						var oOutValueHelp = sOutValueHelpId && Core.byId(sOutValueHelpId);

						if (oOutValueHelp) {
							var oConfig = {
								value: vValue,
								parsedValue: vValue,
								// dataType: oType,
								checkKey: true,
								checkDescription: false,
								exception: ParseException,
								control: oTargetField
							};
							oOutValueHelp.getItemForValue(oConfig).then(function(oItem) { // if this is an In-Parameter for another this update would need to wait until this one
								var oNewCondition = Condition.createCondition(OperatorName.EQ, [oItem.key], undefined, undefined, ConditionValidated.Validated, oItem.payload);
								if (oItem.description) {
									oNewCondition.values.push(oItem.description);
								}
								oTargetField.setConditions([oNewCondition]);
							}).catch(function(oError) { // if not found just use the given Out-value
								oTargetField.setValue(vValue);
								oTargetField.setAdditionalValue(); // as it might not longer be valid
							});
						} else {
							oTargetField.setValue(vValue);
							oTargetField.setAdditionalValue(); // as it might not longer be valid
						}
					}
				} else if (oOutParameter.target) {
					var oBindingContext = oField.getBindingContext();
					if (oBindingContext && (bAlways || !oBindingContext.getValue(oOutParameter.target))) {
						oBindingContext.setProperty(oOutParameter.target, vValue);
					}
				}
			}
		});

	};

	return FieldInOutValueHelpDelegate;
});
