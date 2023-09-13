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

	const ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

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

		const _addContext = function(oContext, aProperties, oStore) {
			if (!Array.isArray(aProperties)) {
				aProperties = [aProperties];
			}
			aProperties.forEach( function(sPath) {
				const vProp = oContext.getProperty(sPath);
				if (vProp) {
					oStore[sPath] = vProp;
				}
			});
		};

		const aPayloadInfos = oPayload.payloadInfos || [];
		const sContentId = oContent.getId();
		const oConditionPayload = {};

		aPayloadInfos.forEach(function(oPayloadInfo){
			if (sContentId.endsWith(oPayloadInfo.contentId)) {
				oConditionPayload[oPayloadInfo.contentId] = [];

				if (vContext) {
					const oEntry = {};

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

		const aConditions = oChange.conditions;
		const aOldConditions = oContent.getConditions();

		if (oChange.type === ValueHelpSelectionType.Remove) {
			for (let i = 0; i < aConditions.length; i++) {
				const oCondition = aConditions[i];
				const iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aOldConditions);
				if (iIndex < 0) { // not found
					// check if a similar condition with different payload exists
					for (let j = 0; j < aOldConditions.length; j++) {
						const oOldCondition = aOldConditions[j];
						if (oCondition.operator === oOldCondition.operator && oCondition.values[0] === oOldCondition.values[0] && (oCondition.values.length < 2 || oCondition.values[1] === oOldCondition.values[1])) {
							// same operator and key -> could be the same condition - compare in/out (see ColletiveSearch with different content as different Conditions)
							let bFound = false;
							for (const sKey in oCondition.payload) {
								const oNewPayload = oCondition.payload[sKey];
								for (const sOldKey in oOldCondition.payload) {
									const oOldPayload = oOldCondition.payload[sOldKey];
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

		const aInParameters = oPayload.inParameters || [];
		const oConditions = ODataV4ValueHelpDelegate.getFilterConditions(oPayload, oContent, oConfig);
		const oField = (oConfig && oConfig.control) || (oContent && oContent.getControl());
		const sContentId = oContent.getId();
		const aPropertyPromises = [];
		const aPropertyPromiseTargets = [];

		if (!oField) {
			return oConditions;
		}

		aInParameters.forEach(function(oInParameter) {
			if (sContentId.endsWith(oInParameter.contentId)) {
				const oContext = oField.getBindingContext();
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

			mAllOutValues[oOutParameter.target] = aOutValues;
		});

		aOutParameters.forEach(function(oOutParameter) {

			const sTarget = oOutParameter.target;
			const aAllOutValues = mAllOutValues[sTarget];
			if (aAllOutValues && aAllOutValues.length) {
				if (oOutParameter.target && oOutParameter.mode === "Always") {
					const oBindingContext = oField.getBindingContext();
					if (oBindingContext) {
						oBindingContext.setProperty(oOutParameter.target, aAllOutValues[0]);
					}
				}
			}
		});

	};

	return ValueHelpDelegate;
});
