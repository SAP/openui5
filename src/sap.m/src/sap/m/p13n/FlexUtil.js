/*
* ! ${copyright}
*/
sap.ui.define([
	'sap/base/util/merge', 'sap/base/util/deepEqual','sap/ui/mdc/condition/FilterOperatorUtil', 'sap/base/Log'
], function (merge, deepEqual, FilterOperatorUtil, Log) {
	"use strict";

	var FlexUtil = {

		getPropertySetterChanges: function(mDeltaInfo) {
			var oControl = mDeltaInfo.control;
			var aExistingState = mDeltaInfo.existingState;
			var aChangedState = mDeltaInfo.changedState;
			var sOperation = mDeltaInfo.operation;
			var sSetAttribute = mDeltaInfo.deltaAttribute;

			var aSetterChanges = [];

			aChangedState.forEach(function(oItem){
				//check if the provided state item holds the value to check for
				if (oItem.hasOwnProperty(sSetAttribute)) {
					var oExistingItem = aExistingState.find(function(oExisting){return oExisting.name == oItem.name;});

					//compare to identify delta (only create a change if really necessary)
					var vOldValue = oExistingItem && oExistingItem.hasOwnProperty(sSetAttribute) && oExistingItem[sSetAttribute];
					var vNewValue = oItem[sSetAttribute];
					var bValueChanged = vOldValue !== vNewValue;
					if (bValueChanged) {
						aSetterChanges.push(this.createChange(oControl, sOperation, {
							name: oItem.name,
							value: oItem[sSetAttribute]
						}));
					}
				}
			}.bind(this));

			return aSetterChanges;
		},

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

		createChange: function(oControl, sOperation, oContent){
			var oAddRemoveChange = {
				selectorElement: oControl,
				changeSpecificData: {
					changeType: sOperation,
					content: oContent
				}
			};
			return oAddRemoveChange;
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

		handleChanges: function (aChanges, bIgnoreVM, bUseStaticArea) {
			return new Promise(function (resolve, reject) {
				sap.ui.require([
					"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
				], function (ControlPersonalizationWriteAPI) {
					ControlPersonalizationWriteAPI.add({
						changes: aChanges,
						ignoreVariantManagement: bIgnoreVM,
						useStaticArea: bUseStaticArea
					}).then(function (aDirtyChanges) {
						resolve(aDirtyChanges);
					}, reject);
				});
			});
		},

		saveChanges: function (oControl, aDirtyChanges) {
			return new Promise(function (resolve, reject) {
				sap.ui.require([
					"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
				], function (ControlPersonalizationWriteAPI) {
					ControlPersonalizationWriteAPI.save({
						selector: oControl, changes: aDirtyChanges
					}).then(resolve);
				});
			});
		},

		restore: function(mPropertyBag) {
			return new Promise(function (resolve, reject) {
				sap.ui.require([
					"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
				], function (ControlPersonalizationWriteAPI) {
					ControlPersonalizationWriteAPI.restore(mPropertyBag).then(function () {
						resolve();
					}, reject);
				});
			});
		},

		reset: function(mPropertyBag) {
			return new Promise(function (resolve, reject) {
				sap.ui.require([
					"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
				], function (ControlPersonalizationWriteAPI) {
					ControlPersonalizationWriteAPI.reset(mPropertyBag).then(function () {
						resolve();
					}, reject);
				});
			});
		}
	};
	return FlexUtil;
});