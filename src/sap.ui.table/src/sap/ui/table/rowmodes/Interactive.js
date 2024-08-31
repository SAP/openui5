/*
 * ${copyright}
 */
sap.ui.define([
	"./RowMode",
	"../utils/TableUtils",
	"sap/ui/Device",
	"sap/m/Menu",
	"sap/m/MenuItem"
], function(
	RowMode,
	TableUtils,
	Device,
	Menu,
	MenuItem
) {
	"use strict";

	const _private = TableUtils.createWeakMapFacade();

	/**
	 * Constructor for a new <code>Interactive</code> row mode.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The user can change the number of displayed rows by dragging a resizer.
	 *
	 * The following restrictions apply:
	 * <ul>
	 *   <li>The functionality targets only the mouse interaction (drag and drop). There is no keyboard alternative available.
	 *       An accessible alternative must be provided by applications, for example, by giving the user the possibility to enter
	 *       the number of required rows in an input field.</li>
	 *   <li>The resize interaction is not optimized for touch devices from a design and interaction perspective.
	 *       We do not recommend to use this mode in such scenarios.</li>
	 * </ul>
	 *
	 * @extends sap.ui.table.rowmodes.RowMode
	 * @constructor
	 * @alias sap.ui.table.rowmodes.Interactive
	 * @since 1.119
	 * @public
	 *
	 * @author SAP SE
	 * @version ${version}
	 */
	const InteractiveRowMode = RowMode.extend("sap.ui.table.rowmodes.Interactive", /** @lends sap.ui.table.rowmodes.Interactive.prototype */ {
		metadata: {
			library: "sap.ui.table",
			"final": true,
			properties: {
				/**
				 * The number of rows displayed in the table. The number of rows in the scrollable area is reduced by the number of fixed rows.
				 */
				rowCount: {type: "int", defaultValue: 10, group: "Appearance"},
				/**
				 * The minimum number of displayed rows.
				 */
				minRowCount: {type: "int", defaultValue: 5, group: "Appearance"},
				/**
				 * The maximum number of displayed rows. If not set, the maximum number of rows is determined by the viewport height of the device.
				 */
				maxRowCount: {type: "int", defaultValue: -1, group: "Appearance"},
				/**
				 * The number of rows in the fixed area at the top. If the number of fixed rows exceeds the number of displayed rows, the number of
				 * fixed rows is reduced.
				 * The table may limit the possible number of fixed rows.
				 */
				fixedTopRowCount: {type: "int", defaultValue: 0, group: "Appearance"},
				/**
				 * The number of rows in the fixed area at the bottom. If the number of fixed rows exceeds the number of displayed rows, the number of
				 * fixed rows is reduced.
				 * The table may limit the possible number of fixed rows.
				 */
				fixedBottomRowCount: {type: "int", defaultValue: 0, group: "Appearance"},
				/**
				 * The row content height in pixel. The actual row height is also influenced by other factors, such as the border width. If no value
				 * is set (includes 0), a default height is applied based on the content density configuration.
				 */
				rowContentHeight: {type: "int", defaultValue: 0, group: "Appearance"}
			}
		},
		constructor: function(sId) {
			RowMode.apply(this, arguments);
		}
	});

	const TableDelegate = {};

	/*
	 * Provides drag&drop resize capabilities.
	 */
	const ResizeHelper = {};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.attachEvents = function() {
		RowMode.prototype.attachEvents.apply(this, arguments);
		TableUtils.addDelegate(this.getTable(), TableDelegate, this);
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.detachEvents = function() {
		RowMode.prototype.detachEvents.apply(this, arguments);
		TableUtils.removeDelegate(this.getTable(), TableDelegate);
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.registerHooks = function() {
		RowMode.prototype.registerHooks.apply(this, arguments);
		TableUtils.Hook.register(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.deregisterHooks = function() {
		RowMode.prototype.deregisterHooks.apply(this, arguments);
		TableUtils.Hook.deregister(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
	};

	InteractiveRowMode.prototype.getRowCount = function() {
		return this.getProperty("rowCount");
	};

	InteractiveRowMode.prototype.getFixedTopRowCount = function() {
		return this.getProperty("fixedTopRowCount");
	};

	InteractiveRowMode.prototype.getFixedBottomRowCount = function() {
		return this.getProperty("fixedBottomRowCount");
	};

	InteractiveRowMode.prototype.getMinRowCount = function() {
		return this.getProperty("minRowCount");
	};

	InteractiveRowMode.prototype.getRowContentHeight = function() {
		return this.getProperty("rowContentHeight");
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getMinRequestLength = function() {
		return this.getActualRowCount();
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getComputedRowCounts = function() {
		const iRowCount = this.getActualRowCount();
		const iFixedTopRowCount = this.getFixedTopRowCount();
		const iFixedBottomRowCount = this.getFixedBottomRowCount();

		return this.computeStandardizedRowCounts(iRowCount, iFixedTopRowCount, iFixedBottomRowCount);
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getTableStyles = function() {
		return {
			height: "auto"
		};
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getRowContainerStyles = function() {
		const sHeight = this.getComputedRowCounts().count * this.getBaseRowHeightOfTable() + "px";

		return {height: sHeight};
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.renderRowStyles = function(oRM) {
		const iRowContentHeight = this.getRowContentHeight();

		if (iRowContentHeight > 0) {
			oRM.style("height", this.getBaseRowHeightOfTable() + "px");
		}
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.renderCellContentStyles = function(oRM) {
		let iRowContentHeight = this.getRowContentHeight();

		if (iRowContentHeight <= 0) {
			iRowContentHeight = this.getDefaultRowContentHeightOfTable();
		}

		if (iRowContentHeight > 0) {
			oRM.style("max-height", iRowContentHeight + "px");
		}
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.renderInTableBottomArea = function(oRm) {
		const oTable = this.getTable();
		oRm.openStart("div", oTable.getId() + "-heightResizer")
			.attr("role", "separator")
			.attr("aria-orientation", "horizontal")
			.attr("title", TableUtils.getResourceText("TBL_RSZ_BTN_TOOLTIP"))
			.attr("tabindex", "0")
			.attr("aria-valuemin", this.getMinRowCount())
			.attr("aria-valuenow", this.getActualRowCount())
			.class("sapUiTableHeightResizer");

			const aLabels = oTable.getAriaLabelledBy();
			if (aLabels.length) {
				oRm.attr("aria-labelledby", aLabels.join(" "));
			}

			oRm.openEnd();
			oRm.openStart("div")
				.class("sapUiTableHeightResizerDecorationBefore")
				.openEnd()
				.close("div");

			oRm.openStart("div")
				.attr("role", "presentation")
				.class("sapUiTableHeightResizerGrip")
				.openEnd()
					.icon("sap-icon://horizontal-grip", ["sapUiTableHeightResizerGripIcon"])
				.close("div");

			oRm.openStart("div")
				.class("sapUiTableHeightResizerDecorationAfter")
				.openEnd()
				.close("div");

		oRm.close("div");
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getBaseRowContentHeight = function() {
		return Math.max(0, this.getRowContentHeight());
	};

	/**
	 * This hook is called when the rows aggregation of the table is refreshed.
	 *
	 * @private
	 */
	InteractiveRowMode.prototype._onTableRefreshRows = function() {
		const iRowCount = this.getActualRowCount();

		if (iRowCount > 0) {
			this.initTableRowsAfterDataRequested(iRowCount);
			this.getRowContexts(iRowCount); // Trigger data request.
		}
	};

	/**
	 * Gets the actual number of rows that are rendered in the table. This can differ from the <code>rowCount</code> property because resizing the
	 * table does not affect the value of the <code>rowCount</code> property.
	 *
	 * @returns {int} The row count.
	 * @private
	 */
	InteractiveRowMode.prototype.getActualRowCount = function() {
		return Math.max(0, this.getMinRowCount(), _private(this).rowCount || this.getRowCount());
	};

	/**
	 * If the maxRowCount is set, it returns the property value. Otherwise, it calculates the maximum row count based on the viewport height of the
	 * device.
	 * @returns {int} The maximum row count.
	 * @private
	 */
	InteractiveRowMode.prototype._getMaxRowCount = function() {
		const iMaxRowCount = this.getMaxRowCount();
		const iMinRowCount = this.getMinRowCount();
		if (iMaxRowCount >= 0) {
			return Math.max(iMaxRowCount, iMinRowCount);
		}

		const iNewHeight = this._determineAvailableSpace();
		return Math.max(Math.floor(iNewHeight / this.getBaseRowHeightOfTable()), iMinRowCount);
	};

	InteractiveRowMode.prototype._determineAvailableSpace = function() {
		const oTable = this.getTable();
		const oTableDomRef = oTable.getDomRef();
		const oRowContainer = oTable.getDomRef("tableCCnt");
		const iViewportHeight = Device.resize.height;

		if (!oTableDomRef || !oRowContainer) {
			return 0;
		}

		return Math.max(0, Math.floor(iViewportHeight - oTableDomRef.getBoundingClientRect().height + oRowContainer.getBoundingClientRect().height));
	};

	InteractiveRowMode.prototype.setRowCount = function(iRowCount) {
		this.setProperty("rowCount", iRowCount);
		_private(this).rowCount = iRowCount;
		return this;
	};

	InteractiveRowMode.prototype.updateTable = function(sReason) {
		this.getTable().getDomRef("heightResizer")?.setAttribute("aria-valuenow", this.getActualRowCount());

		RowMode.prototype.updateTable.apply(this, arguments);
	};

	/**
	 * @this sap.ui.table.rowmodes.Interactive
	 */
	TableDelegate.onAfterRendering = function(oEvent) {
		const oTable = this.getTable();
		const bRenderedRows = oEvent && oEvent.isMarked("renderRows");

		if (!bRenderedRows && oTable.getRows().length > 0) {
			this.fireRowsUpdated(TableUtils.RowsUpdateReason.Render);
		}

		const oResizerDomRef = oTable.getDomRef("heightResizer");
		oResizerDomRef.setAttribute("aria-valuemax", this._getMaxRowCount());
	};

	/**
	 * @this sap.ui.table.rowmodes.Interactive
	 */
	TableDelegate.onmousedown = function(oEvent) {
		const oTable = this.getTable();

		if (oEvent.button === 0 && oTable.getDomRef("heightResizer").contains(oEvent.target)) {
			ResizeHelper.initResizing(oTable, this, oEvent);
		}
	};

	TableDelegate.oncontextmenu = function(oEvent) {
		const oTable = this.getTable();
		const oDomRef = oTable.getDomRef("heightResizer");

		if (oDomRef.contains(oEvent.target)) {
			oEvent.preventDefault();
			oDomRef.classList.add("sapUiTableHeightResizerActive");
			ResizeHelper.openContextMenu(oTable, this, oEvent);
		}
	};

	TableDelegate.onkeydown = function(oEvent) {
		const oTable = this.getTable();
		if (oEvent.target === oTable.getDomRef("heightResizer")) {
			switch (oEvent.key) {
				case "ArrowUp":
					oEvent.preventDefault();
					_private(this).rowCount = Math.max(this.getActualRowCount() - 1, this.getMinRowCount());
					this.updateTable(TableUtils.RowsUpdateReason.Render);
					break;
				case "ArrowDown":
					oEvent.preventDefault();
					_private(this).rowCount = Math.min(this.getActualRowCount() + 1, this._getMaxRowCount());
					this.updateTable(TableUtils.RowsUpdateReason.Render);
					break;
				case "Home":
					oEvent.preventDefault();
					_private(this).rowCount = this.getMinRowCount();
					this.updateTable(TableUtils.RowsUpdateReason.Render);
					break;
				case "End":
					oEvent.preventDefault();
					_private(this).rowCount = this._getMaxRowCount();
					this.updateTable(TableUtils.RowsUpdateReason.Render);
					break;
				default:
			}
		}
	};

	TableDelegate.ondblclick = function(oEvent) {
		if (!this.getTable().getDomRef("heightResizer").contains(oEvent.target)) {
			return;
		}

		const iActualRowCount = this.getActualRowCount();
		if (iActualRowCount === this._getMaxRowCount()) {
			_private(this).rowCount = this.getMinRowCount();
		} else if (iActualRowCount === this.getMinRowCount()) {
			_private(this).rowCount = this.getRowCount();
		} else {
			_private(this).rowCount = this._getMaxRowCount();
		}
		this.updateTable(TableUtils.RowsUpdateReason.Render);
	};

	/**
	 * Initializes the drag&drop for resizing.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table
	 * @param {sap.ui.table.rowmodes.Interactive} oMode The interactive row mode
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	ResizeHelper.initResizing = function(oTable, oMode, oEvent) {
		oTable._disableTextSelection();
		ResizeHelper._oTable = oTable;
		ResizeHelper._iResizerStartPos = oEvent.pageY;

		document.addEventListener("touchend", ResizeHelper.onResizingEnd.bind(oTable, oMode), {once: true});
		document.addEventListener("touchmove", ResizeHelper.onResizerMove);
		document.addEventListener("mouseup", ResizeHelper.onResizingEnd.bind(oTable, oMode), {once: true});
		document.addEventListener("mousemove", ResizeHelper.onResizerMove);

		const oDomRef = oTable.getDomRef("heightResizer");
		oDomRef.classList.add("sapUiTableHeightResizerActive");
		oDomRef.style.top = "0";
	};

	/**
	 * Handler for the move events while dragging the horizontal resize bar.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 */
	ResizeHelper.onResizerMove = function(oEvent) {
		const iDelta = (oEvent.pageY - ResizeHelper._iResizerStartPos);
		ResizeHelper._oTable.getDomRef("heightResizer").style.top = iDelta + "px";
	};

	/**
	 * Drops the horizontal splitter bar and recalculates the number of rows to be displayed.
	 *
	 * @param {sap.ui.table.rowmodes.Interactive} oMode The interactive row mode
	 * @param {jQuery.Event} oEvent The event object
	 */
	ResizeHelper.onResizingEnd = function(oMode, oEvent) {
		const iLocationY = TableUtils.getEventPosition(oEvent, this).y;
		const iTablePosTop = this.getDomRef("tableCCnt").getBoundingClientRect().top;
		const oFooterDomRef = this.getDomRef().querySelector(".sapUiTableFtr");
		const iTableFooterHeight = oFooterDomRef ? oFooterDomRef.getBoundingClientRect().height : 0;
		const iNewHeight = iLocationY - iTablePosTop - iTableFooterHeight;
		const iUserDefinedRowCount = Math.floor(iNewHeight / oMode.getBaseRowHeightOfTable());
		let iNewRowCount = Math.max(0, iUserDefinedRowCount, oMode.getMinRowCount());
		const iMaxRowCount = oMode._getMaxRowCount();
		if (iMaxRowCount > 0) {
			iNewRowCount = Math.min(iNewRowCount, iMaxRowCount);
		}

		_private(oMode).rowCount = iNewRowCount;
		oMode.updateTable(TableUtils.RowsUpdateReason.Render);

		document.removeEventListener("touchmove", ResizeHelper.onResizerMove);
		document.removeEventListener("mousemove", ResizeHelper.onResizerMove);

		const oDomRef = this.getDomRef("heightResizer");
		oDomRef.classList.remove("sapUiTableHeightResizerActive");
		oDomRef.style.top = "";
		this._enableTextSelection();
	};

	ResizeHelper.openContextMenu = function(oTable, oMode, oEvent) {
		if (!ResizeHelper._oContextMenu) {
			ResizeHelper._oContextMenu = new Menu({
				items: [
					new MenuItem({
						text: TableUtils.getResourceText("TBL_RSZ_ROW_UP"),
						shortcutText: TableUtils.getResourceText("TBL_RSZ_ROW_UP_SHORTCUT"),
						press: function() {
							const iRowCount = oMode.getActualRowCount();
							_private(oMode).rowCount = Math.max(iRowCount - 1, oMode.getMinRowCount());
							oMode.updateTable(TableUtils.RowsUpdateReason.Render);
						}
					}),
					new MenuItem({
						text: TableUtils.getResourceText("TBL_RSZ_ROW_DOWN"),
						shortcutText: TableUtils.getResourceText("TBL_RSZ_ROW_DOWN_SHORTCUT"),
						press: function() {
							const iRowCount = oMode.getActualRowCount();
							_private(oMode).rowCount = Math.min(iRowCount + 1, oMode._getMaxRowCount());
							oMode.updateTable(TableUtils.RowsUpdateReason.Render);
						}
					}),
					new MenuItem({
						text: TableUtils.getResourceText("TBL_RSZ_MINIMIZE"),
						shortcutText: TableUtils.getResourceText("TBL_RSZ_MINIMIZE_SHORTCUT"),
						press: function() {
							_private(oMode).rowCount = oMode.getMinRowCount();
							oMode.updateTable(TableUtils.RowsUpdateReason.Render);
						}
					}),
					new MenuItem({
						text: TableUtils.getResourceText("TBL_RSZ_MAXIMIZE"),
						shortcutText: TableUtils.getResourceText("TBL_RSZ_MAXIMIZE_SHORTCUT"),
						press: function() {
							_private(oMode).rowCount = oMode._getMaxRowCount();
							oMode.updateTable(TableUtils.RowsUpdateReason.Render);
						}
					})
				],
				closed: function() {
					oTable.getDomRef("heightResizer").classList.remove("sapUiTableHeightResizerActive");
				}
			});
			ResizeHelper._oContextMenu.openAsContextMenu(oEvent, oTable.getDomRef("heightResizer"));
		} else {
			ResizeHelper._oContextMenu.openAsContextMenu(oEvent, oTable.getDomRef("heightResizer"));
		}
	};

	return InteractiveRowMode;
});