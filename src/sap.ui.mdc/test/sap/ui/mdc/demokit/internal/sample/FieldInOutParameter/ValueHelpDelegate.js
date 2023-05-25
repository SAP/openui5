/*!
 * ${copyright}
 */

sap.ui.define([
	'delegates/odata/v4/ValueHelpDelegate',
	'sap/ui/mdc/p13n/StateUtil',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/ValueHelpSelectionType',
	'sap/ui/core/Core',
	'sap/base/util/deepEqual'
], function(
	ODataV4ValueHelpDelegate, StateUtil, Condition, FilterOperatorUtil, ConditionValidated, ValueHelpSelectionType, Core, deepEqual
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.adjustSearch = function(oPayload, bTypeahead, sSearch) {

		if (bTypeahead && sSearch) {
			return '"' + sSearch + '"'; // TODO: escape " in string
		} else if (sSearch && sSearch.indexOf(" ") === -1) {
			return '"' + sSearch + '"'; // TODO: escape " in string
		} else {
			// allow OR AND ....
			return sSearch; // TODO: check for unsoprted characters
		}

	};

	ValueHelpDelegate.createConditionPayload = function (oPayload, oContent, aValues, vContext) {

		var _addContext = function(oContext, aProperties, oStore) {
			if (!Array.isArray(aProperties)) {
				aProperties = [aProperties];
			}
			aProperties.forEach( function(sPath) {
				var vProp = oContext.getProperty(sPath);
				if (vProp) {
					oStore[sPath] = vProp;
				}
			});
		};

		var aPayloadInfos = oPayload.payloadInfos || [];
		var sContentId = oContent.getId();
		var oConditionPayload = {};

		aPayloadInfos.forEach(function(oPayloadInfo){
			if (sContentId.endsWith(oPayloadInfo.contentId)) {
				oConditionPayload[oPayloadInfo.contentId] = [];

				if (vContext) {
					var oEntry = {};

					_addContext(vContext, oPayloadInfo.path, oEntry);

					if (Object.keys(oEntry).length) {
						oConditionPayload[oPayloadInfo.contentId].push(oEntry);
					}
				}
			}
		});

		return oConditionPayload;
	};

	ValueHelpDelegate.modifySelectionBehaviour = function (oPayload, oContent, oChange) {

		var aConditions = oChange.conditions;
		var aOldConditions = oContent.getConditions();

		if (oChange.type === ValueHelpSelectionType.Remove) {
			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aOldConditions);
				if (iIndex < 0) { // not found
					// check if a similar condition with different payload exists
					for (var j = 0; j < aOldConditions.length; j++) {
						var oOldCondition = aOldConditions[j];
						if (oCondition.operator === oOldCondition.operator && oCondition.values[0] === oOldCondition.values[0] && (oCondition.values.length < 2 || oCondition.values[1] === oOldCondition.values[1])) {
							// same operator and key -> could be the same condition - compare in/out (see ColletiveSearch with different content as different Conditions)
							var bFound = false;
							for (var sKey in oCondition.payload) {
								var oNewPayload = oCondition.payload[sKey];
								for (var sOldKey in oOldCondition.payload) {
									var oOldPayload = oOldCondition.payload[sOldKey];
									if (deepEqual(oNewPayload, oOldPayload)) {
										bFound = true; // content of payload is similar - use as same condition
									}
								}
							}

							if (bFound) {
								oCondition.payload = oOldCondition.payload;
							}
						}
					}
				}
			}
		}

		return oChange;
	};

	ValueHelpDelegate.getFilterConditions = function (oPayload, oContent, oConfig) {

		var aInParameters = oPayload.inParameters || [];
		var oConditions = ODataV4ValueHelpDelegate.getFilterConditions(oPayload, oContent, oConfig);
		var oField = (oConfig && oConfig.control) || (oContent && oContent.getControl());
		var sContentId = oContent.getId();
		var aPropertyPromises = [];
		var aPropertyPromiseTargets = [];

		if (!oField) {
			return oConditions;
		}

		aInParameters.forEach(function(oInParameter) {
			if (sContentId.endsWith(oInParameter.contentId)) {
				var oContext = oField.getBindingContext();
				aPropertyPromises.push(oContext.requestProperty(oInParameter.source));
				aPropertyPromiseTargets.push(oInParameter.target);
			}
		});

		if (aPropertyPromises.length > 0) {
			return Promise.all(aPropertyPromises).then(function(aResults) {
				aResults.forEach(function(vResult, index){
					if (vResult) { // only for already filled properties. But what id "" is a valid key?
						oConditions[aPropertyPromiseTargets[index]] = [Condition.createCondition("EQ", [vResult], null, null, ConditionValidated.Validated, null)];
					}
				});
				return oConditions;
			});
		} else {
			return oConditions;
		}

	};

	ValueHelpDelegate.onConditionPropagation = function (oPayload, oValueHelp, sReason) {

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

			mAllOutValues[oOutParameter.target] = aOutValues;
		});

		aOutParameters.forEach(function(oOutParameter) {

			var sTarget = oOutParameter.target;
			var aAllOutValues = mAllOutValues[sTarget];
			if (aAllOutValues && aAllOutValues.length) {
				if (oOutParameter.target && oOutParameter.mode === "Always") {
					var oBindingContext = oField.getBindingContext();
					if (oBindingContext) {
						oBindingContext.setProperty(oOutParameter.target, aAllOutValues[0]);
					}
				}
			}
		});

	};

	return ValueHelpDelegate;
});
