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
	 * @class
	 * Integrates the aggregation information of the {@link sap.ui.model.odata.v4.ODataListBinding} and the table. The table is enabled to visualize
	 * group levels and sums according to that information. See {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation} for details.
	 *
	 * This plugin only works in combination with a <code>sap.ui.model.odata.v4.ODataModel</code>. Do not add it to a table that is bound to another
	 * model.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.table.plugins.V4Aggregation
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const V4Aggregation = PluginBase.extend("sap.ui.table.plugins.V4Aggregation", /** @lends sap.ui.table.plugins.V4Aggregation.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * Indicates whether this plugin is enabled.
				 */
				enabled: {type: "boolean", defaultValue: true}, // TODO: Inherited from private PluginBase. Remove once PluginBase is public.

				/**
				 * Provide a custom group header title.
				 *
				 * Parameters: Binding context (sap.ui.model.Context), Name of the grouped property (string)
				 * Returns: The group header title
				 */
				groupHeaderFormatter: {type: "function"}
			}
		}
	});

	V4Aggregation.findOn = PluginBase.findOn;

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.isApplicable = function(oControl) {
		return PluginBase.prototype.isApplicable.apply(this, arguments) && oControl.getMetadata().getName() === "sap.ui.table.Table";
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.onActivate = function(oTable) {
		validateBinding(oTable.getBinding());
		updateTableHierarchyMode(oTable);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsBound, validateBinding);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RefreshRows, onTableRefreshRows, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.onDeactivate = function(oTable) {
		for (const oColumn of oTable.getColumns()) {
			oColumn._setCellContentVisibilitySettings();
		}
		TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Flat);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RowsBound, validateBinding);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RefreshRows, onTableRefreshRows, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);
	};

	V4Aggregation.prototype.declareColumnsHavingTotals = function(aColumnsWithTotals) {
		const aColumns = this.getControl()?.getColumns() ?? [];

		for (const oColumn of aColumns) {
			const bHasTotals = aColumnsWithTotals.includes(oColumn);

			oColumn._setCellContentVisibilitySettings({
				groupHeader: bHasTotals,
				summary: bHasTotals
			});
		}
	};

	function validateBinding(oBinding) {
		if (!oBinding) {
			return;
		}

		if (!oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			throw new Error("Model must be sap.ui.model.odata.v4.ODataModel");
		}
	}

	function onTableRefreshRows() {
		updateTableHierarchyMode(this.getControl());
	}

	function updateTableHierarchyMode(oTable) {
		if ("hierarchyQualifier" in (oTable.getBinding()?.getAggregation() || {})) {
			TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Tree);
		} else {
			TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Group);
		}
	}

	function updateRowState(oState) {
		const iLevel = oState.context.getProperty("@$ui5.node.level") ?? 1;
		const bContainsTotals = oState.context.getProperty("@$ui5.node.isTotal") === true;
		const vIsExpanded = oState.context.getProperty("@$ui5.node.isExpanded");
		const bIsGrandTotal = bContainsTotals && iLevel === 0;
		const bIsGroupTotal = bContainsTotals && vIsExpanded === undefined;
		const bIsGroupHeader = iLevel > 0 && vIsExpanded !== undefined;

		oState.level = iLevel;
		oState.expandable = vIsExpanded !== undefined;
		oState.expanded = vIsExpanded;

		if (bIsGrandTotal || bIsGroupTotal) {
			oState.type = oState.Type.Summary;
			oState.level = iLevel + 1; // In the binding context, summary rows are one level higher than needed in the table.
			oState.expandable = false; // In the binding context, the total summary (grand total) is expanded.
		} else if (bIsGroupHeader) {
			oState.type = oState.Type.GroupHeader; // In tree mode, the row type GroupHeader is ignored and treated like row type Standard.
			setGroupHeaderTitle(oState, this.getGroupHeaderFormatter());
		}
	}

	function setGroupHeaderTitle(oState, fnFormatter) {
		const aGroupLevels = oState.context.getBinding().getAggregation()?.groupLevels ?? [];

		if (aGroupLevels.length === 0) {
			return;
		}

		const sGroupHeaderPath = aGroupLevels[oState.level - 1];

		if (fnFormatter) {
			const sCustomGroupHeaderTitle = fnFormatter(oState.context, sGroupHeaderPath);

			if (typeof sCustomGroupHeaderTitle !== "string") {
				throw new Error("The group header title must be a string");
			}

			oState.title = sCustomGroupHeaderTitle;
		} else {
			oState.title = oState.context.getProperty(sGroupHeaderPath, true);
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

	return V4Aggregation;
});