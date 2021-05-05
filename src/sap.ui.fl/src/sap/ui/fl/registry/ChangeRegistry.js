/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/each",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/registry/ChangeRegistryItem",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/fl/requireAsync",
	"sap/base/Log"
], function(
	each,
	ChangeHandlerStorage,
	ChangeRegistryItem,
	Settings,
	Utils,
	requireAsync,
	Log
) {
	"use strict";

	/**
	 * Central registration for available change types on controls
	 * @constructor
	 * @alias sap.ui.fl.registry.ChangeRegistry
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 *
	 */
	var ChangeRegistry = function() {
		// TODO: remove whole file
	};

	ChangeRegistry._instance = undefined;
	ChangeRegistry.prototype._oDefaultChangeHandlers = {};
	ChangeRegistry.prototype._mDeveloperModeChangeHandlers = {};

	/**
	 * Registers default change handlers and developer mode change handlers.
	 * @param {object} mDefaultHandlers - Map of default change handlers
	 * @param {object} mDeveloperModeHandlers - Map of developer change handlers
	 */
	 ChangeRegistry.prototype.registerPredefinedChangeHandlers = function(mDefaultHandlers, mDeveloperModeHandlers) {
		this._oDefaultChangeHandlers = mDefaultHandlers;
		this._mDeveloperModeChangeHandlers = mDeveloperModeHandlers;
	};

	ChangeRegistry.getInstance = function() {
		if (!ChangeRegistry._instance) {
			ChangeRegistry._instance = new ChangeRegistry();
		}
		return ChangeRegistry._instance;
	};

	/**
	 * Returns the Change Registry Item for a specific control instance (if available)
	 * @param  {string} sChangeType - Change type of a <code>sap.ui.fl.Change</code> change
	 * @param  {sap.ui.core.Control} oControl - Control instance for which the registry item will be retrieved
	 * @param  {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Control tree modifier
	 * @return {Promise.<sap.ui.fl.registry.ChangeRegistryItem>|sap.ui.fl.Utils.FakePromise.<undefined>} Registry item wrapped in a promise or undefined wrapped in a FakePromise if not found
	 * @private
	 */
	ChangeRegistry.prototype._getInstanceSpecificChangeRegistryItem = function (sChangeType, oControl, oModifier) {
		var sChangeHandlerModulePath = oModifier && oModifier.getChangeHandlerModulePath(oControl);
		if (typeof sChangeHandlerModulePath !== "string") {
			return new Utils.FakePromise(undefined); // continue without a registration
		}
		return requireAsync(sChangeHandlerModulePath)
			.then(function(oChangeHandlers) {
				var vChangeHandler = oChangeHandlers[sChangeType];
				if (!vChangeHandler) {
					return undefined;
				}
				var oChangeHandler = this._getChangeHandlerEntry(sChangeType, vChangeHandler);
				var oSimpleChange = {
					changeType: sChangeType,
					changeHandler: oChangeHandler.changeHandler,
					layers: oChangeHandler.layers
				};
				var sControlType = oModifier.getControlType(oControl);
				var oChangeRegistryItem = this._createChangeRegistryItemForSimpleChange(sControlType, oSimpleChange);
				return oChangeRegistryItem;
			}.bind(this))
			.catch(function(oError) {
				Log.error("Flexibility registration for control " + oModifier.getId(oControl) +
					" failed to load module " + sChangeHandlerModulePath + "\n" + oError.message);
				return undefined; // continue without a registration
			});
	};

	/**
	 * Adds registration for a control and a simple change; if changeHandler is 'default', the default change handler is used.
	 * @param {string} sChangeType - Change type of a <code>sap.ui.fl.Change</code> change
	 * @param {string | object} vChangeHandler - Can be a string with 'default' or a path to a change handler implementation or an object (see example)
	 * @returns {string|object} Returns the passed <code>sChangeHandler</code> or, if 'default', the loaded object of the default change handler
	 * @example {
	 * 				"moveControls": {
	 * 					"changeHandler": "default",
	 * 					"layers": {
	 * 						"USER": true
	 * 					}
	 * 				}
	 * 			}
	 *
	 * @private
	 */
	ChangeRegistry.prototype._getChangeHandlerEntry = function (sChangeType, vChangeHandler) {
		var oResult = {};
		var aDeveloperModeChangeHandlers = Object.keys(this._mDeveloperModeChangeHandlers);
		if (!vChangeHandler || !vChangeHandler.changeHandler) {
			oResult.changeHandler = vChangeHandler;
		} else {
			oResult = vChangeHandler;
		}
		if (oResult.changeHandler === "default") {
			oResult.changeHandler = this._oDefaultChangeHandlers[sChangeType];
		} else if (aDeveloperModeChangeHandlers.indexOf(sChangeType) > -1) {
			throw Error("You can't use a custom change handler for the following Developer Mode change types: " + aDeveloperModeChangeHandlers.toString() + ". Please use 'default' instead.");
		}
		return oResult;
	};

	/**
	 * Retrieve the change handler for a certain change type and control
	 * @param  {string} sChangeType - Change type of a <code>sap.ui.fl.Change</code> change
	 * @param  {string} sControlType - Name of the ui5 control type i.e. sap.m.Button
	 * @param  {sap.ui.core.Control} oControl - Control instance for which the change handler will be retrieved
	 * @param  {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - Control tree modifier
	 * @param  {string} sLayer - Layer to be considered when getting the change handlers
	 * @return {Promise.<object>|sap.ui.fl.Utils.FakePromise.<object>} Change handler object wrapped in a promise or FakePromise
	 */
	// TODO: move to ChangeHandlerStorage
	ChangeRegistry.prototype.getChangeHandler = function (sChangeType, sControlType, oControl, oModifier, sLayer) {
		return this._getInstanceSpecificChangeRegistryItem(sChangeType, oControl, oModifier)
		.then(function(oSpecificChangeRegistryItem) {
			var oChangeRegistryItem = oSpecificChangeRegistryItem || this._getRegistryItem(sControlType, sChangeType);

			if (!oChangeRegistryItem) {
				throw Error("No Change handler registered for the Control and Change type");
			}

			if (!this._isRegistryItemValidForLayer(oChangeRegistryItem, sLayer)) {
				throw Error("Change type " + sChangeType + " not enabled for layer " + sLayer);
			}
			return oChangeRegistryItem.getChangeHandler();
		}.bind(this));
	};

	/**
	 * Adds registration for a control and a simple change
	 * @param {String} sControlType - Name of the control
	 * @param {sap.ui.fl.registry.SimpleChange.member} oSimpleChange - One of the simple changes
	 * @returns {sap.ui.fl.registry.ChangeRegistryItem} the registry item
	 *
	 * @public
	 */
	ChangeRegistry.prototype._createChangeRegistryItemForSimpleChange = function(sControlType, oSimpleChange) {
		var mLayerPermissions = Object.assign({}, Settings.getDefaultLayerPermissions());
		var oLayers = oSimpleChange.layers;

		if (oLayers) {
			Object.keys(oLayers).forEach(function (sLayer) {
				if (mLayerPermissions[sLayer] === undefined) {
					throw Error("The Layer '" + sLayer + "' is not supported. Please only use supported layers");
				}
				mLayerPermissions[sLayer] = oLayers[sLayer];
			});
		}

		return new ChangeRegistryItem({
			controlType: sControlType,
			changeHandler: oSimpleChange.changeHandler,
			layers: mLayerPermissions,
			changeType: oSimpleChange.changeType
		});
	};

	ChangeRegistry.prototype._getRegistryItem = function (sControlType, sChangeType) {
		var oChangeRegistryItem = ChangeHandlerStorage.getRegistryItem(sControlType, sChangeType);
		if (oChangeRegistryItem) {
			return oChangeRegistryItem;
		}

		// developer mode change handlers
		var oDefaultActiveChangeHandler = ChangeHandlerStorage.getDeveloperModeChangeChangeRegistryItem(sChangeType);
		if (oDefaultActiveChangeHandler) {
			return oDefaultActiveChangeHandler;
		}
	};

	ChangeRegistry.prototype._isRegistryItemValidForLayer = function (oRegistryItem, sLayer) {
		var oLayers = oRegistryItem.getLayers();
		return !!oLayers[sLayer];
	};

	return ChangeRegistry;
});