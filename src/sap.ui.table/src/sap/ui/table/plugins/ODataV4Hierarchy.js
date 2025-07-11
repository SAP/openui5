/*
 * ${copyright}
 */
sap.ui.define([
	"./ODataV4MultiLevel",
	"./PluginBase",
	"../utils/TableUtils"
], function(
	ODataV4MultiLevel,
	PluginBase,
	TableUtils
) {
	"use strict";

	/**
	 * @class
	 * Integrates the information about the data structure of the {@link sap.ui.model.odata.v4.ODataListBinding} and the table. The table is enabled
	 * to visualize hierarchical data. Works only in combination with a {@link sap.ui.model.odata.v4.ODataModel}.
	 *
	 * For details about hierarchies, see {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.139
	 * @alias sap.ui.table.plugins.ODataV4Hierarchy
	 * @see {@link topic:7d914317c0b64c23824bf932cc8a4ae1 OData V4: Data Aggregation and Recursive Hierarchy}
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const ODataV4Hierarchy = ODataV4MultiLevel.extend("sap.ui.table.plugins.ODataV4Hierarchy", {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * Indicates whether this plugin is enabled.
				 */
				enabled: {type: "boolean", defaultValue: true} // TODO: Inherited from private PluginBase. Remove once PluginBase is public.
			}
		}
	});

	ODataV4Hierarchy.findOn = PluginBase.findOn;

	/**
	 * @override
	 * @inheritDoc
	 */
	ODataV4Hierarchy.prototype.onActivate = function(oTable) {
		ODataV4MultiLevel.prototype.onActivate.apply(this, arguments);
		validateBinding.call(this);
		TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Tree);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RefreshRows, validateBinding, this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	ODataV4Hierarchy.prototype.onDeactivate = function(oTable) {
		ODataV4MultiLevel.prototype.onDeactivate.apply(this, arguments);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RefreshRows, validateBinding, this);
	};

	function validateBinding() {
		const oBinding = this.getControl()?.getBinding();
		const mAggregation = oBinding?.getAggregation();

		if (oBinding && (!mAggregation || !("hierarchyQualifier" in mAggregation))) {
			throw new Error("Only data aggregation is supported");
		}
	}

	function updateRowState(oState) {
		const vIsExpanded = oState.context.getProperty("@$ui5.node.isExpanded");
		const bIsNode = vIsExpanded !== undefined;

		oState.level = oState.context.getProperty("@$ui5.node.level") ?? 1;
		oState.expandable = bIsNode;
		oState.expanded = vIsExpanded;
	}

	return ODataV4Hierarchy;
});