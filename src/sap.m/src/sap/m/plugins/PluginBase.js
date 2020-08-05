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
		return this.getParent();
	};

	/**
	 * Returns the plugin configuration of the control.
	 *
	 * @param {string} sKey The configuration key
	 * @param {string} [vDefaultValue] Default value if the configuration key is not found
	 * @returns {*}
	 * @protected
	 */
	PluginBase.prototype.getControlPluginConfig = function(sKey, vDefaultValue) {
		var oControl = this.getControl();
		if (!oControl) {
			return vDefaultValue;
		}

		var sPluginName = this.getMetadata().getName();
		var sControlName = oControl.getMetadata().getName();
		var mPluginConfig = mPluginControlConfigs[sPluginName] || {};
		var mControlConfig = mPluginConfig[sControlName] || {};

		if (sKey in mControlConfig) {
			return mControlConfig[sKey];
		}

		for (var sControlType in mPluginConfig) {
			if (oControl.isA(sControlType) && sKey in mPluginConfig[sControlType]) {
				return mPluginConfig[sControlType][sKey];
			}
		}

		var sPluginBaseName = PluginBase.getMetadata().getName();
		var mGlobalPluginConfig = mPluginControlConfigs[sPluginBaseName] || {};
		var mGlobalControlConfig = mGlobalPluginConfig[sControlName] || {};

		if (sKey in mGlobalControlConfig) {
			return mGlobalControlConfig[sKey];
		}

		for (var sControlType in mGlobalPluginConfig) {
			if (oControl.isA(sControlType) && sKey in mGlobalPluginConfig[sControlType]) {
				return mGlobalPluginConfig[sControlType][sKey];
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
		return oControl.isA("sap.ui.core.Control");
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
		var bEnabled = this.getEnabled();

		if (bEnabled && this.getControl()) {
			this._deactivate();
		}

		Element.prototype.setParent.apply(this, arguments);

		if (oParent && bEnabled) {
			if (!this.isApplicable(oParent)) {
				throw new Error(this + " is not applicable to " + oParent);
			} else {
				this._activate();
			}
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


	/**
	 * Internal plugin activation handler
	 */
	PluginBase.prototype._activate = function() {
		if (!this.isActive()) {
			this.onActivate(this.getControl());
			this._bIsActive = true;
		}
	};

	/**
	 * Internal plugin deactivation handler
	 */
	PluginBase.prototype._deactivate = function() {
		if (this.isActive()) {
			this.onDeactivate(this.getControl());
			this._bIsActive = false;
		}
	};

	return PluginBase;

});