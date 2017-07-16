/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableUtils.
sap.ui.define([
	"jquery.sap.global", "sap/ui/core/Control", "sap/ui/core/ResizeHandler", "sap/ui/core/library", "sap/ui/Device", "sap/ui/model/ChangeReason",
	"./TableGrouping", "./TableColumnUtils", "./TableMenuUtils", "./library"
], function(jQuery, Control, ResizeHandler, coreLibrary, Device, ChangeReason, TableGrouping, TableColumnUtils, TableMenuUtils, library) {
	"use strict";

	// Shortcuts
	var SelectionBehavior = library.SelectionBehavior;
	var SelectionMode = library.SelectionMode;
	var MessageType = coreLibrary.MessageType;

	/**
	 * The border width of a row in pixels.
	 *
	 * @type {int}
	 * @static
	 * @constant
	 */
	var ROW_BORDER_WIDTH = 1;

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
	 * Static collection of utility functions related to the sap.ui.table.Table, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.table.TableUtils
	 * @private
	 */
	var TableUtils = {

		Grouping: TableGrouping, //Make grouping utils available here
		Column: TableColumnUtils, //Make column utils available here
		Menu: TableMenuUtils, //Make menu utils available here

		/**
		 * @type {sap.ui.table.TableUtils.CellType}
		 */
		CELLTYPE: CELLTYPE,

		/**
		 * The default row heights in pixels for the different content densities.
		 *
		 * @type {DefaultRowHeight}
		 * @static
		 * @constant
		 * @typedef {Object} DefaultRowHeight
		 * @property {int} sapUiSizeCondensed - The default height of a row in pixels in condensed content density.
		 * @property {int} sapUiSizeCompact - The default height of a row in pixels in compact content density.
		 * @property {int} sapUiSizeCozy - The default height of a row in pixels in cozy content density.
		 * @property {int} undefined - The default height of a row in pixels in case no content density information is available.
		 */
		DEFAULT_ROW_HEIGHT: {
			sapUiSizeCondensed : 24 + ROW_BORDER_WIDTH,
			sapUiSizeCompact : 32 + ROW_BORDER_WIDTH,
			sapUiSizeCozy : 48 + ROW_BORDER_WIDTH,
			undefined : 32 + ROW_BORDER_WIDTH
		},

		/**
		 * Reason for updates of the rows. Inherits from {@link sap.ui.model.ChangeReason}.
		 *
		 * @type {RowsUpdateReason}
		 * @static
		 * @constant
		 * @typedef {Object} RowsUpdateReason
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
		 * @property {string} Unknown - The reason for the update is unknown.
		 */
		RowsUpdateReason: (function() {
			var mUpdateRowsReason = {};

			for (var sProperty in ChangeReason) {
				mUpdateRowsReason[sProperty] = ChangeReason[sProperty];
			}

			mUpdateRowsReason.Render = "Render";
			mUpdateRowsReason.VerticalScroll = "VerticalScroll";
			mUpdateRowsReason.FirstVisibleRowChange = "FirstVisibleRowChange";
			mUpdateRowsReason.Unbind = "Unbind";
			mUpdateRowsReason.Animation = "Animation";
			mUpdateRowsReason.Resize = "Resize";
			mUpdateRowsReason.Unknown = "Unknown";

			return mUpdateRowsReason;
		})(),

		/**
		 * Returns whether the table has a row header or not
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {boolean}
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
		 * @return {boolean} Returns <code>true</code>, if the table has a SelectAll checkbox.
		 * @private
		 */
		hasSelectAll: function(oTable) {
			var sSelectionMode = oTable != null ? oTable.getSelectionMode() : SelectionMode.None;
			return (sSelectionMode === SelectionMode.Multi || sSelectionMode === SelectionMode.MultiToggle)
				   && oTable.getEnableSelectAll();
		},

		/**
		 * Returns whether the table has row highlights.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {boolean} Returns <code>true</code>, if the table has row highlights
		 * @private
		 */
		hasRowHighlights: function(oTable) {
			if (oTable == null) {
				return false;
			}

			var oRowSettingsTemplate = oTable.getRowSettingsTemplate();

			if (oRowSettingsTemplate == null) {
				return false;
			}

			var sHighlight = oRowSettingsTemplate.getHighlight();

			return oRowSettingsTemplate.isBound("highlight")
				   || (sHighlight != null && sHighlight !== MessageType.None);
		},

		/**
		 * Returns the number of row actions in case the tahe has a row action column, <code>0</code> otherwise
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {int}
		 * @private
		 */
		getRowActionCount : function(oTable) {
			var oTemplate = oTable.getRowActionTemplate();
			return oTemplate ? oTemplate._getCount() : 0;
		},

		/**
		 * Returns whether the table has a row action column or not
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {boolean}
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
		 * @return {boolean}
		 * @private
		 */
		isRowSelectionAllowed : function(oTable) {
			return oTable.getSelectionMode() !== SelectionMode.None &&
				(oTable.getSelectionBehavior() === SelectionBehavior.Row || oTable.getSelectionBehavior() === SelectionBehavior.RowOnly);
		},

		/**
		 * Returns whether selection is allowed via the row selector.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {boolean}
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
			if (oTable == null) {
				return false;
			}

			var iSelectableRowCount = oTable._getSelectableRowCount();
			return iSelectableRowCount > 0 && iSelectableRowCount === oTable._getSelectedIndicesCount();
		},

		/**
		 * Returns whether the no data text is currently shown or not
		 * If true, also CSS class sapUiTableEmpty is set on the table root element.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {boolean}
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
		 * @return {boolean}
		 * @private
		 */
		hasData : function(oTable) {
			var oBinding = oTable.getBinding("rows"),
			iBindingLength = oTable._getRowCount(),
			bHasData = oBinding ? !!iBindingLength : false;

			if (oBinding && oBinding.providesGrandTotal) { // Analytical Binding
				var bHasTotal = oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures();
				bHasData = (bHasTotal && iBindingLength < 2) || (!bHasTotal && iBindingLength === 0) ? false : true;
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
			if (oTable == null || oTable.getDomRef() == null) {
				return false;
			}

			return oTable.getDomRef().querySelector(".sapUiLocalBusyIndicator") != null;
		},

		/**
		 * Returns whether a request is currently in process by the binding.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @return {boolean} Returns <code>true</code>, if the binding of the table is currently requesting data.
		 * @private
		 */
		hasPendingRequest: function(oTable) {
			return oTable != null && oTable._bPendingRequest === true;
		},

		/**
		 * Checks whether the given object is of the given type (given in AMD module syntax)
		 * without the need of loading the types module.
		 * @param {sap.ui.base.ManagedObject} oObject The object to check
		 * @param {string} sType The type given in AMD module syntax
		 * @return {boolean}
		 * @private
		 */
		isInstanceOf : function(oObject, sType) {
			if (!oObject || !sType) {
				return false;
			}
			var oType = sap.ui.require(sType);
			return !!(oType && (oObject instanceof oType));
		},

		/**
		 * Toggles the selection state of the row which contains the given cell DOM element.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {jQuery|HTMLElement|int} oRowIndicator The data cell in the row, or the data row index of the row,
		 * 												 where the selection state should be toggled.
		 * @param {boolean} [bSelect] If defined, then instead of toggling the desired state is set.
		 * @param {function} [fnDoSelect] If defined, then instead of the default selection code, this custom callback is used.
		 * @returns {boolean} Returns <code>true</code> if the selection state of the row has been changed.
		 * @private
		 */
		toggleRowSelection: function(oTable, oRowIndicator, bSelect, fnDoSelect) {
			if (oTable == null ||
				oTable.getBinding("rows") == null ||
				oTable.getSelectionMode() === SelectionMode.None ||
				oRowIndicator == null) {

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
				} else {

					if (oTable.isIndexSelected(iAbsoluteRowIndex)) {
						if (bSelect != null && bSelect) {
							return false;
						}
						oTable.removeSelectionInterval(iAbsoluteRowIndex, iAbsoluteRowIndex);
					} else {
						if (bSelect != null && !bSelect) {
							return false;
						}
						oTable.addSelectionInterval(iAbsoluteRowIndex, iAbsoluteRowIndex);
					}
				}

				delete oTable._iSourceRowIndex;
				return bSelectionChanged;
			}

			// Variable oRowIndicator is a row index value.
			if (typeof oRowIndicator === "number") {
				if (oRowIndicator < 0 || oRowIndicator >= oTable._getRowCount()) {
					return false;
				}
				return setSelectionState(oRowIndicator);

			// Variable oRowIndicator is a jQuery object or DOM element.
			} else {
				var $Cell = jQuery(oRowIndicator);
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
		 * @return {String|string|null}
		 * @private
		 */
		getNoDataText : function(oTable) {
			var oNoData = oTable.getNoData();
			if (oNoData instanceof Control) {
				return null;
			} else if (typeof oNoData === "string" || oTable.getNoData() instanceof String) {
				return oNoData;
			} else {
				return oTable._oResBundle.getText("TBL_NO_DATA");
			}
		},

		/**
		 * Returns the number of currently visible columns
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {int}
		 * @private
		 */
		getVisibleColumnCount : function(oTable) {
			return oTable._getVisibleColumns().length;
		},

		/**
		 * Returns the number of header rows
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {int}
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
		 * @return {int}
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
			return oTable._bVariableRowHeightEnabled && oTable.getFixedRowCount() <= 0 && oTable.getFixedBottomRowCount() <= 0;
		},

		/**
		 * Returns the logical number of rows
		 * Optionally empty visible rows are added (in case that the number of data
		 * rows is smaller than the number of visible rows)
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {boolean} bIncludeEmptyRows
		 * @return {int}
		 * @private
		 */
		getTotalRowCount : function(oTable, bIncludeEmptyRows) {
			var iRowCount = oTable._getRowCount();
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
			return Math.min(oTable.getVisibleRowCount(), oTable._getRowCount());
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
		 * @return {int}
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
		 * @return {boolean}
		 * @private
		 */
		isFixedColumn : function(oTable, iColIdx) {
			return iColIdx < oTable.getFixedColumnCount();
		},

		/**
		 * Returns whether the table has fixed columns.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {boolean}
		 * @private
		 */
		hasFixedColumns : function(oTable) {
			return oTable.getFixedColumnCount() > 0;
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
				iRowIndex =  aRowIndexMatch == null || aRowIndexMatch[1] == null ? 0 : parseInt(aRowIndexMatch[1], 10);

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
		 * @return {Object}
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
			if (oTable == null || oElement == null) {
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

			if ($Cell === null || $Cell[0] === $Element[0]) {
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
		 * @return {int|undefined} ResizeHandler ID or undefined if the DOM element could not be found
		 * @private
		 */
		registerResizeHandler : function(oTable, sIdSuffix, fnHandler, bRegisterParent) {
			var oDomRef;
			if (typeof sIdSuffix == "string") {
				oDomRef = oTable.getDomRef(sIdSuffix);
			} else {
				jQuery.sap.log.error("sIdSuffix must be a string", oTable);
				return;
			}

			if (typeof fnHandler !== "function") {
				jQuery.sap.log.error("fnHandler must be a function", oTable);
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
			} else if (jQuery.isArray(vIdSuffix)) {
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
			var aContentDensityStyleClasses = ["sapUiSizeCompact", "sapUiSizeCondensed", "sapUiSizeCozy"];

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
				jQuery.sap.log.warning("The selection mode 'Multi' is deprecated and must not be used anymore. Your setting was defaulted to selection mode 'MultiToggle'");
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

				if (oTable._iBindingLength >= iVisibleRowCount) {
					iFirstFixedButtomIndex = iVisibleRowCount - iFixedBottomRowCount;
				} else {
					var iIdx = oTable._iBindingLength - iFixedBottomRowCount - iFirstVisibleRow;
					if (iIdx >= 0 && (iFirstVisibleRow + iIdx) < oTable._iBindingLength) {
						iFirstFixedButtomIndex = iIdx;
					}
				}
			}

			return iFirstFixedButtomIndex;
		}

	};

	TableGrouping.TableUtils = TableUtils; // Avoid cyclic dependency
	TableColumnUtils.TableUtils = TableUtils; // Avoid cyclic dependency
	TableMenuUtils.TableUtils = TableUtils; // Avoid cyclic dependency

	return TableUtils;

}, /* bExport= */ true);
