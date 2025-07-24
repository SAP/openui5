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
	 * to visualize grouped data with summary rows. Works only in combination with a {@link sap.ui.model.odata.v4.ODataModel}.
	 *
	 * For details about data aggregation, see {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.140
	 * @alias sap.ui.table.plugins.ODataV4Aggregation
	 * @see {@link topic:7d914317c0b64c23824bf932cc8a4ae1 OData V4: Data Aggregation and Recursive Hierarchy}
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const ODataV4Aggregation = ODataV4MultiLevel.extend("sap.ui.table.plugins.ODataV4Aggregation", {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * Indicates whether this plugin is enabled.
				 */
				enabled: {type: "boolean", defaultValue: true}, // TODO: Inherited from private PluginBase. Remove once PluginBase is public.

				/**
				 * Provides a custom group header title.
				 *
				 * This function is called for each group header row in the table. It receives the binding context of the row and the group level
				 * property path according to <code>groupLevels</code> in {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}).
				 * The function must return a string that is used as the title of the group header row.
				 *
				 * Function signature: <code>groupHeaderFormatter(oContext: sap.ui.model.odata.v4.Context, sPropertyPath: string): string</code>
				 *
				 * @example
				 * groupHeaderFormatter: function(oContext, sPropertyPath) {
				 *     // Get the value of the group header property
				 *     const sGroupHeaderValue = oContext.getProperty(sPropertyPath);
				 *     // Format the value as a string
				 *     return `Group: ${sGroupHeaderValue}`;
				 * }
				 */
				groupHeaderFormatter: {type: "function"}
			}
		}
	});

	ODataV4Aggregation.findOn = PluginBase.findOn;

	/**
	 * @override
	 * @inheritDoc
	 */
	ODataV4Aggregation.prototype.onActivate = function(oTable) {
		ODataV4MultiLevel.prototype.onActivate.apply(this, arguments);
		validateBinding.call(this);
		TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Group);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RefreshRows, validateBinding, this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	ODataV4Aggregation.prototype.onDeactivate = function(oTable) {
		ODataV4MultiLevel.prototype.onDeactivate.apply(this, arguments);
		for (const oColumn of oTable.getColumns()) {
			oColumn._setCellContentVisibilitySettings();
		}
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RefreshRows, validateBinding, this);
	};

	/**
	 * Declares the columns that have totals. Columns with totals show the data in the group header row and the summary row. Columns without totals
	 * do not show the data in the group header row and the summary row.
	 *
	 * @param {Array} aColumnsWithTotals The columns that display totals
	 * @private
	 * @ui5-restricted sap.ui.mdc.odata.v4.TableDelegate
	 */
	ODataV4Aggregation.prototype.declareColumnsHavingTotals = function(aColumnsWithTotals) {
		const aColumns = this.getControl()?.getColumns() ?? [];

		for (const oColumn of aColumns) {
			const bHasTotals = aColumnsWithTotals.includes(oColumn);

			oColumn._setCellContentVisibilitySettings({
				groupHeader: bHasTotals,
				summary: bHasTotals
			});
		}
	};

	function validateBinding() {
		const oBinding = this.getControl()?.getBinding();
		const mAggregation = oBinding?.getAggregation();

		if (oBinding && (!mAggregation || "hierarchyQualifier" in mAggregation)) {
			throw new Error("Only data aggregation is supported");
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
			oState.type = oState.Type.GroupHeader;
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

	return ODataV4Aggregation;
});