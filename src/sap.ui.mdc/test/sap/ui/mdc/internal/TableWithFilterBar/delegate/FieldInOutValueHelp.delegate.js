/*
 * ! ${copyright}
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

	var FieldInOutValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);


	FieldInOutValueHelpDelegate.getInitialFilterConditions = function (oPayload, oContent, oControl) {

		var aInParameters = oPayload.inParameters || [];
		var oConditions = BaseValueHelpDelegate.getInitialFilterConditions(oPayload, oContent);

		var oField = oControl;
		if (oField.isA("sap.ui.mdc.Field")) {
			var sContentId = oContent.getId();
			var aPropertyPromises = [];

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
						aPropertyPromises.push( oContext.requestProperty(oInParameter.source));
					}

				}
			});

			if (aPropertyPromises.length > 0) {
				return Promise.all(aPropertyPromises).then(function(aResults) {
					aResults.forEach(function(vResult, index){
						oConditions[aInParameters[index].target] = Condition.createCondition("EQ", [aResults[index]], null, null, false, null);
					});
					return oConditions;
				});
			} else {
				return oConditions;
			}

		}

		return oConditions;
	};


	FieldInOutValueHelpDelegate.onConditionPropagation = function (oPayload, oValueHelp, sReason) {

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

			if (oOutParameter.targetFieldId) {
				// update field by Id
				var sTarget = oOutParameter.target || oOutParameter.targetFieldId;
				var aAllOutValues = mAllOutValues[sTarget];
				var sTargetFieldId = oOutParameter.targetFieldId;
				var oTargetField = Core.byId(sTargetFieldId);
				var bAlways = oOutParameter.mode === "Always";
				if (!oTargetField.getValue() || bAlways) {
					if (aAllOutValues && aAllOutValues.length) {
						oTargetField.setValue(aAllOutValues[0]);
					}
				}
			}
		});

	};

	return FieldInOutValueHelpDelegate;
});
