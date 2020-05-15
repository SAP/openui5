/*!
 * ${copyright}
 */

/* global Map */
sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/performance/Measurement"
], function(
	JsControlTreeModifier,
	Core,
	Utils,
	Change,
	FlUtils,
	Measurement
) {
	"use strict";

	/**
	 * Condenser that reduces a number of changes to a bare minimum.
	 *
	 * @namespace
	 * @alias sap.ui.fl.write._internal.Condenser
	 * @author SAP SE
	 * @version ${version}
	 */
	var Condenser = {};

	var TARGET_UI = "targetUI";
	var INITIAL_UI = "initialUI";
	var PLACEHOLDER = "X";
	var UNCLASSIFIED = "unclassified";

	/**
	 * Classification of the non-index-related changes
	 *
	 * @type {{lastOneWins: addLastOneWinsChange, reverse: addReverseChange}}
	 */
	var NON_INDEX_RELATED = {
		lastOneWins: addLastOneWinsChange,
		reverse: addReverseChange
	};

	var INDEX_RELATED = {
		move: {
			add: addMoveChange,
			simulate: simulateMove
		},
		destroy: {
			add: addDestroyChange,
			simulate: simulateDestroy
		},
		create: {
			add: addCreateChange,
			simulate: simulateCreate
		}
	};

	/**
	 * Retrieves the initial UI reconstruction of the corresponding container.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {string} sContainerKey - Selector ID of the container
	 * @param {string} sAggregationName - Name of the aggregation
	 * @param {string[]} aContainerElements - Array of the container element IDs
	 * @returns {string[]} Array of container element IDs of initial UI reconstruction
	 */
	function getInitialUIContainerElementIds(mUIReconstructions, sContainerKey, sAggregationName, aContainerElements) {
		if (!mUIReconstructions.has(sContainerKey)) {
			mUIReconstructions.set(sContainerKey, new Map());
		}
		var mUIStates = mUIReconstructions.get(sContainerKey);
		if (!mUIStates.has(sAggregationName)) {
			mUIStates.set(sAggregationName, new Map());
		}
		var mUIAggregationState = mUIStates.get(sAggregationName);
		if (!mUIAggregationState.has(TARGET_UI)) {
			mUIAggregationState.set(TARGET_UI, aContainerElements);
		}
		if (!mUIAggregationState.has(INITIAL_UI)) {
			mUIAggregationState.set(INITIAL_UI, aContainerElements.slice(0));
		}
		return mUIAggregationState.get(INITIAL_UI);
	}

	/**
	 * Shifts an element from an old index to a new one within the array of elements.
	 *
	 * @param {string[]} aElements - Array of elements
	 * @param {int} iOldIndex - Old index of the element
	 * @param {int} iNewIndex - New index of the element
	 */
	function shiftElement(aElements, iOldIndex, iNewIndex) {
		aElements.splice(iNewIndex, 0, aElements.splice(iOldIndex, 1)[0]);
	}

	/**
	 * Retrieves the aggregation from the container instance and returns all the Ids of the controls
	 *
	 * @param {string} sContainerId - Container Id
	 * @param {string} sAggregationName Name of the aggregation
	 * @returns {string[]} Array of Ids
	 */
	function getContainerElementIds(sContainerId, sAggregationName) {
		var oContainer = Core.byId(sContainerId);
		var aContainerElements = JsControlTreeModifier.getAggregation(oContainer, sAggregationName);
		return aContainerElements.map(function(oElement) {
			return oElement.getId();
		});
	}

	/**
	 * Extends the data structure that contains UI reconstructions with a 'move' change.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {Object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 */
	function addMoveChange(mUIReconstructions, oCondenserInfo) {
		var aSourceContainerElementIds = getContainerElementIds(oCondenserInfo.sourceContainer, oCondenserInfo.sourceAggregation);
		var aTargetContainerElementIds = getContainerElementIds(oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation);

		var aContainerElementIds;
		var iTargetIndex;
		if (
			oCondenserInfo.targetContainer === oCondenserInfo.sourceContainer
			&& oCondenserInfo.targetAggregation === oCondenserInfo.sourceAggregation
		) {
			aContainerElementIds = getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
			iTargetIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);
			shiftElement(aContainerElementIds, iTargetIndex, oCondenserInfo.sourceIndex);
		} else {
			aContainerElementIds = getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
			iTargetIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);
			aContainerElementIds.splice(iTargetIndex, 1);
			aContainerElementIds = getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.sourceContainer, oCondenserInfo.sourceAggregation, aSourceContainerElementIds);
			aContainerElementIds.splice(oCondenserInfo.sourceIndex, 0, oCondenserInfo.affectedControl);
		}
	}

	/**
	 * Extends the data structure that contains UI reconstructions with an 'add' change.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {Object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 */
	function addCreateChange(mUIReconstructions, oCondenserInfo) {
		var oAffectedControl = Core.byId(oCondenserInfo.affectedControl);
		var sAggregationName = oAffectedControl && oAffectedControl.sParentAggregationName || oCondenserInfo.targetAggregation;
		var aTargetContainerElementIds = getContainerElementIds(oCondenserInfo.targetContainer, sAggregationName);
		var aContainerElementIds = getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
		var iIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);

		// if the index is -1 the element was already removed by a different add change
		if (iIndex > -1) {
			aContainerElementIds.splice(iIndex, 1);
		}
	}

	/**
	 * Extends the data structure that contains UI reconstructions with an 'remove' change.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {Object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 */
	function addDestroyChange(mUIReconstructions, oCondenserInfo) {
		var aTargetContainerElementIds = getContainerElementIds(oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation);
		var aContainerElementIds = getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
		if (aContainerElementIds.length - 1 < oCondenserInfo.sourceIndex) {
			while (aContainerElementIds.length - 1 < oCondenserInfo.sourceIndex) {
				var iIndex = aContainerElementIds.length;
				aContainerElementIds.splice(aContainerElementIds.length, 0, PLACEHOLDER + iIndex);
			}
			aContainerElementIds[oCondenserInfo.sourceIndex] = oCondenserInfo.affectedControl;
		} else {
			aContainerElementIds.splice(oCondenserInfo.sourceIndex, 0, oCondenserInfo.affectedControl);
		}
	}

	/**
	 * Adds a change to the data structure.
	 *
	 * @param {Map} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {Object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 */
	function addIndexChange(mSubtypes, oCondenserInfo, oChange) {
		var sSubtype = oCondenserInfo.subtype;
		if (!mSubtypes.has(sSubtype)) {
			var aChanges = [];
			oCondenserInfo.change = oChange;
			aChanges.push(oCondenserInfo);
			mSubtypes.set(sSubtype, aChanges);
		}
	}

	/**
	 * Verify 'move' subtype has already been added to the data structure before 'create' subtype
	 *
	 * @param {Map} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'move' subtype has been added to the data structure before 'create' subtype
	 */
	function isCreateAfterMoveSubtype(mSubtypes, oCondenserInfo) {
		return oCondenserInfo.subtype === sap.ui.fl.ClassificationSubtypes.Create && mSubtypes.has(sap.ui.fl.ClassificationSubtypes.Move);
	}

	/**
	 * Verify 'destroy' subtype has already been added to the data structure before 'move' subtype
	 *
	 * @param {Map} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'destroy' subtype has been added to the data structure before 'move' subtype
	 */
	function isMoveAfterDestroySubtype(mSubtypes, oCondenserInfo) {
		return oCondenserInfo.subtype === sap.ui.fl.ClassificationSubtypes.Move && mSubtypes.has(sap.ui.fl.ClassificationSubtypes.Destroy);
	}

	/**
	 * Verify 'destroy' subtype has already been added to the data structure before 'create' subtype
	 *
	 * @param {Map} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @returns {boolean} <code>true</code> if the 'move' subtype has been added to the data structure before 'create' subtype
	 */
	function isCreateAfterDestroySubtype(mSubtypes, oCondenserInfo) {
		return oCondenserInfo.subtype === sap.ui.fl.ClassificationSubtypes.Create && mSubtypes.has(sap.ui.fl.ClassificationSubtypes.Destroy);
	}

	/**
	 * Adds an index-related change to the data structures.
	 *
	 * @param {Map} mSubtypes - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {object} oCondenserInfo - Condenser specific information that is delivered by the change handler
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 */
	function addIndexRelatedChange(mSubtypes, mUIReconstructions, oCondenserInfo, oChange) {
		if (
			!isMoveAfterDestroySubtype(mSubtypes, oCondenserInfo)
			&& !isCreateAfterDestroySubtype(mSubtypes, oCondenserInfo)
		) {
			addIndexChange(mSubtypes, oCondenserInfo, oChange);
		}

		if (
			isCreateAfterMoveSubtype(mSubtypes, oCondenserInfo)
			|| isCreateAfterDestroySubtype(mSubtypes, oCondenserInfo)
		) {
			mSubtypes.delete(sap.ui.fl.ClassificationSubtypes.Move);
			mSubtypes.delete(sap.ui.fl.ClassificationSubtypes.Destroy);
		}

		INDEX_RELATED[oCondenserInfo.subtype].add(mUIReconstructions, oCondenserInfo);
	}

	/**
	 * Adds a last-one-wins change to the data structure.
	 *
	 * @param {Map} mProperties - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {string} sUniqueKey - Unique key of the condenser-specific information
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 */
	function addLastOneWinsChange(mProperties, sUniqueKey, oChange) {
		if (!mProperties.has(sUniqueKey)) {
			var aChanges = [];
			aChanges.push(oChange);
			mProperties.set(sUniqueKey, aChanges);
		}
	}

	/**
	 * Adds a reverse change to the data structure.
	 *
	 * @param {Map} mProperties - Map of properties that holds key-value pairs. A key is a unique identifier. A value is an array object that contains changes
	 * @param {string} sUniqueKey - Unique key of the condenser-specific information
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 */
	function addReverseChange(mProperties, sUniqueKey, oChange) {
		if (!mProperties.has(sUniqueKey)) {
			mProperties.set(sUniqueKey, []);
		}
		var aChanges = mProperties.get(sUniqueKey);
		aChanges.push(oChange);
	}

	/**
	 * Adds a non-index-related change to the data structure.
	 *
	 * @param {Map} mDataStructure - Data structure object that holds key-value pairs. A key is a unique identifier. A value is an array object that contains reduced changes
	 * @param {string} sKey - Unique identifier of the change, for instance the change type of the change
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 */
	function addNonIndexRelatedChange(mDataStructure, sKey, oChange) {
		if (!mDataStructure.has(sKey)) {
			mDataStructure.set(sKey, []);
		}
		var aChanges = mDataStructure.get(sKey);
		aChanges.pop();
		aChanges.push(oChange);
	}

	/**
	 * Adds a classified change to the data structures.
	 *
	 * @param {Map} mClassificationTypes - Map of classification types that holds key-value pairs. A key is a unique identifier. A value is a nested map which contains non-index-related and index-related reduced changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {sap.ui.fl.Change[]} aIndexRelatedChanges - Array of all index related changes
	 * @param {Object} oCondenserInfo - Condenser-specific information that is delivered by the change handler
	 * @param {sap.ui.fl.Change} oChange - Change instance that will be added to the array
	 */
	function addClassifiedChange(mClassificationTypes, mUIReconstructions, aIndexRelatedChanges, oCondenserInfo, oChange) {
		if (!mClassificationTypes.has(oCondenserInfo.type)) {
			mClassificationTypes.set(oCondenserInfo.type, new Map());
		}
		var mSubtypes = mClassificationTypes.get(oCondenserInfo.type);

		if (oCondenserInfo.type === sap.ui.fl.ClassificationType.NonIndexRelated) {
			if (!mSubtypes.has(oCondenserInfo.subtype)) {
				mSubtypes.set(oCondenserInfo.subtype, new Map());
			}
			var mProperties = mSubtypes.get(oCondenserInfo.subtype);
			NON_INDEX_RELATED[oCondenserInfo.subtype](mProperties, oCondenserInfo.uniqueKey, oChange);
		} else {
			aIndexRelatedChanges.push(oChange);
			addIndexRelatedChange(mSubtypes, mUIReconstructions, oCondenserInfo, oChange);
		}
	}

	/**
	 * Adds an unclassified change to the data structure.
	 *
	 * @param {Map} mClassificationTypes - Map of change types that holds key-value pairs. A key is a unique identifier. A value is an array object that contains all unclassified changes
	 * @param {string} sKey - Key of the "unclassified" map that reflects the fact that the delivered change is not classified
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 */
	function addUnclassifiedChange(mClassificationTypes, sKey, oChange) {
		if (!mClassificationTypes.has(sKey)) {
			mClassificationTypes.set(sKey, []);
		}
		mClassificationTypes.get(sKey).push(oChange);
	}

	/**
	 * Retrieves the condenser information from the change handler
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @returns {Promise.<object>} - Resolves with the condenser information or undefined
	 */
	function getCondenserInfoFromChangeHandler(oAppComponent, oChange) {
		var sControlId = JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent);
		var oControl = Core.byId(sControlId);
		if (oControl) {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent,
				view: FlUtils.getViewForControl(oControl)
			};
			var mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
			return Promise.resolve(Utils.getChangeHandler(oChange, mControl, mPropertyBag))
			.then(function(oChangeHandler) {
				if (oChangeHandler && typeof oChangeHandler.getCondenserInfo === "function") {
					return oChangeHandler.getCondenserInfo(oChange);
				}
			});
		}

		return Promise.resolve();
	}

	/**
	 * Retrieves the classification types map.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {object} oCondenserInfo - Source index of the element
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @param {sap.ui.core.Component} oAppComponent - Application component of the control at runtime
	 * @returns {Map} Classification types map
	 */
	function getClassificationTypesMap(mReducedChanges, oCondenserInfo, oChange, oAppComponent) {
		var sAffectedControlId = oCondenserInfo !== undefined ? oCondenserInfo.affectedControl : JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent);
		if (!mReducedChanges.has(sAffectedControlId)) {
			mReducedChanges.set(sAffectedControlId, new Map());
		}
		return mReducedChanges.get(sAffectedControlId);
	}

	/**
	 * Retrieves the length of the array.
	 *
	 * @param {int} iSourceIndex - Source index of the element
	 * @param {int} iTargetIndex - Target index of the element
	 * @returns {int} Highest Index or 0
	 */
	function getNeededLengthOfNewArray(iSourceIndex, iTargetIndex) {
		return (Math.max(iSourceIndex, iTargetIndex) || 0) + 1;
	}

	/**
	 * Initializes array of elements.
	 *
	 * @param {int} iTargetIndex - Target index of the element
	 * @param {int} [iSourceIndex] - Source index of the element
	 * @returns {string} Array of Placeholders
	 */
	function initializeArrayWithPlaceholders(iTargetIndex, iSourceIndex) {
		var iLength = getNeededLengthOfNewArray(iSourceIndex, iTargetIndex);
		return Array(iLength).fill(PLACEHOLDER).map(function(sPlaceholder, iIterator) {
			return sPlaceholder + iIterator;
		});
	}

	function extendArrayWithPlaceholders(aElements, iSourceIndex, iTargetIndex) {
		var iLength = getNeededLengthOfNewArray(iSourceIndex, iTargetIndex);
		if (aElements.length < iLength) {
			var sUnknown;
			for (var i = aElements.length; i <= iLength; i++) {
				sUnknown = PLACEHOLDER + (aElements.length);
				aElements.splice(aElements.length, 0, sUnknown);
			}
		}
	}

	/**
	 * Extends the existing array of elements with a new element.
	 *
	 * @param {string[]} aElements - Array of elements
	 * @param {int} iSourceIndex - Source index of the element
	 * @param {int} iTargetIndex - Target index of the element
	 * @param {string} sAffectedControlId - Affected control ID
	 */
	function extendElementsArray(aElements, iSourceIndex, iTargetIndex, sAffectedControlId) {
		extendArrayWithPlaceholders(aElements, iSourceIndex, iTargetIndex);

		var iCurrentIndex = aElements.indexOf(sAffectedControlId);
		var iUnknownIndex = aElements.indexOf(PLACEHOLDER + iSourceIndex);
		if (
			iCurrentIndex !== iSourceIndex
			&& iSourceIndex !== undefined
		) {
			if (iCurrentIndex >= 0) {
				shiftElement(aElements, iCurrentIndex, iSourceIndex);
			} else if (iUnknownIndex > -1) {
				aElements[iUnknownIndex] = sAffectedControlId;
			} else if (isUnknown(aElements[iSourceIndex])) {
				aElements[iSourceIndex] = sAffectedControlId;
			}
		}
	}

	/**
	 * Verifies whether the element is unknown.
	 *
	 * @param {string} sValue - Element value
	 * @returns {boolean} <code>true</code> if the element is unknown
	 */
	function isUnknown(sValue) {
		if (
			sValue !== undefined
			&& sValue.indexOf(PLACEHOLDER) === 0
		) {
			var sResult = sValue.slice(1, sValue.length);
			var iParsedIndex = parseInt(sResult);
			if (isNaN(iParsedIndex)) {
				return false;
			}
			return true;
		}
		return false;
	}

	/**
	 * Defines the data structures that contain reduced changes and UI reconstructions for index-related changes.
	 *
	 * 		mReducedChanges: {
	 * 			"<selectorId>": {
	 * 				"<classificationType>":
	 * 					"<subtype>":
	 * 						"<uniqueKey>": [<sap.ui.fl.Change>]
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
	 * 					"move": [oCondenserInfo],
	 * 					"create": [oCondenserInfo],
	 * 					"destroy": [oCondenserInfo]
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
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions
	 * @param {sap.ui.fl.Change[]} aIndexRelatedChanges - Array of all index related changes
	 * @param {sap.ui.fl.Change[]} aChanges - All Change instances
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
			var mClassificationTypes = getClassificationTypesMap(mReducedChanges, oCondenserInfo, oChange, oAppComponent);
			if (oCondenserInfo !== undefined) {
				enhanceCondenserInfo(oCondenserInfo, oAppComponent);
				addClassifiedChange(mClassificationTypes, mUIReconstructions, aIndexRelatedChanges, oCondenserInfo, oChange);
			} else {
				addUnclassifiedChange(mClassificationTypes, UNCLASSIFIED, oChange);
				mReducedChanges.set(UNCLASSIFIED, true);
			}
		});
	}

	function changeSelectorsToIdsInCondenserInfo(oCondenserInfo, oAppComponent) {
		["affectedControl", "sourceContainer", "targetContainer"].forEach(function(sPropertyName) {
			if (oCondenserInfo && oCondenserInfo[sPropertyName]) {
				oCondenserInfo[sPropertyName] = JsControlTreeModifier.getControlIdBySelector(oCondenserInfo[sPropertyName], oAppComponent);
			}
		});
	}

	function enhanceCondenserInfo(oCondenserInfo) {
		if (oCondenserInfo.sourceContainer && !oCondenserInfo.sourceAggregation) {
			oCondenserInfo.sourceAggregation = Core.byId(oCondenserInfo.sourceContainer).getMetadata().getDefaultAggregationName();
		}
		if (oCondenserInfo.targetContainer && !oCondenserInfo.targetAggregation) {
			oCondenserInfo.targetAggregation = Core.byId(oCondenserInfo.targetContainer).getMetadata().getDefaultAggregationName();
		}
	}

	/**
	 * Defines the data structure that contains reverse changes.
	 *
	 * @param {Map} mReversedChanges - Map of reverse changes
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 */
	function defineReverseChangesMap(mReversedChanges, aChanges) {
		aChanges.forEach(function(oChange) {
			var aReversedChanges = Array.from(mReversedChanges.keys());
			if (
				mReversedChanges.size === 1
				&& !mReversedChanges.has(oChange.getChangeType())
			) {
				mReversedChanges.delete(aReversedChanges[0]);
			} else {
				addNonIndexRelatedChange(mReversedChanges, oChange.getChangeType(), oChange);
			}
		});
	}

	/**
	 * Retrieves reverse changes from the delivered data structure.
	 *
	 * @param {Map} mObjects - Delivered data structure
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @param {string} sKey - Unique identifier of the change, for example the change type of the change
	 */
	function getReverseChanges(mObjects, aChanges, sKey) {
		var mReversedChanges = new Map();
		var mReverseUniqueKeys = mObjects.get(sKey);
		mReverseUniqueKeys.forEach(function(aReverseChanges) {
			aReverseChanges.reverse();
			defineReverseChangesMap(mReversedChanges, aReverseChanges);
			getChanges(mReversedChanges, aChanges);
		});
	}

	/**
	 * Retrieves an array of changes from the delivered data structure.
	 *
	 * @param {Map} mObjects - Delivered data structure
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 */
	function getChanges(mObjects, aChanges) {
		mObjects.forEach(function(mSubObjects, sKey) {
			if (sKey === sap.ui.fl.ClassificationSubtypes.Reverse) {
				getReverseChanges(mObjects, aChanges, sKey);
			} else if (mSubObjects instanceof Map) {
				getChanges(mSubObjects, aChanges);
			} else if (Array.isArray(mSubObjects)) {
				mSubObjects.forEach(function(oObject) {
					if (oObject instanceof Change) {
						aChanges.push(oObject);
					} else {
						aChanges.push(oObject.change);
					}
				});
			}
		});
	}

	/**
	 * Retrieves an array of changes from the reduced changes map.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {boolean} bUnclassifiedChanges - Indicates if there are unclassified changes
	 * @returns {sap.ui.fl.Change[]} Array of the reduced changes
	 */
	function getAllReducedChanges(mReducedChanges) {
		var aReducedChanges = [];
		getChanges(mReducedChanges, aReducedChanges);
		return aReducedChanges;
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
	 * Retrieves an array of index-related changes from the array of reduced changes.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {object[]} aCondenserInfos - Empty array object that will be filled with condenser info objects
	 * @returns {object[]} Array of objects that contain condenser-specific information and change instance
	 */
	function getCondenserInfos(mReducedChanges, aCondenserInfos) {
		mReducedChanges.forEach(function(mSubObjects) {
			if (mSubObjects !== null) {
				if (mSubObjects instanceof Map) {
					getCondenserInfos(mSubObjects, aCondenserInfos);
				} else if (Array.isArray(mSubObjects)) {
					mSubObjects.forEach(function(oObject) {
						if (!(oObject instanceof Change)) {
							aCondenserInfos.push(oObject);
						}
					});
				}
			}
		});
		return aCondenserInfos;
	}

	/**
	 * Sorts an array of reduced changes in the initial order.
	 *
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @param {sap.ui.fl.Change[]} aReducedChanges - Array of reduced changes
	 */
	function sortByInitialOrder(aChanges, aReducedChanges) {
		aReducedChanges.sort(function(a, b) {
			return aChanges.indexOf(a) - aChanges.indexOf(b);
		});
	}

	/**
	 * Defines the data structures that contain a container with an array of condenser info objects.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param  {object[]} aCondenserInfos - Array of condenser info objects
	 * @returns {Map} Simulation of the UI reconstruction
	 */
	function defineContainersMap(mUIReconstructions, aCondenserInfos) {
		var mContainers = new Map();
		forEveryMapInMap(mUIReconstructions, function(mUIState, sContainerKey, mUIAggregationState, sAggregationName) {
			var aTargetElementIds = mUIAggregationState.get(TARGET_UI);

			aTargetElementIds.forEach(function(sTargetElementId) {
				aCondenserInfos.forEach(function(oCondenserInfo) {
					if (sTargetElementId === oCondenserInfo.affectedControl) {
						if (!mContainers.has(sContainerKey)) {
							mContainers.set(sContainerKey, new Map());
						}
						var mAggregations = mContainers.get(sContainerKey);
						if (!mAggregations.has(sAggregationName)) {
							mAggregations.set(sAggregationName, []);
						}
						var aContainerElements = mAggregations.get(sAggregationName);
						aContainerElements.push(oCondenserInfo);
					}
				});
			});
		});
		return mContainers;
	}

	/**
	 * Retrieves the target index of the index-related change.
	 *
	 * @param {object} oCondenserInfo - Change instance
	 * @returns {int} Target index of the index-related change
	 */
	function getTargetIndex(oCondenserInfo) {
		return oCondenserInfo.getTargetIndex(oCondenserInfo.change);
	}

	/**
	 * Sort the array of changes in the ascending order.
	 *
	 * @param {object[]} aCondenserInfos - Array of condenser info objects
	 */
	function sortAscendingByTargetIndex(aCondenserInfos) {
		aCondenserInfos.sort(function(a, b) {
			var iCurrentTargetIndex = getTargetIndex(a);
			var iNextTargetIndex = getTargetIndex(b);
			return iCurrentTargetIndex - iNextTargetIndex;
		});
	}

	/**
	 * Verifies whether the array of elements contains any unknown elements.
	 *
	 * @param {string[]} aElements - Array of elements
	 * @returns {boolean} <code>true</code> if the array of elements contains an unknown element
	 */
	function containsOnlyPlaceholder(aElements) {
		return !aElements.some(function(vElement) {
			return !isUnknown(vElement);
		});
	}

	/**
	 * Defines the map of the UI reconstructions for an 'add' change.
	 *
	 * @param {string[]} aContainerElements - Array of changes with the current state of the simulation
	 * @param {Object} oCondenserInfo - Condenser info object
	 * @param {string[]} aInitialUIElementIds - Array of the initial UI elements
	 */
	function simulateDestroy(aContainerElements, oCondenserInfo, aInitialUIElementIds) {
		var iIndex = aContainerElements.indexOf(oCondenserInfo.affectedControl);
		if (iIndex === -1) {
			var sUnknown = PLACEHOLDER + aInitialUIElementIds.indexOf(oCondenserInfo.affectedControl);
			iIndex = aContainerElements.indexOf(sUnknown);
		}

		if (iIndex > -1) {
			aContainerElements.splice(iIndex, 1);
		}
	}

	/**
	 * Defines the map of the UI reconstructions for an 'add' change.
	 *
	 * @param {string[]} aContainerElements - Array of changes with the current state of the simulation
	 * @param {Object} oCondenserInfo - Condenser info object
	 */
	function simulateCreate(aContainerElements, oCondenserInfo) {
		aContainerElements.splice(oCondenserInfo.getTargetIndex(oCondenserInfo.change), 0, oCondenserInfo.affectedControl);
	}

	/**
	 * Defines the map of the UI reconstructions for a 'move' change.
	 *
	 * @param {string[]} aContainerElements - Array of changes with the current state of the simulation
	 * @param {Object} oCondenserInfo - Condenser info object
	 * @param {string[]} aInitialUIElementIds - Array of the initial UI elements
	 */
	function simulateMove(aContainerElements, oCondenserInfo, aInitialUIElementIds) {
		var sAffectedControlId = oCondenserInfo.affectedControl;
		var iSourceIndex = aInitialUIElementIds.indexOf(sAffectedControlId);
		extendElementsArray(aContainerElements, iSourceIndex, undefined, sAffectedControlId);
	}

	/**
	 * Shifts the index-related change from the source index to the target index.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {Object} oCondenserInfo - Instance of condenser info object
	 */
	function shiftToTargetIndex(mUIReconstructions, oCondenserInfo) {
		var sContainerKey = oCondenserInfo.targetContainer;
		var sAffectedControlId = oCondenserInfo.affectedControl;
		var iTargetIndex = oCondenserInfo.getTargetIndex(oCondenserInfo.change);
		var aContainerElements = mUIReconstructions.get(sContainerKey).get(oCondenserInfo.targetAggregation);
		extendArrayWithPlaceholders(aContainerElements, undefined, iTargetIndex);
		var iSourceIndex = aContainerElements.indexOf(sAffectedControlId);
		shiftElement(aContainerElements, iSourceIndex, iTargetIndex);
	}

	/**
	 * Verifies whether the passed arrays are equal.
	 *
	 * @param {string[]} a - The first passed arrays of values
	 * @param {string[]} b - The second passed arrays of values
	 * @returns {boolean} <code>true</code> if the passed arrays are equal
	 */
	function isEqual(a, b) {
		var c;
		if (a.length < b.length) {
			c = b.slice(a.length);
			if (!containsOnlyPlaceholder(c)) {
				return false;
			}
			b = b.slice(0, a.length);
		} else if (a.length > b.length) {
			c = a.slice(b.length, a.length);
			if (!containsOnlyPlaceholder(c)) {
				return false;
			}
			a = a.slice(0, b.length);
		}
		return !a.some(function(vElement, iIndex) {
			return vElement !== b[iIndex];
		});
	}

	/**
	 * Simulates the set of changes and checks if the simulation is equal to the target state
	 *
	 * @param {string} sContainerKey - Selector ID of the container
	 * @param {string} sAggregationName - Name of the aggregation
	 * @param {string[]} aInitialUIElementIds - Array of the initial UI element IDs
	 * @param {string[]} aTargetUIElementIds - Array of the target UI element IDs
	 * @param {object[]} aCondenserInfos - Array of condenser info objects
	 * @returns {boolean} <code>true</code> if the simulated and the target UI reconstructions are equal
	 */
	function isEqualReconstructedUI(sContainerKey, sAggregationName, aInitialUIElementIds, aTargetUIElementIds, aCondenserInfos) {
		var mUISimulatedStates = new Map();

		aCondenserInfos.forEach(function(oCondenserInfo) {
			var sContainerKey = oCondenserInfo.targetContainer;
			if (!mUISimulatedStates.has(sContainerKey)) {
				mUISimulatedStates.set(sContainerKey, new Map());
			}
			var mUIAggregationState = mUISimulatedStates.get(sContainerKey);
			if (!mUIAggregationState.get(sAggregationName)) {
				mUIAggregationState.set(sAggregationName, initializeArrayWithPlaceholders(0, aInitialUIElementIds.length - 1));
			}

			INDEX_RELATED[oCondenserInfo.subtype].simulate(mUIAggregationState.get(sAggregationName), oCondenserInfo, aInitialUIElementIds);
		});

		aCondenserInfos.forEach(function(oCondenserInfo) {
			if (oCondenserInfo.subtype === sap.ui.fl.ClassificationSubtypes.Move) {
				shiftToTargetIndex(mUISimulatedStates, oCondenserInfo);
			}
		});

		var aSortedUIElementIds = mUISimulatedStates.get(sContainerKey).get(sAggregationName);
		if (isEqual(aTargetUIElementIds, aSortedUIElementIds)) {
			return true;
		}
		return false;
	}

	/**
	 * Verifies whether the array of changes contains only changes of type 'add'.
	 *
	 * @param {object[]} aCondenserInfos - Array of condenser info objects
	 * @returns {boolean} <code>true</code> if the array of condenser info objects contains only changes of type 'add'
	 */
	function containsOnlyAddChanges(aCondenserInfos) {
		return !aCondenserInfos.some(function(vElement) {
			return vElement.subtype.indexOf(sap.ui.fl.ClassificationSubtypes.Create) !== 0;
		});
	}

	/**
	 * Verifies whether the array of elements contains no unknown elements.
	 *
	 * @param {string[]} aElements - Array of elements
	 * @returns {boolean} <code>true</code> if the array of elements contains no unknown elements
	 */
	function containsNoPlaceholder(aElements) {
		return !aElements.some(function(vElement) {
			return isUnknown(vElement);
		});
	}

	/**
	 * Sorts the index-related changes until the look and feel of the UI fits the target UI reconstruction.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions
	 * @param {object[]} aCondenserInfos - Array of condenser info objects
	 * @returns {sap.ui.fl.Change[]} Sorted array of index-related changes
	 */
	function sortIndexRelatedChanges(mUIReconstructions, aCondenserInfos) {
		var aSortedIndexRelatedChanges = [];
		var mContainers = defineContainersMap(mUIReconstructions, aCondenserInfos);

		forEveryMapInMap(mContainers, function(mAggregations, sContainerKey, aCondenserInfos, sAggregationName) {
			var aTargetElementIds = mUIReconstructions.get(sContainerKey).get(sAggregationName).get(TARGET_UI);
			var aInitialElementIds = mUIReconstructions.get(sContainerKey).get(sAggregationName).get(INITIAL_UI);

			// Verify whether the algorithm should be ready before ;)
			if (
				containsNoPlaceholder(aTargetElementIds)
				|| containsOnlyAddChanges(aCondenserInfos)
			) {
				sortAscendingByTargetIndex(aCondenserInfos);
			} else if (!isEqualReconstructedUI(sContainerKey, sAggregationName, aInitialElementIds, aTargetElementIds, aCondenserInfos)) {
				var abort = false;
				var iTimes = aCondenserInfos.length;
				while (iTimes !== 0 && !abort) {
					var iOldIndex = 0;
					var iNewIndex = 1;
					// implement intelligent / efficient sorting  -> smart sort
					while (iNewIndex < aCondenserInfos.length && !abort) {
						shiftElement(aCondenserInfos, iOldIndex, iNewIndex);
						abort = isEqualReconstructedUI(sContainerKey, sAggregationName, aInitialElementIds, aTargetElementIds, aCondenserInfos);
						iOldIndex++;
						iNewIndex++;
					}
					iTimes--;
				}
			}
			aCondenserInfos.forEach(function(oCondenserInfo) {
				aSortedIndexRelatedChanges = aSortedIndexRelatedChanges.concat(oCondenserInfo.change);
			});
		});

		return aSortedIndexRelatedChanges;
	}

	function forEveryMapInMap(mMap, fnCallback) {
		mMap.forEach(function(mOuterMap, sOuterKey) {
			mOuterMap.forEach(function(mInnerMap, sInnerKey) {
				fnCallback(mOuterMap, sOuterKey, mInnerMap, sInnerKey);
			});
		});
	}

	/**
	 * Compares the initial and target UI reconstructions of the corresponding container.
	 * If the UI reconstructions are equal, the corresponding index-related changes will be removed from the data structure with the reduced changes.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions
	 */
	function compareUIReconstructions(mReducedChanges, mUIReconstructions) {
		forEveryMapInMap(mUIReconstructions, function(mUIStates, sContainerId, mUIAggregationState, sKey) {
			var aInitialElementIds = mUIAggregationState.get(INITIAL_UI);
			var aTargetElementIds = mUIAggregationState.get(TARGET_UI);
			if (isEqual(aInitialElementIds, aTargetElementIds)) {
				aTargetElementIds.forEach(function(sTargetElementId) {
					var mClassificationTypes = mReducedChanges.get(sTargetElementId);
					if (mClassificationTypes !== undefined) {
						mClassificationTypes.delete(sap.ui.fl.ClassificationType.IndexRelated);
					}
				});
				mUIStates.delete(sKey);
			}
		});
	}

	/**
	 * Iterates through the array of the initial UI element IDs and verifies whether element ID was not affected.
	 * If this is the case, the corresponding element ID will be replaced through the placeholder with its initial index.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions
	 */
	function updateTargetUIReconstructions(mReducedChanges, mUIReconstructions) {
		forEveryMapInMap(mUIReconstructions, function(mUIStates, sContainerId, mUIAggregationState) {
			var aInitialElementIds = mUIAggregationState.get(INITIAL_UI);
			var aTargetElementIds = mUIAggregationState.get(TARGET_UI);
			aInitialElementIds.forEach(function(initialElementId, index) {
				var mClassificationTypes = mReducedChanges.get(initialElementId);
				if (mClassificationTypes === undefined) {
					var sPlaceholder = PLACEHOLDER + index;
					var iTargetIndex = aTargetElementIds.indexOf(initialElementId);
					if (iTargetIndex >= 0) {
						aTargetElementIds[iTargetIndex] = sPlaceholder;
					}
				}
			});
		});
	}

	/**
	 * Updates the target index of the index-related changes.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions
	 */
	function updateTargetIndex(mReducedChanges, mUIReconstructions) {
		forEveryMapInMap(mUIReconstructions, function(mUIStates, sContainerId, mUIAggregationState) {
			mUIAggregationState.get(TARGET_UI).forEach(function(sTargetElementId, iIndex) {
				if (!isUnknown(sTargetElementId)) {
					var mClassificationTypes = mReducedChanges.get(sTargetElementId);
					var mSubtypes = mClassificationTypes.get(sap.ui.fl.ClassificationType.IndexRelated);
					mSubtypes.forEach(function(aCondenserChanges, sSubtypeKey) {
						if (sSubtypeKey !== sap.ui.fl.ClassificationSubtypes.Destroy) {
							aCondenserChanges.forEach(function(oCondenserChange) {
								oCondenserChange.setTargetIndex(oCondenserChange.change, iIndex);
							});
						}
					});
				}
			});
		});
	}

	/**
	 * Sorts the index relevant changes in the list of all reduced changes.
	 * The index relevant changes are already in order, this order has to be taken over to the other list.
	 *
	 * @param {sap.ui.fl.Change[]} aSortedIndexRelatedChanges - Array of sorted reduced index related changes
	 * @param {sap.ui.fl.Change[]} aAllReducedChanges - Array of all reduced changes
	 */
	function swapChanges(aSortedIndexRelatedChanges, aAllReducedChanges) {
		var aIndexes = aSortedIndexRelatedChanges.map(function(oChange) {
			return aAllReducedChanges.indexOf(oChange);
		}).sort();
		aSortedIndexRelatedChanges.forEach(function(oChange) {
			aAllReducedChanges[aIndexes.shift()] = oChange;
		});
	}

	/**
	 * Prove: XML applying
	 * Could be a problem for sorting solution
	 *
	 *
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
	 * @param {sap.ui.fl.Change[]} aChanges - Array of changes
	 * @returns {Promise} Promise resolved with the reduced array of changes
	 */
	Condenser.condense = function(oAppComponent, aChanges) {
		Measurement.start("Condenser_overall", "Condenser overall - CondenserClass", ["sap.ui.fl", "Condenser"]);
		var mReducedChanges = new Map();
		var mUIReconstructions = new Map();
		var aCopyChanges = aChanges.slice(0).reverse();
		var aAllIndexRelatedChanges = [];

		// filter out objects which are not of type change, e.g. Variants, AppVariants, AppVariantInlineChange
		var aAllNonUIChanges = aCopyChanges.filter(function(oChange) {
			return !(oChange instanceof Change);
		});
		aCopyChanges = aCopyChanges.filter(function(oChange) {
			return oChange instanceof Change;
		});

		Measurement.start("Condenser_defineMaps", "defining of maps - CondenserClass", ["sap.ui.fl", "Condenser"]);

		return defineMaps(oAppComponent, mReducedChanges, mUIReconstructions, aAllIndexRelatedChanges, aCopyChanges)

		.then(function() {
			Measurement.end("Condenser_defineMaps");
			var bUnclassifiedChanges = mReducedChanges.get(UNCLASSIFIED);
			if (!bUnclassifiedChanges) {
				compareUIReconstructions(mReducedChanges, mUIReconstructions);
				updateTargetUIReconstructions(mReducedChanges, mUIReconstructions);
				updateTargetIndex(mReducedChanges, mUIReconstructions);
			}
			var aReducedChanges = getAllReducedChanges(mReducedChanges, bUnclassifiedChanges);

			// with unclassified changes no index relevant changes can be reduced
			if (bUnclassifiedChanges) {
				addAllIndexRelatedChanges(aReducedChanges, aAllIndexRelatedChanges);
			}

			aReducedChanges = aReducedChanges.concat(aAllNonUIChanges);
			sortByInitialOrder(aChanges, aReducedChanges);

			if (!bUnclassifiedChanges) {
				Measurement.start("Condenser_handleIndexRelatedChanges", "handle index related changes - CondenserClass", ["sap.ui.fl", "Condenser"]);

				var aCondenserInfos = getCondenserInfos(mReducedChanges, []);

				Measurement.start("Condenser_sort", "sort index related changes - CondenserClass", ["sap.ui.fl", "Condenser"]);
				var aReducedIndexRelatedChanges = sortIndexRelatedChanges(mUIReconstructions, aCondenserInfos);
				Measurement.end("Condenser_sort");

				swapChanges(aReducedIndexRelatedChanges, aReducedChanges);

				Measurement.end("Condenser_handleIndexRelatedChanges");
			}

			Measurement.end("Condenser_overall");
			return aReducedChanges;
		});
	};

	return Condenser;
});