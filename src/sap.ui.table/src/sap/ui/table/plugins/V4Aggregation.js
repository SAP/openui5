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
	 * Constructs an instance of sap.ui.table.plugins.V4Aggregation
	 *
	 * @class TODO
	 * @extends sap.ui.table.plugins.PluginBase
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.76
	 * @ui5-restricted sap.ui.mdc
	 * @alias sap.ui.table.plugins.V4Aggregation
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const V4Aggregation = PluginBase.extend("sap.ui.table.plugins.V4Aggregation", /** @lends sap.ui.table.plugins.V4Aggregation.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
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
	V4Aggregation.prototype.activate = function() {
		const oBinding = this.getTableBinding();

		if (oBinding && !oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
			return;
		}

		PluginBase.prototype.activate.apply(this, arguments);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.onActivate = function(oTable) {
		TableUtils.Grouping.setToDefaultGroupMode(oTable);
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
		TableUtils.Grouping.setToDefaultFlatMode(oTable);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, this.updateRowState, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.deregister(this, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	V4Aggregation.prototype.onTableRowsBound = function(oBinding) {
		// TODO: Check whether the plugin is correctly (de)activated in all possible cases and write tests.
		//  For example:
		//   - if the plugin is not active because there is no ODataV4 model yet, it won't be activated if that model is added later
		//   - on unbind
		//  Consider calling binding-related hooks also on inactive plugins for this purpose (check usage in selection plugins).
		if (!oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			this.deactivate();
		}
	};

	V4Aggregation.prototype.declareColumnsHavingTotals = function(aColumnsWithTotals) {
		const aColumns = this.getTable()?.getColumns() ?? [];

		for (const oColumn of aColumns) {
			const bHasTotals = aColumnsWithTotals.includes(oColumn);

			oColumn._setCellContentVisibilitySettings({
				groupHeader: bHasTotals,
				summary: bHasTotals
			});
		}
	};

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
			const sGroupHeaderPath = this.getTableBinding().getAggregation().groupLevels[iLevel - 1];
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