/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/each",
	"sap/base/util/isPlainObject",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/write/_internal/condenser/classifications/LastOneWins",
	"sap/ui/fl/write/_internal/condenser/classifications/Reverse",
	"sap/ui/fl/write/_internal/condenser/classifications/Update",
	"sap/ui/fl/write/_internal/condenser/UIReconstruction",
	"sap/ui/fl/write/_internal/condenser/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/performance/Measurement",
	"sap/base/util/restricted/_isEqual"
], function(
	each,
	isPlainObject,
	ObjectPath,
	Log,
	JsControlTreeModifier,
	Element,
	CondenserClassification,
	ChangesUtils,
	UIChange,
	States,
	LastOneWins,
	Reverse,
	Update,
	UIReconstruction,
	CondenserUtils,
	FlUtils,
	Measurement,
	_isEqual
) {
	"use strict";

	/**
	 * Condenser that reduces a number of changes to a bare minimum.
	 *
	 * @namespace
	 * @alias sap.ui.fl.write._internal.condenser.Condenser
	 * @author SAP SE
	 * @version ${version}
	 */
	var Condenser = {};

	var UNCLASSIFIED = "unclassified";

	/**
	 * Classification of the non-index-related changes
	 *
	 * @type {{lastOneWins: addLastOneWinsChange, reverse: addReverseChange}}
	 */
	var NON_INDEX_RELEVANT = {
		lastOneWins: LastOneWins,
		reverse: Reverse,
		update: Update
	};

	var PROPERTIES_WITH_SELECTORS = ["affectedControl", "sourceContainer", "targetContainer", "updateControl"];

	/**
	 * Verify 'move' subtype has already been added to the data structure before 'create' subtype and they both belong to the same targetContainer
	 *
	 * @param {object} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'move' subtype has been added to the data structure before 'create' subtype
	 */
	function isCreateAfterMoveSubtype(mSubtypes, oCondenserInfo) {
		var aMoveSubType = mSubtypes[CondenserClassification.Move];
		return oCondenserInfo.classification === CondenserClassification.Create
			&& aMoveSubType
			&& aMoveSubType[aMoveSubType.length - 1].targetContainer === oCondenserInfo.targetContainer;
	}

	/**
	 * Verify 'destroy' subtype has already been added to the data structure before 'move' subtype
	 *
	 * @param {object} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'destroy' subtype has been added to the data structure before 'move' subtype
	 */
	function isMoveAfterDestroySubtype(mSubtypes, oCondenserInfo) {
		return oCondenserInfo.classification === CondenserClassification.Move && mSubtypes[CondenserClassification.Destroy];
	}

	/**
	 * Verify 'destroy' subtype has already been added to the data structure before 'create' subtype
	 *
	 * @param {object} mClassifications - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'move' subtype has been added to the data structure before 'create' subtype
	 */
	function isCreateAfterDestroySubtype(mClassifications, oCondenserInfo) {
		return oCondenserInfo.classification === CondenserClassification.Create && mClassifications[CondenserClassification.Destroy];
	}

	/**
	 * Adds an index-related change to the data structures.
	 *
	 * @param {object} mClassifications - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance that will be added to the array
	 * @returns {Promise} resolves when the change is added to the data structure
	 */
	function addIndexRelatedChange(mClassifications, mUIReconstructions, oCondenserInfo, oChange) {
		if (
			!isMoveAfterDestroySubtype(mClassifications, oCondenserInfo)
			&& !isCreateAfterDestroySubtype(mClassifications, oCondenserInfo)
		) {
			var sClassification = oCondenserInfo.classification;
			if (!mClassifications[sClassification]) {
				oCondenserInfo.change = oChange;
				oChange.condenserState = "select";
				mClassifications[sClassification] = [oCondenserInfo];
			} else {
				oChange.condenserState = "delete";
			}
			mClassifications[sClassification][0].updateChange = oChange;
		} else {
			oChange.condenserState = "delete";
		}

		if (
			isCreateAfterMoveSubtype(mClassifications, oCondenserInfo)
			|| isCreateAfterDestroySubtype(mClassifications, oCondenserInfo)
		) {
			if (mClassifications[CondenserClassification.Move]) {
				mClassifications[CondenserClassification.Move].forEach(function(oCondenserInfo) {
					oCondenserInfo.change.condenserState = "delete";
				});
				delete mClassifications[CondenserClassification.Move];
			}
			if (mClassifications[CondenserClassification.Destroy]) {
				mClassifications[CondenserClassification.Destroy].forEach(function(oCondenserInfo) {
					oCondenserInfo.change.condenserState = "delete";
				});
				delete mClassifications[CondenserClassification.Destroy];
			}
		}
		return UIReconstruction.addChange(mUIReconstructions, oCondenserInfo);
	}

	/**
	 * Adds a non-index related change to the map.
	 * @param {object} mClassifications - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance that will be added to the array
	 * @returns {Promise} returns when change is added to the map
	 */
	function addNonIndexRelatedChange(mClassifications, oCondenserInfo, oChange) {
		mClassifications[oCondenserInfo.classification] ||= {};
		var mProperties = mClassifications[oCondenserInfo.classification];
		NON_INDEX_RELEVANT[oCondenserInfo.classification].addToChangesMap(mProperties, oCondenserInfo, oChange);
		return Promise.resolve();
	}

	/**
	 * Adds a classified change to the data structures.
	 *
	 * @param {object} mTypes - Map of classification types that holds key-value pairs. A key is a unique identifier. A value is a nested map which contains non-index-related and index-related reduced changes
	 * @param {object} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aIndexRelatedChanges - Array of all index related changes
	 * @param {object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance that will be added to the array
	 * @returns {Promise} returns when change is added to the data structures
	 */
	function addClassifiedChange(mTypes, mUIReconstructions, aIndexRelatedChanges, oCondenserInfo, oChange) {
		mTypes[oCondenserInfo.type] ||= {};
		var mClassifications = mTypes[oCondenserInfo.type];

		if (oCondenserInfo.type === CondenserUtils.NOT_INDEX_RELEVANT) {
			return addNonIndexRelatedChange(mClassifications, oCondenserInfo, oChange);
		}

		aIndexRelatedChanges.push(oChange);
		// with custom aggregations multiple aggregations can have the same affectedControl
		mClassifications[oCondenserInfo.targetAggregation] ||= {};
		return addIndexRelatedChange(mClassifications[oCondenserInfo.targetAggregation], mUIReconstructions, oCondenserInfo, oChange);
	}

	/**
	 * Adds an unclassified change to the data structure.
	 *
	 * @param {object} mTypes - Map of change types that holds key-value pairs. A key is a unique identifier. A value is an array object that contains all unclassified changes
	 * @param {string} sKey - Key of the "unclassified" map that reflects the fact that the delivered change is not classified
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
	 */
	function addUnclassifiedChange(mTypes, sKey, oChange) {
		mTypes[sKey] ||= [];
		mTypes[sKey].push(oChange);
		oChange.condenserState = "select";
	}

	/**
	 * Retrieves the condenser information from the change handler
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
	 * @returns {Promise.<object>} - Resolves with the condenser information or undefined
	 */
	function getCondenserInfoFromChangeHandler(oAppComponent, oChange) {
		var sControlId = JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent);
		var oControl = Element.getElementById(sControlId);
		if (oControl) {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent,
				view: FlUtils.getViewForControl(oControl)
			};
			var mControl = ChangesUtils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
			return Promise.resolve(ChangesUtils.getChangeHandler(oChange, mControl, mPropertyBag))
			.then(function(oChangeHandler) {
				if (oChangeHandler && typeof oChangeHandler.getCondenserInfo === "function") {
					return oChangeHandler.getCondenserInfo(oChange, mPropertyBag);
				}
				return undefined;
			})
			.then(function(oCondenserInfo) {
				// changes in templates get the binding holder as selector but have the original selector
				// inside the template as dependent selector. As there might be multiple different controls in the template
				// the selectors have to be changed back before the maps gets created
				if (oCondenserInfo && mControl.bTemplateAffected) {
					replaceTemplateSelector(oCondenserInfo, oChange);
				}
				return oCondenserInfo;
			})
			.catch(function() {
				return undefined;
			});
		}

		return Promise.resolve();
	}

	function replaceTemplateSelector(oCondenserInfo, oChange) {
		var oOriginalSelector = oChange.getOriginalSelector();
		var oTemplateSelector = oChange.getSelector();
		PROPERTIES_WITH_SELECTORS.forEach(function(sPropertyName) {
			if (oCondenserInfo[sPropertyName] && oCondenserInfo[sPropertyName] === oTemplateSelector) {
				oCondenserInfo[sPropertyName] = oOriginalSelector;
			}
		});
	}

	/**
	 * Retrieves the classification types map.
	 *
	 * @param {object} mReducedChanges - Map of reduced changes
	 * @param {object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @returns {object} Classification types map
	 */
	function getTypesMap(mReducedChanges, oCondenserInfo, oChange, oAppComponent) {
		var sAffectedControlId = oCondenserInfo !== undefined
			? oCondenserInfo.affectedControl
			: JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent);
		mReducedChanges[sAffectedControlId] ||= {};
		// If an updateControl is present, it means that the update has a different selector from the other changes
		// (e.g. iFrame added as Section) and the changes must be brought to the same group (= same affected control)
		if (oCondenserInfo && oCondenserInfo.updateControl) {
			var sUpdateControlId = oCondenserInfo.updateControl;
			var aPath = [CondenserUtils.NOT_INDEX_RELEVANT, CondenserClassification.Update, oCondenserInfo.uniqueKey];
			var oUpdateCondenserInfo = ObjectPath.get(aPath, mReducedChanges[sUpdateControlId]);
			if (oUpdateCondenserInfo) {
				ObjectPath.set(aPath, oUpdateCondenserInfo, mReducedChanges[sAffectedControlId]);
				delete mReducedChanges[sUpdateControlId][CondenserUtils.NOT_INDEX_RELEVANT]
				[CondenserClassification.Update][oCondenserInfo.uniqueKey];
			}
		}
		return mReducedChanges[sAffectedControlId];
	}

	/**
	 * Defines the data structures that contain reduced changes and UI reconstructions for index-related changes.
	 *
	 * 		mReducedChanges: {
	 * 			"<selectorId>": {
	 * 				"<type>":
	 * 					"<classification>":
	 * 						"<uniqueKey>": [<sap.ui.fl.apply._internal.flexObjects.FlexObject>]
	 * 				...
	 * 				"nonIndexRelated": {
	 * 					"lastOneWins" : {
	 * 						"label": [oChange1]
	 * 					},
	 * 					"reverse": {
	 * 						"visible": [oChange2, oChange3],
	 * 						"stashed": [oChange4, oChange5]
	 * 					}
	 * 				}
	 * 				...
	 * 				"indexRelated": {
	 * 					"<targetAggregation>": {
	 * 						"move": [oCondenserInfo],
	 * 						"create": [oCondenserInfo],
	 * 						"destroy": [oCondenserInfo]
	 * 					}
	 * 				}
	 * 				...
	 * 				"unclassified" : [oChange6, oChange7, oChange8]
	 * 			}
	 * 		}
	 *
	 * 		mUIReconstructions: {
	 * 			"<selectorId>": {
	 * 				"<aggregationName>": {
	 * 					"<targetUI>": [<string>],
	 * 					"<initialUI>": [<string>]
	 * 				}
	 * 			}
	 * 		}
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {object} mReducedChanges - Map of reduced changes
	 * @param {object} mUIReconstructions - Map of UI reconstructions
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aIndexRelatedChanges - Array of all index related changes
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - All Change instances
	 * @returns {Promise} Resolves when all changes were added to the maps
	 */
	function defineMaps(oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, aChanges) {
		return aChanges.reduce(function(oPromise, oChange) {
			return oPromise.then(addChangeToMap.bind(this, oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, oChange));
		}.bind(this), Promise.resolve());
	}

	function addChangeToMap(oAppComponent, mReducedChanges, mUIReconstructions, aIndexRelatedChanges, oChange) {
		return getCondenserInfoFromChangeHandler(oAppComponent, oChange).then(function(oCondenserInfo) {
			changeSelectorsToIdsInCondenserInfo(oCondenserInfo, oAppComponent);
			var mTypes = getTypesMap(mReducedChanges, oCondenserInfo, oChange, oAppComponent);
			if (oCondenserInfo !== undefined) {
				addType(oCondenserInfo);
				return addClassifiedChange(mTypes, mUIReconstructions, aIndexRelatedChanges, oCondenserInfo, oChange)
				.then(function() {
					if (oCondenserInfo.update) {
						condenseUpdateChange(mTypes, oCondenserInfo, oChange);
					}
				});
			}
			addUnclassifiedChange(mTypes, UNCLASSIFIED, oChange);
			mReducedChanges[UNCLASSIFIED] = true;
			return undefined;
		});
	}

	function addType(oCondenserInfo) {
		if (NON_INDEX_RELEVANT[oCondenserInfo.classification]) {
			oCondenserInfo.type = CondenserUtils.NOT_INDEX_RELEVANT;
		} else {
			oCondenserInfo.type = CondenserUtils.INDEX_RELEVANT;
		}
	}

	function changeSelectorsToIdsInCondenserInfo(oCondenserInfo, oAppComponent) {
		PROPERTIES_WITH_SELECTORS.forEach(function(sPropertyName) {
			if (oCondenserInfo && oCondenserInfo[sPropertyName]) {
				oCondenserInfo[sPropertyName] = JsControlTreeModifier.getControlIdBySelector(oCondenserInfo[sPropertyName], oAppComponent);
			}
		});
	}

	/**
	 * Handles change with specific update function on CondenserInfo (e.g. addIFrame)
	 * The update change is marked for deletion, since the original change will be updated with its content
	 * If the original change is marked for deletion, the update can be skipped
	 * If the original change is already persisted, the new content is an update
	 *
	 * @param {object} mTypes - Map with the changes
	 * @param {object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - The change that is getting updated
	 */
	function condenseUpdateChange(mTypes, oCondenserInfo, oChange) {
		var aPath = [CondenserUtils.NOT_INDEX_RELEVANT, CondenserClassification.Update, oCondenserInfo.uniqueKey];
		var oUpdateCondenserInfo = ObjectPath.get(aPath, mTypes);
		if (oUpdateCondenserInfo) {
			oUpdateCondenserInfo.change.condenserState = "delete";
			if (oChange.condenserState === "delete") {
				return;
			}
			if (oChange.isPersisted()) {
				oChange.condenserState = "update";
			}
			oCondenserInfo.update(oChange, oUpdateCondenserInfo.updateContent);
			oChange.setState(States.LifecycleState.UPDATED);
			delete mTypes[CondenserUtils.NOT_INDEX_RELEVANT][CondenserClassification.Update][oCondenserInfo.uniqueKey];
		}
	}

	/**
	 * Retrieves an array of changes from the delivered data structure.
	 *
	 * @param {object} mObjects - Delivered data structure
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of changes
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} All necessary changes in the map of reduced changes
	 */
	 function getChanges(mObjects, aChanges) {
		each(mObjects, function(sKey, vSubObjects) {
			if (NON_INDEX_RELEVANT[sKey] && NON_INDEX_RELEVANT[sKey].getChangesFromMap) {
				NON_INDEX_RELEVANT[sKey].getChangesFromMap(mObjects, sKey).forEach(function(oChange) {
					aChanges.push(oChange);
				});
			} else if (isPlainObject(vSubObjects)) {
				return getChanges(vSubObjects, aChanges);
			} else if (Array.isArray(vSubObjects)) {
				vSubObjects.forEach(function(oObject) {
					if (oObject instanceof UIChange) {
						aChanges.push(oObject);
					} else {
						aChanges.push(oObject.change);
					}
				});
			}
		});
		return aChanges;
	}

	/**
	 * Retrieves an array of changes from the reduced changes map.
	 *
	 * @param {object} mReducedChanges - Map of reduced changes
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of the reduced changes
	 */
	function getAllReducedChanges(mReducedChanges) {
		return getChanges(mReducedChanges, []);
	}

	/**
	 * Retrieves an array of index-related changes from the array of reduced changes.
	 *
	 * @param {object} mReducedChanges - Map of reduced changes
	 * @param {object[]} aCondenserInfos - Empty array object that will be filled with condenser info objects
	 * @returns {object[]} Array of objects that contain condenser-specific information and change instance
	 */
	function getCondenserInfos(mReducedChanges, aCondenserInfos) {
		each(mReducedChanges, function(sKey, vSubObjects) {
			if (isPlainObject(vSubObjects)) {
				getCondenserInfos(vSubObjects, aCondenserInfos);
			} else if (Array.isArray(vSubObjects)) {
				vSubObjects.forEach(function(oObject) {
					if (!(oObject instanceof UIChange)) {
						aCondenserInfos.push(oObject);
					}
				});
			}
		});
		return aCondenserInfos;
	}

	/**
	 * Sorts an array of reduced changes in the initial order.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of changes
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aReducedChanges - Array of reduced changes
	 */
	function sortByInitialOrder(aChanges, aReducedChanges) {
		aReducedChanges.sort(function(a, b) {
			return aChanges.indexOf(a) - aChanges.indexOf(b);
		});
	}

	function sortCondenserInfosByInitialOrder(aChanges, aCondenserInfos) {
		aCondenserInfos.sort(function(a, b) {
			return aChanges.indexOf(a.change) - aChanges.indexOf(b.change);
		});
	}

	function addAllIndexRelatedChanges(aReducedChanges, aIndexRelatedChanges) {
		var aReducedChangeIds = aReducedChanges.map(function(oChange) {
			return oChange.getId();
		});

		aIndexRelatedChanges.forEach(function(oChange) {
			if (aReducedChangeIds.indexOf(oChange.getId()) === -1) {
				aReducedChanges.push(oChange);
			}
		});
	}

	/**
	 * Adding a change of the same classification to the map will only add it as updateChange to the condenser info,
	 * which means that the condenser info holds the first (updateChange) and the last (change) change of the same classification.
	 * If there is an updateChange attached to the condenser info object and that change is already persisted,
	 * that change will be used over the newest change.
	 *
	 * @param {object[]} aCondenserInfos - Condenser info objects
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aReducedChanges - Array of reduced changes
	 * @param {object[]} aReducedIndexRelatedChangesPerContainer - Array with index related reduced changes per container
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Updated reduced changes
	 */
	function handleChangeUpdate(aCondenserInfos, aReducedChanges, aReducedIndexRelatedChangesPerContainer) {
		aCondenserInfos.forEach(function(oCondenserInfo) {
			var oUpdateChange = oCondenserInfo.updateChange;
			if (
				oUpdateChange
				// "Update" only modifies the change content. If we support other
				// updates on a change, this code has to be adjusted.
				&& !_isEqual(oUpdateChange.getContent(), oCondenserInfo.change.getContent())
				&& oUpdateChange.getState() !== States.LifecycleState.NEW
			) {
				var oLastChange = oCondenserInfo.change;
				if (oUpdateChange.getId() !== oLastChange.getId()) {
					var oNewContent = oLastChange.getContent();
					oUpdateChange.setContent(oNewContent);
					oUpdateChange.setRevertData(oLastChange.getRevertData());
					oLastChange.condenserState = "delete";
					aReducedChanges = aReducedChanges.map(function(oChange) {
						if (oChange.getId() === oLastChange.getId()) {
							return oUpdateChange;
						}
						return oChange;
					});
					aReducedIndexRelatedChangesPerContainer.forEach(function(aReducedIndexRelatedChanges, iIndex) {
						aReducedIndexRelatedChangesPerContainer[iIndex] = aReducedIndexRelatedChanges.map(function(oChange) {
							if (oChange.getId() === oLastChange.getId()) {
								return oUpdateChange;
							}
							return oChange;
						});
					});
				} else {
					oUpdateChange.setState(States.LifecycleState.UPDATED);
				}
				oUpdateChange.condenserState = "update";
			}
		});
		return aReducedChanges;
	}

	/**
	 * The condensing algorithm gets an array of changes that should be reduced to the bare minimum.
	 * The steps of the algorithm are:
	 * (1) Before starting the iteration process through the array of changes, the condenser reverses the array of changes to start the iteration backwards.
	 * By iterating through the array of changes, the condenser defines two data structures.
	 * The first one contains reduced changes that are stored according to the classification per control.
	 * The second one contains UI reconstructions of the corresponding UI parts.
	 * (2) Afterwards, the target and initial UI reconstructions will be compared.
	 * If they are equal, the corresponding index-related changes will be removed from the data structure, because they are redundant.
	 * (3) Then the target indices of the remaining index-related changes will be updated.
	 * (4) After that, all remaining changes will be collected and sorted by the order in which the condenser got the changes initially.
	 * (5) The index-related changes will be picked out from the previously sorted array of the reduced changes.
	 * After that they will be sorted until the look and feel of the UI fits the target UI reconstruction.
	 * (6) Finally, if it is required the index-related changes will be swapped in the array of the reduced changes.
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of changes
	 * @returns {Promise} Promise resolved with the reduced array of changes
	 */
	Condenser.condense = function(oAppComponent, aChanges) {
		Measurement.start("Condenser_overall", "Condenser overall - CondenserClass", ["sap.ui.fl", "Condenser"]);
		var mReducedChanges = {};
		var mUIReconstructions = {};
		var aAllIndexRelatedChanges = [];

		// filter out objects which are not of type change, e.g. Variants, AppVariants, AppVariantInlineChange
		// or are not applied (e.g. not part of the active variant) or were deleted
		var aNotCondensableChanges = [];
		var aCondensableChanges = [];
		aChanges.slice(0).reverse().forEach(function(oChange) {
			if (oChange instanceof UIChange) {
				if (oChange.getState() === States.LifecycleState.DELETED) {
					oChange.condenserState = "delete";
				} else if (oChange.isSuccessfullyApplied()) {
					aCondensableChanges.push(oChange);
				} else {
					aNotCondensableChanges.push(oChange);
				}
			} else {
				aNotCondensableChanges.push(oChange);
			}
		});

		Measurement.start("Condenser_defineMaps", "defining of maps - CondenserClass", ["sap.ui.fl", "Condenser"]);

		return defineMaps(oAppComponent, mReducedChanges, mUIReconstructions, aAllIndexRelatedChanges, aCondensableChanges)

		.then(function() {
			Measurement.end("Condenser_defineMaps");
			var bUnclassifiedChanges = mReducedChanges[UNCLASSIFIED];
			if (!bUnclassifiedChanges) {
				UIReconstruction.compareAndUpdate(mReducedChanges, mUIReconstructions);
			}
			var aReducedChanges = getAllReducedChanges(mReducedChanges);

			// with unclassified changes no index relevant changes can be reduced
			if (bUnclassifiedChanges) {
				aAllIndexRelatedChanges.forEach(function(oChange) {
					// If the index-relevant change is only being updated, this does not cause side effects
					// If they are being removed (condenserState "delete"), they must be set to "select"
					if (oChange.condenserState !== "update") {
						oChange.condenserState = "select";
					}
				});
				addAllIndexRelatedChanges(aReducedChanges, aAllIndexRelatedChanges);
			}

			aReducedChanges = aReducedChanges.concat(aNotCondensableChanges);
			sortByInitialOrder(aChanges, aReducedChanges);

			if (!bUnclassifiedChanges) {
				Measurement.start("Condenser_handleIndexRelatedChanges", "handle index related changes - CondenserClass", ["sap.ui.fl", "Condenser"]);

				var bSuccess = true;
				var aCondenserInfos = getCondenserInfos(mReducedChanges, []);
				sortCondenserInfosByInitialOrder(aChanges, aCondenserInfos);
				var aReducedIndexRelatedChangesPerContainer;
				try {
					Measurement.start("Condenser_sort", "sort index related changes - CondenserClass", ["sap.ui.fl", "Condenser"]);
					aReducedIndexRelatedChangesPerContainer = UIReconstruction.sortIndexRelatedChanges(mUIReconstructions, aCondenserInfos);
				} catch (oError) {
					// an error here has to be treated similar to if there were some unclassified changes
					// TODO: could be improved to only add all the changes of that specific container
					Log.error(`Error during Condensing: ${oError.message}`, "No Condensing performed for index-relevant changes.");
					bSuccess = false;
				}
				Measurement.end("Condenser_sort");

				if (bSuccess) {
					// during the simulation more changes can become obsolete
					aReducedChanges = aReducedChanges.filter(function(oChange) {
						return oChange.condenserState !== "delete";
					});
					aCondenserInfos = aCondenserInfos.filter(function(oCondenserInfo) {
						return oCondenserInfo.change.condenserState !== "delete";
					});
					// until now aReducedChanges still has the newer changes.
					// after replacing them with the older change they have to be sorted again
					aReducedChanges = handleChangeUpdate(aCondenserInfos, aReducedChanges, aReducedIndexRelatedChangesPerContainer);
					sortByInitialOrder(aChanges, aReducedChanges);
					// sort the different containers independently
					aReducedIndexRelatedChangesPerContainer.forEach(function(aReducedIndexRelatedChanges) {
						UIReconstruction.swapChanges(aReducedIndexRelatedChanges, aReducedChanges);
					});
				} else {
					aAllIndexRelatedChanges.forEach(function(oChange) {
						oChange.condenserState = "select";
					});
					addAllIndexRelatedChanges(aReducedChanges, aAllIndexRelatedChanges);
					sortByInitialOrder(aChanges, aReducedChanges);
				}

				Measurement.end("Condenser_handleIndexRelatedChanges");
			}

			Measurement.end("Condenser_overall");
			return aReducedChanges;
		});
	};

	return Condenser;
});