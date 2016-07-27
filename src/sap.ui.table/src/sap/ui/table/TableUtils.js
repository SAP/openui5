/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableUtils.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/ResizeHandler', './TableGrouping', './library'],
	function(jQuery, Control, ResizeHandler, TableGrouping, library) {
	"use strict";

	// shortcuts
	var SelectionBehavior = library.SelectionBehavior,
		NavigationMode = library.NavigationMode,
		SelectionMode = library.SelectionMode;

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

		/*
 		 * Known basic cell types in the table
		 */
		CELLTYPES : {
			DATACELL : "DATACELL", // standard data cell (standard, group or sum)
			COLUMNHEADER : "COLUMNHEADER", // column header
			ROWHEADER : "ROWHEADER", // row header (standard, group or sum)
			COLUMNROWHEADER : "COLUMNROWHEADER" // select all row selector (top left cell)
		},

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

			var oBinding = oTable.getBinding("rows"),
				iBindingLength = oTable._getRowCount(),
				bHasData = oBinding ? !!iBindingLength : false;

			if (oBinding && oBinding.providesGrandTotal) { // Analytical Binding
				var bHasTotal = oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures();
				bHasData = (bHasTotal && iBindingLength < 2) || (!bHasTotal && iBindingLength === 0) ? false : true;
			}

			return !bHasData;
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
		 * Toggles the expand / collapse state of the group which contains the given Dom element.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {Object} oRef DOM reference of an element within the table group header
		 * @param {boolean} [bExpand] If defined instead of toggling the desired state is set.
		 * @return {boolean} <code>true</code> when the operation was performed, <code>false</code> otherwise.
		 * @private
		 */
		toggleGroupHeader : function(oTable, oRef, bExpand) {
			var $Ref = jQuery(oRef),
				$GroupRef;

			if ($Ref.hasClass("sapUiTableTreeIcon")) {
				$GroupRef = $Ref.closest("tr");
			} else {
				$GroupRef = $Ref.closest(".sapUiTableGroupHeader");
			}

			var oBinding = oTable.getBinding("rows");
			if ($GroupRef.length > 0 && oBinding) {
				var iRowIndex = oTable.getFirstVisibleRow() + parseInt($GroupRef.attr("data-sap-ui-rowindex"), 10);
				var bIsExpanded = TableGrouping.toggleGroupHeader(oTable, iRowIndex, bExpand);
				var bChanged = bIsExpanded === true || bIsExpanded === false;
				if (bChanged && oTable._onGroupHeaderChanged) {
					oTable._onGroupHeaderChanged(iRowIndex, bIsExpanded);
				}
				return bChanged;
			}
			return false;
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
			} else {
				if (typeof oNoData === "string" || oTable.getNoData() instanceof String) {
					return oNoData;
				} else {
					return oTable._oResBundle.getText("TBL_NO_DATA");
				}
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
			if (!oTable.getColumnHeaderVisible()) {
				return 0;
			}
			var iHeaderRows = 0;
			jQuery.each(oTable._getVisibleColumns(), function(iIndex, oColumn) {
				iHeaderRows = Math.max(iHeaderRows,  oColumn.getMultiLabels().length);
			});
			return iHeaderRows > 0 ? iHeaderRows : 1;
		},

		/**
		 * Returns the height of the defined row, identified by its row index.
		 * @param {Object} oTable current table object
		 * @param {int} iRowIndex the index of the row which height is needed
		 * @private
		 */
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
		},

		/**
		 * Checks whether all conditions for pixel-based scrolling (Variable Row Height) are fulfilled.
		 * @param {Object} oTable current table object
		 * @returns {Boolean} true/false if fulfilled
		 * @private
		 */
		isVariableRowHeightEnabled : function(oTable) {
			return oTable._bVariableRowHeightEnabled
				&& oTable.getNavigationMode() === NavigationMode.Scrollbar
				&& oTable.getFixedRowCount() <= 0
				&& oTable.getFixedBottomRowCount() <= 0;
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
		 * @return {Object|null}
		 * @type {Object}
		 * @property {int} cell Index of focused cell in ItemNavigation
		 * @property {int} columnCount Number of columns in ItemNavigation
		 * @property {int} cellInRow Index of the cell in row
		 * @property {int} row Index of row in ItemNavigation
		 * @property {int} cellCount Number of cells in ItemNavigation
		 * @property {Object|undefined} domRef Focused DOM reference of undefined
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
		 * Returns the index of the column (in the array of visible columns (see Table._getVisibleColumns())) of the current focused cell
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @return {int}
		 * @private
		 */
		getColumnIndexOfFocusedCell : function(oTable) {
			var oInfo = TableUtils.getFocusedItemInfo(oTable);
			return oInfo.cellInRow - (TableUtils.hasRowHeader(oTable) ? 1 : 0);
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
		 * Returns whether the given cell is located in a group header.
		 * @param {Object} oCellRef DOM reference of table cell
		 * @return {boolean}
		 * @private
		 */
		isInGroupingRow : function(oCellRef) {
			var oInfo = TableUtils.getCellInfo(oCellRef);
			if (oInfo && oInfo.type === TableUtils.CELLTYPES.DATACELL) {
				return oInfo.cell.parent().hasClass("sapUiTableGroupHeader");
			} else if (oInfo && oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
				return oInfo.cell.hasClass("sapUiTableGroupHeader");
			}
			return false;
		},

		/**
		 * Returns whether the given cell is located in a analytical summary row.
		 * @param {Object} oCellRef DOM reference of table cell
		 * @return {boolean}
		 * @private
		 */
		isInSumRow : function(oCellRef) {
			var oInfo = TableUtils.getCellInfo(oCellRef);
			if (oInfo && oInfo.type === TableUtils.CELLTYPES.DATACELL) {
				return oInfo.cell.parent().hasClass("sapUiAnalyticalTableSum");
			} else if (oInfo && oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
				return oInfo.cell.hasClass("sapUiAnalyticalTableSum");
			}
			return false;
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
		 * Returns the cell type and the jQuery wrapper object of the given cell dom ref or
		 * null if the given dom element is not a table cell.
		 * {type: <TYPE>, cell: <$CELL>}
		 * @param {Object} oCellRef DOM reference of table cell
		 * @return {Object}
		 * @type {Object}
		 * @property {sap.ui.table.CELLTYPES} type
		 * @property {Object} cell jQuery object of the cell
		 * @see TableUtils.CELLTYPES
		 * @private
		 */
		getCellInfo : function(oCellRef) {
			if (!oCellRef) {
				return null;
			}
			var $Cell = jQuery(oCellRef);
			if ($Cell.hasClass("sapUiTableTd")) {
				return {type: TableUtils.CELLTYPES.DATACELL, cell: $Cell};
			} else if ($Cell.hasClass("sapUiTableCol")) {
				return {type: TableUtils.CELLTYPES.COLUMNHEADER, cell: $Cell};
			} else if ($Cell.hasClass("sapUiTableRowHdr")) {
				return {type: TableUtils.CELLTYPES.ROWHEADER, cell: $Cell};
			} else if ($Cell.hasClass("sapUiTableColRowHdr")) {
				return {type: TableUtils.CELLTYPES.COLUMNROWHEADER, cell: $Cell};
			}
			return null;
		},

		/**
		 * Returns the Row, Column and Cell instances for the given row index (in the rows aggregation)
		 * and column index (in the array of visible columns (see Table._getVisibleColumns()).
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {int} iRowIdx Index of row in the tables rows aggregation
		 * @param {int} iColIdx Index of column in the tables columns aggregation
		 * @return {Object}
		 * @type {Object}
		 * @property {sap.ui.table.Row} row Row of the table
		 * @property {sap.ui.table.Column} column Column of the table
		 * @property {sap.ui.core.Control} cell Cell control of row/column
		 * @private
		 */
		getRowColCell : function(oTable, iRowIdx, iColIdx) {
			var oRow = oTable.getRows()[iRowIdx];
			var oColumn = oTable._getVisibleColumns()[iColIdx];
			var oCell = oRow && oRow.getCells()[iColIdx];

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

			return {row: oRow, column: oColumn, cell: oCell};
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
			this.deregisterResizeHandler(oTable, sIdSuffix);

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
		 * Scrolls the data in the table forward or backward by manipulating the property <code>firstVisibleRow</code>.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {boolean} bDown Whether to scroll down or up
		 * @param {boolean} bPage Whether scrolling should be page wise or a single step (only possibe with navigation mode <code>Scrollbar</code>)
		 * @private
		 */
		scroll : function(oTable, bDown, bPage) {
			var bPage = oTable.getNavigationMode() === NavigationMode.Scrollbar ? bPage : true;
			var bScrolled = false;
			var iRowCount = oTable._getRowCount();
			var iVisibleRowCount = oTable.getVisibleRowCount();
			var iScrollableRowCount = iVisibleRowCount - oTable.getFixedRowCount() - oTable.getFixedBottomRowCount();
			var iFirstVisibleScrollableRow = oTable._getSanitizedFirstVisibleRow();
			var iSize = bPage ? iScrollableRowCount : 1;

			if (bDown) {
				if (iFirstVisibleScrollableRow + iVisibleRowCount < iRowCount) {
					oTable.setFirstVisibleRow(Math.min(iFirstVisibleScrollableRow + iSize, iRowCount - iVisibleRowCount));
					bScrolled = true;
				}
			} else {
				if (iFirstVisibleScrollableRow > 0) {
					oTable.setFirstVisibleRow(Math.max(iFirstVisibleScrollableRow - iSize, 0));
					bScrolled = true;
				}
			}

			return bScrolled;
		},

		/**
		 * Scrolls the data in the table to the end or to the beginning by manipulating the property <code>firstVisibleRow</code>.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {boolean} bDown Whether to scroll down or up
		 * @returns {boolean} True if scrolling was actually performed
		 * @private
		 */
		scrollMax : function(oTable, bDown) {
			var bScrolled = false;
			var iFirstVisibleScrollableRow = oTable._getSanitizedFirstVisibleRow();

			if (bDown) {
				var iFirstVisibleRow = oTable._getRowCount() - this.getNonEmptyVisibleRowCount(oTable);
				if (iFirstVisibleScrollableRow < iFirstVisibleRow) {
					oTable.setFirstVisibleRow(iFirstVisibleRow);
					bScrolled = true;
				}
			} else {
				if (iFirstVisibleScrollableRow > 0) {
					oTable.setFirstVisibleRow(0);
					bScrolled = true;
				}
			}

			return bScrolled;
		},

		/**
		 * Checks whether the cell of the given DOM reference is in the first row (from DOM point of view) of the scrollable area.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {Object} oRef Cell DOM Reference
		 * @private
		 */
		isFirstScrollableRow : function(oTable, oRef) {
			var $Ref = jQuery(oRef);
			var iRowIndex = parseInt($Ref.add($Ref.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"), 10);
			var iFixed = oTable.getFixedRowCount() || 0;
			return iRowIndex == iFixed;
		},

		/**
		 * Checks whether the cell of the given DOM reference is in the last row (from DOM point of view) of the scrollable area.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {Object} oRef Cell DOM Reference
		 * @private
		 */
		isLastScrollableRow : function(oTable, oRef) {
			var $Ref = jQuery(oRef);
			var iRowIndex = parseInt($Ref.add($Ref.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"), 10);
			var iFixed = oTable.getFixedBottomRowCount() || 0;
			return iRowIndex == oTable.getVisibleRowCount() - iFixed - 1;
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
				} while (oParent && !oParentDomRef)
			}

			// if we found a DOM reference, check for content density
			$DomRef = jQuery(oParentDomRef || document.body);
			sContentDensity = fnGetContentDensity("hasClass", $DomRef.closest("." + aContentDensityStyleClasses.join(",.")));

			return sContentDensity;
		}
	};

	TableGrouping.TableUtils = TableUtils; // Avoid cyclic dependency

	return TableUtils;

}, /* bExport= */ true);