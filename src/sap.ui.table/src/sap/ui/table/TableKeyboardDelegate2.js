/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableKeyboardDelegate2.
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	"./library",
	"./utils/TableUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function(BaseObject, Device, library, TableUtils, KeyCodes, jQuery) {
	"use strict";

	// Shortcuts
	var CellType = TableUtils.CELLTYPE;
	var SelectionMode = library.SelectionMode;

	/**
	 * Modifier key flags.
	 *
	 * @type {{CTRL: int, SHIFT: int, ALT: int}}
	 * @static
	 * @constant
	 */
	var ModKey = {
		CTRL: 1,
		SHIFT: 2,
		ALT: 4
	};

	/**
	 * Navigation direction.
	 *
	 * @type {{LEFT: string, RIGHT: string, UP: string, DOWN: string}}
	 * @static
	 * @constant
	 */
	var NavigationDirection = {
		LEFT: "Left",
		RIGHT: "Right",
		UP: "Up",
		DOWN: "Down"
	};

	// Workaround until (if ever) these values can be set by applications.
	var HORIZONTAL_SCROLLING_PAGE_SIZE = 5;
	var COLUMN_RESIZE_STEP_CSS_SIZE = "1rem";

	/**
	 * Prevent forwarding the keyboard event to the item navigation.
	 *
	 * @param {jQuery.Event} oEvent The keyboard event object.
	 * @param {boolean} [bPrevent=true] Whether to prevent forwarding the event to the item navigation.
	 */
	function preventItemNavigation(oEvent, bPrevent) {
		oEvent.setMarked("sapUiTableSkipItemNavigation", bPrevent !== false);
	}

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
		constructor: function(sType) {
			BaseObject.call(this);
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy: function() {
			BaseObject.prototype.destroy.apply(this, arguments);
		},

		/*
		 * @see sap.ui.base.Object#getInterface
		 */
		getInterface: function() {
			return this;
		}
	});

	/**
	 * Restores the focus to the last known cell position.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell = function(oTable, oEvent) {
		var oCellInfo = TableUtils.getFocusedItemInfo(oTable);
		var oLastInfo = oTable._getKeyboardExtension()._getLastFocusedCellInfo();
		TableUtils.focusItem(oTable, oCellInfo.cellInRow + (oCellInfo.columnCount * oLastInfo.row), oEvent);
	};

	/**
	 * Sets the focus to the corresponding column header of the last known cell position.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell = function(oTable, oEvent) {
		var oCellInfo = TableUtils.getFocusedItemInfo(oTable);
		TableUtils.focusItem(oTable, oCellInfo.cellInRow, oEvent);
	};

	/**
	 * Sets the focus to the corresponding column header of the last known cell position.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {string} sTabDummyCSSClass The the css class of the tab dummy element to be used in a selector.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._forwardFocusToTabDummy = function(oTable, sTabDummyCSSClass) {
		oTable._getKeyboardExtension()._setSilentFocus(oTable.$().find("." + sTabDummyCSSClass));
	};

	/**
	 * Checks whether a keyboard event was triggered by a specific key combination.
	 * On Mac systems the Meta key will be checked instead of the Ctrl key.
	 *
	 * @param {jQuery.Event} oEvent The keyboard event object.
	 * @param {int|string|null} vKey The key code integer, or character string, of the key which should have been pressed.
	 *                              If an <code>integer</code> is passed, the value will be compared with the <code>keyCode</code> value.
	 *                              If a <code>string</code> is passed, the value will be compared with the string representation of the
	 *                              <code>charCode</code>.
	 *                              If no value is passed only the modifier keys will be checked.
	 * @param {int} [modifierKeyMask=0] The modifier key bit mask.
	 * @returns {boolean} Returns <code>true</code>, if the specified key combination was pressed.
	 * @example
	 * TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.A); // A
	 * TableKeyboardDelegate._isKeyCombination(oEvent, "+"); // CharCode check: "+" and "NumpadPlus"
	 * TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.A, ModKey.CTRL + ModKey.SHIFT); // Ctrl+Shift+A
	 * TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL); // Ctrl (useful for simulated events like "sapdown")
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._isKeyCombination = function(oEvent, vKey, modifierKeyMask) {
		if (modifierKeyMask == null) {
			modifierKeyMask = 0;
		}

		var eventKey = typeof vKey === "string" ? String.fromCharCode(oEvent.charCode) : oEvent.keyCode;
		var eventModifierKeyMask = 0;

		eventModifierKeyMask |= (Device.os.macintosh ? oEvent.metaKey : oEvent.ctrlKey) && vKey !== KeyCodes.CONTROL ? ModKey.CTRL : 0;
		eventModifierKeyMask |= oEvent.shiftKey && vKey !== KeyCodes.SHIFT ? ModKey.SHIFT : 0;
		eventModifierKeyMask |= oEvent.altKey && vKey !== KeyCodes.ALT ? ModKey.ALT : 0;

		var bValidKey = vKey == null || eventKey === vKey;
		var bValidModifierKeys = modifierKeyMask === eventModifierKeyMask;

		return bValidKey && bValidModifierKeys;
	};

	/**
	 * Handler which is called when the Space or Enter keys are pressed.
	 * Opening the column context menu is not handled here, because pressing the ENTER key triggers sapenter on keydown. The column header should
	 * only be opened on keyup.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._handleSpaceAndEnter = function(oTable, oEvent) {
		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		// Select/Deselect all.
		if (oCellInfo.isOfType(CellType.COLUMNROWHEADER)) {
			oTable._getSelectionPlugin().onHeaderSelectorPress();

		// Expand/Collapse group.
		} else if (TableKeyboardDelegate._isElementGroupToggler(oTable, oEvent.target)) {
			TableUtils.Grouping.toggleGroupHeaderByRef(oTable, oEvent.target);

		// Select/Deselect row.
		} else if (oCellInfo.isOfType(CellType.ROWHEADER)) {
			selectItems();

		} else if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION)) {
			// The action mode should only be entered when cellClick is not handled and no selection is performed.
			var bEnterActionMode = !oTable.hasListeners("cellClick");

			// Fire the cell click event.
			if (!oTable._findAndfireCellEvent(oTable.fireCellClick, oEvent)) {

				// Select/Deselect row.
				if (TableUtils.isRowSelectionAllowed(oTable)) {
					selectItems();
					bEnterActionMode = false;
				}
			}

			if (bEnterActionMode) {
				var $InteractiveElements = TableUtils.getInteractiveElements(oEvent.target);
				if ($InteractiveElements) {
					oTable._getKeyboardExtension().setActionMode(true);
				}
			}
		}

		function selectItems() {
			var _doSelect = null;
			if (oTable._legacyMultiSelection) {
				_doSelect = function(iRowIndex) {
					oTable._legacyMultiSelection(iRowIndex, oEvent);
					return true;
				};
			}
			TableUtils.toggleRowSelection(oTable, oEvent.target, null, _doSelect);
		}
	};

	/**
	 * Moves the given column to the next or previous position (based on the visible columns).
	 *
	 * @param {sap.ui.table.Column} oColumn The column to move to another position.
	 * @param {boolean} bNext If <code>true</code>, the column is moved one position to the right, otherwise one position to the left.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._moveColumn = function(oColumn, bNext) {
		var oTable = oColumn.getParent();
		var aVisibleColumns = oTable._getVisibleColumns();
		var iIndexInVisibleColumns = aVisibleColumns.indexOf(oColumn);
		var iTargetIndex;

		if (bNext && iIndexInVisibleColumns < aVisibleColumns.length - 1) {
			iTargetIndex = oTable.indexOfColumn(aVisibleColumns[iIndexInVisibleColumns + 1]) + 1;
		} else if (!bNext && iIndexInVisibleColumns > 0) {
			iTargetIndex = oTable.indexOfColumn(aVisibleColumns[iIndexInVisibleColumns - 1]);
		}

		if (iTargetIndex != null) {
			TableUtils.Column.moveColumnTo(oColumn, iTargetIndex);
		}
	};

	/**
	 * Returns the visible and grouped columns of a table.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @returns {sap.ui.table.Column[]} Returns the visible and grouped columns of a table.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._getVisibleAndGroupedColumns = function(oTable) {
		return oTable.getColumns().filter(function(oColumn) {
			return oColumn.getVisible() || oColumn.getGrouped();
		});
	};

	/**
	 * Returns the index of the column in the array of visible and grouped columns
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.Column} oColumn Instance of the table column to get the index for.
	 * @returns {int} Returns the index of the column in the list of visible and grouped columns.
	 *                Returns -1 if the column is not in this list.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._getColumnIndexInVisibleAndGroupedColumns = function(oTable, oColumn) {
		var aVisibleAndGroupedColumns = TableKeyboardDelegate._getVisibleAndGroupedColumns(oTable);

		for (var i = 0; i < aVisibleAndGroupedColumns.length; i++) {
			var oVisibleOrGroupedColumn = aVisibleAndGroupedColumns[i];

			if (oVisibleOrGroupedColumn === oColumn) {
				return i;
			}
		}

		return -1;
	};

	/**
	 * Focuses an element.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {HTMLElement} oElement The element which will be focused.
	 * @param {boolean} [bSilentFocus=false] If set to <code>true</code>, the <code>focusin</code> event will not be processed after focusing the
	 *                                       element.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._focusElement = function(oTable, oElement, bSilentFocus) {
		if (!oTable || !oElement) {
			return;
		}
		if (bSilentFocus == null) {
			bSilentFocus = false;
		}

		TableUtils.deselectElementText(document.activeElement);

		if (bSilentFocus) {
			oTable._getKeyboardExtension()._setSilentFocus(oElement);
		} else {
			oElement.focus();
		}

		TableUtils.selectElementText(oElement);
	};

	/**
	 * Focus a content cell or the first interactive element inside a content cell.
	 * If there are no interactive elements, the cell is focused instead.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.utils.TableUtils.CellType} iCellType The type of the cell.
	 * @param {int} iRowIndex Index of the row in the rows aggregation.
	 * @param {int} [iColumnIndex] Index of the column in the columns aggregation. Only required for data cells.
	 * @param {boolean} [bFirstInteractiveElement=false] If <code>true</code>, the first interactive element in a cell is focused.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._focusCell = function(oTable, iCellType, iRowIndex, iColumnIndex, bFirstInteractiveElement, bAllowActionMode) {
		if (!oTable
			|| iCellType == null
			|| iRowIndex == null || iRowIndex < 0 || iRowIndex >= oTable.getRows().length) {
			return;
		}

		var oRow = oTable.getRows()[iRowIndex];
		var oCell;

		if (iCellType === CellType.ROWHEADER) {
			oTable._getKeyboardExtension()._setFocus(oTable.getDomRef("rowsel" + iRowIndex));
			return;
		} else if (iCellType === CellType.ROWACTION) {
			oCell = oTable.getDomRef("rowact" + iRowIndex);
		} else if (iCellType === CellType.DATACELL
				   && (iColumnIndex != null && iColumnIndex >= 0)) {
			var oColumn = oTable.getColumns()[iColumnIndex];
			var iColumnIndexInCellsAggregation = TableKeyboardDelegate._getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);
			if (iColumnIndexInCellsAggregation >= 0) {
				oCell = oRow.getDomRef("col" + iColumnIndexInCellsAggregation);
			}
		}

		if (!oCell) {
			return;
		}

		if (bFirstInteractiveElement) {
			var $InteractiveElements = TableUtils.getInteractiveElements(oCell);

			if ($InteractiveElements) {
				TableKeyboardDelegate._focusElement(oTable, $InteractiveElements[0]);
				return;
			}
		}

		if (bAllowActionMode) {
			oTable._getKeyboardExtension()._bStayInActionMode = true;
		}
		oCell.focus();
	};

	/**
	 * Sets the focus to the next cell (or the first interactive element inside that cell) in the specified direction.
	 * Scrolling will be performed when necessary.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The keyboard event object.
	 * @param {NavigationDirection} sDirection The direction in which to navigate.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._navigate = function(oTable, oEvent, sDirection) {
		if (oEvent.isMarked()) {
			return; // Do not interfere with embedded controls that react on the keyboard event.
		}

		var oKeyboardExtension = oTable._getKeyboardExtension();
		var bActionMode = oKeyboardExtension.isInActionMode();
		var oCellInfo = TableUtils.getCellInfo(TableUtils.getCell(oTable, oEvent.target));
		var bScrolled = false;

		if ((sDirection === NavigationDirection.UP || sDirection === NavigationDirection.DOWN) && oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
			var bCtrlKeyPressed = TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL);
			var bActionModeNavigation = bCtrlKeyPressed || bActionMode;
			var $ParentCell = TableUtils.getParentCell(oTable, oEvent.target);
			var bAllowSapFocusLeave = bActionMode && oCellInfo.isOfType(CellType.DATACELL);

			// If only the up or down key was pressed in text input elements, navigation should not be performed.
			if (!bCtrlKeyPressed && (oEvent.target instanceof window.HTMLInputElement || oEvent.target instanceof window.HTMLTextAreaElement)) {
				return;
			}

			// If only the up or down key was pressed while the table is in navigation mode, and a non-interactive element inside a cell is focused,
			// set the focus to the cell this element is inside.
			if (!bActionModeNavigation && $ParentCell) {
				$ParentCell.focus();
				return;
			}

			preventItemNavigation(oEvent);

			// The FocusHandler triggers the "sapfocusleave" event in a timeout of 0ms after a blur event. To give the control in the cell
			// enough time to react to the "sapfocusleave" event (e.g. sap.m.Input - changes its value), scrolling is performed
			// asynchronously.
			if (sDirection === NavigationDirection.UP) {
				if (TableUtils.isFirstScrollableRow(oTable, oCellInfo.cell)) {
					// Scroll one row up.
					bScrolled = oTable._getScrollExtension().scrollVertically(false, false, true, bAllowSapFocusLeave, function() {
						if (bAllowSapFocusLeave) {
							document.activeElement.blur();
						}
					});
				}
			} else if (TableUtils.isLastScrollableRow(oTable, oCellInfo.cell)) {
				// Scroll one row down.
				bScrolled = oTable._getScrollExtension().scrollVertically(true, false, true, bAllowSapFocusLeave, function() {
					if (bAllowSapFocusLeave) {
						document.activeElement.blur();
					}
				});
			}

			if (bScrolled) {
				oEvent.preventDefault(); // Prevent scrolling the page.

				if (bActionModeNavigation) {
					oTable.attachEventOnce("_rowsUpdated", function() {
						TableKeyboardDelegate._focusCell(oTable, oCellInfo.type, oCellInfo.rowIndex, oCellInfo.columnIndex, true);
					});
				}
			} else if (sDirection === NavigationDirection.UP && oCellInfo.rowIndex === 0) {
				// Let the item navigation focus the column header cell, but not in the row action column.
				preventItemNavigation(oEvent, oCellInfo.isOfType(CellType.ROWACTION) || bActionModeNavigation);

				// Leave the action mode when trying to navigate up on the first row.
				if (!bActionMode && $ParentCell) {
					$ParentCell.focus(); // A non-interactive element inside a cell is focused, focus the cell this element is inside.
				} else {
					oKeyboardExtension.setActionMode(false);
				}
			} else if (sDirection === NavigationDirection.DOWN && oCellInfo.rowIndex === oTable._getRowCounts().count - 1) {
				// Leave the action mode when trying to navigate down on the last row.
				if (!bActionMode && $ParentCell) {
					$ParentCell.focus(); // A non-interactive element inside a cell is focused, focus the cell this element is inside.
				} else {
					var oCreationRow = oTable.getCreationRow();

					if (!oCreationRow || !oCreationRow._takeOverKeyboardHandling(oEvent)) {
						// The CreationRow did not take over the focus.
						oKeyboardExtension.setActionMode(false);
					}
				}
			} else {
				// Focus the data cell above/below the currently focused one.
				var iDirectedDistance = sDirection === NavigationDirection.DOWN ? 1 : -1;
				TableKeyboardDelegate._focusCell(
					oTable, oCellInfo.type, oCellInfo.rowIndex + iDirectedDistance, oCellInfo.columnIndex, bActionModeNavigation);
				oEvent.preventDefault(); // Prevent positioning the cursor. The text should be selected instead.
			}

		} else if (sDirection === NavigationDirection.DOWN && oCellInfo.isOfType(CellType.ANYCOLUMNHEADER)) {
			var iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);

			if (TableUtils.isNoDataVisible(oTable)) {
				var oFocusInfo = TableUtils.getFocusedItemInfo(oTable);
				if (oFocusInfo.row - iHeaderRowCount <= 1) { // We are in the last column header row.
					// Prevent navigation to the table content.
					preventItemNavigation(oEvent);
				}

			} else if (oCellInfo.isOfType(CellType.COLUMNROWHEADER) && iHeaderRowCount > 1) {
				// Special logic needed because if the column header has multiple rows,
				// for the SelectAll cell multiple elements are added to the item navigation.
				preventItemNavigation(oEvent);
				// Focus the first row header.
				TableUtils.focusItem(oTable, iHeaderRowCount * (TableUtils.getVisibleColumnCount(oTable) + 1/*Row Headers*/), oEvent);
			}

		} else if (sDirection === NavigationDirection.LEFT && !bActionMode) {
			var bIsRTL = sap.ui.getCore().getConfiguration().getRTL();

			if (oCellInfo.isOfType(CellType.COLUMNHEADER) && bIsRTL) {
				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(oTable);
				var iFocusedColumn = oFocusedItemInfo.cellInRow - (TableUtils.hasRowHeader(oTable) ? 1 : 0);
				var iColumnCount = TableUtils.getVisibleColumnCount(oTable);

				if (TableUtils.hasRowActions(oTable) && iFocusedColumn === iColumnCount - 1) {
					// Do not navigate to the row actions column header cell.
					preventItemNavigation(oEvent);
				}
			}
		}
		// Navigation to the right is completely handled by the item navigation.
	};

	/**
	 * Checks whether an element is in the list of elements which can allow expanding and collapsing a group, if a specific key is pressed on them.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {HTMLElement} oElement The element to check.
	 * @returns {boolean} Returns <code>true</code>, if pressing a specific key on this element can cause a group to expand or to collapse.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._isElementGroupToggler = function(oTable, oElement) {
		return TableUtils.Grouping.isInGroupingRow(oElement)
			   || (TableUtils.Grouping.isTreeMode(oTable)
				   && oElement.classList.contains("sapUiTableCellFirst")
				   && (oElement.querySelector(".sapUiTableTreeIconNodeOpen")
					   || oElement.querySelector(".sapUiTableTreeIconNodeClosed")))
			   || oElement.classList.contains("sapUiTableTreeIconNodeOpen")
			   || oElement.classList.contains("sapUiTableTreeIconNodeClosed");
	};

	/**
	 * Find out if an element is interactive.
	 *
	 * @param {jQuery|HTMLElement} oElement The element to check.
	 * @returns {boolean|null} Returns <code>true</code>, if the passed element is interactive.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._isElementInteractive = function(oElement) {
		if (!oElement) {
			return false;
		}

		return jQuery(oElement).is(TableUtils.INTERACTIVE_ELEMENT_SELECTORS);
	};

	/**
	 * Returns the first interactive element in a row.
	 *
	 * @param {sap.ui.table.Row} oRow The row from which to get the interactive element.
	 * @returns {jQuery|null} Returns <code>null</code> if the passed row does not contain any interactive elements.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._getFirstInteractiveElement = function(oRow) {
		if (!oRow) {
			return null;
		}

		var oTable = oRow.getParent();
		var aCells = oRow.getCells();
		var $Cell;
		var $InteractiveElements;

		if (TableUtils.hasRowActions(oTable)) {
			aCells.push(oRow.getRowAction());
		}

		for (var i = 0; i < aCells.length; i++) {
			$Cell = TableUtils.getParentCell(oTable, aCells[i].getDomRef());
			$InteractiveElements = TableUtils.getInteractiveElements($Cell);

			if ($InteractiveElements) {
				return $InteractiveElements.first();
			}
		}

		return null;
	};

	/**
	 * Returns the last interactive element in a row.
	 *
	 * @param {sap.ui.table.Row} oRow The row from which to get the interactive element.
	 * @returns {jQuery|null} Returns <code>null</code> if the passed row does not contain any interactive elements.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._getLastInteractiveElement = function(oRow) {
		if (!oRow) {
			return null;
		}

		var oTable = oRow.getParent();
		var aCells = oRow.getCells();
		var $Cell;
		var $InteractiveElements;

		if (TableUtils.hasRowActions(oTable)) {
			aCells.push(oRow.getRowAction());
		}

		for (var i = aCells.length - 1; i >= 0; i--) {
			$Cell = TableUtils.getParentCell(oTable, aCells[i].getDomRef());
			$InteractiveElements = TableUtils.getInteractiveElements($Cell);

			if ($InteractiveElements) {
				return $InteractiveElements.last();
			}
		}

		return null;
	};

	/**
	 * Returns the interactive element before an interactive element in the same row.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oElement An interactive element in a row.
	 * @returns {jQuery|null} Returns <code>null</code> if <code>oElement</code> is not an interactive element, or is the first interactive element in
	 *                        the row.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._getPreviousInteractiveElement = function(oTable, oElement) {
		if (!oTable || !oElement) {
			return null;
		}

		var $Element = jQuery(oElement);
		if (!this._isElementInteractive($Element)) {
			return null;
		}

		var $Cell = TableUtils.getParentCell(oTable, oElement);
		var $InteractiveElements;
		var oCellInfo;
		var oCellContent;
		var aCells;
		var oColumn;
		var iColumnIndexInCellsAggregation;
		var iColumnIndexToStartSearch;

		// Search for the previous interactive element in the current cell.
		$InteractiveElements = TableUtils.getInteractiveElements($Cell);
		if ($InteractiveElements[0] !== $Element[0]) {
			return $InteractiveElements.eq($InteractiveElements.index(oElement) - 1);
		}

		// The previous interactive element could not be found in the current cell. Prepare the next search.
		oCellInfo = TableUtils.getCellInfo($Cell);
		aCells = oTable.getRows()[oCellInfo.rowIndex].getCells();

		if (oCellInfo.isOfType(CellType.ROWACTION)) {
			iColumnIndexToStartSearch = aCells.length - 1;
		} else {
			oColumn = oTable.getColumns()[oCellInfo.columnIndex];
			iColumnIndexInCellsAggregation = TableKeyboardDelegate._getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);
			iColumnIndexToStartSearch = iColumnIndexInCellsAggregation - 1;
		}

		// Perform the search to the left iterating from cell to cell.
		// A possibly existing row action cell would have been analyzed in the beginning.
		for (var i = iColumnIndexToStartSearch; i >= 0; i--) {
			oCellContent = aCells[i].getDomRef();
			$Cell = TableUtils.getParentCell(oTable, oCellContent);
			$InteractiveElements = TableUtils.getInteractiveElements($Cell);

			if ($InteractiveElements) {
				return $InteractiveElements.last();
			}
		}

		return null;
	};

	/**
	 * Returns the interactive element after an interactive element in the same row.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oElement An element in a row.
	 * @returns {jQuery|null} Returns <code>null</code> if <code>oElement</code> is not an interactive element, or is the last interactive element in
	 *                        the row.
	 * @private
	 * @static
	 */
	TableKeyboardDelegate._getNextInteractiveElement = function(oTable, oElement) {
		if (!oTable || !oElement) {
			return null;
		}

		var $Element = jQuery(oElement);
		if (!this._isElementInteractive($Element)) {
			return null;
		}

		var $Cell = TableUtils.getParentCell(oTable, oElement);
		var $InteractiveElements;
		var oCellInfo;
		var oCellContent;
		var aCells;
		var oColumn;
		var oRow;
		var iColumnIndexInCellsAggregation;

		// Search for the next interactive element in the current cell.
		$InteractiveElements = TableUtils.getInteractiveElements($Cell);
		if ($InteractiveElements.get(-1) !== $Element[0]) {
			return $InteractiveElements.eq($InteractiveElements.index(oElement) + 1);
		}

		// The next interactive element could not be found in the current cell. Prepare the next search.
		oCellInfo = TableUtils.getCellInfo($Cell);

		if (oCellInfo.isOfType(CellType.ROWACTION)) {
			return null; // The passed element is already the last interactive element in this row.
		}

		oRow = oTable.getRows()[oCellInfo.rowIndex];
		aCells = oRow.getCells();
		oColumn = oTable.getColumns()[oCellInfo.columnIndex];
		iColumnIndexInCellsAggregation = TableKeyboardDelegate._getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);

		// Search in the next cells.
		for (var i = iColumnIndexInCellsAggregation + 1; i < aCells.length; i++) {
			oCellContent = aCells[i].getDomRef();
			$Cell = TableUtils.getParentCell(oTable, oCellContent);
			$InteractiveElements = TableUtils.getInteractiveElements($Cell);

			if ($InteractiveElements) {
				return $InteractiveElements.first();
			}
		}

		// Search in the row action cell.
		if (TableUtils.hasRowActions(oTable)) {
			$Cell = TableUtils.getParentCell(oTable, oRow.getRowAction().getDomRef());
			$InteractiveElements = TableUtils.getInteractiveElements($Cell);

			if ($InteractiveElements.get(-1) !== $Element[0]) {
				return $InteractiveElements.eq($InteractiveElements.index(oElement) + 1);
			}
		}

		return null;
	};

	//******************************************************************************************

	function startRangeSelectionMode(oTable) {
		var iFocusedRowIndex = TableUtils.getRowIndexOfFocusedCell(oTable);
		var iDataRowIndex = oTable.getRows()[iFocusedRowIndex].getIndex();
		var oSelectionPlugin = oTable._getSelectionPlugin();

		/**
		 * Contains information that are used when the range selection mode is active.
		 * If this property is undefined the range selection mode is not active.
		 * @type {{startIndex: int, selected: boolean}}
		 * @property {int} startIndex The index of the data row in which the selection mode was activated.
		 * @property {boolean} selected True, if the data row in which the selection mode was activated is selected.
		 * @private
		 */
		oTable._oRangeSelection = {
			startIndex: iDataRowIndex,
			selected: oSelectionPlugin.isIndexSelected(iDataRowIndex)
		};
	}

	/**
	 * Hook which is called by the keyboard extension when the table should enter the action mode.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the {@link sap.ui.table.TableKeyboardExtension} should enter the action mode.
	 * @see TableKeyboardExtension#setActionMode
	 */
	TableKeyboardDelegate.prototype.enterActionMode = function() {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oActiveElement = document.activeElement;
		var $InteractiveElements = TableUtils.getInteractiveElements(oActiveElement);
		var $Cell = TableUtils.getParentCell(this, oActiveElement);
		var oCellInfo = TableUtils.getCellInfo($Cell);

		if (oCellInfo.isOfType(CellType.ANYCOLUMNHEADER)) {
			// The column header is not included into the action mode navigation.
			return false;
		}

		if ($InteractiveElements) {
			// Target is a data cell with interactive elements inside. Focus the first interactive element in the data cell.
			oKeyboardExtension._suspendItemNavigation();
			oActiveElement.tabIndex = -1;
			TableKeyboardDelegate._focusElement(this, $InteractiveElements[0], true);
			return true;
		} else if ($Cell) {
			// Target is an interactive element inside a data cell.
			this._getKeyboardExtension()._suspendItemNavigation();
			return true;
		}

		return false;
	};

	/**
	 * Hook which is called by the keyboard extension when the table leaves the action mode.
	 *
	 * @param {boolean} [bAdjustFocus=true] If set to <code>false</code>, the focus will not be changed.
	 * @see TableKeyboardExtension#setActionMode
	 */
	TableKeyboardDelegate.prototype.leaveActionMode = function(bAdjustFocus) {
		bAdjustFocus = bAdjustFocus == null ? true : bAdjustFocus;

		var oKeyboardExtension = this._getKeyboardExtension();
		var oActiveElement = document.activeElement;
		var $Cell = TableUtils.getParentCell(this, oActiveElement);

		oKeyboardExtension._resumeItemNavigation();

		if (bAdjustFocus) {
			if ($Cell) {
				TableKeyboardDelegate._focusElement(this, $Cell[0], true);
			} else {
				var oItemNavigation = this._getItemNavigation();

				if (oItemNavigation) {
					var aItemDomRefs = oItemNavigation.aItemDomRefs;
					var iFocusedIndex = aItemDomRefs.indexOf(oActiveElement);

					if (iFocusedIndex > -1) {
						oItemNavigation.setFocusedIndex(iFocusedIndex);
					}
				}

				oKeyboardExtension._setSilentFocus(oActiveElement);
			}
		}
	};

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
			}
		}/* else {
			// If needed and NoData visible, then set the focus to NoData area.
			this.$("noDataCnt").focus();
		}*/

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);
		var bIsRowHeaderCellInGroupHeaderRow = oCellInfo.isOfType(CellType.ROWHEADER)
											   && TableUtils.Grouping.isInGroupingRow(oEvent.target);
		var bIsRowSelectorCell = oCellInfo.isOfType(CellType.ROWHEADER)
								 && !bIsRowHeaderCellInGroupHeaderRow
								 && TableUtils.isRowSelectorSelectionAllowed(this);
		var bCellAllowsActionMode = oCellInfo.isOfType(CellType.DATACELL) && this._getKeyboardExtension()._bStayInActionMode;
		var bParentIsAContentCell = TableUtils.getCellInfo(TableUtils.getParentCell(this, oEvent.target)).isOfType(CellType.ANYCONTENTCELL);
		var bIsInteractiveElement = TableKeyboardDelegate._isElementInteractive(oEvent.target);
		var bIsInActionMode = this._getKeyboardExtension().isInActionMode();

		// Leave the action mode when focusing an element in the table which is not supported by the action mode.
		// Supported elements:
		// - Group row header cell; If the table is in action mode.
		// - Row selector cell; If the table is in action mode and row selection with row headers is possible.
		// - Interactive element inside a content cell.
		var bShouldBeInActionMode = (bIsInActionMode && (bIsRowHeaderCellInGroupHeaderRow || bIsRowSelectorCell || bCellAllowsActionMode)
									 || (bIsInteractiveElement && bParentIsAContentCell));

		if (bCellAllowsActionMode) {
			this._getKeyboardExtension()._bStayInActionMode = false;
		}

		// Enter or leave the action mode silently (onfocusin will be skipped).
		this._getKeyboardExtension().setActionMode(bShouldBeInActionMode, false);
	};

	/*
	 * Handled keys:
	 * Shift, Space, F2, F4, Ctrl+A, Ctrl+Shift+A, Ctrl+V (for msie)
	 */
	TableKeyboardDelegate.prototype.onkeydown = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oCellInfo = TableUtils.getCellInfo(oEvent.target);
		var sSelectionMode = this.getSelectionMode();
		var oSelectionPlugin = this._getSelectionPlugin();

		// IE fires the paste event only on editable DOM elements, but we need it on any element, e.g. cells.
		if (Device.browser.msie && TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.V, ModKey.CTRL)) {
			this.onpaste(oEvent);
			return;
		}

		// Toggle the action mode by changing the focus between a data cell and its interactive controls.
		if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.F2)) {
			var bIsInActionMode = oKeyboardExtension.isInActionMode();
			var $Cell = TableUtils.getCell(this, oEvent.target);
			var bIsInCell = TableUtils.getParentCell(this, oEvent.target) != null;

			oCellInfo = TableUtils.getCellInfo($Cell);

			if (!bIsInActionMode && bIsInCell) {
				// A non-interactive element inside a cell, or any kind of element inside a column header cell is focused.
				// Focus the cell this element is inside.
				$Cell.focus();

			} else if (oCellInfo.isOfType(CellType.ANYCOLUMNHEADER)) {
				// Focus the interactive element inside a column header cell.
				var $InteractiveElements = TableUtils.getInteractiveElements($Cell);
				if ($InteractiveElements) {
					$InteractiveElements[0].focus();
				}

			} else {
				// The focus is on a content cell or an interactive element inside a content cell.
				// Toggle the action mode.
				oKeyboardExtension.setActionMode(!bIsInActionMode);
			}

			return;

		// Expand/Collapse group.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.F4) &&
				   TableKeyboardDelegate._isElementGroupToggler(this, oEvent.target)) {
			TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target);
			return;
		}

		if (this._getKeyboardExtension().isInActionMode() || !oCellInfo.isOfType(CellType.ANY)) {
			return;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE)) {
			oEvent.preventDefault(); // Prevent scrolling the page.
		}

		// Shift: Start the range selection mode.
		if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SHIFT) &&
			sSelectionMode === SelectionMode.MultiToggle &&
			(oCellInfo.isOfType(CellType.ROWHEADER) && TableUtils.isRowSelectorSelectionAllowed(this) ||
			(oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION)))) {

			startRangeSelectionMode(this);

		// Ctrl+A: Select/Deselect all.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.A, ModKey.CTRL)) {
			oEvent.preventDefault(); // Prevent full page text selection.

			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL | CellType.COLUMNROWHEADER) && sSelectionMode === SelectionMode.MultiToggle) {
				oSelectionPlugin.onKeyboardShortcut("toggle");
			}

		// Ctrl+Shift+A: Deselect all.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.A, ModKey.CTRL + ModKey.SHIFT)) {
			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL | CellType.COLUMNROWHEADER)) {
				oSelectionPlugin.onKeyboardShortcut("clear");
			}

		// F4: Enter the action mode.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.F4)) {
			if (oCellInfo.isOfType(CellType.DATACELL)) {
				oKeyboardExtension.setActionMode(true);
			}
		}
	};

	/*
	 * This handler is required because the browsers have different keycodes for "+" and "-". Only the Numpad keycodes are reliable.
	 *
	 * For example:
	 * UI5 default:
	 *  - PLUS = 187 (jQuery.sap.KeyCodes.PLUS)
	 *  - MINUS: 219 (jQuery.sap.KeyCodes.MINUS)
	 * Chrome, Edge, IE:
	 *  - MINUS = 189
	 * Firefox:
	 * - PLUS = 171
	 * - MINUS = 173
	 *
	 * And this applies only for the german keyboard layout! It is different again in other languages.
	 */
	TableKeyboardDelegate.prototype.onkeypress = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (TableKeyboardDelegate._isKeyCombination(oEvent, "+")) {
			if (TableKeyboardDelegate._isElementGroupToggler(this, oEvent.target)) {
				TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target, true);

			} else if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION)) {
				oKeyboardExtension.setActionMode(true);
			}

		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, "-")) {
			if (TableKeyboardDelegate._isElementGroupToggler(this, oEvent.target)) {
				TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target, false);

			} else if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION)) {
				oKeyboardExtension.setActionMode(true);
			}
		}
	};

	TableKeyboardDelegate.prototype.oncontextmenu = function(oEvent) {
		if (oEvent.isMarked("handledByPointerExtension")) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(document.activeElement);

		if (oCellInfo.isOfType(CellType.ANY)) {
			oEvent.preventDefault(); // Prevent opening the default browser context menu.
			TableUtils.Menu.openContextMenu(this, oEvent.target, oEvent);
		}
	};

	/*
	 * Handles keys:
	 * Shift, Space, Enter
	 */
	TableKeyboardDelegate.prototype.onkeyup = function(oEvent) {
		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		// End the range selection mode.
		if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SHIFT)) {
			delete this._oRangeSelection;
		}

		if (oCellInfo.isOfType(CellType.COLUMNHEADER)) {
			if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE) || TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.ENTER)) {
				TableUtils.Menu.openContextMenu(this, oEvent.target);
			}
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE)) {
			TableKeyboardDelegate._handleSpaceAndEnter(this, oEvent);
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE, ModKey.SHIFT)) {
			TableUtils.toggleRowSelection(this, this.getRows()[oCellInfo.rowIndex].getIndex());

			startRangeSelectionMode(this);
		} else if (this._legacyMultiSelection && !oCellInfo.isOfType(CellType.COLUMNROWHEADER) &&
					(TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE, ModKey.CTRL) ||
					TableKeyboardDelegate._isKeyCombination(oEvent, KeyCodes.ENTER, ModKey.CTRL))) {
			TableKeyboardDelegate._handleSpaceAndEnter(this, oEvent);
		}
	};

	TableKeyboardDelegate.prototype.onsaptabnext = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oCellInfo = TableUtils.getCellInfo(oEvent.target);
		var $Cell;

		if (oKeyboardExtension.isInActionMode()) {
			var $InteractiveElement;

			$Cell = TableUtils.getCell(this, oEvent.target);
			oCellInfo = TableUtils.getCellInfo($Cell);

			if (!oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
				return; // Not a content cell or an element inside a content cell.
			}

			var oRow = this.getRows()[oCellInfo.rowIndex];
			var $LastInteractiveElement = TableKeyboardDelegate._getLastInteractiveElement(oRow);
			var bIsLastInteractiveElementInRow = $LastInteractiveElement === null || $LastInteractiveElement[0] === oEvent.target;

			if (bIsLastInteractiveElementInRow) {
				var iAbsoluteRowIndex = oRow.getIndex();
				var bIsLastScrollableRow = TableUtils.isLastScrollableRow(this, $Cell);
				var bIsAbsoluteLastRow = this._getTotalRowCount() - 1 === iAbsoluteRowIndex;
				var bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(this);

				oEvent.preventDefault();
				if (bIsAbsoluteLastRow) {
					oKeyboardExtension.setActionMode(false);
				} else if (bIsLastScrollableRow) {
					scrollDownAndFocus(this, oCellInfo, bTableHasRowSelectors, oCellInfo.rowIndex, oRow);
				} else {
					var iRowIndex = oCellInfo.rowIndex;

					if (bTableHasRowSelectors) {
						TableKeyboardDelegate._focusCell(this, CellType.ROWHEADER, iRowIndex + 1);
					} else {
						var iVisibleRowCount = this._getRowCounts().count;
						var bRowIsGroupHeaderRow = false;

						for (var i = oCellInfo.rowIndex + 1; i < iVisibleRowCount; i++) {
							iRowIndex = i;
							oRow = this.getRows()[iRowIndex];
							$InteractiveElement = TableKeyboardDelegate._getFirstInteractiveElement(oRow);
							bRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oRow.getDomRef());
							if ($InteractiveElement || bRowIsGroupHeaderRow) {
								break;
							}
						}

						if ($InteractiveElement) {
							TableKeyboardDelegate._focusElement(this, $InteractiveElement[0]);
						} else if (bRowIsGroupHeaderRow) {
							TableKeyboardDelegate._focusCell(this, CellType.ROWHEADER, iRowIndex);
						} else {
							scrollDownAndFocus(this, oCellInfo, bTableHasRowSelectors, iRowIndex, oRow);
						}
					}
				}
			} else if (oCellInfo.isOfType(CellType.ROWHEADER)) {
				oEvent.preventDefault();
				$InteractiveElement = TableKeyboardDelegate._getFirstInteractiveElement(oRow);
				TableKeyboardDelegate._focusElement(this, $InteractiveElement[0]);

			} else {
				oEvent.preventDefault();
				$InteractiveElement = TableKeyboardDelegate._getNextInteractiveElement(this, oEvent.target);
				TableKeyboardDelegate._focusElement(this, $InteractiveElement[0]);
			}

		} else if (oCellInfo.isOfType(CellType.ANYCOLUMNHEADER)) {
			if (TableUtils.isNoDataVisible(this)) {
				this.$("noDataCnt").focus();
			} else {
				TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell(this, oEvent);
			}

			oEvent.preventDefault();

		} else if (oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
			TableKeyboardDelegate._forwardFocusToTabDummy(this, "sapUiTableCtrlAfter");

		} else if (oEvent.target === this.getDomRef("overlay")) {
			oKeyboardExtension._setSilentFocus(this.$().find(".sapUiTableOuterAfter"));

		} else if (!oCellInfo.isOfType(CellType.ANY)) {
			$Cell = TableUtils.getParentCell(this, oEvent.target);

			if ($Cell) {
				// The target is a non-interactive element inside a data cell. We are not in action mode, so focus the cell.
				oEvent.preventDefault();
				$Cell.focus();
			}
		}
	};

	function scrollDownAndFocus(oTable, oCellInfo, bTableHasRowSelectors, iRowIndex, oRow) {
		// The FocusHandler triggers the "sapfocusleave" event in a timeout of 0ms after a blur event. To give the control in the cell
		// enough time to react to the "sapfocusleave" event (e.g. sap.m.Input - changes its value), scrolling is performed
		// asynchronously.
		var bAllowSapFocusLeave = oCellInfo.isOfType(CellType.DATACELL);
		var oKeyboardExtension = oTable._getKeyboardExtension();
		var bScrolled = oTable._getScrollExtension().scrollVertically(true, false, true, bAllowSapFocusLeave, function() {
			if (bAllowSapFocusLeave) {
				document.activeElement.blur();
			}
		});

		if (bScrolled) {
			oTable.attachEventOnce("_rowsUpdated", function() {
				var bIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oRow.getDomRef());
				setFocusNext(oTable, oRow, iRowIndex, bTableHasRowSelectors, bIsGroupHeaderRow);
			});
		} else if (oRow.getIndex() !== oTable._getTotalRowCount() - 1) {
			// in case there are fixed bottom rows and the table cannot be scrolled anymore set the focus on the first fixed bottom row
			var iNextRowIndex = oCellInfo.rowIndex + 1;
			var oNextRow = oTable.getRows()[iNextRowIndex];
			var bNextRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oNextRow.getDomRef());

			setFocusNext(oTable, oNextRow, iNextRowIndex, bTableHasRowSelectors, bNextRowIsGroupHeaderRow);
		} else {
			// if the absolute last index is reached and no interactive elements are found -> leave action mode
			oKeyboardExtension.setActionMode(false);
		}
	}

	function setFocusNext(oTable, oRow, iRowIndex, bTableHasRowSelectors, bIsGroupHeaderRow) {
		var oKeyboardExtension = oTable._getKeyboardExtension();

		if (bTableHasRowSelectors || bIsGroupHeaderRow) {
			TableKeyboardDelegate._focusCell(oTable, CellType.ROWHEADER, iRowIndex);
		} else {
			var $InteractiveElement = TableKeyboardDelegate._getFirstInteractiveElement(oRow);

			if ($InteractiveElement) {
				TableKeyboardDelegate._focusElement(oTable, $InteractiveElement[0]);
			} else {
				TableKeyboardDelegate._focusCell(oTable, CellType.DATACELL, iRowIndex, 0, false, true);
				if (oRow.getIndex() === oTable._getTotalRowCount() - 1) {
					oKeyboardExtension.setActionMode(false);
				}
			}
		}
	}

	TableKeyboardDelegate.prototype.onsaptabprevious = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oCellInfo = TableUtils.getCellInfo(oEvent.target);
		var $Cell;

		if (oKeyboardExtension.isInActionMode()) {
			var $InteractiveElement;

			$Cell = TableUtils.getCell(this, oEvent.target);
			oCellInfo = TableUtils.getCellInfo($Cell);

			if (!oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
				return; // Not a content cell or an element inside a content cell.
			}

			var oRow = this.getRows()[oCellInfo.rowIndex];
			var iAbsoluteRowIndex = oRow.getIndex();
			var $FirstInteractiveElement = TableKeyboardDelegate._getFirstInteractiveElement(oRow);
			var bIsFirstInteractiveElementInRow = $FirstInteractiveElement !== null && $FirstInteractiveElement[0] === oEvent.target;
			var bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(this);
			var bRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oRow);
			var bRowHasInteractiveRowHeader = bTableHasRowSelectors || bRowIsGroupHeaderRow;

			if (bIsFirstInteractiveElementInRow && bRowHasInteractiveRowHeader) {
				oEvent.preventDefault();
				TableKeyboardDelegate._focusCell(this, CellType.ROWHEADER, oCellInfo.rowIndex);

			} else if ((bIsFirstInteractiveElementInRow && !bRowHasInteractiveRowHeader)
					   || oCellInfo.isOfType(CellType.ROWHEADER)
					   || $FirstInteractiveElement === null) {
				var bIsFirstScrollableRow = TableUtils.isFirstScrollableRow(this, $Cell);
				var bIsAbsoluteFirstRow = iAbsoluteRowIndex === 0;

				oEvent.preventDefault();
				if (bIsAbsoluteFirstRow) {
					oKeyboardExtension.setActionMode(false);

				} else if (bIsFirstScrollableRow) {
					scrollUpAndFocus(this, oCellInfo, bRowHasInteractiveRowHeader, oCellInfo.rowIndex, oRow);
				} else {
					var iRowIndex = oCellInfo.rowIndex;
					var bRowIsGroupHeaderRow = false;

					for (var i = oCellInfo.rowIndex - 1; i >= 0; i--) {
						iRowIndex = i;
						oRow = this.getRows()[iRowIndex];
						$InteractiveElement = TableKeyboardDelegate._getLastInteractiveElement(oRow);
						bRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oRow.getDomRef());
						if ($InteractiveElement || bRowHasInteractiveRowHeader || bRowIsGroupHeaderRow) {
							break;
						}
					}

					if ($InteractiveElement) {
						TableKeyboardDelegate._focusElement(this, $InteractiveElement[0]);
					} else if (bRowIsGroupHeaderRow || bRowHasInteractiveRowHeader) {
						TableKeyboardDelegate._focusCell(this, CellType.ROWHEADER, iRowIndex);
					} else {
						scrollUpAndFocus(this, oCellInfo, bRowHasInteractiveRowHeader, iRowIndex, oRow);
					}
				}

			} else {
				oEvent.preventDefault();
				$InteractiveElement = TableKeyboardDelegate._getPreviousInteractiveElement(this, oEvent.target);
				TableKeyboardDelegate._focusElement(this, $InteractiveElement[0]);
			}

		} else if (oCellInfo.isOfType(CellType.ANYCONTENTCELL) || oEvent.target === this.getDomRef("noDataCnt")) {
			if (this.getColumnHeaderVisible() && !oCellInfo.isOfType(CellType.ROWACTION)) {
				TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell(this, oEvent);
				oEvent.preventDefault();
			} else {
				TableKeyboardDelegate._forwardFocusToTabDummy(this, "sapUiTableCtrlBefore");
			}

		} else if (oEvent.target === this.getDomRef("overlay")) {
			this._getKeyboardExtension()._setSilentFocus(this.$().find(".sapUiTableOuterBefore"));

		} else if (!oCellInfo.isOfType(CellType.ANY)) {
			$Cell = TableUtils.getParentCell(this, oEvent.target);

			if ($Cell) {
				// The target is a non-interactive element inside a data cell. We are not in action mode, so focus the cell.
				oEvent.preventDefault();
				$Cell.focus();
			}
		}
	};

	function scrollUpAndFocus(oTable, oCellInfo, bRowHasInteractiveRowHeader, iRowIndex, oRow) {
		// The FocusHandler triggers the "sapfocusleave" event in a timeout of 0ms after a blur event. To give the control in the cell
		// enough time to react to the "sapfocusleave" event (e.g. sap.m.Input - changes its value), scrolling is performed
		// asynchronously.
		var bAllowSapFocusLeave = oCellInfo.isOfType(CellType.DATACELL);
		var oKeyboardExtension = oTable._getKeyboardExtension();
		var bScrolled = oTable._getScrollExtension().scrollVertically(false, false, true, bAllowSapFocusLeave, function() {
			if (bAllowSapFocusLeave) {
				document.activeElement.blur();
			}
		});

		if (bScrolled) {
			oTable.attachEventOnce("_rowsUpdated", function() {
				var bIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oRow.getDomRef());
				setFocusPrevious(oTable, oRow, iRowIndex, bRowHasInteractiveRowHeader, bIsGroupHeaderRow);
			});
		} else if (oRow.getIndex() !== 0) {
			// in case there are fixed top rows and the table cannot be scrolled anymore set the focus on the last fixed top row
			var iPreviousRowIndex = oCellInfo.rowIndex - 1;
			var oPreviousRow = oTable.getRows()[iPreviousRowIndex];
			var bPreviousRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oPreviousRow.getDomRef());

			setFocusPrevious(oTable, oPreviousRow, iPreviousRowIndex, bRowHasInteractiveRowHeader, bPreviousRowIsGroupHeaderRow);
		} else {
			// if the absolute first index is reached and no interactive elements are found -> leave action mode
			oKeyboardExtension.setActionMode(false);
		}
	}

	function setFocusPrevious(oTable, oRow, iRowIndex, bRowHasInteractiveRowHeader, bIsGroupHeaderRow) {
		var oKeyboardExtension = oTable._getKeyboardExtension();
		var $InteractiveElement = TableKeyboardDelegate._getLastInteractiveElement(oRow);

		if ($InteractiveElement) {
			TableKeyboardDelegate._focusElement(oTable, $InteractiveElement[0]);
		} else if (bRowHasInteractiveRowHeader || bIsGroupHeaderRow) {
			TableKeyboardDelegate._focusCell(oTable, CellType.ROWHEADER, iRowIndex);
		} else {
			TableKeyboardDelegate._focusCell(oTable, CellType.DATACELL, iRowIndex, 0, false, true);
			if (oRow.getIndex() === 0) {
				oKeyboardExtension.setActionMode(false);
			}
		}
	}

	TableKeyboardDelegate.prototype.onsapdown = function(oEvent) {
		TableKeyboardDelegate._navigate(this, oEvent, NavigationDirection.DOWN);
	};

	TableKeyboardDelegate.prototype.onsapdownmodifiers = function(oEvent) {
		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			TableKeyboardDelegate._navigate(this, oEvent, NavigationDirection.DOWN);
			return;
		}

		var oKeyboardExtension = this._getKeyboardExtension();

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT) &&
			TableKeyboardDelegate._isElementGroupToggler(this, oEvent.target)) {

			preventItemNavigation(oEvent);
			TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target, true);
			return;
		}

		if (oKeyboardExtension.isInActionMode()) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			oEvent.preventDefault(); // Avoid text selection flickering.

			/* Range Selection */

			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
					return;
				}

				var iFocusedRowIndex = TableUtils.getRowIndexOfFocusedCell(this);
				var iDataRowIndex = this.getRows()[iFocusedRowIndex].getIndex();

				// If we are in the last data row of the table we don't need to do anything.
				if (iDataRowIndex === this._getTotalRowCount() - 1) {
					return;
				}

				if (TableUtils.isLastScrollableRow(this, oEvent.target)) {
					var bScrolled = this._getScrollExtension().scrollVertically(true, false, true);
					if (bScrolled) {
						preventItemNavigation(oEvent);
					}
				}

				if (this._oRangeSelection.startIndex <= iDataRowIndex) {
					iDataRowIndex++;
					if (this._oRangeSelection.selected) {
						TableUtils.toggleRowSelection(this, iDataRowIndex, true);
					} else {
						TableUtils.toggleRowSelection(this, iDataRowIndex, false);
					}
				} else {
					// When moving back down to the row where the range selection started, the rows always get deselected.
					TableUtils.toggleRowSelection(this, iDataRowIndex, false);
				}

			} else {
				preventItemNavigation(oEvent);
			}
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			if (oCellInfo.isOfType(CellType.DATACELL)) {
				oKeyboardExtension.setActionMode(true);
			}
			preventItemNavigation(oEvent);
		}
	};

	TableKeyboardDelegate.prototype.onsapup = function(oEvent) {
		TableKeyboardDelegate._navigate(this, oEvent, NavigationDirection.UP);
	};

	TableKeyboardDelegate.prototype.onsapupmodifiers = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			TableKeyboardDelegate._navigate(this, oEvent, NavigationDirection.UP);
			return;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT) &&
			TableKeyboardDelegate._isElementGroupToggler(this, oEvent.target)) {

			preventItemNavigation(oEvent);
			TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target, false);
			return;
		}

		if (oKeyboardExtension.isInActionMode()) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			oEvent.preventDefault(); // Avoid text selection flickering.

			/* Range Selection */

			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
					return;
				}

				var iFocusedRowIndex = TableUtils.getRowIndexOfFocusedCell(this);
				var iDataRowIndex = this.getRows()[iFocusedRowIndex].getIndex();

				// Do not move up to the header when performing a range selection.
				if (iDataRowIndex === 0) {
					preventItemNavigation(oEvent);
					return;
				}

				if (TableUtils.isFirstScrollableRow(this, oEvent.target)) {
					var bScrolled = this._getScrollExtension().scrollVertically(false, false, true);
					if (bScrolled) {
						preventItemNavigation(oEvent);
					}
				}

				if (this._oRangeSelection.startIndex >= iDataRowIndex) {
					iDataRowIndex--;
					if (this._oRangeSelection.selected) {
						TableUtils.toggleRowSelection(this, iDataRowIndex, true);
					} else {
						TableUtils.toggleRowSelection(this, iDataRowIndex, false);
					}
				} else {
					// When moving back up to the row where the range selection started, the rows always get deselected.
					TableUtils.toggleRowSelection(this, iDataRowIndex, false);
				}

			} else {
				preventItemNavigation(oEvent);
			}
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			if (oCellInfo.isOfType(CellType.DATACELL)) {
				oKeyboardExtension.setActionMode(true);
			}
			preventItemNavigation(oEvent);
		}
	};

	TableKeyboardDelegate.prototype.onsapleft = function(oEvent) {
		TableKeyboardDelegate._navigate(this, oEvent, NavigationDirection.LEFT);
	};

	TableKeyboardDelegate.prototype.onsapleftmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);
		var bIsRTL = sap.ui.getCore().getConfiguration().getRTL();

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			oEvent.preventDefault(); // Avoid text selection flickering.

			/* Range Selection */

			if (oCellInfo.isOfType(CellType.DATACELL)) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
					return;
				}

				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var bFocusOnFirstDataCell = TableUtils.hasRowHeader(this) && oFocusedItemInfo.cellInRow === 1;

				// If selection on row headers is not possible, then do not allow to move focus to them when performing a range selection.
				if (bFocusOnFirstDataCell && !TableUtils.isRowSelectorSelectionAllowed(this)) {
					preventItemNavigation(oEvent);
				}

			} else if (oCellInfo.isOfType(CellType.ROWACTION)) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
				}

			/* Range Selection: Required for RTL mode. */

			} else if (oCellInfo.isOfType(CellType.ROWHEADER) && bIsRTL) {
				// If selection on rows is not possible, then do not allow to move focus to them when performing a range selection.
				if (!TableUtils.isRowSelectionAllowed(this)) {
					preventItemNavigation(oEvent);
				}

			} else if (oCellInfo.isOfType(CellType.COLUMNROWHEADER) && bIsRTL) {
				preventItemNavigation(oEvent);

			/* Column Resizing */

			} else if (oCellInfo.isOfType(CellType.COLUMNHEADER)) {
				var iResizeDelta = -TableUtils.convertCSSSizeToPixel(COLUMN_RESIZE_STEP_CSS_SIZE);
				var iColumnSpanWidth = 0;

				if (bIsRTL) {
					iResizeDelta = iResizeDelta * -1;
				}

				for (var i = oCellInfo.columnIndex; i < oCellInfo.columnIndex + oCellInfo.columnSpan; i++) {
					iColumnSpanWidth += TableUtils.Column.getColumnWidth(this, i);
				}

				TableUtils.Column.resizeColumn(this, oCellInfo.columnIndex, iColumnSpanWidth + iResizeDelta, true, oCellInfo.columnSpan);

				preventItemNavigation(oEvent);
			}

		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {

			/* Column Reordering */

			if (oCellInfo.isOfType(CellType.COLUMNHEADER)) {
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();

				var oColumn = this.getColumns()[oCellInfo.columnIndex];
				TableKeyboardDelegate._moveColumn(oColumn, bIsRTL);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsaprightmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);
		var bIsRTL = sap.ui.getCore().getConfiguration().getRTL();

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			oEvent.preventDefault(); // Avoid text selection flickering.

			/* Range Selection */

			if (oCellInfo.isOfType(CellType.DATACELL)) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
				}

			} else if (oCellInfo.isOfType(CellType.ROWHEADER)) {
				// If selection on data cells is not possible, then do not allow to move focus to them when performing a range selection.
				if (!TableUtils.isRowSelectionAllowed(this)) {
					preventItemNavigation(oEvent);
				}

			/* Range Selection: Required for RTL mode. */

			} else if (oCellInfo.isOfType(CellType.ROWACTION) && bIsRTL) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
				}

			/* Column Resizing */

			} else if (oCellInfo.isOfType(CellType.COLUMNHEADER)) {
				var iResizeDelta = TableUtils.convertCSSSizeToPixel(COLUMN_RESIZE_STEP_CSS_SIZE);
				var iColumnSpanWidth = 0;

				if (bIsRTL) {
					iResizeDelta = iResizeDelta * -1;
				}

				for (var i = oCellInfo.columnIndex; i < oCellInfo.columnIndex + oCellInfo.columnSpan; i++) {
					iColumnSpanWidth += TableUtils.Column.getColumnWidth(this, i);
				}

				TableUtils.Column.resizeColumn(this, oCellInfo.columnIndex, iColumnSpanWidth + iResizeDelta, true, oCellInfo.columnSpan);

				preventItemNavigation(oEvent);

			} else if (oCellInfo.isOfType(CellType.COLUMNROWHEADER)) {
				preventItemNavigation(oEvent);
			}

		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {

			/* Column Reordering */

			if (oCellInfo.isOfType(CellType.COLUMNHEADER)) {
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();

				var oColumn = this.getColumns()[oCellInfo.columnIndex];
				TableKeyboardDelegate._moveColumn(oColumn, !bIsRTL);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsaphome = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		// If focus is on a group header, do nothing.
		if (TableUtils.Grouping.isInGroupingRow(oEvent.target)) {
			preventItemNavigation(oEvent);
			oEvent.preventDefault(); // Prevent scrolling the page.
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (oCellInfo.isOfType(CellType.ANY)) {
			oEvent.preventDefault(); // Prevent scrolling the page.
		}

		if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION | CellType.COLUMNHEADER)) {
			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedIndex = oFocusedItemInfo.cell;
			var iFocusedCellInRow = oFocusedItemInfo.cellInRow;
			var iFixedColumnCount = this.getComputedFixedColumnCount();
			var bHasRowHeader = TableUtils.hasRowHeader(this);
			var iRowHeaderOffset = bHasRowHeader ? 1 : 0;

			if (TableUtils.hasFixedColumns(this) && iFocusedCellInRow > iFixedColumnCount + iRowHeaderOffset) {
				// If there is a fixed column area and the focus is to the right of the first cell in the non-fixed area,
				// then set the focus to the first cell in the non-fixed area.
				preventItemNavigation(oEvent);
				TableUtils.focusItem(this, iFocusedIndex - iFocusedCellInRow + iFixedColumnCount + iRowHeaderOffset, null);

			} else if (bHasRowHeader && iFocusedCellInRow > 1) {
				// If there is a row header column and the focus is after the first content column,
				// then set the focus to the cell in the first content column.
				preventItemNavigation(oEvent);
				TableUtils.focusItem(this, iFocusedIndex - iFocusedCellInRow + iRowHeaderOffset, null);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsapend = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		// If focus is on a group header, do nothing.
		if (TableUtils.Grouping.isInGroupingRow(oEvent.target)) {
			oEvent.preventDefault(); // Prevent scrolling the page.
			preventItemNavigation(oEvent);
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (oCellInfo.isOfType(CellType.ANY)) {
			oEvent.preventDefault(); // Prevent scrolling the page.

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedIndex = oFocusedItemInfo.cell;
			var iColumnCount = oFocusedItemInfo.columnCount;
			var iFixedColumnCount = this.getComputedFixedColumnCount();
			var iFocusedCellInRow = oFocusedItemInfo.cellInRow;
			var bHasRowHeader = TableUtils.hasRowHeader(this);
			var iRowHeaderOffset = bHasRowHeader ? 1 : 0;
			var bIsColSpanAtFixedAreaEnd = false;

			// If the focused cell is a column span in the column header at the end of the fixed area,
			// the selected cell index is the index of the first cell in the span.
			// Treat this case like there is no span and the last cell of the fixed area is selected.
			if (oCellInfo.isOfType(CellType.COLUMNHEADER) && TableUtils.hasFixedColumns(this)) {
				var iColSpan = parseInt(oCellInfo.cell.attr("colspan") || 1);
				if (iColSpan > 1 && iFocusedCellInRow + iColSpan - iRowHeaderOffset === iFixedColumnCount) {
					bIsColSpanAtFixedAreaEnd = true;
				}
			}

			if (bHasRowHeader && iFocusedCellInRow === 0) {
				// If there is a row header and it has the focus,
				// then set the focus to the cell in the next column.
				preventItemNavigation(oEvent);
				TableUtils.focusItem(this, iFocusedIndex + 1, null);

			} else if (TableUtils.hasFixedColumns(this)
					   && iFocusedCellInRow < iFixedColumnCount - 1 + iRowHeaderOffset
					   && !bIsColSpanAtFixedAreaEnd) {
				// If there is a fixed column area and the focus is not on its last cell or column span,
				// then set the focus to the last cell of the fixed column area.
				preventItemNavigation(oEvent);
				TableUtils.focusItem(this, iFocusedIndex + iFixedColumnCount - iFocusedCellInRow, null);

			} else if (TableUtils.hasRowActions(this) && oCellInfo.isOfType(CellType.DATACELL) && iFocusedCellInRow < iColumnCount - 2) {
				// If the focus is on a data cell in the scrollable column area (except last cell),
				// then set the focus to the row actions cell.
				// Note: The END navigation from the last cell to the row action cell is handled by the item navigation.
				preventItemNavigation(oEvent);
				TableUtils.focusItem(this, iFocusedIndex - iFocusedCellInRow + iColumnCount - 2, null);
			}

		}
	};

	TableKeyboardDelegate.prototype.onsaphomemodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			oEvent.preventDefault(); // Prevent scrolling the page.
			var oCellInfo = TableUtils.getCellInfo(oEvent.target);

			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL | CellType.COLUMNHEADER)) {
				preventItemNavigation(oEvent);

				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var iFocusedRow = oFocusedItemInfo.row;

				// Only do something if the focus is not in the first row already.
				if (iFocusedRow > 0) {
					var iFocusedIndex = oFocusedItemInfo.cell;
					var iColumnCount = oFocusedItemInfo.columnCount;
					var iHeaderRowCount = TableUtils.getHeaderRowCount(this);
					var mRowCounts = this._getRowCounts();

					/* Column header area */
					/* Top fixed area */
					if (iFocusedRow < iHeaderRowCount + mRowCounts.fixedTop) {
						if (oCellInfo.isOfType(CellType.ROWACTION)) {
							// Set the focus to the first row (row actions do not have a header).
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);
						} else {
							// In case a column header exists, set the focus to the first row of the column header,
							// otherwise set the focus to the first row of the top fixed area.
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iFocusedRow, oEvent);
						}

					/* Scrollable area */
					} else if (iFocusedRow >= iHeaderRowCount + mRowCounts.fixedTop &&
							   iFocusedRow < iHeaderRowCount + TableUtils.getNonEmptyVisibleRowCount(this) - mRowCounts.fixedBottom) {
						this._getScrollExtension().scrollVerticallyMax(false, true);
						// If a fixed top area exists or we are in the row action column (has no header), then set the focus to the first row (of
						// the top fixed area), otherwise set the focus to the first row of the column header area.
						if (mRowCounts.fixedTop > 0 || oCellInfo.isOfType(CellType.ROWACTION)) {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);
						} else {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iFocusedRow, oEvent);
						}

					/* Bottom fixed area */
					} else {
						// Set the focus to the first row of the scrollable area and scroll to top.
						this._getScrollExtension().scrollVerticallyMax(false, true);
						TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - mRowCounts.fixedTop), oEvent);
					}
				}
			}
		}
	};

	TableKeyboardDelegate.prototype.onsapendmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			oEvent.preventDefault(); // Prevent scrolling the page.
			var oCellInfo = TableUtils.getCellInfo(oEvent.target);

			if (oCellInfo.isOfType(CellType.ANY)) {
				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var iFocusedRow = oFocusedItemInfo.row;
				var iHeaderRowCount = TableUtils.getHeaderRowCount(this);
				var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(this);
				var mRowCounts = this._getRowCounts();

				preventItemNavigation(oEvent);

				// Only do something if the focus is above the last row of the fixed bottom area
				// or above the last row of the column header area when NoData is visible.
				if (mRowCounts.fixedBottom === 0 ||
					iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - 1 ||
					(TableUtils.isNoDataVisible(this) && iFocusedRow < iHeaderRowCount - 1)) {

					var iFocusedIndex = oFocusedItemInfo.cell;
					var iColumnCount = oFocusedItemInfo.columnCount;

					/* Column header area */
					if (TableUtils.isNoDataVisible(this)) {
						// Set the focus to the last row of the column header area.
						TableUtils.focusItem(this, iFocusedIndex + iColumnCount * (iHeaderRowCount - iFocusedRow - 1), oEvent);
					} else if (iFocusedRow < iHeaderRowCount) {
						// If a top fixed area exists, then set the focus to the last row of the top fixed area,
						// otherwise set the focus to the last row of the scrollable area and scroll to bottom.
						if (mRowCounts.fixedTop > 0) {
							TableUtils.focusItem(
								this, iFocusedIndex + iColumnCount * (iHeaderRowCount + mRowCounts.fixedTop - iFocusedRow - 1), oEvent);
						} else {
							this._getScrollExtension().scrollVerticallyMax(true, true);
							TableUtils.focusItem(
								this,
								iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - mRowCounts.fixedBottom - iFocusedRow - 1),
								oEvent
							);
						}

					/* Top fixed area */
					} else if (iFocusedRow >= iHeaderRowCount && iFocusedRow < iHeaderRowCount + mRowCounts.fixedTop) {
						// Set the focus to the last row of the scrollable area and scroll to bottom.
						this._getScrollExtension().scrollVerticallyMax(true, true);
						TableUtils.focusItem(
							this,
							iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - mRowCounts.fixedBottom - iFocusedRow - 1),
							oEvent
						);

					/* Scrollable area */
					} else if (iFocusedRow >= iHeaderRowCount + mRowCounts.fixedTop &&
							   iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - mRowCounts.fixedBottom) {
						// Set the focus to the last row of the scrollable area and scroll to bottom.
						this._getScrollExtension().scrollVerticallyMax(true, true);
						TableUtils.focusItem(
							this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - iFocusedRow - 1), oEvent);

					/* Bottom fixed area */
					} else {
						// Set the focus to the last row of the bottom fixed area.
						TableUtils.focusItem(
							this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - iFocusedRow - 1), oEvent);
					}
				}
			}
		}
	};

	TableKeyboardDelegate.prototype.onsappageup = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		oEvent.preventDefault(); // Prevent scrolling the page.

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (oCellInfo.isOfType(CellType.ANYCONTENTCELL | CellType.COLUMNHEADER)) {
			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedRow = oFocusedItemInfo.row;
			var iHeaderRowCount = TableUtils.getHeaderRowCount(this);
			var mRowCounts = this._getRowCounts();

			// Only do something if the focus is not in the column header area or the first row of the top fixed area.
			if (mRowCounts.fixedTop === 0 && iFocusedRow >= iHeaderRowCount || mRowCounts.fixedTop > 0 && iFocusedRow > iHeaderRowCount) {
				preventItemNavigation(oEvent);

				var iFocusedIndex = oFocusedItemInfo.cell;
				var iColumnCount = oFocusedItemInfo.columnCount;

				/* Top fixed area - From second row downwards */
				if (iFocusedRow < iHeaderRowCount + mRowCounts.fixedTop) {
					// Set the focus to the first row of the top fixed area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);

				/* Scrollable area - First row */
				} else if (iFocusedRow === iHeaderRowCount + mRowCounts.fixedTop) {
					var iPageSize = TableUtils.getNonEmptyVisibleRowCount(this) - mRowCounts.fixedTop - mRowCounts.fixedBottom;
					var iRowsToBeScrolled = this.getFirstVisibleRow();

					this._getScrollExtension().scrollVertically(false, true, true); // Scroll up one page

					// Only change the focus if scrolling was not performed over a full page, or not at all.
					if (iRowsToBeScrolled < iPageSize) {
						// If a fixed top area exists or we are in the row action column (has no header), then set the focus to the first row (of
						// the top fixed area), otherwise set the focus to the first row of the column header area.
						if (mRowCounts.fixedTop > 0 || oCellInfo.isOfType(CellType.ROWACTION)) {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);
						} else {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iHeaderRowCount, oEvent);
						}
					}

				/* Scrollable area - From second row downwards */
				/* Bottom Fixed area */
				} else if (iFocusedRow > iHeaderRowCount + mRowCounts.fixedTop &&
						   iFocusedRow < iHeaderRowCount + TableUtils.getNonEmptyVisibleRowCount(this)) {
					// Set the focus to the first row of the scrollable area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - mRowCounts.fixedTop), oEvent);

				/* Empty area */
				} else {
					// Set the focus to the last row of the scrollable area.
					TableUtils.focusItem(
						this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - TableUtils.getNonEmptyVisibleRowCount(this) + 1),
						oEvent
					);
				}
			}

			// If the focus is in the first row of the row action area, do nothing (row actions do not have a column header).
			if (oCellInfo.isOfType(CellType.ROWACTION) && iFocusedRow === iHeaderRowCount && mRowCounts.fixedTop > 0) {
				preventItemNavigation(oEvent);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsappagedown = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		oEvent.preventDefault(); // Prevent scrolling the page.

		var oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (oCellInfo.isOfType(CellType.ANY)) {
			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedRow = oFocusedItemInfo.row;
			var iHeaderRowCount = TableUtils.getHeaderRowCount(this);
			var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(this);
			var mRowCounts = this._getRowCounts();

			preventItemNavigation(oEvent);

			// Only do something if the focus is above the last row of the bottom fixed area
			// or above the last row of the column header area when NoData is visible.
			if ((TableUtils.isNoDataVisible(this) && iFocusedRow < iHeaderRowCount - 1) ||
				mRowCounts.fixedBottom === 0 ||
				iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - 1) {

				var iFocusedIndex = oFocusedItemInfo.cell;
				var iColumnCount = oFocusedItemInfo.columnCount;

				/* Column header area - From second-last row upwards */
				if (iFocusedRow < iHeaderRowCount - 1 && !oCellInfo.isOfType(CellType.COLUMNROWHEADER)) {
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
				/* Scrollable area - From second-last row upwards */
				} else if (iFocusedRow >= iHeaderRowCount &&
						   iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - mRowCounts.fixedBottom - 1) {
					// Set the focus to the last row of the scrollable area.
					TableUtils.focusItem(
						this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - mRowCounts.fixedBottom - iFocusedRow - 1),
						oEvent
					);

				/* Scrollable area - Last row */
				} else if (iFocusedRow === iHeaderRowCount + iNonEmptyVisibleRowCount - mRowCounts.fixedBottom - 1) {
					var iPageSize = TableUtils.getNonEmptyVisibleRowCount(this) - mRowCounts.fixedTop - mRowCounts.fixedBottom;
					var iRowsToBeScrolled = this._getTotalRowCount() - mRowCounts.fixedBottom - this.getFirstVisibleRow() - iPageSize * 2;

					this._getScrollExtension().scrollVertically(true, true, true); // Scroll down one page

					// If scrolling was not performed over a full page and there is a bottom fixed area,
					// then set the focus to the last row of the bottom fixed area.
					if (iRowsToBeScrolled < iPageSize && mRowCounts.fixedBottom > 0) {
						TableUtils.focusItem(
							this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - iFocusedRow - 1), oEvent);
					}

				/* Bottom fixed area */
				} else {
					// Set the focus to the last row of the bottom fixed area.
					TableUtils.focusItem(this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - iFocusedRow - 1), oEvent);
				}
			}
		}
	};

	TableKeyboardDelegate.prototype.onsappageupmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			var oCellInfo = TableUtils.getCellInfo(oEvent.target);
			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);

			if (oCellInfo.isOfType(CellType.DATACELL | CellType.COLUMNHEADER)) {
				var iFocusedIndex = oFocusedItemInfo.cell;
				var iFocusedCellInRow = oFocusedItemInfo.cellInRow;

				var bHasRowHeader = TableUtils.hasRowHeader(this);
				var iRowHeaderOffset = bHasRowHeader ? 1 : 0;
				var iPageSize = HORIZONTAL_SCROLLING_PAGE_SIZE;

				preventItemNavigation(oEvent);

				if (bHasRowHeader && (TableUtils.Grouping.isInGroupingRow(oEvent.target) || iFocusedCellInRow === 1)) {
					// If a row header exists and the focus is on a group header or the first cell,
					// then set the focus to the row header cell.
					TableUtils.focusItem(this, iFocusedIndex - iFocusedCellInRow, null);

				} else if (iFocusedCellInRow - iRowHeaderOffset < iPageSize) {
					// If scrolling can not be performed over a full page,
					// then scroll only the remaining cells (set the focus to the first cell).
					TableUtils.focusItem(this, iFocusedIndex - iFocusedCellInRow + iRowHeaderOffset, null);

				} else {
					// Scroll one page.
					TableUtils.focusItem(this, iFocusedIndex - iPageSize, null);
				}

			} else if (oCellInfo.isOfType(CellType.ROWACTION)) {
				// If the focus is on a row action cell, then set the focus to the last data cell in the same row.
				TableUtils.focusItem(this, oFocusedItemInfo.cell - 1, null);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsappagedownmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			var oCellInfo = TableUtils.getCellInfo(oEvent.target);

			if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWHEADER | CellType.ANYCOLUMNHEADER)) {
				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var iFocusedCellInRow = oFocusedItemInfo.cellInRow;

				var bHasRowHeader = TableUtils.hasRowHeader(this);
				var iRowHeaderOffset = bHasRowHeader ? 1 : 0;
				var iVisibleColumnCount = TableUtils.getVisibleColumnCount(this);
				var iColSpan = parseInt(oCellInfo.cell.attr("colspan") || 1);

				preventItemNavigation(oEvent);

				// Only do something, if the selected cell or span is not at the end of the table.
				if (iFocusedCellInRow + iColSpan - iRowHeaderOffset < iVisibleColumnCount) {
					var iFocusedIndex = oFocusedItemInfo.cell;
					var iPageSize = HORIZONTAL_SCROLLING_PAGE_SIZE;

					if (bHasRowHeader && iFocusedCellInRow === 0) {
						// If there is a row header and it has the focus,
						// then set the focus to the first cell.
						TableUtils.focusItem(this, iFocusedIndex + 1, null);

					} else if (iColSpan > iPageSize) {
						// If the focused cell is a column span bigger than a page size,
						// then set the focus the next column in the row.
						TableUtils.focusItem(this, iFocusedIndex + iColSpan, null);

					} else if (iFocusedCellInRow + iColSpan - iRowHeaderOffset + iPageSize > iVisibleColumnCount) {
						// If scrolling can not be performed over a full page,
						// then scroll only the remaining cells (set the focus to the last cell).
						TableUtils.focusItem(this, iFocusedIndex + iVisibleColumnCount - iFocusedCellInRow - 1 + iRowHeaderOffset, null);

					} else if (!TableUtils.Grouping.isInGroupingRow(oEvent.target)) {
						// Scroll one page.
						TableUtils.focusItem(this, iFocusedIndex + iPageSize, null);

					}

				} else if (oCellInfo.isOfType(CellType.DATACELL)
						   && TableUtils.hasRowActions(this)
						   && iFocusedCellInRow === oFocusedItemInfo.columnCount - 2) {
					// If focus is on the last cell, set the focus to the row action cell.
					TableUtils.focusItem(this, oFocusedItemInfo.cell + 1, null);
				}
			}
		}
	};

	TableKeyboardDelegate.prototype.onsapenter = function(oEvent) {
		TableKeyboardDelegate._handleSpaceAndEnter(this, oEvent);
	};

	return TableKeyboardDelegate;
});