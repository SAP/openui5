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
		if (!mChangesMap.mChanges[sSelectorId]) {
			mChangesMap.mChanges[sSelectorId] = [];
		}

		if (!includes(mChangesMap.mChanges[sSelectorId], oChange)) {
			mChangesMap.mChanges[sSelectorId].push(oChange);
		}

		if (!includes(mChangesMap.aChanges, oChange)) {
			mChangesMap.aChanges.push(oChange);
		}
	}

	function addChangeIntoMap(oChange, oAppComponent, mChangesMap) {
		var oSelector = oChange.getSelector();
		if (oSelector && oSelector.id) {
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
		}
		return mChangesMap.aChanges;
	}

	function addDependencies(oChange, oAppComponent, aChanges, mChangesMap) {
		var aDependentSelectorList = oChange.getDependentSelectorList();
		addControlsDependencies(oChange, aDependentSelectorList, oAppComponent, mChangesMap);

		// start from last change in map, excluding the recently added change
		aChanges.slice(0, aChanges.length - 1).reverse().forEach(function(oExistingChange) {
			var aExistingDependentSelectorList = oExistingChange.getDependentSelectorList();
			aDependentSelectorList.some(function(oDependentSelector) {
				var iDependentIndex = Utils.indexOfObject(aExistingDependentSelectorList, oDependentSelector);
				if (iDependentIndex > -1) {
					var oDependentControlId = getCompleteIdFromSelector(oDependentSelector, oAppComponent);
					addDependencyEntry(oChange, oExistingChange, oDependentControlId, mChangesMap);
					return true;
				}
			});
		});
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

	function addDependencyEntry(oDependentChange, oChange, oDependentControlId, mChangesMap) {
		if (isDependencyNeeded(oDependentChange, oChange, oDependentControlId, mChangesMap)) {
			mChangesMap.mDependencies[oDependentChange.getId()].dependencies.push(oChange.getId());
			mChangesMap.mDependencies[oDependentChange.getId()].dependentIds.push(oDependentControlId);

			if (!mChangesMap.mDependentChangesOnMe[oChange.getId()]) {
				mChangesMap.mDependentChangesOnMe[oChange.getId()] = [];
			}
			mChangesMap.mDependentChangesOnMe[oChange.getId()].push(oDependentChange.getId());
		}
	}

	function isDependencyNeeded(oDependentChange, oChange, oDependentControlId, mChangesMap) {
		var bSelectorAlreadyThere = includes(mChangesMap.mDependencies[oDependentChange.getId()].dependentIds, oDependentControlId);
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
				DependencyHandler.removeChangeFromDependencies(mChangesMap, sChangeId);
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
	 * Removes the change from the dependencies
	 *
	 * @param {object} mChangesMap - Changes Map
	 * @param {string} sChangeKey - Key of the change which dependencies have to be resolved
	 */
	DependencyHandler.removeChangeFromDependencies = function(mChangesMap, sChangeKey) {
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

	return DependencyHandler;
});