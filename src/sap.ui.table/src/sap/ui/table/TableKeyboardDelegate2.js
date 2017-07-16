/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableKeyboardDelegate2.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/Device', './library', './TableUtils'
], function(jQuery, BaseObject, Device, library, TableUtils) {
	"use strict";

	// Shortcuts
	var CellType = TableUtils.CELLTYPES;
	var SelectionMode = library.SelectionMode;

	/**
	 * Modifier key flags.
	 *
	 * @type {{CTRL: int, SHIFT: int, ALT: int}}
	 */
	var ModKey = {
		CTRL: 1,
		SHIFT: 2,
		ALT: 4
	};

	/**
	 * The selectors which define whether an element is interactive. Due to the usage of pseudo selectors this can only be used in jQuery.
	 *
	 * @type {string}
	 */
	var INTERACTIVE_ELEMENT_SELECTORS = ":sapTabbable, input:sapFocusable, .sapUiTableTreeIcon:not(.sapUiTableTreeIconLeaf)";

	// Workaround until (if ever) these values can be set by applications.
	var HORIZONTAL_SCROLLING_PAGE_SIZE = 5;
	var COLUMN_RESIZE_STEP_CSS_SIZE = "1em";

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

	/*
	 * Restores the focus to the last known cell position.
	 */
	TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell = function(oTable, oEvent) {
		var oCellInfo = TableUtils.getFocusedItemInfo(oTable);
		var oLastInfo = oTable._getKeyboardExtension()._getLastFocusedCellInfo();
		TableUtils.focusItem(oTable, oCellInfo.cellInRow + (oCellInfo.columnCount * oLastInfo.row), oEvent);
	};

	/*
	 * Sets the focus to the corresponding column header of the last known cell position.
	 */
	TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell = function(oTable, oEvent) {
		var oCellInfo = TableUtils.getFocusedItemInfo(oTable);
		TableUtils.focusItem(oTable, oCellInfo.cellInRow, oEvent);
	};

	/*
	 * Sets the focus to the corresponding column header of the last known cell position.
	 */
	TableKeyboardDelegate._forwardFocusToTabDummy = function(oTable, sTabDummy) {
		oTable._getKeyboardExtension()._setSilentFocus(oTable.$().find("." + sTabDummy));
	};

	/**
	 * Checks whether a keyboard event was triggered by a specific key combination.
	 * On Mac systems the Meta key will be checked instead of the Ctrl key.
	 *
	 * @param {jQuery.Event} oEvent The keyboard event object.
	 * @param {int|string|null} key The key code integer, or character string, of the key which should have been pressed.
	 *                              If an <code>integer</code> is passed, the value will be compared with the <code>keyCode</code> value.
	 *                              If a <code>string</code> is passed, the value will be compared with the string representation of the
	 * 								<code>charCode</code>.
	 * 								If no value is passed only the modifier keys will be checked.
	 * @param {int} [modifierKeyMask=0] The modifier key bitmask.
	 * @example
	 * TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.A); // A
	 * TableKeyboardDelegate._isKeyCombination(oEvent, "+"); // CharCode check: "+" and "NumpadPlus"
	 * TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.A, ModKey.CTRL + ModKey.SHIFT); // Ctrl+Shift+A
	 * TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL); // Ctrl (useful for simulated events like "sapdown")
	 * @private
	 */
	TableKeyboardDelegate._isKeyCombination = function(oEvent, key, modifierKeyMask) {
		if (modifierKeyMask == null) {
			modifierKeyMask = 0;
		}

		var eventKey = typeof key === "string" ? String.fromCharCode(oEvent.charCode) : oEvent.keyCode;
		var eventModifierKeyMask = 0;

		eventModifierKeyMask |= (Device.os.macintosh ? oEvent.metaKey : oEvent.ctrlKey) && key !== jQuery.sap.KeyCodes.CONTROL ? ModKey.CTRL : 0;
		eventModifierKeyMask |= oEvent.shiftKey && key !== jQuery.sap.KeyCodes.SHIFT ? ModKey.SHIFT : 0;
		eventModifierKeyMask |= oEvent.altKey && key !== jQuery.sap.KeyCodes.ALT ? ModKey.ALT : 0;

		var bValidKey = key == null || eventKey === key;
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
	 */
	TableKeyboardDelegate._handleSpaceAndEnter = function(oTable, oEvent) {
		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		// Select/Deselect all.
		if (oCellInfo.type === CellType.COLUMNROWHEADER) {
			oTable._toggleSelectAll();

		// Expand/Collapse group.
		} else if (TableKeyboardDelegate._isElementGroupToggler(oTable, oEvent.target)) {
			TableUtils.Grouping.toggleGroupHeaderByRef(oTable, oEvent.target);

		// Select/Deselect row.
		} else if (oCellInfo.type === CellType.ROWHEADER) {
			TableUtils.toggleRowSelection(oTable, oEvent.target);

		} else if (oCellInfo.type === CellType.DATACELL ||
				   oCellInfo.type === CellType.ROWACTION) {

			// The action mode should only be entered when cellClick is not handled and no selection is performed.
			var bEnterActionMode = !oTable.hasListeners("cellClick");

			// Fire the cell click event.
			if (!oTable._findAndfireCellEvent(oTable.fireCellClick, oEvent)) {

				// Select/Deselect row.
				if (TableUtils.isRowSelectionAllowed(oTable)) {
					TableUtils.toggleRowSelection(oTable, oEvent.target);
					bEnterActionMode = false;
				}
			}

			if (bEnterActionMode) {
				var $InteractiveElements = TableKeyboardDelegate._getInteractiveElements(oEvent.target);
				if ($InteractiveElements !== null) {
					oTable._getKeyboardExtension().setActionMode(true);
				}
			}
		}
	};

	/*
	 * Moves the given column to the next or previous position (based on the visible columns).
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
	 */
	TableKeyboardDelegate._getVisibleAndGroupedColumns = function(oTable) {
		return oTable.getColumns().filter(function(oColumn){
			return oColumn.getVisible() || oColumn.getGrouped();
		});
	};

	/**
	 * Returns the index of the column in the array of visible and grouped columns
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.Column} oColumn Instance of the table column to get the index for.
	 * @returns {int} Returns the index of the column in the list of visible and grouped columns.
	 * 				  Returns -1 if the column is not in this list.
	 * @private
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
	 * Sets the focus to a row header cell of a table.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {int} iRowIndex The index of the row header cell to focus.
	 * @private
	 */
	TableKeyboardDelegate._focusRowSelector = function(oTable, iRowIndex) {
		oTable._getKeyboardExtension()._setFocus(oTable.getDomRef("rowsel" + iRowIndex));
	};

	/**
	 * Checks whether an element is in the list of elements which can allow expanding and collapsing a group, if a specific key is pressed on them.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {HTMLElement} oElement The element to check.
	 * @returns {boolean} Returns <code>true</code>, if pressing a specific key on this element can cause a group to expand or to collapse.
	 * @private
	 */
	TableKeyboardDelegate._isElementGroupToggler = function(oTable, oElement) {
		return TableUtils.Grouping.isInGroupingRow(oElement)
			   || (TableUtils.Grouping.isTreeMode(oTable)
				   && oElement.classList.contains("sapUiTableTdFirst")
				   && (oElement.querySelector(".sapUiTableTreeIconNodeOpen") != null
					   || oElement.querySelector(".sapUiTableTreeIconNodeClosed") != null))
			   || oElement.classList.contains("sapUiTableTreeIconNodeOpen")
			   || oElement.classList.contains("sapUiTableTreeIconNodeClosed");
	};

	/**
	 * Find out if an element is interactive.
	 *
	 * @param {jQuery|HTMLElement} oElement The element to check.
	 * @returns {boolean|null} Returns <code>true</code>, if the passed element is interactive.
	 * @private
	 */
	TableKeyboardDelegate._isElementInteractive = function(oElement) {
		if (oElement == null) {
			return false;
		}

		return jQuery(oElement).is(INTERACTIVE_ELEMENT_SELECTORS);
	};

	/**
	 * Returns all interactive elements in a data cell.
	 * @param {jQuery|HTMLElement} oCell The data cell from which to get the interactive elements.
	 * @returns {jQuery|null} Returns <code>null</code>, if the passed cell is not a cell or does not contain any interactive elements.
	 * @private
	 */
	TableKeyboardDelegate._getInteractiveElements = function(oCell) {
		if (oCell == null) {
			return null;
		}

		var $Cell = jQuery(oCell);
		var oCellInfo = TableUtils.getCellInfo($Cell);

		if (oCellInfo !== null && (oCellInfo.type === TableUtils.CELLTYPES.DATACELL || oCellInfo.type === TableUtils.CELLTYPES.ROWACTION)) {
			var $InteractiveElements = $Cell.find(INTERACTIVE_ELEMENT_SELECTORS);
			if ($InteractiveElements.length > 0) {
				return $InteractiveElements;
			}
		}

		return null;
	};

	/**
	 * Returns the first interactive element in a row.
	 *
	 * @param {sap.ui.table.Row} oRow The row from which to get the interactive element.
	 * @returns {jQuery|null} Returns <code>null</code> if the passed row does not contain any interactive elements.
	 * @private
	 */
	TableKeyboardDelegate._getFirstInteractiveElement = function(oRow) {
		if (oRow == null) {
			return null;
		}

		var oTable = oRow.getParent();
		var aCells = oRow.getCells();
		var oCellDomRef;
		var $Cell;
		var $InteractiveElements;

		for (var i = 0; i < aCells.length; i++) {
			oCellDomRef = aCells[i].getDomRef();
			$Cell = TableUtils.getCell(oTable, oCellDomRef);
			$InteractiveElements = this._getInteractiveElements($Cell);

			if ($InteractiveElements !== null) {
				return $InteractiveElements.first();
			}
		}

		if (TableUtils.hasRowActions(oTable)) {
			oCellDomRef = oRow.getAggregation("_rowAction").getDomRef();
			$Cell = TableUtils.getCell(oTable, oCellDomRef);
			$InteractiveElements = this._getInteractiveElements($Cell);

			if ($InteractiveElements !== null) {
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
	 */
	TableKeyboardDelegate._getLastInteractiveElement = function(oRow) {
		if (oRow == null) {
			return null;
		}

		var oTable = oRow.getParent();
		var aCells = oRow.getCells();
		var oCellDomRef;
		var $Cell;
		var $InteractiveElements;

		if (TableUtils.hasRowActions(oTable)) {
			oCellDomRef = oRow.getAggregation("_rowAction").getDomRef();
			$Cell = TableUtils.getParentRowActionCell(oTable, oCellDomRef);
			$InteractiveElements = this._getInteractiveElements($Cell);

			if ($InteractiveElements !== null) {
				return $InteractiveElements.last();
			}
		}

		for (var i = aCells.length - 1; i >= 0; i--) {
			oCellDomRef = aCells[i].getDomRef();
			$Cell = TableUtils.getParentDataCell(oTable, oCellDomRef);
			$InteractiveElements = this._getInteractiveElements($Cell);

			if ($InteractiveElements !== null) {
				return $InteractiveElements.last();
			}
		}

		return null;
	};

	/**
	 * Returns the interactive element before the passed interactive element in the same row.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oElement An interactive element in a row.
	 * @returns {jQuery|null} Returns <code>null</code> if the passed element is not an interactive element, or is the first interactive element in
	 * 						  the row.
	 * @private
	 */
	TableKeyboardDelegate._getPreviousInteractiveElement = function(oTable, oElement) {
		if (oTable == null || oElement == null) {
			return null;
		}

		var $Element = jQuery(oElement);
		if (!this._isElementInteractive($Element)) {
			return null;
		}

		var $DataCell;
		var $RowActionCell = TableUtils.getParentRowActionCell(oTable, oElement);
		var $InteractiveElements;
		var oDataCellInfo;
		var oRow;
		var aCells;
		var oColumn;
		var iColumnIndexInCellsAggregation;
		var iColumnIndexToStartSearch;

		if ($RowActionCell !== null) {
			// The interactive element is inside a row action cell.
			// Search for the previous interactive element in the row action cell.
			$InteractiveElements = this._getInteractiveElements($RowActionCell);
			if ($InteractiveElements[0] !== $Element[0]) {
				return $InteractiveElements.eq($InteractiveElements.index(oElement) - 1);
			}

			// The interactive element is the first inside a row action cell.
			// Start to search for the previous interactive element from the last data cell in the row.
			var iRowIndex = TableUtils.getRowActionCellInfo(oTable, $RowActionCell).rowIndex;
			oRow = oTable.getRows()[iRowIndex];
			aCells = oRow.getCells();
			$DataCell = TableUtils.getParentDataCell(oTable, aCells[aCells.length - 1].getDomRef());
			oDataCellInfo = TableUtils.getDataCellInfo(oTable, $DataCell);
			oColumn = oTable.getColumns()[oDataCellInfo.columnIndex];
			iColumnIndexInCellsAggregation = TableKeyboardDelegate._getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);
			iColumnIndexToStartSearch = iColumnIndexInCellsAggregation;
		} else {
			// Start to look for the previous interactive element from the cell the interactive element is inside.
			$DataCell = TableUtils.getParentDataCell(oTable, oElement);
			oDataCellInfo = TableUtils.getDataCellInfo(oTable, $DataCell);
			oRow = oTable.getRows()[oDataCellInfo.rowIndex];
			aCells = oRow.getCells();
			oColumn = oTable.getColumns()[oDataCellInfo.columnIndex];
			iColumnIndexInCellsAggregation = TableKeyboardDelegate._getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);
			iColumnIndexToStartSearch = iColumnIndexInCellsAggregation - 1;

			// Search for the previous interactive element in the current cell.
			$InteractiveElements = this._getInteractiveElements($DataCell);
			if ($InteractiveElements[0] !== $Element[0]) {
				return $InteractiveElements.eq($InteractiveElements.index(oElement) - 1);
			}
		}

		// Perform the search to the left iterating from cell to cell.
		for (var i = iColumnIndexToStartSearch; i >= 0; i--) {
			var oCellDomRef = aCells[i].getDomRef();
			$DataCell = TableUtils.getParentDataCell(oTable, oCellDomRef);
			$InteractiveElements = this._getInteractiveElements($DataCell);

			if ($InteractiveElements !== null) {
				return $InteractiveElements.last();
			}
		}

		return null;
	};

	/**
	 * Returns the interactive element after the passed interactive element in the same row.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oElement An interactive element in a row.
	 * @returns {jQuery|null} Returns <code>null</code> if the passed element is not an interactive element, or is the last interactive element in
	 * 						  the row.
	 * @private
	 */
	TableKeyboardDelegate._getNextInteractiveElement = function(oTable, oElement) {
		if (oTable == null || oElement == null) {
			return null;
		}

		var $Element = jQuery(oElement);
		if (!this._isElementInteractive($Element)) {
			return null;
		}

		var $DataCell = TableUtils.getParentDataCell(oTable, oElement);
		var $RowActionCell = null;
		var $InteractiveElements;

		if ($DataCell !== null) {
			var oDataCellInfo = TableUtils.getDataCellInfo(oTable, $DataCell);
			var oRow = oTable.getRows()[oDataCellInfo.rowIndex];
			var aCells = oRow.getCells();

			// First search for the next interactive element in the current cell.
			$InteractiveElements = this._getInteractiveElements($DataCell);
			if ($InteractiveElements.get(-1) !== $Element[0]) {
				return $InteractiveElements.eq($InteractiveElements.index(oElement) + 1);
			}

			// Search in the next cells.
			var oColumn = oTable.getColumns()[oDataCellInfo.columnIndex];
			var iColumnIndexInCellsAggregation = TableKeyboardDelegate._getColumnIndexInVisibleAndGroupedColumns(oTable, oColumn);
			for (var i = iColumnIndexInCellsAggregation + 1; i < aCells.length; i++) {
				var oCellDomRef = aCells[i].getDomRef();
				$DataCell = TableUtils.getParentDataCell(oTable, oCellDomRef);
				$InteractiveElements = this._getInteractiveElements($DataCell);

				if ($InteractiveElements !== null) {
					return $InteractiveElements.first();
				}
			}

			// Search in the row action cell.
			if (TableUtils.hasRowActions(oTable)) {
				$RowActionCell = TableUtils.getParentRowActionCell(oTable, oRow.getAggregation("_rowAction").getDomRef());
			}
		}

		if (TableUtils.hasRowActions(oTable)) {
			if ($RowActionCell === null) {
				$RowActionCell = TableUtils.getParentRowActionCell(oTable, oElement);
			}

			if ($RowActionCell !== null) {
				// The interactive element is inside a row action cell.
				// Search for the next interactive element in the row action cell.
				$InteractiveElements = this._getInteractiveElements($RowActionCell);
				if ($InteractiveElements.get(-1) !== $Element[0]) {
					return $InteractiveElements.eq($InteractiveElements.index(oElement) + 1);
				}
			}
		}

		return null;
	};

	//******************************************************************************************

	/*
	 * Hook which is called by the keyboard extension when the table should enter the action mode.
	 * @see TableKeyboardExtension#setActionMode
	 */
	TableKeyboardDelegate.prototype.enterActionMode = function() {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oActiveElement = document.activeElement;
		var $InteractiveElements = TableKeyboardDelegate._getInteractiveElements(oActiveElement);
		var $ParentDataCell = TableUtils.getParentDataCell(this, oActiveElement);
		var $ParentCell = $ParentDataCell || TableUtils.getParentRowActionCell(this, oActiveElement);

		if ($InteractiveElements !== null) {
			// Target is a data cell with interactive elements inside. Focus the first interactive element in the data cell.
			oKeyboardExtension._suspendItemNavigation();
			oActiveElement.tabIndex = -1;
			oKeyboardExtension._setSilentFocus($InteractiveElements[0]);
			return true;

		} else if ($ParentCell !== null) {
			// Target is an interactive element inside a data cell.
			this._getKeyboardExtension()._suspendItemNavigation();
			return true;
		}

		return false;
	};

	/*
	 * Hook which is called by the keyboard extension when the table leaves the action mode.
	 * @see TableKeyboardExtension#setActionMode
	 */
	TableKeyboardDelegate.prototype.leaveActionMode = function() {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oActiveElement = document.activeElement;

		oKeyboardExtension._resumeItemNavigation();

		var $ParentDataCell = TableUtils.getParentDataCell(this, oActiveElement);
		var $ParentCell = $ParentDataCell || TableUtils.getParentRowActionCell(this, oActiveElement);
		if ($ParentCell !== null) {
			oKeyboardExtension._setSilentFocus($ParentCell);
		} else {
			oActiveElement.blur();
			oKeyboardExtension._setSilentFocus(oActiveElement);
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
			/* else {
			 // If needed and NoData visible, then set the focus to NoData area.
			 this.$("noDataCnt").focus();
			 }*/
		}

		var $ParentDataCell = TableUtils.getParentDataCell(this, $Target);
		var $ParentCell = $ParentDataCell || TableUtils.getParentRowActionCell(this, $Target);
		var bIsInteractiveElement = $ParentCell !== null && TableKeyboardDelegate._isElementInteractive($Target);

		if (this._getKeyboardExtension().isInActionMode()) {
			// Leave the action mode when focusing an element in the table which is not supported by the action mode.
			// Supported elements:
			// - Group row header cell; If the table is in action mode.
			// - Row selector cell; If the table is in action mode and row selection with row headers is possible.
			// - Interactive element inside a data cell.

			var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};
			var bIsRowHeaderCellInGroupHeaderRow = oCellInfo.type === CellType.ROWHEADER && TableUtils.Grouping.isInGroupingRow(oEvent.target);
			var bIsRowSelectorCell = oCellInfo.type === CellType.ROWHEADER && !bIsRowHeaderCellInGroupHeaderRow && TableUtils.isRowSelectorSelectionAllowed(this);

			if (!bIsRowHeaderCellInGroupHeaderRow && !bIsRowSelectorCell && !bIsInteractiveElement) {
				this._getKeyboardExtension().setActionMode(false);
			}

		} else if (bIsInteractiveElement) {
			this._getKeyboardExtension().setActionMode(true);
		}
	};

	/*
	 * Handled keys:
	 * Shift, F2, F4, Shift+F10, Ctrl+A, Ctrl+Shift+A
	 */
	TableKeyboardDelegate.prototype.onkeydown = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();

		// Toggle the action mode by changing the focus between a data cell and its interactive controls.
		if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.F2)) {
			var bIsInActionMode = oKeyboardExtension.isInActionMode();
			oKeyboardExtension.setActionMode(!bIsInActionMode);
			return;

		// Expand/Collapse group.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.F4) &&
				   TableKeyboardDelegate._isElementGroupToggler(this, oEvent.target)) {
			TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target);
			return;
		}

		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		var $Target = jQuery(oEvent.target);
		var oCellInfo = TableUtils.getCellInfo($Target) || {};

		// Shift: Start the range selection mode.
		if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SHIFT) &&
			this.getSelectionMode() === SelectionMode.MultiToggle &&
			(oCellInfo.type === CellType.ROWHEADER && TableUtils.isRowSelectorSelectionAllowed(this) ||
				(oCellInfo.type === CellType.DATACELL || oCellInfo.type === CellType.ROWACTION) && TableUtils.isRowSelectionAllowed(this))) {

			var iFocusedRowIndex = TableUtils.getRowIndexOfFocusedCell(this);
			var iDataRowIndex = this.getRows()[iFocusedRowIndex].getIndex();

			/**
			 * Contains information that are used when the range selection mode is active.
			 * If this property is undefined the range selection mode is not active.
			 * @type {{startIndex: int, selected: boolean}}
			 * @property {int} startIndex The index of the data row in which the selection mode was activated.
			 * @property {boolean} selected True, if the data row in which the selection mode was activated is selected.
			 * @private
			 */
			this._oRangeSelection = {
				startIndex: iDataRowIndex,
				selected:   this.isIndexSelected(iDataRowIndex)
			};

		// Ctrl+A: Select/Deselect all.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.A, ModKey.CTRL)) {
			oEvent.preventDefault(); // To prevent full page text selection.

			if ((oCellInfo.type === CellType.DATACELL ||
				 oCellInfo.type === CellType.ROWHEADER ||
				 oCellInfo.type === CellType.ROWACTION ||
				 oCellInfo.type === CellType.COLUMNROWHEADER)
				&& this.getSelectionMode() === SelectionMode.MultiToggle) {

				this._toggleSelectAll();
			}

		// Ctrl+Shift+A: Deselect all.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.A, ModKey.CTRL + ModKey.SHIFT)) {
			if ((oCellInfo.type === CellType.DATACELL ||
				 oCellInfo.type === CellType.ROWHEADER ||
				 oCellInfo.type === CellType.ROWACTION ||
				 oCellInfo.type === CellType.COLUMNROWHEADER)) {

				this.clearSelection();
			}

		// F4: Enter the action mode.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.F4)) {
			if (oCellInfo.type === CellType.DATACELL) {
				oKeyboardExtension.setActionMode(true);
			}

		// F10: Open the context menu.
		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.F10, ModKey.SHIFT)) {
			oEvent.preventDefault(); // To prevent opening the default browser context menu.
			TableUtils.Menu.openContextMenu(this, oEvent.target, true);
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
		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (TableKeyboardDelegate._isKeyCombination(oEvent, "+")) {
			if (TableKeyboardDelegate._isElementGroupToggler(this, oEvent.target)) {
				TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target, true);

			} else if (oCellInfo.type === CellType.DATACELL ||
					   oCellInfo.type === CellType.ROWACTION) {
				oKeyboardExtension.setActionMode(true);
			}

		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, "-")) {
			if (TableKeyboardDelegate._isElementGroupToggler(this, oEvent.target)) {
				TableUtils.Grouping.toggleGroupHeaderByRef(this, oEvent.target, false);

			} else if (oCellInfo.type === CellType.DATACELL ||
					   oCellInfo.type === CellType.ROWACTION) {
				oKeyboardExtension.setActionMode(true);
			}
		}
	};

	TableKeyboardDelegate.prototype.oncontextmenu = function(oEvent) {
		if (oEvent.isMarked("handledByPointerExtension")) {
			return;
		}

		oEvent.preventDefault(); // To prevent opening the default browser context menu.

		var $Cell = TableUtils.getCell(this, oEvent.target);
		var oCellInfo = TableUtils.getCellInfo($Cell) || {};

		if (oCellInfo.type === CellType.COLUMNHEADER ||
			oCellInfo.type === CellType.DATACELL) {

			TableUtils.Menu.openContextMenu(this, oEvent.target, true);
		}
	};

	/*
	 * Handles keys:
	 * Shift, Space, Enter
	 */
	TableKeyboardDelegate.prototype.onkeyup = function(oEvent) {
		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		// End the range selection mode.
		if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SHIFT)) {
			delete this._oRangeSelection;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE)) {
			oEvent.preventDefault(); // To prevent the browser window to scroll down.

			// Open the column menu.
			if (oCellInfo.type === CellType.COLUMNHEADER) {
				TableUtils.Menu.openContextMenu(this, oEvent.target, true);
			} else {
				TableKeyboardDelegate._handleSpaceAndEnter(this, oEvent);
			}
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.ENTER)) {
			// Open the column menu.
			if (oCellInfo.type === CellType.COLUMNHEADER) {
				TableUtils.Menu.openContextMenu(this, oEvent.target, true);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsaptabnext = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};
		var $Cell, $DataCell;

		if (oKeyboardExtension.isInActionMode()) {
			$DataCell = TableUtils.getParentDataCell(this, oEvent.target);
			var $RowActionCell = TableUtils.getParentRowActionCell(this, oEvent.target);
			var iRowIndex;
			var bIsRowHeaderCell = false;

			if ($DataCell === null && $RowActionCell === null) {
				if (oCellInfo.type === CellType.ROWHEADER) {
					$Cell = jQuery(oEvent.target);
					iRowIndex = $Cell.data("sap-ui-rowindex");
					bIsRowHeaderCell = true;
				} else {
					return; // Not an interactive element, selector cell, or group row header cell.
				}
			} else if ($DataCell !== null) {
				// The target is an interactive element inside a data cell.
				$Cell = $DataCell;
				iRowIndex = TableUtils.getDataCellInfo(this, $DataCell).rowIndex;
			} else {
				// The target is an interactive element inside a row action cell.
				$Cell = $RowActionCell;
				iRowIndex = TableUtils.getRowActionCellInfo(this, $RowActionCell).rowIndex;
			}

			var oRow = this.getRows()[iRowIndex];
			var $LastInteractiveElement = TableKeyboardDelegate._getLastInteractiveElement(oRow);
			var bIsLastInteractiveElementInRow = $LastInteractiveElement === null || $LastInteractiveElement[0] === oEvent.target;

			if (bIsLastInteractiveElementInRow) {
				var iAbsoluteRowIndex = oRow.getIndex();
				var bIsLastScrollableRow = TableUtils.isLastScrollableRow(this, $Cell);
				var bIsAbsoluteLastRow = this._getRowCount() - 1 === iAbsoluteRowIndex;
				var bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(this);
				var bScrolled = false;

				if (!bIsAbsoluteLastRow && bIsLastScrollableRow) {
					bScrolled = this._getScrollExtension().scroll(true, null, true);
				}

				if (bIsAbsoluteLastRow) {
					oEvent.preventDefault();
					oKeyboardExtension.setActionMode(false);

				} else if (bScrolled) {
					oEvent.preventDefault();

					this.attachEventOnce("_rowsUpdated", function() {
						setTimeout(function() {
							var bScrolledRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oRow.getDomRef());

							if (bTableHasRowSelectors || bScrolledRowIsGroupHeaderRow) {
								TableKeyboardDelegate._focusRowSelector(this, iRowIndex);
							} else {
								TableKeyboardDelegate._getFirstInteractiveElement(oRow).focus();
							}
						}.bind(this), 0);
					}.bind(this));

				} else { // Not absolute last row and not scrolled.
					oEvent.preventDefault();

					var iNextRowIndex = iRowIndex + 1;
					var oNextRow = this.getRows()[iNextRowIndex];
					var bNextRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oNextRow.getDomRef());

					if (bTableHasRowSelectors || bNextRowIsGroupHeaderRow) {
						TableKeyboardDelegate._focusRowSelector(this, iNextRowIndex);
					} else {
						TableKeyboardDelegate._getFirstInteractiveElement(oNextRow).focus();
					}
				}

			} else if (bIsRowHeaderCell) {
				oEvent.preventDefault();
				TableKeyboardDelegate._getFirstInteractiveElement(oRow).focus();

			} else {
				oEvent.preventDefault();
				TableKeyboardDelegate._getNextInteractiveElement(this, oEvent.target).focus();
			}

		} else if (oCellInfo.type === CellType.COLUMNHEADER ||
				   oCellInfo.type === CellType.COLUMNROWHEADER) {

			if (TableUtils.isNoDataVisible(this)) {
				this.$("noDataCnt").focus();
			} else {
				TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell(this, oEvent);
			}

			oEvent.preventDefault();

		} else if (oCellInfo.type === CellType.DATACELL ||
				   oCellInfo.type === CellType.ROWHEADER) {
			TableKeyboardDelegate._forwardFocusToTabDummy(this, "sapUiTableCtrlAfter");

		} else if (oEvent.target === this.getDomRef("overlay")) {
			oKeyboardExtension._setSilentFocus(this.$().find(".sapUiTableOuterAfter"));

		} else if (Object.keys(oCellInfo).length === 0) {
			$DataCell = TableUtils.getParentDataCell(this, oEvent.target);
			if ($DataCell !== null) {
				// The target is a non-interactive element inside a data cell. We are not in action mode, so focus the cell.
				oEvent.preventDefault();
				$DataCell.focus();
			}
		}
	};

	TableKeyboardDelegate.prototype.onsaptabprevious = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();
		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};
		var $Cell, $DataCell;

		if (oKeyboardExtension.isInActionMode()) {
			$DataCell = TableUtils.getParentDataCell(this, oEvent.target);
			var $RowActionCell = TableUtils.getParentRowActionCell(this, oEvent.target);
			var iRowIndex;
			var bIsRowHeaderCell = false;

			if ($DataCell === null && $RowActionCell === null) {
				if (oCellInfo.type === CellType.ROWHEADER) {
					$Cell = jQuery(oEvent.target);
					iRowIndex = $Cell.data("sap-ui-rowindex");
					bIsRowHeaderCell = true;
				} else {
					return; // Not an interactive element, selector cell, or group row header cell.
				}
			} else if ($DataCell !== null) {
				// The target is an interactive element inside a data cell.
				$Cell = $DataCell;
				iRowIndex = TableUtils.getDataCellInfo(this, $DataCell).rowIndex;
			} else {
				// The target is an interactive element inside a row action cell.
				$Cell = $RowActionCell;
				iRowIndex = TableUtils.getRowActionCellInfo(this, $RowActionCell).rowIndex;
			}

			var oRow = this.getRows()[iRowIndex];
			var iAbsoluteRowIndex = oRow.getIndex();
			var $FirstInteractiveElement = TableKeyboardDelegate._getFirstInteractiveElement(oRow);
			var bIsFirstInteractiveElementInRow = $FirstInteractiveElement !== null && $FirstInteractiveElement[0] === oEvent.target;
			var bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(this);
			var bRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oRow);
			var bRowHasInteractiveRowHeader = bTableHasRowSelectors || bRowIsGroupHeaderRow;

			if (bIsFirstInteractiveElementInRow && bRowHasInteractiveRowHeader) {
				oEvent.preventDefault();
				TableKeyboardDelegate._focusRowSelector(this, iRowIndex);

			} else if ((bIsFirstInteractiveElementInRow && !bRowHasInteractiveRowHeader) || bIsRowHeaderCell) {
				var bIsFirstScrollableRow = TableUtils.isFirstScrollableRow(this, $Cell);
				var bIsAbsoluteFirstRow = iAbsoluteRowIndex === 0;
				var bScrolled = false;

				if (!bIsAbsoluteFirstRow && bIsFirstScrollableRow) {
					bScrolled = this._getScrollExtension().scroll(false, null, true);
				}

				if (bIsAbsoluteFirstRow) {
					oEvent.preventDefault();
					oKeyboardExtension.setActionMode(false);

				} else if (bScrolled) {
					oEvent.preventDefault();

					this.attachEventOnce("_rowsUpdated", function() {
						setTimeout(function() {
							var bScrolledRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oRow.getDomRef());

							if (bScrolledRowIsGroupHeaderRow) {
								TableKeyboardDelegate._focusRowSelector(this, iRowIndex);
							} else {
								TableKeyboardDelegate._getLastInteractiveElement(oRow).focus();
							}
						}.bind(this), 0);
					}.bind(this));

				} else { // Not absolute first row and not scrolled.
					oEvent.preventDefault();

					var iPreviousRowIndex = iRowIndex - 1;
					var oPreviousRow = this.getRows()[iPreviousRowIndex];
					var bPreviousRowIsGroupHeaderRow = TableUtils.Grouping.isGroupingRow(oPreviousRow.getDomRef());

					if (bPreviousRowIsGroupHeaderRow) {
						TableKeyboardDelegate._focusRowSelector(this, iPreviousRowIndex);
					} else {
						TableKeyboardDelegate._getLastInteractiveElement(oPreviousRow).focus();
					}
				}

			} else {
				oEvent.preventDefault();
				TableKeyboardDelegate._getPreviousInteractiveElement(this, oEvent.target).focus();
			}

		} else if (oCellInfo.type === CellType.DATACELL ||
				   oCellInfo.type === CellType.ROWHEADER ||
				   oEvent.target === this.getDomRef("noDataCnt")) {

			if (this.getColumnHeaderVisible()) {
				TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell(this, oEvent);
				oEvent.preventDefault();
			} else {
				TableKeyboardDelegate._forwardFocusToTabDummy(this, "sapUiTableCtrlBefore");
			}

		} else if (oEvent.target === this.getDomRef("overlay")) {
			this._getKeyboardExtension()._setSilentFocus(this.$().find(".sapUiTableOuterBefore"));

		} else if (Object.keys(oCellInfo).length === 0) {
			$DataCell = TableUtils.getParentDataCell(this, oEvent.target);
			if ($DataCell !== null) {
				// The target is a non-interactive element inside a data cell. We are not in action mode, so focus the cell.
				oEvent.preventDefault();
				$DataCell.focus();
			}
		}
	};

	//
	// Helper functions for arrow key navigation
	//

	/**
	 * Get extended information about the parent table cell of a DOM element and its row and column indexes.
	 * @param {sap.ui.table.Table} oTable The table control.
	 * @param {Object} oElement The DOM element.
	 * @returns {Object} Extended cell information.
	 */
	function getCellInfoEx(oTable, oElement) {
		var $cell = TableUtils.getCell(oTable, oElement);
		if (!$cell) {
			return {};
		}

		var cellInfo = TableUtils.getCellInfo($cell[0]) || {};
		var oDataCellInfo;

		if (cellInfo.type === CellType.ROWHEADER ||
			cellInfo.type === CellType.ROWACTION) {
			cellInfo.row = parseInt($cell.data("sap-ui-rowindex"), 10);
		} else if (cellInfo.type === CellType.DATACELL) {
			oDataCellInfo = TableUtils.getDataCellInfo(oTable, $cell);
			cellInfo.row = oDataCellInfo.rowIndex;
			cellInfo.col = oDataCellInfo.columnIndex;
		} else if (cellInfo.type === CellType.COLUMNHEADER) {
			cellInfo.col = parseInt($cell.data("sap-ui-colindex"), 10);
			cellInfo.span = parseInt($cell.attr("colspan") || 1, 10);
		}
		return cellInfo;
	}

	/**
	 * Focus the first interactive element in a table cell or the cell itself.
	 * If there are no active elements, the cell is focused instead.
	 * @param {sap.ui.table.Table} oTable The table control
	 * @param {int} iRow Row index
	 * @param {int} iCol Column index for data cells
	 * @param {sap.ui.table.TableUtils.CELLTYPES} sCellType Cell type
	 * @param {boolean} bActive if true, focus the first interactive element in a data cell
	 */
	function focusTableCell(oTable, iRow, iCol, sCellType, bActive) {
		var $cell;
		function focusCell() {
			var cell = $cell && $cell[0];
			if (cell) {
				var interactiveElement = (bActive ? TableKeyboardDelegate._getInteractiveElements(cell) || [] : [])[0];
				var keyboardExtension = oTable._getKeyboardExtension();
				// skip additional focus handling in KeyboardExtension:
				keyboardExtension._actionMode = !!interactiveElement;
				keyboardExtension._setSilentFocus(interactiveElement || cell);
			}
		}
		if (sCellType === CellType.ROWHEADER) {
			oTable.$().find('.sapUiTableRowHdr[data-sap-ui-rowindex="' + iRow + '"]').focus();
		} else if (sCellType === CellType.ROWACTION) {
			$cell = oTable.$().find('.sapUiTableRowAction[data-sap-ui-rowindex="' + iRow + '"]');
			focusCell();
		} else if (sCellType === CellType.DATACELL) {
			var oCol =  oTable.getColumns()[iCol];
			$cell = oCol ? oTable.$().find('[data-sap-ui-rowindex="' + iRow + '"] [data-sap-ui-colid="' + oCol.getId() + '"]') : null;
			focusCell();
		}
	}

	function preventItemNavigation(oEvent, bPrevent) {
		oEvent.setMarked("sapUiTableSkipItemNavigation", bPrevent !== false);
	}

	TableKeyboardDelegate.prototype.onsapdown = function(oEvent) {

		if (oEvent.isMarked()) {
			return; // Do not interfere with embedded controls that react on the down key
		}

		var oKeyboardExtension = this._getKeyboardExtension();
		var bInActionMode = oKeyboardExtension.isInActionMode();
		var oCellInfo = getCellInfoEx(this, oEvent.target);
		var bScrolled = false;
		var oTable = this;

		// go into the action mode if the Ctrl key is pressed or if action mode is active
		var bFocusActive = TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL) || bInActionMode;

		if (oCellInfo.type === CellType.DATACELL ||
			oCellInfo.type === CellType.ROWHEADER ||
			oCellInfo.type === CellType.ROWACTION) {

			preventItemNavigation(oEvent);

			// Scroll down if needed
			if (TableUtils.isLastScrollableRow(this, oCellInfo.cell[0])) {
				bScrolled = this._getScrollExtension().scroll(true, false, true);
			}
			if (bScrolled) {
				if (bFocusActive) {
					// Focus the first interactive element in the new table cell, if any
					this.attachEventOnce("_rowsUpdated", function() {
						setTimeout(function() {
							focusTableCell(oTable, oCellInfo.row, oCellInfo.col, oCellInfo.type, true);
						}, 0);
					});
				}
			} else {
				if (oCellInfo.row === oTable.getVisibleRowCount() - 1) {
					oKeyboardExtension.setActionMode(false); // go out of the action mode on the bottom row
				} else {
					focusTableCell(oTable, oCellInfo.row + 1, oCellInfo.col, oCellInfo.type, bFocusActive);
				}
			}
		} else if (oCellInfo.type === CellType.COLUMNHEADER ||
				   oCellInfo.type === CellType.COLUMNROWHEADER) {

			var iHeaderRowCount = TableUtils.getHeaderRowCount(this);

			if (TableUtils.isNoDataVisible(this)) {
				var oFocusInfo = TableUtils.getFocusedItemInfo(this);
				if (oFocusInfo.row - iHeaderRowCount <= 1) { // We are in the last column header row
					//Just prevent the navigation to the table content
					preventItemNavigation(oEvent);
				}

			} else if (oCellInfo.type === CellType.COLUMNROWHEADER && iHeaderRowCount > 1) {
				// Special logic needed because if the column header has multiple rows,
				// for the SelectAll cell multiple elements are added to the item navigation.
				preventItemNavigation(oEvent);
				// Focus the first row header.
				TableUtils.focusItem(this, iHeaderRowCount * (TableUtils.getVisibleColumnCount(this) + 1/*Row Headers*/), oEvent);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsapdownmodifiers = function(oEvent) {

		// Ctrl + down -> implemented in the onsapdown handler
		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			return TableKeyboardDelegate.prototype.onsapdown.call(this, oEvent);
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

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			oEvent.preventDefault(); // To avoid text selection flickering.

			/* Range Selection */

			if (oCellInfo.type === CellType.ROWHEADER ||
				oCellInfo.type === CellType.DATACELL ||
				oCellInfo.type === CellType.ROWACTION) {

				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
					return;
				}

				var iFocusedRowIndex = TableUtils.getRowIndexOfFocusedCell(this);
				var iDataRowIndex = this.getRows()[iFocusedRowIndex].getIndex();

				// If we are in the last data row of the table we don't need to do anything.
				if (iDataRowIndex === this._getRowCount() - 1) {
					return;
				}

				if (TableUtils.isLastScrollableRow(this, oEvent.target)) {
					var bScrolled = this._getScrollExtension().scroll(true, false, true);
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
			if (oCellInfo.type === CellType.DATACELL) {
				oKeyboardExtension.setActionMode(true);
			}
			preventItemNavigation(oEvent);
		}
	};

	TableKeyboardDelegate.prototype.onsapup = function(oEvent) {

		if (oEvent.isMarked()) {
			return; // Do not interfere with embedded controls that react on the up key
		}

		var oKeyboardExtension = this._getKeyboardExtension();
		var bInActionMode = oKeyboardExtension.isInActionMode();
		var oCellInfo = getCellInfoEx(this, oEvent.target);
		var bScrolled = false;
		var oTable = this;

		// go into the action mode if the Ctrl key is pressed or if action mode is active
		var bFocusActive = TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL) || bInActionMode;

		if (oCellInfo.type === CellType.DATACELL ||
			oCellInfo.type === CellType.ROWHEADER ||
			oCellInfo.type === CellType.ROWACTION) {

			preventItemNavigation(oEvent); // default action, see one exception below

			if (TableUtils.isFirstScrollableRow(this, oCellInfo.cell[0])) {
				bScrolled = this._getScrollExtension().scroll(false, false, true);
			}
			if (bScrolled) {
				if (bFocusActive) {
					this.attachEventOnce("_rowsUpdated", function() {
						setTimeout(function() {
							focusTableCell(oTable, oCellInfo.row, oCellInfo.col, oCellInfo.type, true);
						}, 0);
					});
				}
			} else if (oCellInfo.row === 0) {
				// exit active mode; in case of the navigation mode, go to column header cells but not from row actions
				oKeyboardExtension.setActionMode(false);
				preventItemNavigation(oEvent, !!bFocusActive || oCellInfo.type === CellType.ROWACTION);
			} else { // focus the data cell above the current one
				focusTableCell(oTable, oCellInfo.row - 1, oCellInfo.col, oCellInfo.type, bFocusActive);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsapupmodifiers = function(oEvent) {
		var oKeyboardExtension = this._getKeyboardExtension();

		// Ctrl + up -> implemented in the onsapup handler
		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {
			return TableKeyboardDelegate.prototype.onsapup.call(this, oEvent);
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

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			oEvent.preventDefault(); // To avoid text selection flickering.

			/* Range Selection */

			if (oCellInfo.type === CellType.ROWHEADER ||
				oCellInfo.type === CellType.DATACELL ||
				oCellInfo.type === CellType.ROWACTION) {

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
					var bScrolled = this._getScrollExtension().scroll(false, false, true);
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
			if (oCellInfo.type === CellType.DATACELL) {
				oKeyboardExtension.setActionMode(true);
			}
			preventItemNavigation(oEvent);
		}
	};

	TableKeyboardDelegate.prototype.onsapleft = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		var bIsRTL = sap.ui.getCore().getConfiguration().getRTL();
		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === CellType.COLUMNHEADER && bIsRTL) {
			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedColumn = oFocusedItemInfo.cellInRow - (TableUtils.hasRowHeader(this) ? 1 : 0);
			var iColumnCount = TableUtils.getVisibleColumnCount(this);

			if (TableUtils.hasRowActions(this) && iFocusedColumn === iColumnCount - 1) {
				// Do not navigate to the row actions column header cell.
				preventItemNavigation(oEvent);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsapleftmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};
		var bIsRTL = sap.ui.getCore().getConfiguration().getRTL();

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			oEvent.preventDefault(); // To avoid text selection flickering.

			/* Range Selection */

			if (oCellInfo.type === CellType.DATACELL) {
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

			} else if (oCellInfo.type === CellType.ROWACTION) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
				}

			/* Range Selection: Required for RTL mode. */

			} else if (oCellInfo.type === CellType.ROWHEADER && bIsRTL) {
				// If selection on rows is not possible, then do not allow to move focus to them when performing a range selection.
				if (!TableUtils.isRowSelectionAllowed(this)) {
					preventItemNavigation(oEvent);
				}

			} else if (oCellInfo.type === CellType.COLUMNROWHEADER && bIsRTL) {
				preventItemNavigation(oEvent);

			/* Column Resizing */

			} else if (oCellInfo.type === CellType.COLUMNHEADER) {
				var iResizeDelta = -this._CSSSizeToPixel(COLUMN_RESIZE_STEP_CSS_SIZE);
				if (bIsRTL) {
					iResizeDelta = iResizeDelta * -1;
				}

				var oColumnHeaderInfo = TableUtils.getColumnHeaderCellInfo(oEvent.target);
				var iColumnSpanWidth = 0;

				for (var i = oColumnHeaderInfo.index; i < oColumnHeaderInfo.index + oColumnHeaderInfo.span; i++) {
					iColumnSpanWidth += TableUtils.Column.getColumnWidth(this, i);
				}

				TableUtils.Column.resizeColumn(this, oColumnHeaderInfo.index, iColumnSpanWidth + iResizeDelta, true, oColumnHeaderInfo.span);

				preventItemNavigation(oEvent);
			}

		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {

			/* Column Reordering */

			if (oCellInfo.type === CellType.COLUMNHEADER) {
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();

				var iColumnIndex = TableUtils.getColumnHeaderCellInfo(oEvent.target).index;
				var oColumn = this.getColumns()[iColumnIndex];
				TableKeyboardDelegate._moveColumn(oColumn, bIsRTL);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsaprightmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};
		var bIsRTL = sap.ui.getCore().getConfiguration().getRTL();

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.SHIFT)) {
			oEvent.preventDefault(); // To avoid text selection flickering.

			/* Range Selection */

			if (oCellInfo.type === CellType.DATACELL) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
				}

			} else if (oCellInfo.type === CellType.ROWHEADER) {
				// If selection on data cells is not possible, then do not allow to move focus to them when performing a range selection.
				if (!TableUtils.isRowSelectionAllowed(this)) {
					preventItemNavigation(oEvent);
				}

			/* Range Selection: Required for RTL mode. */

			} else if (oCellInfo.type === CellType.ROWACTION && bIsRTL) {
				// Navigation should not be possible if we are not in range selection mode.
				if (!this._oRangeSelection) {
					preventItemNavigation(oEvent);
				}

			/* Column Resizing */

			} else if (oCellInfo.type === CellType.COLUMNHEADER) {
				var iResizeDelta = this._CSSSizeToPixel(COLUMN_RESIZE_STEP_CSS_SIZE);
				if (bIsRTL) {
					iResizeDelta = iResizeDelta * -1;
				}

				var oColumnHeaderInfo = TableUtils.getColumnHeaderCellInfo(oEvent.target);
				var iColumnSpanWidth = 0;

				for (var i = oColumnHeaderInfo.index; i < oColumnHeaderInfo.index + oColumnHeaderInfo.span; i++) {
					iColumnSpanWidth += TableUtils.Column.getColumnWidth(this, i);
				}

				TableUtils.Column.resizeColumn(this, oColumnHeaderInfo.index, iColumnSpanWidth + iResizeDelta, true, oColumnHeaderInfo.span);

				preventItemNavigation(oEvent);

			} else if (oCellInfo.type === CellType.COLUMNROWHEADER) {
				preventItemNavigation(oEvent);
			}

		} else if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.CTRL)) {

			/* Column Reordering */

			if (oCellInfo.type === CellType.COLUMNHEADER) {
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();

				var iColumnIndex = TableUtils.getColumnHeaderCellInfo(oEvent.target).index;
				var oColumn = this.getColumns()[iColumnIndex];
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
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === CellType.DATACELL ||
			oCellInfo.type === CellType.ROWACTION ||
			oCellInfo.type === CellType.COLUMNHEADER) {

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedIndex = oFocusedItemInfo.cell;
			var iFocusedCellInRow = oFocusedItemInfo.cellInRow;

			var bHasRowHeader = TableUtils.hasRowHeader(this);
			var iRowHeaderOffset = bHasRowHeader ? 1 : 0;

			if (TableUtils.hasFixedColumns(this) && iFocusedCellInRow > this.getFixedColumnCount() + iRowHeaderOffset) {
				// If there is a fixed column area and the focus is to the right of the first cell in the non-fixed area,
				// then set the focus to the first cell in the non-fixed area.
				preventItemNavigation(oEvent);
				TableUtils.focusItem(this, iFocusedIndex - iFocusedCellInRow + this.getFixedColumnCount() + iRowHeaderOffset, null);

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
			preventItemNavigation(oEvent);
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === CellType.DATACELL ||
			oCellInfo.type === CellType.ROWHEADER ||
			oCellInfo.type === CellType.ROWACTION ||
			oCellInfo.type === CellType.COLUMNHEADER ||
			oCellInfo.type === CellType.COLUMNROWHEADER) {

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedIndex = oFocusedItemInfo.cell;
			var iColumnCount = oFocusedItemInfo.columnCount;
			var iFocusedCellInRow = oFocusedItemInfo.cellInRow;

			var bHasRowHeader = TableUtils.hasRowHeader(this);
			var iRowHeaderOffset = bHasRowHeader ? 1 : 0;
			var bIsColSpanAtFixedAreaEnd = false;

			// If the focused cell is a column span in the column header at the end of the fixed area,
			// the selected cell index is the index of the first cell in the span.
			// Treat this case like there is no span and the last cell of the fixed area is selected.
			if (oCellInfo.type === CellType.COLUMNHEADER && TableUtils.hasFixedColumns(this)) {
				var iColSpan = parseInt(oCellInfo.cell.attr("colspan") || 1, 10);
				if (iColSpan > 1 && iFocusedCellInRow + iColSpan - iRowHeaderOffset === this.getFixedColumnCount()) {
					bIsColSpanAtFixedAreaEnd = true;
				}
			}

			if (bHasRowHeader && iFocusedCellInRow === 0) {
				// If there is a row header and it has the focus,
				// then set the focus to the cell in the next column.
				preventItemNavigation(oEvent);
				TableUtils.focusItem(this, iFocusedIndex + 1, null);

			} else if (TableUtils.hasFixedColumns(this) &&
					   iFocusedCellInRow < this.getFixedColumnCount() - 1 + iRowHeaderOffset && !bIsColSpanAtFixedAreaEnd) {
				// If there is a fixed column area and the focus is not on its last cell or column span,
				// then set the focus to the last cell of the fixed column area.
				preventItemNavigation(oEvent);
				TableUtils.focusItem(this, iFocusedIndex + this.getFixedColumnCount() - iFocusedCellInRow, null);

			} else if (TableUtils.hasRowActions(this) && oCellInfo.type === CellType.DATACELL && iFocusedCellInRow < iColumnCount - 2) {
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
			oEvent.preventDefault(); // To prevent the browser page from scrolling to the top.
			var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

			if (oCellInfo.type === CellType.DATACELL ||
				oCellInfo.type === CellType.ROWHEADER ||
				oCellInfo.type === CellType.ROWACTION ||
				oCellInfo.type === CellType.COLUMNHEADER) {

				preventItemNavigation(oEvent);

				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var iFocusedRow = oFocusedItemInfo.row;

				// Only do something if the focus is not in the first row already.
				if (iFocusedRow > 0) {
					var iFocusedIndex = oFocusedItemInfo.cell;
					var iColumnCount = oFocusedItemInfo.columnCount;
					var iHeaderRowCount = TableUtils.getHeaderRowCount(this);

					/* Column header area */
					/* Top fixed area */
					if (iFocusedRow < iHeaderRowCount + this.getFixedRowCount()) {
						if (oCellInfo.type === CellType.ROWACTION) {
							// Set the focus to the first row (row actions do not have a header).
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);
						} else {
							// In case a column header exists, set the focus to the first row of the column header,
							// otherwise set the focus to the first row of the top fixed area.
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iFocusedRow, oEvent);
						}

					/* Scrollable area */
					} else if (iFocusedRow >= iHeaderRowCount + this.getFixedRowCount() &&
							   iFocusedRow < iHeaderRowCount + TableUtils.getNonEmptyVisibleRowCount(this) - this.getFixedBottomRowCount()) {
						this._getScrollExtension().scrollMax(false, true);
						// If a fixed top area exists or we are in the row action column (has no header),
						// then set the focus to the first row (of the top fixed area), otherwise set the focus to the first row of the column header area.
						if (this.getFixedRowCount() > 0 || oCellInfo.type === CellType.ROWACTION) {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);
						} else {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iFocusedRow, oEvent);
						}

					/* Bottom fixed area */
					} else {
						// Set the focus to the first row of the scrollable area and scroll to top.
						this._getScrollExtension().scrollMax(false, true);
						TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - this.getFixedRowCount()), oEvent);
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
			oEvent.preventDefault(); // To prevent the browser page from scrolling to the bottom.
			var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

			if (oCellInfo.type === CellType.DATACELL ||
				oCellInfo.type === CellType.ROWHEADER ||
				oCellInfo.type === CellType.ROWACTION ||
				oCellInfo.type === CellType.COLUMNHEADER ||
				oCellInfo.type === CellType.COLUMNROWHEADER) {

				preventItemNavigation(oEvent);

				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var iFocusedRow = oFocusedItemInfo.row;
				var iHeaderRowCount = TableUtils.getHeaderRowCount(this);
				var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(this);

				// Only do something if the focus is above the last row of the fixed bottom area
				// or above the last row of the column header area when NoData is visible.
				if (this.getFixedBottomRowCount() === 0 ||
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
						if (this.getFixedRowCount() > 0) {
							TableUtils.focusItem(this, iFocusedIndex
								+ iColumnCount * (iHeaderRowCount + this.getFixedRowCount() - iFocusedRow - 1), oEvent);
						} else {
							this._getScrollExtension().scrollMax(true, true);
							TableUtils.focusItem(this, iFocusedIndex
								+ iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - iFocusedRow - 1), oEvent);
						}

					/* Top fixed area */
					} else if (iFocusedRow >= iHeaderRowCount &&
							   iFocusedRow < iHeaderRowCount + this.getFixedRowCount()) {
						// Set the focus to the last row of the scrollable area and scroll to bottom.
						this._getScrollExtension().scrollMax(true, true);
						TableUtils.focusItem(this, iFocusedIndex
							+ iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - iFocusedRow - 1), oEvent);

					/* Scrollable area */
					} else if (iFocusedRow >= iHeaderRowCount + this.getFixedRowCount() &&
							   iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount()) {
						// Set the focus to the last row of the scrollable area and scroll to bottom.
						this._getScrollExtension().scrollMax(true, true);
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
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === CellType.DATACELL ||
			oCellInfo.type === CellType.ROWHEADER ||
			oCellInfo.type === CellType.ROWACTION ||
			oCellInfo.type === CellType.COLUMNHEADER) {

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedRow = oFocusedItemInfo.row;
			var iHeaderRowCount = TableUtils.getHeaderRowCount(this);

			// Only do something if the focus is not in the column header area or the first row of the top fixed area.
			if (this.getFixedRowCount() === 0 && iFocusedRow >= iHeaderRowCount || this.getFixedRowCount() > 0 && iFocusedRow > iHeaderRowCount) {
				preventItemNavigation(oEvent);

				var iFocusedIndex = oFocusedItemInfo.cell;
				var iColumnCount = oFocusedItemInfo.columnCount;

				/* Top fixed area - From second row downwards */
				if (iFocusedRow < iHeaderRowCount + this.getFixedRowCount()) {
					// Set the focus to the first row of the top fixed area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);

				/* Scrollable area - First row */
				} else if (iFocusedRow === iHeaderRowCount + this.getFixedRowCount()) {
					var iPageSize = TableUtils.getNonEmptyVisibleRowCount(this) - this.getFixedRowCount() - this.getFixedBottomRowCount();
					var iRowsToBeScrolled = this.getFirstVisibleRow();

					this._getScrollExtension().scroll(false, true, true); // Scroll up one page

					// Only change the focus if scrolling was not performed over a full page, or not at all.
					if (iRowsToBeScrolled < iPageSize) {
						// If a fixed top area exists or we are in the row action column (has no header),
						// then set the focus to the first row (of the top fixed area), otherwise set the focus to the first row of the column header area.
						if (this.getFixedRowCount() > 0 || oCellInfo.type === CellType.ROWACTION) {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount), oEvent);
						} else {
							TableUtils.focusItem(this, iFocusedIndex - iColumnCount * iHeaderRowCount, oEvent);
						}
					}

				/* Scrollable area - From second row downwards */
				/* Bottom Fixed area */
				} else if (iFocusedRow > iHeaderRowCount + this.getFixedRowCount() &&
						   iFocusedRow < iHeaderRowCount + TableUtils.getNonEmptyVisibleRowCount(this)) {
					// Set the focus to the first row of the scrollable area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - this.getFixedRowCount()), oEvent);

				/* Empty area */
				} else {
					// Set the focus to the last row of the scrollable area.
					TableUtils.focusItem(this, iFocusedIndex - iColumnCount * (iFocusedRow - iHeaderRowCount - TableUtils.getNonEmptyVisibleRowCount(this) + 1), oEvent);
				}
			}

			// If the focus is in the first row of the row action area, do nothing (row actions do not have a column header).
			if (oCellInfo.type === CellType.ROWACTION && iFocusedRow === iHeaderRowCount && this.getFixedRowCount() > 0) {
				preventItemNavigation(oEvent);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsappagedown = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oCellInfo.type === CellType.DATACELL ||
			oCellInfo.type === CellType.ROWHEADER ||
			oCellInfo.type === CellType.COLUMNHEADER ||
			oCellInfo.type === CellType.ROWACTION ||
			oCellInfo.type === CellType.COLUMNROWHEADER) {

			preventItemNavigation(oEvent);

			var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
			var iFocusedRow = oFocusedItemInfo.row;
			var iHeaderRowCount = TableUtils.getHeaderRowCount(this);
			var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(this);

			// Only do something if the focus is above the last row of the bottom fixed area
			// or above the last row of the column header area when NoData is visible.
			if ((TableUtils.isNoDataVisible(this) && iFocusedRow < iHeaderRowCount - 1) ||
				this.getFixedBottomRowCount() === 0 ||
				iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - 1) {

				var iFocusedIndex = oFocusedItemInfo.cell;
				var iColumnCount = oFocusedItemInfo.columnCount;

				/* Column header area - From second-last row upwards */
				if (iFocusedRow < iHeaderRowCount - 1 && oCellInfo.type !== CellType.COLUMNROWHEADER) {
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
						   iFocusedRow < iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - 1) {
					// Set the focus to the last row of the scrollable area.
					TableUtils.focusItem(this, iFocusedIndex
						+ iColumnCount * (iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - iFocusedRow - 1), oEvent);

				/* Scrollable area - Last row */
				} else if (iFocusedRow === iHeaderRowCount + iNonEmptyVisibleRowCount - this.getFixedBottomRowCount() - 1) {
					var iPageSize = TableUtils.getNonEmptyVisibleRowCount(this) - this.getFixedRowCount() - this.getFixedBottomRowCount();
					var iRowsToBeScrolled = this._getRowCount() - this.getFixedBottomRowCount() - this.getFirstVisibleRow() - iPageSize * 2;

					this._getScrollExtension().scroll(true, true, true); // Scroll down one page

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

	TableKeyboardDelegate.prototype.onsappageupmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

			if (oCellInfo.type === CellType.DATACELL ||
				oCellInfo.type === CellType.COLUMNHEADER) {

				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
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

			} else if (oCellInfo.type === CellType.ROWACTION) {
				// If the focus is on a row action cell, then set the focus to the last data cell in the same row.
				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				TableUtils.focusItem(this, oFocusedItemInfo.cell - 1, null);
			}
		}
	};

	TableKeyboardDelegate.prototype.onsappagedownmodifiers = function(oEvent) {
		if (this._getKeyboardExtension().isInActionMode()) {
			return;
		}

		if (TableKeyboardDelegate._isKeyCombination(oEvent, null, ModKey.ALT)) {
			var oCellInfo = TableUtils.getCellInfo(oEvent.target) || {};

			if (oCellInfo.type === CellType.DATACELL ||
				oCellInfo.type === CellType.ROWHEADER ||
				oCellInfo.type === CellType.COLUMNHEADER ||
				oCellInfo.type === CellType.COLUMNROWHEADER) {

				var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
				var iFocusedCellInRow = oFocusedItemInfo.cellInRow;

				var bHasRowHeader = TableUtils.hasRowHeader(this);
				var iRowHeaderOffset = bHasRowHeader ? 1 : 0;
				var iVisibleColumnCount = TableUtils.getVisibleColumnCount(this);
				var iColSpan = parseInt(oCellInfo.cell.attr("colspan") || 1, 10);

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

				} else if (oCellInfo.type === CellType.DATACELL && TableUtils.hasRowActions(this) && iFocusedCellInRow == oFocusedItemInfo.columnCount - 2) {
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