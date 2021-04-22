/*!
* ${copyright}
*/

sap.ui.define([
	"sap/base/util/each",
	"sap/base/Log",
	"sap/ui/fl/registry/ChangeRegistryItem",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/requireAsync"
], function(
	each,
	Log,
	ChangeRegistryItem,
	Settings,
	requireAsync
) {
	"use strict";

	/**
	 * Storage of all registered change handlers
	 */
	var ChangeHandlerStorage = {};

	var mRegisteredItems = {};
	var mActiveForAllItems = {};
	var mPredefinedChangeHandlers = {};

	function replaceDefault(sChangeType, vChangeHandler) {
		var oResult = {};
		if (!vChangeHandler || !vChangeHandler.changeHandler) {
			oResult.changeHandler = vChangeHandler;
		} else {
			oResult = vChangeHandler;
		}

		if (oResult.changeHandler === "default") {
			oResult.changeHandler = mPredefinedChangeHandlers.defaultChangeHandlers[sChangeType];
		} else if (Object.keys(mPredefinedChangeHandlers.developerChangeHandlers).includes(sChangeType)) {
			throw Error("You can't use a custom change handler for the following Developer Mode change type: " + sChangeType + ". Please use 'default' instead.");
		}
		return oResult;
	}

	function createDeveloperChangeRegistryItems(mDeveloperModeHandlers) {
		mActiveForAllItems = {};
		each(mDeveloperModeHandlers, function(sChangeType, oChangeHandler) {
			var oChangeRegistryItem = new ChangeRegistryItem({
				controlType: "defaultActiveForAll",
				changeHandler: oChangeHandler,
				layers: Settings.getDeveloperModeLayerPermissions(),
				changeType: sChangeType
			});
			mActiveForAllItems[sChangeType] = oChangeRegistryItem;
		});
	}

	function createChangeRegistryItem(sControlType, sChangeType, oChangeHandler) {
		var mLayerPermissions = Object.assign({}, Settings.getDefaultLayerPermissions());

		if (oChangeHandler.layers) {
			each(oChangeHandler.layers, function(sLayer, bLayerPermission) {
				if (mLayerPermissions[sLayer] === undefined) {
					throw Error("The Layer '" + sLayer + "' is not supported. Please only use supported layers");
				}
				mLayerPermissions[sLayer] = bLayerPermission;
			});
		}

		var mParam = {
			controlType: sControlType,
			changeHandler: oChangeHandler.changeHandler,
			layers: mLayerPermissions,
			changeType: sChangeType
		};

		return new ChangeRegistryItem(mParam);
	}

	function createAndAddChangeRegistryItem(sControlType, sChangeType, oChangeHandler) {
		var oRegistryItem = createChangeRegistryItem(sControlType, sChangeType, oChangeHandler);

		mRegisteredItems[sControlType] = mRegisteredItems[sControlType] || {};
		mRegisteredItems[sControlType][sChangeType] = oRegistryItem;
	}

	function registerChangeHandlersForControl(sControlType, mChangeHandlers) {
		var oPromise = Promise.resolve(mChangeHandlers);
		var sSkipNext = "ChangeHandlerStorage.registerChangeHandlersForControl.skip_next_then";

		if (typeof mChangeHandlers === "string") {
			oPromise = requireAsync(mChangeHandlers + ".flexibility")
			.catch(function(oError) {
				Log.error("Flexibility change handler registration failed.\nControlType: " + sControlType + "\n" + oError.message);
				return Promise.resolve(sSkipNext); // continue without a registration
			});
		}

		return oPromise.then(function(vResult) {
			if (vResult !== sSkipNext) {
				each(vResult, function(sChangeType, vChangeHandler) {
					var oChangeHandler = replaceDefault(sChangeType, vChangeHandler);
					createAndAddChangeRegistryItem(sControlType, sChangeType, oChangeHandler);
				});
			}
		}).catch(function(oError) {
			Log.error(oError.message);
		});
	}

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

	ChangeHandlerStorage.getRegistryItem = function(sControlType, sChangeType) {
		return mRegisteredItems[sControlType] && mRegisteredItems[sControlType][sChangeType];
	};

	// TODO: keep change registry items internal
	ChangeHandlerStorage.getDeveloperModeChangeChangeRegistryItem = function(sChangeType) {
		return mActiveForAllItems[sChangeType];
	};

	ChangeHandlerStorage.isChangeHandlerRegistered = function(sControlType, sChangeType) {
		return Object.keys(mRegisteredItems[sControlType] || {}).includes(sChangeType);
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