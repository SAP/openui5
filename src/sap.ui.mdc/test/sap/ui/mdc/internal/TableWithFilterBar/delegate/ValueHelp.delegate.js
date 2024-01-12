/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/ValueHelpDelegate",
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/enums/ValueHelpSelectionType',
	'sap/base/util/deepEqual'
], function(
	ODataV4ValueHelpDelegate, FilterOperatorUtil, ValueHelpSelectionType, deepEqual
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

	ValueHelpDelegate.createConditionPayload = function (oValueHelp, oContent, aValues, vContext) {
		var oPayload = oValueHelp.getPayload();
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

	ValueHelpDelegate.modifySelectionBehaviour = function (oValueHelp, oContent, oChange) {
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

	ValueHelpDelegate.getFirstMatch = function(oValueHelp, oContent, oConfig) {

		const oPayload = oValueHelp.getPayload();

		if (oPayload.firstMatch && oPayload.firstMatch === "CheckKeyDescription") {
			const aBindingContents = oContent.getRelevantContexts(oConfig);
			const sKeyPath = oContent.getKeyPath();
			const sDescriptionPath = oContent.getDescriptionPath();
			const sFilterValue = oValueHelp.getFilterValue();

			for (let i = 0; i < aBindingContents.length; i++) {
				const oBindingContent = aBindingContents[i];
				if (sKeyPath && oBindingContent.getValue(sKeyPath).toLowerCase().startsWith(sFilterValue.toLowerCase())) {
					return oBindingContent;
				} else if (sKeyPath && oBindingContent.getValue(sDescriptionPath).toLowerCase().startsWith(sFilterValue.toLowerCase())) {
					return oBindingContent;
				}
			}
			return aBindingContents[0];
		}

		return ODataV4ValueHelpDelegate.getFirstMatch.apply(this, arguments);

	};

	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer) {

		const aCurrentContent = oContainer && oContainer.getContent();
		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog") && aCurrentContent?.length > 0) {
			aCurrentContent.forEach(function(oCurrentContent) {
				if (oCurrentContent.isA("sap.ui.mdc.valuehelp.content.MDCTable")) {
					const oTable = oCurrentContent.getTable();
					if (oTable?._setShowP13nButton) {
						oTable._setShowP13nButton(false);
					}
				}
			});

		}

		return ODataV4ValueHelpDelegate.retrieveContent.apply(this, arguments);
	};

	return ValueHelpDelegate;
});
