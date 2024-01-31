/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.KeyboardDelegate.
sap.ui.define([
	"../utils/TableUtils",
	"../library",
	"sap/base/i18n/Localization",
	"sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function(TableUtils, library, Localization, BaseObject, Device, KeyCodes, jQuery) {
	"use strict";

	// Shortcuts
	const CellType = TableUtils.CELLTYPE;
	const SelectionMode = library.SelectionMode;

	/**
	 * Modifier key flags.
	 *
	 * @type {{CTRL: int, SHIFT: int, ALT: int}}
	 * @static
	 * @constant
	 */
	const ModKey = {
		CTRL: 1,
		SHIFT: 2,
		ALT: 4
	};

	const HORIZONTAL_SCROLLING_PAGE_SIZE = 5;
	const COLUMN_RESIZE_STEP_CSS_SIZE = "1rem";

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
	 * Prevents the event default and stops propagation if the event target is a table cell.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	function handleNavigationEvent(oEvent) {
		if (TableUtils.getCellInfo(oEvent.target).isOfType(CellType.ANY)) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
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
	 * @alias sap.ui.table.extensions.KeyboardDelegate
	 */
	const KeyboardDelegate = BaseObject.extend("sap.ui.table.extensions.KeyboardDelegate", /* @lends sap.ui.table.extensions.KeyboardDelegate */ {
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
	 * Moves the focus one row down, but stays in the same column. The focus is set to the cell, or the first interactive element inside that cell.
	 * The table is scrolled if necessary.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The keyboard event object.
	 */
	function navigateDown(oTable, oEvent) {
		if (!_canNavigateUpOrDown(oTable, oEvent)) {
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(TableUtils.getCell(oTable, oEvent.target));

		if (oCellInfo.isOfType(CellType.ANYCOLUMNHEADER)) {
			_navigateDownOnHeader(oTable, oCellInfo, oEvent);
		} else if (oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
			_navigateDownOnContent(oTable, oCellInfo, oEvent);
		}
	}

	function _navigateDownOnHeader(oTable, oCellInfo, oEvent) {
		const iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);

		if (TableUtils.isNoDataVisible(oTable)) {
			const oFocusInfo = TableUtils.getFocusedItemInfo(oTable);
			if (oFocusInfo.row - iHeaderRowCount <= 1) { // We are in the last column header row.
				// Prevent navigation to the table content.
				preventItemNavigation(oEvent);
			}
		} else if (oCellInfo.isOfType(CellType.COLUMNROWHEADER) && iHeaderRowCount > 1) {
			// Special logic needed if the column header has multiple rows.
			// For the SelectAll cell, multiple elements are added to the item navigation.
			preventItemNavigation(oEvent);
			// Focus the first row header.
			TableUtils.focusItem(oTable, iHeaderRowCount * (TableUtils.getVisibleColumnCount(oTable) + 1/*Row Headers*/), oEvent);
		}
	}

	function _navigateDownOnContent(oTable, oCellInfo, oEvent) {
		const oKeyboardExtension = oTable._getKeyboardExtension();
		const bActionMode = oKeyboardExtension.isInActionMode();
		const bCtrlKeyPressed = KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL);
		const bActionModeNavigation = bCtrlKeyPressed || bActionMode;
		const $ParentCell = TableUtils.getParentCell(oTable, oEvent.target);

		// If only the down key was pressed while the table is in navigation mode, and a non-interactive element inside a cell is focused,
		// set the focus to the cell this element is inside.
		if (!bActionModeNavigation && $ParentCell) {
			$ParentCell.trigger("focus");
			return;
		}

		preventItemNavigation(oEvent);

		if (TableUtils.isLastScrollableRow(oTable, oCellInfo.cell)) {
			const bScrolled = scrollDown(oTable, oEvent);

			if (bScrolled) {
				oEvent.preventDefault(); // Prevent scrolling the page in action mode navigation.
				return;
			}
		}

		if (oCellInfo.rowIndex === oTable.getRows().length - 1
			|| (TableUtils.isVariableRowHeightEnabled(oTable) // ignore empty buffer row
				&& oCellInfo.rowIndex === oTable.getRows().length - 2
				&& oTable.getRows()[oCellInfo.rowIndex + 1].getRowBindingContext() === null)) {
			// Leave the action mode when trying to navigate down on the last row.
			if (!bActionMode && $ParentCell) {
				$ParentCell.trigger("focus"); // A non-interactive element inside a cell is focused, focus the cell this element is inside.
			} else {
				const oCreationRow = oTable.getCreationRow();

				if (!oCreationRow || !oCreationRow._takeOverKeyboardHandling(oEvent)) {
					// The CreationRow did not take over the focus.
					oKeyboardExtension.setActionMode(false);
				}
			}

			return;
		}

		focusCell(oTable, oCellInfo.type, oCellInfo.rowIndex + 1, oCellInfo.columnIndex, bActionModeNavigation);
		oEvent.preventDefault(); // Prevent positioning the cursor in action mode navigation. The text should be selected instead.
	}

	/**
	 * Moves the focus one row up, but stays in the same column. The focus is set to the cell, or the first interactive element inside that cell.
	 * The table is scrolled if necessary.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The keyboard event object.
	 */
	function navigateUp(oTable, oEvent) {
		const oCellInfo = TableUtils.getCellInfo(TableUtils.getCell(oTable, oEvent.target));

		if (!oCellInfo.isOfType(CellType.ANYCONTENTCELL) || !_canNavigateUpOrDown(oTable, oEvent)) {
			return;
		}

		const bCtrlKeyPressed = KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL);
		const oKeyboardExtension = oTable._getKeyboardExtension();
		const bActionMode = oKeyboardExtension.isInActionMode();
		const bActionModeNavigation = bCtrlKeyPressed || bActionMode;
		const $ParentCell = TableUtils.getParentCell(oTable, oEvent.target);

		// If only the up key was pressed while the table is in navigation mode, and a non-interactive element inside a cell is focused,
		// set the focus to the cell this element is inside.
		if (!bActionModeNavigation && $ParentCell) {
			$ParentCell.trigger("focus");
			return;
		}

		preventItemNavigation(oEvent);

		if (TableUtils.isFirstScrollableRow(oTable, oCellInfo.cell)) {
			const bScrolled = scrollUp(oTable, oEvent);

			if (bScrolled) {
				oEvent.preventDefault(); // Prevent scrolling the page in action mode navigation.
				return;
			}
		}

		if (oCellInfo.rowIndex === 0) {
			// Let the item navigation focus the column header cell, but not in the row action column.
			preventItemNavigation(oEvent, oCellInfo.isOfType(CellType.ROWACTION) || bActionModeNavigation);

			// Leave the action mode when trying to navigate up on the first row.
			if (!bActionMode && $ParentCell) {
				$ParentCell.trigger("focus"); // A non-interactive element inside a cell is focused, focus the cell this element is inside.
			} else {
				oKeyboardExtension.setActionMode(false);
			}

			return;
		}

		focusCell(oTable, oCellInfo.type, oCellInfo.rowIndex - 1, oCellInfo.columnIndex, bActionModeNavigation);
		oEvent.preventDefault(); // Prevent positioning the cursor in action mode navigation. The text should be selected instead.
	}

	function _canNavigateUpOrDown(oTable, oEvent) {
		const bCtrlKeyPressed = KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL);

		// If only the up or down key was pressed in text input elements, navigation should not be performed.
		return !oEvent.isMarked()
			   && (bCtrlKeyPressed || !(oEvent.target instanceof window.HTMLInputElement) && !(oEvent.target instanceof window.HTMLTextAreaElement));
	}

	/**
	 * Sets the focus to the previous cell in the same row.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The keyboard event object.
	 */
	function navigateLeft(oTable, oEvent) {
		if (oEvent.isMarked()) {
			return; // Do not interfere with embedded controls that react on the keyboard event.
		}

		const oCellInfo = TableUtils.getCellInfo(TableUtils.getCell(oTable, oEvent.target));
		const bIsRTL = Localization.getRTL();

		if (!oCellInfo.isOfType(CellType.COLUMNHEADER) || !bIsRTL) {
			return;
		}

		const oFocusedItemInfo = TableUtils.getFocusedItemInfo(oTable);
		const iFocusedColumn = oFocusedItemInfo.cellInRow - (TableUtils.hasRowHeader(oTable) ? 1 : 0);
		const iColumnCount = TableUtils.getVisibleColumnCount(oTable);

		if (TableUtils.hasRowActions(oTable) && iFocusedColumn === iColumnCount - 1) {
			// Do not navigate to the row actions column header cell.
			preventItemNavigation(oEvent);
		}
	}

	function waitForRowsUpdated(oTable) {
		return new Promise(function(resolve) {
			oTable.attachEventOnce("_rowsUpdated", resolve);
		});
	}

	function waitForData(oTable) {
		if (oTable._hasPendingRequests()) {
			return waitForRowsUpdated(oTable).then(function() {
				return waitForData(oTable);
			});
		}

		return Promise.resolve();
	}

	function scrollDown(oTable, oEvent, bPage, fnFocus) {
		const bScrolledToEnd = oTable._getFirstRenderedRowIndex() === oTable._getMaxFirstRenderedRowIndex();

		if (bScrolledToEnd) {
			return null;
		}

		return _scroll(oTable, oEvent, true, bPage, fnFocus);
	}

	function scrollUp(oTable, oEvent, bPage, fnFocus) {
		const bScrolledToTop = oTable._getFirstRenderedRowIndex() === 0;

		if (bScrolledToTop) {
			return null;
		}

		return _scroll(oTable, oEvent, false, bPage, fnFocus);
	}

	function _scroll(oTable, oEvent, bDown, bPage, fnFocus) {
		const oCellInfo = TableUtils.getCellInfo(TableUtils.getCell(oTable, oEvent.target));
		const bActionMode = oTable._getKeyboardExtension().isInActionMode();
		const bCtrlKeyPressed = KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL);
		const bActionModeNavigation = bCtrlKeyPressed || bActionMode;
		const bAllowSapFocusLeave = bActionMode && oCellInfo.isOfType(CellType.DATACELL);

		if (bAllowSapFocusLeave) {
			oTable._getKeyboardExtension().setSilentFocus(oTable.getDomRef("focusDummy"));
			setTimeout(function() {
				oTable._getScrollExtension().scrollVertically(bDown === true, bPage);
			}, 0);
		} else {
			oTable._getScrollExtension().scrollVertically(bDown === true, bPage);
		}

		return waitForRowsUpdated(oTable).then(function() {
			if (fnFocus) {
				fnFocus();
			} else if (bActionModeNavigation) {
				focusCell(oTable, oCellInfo.type, oCellInfo.rowIndex, oCellInfo.columnIndex, true);
			}
		});
	}

	function scrollDownAndFocus(oTable, oEvent) {
		const mRowCounts = oTable._getRowCounts();
		const bScrolled = scrollDown(oTable, oEvent, false, function() {
			_setFocusNext(oTable, mRowCounts.fixedTop + mRowCounts.scrollable - 1);
		});

		if (bScrolled) {
			return;
		}

		if (mRowCounts.fixedBottom > 0) {
			_setFocusNext(oTable, mRowCounts.fixedTop + mRowCounts.scrollable);
		} else {
			// If the focus is in the absolute last index, leave the action mode.
			oTable._getKeyboardExtension().setActionMode(false);
		}
	}

	function _setFocusNext(oTable, iRowIndex) {
		const oRow = oTable.getRows()[iRowIndex];
		const bRowHasInteractiveRowHeader = oRow.isGroupHeader() || TableUtils.isRowSelectorSelectionAllowed(oTable);

		if (bRowHasInteractiveRowHeader) {
			focusCell(oTable, CellType.ROWHEADER, iRowIndex);
		} else {
			const $InteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oRow);

			if ($InteractiveElement) {
				KeyboardDelegate._focusElement(oTable, $InteractiveElement[0]);
			} else {
				focusCell(oTable, CellType.DATACELL, iRowIndex, 0, false, true);
				if (oRow.getIndex() === oTable._getTotalRowCount() - 1) {
					oTable._getKeyboardExtension().setActionMode(false);
				}
			}
		}
	}

	function scrollUpAndFocus(oTable, oEvent) {
		const mRowCounts = oTable._getRowCounts();
		const bScrolled = scrollUp(oTable, oEvent, false, function() {
			_setFocusPrevious(oTable, mRowCounts.fixedTop);
		});

		if (bScrolled) {
			return;
		}

		if (mRowCounts.fixedTop > 0) {
			_setFocusPrevious(oTable, mRowCounts.fixedTop - 1);
		} else {
			// If the focus is in the absolute first index, leave the action mode.
			oTable._getKeyboardExtension().setActionMode(false);
		}
	}

	function _setFocusPrevious(oTable, iRowIndex) {
		const oRow = oTable.getRows()[iRowIndex];
		const bRowHasInteractiveRowHeader = oRow.isGroupHeader() || TableUtils.isRowSelectorSelectionAllowed(oTable);
		const $InteractiveElement = KeyboardDelegate._getLastInteractiveElement(oRow);

		if ($InteractiveElement) {
			KeyboardDelegate._focusElement(oTable, $InteractiveElement[0]);
		} else if (bRowHasInteractiveRowHeader) {
			focusCell(oTable, CellType.ROWHEADER, iRowIndex);
		} else {
			focusCell(oTable, CellType.DATACELL, iRowIndex, 0, false, true);
			if (oRow.getIndex() === 0) {
				oTable._getKeyboardExtension().setActionMode(false);
			}
		}
	}

	/**
	 * Restores the focus to the last known cell position.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	function restoreFocusOnLastFocusedDataCell(oTable, oEvent) {
		const oCellInfo = TableUtils.getFocusedItemInfo(oTable);
		const oLastInfo = oTable._getKeyboardExtension().getLastFocusedCellInfo();
		TableUtils.focusItem(oTable, oCellInfo.cellInRow + (oCellInfo.columnCount * oLastInfo.row), oEvent);
	}

	/**
	 * Sets the focus to the corresponding column header of the last known cell position.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	function setFocusOnColumnHeaderOfLastFocusedDataCell(oTable, oEvent) {
		const oCellInfo = TableUtils.getFocusedItemInfo(oTable);
		TableUtils.focusItem(oTable, oCellInfo.cellInRow, oEvent);
	}

	/**
	 * Sets the focus to the corresponding column header of the last known cell position.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {string} sTabDummyCSSClass The css class of the tab dummy element to be used in a selector.
	 * @private
	 * @static
	 */
	function forwardFocusToTabDummy(oTable, sTabDummyCSSClass) {
		oTable._getKeyboardExtension().setSilentFocus(oTable.$().find("." + sTabDummyCSSClass));
	}

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
	 * KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.A); // A
	 * KeyboardDelegate._isKeyCombination(oEvent, "+"); // CharCode check: "+" and "NumpadPlus"
	 * KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.A, ModKey.CTRL + ModKey.SHIFT); // Ctrl+Shift+A
	 * KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL); // Ctrl (useful for simulated events like "sapdown")
	 * @private
	 * @static
	 */
	KeyboardDelegate._isKeyCombination = function(oEvent, vKey, modifierKeyMask) {
		if (modifierKeyMask == null) {
			modifierKeyMask = 0;
		}

		const eventKey = typeof vKey === "string" ? String.fromCharCode(oEvent.charCode) : oEvent.keyCode;
		let eventModifierKeyMask = 0;

		eventModifierKeyMask |= (Device.os.macintosh ? oEvent.metaKey : oEvent.ctrlKey) && vKey !== KeyCodes.CONTROL ? ModKey.CTRL : 0;
		eventModifierKeyMask |= oEvent.shiftKey && vKey !== KeyCodes.SHIFT ? ModKey.SHIFT : 0;
		eventModifierKeyMask |= oEvent.altKey && vKey !== KeyCodes.ALT ? ModKey.ALT : 0;

		const bValidKey = vKey == null || eventKey === vKey;
		const bValidModifierKeys = modifierKeyMask === eventModifierKeyMask;

		return bValidKey && bValidModifierKeys;
	};

	function getRowByDomRef(oTable, oDomRef) {
		const $Cell = TableUtils.getCell(oTable, oDomRef);
		const oCellInfo = TableUtils.getCellInfo($Cell);

		return oTable.getRows()[oCellInfo.rowIndex];
	}

	/**
	 * Handler which is called when the Space or Enter keys are pressed.
	 * Opening the column context menu is not handled here, because pressing the ENTER key triggers sapenter on keydown. The column header should
	 * only be opened on keyup.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	function handleSpaceAndEnter(oTable, oEvent) {
		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		// Select/Deselect all.
		if (oCellInfo.isOfType(CellType.COLUMNROWHEADER)) {
			oTable._getSelectionPlugin().onHeaderSelectorPress();

		// Expand/Collapse group.
		} else if (KeyboardDelegate._allowsToggleExpandedState(oTable, oEvent.target)) {
			getRowByDomRef(oTable, oEvent.target).toggleExpandedState();

		// Select/Deselect row.
		} else if (oCellInfo.isOfType(CellType.ROWHEADER)) {
			selectItems();

		} else if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION)) {
			// The action mode should only be entered when cellClick is not handled and no selection is performed.
			let bEnterActionMode = !oTable.hasListeners("cellClick");

			// Fire the cell click event.
			if (!oTable._findAndfireCellEvent(oTable.fireCellClick, oEvent)) {

				// Select/Deselect row.
				if (TableUtils.isRowSelectionAllowed(oTable)) {
					selectItems();
					bEnterActionMode = false;
				}
			}

			if (bEnterActionMode) {
				const $InteractiveElements = TableUtils.getInteractiveElements(oEvent.target);
				if ($InteractiveElements) {
					oTable._getKeyboardExtension().setActionMode(true);
				}
			}
		}

		function selectItems() {
			let _doSelect = null;
			if (oTable._legacyMultiSelection) {
				_doSelect = function(oRow) {
					oTable._legacyMultiSelection(oRow.getIndex(), oEvent);
				};
			}
			TableUtils.toggleRowSelection(oTable, oEvent.target, null, _doSelect);
		}
	}

	/**
	 * Moves the given column to the next or previous position (based on the visible columns).
	 *
	 * @param {sap.ui.table.Column} oColumn The column to move to another position.
	 * @param {boolean} bNext If <code>true</code>, the column is moved one position to the right, otherwise one position to the left.
	 */
	function moveColumn(oColumn, bNext) {
		const oTable = oColumn.getParent();
		const aVisibleColumns = oTable._getVisibleColumns();
		const iIndexInVisibleColumns = aVisibleColumns.indexOf(oColumn);
		let iTargetIndex;

		if (bNext && iIndexInVisibleColumns < aVisibleColumns.length - 1) {
			iTargetIndex = oTable.indexOfColumn(aVisibleColumns[iIndexInVisibleColumns + 1]) + 1;
		} else if (!bNext && iIndexInVisibleColumns > 0) {
			iTargetIndex = oTable.indexOfColumn(aVisibleColumns[iIndexInVisibleColumns - 1]);
		}

		if (iTargetIndex != null) {
			TableUtils.Column.moveColumnTo(oColumn, iTargetIndex);
		}
	}

	/**
	 * Returns the index of the column in the array of visible and grouped columns
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.Column} oColumn Instance of the table column to get the index for.
	 * @returns {int} Returns the index of the column in the list of visible and grouped columns.
	 *                Returns -1 if the column is not in this list.
	 */
	function getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn) {
		const aVisibleAndGroupedColumns = oTable.getColumns().filter(function(oColumn) {
			return oColumn.getVisible() || (oColumn.getGrouped ? oColumn.getGrouped() : false);
		});

		for (let i = 0; i < aVisibleAndGroupedColumns.length; i++) {
			const oVisibleOrGroupedColumn = aVisibleAndGroupedColumns[i];

			if (oVisibleOrGroupedColumn === oColumn) {
				return i;
			}
		}

		return -1;
	}

	function moveRangeSelection(oTable, iRowIndex, bReverse) {
		if (!bReverse) {
			if (oTable._oRangeSelection.selected) {
				TableUtils.toggleRowSelection(oTable, iRowIndex, true);
			} else {
				TableUtils.toggleRowSelection(oTable, iRowIndex, false);
			}
		} else {
			// When moving back down to the row where the range selection started, the rows always get deselected.
			TableUtils.toggleRowSelection(oTable, iRowIndex, false);
		}
	}

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
	KeyboardDelegate._focusElement = function(oTable, oElement, bSilentFocus) {
		if (!oTable || !oElement) {
			return;
		}
		if (bSilentFocus == null) {
			bSilentFocus = false;
		}

		if (bSilentFocus) {
			oTable._getKeyboardExtension().setSilentFocus(oElement);
		} else {
			oElement.focus();
		}

		if (oElement instanceof window.HTMLInputElement) {
			oElement.select();
		}
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
	 * @param {boolean} [bAllowActionMode=false] Whether to stay in action mode even if a non-interactive element is focused.
	 */
	function focusCell(oTable, iCellType, iRowIndex, iColumnIndex, bFirstInteractiveElement, bAllowActionMode) {
		if (!oTable
			|| iCellType == null
			|| iRowIndex == null || iRowIndex < 0 || iRowIndex >= oTable.getRows().length) {
			return;
		}

		const oRow = oTable.getRows()[iRowIndex];
		let oCell;

		if (iCellType === CellType.ROWHEADER) {
			oTable._getKeyboardExtension().setFocus(oTable.getDomRef("rowsel" + iRowIndex));
			return;
		} else if (iCellType === CellType.ROWACTION) {
			oCell = oTable.getDomRef("rowact" + iRowIndex);
		} else if (iCellType === CellType.DATACELL
				   && (iColumnIndex != null && iColumnIndex >= 0)) {
			const oColumn = oTable.getColumns()[iColumnIndex];
			const iColumnIndexInCellsAggregation = getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);
			if (iColumnIndexInCellsAggregation >= 0) {
				oCell = oRow.getDomRef("col" + iColumnIndexInCellsAggregation);
			}
		}

		if (!oCell) {
			return;
		}

		if (bFirstInteractiveElement) {
			const $InteractiveElements = TableUtils.getInteractiveElements(oCell);

			if ($InteractiveElements) {
				KeyboardDelegate._focusElement(oTable, $InteractiveElements[0]);
				return;
			}
		}

		if (bAllowActionMode) {
			oTable._getKeyboardExtension()._bStayInActionMode = true;
		}

		oCell.focus();
	}

	/**
	 * Checks whether an element is a tree icon.
	 *
	 * @param {HTMLElement} oElement The element to check.
	 * @returns {boolean} Whether the element is a tree icon.
	 */
	function isTreeIcon(oElement) {
		return oElement.classList.contains("sapUiTableTreeIconNodeOpen") || oElement.classList.contains("sapUiTableTreeIconNodeClosed");
	}

	/**
	 * Checks whether an element allows a group or a tree node to be expanded or collapsed on user interaction.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {HTMLElement} oElement The element to check.
	 * @returns {boolean} Whether user interaction with this element can trigger expand or collapse of a group or tree node.
	 * @private
	 * @static
	 */
	KeyboardDelegate._allowsToggleExpandedState = function(oTable, oElement) {
		return TableUtils.Grouping.isInGroupHeaderRow(oElement)
			   || (TableUtils.Grouping.isInTreeMode(oTable)
				   && oElement.classList.contains("sapUiTableCellFirst")
				   && (oElement.querySelector(".sapUiTableTreeIconNodeOpen")
					   || oElement.querySelector(".sapUiTableTreeIconNodeClosed")))
			   || isTreeIcon(oElement);
	};

	/**
	 * Find out if an element is interactive.
	 *
	 * @param {jQuery|HTMLElement} oElement The element to check.
	 * @returns {boolean|null} Returns <code>true</code>, if the passed element is interactive.
	 * @private
	 * @static
	 */
	KeyboardDelegate._isElementInteractive = function(oElement) {
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
	KeyboardDelegate._getFirstInteractiveElement = function(oRow) {
		const oElem = TableUtils.getFirstInteractiveElement(oRow, true);
		if (!oElem) {
			return null;
		}
		return jQuery(oElem);
	};

	/**
	 * Returns the last interactive element in a row.
	 *
	 * @param {sap.ui.table.Row} oRow The row from which to get the interactive element.
	 * @returns {jQuery|null} Returns <code>null</code> if the passed row does not contain any interactive elements.
	 * @private
	 * @static
	 */
	KeyboardDelegate._getLastInteractiveElement = function(oRow) {
		if (!oRow) {
			return null;
		}

		const oTable = oRow.getParent();
		const aCells = oRow.getCells();
		let $Cell;
		let $InteractiveElements;

		if (TableUtils.hasRowActions(oTable)) {
			aCells.push(oRow.getRowAction());
		}

		for (let i = aCells.length - 1; i >= 0; i--) {
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
	KeyboardDelegate._getPreviousInteractiveElement = function(oTable, oElement) {
		if (!oTable || !oElement) {
			return null;
		}

		const $Element = jQuery(oElement);
		if (!this._isElementInteractive($Element)) {
			return null;
		}

		let $Cell = TableUtils.getParentCell(oTable, oElement);
		let $InteractiveElements;
		let oCellContent;
		let oColumn;
		let iColumnIndexInCellsAggregation;
		let iColumnIndexToStartSearch;

		// Search for the previous interactive element in the current cell.
		$InteractiveElements = TableUtils.getInteractiveElements($Cell);
		if ($InteractiveElements[0] !== $Element[0]) {
			return $InteractiveElements.eq($InteractiveElements.index(oElement) - 1);
		}

		// The previous interactive element could not be found in the current cell. Prepare the next search.
		const oCellInfo = TableUtils.getCellInfo($Cell);
		const aCells = oTable.getRows()[oCellInfo.rowIndex].getCells();

		if (oCellInfo.isOfType(CellType.ROWACTION)) {
			iColumnIndexToStartSearch = aCells.length - 1;
		} else {
			oColumn = oTable.getColumns()[oCellInfo.columnIndex];
			iColumnIndexInCellsAggregation = getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);
			iColumnIndexToStartSearch = iColumnIndexInCellsAggregation - 1;
		}

		// Perform the search to the left iterating from cell to cell.
		// A possibly existing row action cell would have been analyzed in the beginning.
		for (let i = iColumnIndexToStartSearch; i >= 0; i--) {
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
	KeyboardDelegate._getNextInteractiveElement = function(oTable, oElement) {
		if (!oTable || !oElement) {
			return null;
		}

		const $Element = jQuery(oElement);
		if (!this._isElementInteractive($Element)) {
			return null;
		}

		let $Cell = TableUtils.getParentCell(oTable, oElement);
		let $InteractiveElements;
		let oCellContent;

		// Search for the next interactive element in the current cell.
		$InteractiveElements = TableUtils.getInteractiveElements($Cell);
		if ($InteractiveElements.get(-1) !== $Element[0]) {
			return $InteractiveElements.eq($InteractiveElements.index(oElement) + 1);
		}

		// The next interactive element could not be found in the current cell. Prepare the next search.
		const oCellInfo = TableUtils.getCellInfo($Cell);

		if (oCellInfo.isOfType(CellType.ROWACTION)) {
			return null; // The passed element is already the last interactive element in this row.
		}

		const oRow = oTable.getRows()[oCellInfo.rowIndex];
		const aCells = oRow.getCells();
		const oColumn = oTable.getColumns()[oCellInfo.columnIndex];
		const iColumnIndexInCellsAggregation = getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);

		// Search in the next cells.
		for (let i = iColumnIndexInCellsAggregation + 1; i < aCells.length; i++) {
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

	function startRangeSelectionMode(oTable) {
		const iFocusedRowIndex = TableUtils.getRowIndexOfFocusedCell(oTable);
		const oRow = oTable.getRows()[iFocusedRowIndex];
		const iAbsoluteRowIndex = oRow.getIndex();
		const oSelectionPlugin = oTable._getSelectionPlugin();

		/**
		 * Contains information that are used when the range selection mode is active.
		 * If this property is undefined the range selection mode is not active.
		 * @type {{startIndex: int, selected: boolean}}
		 * @property {int} startIndex The index of the data row in which the selection mode was activated.
		 * @property {boolean} selected True, if the data row in which the selection mode was activated is selected.
		 * @private
		 */
		oTable._oRangeSelection = {
			startIndex: iAbsoluteRowIndex,
			selected: oSelectionPlugin.isSelected(oRow)
		};
	}

	/**
	 * Hook which is called by the keyboard extension when the table should enter the action mode.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the {@link sap.ui.table.extensions.Keyboard} should enter the action mode.
	 * @see sap.ui.table.extensions.Keyboard#setActionMode
	 */
	KeyboardDelegate.prototype.enterActionMode = function() {
		const oKeyboardExtension = this._getKeyboardExtension();
		const oActiveElement = document.activeElement;
		const $InteractiveElements = TableUtils.getInteractiveElements(oActiveElement);
		const $Cell = TableUtils.getParentCell(this, oActiveElement);
		const oCellInfo = TableUtils.getCellInfo($Cell);

		if (oCellInfo.isOfType(CellType.ANYCOLUMNHEADER)) {
			// The column header is not included into the action mode navigation.
			return false;
		}

		if ($InteractiveElements) {
			// Target is a data cell with interactive elements inside. Focus the first interactive element in the data cell.
			oKeyboardExtension.suspendItemNavigation();
			oActiveElement.tabIndex = -1;
			KeyboardDelegate._focusElement(this, $InteractiveElements[0], true);
			return true;
		} else if ($Cell) {
			// Target is an interactive element inside a data cell.
			this._getKeyboardExtension().suspendItemNavigation();
			return true;
		}

		return false;
	};

	/**
	 * Hook which is called by the keyboard extension when the table leaves the action mode.
	 *
	 * @param {boolean} [bKeepFocus=false] Whether to keep the focus unchanged.
	 * @see sap.ui.table.extensions.Keyboard#setActionMode
	 */
	KeyboardDelegate.prototype.leaveActionMode = function(bKeepFocus) {
		const oKeyboardExtension = this._getKeyboardExtension();
		const oActiveElement = document.activeElement;
		const $Cell = TableUtils.getParentCell(this, oActiveElement);

		oKeyboardExtension.resumeItemNavigation();

		if (bKeepFocus) {
			return;
		}

		if ($Cell) {
			KeyboardDelegate._focusElement(this, $Cell[0], true);
		} else {
			const oItemNavigation = this._getItemNavigation();

			if (oItemNavigation) {
				const aItemDomRefs = oItemNavigation.aItemDomRefs;
				const iFocusedIndex = aItemDomRefs.indexOf(oActiveElement);

				if (iFocusedIndex > -1) {
					oItemNavigation.setFocusedIndex(iFocusedIndex);
				}
			}

			oKeyboardExtension.setSilentFocus(oActiveElement);
		}
	};

	KeyboardDelegate.prototype.onfocusin = function(oEvent) {
		if (oEvent.isMarked("sapUiTableIgnoreFocusIn")) {
			return;
		}

		const $Target = jQuery(oEvent.target);

		if ($Target.hasClass("sapUiTableOuterBefore") || $Target.hasClass("sapUiTableOuterAfter")
			|| (oEvent.target !== this.getDomRef("overlay") && this.getShowOverlay())) {
			this.$("overlay").trigger("focus");

		} else if ($Target.hasClass("sapUiTableCtrlBefore")) {
			const bNoData = TableUtils.isNoDataVisible(this);
			if (!bNoData || bNoData && this.getColumnHeaderVisible()) {
				setFocusOnColumnHeaderOfLastFocusedDataCell(this, oEvent);
			} else {
				this._getKeyboardExtension().setSilentFocus(this.$("noDataCnt"));
			}

		} else if ($Target.hasClass("sapUiTableCtrlAfter")) {
			if (!TableUtils.isNoDataVisible(this)) {
				restoreFocusOnLastFocusedDataCell(this, oEvent);
			}
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);
		const bIsRowHeaderCellInGroupHeaderRow = oCellInfo.isOfType(CellType.ROWHEADER)
											   && TableUtils.Grouping.isInGroupHeaderRow(oEvent.target);
		const bIsRowSelectorCell = oCellInfo.isOfType(CellType.ROWHEADER)
								 && !bIsRowHeaderCellInGroupHeaderRow
								 && TableUtils.isRowSelectorSelectionAllowed(this);
		const bCellAllowsActionMode = oCellInfo.isOfType(CellType.DATACELL) && this._getKeyboardExtension()._bStayInActionMode;
		const bParentIsAContentCell = TableUtils.getCellInfo(TableUtils.getParentCell(this, oEvent.target)).isOfType(CellType.ANYCONTENTCELL);
		const bIsInteractiveElement = KeyboardDelegate._isElementInteractive(oEvent.target);
		const bIsInActionMode = this._getKeyboardExtension().isInActionMode();

		// Leave the action mode when focusing an element in the table which is not supported by the action mode.
		// Supported elements:
		// - Group row header cell; If the table is in action mode.
		// - Row selector cell; If the table is in action mode and row selection with row headers is possible.
		// - Interactive element inside a content cell.
		const bShouldBeInActionMode = (bIsInActionMode && (bIsRowHeaderCellInGroupHeaderRow || bIsRowSelectorCell || bCellAllowsActionMode)
									 || (bIsInteractiveElement && bParentIsAContentCell));

		if (bCellAllowsActionMode) {
			this._getKeyboardExtension()._bStayInActionMode = false;
		}

		// Enter or leave the action mode silently (onfocusin will be skipped).
		this._getKeyboardExtension().setActionMode(bShouldBeInActionMode, true);
	};

	/*
	 * Handled keys:
	 * Shift, Space, F2, F4, Ctrl+A, Ctrl+Shift+A
	 */
	KeyboardDelegate.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}
		const oKeyboardExtension = this._getKeyboardExtension();
		let oCellInfo = TableUtils.getCellInfo(oEvent.target);
		const sSelectionMode = this.getSelectionMode();
		const oSelectionPlugin = this._getSelectionPlugin();

		// Toggle the action mode by changing the focus between a data cell and its interactive controls.
		if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.F2)) {
			const bIsInActionMode = oKeyboardExtension.isInActionMode();
			const $Cell = TableUtils.getCell(this, oEvent.target);
			const bIsInCell = TableUtils.getParentCell(this, oEvent.target) != null;

			oCellInfo = TableUtils.getCellInfo($Cell);

			if (!bIsInActionMode && bIsInCell) {
				// A non-interactive element inside a cell, or any kind of element inside a column header cell is focused.
				// Focus the cell this element is inside.
				$Cell.trigger("focus");

			} else if (oCellInfo.isOfType(CellType.ANYCOLUMNHEADER)) {
				// Focus the interactive element inside a column header cell.
				const $InteractiveElements = TableUtils.getInteractiveElements($Cell);
				if ($InteractiveElements) {
					$InteractiveElements[0].focus();
				}

			} else {
				// The focus is on a content cell or an interactive element inside a content cell.
				// Toggle the action mode.
				oKeyboardExtension.setActionMode(!bIsInActionMode);
			}

			return;
		}

		// Expand/Collapse group.
		if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.F4) && KeyboardDelegate._allowsToggleExpandedState(this, oEvent.target)) {
			getRowByDomRef(this, oEvent.target).toggleExpandedState();
			return;
		}

		// Prevent page scrolling when pressing Space on the tree icon.
		if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE) && isTreeIcon(oEvent.target)) {
			oEvent.preventDefault(); // Prevent scrolling the page.
			return;
		}

		if (this._getKeyboardExtension().isInActionMode() || !oCellInfo.isOfType(CellType.ANY)) {
			return;
		}

		if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE)) {
			oEvent.preventDefault(); // Prevent scrolling the page.
		}

		// Shift: Start the range selection mode.
		if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SHIFT) &&
			sSelectionMode === SelectionMode.MultiToggle &&
			(oCellInfo.isOfType(CellType.ROWHEADER) && TableUtils.isRowSelectorSelectionAllowed(this) ||
			(oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION)))) {

			startRangeSelectionMode(this);

		// Ctrl+A: Select/Deselect all.
		} else if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.A, ModKey.CTRL)) {
			oEvent.preventDefault(); // Prevent full page text selection.

			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL | CellType.COLUMNROWHEADER)) {
				oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
			}

		// Ctrl+Shift+A: Deselect all.
		} else if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.A, ModKey.CTRL + ModKey.SHIFT)) {
			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL | CellType.COLUMNROWHEADER)) {
				oEvent.preventDefault();
				oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
			}

		// F4: Enter the action mode.
		} else if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.F4)) {
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
	 *  - PLUS = 187 (KeyCodes.PLUS)
	 *  - MINUS: 219 (KeyCodes.MINUS)
	 * Chrome:
	 *  - MINUS = 189
	 * Firefox:
	 * - PLUS = 171
	 * - MINUS = 173
	 *
	 * And this applies only for the german keyboard layout! It is different again in other languages.
	 */
	KeyboardDelegate.prototype.onkeypress = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}
		const oKeyboardExtension = this._getKeyboardExtension();
		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (KeyboardDelegate._isKeyCombination(oEvent, "+")) {
			if (KeyboardDelegate._allowsToggleExpandedState(this, oEvent.target)) {
				getRowByDomRef(this, oEvent.target).expand();
			} else if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION)) {
				oKeyboardExtension.setActionMode(true);
			}
		} else if (KeyboardDelegate._isKeyCombination(oEvent, "-")) {
			if (KeyboardDelegate._allowsToggleExpandedState(this, oEvent.target)) {
				getRowByDomRef(this, oEvent.target).collapse();
			} else if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION)) {
				oKeyboardExtension.setActionMode(true);
			}
		}
	};

	KeyboardDelegate.prototype.oncontextmenu = function(oEvent) {
		if (oEvent.isMarked("sapUiTableHandledByPointerExtension")) {
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(document.activeElement);

		if (oCellInfo.isOfType(CellType.ANY)) {
			TableUtils.Menu.openContextMenu(this, oEvent);
		}
	};

	/*
	 * Handles keys:
	 * Shift, Space, Enter
	 */
	KeyboardDelegate.prototype.onkeyup = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}
		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		// End the range selection mode.
		if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SHIFT)) {
			delete this._oRangeSelection;
		}

		if (oCellInfo.isOfType(CellType.COLUMNHEADER)) {
			if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE) || KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.ENTER)) {
				TableUtils.Menu.openContextMenu(this, oEvent);
			}
		} else if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE)) {
			handleSpaceAndEnter(this, oEvent);
		} else if (KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE, ModKey.SHIFT)) {
			TableUtils.toggleRowSelection(this, oCellInfo.rowIndex);

			startRangeSelectionMode(this);
		} else if (this._legacyMultiSelection && !oCellInfo.isOfType(CellType.COLUMNROWHEADER) &&
					(KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.SPACE, ModKey.CTRL) ||
					KeyboardDelegate._isKeyCombination(oEvent, KeyCodes.ENTER, ModKey.CTRL))) {
			handleSpaceAndEnter(this, oEvent);
		}
	};

	KeyboardDelegate.prototype.onsaptabnext = function(oEvent) {
		const oKeyboardExtension = this._getKeyboardExtension();
		let oCellInfo = TableUtils.getCellInfo(oEvent.target);
		let $Cell;

		if (oKeyboardExtension.isInActionMode()) {
			let $InteractiveElement;

			$Cell = TableUtils.getCell(this, oEvent.target);
			oCellInfo = TableUtils.getCellInfo($Cell);

			if (!oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
				return; // Not a content cell or an element inside a content cell.
			}

			let oRow = this.getRows()[oCellInfo.rowIndex];
			const $LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oRow);
			const bIsLastInteractiveElementInRow = $LastInteractiveElement === null || $LastInteractiveElement[0] === oEvent.target;

			if (bIsLastInteractiveElementInRow) {
				const iAbsoluteRowIndex = oRow.getIndex();
				const bIsLastScrollableRow = TableUtils.isLastScrollableRow(this, $Cell);
				const bIsAbsoluteLastRow = this._getTotalRowCount() - 1 === iAbsoluteRowIndex;
				const bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(this);

				oEvent.preventDefault();
				if (bIsAbsoluteLastRow) {
					oKeyboardExtension.setActionMode(false);
				} else if (bIsLastScrollableRow) {
					scrollDownAndFocus(this, oEvent);
				} else {
					let iRowIndex = oCellInfo.rowIndex;

					if (bTableHasRowSelectors) {
						focusCell(this, CellType.ROWHEADER, iRowIndex + 1);
					} else {
						const iRenderedRowCount = this.getRows().length;
						let bRowIsGroupHeaderRow = false;

						for (let i = oCellInfo.rowIndex + 1; i < iRenderedRowCount; i++) {
							iRowIndex = i;
							oRow = this.getRows()[iRowIndex];
							$InteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oRow);
							bRowIsGroupHeaderRow = oRow.isGroupHeader();
							if ($InteractiveElement || bRowIsGroupHeaderRow) {
								break;
							}
						}

						if ($InteractiveElement) {
							KeyboardDelegate._focusElement(this, $InteractiveElement[0]);
						} else if (bRowIsGroupHeaderRow) {
							focusCell(this, CellType.ROWHEADER, iRowIndex);
						} else {
							scrollDownAndFocus(this, oEvent);
						}
					}
				}
			} else if (oCellInfo.isOfType(CellType.ROWHEADER)) {
				oEvent.preventDefault();
				$InteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oRow);
				KeyboardDelegate._focusElement(this, $InteractiveElement[0]);

			} else {
				oEvent.preventDefault();
				$InteractiveElement = KeyboardDelegate._getNextInteractiveElement(this, oEvent.target);
				KeyboardDelegate._focusElement(this, $InteractiveElement[0]);
			}

		} else if (oCellInfo.isOfType(CellType.ANYCOLUMNHEADER)) {
			if (this.getCreationRow() && this.getCreationRow().getVisible() && !TableUtils.hasData(this)) {
				forwardFocusToTabDummy(this, "sapUiTableCtrlAfter");
			} else if (TableUtils.isNoDataVisible(this)) {
				this.$("noDataCnt").trigger("focus");
				oEvent.preventDefault();
			} else if (this.getRows().length > 0) {
				restoreFocusOnLastFocusedDataCell(this, oEvent);
				oEvent.preventDefault();
			}

		} else if (oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
			forwardFocusToTabDummy(this, "sapUiTableCtrlAfter");

		} else if (oEvent.target === this.getDomRef("overlay")) {
			oKeyboardExtension.setSilentFocus(this.$().find(".sapUiTableOuterAfter"));

		} else if (!oCellInfo.isOfType(CellType.ANY)) {
			$Cell = TableUtils.getParentCell(this, oEvent.target);

			if ($Cell) {
				// The target is a non-interactive element inside a data cell. We are not in action mode, so focus the cell.
				oEvent.preventDefault();
				$Cell.trigger("focus");
			}
		}
	};

	KeyboardDelegate.prototype.onsaptabprevious = function(oEvent) {
		const oKeyboardExtension = this._getKeyboardExtension();
		let oCellInfo = TableUtils.getCellInfo(oEvent.target);
		let $Cell;

		if (oKeyboardExtension.isInActionMode()) {
			let $InteractiveElement;

			$Cell = TableUtils.getCell(this, oEvent.target);
			oCellInfo = TableUtils.getCellInfo($Cell);

			if (!oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
				return; // Not a content cell or an element inside a content cell.
			}

			let oRow = this.getRows()[oCellInfo.rowIndex];
			const iAbsoluteRowIndex = oRow.getIndex();
			const $FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oRow);
			const bIsFirstInteractiveElementInRow = $FirstInteractiveElement !== null && $FirstInteractiveElement[0] === oEvent.target;
			const bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(this);
			const bRowHasInteractiveRowHeader = bTableHasRowSelectors || oRow.isGroupHeader();

			if (bIsFirstInteractiveElementInRow && bRowHasInteractiveRowHeader) {
				oEvent.preventDefault();
				focusCell(this, CellType.ROWHEADER, oCellInfo.rowIndex);

			} else if ((bIsFirstInteractiveElementInRow && !bRowHasInteractiveRowHeader)
					   || oCellInfo.isOfType(CellType.ROWHEADER)
					   || $FirstInteractiveElement === null) {
				const bIsFirstScrollableRow = TableUtils.isFirstScrollableRow(this, $Cell);
				const bIsAbsoluteFirstRow = iAbsoluteRowIndex === 0;

				oEvent.preventDefault();
				if (bIsAbsoluteFirstRow) {
					oKeyboardExtension.setActionMode(false);

				} else if (bIsFirstScrollableRow) {
					scrollUpAndFocus(this, oEvent);
				} else {
					let iRowIndex = oCellInfo.rowIndex;
					let bRowIsGroupHeaderRow = false;

					for (let i = oCellInfo.rowIndex - 1; i >= 0; i--) {
						iRowIndex = i;
						oRow = this.getRows()[iRowIndex];
						$InteractiveElement = KeyboardDelegate._getLastInteractiveElement(oRow);
						bRowIsGroupHeaderRow = oRow.isGroupHeader();
						if ($InteractiveElement || bRowHasInteractiveRowHeader || bRowIsGroupHeaderRow) {
							break;
						}
					}

					if ($InteractiveElement) {
						KeyboardDelegate._focusElement(this, $InteractiveElement[0]);
					} else if (bRowIsGroupHeaderRow || bRowHasInteractiveRowHeader) {
						focusCell(this, CellType.ROWHEADER, iRowIndex);
					} else {
						scrollUpAndFocus(this, oEvent);
					}
				}

			} else {
				oEvent.preventDefault();
				$InteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(this, oEvent.target);
				KeyboardDelegate._focusElement(this, $InteractiveElement[0]);
			}

		} else if (oCellInfo.isOfType(CellType.ANYCONTENTCELL) || oEvent.target === this.getDomRef("noDataCnt")) {
			if (this.getColumnHeaderVisible() && !oCellInfo.isOfType(CellType.ROWACTION)) {
				setFocusOnColumnHeaderOfLastFocusedDataCell(this, oEvent);
				oEvent.preventDefault();
			} else {
				forwardFocusToTabDummy(this, "sapUiTableCtrlBefore");
			}

		} else if (oEvent.target === this.getDomRef("overlay")) {
			this._getKeyboardExtension().setSilentFocus(this.$().find(".sapUiTableOuterBefore"));

		} else if (!oCellInfo.isOfType(CellType.ANY)) {
			$Cell = TableUtils.getParentCell(this, oEvent.target);

			if ($Cell) {
				// The target is a non-interactive element inside a data cell. We are not in action mode, so focus the cell.
				oEvent.preventDefault();
				$Cell.trigger("focus");
			}
		}
	};

	KeyboardDelegate.prototype.onsapdown = function(oEvent) {
		handleNavigationEvent(oEvent);
		navigateDown(this, oEvent);
	};

	KeyboardDelegate.prototype.onsapdownmodifiers = function(oEvent) {
		if (oEvent.isMarked()) {
			preventItemNavigation(oEvent);
			return;
		}

		handleNavigationEvent(oEvent);

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			navigateDown(this, oEvent);
			return;
		}

		const oKeyboardExtension = this._getKeyboardExtension();

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT) &&
			KeyboardDelegate._allowsToggleExpandedState(this, oEvent.target)) {

			preventItemNavigation(oEvent);
			getRowByDomRef(this, oEvent.target).expand();
			return;
		}

		if (oKeyboardExtension.isInActionMode()) {
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			/* Range Selection */

			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
					return;
				}

				const iFocusedRowIndex = TableUtils.getRowIndexOfFocusedCell(this);
				const iAbsoluteRowIndex = this.getRows()[iFocusedRowIndex].getIndex();
				const bReverse = this._oRangeSelection.startIndex > iAbsoluteRowIndex;
				let pScroll;

				// If we are in the last data row of the table we don't need to do anything.
				if (iAbsoluteRowIndex === this._getTotalRowCount() - 1) {
					return;
				}

				if (TableUtils.isLastScrollableRow(this, oEvent.target)) {
					if (this._oRangeSelection.pScroll) { // A previous selection is still ongoing.
						preventItemNavigation(oEvent);
						return;
					} else {
						pScroll = scrollDown(this, oEvent);
						this._oRangeSelection.pScroll = pScroll;
					}
				}

				if (pScroll) {
					preventItemNavigation(oEvent);
					pScroll.then(function() {
						return waitForData(this);
					}.bind(this)).then(function() {
						moveRangeSelection(this, iFocusedRowIndex - (bReverse ? 1 : 0), bReverse);
						delete this._oRangeSelection.pScroll;
					}.bind(this));
				} else {
					moveRangeSelection(this, iFocusedRowIndex + (bReverse ? 0 : 1), bReverse);
				}

			} else {
				preventItemNavigation(oEvent);
			}
		}

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			if (oCellInfo.isOfType(CellType.DATACELL)) {
				oKeyboardExtension.setActionMode(true);
			}
			preventItemNavigation(oEvent);
		}
	};

	KeyboardDelegate.prototype.onsapup = function(oEvent) {
		handleNavigationEvent(oEvent);
		navigateUp(this, oEvent);
	};

	KeyboardDelegate.prototype.onsapupmodifiers = function(oEvent) {
		if (oEvent.isMarked()) {
			preventItemNavigation(oEvent);
			return;
		}

		handleNavigationEvent(oEvent);

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			navigateUp(this, oEvent);
			return;
		}

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT) &&
			KeyboardDelegate._allowsToggleExpandedState(this, oEvent.target)) {

			preventItemNavigation(oEvent);
			getRowByDomRef(this, oEvent.target).collapse();
			return;
		}

		const oKeyboardExtension = this._getKeyboardExtension();

		if (oKeyboardExtension.isInActionMode()) {
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			/* Range Selection */

			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL)) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
					return;
				}

				const iFocusedRowIndex = TableUtils.getRowIndexOfFocusedCell(this);
				const iAbsoluteRowIndex = this.getRows()[iFocusedRowIndex].getIndex();
				const bReverse = this._oRangeSelection.startIndex < iAbsoluteRowIndex;
				let pScroll;

				// Do not move up to the header when performing a range selection.
				if (iAbsoluteRowIndex === 0) {
					preventItemNavigation(oEvent);
					return;
				}

				if (TableUtils.isFirstScrollableRow(this, oEvent.target)) {
					if (this._oRangeSelection.pScroll) { // A previous selection is still ongoing.
						preventItemNavigation(oEvent);
						return;
					} else {
						pScroll = scrollUp(this, oEvent);
						this._oRangeSelection.pScroll = pScroll;
					}
				}

				if (pScroll) {
					preventItemNavigation(oEvent);
					pScroll.then(function() {
						return waitForData(this);
					}.bind(this)).then(function() {
						moveRangeSelection(this, bReverse ? 1 : 0, bReverse);
						delete this._oRangeSelection.pScroll;
					}.bind(this));
				} else {
					moveRangeSelection(this, iFocusedRowIndex - (bReverse ? 0 : 1), bReverse);
				}

			} else {
				preventItemNavigation(oEvent);
			}
		}

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			if (oCellInfo.isOfType(CellType.DATACELL)) {
				oKeyboardExtension.setActionMode(true);
			}
			preventItemNavigation(oEvent);
		}
	};

	KeyboardDelegate.prototype.onsapleft = function(oEvent) {
		handleNavigationEvent(oEvent);
		navigateLeft(this, oEvent);
	};

	KeyboardDelegate.prototype.onsapleftmodifiers = function(oEvent) {
		if (oEvent.isMarked()) {
			preventItemNavigation(oEvent);
			return;
		}

		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);
		const bIsRTL = Localization.getRTL();

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {

			/* Range Selection */

			if (oCellInfo.isOfType(CellType.DATACELL)) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
					return;
				}

				const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				const bFocusOnFirstDataCell = TableUtils.hasRowHeader(this) && oFocusedItemInfo.cellInRow === 1;

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
				let iResizeDelta = -TableUtils.convertCSSSizeToPixel(COLUMN_RESIZE_STEP_CSS_SIZE);
				let iColumnSpanWidth = 0;

				if (bIsRTL) {
					iResizeDelta = iResizeDelta * -1;
				}

				for (let i = oCellInfo.columnIndex; i < oCellInfo.columnIndex + oCellInfo.columnSpan; i++) {
					iColumnSpanWidth += TableUtils.Column.getColumnWidth(this, i);
				}

				const oColumn = this.getColumns()[oCellInfo.columnIndex];
				TableUtils.Column.resizeColumn(this, oColumn, iColumnSpanWidth + iResizeDelta, true, oCellInfo.columnSpan);
				preventItemNavigation(oEvent);
			}

		} else if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {

			/* Column Reordering */

			if (oCellInfo.isOfType(CellType.COLUMNHEADER)) {
				preventItemNavigation(oEvent);
				moveColumn(this.getColumns()[oCellInfo.columnIndex], bIsRTL);
			}

		} else if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			preventItemNavigation(oEvent);
		}
	};

	KeyboardDelegate.prototype.onsaprightmodifiers = function(oEvent) {
		if (oEvent.isMarked()) {
			preventItemNavigation(oEvent);
			return;
		}

		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);
		const bIsRTL = Localization.getRTL();

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
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
				let iResizeDelta = TableUtils.convertCSSSizeToPixel(COLUMN_RESIZE_STEP_CSS_SIZE);
				let iColumnSpanWidth = 0;

				if (bIsRTL) {
					iResizeDelta = iResizeDelta * -1;
				}

				for (let i = oCellInfo.columnIndex; i < oCellInfo.columnIndex + oCellInfo.columnSpan; i++) {
					iColumnSpanWidth += TableUtils.Column.getColumnWidth(this, i);
				}

				const oColumn = this.getColumns()[oCellInfo.columnIndex];
				TableUtils.Column.resizeColumn(this, oColumn, iColumnSpanWidth + iResizeDelta, true, oCellInfo.columnSpan);

				preventItemNavigation(oEvent);

			} else if (oCellInfo.isOfType(CellType.COLUMNROWHEADER)) {
				preventItemNavigation(oEvent);
			}

		} else if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {

			/* Column Reordering */

			if (oCellInfo.isOfType(CellType.COLUMNHEADER)) {
				preventItemNavigation(oEvent);
				moveColumn(this.getColumns()[oCellInfo.columnIndex], !bIsRTL);
			}

		} else if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			preventItemNavigation(oEvent);
		}
	};

	KeyboardDelegate.prototype.onsaphome = function(oEvent) {
		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		// If focus is on a group header, do nothing.
		if (TableUtils.Grouping.isInGroupHeaderRow(oEvent.target)) {
			preventItemNavigation(oEvent);
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWACTION | CellType.COLUMNHEADER)) {
			const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			const iFocusedIndex = oFocusedItemInfo.cell;
			const iFocusedCellInRow = oFocusedItemInfo.cellInRow;
			const iFixedColumnCount = this.getComputedFixedColumnCount();
			const bHasRowHeader = TableUtils.hasRowHeader(this);
			const iRowHeaderOffset = bHasRowHeader ? 1 : 0;

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

	KeyboardDelegate.prototype.onsapend = function(oEvent) {
		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		// If focus is on a group header, do nothing.
		if (TableUtils.Grouping.isInGroupHeaderRow(oEvent.target)) {
			preventItemNavigation(oEvent);
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (oCellInfo.isOfType(CellType.ANY)) {
			const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			const iFocusedIndex = oFocusedItemInfo.cell;
			const iColumnCount = oFocusedItemInfo.columnCount;
			const iFixedColumnCount = this.getComputedFixedColumnCount();
			const iFocusedCellInRow = oFocusedItemInfo.cellInRow;
			const bHasRowHeader = TableUtils.hasRowHeader(this);
			const iRowHeaderOffset = bHasRowHeader ? 1 : 0;
			let bIsColSpanAtFixedAreaEnd = false;

			// If the focused cell is a column span in the column header at the end of the fixed area,
			// the selected cell index is the index of the first cell in the span.
			// Treat this case like there is no span and the last cell of the fixed area is selected.
			if (oCellInfo.isOfType(CellType.COLUMNHEADER) && TableUtils.hasFixedColumns(this)) {
				const iColSpan = parseInt(oCellInfo.cell.getAttribute("colspan") || 1);
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

	KeyboardDelegate.prototype.onsaphomemodifiers = function(oEvent) {
		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			const oCellInfo = TableUtils.getCellInfo(oEvent.target);

			if (oCellInfo.isOfType(CellType.ANYCONTENTCELL | CellType.COLUMNHEADER)) {
				preventItemNavigation(oEvent);

				const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				const iFocusedRow = oFocusedItemInfo.row;

				// Only do something if the focus is not in the first row already.
				if (iFocusedRow > 0) {
					const iFocusedIndex = oFocusedItemInfo.cell;
					const iColumnCount = oFocusedItemInfo.columnCount;
					const iHeaderRowCount = TableUtils.getHeaderRowCount(this);
					const mRowCounts = this._getRowCounts();

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
							   iFocusedRow < iHeaderRowCount + TableUtils.getNonEmptyRowCount(this) - mRowCounts.fixedBottom) {
						this._getScrollExtension().scrollVerticallyMax(false);
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
						this._getScrollExtension().scrollVerticallyMax(false);
						TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - mRowCounts.fixedTop), oEvent);
					}
				}
			}
		}
	};

	KeyboardDelegate.prototype.onsapendmodifiers = function(oEvent) {
		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			const oCellInfo = TableUtils.getCellInfo(oEvent.target);

			if (oCellInfo.isOfType(CellType.ANY)) {
				const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				const iFocusedRow = oFocusedItemInfo.row;
				const iHeaderRowCount = TableUtils.getHeaderRowCount(this);
				const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this);
				const mRowCounts = this._getRowCounts();

				preventItemNavigation(oEvent);

				// Only do something if the focus is above the last row of the fixed bottom area
				// or above the last row of the column header area when NoData is visible.
				if (mRowCounts.fixedBottom === 0 ||
					iFocusedRow < iHeaderRowCount + iNonEmptyRowCount - 1 ||
					(TableUtils.isNoDataVisible(this) && iFocusedRow < iHeaderRowCount - 1)) {

					const iFocusedIndex = oFocusedItemInfo.cell;
					const iColumnCount = oFocusedItemInfo.columnCount;

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
							this._getScrollExtension().scrollVerticallyMax(true);
							TableUtils.focusItem(
								this,
								iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyRowCount - mRowCounts.fixedBottom - iFocusedRow - 1),
								oEvent
							);
						}

					/* Top fixed area */
					} else if (iFocusedRow >= iHeaderRowCount && iFocusedRow < iHeaderRowCount + mRowCounts.fixedTop) {
						// Set the focus to the last row of the scrollable area and scroll to bottom.
						this._getScrollExtension().scrollVerticallyMax(true);
						TableUtils.focusItem(
							this,
							iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyRowCount - mRowCounts.fixedBottom - iFocusedRow - 1),
							oEvent
						);

					/* Scrollable area */
					} else if (iFocusedRow >= iHeaderRowCount + mRowCounts.fixedTop &&
							   iFocusedRow < iHeaderRowCount + iNonEmptyRowCount - mRowCounts.fixedBottom) {
						// Set the focus to the last row of the scrollable area and scroll to bottom.
						this._getScrollExtension().scrollVerticallyMax(true);
						TableUtils.focusItem(
							this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyRowCount - iFocusedRow - 1), oEvent);

					/* Bottom fixed area */
					} else {
						// Set the focus to the last row of the bottom fixed area.
						TableUtils.focusItem(
							this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyRowCount - iFocusedRow - 1), oEvent);
					}
				}
			}
		}
	};

	KeyboardDelegate.prototype.onsappageup = function(oEvent) {
		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (oCellInfo.isOfType(CellType.ANYCONTENTCELL | CellType.COLUMNHEADER)) {
			const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			const iFocusedRow = oFocusedItemInfo.row;
			const iHeaderRowCount = TableUtils.getHeaderRowCount(this);
			const mRowCounts = this._getRowCounts();

			// Only do something if the focus is not in the column header area or the first row of the top fixed area.
			if (mRowCounts.fixedTop === 0 && iFocusedRow >= iHeaderRowCount || mRowCounts.fixedTop > 0 && iFocusedRow > iHeaderRowCount) {
				preventItemNavigation(oEvent);

				const iFocusedIndex = oFocusedItemInfo.cell;
				const iColumnCount = oFocusedItemInfo.columnCount;

				/* Top fixed area - From second row downwards */
				if (iFocusedRow < iHeaderRowCount + mRowCounts.fixedTop) {
					// Set the focus to the first row of the top fixed area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);

				/* Scrollable area - First row */
				} else if (iFocusedRow === iHeaderRowCount + mRowCounts.fixedTop) {
					const iPageSize = TableUtils.getNonEmptyRowCount(this) - mRowCounts.fixedTop - mRowCounts.fixedBottom;
					const iRowsToBeScrolled = this.getFirstVisibleRow();

					scrollUp(this, oEvent, true);

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
						   iFocusedRow < iHeaderRowCount + TableUtils.getNonEmptyRowCount(this)) {
					// Set the focus to the first row of the scrollable area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - mRowCounts.fixedTop), oEvent);

				/* Empty area */
				} else {
					// Set the focus to the last row of the scrollable area.
					TableUtils.focusItem(
						this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - TableUtils.getNonEmptyRowCount(this) + 1),
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

	KeyboardDelegate.prototype.onsappagedown = function(oEvent) {
		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		const oCellInfo = TableUtils.getCellInfo(oEvent.target);

		if (oCellInfo.isOfType(CellType.ANY)) {
			const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			const iFocusedRow = oFocusedItemInfo.row;
			const iHeaderRowCount = TableUtils.getHeaderRowCount(this);
			const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this);
			const mRowCounts = this._getRowCounts();

			preventItemNavigation(oEvent);

			// Only do something if the focus is above the last row of the bottom fixed area
			// or above the last row of the column header area when NoData is visible.
			if ((TableUtils.isNoDataVisible(this) && iFocusedRow < iHeaderRowCount - 1) ||
				mRowCounts.fixedBottom === 0 ||
				iFocusedRow < iHeaderRowCount + iNonEmptyRowCount - 1) {

				const iFocusedIndex = oFocusedItemInfo.cell;
				const iColumnCount = oFocusedItemInfo.columnCount;

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
						   iFocusedRow < iHeaderRowCount + iNonEmptyRowCount - mRowCounts.fixedBottom - 1) {
					// Set the focus to the last row of the scrollable area.
					TableUtils.focusItem(
						this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyRowCount - mRowCounts.fixedBottom - iFocusedRow - 1),
						oEvent
					);

				/* Scrollable area - Last row */
				} else if (iFocusedRow === iHeaderRowCount + iNonEmptyRowCount - mRowCounts.fixedBottom - 1) {
					const iPageSize = TableUtils.getNonEmptyRowCount(this) - mRowCounts.fixedTop - mRowCounts.fixedBottom;
					const iRowsToBeScrolled = this._getTotalRowCount() - mRowCounts.fixedBottom - this.getFirstVisibleRow() - iPageSize * 2;

					scrollDown(this, oEvent, true);

					// If scrolling was not performed over a full page and there is a bottom fixed area,
					// then set the focus to the last row of the bottom fixed area.
					if (iRowsToBeScrolled < iPageSize && mRowCounts.fixedBottom > 0) {
						TableUtils.focusItem(
							this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyRowCount - iFocusedRow - 1), oEvent);
					}

				/* Bottom fixed area */
				} else {
					// Set the focus to the last row of the bottom fixed area.
					TableUtils.focusItem(this, iFocusedIndex + iColumnCount * (iHeaderRowCount + iNonEmptyRowCount - iFocusedRow - 1), oEvent);
				}
			}
		}
	};

	KeyboardDelegate.prototype.onsappageupmodifiers = function(oEvent) {
		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			const oCellInfo = TableUtils.getCellInfo(oEvent.target);
			const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);

			if (oCellInfo.isOfType(CellType.DATACELL | CellType.COLUMNHEADER)) {
				const iFocusedIndex = oFocusedItemInfo.cell;
				const iFocusedCellInRow = oFocusedItemInfo.cellInRow;

				const bHasRowHeader = TableUtils.hasRowHeader(this);
				const iRowHeaderOffset = bHasRowHeader ? 1 : 0;
				const iPageSize = HORIZONTAL_SCROLLING_PAGE_SIZE;

				preventItemNavigation(oEvent);

				if (bHasRowHeader && (TableUtils.Grouping.isInGroupHeaderRow(oEvent.target) || iFocusedCellInRow === 1)) {
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

	KeyboardDelegate.prototype.onsappagedownmodifiers = function(oEvent) {
		handleNavigationEvent(oEvent);

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (KeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			const oCellInfo = TableUtils.getCellInfo(oEvent.target);

			if (oCellInfo.isOfType(CellType.DATACELL | CellType.ROWHEADER | CellType.ANYCOLUMNHEADER)) {
				const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				const iFocusedCellInRow = oFocusedItemInfo.cellInRow;

				const bHasRowHeader = TableUtils.hasRowHeader(this);
				const iRowHeaderOffset = bHasRowHeader ? 1 : 0;
				const iVisibleColumnCount = TableUtils.getVisibleColumnCount(this);
				const iColSpan = parseInt(oCellInfo.cell.getAttribute("colspan") || 1);

				preventItemNavigation(oEvent);

				// Only do something, if the selected cell or span is not at the end of the table.
				if (iFocusedCellInRow + iColSpan - iRowHeaderOffset < iVisibleColumnCount) {
					const iFocusedIndex = oFocusedItemInfo.cell;
					const iPageSize = HORIZONTAL_SCROLLING_PAGE_SIZE;

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

					} else if (!TableUtils.Grouping.isInGroupHeaderRow(oEvent.target)) {
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

	KeyboardDelegate.prototype.onsapenter = function(oEvent) {
		handleSpaceAndEnter(this, oEvent);
	};

	return KeyboardDelegate;
});