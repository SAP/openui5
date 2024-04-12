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

	const Hook = TableUtils.Hook.Keys;
	const oHookInstallation = {};
	const _private = TableUtils.createWeakMapFacade();

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
	 */
	const PluginBase = Element.extend("sap.ui.table.plugins.PluginBase", /** @lends sap.ui.table.plugins.PluginBase.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.ui.table"
		}
	});

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

	/**
	 * @override
	 * @inheritDoc
	 */
	PluginBase.prototype.init = function() {
		Element.prototype.init.apply(this, arguments);
		_private(this).bIsActive = false;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	PluginBase.prototype.exit = function() {
		Element.prototype.exit.apply(this, arguments);
		this.deactivate();
	};

	/**
	 * Called when the plugin is activated. A plugin is activated when it was successfully applied to a table.
	 *
	 * @param {sap.ui.table.Table} oTable The table this plugin is applied to
	 * @protected
	 * @virtual
	 */
	PluginBase.prototype.onActivate = function(oTable) {};

	/**
	 * Called when the plugin is deactivated.
	 *
	 * @param {sap.ui.table.Table} oTable The table this plugin is or was applied to
	 * @protected
	 * @virtual
	 */
	PluginBase.prototype.onDeactivate = function(oTable) {};

	/**
	 * Gets the active state of the plugin.
	 *
	 * @returns {boolean} Whether the plugin is active
	 * @public
	 */
	PluginBase.prototype.isActive = function() {
		return _private(this).bIsActive;
	};

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

	/**
	 * @override
	 * @inheritDoc
	 */
	PluginBase.prototype.setParent = function(oParent) {
		this.deactivate();
		Element.prototype.setParent.apply(this, arguments);

		if (oParent) {
			if (!this.isApplicable(this.getTable())) {
				throw new Error(this + " is not applicable to " + oParent);
			}
			this.activate();
		}

		return this;
	};

	/**
	 * Called when the <code>rows</code> aggregation of the table is bound.
	 *
	 * @protected
	 * @virtual
	 */
	PluginBase.prototype.onTableBindRows = function() {};
	oHookInstallation[Hook.Table.BindRows] = function(oBindingInfo) {
		this.onTableBindRows(oBindingInfo);
	};

	/**
	 * Called when a new binding for the <code>rows</code> aggregation of the table is created, or the plugin is activated in a table with an
	 * already existing binding for the <code>rows</code> aggregation.
	 *
	 * @param {sap.ui.model.Binding} oBinding The binding of the <code>rows</code> aggregation of the table
	 * @protected
	 * @virtual
	 */
	PluginBase.prototype.onTableRowsBound = function(oBinding) {};
	oHookInstallation[Hook.Table.RowsBound] = function(oBinding) {
		this.onTableRowsBound(oBinding); // TODO: rename to onTableBindingCreated ?
	};

	/**
	 * Called when the binding of the <code>rows</code> aggregation of the table is removed.
	 *
	 * @protected
	 * @virtual
	 */
	PluginBase.prototype.onTableUnbindRows = function() {};
	oHookInstallation[Hook.Table.UnbindRows] = function() {
		this.onTableUnbindRows(); // TODO: rename to onTableBindingRemoved ?
	};

	/**
	 * Gets the table this plugin is applied to.
	 *
	 * @returns {sap.ui.table.Table|null} The instance of the table this plugin is applied to, or <code>null</code> if not applied to a table
	 * @protected
	 */
	PluginBase.prototype.getTable = function() {
		const oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Table") ? oParent : null;
	};

	/**
	 * Gets the binding of the <code>rows</code> aggregation of the table.
	 *
	 * @returns {sap.ui.model.Binding|null} Returns the binding of the <code>rows</code> aggregation of the table.
	 * @protected
	 */
	PluginBase.prototype.getTableBinding = function() {
		const oTable = this.getTable();
		const oBinding = oTable ? oTable.getBinding() : null;
		return oBinding ? oBinding : null;
	};

	/**
	 * Sets soft constraints for the row counts of the table this plugin is currently applied to.
	 * They may be fully or partially ignored by the table or the row mode. For example, constraints for fixed rows may be ignored if the row mode
	 * does not support setting fixed rows.
	 * There can be conflicts if multiple plugins try to constrain the row counts. Only the constraints of the last call of this method are
	 * considered.
	 *
	 * @param {object} [mConstraints]
	 *     Row count constraints
	 * @param {boolean} [mConstraints.fixedTop]
	 *     The value <code>true</code> means that there is exactly one fixed top row and <code>false</code> means that fixed top rows are disabled.
	 *     By default, there is no constraint for the fixed top rows. This constraint might be ignored if the table or its row mode do not
	 *     support fixed top rows.
	 * @param {boolean} [mConstraints.fixedBottom]
	 *     The value <code>true</code> means that there is exactly one fixed bottom row and <code>false</code> means that fixed bottom rows are
	 *     disabled. By default, there is no constraint for the fixed bottom rows. This constraint might be ignored if the table or its row mode
	 *     do not support fixed bottom rows.
	 * @protected
	 */
	PluginBase.prototype.setRowCountConstraints = function(mConstraints) {
		// TODO: Add a type definition for a protected type "rowCountConstraints" in the library file to document the parameter
		//  RowMode#getRowCountConstraints + PluginBase#setRowCountConstraints
		const oTable = this.getTable();

		if (oTable) {
			oTable._setRowCountConstraints(mConstraints);
		}
	};

	/**
	 * Activates the plugin if it is not active.
	 *
	 * @protected
	 */
	PluginBase.prototype.activate = function() {
		const oTable = this.getTable();

		if (!oTable || this.isActive()) {
			return;
		}

		TableUtils.Hook.install(oTable, oHookInstallation, this);
		this.onActivate(oTable);

		const oTableBinding = this.getTableBinding();
		if (oTableBinding) {
			this.onTableRowsBound(oTableBinding);
		}

		_private(this).bIsActive = true;
	};

	/**
	 * Deactivates the plugin if it is active.
	 *
	 * @protected
	 */
	PluginBase.prototype.deactivate = function() {
		const oTable = this.getTable();

		if (!this.isActive()) {
			return;
		}

		TableUtils.Hook.uninstall(oTable, oHookInstallation, this);
		this.onDeactivate(oTable);
		_private(this).bIsActive = false;
	};

	return PluginBase;
});