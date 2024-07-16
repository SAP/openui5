/*
 * ${copyright}
 */
sap.ui.define([
	"../utils/TableUtils",
	"./RowMode",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function(
	TableUtils,
	RowMode,
	Device,
	jQuery
) {
	"use strict";

	const _private = TableUtils.createWeakMapFacade();

	/**
	 * Constructor for a new <code>Auto</code> row mode.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The number of rows displayed in the table is calculated based on the space it is allowed to cover (limited by the surrounding container).
	 * The table must be rendered without siblings in the DOM. The only exception is if the table's parent element is a flexbox, and the table is a
	 * flex item allowed to grow and shrink.
	 * The number of rows to be displayed can only be determined after the layout has been completed. The data can already be requested before that.
	 * To avoid multiple data requests, the amount of initially requested data is based on the maximum number of potentially displayed rows,
	 * which takes the window size into consideration, for example.
	 * @extends sap.ui.table.rowmodes.RowMode
	 * @constructor
	 * @alias sap.ui.table.rowmodes.Auto
	 * @since 1.119
	 * @public
	 *
	 * @author SAP SE
	 * @version ${version}
	 */
	const AutoRowMode = RowMode.extend("sap.ui.table.rowmodes.Auto", /** @lends sap.ui.table.rowmodes.Auto.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * The minimum number of displayed rows.
				 */
				minRowCount: {type: "int", defaultValue: 5, group: "Appearance"},
				/**
				 * The maximum number of displayed rows. The <code>minRowCount</code> is ignored if the maximum is lower than the minimum.
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
				rowContentHeight: {type: "int", defaultValue: 0, group: "Appearance"},
				/**
				 * Whether to hide empty rows.
				 *
				 * @private
				 * @ui5-private sap.ui.mdc.Table
				 */
				hideEmptyRows: {type: "boolean", defaultValue: false, group: "Appearance", visibility: "hidden"}
			}
		},
		constructor: function(sId) {
			RowMode.apply(this, arguments);
		}
	});

	const TableDelegate = {};

	// TODO: This function can be removed and replaced with #getBaseRowHeightOfTable once the table is changed to a div-based layout.
	function getRowHeight(oRowMode) {
		const oTable = oRowMode.getTable();
		const oRowContainer = oTable ? oTable.getDomRef("tableCCnt") : null;

		if (oRowContainer && Device.browser.chrome && window.devicePixelRatio !== 1) {
			// Because of a bug in the zoom algorithm of Chrome, the actual height of a DOM element can be different
			// to what is set in inline styles or CSS. Therefore, we need to get the height of a row from the DOM.
			const oTableElement = document.createElement("table");
			const oRowElement = oTableElement.insertRow();
			const iRowContentHeight = oRowMode.getRowContentHeight();

			oTableElement.classList.add("sapUiTableCtrl");
			oRowElement.classList.add("sapUiTableTr");

			if (iRowContentHeight > 0) {
				oRowElement.style.height = oRowMode.getBaseRowHeightOfTable() + "px";
			}

			oRowContainer.appendChild(oTableElement);
			const nRowHeight = oRowElement.getBoundingClientRect().height;
			oRowContainer.removeChild(oTableElement);

			return nRowHeight;
		} else {
			return oRowMode.getBaseRowHeightOfTable();
		}
	}

	AutoRowMode.prototype.init = function() {
		RowMode.prototype.init.apply(this, arguments);

		_private(this).iPendingStartTableUpdateSignals = 0;
		_private(this).bRowCountAutoAdjustmentActive = false;
		_private(this).iLastAvailableSpace = 0;
		_private(this).rowCount = -1;

		/*
		 * Flag indicating whether the table is a CSS flex item.
		 *   - The parent of the table has the style "display: flex"
		 *
		 * Do not use for rendering! It is set/updated asynchronously after rendering.
		 *
		 * @type {boolean}
		 */
		_private(this).bTableIsFlexItem = false;

		/**
		 * Asynchronously calculates and applies the row count based on the available vertical space.
		 *
		 * @param {sap.ui.table.utils.TableUtils.RowsUpdateReason} sReason The reason for updating the rows.
		 * @param {boolean} [bStartAutomaticAdjustment=false] Whether to start automatic row count adjustment by attaching a resize handler after
		 * adjusting the row count.
		 * @private
		 */
		_private(this).adjustRowCountToAvailableSpaceAsync = TableUtils.throttleFrameWise(this.adjustRowCountToAvailableSpace.bind(this));
	};

	AutoRowMode.prototype.attachEvents = function() {
		RowMode.prototype.attachEvents.apply(this, arguments);
		TableUtils.addDelegate(this.getTable(), TableDelegate, this);
	};

	AutoRowMode.prototype.detachEvents = function() {
		RowMode.prototype.detachEvents.apply(this, arguments);
		TableUtils.removeDelegate(this.getTable(), TableDelegate);
	};

	AutoRowMode.prototype.cancelAsyncOperations = function() {
		RowMode.prototype.cancelAsyncOperations.apply(this, arguments);
		this.stopAutoRowMode();
	};

	AutoRowMode.prototype.registerHooks = function() {
		RowMode.prototype.registerHooks.apply(this, arguments);
		TableUtils.Hook.register(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
		TableUtils.Hook.register(this.getTable(), TableUtils.Hook.Keys.Table.UpdateSizes, this._onUpdateTableSizes, this);
	};

	AutoRowMode.prototype.deregisterHooks = function() {
		RowMode.prototype.deregisterHooks.apply(this, arguments);
		TableUtils.Hook.deregister(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
		TableUtils.Hook.deregister(this.getTable(), TableUtils.Hook.Keys.Table.UpdateSizes, this._onUpdateTableSizes, this);
	};

	AutoRowMode.prototype.getFixedTopRowCount = function() {
		return this.getProperty("fixedTopRowCount");
	};

	AutoRowMode.prototype.getFixedBottomRowCount = function() {
		return this.getProperty("fixedBottomRowCount");
	};

	AutoRowMode.prototype.getMinRowCount = function() {
		return this.getProperty("minRowCount");
	};

	AutoRowMode.prototype.getRowContentHeight = function() {
		return this.getProperty("rowContentHeight");
	};

	AutoRowMode.prototype.setHideEmptyRows = function(bHideEmptyRows) {
		this.setProperty("hideEmptyRows", bHideEmptyRows);

		if (bHideEmptyRows) {
			this.disableNoData();
		} else {
			this.enableNoData();
		}

		return this;
	};

	AutoRowMode.prototype.getHideEmptyRows = function() {
		return this.getProperty("hideEmptyRows");
	};

	/**
	 * Gets the real minimum row count, considering the maximum row count.
	 *
	 * @returns {int} The minimum row count.
	 * @private
	 */
	AutoRowMode.prototype._getMinRowCount = function() {
		const iMinRowCount = this.getMinRowCount();
		const iMaxRowCount = this.getMaxRowCount();

		if (iMaxRowCount >= 0) {
			return Math.min(iMinRowCount, iMaxRowCount);
		} else {
			return iMinRowCount;
		}
	};

	AutoRowMode.prototype.getMinRequestLength = function() {
		const oTable = this.getTable();
		let iRequestLength = this.getConfiguredRowCount();

		if (isRowCountInitial(this) || (oTable && !oTable._bContextsAvailable)) {
			// Due to the dynamic nature of this mode, the requests during initialization of the table's rows or rows binding should consider the
			// screen height to avoid multiple requests in case the height available for the table increases. This can happen, for example, during
			// the startup phase of an application.
			const iEstimatedMaxRowCount = Math.ceil(Device.resize.height / TableUtils.DefaultRowHeight.sapUiSizeCondensed);
			iRequestLength = Math.max(iRequestLength, iEstimatedMaxRowCount);
		}

		return iRequestLength;
	};

	AutoRowMode.prototype.updateTable = function() {
		if (this.getHideEmptyRows() && this.getComputedRowCounts().count === 0) {
			const iConfiguredRowCount = this.getConfiguredRowCount();

			if (iConfiguredRowCount > 0) {
				this.getRowContexts(iConfiguredRowCount);
			}
		}

		return RowMode.prototype.updateTable.apply(this, arguments);
	};

	AutoRowMode.prototype.getComputedRowCounts = function() {
		if (isRowCountInitial(this)) {
			// The actual row count is only known after rendering, when the row count was first determined and set.
			return {
				count: 0,
				scrollable: 0,
				fixedTop: 0,
				fixedBottom: 0
			};
		}

		let iRowCount = this.getConfiguredRowCount();
		const iFixedTopRowCount = this.getFixedTopRowCount();
		const iFixedBottomRowCount = this.getFixedBottomRowCount();

		if (this.getHideEmptyRows()) {
			iRowCount = Math.min(iRowCount, this.getTotalRowCountOfTable());
		}

		return this.computeStandardizedRowCounts(iRowCount, iFixedTopRowCount, iFixedBottomRowCount);
	};

	AutoRowMode.prototype.getTableStyles = function() {
		let sHeight = "0px"; // The table's DOM parent needs to be able to shrink.

		if (isRowCountInitial(this)) {
			sHeight = "auto";
		} else {
			const iRowCount = this.getConfiguredRowCount();

			if (iRowCount === 0 || iRowCount === this._getMinRowCount()) {
				sHeight = "auto";
			}
		}

		return {
			height: sHeight
		};
	};

	AutoRowMode.prototype.getTableBottomPlaceholderStyles = function() {
		if (!this.getHideEmptyRows()) {
			return undefined;
		}

		let iRowCountDelta;

		if (isRowCountInitial(this)) {
			iRowCountDelta = this._getMinRowCount();
		} else {
			iRowCountDelta = this.getConfiguredRowCount() - this.getComputedRowCounts().count;
		}

		return {
			height: iRowCountDelta * this.getBaseRowHeightOfTable() + "px"
		};
	};

	AutoRowMode.prototype.getRowContainerStyles = function() {
		return {
			height: this.getComputedRowCounts().count * Math.max(this.getBaseRowHeightOfTable(), getRowHeight(this)) + "px"
		};
	};

	AutoRowMode.prototype.renderRowStyles = function(oRM) {
		const iRowContentHeight = this.getRowContentHeight();

		if (iRowContentHeight > 0) {
			oRM.style("height", this.getBaseRowHeightOfTable() + "px");
		}
	};

	AutoRowMode.prototype.renderCellContentStyles = function(oRM) {
		let iRowContentHeight = this.getRowContentHeight();

		if (iRowContentHeight <= 0) {
			iRowContentHeight = this.getDefaultRowContentHeightOfTable();
		}

		if (iRowContentHeight > 0) {
			oRM.style("max-height", iRowContentHeight + "px");
		}
	};

	AutoRowMode.prototype.getBaseRowContentHeight = function() {
		return Math.max(0, this.getRowContentHeight());
	};

	/**
	 * This hook is called when the rows aggregation of the table is refreshed.
	 *
	 * @private
	 */
	AutoRowMode.prototype._onTableRefreshRows = function() {
		// The computed row count cannot be used here, because the table's total row count (binding length) is not known yet.
		const iConfiguredRowCount = this.getConfiguredRowCount();

		if (iConfiguredRowCount > 0) {
			if (!isRowCountInitial(this)) {
				this.initTableRowsAfterDataRequested(iConfiguredRowCount);
			}
			this.getRowContexts(iConfiguredRowCount); // Trigger data request.
		}
	};

	/**
	 * Gets the row count as configured with the <code>minRowCount</code> and <code>maxRowCount</code> properties.
	 *
	 * @returns {int} The configured row count.
	 * @private
	 */
	AutoRowMode.prototype.getConfiguredRowCount = function() {
		let iRowCount = Math.max(0, this.getMinRowCount(), _private(this).rowCount);
		const iMaxRowCount = this.getMaxRowCount();

		if (iMaxRowCount >= 0) {
			iRowCount = Math.min(iRowCount, iMaxRowCount);
		}

		return iRowCount;
	};

	/**
	 * Starts the automatic row count mode. An initial row count adjustment is performed. A resize listener then detects height changes. When this
	 * occurs, the row count is also adjusted. The row count is calculated and applied based on the available vertical space.
	 *
	 * @private
	 */
	AutoRowMode.prototype.startAutoRowMode = function() {
		_private(this).adjustRowCountToAvailableSpaceAsync(TableUtils.RowsUpdateReason.Render, true);
	};

	/**
	 * Stops the automatic row count mode.
	 *
	 * @private
	 */
	AutoRowMode.prototype.stopAutoRowMode = function() {
		this.deregisterResizeHandler();
		_private(this).adjustRowCountToAvailableSpaceAsync.cancel();
		_private(this).bRowCountAutoAdjustmentActive = false;
		signalEndTableUpdate(this);
	};

	/**
	 * Registers a resize handler on the table or the DOM parent of the table.
	 *
	 * @param {boolean} [bOnTableParent=false] Whether to register the resize handler on the DOM parent of the table.
	 * @private
	 */
	AutoRowMode.prototype.registerResizeHandler = function(bOnTableParent) {
		const oTable = this.getTable();

		if (oTable) {
			TableUtils.registerResizeHandler(oTable, "AutoRowMode", this.onResize.bind(this), null, bOnTableParent === true);
			TableUtils.registerResizeHandler(oTable, "AutoRowMode-BeforeTable", this.onResize.bind(this), "before");
			TableUtils.registerResizeHandler(oTable, "AutoRowMode-AfterTable", this.onResize.bind(this), "after");
		}
	};

	/**
	 * Deregisters the resize handler.
	 *
	 * @private
	 */
	AutoRowMode.prototype.deregisterResizeHandler = function() {
		const oTable = this.getTable();

		if (oTable) {
			TableUtils.deregisterResizeHandler(oTable, ["AutoRowMode, AutoRowMode-BeforeTable, AutoRowMode-AfterTable"]);
		}
	};

	/**
	 * Resize handler.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	AutoRowMode.prototype.onResize = function(oEvent) {
		const iOldHeight = oEvent.oldSize.height;
		const iNewHeight = oEvent.size.height;

		if (iOldHeight !== iNewHeight) {
			signalStartTableUpdate(this);
			_private(this).adjustRowCountToAvailableSpaceAsync(TableUtils.RowsUpdateReason.Resize);
		}
	};

	/**
	 * This hook is called when the table layout is updated, for example when resizing.
	 *
	 * @param {sap.ui.table.utils.TableUtils.RowsUpdateReason} sReason The reason for updating the table sizes.
	 * @private
	 */
	AutoRowMode.prototype._onUpdateTableSizes = function(sReason) {
		// Resize and render are handled elsewhere.
		if (sReason === TableUtils.RowsUpdateReason.Resize || sReason === TableUtils.RowsUpdateReason.Render) {
			return;
		}

		if (_private(this).bRowCountAutoAdjustmentActive) {
			signalStartTableUpdate(this);
			_private(this).adjustRowCountToAvailableSpaceAsync(sReason);
		}
	};

	/**
	 * Calculates and applies the row count based on the available vertical space.
	 *
	 * @param {sap.ui.table.utils.TableUtils.RowsUpdateReason} sReason The reason for updating the rows.
	 * @param {boolean} [bStartAutomaticAdjustment=false] Whether to start automatic row count adjustment by attaching a resize handler after
	 * adjusting the row count.
	 * @private
	 */
	AutoRowMode.prototype.adjustRowCountToAvailableSpace = function(sReason, bStartAutomaticAdjustment) {
		bStartAutomaticAdjustment = bStartAutomaticAdjustment === true;

		const oTable = this.getTable();
		const oTableDomRef = oTable ? oTable.getDomRef() : null;

		if (!oTable || oTable._bInvalid || !oTableDomRef || !TableUtils.isThemeApplied()) {
			signalEndTableUpdate(this);
			return;
		}

		_private(this).bTableIsFlexItem = window.getComputedStyle(oTableDomRef.parentNode).display === "flex";

		// If the table is invisible, it might get visible without re-rendering, which is basically the same as a resize.
		// We need to react on that, but not adjust the row count now.
		if (oTableDomRef.scrollHeight === 0) {
			if (bStartAutomaticAdjustment) {
				this.registerResizeHandler(!_private(this).bTableIsFlexItem);
				_private(this).bRowCountAutoAdjustmentActive = true;
			}
			signalEndTableUpdate(this);
			return;
		}

		const iNewHeight = this.determineAvailableSpace();
		const oOldRowCount = this.getConfiguredRowCount();
		const iNewRowCount = Math.floor(iNewHeight / getRowHeight(this));
		const iOldComputedRowCount = this.getComputedRowCounts().count;

		_private(this).rowCount = iNewRowCount;
		const iNewComputedRowCount = this.getComputedRowCounts().count;

		if (iOldComputedRowCount !== iNewComputedRowCount) {
			this.updateTable(sReason);
		} else {
			// TODO: The check for reason=Zoom can be removed once the table is changed to a div-based layout.
			if (oOldRowCount !== iNewRowCount || sReason === TableUtils.RowsUpdateReason.Zoom) {
				this.applyTableStyles();
				this.applyRowContainerStyles();
				this.applyTableBottomPlaceholderStyles();
			}

			if (!this._bFiredRowsUpdatedAfterRendering && oTable.getRows().length > 0) {
				// Even if the row count does not change, the rows updated event still needs to be fired after rendering.
				this.fireRowsUpdated(sReason);
			}
		}

		if (bStartAutomaticAdjustment) {
			this.registerResizeHandler(!_private(this).bTableIsFlexItem);
			_private(this).bRowCountAutoAdjustmentActive = true;
		}

		signalEndTableUpdate(this);
	};

	/**
	 * Determines the vertical space available for the rows.
	 *
	 * @returns {int} The available space.
	 * @private
	 */
	AutoRowMode.prototype.determineAvailableSpace = function() {
		const oTable = this.getTable();
		const oTableDomRef = oTable ? oTable.getDomRef() : null;
		const oRowContainer = oTable ? oTable.getDomRef("tableCCnt") : null;
		const oPlaceholder = oTable ? oTable.getDomRef("placeholder-bottom") : null;

		if (!oTableDomRef || !oRowContainer || !oTableDomRef.parentNode) {
			return 0;
		}

		let iUsedHeight = 0;
		const iRowContainerHeight = oRowContainer.clientHeight;
		const iPlaceholderHeight = oPlaceholder ? oPlaceholder.clientHeight : 0;

		if (_private(this).bTableIsFlexItem) {
			const aChildNodes = oTableDomRef.childNodes;
			for (let i = 0; i < aChildNodes.length; i++) {
				iUsedHeight += aChildNodes[i].offsetHeight;
			}
			iUsedHeight -= iRowContainerHeight - iPlaceholderHeight;
		} else {
			iUsedHeight = oTableDomRef.scrollHeight - iRowContainerHeight - iPlaceholderHeight;
		}

		// For simplicity always add the default height of the horizontal scrollbar to the used height, even if it will not be visible.
		const oScrollExtension = oTable._getScrollExtension();
		if (!oScrollExtension.isHorizontalScrollbarVisible()) {
			const mDefaultScrollbarHeight = {};
			mDefaultScrollbarHeight[Device.browser.BROWSER.CHROME] = 16;
			mDefaultScrollbarHeight[Device.browser.BROWSER.FIREFOX] = 16;
			mDefaultScrollbarHeight[Device.browser.BROWSER.SAFARI] = 16;
			mDefaultScrollbarHeight[Device.browser.BROWSER.ANDROID] = 8;
			iUsedHeight += mDefaultScrollbarHeight[Device.browser.name];
		}

		const oReferenceElement = _private(this).bTableIsFlexItem ? oTableDomRef : oTableDomRef.parentNode;
		const iNewAvailableSpace = Math.max(0, Math.floor(jQuery(oReferenceElement).height() - iUsedHeight));
		const iAvailableSpaceDifference = Math.abs(iNewAvailableSpace - _private(this).iLastAvailableSpace);

		if (iAvailableSpaceDifference >= 5) {
			_private(this).iLastAvailableSpace = iNewAvailableSpace;
		}

		return _private(this).iLastAvailableSpace;
	};

	/**
	 * @this sap.ui.table.rowmodes.Auto
	 */
	TableDelegate.onBeforeRendering = function(oEvent) {
		const bRenderedRows = oEvent && oEvent.isMarked("renderRows");

		if (!bRenderedRows) {
			this.stopAutoRowMode();
		}
	};

	/**
	 * @this sap.ui.table.rowmodes.Auto
	 */
	TableDelegate.onAfterRendering = function(oEvent) {
		const bRenderedRows = oEvent && oEvent.isMarked("renderRows");

		if (!bRenderedRows) {
			this.startAutoRowMode();
		}
	};

	function signalStartTableUpdate(oRowMode) {
		_private(oRowMode).iPendingStartTableUpdateSignals++;
		TableUtils.Hook.call(oRowMode.getTable(), TableUtils.Hook.Keys.Signal, "StartTableUpdate");
	}

	function signalEndTableUpdate(oRowMode) {
		for (let i = 0; i < _private(oRowMode).iPendingStartTableUpdateSignals; i++) {
			TableUtils.Hook.call(oRowMode.getTable(), TableUtils.Hook.Keys.Signal, "EndTableUpdate");
		}
		_private(oRowMode).iPendingStartTableUpdateSignals = 0;
	}

	function isRowCountInitial(oRowMode) {
		return _private(oRowMode).rowCount === -1;
	}

	return AutoRowMode;
});