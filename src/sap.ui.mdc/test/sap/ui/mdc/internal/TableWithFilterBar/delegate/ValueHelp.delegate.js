/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/odata/v4/ValueHelpDelegate",
	'sap/ui/mdc/p13n/StateUtil',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/core/Core'
], function(
	ODataV4ValueHelpDelegate, StateUtil, Condition, ConditionValidated, Core
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

	return ValueHelpDelegate;
});
