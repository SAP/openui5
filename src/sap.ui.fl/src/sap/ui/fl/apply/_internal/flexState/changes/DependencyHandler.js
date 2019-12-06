/*
 * ! ${copyright}
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
	 * Includes functionality needed for all dependency handling
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.changes.DependencyHandler
	 * @experimental
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var DependencyHandler = {};


	function _getCompleteIdFromSelector(oSelector, oAppComponent) {
		return oSelector.idIsLocal ? oAppComponent.createId(oSelector.id) : oSelector.id;
	}

	function _addMapEntry(sSelectorId, oChange, mChangesMap) {
		if (!mChangesMap.mChanges[sSelectorId]) {
			mChangesMap.mChanges[sSelectorId] = [];
		}
		// don't add the same change twice
		if (mChangesMap.mChanges[sSelectorId].indexOf(oChange) === -1) {
			mChangesMap.mChanges[sSelectorId].push(oChange);
		}

		if (mChangesMap.aChanges.indexOf(oChange) === -1) {
			mChangesMap.aChanges.push(oChange);
		}
	}

	function _addChangeIntoMap(oChange, oAppComponent, mChangesMap) {
		var oSelector = oChange.getSelector();
		if (oSelector && oSelector.id) {
			var sSelectorId = _getCompleteIdFromSelector(oSelector, oAppComponent);

			_addMapEntry(sSelectorId, oChange, mChangesMap);

			// if the localId flag is missing and the selector has a component prefix that is not matching the
			// application component, adds the change for a second time replacing the component ID prefix with
			// the application component ID prefix
			if (oSelector.idIsLocal === undefined && sSelectorId.indexOf("---") !== -1) {
				var sComponentPrefix = sSelectorId.split("---")[0];

				if (sComponentPrefix !== oAppComponent.getId()) {
					sSelectorId = sSelectorId.split("---")[1];
					sSelectorId = oAppComponent.createId(sSelectorId);
					_addMapEntry(sSelectorId, oChange, mChangesMap);
				}
			}
		}
		return mChangesMap.aChanges;
	}

	function _addDependencies(oChange, oAppComponent, aChanges, mChangesMap) {
		var aDependentSelectorList = oChange.getDependentSelectorList();
		var aDependentControlSelectorList = oChange.getDependentControlSelectorList();
		_addControlsDependencies(oChange, oAppComponent, aDependentControlSelectorList, mChangesMap);

		// start from last change in map, excluding the recently added change
		aChanges.slice(0, aChanges.length - 1).reverse().forEach(function(oExistingChange) {
			var aExistingDependentSelectorList = oExistingChange.getDependentSelectorList();
			aDependentSelectorList.some(function(oDependentSelectorList) {
				var iDependentIndex = Utils.indexOfObject(aExistingDependentSelectorList, oDependentSelectorList);
				if (iDependentIndex > -1) {
					_addDependencyEntry(oChange, oExistingChange, mChangesMap);
					return true;
				}
			});
		});
	}

	function _addControlsDependencies(oDependentChange, oAppComponent, aControlSelectorList, mChangesMap) {
		if (aControlSelectorList.length > 0) {
			if (!mChangesMap.mDependencies[oDependentChange.getId()]) {
				mChangesMap.mDependencies[oDependentChange.getId()] = {
					changeObject: oDependentChange,
					dependencies: [],
					controlsDependencies: []
				};
			}
			mChangesMap.mDependencies[oDependentChange.getId()].controlsDependencies = aControlSelectorList;

			var sSelectorId;
			aControlSelectorList.forEach(function(oSelector) {
				sSelectorId = _getCompleteIdFromSelector(oSelector, oAppComponent);
				mChangesMap.mControlsWithDependencies[sSelectorId] = true;
			});
		}
	}

	function _addDependencyEntry(oDependentChange, oChange, mChangesMap) {
		if (!mChangesMap.mDependencies[oDependentChange.getId()]) {
			mChangesMap.mDependencies[oDependentChange.getId()] = {
				changeObject: oDependentChange,
				dependencies: []
			};
		}
		mChangesMap.mDependencies[oDependentChange.getId()].dependencies.push(oChange.getId());

		if (!mChangesMap.mDependentChangesOnMe[oChange.getId()]) {
			mChangesMap.mDependentChangesOnMe[oChange.getId()] = [];
		}
		mChangesMap.mDependentChangesOnMe[oChange.getId()].push(oDependentChange.getId());
	}

	/**
	 * Iterating over <code>mDependencies</code> once, executing relevant dependencies, and clearing dependencies queue.
	 *
	 * @param {object} mChangesMap - Changes map
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise for asynchronous or FakePromise for synchronous processing scenario
	 * @private
	 */
	function _iterateDependentQueue(mChangesMap, oAppComponent) {
		var aCoveredChanges = [];
		var aDependenciesToBeDeleted = [];
		var aPromises = [];
		_updateControlsDependencies(mChangesMap, oAppComponent);
		Object.keys(mChangesMap.mDependencies).forEach(function(sDependencyKey) {
			var oDependency = mChangesMap.mDependencies[sDependencyKey];
			if (
				oDependency[PENDING]
				&& oDependency.dependencies.length === 0
				&& !(oDependency.controlsDependencies && oDependency.controlsDependencies.length > 0)
			) {
				aPromises.push(function() {
					return oDependency[PENDING]().then(function () {
						aDependenciesToBeDeleted.push(sDependencyKey);
						aCoveredChanges.push(oDependency.changeObject.getId());
					});
				});
			}
		});

		return Utils.execPromiseQueueSequentially(aPromises).then(function () {
			for (var j = 0; j < aDependenciesToBeDeleted.length; j++) {
				delete mChangesMap.mDependencies[aDependenciesToBeDeleted[j]];
			}

			// dependencies should be updated after all processing functions are executed and dependencies are deleted
			for (var k = 0; k < aCoveredChanges.length; k++) {
				DependencyHandler.removeChangeFromDependencies(mChangesMap, aCoveredChanges[k]);
			}

			return aCoveredChanges;
		});
	}

	function _updateControlsDependencies(mChangesMap, oAppComponent) {
		Object.keys(mChangesMap.mDependencies).forEach(function(sChangeKey) {
			var oDependency = mChangesMap.mDependencies[sChangeKey];
			if (oDependency.controlsDependencies && oDependency.controlsDependencies.length > 0) {
				var iLength = oDependency.controlsDependencies.length;
				while (iLength--) {
					var oSelector = oDependency.controlsDependencies[iLength];
					var oControl = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
					if (oControl) {
						oDependency.controlsDependencies.splice(iLength, 1);
						delete mChangesMap.mControlsWithDependencies[oControl.getId()];
					}
				}
			}
		});
	}

	/**
	 * Adds a change to the map and adds the dependencies to the changes map
	 *
	 * @param {sap.ui.fl.changeObject} oChange - Change instance
	 * @param {sap.ui.core.UIComponent} oAppComponent - Component instance to get the whole ID for the control
	 * @param {object} mChangesMap - Map with changes and dependencies
	 */
	DependencyHandler.addChangeAndUpdateDependencies = function(oChange, oAppComponent, mChangesMap) {
		var aChanges = _addChangeIntoMap(oChange, oAppComponent, mChangesMap);
		_addDependencies(oChange, oAppComponent, aChanges, mChangesMap);
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
		var aChanges = _addChangeIntoMap(oChange, oAppComponent, mChangesMap);
		_addDependencies(oChange, oAppComponent, aChanges, mInitialChangesMap);
	};

	/**
	 * Recursive iterations, which are processed sequentially, as long as dependent changes can be applied.
	 *
	 * @param {object} mChangesMap - Changes map
	 * @param {sap.ui.core.Component} oAppComponent - Application component instance
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all dependencies were processed for asynchronous or FakePromise for the synchronous processing scenario
	 */
	DependencyHandler.processDependentQueue = function (mChangesMap, oAppComponent) {
		return _iterateDependentQueue(mChangesMap, oAppComponent).then(function(aCoveredChanges) {
			if (aCoveredChanges.length > 0) {
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
	 * Removes the change from the dependencies
	 *
	 * @param {object} mChangesMap - Changes Map
	 * @param {string} sChangeKey - Key of the change which dependencies have to be resolved
	 */
	DependencyHandler.removeChangeFromDependencies = function(mChangesMap, sChangeKey) {
		if (mChangesMap.mDependentChangesOnMe[sChangeKey]) {
			mChangesMap.mDependentChangesOnMe[sChangeKey].forEach(function (sKey) {
				var oDependency = mChangesMap.mDependencies[sKey];

				// oDependency might be undefined, since initial dependencies were not copied yet from applyAllChangesForControl() for change with ID sKey
				var iIndex = oDependency ? oDependency.dependencies.indexOf(sChangeKey) : -1;
				if (iIndex > -1) {
					oDependency.dependencies.splice(iIndex, 1);
				}
			});
			delete mChangesMap.mDependentChangesOnMe[sChangeKey];
		}
	};

	return DependencyHandler;
});