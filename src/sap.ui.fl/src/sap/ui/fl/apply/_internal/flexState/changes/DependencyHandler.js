/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils"
], function(
	JsControlTreeModifier,
	Utils
) {
	"use strict";

	var PENDING = "sap.ui.fl:PendingChange";

	/**
	 * Includes functionality needed for all change dependency handling
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.changes.DependencyHandler
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var DependencyHandler = {};

	function getCompleteIdFromSelector(oSelector, oAppComponent) {
		return JsControlTreeModifier.getControlIdBySelector(oSelector, oAppComponent);
	}

	function createNewDependencyObject(oChange) {
		return {
			changeObject: oChange,
			dependencies: [],
			controlsDependencies: [],
			dependentIds: []
		};
	}

	function addMapEntry(sSelectorId, oChange, oDependencyMap) {
		addChangeIntoSelectorList(oDependencyMap, oChange, sSelectorId);
		addChangeIntoList(oDependencyMap, oChange);
	}

	function addChangeIntoList(oDependencyMap, oChange) {
		if (!oDependencyMap.aChanges.includes(oChange)) {
			oDependencyMap.aChanges.push(oChange);
		}
	}

	function addChangeIntoSelectorList(oDependencyMap, oChange, sSelectorId) {
		oDependencyMap.mChanges[sSelectorId] ||= [];

		if (!oDependencyMap.mChanges[sSelectorId].includes(oChange)) {
			oDependencyMap.mChanges[sSelectorId].push(oChange);
		}
	}

	function addChangeIntoMap(oChange, oAppComponent, oDependencyMap) {
		var oSelector = oChange.getSelector();
		if (oSelector) {
			if (oSelector.id) {
				addMapEntry(getCompleteIdFromSelector(oSelector, oAppComponent), oChange, oDependencyMap);
			} else {
				// If the selector id is not defined, add the change to the list to make sure it has the correct order
				addChangeIntoList(oDependencyMap, oChange);
			}
		}
		return oDependencyMap.aChanges;
	}

	function isSelectorInArray(aExistingDependentSelectorList, oDependentSelector) {
		return aExistingDependentSelectorList.some(function(oExistingDependentSelector) {
			return (
				oExistingDependentSelector.id === oDependentSelector.id
				&& oExistingDependentSelector.idIsLocal === oDependentSelector.idIsLocal
			);
		});
	}

	function addChangesDependencies(
		oTargetChange,
		aDependentSelectorsOfTargetChange,
		oExistingChange,
		bCheckingOrder,
		oAppComponent,
		aChanges,
		oDependencyMap
	) {
		var aDependentSelectorsOfExistingChange = oExistingChange.getDependentSelectorList();
		aDependentSelectorsOfTargetChange.some(function(oDependentSelector) {
			// If 2 changes have the same dependent selector, they are depend on each other
			if (isSelectorInArray(aDependentSelectorsOfExistingChange, oDependentSelector)) {
				var sDependentControlId = getCompleteIdFromSelector(oDependentSelector, oAppComponent);
				// If checking order is required, the target change and the existing change can be in revert order
				var bIsChangesInRevertOrder = bCheckingOrder && aChanges.indexOf(oTargetChange) < aChanges.indexOf(oExistingChange);
				if (bIsChangesInRevertOrder) {
					addDependencyEntry(oExistingChange, oTargetChange, sDependentControlId, oDependencyMap, true);
				} else {
					addDependencyEntry(oTargetChange, oExistingChange, sDependentControlId, oDependencyMap);
				}
				return true;
			}
			return false;
		});
	}

	function addDependencies(oTargetChange, oAppComponent, aChanges, oDependencyMap) {
		if (oTargetChange.isValidForDependencyMap()) {
			var aDependentSelectors = oTargetChange.getDependentSelectorList();

			addControlsDependencies(oTargetChange, aDependentSelectors, oAppComponent, oDependencyMap);

			// Find and add dependencies between the target change and other changes in map
			// If the target change is not at the end of array, the order checking is required
			var iIndexOfTargetChange = aChanges.indexOf(oTargetChange);
			var bCheckingOrder = iIndexOfTargetChange < (aChanges.length - 1);

			var aOtherChanges = aChanges.slice();
			aOtherChanges.splice(iIndexOfTargetChange, 1);
			aOtherChanges.reverse().forEach(function(oExistingChange) {
				if (oExistingChange.isValidForDependencyMap()) {
					addChangesDependencies(
						oTargetChange,
						aDependentSelectors,
						oExistingChange,
						bCheckingOrder,
						oAppComponent,
						aChanges,
						oDependencyMap
					);
				}
			});
		}
	}

	function addControlsDependencies(oDependentChange, aDependentSelectorList, oAppComponent, oDependencyMap) {
		if (aDependentSelectorList.length) {
			var aDependentIdList = aDependentSelectorList.map(function(oSelector) {
				return getCompleteIdFromSelector(oSelector, oAppComponent);
			});

			if (!oDependencyMap.mDependencies[oDependentChange.getId()]) {
				oDependencyMap.mDependencies[oDependentChange.getId()] = createNewDependencyObject(oDependentChange);
			}
			oDependencyMap.mDependencies[oDependentChange.getId()].controlsDependencies = aDependentIdList;

			aDependentIdList.forEach(function(sId) {
				oDependencyMap.mControlsWithDependencies[sId] ||= [];
				oDependencyMap.mControlsWithDependencies[sId].push(oDependentChange.getId());
			});
		}
	}

	function addDependencyEntry(oDependentChange, oChange, sDependentControlId, oDependencyMap, bIsChangesInRevertOrder) {
		if (isDependencyNeeded(oDependentChange, oChange, sDependentControlId, oDependencyMap, bIsChangesInRevertOrder)) {
			oDependencyMap.mDependencies[oDependentChange.getId()].dependencies.push(oChange.getId());
			if (!oDependencyMap.mDependencies[oDependentChange.getId()].dependentIds.includes(sDependentControlId)) {
				oDependencyMap.mDependencies[oDependentChange.getId()].dependentIds.push(sDependentControlId);
			}

			if (!oDependencyMap.mDependentChangesOnMe[oChange.getId()]) {
				oDependencyMap.mDependentChangesOnMe[oChange.getId()] = [];
			}
			oDependencyMap.mDependentChangesOnMe[oChange.getId()].push(oDependentChange.getId());
		}
	}

	function isDependencyNeeded(oDependentChange, oChange, sDependentControlId, oDependencyMap, bIsChangesInRevertOrder) {
		var bSelectorAlreadyThere =
			!bIsChangesInRevertOrder && oDependencyMap.mDependencies[oDependentChange.getId()].dependentIds.includes(sDependentControlId);
		var bIndirectDependency = false;
		if (oDependencyMap.mDependentChangesOnMe[oChange.getId()]) {
			oDependencyMap.mDependentChangesOnMe[oChange.getId()].some(function(sChangeId) {
				bIndirectDependency = oDependencyMap.mDependencies[oDependentChange.getId()].dependencies.includes(sChangeId);
				return bIndirectDependency;
			});
		}

		return !bSelectorAlreadyThere && !bIndirectDependency;
	}

	function removeChangeFromList(oDependencyMap, sChangeKey) {
		const iIndex = oDependencyMap.aChanges.findIndex((oChange) => oChange.getId() === sChangeKey);

		if (iIndex !== -1) {
			oDependencyMap.aChanges.splice(iIndex, 1);
		}
	}

	/**
	 * Iterating over <code>mDependencies</code> once, executing relevant dependencies, and clearing dependencies queue.
	 *
	 * @param {object} oDependencyMap - Changes map
	 * @param {string} sControlId - ID of the control
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise for asynchronous or FakePromise for synchronous processing scenario
	 * @private
	 */
	function iterateDependentQueue(oDependencyMap, sControlId) {
		var aCoveredChanges = [];
		var aDependenciesToBeDeleted = [];
		var aPromises = [];
		if (oDependencyMap.dependencyRemovedInLastBatch[sControlId]) {
			oDependencyMap.dependencyRemovedInLastBatch[sControlId].forEach(function(sDependencyKey) {
				var oDependency = oDependencyMap.mDependencies[sDependencyKey];
				if (
					oDependency
					&& oDependency.dependencies.length === 0
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
		}

		return Utils.execPromiseQueueSequentially(aPromises).then(function(aCoveredChanges, aDependenciesToBeDeleted, sControlId) {
			delete oDependencyMap.dependencyRemovedInLastBatch[sControlId];
			aDependenciesToBeDeleted.forEach(function(sDependencyKey) {
				delete oDependencyMap.mDependencies[sDependencyKey];
			});

			aCoveredChanges.forEach(function(sChangeId) {
				DependencyHandler.resolveDependenciesForChange(oDependencyMap, sChangeId, sControlId);
			});

			return !!aCoveredChanges.length;
		}.bind(undefined, aCoveredChanges, aDependenciesToBeDeleted, sControlId));
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
			dependencyRemovedInLastBatch: {}
		};
	};

	/**
	 * Adds a change to the map and adds the dependencies to the changes map
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
	 * @param {sap.ui.core.UIComponent} oAppComponent - Component instance to get the whole ID for the control
	 * @param {object} oDependencyMap - Map with changes and dependencies
	 */
	DependencyHandler.addChangeAndUpdateDependencies = function(oChange, oAppComponent, oDependencyMap) {
		var aChanges = addChangeIntoMap(oChange, oAppComponent, oDependencyMap);
		addDependencies(oChange, oAppComponent, aChanges, oDependencyMap);
	};

	/**
	 * Insert Change into changes map positioned right after the referenced change
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
	 * @param {object} oDependencyMap - Map with changes and dependencies
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oReferenceChange - Reference change. New change is positioned right after this one in the changes map
	 */
	DependencyHandler.insertChange = function(oChange, oDependencyMap, oReferenceChange) {
		var iIndex = oDependencyMap && oDependencyMap.aChanges && oDependencyMap.aChanges.indexOf(oReferenceChange);
		if (iIndex > -1) {
			oDependencyMap.aChanges.splice(iIndex + 1, 0, oChange);
		}
	};

	/**
	 * Adds a change to the dependency map during runtime
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
	 * @param {sap.ui.core.UIComponent} oAppComponent - Component instance to get the whole ID for the control
	 * @param {object} oDependencyMap - Map with changes and dependencies
	 */
	DependencyHandler.addRuntimeChangeToMap = function(oChange, oAppComponent, oDependencyMap) {
		addChangeIntoMap(oChange, oAppComponent, oDependencyMap);
	};

	/**
	 * Recursive iterations, which are processed sequentially, as long as dependent changes can be applied.
	 *
	 * @param {object} oDependencyMap - Changes map
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @param {string} sControlId - ID of the control
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all dependencies were processed for asynchronous or FakePromise for the synchronous processing scenario
	 */
	DependencyHandler.processDependentQueue = function(oDependencyMap, oAppComponent, sControlId) {
		return iterateDependentQueue(oDependencyMap, sControlId).then(function(sControlId, bContinue) {
			if (bContinue) {
				return DependencyHandler.processDependentQueue(oDependencyMap, oAppComponent, sControlId);
			}
			return undefined;
		}.bind(undefined, sControlId));
	};

	/**
	 * Saves a function in the dependency that will be called as soon as the dependency is resolved.
	 *
	 * @param {object} oDependencyMap - Changes map
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} sChangeId - Change ID
	 * @param {function} fnCallback - Function that will be saved in the dependency
	 */
	DependencyHandler.addChangeApplyCallbackToDependency = function(oDependencyMap, sChangeId, fnCallback) {
		oDependencyMap.mDependencies[sChangeId][PENDING] = fnCallback;
	};

	/**
	 * Removes the dependencies to a control. Iterates through the list of changes saved in the <code>mControlsWithDependencies</code> map
	 * and removes the <code>controlsDependencies</code> in the dependency of that change.
	 *
	 * @param {object} oDependencyMap - Changes map
	 * @param {string} sControlId - ID of the control
	 */
	DependencyHandler.removeControlsDependencies = function(oDependencyMap, sControlId) {
		var aDependentChanges = oDependencyMap.mControlsWithDependencies[sControlId];
		if (aDependentChanges) {
			aDependentChanges.forEach(function(sChangeKey) {
				var oDependency = oDependencyMap.mDependencies[sChangeKey];
				if (
					oDependency
					&& oDependency.controlsDependencies
					&& oDependency.controlsDependencies.length
				) {
					var iIndex = oDependency.controlsDependencies.indexOf(sControlId);
					if (iIndex > -1) {
						oDependency.controlsDependencies.splice(iIndex, 1);
						delete oDependencyMap.mControlsWithDependencies[sControlId];
						oDependencyMap.dependencyRemovedInLastBatch[sControlId] ||= [];
						if (!oDependencyMap.dependencyRemovedInLastBatch[sControlId].includes(sChangeKey)) {
							oDependencyMap.dependencyRemovedInLastBatch[sControlId].push(sChangeKey);
						}
					}
				}
			});
			delete oDependencyMap.mControlsWithDependencies[sControlId];
		}
	};

	/**
	 * Resolves the dependency from the dependent changes;
	 * Loops over all the dependent changes and removes the dependency to this change
	 * After the dependency is resolved the change is removed from the list of changes (aChanges)
	 *
	 * @param {object} oDependencyMap - Changes Map
	 * @param {string} sChangeKey - Key of the change which dependencies have to be resolved
	 * @param {string} sControlId - ID of the control
	 */
	DependencyHandler.resolveDependenciesForChange = function(oDependencyMap, sChangeKey, sControlId) {
		var mDependentChangesOnMe = oDependencyMap.mDependentChangesOnMe[sChangeKey];
		if (mDependentChangesOnMe) {
			mDependentChangesOnMe.forEach(function(sKey) {
				var oDependency = oDependencyMap.mDependencies[sKey];

				// oDependency might be undefined, since initial dependencies were not copied yet from applyAllChangesForControl()
				// for change with ID sKey
				var iIndex = oDependency ? oDependency.dependencies.indexOf(sChangeKey) : -1;
				if (iIndex > -1) {
					oDependency.dependencies.splice(iIndex, 1);
					oDependencyMap.dependencyRemovedInLastBatch[sControlId] ||= [];
					if (!oDependencyMap.dependencyRemovedInLastBatch[sControlId].includes(sKey)) {
						oDependencyMap.dependencyRemovedInLastBatch[sControlId].push(sKey);
					}
				}
			});
			delete oDependencyMap.mDependentChangesOnMe[sChangeKey];
		}
		removeChangeFromList(oDependencyMap, sChangeKey);
	};

	/**
	 * Removes the change from the maps;
	 * Should be called together with DependencyHandler.removeChangeFromDependencies to also resolve dependencies
	 *
	 * @param {object} oDependencyMap - Changes Map
	 * @param {string} sChangeKey - Key of the change which dependencies have to be resolved
	 */
	DependencyHandler.removeChangeFromMap = function(oDependencyMap, sChangeKey) {
		Object.keys(oDependencyMap.mChanges).some(function(sCurrentControlId) {
			var aChanges = oDependencyMap.mChanges[sCurrentControlId];
			var iIndexInMapElement = aChanges.map(function(oExistingChange) {
				return oExistingChange.getId();
			}).indexOf(sChangeKey);

			if (iIndexInMapElement !== -1) {
				aChanges.splice(iIndexInMapElement, 1);
				return true;
			}
			return false;
		});

		removeChangeFromList(oDependencyMap, sChangeKey);
	};

	/**
	 * Resolves all the dependencies of the current change and then removes it from the dependencies;
	 * This does not trigger applying of changes that might now be free of dependencies
	 *
	 * @param {object} oDependencyMap - Changes Map
	 * @param {string} sChangeKey - Key of the change which dependencies have to be resolved
	 * @param {string} sControlId - ID of the control
	 */
	DependencyHandler.removeChangeFromDependencies = function(oDependencyMap, sChangeKey, sControlId) {
		DependencyHandler.resolveDependenciesForChange(oDependencyMap, sChangeKey, sControlId);
		delete oDependencyMap.mDependencies[sChangeKey];
	};

	/**
	 * Checks the dependencies map for any open (unresolved) dependencies belonging to the given control and
	 * returns the dependent changes.
	 *
	 * @param {object} oDependencyMap - Map with changes and dependencies
	 * @param {object} sControlId - ID of the control
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance that is currently loading
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of all open dependent changes for the control
	 */
	DependencyHandler.getOpenDependentChangesForControl = function(oDependencyMap, sControlId, oAppComponent) {
		var aDependentChanges = [];
		Object.keys(oDependencyMap.mDependencies).forEach(function(sKey) {
			 oDependencyMap.mDependencies[sKey].changeObject.getDependentSelectorList().forEach(function(oDependendSelector) {
				if (JsControlTreeModifier.getControlIdBySelector(oDependendSelector, oAppComponent) === sControlId) {
					aDependentChanges.push(oDependencyMap.mDependencies[sKey].changeObject);
				}
			});
		});
		return aDependentChanges;
	};

	return DependencyHandler;
});