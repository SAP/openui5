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

	var Hook = TableUtils.Hook.Keys;
	var oHookInstallation = {hooks: {}};

	/**
	 * Constructor for a new table plugin.
	 *
	 * @param {string} [sId] ID for the new plugin, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new plugin
	 *
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PluginBase = Element.extend("sap.ui.table.plugins.PluginBase", /** @lends sap.ui.table.plugins.PluginBase.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.ui.table"
		}
	});

	/**
	 * @inheritDoc
	 */
	PluginBase.prototype.init = function() {
		Element.prototype.init.apply(this, arguments);
		this._bIsActive = false;
	};

	/**
	 * @inheritDoc
	 */
	PluginBase.prototype.exit = function() {
		Element.prototype.exit.apply(this, arguments);
		this._deactivate(this.getTable());
	};

	/**
	 * Called when the plugin is activated. A plugin is activated when it was successfully applied to a table.
	 *
	 * @param {sap.ui.table.Table} oTable The table this plugin is applied to
	 * @protected
	 */
	PluginBase.prototype.onActivate = function(oTable) {
		TableUtils.Hook.install(oTable, oHookInstallation, this);

		var oTableBinding = oTable.getBinding("rows");
		if (oTableBinding) {
			this.onTableRowsBound(oTableBinding);
		}

		this._bIsActive = true;
	};

	/**
	 * Called when the plugin is deactivated.
	 *
	 * @param {sap.ui.table.Table} oTable The table this plugin is or was applied to
	 * @protected
	 */
	PluginBase.prototype.onDeactivate = function(oTable) {
		TableUtils.Hook.uninstall(oTable, oHookInstallation, this);
		this._bIsActive = false;
	};

	/**
	 * Gets the active state of the plugin.
	 *
	 * @returns {boolean} Whether the plugin is active
	 * @public
	 */
	PluginBase.prototype.isActive = function() {
		return this._bIsActive;
	};

	/**
	 * Determines whether the plugin is applicable to the table.
	 *
	 * @param {sap.ui.table.Table} oTable The table the plugin should be applied to
	 * @returns {Boolean} Whether it is applicable
	 * @protected
	 */
	PluginBase.prototype.isApplicable = function(oTable) {
		return TableUtils.isA(oTable, "sap.ui.table.Table");
	};

	/**
	 * @inheritDoc
	 */
	PluginBase.prototype.setParent = function(oParent) {
		var oOldTable = this.getTable();
		Element.prototype.setParent.apply(this, arguments);
		var oNewTable = this.getTable();

		if (oNewTable) {
			if (!this.isApplicable(oNewTable)) {
				throw new Error(this + " is not applicable to " + oNewTable);
			}
			this._activate(oNewTable);
		} else if (oOldTable) {
			this._deactivate(oOldTable);
		}

		return this;
	};

	/**
	 * Called when a new binding for the <code>rows</code> aggregation of the table is created, or the plugin is activated in a table with an
	 * already existing binding for the <code>rows</code> aggregation.
	 *
	 * @param {sap.ui.model.Binding} oBinding The binding of the <code>rows</code> aggregation of the table
	 * @protected
	 */
	PluginBase.prototype.onTableRowsBound = function(oBinding) {};
	oHookInstallation.hooks[Hook.Table.RowsBound] = function(oBinding) {
		this.onTableRowsBound(oBinding); // TODO: rename to onTableBindingCreated ?
	};

	/**
	 * Called when the binding of the <code>rows</code> aggregation of the table is removed.
	 *
	 * @protected
	 */
	PluginBase.prototype.onTableUnbindRows = function() {};
	oHookInstallation.hooks[Hook.Table.UnbindRows] = function() {
		this.onTableUnbindRows(); // TODO: rename to onTableBindingRemoved ?
	};

	/**
	 * Gets the table this plugin is applied to.
	 *
	 * @returns {sap.ui.table.Table|null} The instance of the table this plugin is applied to, or <code>null</code> if not applied to a table
	 * @protected
	 */
	PluginBase.prototype.getTable = function() {
		var oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Table") ? oParent : null;
	};

	/**
	 * Gets the binding of the <code>rows</code> aggregation of the table.
	 *
	 * @returns {sap.ui.model.Binding|null} Returns the binding of the <code>rows</code> aggregation of the table.
	 * @protected
	 */
	PluginBase.prototype.getTableBinding = function() {
		var oTable = this.getTable();
		var oBinding = oTable ? oTable.getBinding("rows") : null;

		return oBinding ? oBinding : null;
	};

	/**
	 * Activates the plugin if it is not active.
	 *
	 * @param {sap.ui.table.Table} oTable The table this plugin is applied to
	 * @private
	 */
	PluginBase.prototype._activate = function(oTable) {
		if (!this.isActive()) {
			this.onActivate(oTable);
		}
	};

	/**
	 * Deactivates the plugin if it is active.
	 *
	 * @param {sap.ui.table.Table} oTable The table this plugin is applied to
	 * @private
	 */
	PluginBase.prototype._deactivate = function(oTable) {
		if (this.isActive()) {
			this.onDeactivate(oTable);
		}
	};

	return PluginBase;
});