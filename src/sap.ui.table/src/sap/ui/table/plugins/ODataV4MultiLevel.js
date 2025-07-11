/*
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"../utils/TableUtils"
], function(
	PluginBase,
	TableUtils
) {
	"use strict";

	/**
	 * @abstract
	 * @class
	 * Base class for OData V4 plugins that integrate the table with the bindings aggregation and hierarchy features. Works only in combination with
	 * a {@link sap.ui.model.odata.v4.ODataModel}.
	 *
	 * @extends sap.ui.table.plugins.PluginBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.table.plugins.ODataV4MultiLevel
	 * @see {@link topic:7d914317c0b64c23824bf932cc8a4ae1 OData V4: Data Aggregation and Recursive Hierarchy}
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const ODataV4MultiLevel = PluginBase.extend("sap.ui.table.plugins.ODataV4MultiLevel", {
		metadata: {
			"abstract": true,
			library: "sap.ui.table"
		}
	});

	ODataV4MultiLevel.findOn = PluginBase.findOn;

	/**
	 * @override
	 * @inheritDoc
	 */
	ODataV4MultiLevel.prototype.isApplicable = function(oControl) {
		return PluginBase.prototype.isApplicable.apply(this, arguments) && oControl.getMetadata().getName() === "sap.ui.table.Table";
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	ODataV4MultiLevel.prototype.onActivate = function(oTable) {
		PluginBase.prototype.onActivate.apply(this, arguments);
		validateBinding(oTable.getBinding());
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsBound, validateBinding);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	ODataV4MultiLevel.prototype.onDeactivate = function(oTable) {
		PluginBase.prototype.onDeactivate.apply(this, arguments);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RowsBound, validateBinding);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);
		TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Flat);
	};

	function validateBinding(oBinding) {
		if (!oBinding) {
			return;
		}

		if (!oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			throw new Error("Model must be sap.ui.model.odata.v4.ODataModel");
		}
	}

	function expandRow(oRow) {
		const oBindingContext = TableUtils.getBindingContextOfRow(oRow);

		if (oBindingContext) {
			oBindingContext.expand();
		}
	}

	function collapseRow(oRow) {
		const oBindingContext = TableUtils.getBindingContextOfRow(oRow);

		if (oBindingContext) {
			oBindingContext.collapse();
		}
	}

	return ODataV4MultiLevel;
});