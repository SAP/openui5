/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableKeyboardDelegate2.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './library', './TableExtension', './TableUtils'],
	function(jQuery, BaseObject, library, TableExtension, TableUtils) {
	"use strict";

	/**
	 * New Delegate for keyboard events of sap.ui.table.Table controls.
	 *
	 * @class Delegate for keyboard events of sap.ui.table.Table controls.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableKeyboardDelegate2
	 */
	var TableKeyboardDelegate = BaseObject.extend("sap.ui.table.TableKeyboardDelegate2", /* @lends sap.ui.table.TableKeyboardDelegate2 */ {

		constructor : function(sType) { BaseObject.call(this); },

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() { BaseObject.prototype.destroy.apply(this, arguments); },

		/*
		 * @see sap.ui.base.Object#getInterface
		 */
		getInterface : function() { return this; }

	});


	/*
	 * Restores the focus to the last known cell position.
	 */
	TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell = function(oTable, oEvent) {
		var oInfo = TableUtils.getFocusedItemInfo(oTable);
		var oLastInfo = oTable._getKeyboardExtension()._getLastFocusedCellInfo();
		TableUtils.focusItem(oTable, oInfo.cellInRow + (oInfo.columnCount * oLastInfo.row), oEvent);
	};


	/*
	 * Sets the focus to the correspondig column header of the last known cell position.
	 */
	TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell = function(oTable, oEvent) {
		var oInfo = TableUtils.getFocusedItemInfo(oTable);
		TableUtils.focusItem(oTable, oInfo.cellInRow, oEvent);
	};


	/*
	 * Sets the focus to the correspondig column header of the last known cell position.
	 */
	TableKeyboardDelegate._forwardFocusToTabDummy = function(oTable, sTabDummy) {
		oTable._getKeyboardExtension()._setSilentFocus(oTable.$().find("." + sTabDummy));
	};


	//******************************************************************************************


	TableKeyboardDelegate.prototype.onfocusin = function(oEvent) {
		if (oEvent.isMarked("sapUiTableIgnoreFocusIn")) {
			return;
		}

		var $Target = jQuery(oEvent.target);

		if ($Target.hasClass("sapUiTableOuterBefore") || $Target.hasClass("sapUiTableOuterAfter")
			|| (oEvent.target != this.getDomRef("overlay") && this.getShowOverlay())) {
			this.$("overlay").focus();
		} else if ($Target.hasClass("sapUiTableCtrlBefore")) {
			var bNoData = TableUtils.isNoDataVisible(this);
			if (!bNoData || bNoData && this.getColumnHeaderVisible()) {
				TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell(this, oEvent);
			} else {
				this._getKeyboardExtension()._setSilentFocus(this.$("noDataCnt"));
			}
		} else if ($Target.hasClass("sapUiTableCtrlAfter")) {
			if (!TableUtils.isNoDataVisible(this)) {
				TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell(this, oEvent);
			}/* else {
				 // If needed and NoData visible, then set the focus to NoData area.
				 this.$("noDataCnt").focus();
			 }*/
		}
	};


	TableKeyboardDelegate.prototype.onsaptabnext = function(oEvent) {
		var oInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oInfo.type === TableUtils.CELLTYPES.COLUMNHEADER || oInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER) {
			if (TableUtils.isNoDataVisible(this)) {
				this.$("noDataCnt").focus();
			} else {
				TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell(this, oEvent);
			}
			oEvent.preventDefault();
		} else if (oInfo.type === TableUtils.CELLTYPES.DATACELL || oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
			TableKeyboardDelegate._forwardFocusToTabDummy(this, "sapUiTableCtrlAfter");
		} else if (oEvent.target === this.getDomRef("overlay")) {
			this._getKeyboardExtension()._setSilentFocus(this.$().find(".sapUiTableOuterAfter"));
		}
	};


	TableKeyboardDelegate.prototype.onsaptabprevious = function(oEvent) {
		var oInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oInfo.type === TableUtils.CELLTYPES.DATACELL
				|| oInfo.type === TableUtils.CELLTYPES.ROWHEADER
				|| oEvent.target === this.getDomRef("noDataCnt")) {
			if (this.getColumnHeaderVisible()) {
				TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell(this, oEvent);
				oEvent.preventDefault();
			} else {
				TableKeyboardDelegate._forwardFocusToTabDummy(this, "sapUiTableCtrlBefore");
			}
		} else if (oEvent.target === this.getDomRef("overlay")) {
			this._getKeyboardExtension()._setSilentFocus(this.$().find(".sapUiTableOuterBefore"));
		}
	};


	TableKeyboardDelegate.prototype.onsapdown = function(oEvent) {
		var oInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oInfo.type === TableUtils.CELLTYPES.DATACELL || oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
			if (TableUtils.isLastScrollableRow(this, oEvent.target)) {
				var bScrolled = TableUtils.scroll(this, true, false);
				if (bScrolled) {
					oEvent.setMarked("sapUiTableSkipItemNavigation");
				}
			}
		} else if (oInfo.type === TableUtils.CELLTYPES.COLUMNHEADER || oInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER) {
			if (TableUtils.isNoDataVisible(this)) {
				var oFocusInfo = TableUtils.getFocusedItemInfo(this);
				if (oFocusInfo.row - this._getHeaderRowCount() <= 1) { // We are in the last column header row
					//Just prevent the navigation to the table content
					oEvent.setMarked("sapUiTableSkipItemNavigation");
				}
			} else if (oInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER && this._getHeaderRowCount() > 1) {
				//Special logic needed because row selector added multiple times into the item navigation
				oEvent.setMarked("sapUiTableSkipItemNavigation");
				//Focus the first row header
				TableUtils.focusItem(this, this._getHeaderRowCount() * (TableUtils.getVisibleColumnCount(this) + 1/*Row Headers*/), oEvent);
			}
		}
	};


	TableKeyboardDelegate.prototype.onsapup = function(oEvent) {
		var oInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oInfo.type === TableUtils.CELLTYPES.DATACELL || oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
			if (TableUtils.isFirstScrollableRow(this, oEvent.target)) {
				var bScrolled = TableUtils.scroll(this, false, false);
				if (bScrolled) {
					oEvent.setMarked("sapUiTableSkipItemNavigation");
				}
			}
		}
	};

	TableKeyboardDelegate.prototype.onsaphome = function(oEvent) {
		// If focus is on a group header, do nothing.
		if (TableUtils.isInGroupingRow(oEvent.target)) {
			oEvent.setMarked("sapUiTableSkipItemNavigation");
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === TableUtils.CELLTYPES.DATACELL ||
			oCellInfo.type === TableUtils.CELLTYPES.ROWHEADER ||
			oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER) {

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedIndex = oFocusedItemInfo.cell;
			var iFocusedCellInRow = oFocusedItemInfo.cellInRow;

			var bHasRowHeader = TableUtils.hasRowHeader(this);
			var iRowHeaderOffset = bHasRowHeader ? 1 : 0;

			if (TableUtils.hasFixedColumns(this) && iFocusedCellInRow > this.getFixedColumnCount() + iRowHeaderOffset) {
				// If there is a fixed column area and the focus is to the right of the first cell in the non-fixed area,
				// then set the focus to the first cell in the non-fixed area.
				oEvent.setMarked("sapUiTableSkipItemNavigation");
				TableUtils.focusItem(this, iFocusedIndex - iFocusedCellInRow + this.getFixedColumnCount() + iRowHeaderOffset, null);

			} else if (bHasRowHeader && iFocusedCellInRow > 1) {
				// If there is a row header column and the focus is after the first content column,
				// then set the focus to the cell in the first content column.
				oEvent.setMarked("sapUiTableSkipItemNavigation");
				TableUtils.focusItem(this, iFocusedIndex - iFocusedCellInRow + iRowHeaderOffset, null);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsapend = function(oEvent) {
		// If focus is on a group header, do nothing.
		if (TableUtils.isInGroupingRow(oEvent.target)) {
			oEvent.setMarked("sapUiTableSkipItemNavigation");
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === TableUtils.CELLTYPES.DATACELL ||
			oCellInfo.type === TableUtils.CELLTYPES.ROWHEADER ||
			oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER ||
			oCellInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER) {

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedIndex = oFocusedItemInfo.cell;
			var iFocusedCellInRow = oFocusedItemInfo.cellInRow;

			var bHasRowHeader = TableUtils.hasRowHeader(this);
			var iRowHeaderOffset = bHasRowHeader ? 1 : 0;
			var bIsColSpanAtFixedAreaEnd = false;

			// If the focused cell is a column span in the column header at the end of the fixed area,
			// the selected cell index is the index of the first cell in the span.
			// Treat this case like there is no span and the last cell of the fixed area is selected.
			if (oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER && TableUtils.hasFixedColumns(this)) {
				var iColSpan = oCellInfo.cell.data('sap-ui-colspan');
				if (iColSpan > 1 && iFocusedCellInRow + iColSpan - iRowHeaderOffset === this.getFixedColumnCount()) {
					bIsColSpanAtFixedAreaEnd = true;
				}
			}

			if (bHasRowHeader && iFocusedCellInRow === 0) {
				// If there is a row header and it has the focus,
				// then set the focus to the cell in the next column.
				oEvent.setMarked("sapUiTableSkipItemNavigation");
				TableUtils.focusItem(this, iFocusedIndex + 1, null);

			} else if (TableUtils.hasFixedColumns(this)
					&& iFocusedCellInRow < this.getFixedColumnCount() - 1 + iRowHeaderOffset && !bIsColSpanAtFixedAreaEnd) {
				// If there is a fixed column area and the focus is not on its last cell or column span,
				// then set the focus to the last cell of the fixed column area.
				oEvent.setMarked("sapUiTableSkipItemNavigation");
				TableUtils.focusItem(this, iFocusedIndex + this.getFixedColumnCount() - iFocusedCellInRow, null);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsaphomemodifiers = function(oEvent) {
		if (oEvent.metaKey || oEvent.ctrlKey) {
			var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

			if (oCellInfo.type === TableUtils.CELLTYPES.DATACELL ||
				oCellInfo.type === TableUtils.CELLTYPES.ROWHEADER ||
				oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER) {

				oEvent.setMarked("sapUiTableSkipItemNavigation");

				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var iFocusedRow = oFocusedItemInfo.row;

				// Only do something if the focus is not in the first row already.
				if (iFocusedRow > 0) {
					var iFocusedIndex = oFocusedItemInfo.cell;
					var iColumnCount = oFocusedItemInfo.columnCount;
					var iHeaderRowCount = this._getHeaderRowCount();

					/* Column header area */
					/* Top fixed area */
					if (iFocusedRow < iHeaderRowCount + this.getFixedRowCount()) {
						// Set the focus to the first row of the top fixed area.
						TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iFocusedRow, oEvent);

					/* Scrollable area */
					} else if (iFocusedRow >= iHeaderRowCount + this.getFixedRowCount()
							&& iFocusedRow < iHeaderRowCount + TableUtils.getNonEmptyVisibleRowCount(this) - this.getFixedBottomRowCount()) {
						TableUtils.scrollMax(this, false);
						// If a fixed top area exists, then set the focus to the first row of the top fixed area,
						// otherwise set the focus to the first row of the column header area.
						if (this.getFixedRowCount() > 0) {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);
						} else {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iFocusedRow, oEvent);
						}

					/* Bottom fixed area */
					} else {
						// Set the focus to the first row of the scrollable area and scroll to top.
						TableUtils.scrollMax(this, false);
						TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - this.getFixedRowCount()), oEvent);
					}
				}
			}
		}
	};

	TableKeyboardDelegate.prototype.onsapendmodifiers = function(oEvent) {
		if (oEvent.metaKey || oEvent.ctrlKey) {
			var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

			if (oCellInfo.type === TableUtils.CELLTYPES.DATACELL ||
				oCellInfo.type === TableUtils.CELLTYPES.ROWHEADER ||
				oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER ||
				oCellInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER) {

				oEvent.setMarked("sapUiTableSkipItemNavigation");

				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var iFocusedRow = oFocusedItemInfo.row;
				var iHeaderRowCount = this._getHeaderRowCount();
				var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(this);

				// Only do something if the focus is above the last row of the fixed bottom area
				// or above the last row of the column header area when NoData is visible.
				if (this.getFixedBottomRowCount() === 0
						|| iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - 1
						|| (TableUtils.isNoDataVisible(this) && iFocusedRow < iHeaderRowCount - 1)) {
					var iFocusedIndex = oFocusedItemInfo.cell;
					var iColumnCount = oFocusedItemInfo.columnCount;

					/* Column header area */
					if (TableUtils.isNoDataVisible(this)) {
						// Set the focus to the last row of the column header area.
						TableUtils.focusItem(this, iFocusedIndex + iColumnCount * (iHeaderRowCount - iFocusedRow - 1), oEvent);
					} else if (iFocusedRow < iHeaderRowCount) {
						// If a top fixed area exists, then set the focus to the last row of the top fixed area,
						// otherwise set the focus to the last row of the scrollable area and scroll to bottom.
						if (this.getFixedRowCount() > 0) {
							TableUtils.focusItem(this, iFocusedIndex
								+ iColumnCount * (iHeaderRowCount + this.getFixedRowCount() - iFocusedRow - 1), oEvent);
						} else {
							TableUtils.scrollMax(this, true);
							TableUtils.focusItem(this, iFocusedIndex
								+ iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - iFocusedRow - 1), oEvent);
						}

					/* Top fixed area */
					} else if (iFocusedRow >= iHeaderRowCount
							&& iFocusedRow < iHeaderRowCount + this.getFixedRowCount()) {
						// Set the focus to the last row of the scrollable area and scroll to bottom.
						TableUtils.scrollMax(this, true);
						TableUtils.focusItem(this, iFocusedIndex
							+ iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - iFocusedRow - 1), oEvent);

					/* Scrollable area */
					} else if (iFocusedRow >= iHeaderRowCount + this.getFixedRowCount()
							&& iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount()) {
						// Set the focus to the last row of the scrollable area and scroll to bottom.
						TableUtils.scrollMax(this, true);
						TableUtils.focusItem(this, iFocusedIndex
							+ iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - iFocusedRow - 1), oEvent);

					/* Bottom fixed area */
					} else {
						// Set the focus to the last row of the bottom fixed area.
						TableUtils.focusItem(this, iFocusedIndex
							+ iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - iFocusedRow - 1), oEvent);
					}
				}
			}
		}
	};

	TableKeyboardDelegate.prototype.onsappageup = function(oEvent) {
		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === TableUtils.CELLTYPES.DATACELL ||
			oCellInfo.type === TableUtils.CELLTYPES.ROWHEADER ||
			oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER) {

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedRow = oFocusedItemInfo.row;
			var iHeaderRowCount = this._getHeaderRowCount();

			// Only do something if the focus is not in the column header area or the first row of the top fixed area.
			if (this.getFixedRowCount() === 0 && iFocusedRow >= iHeaderRowCount || this.getFixedRowCount() > 0 && iFocusedRow > iHeaderRowCount) {
				oEvent.setMarked("sapUiTableSkipItemNavigation");

				var iFocusedIndex = oFocusedItemInfo.cell;
				var iColumnCount = oFocusedItemInfo.columnCount;

				/* Top fixed area - From second row downwards */
				if (iFocusedRow < iHeaderRowCount + this.getFixedRowCount()) {
					// Set the focus to the first row of the top fixed area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);

				/* Scrollable area - First row */
				} else if (iFocusedRow === iHeaderRowCount + this.getFixedRowCount()) {
					var iPageSize = TableUtils.getNonEmptyVisibleRowCount(this) - this.getFixedRowCount() - this.getFixedBottomRowCount();
					var iRowsToBeScrolled = this._getSanitizedFirstVisibleRow();

					TableUtils.scroll(this, false, true); // Scroll up one page

					// Only change the focus if scrolling was not performed over a full page, or not at all.
					if (iRowsToBeScrolled < iPageSize) {
						// If a fixed top area exists, then set the focus to the first row of the top fixed area,
						// otherwise set the focus to the first row of the column header area.
						if (this.getFixedRowCount() > 0) {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);
						} else {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iHeaderRowCount, oEvent);
						}
					}

				/* Scrollable area - From second row downwards */
				/* Bottom Fixed area */
				} else if (iFocusedRow > iHeaderRowCount + this.getFixedRowCount()
						&& iFocusedRow < iHeaderRowCount + TableUtils.getNonEmptyVisibleRowCount(this)) {
					// Set the focus to the first row of the scrollable area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - this.getFixedRowCount()), oEvent);

				/* Empty area */
				} else {
					// Set the focus to the last row of the scrollable area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - TableUtils.getNonEmptyVisibleRowCount(this) + 1), oEvent);
				}
			}
		}
	};

	TableKeyboardDelegate.prototype.onsappagedown = function(oEvent) {
		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === TableUtils.CELLTYPES.DATACELL ||
			oCellInfo.type === TableUtils.CELLTYPES.ROWHEADER ||
			oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER ||
			oCellInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER) {

			oEvent.setMarked("sapUiTableSkipItemNavigation");

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedRow = oFocusedItemInfo.row;
			var iHeaderRowCount = this._getHeaderRowCount();
			var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(this);

			// Only do something if the focus is above the last row of the bottom fixed area
			// or above the last row of the column header area when NoData is visible.
			if ((TableUtils.isNoDataVisible(this) && iFocusedRow < iHeaderRowCount - 1)
					|| this.getFixedBottomRowCount() === 0
					|| iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - 1) {
				var iFocusedIndex = oFocusedItemInfo.cell;
				var iColumnCount = oFocusedItemInfo.columnCount;

				/* Column header area - From penultimate row upwards */
				if (iFocusedRow < iHeaderRowCount - 1 && oCellInfo.type !== TableUtils.CELLTYPES.COLUMNROWHEADER) {
					// Set the focus to the last row of the column header area.
					TableUtils.focusItem(this, iFocusedIndex + iColumnCount * (iHeaderRowCount - iFocusedRow - 1), oEvent);

				/* Column header area - Last row */
				} else if (iFocusedRow < iHeaderRowCount) {
					// If the NoData area is visible, then do nothing,
					// otherwise set the focus to the first row of the top fixed (if existing) or scrollable area.
					if (!TableUtils.isNoDataVisible(this)) {
						TableUtils.focusItem(this, iFocusedIndex + iColumnCount * (iHeaderRowCount - iFocusedRow), oEvent);
					}

				/* Top fixed area */
				/* Scrollable area - From penultimate row upwards */
				} else if (iFocusedRow >= iHeaderRowCount
						&& iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - 1) {
					// Set the focus to the last row of the scrollable area.
					TableUtils.focusItem(this, iFocusedIndex
						+ iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - iFocusedRow - 1), oEvent);

				/* Scrollable area - Last row */
				} else if (iFocusedRow === iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - 1) {
					var iPageSize = TableUtils.getNonEmptyVisibleRowCount(this) - this.getFixedRowCount() - this.getFixedBottomRowCount();
					var iRowsToBeScrolled = this._getRowCount() - this.getFixedBottomRowCount() - this._getSanitizedFirstVisibleRow() - iPageSize * 2;

					TableUtils.scroll(this, true, true); // Scroll down one page

					// If scrolling was not performed over a full page and there is a bottom fixed area,
					// then set the focus to the last row of the bottom fixed area.
					if (iRowsToBeScrolled < iPageSize && this.getFixedBottomRowCount() > 0) {
						TableUtils.focusItem(this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - iFocusedRow - 1), oEvent);
					}

				/* Bottom fixed area */
				} else {
					// Set the focus to the last row of the bottom fixed area.
					TableUtils.focusItem(this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - iFocusedRow - 1), oEvent);
				}
			}
		}
	};

	return TableKeyboardDelegate;

});