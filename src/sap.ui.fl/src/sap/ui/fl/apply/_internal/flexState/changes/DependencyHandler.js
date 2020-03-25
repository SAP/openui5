/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/includes",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils"
], function(
	includes,
	JsControlTreeModifier,
	Utils
) {
	"use strict";

	var PENDING = "sap.ui.fl:PendingChange";

	/**
	 * Includes functionality needed for all change dependency handling
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.changes.DependencyHandler
	 * @experimental
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var DependencyHandler = {};

	function getCompleteIdFromSelector(oSelector, oAppComponent) {
		return JsControlTreeModifier.getControlIdBySelector(oSelector, oAppComponent);
	}

	function createNewDependencyObject (oChange) {
		return {
			changeObject: oChange,
			dependencies: [],
			controlsDependencies: [],
			dependentIds: []
		};
	}

	function addMapEntry(sSelectorId, oChange, mChangesMap) {
		addChangeIntoSelectorList(mChangesMap, oChange, sSelectorId);
		addChangeIntoList(mChangesMap, oChange);
	}

	function addChangeIntoList(mChangesMap, oChange) {
		if (!includes(mChangesMap.aChanges, oChange)) {
			mChangesMap.aChanges.push(oChange);
		}
	}

	function addChangeIntoSelectorList(mChangesMap, oChange, sSelectorId) {
		if (!mChangesMap.mChanges[sSelectorId]) {
			mChangesMap.mChanges[sSelectorId] = [];
		}

		if (!includes(mChangesMap.mChanges[sSelectorId], oChange)) {
			mChangesMap.mChanges[sSelectorId].push(oChange);
		}
	}

	function addChangeIntoMap(oChange, oAppComponent, mChangesMap) {
		var oSelector = oChange.getSelector();
		if (oSelector) {
			if (oSelector.id) {
				var sSelectorId = getCompleteIdFromSelector(oSelector, oAppComponent);

				addMapEntry(sSelectorId, oChange, mChangesMap);

				// if the localId flag is missing and the selector has a component prefix that is not matching the
				// application component, adds the change for a second time replacing the component ID prefix with
				// the application component ID prefix
				if (oSelector.idIsLocal === undefined && sSelectorId.indexOf("---") !== -1) {
					var sComponentPrefix = sSelectorId.split("---")[0];

					if (sComponentPrefix !== oAppComponent.getId()) {
						sSelectorId = sSelectorId.split("---")[1];
						sSelectorId = oAppComponent.createId(sSelectorId);
						addMapEntry(sSelectorId, oChange, mChangesMap);
					}
				}
			} else {
				//If the selector id is not defined, add the change to the list to make sure it has the correct order
				addChangeIntoList(mChangesMap, oChange);
			}
		}
		return mChangesMap.aChanges;
	}

	function isSelectorInArray(aExistingDependentSelectorList, oDependentSelector) {
		return aExistingDependentSelectorList.some(function(oExistingDependentSelector) {
			return (oExistingDependentSelector.id === oDependentSelector.id && oExistingDependentSelector.idIsLocal === oDependentSelector.idIsLocal);
		});
	}

	function addChangesDependencies(oTargetChange, aDependentSelectorsOfTargetChange, oExistingChange, bCheckingOrder, oAppComponent, aChanges, mChangesMap) {
		var aDependentSelectorsOfExistingChange = oExistingChange.getDependentSelectorList();
		aDependentSelectorsOfTargetChange.some(function(oDependentSelector) {
			// If 2 changes have the same dependent selector, they are depend on each other
			if (isSelectorInArray(aDependentSelectorsOfExistingChange, oDependentSelector)) {
				var sDependentControlId = getCompleteIdFromSelector(oDependentSelector, oAppComponent);
				//If checking order is required, the target change and the existing change can be in revert order
				var bIsChangesInRevertOrder = bCheckingOrder && aChanges.indexOf(oTargetChange) < aChanges.indexOf(oExistingChange);
				if (bIsChangesInRevertOrder) {
					addDependencyEntry(oExistingChange, oTargetChange, sDependentControlId, mChangesMap, true);
				} else {
					addDependencyEntry(oTargetChange, oExistingChange, sDependentControlId, mChangesMap);
				}
				return true;
			}
		});
	}

	function addDependencies(oTargetChange, oAppComponent, aChanges, mChangesMap) {
		if (oTargetChange.isValidForDependencyMap()) {
			var aDependentSelectors = oTargetChange.getDependentSelectorList();

			addControlsDependencies(oTargetChange, aDependentSelectors, oAppComponent, mChangesMap);

			// Find and add dependencies between the target change and other changes in map
			// If the target change is not at the end of array, the order checking is required
			var iIndexOfTargetChange = aChanges.indexOf(oTargetChange);
			var bCheckingOrder = iIndexOfTargetChange < (aChanges.length - 1);

			var aOtherChanges = aChanges.slice();
			aOtherChanges.splice(iIndexOfTargetChange, 1);
			aOtherChanges.reverse().forEach(function(oExistingChange) {
				if (oExistingChange.isValidForDependencyMap()) {
					addChangesDependencies(oTargetChange, aDependentSelectors, oExistingChange, bCheckingOrder, oAppComponent, aChanges, mChangesMap);
				}
			});
		}
	}

	function addControlsDependencies(oDependentChange, aDependentSelectorList, oAppComponent, mChangesMap) {
		if (aDependentSelectorList.length) {
			var aDependentIdList = aDependentSelectorList.map(function(oSelector) {
				return getCompleteIdFromSelector(oSelector, oAppComponent);
			});

			if (!mChangesMap.mDependencies[oDependentChange.getId()]) {
				mChangesMap.mDependencies[oDependentChange.getId()] = createNewDependencyObject(oDependentChange);
			}
			mChangesMap.mDependencies[oDependentChange.getId()].controlsDependencies = aDependentIdList;

			aDependentIdList.forEach(function(sId) {
				mChangesMap.mControlsWithDependencies[sId] = mChangesMap.mControlsWithDependencies[sId] || [];
				mChangesMap.mControlsWithDependencies[sId].push(oDependentChange.getId());
			});
		}
	}

	function addDependencyEntry(oDependentChange, oChange, sDependentControlId, mChangesMap, bIsChangesInRevertOrder) {
		if (isDependencyNeeded(oDependentChange, oChange, sDependentControlId, mChangesMap, bIsChangesInRevertOrder)) {
			mChangesMap.mDependencies[oDependentChange.getId()].dependencies.push(oChange.getId());
			if (!includes(mChangesMap.mDependencies[oDependentChange.getId()].dependentIds, sDependentControlId)) {
				mChangesMap.mDependencies[oDependentChange.getId()].dependentIds.push(sDependentControlId);
			}

			if (!mChangesMap.mDependentChangesOnMe[oChange.getId()]) {
				mChangesMap.mDependentChangesOnMe[oChange.getId()] = [];
			}
			mChangesMap.mDependentChangesOnMe[oChange.getId()].push(oDependentChange.getId());
		}
	}

	function isDependencyNeeded(oDependentChange, oChange, sDependentControlId, mChangesMap, bIsChangesInRevertOrder) {
		var bSelectorAlreadyThere = !bIsChangesInRevertOrder && includes(mChangesMap.mDependencies[oDependentChange.getId()].dependentIds, sDependentControlId);
		var bIndirectDependency = false;
		if (mChangesMap.mDependentChangesOnMe[oChange.getId()]) {
			mChangesMap.mDependentChangesOnMe[oChange.getId()].some(function(sChangeId) {
				bIndirectDependency = includes(mChangesMap.mDependencies[oDependentChange.getId()].dependencies, sChangeId);
				return bIndirectDependency;
			});
		}

		return !bSelectorAlreadyThere && !bIndirectDependency;
	}

	/**
	 * Iterating over <code>mDependencies</code> once, executing relevant dependencies, and clearing dependencies queue.
	 *
	 * @param {object} mChangesMap - Changes map
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise for asynchronous or FakePromise for synchronous processing scenario
	 * @private
	 */
	function iterateDependentQueue(mChangesMap) {
		var aCoveredChanges = [];
		var aDependenciesToBeDeleted = [];
		var aPromises = [];
		mChangesMap.dependencyRemovedInLastBatch.forEach(function(sDependencyKey) {
			var oDependency = mChangesMap.mDependencies[sDependencyKey];
			if (
				oDependency.dependencies.length === 0
				&& !(oDependency.controlsDependencies && oDependency.controlsDependencies.length)
			) {
				aDependenciesToBeDeleted.push(sDependencyKey);
				aCoveredChanges.push(oDependency.changeObject.getId());
				if (oDependency[PENDING]) {
					aPromises.push(function() {
						return oDependency[PENDING]();
					});
				}
			}
		});

		return Utils.execPromiseQueueSequentially(aPromises).then(function () {
			mChangesMap.dependencyRemovedInLastBatch = [];
			aDependenciesToBeDeleted.forEach(function(sDependencyKey) {
				delete mChangesMap.mDependencies[sDependencyKey];
			});

			aCoveredChanges.forEach(function(sChangeId) {
				DependencyHandler.resolveDependenciesForChange(mChangesMap, sChangeId);
			});

			return !!aCoveredChanges.length;
		});
	}

	/**
	 * Creates an empty map for changes and dependencies
	 *
	 * The dependency map has the following format:
	 * 		- <code>mChanges</code>: map of changes grouped by control ID
	 *		- <code>aChanges</code>: array of changes ordered by layer and creation time
	 *		- <code>mDependencies</code>: map with dependencies to controls and other changes per change
	 *			"<filename of change>": {
	 *				<code>"changeObject"</code>: <instance of the change>,
	 *				<code>"dependencies"</code>: ["<filename of the change>"],
	 *				<code>"dependentIds"</code>: ["<ID of the control of the dependent change>"],
	 *				<code>"controlsDependencies"</code>: [<IDs of the controls (including the own selector)>]
	 *			}
	 *		- <code>mDependentChangesOnMe</code>: map with all changes that wait for a specific change
	 *			"<filename of the change>": [<filename of the change>]
	 *		- <code>mControlsWithDependencies</code>: map of control IDs for which a change has a dependency on.
	 *			<controlId>: [<filename of the change>]
	 *
	 * @returns {object} Empty map for changes and dependencies
	 */
	DependencyHandler.createEmptyDependencyMap = function() {
		return {
			aChanges: [],
			mChanges: {},
			mDependencies: {},
			mDependentChangesOnMe: {},
			mControlsWithDependencies: {},
			dependencyRemovedInLastBatch: []
		};
	};

	/**
	 * Adds a change to the map and adds the dependencies to the changes map
	 *
	 * @param {sap.ui.fl.changeObject} oChange - Change instance
	 * @param {sap.ui.core.UIComponent} oAppComponent - Component instance to get the whole ID for the control
	 * @param {object} mChangesMap - Map with changes and dependencies
	 */
	DependencyHandler.addChangeAndUpdateDependencies = function(oChange, oAppComponent, mChangesMap) {
		var aChanges = addChangeIntoMap(oChange, oAppComponent, mChangesMap);
		addDependencies(oChange, oAppComponent, aChanges, mChangesMap);
	};

	/**
	 * Adds a change to the map during runtime and adds the dependencies to the initial changes map
	 *
	 * @param {sap.ui.fl.changeObject} oChange - Change instance
	 * @param {sap.ui.core.UIComponent} oAppComponent - Component instance to get the whole ID for the control
	 * @param {object} mChangesMap - Map with changes and dependencies
	 * @param {object} mInitialChangesMap - Initial map with changes and dependencies
	 */
	DependencyHandler.addRuntimeChangeAndUpdateDependencies = function(oChange, oAppComponent, mChangesMap, mInitialChangesMap) {
		var aChanges = addChangeIntoMap(oChange, oAppComponent, mChangesMap);
		addDependencies(oChange, oAppComponent, aChanges, mInitialChangesMap);
	};

	/**
	 * Recursive iterations, which are processed sequentially, as long as dependent changes can be applied.
	 *
	 * @param {object} mChangesMap - Changes map
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all dependencies were processed for asynchronous or FakePromise for the synchronous processing scenario
	 */
	DependencyHandler.processDependentQueue = function (mChangesMap, oAppComponent) {
		return iterateDependentQueue(mChangesMap).then(function(bContinue) {
			if (bContinue) {
				return DependencyHandler.processDependentQueue(mChangesMap, oAppComponent);
			}
		});
	};

	/**
	 * Saves a function in the dependency that will be called as soon as the dependency is resolved.
	 *
	 * @param {object} mChangesMap - Changes map
	 * @param {sap.ui.fl.Change} sChangeId - Change ID
	 * @param {function} fnCallback - Function that will be saved in the dependency
	 */
	DependencyHandler.addChangeApplyCallbackToDependency = function(mChangesMap, sChangeId, fnCallback) {
		mChangesMap.mDependencies[sChangeId][PENDING] = fnCallback;
	};

	/**
	 * Removes the dependencies to a control. Iterates through the list of changes saved in the <code>mControlsWithDependencies</code> map
	 * and removes the <code>controlsDependencies</code> in the dependency of that change.
	 *
	 * @param {object} mChangesMap - Changes map
	 * @param {string} sControlId - ID of the control
	 */
	DependencyHandler.removeControlsDependencies = function(mChangesMap, sControlId) {
		var aDependentChanges = mChangesMap.mControlsWithDependencies[sControlId];
		if (aDependentChanges) {
			aDependentChanges.forEach(function(sChangeKey) {
				var oDependency = mChangesMap.mDependencies[sChangeKey];
				if (
					oDependency
					&& oDependency.controlsDependencies
					&& oDependency.controlsDependencies.length
				) {
					var iIndex = oDependency.controlsDependencies.indexOf(sControlId);
					if (iIndex > -1) {
						oDependency.controlsDependencies.splice(iIndex, 1);
						delete mChangesMap.mControlsWithDependencies[sControlId];
						if (!includes(mChangesMap.dependencyRemovedInLastBatch, sChangeKey)) {
							mChangesMap.dependencyRemovedInLastBatch.push(sChangeKey);
						}
					}
				}
			});
			delete mChangesMap.mControlsWithDependencies[sControlId];
		}
	};

	/**
	 * Resolves the dependency from the dependent changes;
	 * Loops over all the dependent changes and removes the dependency to this change
	 *
	 * @param {object} mChangesMap - Changes Map
	 * @param {string} sChangeKey - Key of the change which dependencies have to be resolved
	 */
	DependencyHandler.resolveDependenciesForChange = function(mChangesMap, sChangeKey) {
		var mDependentChangesOnMe = mChangesMap.mDependentChangesOnMe[sChangeKey];
		if (mDependentChangesOnMe) {
			mDependentChangesOnMe.forEach(function (sKey) {
				var oDependency = mChangesMap.mDependencies[sKey];

				// oDependency might be undefined, since initial dependencies were not copied yet from applyAllChangesForControl() for change with ID sKey
				var iIndex = oDependency ? oDependency.dependencies.indexOf(sChangeKey) : -1;
				if (iIndex > -1) {
					oDependency.dependencies.splice(iIndex, 1);
					if (!includes(mChangesMap.dependencyRemovedInLastBatch, sKey)) {
						mChangesMap.dependencyRemovedInLastBatch.push(sKey);
					}
				}
			});
			delete mChangesMap.mDependentChangesOnMe[sChangeKey];
		}
	};

	/**
	 * Removes the change from the maps;
	 * Should be called together with DependencyHandler.removeChangeFromDependencies to also resolve dependencies
	 *
	 * @param {object} mChangesMap - Changes Map
	 * @param {string} sChangeKey - Key of the change which dependencies have to be resolved
	 */
	DependencyHandler.removeChangeFromMap = function(mChangesMap, sChangeKey) {
		Object.keys(mChangesMap.mChanges).some(function(sCurrentControlId) {
			var aChanges = mChangesMap.mChanges[sCurrentControlId];
			var iIndexInMapElement = aChanges.map(function(oExistingChange) {
				return oExistingChange.getId();
			}).indexOf(sChangeKey);

			if (iIndexInMapElement !== -1) {
				aChanges.splice(iIndexInMapElement, 1);
				return true;
			}
		});

		var iIndex = mChangesMap.aChanges.map(function(oExistingChange) {
			return oExistingChange.getId();
		}).indexOf(sChangeKey);

		if (iIndex !== -1) {
			mChangesMap.aChanges.splice(iIndex, 1);
		}
	};

	/**
	 * Resolves all the dependencies of the current change and then removes it from the dependencies;
	 * This does not trigger applying of changes that might now be free of dependencies
	 *
	 * @param {object} mChangesMap - Changes Map
	 * @param {string} sChangeKey - Key of the change which dependencies have to be resolved
	 */
	DependencyHandler.removeChangeFromDependencies = function(mChangesMap, sChangeKey) {
		DependencyHandler.resolveDependenciesForChange(mChangesMap, sChangeKey);
		delete mChangesMap.mDependencies[sChangeKey];
	};

	/**
	 * Checks the dependencies map for any unresolved dependencies belonging to the given control.
	 * Returns <code>true</code> as soon as the first dependency is found, otherwise <code>false</code>
	 *
	 * @param {object} mChangesMap - Map with changes and dependencies
	 * @param {object} sId - ID of the control
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance that is currently loading
	 * @returns {boolean} <code>true</code> if there are open dependencies
	 */
	DependencyHandler.checkForOpenDependenciesForControl = function(mChangesMap, sId, oAppComponent) {
		return Object.keys(mChangesMap.mDependencies).some(function(sKey) {
			return mChangesMap.mDependencies[sKey].changeObject.getDependentSelectorList().some(function(oDependendSelector) {
				return JsControlTreeModifier.getControlIdBySelector(oDependendSelector, oAppComponent) === sId;
			});
		});
	};

	return DependencyHandler;
});