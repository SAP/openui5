/*
 * ${copyright}
 */
sap.ui.define([
	"../library",
	"./RowMode"
], function(
	library,
	RowMode
) {
	"use strict";

	/**
	 * Constructor for a new auto variable mode.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * // TODO: Class description
	 * @extends sap.ui.table.rowmodes.RowMode
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @experimental
	 * @alias sap.ui.table.rowmodes.Variable
	 */
	const VariableRowMode = RowMode.extend("sap.ui.table.rowmodes.Variable", {
		metadata: {
			library: "sap.ui.table",
			properties: {
				tableHeight: {type: "sap.ui.core.CSSSize", defaultValue: "100%", group: "Dimension"}
			}
		}
	});

	/**
	 * @inheritDoc
	 */
	VariableRowMode.prototype.getComputedRowCounts = function() {
		const iTotalRowCount = this.getTotalRowCountOfTable();
		const iRowCount = this.getHideEmptyRows() ? Math.min(this.getRowCount(), iTotalRowCount) : this.getRowCount();

		return {
			count: iRowCount,
			fixedTopCount: this.getFixedTopRowCount(),
			fixedBottomCount: this.getFixedBottomRowCount()
		};
	};

	/**
	 * @inheritDoc
	 */
	VariableRowMode.prototype.getTableHeight = function() {
		return {
			height: this.getTableHeight()
		};
	};

	/**
	 * @inheritDoc
	 */
	VariableRowMode.prototype.getRowContainerHeight = function() {
		return {
			height: this.getComputedRowCounts().count * this.getBaseRowHeightOfTable()
		};
	};

	return VariableRowMode;
});