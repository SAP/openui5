/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils.TableUtils.
sap.ui.define([
	"./_GroupingUtils",
	"./_ColumnUtils",
	"./_MenuUtils",
	"./_BindingUtils",
	"./_HookUtils",
	"../library",
	"sap/ui/base/Object",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/library",
	"sap/ui/core/theming/Parameters",
	"sap/ui/model/ChangeReason",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/restricted/_throttle"
], function(
	GroupingUtils,
	ColumnUtils,
	MenuUtils,
	BindingUtils,
	HookUtils,
	library,
	BaseObject,
	ResizeHandler,
	coreLibrary,
	ThemeParameters,
	ChangeReason,
	jQuery,
	throttle
) {
	"use strict";

	// Shortcuts
	var SelectionBehavior = library.SelectionBehavior;
	var SelectionMode = library.SelectionMode;
	var MessageType = coreLibrary.MessageType;

	/**
	 * The resource bundle of the sap.ui.table library.
	 * @type {module:sap/base/i18n/ResourceBundle}
	 */
	var oResourceBundle;
	var iBaseFontSize = null;

	/**
	 * Table cell type.
	 *
	 * @type {sap.ui.table.utils.TableUtils.CellType}
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.table.utils.TableUtils.CellType
	 * @property {int} DATACELL - Data cell.
	 * @property {int} COLUMNHEADER - Column header cell.
	 * @property {int} ROWHEADER - Row header cell.
	 * @property {int} ROWACTION - Row action cell.
	 * @property {int} COLUMNROWHEADER - SelectAll cell.
	 * @property {int} ANYCONTENTCELL - Any cell of a row in the table content area (table body).
	 * @property {int} ANYCOLUMNHEADER - Any cell of a row in the table header area (table head).
	 * @property {int} ANYROWHEADER - Any row header cell (including the SelectAll cell).
	 * @property {int} ANY - Any table cell.
	 * @property {int} PSEUDO - Any element that imitates a table cell.
	 */
	var CELLTYPE = {
		DATACELL: 1 << 1,
		COLUMNHEADER: 1 << 2,
		ROWHEADER: 1 << 3,
		ROWACTION: 1 << 4,
		COLUMNROWHEADER: 1 << 5,
		PSEUDO: 1 << 6
	};
	CELLTYPE.ANYCONTENTCELL = CELLTYPE.ROWHEADER | CELLTYPE.DATACELL | CELLTYPE.ROWACTION;
	CELLTYPE.ANYCOLUMNHEADER = CELLTYPE.COLUMNHEADER | CELLTYPE.COLUMNROWHEADER;
	CELLTYPE.ANYROWHEADER = CELLTYPE.ROWHEADER | CELLTYPE.COLUMNROWHEADER;
	CELLTYPE.ANY = CELLTYPE.ANYCONTENTCELL | CELLTYPE.ANYCOLUMNHEADER;

	/**
	 * The default row base size in pixels for the different content densities for the current theme. If no theme is applied, default values are used.
	 *
	 * @type {sap.ui.table.utils.TableUtils.BaseSize}
	 * @static
	 * @typedef {object} sap.ui.table.utils.TableUtils.BaseSize
	 * @property {int} sapUiSizeCondensed - The default base size in pixels in condensed content density.
	 * @property {int} sapUiSizeCompact - The default base siz in pixels in compact content density.
	 * @property {int} sapUiSizeCozy - The default base siz in pixels in cozy content density.
	 * @property {int} undefined - The default base siz in pixels in case no content density information is available.
	 */
	var mBaseSize = {
		sapUiSizeCozy: 48,
		sapUiSizeCompact: 32,
		sapUiSizeCondensed: 24,
		undefined: 32
	};

	/**
	 * The base border width in pixels for the current theme. If no theme is applied, a default value is used.
	 *
	 * @type {int}
	 * @static
	 */
	var iBaseBorderWidth = 1;

	/**
	 * The horizontal frame size of a row in pixels for the current theme. The frame size includes, for example, the row border width. If no theme is
	 * applied, a default value is used.
	 *
	 * @type {int}
	 * @static
	 */
	var iRowHorizontalFrameSize = 1;

	/**
	 * The default row heights in pixels for the different content densities for the current theme. If no theme is applied, default values are used.
	 *
	 * @type {sap.ui.table.utils.TableUtils.DefaultRowHeight}
	 * @static
	 * @typedef {object} sap.ui.table.utils.TableUtils.DefaultRowHeight
	 * @property {int} sapUiSizeCondensed - The default height of a row in pixels in condensed content density.
	 * @property {int} sapUiSizeCompact - The default height of a row in pixels in compact content density.
	 * @property {int} sapUiSizeCozy - The default height of a row in pixels in cozy content density.
	 * @property {int} undefined - The default height of a row in pixels in case no content density information is available.
	 */
	var mDefaultRowHeight = {
		sapUiSizeCozy: mBaseSize.sapUiSizeCozy + iRowHorizontalFrameSize,
		sapUiSizeCompact: mBaseSize.sapUiSizeCompact + iRowHorizontalFrameSize,
		sapUiSizeCondensed: mBaseSize.sapUiSizeCondensed + iRowHorizontalFrameSize,
		undefined: mBaseSize.undefined + iRowHorizontalFrameSize
	};

	/**
	 * The theme-based parameters. If no theme is applied, default values are used.
	 *
	 * @type {sap.ui.table.utils.TableUtils.ThemeParameters}
	 * @static
	 * @typedef {object} sap.ui.table.utils.TableUtils.ThemeParameters
	 * @property {string} navigationIcon - Name of the navigation icon.
	 * @property {string} deleteIcon - Name of the delete icon.
	 * @property {string} clearSelectionIcon - Name of the clearSelection icon.
	 * @property {int} navIndicatorWidth - Width of the navigation indicator
	 */
	var mThemeParameters = {
		navigationIcon: "navigation-right-arrow",
		deleteIcon: "sys-cancel",
		clearSelectionIcon: "clear-all",
		navIndicatorWidth: 3
	};

	/**
	 * Reason for updates of the rows. Inherits from {@link sap.ui.model.ChangeReason}.
	 *
	 * @type {sap.ui.table.utils.TableUtils.ROWS_UPDATE_REASON}
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.table.utils.TableUtils.ROWS_UPDATE_REASON
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
		Zoom: "Zoom",
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
	 * @alias sap.ui.table.utils.TableUtils
	 * @private
	 */
	var TableUtils = {
		// Make other utils available.
		Grouping: GroupingUtils,
		Column: ColumnUtils,
		Menu: MenuUtils,
		Binding: BindingUtils,
		Hook: HookUtils,

		CELLTYPE: CELLTYPE,
		BaseSize: mBaseSize,
		BaseBorderWidth: iBaseBorderWidth,
		RowHorizontalFrameSize: iRowHorizontalFrameSize,
		DefaultRowHeight: mDefaultRowHeight,
		RowsUpdateReason: ROWS_UPDATE_REASON,
		INTERACTIVE_ELEMENT_SELECTORS: INTERACTIVE_ELEMENT_SELECTORS,
		ThemeParameters: mThemeParameters,

		/**
		 * Returns whether the table has row header cells.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table has row header cells.
		 */
		hasRowHeader: function(oTable) {
			return (oTable.getSelectionMode() !== SelectionMode.None && oTable.getSelectionBehavior() !== SelectionBehavior.RowOnly)
				   || GroupingUtils.isInGroupMode(oTable);
		},

		/**
		 * Returns whether the table has a SelectAll checkbox.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table has a SelectAll checkbox.
		 */
		hasSelectAll: function(oTable) {
			var sSelectionMode = oTable ? oTable.getSelectionMode() : SelectionMode.None;
			return sSelectionMode === SelectionMode.MultiToggle && oTable.getEnableSelectAll();
		},

		/**
		 * Returns whether the table has row highlights.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table has row highlights.
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
		 * Returns whether the table has navigation indicators for rows.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table has navigation indicators for rows
		 */
		hasRowNavigationIndicators: function(oTable) {
			if (!oTable) {
				return false;
			}

			var oRowSettingsTemplate = oTable.getRowSettingsTemplate();

			if (!oRowSettingsTemplate) {
				return false;
			}

			var bNavigated = oRowSettingsTemplate.getNavigated();

			return oRowSettingsTemplate.isBound("navigated") || bNavigated;
		},

		/**
		 * Returns whether the table has a row action column.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table has row actions.
		 */
		hasRowActions: function(oTable) {
			var oRowActionTemplate = oTable ? oTable.getRowActionTemplate() : null;

			return oRowActionTemplate != null
				   && (oRowActionTemplate.isBound("visible") || oRowActionTemplate.getVisible())
				   && oTable.getRowActionCount() > 0;
		},

		/**
		 * Returns whether selection is allowed on the cells of a row (not row selector).
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether selection is also possible on cells that are no selection cells.
		 */
		isRowSelectionAllowed: function(oTable) {
			return oTable.getSelectionMode() !== SelectionMode.None &&
				   (oTable.getSelectionBehavior() === SelectionBehavior.Row || oTable.getSelectionBehavior() === SelectionBehavior.RowOnly);
		},

		/**
		 * Returns whether selection is allowed via the row selector.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether selection is possible on selection cells.
		 */
		isRowSelectorSelectionAllowed: function(oTable) {
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

			var oSelectionPlugin = oTable._getSelectionPlugin();
			var iSelectableRowCount = oSelectionPlugin.getSelectableCount();
			var iSelectedRowCount = oSelectionPlugin.getSelectedCount();

			return iSelectableRowCount > 0 && iSelectableRowCount === iSelectedRowCount;
		},

        /**
		 * Checks whether the "no data text" is shown. Pure API check, the actual DOM is not considered.
		 * The "no data text" is shown if the table has no visible columns, or if the <code>showNoData</code> property is <code>true</code> and the
		 * table has no data.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the no data text is shown.
		 */
		isNoDataVisible: function(oTable) {
			return oTable.getShowNoData() && !oTable._getRowMode().isNoDataDisabled() && !TableUtils.hasData(oTable)
				   || TableUtils.getVisibleColumnCount(oTable) === 0;
		},

		/**
		 * Returns whether the table currently has data.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table has data.
		 */
		hasData: function(oTable) {
			var oBinding = oTable.getBinding();
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
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the busy indicator is visible.
		 */
		isBusyIndicatorVisible: function(oTable) {
			if (!oTable || !oTable.getDomRef()) {
				return false;
			}

			return oTable.getDomRef().querySelector("#" + oTable.getId() + "-sapUiTableGridCnt > .sapUiLocalBusyIndicator") != null;
		},

		/**
		 * Checks whether an object is of the given type(s).
		 * Wrapper for {@link sap.ui.base.Object.isA}.
		 *
		 * @param {Object} oObject Object which will be checked whether it is an instance of the given type.
		 * @param {string | string[]} vTypeName Type or types to check for.
		 * @see sap.ui.base.Object.isA
		 * @returns {boolean} Whether this object is an instance of the given type or of any of the given types.
		 */
		isA: function(oObject, vTypeName) {
			return BaseObject.isA(oObject, vTypeName);
		},

		/**
		 * Toggles the selection state of the row which contains the given cell DOM element.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery | HTMLElement | int} vRowIndicator The data cell in the row, or the data row index of the row,
		 *                                                   where the selection state should be toggled.
		 * @param {boolean} [bSelect] If defined, then instead of toggling the desired state is set.
		 * @param {Function} [fnDoSelect] If defined, then instead of the default selection code, this custom callback is used.
		 * @returns {boolean} Returns <code>true</code> if the selection state of the row has been changed.
		 */
		toggleRowSelection: function(oTable, vRowIndicator, bSelect, fnDoSelect) {
			if (!oTable ||
				!oTable.getBinding() ||
				oTable.getSelectionMode() === SelectionMode.None ||
				vRowIndicator == null) {

				return false;
			}

			var oSelectionPlugin = oTable._getSelectionPlugin();

			function setSelectionState(iAbsoluteRowIndex) {
				if (!oSelectionPlugin.isIndexSelectable(iAbsoluteRowIndex)) {
					return false;
				}

				oTable._iSourceRowIndex = iAbsoluteRowIndex; // To indicate that the selection was changed by user interaction.

				var bSelectionChanged = false;

				if (fnDoSelect) {
					bSelectionChanged = fnDoSelect(iAbsoluteRowIndex, bSelect);
				} else if (oSelectionPlugin.isIndexSelected(iAbsoluteRowIndex)) {
					if (bSelect !== true) {
						bSelectionChanged = true;
						oSelectionPlugin.removeSelectionInterval(iAbsoluteRowIndex, iAbsoluteRowIndex);
					}
				} else if (bSelect !== false) {
					bSelectionChanged = true;
					oSelectionPlugin.addSelectionInterval(iAbsoluteRowIndex, iAbsoluteRowIndex);
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

				if (!TableUtils.Grouping.isInGroupHeaderRow($Cell[0])
					&& ((oCellInfo.isOfType(TableUtils.CELLTYPE.DATACELL | TableUtils.CELLTYPE.ROWACTION) && bIsRowSelectionAllowed)
						|| (oCellInfo.isOfType(TableUtils.CELLTYPE.ROWHEADER) && TableUtils.isRowSelectorSelectionAllowed(oTable)))) {

					var iAbsoluteRowIndex = oTable.getRows()[oCellInfo.rowIndex].getIndex();

					return setSelectionState(iAbsoluteRowIndex);
				}

				return false;
			}
		},

		/**
		 * Gets the message to be displayed if the table contains no columns or no data.
		 *
		 * @param oTable Instance of the table.
		 * @returns {Control | string} The no data control or text message.
		 */
		getNoContentMessage: function(oTable) {
			if (oTable._getVisibleColumns().length > 0) {
				return oTable.getNoData();
			} else {
				return oTable.getAggregation("_noColumnsMessage");
			}
		},

		/**
		 * Gets the text to be displayed as the "no data text".
		 * If a control is set for the <code>noData</code> aggregation, <code>null</code> is returned.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {string | null} The no data text.
		 */
		getNoDataText: function(oTable) {
			var vNoData = oTable.getNoData();

			if (TableUtils.getVisibleColumnCount(oTable) === 0 && !TableUtils.isA(vNoData, "sap.m.IllustratedMessage")) {
				return TableUtils.getResourceText("TBL_NO_COLUMNS");
			}

			if (TableUtils.isA(vNoData, "sap.ui.core.Control")) {
				return null;
			} else if (typeof vNoData === "string") {
				return vNoData;
			} else {
				return TableUtils.getResourceText("TBL_NO_DATA");
			}
		},

		/**
		 * Returns the number of currently rendered columns.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The number of currently rendered columns.
		 */
		getVisibleColumnCount: function(oTable) {
			return oTable._getVisibleColumns().length;
		},

		/**
		 * Returns the number of header rows.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The number of rows in the table header.
		 */
		getHeaderRowCount: function(oTable) {

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

		/**
		 * Checks whether all conditions for pixel-based scrolling (Variable Row Height) are fulfilled.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether variable row height support is enabled.
		 */
		isVariableRowHeightEnabled: function(oTable) {
			var mRowCounts = oTable._getRowCounts();
			return oTable && oTable._bVariableRowHeightEnabled && !mRowCounts.fixedTop && !mRowCounts.fixedBottom;
		},

		/**
		 * Returns the number of rows that are not empty.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The number of rows that are not empty.
		 */
		getNonEmptyRowCount: function(oTable) {
			return Math.min(oTable._getRowCounts().count, oTable._getTotalRowCount());
		},

		/**
		 * Returns a combined info about the currently focused item (based on the item navigation).
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {sap.ui.table.utils.TableUtils.FocusedItemInfo | null} Returns the information about the focused item, or <code>null</code>, if the
		 *                                                           item navigation is not yet initialized.
		 * @typedef {object} sap.ui.table.utils.TableUtils.FocusedItemInfo
		 * @property {int} cell Index of focused cell in the ItemNavigation.
		 * @property {int} columnCount Number of columns in the ItemNavigation.
		 * @property {int} cellInRow Index of the cell in the row.
		 * @property {int} row Index of row in the ItemNavigation.
		 * @property {int} cellCount Number of cells in the ItemNavigation.
		 * @property {HTMLElement | undefined} domRef Reference to the focused DOM element.
		 */
		getFocusedItemInfo: function(oTable) {
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
		 * Returns the index of the row (in the rows aggregation) of the current focused cell.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The row index.
		 *
		 */
		getRowIndexOfFocusedCell: function(oTable) {
			var oInfo = TableUtils.getFocusedItemInfo(oTable);
			return oInfo.row - TableUtils.getHeaderRowCount(oTable);
		},

		/**
		 * Returns whether column with the given index (in the array of visible columns (see Table._getVisibleColumns()))
		 * is a fixed column.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int} iColumnIndex Index of column in the tables columns aggregation.
		 * @returns {boolean} Whether the column is fixed.
		 */
		isFixedColumn: function(oTable, iColumnIndex) {
			return iColumnIndex < oTable.getComputedFixedColumnCount();
		},

		/**
		 * Returns whether the table has fixed columns.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table has fixed column.
		 */
		hasFixedColumns: function(oTable) {
			return oTable.getComputedFixedColumnCount() > 0;
		},

		/**
		 * Focus the item with the given index in the item navigation.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int} iIndex Index of item in ItemNavigation which shall get the focus.
		 * @param {Object} oEvent The event object.
		 */
		focusItem: function(oTable, iIndex, oEvent) {
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
		 * @typedef {object} sap.ui.table.utils.TableUtils.CellInfo
		 * @property {sap.ui.table.utils.TableUtils.CellType} [type] The type of the cell.
		 * @property {int | null} [rowIndex] The index of the row the cell is inside.
		 * @property {int | null} columnIndex The index of the column, in the <code>columns</code> aggregation, the cell is inside.
		 * @property {int | null} columnSpan The amount of columns the cell spans over.
		 * @property {jQuery | null} cell The jQuery reference to the table cell.
		 * @property {sap.ui.table.utils.TableUtils.CellInfo#isOfType} isOfType Function to check for the type of the cell.
		 */

		/**
		 * Collects all available information of a table cell by reading the DOM and returns them in a single object.
		 *
		 * @param {jQuery | HTMLElement} oCellRef DOM reference of a table cell.
		 * @returns {sap.ui.table.utils.TableUtils.CellInfo} An object containing information about the cell.
		 * @see sap.ui.table.utils.TableUtils.CellInfo
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

			if ($Cell.hasClass("sapUiTableDataCell")) {
				sColumnId = $Cell.attr("data-sap-ui-colid");
				oColumn = sap.ui.getCore().byId(sColumnId);

				oCellInfo.type = TableUtils.CELLTYPE.DATACELL;
				oCellInfo.rowIndex = parseInt($Cell.parent().attr("data-sap-ui-rowindex"));
				oCellInfo.columnIndex = oColumn.getIndex();
				oCellInfo.columnSpan = 1;

			} else if ($Cell.hasClass("sapUiTableHeaderDataCell")) {
				rRowIndex = /_([\d]+)/;
				sColumnId = $Cell.attr("id");
				aRowIndexMatch = rRowIndex.exec(sColumnId);
				iRowIndex = aRowIndexMatch && aRowIndexMatch[1] != null ? parseInt(aRowIndexMatch[1]) : 0;

				oCellInfo.type = TableUtils.CELLTYPE.COLUMNHEADER;
				oCellInfo.rowIndex = iRowIndex;
				oCellInfo.columnIndex = parseInt($Cell.attr("data-sap-ui-colindex"));
				oCellInfo.columnSpan = parseInt($Cell.attr("colspan") || 1);

			} else if ($Cell.hasClass("sapUiTableRowSelectionCell")) {
				oCellInfo.type = TableUtils.CELLTYPE.ROWHEADER;
				oCellInfo.rowIndex = parseInt($Cell.parent().attr("data-sap-ui-rowindex"));
				oCellInfo.columnIndex = -1;
				oCellInfo.columnSpan = 1;

			} else if ($Cell.hasClass("sapUiTableRowActionCell")) {
				oCellInfo.type = TableUtils.CELLTYPE.ROWACTION;
				oCellInfo.rowIndex = parseInt($Cell.parent().attr("data-sap-ui-rowindex"));
				oCellInfo.columnIndex = -2;
				oCellInfo.columnSpan = 1;

			} else if ($Cell.hasClass("sapUiTableRowSelectionHeaderCell")) {
				oCellInfo.type = TableUtils.CELLTYPE.COLUMNROWHEADER;
				oCellInfo.columnIndex = -1;
				oCellInfo.columnSpan = 1;

			} else if ($Cell.hasClass("sapUiTablePseudoCell")) {
				sColumnId = $Cell.attr("data-sap-ui-colid");
				oColumn = sap.ui.getCore().byId(sColumnId);

				oCellInfo.type = TableUtils.CELLTYPE.PSEUDO;
				oCellInfo.rowIndex = -1;
				oCellInfo.columnIndex = oColumn ? oColumn.getIndex() : -1;
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
			 * @alias sap.ui.table.utils.TableUtils.CellInfo#isOfType
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
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int} iRowIdx Index of row in the tables rows aggregation.
		 * @param {int} iColIdx Index of column in the list of visible columns.
		 * @param {boolean} bIdxInColumnAgg Whether the given column index is the index in the columns (<code>true</code>)
		 *                                  aggregation or in the list of visible columns (<code>false</code>).
		 * @returns {Object} An object containing references to the row, column and cell.
		 * @type {Object}
		 * @property {sap.ui.table.Row | null} row Row of the table.
		 * @property {sap.ui.table.Column | null} column Column of the table.
		 * @property {sap.ui.core.Control | null} cell Cell control of row/column.
		 */
		getRowColCell: function(oTable, iRowIdx, iColIdx, bIdxInColumnAgg) {
			var oRow = oTable.getRows()[iRowIdx] || null;
			var aColumns = bIdxInColumnAgg ? oTable.getColumns() : oTable._getVisibleColumns();
			var oColumn = aColumns[iColIdx] || null;
			var Column;
			var oCell = null;

			if (oRow && oColumn) {
				if (!Column) {
					var ColumnMetadata = oColumn.getMetadata();
					while (ColumnMetadata.getName() !== "sap.ui.table.Column") {
						ColumnMetadata = ColumnMetadata.getParent();
					}
					Column = ColumnMetadata.getClass();
				}

				oCell = oRow.getCells().find(function(oCell) {
					return oColumn === Column.ofCell(oCell);
				}) || null;
			}

			return {row: oRow, column: oColumn, cell: oCell};
		},

		/**
		 * Returns the table cell which is either the parent of an element, or returns the element if it is a table cell itself.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table used as the context within which to search for the cell.
		 * @param {jQuery | HTMLElement} oElement A table cell or an element inside a table cell.
		 * @param {jQuery | HTMLElement} [bIncludePseudoCells=false] Whether to include pseudo cells.
		 * @returns {jQuery | null} Returns <code>null</code>, if the element is neither a table cell nor inside a table cell.
		 */
		getCell: function(oTable, oElement, bIncludePseudoCells) {
			bIncludePseudoCells = bIncludePseudoCells === true;

			if (!oTable || !oElement) {
				return null;
			}

			var $Element = jQuery(oElement);
			var oTableElement = oTable.getDomRef();
			var sSelector = ".sapUiTableCell";

			if (!bIncludePseudoCells) {
				sSelector += ":not(.sapUiTablePseudoCell)";
			}

			var $Cell = $Element.closest(sSelector, oTableElement);

			if ($Cell.length > 0) {
				return $Cell;
			}

			return null;
		},

		/**
		 * Returns the table cell which is the parent of an element.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table used as the context within which to search for the parent cell.
		 * @param {jQuery | HTMLElement} oElement An element inside a table cell.
		 * @param {jQuery | HTMLElement} [bIncludePseudoCells=false] Whether to include pseudo cells.
		 * @returns {jQuery | null} Returns <code>null</code>, if the element is not inside a table cell.
		 */
		getParentCell: function(oTable, oElement, bIncludePseudoCells) {
			bIncludePseudoCells = bIncludePseudoCells === true;

			var $Element = jQuery(oElement);
			var $Cell = TableUtils.getCell(oTable, oElement, bIncludePseudoCells);

			if (!$Cell || $Cell[0] === $Element[0]) {
				return null; // The element is not inside a table cell.
			} else {
				return $Cell;
			}
		},

		/**
		 * Registers a resize handler for a DOM element identified by its ID suffix. If a resize handler with this ID already exists, it is
		 * deregistered before registering the new one.
		 *
		 * @param {sap.ui.table.Table} oTable
		 *     Instance of the table.
		 * @param {string} sHandlerId
		 *     ID of the resize handler. Required to deregister the resize handler.
		 * @param {Function} fnHandler
		 *     Function to handle the resize event.
		 * @param {string} [sDOMIdSuffix=""]
		 *     ID suffix to identify the DOM element for which to register the resize handler.
		 * @param {boolean} [bRegisterParent=false]
		 *     Whether to register the resize handler for the parent DOM element of the one identified by <code>sDOMIdSuffix</code>.
		 * @returns {int | undefined} Resize handler ID, or <code>undefined</code> if the DOM element could not be found.
		 */
		registerResizeHandler: function(oTable, sHandlerId, fnHandler, sDOMIdSuffix, bRegisterParent) {
			sDOMIdSuffix = sDOMIdSuffix == null ? "" : sDOMIdSuffix;
			bRegisterParent = bRegisterParent === true;

			if (!oTable || typeof sHandlerId !== "string" || typeof fnHandler !== "function") {
				return undefined;
			}

			var oDomRef = oTable.getDomRef(sDOMIdSuffix);

			TableUtils.deregisterResizeHandler(oTable, sHandlerId);

			if (!oTable._mResizeHandlerIds) {
				oTable._mResizeHandlerIds = {};
			}

			if (bRegisterParent && oDomRef) {
				oDomRef = oDomRef.parentNode;
			}

			if (oDomRef) {
				oTable._mResizeHandlerIds[sHandlerId] = ResizeHandler.register(oDomRef, fnHandler);
			}

			return oTable._mResizeHandlerIds[sHandlerId];
		},

		/**
		 * Deregister resize handlers. If no resize handler id is given, all known resize handlers are deregistered.
		 *
		 * @param {sap.ui.table.Table} oTable
		 *     Instance of the table.
		 * @param {string | Array.<string> | undefined} [vHandlerId]
		 *     ID of the resize handler to deregister. If not specified, all resize handlers are deregistered.
		 */
		deregisterResizeHandler: function(oTable, vHandlerId) {
			var aHandlerIds = [];

			if (!oTable._mResizeHandlerIds) {
				// no resize handler registered so far
				return;
			}

			if (typeof vHandlerId === "string") {
				aHandlerIds.push(vHandlerId);
			} else if (vHandlerId === undefined) {
				// deregister all resize handlers if no specific is named
				for (var sKey in oTable._mResizeHandlerIds) {
					if (typeof sKey == "string" && oTable._mResizeHandlerIds.hasOwnProperty(sKey)) {
						aHandlerIds.push(sKey);
					}
				}
			} else if (Array.isArray(vHandlerId)) {
				aHandlerIds = vHandlerId;
			}

			for (var i = 0; i < aHandlerIds.length; i++) {
				var sHandlerId = aHandlerIds[i];

				if (oTable._mResizeHandlerIds[sHandlerId]) {
					ResizeHandler.deregister(oTable._mResizeHandlerIds[sHandlerId]);
					oTable._mResizeHandlerIds[sHandlerId] = undefined;
				}
			}
		},

		/**
		 * Checks whether the cell of the given DOM reference is in the first row (from DOM point of view) of the scrollable area.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery | HTMLElement | int} row Cell DOM reference or row index.
		 * @returns {boolean} Whether the row is the first scrollable row of the table based on the data.
		 */
		isFirstScrollableRow: function(oTable, row) {
			if (isNaN(row)) {
				var $Ref = jQuery(row);
				row = parseInt($Ref.add($Ref.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"));
			}
			return row == oTable._getRowCounts().fixedTop;
		},

		/**
		 * Checks whether the cell of the given DOM reference is in the last row (from DOM point of view) of the scrollable area.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery | HTMLElement | int} row The row element or row index.
		 * @returns {boolean} Whether the row is the last scrollable row of the table based on the data.
		 */
		isLastScrollableRow: function(oTable, row) {
			if (isNaN(row)) {
				var $Ref = jQuery(row);
				row = parseInt($Ref.add($Ref.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"));
			}
			var mRowCounts = oTable._getRowCounts();
			return row == mRowCounts.count - mRowCounts.fixedBottom - 1;
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
		 * @param {sap.ui.table.Table} oControl Instance of the table.
		 * @returns {string | undefined} name of the content density style class or undefined if none was found.
		 */
		getContentDensity: function(oControl) {
			var sContentDensity;
			var aContentDensityStyleClasses = ["sapUiSizeCondensed", "sapUiSizeCompact", "sapUiSizeCozy"];

			var fnGetContentDensity = function(sFnName, oObject) {
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
		 * Checks if the given CSS width is variable.
		 *
		 * @param {string} sWidth The CSS width.
		 * @returns {boolean} Whether the width is variable/flexible.
		 */
		isVariableWidth: function(sWidth) {
			return !sWidth || sWidth == "auto" || sWidth.toString().match(/%$/);
		},

		/**
		 * Returns the index of the first fixed bottom row in the <code>rows</code> aggregation.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The index of the first fixed bottom row in the <code>rows</code> aggregation, or <code>-1</code>.
		 */
		getFirstFixedBottomRowIndex: function(oTable) {
			var mRowCounts = oTable._getRowCounts();

			if (!oTable.getBinding() || mRowCounts.fixedBottom === 0) {
				return -1;
			}

			var iFirstFixedBottomIndex = -1;
			var iFirstVisibleRow = oTable.getFirstVisibleRow();
			var iTotalRowCount = oTable._getTotalRowCount();

			if (iTotalRowCount >= mRowCounts.count) {
				iFirstFixedBottomIndex = mRowCounts.count - mRowCounts.fixedBottom;
			} else {
				var iIdx = iTotalRowCount - mRowCounts.fixedBottom - iFirstVisibleRow;
				if (iIdx >= 0 && (iFirstVisibleRow + iIdx) < iTotalRowCount) {
					iFirstFixedBottomIndex = iIdx;
				}
			}

			return iFirstFixedBottomIndex;
		},

		/**
		 * Gets the resource bundle of the sap.ui.table library. The bundle will be loaded if it is not already loaded or if it should be reloaded.
		 * After the bundle is loaded, {@link sap.ui.table.utils.TableUtils.getResourceText} can be used to get texts.
		 *
		 * @param {object} [mOptions] Configuration options
		 * @param {boolean} [mOptions.async=false] Whether to load the bundle asynchronously.
		 * @param {boolean} [mOptions.reload=false] Whether to reload the bundle, if it already was loaded.
		 * @returns {module:sap/base/i18n/ResourceBundle | Promise} The resource bundle, or a Promise if the bundle is loaded asynchronously.
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
		 * Gets a resource text, if the resource bundle was already loaded with {@link sap.ui.table.utils.TableUtils.getResourceBundle}.
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
		 * @param {U} [oThis] Context in the function calls, or in the callback if <code>vCall</code> is a function. Default is <code>vObject</code>.
		 * @returns {undefined | Array.<*>} If <code>vCall</code> is a map, the return values of the calls are returned. In case of multiple calls, an
		 *                                  array of return values is returned.
		 * @template T, U
		 */
		dynamicCall: function(vObject, vCall, oThis) {
			var oObject = typeof vObject === "function" ? vObject() : vObject;

			if (!oObject || !vCall) {
				return undefined;
			}

			oThis = oThis || oObject;

			if (typeof vCall === "function") {
				vCall.call(oThis, oObject);
				return undefined;
			} else {
				var aParameters;
				var aReturnValues = [];
				for (var sFunctionName in vCall) {
					if (typeof oObject[sFunctionName] === "function") {
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
		 * Wrapper for the lodash <code>throttle</code> function.
		 * Adds the option for asynchronous leading invocations.
		 *
		 * @param {Function} fn The function to throttle.
		 * @param {int} iWait The number of milliseconds to throttle invocations to.
		 * @param {Object} [mOptions] Additional options that influence when the throttled method is invoked.
		 * @param {boolean} [mOptions.leading=true] Whether the method should be invoked on the first call.
		 * @param {boolean} [mOptions.asyncLeading=false] Whether the leading invocation should be asynchronous.
		 * @param {boolean} [mOptions.trailing=true] Whether the method should be invoked after a certain time has passed.
		 * @returns {Function} A wrapper function around <code>fn</code>.
		 */
		throttle: function(fn, iWait, mOptions) {
			mOptions = Object.assign({
				leading: true,
				asyncLeading: false,
				trailing: true
			}, mOptions);

			var oCancelablePromise;
			var bIsCalling = false;
			var mLastCallInfo = {};
			var _fn;
			var _fnThrottled;

			if (mOptions.leading && mOptions.asyncLeading) {
				_fn = function() {
					if (bIsCalling) {

						var oPromise = Promise.resolve().then(function() {
							if (!oPromise.canceled) {
								fn.apply(mLastCallInfo.context, mLastCallInfo.args);
							}
							oCancelablePromise = null;
						});

						oPromise.cancel = function() {
							oPromise.canceled = true;
						};
						oCancelablePromise = oPromise;
					} else {
						fn.apply(this, arguments);
					}
				};
			} else {
				_fn = fn;
			}

			var fnThrottled = throttle(_fn, iWait, {
				leading: mOptions.leading,
				trailing: mOptions.trailing
			});

			if (mOptions.leading && mOptions.asyncLeading) {
				var fnCancel = fnThrottled.cancel;

				fnThrottled.cancel = function() {
					if (oCancelablePromise) {
						oCancelablePromise.cancel();
					}
					fnCancel();
				};

				_fnThrottled = Object.assign(function() {
					mLastCallInfo = {
						context: this,
						args: arguments
					};
					bIsCalling = true;
					fnThrottled.apply(this, arguments);
					bIsCalling = false;
				}, fnThrottled);
			} else {
				_fnThrottled = fnThrottled;
			}

			return _fnThrottled;
		},

		/**
		 * Creates a wrapper around a function. When calling the wrapper, the original function is called in the next frame (makes use of
		 * <code>requestAnimationFrame</code>).
		 * Multiple calls within the same frame are reduced to one call in the next frame, with the arguments of the last call.
		 * Scheduled calls can be canceled.
		 *
		 * @param {Function} fn The function to call in the next frame.
		 * @returns {Function} A wrapper function around <code>fn</code>.
		 */
		throttleFrameWise: function(fn) {
			var iAnimationFrameId = null;
			var fnThrottled = function() {
				fnThrottled.cancel();
				iAnimationFrameId = window.requestAnimationFrame(function(args) {
					fn.apply(this, args);
				}.bind(this, arguments));
			};

			fnThrottled.cancel = function() {
				window.cancelAnimationFrame(iAnimationFrameId);
				iAnimationFrameId = null;
			};

			return fnThrottled;
		},

		/**
		 * Returns all interactive elements in a cell.
		 *
		 * @param {jQuery | HTMLElement} oCell The cell from which to get the interactive elements.
		 * @returns {jQuery | null} Returns <code>null</code>, if the passed cell is not a cell or does not contain any interactive elements.
		 */
		getInteractiveElements: function(oCell) {
			if (!oCell) {
				return null;
			}

			var $Cell = jQuery(oCell);
			var oCellInfo = TableUtils.getCellInfo($Cell);

			if (oCellInfo.isOfType(CELLTYPE.ANY | CELLTYPE.PSEUDO)) {
				var $InteractiveElements = $Cell.find(INTERACTIVE_ELEMENT_SELECTORS);
				if ($InteractiveElements.length > 0) {
					return $InteractiveElements;
				}
			}

			return null;
		},

		/**
		 * Gets the first interactive element in the data cells of a row.
		 *
		 * @param {sap.ui.table.Row|sap.ui.table.CreationRow} oRow
		 * @param {boolean} [bRowActionCells=false] Indicates whether the <code>RowAction</code> cells are taken
		 * into consideration
		 * @return {HTMLElement|null} The first interactive DOM element
		 */
		getFirstInteractiveElement: function(oRow, bRowActionCells) {
			if (!oRow) {
				return null;
			}

			var oTable = oRow.getTable();
			var aCells = oRow.getCells();

			if (bRowActionCells === true && this.hasRowActions(oTable)) {
				aCells.push(oRow.getRowAction());
			}

			for (var i = 0; i < aCells.length; i++) {
				var oCellContent = aCells[i].getDomRef();
				var $Cell = this.getCell(oTable, oCellContent, true);
				var $InteractiveElements = TableUtils.getInteractiveElements($Cell);

				if ($InteractiveElements) {
					return $InteractiveElements[0];
				}
			}

			return null;
		},

		/**
		 * Converts the CSS size to pixels and returns it with or without unit. Can also be used to parse a pixel value string to an integer.
		 *
		 * @param {string} sCSSSize The CSSSize to convert.
		 * @param {boolean} [bWithUnit=false] Whether the value should be returned as a string with the unit.
		 * @returns {string | float | null} The pixel value as a number, or string if <code>bWithUnit</code> is <code>true</code>. Returns
		 *                                <code>null</code> if the CSS size could not be converted.
		 */
		convertCSSSizeToPixel: function(sCSSSize, bWithUnit) {
			var fPixelValue;

			if (typeof sCSSSize !== "string") {
				return null;
			}

			if (sCSSSize.endsWith("px")) {
				fPixelValue = parseFloat(sCSSSize);
			} else if (sCSSSize.endsWith("em") || sCSSSize.endsWith("rem")) {
				fPixelValue = parseFloat(sCSSSize) * TableUtils.getBaseFontSize();
			} else {
				return null;
			}

			if (bWithUnit) {
				return fPixelValue + "px";
			} else {
				return fPixelValue;
			}
		},

		/**
		 * Gets the base font size of the document in pixels. If this method is called while the base size cannot be retrieved from the document, a
		 * default font size of 16 (pixels) is returned.
		 *
		 * @returns {int} The base font size in pixels.
		 */
		getBaseFontSize: function() {
			if (iBaseFontSize == null) {
				var oDocumentRootElement = document.documentElement;
				if (oDocumentRootElement) {
					iBaseFontSize = parseInt(window.getComputedStyle(oDocumentRootElement).fontSize);
				}
			}

			return iBaseFontSize == null ? 16 : iBaseFontSize;
		},

		/**
		 * Reads the theme parameters and updates the corresponding variables used and provided by the utilities, e.g. row height values.
		 */
		readThemeParameters: function() {
			// Converting the row height CSS parameters (e.g. _sap_ui_table_RowHeight) is too complex (CSS calc()).
			// Therefore, the base sizes are used and calculation is done in JavaScript.

			var mParams = ThemeParameters.get({
				name: [
					"_sap_ui_table_BaseSize",
					"_sap_ui_table_BaseSizeCozy",
					"_sap_ui_table_BaseSizeCompact",
					"_sap_ui_table_BaseSizeCondensed",
					"_sap_ui_table_BaseBorderWidth",
					"_sap_ui_table_NavigationIcon",
					"_sap_ui_table_DeleteIcon",
					"_sap_ui_table_ClearSelectionIcon",
					"_sap_ui_table_NavIndicatorWidth"
				]
			});

			function getPixelValue(sThemeParameterName) {
				return TableUtils.convertCSSSizeToPixel(mParams[sThemeParameterName]);
			}

			mBaseSize.undefined = getPixelValue("_sap_ui_table_BaseSize");
			mBaseSize.sapUiSizeCozy = getPixelValue("_sap_ui_table_BaseSizeCozy");
			mBaseSize.sapUiSizeCompact = getPixelValue("_sap_ui_table_BaseSizeCompact");
			mBaseSize.sapUiSizeCondensed = getPixelValue("_sap_ui_table_BaseSizeCondensed");
			iBaseBorderWidth = getPixelValue("_sap_ui_table_BaseBorderWidth");

			iRowHorizontalFrameSize = iBaseBorderWidth;
			mDefaultRowHeight.undefined = mBaseSize.undefined + iRowHorizontalFrameSize;
			mDefaultRowHeight.sapUiSizeCozy = mBaseSize.sapUiSizeCozy + iRowHorizontalFrameSize;
			mDefaultRowHeight.sapUiSizeCompact = mBaseSize.sapUiSizeCompact + iRowHorizontalFrameSize;
			mDefaultRowHeight.sapUiSizeCondensed = mBaseSize.sapUiSizeCondensed + iRowHorizontalFrameSize;

			mThemeParameters.navigationIcon = mParams["_sap_ui_table_NavigationIcon"];
			mThemeParameters.deleteIcon = mParams["_sap_ui_table_DeleteIcon"];
			mThemeParameters.clearSelectionIcon = mParams["_sap_ui_table_ClearSelectionIcon"];
			mThemeParameters.navIndicatorWidth = getPixelValue("_sap_ui_table_NavIndicatorWidth");
		},

		/**
		 * Adds a delegate that listens to the events of an element.
		 *
		 * @param {sap.ui.core.Element} oElement The element to add the delegate to.
		 * @param {object} oDelegate The delegate object.
		 * @param {sap.ui.core.Element} [oThis] The context in the delegate's event listeners. The default is the delegate object itself.
		 */
		addDelegate: function(oElement, oDelegate, oThis) {
			if (oElement && oDelegate) {
				oElement.addDelegate(oDelegate, false, oThis ? oThis : oDelegate, false);
			}
		},

		/**
		 * Removes a delegate from an element.
		 *
		 * @param {sap.ui.core.Element} oElement The element to add the delegate to.
		 * @param {object} oDelegate The delegate object.
		 */
		removeDelegate: function(oElement, oDelegate) {
			if (oElement && oDelegate) {
				oElement.removeDelegate(oDelegate);
			}
		},

		/**
		 * Creates a <code>WeakMap</code> and returns a facade to simplify the access. Indirect access to the <code>WeakMap</code> is provided
		 * with the returned function. As the first argument, this function expects to receive the key of type <code>object</code>, and it returns the
		 * value for this key.
		 *
		 * Due to the usage of <code>WeakMap</code>, key and value have a weak reference. If there are no more references to the key, the
		 * value will also be picked up by the garbage collector. <b>Make sure to not hold any strong references to the these objects!</b>
		 *
		 * @example
		 * var oStorage = TableUtils.createWeakMapFacade();
		 * oStorage(oMyObject); // returns {}
		 * oStorage(oMyOtherObject); // returns {}
		 * oStorage(oMyObject).foo = "bar";
		 * oStorage(oMyObject); // returns {foo: "bar"}
		 * oStorage(oMyOtherObject); // returns {}
		 *
		 * @returns {function(object):object | null} The function to access a value by key. Returns <code>null</code> if the key is not an object.
		 */
		createWeakMapFacade: function() {
			var oWeakMap = new window.WeakMap();

			return function(oKey) {
				if (!oKey || !(typeof oKey === "object")) {
					return null;
				}

				if (!oWeakMap.has(oKey)) {
					oWeakMap.set(oKey, {});
				}

				return oWeakMap.get(oKey);
			};
		}
	};

	// Avoid cyclic dependency.
	GroupingUtils.TableUtils = TableUtils;
	ColumnUtils.TableUtils = TableUtils;
	MenuUtils.TableUtils = TableUtils;
	BindingUtils.TableUtils = TableUtils;
	HookUtils.TableUtils = TableUtils;

	return TableUtils;

}, /* bExport= */ true);