/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/ValueHelpDelegate",
	'sap/ui/mdc/p13n/StateUtil',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/enum/SelectType',
	'sap/ui/core/Core',
	'sap/base/util/deepEqual'
], function(
	ODataV4ValueHelpDelegate, StateUtil, Condition, FilterOperatorUtil, ConditionValidated, SelectType, Core, deepEqual
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
			if (sContentId === oPayloadInfo.contentId) {
				oConditionPayload[sContentId] = [];

				if (vContext) {
					var oEntry = {};

					_addContext(vContext, oPayloadInfo.path, oEntry);

					if (Object.keys(oEntry).length) {
						oConditionPayload[sContentId].push(oEntry);
					}
				}
			}
		});

		return oConditionPayload;
	};

	ValueHelpDelegate.modifySelectionBehaviour = function (oPayload, oContent, oChange) {

		var aConditions = oChange.conditions;
		var aOldConditions = oContent.getConditions();

		if (oChange.type === SelectType.Remove) {
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

	return ValueHelpDelegate;
});
