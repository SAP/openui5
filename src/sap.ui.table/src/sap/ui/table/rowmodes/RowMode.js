/*
 * ${copyright}
 */
sap.ui.define([
	"../utils/TableUtils",
	"sap/ui/core/Element",
	"sap/ui/core/RenderManager",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device"
], function(
	TableUtils,
	Element,
	RenderManager,
	jQuery,
	Device
) {
	"use strict";

	const _private = TableUtils.createWeakMapFacade();

	/**
	 * Constructor for a new <code>RowMode</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @abstract
	 * @class
	 * Base class for row modes.
	 * Note: Do not create subclasses.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @alias sap.ui.table.rowmodes.RowMode
	 * @since 1.119
	 * @public
	 *
	 * @author SAP SE
	 * @version ${version}
	 */
	const RowMode = Element.extend("sap.ui.table.rowmodes.RowMode", /** @lends sap.ui.table.rowmodes.RowMode.prototype */ {
		metadata: {
			library: "sap.ui.table",
			"abstract": true
		}
	});

	const TableDelegate = {};

	RowMode.prototype.init = function() {
		/*
		 * Flag indicating whether the first _rowsUpdated event after rendering was fired.
		 *
		 * @type {boolean}
		 */
		this._bFiredRowsUpdatedAfterRendering = false;

		/*
		 * Flag indicating whether the row mode is currently listening for the first _rowsUpdated event after rendering.
		 *
		 * @type {boolean}
		 */
		_private(this).bListeningForFirstRowsUpdatedAfterRendering = false;

		/*
		 * Flag indicating whether the NoData text of the table is disabled.
		 *
		 * @type {boolean}
		 */
		_private(this).bNoDataDisabled = false;

		/**
		 * Updates the table asynchronously according to the current computed row count.
		 *
		 * @private
		 */
		_private(this).updateTableAsync = TableUtils.throttle(this.updateTable.bind(this), 50, {
			asyncLeading: true
		});
	};

	RowMode.prototype.exit = function() {
		this.detachEvents();
		this.cancelAsyncOperations();
		this.deregisterHooks();
	};

	RowMode.prototype.setParent = function() {
		this.detachEvents();
		this.cancelAsyncOperations();
		this.deregisterHooks();

		Element.prototype.setParent.apply(this, arguments);

		this.attachEvents();
		this.registerHooks();
	};

	/**
	 * Adds event listeners.
	 *
	 * @private
	 */
	RowMode.prototype.attachEvents = function() {
		TableUtils.addDelegate(this.getTable(), TableDelegate, this);
	};

	/**
	 * Removes event listeners.
	 *
	 * @private
	 */
	RowMode.prototype.detachEvents = function() {
		TableUtils.removeDelegate(this.getTable(), TableDelegate);
	};

	/**
	 * Cancels scheduled asynchronous operations.
	 *
	 * @private
	 */
	RowMode.prototype.cancelAsyncOperations = function() {
		const oTable = this.getTable();

		if (oTable) {
			clearTimeout(oTable._mTimeouts.refreshRowsCreateRows);
		}

		_private(this).updateTableAsync.cancel();
	};

	/**
	 * Register to table hooks.
	 *
	 * @private
	 */
	RowMode.prototype.registerHooks = function() {
		const oTable = this.getTable();
		const Hook = TableUtils.Hook.Keys;

		TableUtils.Hook.register(oTable, Hook.Table.RowsUnbound, this._onTableRowsUnbound, this);
		TableUtils.Hook.register(oTable, Hook.Table.UpdateRows, this._onTableUpdateRows, this);
		TableUtils.Hook.register(oTable, Hook.TableRenderer.RenderTableStyles, this.applyTableStyles, this);
		TableUtils.Hook.register(oTable, Hook.TableRenderer.RenderInTableBottomArea, this.renderInTableBottomArea, this);
		TableUtils.Hook.register(oTable, Hook.TableRenderer.RenderRowContainerStyles, this.applyRowContainerStyles, this);
		TableUtils.Hook.register(oTable, Hook.TableRenderer.RenderRowStyles, this.renderRowStyles, this);
		TableUtils.Hook.register(oTable, Hook.TableRenderer.RenderCellContentStyles, this.renderCellContentStyles, this);
	};

	/**
	 * Deregister from table hooks.
	 *
	 * @private
	 */
	RowMode.prototype.deregisterHooks = function() {
		const oTable = this.getTable();
		const Hook = TableUtils.Hook.Keys;

		TableUtils.Hook.deregister(oTable, Hook.Table.RowsUnbound, this._onTableRowsUnbound, this);
		TableUtils.Hook.deregister(oTable, Hook.Table.UpdateRows, this._onTableUpdateRows, this);
		TableUtils.Hook.deregister(oTable, Hook.TableRenderer.RenderTableStyles, this.applyTableStyles, this);
		TableUtils.Hook.deregister(oTable, Hook.TableRenderer.RenderInTableBottomArea, this.renderInTableBottomArea, this);
		TableUtils.Hook.deregister(oTable, Hook.TableRenderer.RenderRowContainerStyles, this.applyRowContainerStyles, this);
		TableUtils.Hook.deregister(oTable, Hook.TableRenderer.RenderRowStyles, this.renderRowStyles, this);
		TableUtils.Hook.deregister(oTable, Hook.TableRenderer.RenderCellContentStyles, this.renderCellContentStyles, this);
	};

	/**
	 * Gets the number of contexts that should be requested at least from the rows aggregation binding of the table.
	 *
	 * @returns {int} The minimum request length
	 * @private
	 * @abstract
	 */
	RowMode.prototype.getMinRequestLength = function() {
		throwNotImplementedError(this, "getMinRequestLength");
	};

	/**
	 * Gets the computed row counts. The computed count can differ from the configured count and is the leading number when it comes to managing
	 * the rows aggregation of the table and rendering the rows.
	 * The sum of <code>scrollable</code>, <code>fixedTop</code> and <code>fixedBottom</code> is equal to <code>count</code>.
	 *
	 * @returns {{count: int, scrollable: int, fixedTop: int, fixedBottom: int}} The computed counts
	 * @private
	 * @abstract
	 */
	RowMode.prototype.getComputedRowCounts = function() {
		throwNotImplementedError(this, "getComputedRowCounts");
	};

	/**
	 * Gets the CSS styles that are applied to the table's DOM root element.
	 *
	 * @returns {{height: sap.ui.core.CSSSize?, minHeight: sap.ui.core.CSSSize?, maxHeight: sap.ui.core.CSSSize?}}
	 * The styles the table should have
	 * @private
	 * @abstract
	 */
	RowMode.prototype.getTableStyles = function() {
		throwNotImplementedError(this, "getTableStyles");
	};

	/**
	 * Gets the CSS styles that are applied to the table's bottom placeholder DOM element. This element can be used to visually reserve space for
	 * rows. If <code>undefined</code> is returned during rendering, this element will not be rendered.
	 *
	 * @returns {{height: sap.ui.core.CSSSize?}|undefined}
	 * The styles the table's bottom placeholder should have
	 * @private
	 * @abstract
	 */
	RowMode.prototype.getTableBottomPlaceholderStyles = function() {
		return undefined;
	};

	/**
	 * Gets the CSS styles that are applied to the DOM container of the rows.
	 *
	 * @returns {{height: sap.ui.core.CSSSize?, minHeight: sap.ui.core.CSSSize?, maxHeight: sap.ui.core.CSSSize?}}
	 * The styles the row container should have
	 * @private
	 * @abstract
	 */
	RowMode.prototype.getRowContainerStyles = function() {
		throwNotImplementedError(this, "getRowContainerStyles");
	};

	/**
	 * Gets the parent table.
	 *
	 * @returns {sap.ui.table.Table|null} The instance of the table or <code>null</code>.
	 * @private
	 */
	RowMode.prototype.getTable = function() {
		const oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Table") ? oParent : null;
	};

	/**
	 * Updates the table's rows aggregation according to the current computed row count, and updates the rows binding contexts.
	 *
	 * @private
	 */
	RowMode.prototype.updateTable = function(sReason /* private parameter */) {
		const oTable = this.getTable();

		if (!oTable) {
			return;
		}

		_private(this).updateTableAsync.cancel(); // Update will be performed right now.

		// Update the rows aggregation and the row's binding contexts.
		oTable._adjustFirstVisibleRowToTotalRowCount(); // TODO: Move this to Table#onBeforeRendering as soon as #renderTableRows is removed
		const bRowsAggregationChanged = this.updateTableRows();

		if (oTable._bInvalid) {
			// No need to update the DOM or fire the _rowsUpdated event if the table is about to rerender.
			return;
		}

		// Update the DOM.
		this.applyTableStyles();
		this.applyRowContainerStyles();
		this.applyTableBottomPlaceholderStyles();

		if (bRowsAggregationChanged || oTable.getRows().some(function(oRow) {
			return oRow.getDomRef() == null;
		})) {
			this.renderTableRows();
		}

		if (bRowsAggregationChanged || oTable.getRows().length > 0) {
			this.fireRowsUpdated(sReason);
		}
	};

	/**
	 * Gets the base row content height of this mode. This number is a pixel value and affects the base row height of the table.
	 * Returns 0 if this mode does not support setting the row content height.
	 *
	 * @returns {int} The base row content height in pixels.
	 * @see {@link sap.ui.table.rowmodes.RowMode#getBaseRowHeightOfTable}
	 * @private
	 */
	RowMode.prototype.getBaseRowContentHeight = function() {
		return 0;
	};

	/**
	 * Gets the base row height of the table. This number is a pixel value and serves as the base for layout and row count calculations. The table
	 * considers the base row content height of this mode. If the base row content height is 0, the table applies a default row content height.
	 * Returns 0 if this mode is not child of a table.
	 *
	 * @returns {int} The base row height in pixels.
	 * @see {@link sap.ui.table.rowmodes.RowMode#getBaseRowContentHeight}
	 * @private
	 */
	RowMode.prototype.getBaseRowHeightOfTable = function() {
		const oTable = this.getTable();
		return oTable ? oTable._getBaseRowHeight() : 0;
	};

	/**
	 * Gets the default row content height of the table. Returns 0 if this mode is not child of a table.
	 *
	 * @returns {int} The default row content height in pixels.
	 * @private
	 */
	RowMode.prototype.getDefaultRowContentHeightOfTable = function() {
		const oTable = this.getTable();
		return oTable ? oTable._getDefaultRowContentHeight() : 0;
	};

	/**
	 * Gets total row count of the table. Returns 0 if this mode is not child of a table.
	 *
	 * @returns {int} The total row count.
	 * @private
	 */
	RowMode.prototype.getTotalRowCountOfTable = function() {
		const oTable = this.getTable();
		return oTable ? oTable._getTotalRowCount() : 0;
	};

	/**
	 * This hook is called when the rows aggregation of the table is unbound.
	 *
	 * @private
	 */
	RowMode.prototype._onTableRowsUnbound = function() {
		clearTimeout(this.getTable()._mTimeouts.refreshRowsCreateRows);
		this.updateTable(TableUtils.RowsUpdateReason.Unbind);
	};

	/**
	 * This hook is called when the rows aggregation of the table is updated.
	 *
	 * @param {string} sReason The reason for the refresh.
	 * @private
	 */
	RowMode.prototype._onTableUpdateRows = function(sReason) {
		const oTable = this.getTable();

		clearTimeout(oTable._mTimeouts.refreshRowsCreateRows);
		_private(this).updateTableAsync(sReason);
	};

	/**
	 * Applies the CSS styles to the table's root DOM element. If a render manager is provided, the styles will be written to the rendering
	 * output. Otherwise, direct DOM updates will be performed.
	 *
	 * @param {sap.ui.core.RenderManager} [oRM] The render manager.
	 * @private
	 */
	RowMode.prototype.applyTableStyles = function(oRM) {
		const mTableStyles = this.getTableStyles();

		if (oRM) {
			oRM.style("height", mTableStyles.height);
			oRM.style("min-height", mTableStyles.minHeight);
			oRM.style("max-height", mTableStyles.maxHeight);
			return;
		}

		const oTable = this.getTable();
		const oTableDomRef = oTable ? oTable.getDomRef() : null;

		if (oTableDomRef) {
			oTableDomRef.style.height = mTableStyles.height;
			oTableDomRef.style.minHeight = mTableStyles.minHeight;
			oTableDomRef.style.maxHeight = mTableStyles.maxHeight;
		}
	};

	/**
	 * Applies the CSS styles to the table's bottom placeholder DOM element. If a render manager is provided, the styles will be written to the
	 * rendering output. Otherwise, direct DOM updates will be performed.
	 *
	 * @param {sap.ui.core.RenderManager} [oRM] The render manager.
	 * @private
	 */
	RowMode.prototype.applyTableBottomPlaceholderStyles = function(oRM) {
		const mPlaceholderStyles = this.getTableBottomPlaceholderStyles();

		if (oRM) {
			oRM.style("height", mPlaceholderStyles.height);
			return;
		}

		const oTable = this.getTable();
		const oPlaceholder = oTable ? oTable.getDomRef("placeholder-bottom") : null;

		if (oPlaceholder) {
			oPlaceholder.style.height = mPlaceholderStyles.height;
		}
	};

	/**
	 * Applies the CSS styles to the row container DOM element. If a render manager is provided, the styles will be written to the rendering
	 * output. Otherwise, direct DOM updates will be performed.
	 *
	 * @param {sap.ui.core.RenderManager} [oRM] The render manager.
	 * @private
	 */
	RowMode.prototype.applyRowContainerStyles = function(oRM) {
		const mRowContainerStyles = this.getRowContainerStyles();

		if (oRM) {
			oRM.style("height", mRowContainerStyles.height);
			oRM.style("min-height", mRowContainerStyles.minHeight);
			oRM.style("max-height", mRowContainerStyles.maxHeight);
			return;
		}

		const oTable = this.getTable();
		const oRowContainer = oTable ? oTable.getDomRef("tableCCnt") : null;

		if (oRowContainer) {
			oRowContainer.style.height = mRowContainerStyles.height;
			oRowContainer.style.minHeight = mRowContainerStyles.minHeight;
			oRowContainer.style.maxHeight = mRowContainerStyles.maxHeight;
		}
	};

	/**
	 * Computes standardized row counts.
	 *  - The fixed row counts are reduced to fit into the row count.
	 *    First the number of fixed bottom rows and, if that is not enough, the number of fixed top rows is reduced.
	 *  - Makes sure there is at least one scrollable row between fixed rows.
	 *  - Takes the row count constraints into account.
	 *
	 * @see #getRowCountConstraints
	 * @param {int} iCount The row count.
	 * @param {int} iFixedTop The fixed top row count.
	 * @param {int} iFixedBottom The fixed bottom row count.
	 * @returns {{count: int, scrollable: int, fixedTop: int, fixedBottom: int}} The standardized counts
	 * @private
	 */
	RowMode.prototype.computeStandardizedRowCounts = function(iCount, iFixedTop, iFixedBottom) {
		const mRowCountConstraints = this.getRowCountConstraints();

		if (mRowCountConstraints.fixedTop === true) {
			iFixedTop = 1;
		} else if (mRowCountConstraints.fixedTop === false) {
			iFixedTop = 0;
		}

		if (mRowCountConstraints.fixedBottom === true) {
			iFixedBottom = 1;
		} else if (mRowCountConstraints.fixedBottom === false) {
			iFixedBottom = 0;
		}

		iCount = Math.max(0, iCount);
		iFixedTop = Math.max(0, iFixedTop);
		iFixedBottom = Math.max(0, iFixedBottom);

		if (iFixedTop + iFixedBottom >= iCount) {
			iFixedBottom = Math.max(iFixedBottom > 0 ? 1 : 0, iFixedBottom - Math.max(0, (iFixedTop + iFixedBottom - (iCount - 1))));
			iFixedTop = Math.max(iFixedTop > 0 ? 1 : 0, iFixedTop - Math.max(0, (iFixedTop + iFixedBottom - (iCount - 1))));
		}

		if (iFixedTop + iFixedBottom >= iCount) {
			iFixedBottom = 0;
		}

		if (iFixedTop + iFixedBottom >= iCount) {
			iFixedTop = 0;
		}

		return {
			count: iCount,
			scrollable: iCount - iFixedTop - iFixedBottom,
			fixedTop: iFixedTop,
			fixedBottom: iFixedBottom
		};
	};

	/**
	 * Gets the constraints on the row counts in the table.
	 * These are soft constraints and the subclass may ignore them, for example if it does not support fixed rows.
	 *
	 * Description of the constraints:
	 * <ul>
	 *   <li>
	 *       <code>fixedTop</code>:
	 *       The value <code>true</code> means that there should be exactly one fixed top row and <code>false</code> means that fixed top rows
	 *       should be disabled. By default, there are no constraint for the fixed top rows.
	 *   </li>
	 *   <li>
	 *       <code>fixedBottom</code>:
	 *       The value <code>true</code> means that there should be exactly one fixed bottom row and <code>false</code> means that fixed bottom
	 *       rows should be disabled. By default, there are no constraint for the fixed bottom rows.
	 *   </li>
	 * </ul>
	 *
	 * @returns {{fixedTop: (boolean|undefined), fixedBottom: (boolean|undefined)}} The row count constraints
	 * @private
	 */
	RowMode.prototype.getRowCountConstraints = function() {
		// TODO: Add a type definition for a protected type "rowCountConstraints" in the library file to document the return value
		//  RowMode#getRowCountConstraints + PluginBase#setRowCountConstraints
		const oTable = this.getTable();
		return oTable ? oTable.getProperty("rowCountConstraints") || {} : {};
	};

	/**
	 * Hook to render row styles.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The render manager.
	 * @private
	 */
	RowMode.prototype.renderRowStyles = function(oRM) {};

	/**
	 * Hook to render cell content styles.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The render manager.
	 * @private
	 */
	RowMode.prototype.renderCellContentStyles = function(oRM) {};

	/**
	 * Renders something at the bottom of the table.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The render manager.
	 * @private
	 */
	RowMode.prototype.renderInTableBottomArea = function(oRM) {
		const mPlaceholderHeight = this.getTableBottomPlaceholderStyles();

		if (mPlaceholderHeight === undefined) {
			return;
		}

		oRM.openStart("div", this.getTable().getId() + "-placeholder-bottom");
		oRM.class("sapUiTablePlaceholder");
		this.applyTableBottomPlaceholderStyles(oRM);
		oRM.openEnd();
		oRM.close("div");
	};

	/**
	 * This method can be used after a binding refresh to asynchronously create rows after the data request was sent by the binding.
	 * The rows are added to the table's rows aggregation. No binding contexts are set for the rows. If the table already has rows, no action is
	 * performed.
	 *
	 * @param {int} iRowCount The number of rows to create.
	 * @private
	 */
	RowMode.prototype.initTableRowsAfterDataRequested = function(iRowCount) {
		const oTable = this.getTable();
		const oBinding = oTable.getBinding();

		clearTimeout(oTable._mTimeouts.refreshRowsCreateRows);

		if (!oBinding || iRowCount <= 0 || oTable.getRows().length > 0) {
			return;
		}

		oBinding.attachEventOnce("dataRequested", function() {
			// Create the rows while the data is requested in the background.
			// Doing it in a timeout will allow the data request to be sent before the rows get created.
			clearTimeout(oTable._mTimeouts.refreshRowsCreateRows);
			oTable._mTimeouts.refreshRowsCreateRows = setTimeout(function() {
				if (oTable.getRows().length > 0) {
					return;
				}

				const aRows = createRows(oTable, iRowCount);
				let oRow;

				for (let i = 0; i < aRows.length; i++) {
					oRow = aRows[i];
					// prevent propagation of parent binding context; else incorrect data might be requested by the model.
					oRow.setRowBindingContext(null, oTable);
					oTable.addAggregation("rows", oRow, true);
				}

				oTable._bRowAggregationInvalid = false;
			}, 0);
		});
	};

	/**
	 * Updates the rows aggregation of the table according to the current computed row count. Updates binding contexts for existing rows and sets
	 * binding contexts for new rows.
	 * The row count is ignored if the rows are not bound and the NoData overlay is enabled. In this case, the rows aggregation will be emptied.
	 *
	 * @returns {boolean} Whether the rows aggregation of the table has been changed.
	 * @private
	 */
	RowMode.prototype.updateTableRows = function() {
		const oTable = this.getTable();
		let aRows = oTable.getRows();
		let iNewNumberOfRows = this.getComputedRowCounts().count;
		let bRowsAggregationChanged = false;

		// There is no need to have rows in the aggregation if the NoData overlay is enabled and no binding is available.
		if (TableUtils.isNoDataVisible(oTable) && !oTable.getBinding()) {
			iNewNumberOfRows = 0;
		} else if (TableUtils.isVariableRowHeightEnabled(oTable) && iNewNumberOfRows > 0) {
			// TODO: Move this to VariableRowMode#getComputedRowCounts
			iNewNumberOfRows++; // Create one additional row for partial row scrolling.
		}

		// Clear the text selection if text inside rows is selected and the content is going to change, for example on scroll.
		const oRowContainer = oTable.getDomRef("tableCCnt");
		const oSelection = window.getSelection();
		if (oRowContainer && oSelection.containsNode(oRowContainer, true)) {
			oSelection.empty();
		}

		// Destroy rows if they are invalid, but keep the DOM in case the table is going to render.
		// Becomes obsolete with CPOUIFTEAMB-1379
		if (oTable._bRowAggregationInvalid) {
			bRowsAggregationChanged = aRows.length > 0;
			oTable.destroyAggregation("rows", oTable._bInvalid ? "KeepDom" : true);
			aRows = [];
		}

		if (iNewNumberOfRows === aRows.length) {
			updateBindingContextsOfRows(this, aRows);
			return bRowsAggregationChanged;
		}

		TableUtils.dynamicCall(oTable._getSyncExtension, function(oSyncExtension) {
			oSyncExtension.syncRowCount(iNewNumberOfRows);
		});

		updateRowsAggregation(this, iNewNumberOfRows);
		bRowsAggregationChanged = true;
		oTable._bRowAggregationInvalid = false;

		return bRowsAggregationChanged;
	};

	/**
	 * Renders the rows and their containers and writes the HTML to the DOM.
	 *
	 * @private
	 */
	RowMode.prototype.renderTableRows = function() {
		const oTable = this.getTable();
		const oTBody = oTable ? oTable.getDomRef("tableCCnt") : null;

		if (!oTBody) {
			return;
		}

		// make sure to call rendering event delegates even in case of DOM patching
		const oBeforeRenderingEvent = jQuery.Event("BeforeRendering");
		oBeforeRenderingEvent.setMarked("renderRows");
		oBeforeRenderingEvent.srcControl = oTable;
		oTable._handleEvent(oBeforeRenderingEvent);

		const oRM = new RenderManager().getInterface();
		const oRenderer = oTable.getRenderer();
		oRenderer.renderTableCCnt(oRM, oTable);
		oRM.flush(oTBody, false, false);
		oRM.destroy();

		// make sure to call rendering event delegates even in case of DOM patching
		const oAfterRenderingEvent = jQuery.Event("AfterRendering");
		oAfterRenderingEvent.setMarked("renderRows");
		oAfterRenderingEvent.srcControl = oTable;
		oTable._handleEvent(oAfterRenderingEvent);

		const bHasRows = oTable.getRows().length > 0;
		const oDomRef = oTable.getDomRef();
		oDomRef.querySelector(".sapUiTableCtrlBefore").setAttribute("tabindex", bHasRows ? "0" : "-1");
		oDomRef.querySelector(".sapUiTableCtrlAfter").setAttribute("tabindex", bHasRows ? "0" : "-1");

		// In Safari, minWidths do not work for td's, so the width property needs to be set on the table.
		// This does not work, when the table is in AutoRowMode and has many columns with only minWidth.
		// The width of the content table is overwritten due to a second rerendering triggered in here.
		// Therefore, the width is set of the content table is set back to be the same as the header table.
		// BCP: 2380079867
		if (Device.browser.safari) {
			const oHdrCol = document.getElementById(oTable.getId() + "-header");
			const oHdrCnt = document.getElementById(oTable.getId() + "-table");

			oHdrCnt.style.width = oHdrCol.style.width;
		}
	};

	/**
	 * Gets contexts from the table's rows aggregation binding. Requests at least as many contexts as the table has rows or as is returned
	 * by {@link RowMode#getMinRequestLength}.
	 *
	 * @param {int} [iRequestLength] The number of contexts to request.
	 * @returns {Object[]} The contexts returned from the binding.
	 * @private
	 */
	RowMode.prototype.getRowContexts = function(iRequestLength) {
		const oTable = this.getTable();
		return oTable ? oTable._getRowContexts(iRequestLength) : [];
	};

	/**
	 * Fires the <code>_rowsUpdated</code> event of the table if no update of the binding contexts of rows is to be expected.
	 * The first event after a rendering is always fired with reason "Render", regardless of the provided reason.
	 *
	 * @param {sap.ui.table.TableUtils.RowsUpdateReason} [sReason=sap.ui.table.TableUtils.RowsUpdateReason.Unknown]
	 * The reason why the rows have been updated.
	 * @private
	 */
	RowMode.prototype.fireRowsUpdated = function(sReason) {
		const oTable = this.getTable();

		if (!oTable || !oTable._bContextsAvailable) {
			return;
		}

		// The first _rowsUpdated event after rendering should be fired with reason "Render".
		if (!this._bFiredRowsUpdatedAfterRendering) {
			sReason = TableUtils.RowsUpdateReason.Render;

			if (!_private(this).bListeningForFirstRowsUpdatedAfterRendering) {
				_private(this).bListeningForFirstRowsUpdatedAfterRendering = true;

				oTable.attachEvent("_rowsUpdated", function() {
					this._bFiredRowsUpdatedAfterRendering = true;
					_private(this).bListeningForFirstRowsUpdatedAfterRendering = false;
				}.bind(this));
			}
		}

		oTable._fireRowsUpdated(sReason);
	};

	/**
	 * Disables the "NoData" text of the table. The table will no longer show this text, even if its property
	 * {@link sap.ui.table.Table#getShowNoData showNoData} is set to <code>true</code>. The text is hidden if it is currently shown. Has no effect for
	 * the text that is shown when the table has no visible columns.
	 *
	 * @private
	 */
	RowMode.prototype.disableNoData = function() {
		if (this.isNoDataDisabled()) {
			return;
		}

		_private(this).bNoDataDisabled = true;

		const oTable = this.getTable();
		if (oTable) {
			oTable.invalidate();
		}
	};

	/**
	 * Enables the "NoData" text of the table. Whether the text is shown depends on the state of the table and its
	 * {@link sap.ui.table.Table#getShowNoData showNoData} property.
	 *
	 * @private
	 */
	RowMode.prototype.enableNoData = function() {
		if (!this.isNoDataDisabled()) {
			return;
		}

		_private(this).bNoDataDisabled = false;

		const oTable = this.getTable();
		if (oTable) {
			oTable.invalidate();
		}
	};

	/**
	 * Checks whether the "NoData" text of the table is disabled.
	 *
	 * @returns {boolean} Whether the "NoData" text is disabled
	 * @private
	 */
	RowMode.prototype.isNoDataDisabled = function() {
		return _private(this).bNoDataDisabled;
	};

	/**
	 * Updates the rows aggregation of the table. Updates the binding contexts of all rows and creates new rows if required.
	 *
	 * @param {sap.ui.table.Table} oTable The table that is or will be the parent of the rows.
	 * @param {int} iNewNumberOfRows The number of rows that need to be in the aggregation.
	 */
	function updateRowsAggregation(oMode, iNewNumberOfRows) {
		const oTable = oMode.getTable();
		let aRows = oTable.getRows();

		if (aRows.length < iNewNumberOfRows) {
			// Create missing rows.
			const aNewRows = createRows(oTable, iNewNumberOfRows - aRows.length);

			aRows = aRows.concat(aNewRows);

			// Set the binding context before adding the new rows to the aggregation to avoid double propagation.
			updateBindingContextsOfRows(oMode, aRows);

			aNewRows.forEach(function(oNewRow) {
				oTable.addAggregation("rows", oNewRow, true);
			});
		} else {
			// Remove rows that are not required.
			for (let i = aRows.length - 1; i >= iNewNumberOfRows; i--) {
				oTable.removeAggregation("rows", i, true);
			}

			aRows.splice(iNewNumberOfRows);
			updateBindingContextsOfRows(oMode, aRows);
		}
	}

	/**
	 * Creates and returns the specified amount of rows.
	 *
	 * @param {sap.ui.table.Table} oTable The table that will be the parent of the rows.
	 * @param {int} iRowCount The number of rows to create.
	 * @returns {sap.ui.table.Row[]} The created rows.
	 */
	function createRows(oTable, iRowCount) {
		const aRows = [];
		const iStartIndex = oTable.getRows().length;

		for (let i = 0; i < iRowCount; i++) {
			aRows.push(oTable._getRowClone(iStartIndex + i));
		}

		return aRows;
	}

	/**
	 * Updates binding contexts of the rows. The rows passed to this method must either be already in the rows aggregation of the table, or are
	 * about to be added there. Also, they must be in the order as they are, or will be, in the aggregation.
	 *
	 * @param {sap.ui.table.rowmodes.RowMode} oMode The row mode that is associated with the table that is or will be the parent of the rows.
	 * @param {Array<sap.ui.table.Row>} [aRows] The rows for which the contexts are to be updated.
	 */
	function updateBindingContextsOfRows(oMode, aRows) {
		const oTable = oMode.getTable();

		if (!oTable || aRows.length === 0) {
			return;
		}

		const aContexts = oMode.getRowContexts(aRows.length);

		for (let i = 0; i < aRows.length; i++) {
			aRows[i].setRowBindingContext(aContexts[i], oTable);
		}
	}

	function throwNotImplementedError(oPlugin, sFunctionName) {
		throw new Error(oPlugin + ": sap.ui.table.rowmodes.RowMode subclass does not implement #" + sFunctionName);
	}

	/**
	 * @this sap.ui.table.rowmodes.RowMode
	 */
	TableDelegate.onBeforeRendering = function(oEvent) {
		const bRenderedRows = oEvent && oEvent.isMarked("renderRows");

		if (!bRenderedRows) {
			this._bFiredRowsUpdatedAfterRendering = false;
			this.updateTable(TableUtils.RowsUpdateReason.Render);
		}
	};

	return RowMode;
});