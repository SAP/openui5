/*
 * ${copyright}
 */
sap.ui.define([
	"../utils/TableUtils",
	"sap/ui/core/Element"
], function(
	TableUtils,
	Element
) {
	"use strict";

	/**
	 * @abstract
	 * @class
	 * Base class for table plugins.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental Since 1.75
	 * @since 1.75
	 * @alias sap.ui.table.plugins.PluginBase
	 */
	const PluginBase = Element.extend("sap.ui.table.plugins.PluginBase", /** @lends sap.ui.table.plugins.PluginBase.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.ui.table",
			properties: {
				/**
				 * Indicates whether this plugin is active or not.
				 */
				enabled: {type: "boolean", defaultValue: true}
			}
		}
	});

	// equal to sap.m.plugins.PluginBase
	/**
	 * Searches a control plugin with a given type in the aggregations of the given <code>Element</code> instance.
	 * The first plugin that is found is returned.
	 *
	 * @param {sap.ui.core.Element} oElement The <code>Element</code> instance to check for
	 * @param {string|function} [vPlugin] The full name or the constructor of the plugin name;  if nothing is given, <code>PluginBase</code> is used
	 * @return {sap.ui.core.Element|undefined} The found plugin instance or <code>undefined</code> if not found
	 * @private
	 * @static
	 */
	PluginBase.getPlugin = function(oElement, vPlugin = PluginBase) {
		// Keep this function in sync with sap.m.plugins.PluginBase.getPlugin
		// until the library dependencies are cleaned up and a reuse can happen!

		if (!oElement) {
			return;
		}

		if (typeof vPlugin === "function" && vPlugin.getMetadata) {
			vPlugin = vPlugin.getMetadata().getName();
		}

		const fnCheck = function(oElem) {
			/* TBD Cleanup sap.m and sap.ui.table plugins should be aligned in future.*/
			return oElem.isA(vPlugin) && (
					oElem.isA(["sap.m.plugins.PluginBase", "sap.ui.table.plugins.PluginBase"]));
		};

		return oElement.getDependents().find(fnCheck) || oElement.findElements(false, fnCheck)[0];
	};

	// equal to sap.m.plugins.PluginBase
	/**
	 * Searches a plugin of the corresponding type in the aggregations of the given <code>Table</code> instance.
	 * The first plugin that is found is returned.
	 *
	 * @param {sap.ui.table.Table} oTable The <code>Table</code> instance to check for
	 * @return {sap.ui.core.Element|undefined} The found plugin instance or <code>undefined</code> if not found
	 * @public
	 * @static
	 */
	PluginBase.findOn = function(oTable) {
		return PluginBase.getPlugin(oTable, this);
	};

	// equal to sap.m.plugins.PluginBase
	PluginBase.prototype.setEnabled = function(bEnabled) {
		const bOldEnabled = this.getEnabled();
		this.setProperty("enabled", bEnabled, true);

		if (this.getEnabled() !== bOldEnabled) {
			if (bOldEnabled) {
				this._deactivate();
			} else {
				this._activate();
			}
		}

		return this;
	};

	// equal to sap.m.plugins.PluginBase
	/**
	 * Called when the plugin is activated. A plugin is activated when it was successfully applied to a table.
	 *
	 * @param {sap.ui.table.Table} oTable The table this plugin is applied to
	 * @protected
	 * @virtual
	 */
	PluginBase.prototype.onActivate = function(oTable) {};

	// equal to sap.m.plugins.PluginBase
	/**
	 * Called when the plugin is deactivated.
	 *
	 * @param {sap.ui.table.Table} oTable The table this plugin is or was applied to
	 * @protected
	 * @virtual
	 */
	PluginBase.prototype.onDeactivate = function(oTable) {};

	// equal to sap.m.plugins.PluginBase
	/**
	 * Gets the active state of the plugin.
	 *
	 * @returns {boolean} Whether the plugin is active
	 * @public
	 */
	PluginBase.prototype.isActive = function() {
		return !!(this._bActive);
	};

	// not equal to sap.m.plugins.PluginBase. sap.ui.table does not need plugin config
	/**
	 * Determines whether the plugin is applicable to the control.
	 *
	 * @param {sap.ui.core.Control} oControl The control the plugin should be applied to
	 * @returns {boolean} Whether it is applicable
	 * @protected
	 * @virtual
	 */
	PluginBase.prototype.isApplicable = function(oControl) {
		return TableUtils.isA(oControl, "sap.ui.table.Table");
	};

	// equal to sap.m.plugins.PluginBase
	/**
	 * @override
	 * @inheritDoc
	 */
	PluginBase.prototype.setParent = function(oParent) {
		this._deactivate();

		Element.prototype.setParent.apply(this, arguments);

		if (this.getEnabled()) {
			this._activate();
		}

		return this;
	};

	// not equal to sap.m.plugins.PluginBase. sap.ui.table does not support PluginOwner concept
	PluginBase.prototype.getControl = function() {
		return this.getParent();
	};

	// not equal to sap.m.plugins.PluginBase. sap.ui.table does not need plugin config and does not support PluginOwner concept
	/**
	 * Activates the plugin if it is not active.
	 */
	PluginBase.prototype._activate = function() {
		if (this._bActive) {
			return;
		}

		const oControl = this.getControl();
		if (!oControl) {
			return;
		}

		if (!this.isApplicable(oControl)) {
			throw new Error(this + " is not applicable to " + oControl);
		}

		this._bActive = true;
		this.onActivate(oControl);
	};

	// not equal to sap.m.plugins.PluginBase. sap.ui.table does not need plugin config and does not PluginOwner concept
	/**
	 * Deactivates the plugin if it is active.
	 */
	PluginBase.prototype._deactivate = function() {
		if (!this._bActive) {
			return;
		}

		this._bActive = false;
		this.onDeactivate(this.getControl());
	};

	return PluginBase;
});