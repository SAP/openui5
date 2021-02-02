/*
* ! ${copyright}
*/
sap.ui.define([
	'sap/base/util/array/diff', 'sap/base/util/deepEqual','sap/ui/mdc/condition/FilterOperatorUtil', 'sap/base/Log'
], function (diff, deepEqual, FilterOperatorUtil, Log) {
	"use strict";

	var FlexUtil = {

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
		getArrayDeltaChanges: function (mDeltaInfo) {

			var aExistingArray = mDeltaInfo.existingState;
			var aChangedArray = mDeltaInfo.changedState;
			var oControl = mDeltaInfo.control;
			var sInsertOperation = mDeltaInfo.changeOperations.add;
			var sRemoveOperation = mDeltaInfo.changeOperations.remove;
			var sMoveOperation = mDeltaInfo.changeOperations.move;
			var sGenerator = mDeltaInfo.generator;

			var aDeltaAttributes = mDeltaInfo.deltaAttributes || [];

			var fnSymbol = function(o) {
				var sDiff = "";
				aDeltaAttributes.forEach(function(sAttribute){
					sDiff = sDiff + o[sAttribute];
				});
				return sDiff;
			};

			var aResults = diff(aExistingArray, aChangedArray, fnSymbol);
			// Function to match field with exising field in the given array
			var fMatch = function (oField, aArray) {
				return aArray.filter(function (oExistingField) {
					return oExistingField && (oExistingField.name === oField.name);
				})[0];
			};

			var aChanges = [];
			var aProcessedArray = aExistingArray.slice(0);

			aResults.forEach(function (oResult) {
				// Begin --> hack for handling result returned by diff
				if (oResult.type === "delete" && aProcessedArray[oResult.index] === undefined) {
					aProcessedArray.splice(oResult.index, 1);
					return;
				}

				var oProp, oExistingProp, iLength;
				if (oResult.type === "insert") {
					oExistingProp = fMatch(aChangedArray[oResult.index], aProcessedArray);
					if (oExistingProp) {
						oExistingProp.index = aProcessedArray.indexOf(oExistingProp);
						aProcessedArray.splice(oExistingProp.index, 1, undefined);
						aChanges.push(FlexUtil.createAddRemoveChange(oControl, sRemoveOperation, FlexUtil._getChangeContent(oExistingProp, aDeltaAttributes), sGenerator));
					}
				}
				// End hack
				oProp = oResult.type === "delete" ? aProcessedArray[oResult.index] : aChangedArray[oResult.index];
				oProp.index = oResult.index;
				if (oResult.type === "delete") {
					aProcessedArray.splice(oProp.index, 1);
				} else {
					aProcessedArray.splice(oProp.index, 0, oProp);
				}
				// Move operation shows up as insert followed by delete OR delete followed by insert
				if (sMoveOperation) {
					iLength = aChanges.length;
					// Get the last added change
					if (iLength) {
						oExistingProp = aChanges[iLength - 1];
						oExistingProp = oExistingProp ? oExistingProp.changeSpecificData.content : undefined;
					}
					// Matching property exists with a different index --> then this is a move operation
					if (oExistingProp && oExistingProp.name === oProp.name && oResult.index != oExistingProp.index) {
						// remove the last insert/delete operation
						aChanges.pop();
						aChanges.push(FlexUtil.createMoveChange(oExistingProp.id, oExistingProp.name, oResult.index, sMoveOperation, oControl, sMoveOperation !== "moveSort", sGenerator));
						return;
					}
				}

				aChanges.push(FlexUtil.createAddRemoveChange(oControl, oResult.type === "delete" ? sRemoveOperation : sInsertOperation, FlexUtil._getChangeContent(oProp, aDeltaAttributes), sGenerator));

			});
			return aChanges;
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
				aConditionChanges = aConditionChanges.concat(FlexUtil._diffConditionPath(sFieldPath, mNewConditionState[sFieldPath], mPreviousConditionState[sFieldPath], oAdaptationControl));
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

		createAddRemoveChange: function(oControl, sOperation, oContent){
			var oAddRemoveChange = {
				selectorElement: oControl,
				changeSpecificData: {
					changeType: sOperation,
					content: oContent
				}
			};
			return oAddRemoveChange;
		},

		createMoveChange: function (sId, sPropertyName, iNewIndex, sMoveOperation, oControl, bPersistId) {
			var oMoveChange =  {
				selectorElement: oControl,
				changeSpecificData: {
					changeType: sMoveOperation,
					content: {
						id: sId,
						name: sPropertyName,
						index: iNewIndex
					}
				}
			};

			if (!bPersistId) {
				delete oMoveChange.changeSpecificData.content.id;
			}

			return oMoveChange;
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
