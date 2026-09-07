/*
 * ${copyright}
 */
sap.ui.define([
	"../utils/TableUtils",
	"./RowMode",
	"sap/ui/Device"
], function(
	TableUtils,
	RowMode,
	Device
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
			/**
			 * @deprecated As of version 1.119
			 */
			Object.defineProperty(this, "bLegacy", {
				value: typeof sId === "boolean" ? sId : false
			});

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

		_private(this).iRowCountAdjustmentIntervalId = null;
		_private(this).iLastAvailableSpace = 0;
		_private(this).rowCount = -1;

		/*
		 * Flag indicating whether the table is a CSS flex item. It is a flex item if the parent of the table has the style "display: flex".
		 * The value is initialized and updated asynchronously after rendering.
		 *
		 * @type {boolean}
		 */
		_private(this).bTableIsFlexItem = false;

		this.adjustRowCountToAvailableSpace = TableUtils.throttleFrameWise(adjustRowCountToAvailableSpace);
	};

	AutoRowMode.prototype.attachEvents = function() {
		RowMode.prototype.attachEvents.apply(this, arguments);
		TableUtils.addDelegate(this.getTable(), TableDelegate, this);
	};

	AutoRowMode.prototype.detachEvents = function() {
		RowMode.prototype.detachEvents.apply(this, arguments);
		this.getTable()?.removeEventDelegate(TableDelegate);
	};

	AutoRowMode.prototype.cancelAsyncOperations = function() {
		RowMode.prototype.cancelAsyncOperations.apply(this, arguments);
		clearInterval(_private(this).iRowCountAdjustmentIntervalId);
		_private(this).iRowCountAdjustmentIntervalId = null;
		this.adjustRowCountToAvailableSpace.cancel();
	};

	AutoRowMode.prototype.registerHooks = function() {
		RowMode.prototype.registerHooks.apply(this, arguments);
		TableUtils.Hook.register(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
	};

	AutoRowMode.prototype.deregisterHooks = function() {
		RowMode.prototype.deregisterHooks.apply(this, arguments);
		TableUtils.Hook.deregister(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
	};

	AutoRowMode.prototype.getFixedTopRowCount = function() {
		/**
		 * @deprecated As of version 1.119
		 */
		if (this.bLegacy) {
			const oTable = this.getTable();
			return oTable ? oTable.getFixedRowCount() : 0;
		}

		return this.getProperty("fixedTopRowCount");
	};

	AutoRowMode.prototype.getFixedBottomRowCount = function() {
		/**
		 * @deprecated As of version 1.119
		 */
		if (this.bLegacy) {
			const oTable = this.getTable();
			return oTable ? oTable.getFixedBottomRowCount() : 0;
		}

		return this.getProperty("fixedBottomRowCount");
	};

	AutoRowMode.prototype.getMinRowCount = function() {
		/**
		 * @deprecated As of version 1.119
		 */
		if (this.bLegacy) {
			const oTable = this.getTable();
			return oTable ? oTable.getMinAutoRowCount() : 0;
		}

		return this.getProperty("minRowCount");
	};

	AutoRowMode.prototype.getRowContentHeight = function() {
		/**
		 * @deprecated As of version 1.119
		 */
		if (this.bLegacy) {
			const oTable = this.getTable();
			return oTable ? oTable.getRowHeight() : 0;
		}

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
			oRM.style("max-height", iRowContentHeight - 1 + "px");
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

	function adjustRowCountToAvailableSpace() {
		const oTable = this.getTable();
		const oTableDomRef = oTable.getDomRef();

		if (!oTableDomRef || oTableDomRef.scrollHeight === 0 || !TableUtils.isThemeApplied()) {
			return;
		}

		const iNewHeight = this.determineAvailableSpace();
		const iOldConfiguredRowCount = this.getConfiguredRowCount();
		const iNewRowCount = Math.floor(iNewHeight / getRowHeight(this));
		const iOldComputedRowCount = this.getComputedRowCounts().count;

		_private(this).bTableIsFlexItem = window.getComputedStyle(oTableDomRef.parentNode).display === "flex";
		_private(this).rowCount = iNewRowCount;

		const iNewComputedRowCount = this.getComputedRowCounts().count;

		/**
		 * @deprecated As of version 1.119
		 */
		if (this.bLegacy) {
			oTable.setProperty("visibleRowCount", iNewComputedRowCount, true);
		}

		if (iOldComputedRowCount !== iNewComputedRowCount || this.getHideEmptyRows() && iOldConfiguredRowCount !== this.getConfiguredRowCount()) {
			this.invalidate();
		}
	}

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
		const oReferenceElementStyle = window.getComputedStyle(oReferenceElement);
		const iNewAvailableSpace = Math.max(0, Math.floor(
			parseFloat(oReferenceElementStyle.height)
			- parseFloat(oReferenceElementStyle.paddingTop)
			- parseFloat(oReferenceElementStyle.paddingBottom)
			- iUsedHeight
		));
		const iAvailableSpaceDifference = Math.abs(iNewAvailableSpace - _private(this).iLastAvailableSpace);

		if (iAvailableSpaceDifference >= 5) {
			_private(this).iLastAvailableSpace = iNewAvailableSpace;
		}

		return _private(this).iLastAvailableSpace;
	};

	TableDelegate.onBeforeRendering = function() {
		if (!this.getParent().getDomRef()) {
			this.adjustRowCountToAvailableSpace(); // Adjustment is done in an rAF callback
		}
	};

	/**
	 * @param {sap.ui.base.Event} oEvent The event object of the <code>afterRendering</code> event
	 * @this sap.ui.table.rowmodes.Auto
	 */
	TableDelegate.onAfterRendering = function() {
		_private(this).iRowCountAdjustmentIntervalId ??= setInterval(() => {
			this.adjustRowCountToAvailableSpace();
		}, 200);
	};

	function isRowCountInitial(oRowMode) {
		return _private(oRowMode).rowCount === -1;
	}

	return AutoRowMode;
});