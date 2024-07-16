/*
 * ${copyright}
 */
sap.ui.define([
	"./RowMode",
	"../utils/TableUtils",
	"sap/ui/thirdparty/jquery"
], function(
	RowMode,
	TableUtils,
	jQuery
) {
	"use strict";

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
		return this.getConfiguredRowCount();
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getComputedRowCounts = function() {
		const iRowCount = this.getConfiguredRowCount();
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
		oRm.openStart("div", this.getTable().getId() + "-sb");
		oRm.attr("tabindex", "-1");
		oRm.class("sapUiTableHeightResizer");
		oRm.style("height", "5px");
		oRm.openEnd();
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
		const iRowCount = this.getConfiguredRowCount();

		if (iRowCount > 0) {
			this.initTableRowsAfterDataRequested(iRowCount);
			this.getRowContexts(iRowCount); // Trigger data request.
		}
	};

	/**
	 * Gets the row count as configured with the <code>rowCount</code> and <code>minRowCount</code> properties.
	 *
	 * @returns {int} The configured row count.
	 * @private
	 */
	InteractiveRowMode.prototype.getConfiguredRowCount = function() {
		return Math.max(0, this.getMinRowCount(), this.getRowCount());
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
	};

	/**
	 * @this sap.ui.table.rowmodes.Interactive
	 */
	TableDelegate.onmousedown = function(oEvent) {
		const oTable = this.getTable();

		if (oEvent.button === 0 && oEvent.target === oTable.getDomRef("sb")) {
			ResizeHelper.initInteractiveResizing(oTable, this, oEvent);
		}
	};

	/**
	 * Initializes the drag&drop for resizing.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.rowmodes.Interactive} oMode The interactive row mode.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	ResizeHelper.initInteractiveResizing = function(oTable, oMode, oEvent) {
		const $Body = jQuery(document.body);
		const $Splitter = oTable.$("sb");
		const $Document = jQuery(document);
		const offset = $Splitter.offset();
		const height = $Splitter.height();
		const width = $Splitter.width();
		const bTouch = oTable._isTouchEvent(oEvent);

		const oGhostDiv = document.createElement("div");
		oGhostDiv.style.width = width + "px";
		oGhostDiv.style.height = height + "px";
		oGhostDiv.style.left = offset.left + "px";
		oGhostDiv.style.top = offset.top + "px";
		oGhostDiv.className = "sapUiTableInteractiveResizerGhost";
		oGhostDiv.id = oTable.getId() + "-ghost";
		$Body.append(oGhostDiv);

		const oOverlayDiv = document.createElement("div");
		oOverlayDiv.style.top = "0px";
		oOverlayDiv.style.bottom = "0px";
		oOverlayDiv.style.left = "0px";
		oOverlayDiv.style.right = "0px";
		oOverlayDiv.style.position = "absolute";
		oOverlayDiv.id = oTable.getId() + "-rzoverlay";
		$Splitter.append(oOverlayDiv);

		$Document.on((bTouch ? "touchend" : "mouseup") + ".sapUiTableInteractiveResize",
			ResizeHelper.exitInteractiveResizing.bind(oTable, oMode));
		$Document.on((bTouch ? "touchmove" : "mousemove") + ".sapUiTableInteractiveResize",
			ResizeHelper.onMouseMoveWhileInteractiveResizing.bind(oTable)
		);

		oTable._disableTextSelection();
	};

	/**
	 * Drops the previous dragged horizontal splitter bar and recalculates the amount of rows to be displayed.
	 *
	 * @param {sap.ui.table.rowmodes.Interactive} oMode The interactive row mode.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	ResizeHelper.exitInteractiveResizing = function(oMode, oEvent) {
		const $Document = jQuery(document);
		const $Table = this.$();
		const $Ghost = this.$("ghost");
		const iLocationY = ResizeHelper.getEventPosition(this, oEvent).y;
		const iNewHeight = iLocationY - $Table.find(".sapUiTableCCnt").offset().top - $Ghost.height() - $Table.find(".sapUiTableFtr").height();
		const iUserDefinedRowCount = Math.floor(iNewHeight / oMode.getBaseRowHeightOfTable());
		const iNewRowCount = Math.max(1, iUserDefinedRowCount, oMode.getMinRowCount());

		oMode.setRowCount(iNewRowCount);

		$Ghost.remove();
		this.$("rzoverlay").remove();

		$Document.off("touchend.sapUiTableInteractiveResize");
		$Document.off("touchmove.sapUiTableInteractiveResize");
		$Document.off("mouseup.sapUiTableInteractiveResize");
		$Document.off("mousemove.sapUiTableInteractiveResize");

		this._enableTextSelection();
	};

	/**
	 * Handler for the move events while dragging the horizontal resize bar.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	ResizeHelper.onMouseMoveWhileInteractiveResizing = function(oEvent) {
		const iLocationY = ResizeHelper.getEventPosition(this, oEvent).y;
		const iMin = this.$().offset().top;

		if (iLocationY > iMin) {
			this.$("ghost").css("top", iLocationY + "px");
		}
	};

	// TODO: Copied from pointer extension. Maybe move this to utils.
	/**
	 * Gets the position of an event.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The event object.
	 * @returns {{x: int, y: int}} The event position.
	 */
	ResizeHelper.getEventPosition = function(oTable, oEvent) {
		const oPosition = getTouchObject(oEvent) || oEvent;

		function getTouchObject(oTouchEvent) {
			if (!oTable._isTouchEvent(oTouchEvent)) {
				return null;
			}

			const aTouchEventObjectNames = ["touches", "targetTouches", "changedTouches"];

			for (let i = 0; i < aTouchEventObjectNames.length; i++) {
				const sTouchEventObjectName = aTouchEventObjectNames[i];

				if (oEvent[sTouchEventObjectName] && oEvent[sTouchEventObjectName][0]) {
					return oEvent[sTouchEventObjectName][0];
				}
				if (oEvent.originalEvent[sTouchEventObjectName] && oEvent.originalEvent[sTouchEventObjectName][0]) {
					return oEvent.originalEvent[sTouchEventObjectName][0];
				}
			}

			return null;
		}

		return {x: oPosition.pageX, y: oPosition.pageY};
	};

	return InteractiveRowMode;
});