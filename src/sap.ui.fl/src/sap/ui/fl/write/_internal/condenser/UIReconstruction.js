/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/each",
	"sap/base/util/ObjectPath",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/write/_internal/condenser/classifications/Create",
	"sap/ui/fl/write/_internal/condenser/classifications/Destroy",
	"sap/ui/fl/write/_internal/condenser/classifications/Move",
	"sap/ui/fl/write/_internal/condenser/Utils"
], function(
	_isEqual,
	each,
	ObjectPath,
	CondenserClassification,
	Create,
	Destroy,
	Move,
	Utils
) {
	"use strict";

	/**
	 * Handles the UI Reconstruction for the Condenser
	 *
	 * @namespace
	 * @alias sap.ui.fl.write._internal.condenser.UIReconstruction
	 * @author SAP SE
	 * @version ${version}
	 */
	var UIReconstruction = {};

	var INDEX_RELATED = {
		create: Create,
		destroy: Destroy,
		move: Move
	};

	function forEveryMapInMap(mMap, fnCallback) {
		each(mMap, function(sOuterKey, mOuterMap) {
			each(mOuterMap, function(sInnerKey, mInnerMap) {
				fnCallback(mOuterMap, sOuterKey, mInnerMap, sInnerKey);
			});
		});
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
	 * Defines the data structures that contain a container with an array of condenser info objects.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {object[]} aCondenserInfos - Array of condenser info objects
	 * @returns {Map} Simulation of the UI reconstruction
	 */
	function defineContainersMap(mUIReconstructions, aCondenserInfos) {
		var mContainers = {};
		forEveryMapInMap(mUIReconstructions, function(mUIState, sContainerKey, mUIAggregationState, sAggregationName) {
			var aTargetElementIds = mUIAggregationState[Utils.TARGET_UI];
			var aSourceElementIds = mUIAggregationState[Utils.INITIAL_UI];

			aCondenserInfos.forEach(function(oCondenserInfo) {
				var bElementPartOfInitialOrTargetUi = aTargetElementIds.indexOf(oCondenserInfo.affectedControl) > -1
					|| aSourceElementIds.indexOf(oCondenserInfo.affectedControl) > -1;

				if (sAggregationName === oCondenserInfo.targetAggregation && bElementPartOfInitialOrTargetUi) {
					mContainers[sContainerKey] ||= {};
					var mAggregations = mContainers[sContainerKey];
					mAggregations[sAggregationName] ||= [];
					var aContainerElements = mAggregations[sAggregationName];
					aContainerElements.push(oCondenserInfo);
				}
			});
		});
		return mContainers;
	}

	/**
	 * Verifies whether the array of changes contains only changes of type 'create'.
	 *
	 * @param {object[]} aCondenserInfos - Array of condenser info objects
	 * @returns {boolean} <code>true</code> if the array of condenser info objects contains only changes of type 'create'
	 */
	function containsOnlyCreateChanges(aCondenserInfos) {
		return !aCondenserInfos.some(function(vElement) {
			return vElement.classification !== CondenserClassification.Create;
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
			return Utils.isUnknown(vElement);
		});
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
			return !Utils.isUnknown(vElement);
		});
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
		return _isEqual(a, b);
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
		var mUISimulatedStates = {};

		aCondenserInfos.forEach(function(oCondenserInfo) {
			var sContainerKey = oCondenserInfo.targetContainer;
			mUISimulatedStates[sContainerKey] ||= {};
			var mUIAggregationState = mUISimulatedStates[sContainerKey];
			mUIAggregationState[sAggregationName] ||= Utils.initializeArrayWithPlaceholders(0, aInitialUIElementIds.length - 1);

			INDEX_RELATED[oCondenserInfo.classification].simulate(mUIAggregationState[sAggregationName], oCondenserInfo, aInitialUIElementIds);
		});

		var aSortedUIElementIds = mUISimulatedStates[sContainerKey][sAggregationName];
		if (isEqual(aTargetUIElementIds, aSortedUIElementIds)) {
			aCondenserInfos.forEach(function(oCondenserInfo) {
				if (oCondenserInfo.sameIndex) {
					oCondenserInfo.change.condenserState = "delete";
				}
			});
			return true;
		}
		return false;
	}

	/**
	 * Updates the target index of the index-related changes.
	 *
	 * @param {Map} mReducedChanges - Map of reduced changes
	 * @param {Map} mUIReconstructions - Map of UI reconstructions
	 */
	function updateTargetIndex(mReducedChanges, mUIReconstructions) {
		function updateCondenserChange(iIndex, oCondenserInfo) {
			if (getTargetIndex(oCondenserInfo) !== iIndex) {
				// setting the target index will most likely make the change dirty,
				// but the condenser needs the current state of the change.
				// so in this function the state should not change
				var sOldState = oCondenserInfo.change.getState();
				oCondenserInfo.setTargetIndex(oCondenserInfo.change, iIndex);
				oCondenserInfo.change.setState(sOldState);
				if (oCondenserInfo.change.isPersisted()) {
					oCondenserInfo.change.condenserState = "update";
				}
			}
		}

		function adjustReconstructionMap(mUIStates, sContainerId, mUIAggregationState) {
			mUIAggregationState[Utils.TARGET_UI].forEach(function(sTargetElementId, iIndex) {
				if (!Utils.isUnknown(sTargetElementId)) {
					var mTypes = mReducedChanges[sTargetElementId];
					var mAggregations = mTypes[Utils.INDEX_RELEVANT];
					forEveryMapInMap(mAggregations, function(mSubtypes, sAggregationName, aCondenserInfos, sSubtypeKey) {
						if (sSubtypeKey !== CondenserClassification.Destroy) {
							aCondenserInfos.forEach(updateCondenserChange.bind(this, iIndex));
						}
					});
				}
			});
		}

		forEveryMapInMap(mUIReconstructions, adjustReconstructionMap);
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
			var aInitialElementIds = mUIAggregationState[Utils.INITIAL_UI];
			var aTargetElementIds = mUIAggregationState[Utils.TARGET_UI];
			if (isEqual(aInitialElementIds, aTargetElementIds)) {
				aTargetElementIds.forEach(function(sTargetElementId) {
					var mTypes = mReducedChanges[sTargetElementId];
					if (mTypes !== undefined) {
						forEveryMapInMap(mTypes[Utils.INDEX_RELEVANT], function(mSubtypes, sAggregationName, aCondenserInfos) {
							aCondenserInfos.forEach(function(oCondenserInfo) {
								oCondenserInfo.change.condenserState = "delete";
							});
						});
						delete mTypes[Utils.INDEX_RELEVANT];
					}
				});
				delete mUIStates[sKey];
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
		forEveryMapInMap(mUIReconstructions, function(mUIStates, sContainerId, mUIAggregationState, sAggregationName) {
			var aInitialElementIds = mUIAggregationState[Utils.INITIAL_UI];
			var aTargetElementIds = mUIAggregationState[Utils.TARGET_UI];
			aInitialElementIds.forEach(function(initialElementId, index) {
				var mTypes = mReducedChanges[initialElementId];
				if (!mTypes || !ObjectPath.get([Utils.INDEX_RELEVANT, sAggregationName], mTypes)) {
					var sPlaceholder = Utils.PLACEHOLDER + index;
					var iTargetIndex = aTargetElementIds.indexOf(initialElementId);
					if (iTargetIndex >= 0) {
						aTargetElementIds[iTargetIndex] = sPlaceholder;
					}
				}
			});
		});
	}

	/**
	 * Sorts the index relevant changes in the list of all reduced changes.
	 * The index relevant changes are already in order, this order has to be taken over to the other list.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aSortedIndexRelatedChanges - Array of sorted reduced index related changes
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aAllReducedChanges - Array of all reduced changes
	 */
	UIReconstruction.swapChanges = function(aSortedIndexRelatedChanges, aAllReducedChanges) {
		var aIndexes = aSortedIndexRelatedChanges.map(function(oChange) {
			return aAllReducedChanges.indexOf(oChange);
		}).sort();
		aSortedIndexRelatedChanges.forEach(function(oChange) {
			aAllReducedChanges[aIndexes.shift()] = oChange;
		});
	};

	/**
	 * Sorts the index-related changes per container until the look and feel of the UI fits the target UI reconstruction.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions
	 * @param {object[]} aCondenserInfos - Array of condenser info objects
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Sorted array of index-related changes
	 */
	UIReconstruction.sortIndexRelatedChanges = function(mUIReconstructions, aCondenserInfos) {
		var aSortedIndexRelatedChangesPerContainer = [];
		var mContainers = defineContainersMap(mUIReconstructions, aCondenserInfos);

		forEveryMapInMap(mContainers, function(mAggregations, sContainerKey, aCondenserInfos, sAggregationName) {
			var aTargetElementIds = mUIReconstructions[sContainerKey][sAggregationName][Utils.TARGET_UI];
			var aInitialElementIds = mUIReconstructions[sContainerKey][sAggregationName][Utils.INITIAL_UI];
			var bCorrectSortingFound = true;

			if (
				containsNoPlaceholder(aTargetElementIds)
				|| containsOnlyCreateChanges(aCondenserInfos)
			) {
				sortAscendingByTargetIndex(aCondenserInfos);
				// this should always be the correct sorting, but the function still needs to be called to
				// remove obsolete changes during the simulation of Move
				bCorrectSortingFound = isEqualReconstructedUI(sContainerKey, sAggregationName, aInitialElementIds, aTargetElementIds, aCondenserInfos);
			} else if (!isEqualReconstructedUI(sContainerKey, sAggregationName, aInitialElementIds, aTargetElementIds, aCondenserInfos)) {
				bCorrectSortingFound = false;
				var iTimes = aCondenserInfos.length;
				while (iTimes !== 0 && !bCorrectSortingFound) {
					var iOldIndex = 0;
					var iNewIndex = 1;
					// TODO implement intelligent / efficient sorting  -> smart sort
					while (iNewIndex < aCondenserInfos.length && !bCorrectSortingFound) {
						shiftElement(aCondenserInfos, iOldIndex, iNewIndex);
						bCorrectSortingFound = isEqualReconstructedUI(sContainerKey, sAggregationName, aInitialElementIds, aTargetElementIds, aCondenserInfos);
						iOldIndex++;
						iNewIndex++;
					}
					iTimes--;
				}
			}

			if (!bCorrectSortingFound) {
				throw Error(`no correct sorting found for the container: ${sContainerKey}`);
			}

			aCondenserInfos = aCondenserInfos.filter(function(oCondenserInfo) {
				return oCondenserInfo.change.condenserState !== "delete";
			});

			aSortedIndexRelatedChangesPerContainer.push(aCondenserInfos.map(function(oCondenserInfo) {
				if (oCondenserInfo.revertIndex > -1) {
					oCondenserInfo.setIndexInRevertData(oCondenserInfo.change, oCondenserInfo.revertIndex);
					oCondenserInfo.sourceIndex = oCondenserInfo.revertIndex;
				}
				return oCondenserInfo.change;
			}));
		});

		return aSortedIndexRelatedChangesPerContainer;
	};

	UIReconstruction.addChange = function(mUIReconstructions, oCondenserInfo) {
		return INDEX_RELATED[oCondenserInfo.classification].addToReconstructionMap(mUIReconstructions, oCondenserInfo);
	};

	UIReconstruction.compareAndUpdate = function(mReducedChanges, mUIReconstructions) {
		compareUIReconstructions(mReducedChanges, mUIReconstructions);
		updateTargetUIReconstructions(mReducedChanges, mUIReconstructions);
		updateTargetIndex(mReducedChanges, mUIReconstructions);
	};

	return UIReconstruction;
});