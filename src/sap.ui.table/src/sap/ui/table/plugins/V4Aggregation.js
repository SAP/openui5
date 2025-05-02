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
				 * If the formatter returns undefined, the default group header title is set.
				 *
				 * Parameters: Binding context (sap.ui.model.Context), Name of the grouped property (string)
				 * Returns: The group header title or undefined
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
		TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Group);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsBound, validateBinding);
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
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, this.updateRowState, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);
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

	function updateRowState(oState) {
		const iLevel = oState.context.getProperty("@$ui5.node.level");
		const bContainsTotals = oState.context.getProperty("@$ui5.node.isTotal");
		const bIsLeaf = oState.context.getProperty("@$ui5.node.isExpanded") === undefined;
		const bIsGrandTotal = iLevel === 0 && bContainsTotals;
		const bIsGroupHeader = iLevel > 0 && !bIsLeaf;
		const bIsGroupTotal = !bIsGroupHeader && bContainsTotals;

		oState.level = iLevel;
		oState.expandable = bIsGroupHeader;
		oState.expanded = oState.context.getProperty("@$ui5.node.isExpanded") === true;

		if (bIsGrandTotal || bIsGroupTotal) {
			oState.type = oState.Type.Summary;
			oState.level = iLevel + 1;
		} else if (bIsGroupHeader) {
			oState.type = oState.Type.GroupHeader;
		}

		if (bIsGroupHeader) {
			const sGroupHeaderPath = oState.context.getBinding().getAggregation().groupLevels[iLevel - 1];
			const fnCustomGroupHeaderFormatter = this.getGroupHeaderFormatter();

			if (fnCustomGroupHeaderFormatter) {
				const sCustomGroupHeaderTitle = fnCustomGroupHeaderFormatter(oState.context, sGroupHeaderPath);

				if (typeof sCustomGroupHeaderTitle !== "string") {
					throw new Error("The group header title must be a string");
				}

				oState.title = sCustomGroupHeaderTitle;
			} else {
				oState.title = oState.context.getProperty(sGroupHeaderPath, true);
			}
		}
	}

	function expandRow(oRow) {
		const oBindingContext = oRow.getRowBindingContext();

		if (oBindingContext) {
			oBindingContext.expand();
		}
	}

	function collapseRow(oRow) {
		const oBindingContext = oRow.getRowBindingContext();

		if (oBindingContext) {
			oBindingContext.collapse();
		}
	}

	return V4Aggregation;
});