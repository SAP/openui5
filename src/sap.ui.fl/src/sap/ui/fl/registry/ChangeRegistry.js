/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils", "jquery.sap.global", "sap/ui/fl/registry/ChangeRegistryItem", "sap/ui/fl/registry/ChangeTypeMetadata",
	"sap/ui/fl/registry/Settings", "sap/ui/fl/changeHandler/HideControl", "sap/ui/fl/changeHandler/MoveElements",
	"sap/ui/fl/changeHandler/PropertyChange", "sap/ui/fl/changeHandler/PropertyBindingChange", "sap/ui/fl/changeHandler/UnhideControl",
	"sap/ui/fl/changeHandler/StashControl", "sap/ui/fl/changeHandler/UnstashControl"
], function(Utils, jQuery, ChangeRegistryItem, ChangeTypeMetadata, Settings, HideControl, MoveElements, PropertyChange, PropertyBindingChange, UnhideControl, StashControl, UnstashControl) {
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
		this.initDefaultActiveHandlers();
	};

	ChangeRegistry._instance = undefined;
	ChangeRegistry.prototype._oDefaultActiveChangeHandlers = {};

	ChangeRegistry.prototype._oDefaultChangeHandlers = {
		"hideControl": HideControl,
		"moveElements": MoveElements,
		"propertyChange": PropertyChange,
		"propertyBindingChange": PropertyBindingChange,
		"unhideControl": UnhideControl,
		"stashControl": StashControl,
		"unstashControl": UnstashControl
	};

	ChangeRegistry.prototype.initDefaultHandler = function (sChangeType, oChangeHandler) {
		var oSimpleChangeObject = {
			changeType: sChangeType,
			changeHandler: oChangeHandler
		};
		var oChangeRegistryItem = this._createChangeRegistryItemForSimpleChange("defaultActiveForAllControls", oSimpleChangeObject);
		this._oDefaultActiveChangeHandlers[sChangeType] = oChangeRegistryItem;
	};

	ChangeRegistry.prototype.initDefaultActiveHandlers = function () {
		this.initDefaultHandler("propertyChange", PropertyChange);
		this.initDefaultHandler("propertyBindingChange", PropertyBindingChange);
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

		jQuery.each(oChangeHandlers, function (sChangeType, sChangeHandler) {
			var oChangeHandler = that._getChangeHandler(sChangeType, sChangeHandler);
			var oSimpleChange = {
				"changeType": sChangeType,
				"changeHandler": oChangeHandler
			};
			that.registerControlForSimpleChange(sControlType, oSimpleChange);
		});
	};

	/**
	 * Adds registration for a control and a simple change
	 * @param {string} sChangeType - change type of a sap.ui.fl.Change
	 * @param {string} sChangeHandler - "default" or module name of a change handler implentation
	 * @returns {string|object} returns the passed sChangeHandler or in case of "default" the loaded object of the default change handler
	 *
	 * @private
	 */
	ChangeRegistry.prototype._getChangeHandler = function (sChangeType, sChangeHandler) {
		if (sChangeHandler === "default") {
			return this._oDefaultChangeHandlers[sChangeType];
		} else {
			return sChangeHandler;
		}
	};

	/**
	 * Adds registration for a control and a simple change
	 * @param {String} sControlType - Name of the control, for example "sap.ui.comp.smartfilterbar.SmartFilterBar"
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
	 * @param {String} sControlType - Name of the control, for example "sap.ui.comp.smartfilterbar.SmartFilterBar"
	 * @param {sap.ui.fl.registry.SimpleChange.member} oSimpleChange - One of the simple changes
	 * @returns {sap.ui.fl.registry.ChangeRegistryItem} the registry item
	 *
	 * @public
	 */
	ChangeRegistry.prototype._createChangeRegistryItemForSimpleChange = function(sControlType, oSimpleChange) {
		var mParam, oChangeTypeMetadata, oChangeRegistryItem;

		//Create change type metadata
		mParam = {
			name: oSimpleChange.changeType,
			changeHandler: oSimpleChange.changeHandler
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
	 * 					"labelChange":{<type of @see sap.ui.fl.registry.ChangeRegistryItem>},
	 * 					"visibility":{<type of @see sap.ui.fl.registry.ChangeRegistryItem>}
	 * 				},
	 * 				"sap.ui.core.TestControl":{
	 * 					"visibility":{<type of @see sap.ui.fl.registry.ChangeRegistryItem>}
	 * 				}
	 * 			}
	 * @public
	 */
	ChangeRegistry.prototype.getRegistryItems = function(mParam) {
		var that = this;

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
			if (this._registeredItems[sControlType]) {
				result = {};
				//keep the actual registry items but clone the control-changetype object structure to not modify the registry during filtering
				result[sControlType] = {};
				var aChangeTypes = Object.keys(this._registeredItems[sControlType]);

				aChangeTypes.forEach(function (sChangeType) {
					result[sControlType][sChangeType] = that._getOrLoadChangeHandler(sControlType, sChangeType);
				});
			}
		} else if (sChangeType) {
			result = {};
			for ( sControlType in this._registeredItems) {
				if (this._registeredItems[sControlType][sChangeType]) {
					result[sControlType] = {};
					result[sControlType][sChangeType] = that._getOrLoadChangeHandler(sControlType, sChangeType);
				}
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
	 * Retrieves the Flex Settings for a UI5 component.
	 *
	 * @param {string} sComponentName the UI5 component name for which settings are requested;
	 * 				   if not provided, hardcoded settings will be used.
	 *
	 * @private
	 */
	ChangeRegistry.prototype.initSettings = function(sComponentName) {
		this._oSettings = Settings.getInstanceOrUndef(sComponentName);
		if (!this._oSettings) {
			this._oSettings = new Settings({});
		}
	};

	/**
	 * Removes registry items that are not enabled for the current writable layer.
	 * @param {object} oRegistryItems see example
	 * @param {string} sLayer persistency layer, if not provided no filtering is done.
	 * @example {
	 * 				"sap.ui.core.SampleControl":{
	 * 					"labelChange":{<type of @see sap.ui.fl.registry.ChangeRegistryItem>},
	 * 					"visibility":{<type of @see sap.ui.fl.registry.ChangeRegistryItem>}
	 * 				},
	 * 				"sap.ui.core.TestControl":{
	 * 					"visibility":{<type of @see sap.ui.fl.registry.ChangeRegistryItem>}
	 * 				}
	 * 			}
	 * @private
	 */
	ChangeRegistry.prototype._filterChangeTypes = function(oRegistryItems, sLayer) {
		if (this._oSettings && sLayer && oRegistryItems) {
			var that = this;
			jQuery.each(oRegistryItems, function(sControlType, oControlReg) {
				jQuery.each(oControlReg, function(sChangeType, oRegistryItem) {
					var bIsChangeTypeEnabled = that._oSettings.isChangeTypeEnabled(sChangeType, sLayer);
					if (!bIsChangeTypeEnabled) {
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
