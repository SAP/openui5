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

	const FieldInOutValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	FieldInOutValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		const oPayload = oValueHelp.getPayload();
		const aInParameters = oPayload.inParameters || [];
		const oConditions = BaseValueHelpDelegate.getFilterConditions(arguments);

		const oField = (oConfig && oConfig.control) || (oContent && oContent.getControl());
		if (oField && oField.isA("sap.ui.mdc.Field")) {
			const sContentId = oContent.getId();
			const aPropertyPromises = [];
			const aPropertyPromiseTargets = [];

			aInParameters.forEach(function(oInParameter) {
				if (sContentId === oInParameter.contentId) {
					if (oInParameter.sourceFieldId) {
						const sSourceFieldId = oInParameter.sourceFieldId;
						const oSourceField = Core.byId(sSourceFieldId);

						const aConditions = oSourceField.getConditions();
						if (aConditions  && aConditions.length) {
							oConditions[oInParameter.target] = aConditions;
						}
					} else {
						const oContext = oField.getBindingContext();
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
		const oPayload = oValueHelp.getPayload();
		const aOutParameters = oPayload.outParameters || [];
		const oField = oValueHelp.getControl();

		//handle only ControlChange reason
		if (!oField || sReason !== "ControlChange") {
			return;
		}

		const mAllOutValues = {};

		aOutParameters.forEach(function(oOutParameter) {

			// find all conditions carrying outParameter.source information
			const aOutValues = oField.getConditions().reduce(function (aResult, oCondition) {
				if (oCondition.payload) {
					Object.values(oCondition.payload).forEach(function (aSegments) {
						aSegments.forEach(function (oSegment) {
							const sSource = oSegment[oOutParameter.source];
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

			const sTarget = oOutParameter.target || oOutParameter.targetFieldId;
			const aAllOutValues = mAllOutValues[sTarget];
			const bClear = oOutParameter.mode === "Clear";
			if ((aAllOutValues && aAllOutValues.length) || bClear) {
				const vValue = aAllOutValues[0];
				const bAlways = oOutParameter.mode === "Always";
				if (oOutParameter.targetFieldId) {
					// update field by Id
					const sTargetFieldId = oOutParameter.targetFieldId;
					const oTargetField = Core.byId(sTargetFieldId);
					if (oTargetField) {
						if (bClear) {
							oTargetField.setValue();
							oTargetField.setAdditionalValue();
						} else if ((bAlways || !oTargetField.getValue())) {
							const sOutValueHelpId = oTargetField && oTargetField.getValueHelp();
							const oOutValueHelp = sOutValueHelpId && Core.byId(sOutValueHelpId);

							if (oOutValueHelp) {
								const oConfig = {
									value: vValue,
									parsedValue: vValue,
									// dataType: oType,
									checkKey: true,
									checkDescription: false,
									exception: ParseException,
									control: oTargetField
								};
								oOutValueHelp.getItemForValue(oConfig).then(function(oItem) { // if this is an In-Parameter for another this update would need to wait until this one
									const oNewCondition = Condition.createCondition(OperatorName.EQ, [oItem.key], undefined, undefined, ConditionValidated.Validated, oItem.payload);
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
					}
				} else if (oOutParameter.target) {
					const oBindingContext = oField.getBindingContext();
					if (oBindingContext) {
						if (bClear) {
							oBindingContext.setProperty(oOutParameter.target, null);
						} else if (bAlways || !oBindingContext.getValue(oOutParameter.target)) {
							oBindingContext.setProperty(oOutParameter.target, vValue);
						}
					}
				}
			}
		});

	};

	return FieldInOutValueHelpDelegate;
});
