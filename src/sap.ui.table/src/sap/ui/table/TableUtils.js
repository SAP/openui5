/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableUtils.
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/library",
	"sap/ui/model/ChangeReason",
	"./TableGrouping",
	"./TableColumnUtils",
	"./TableMenuUtils",
	"./TableBindingUtils",
	"./library",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(
	BaseObject,
	Control,
	ResizeHandler,
	coreLibrary,
	ChangeReason,
	TableGrouping,
	TableColumnUtils,
	TableMenuUtils,
	TableBindingUtils,
	library,
	Log,
	jQuery
) {
	"use strict";

	// Shortcuts
	var SelectionBehavior = library.SelectionBehavior;
	var SelectionMode = library.SelectionMode;
	var MessageType = coreLibrary.MessageType;

	/**
	 * The resource bundle of the sap.ui.table library.
	 * @type {jQuery.sap.util.ResourceBundle}
	 */
	var oResourceBundle;

	/**
	 * Table cell type.
	 *
	 * @type {sap.ui.table.TableUtils.CellType}
	 * @static
	 * @constant
	 * @typedef {Object} sap.ui.table.TableUtils.CellType
	 * @property {int} DATACELL - Data cell.
	 * @property {int} COLUMNHEADER - Column header cell.
	 * @property {int} ROWHEADER - Row header cell.
	 * @property {int} ROWACTION - Row action cell.
	 * @property {int} COLUMNROWHEADER - SelectAll cell.
	 * @property {int} ANYCONTENTCELL - Any cell of a row in the table content area (table body).
	 * @property {int} ANYCOLUMNHEADER - Any cell of a row in the table header area (table head).
	 * @property {int} ANYROWHEADER - Any row header cell (including the SelectAll cell).
	 * @property {int} ANY - Any table cell.
	 */
	var CELLTYPE = {
		DATACELL: 1, // Standard data cell (standard, group or sum)
		COLUMNHEADER: 2, // Column header
		ROWHEADER: 4, // Row header (standard, group or sum)
		ROWACTION: 8, // Row action (standard, group or sum)
		COLUMNROWHEADER: 16 // Select all row selector (top left cell)
	};
	CELLTYPE.ANYCONTENTCELL = CELLTYPE.ROWHEADER | CELLTYPE.DATACELL | CELLTYPE.ROWACTION;
	CELLTYPE.ANYCOLUMNHEADER = CELLTYPE.COLUMNHEADER | CELLTYPE.COLUMNROWHEADER;
	CELLTYPE.ANYROWHEADER = CELLTYPE.ROWHEADER | CELLTYPE.COLUMNROWHEADER;
	CELLTYPE.ANY = CELLTYPE.ANYCONTENTCELL | CELLTYPE.ANYCOLUMNHEADER;

	/**
	 * The horizontal frame size of a row in pixels. This is the height of a row excluding the content height.
	 *
	 * @type {int}
	 * @static
	 * @constant
	 */
	var ROW_HORIZONTAL_FRAME_SIZE = 1; /* 1px border */

	/**
	 * The default row content heights in pixels for the different content densities.
	 *
	 * @type {sap.ui.table.TableUtils.DefaultRowContentHeight}
	 * @static
	 * @constant
	 * @typedef {Object} sap.ui.table.TableUtils.DefaultRowContentHeight
	 * @property {int} sapUiSizeCondensed - The default content height of a row in pixels in condensed content density.
	 * @property {int} sapUiSizeCompact - The default content height of a row in pixels in compact content density.
	 * @property {int} sapUiSizeCozy - The default content height of a row in pixels in cozy content density.
	 * @property {int} undefined - The default content height of a row in pixels in case no content density information is available.
	 */
	var DEFAULT_ROW_CONTENT_HEIGHT = {
		sapUiSizeCozy: 48,
		sapUiSizeCompact: 32,
		sapUiSizeCondensed: 24,
		undefined: 32
	};

	/**
	 * The default row heights in pixels for the different content densities.
	 *
	 * @type {sap.ui.table.TableUtils.DefaultRowHeight}
	 * @static
	 * @constant
	 * @typedef {Object} sap.ui.table.TableUtils.DefaultRowHeight
	 * @property {int} sapUiSizeCondensed - The default height of a row in pixels in condensed content density.
	 * @property {int} sapUiSizeCompact - The default height of a row in pixels in compact content density.
	 * @property {int} sapUiSizeCozy - The default height of a row in pixels in cozy content density.
	 * @property {int} undefined - The default height of a row in pixels in case no content density information is available.
	 */
	var DEFAULT_ROW_HEIGHT = {
		sapUiSizeCozy: DEFAULT_ROW_CONTENT_HEIGHT.sapUiSizeCozy + ROW_HORIZONTAL_FRAME_SIZE,
		sapUiSizeCompact: DEFAULT_ROW_CONTENT_HEIGHT.sapUiSizeCompact + ROW_HORIZONTAL_FRAME_SIZE,
		sapUiSizeCondensed: DEFAULT_ROW_CONTENT_HEIGHT.sapUiSizeCondensed + ROW_HORIZONTAL_FRAME_SIZE,
		undefined: DEFAULT_ROW_CONTENT_HEIGHT.undefined + ROW_HORIZONTAL_FRAME_SIZE
	};

	/**
	 * Reason for updates of the rows. Inherits from {@link sap.ui.model.ChangeReason}.
	 *
	 * @type {sap.ui.table.TableUtils.ROWS_UPDATE_REASON}
	 * @static
	 * @constant
	 * @typedef {Object} sap.ui.table.TableUtils.ROWS_UPDATE_REASON
	 * @property {string} Sort - {@link sap.ui.model.ChangeReason.Sort}
	 * @property {string} Filter - {@link sap.ui.model.ChangeReason.Filter}
	 * @property {string} Change - {@link sap.ui.model.ChangeReason.Change}
	 * @property {string} Context - {@link sap.ui.model.ChangeReason.Context}
	 * @property {string} Refresh - {@link sap.ui.model.ChangeReason.Refresh}
	 * @property {string} Expand - {@link sap.ui.model.ChangeReason.Expand}
	 * @property {string} Collapse - {@link sap.ui.model.ChangeReason.Collapse}
	 * @property {string} Remove - {@link sap.ui.model.ChangeReason.Remove}
	 * @property {string} Add - {@link sap.ui.model.ChangeReason.Add}
	 * @property {string} Binding - {@link sap.ui.model.ChangeReason.Binding}
	 * @property {string} Render - The table has been rendered.
	 * @property {string} VerticalScroll - The table has been scrolled vertically.
	 * @property {string} FirstVisibleRowChange - The first visible row has been changed by API call.
	 * @property {string} Unbind - The row binding has been removed.
	 * @property {string} Animation - An animation has been performed.
	 * @property {string} Resize - The table has been resized.
	 * @property {string} Zoom - The browsers zoom level has changed.
	 * @property {string} Unknown - The reason for the update is unknown.
	 */
	var ROWS_UPDATE_REASON = {
		Render: "Render",
		VerticalScroll: "VerticalScroll",
		FirstVisibleRowChange: "FirstVisibleRowChange",
		Unbind: "Unbind",
		Animation: "Animation",
		Resize: "Resize",
		Unknown: "Unknown"
	};
	for (var sProperty in ChangeReason) {
		ROWS_UPDATE_REASON[sProperty] = ChangeReason[sProperty];
	}

	/**
	 * The selectors which define whether an element is interactive. Due to the usage of pseudo selectors this can only be used in jQuery.
	 *
	 * @type {string}
	 * @static
	 * @constant
	 */
	var INTERACTIVE_ELEMENT_SELECTORS = ":sapTabbable, .sapUiTableTreeIcon:not(.sapUiTableTreeIconLeaf)";

	/**
	 * Static collection of utility functions related to the sap.ui.table.Table, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.table.TableUtils
	 * @private
	 */
	var TableUtils = {
		// Make other utils available.
		Grouping: TableGrouping,
		Column: TableColumnUtils,
		Menu: TableMenuUtils,
		Binding: TableBindingUtils,

		CELLTYPE: CELLTYPE,
		ROW_HORIZONTAL_FRAME_SIZE: ROW_HORIZONTAL_FRAME_SIZE,
		DEFAULT_ROW_HEIGHT: DEFAULT_ROW_HEIGHT,
		RowsUpdateReason: ROWS_UPDATE_REASON,
		INTERACTIVE_ELEMENT_SELECTORS: INTERACTIVE_ELEMENT_SELECTORS,

		/**
		 * Returns whether the table has a row header or not
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean}
		 * @private
		 */
		hasRowHeader : function(oTable) {
			return (oTable.getSelectionMode() !== SelectionMode.None
					&& oTable.getSelectionBehavior() !== SelectionBehavior.RowOnly)
					|| TableGrouping.isGroupMode(oTable);
		},

		/**
		 * Returns whether the table has a SelectAll checkbox.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Returns <code>true</code>, if the table has a SelectAll checkbox.
		 * @private
		 */
		hasSelectAll: function(oTable) {
			var sSelectionMode = oTable ? oTable.getSelectionMode() : SelectionMode.None;
			return (sSelectionMode === SelectionMode.Multi || sSelectionMode === SelectionMode.MultiToggle)
				   && oTable.getEnableSelectAll();
		},

		/**
		 * Returns whether the table has row highlights.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean} Returns <code>true</code>, if the table has row highlights
		 * @private
		 */
		hasRowHighlights: function(oTable) {
			if (!oTable) {
				return false;
			}

			var oRowSettingsTemplate = oTable.getRowSettingsTemplate();

			if (!oRowSettingsTemplate) {
				return false;
			}

			var sHighlight = oRowSettingsTemplate.getHighlight();

			return oRowSettingsTemplate.isBound("highlight")
				   || (sHighlight != null && sHighlight !== MessageType.None);
		},

		/**
		 * Returns the number of row actions in case the tahe has a row action column, <code>0</code> otherwise
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {int}
		 * @private
		 */
		getRowActionCount : function(oTable) {
			var oTemplate = oTable.getRowActionTemplate();
			return oTemplate ? oTemplate._getCount() : 0;
		},

		/**
		 * Returns whether the table has a row action column or not
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean}
		 * @private
		 */
		hasRowActions : function(oTable) {
			var oRowActionTemplate = oTable.getRowActionTemplate();

			return oRowActionTemplate != null
				   && (oRowActionTemplate.isBound("visible") || oRowActionTemplate.getVisible())
				   && TableUtils.getRowActionCount(oTable) > 0;
		},

		/**
		 * Returns whether selection is allowed on the cells of a row (not row selector).
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean}
		 * @private
		 */
		isRowSelectionAllowed : function(oTable) {
			return oTable.getSelectionMode() !== SelectionMode.None &&
				(oTable.getSelectionBehavior() === SelectionBehavior.Row || oTable.getSelectionBehavior() === SelectionBehavior.RowOnly);
		},

		/**
		 * Returns whether selection is allowed via the row selector.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean}
		 * @private
		 */
		isRowSelectorSelectionAllowed : function(oTable) {
			// Incl. that RowOnly works like Row
			return oTable.getSelectionMode() !== SelectionMode.None && TableUtils.hasRowHeader(oTable);
		},

		/**
		 * Finds out if all rows are selected in a table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Returns <code>true</code> if all rows in the table are selected.
		 */
		areAllRowsSelected: function(oTable) {
			if (!oTable) {
				return false;
			}

			var iSelectableRowCount = oTable._getSelectableRowCount();
			return iSelectableRowCount > 0 && iSelectableRowCount === oTable._getSelectedIndicesCount();
		},

		/**
		 * Returns whether the no data text is currently shown or not
		 * If true, also CSS class sapUiTableEmpty is set on the table root element.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean}
		 * @private
		 */
		isNoDataVisible : function(oTable) {
			if (!oTable.getShowNoData()) {
				return false;
			}

			return !TableUtils.hasData(oTable);
		},

		/**
		 * Returns whether the table currently has data.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean}
		 * @private
		 */
		hasData : function(oTable) {
			var oBinding = oTable.getBinding("rows");
			var iTotalRowCount = oTable._getTotalRowCount();
			var bHasData = iTotalRowCount > 0;

			if (oBinding && oBinding.providesGrandTotal) { // Analytical Binding
				var bHasTotal = oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures();
				bHasData = (bHasTotal && iTotalRowCount > 1) || (!bHasTotal && iTotalRowCount > 0);
			}

			return bHasData;
		},

		/**
		 * Returns whether the busy indicator is visible. It is considered as visible when the busy indicator element exists in the DOM as
		 * a child of the table element. It is not checked whether the indicator is actually visible on the screen.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean} Returns <code>true</code>, if the busy indicator is visible.
		 * @private
		 */
		isBusyIndicatorVisible: function(oTable) {
			if (!oTable || !oTable.getDomRef()) {
				return false;
			}

			return oTable.getDomRef().querySelector(".sapUiTableCnt > .sapUiLocalBusyIndicator") != null;
		},

		/**
		 * Returns whether one or more requests are currently in process by the binding.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Returns <code>true</code>, if the binding of the table is currently requesting data.
		 * @private
		 */
		hasPendingRequests: function(oTable) {
			if (!oTable) {
				return false;
			}

			if (TableUtils.canUsePendingRequestsCounter(oTable)) {
				return oTable._iPendingRequests > 0;
			} else {
				return oTable._bPendingRequest;
			}
		},

		/**
		 * A counter to determine whether there are pending requests can be used if exactly one dataReceived event is fired for every
		 * dataRequested event. If this is not the case and there can be an imbalance between dataReceived and dataRequested events, a more limited
		 * method using a boolean flag must be used.
		 *
		 * It is not always possible to correctly determine whether there is a pending request, because the table must use a flag instead of a
		 * counter. A flag is necessary under the following conditions:
		 *
		 * If the AnalyticalBinding is created with the parameter "useBatchRequest" set to false, an imbalance between dataRequested and
		 * dataReceived events can occur. There will be one dataRequested event for every request that would otherwise be part of a batch
		 * request. But still only one dataReceived event is fired after all responses are received.
		 *
		 * If the ODataTreeBindingFlat adapter is applied to the TreeBinding, the adapter fires a dataRequested event on every call of getNodes,
		 * even if no request is sent. This can happen if the adapter ignores the request, because it finds out there is a pending request which
		 * covers it. When a request is ignored no dataReceived event is fired.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Returns <code>true</code>, if the table can use a counter for pending request detection.
		 */
		canUsePendingRequestsCounter: function(oTable) {
			var oBinding = oTable ? oTable.getBinding("rows") : null;

			if (TableUtils.isA(oBinding, "sap.ui.model.analytics.AnalyticalBinding")) {
				return oBinding.bUseBatchRequests;
			} else if (TableUtils.isA(oBinding, "sap.ui.model.TreeBinding")) {
				return false;
			}

			return true;
		},

		/**
		 * Checks whether an object is of the given type(s).
		 * Wrapper for {@link sap.ui.base.Object.isA}
		 *
		 * @param {object} oObject Object which will be checked whether it is an instance of the given type
		 * @param {string|string[]} vTypeName Type or types to check for
		 * @see sap.ui.base.Object.isA
		 * @returns {boolean} Whether this object is an instance of the given type or of any of the given types
		 * @private
		 */
		isA: function(oObject, vTypeName) {
			return BaseObject.isA(oObject, vTypeName);
		},

		/**
		 * Toggles the selection state of the row which contains the given cell DOM element.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {jQuery|HTMLElement|int} vRowIndicator The data cell in the row, or the data row index of the row,
		 * 												 where the selection state should be toggled.
		 * @param {boolean} [bSelect] If defined, then instead of toggling the desired state is set.
		 * @param {function} [fnDoSelect] If defined, then instead of the default selection code, this custom callback is used.
		 * @returns {boolean} Returns <code>true</code> if the selection state of the row has been changed.
		 * @private
		 */
		toggleRowSelection: function(oTable, vRowIndicator, bSelect, fnDoSelect) {
			if (!oTable ||
				!oTable.getBinding("rows") ||
				oTable.getSelectionMode() === SelectionMode.None ||
				vRowIndicator == null) {

				return false;
			}

			function setSelectionState(iAbsoluteRowIndex) {
				if (!oTable._isRowSelectable(iAbsoluteRowIndex)) {
					return false;
				}

				oTable._iSourceRowIndex = iAbsoluteRowIndex; // To indicate that the selection was changed by user interaction.

				var bSelectionChanged = true;

				if (fnDoSelect) {
					bSelectionChanged = fnDoSelect(iAbsoluteRowIndex, bSelect);
				} else if (oTable.isIndexSelected(iAbsoluteRowIndex)) {
					if (bSelect === true) {
						return false;
					}
					oTable.removeSelectionInterval(iAbsoluteRowIndex, iAbsoluteRowIndex);
				} else {
					if (bSelect === false) {
						return false;
					}
					oTable.addSelectionInterval(iAbsoluteRowIndex, iAbsoluteRowIndex);
				}

				delete oTable._iSourceRowIndex;
				return bSelectionChanged;
			}

			// Variable vRowIndicator is a row index value.
			if (typeof vRowIndicator === "number") {
				if (vRowIndicator < 0 || vRowIndicator >= oTable._getTotalRowCount()) {
					return false;
				}
				return setSelectionState(vRowIndicator);

			// Variable vRowIndicator is a jQuery object or DOM element.
			} else {
				var $Cell = jQuery(vRowIndicator);
				var oCellInfo = TableUtils.getCellInfo($Cell[0]);
				var bIsRowSelectionAllowed = TableUtils.isRowSelectionAllowed(oTable);

				if (!TableUtils.Grouping.isInGroupingRow($Cell[0])
					&& ((oCellInfo.isOfType(TableUtils.CELLTYPE.DATACELL | TableUtils.CELLTYPE.ROWACTION) && bIsRowSelectionAllowed)
					|| (oCellInfo.isOfType(TableUtils.CELLTYPE.ROWHEADER) && TableUtils.isRowSelectorSelectionAllowed(oTable)))) {

					var iAbsoluteRowIndex;
					if (oCellInfo.isOfType(TableUtils.CELLTYPE.DATACELL)) {
						iAbsoluteRowIndex = oTable.getRows()[parseInt($Cell.closest("tr", oTable.getDomRef()).attr("data-sap-ui-rowindex"), 10)].getIndex();
					} else { // CELLTYPES.ROWHEADER, CELLTYPES.ROWACTION
						iAbsoluteRowIndex = oTable.getRows()[parseInt($Cell.attr("data-sap-ui-rowindex"), 10)].getIndex();
					}

					return setSelectionState(iAbsoluteRowIndex);
				}

				return false;
			}
		},

		/**
		 * Returns the text to be displayed as no data message.
		 * If a custom noData control is set null is returned.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {String|string|null}
		 * @private
		 */
		getNoDataText : function(oTable) {
			var oNoData = oTable.getNoData();
			if (oNoData instanceof Control) {
				return null;
			} else if (typeof oNoData === "string" || oTable.getNoData() instanceof String) {
				return oNoData;
			} else {
				return TableUtils.getResourceText("TBL_NO_DATA");
			}
		},

		/**
		 * Returns the number of currently visible columns
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {int}
		 * @private
		 */
		getVisibleColumnCount : function(oTable) {
			return oTable._getVisibleColumns().length;
		},

		/**
		 * Returns the number of header rows
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {int}
		 * @private
		 */
		getHeaderRowCount : function(oTable) {

			if (oTable._iHeaderRowCount === undefined) {
				if (!oTable.getColumnHeaderVisible()) {
					oTable._iHeaderRowCount = 0;
				} else {
					var iHeaderRows = 1;
					var aColumns = oTable.getColumns();
					for (var i = 0; i < aColumns.length; i++) {
						if (aColumns[i].shouldRender()) {
							// only visible columns need to be considered. We don't invoke getVisibleColumns due to
							// performance considerations. With several dozens of columns, it's quite costy to loop them twice.
							iHeaderRows = Math.max(iHeaderRows, aColumns[i].getMultiLabels().length);
						}
					}
					oTable._iHeaderRowCount = iHeaderRows;
				}
			}
			return oTable._iHeaderRowCount;
		},

		/* *
		 * Returns the height of the defined row, identified by its row index.
		 * @param {Object} oTable current table object
		 * @param {int} iRowIndex the index of the row which height is needed
		 * @private
		 * @returns {int}
		 * /
		getRowHeightByIndex : function(oTable, iRowIndex) {
			var iRowHeight = 0;

			if (oTable) {
				var aRows = oTable.getRows();
				if (aRows && aRows.length && iRowIndex > -1 && iRowIndex < aRows.length) {
					var oDomRefs = aRows[iRowIndex].getDomRefs();
					if (oDomRefs) {
						if (oDomRefs.rowScrollPart && oDomRefs.rowFixedPart) {
							iRowHeight = Math.max(oDomRefs.rowScrollPart.clientHeight, oDomRefs.rowFixedPart.clientHeight);
						} else if (!oDomRefs.rowFixedPart) {
							iRowHeight = oDomRefs.rowScrollPart.clientHeight;
						}
					}
				}
			}

			return iRowHeight;
		},*/

		/**
		 * Checks whether all conditions for pixel-based scrolling (Variable Row Height) are fulfilled.
		 * @param {Object} oTable current table object
		 * @returns {Boolean} true/false if fulfilled
		 * @private
		 */
		isVariableRowHeightEnabled : function(oTable) {
			return oTable && oTable._bVariableRowHeightEnabled && oTable.getFixedRowCount() <= 0 && oTable.getFixedBottomRowCount() <= 0;
		},

		/**
		 * Returns the logical number of rows
		 * Optionally empty visible rows are added (in case that the number of data
		 * rows is smaller than the number of visible rows)
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {boolean} bIncludeEmptyRows
		 * @returns {int}
		 * @private
		 */
		getTotalRowCount : function(oTable, bIncludeEmptyRows) {
			var iRowCount = oTable._getTotalRowCount();
			if (bIncludeEmptyRows) {
				iRowCount = Math.max(iRowCount, oTable.getVisibleRowCount());
			}
			return iRowCount;
		},

		/**
		 * Returns the number of visible rows that are not empty.
		 * If the number of visible rows is smaller than the number of data rows,
		 * the number of visible rows is returned, otherwise the number of data rows.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {int}
		 * @private
		 */
		getNonEmptyVisibleRowCount : function(oTable) {
			return Math.min(oTable.getVisibleRowCount(), oTable._getTotalRowCount());
		},

		/**
		 * Returns a combined info about the currently focused item (based on the item navigation)
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {sap.ui.table.TableUtils.FocusedItemInfo|null} Returns the information about the focused item, or <code>null</code>, if the
		 *                                                         item navigation is not yet initialized.
		 * @typedef {Object} sap.ui.table.TableUtils.FocusedItemInfo
		 * @property {int} cell Index of focused cell in the ItemNavigation.
		 * @property {int} columnCount Number of columns in the ItemNavigation.
		 * @property {int} cellInRow Index of the cell in the row.
		 * @property {int} row Index of row in the ItemNavigation.
		 * @property {int} cellCount Number of cells in the ItemNavigation.
		 * @property {Object|undefined} domRef Reference to the focused DOM element.
		 * @private
		 */
		getFocusedItemInfo : function(oTable) {
			var oIN = oTable._getItemNavigation();
			if (!oIN) {
				return null;
			}
			return {
				cell: oIN.getFocusedIndex(),
				columnCount: oIN.iColumns,
				cellInRow: oIN.getFocusedIndex() % oIN.iColumns,
				row: Math.floor(oIN.getFocusedIndex() / oIN.iColumns),
				cellCount: oIN.getItemDomRefs().length,
				domRef: oIN.getFocusedDomRef()
			};
		},

		/**
		 * Returns the index of the row (in the rows aggregation) of the current focused cell
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {int}
		 * @private
		 *
		 */
		getRowIndexOfFocusedCell : function(oTable) {
			var oInfo = TableUtils.getFocusedItemInfo(oTable);
			return oInfo.row - TableUtils.getHeaderRowCount(oTable);
		},

		/**
		 * Returns whether column with the given index (in the array of visible columns (see Table._getVisibleColumns()))
		 * is a fixed column.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {int} iColIdx Index of column in the tables column aggregation
		 * @returns {boolean}
		 * @private
		 */
		isFixedColumn : function(oTable, iColIdx) {
			return iColIdx < oTable.getComputedFixedColumnCount();
		},

		/**
		 * Returns whether the table has fixed columns.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {boolean}
		 * @private
		 */
		hasFixedColumns : function(oTable) {
			return oTable.getComputedFixedColumnCount() > 0;
		},

		/**
		 * Focus the item with the given index in the item navigation
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {int} iIndex Index of item in ItemNavigation which shall get the focus
		 * @param {Object} oEvent
		 * @private
		 */
		focusItem : function(oTable, iIndex, oEvent) {
			var oIN = oTable._getItemNavigation();
			if (oIN) {
				oIN.focusItem(iIndex, oEvent);
			}
		},

		/**
		 * The following rules apply for the cell information.
		 * <ul>
		 *     <li><b>type</b>: Is <code>0</code>, if the cell is not a table cell.</li>
		 *     <li><b>rowIndex</b>: Is <code>null</code>, if the cell is not a table cell or the SelectAll cell. The header rows and content rows have
		 *     their own index areas. This means, that the index of the first content row starts from 0 again.</li>
		 *     <li><b>columnIndex</b>: The index of the column in the <code>columns</code> aggregation. Is <code>null</code>, if the cell is not a
		 *     table cell. Is <code>-1</code> for row header cells (including the SelectAll cell). Is <code>-2</code> for row action cells.</li>
		 *     <li><b>spanLength</b>: Is <code>null</code>, if the cell is not a table cell. For all cells (including the SelectAll cell) other
		 *     than column header cells the <code>spanLength</code> is always <code>1</code>.</li>
		 *     <li><b>cell</b>: Is <code>null</code>, if the cell is not a table cell.</li>
		 * </ul>
		 *
		 * @typedef {Object} sap.ui.table.TableUtils.CellInfo
		 * @property {sap.ui.table.TableUtils.CellType} [type] The type of the cell.
		 * @property {int|null} [rowIndex] The index of the row the cell is inside.
		 * @property {int|null} columnIndex The index of the column, in the <code>columns</code> aggregation, the cell is inside.
		 * @property {int|null} columnSpan The amount of columns the cell spans over.
		 * @property {jQuery|null} cell The jQuery reference to the table cell.
		 * @property {sap.ui.table.TableUtils.CellInfo#isOfType} isOfType Function to check for the type of the cell.
		 */

		/**
		 * Collects all available information of a table cell by reading the DOM and returns them in a single object.
		 *
		 * @param {jQuery|HTMLElement} oCellRef DOM reference of a table cell.
		 * @returns {sap.ui.table.TableUtils.CellInfo} An object containing information about the cell.
		 * @see sap.ui.table.TableUtils.CellInfo
		 * @private
		 */
		getCellInfo: function(oCellRef) {
			var oCellInfo;
			var $Cell = jQuery(oCellRef);
			var sColumnId;
			var oColumn;
			var rRowIndex;
			var aRowIndexMatch;
			var iRowIndex;

			// Initialize cell info object with default values.
			oCellInfo = {
				type: 0,
				cell: null,
				rowIndex: null,
				columnIndex: null,
				columnSpan: null
			};

			if ($Cell.hasClass("sapUiTableTd")) { // Data Cell
				sColumnId = $Cell.data("sap-ui-colid");
				oColumn = sap.ui.getCore().byId(sColumnId);

				oCellInfo.type = TableUtils.CELLTYPE.DATACELL;
				oCellInfo.rowIndex = parseInt($Cell.parent().data("sap-ui-rowindex"), 10);
				oCellInfo.columnIndex = oColumn.getIndex();
				oCellInfo.columnSpan = 1;

			} else if ($Cell.hasClass("sapUiTableCol")) { // Column Header Cell
				rRowIndex = /_([\d]+)/;
				sColumnId = $Cell.attr("id");
				aRowIndexMatch = rRowIndex.exec(sColumnId);
				iRowIndex =  aRowIndexMatch && aRowIndexMatch[1] != null ? parseInt(aRowIndexMatch[1], 10) : 0;

				oCellInfo.type = TableUtils.CELLTYPE.COLUMNHEADER;
				oCellInfo.rowIndex = iRowIndex;
				oCellInfo.columnIndex = parseInt($Cell.data("sap-ui-colindex"), 10);
				oCellInfo.columnSpan = parseInt($Cell.attr("colspan") || 1, 10);

			} else if ($Cell.hasClass("sapUiTableRowHdr")) { // Row Header Cell
				oCellInfo.type = TableUtils.CELLTYPE.ROWHEADER;
				oCellInfo.rowIndex = parseInt($Cell.data("sap-ui-rowindex"), 10);
				oCellInfo.columnIndex = -1;
				oCellInfo.columnSpan = 1;

			} else if ($Cell.hasClass("sapUiTableRowAction")) { // Row Action Cell
				oCellInfo.type = TableUtils.CELLTYPE.ROWACTION;
				oCellInfo.rowIndex = parseInt($Cell.data("sap-ui-rowindex"), 10);
				oCellInfo.columnIndex = -2;
				oCellInfo.columnSpan = 1;

			} else if ($Cell.hasClass("sapUiTableColRowHdr")) { // SelectAll Cell
				oCellInfo.type = TableUtils.CELLTYPE.COLUMNROWHEADER;
				oCellInfo.columnIndex = -1;
				oCellInfo.columnSpan = 1;
			}

			// Set the cell object for easier access to the cell for the caller.
			if (oCellInfo.type !== 0) {
				oCellInfo.cell = $Cell;
			}

			/**
			 * Function to check whether a cell is of certain types. Cell types are flags and have to be passed as a bitmask.
			 * Returns true if the cell is of one of the specified types, otherwise false. Also returns false if no or an invalid bitmask
			 * is specified.
			 *
			 * @name sap.ui.table.TableUtils.CellInfo#isOfType
			 * @param {int} cellTypeMask Bitmask of cell types to check.
			 * @returns {boolean} Whether the specified cell type mask matches the type of the cell.
			 * @see CELLTYPE
			 */
			oCellInfo.isOfType = function(cellTypeMask) {
				if (cellTypeMask == null) {
					return false;
				}
				return (this.type & cellTypeMask) > 0;
			};

			return oCellInfo;
		},

		/**
		 * Returns the Row, Column and Cell instances for the given row index (in the rows aggregation)
		 * and column index (in the array of visible columns (see Table._getVisibleColumns()).
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {int} iRowIdx Index of row in the tables rows aggregation
		 * @param {int} iColIdx Index of column in the list of visible columns
		 * @param {boolean} bIdxInColumnAgg Whether the given column index is the index in the columns (<code>true</code>)
		 * 									aggregation or in the list of visble columns (<code>false</code>).
		 * @returns {Object}
		 * @type {Object}
		 * @property {sap.ui.table.Row} row Row of the table
		 * @property {sap.ui.table.Column} column Column of the table
		 * @property {sap.ui.core.Control} cell Cell control of row/column
		 * @private
		 */
		getRowColCell : function(oTable, iRowIdx, iColIdx, bIdxInColumnAgg) {
			var oRow = iRowIdx >= 0 && iRowIdx < oTable.getRows().length ? oTable.getRows()[iRowIdx] : null;
			var aColumns = bIdxInColumnAgg ? oTable.getColumns() : oTable._getVisibleColumns();
			var oColumn = iColIdx >= 0 && iColIdx < aColumns.length ? aColumns[iColIdx] : null;
			var oCell = null;

			if (oRow && oColumn) {
				if (bIdxInColumnAgg) {
					if (oColumn.shouldRender()) {
						var aVisibleColumns = oTable._getVisibleColumns();
						for (var i = 0; i < aVisibleColumns.length; i++) {
							if (aVisibleColumns[i] === oColumn) {
								oCell = oRow.getCells()[i];
								break;
							}
						}
					}
				} else {
					oCell = oRow.getCells()[iColIdx];
				}

				//TBD: Clarify why this is needed!
				if (oCell && oCell.data("sap-ui-colid") != oColumn.getId()) {
					var aCells = oRow.getCells();
					for (var i = 0; i < aCells.length; i++) {
						if (aCells[i].data("sap-ui-colid") === oColumn.getId()) {
							oCell = aCells[i];
							break;
						}
					}
				}
			}

			return {row: oRow, column: oColumn, cell: oCell};
		},

		/**
		 * Returns the table cell which is either the parent of an element, or returns the element if it is a table cell itself.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table used as the context within which to search for the cell.
		 * @param {jQuery|HTMLElement} oElement A table cell or an element inside a table cell.
		 * @returns {jQuery|null} Returns <code>null</code>, if the element is neither a table cell nor inside a table cell.
		 * @private
		 */
		getCell: function(oTable, oElement) {
			if (!oTable || !oElement) {
				return null;
			}

			var $Element = jQuery(oElement);
			var $Cell;
			var oTableElement = oTable.getDomRef();
			var aTableCellSelectors = [
				".sapUiTableTd",
				".sapUiTableCol",
				".sapUiTableRowHdr",
				".sapUiTableRowAction",
				".sapUiTableColRowHdr"
			];
			var sSelector;

			for (var i = 0; i < aTableCellSelectors.length; i++) {
				sSelector = aTableCellSelectors[i];
				$Cell = $Element.closest(sSelector, oTableElement);

				if ($Cell.length > 0) {
					return $Cell;
				}
			}

			return null;
		},

		/**
		 * Returns the table cell which is the parent of an element.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table used as the context within which to search for the parent cell.
		 * @param {jQuery|HTMLElement} oElement An element inside a table cell.
		 * @returns {jQuery|null} Returns <code>null</code>, if the element is not inside a table cell.
		 * @private
		 */
		getParentCell: function(oTable, oElement) {
			var $Element = jQuery(oElement);
			var $Cell = TableUtils.getCell(oTable, oElement);

			if (!$Cell || $Cell[0] === $Element[0]) {
				return null; // The element is not inside a table cell.
			} else {
				return $Cell;
			}
		},

		/**
		 * Registers a ResizeHandler for a DOM reference identified by its ID suffix. The ResizeHandler ID is tracked
		 * in _mResizeHandlerIds of the table instance. The sIdSuffix is used as key.
		 * Existing ResizeHandlers will be de-registered before the new one is registered.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {string} sIdSuffix ID suffix to identify the DOM element for which to register the ResizeHandler
		 * @param {Function} fnHandler Function to handle the resize event
		 * @param {boolean}[bRegisterParent] Flag to register the ResizeHandler for the parent DOM element of the one identified by sIdSuffix
		 *
		 * @returns {int|undefined} ResizeHandler ID or undefined if the DOM element could not be found
		 * @private
		 */
		registerResizeHandler : function(oTable, sIdSuffix, fnHandler, bRegisterParent) {
			var oDomRef;
			if (typeof sIdSuffix == "string") {
				oDomRef = oTable.getDomRef(sIdSuffix);
			} else {
				Log.error("sIdSuffix must be a string", oTable);
				return;
			}

			if (typeof fnHandler !== "function") {
				Log.error("fnHandler must be a function", oTable);
				return;
			}

			// make sure that each DOM element of the table can only have one resize handler in order to avoid memory leaks
			TableUtils.deregisterResizeHandler(oTable, sIdSuffix);

			if (!oTable._mResizeHandlerIds) {
				oTable._mResizeHandlerIds = {};
			}

			if (bRegisterParent && oDomRef) {
				oDomRef = oDomRef.parentNode;
			}

			if (oDomRef) {
				oTable._mResizeHandlerIds[sIdSuffix] = ResizeHandler.register(oDomRef, fnHandler);
			}

			return oTable._mResizeHandlerIds[sIdSuffix];
		},

		/**
		 * De-register ResizeHandler identified by sIdSuffix. If sIdSuffix is undefined, all know ResizeHandlers will be de-registered
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {string|Array.<string>} [vIdSuffix] ID suffix to identify the ResizeHandler to de-register. If undefined, all will be de-registered
		 * @private
		 */
		deregisterResizeHandler : function(oTable, vIdSuffix) {
			var aIdSuffix;
			if (!oTable._mResizeHandlerIds) {
				// no resize handler registered so far
				return;
			}

			if (typeof vIdSuffix == "string") {
				aIdSuffix = [vIdSuffix];
			} else if (vIdSuffix === undefined) {
				aIdSuffix = [];
				// de-register all resize handlers if no specific is named
				for (var sKey in oTable._mResizeHandlerIds) {
					if (typeof sKey == "string" && oTable._mResizeHandlerIds.hasOwnProperty(sKey)) {
						aIdSuffix.push(sKey);
					}
				}
			} else if (Array.isArray(vIdSuffix)) {
				aIdSuffix = vIdSuffix;
			}

			for (var i = 0; i < aIdSuffix.length; i++) {
				var sIdSuffix = aIdSuffix[i];
				if (oTable._mResizeHandlerIds[sIdSuffix]) {
					ResizeHandler.deregister(oTable._mResizeHandlerIds[sIdSuffix]);
					oTable._mResizeHandlerIds[sIdSuffix] = undefined;
				}
			}
		},

		/**
		 * Checks whether the cell of the given DOM reference is in the first row (from DOM point of view) of the scrollable area.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {Object|int} row Cell DOM reference or row index
		 * @private
		 */
		isFirstScrollableRow : function(oTable, row) {
			if (isNaN(row)) {
				var $Ref = jQuery(row);
				row = parseInt($Ref.add($Ref.parent()).filter("[data-sap-ui-rowindex]").data("sap-ui-rowindex"), 10);
			}
			var iFixed = oTable.getFixedRowCount() || 0;
			return row == iFixed;
		},

		/**
		 * Checks whether the cell of the given DOM reference is in the last row (from DOM point of view) of the scrollable area.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery|HTMLElement|int} row The row element or row index.
		 * @returns {boolean} Returns <code>true</code>, if the row is the last scrollable row of the table based on the data.
		 * @private
		 */
		isLastScrollableRow : function(oTable, row) {
			if (isNaN(row)) {
				var $Ref = jQuery(row);
				row = parseInt($Ref.add($Ref.parent()).filter("[data-sap-ui-rowindex]").data("sap-ui-rowindex"), 10);
			}
			var iFixed = oTable.getFixedBottomRowCount() || 0;
			return row == oTable.getVisibleRowCount() - iFixed - 1;
		},

		/**
		 * Returns the content density style class which is relevant for the given control. First it tries to find the
		 * definition via the control API. While traversing the controls parents, it's tried to find the closest DOM
		 * reference. If that is found, the check will use the DOM reference to find the closest content density style class
		 * in the parent chain. This approach caters both use cases: content density defined at DOM and/or control level.
		 *
		 * If at the same level, several style classes are defined, this is the priority:
		 * sapUiSizeCompact, sapUiSizeCondensed, sapUiSizeCozy
		 *
		 * @param {sap.ui.table.Table} oControl Instance of the table
		 * @returns {String|undefined} name of the content density stlye class or undefined if none was found
		 * @private
		 */
		getContentDensity : function(oControl) {
			var sContentDensity;
			var aContentDensityStyleClasses = ["sapUiSizeCondensed", "sapUiSizeCompact", "sapUiSizeCozy"];

			var fnGetContentDensity = function (sFnName, oObject) {
				if (!oObject[sFnName]) {
					return;
				}

				for (var i = 0; i < aContentDensityStyleClasses.length; i++) {
					if (oObject[sFnName](aContentDensityStyleClasses[i])) {
						return aContentDensityStyleClasses[i];
					}
				}
			};

			var $DomRef = oControl.$();
			if ($DomRef.length > 0) {
				// table was already rendered, check by DOM and return content density class
				sContentDensity = fnGetContentDensity("hasClass", $DomRef);
			} else {
				sContentDensity = fnGetContentDensity("hasStyleClass", oControl);
			}

			if (sContentDensity) {
				return sContentDensity;
			}

			// since the table was not yet rendered, traverse its parents:
			//   - to find a content density defined at control level
			//   - to find the first DOM reference and then check on DOM level
			var oParentDomRef = null;
			var oParent = oControl.getParent();
			// the table might not have a parent at all.
			if (oParent) {
				// try to get the DOM Ref of the parent. It might be required to traverse the complete parent
				// chain to find one parent which has DOM rendered, as it may happen that an element does not have
				// a corresponding DOM Ref
				do {
					// if the content density is defined at control level, we can return it, no matter the control was already
					// rendered. By the time it will be rendered, it will have that style class
					sContentDensity = fnGetContentDensity("hasStyleClass", oParent);
					if (sContentDensity) {
						return sContentDensity;
					}

					// if there was no style class set at control level, we try to find the DOM reference. Using that
					// DOM reference, we can easily check for the content density style class via the DOM. This allows us
					// to include e.g. the body tag as well.
					if (oParent.getDomRef) {
						// for Controls and elements
						oParentDomRef = oParent.getDomRef();
					} else if (oParent.getRootNode) {
						// for UIArea
						oParentDomRef = oParent.getRootNode();
					}

					if (!oParentDomRef && oParent.getParent) {
						oParent = oParent.getParent();
					} else {
						// make sure there is not endless loop if oParent has no getParent function
						oParent = null;
					}
				} while (oParent && !oParentDomRef);
			}

			// if we found a DOM reference, check for content density
			$DomRef = jQuery(oParentDomRef || document.body);
			sContentDensity = fnGetContentDensity("hasClass", $DomRef.closest("." + aContentDensityStyleClasses.join(",.")));

			return sContentDensity;
		},

		/**
		 * Checks and returns an adapted selection mode (e.g. changes deprecated mode "Multi" to "MultiToggle") if necessary.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {string} sSelectionMode the <code>sap.ui.table.SelectionMode</code>
		 * @returns {string} the sanitized <code>sap.ui.table.SelectionMode</code>
		 * @private
		 */
		sanitizeSelectionMode: function(oTable, sSelectionMode) {
			if (sSelectionMode === SelectionMode.Multi) {
				sSelectionMode = SelectionMode.MultiToggle;
				Log.warning("The selection mode 'Multi' is deprecated and must not be used anymore. Your setting was defaulted to selection mode 'MultiToggle'");
			}
			return sSelectionMode;
		},

		/**
		 * Checks if the given CSS width is not fix.
		 * @param {string} sWidth
		 * @returns {boolean} true if the width is flexible
		 * @private
		 */
		isVariableWidth: function(sWidth) {
			return !sWidth || sWidth == "auto" || sWidth.toString().match(/%$/);
		},

		/**
		 * Returns the index of the first fixed buttom row in the <code>rows</code> aggregation.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @returns {int} The index of the first fixed buttom row in the <code>rows</code> aggregation, or <code>-1</code>.
		 * @private
		 */
		getFirstFixedButtomRowIndex: function(oTable) {
			var iFixedBottomRowCount = oTable.getFixedBottomRowCount();
			var oBinding = oTable.getBinding("rows");
			var iFirstFixedButtomIndex = -1;

			if (oBinding && iFixedBottomRowCount > 0) {
				var iVisibleRowCount = oTable.getVisibleRowCount();
				var iFirstVisibleRow = oTable.getFirstVisibleRow();
				var iTotalRowCount = oTable._getTotalRowCount();

				if (iTotalRowCount >= iVisibleRowCount) {
					iFirstFixedButtomIndex = iVisibleRowCount - iFixedBottomRowCount;
				} else {
					var iIdx = iTotalRowCount - iFixedBottomRowCount - iFirstVisibleRow;
					if (iIdx >= 0 && (iFirstVisibleRow + iIdx) < iTotalRowCount) {
						iFirstFixedButtomIndex = iIdx;
					}
				}
			}

			return iFirstFixedButtomIndex;
		},

		/**
		 * Gets the resource bundle of the sap.ui.table library. The bundle will be loaded if it is not already loaded or if it should be reloaded.
		 * After the bundle is loaded, {@link sap.ui.table.TableUtils.getResourceText} can be used to get texts.
		 *
		 * @param {object} [mOptions] Configuration options
		 * @param {boolean} [mOptions.async=false] Whether to load the bundle asynchronously.
		 * @param {boolean} [mOptions.reload=false] Whether to reload the bundle, if it already was loaded.
		 * @returns {jQuery.sap.util.ResourceBundle | Promise} The resource bundle, or a Promise if the bundle is loaded asynchronously.
		 */
		getResourceBundle: function(mOptions) {
			mOptions = jQuery.extend({async: false, reload: false}, mOptions);

			if (oResourceBundle && mOptions.reload !== true) {
				if (mOptions.async === true) {
					return Promise.resolve(oResourceBundle);
				} else {
					return oResourceBundle;
				}
			}

			var vResult = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table", mOptions.async === true);

			if (vResult instanceof Promise) {
				vResult = vResult.then(function(oBundle) {
					oResourceBundle = oBundle;
					return oResourceBundle;
				});
			} else {
				oResourceBundle = vResult;
			}

			return vResult;
		},

		/**
		 * Gets a resource text, if the resource bundle was already loaded with {@link sap.ui.table.TableUtils.getResourceBundle}.
		 *
		 * @param {string} sKey The key of the resource text.
		 * @param {string[]} [aValues] List of parameters values which should replace the placeholders.
		 * @returns {string} The resource text, or an empty string if the resource bundle is not yet loaded.
		 */
		getResourceText: function(sKey, aValues) {
			return oResourceBundle ? oResourceBundle.getText(sKey, aValues) : "";
		},

		/**
		 * Facilitates dynamic calling.
		 *
		 * @param {function():T | T} vObject The object, or a function returning the object, on which methods will be called.
		 * @param {function(this:U, T) | Object<string, Array.<*>>} vCall Called if <code>vObject</code> is, or returns an object.
		 * @param {U} [oThis] Context in the function calls, or in the callback if <code>vCall</code>is a function. Default is <code>vObject</code>.
		 * @returns {undefined | Array.<*>} If <code>vCall</code> is a map, the return values of the calls are returned. In case of multiple calls, an
		 *                                  array of return values is returned.
		 * @template T, U
		 */
		dynamicCall: function(vObject, vCall, oThis) {
			var oObject = vObject instanceof Function ? vObject() : vObject;

			if (!oObject || !vCall) {
				return undefined;
			}

			oThis = oThis || oObject;

			if (vCall instanceof Function) {
				vCall.call(oThis, oObject);
				return undefined;
			} else {
				var aParameters;
				var aReturnValues = [];
				for (var sFunctionName in vCall) {
					if (oObject[sFunctionName] instanceof Function) {
						aParameters = vCall[sFunctionName];
						aReturnValues.push(oObject[sFunctionName].apply(oThis, aParameters));
					} else {
						aReturnValues.push(undefined);
					}
				}
				if (aReturnValues.length === 1) {
					return aReturnValues[0];
				} else {
					return aReturnValues;
				}
			}
		},

		/**
		 * Invokes a method in a certain interval, regardless of how many times it was called.
		 *
		 * @param {Function} fn The method to throttle.
		 * @param {Object} [mOptions] The options that influence when the throttled method will be invoked.
		 * @param {int} [mOptions.wait=0] The amount of milliseconds to wait until actually invoking the method.
		 * @param {boolean} [mOptions.leading=true] Whether the method should be invoked on the first call.
		 * @param {boolean} [mOptions.asyncLeading=false] Whether the leading invocation should be asynchronous.
		 * @returns {Function} Returns the throttled method.
		 */
		throttle: function(fn, mOptions) {
			// Functionality taken from lodash open source library and adapted as needed

			mOptions = Object.assign({
				wait: 0,
				leading: true
			}, mOptions);
			mOptions.maxWait = mOptions.wait;
			mOptions.trailing = true;
			mOptions.requestAnimationFrame = false;

			return TableUtils.debounce(fn, mOptions);
		},

		/**
		 * Invokes a method if a certain time has passed since the last call, regardless of how many times it was called.
		 *
		 * @param {Function} fn The method to debounce.
		 * @param {Object} [mOptions] The options that influence when the debounced method will be invoked.
		 * @param {int} [mOptions.wait=0] The amount of milliseconds since the last call to wait before actually invoking the method. Has no
		 *                                effect, if <code>mOptions.requestAnimationFrame</code> is set to <code>true</code>.
		 * @param {int|null} [mOptions.maxWait=null] The maximum amount of milliseconds to wait for an invocation. Has no effect, if
		 *                                           <code>mOptions.requestAnimationFrame</code> is set to <code>true</code>.
		 * @param {boolean} [mOptions.leading=false] Whether the method should be invoked on the first call.
		 * @param {boolean} [mOptions.asyncLeading=false] Whether the leading invocation should be asynchronous.
		 * @param {boolean} [mOptions.trailing=true] Whether the method should be invoked after a certain time has passed. If
		 *                                           <code>mOptions.leading</code> is set to <code>true</code>, the method needs to be called more
		 *                                           than once for an invocation at the end of the waiting time.
		 * @param {boolean} [mOptions.requestAnimationFrame=false] Whether <code>requestAnimationFrame</code> should be used to debounce the
		 *                                                         method. If set to <code>true</code>, <code>mOptions.wait</code> and
		 *                                                         <code>mOptions.maxWait</code> have no effect.
		 * @returns {Function} Returns the debounced method.
		 */
		debounce: function(fn, mOptions) {
			// Functionality taken from lodash open source library and adapted as needed

			mOptions = Object.assign({
				wait: 0,
				maxWait: null,
				leading: false,
				asyncLeading: false,
				trailing: true,
				requestAnimationFrame: false
			}, mOptions);

			var iLastInvocationTime = null;
			var iTimerId = null;
			var oCancelablePromise = null;
			var bMaxWait = mOptions.maxWait != null;

			mOptions.wait = Math.max(0, mOptions.wait);
			mOptions.maxWait = bMaxWait ? Math.max(mOptions.maxWait, mOptions.wait) : mOptions.maxWait;

			/**
			 * Calls the method. Only calls the method if an arguments object is provided.
			 *
			 * @param {any} [vContext] The context of the call.
			 * @param {Object} [vArguments] The arguments object.
			 * @param {boolean} [bAsync=false] Whether the method should be called in a promise.
			 */
			function invoke(vContext, vArguments, bAsync) {
				bAsync = bAsync === true;
				iLastInvocationTime = Date.now();

				if (vArguments == null) {
					return;
				}

				if (bAsync) {
					var oPromise = Promise.resolve().then(function() {
						if (oPromise.canceled) {
							return;
						}
						oCancelablePromise = null;
						fn.apply(vContext, vArguments);
					});
					oPromise.cancel = function() {
						oPromise.canceled = true;
					};
					oCancelablePromise = oPromise;
				} else {
					fn.apply(vContext, vArguments);
				}
			}

			/**
			 * Calls the method debounced. Multiple calls within a certain time will be reduced to one call.
			 *
			 * @param {any} [vContext] The context of the call.
			 * @param {Object} [vArguments] The arguments object.
			 */
			function invokeDebounced(vContext, vArguments) {
				cancelTimer();

				function _invoke(bCancel) {
					bCancel = bCancel !== false;
					if (mOptions.trailing) {
						invoke(vContext, vArguments);
					}
					if (bCancel) {
						cancel();
					}
				}

				if (mOptions.requestAnimationFrame) {
					iTimerId = window.requestAnimationFrame(function() {
						_invoke();
					});
				} else {
					var iNow = Date.now();
					var iTimeSinceLastInvocation = iLastInvocationTime == null ? 0 : iNow - iLastInvocationTime;
					var iRemainingWaitTime = Math.max(0, bMaxWait ?
														 Math.min(mOptions.maxWait - iTimeSinceLastInvocation, mOptions.wait) :
														 mOptions.wait);
					var bMaxWaitInvocation = iRemainingWaitTime < mOptions.wait;

					iTimerId = setTimeout(function() {
						if (bMaxWaitInvocation) {
							var iTimerOvertime = Math.max(0, (Date.now() - iNow) - iRemainingWaitTime);
							var iCancelWaitTime = mOptions.wait - iRemainingWaitTime;
							if (iTimerOvertime > iCancelWaitTime) {
								// The timer took longer, maybe because of a long-running synchronous execution. No need to wait more.
								_invoke();
							} else {
								// Because there is some time left, the timer is restarted for cleanup. This is necessary for correct scheduling if
								// the debounced method is called again during this time.
								iTimerId = setTimeout(cancel, iCancelWaitTime - iTimerOvertime);
								_invoke(false);
							}
						} else {
							_invoke();
						}
					}, iRemainingWaitTime);
				}
			}

			function cancelTimer() {
				if (mOptions.requestAnimationFrame) {
					window.cancelAnimationFrame(iTimerId);
				} else {
					clearTimeout(iTimerId);
				}
				iTimerId = null;
			}

			function cancelPromise() {
				if (oCancelablePromise) {
					oCancelablePromise.cancel();
					oCancelablePromise = null;
				}
			}

			function cancel() {
				cancelTimer();
				cancelPromise();
				iLastInvocationTime = null;
			}

			function pending() {
				return iTimerId != null;
			}

			var debounced = function() {
				if (!pending() && !mOptions.leading) {
					invoke(); // Fake a leading invocation. Required for maxWait invocations.
				}
				if (pending() || !mOptions.leading) {
					invokeDebounced(this, arguments);
				} else if (mOptions.asyncLeading) {
					invoke(this, arguments, true);
					invokeDebounced();
				} else { // mOptions.leading
					invokeDebounced(); // Schedule delayed invocation before leading invocation. Function execution might take some time.
					invoke(this, arguments);
				}
			};
			debounced.cancel = cancel;
			debounced.pending = pending;

			return debounced;
		},

		/**
		 * Returns all interactive elements in a data cell.
		 *
		 * @param {jQuery|HTMLElement} oCell The data cell from which to get the interactive elements.
		 * @returns {jQuery|null} Returns <code>null</code>, if the passed cell is not a cell or does not contain any interactive elements.
		 */
		getInteractiveElements: function(oCell) {
			if (!oCell) {
				return null;
			}

			var $Cell = jQuery(oCell);
			var oCellInfo = TableUtils.getCellInfo($Cell);

			if (oCellInfo.isOfType(CELLTYPE.DATACELL | CELLTYPE.ROWACTION)) {
				var $InteractiveElements = $Cell.find(INTERACTIVE_ELEMENT_SELECTORS);
				if ($InteractiveElements.length > 0) {
					return $InteractiveElements;
				}
			}

			return null;
		},

		/**
		 * Adds a delegate that listens to the events that are fired on the object passed as second parameter.
		 *
		 * @param oDelegate the delegate object
		 * @param oThis this object will be the "this" context in the listener methods
		 */
		addDelegate: function(oDelegate, oThis, bIsContext) {
			var oElement = bIsContext ? oThis : undefined;
			oThis.addDelegate(oDelegate, false, oElement, false);
		}
	};

	// Avoid cyclic dependency.
	TableGrouping.TableUtils = TableUtils;
	TableColumnUtils.TableUtils = TableUtils;
	TableMenuUtils.TableUtils = TableUtils;
	TableBindingUtils.TableUtils = TableUtils;

	return TableUtils;

}, /* bExport= */ true);