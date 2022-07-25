/*!
 * ${copyright}
 */

// Provides the base class for plugins.
sap.ui.define(["sap/ui/core/Element"], function(Element) {
	"use strict";

	/**
	 * Provides the base class for plugins.
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
	 * Internal data store for plugin-control configurations
	 */
	var mPluginControlConfigs = {};

	/**
	 * Defines a plugin-related multiple control configuration.
	 *
	 * @example
	 * PluginBase.setConfigs({
	 *     "sap.m.Table": {
	 *		    defaultAggregationName: "items"
	 *     },
	 *     "sap.ui.table.Table": {
	 *          defaultAggregationName: "rows"
	 *     }
	 * }, TablePluginConstructor);
	 *
	 * @param {object} mControlConfigs The configuration object for control types where the first level keys are full control names and values are configuration objects
	 * @param {string|function} vPlugin The full name or the constructor of the plugin
	 * @protected
	 * @static
	 */
	PluginBase.setConfigs = function(mControlConfigs, vPlugin) {
		var sPluginName = (typeof vPlugin == "function") ? vPlugin.getMetadata().getName() : vPlugin;
		Object.assign(mPluginControlConfigs[sPluginName] = mPluginControlConfigs[sPluginName] || {}, mControlConfigs);
	};

	/**
	 * Sets a control-related plugin configuration.
	 *
	 * @example
	 * PluginBase.setControlConfig("sap.m.Table", {
	 *     defaultAggregationName: "items"
	 * }, "my.table.plugin");
	 *
	 * @param {string|function} vControl The full name or the constructor of the control
	 * @param {object} mControlConfig The configuration object for a control type
	 * @param {string|function} vPlugin The full name or the constructor of the plugin
	 * @public
	 * @static
	 */
	PluginBase.setControlConfig = function(vControl, mControlConfig, vPlugin) {
		var mControlConfigs = {};
		var sControlName = (typeof vControl == "function") ? vControl.getMetadata().getName() : vControl;
		mControlConfigs[sControlName] = mControlConfig;
		this.setConfigs(mControlConfigs, vPlugin);
	};

	/**
	 * Returns the first applied plugin for the given control instance and the plugin name.
	 *
	 * @param {sap.ui.core.Control} oControl The control instance to check for
	 * @param {string|function} [vPlugin] The full name or the constructor of the plugin
	 * @return {undefined|sap.m.plugins.PluginBase} The found plugin instance or <code>undefined</code> if not found
	 * @public
	 * @static
	 */
	PluginBase.getPlugin = function(oControl, vPlugin) {
		if (vPlugin == undefined) {
			vPlugin = this.getMetadata().getName();
		} else if (typeof vPlugin == "function") {
			vPlugin = vPlugin.getMetadata().getName();
		}

		return oControl.findElements(false, function(oElement) {
			return oElement.isA(vPlugin);
		})[0];
	};


	/**
	 * Indicates whether the plugin is added to an applicable control and the <code>enabled</code> property of the plugin is <code>true</code>.
	 *
	 * @returns {boolean} <code>true</code> if the plugin is active, otherwise <code>false</code>
	 * @protected
	 */
	PluginBase.prototype.isActive = function() {
		return !!(this._bActive);
	};

	/**
	 * Returns the parent or the logical owner of the plugin instance.
	 *
	 * A composite control can implement the <code>get[PluginName]PluginOwner</code> method to define a logical plugin owner that will be responsible for the plugin.
	 * In this case, even though the plugin instance is added to the composite control, the return value of <code>get[PluginName]PluginOwner</code> will be the logical owner of the plugin.
	 * If a composite control instantiates internal controls asynchronously, then the <code>get[PluginName]PluginOwner</code> method must return a promise. After the <code>Promise</code> has been resolved,
	 * the <code>get[PluginName]PluginOwner</code> method must always return the instance of the internal control.<br>
	 * If such a <code>get[PluginName]PluginOwner</code> method exists in the control where the plugin is inserted then the <code>getControl</code> method return the logical owner of the plugin.
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
	 * If the configuration is a type of function, then it gets executed.
	 *
	 * @param {string} sKey The configuration key
	 * @param {any} [vParam1] The first parameter if the sKey configuration is a type of function
	 * @param {any} [vParam2] The second parameter if the sKey configuration is a type of function
	 * @param {any} [vParam3] The third parameter if the sKey configuration is a type of function
	 * @returns {*} The plugin configuration of the control, otherwise undefined
	 * @protected
	 */
	PluginBase.prototype.getConfig = function(sKey, vParam1, vParam2, vParam3) {
		var oControl = this.getControl();
		if (!oControl) {
			return;
		}

		var sPluginName = this.getMetadata().getName();
		var sControlName = oControl.getMetadata().getName();
		var mPluginConfig = mPluginControlConfigs[sPluginName] || {};
		var mControlConfig = mPluginConfig[sControlName] || {};
		var fnReturn = function(mConfig) {
			return (typeof mConfig[sKey] == "function") ? mConfig[sKey].call(mConfig, vParam1, vParam2, vParam3) : mConfig[sKey];
		};

		if (sKey in mControlConfig) {
			return fnReturn(mControlConfig);
		}

		for (var sControlType in mPluginConfig) {
			if (oControl.isA(sControlType)) {
				if (!sKey) {
					return mPluginConfig[sControlType];
				}
				if (sKey in mPluginConfig[sControlType]) {
					return fnReturn(mPluginConfig[sControlType]);
				}
			}
		}
	};

	/**
	 * This hook method gets called to determine whether the plugin is applicable for the defined control or not.
	 * By default, plugins can be applied if a control configuration has been defined for a particular plugin type.
	 *
	 * @param {sap.ui.core.Control} oControl The control that is connected to the plugin
	 * @returns {boolean} Whether applicable or not
	 * @virtual
	 */
	PluginBase.prototype.isApplicable = function(oControl) {
		return Object.keys(this.getConfig() || {}).length > 0;
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
	PluginBase.prototype.setParent = function() {
		this._deactivate();

		Element.prototype.setParent.apply(this, arguments);

		if (this.getEnabled()) {
			this._activate();
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

		if (this.getEnabled() != bOldEnabled) {
			if (bOldEnabled) {
				this._deactivate();
			} else {
				this._activate();
			}
		}

		return this;
	};

	/**
	 * Suppresses the invalidation when the <code>invalidate</code> attribute of the property metadata is set to <code>false</code>.
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
		if (this._bActive) {
			return;
		}

		var oControl = this.getControl();
		if (!oControl) {
			return;
		}

		if (oControl instanceof Promise) {
			return oControl.then(this._activate.bind(this));
		}

		if (!this.isApplicable(oControl)) {
			throw new Error(this + " is not applicable to " + oControl);
		}

		this.getConfig("onActivate", oControl, this);
		this.onActivate(oControl);
		this._bActive = true;
	};

	/**
	 * Internal plugin deactivation handler
	 */
	PluginBase.prototype._deactivate = function() {
		if (!this._bActive) {
			return;
		}

		var oControl = this.getControl();
		this.getConfig("onDeactivate", oControl, this);
		this.onDeactivate(oControl);
		this._bActive = false;
	};

	return PluginBase;

});