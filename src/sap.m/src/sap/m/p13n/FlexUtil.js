/*!
 * ${copyright}
 */
sap.ui.define([
], function () {
	"use strict";

	var pWriteAPI;

	var FlexUtil = {

		/**
		 * Method which reduces a propertyinfo map to changecontent relevant attributes.
		 * <b>Note:</b> This method determines the attributes stored in the changeContent.
		 *
		 * @param {object} oProperty Object containing all values prior to change creation
		 * @param {array} aDeltaAttributes Array containing all attributes that are necessary for the delta calculation
		 *
		 * @returns {object} Object containing reduced content
		 */
		_getChangeContent: function (oProperty, aDeltaAttributes) {

			var oChangeContent = {};

			// Index
			if (oProperty.index >= 0) {
				oChangeContent.index = oProperty.index;
			}

			aDeltaAttributes.forEach(function(sAttribute) {
				if (oProperty.hasOwnProperty(sAttribute)){
					oChangeContent[sAttribute] = oProperty[sAttribute];
				}
			});

			return oChangeContent;
		},

		_hasProperty: function(aPropertyInfo, sName) {
			return aPropertyInfo.some(function(oProperty){
				//First check unique name
				var bValid = oProperty.name === sName || sName == "$search";

				//Use path as Fallback
				bValid = bValid ? bValid : oProperty.path === sName;

				return bValid;
			});
		},

		createConditionChange: function(sChangeType, oControl, sFieldPath, oCondition) {
			delete oCondition.filtered;
			var oConditionChange = {
				selectorElement: oControl,
				changeSpecificData: {
					changeType: sChangeType,
					content: {
						name: sFieldPath,
						condition: oCondition
					}
				}
			};

			return oConditionChange;
		},

		_requireWriteAPI: function() {
			if (!pWriteAPI) {
				pWriteAPI = new Promise(function (resolve, reject) {
					sap.ui.require([
						"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
					], function (ControlPersonalizationWriteAPI) {
						resolve(ControlPersonalizationWriteAPI);
					});
				});
			}
			return pWriteAPI;
		},

		handleChanges: function (aChanges, bIgnoreVM, bTransient) {

			if (bTransient) {
				aChanges.forEach((oChange) => {oChange.transient = true;});
			}

			return FlexUtil._requireWriteAPI().then(function(ControlPersonalizationWriteAPI){
				return ControlPersonalizationWriteAPI.add({
					changes: aChanges,
					ignoreVariantManagement: bIgnoreVM
				});
			});
		},

		saveChanges: function (oControl, aDirtyChanges) {
			return FlexUtil._requireWriteAPI().then(function(ControlPersonalizationWriteAPI){
				return ControlPersonalizationWriteAPI.save({
					selector: oControl, changes: aDirtyChanges
				});
			});
		},

		restore: function(mPropertyBag) {
			return FlexUtil._requireWriteAPI().then(function(ControlPersonalizationWriteAPI){
				return ControlPersonalizationWriteAPI.restore(mPropertyBag);
			});
		},

		reset: function(mPropertyBag) {
			return FlexUtil._requireWriteAPI().then(function(ControlPersonalizationWriteAPI){
				return ControlPersonalizationWriteAPI.reset(mPropertyBag);
			});
		}
	};
	return FlexUtil;
});