/*!
 * ${copyright}
 */

// Provides the base class for plugins.
sap.ui.define(["sap/ui/core/Element"], function(Element) {
	"use strict";

	/**
	 * Constructor for a new Plugin.
	 *
	 * @param {string} [sId] ID for the new plugin, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new plugin
	 *
	 * @abstract
	 * @class
	 * Provides the base class for plugins.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental Since 1.73. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @since 1.73
	 * @alias sap.m.plugins.PluginBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PluginBase = Element.extend("sap.m.plugins.PluginBase", /** @lends sap.m.plugins.PluginBase.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.m",
			properties: {
				/**
				 * Indicates whether this plugin is active or not.
				 */
				enabled: {type: "boolean", defaultValue: true}
			}
		}
	});

	/**
	 * Internal data store for plugin configurations
	 */
	var mPluginControlConfigs = {};

	/**
	 * Sets control-related plugin configuration.
	 *
	 * @param {object} mControlConfig The control configuration object where the keys are control names
	 * @param {string|function} [vPlugin] The name or the constructor of the plugin
	 * @protected
	 * @static
	 */
	PluginBase.setConfig = function(mControlConfig, vPlugin) {
		var sPluginName = (typeof vPlugin == "function") ? vPlugin.getMetadata().getName() : PluginBase.getMetadata().getName();
		Object.assign(mPluginControlConfigs[sPluginName] = mPluginControlConfigs[sPluginName] || {}, mControlConfig);
	};

	/**
	 * Returns the first applied plugin for the given control instance and the plugin name.
	 *
	 * @param {sap.ui.core.Control} oControl The control instance to check for
	 * @param {string|string[]} vPluginName The plugin name or names to check for
	 * @return {undefined|sap.m.plugins.PluginBase} The found plugin instance or undefined
	 * @protected
	 * @static
	 * @since 1.87
	 */
	PluginBase.getPlugin = function(oControl, vPluginName) {
		return oControl.getDependents().find(function(oDependent) {
			return oDependent.isA(vPluginName);
		});
	};

	PluginBase.prototype.init = function() {
		this._bIsActive = false;
	};

	/**
	 * Indicates whether the plugin is active.
	 *
	 * @returns {boolean} <code>true</code> if the plugin is active; otherwise, <code>false</code>
	 * @public
	 */
	PluginBase.prototype.isActive = function() {
		return this._bIsActive;
	};

	/**
	 * Returns the control where the plugin is defined.
	 *
	 * @returns {sap.ui.core.Control|null}
	 * @protected
	 */
	PluginBase.prototype.getControl = function() {
		var oParent = this.getParent();
		if (oParent) {
			var sPluginOwnerMethod = "get" + this.getMetadata().getName().split(".").pop() + "PluginOwner";
			oParent = oParent[sPluginOwnerMethod] ? oParent[sPluginOwnerMethod](this) : oParent;
		}

		return oParent;
	};

	/**
	 * Returns the plugin configuration of the control.
	 *
	 * @param {string} sKey The configuration key
	 * @param {string} [vDefaultValue] Default value if the configuration key is not found
	 * @param {any} [vParam1] The first parameter if the sKey is a function
	 * @param {any} [vParam2] The second parameter if the sKey is a function
	 * @returns {*} The plugin configuration of the control
	 * @protected
	 */
	PluginBase.prototype.getControlPluginConfig = function(sKey, vDefaultValue, vParam1, vParam2) {
		var oControl = this.getControl();
		if (!oControl) {
			return vDefaultValue;
		}

		var sPluginName = this.getMetadata().getName();
		var sControlName = oControl.getMetadata().getName();
		var mPluginConfig = mPluginControlConfigs[sPluginName] || {};
		var mControlConfig = mPluginConfig[sControlName] || {};
		var fnReturn = function(mConfig) {
			return (typeof mConfig[sKey] == "function") ? mConfig[sKey].call(mConfig, vParam1, vParam2) : mConfig[sKey];
		};

		if (sKey in mControlConfig) {
			return fnReturn(mControlConfig);
		}

		for (var sControlType in mPluginConfig) {
			if (oControl.isA(sControlType) && sKey in mPluginConfig[sControlType]) {
				return fnReturn(mPluginConfig[sControlType]);
			}
		}

		var sPluginBaseName = PluginBase.getMetadata().getName();
		var mGlobalPluginConfig = mPluginControlConfigs[sPluginBaseName] || {};
		var mGlobalControlConfig = mGlobalPluginConfig[sControlName] || {};

		if (sKey in mGlobalControlConfig) {
			return fnReturn(mGlobalControlConfig);
		}

		for (var sControlType in mGlobalPluginConfig) {
			if (oControl.isA(sControlType) && sKey in mGlobalPluginConfig[sControlType]) {
				return fnReturn(mGlobalPluginConfig[sControlType]);
			}
		}

		return vDefaultValue;
	};


	/**
	 * This hook method gets called to determine whether the plugin is applicable for the defined control or not.
	 *
	 * @param {sap.ui.core.Control} oControl The control that is connected to the plugin
	 * @returns {Boolean} Whether applicable or not
	 * @virtual
	 */
	PluginBase.prototype.isApplicable = function(oControl) {
		return oControl.isA && oControl.isA("sap.ui.core.Control");
	};

	/**
	 * This hook method gets called when the plugin is enabled and connected to the control.
	 *
	 * @param {sap.ui.core.Control} oControl The control that is connected to the plugin
	 * @abstract
	 */
	PluginBase.prototype.onActivate = function(oControl) {};

	/**
	 * This hook method gets called when the plugin is disabled or disconnected from the control.
	 *
	 * @param {sap.ui.core.Control} oControl The control that is connected to the plugin
	 * @abstract
	 */
	PluginBase.prototype.onDeactivate = function(oControl) {};


	/**
	 * Activates or deactivates the plugin when the parent of the plugin is set.
	 *
	 * @override
	 */
	PluginBase.prototype.setParent = function(oParent) {
		if (this.getEnabled() && this.getControl()) {
			this._deactivate();
		}

		Element.prototype.setParent.apply(this, arguments);

		var oControl = this.getControl();
		if (oControl instanceof Promise) {
			oControl.then(this._checkApplicable.bind(this));
		} else {
			this._checkApplicable();
		}

		return this;
	};

	/**
	 * Activates or deactivates the plugin when the enabled property is set.
	 *
	 * @override
	 */
	PluginBase.prototype.setEnabled = function(bEnabled) {
		var bOldEnabled = this.getEnabled();
		this.setProperty("enabled", bEnabled, true);
		var bNewEnabled = this.getEnabled();

		if (bNewEnabled != bOldEnabled && this.getControl()) {
			if (bNewEnabled) {
				this._activate();
			} else {
				this._deactivate();
			}
		}

		return this;
	};

	/**
	 * Suppresses the invalidation when the <code>invalidate</code> attribute of the property metadata is set to false.
	 *
	 * @override
	 */
	PluginBase.prototype.setProperty = function(sProperty, vValue, bSuppressInvalidate) {
		bSuppressInvalidate = bSuppressInvalidate || (this.getMetadata().getProperty(sProperty).appData || {}).invalidate === false;
		return Element.prototype.setProperty.call(this, sProperty, vValue, bSuppressInvalidate);
	};



	PluginBase.prototype._checkApplicable = function() {
		var oControl = this.getControl();
		if (oControl && this.getEnabled()) {
			if (!this.isApplicable(oControl)) {
				throw new Error(this + " is not applicable to " + oControl);
			} else {
				this._activate();
			}
		}
	};

	/**
	 * Internal plugin activation handler
	 */
	PluginBase.prototype._activate = function() {
		if (!this.isActive()) {
			this.getControlPluginConfig("onActivate", undefined, this.getControl(), this);
			this.onActivate(this.getControl());
			this._bIsActive = true;
		}
	};

	/**
	 * Internal plugin deactivation handler
	 */
	PluginBase.prototype._deactivate = function() {
		if (this.isActive()) {
			this.getControlPluginConfig("onDeactivate", undefined, this.getControl(), this);
			this.onDeactivate(this.getControl());
			this._bIsActive = false;
		}
	};

	return PluginBase;

});