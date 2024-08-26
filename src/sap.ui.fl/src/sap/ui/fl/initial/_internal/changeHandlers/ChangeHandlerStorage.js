/*!
* ${copyright}
*/

sap.ui.define([
	"sap/base/util/each",
	"sap/base/Log",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/requireAsync"
], function(
	each,
	Log,
	Layer,
	Settings,
	requireAsync
) {
	"use strict";

	/**
	 * Storage of all registered change handlers.
	 *
	 * @alias sap.ui.fl.registry.ChangeHandlerStorage
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 *
	 */
	var ChangeHandlerStorage = {};

	var mRegisteredItems = {};
	var mActiveForAllItems = {};
	var mPredefinedChangeHandlers = {};

	function checkPreconditions(oChangeHandlerEntry) {
		if (!oChangeHandlerEntry.changeHandler) {
			Log.error("sap.ui.fl.registry.ChangeRegistryStorage: changeHandler required");
			return false;
		}
		return true;
	}

	function resolveChangeHandlerIfNecessary(oChangeHandlerEntry) {
		if (typeof oChangeHandlerEntry.changeHandler === "string") {
			return requireAsync(oChangeHandlerEntry.changeHandler.replace(/\./g, "/")).then(function(oChangeHandlerImpl) {
				oChangeHandlerEntry.changeHandler = oChangeHandlerImpl;
				return oChangeHandlerEntry.changeHandler;
			});
		}
		return oChangeHandlerEntry.changeHandler;
	}

	function replaceDefault(sChangeType, vChangeHandler) {
		var oResult = {};
		if (!vChangeHandler || !vChangeHandler.changeHandler) {
			oResult.changeHandler = vChangeHandler;
		} else {
			oResult = vChangeHandler;
		}

		if (oResult.changeHandler === "default") {
			oResult.changeHandler = mPredefinedChangeHandlers.defaultChangeHandlers[sChangeType];
		} else if (Object.keys(mPredefinedChangeHandlers.developerChangeHandlers || {}).includes(sChangeType)) {
			throw Error(`You can't use a custom change handler for the following Developer Mode change type: ${sChangeType}. Please use 'default' instead.`);
		}
		return oResult;
	}

	function createDeveloperChangeRegistryItems(mDeveloperModeHandlers) {
		mActiveForAllItems = {};
		each(mDeveloperModeHandlers, function(sChangeType, oChangeHandler) {
			var oChangeRegistryItem = {
				controlType: "defaultActiveForAll",
				changeHandler: oChangeHandler,
				layers: Settings.getDeveloperModeLayerPermissions(),
				changeType: sChangeType
			};
			mActiveForAllItems[sChangeType] = oChangeRegistryItem;
		});
	}

	function createChangeRegistryItem(sControlType, sChangeType, oChangeHandler) {
		oChangeHandler = replaceDefault(sChangeType, oChangeHandler);
		const mLayerPermissions = { ...Settings.getDefaultLayerPermissions() };

		if (oChangeHandler.layers) {
			each(oChangeHandler.layers, function(sLayer, bLayerPermission) {
				if (mLayerPermissions[sLayer] === undefined) {
					throw Error(`The Layer '${sLayer}' is not supported. Please only use supported layers`);
				}
				mLayerPermissions[sLayer] = bLayerPermission;
			});
		}

		const oChangeHandlerEntry = {
			controlType: sControlType,
			changeHandler: oChangeHandler.changeHandler,
			layers: mLayerPermissions,
			changeType: sChangeType
		};

		return checkPreconditions(oChangeHandlerEntry) ? oChangeHandlerEntry : undefined;
	}

	function createAndAddChangeRegistryItem(sControlType, sChangeType, oChangeHandler) {
		var oRegistryItem = createChangeRegistryItem(sControlType, sChangeType, oChangeHandler);

		if (oRegistryItem) {
			mRegisteredItems[sControlType] ||= {};
			mRegisteredItems[sControlType][sChangeType] = oRegistryItem;
		}
	}

	function registerChangeHandlersForControl(sControlType, mChangeHandlers) {
		var oPromise = Promise.resolve(mChangeHandlers);
		var sSkipNext = "ChangeHandlerStorage.registerChangeHandlersForControl.skip_next_then";

		if (typeof mChangeHandlers === "string") {
			oPromise = requireAsync(`${mChangeHandlers}.flexibility`)
			.catch(function(oError) {
				Log.error(`Flexibility change handler registration failed.\nControlType: ${sControlType}\n${oError.message}`);
				return Promise.resolve(sSkipNext); // continue without a registration
			});
		}

		return oPromise.then(function(vResult) {
			if (vResult !== sSkipNext) {
				each(vResult, function(sChangeType, vChangeHandler) {
					createAndAddChangeRegistryItem(sControlType, sChangeType, vChangeHandler);
				});
			}
		}).catch(function(oError) {
			Log.error(oError.message);
		});
	}

	function getRegistryItemOrThrowError(sControlType, sChangeType, sLayer) {
		var oRegistryItem = mRegisteredItems[sControlType] && mRegisteredItems[sControlType][sChangeType] || mActiveForAllItems[sChangeType];

		if (!oRegistryItem) {
			throw Error("No Change handler registered for the Control and Change type");
		}

		// all USER layer changes are also enabled in the PUBLIC layer
		sLayer = sLayer === Layer.PUBLIC ? Layer.USER : sLayer;

		if (!oRegistryItem.layers[sLayer]) {
			throw Error(`Change type ${sChangeType} not enabled for layer ${sLayer}`);
		}

		return oRegistryItem;
	}

	function getInstanceSpecificChangeRegistryItem(sChangeType, sControlType, oControl, oModifier) {
		var sChangeHandlerModulePath = oModifier.getChangeHandlerModulePath(oControl);
		if (typeof sChangeHandlerModulePath !== "string") {
			return Promise.resolve(undefined);
		}

		return requireAsync(sChangeHandlerModulePath).then(function(vChangeHandlerRegistration) {
			var vChangeHandler = vChangeHandlerRegistration[sChangeType];
			if (vChangeHandler) {
				return createChangeRegistryItem(sControlType, sChangeType, vChangeHandler);
			}
		}).catch(function(oError) {
			Log.error(`Flexibility registration for control ${oModifier.getId(oControl)} failed to load module ${sChangeHandlerModulePath}\n${oError.message}`);
		});
	}

	/**
	 * Retrieves the change handler for a certain change type and control. Also checks for instance specific change handlers.
	 * If the passed layer does not match or no change handler is found the promise will be rejected.
	 *
	 * @param {string} sChangeType - Change type of a <code>sap.ui.fl.apply._internal.flexObjects.FlexObject</code> change
	 * @param {string} sControlType - Name of the ui5 control type i.e. sap.m.Button
	 * @param {sap.ui.core.Control} oControl - Control instance for which the instance specific change handler will be retrieved
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Control tree modifier
	 * @param {string} sLayer - Layer to be considered when getting the change handlers
	 * @return {Promise.<object>} Change handler object wrapped in a promise
	 */
	ChangeHandlerStorage.getChangeHandler = function(sChangeType, sControlType, oControl, oModifier, sLayer) {
		return getInstanceSpecificChangeRegistryItem(sChangeType, sControlType, oControl, oModifier)
		.then(function(vInstanceSpecificRegistryItem) {
			var oChangeRegistryItem = vInstanceSpecificRegistryItem || getRegistryItemOrThrowError(sControlType, sChangeType, sLayer);
			return resolveChangeHandlerIfNecessary(oChangeRegistryItem);
		}).then(function(oChangeHandler) {
			if (
				typeof oChangeHandler.completeChangeContent !== "function"
				|| typeof oChangeHandler.applyChange !== "function"
				|| typeof oChangeHandler.revertChange !== "function"
			) {
				throw new Error("The ChangeHandler is either not available or does not have all required functions");
			}
			return oChangeHandler;
		});
	};

	/**
	 * Registers default change handlers and developer mode change handlers.
	 * @param {object} mDefaultHandlers - Map of default change handlers
	 * @param {object} mDeveloperModeHandlers - Map of developer change handlers
	 */
	ChangeHandlerStorage.registerPredefinedChangeHandlers = function(mDefaultHandlers, mDeveloperModeHandlers) {
		mPredefinedChangeHandlers.defaultChangeHandlers = mDefaultHandlers;
		mPredefinedChangeHandlers.developerChangeHandlers = mDeveloperModeHandlers;
		createDeveloperChangeRegistryItems(mDeveloperModeHandlers);
	};

	ChangeHandlerStorage.registerChangeHandlersForLibrary = function(mChangeHandlersForLibrary) {
		var aPromises = [];
		each(mChangeHandlersForLibrary, function(sControlType, vChangeHandlers) {
			aPromises.push(registerChangeHandlersForControl(sControlType, vChangeHandlers));
		});
		return Promise.all(aPromises);
	};

	// TODO: check if this should also be called in productive coding. if so care about async registration
	ChangeHandlerStorage.clearAll = function() {
		mRegisteredItems = {};
		mActiveForAllItems = {};
		mPredefinedChangeHandlers = {};
	};

	// TODO: remove, used in test coding
	ChangeHandlerStorage.registerChangeHandlersForControl = function(sControlType, mChangeHandlers) {
		return registerChangeHandlersForControl(sControlType, mChangeHandlers);
	};

	return ChangeHandlerStorage;
});