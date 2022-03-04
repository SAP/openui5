/*
* ! ${copyright}
*/
sap.ui.define([
	'sap/base/util/array/diff', 'sap/base/util/deepEqual','sap/ui/mdc/condition/FilterOperatorUtil', 'sap/base/Log'
], function (diff, deepEqual, FilterOperatorUtil, Log) {
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

		/**
		* Generates a set of changes based on the given arrays for a specified control
		*
		* @public
		*
		* @param {object} mDeltaInfo Map containing the necessary information to calculate the diff as change objects
		* @param {array} mDeltaInfo.existingState An array describing the control state before a adaptation
		* @param {array} mDeltaInfo.changedState An array describing the control state after a certain adaptation
		* @param {object} mDeltaInfo.control Control instance which is being used to generate the changes
		* @param {object} mDeltaInfo.changeOperations Map containing the changeOperations for the given Control instance
		* @param {string} mDeltaInfo.changeOperations.add Name of the control specific 'add' changehandler
		* @param {string} mDeltaInfo.changeOperations.remove Name of the control specific 'remove' changehandler
		* @param {string} [mDeltaInfo.changeOperations.move] Name of the control specific 'move' changehandler
		* @param {string} [mDeltaInfo.generator] Name of the change generator (E.g. the namespace of the UI creating the change object)
		*
		* @returns {array} Array containing the delta based created changes
		*/
		getConditionDeltaChanges: function(mDeltaInfo) {
			var aConditionChanges = [];

			var mNewConditionState = mDeltaInfo.changedState;
			var mPreviousConditionState = mDeltaInfo.existingState;
			var oAdaptationControl = mDeltaInfo.control;
			var aPropertyInfo = mDeltaInfo.propertyInfo;

			for (var sFieldPath in mNewConditionState) {
				var bValidProperty = FlexUtil._hasProperty(aPropertyInfo, sFieldPath);
				if (!bValidProperty) {
					Log.warning("property '" + sFieldPath + "' not supported");
					continue;
				}

				var aFilterConditionChanges = FlexUtil._diffConditionPath(sFieldPath, mNewConditionState[sFieldPath], mPreviousConditionState[sFieldPath], oAdaptationControl);
				aConditionChanges = aConditionChanges.concat(aFilterConditionChanges);
			}

			return aConditionChanges;
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

		/**
		* Generates a set of changes based on the given conditions
		*
		* @public
		* @param {array} sFieldPath The relevant fieldPath
		* @param {array} aOrigConditions The conditions after they have been changed
		* @param {function} aOrigShadowConditions The conditions before they have been changed
		* @param {object} oControl Control instance which is being used to generate the changes
		*
		* @returns {array} Array containing the delta based created changes
		*/
		_diffConditionPath: function(sFieldPath, aOrigConditions, aOrigShadowConditions, oControl){
			var oChange, aChanges = [];
			var aConditions = aOrigConditions;
			var aShadowConditions = aOrigShadowConditions ? aOrigShadowConditions : [];


			if (deepEqual(aConditions, aShadowConditions)) {
				return aChanges;
			}

			var fnRemoveSameConditions = function(aConditions, aShadowConditions){
				var bRunAgain;

				do  {
					bRunAgain = false;

					for (var i = 0; i < aConditions.length; i++) {

						var nConditionIdx = FilterOperatorUtil.indexOfCondition(aConditions[i], aShadowConditions);
						if (nConditionIdx > -1) {

							aConditions.splice(i, 1);
							aShadowConditions.splice(nConditionIdx, 1);
							bRunAgain = true;
							break;
						}
					}
				}  while (bRunAgain);
			};

			fnRemoveSameConditions(aConditions, aShadowConditions);

			if ((aConditions.length > 0) || (aShadowConditions.length > 0)) {

				aShadowConditions.forEach(function(oCondition) {
					oChange = FlexUtil.createConditionChange("removeCondition", oControl, sFieldPath, oCondition);
					if (oChange) {
						aChanges.push(oChange);
					}
				});

				aConditions.forEach(function(oCondition) {
					oChange = FlexUtil.createConditionChange("addCondition", oControl, sFieldPath, oCondition);
					if (oChange) {
						aChanges.push(oChange);
					}
				});

			}

			return aChanges;
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
