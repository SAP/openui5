/*
 * ${copyright}
 */
sap.ui.define([
	"../library",
	"./RowMode",
	"../utils/TableUtils"
], function(
	library,
	RowMode,
	TableUtils
) {
	"use strict";

	/**
	 * Constructor for a new fixed row mode.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * TODO: Class description
	 * @extends sap.ui.table.rowmodes.RowMode
	 * @constructor
	 * @alias sap.ui.table.rowmodes.FixedRowMode
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FixedRowMode = RowMode.extend("sap.ui.table.rowmodes.FixedRowMode", /** @lends sap.ui.table.rowmodes.FixedRowMode.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				rowCount: {type: "int", defaultValue: 10, group: "Appearance"},
				fixedTopRowCount: {type: "int", defaultValue: 0, group: "Appearance"},
				fixedBottomRowCount: {type: "int", defaultValue: 0, group: "Appearance"},
				rowContentHeight: {type: "int", defaultValue: 0, group: "Appearance"},
				hideEmptyRows: {type: "boolean", defaultValue: false, group: "Appearance"}
			}
		},
		constructor: function(sId) {
			Object.defineProperty(this, "bLegacy", {
				value: typeof sId === "boolean" ? sId : false
			});

			RowMode.apply(this, arguments);
		}
	});

	var TableDelegate = {};

	FixedRowMode.prototype.attachEvents = function() {
		RowMode.prototype.attachEvents.apply(this, arguments);
		TableUtils.addDelegate(this.getTable(), TableDelegate, this);
	};

	FixedRowMode.prototype.detachEvents = function() {
		RowMode.prototype.detachEvents.apply(this, arguments);
		TableUtils.removeDelegate(this.getTable(), TableDelegate);
	};

	FixedRowMode.prototype.registerHooks = function() {
		RowMode.prototype.registerHooks.apply(this, arguments);
		TableUtils.Hook.register(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
	};

	FixedRowMode.prototype.deregisterHooks = function() {
		RowMode.prototype.deregisterHooks.apply(this, arguments);
		TableUtils.Hook.deregister(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
	};

	FixedRowMode.prototype.getRowCount = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getVisibleRowCount() : 0;
		}

		return this.getProperty("rowCount");
	};

	FixedRowMode.prototype.getFixedTopRowCount = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getFixedRowCount() : 0;
		}

		return this.getProperty("fixedTopRowCount");
	};

	FixedRowMode.prototype.getFixedBottomRowCount = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getFixedBottomRowCount() : 0;
		}

		return this.getProperty("fixedBottomRowCount");
	};

	FixedRowMode.prototype.getRowContentHeight = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getRowHeight() : 0;
		}

		return this.getProperty("rowContentHeight");
	};

	FixedRowMode.prototype.setHideEmptyRows = function(bHideEmptyRows) {
		this.setProperty("hideEmptyRows", bHideEmptyRows);

		if (bHideEmptyRows) {
			this.disableNoData();
		} else {
			this.enableNoData();
		}

		return this;
	};

	FixedRowMode.prototype.getMinRequestLength = function() {
		return Math.max(0, this.getRowCount());
	};

	FixedRowMode.prototype.updateTableRows = function() {
		if (this.getHideEmptyRows() && this.getComputedRowCounts().count === 0) {
			var iRowCount = this.getRowCount();

			if (iRowCount > 0) {
				return this.getRowContexts(iRowCount).length > 0;
			}
		} else {
			return RowMode.prototype.updateTableRows.call(this);
		}
	};

	FixedRowMode.prototype.getComputedRowCounts = function() {
		var iRowCount = this.getRowCount();
		var iFixedTopRowCount = this.getFixedTopRowCount();
		var iFixedBottomRowCount = this.getFixedBottomRowCount();

		if (this.getHideEmptyRows()) {
			iRowCount = Math.min(iRowCount, this.getTotalRowCountOfTable());
		}

		return this.computeStandardizedRowCounts(iRowCount, iFixedTopRowCount, iFixedBottomRowCount);
	};

	FixedRowMode.prototype.getTableStyles = function() {
		return {
			height: "auto"
		};
	};

	FixedRowMode.prototype.getTableBottomPlaceholderStyles = function() {
		if (!this.getHideEmptyRows()) {
			return undefined;
		}

		var iRowCountDelta = Math.max(0, this.getRowCount() - this.getComputedRowCounts().count);

		return {
			height: iRowCountDelta * this.getBaseRowHeightOfTable() + "px"
		};
	};

	FixedRowMode.prototype.getRowContainerStyles = function() {
		var sHeight = this.getComputedRowCounts().count * this.getBaseRowHeightOfTable() + "px";

		if (this.bLegacy && !TableUtils.isVariableRowHeightEnabled(this.getTable())) {
			return {minHeight: sHeight};
		} else {
			return {height: sHeight};
		}
	};

	FixedRowMode.prototype.renderRowStyles = function(oRM) {
		var iRowContentHeight = this.getRowContentHeight();

		if (iRowContentHeight > 0) {
			oRM.style("height", this.getBaseRowHeightOfTable() + "px");
		}
	};

	FixedRowMode.prototype.renderCellContentStyles = function(oRM) {
		var iRowContentHeight = this.getRowContentHeight();

		if (this.bLegacy) {
			return;
		}

		if (iRowContentHeight <= 0) {
			iRowContentHeight = this.getDefaultRowContentHeightOfTable();
		}

		if (iRowContentHeight > 0) {
			oRM.style("max-height", iRowContentHeight + "px");
		}
	};

	FixedRowMode.prototype.getBaseRowContentHeight = function() {
		return Math.max(0, this.getRowContentHeight());
	};

	/**
	 * This hook is called when the rows aggregation of the table is refreshed.
	 *
	 * @private
	 */
	FixedRowMode.prototype._onTableRefreshRows = function() {
		// The computed row count cannot be used here, because the table's total row count (binding length) is not known yet.
		var iRowCount = this.getRowCount();

		if (iRowCount > 0) {
			if (TableUtils.isVariableRowHeightEnabled(this.getTable())) {
				iRowCount++;
			}

			this.initTableRowsAfterDataRequested(iRowCount);
			this.getRowContexts(iRowCount); // Trigger data request.
		}
	};

	/**
	 * @this sap.ui.table.rowmodes.FixedRowMode
	 */
	TableDelegate.onAfterRendering = function(oEvent) {
		var oTable = this.getTable();
		var bRenderedRows = oEvent && oEvent.isMarked("renderRows");

		if (!bRenderedRows && oTable.getRows().length > 0) {
			this.fireRowsUpdated(TableUtils.RowsUpdateReason.Render);
		}
	};

	return FixedRowMode;
});