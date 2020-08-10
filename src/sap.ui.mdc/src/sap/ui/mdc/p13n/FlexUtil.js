/*
* ! ${copyright}
*/
sap.ui.define([
	'sap/base/util/array/diff', 'sap/base/util/deepEqual','sap/ui/mdc/condition/FilterOperatorUtil'
], function (diff, deepEqual, FilterOperatorUtil) {
	"use strict";

	var FlexUtil = {

		/**
		* Generates a set of changes based on the given arrays for a specified control
		*
		* @public
		* @param {array} aExistingArray The array before changes have been done
		* @param {array} aExistingArray The array after changes have been done
		* @param {function} fnSymBol A function which is being used to distinct which attributes within the object are relevant to diff
		* @param {object} oControl Control instance which is being used to generate the changes
		* @param {object} mChangeOperations map Containg the changeTypes for add/remove/move changeTypes
		* @param {boolean} bIgnoreIndex Determines whether the change should include the index (false by default)
		*
		* @returns {array} Array containing the delta based created changes
		*/
		getArrayDeltaChanges: function (aExistingArray, aChangedArray, fnSymBol, oControl, mChangeOperations, bIgnoreIndex) {

			var sInsertOperation = mChangeOperations["add"];
			var sRemoveOperation = mChangeOperations["remove"];
			var sMoveOperation = mChangeOperations["move"];

			var aResults = diff(aExistingArray, aChangedArray, fnSymBol);
			// Function to match field with exising field in the given array
			var fMatch = function (oField, aArray) {
				return aArray.filter(function (oExistingField) {
					return oExistingField && (oExistingField.name === oField.name);
				})[0];
			};
			// Function to extract change content from a field/property
			// TODO: move this to appropriate settings (e.g. TableSettings) instance
			var fGetChangeContent = function (oProperty) {
				var oChangeContent = {
					name: oProperty.name
				};
				// Index
				if (oProperty.index >= 0 && !bIgnoreIndex) {
					oChangeContent.index = oProperty.index;
				}
				// Role
				if (oProperty.role) {
					oChangeContent.role = oProperty.role;
				}
				// SortOrder
				if (oProperty.hasOwnProperty("descending")) {
					oChangeContent.descending = oProperty.descending === "true" || oProperty.descending === true;
				}

				return oChangeContent;
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
						aChanges.push(this.createAddRemoveChange(oControl, sRemoveOperation, fGetChangeContent(oExistingProp)));
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
						aChanges.push(this.createMoveChange(oExistingProp.id, oExistingProp.name, oResult.index, sMoveOperation, oControl, sMoveOperation !== "moveSort"));
						return;
					}
				}

				aChanges.push(this.createAddRemoveChange(oControl, oResult.type === "delete" ? sRemoveOperation : sInsertOperation, fGetChangeContent(oProp)));

			}.bind(this));
			return aChanges;
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
		getConditionDeltaChanges: function(sFieldPath, aOrigConditions, aOrigShadowConditions, oControl){
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

		handleChanges: function (aChanges) {
			return new Promise(function (resolve, reject) {
				sap.ui.require([
					"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
				], function (ControlPersonalizationWriteAPI) {
					ControlPersonalizationWriteAPI.add({
						changes: aChanges
					}).then(function (aDirtyChanges) {
						resolve(aDirtyChanges);
					}, reject);
				});
			});
		}
	};
	return FlexUtil;
});
