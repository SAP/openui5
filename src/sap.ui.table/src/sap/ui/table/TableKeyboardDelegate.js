/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableKeyboardDelegate.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './TableExtension', './TableUtils'],
	function(jQuery, BaseObject, TableExtension, TableUtils) {
	"use strict";

	/**
	 * Delegate for keyboard events of sap.ui.table.Table controls.
	 *
	 * @class Delegate for keyboard events of sap.ui.table.Table controls.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableKeyboardDelegate
	 */
	var TableKeyboardDelegate = BaseObject.extend("sap.ui.table.TableKeyboardDelegate", /* @lends sap.ui.table.TableKeyboardDelegate */ {

		constructor : function(sType) {
			BaseObject.call(this);

			if (sType === TableExtension.TABLETYPES.ANALYTICAL) {

				this.onsapselect = function(oEvent) {
					if (jQuery(oEvent.target).hasClass("sapUiTableGroupIcon")) {
						this._onNodeSelect(oEvent);
					} else if (jQuery(oEvent.target).hasClass("sapUiAnalyticalTableSum")) {
						//Summs connot be selected
						oEvent.preventDefault();
						return;
					} else {
						var $Target = jQuery(oEvent.target),
							$TargetDIV = $Target.closest('div.sapUiTableRowHdr');
						if ($TargetDIV.hasClass('sapUiTableGroupHeader') && $TargetDIV.hasClass('sapUiTableRowHdr')) {
							var iRowIndex = this.getFirstVisibleRow() + parseInt($TargetDIV.attr("data-sap-ui-rowindex"), 10);
							var oBinding = this.getBinding("rows");
							oBinding.toggleIndex(iRowIndex);
							return;
						}
						if (TableKeyboardDelegate.prototype.onsapselect) {
							TableKeyboardDelegate.prototype.onsapselect.apply(this, arguments);
						}
					}
				};

			} else if (sType === TableExtension.TABLETYPES.TREE) {

				this.onsapselect = function(oEvent) {
					if (jQuery(oEvent.target).hasClass("sapUiTableTreeIcon")) {
						this._onNodeSelect(oEvent);
					} else {
						if (TableKeyboardDelegate.prototype.onsapselect) {
							TableKeyboardDelegate.prototype.onsapselect.apply(this, arguments);
						}
					}
				};

				this.onkeydown = function(oEvent) {
					TableKeyboardDelegate.prototype.onkeydown.apply(this, arguments);
					var $Target = jQuery(oEvent.target),
						$TargetTD = $Target.closest('td');
					if (oEvent.keyCode == jQuery.sap.KeyCodes.TAB
							&& this._getKeyboardExtension().isInActionMode()
							&& $TargetTD.find('.sapUiTableTreeIcon').length > 0) {
						//If node icon has focus set tab to control else set tab to node icon
						if ($Target.hasClass('sapUiTableTreeIcon')) {
							if (!$Target.hasClass("sapUiTableTreeIconLeaf")) {
								$TargetTD.find(':sapFocusable:not(.sapUiTableTreeIcon)').first().focus();
							}
						} else {
							$TargetTD.find('.sapUiTableTreeIcon:not(.sapUiTableTreeIconLeaf)').focus();
						}
						oEvent.preventDefault();
					}
				};

			}
		},

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
	 * NOTE: "this" in the function context is the table instance
	 */


	/*
	 * Hook which is called by the keyboard extension when the table should be set to action mode
	 * @see TableKeyboardExtension#setActionMode
	 */
	TableKeyboardDelegate.prototype.enterActionMode = function(oArgs) {
		var $Focusable = oArgs.$Dom;
		var bEntered = false;

		if ($Focusable.length > 0) {

			var $Tabbables = $Focusable.filter(":sapTabbable");
			var oExtension = this._getKeyboardExtension();

			if ($Tabbables.length > 0) { //If cell has no tabbable element, we don't do anything
				bEntered = true;

				// in the action mode we need no item navigation
				var oIN = this._getItemNavigation();
				oExtension._suspendItemNavigation();

				// remove the tab index from the item navigation
				jQuery(oIN.getFocusedDomRef()).attr("tabindex", "-1");

				// set the focus to the active control
				$Tabbables.eq(0).focus();
			}

			//Special handling for the tree icon in the TreeTable
			if (oExtension._getTableType() === TableExtension.TABLETYPES.TREE) {
				var $domRef = $Focusable.eq(0);
				if ($domRef.hasClass("sapUiTableTreeIcon") && !$domRef.hasClass("sapUiTableTreeIconLeaf")) {
					bEntered = true;

					//Set tabindex to 0 to have make node icon accessible
					$domRef.attr("tabindex", 0).focus();
				}
			}
		}

		return bEntered;
	};


	/*
	 * Hook which is called by the keyboard extension when the table should leave the action mode
	 * @see TableKeyboardExtension#setActionMode
	 */
	TableKeyboardDelegate.prototype.leaveActionMode = function(oArgs) {
		 // TODO: update ItemNavigation position otherwise the position is strange!
		 //       EDIT AN SCROLL!

		var oEvent = oArgs.event;
		var oExtension = this._getKeyboardExtension();

		// in the navigation mode we use the item navigation
		var oIN = this._getItemNavigation(); //TBD: Cleanup
		oExtension._resumeItemNavigation();

		// reset the tabindex of the focused domref of the item navigation
		jQuery(oIN.getFocusedDomRef()).attr("tabindex", "0");

		// when we have an event which is responsible to leave the action mode
		// we search for the closest
		if (oEvent) {
			if (jQuery(oEvent.target).closest("td[tabindex='-1']").length > 0) {
				// triggered when clicking into a cell, then we focus the cell
				var iIndex = jQuery(oIN.aItemDomRefs).index(jQuery(oEvent.target).closest("td[tabindex='-1']").get(0));
				TableUtils.focusItem(this, iIndex, null);
			} else {
				// somewhere else means whe check if the click happend inside
				// the container, then we focus the last focused element
				// (DON'T KNOW IF THIS IS OK - but we don't know where the focus was!)
				if (jQuery.sap.containsOrEquals(this.$().find(".sapUiTableCCnt").get(0), oEvent.target)) {
					TableUtils.focusItem(this, oIN.getFocusedIndex(), null);
				}
			}
		} else {
			// when no event is given we just focus the last focused index
			TableUtils.focusItem(this, oIN.getFocusedIndex(), null);
		}

		//Special handling for the tree icon in the TreeTable
		if (oExtension._getTableType() === TableExtension.TABLETYPES.TREE) {
			this.$().find(".sapUiTableTreeIcon").attr("tabindex", -1);
		}
	};


	TableKeyboardDelegate.prototype.onmouseup = function(oEvent) {
		if (oEvent.isMarked()) { // the event was already handled by some other handler, do nothing.
			return;
		}

		// When clicking into a focusable control we enter the action mode
		// When clicking anywhere else in the table we leave the action mode
		var $Dom = this.$().find(".sapUiTableCtrl td :focus");
		this._getKeyboardExtension().setActionMode($Dom.length > 0, {$Dom: $Dom, event: oEvent});
	};


	TableKeyboardDelegate.prototype.onfocusin = function(oEvent) {
		if (oEvent.isMarked("sapUiTableIgnoreFocusIn")) {
			return;
		}

		var $target = jQuery(oEvent.target);
		var bNoData = this.$().hasClass("sapUiTableEmpty");
		var bControlBefore = $target.hasClass("sapUiTableCtrlBefore");

		if (bControlBefore || $target.hasClass("sapUiTableCtrlAfter")) {
			// when entering the before or after helper DOM elements we put the
			// focus on the current focus element of the item navigation and we
			// leave the action mode!
			this._getKeyboardExtension().setActionMode(false);
			if (jQuery.contains(this.$().find('.sapUiTableColHdrCnt')[0], oEvent.target)) {
				var oIN = this._getItemNavigation();
				jQuery(oIN.getFocusedDomRef() || oIN.getRootDomRef()).focus();
			} else {
				if (bControlBefore) {
					if (bNoData) {
						this._getKeyboardExtension()._setSilentFocus(this.$().find(".sapUiTableCtrlEmpty"));
					} else {
						var oInfo = TableUtils.getFocusedItemInfo(this);
						TableUtils.focusItem(this, oInfo.cellInRow, oEvent);
					}
				} else {
					TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell(this, oEvent);
				}
			}

			if (!bNoData) {
				oEvent.preventDefault();
			}
		}
	};

	/*
	 * handle the row selection via SPACE or ENTER key if key is pressed on a group header, the open state is toggled
	 * @private
	 */
	TableKeyboardDelegate.prototype.onkeyup = function(oEvent) {
		if (!this._bEventSapSelect === true) {
			return;
		}

		this._bEventSapSelect = false;

		// this mimics the sapselect event but on keyup
		if (oEvent.keyCode !== jQuery.sap.KeyCodes.ENTER &&
			oEvent.keyCode !== jQuery.sap.KeyCodes.SPACE &&
			oEvent.keyCode !== jQuery.sap.KeyCodes.F4 ||
			oEvent.srcControl !== this &&
			jQuery.inArray(oEvent.srcControl,this.getRows()) === -1 &&
			jQuery.inArray(oEvent.srcControl,this.getColumns()) === -1) {
			return;
		}
		var $Parent = jQuery(oEvent.target).closest('.sapUiTableGroupHeader');
		if ($Parent.length > 0) {
			var iRowIndex = this.getFirstVisibleRow() + parseInt($Parent.attr("data-sap-ui-rowindex"), 10);
			var oBinding = this.getBinding("rows");
			if (oBinding) {
				if (oBinding.isExpanded(iRowIndex)) {
					oBinding.collapse(iRowIndex);
				} else {
					oBinding.expand(iRowIndex);
				}
			}
			oEvent.preventDefault();
			return;
		}
		this._bShowMenu = true;
		this._onSelect(oEvent);
		this._bShowMenu = false;
		oEvent.preventDefault();
	};

	TableKeyboardDelegate.prototype.onsapselect = function() {
		this._bEventSapSelect = true;
	};

	TableKeyboardDelegate.prototype.onsapselectmodifiers = function() {
		this._bEventSapSelect = true;
	};

	TableKeyboardDelegate.prototype.onsapspace = function(oEvent) {
		var $target = jQuery(oEvent.target);
		if (((this.getSelectionBehavior() == sap.ui.table.SelectionBehavior.Row || this.getSelectionBehavior() == sap.ui.table.SelectionBehavior.RowOnly) && oEvent.srcControl instanceof sap.ui.table.Row) ||
			$target.hasClass("sapUiTableRowHdr") || $target.hasClass("sapUiTableColRowHdr") || $target.hasClass("sapUiTableCol")) {
			oEvent.preventDefault();
		}
	};

	/*
	 * handle the row selection via SPACE or ENTER key
	 */
	TableKeyboardDelegate.prototype.onkeydown = function(oEvent) {
		var $this = this.$();
		var bActionMode = this._getKeyboardExtension().isInActionMode();

		if (!bActionMode &&
			oEvent.keyCode == jQuery.sap.KeyCodes.F2 ||
			oEvent.keyCode == jQuery.sap.KeyCodes.ENTER) {
			if ($this.find(".sapUiTableCtrl td:focus").length > 0) {
				this._getKeyboardExtension().setActionMode(true, {$Dom: $this.find(".sapUiTableCtrl td:focus").find(":sapFocusable")});
				oEvent.preventDefault();
				oEvent.stopPropagation();
			}
		} else if (bActionMode &&
			oEvent.keyCode == jQuery.sap.KeyCodes.F2) {
			this._getKeyboardExtension().setActionMode(false);
		} else if (oEvent.keyCode == jQuery.sap.KeyCodes.TAB && bActionMode) {
			//Set tabindex to second table if fixed columns are used
			if (this.getFixedColumnCount() > 0) {
				var $cell = jQuery(oEvent.target);
				if ($cell.is("td[role=gridcell]") == false) {
					$cell = $cell.parents("td[role=gridcell]");
				}
				var $row = $cell.parent("tr[data-sap-ui-rowindex]");
				var $table = $row.closest(".sapUiTableCtrl");
				var iRowIndex = parseInt($row.attr("data-sap-ui-rowindex"),10);
				var $cells = $row.find("td[role=gridcell]");
				var iColIndex = $cells.index($cell);
				var iTableCols = $cells.length;
				if (iColIndex === (iTableCols - 1)) {
					var $otherTable;
					if ($table.hasClass("sapUiTableCtrlFixed")) {
						$otherTable = $this.find(".sapUiTableCtrl.sapUiTableCtrlScroll");
					} else {
						$otherTable = $this.find(".sapUiTableCtrl.sapUiTableCtrlFixed");
						iRowIndex++;
						if (iRowIndex == this.getVisibleRowCount()) {
							iRowIndex = 0;
						}
					}
					var $otherRow = $otherTable.find("tr[data-sap-ui-rowindex='" + iRowIndex + "']");
					var $nextFocus = $otherRow.find("td :sapFocusable[tabindex='0']").first();
					if ($nextFocus.length > 0) {
						$nextFocus.focus();
						oEvent.preventDefault();
					}
				}
			}
		} else if (oEvent.keyCode == jQuery.sap.KeyCodes.A && (oEvent.metaKey || oEvent.ctrlKey)) {
			// CTRL + A handling
			var oInfo = TableUtils.getFocusedItemInfo(this);

			this._toggleSelectAll();

			TableUtils.focusItem(this, oInfo.cell, oEvent);

			oEvent.preventDefault();
			oEvent.stopImmediatePropagation(true);
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.F10 && (oEvent.shiftKey)) {
			// SHIFT + 10 should open the context menu
			this.oncontextmenu(oEvent);
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.NUMPAD_PLUS) {
			this._expandGroupHeader(oEvent);
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.NUMPAD_MINUS) {
			this._collapseGroupHeader(oEvent);
		}
	};

	/*
	 * handle the ESCAPE key to leave the action mode
	 */
	TableKeyboardDelegate.prototype.onsapescape = function(oEvent) {
		this._getKeyboardExtension().setActionMode(false, {event: oEvent});
	};

	/*
	 * handle the SHIFT-TAB key
	 * <ul>
	 *   <li>Navigation Mode:
	 *      <ul>
	 *          <li>If focus is on header: jump to the next focusable control before the table</li>
	 *          <li>If focus in on content: jump to header for the current column</li>
	 *      </ul>
	 *   <li>Action Mode: switch back to navigation mode</li>
	 * </ul>
	 * @private
	 */
	TableKeyboardDelegate.prototype.onsaptabprevious = function(oEvent) {
		var $this = this.$();
		if (this._getKeyboardExtension().isInActionMode()) {
			this._getKeyboardExtension().setActionMode(false);
			oEvent.preventDefault();
		} else {
			var oInfo = TableUtils.getFocusedItemInfo(this);
			var bNoData = this.$().hasClass("sapUiTableEmpty");
			var oSapUiTableCCnt = $this.find('.sapUiTableCCnt')[0];
			var bFocusFromTableContent = jQuery.contains(oSapUiTableCCnt, oEvent.target);

			if (bFocusFromTableContent && this.getColumnHeaderVisible()) {
				// Focus comes from table content. Focus the column header which corresponds to the
				// selected column (column index)
				TableUtils.focusItem(this, oInfo.cellInRow, oEvent);
				oEvent.preventDefault();
			} else if (oInfo.domRef === oEvent.target && jQuery.sap.containsOrEquals(oSapUiTableCCnt, oEvent.target) ||
				(!this.getColumnHeaderVisible() && bNoData && bFocusFromTableContent)) {
				// in case of having the focus in the row or column header we do not need to
				// place the focus to the div before the table control because there we do
				// not need to skip the table controls anymore.
				this._getKeyboardExtension()._setSilentFocus($this.find(".sapUiTableCtrlBefore"));
			}
		}
	};

	/*
	 * handle the TAB key:
	 * <ul>
	 *   <li>Navigation Mode:
	 *      <ul>
	 *          <li>If focus is on header: jump to the first data column of the focused column header</li>
	 *          <li>If focus in on content: jump to the next focusable control after the table</li>
	 *      </ul>
	 *   <li>Action Mode: switch back to navigation mode</li>
	 * </ul>
	 * @private
	 */
	TableKeyboardDelegate.prototype.onsaptabnext = function(oEvent) {
		var $this = this.$();
		if (this._getKeyboardExtension().isInActionMode()) {
			this._getKeyboardExtension().setActionMode(false);
			oEvent.preventDefault();
		} else {
			var oInfo = TableUtils.getFocusedItemInfo(this);
			var bContainsColHdrCnt = jQuery.contains($this.find('.sapUiTableColHdrCnt')[0], oEvent.target);
			var bNoData = this.$().hasClass("sapUiTableEmpty");

			if (bContainsColHdrCnt && !bNoData) {
				TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell(this, oEvent);
				oEvent.preventDefault();
			} else if (oInfo.domRef === oEvent.target || (bNoData && bContainsColHdrCnt)) {
				this._getKeyboardExtension()._setSilentFocus($this.find(".sapUiTableCtrlAfter"));
			}
		}
	};

	/*
	 * dynamic scrolling when reaching the bottom row with the ARROW DOWN key
	 */
	TableKeyboardDelegate.prototype.onsapdown = function(oEvent) {
		if (!this._getKeyboardExtension().isInActionMode() && this._isBottomRow(oEvent)) {
			if (this.getFirstVisibleRow() != this._getRowCount() - this.getVisibleRowCount()) {
				oEvent.stopImmediatePropagation(true);
				if (this.getNavigationMode() === sap.ui.table.NavigationMode.Scrollbar) {
					this._scrollNext();
				} else {
					this._scrollPageDown();
				}
			}
		}
		oEvent.preventDefault();
	};

	/*
	 * Implements selecting/deselecting rows when pressing SHIFT + DOWN
	 */
	TableKeyboardDelegate.prototype.onsapdownmodifiers = function(oEvent) {
		if (oEvent.shiftKey) {
			var iFocusedRow = this._getFocusedRowIndex();
			var bIsFocusedRowSelected = this._isFocusedRowSelected();
			if (bIsFocusedRowSelected === true) {
				this.addSelectionInterval(iFocusedRow + 1, iFocusedRow + 1);
			} else if (bIsFocusedRowSelected === false) {
				this.removeSelectionInterval(iFocusedRow + 1, iFocusedRow + 1);
			}

			if (this._isBottomRow(oEvent)) {
				this._scrollNext();
			}
		} else if (oEvent.altKey) {
			// Toggle group header on ALT + DOWN.
			this._toggleGroupHeader(oEvent);
		}
	};

	/*
	 * Implements selecting/deselecting rows when pressing SHIFT + UP
	 */
	TableKeyboardDelegate.prototype.onsapupmodifiers = function(oEvent) {
		if (oEvent.shiftKey) {
			var iFocusedRow = this._getFocusedRowIndex();
			var bIsFocusedRowSelected = this._isFocusedRowSelected();

			if (bIsFocusedRowSelected === true) {
				this.addSelectionInterval(iFocusedRow - 1, iFocusedRow - 1);
			} else if (bIsFocusedRowSelected === false) {
				this.removeSelectionInterval(iFocusedRow - 1, iFocusedRow - 1);
			}

			if (this._isTopRow(oEvent)) {
				// Prevent that focus jumps to header in this case.
				if (this.getFirstVisibleRow() != 0) {
					oEvent.stopImmediatePropagation(true);
				}
				this._scrollPrevious();
			}
		} else if (oEvent.altKey) {
			// Toggle group header on ALT + UP.
			this._toggleGroupHeader(oEvent);
		}
	};

	/*
	 * dynamic scrolling when reaching the top row with the ARROW UP key
	 */
	TableKeyboardDelegate.prototype.onsapup = function(oEvent) {
		if (!this._getKeyboardExtension().isInActionMode() && this._isTopRow(oEvent)) {
			if (this.getFirstVisibleRow() != 0) {
				oEvent.stopImmediatePropagation(true);
			}
			if (this.getNavigationMode() === sap.ui.table.NavigationMode.Scrollbar) {
				this._scrollPrevious();
			} else {
				this._scrollPageUp();
			}
		}
		oEvent.preventDefault();
	};

	/*
	 * dynamic scrolling when reaching the bottom row with the PAGE DOWN key
	 */
	TableKeyboardDelegate.prototype.onsappagedown = function(oEvent) {
		if (!this._getKeyboardExtension().isInActionMode()) {
			var $this = this.$();
			var oInfo = TableUtils.getFocusedItemInfo(this);

			var bRowHeader = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);
			var iHeaderRows = $this.find(".sapUiTableColHdrScr>.sapUiTableColHdr").length;

			// Check if focus is on header
			// Special Handling is required here:
			// - If not in the last header row, jump to the last header row in the same column
			// - If in the last header row, scroll table to first row and jump to first row, same column
			if (this.getColumnHeaderVisible() && oInfo.cell < (oInfo.columnCount * iHeaderRows)) {
				// focus is on header
				var iCol = oInfo.cellInRow;
				if ((oInfo.cell <= (oInfo.columnCount * iHeaderRows) && oInfo.cell >= (oInfo.columnCount * iHeaderRows) - oInfo.columnCount) ||
					(iCol === 0 && bRowHeader)) {
					// move focus to first data row, scroll table to top
					this.setFirstVisibleRow(0);
					TableUtils.focusItem(this, oInfo.columnCount * iHeaderRows + iCol, oEvent);
				} else {
					// set focus to last header row, same column if possible
					TableUtils.focusItem(this, oInfo.columnCount * iHeaderRows - oInfo.columnCount + iCol, oEvent);
				}

				oEvent.stopImmediatePropagation(true);
			} else {
				if (this._isBottomRow(oEvent)) {
					this._scrollPageDown();
				}

				var iFixedBottomRowsOffset = this.getFixedBottomRowCount();
				if (this.getFirstVisibleRow() === this._getRowCount() - this.getVisibleRowCount()) {
					iFixedBottomRowsOffset = 0;
				}

				var iRowCount = (oInfo.cellCount / oInfo.columnCount) - iFixedBottomRowsOffset;
				var iCol = oInfo.cell % oInfo.columnCount;
				var iIndex = (iRowCount - 1) * oInfo.columnCount + iCol;

				TableUtils.focusItem(this, iIndex, oEvent);

				oEvent.stopImmediatePropagation(true);
			}
			oEvent.preventDefault();
		}
	};

	/*
	 * dynamic scrolling when reaching the top row with the PAGE DOWN key
	 */
	TableKeyboardDelegate.prototype.onsappagedownmodifiers = function(oEvent) {
		if (!this._getKeyboardExtension().isInActionMode() && oEvent.altKey) {
			var oInfo = TableUtils.getFocusedItemInfo(this);
			var bRowHeader = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);

			var iCol = oInfo.columnCount;
			var iNewCol;
			if (iCol == 0 && bRowHeader) {
				iNewCol = 1;
			} else {
				var iVisibleColumns = this._aVisibleColumns.length;
				var iMaxIndex = this._getVisibleColumns().length;
				if (!bRowHeader) {
					iMaxIndex--;
				}
				if (iVisibleColumns === 0) {
					iNewCol = iMaxIndex;
				} else {
					iNewCol = Math.min(iMaxIndex, iCol + iVisibleColumns);
				}
			}
			TableUtils.focusItem(this, oInfo.cell - (iCol - iNewCol), oEvent);
			oEvent.stopImmediatePropagation(true);
			oEvent.preventDefault();
		}
	};

	/*
	 * dynamic scrolling when reaching the top row with the PAGE UP key
	 */
	TableKeyboardDelegate.prototype.onsappageup = function(oEvent) {
		if (!this._getKeyboardExtension().isInActionMode()) {
			var $this = this.$();
			var oInfo = TableUtils.getFocusedItemInfo(this);

			var bRowHeader = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);
			var iHeaderRows = $this.find(".sapUiTableColHdrScr>.sapUiTableColHdr").length;
			var iCol = oInfo.cellInRow;

			if (this.getColumnHeaderVisible() && oInfo.cell < (oInfo.columnCount * iHeaderRows)) {
				// focus is on header
				if (oInfo.cell > oInfo.columnCount) {
					// focus is not on the first header row, move to first
					TableUtils.focusItem(this, iCol, oEvent);
				}
				oEvent.stopImmediatePropagation(true);
			} else {
				// focus is on content area
				if (this.getColumnHeaderVisible() && this.getFirstVisibleRow() == 0 && this._isTopRow(oEvent)) {
					// focus is on first row, move to last header row, same column
					if (bRowHeader && iCol === 0) {
						TableUtils.focusItem(this, iCol, oEvent);
					} else {
						TableUtils.focusItem(this, oInfo.columnCount * iHeaderRows - oInfo.columnCount + iCol, oEvent);
					}
					oEvent.stopImmediatePropagation(true);
				} else {
					var iIndex = this.getColumnHeaderVisible() ? oInfo.columnCount * iHeaderRows : 0;
					TableUtils.focusItem(this, iIndex + iCol, oEvent);
					oEvent.stopImmediatePropagation(true);

					if (this._isTopRow(oEvent)) {
						this._scrollPageUp();
					}
				}
			}

			oEvent.preventDefault();
		}
	};

	/*
	 * dynamic scrolling when reaching the top row with the PAGE UP key
	 */
	TableKeyboardDelegate.prototype.onsappageupmodifiers = function(oEvent) {
		if (!this._getKeyboardExtension().isInActionMode() && oEvent.altKey) {
			var oInfo = TableUtils.getFocusedItemInfo(this);
			var bRowHeader = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);

			var iCol = oInfo.columnCount;
			if (iCol > 0) {
				var iNewCol;
				if (iCol == 1 && bRowHeader) {
					iNewCol = 0;
				} else {
					var iVisibleColumns = this._aVisibleColumns.length;
					if (iVisibleColumns === 0) {
						if (bRowHeader) {
							iNewCol = 1;
						} else {
							iNewCol = 0;
						}
					} else {
						var iMin = 1;
						if (!bRowHeader) {
							iMin = 0;
						}
						iNewCol = Math.max(iMin, iCol - iVisibleColumns);
					}
				}
				TableUtils.focusItem(this, oInfo.cell - (iCol - iNewCol), oEvent);
			}
			oEvent.stopImmediatePropagation(true);
			oEvent.preventDefault();
		}
	};

	/*
	 * Keyboard Handling regarding HOME key
	 */
	TableKeyboardDelegate.prototype.onsaphome = function(oEvent) {
		var bIsRowOnly = (this.getSelectionBehavior() == sap.ui.table.SelectionBehavior.RowOnly);

		// If focus is on a group header, do nothing.
		var bIsGroupCell = jQuery(oEvent.target).parents(".sapUiTableGroupHeader").length > 0;
		if (bIsGroupCell) {
			oEvent.stopImmediatePropagation(true);
			return;
		}

		var oInfo = TableUtils.getFocusedItemInfo(this);
		var iFocusedIndex = oInfo.cell;
		var iSelectedCellInRow = oInfo.cellInRow;

		var offset = 0;
		if (!bIsRowOnly) {
			offset = 1;
		}

		if (iSelectedCellInRow > this.getFixedColumnCount() + offset) {
			// If there is a fixed column, stop right of it.
			oEvent.stopImmediatePropagation(true);
			TableUtils.focusItem(this, iFocusedIndex - iSelectedCellInRow + this.getFixedColumnCount() + offset, null);
		} else if (!bIsRowOnly) {
			if (iSelectedCellInRow > 1) {
				// if focus is anywhere in the row, move focus to the first column cell.
				oEvent.stopImmediatePropagation(true);
				TableUtils.focusItem(this, iFocusedIndex - iSelectedCellInRow + 1, null);
			} else if (iSelectedCellInRow == 1) {
				// if focus is on first cell, move focus to row header.
				oEvent.stopImmediatePropagation(true);
				TableUtils.focusItem(this, iFocusedIndex - 1, null);
			} else {
				// If focus is on selection cell, do nothing.
				oEvent.stopImmediatePropagation(true);
			}
		}
	};

	/*
	 * Keyboard Handling regarding END key
	 */
	TableKeyboardDelegate.prototype.onsapend = function(oEvent) {
		// If focus is on a group header, do nothing.
		var bIsGroupCell = jQuery(oEvent.target).parents(".sapUiTableGroupHeader").length > 0;
		if (bIsGroupCell) {
			oEvent.stopImmediatePropagation(true);
			return;
		}

		// If focus is on a selection cell, move focus to the first cell of the same row.
		var oInfo = TableUtils.getFocusedItemInfo(this);
		var iFocusedIndex = oInfo.cell;
		var iSelectedCellInRow = oInfo.cellInRow;

		var bIsRowOnly = (this.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly);
		var offset = 0;
		if (!bIsRowOnly) {
			offset = 1;
		}

		if (iSelectedCellInRow === 0 && bIsRowOnly) {
			// If focus is in row header, select first cell in same row.
			oEvent.stopImmediatePropagation(true);
			TableUtils.focusItem(this, iFocusedIndex + 1, null);
		} else if (iSelectedCellInRow < this.getFixedColumnCount() - offset) {
			// if their is a fixed column, stop left of it.
			oEvent.stopImmediatePropagation(true);
			TableUtils.focusItem(this, iFocusedIndex - iSelectedCellInRow + this.getFixedColumnCount() - offset, null);
		}
	};

	/*
	 * dynamic scrolling when using CTRL + HOME key
	 */
	TableKeyboardDelegate.prototype.onsaphomemodifiers = function(oEvent) {
		if (oEvent.metaKey || oEvent.ctrlKey) {
			var $this = this.$();

			// Is target a table header cell
			var oTableHeader = $this.find(".sapUiTableColHdrCnt")[0];
			var bIsTableHeaderCell = jQuery.contains(oTableHeader, oEvent.target);

			// If focus is on a group header, do nothing.
			if (bIsTableHeaderCell) {
				oEvent.stopImmediatePropagation(true);
				return;
			}

			var oInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedIndex = oInfo.cell;
			var iSelectedCellInRow = oInfo.cellInRow;
			var iColumns = oInfo.columnCount;
			var iSelectedRowInColumn = Math.ceil(iFocusedIndex / iColumns) - 1;

			if (this.getColumnHeaderVisible()) {
				if (iSelectedRowInColumn == 1) {
					// if focus is in first row, select corresponding header
					oEvent.stopImmediatePropagation(true);
					TableUtils.focusItem(this, iSelectedCellInRow, oEvent);
				} else if (iSelectedRowInColumn > 1) {
					oEvent.stopImmediatePropagation(true);

					// if focus is in any row, select first cell row
					this.setFirstVisibleRow(0);

					var iTargetIndex = iSelectedCellInRow + iColumns;
					TableUtils.focusItem(this, iTargetIndex, oEvent);
				}
			} else {
				oEvent.stopImmediatePropagation(true);

				// if focus is in any row, select first cell row
				this.setFirstVisibleRow(0);

				var iTargetIndex = iFocusedIndex - iSelectedRowInColumn * iColumns;
				TableUtils.focusItem(this, iTargetIndex, oEvent);
			}
		}
	};

	/**
	 * dynamic scrolling when using CTRL + END key
	 */
	TableKeyboardDelegate.prototype.onsapendmodifiers = function(oEvent) {
		if (oEvent.metaKey || oEvent.ctrlKey) {
			var $this = this.$();

			// Is target a table header cell
			var oTableHeader = $this.find(".sapUiTableColHdrCnt")[0];
			var bIsTableHeaderCell = jQuery.contains(oTableHeader, oEvent.target);

			var oInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedIndex = oInfo.cell;
			var iColumns = oInfo.columnCount;
			var iSelectedCellInRow = oInfo.cellInRow;

			oEvent.stopImmediatePropagation(true);

			if (bIsTableHeaderCell) {
				// If focus is on a group header, select first cell row after header.
				TableUtils.focusItem(this, iFocusedIndex + iColumns, oEvent);
			} else {
				// if focus is on any cell row, select last cell row.
				this.setFirstVisibleRow(this._getRowCount() - this.getVisibleRowCount());
				var iTargetIndex = oInfo.cellCount - (iColumns - iSelectedCellInRow);
				TableUtils.focusItem(this, iTargetIndex, oEvent);
			}
		}
	};

	/*
	 * On shift+left on column header decrease the width of a column
	 */
	TableKeyboardDelegate.prototype.onsapleftmodifiers = function(oEvent) {
		var $Target = jQuery(oEvent.target);
		if ($Target.hasClass('sapUiTableCol')) {
			var iColIndex = parseInt($Target.attr('data-sap-ui-colindex'), 10),
				aVisibleColumns = this._getVisibleColumns(),
				oColumn = aVisibleColumns[this._aVisibleColumns.indexOf(iColIndex)];

			 if (oEvent.shiftKey) {
				 var iNewWidth = parseInt(oColumn.getWidth(), 10) - 16;
				oColumn.setWidth((iNewWidth > 20 ? iNewWidth : 20) + "px");
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			} else if (oEvent.ctrlKey || oEvent.metaKey) {
				if (iColIndex - 1 >= 0) {
					// check whether preceding column is part of column span
					var iNewIndex = 0;

					for (var iPointer = this._aVisibleColumns.indexOf(iColIndex) - 1; iPointer >= 0; iPointer--) {
						iNewIndex = this._aVisibleColumns[iPointer];
						if (aVisibleColumns[iPointer].$().css("display") !== "none") {
							break;
						}
					}
					this.removeColumn(oColumn);
					this.insertColumn(oColumn, iNewIndex);

					// also move spanned columns
					var iHeaderSpan = oColumn.getHeaderSpan();
					if (iHeaderSpan > 1) {
						for (var i = 1; i < iHeaderSpan; i++) {
							oColumn = aVisibleColumns[iColIndex + i];
							this.removeColumn(oColumn);
							this.insertColumn(oColumn, iNewIndex + i);
						}
					}
				}
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			}
		}
	};

	/*
	 * On shift+left on column header decrease the width of a column
	 */
	TableKeyboardDelegate.prototype.onsaprightmodifiers = function(oEvent) {
		var $Target = jQuery(oEvent.target);
		if ($Target.hasClass('sapUiTableCol')) {
			var iColIndex = parseInt($Target.attr('data-sap-ui-colindex'), 10);
			var aVisibleColumns = this._getVisibleColumns();
			var iPointer = this._aVisibleColumns.indexOf(iColIndex);
			var oColumn = aVisibleColumns[iPointer];
			 if (oEvent.shiftKey) {
				oColumn.setWidth(parseInt(oColumn.getWidth(), 10) + 16 + "px");
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			} else if (oEvent.ctrlKey || oEvent.metaKey) {
				var iHeaderSpan = oColumn.getHeaderSpan();
				if (iPointer < aVisibleColumns.length - iHeaderSpan) {
					// Depending on the header span of the column to be moved, several
					// columns might need to be moved to the right
					var iNextHeaderSpan = aVisibleColumns[iPointer + 1].getHeaderSpan(),
						iNewIndex = this._aVisibleColumns[iPointer + iNextHeaderSpan];
					//iPointer = this._aVisibleColumns[iPointer];
					for (var i = iHeaderSpan - 1; i >= 0; i--) {
						oColumn = aVisibleColumns[iPointer + i];
						this.removeColumn(oColumn);
						this.insertColumn(oColumn, iNewIndex + i);
					}
				}
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			}
		}
	};


	return TableKeyboardDelegate;

}, /* bExport= */ true);