/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"jquery.sap.global",
	"sap/ui/fl/registry/ChangeRegistryItem",
	"sap/ui/fl/registry/ChangeTypeMetadata",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/changeHandler/MoveElements",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/fl/changeHandler/PropertyBindingChange",
	"sap/ui/fl/changeHandler/UnhideControl",
	"sap/ui/fl/changeHandler/StashControl",
	"sap/ui/fl/changeHandler/UnstashControl",
	"sap/ui/fl/changeHandler/AddXML"
], function(
	Utils,
	jQuery,
	ChangeRegistryItem,
	ChangeTypeMetadata,
	Settings,
	HideControl,
	MoveElements,
	MoveControls,
	PropertyChange,
	PropertyBindingChange,
	UnhideControl,
	StashControl,
	UnstashControl,
	AddXML
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
		this._registeredItems = {};
		this.initSettings();
		this.initDeveloperModeChangeHandlers();
	};

	ChangeRegistry._instance = undefined;
	ChangeRegistry.prototype._oDefaultActiveChangeHandlers = {};

	ChangeRegistry.prototype._oDefaultChangeHandlers = {
		"hideControl": HideControl,
		"moveElements": MoveElements,
		"moveControls": MoveControls,
		"unhideControl": UnhideControl,
		"stashControl": StashControl,
		"unstashControl": UnstashControl
	};

	ChangeRegistry.prototype._mDeveloperModeChangeHandlers = {
		"propertyChange": {
			changeHandler: PropertyChange
		},
		"propertyBindingChange": {
			changeHandler: PropertyBindingChange
		},
		"addXML": {
			changeHandler: AddXML
		}
	};

	ChangeRegistry.prototype.initDeveloperModeChangeHandlers = function () {
		Object.keys(this._mDeveloperModeChangeHandlers).forEach(function(sChangeType) {
			var oChangeHandler = this._mDeveloperModeChangeHandlers[sChangeType].changeHandler;
			var oLayers = this._oSettings.getDeveloperModeLayerPermissions();
			var oSimpleChangeObject = {
				changeType: sChangeType,
				changeHandler: oChangeHandler,
				layers: oLayers
			};
			var oChangeRegistryItem = this._createChangeRegistryItemForSimpleChange("defaultActiveForAllControls", oSimpleChangeObject);
			this._oDefaultActiveChangeHandlers[sChangeType] = oChangeRegistryItem;
		}.bind(this));
	};

	ChangeRegistry.getInstance = function() {
		if (!ChangeRegistry._instance) {
			ChangeRegistry._instance = new ChangeRegistry();
		}
		return ChangeRegistry._instance;
	};

	ChangeRegistry.prototype.hasRegisteredChangeHandlersForControl = function (sControlType) {
		var aControlsWithRegistered = Object.keys(this._registeredItems);
		return aControlsWithRegistered.indexOf(sControlType) !== -1;
	};

	ChangeRegistry.prototype.hasChangeHandlerForControlAndChange = function (sControlType, sChangeType) {
		if (!this.hasRegisteredChangeHandlersForControl(sControlType)) {
			return false;
		}

		var oRegisteredChangeHandlersForControl = this._registeredItems[sControlType];
		var aHandlersRegisteredForControl = Object.keys(oRegisteredChangeHandlersForControl);
		return aHandlersRegisteredForControl.indexOf(sChangeType) !== -1;
	};

	ChangeRegistry.prototype.registerControlsForChanges = function(mControlChanges) {
		var that = this;
		jQuery.each(mControlChanges, function (sControlType, changeHandlers) {
			if (Array.isArray(changeHandlers)) {
				var oChangeHandlers = {};
				changeHandlers.forEach(function (oChangeHandler) {
						oChangeHandlers[oChangeHandler.changeType] = oChangeHandler.changeHandler;
				});
				that._registerChangeHandlersForControl(sControlType, oChangeHandlers);
			} else {
				that._registerChangeHandlersForControl(sControlType, changeHandlers);
			}
		});
	};

	ChangeRegistry.prototype._registerChangeHandlersForControl = function (sControlType, oChangeHandlers) {
		var that = this;

		if (typeof oChangeHandlers === "string") {
			try {
				oChangeHandlers = sap.ui.requireSync(oChangeHandlers + ".flexibility");
			} catch (error) {
				Utils.log.error("Flexibility change handler registration failed.\nControlType: " + sControlType + "\n" + error.message);
				return; // continue without a registration
			}
		}

		jQuery.each(oChangeHandlers, function (sChangeType, sChangeHandler) {
			var oChangeHandler = that._getChangeHandler(sChangeType, sChangeHandler);
			var oSimpleChange = {
				"changeType": sChangeType,
				"changeHandler": oChangeHandler.changeHandler,
				"layers":oChangeHandler.layers
			};
			that.registerControlForSimpleChange(sControlType, oSimpleChange);
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
	ChangeRegistry.prototype._getChangeHandler = function (sChangeType, vChangeHandler) {
		var oResult = {};
		var aDeveloperModeChangeHandlers = Object.keys(this._mDeveloperModeChangeHandlers);
		if (!vChangeHandler.changeHandler) {
			oResult.changeHandler = vChangeHandler;
		} else {
			oResult = vChangeHandler;
		}
		if (oResult.changeHandler === "default") {
			oResult.changeHandler = this._oDefaultChangeHandlers[sChangeType];
		} else if (aDeveloperModeChangeHandlers.indexOf(sChangeType) > -1) {
			throw new Error("You can't use a custom change handler for the following Developer Mode change types: " + aDeveloperModeChangeHandlers.toString() + ". Please use 'default' instead.");
		}
		return oResult;
	};

	/**
	 * Adds registration for a control and a simple change
	 * @param {String} sControlType - Name of the control
	 * @param {sap.ui.fl.registry.SimpleChange.member} oSimpleChange - One of the simple changes
	 *
	 * @public
	 */
	ChangeRegistry.prototype.registerControlForSimpleChange = function(sControlType, oSimpleChange) {
		var oChangeRegistryItem;
		if (!sControlType) {
			return;
		}
		if (!oSimpleChange || !oSimpleChange.changeType || !oSimpleChange.changeHandler) {
			return;
		}

		oChangeRegistryItem = this._createChangeRegistryItemForSimpleChange(sControlType, oSimpleChange);

		if (oChangeRegistryItem) {
			this.addRegistryItem(oChangeRegistryItem);
		}
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
		var mParam, oChangeTypeMetadata, oChangeRegistryItem, mLayerPermissions;

		mLayerPermissions = jQuery.extend({}, this._oSettings.getDefaultLayerPermissions());
		var oLayers = oSimpleChange.layers;

		if (oLayers) {
			Object.keys(oLayers).forEach(function (sLayer) {
				if (mLayerPermissions[sLayer] === undefined) {
					throw new Error("The Layer '" + sLayer + "' is not supported. Please only use supported layers");
				}
				mLayerPermissions[sLayer] = oLayers[sLayer];
			});
		}

		//Create change type metadata
		mParam = {
			name: oSimpleChange.changeType,
			changeHandler: oSimpleChange.changeHandler,
			layers : mLayerPermissions
		};
		oChangeTypeMetadata = new ChangeTypeMetadata(mParam);

		//Create change registry item
		mParam = {
			changeTypeMetadata: oChangeTypeMetadata,
			controlType: sControlType
		};
		oChangeRegistryItem = new ChangeRegistryItem(mParam);

		return oChangeRegistryItem;
	};

	/**
	 * Add a registry item for the controlType and changeType. If the item already exists, it will be overwritten
	 * @param {sap.ui.fl.registry.ChangeRegistryItem} oRegistryItem the registry item
	 * @public
	 */
	ChangeRegistry.prototype.addRegistryItem = function(oRegistryItem) {
		var sChangeType, sControlType;
		if (!oRegistryItem) {
			return;
		}

		sChangeType = oRegistryItem.getChangeTypeName();
		sControlType = oRegistryItem.getControlType();

		this._registeredItems[sControlType] = this._registeredItems[sControlType] || {};
		this._registeredItems[sControlType][sChangeType] = oRegistryItem;
	};

	/**
	 * Remove a registration for:
	 *  - A single change type (only changeTypeName parameter set)
	 *  - The complete registration on a certain control (only controlType parameter set)
	 *  - Or all registrations of a change type on any control (both changeTypeName AND controlType set)
	 * @param {Object} mParam Description see below
	 * @param {String} [mParam.changeTypeName] Change type name which should be removed
	 * @param {String} [mParam.controlType] Control type which should be removed.
	 *
	 * @public
	 */
	ChangeRegistry.prototype.removeRegistryItem = function(mParam) {
		if (!mParam.changeTypeName && !mParam.controlType) {
			Utils.log.error("sap.ui.fl.registry.ChangeRegistry: ChangeType and/or ControlType required");
			return;
		}
		//Either remove a specific changeType from a specific control type
		if (mParam.controlType && mParam.changeTypeName) {
			if (this._registeredItems[mParam.controlType]) {
				if (Object.keys(this._registeredItems[mParam.controlType]).length === 1) { //only one changeType...
					delete this._registeredItems[mParam.controlType];
				} else {
					delete this._registeredItems[mParam.controlType][mParam.changeTypeName];
				}
			}
		//or remove by control type
		} else if (mParam.controlType) {
			if (this._registeredItems[mParam.controlType]) {
				delete this._registeredItems[mParam.controlType];
			}
		//or via changeType on all control types
		} else if (mParam.changeTypeName) {
			for ( var controlTypeKey in this._registeredItems) {
				var controlItem = this._registeredItems[controlTypeKey];
				delete controlItem[mParam.changeTypeName];
			}
		}
	};

	/**
	 * Get a registration for:
	 *  - All registration items with specific change type name on all controls (only changeTypeName parameter set)
	 *  - The complete registration(s) on a certain control (only controlType parameter set)
	 *  - Or all registrations of a change type name on any control (both changeTypeName AND controlType set)
	 * @param {Object} mParam Description see below
	 * @param {String} [mParam.changeTypeName] Change type to find registration(s) for this changeType
	 * @param {String} [mParam.controlType] Control type to find registration(s) for this controlType
	 * @param {String} [mParam.layer] Layer where changes are currently applied. If not provided no filtering for valid layers is done.
	 * @returns {Object} Returns an object in the format
	 * @example {
	 * 				"sap.ui.core.SampleControl":{
	 * 					<ChangeRegistryItem> : {
	 * 						_changeTypeMetadata: {
	 * 							_changeHandler: {},
	 * 							_layers: {},
	 * 							_name,
	 * 							_controlType
	 * 						}
	 * 					}
	 * 				}
	 * 			}
	 * @public
	 */
	ChangeRegistry.prototype.getRegistryItems = function(mParam) {
		if (!mParam) {
			Utils.log.error("sap.ui.fl.registry.ChangeRegistry: no parameters passed for getRegistryItems");
		}

		var sChangeType = mParam.changeTypeName;
		var sControlType = mParam.controlType;

		if (!sChangeType && !sControlType) {
			Utils.log.error("sap.ui.fl.registry.ChangeRegistry: Change Type Name and/or Control Type required");
		}

		var result = null;
		if (sControlType && sChangeType) {
			var oChangeHandler = this._getOrLoadChangeHandler(sControlType, sChangeType);

			if (oChangeHandler) {
				result = {};
				result[sControlType] = {};
				result[sControlType][sChangeType] = oChangeHandler;
			}
		} else if (sControlType) {
			result = {};
			result[sControlType] = {};
			if (this._registeredItems[sControlType]) {
				//keep the actual registry items but clone the control-changetype object structure to not modify the registry during filtering
				var aChangeTypes = Object.keys(this._registeredItems[sControlType]);

				aChangeTypes.forEach(function (sChangeType) {
					result[sControlType][sChangeType] = this._getOrLoadChangeHandler(sControlType, sChangeType);
				}.bind(this));
			}
			for (var sKey in this._oDefaultActiveChangeHandlers) {
				result[sControlType][sKey] = this._oDefaultActiveChangeHandlers[sKey];
			}
		} else if (sChangeType) {
			result = {};
			for ( sControlType in this._registeredItems) {
				if (this._registeredItems[sControlType][sChangeType]) {
					result[sControlType] = {};
					result[sControlType][sChangeType] = this._getOrLoadChangeHandler(sControlType, sChangeType);
				}
			}
			result["defaultActiveForAllControls"] = {};
			for (var key in this._oDefaultActiveChangeHandlers) {
				result["defaultActiveForAllControls"][key] = this._oDefaultActiveChangeHandlers[key];
			}
		}
		//filter out disabled change types
		this._filterChangeTypes(result, mParam.layer);
		return result;
	};

	ChangeRegistry.prototype._getOrLoadChangeHandler = function (sControlType, sChangeType) {
		var oControlRegistrations = this._registeredItems[sControlType];
		if (oControlRegistrations) {
			var oChangeHandler = oControlRegistrations[sChangeType];
			if (oChangeHandler) {
				var oChangeHandlerMetadata = oChangeHandler.getChangeTypeMetadata();
				var oChangeHandlerImplementation = oChangeHandlerMetadata.getChangeHandler();
				if (typeof oChangeHandlerImplementation === "string") {
					// load the module synchronous
					jQuery.sap.require(oChangeHandlerImplementation);
					oChangeHandlerImplementation = sap.ui.require(oChangeHandlerImplementation);
					oChangeHandlerMetadata._changeHandler = oChangeHandlerImplementation;
				}

				return oChangeHandler;
			}
		}

		var oDefaultActiveChangeHandler = this._oDefaultActiveChangeHandlers[sChangeType];

		if (oDefaultActiveChangeHandler) {
			return oDefaultActiveChangeHandler;
		}

		return null;
	};

	/**
	 * Retrieves settings for SAPUI5 flexibility.
	 *
	 * @private
	 */
	ChangeRegistry.prototype.initSettings = function() {
		this._oSettings = Settings.getInstanceOrUndef();
		if (!this._oSettings) {
			this._oSettings = new Settings({});
		}
	};

	/**
	 * Removes registry items that are not enabled for the current writable layer.
	 * @param {object} oRegistryItems see example
	 * @param {string} sLayer persistency layer, if not provided no filtering is done.
	 * @example {
	 * 				"moveControls": {
	 * 					"changeHandler": "default",
	 * 					"layers": {
	 * 						"USER": true
	 * 					}
	 * 				}
	 * 			}
	 * @private
	 */
	ChangeRegistry.prototype._filterChangeTypes = function(oRegistryItems, sLayer) {
		if (this._oSettings && sLayer && oRegistryItems) {
			var bIsChangeTypeEnabled = false;

			jQuery.each(oRegistryItems, function(sControlType, oControlReg) {
				jQuery.each(oControlReg, function(sChangeType, oRegistryItem) {
					var oLayers = oRegistryItem.getChangeTypeMetadata().getLayers();

					bIsChangeTypeEnabled = oLayers[sLayer];

					if (!bIsChangeTypeEnabled) {
						Utils.log.warning("Change type " + sChangeType + " not enabled for layer " + sLayer);
						delete oControlReg[sChangeType];
					}
				});
			});
		}
	};

	ChangeRegistry.prototype.getDragInfo = function(sControlType) {
		var controlTypeItems = this._registeredItems[sControlType];
		if (controlTypeItems) {
			return controlTypeItems.getDragInfo();
		}
		return null;
	};

	return ChangeRegistry;
}, true);
