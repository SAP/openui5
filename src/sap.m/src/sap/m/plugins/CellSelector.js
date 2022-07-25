/*!
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log"
], function (PluginBase, KeyCodes, Core, jQuery, Log) {
	"use strict";

	var SELECTION_DIRECTION = {
		NEXT: 1,
		PREVIOUS: 2
	};

	var CSS_CLASS = "sapMPluginsCellSelector";

	/**
	 * Constructor for a new CellSelector plugin.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * The CellSelector plugins enables cell selection inside the table, when added as a dependent to the control.
	 * It allows the user to individually select a cell block.
	 *
	 * Keyboard Usage:
	 * - SPACE: Select the currently focused cell.
	 * - SHIFT + ARROW_KEYS: Expands/shrink the current cell selection block into the specified direction by one row/column.
	 * - SHIFT + SPACE: Enahnces the current cell selection block to cover the whole row.
	 * - CTRL + SPACE: Enhances the current cell selection block to cover the whole column.
	 * - SHIFT + HOME: Enhances the current cell selection block to the begin of the covered rows.
	 * - SHIFT + END: Enhances the current cell selection block to the end of the covered rows.
	 * - CTRL + SHIFT + A: Clears the selection.
	 *
	 * @extends sap.m.plugins.PluginBase
	 * @class
	 * @version ${version}
	 * @author SAP SE
	 *
	 * @private
	 * @alias sap.m.plugins.CellSelector
	 */
	var CellSelector = PluginBase.extend("sap.m.plugins.CellSelector", {
		metadata: {
			library: "sap.m",
			properties: {},
			events: {}
		}
	});

	CellSelector.prototype.onActivate = function (oControl) {
		oControl.addDelegate(this, true, this);
		this._oSession = {};
		this._oSession.oCanvas = {};

		var sScrollEvent = this.getConfig("scrollEvent");
		sScrollEvent && oControl.attachEvent(sScrollEvent, this._handleScroll, this);
	};

	CellSelector.prototype.onDeactivate = function (oControl) {
		oControl.removeDelegate(this, this);
		this._oSession = {};
		this._oSession.oCanvas = {};

		var sScrollEvent = this.getConfig("scrollEvent");
		sScrollEvent && oControl.detachEvent(sScrollEvent, this._handleScroll, this);
	};

	/**
	 * Retrieve the cells for the current selection.
	 *
	 * Note: This method is subject to change.
	 * @returns {Object} contains the selected cells in each selected row
	 * @private
	 * @experimental Since 1.104
	 */
	CellSelector.prototype.getSelectedCells = function () {
		if (!this._bSelecting) {
			return {};
		}
		var oNormalizedBounds = getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);

		var oSelection = {};
		for (var iRow = oNormalizedBounds.from.rowIndex; iRow < oNormalizedBounds.to.rowIndex; iRow++) {
			var oRowContext = this.getConfig("contextByIndex", this.getControl(), iRow), aColumns = [];
			for (var iCol = oNormalizedBounds.from.colIndex; iCol < oNormalizedBounds.to.colIndex; iCol++) {
				var oColumn = this.getConfig("columnByIndex", this.getControl(), iCol);
				if (oColumn) {
					aColumns.push(iCol);
				}
			}
			oSelection[iRow] = {
				rowContext: oRowContext,
				columnIndices: aColumns
			};
		}
		return oSelection;
	};

	CellSelector.prototype.onsapspace = function (oEvent) {
		if (oEvent.isMarked()) {
			return;
		} else if (!this.getConfig("isSelectionEnabled", this.getControl())) {
			Log.error("Cell selection is inactive, because preconditions are not met.");
			return;
		}

		var oTarget = oEvent.target;
		var oCellInfo = this.getConfig("getCellInfo", this.getControl(), oTarget);

		if (oCellInfo) {
			this._bSelecting = true;
			if (this._oSession.mSource) {
				if (this._oSession.mSource.rowIndex !== oCellInfo.rowIndex || this._oSession.mSource.colIndex !== oCellInfo.colIndex) {
					this._oSession.mSource = null;
					this._oSession.mTarget = null;
				}
			}
			this._oSession.mSource = oCellInfo;
			this._oSession.mStart = oCellInfo;
			this._selectCells(this._oSession.mSource, oCellInfo, {info: {focus: oCellInfo}});

			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};

	CellSelector.prototype.onsapnext = CellSelector.prototype.onsapprevious = function (oEvent) {
		if (!this._bSelecting) {
			return;
		}
		this._clearSelection();
	};

	CellSelector.prototype.onsaphome = CellSelector.prototype.onsapend = CellSelector.prototype.onsapnext;

	CellSelector.prototype.onsapnextmodifiers = function (oEvent) {
		this._selectNextCell(oEvent, false, 1);
	};

	CellSelector.prototype.onsappreviousmodifiers = function (oEvent) {
		this._selectNextCell(oEvent, true.valueOf, -1);
	};

	CellSelector.prototype._selectNextCell = function (oEvent, bIsPrevious, iDirectionIndex) {
		if (!this._bSelecting || !oEvent.shiftKey || oEvent.isMarked() || !this._isInSelectionArea(oEvent.target)) {
			return;
		}

		var oFocusCellInfo = this.getConfig("getCellInfo", this.getControl(), oEvent.target);
		var mFrom = Object.assign({}, this._oSession.mSource);
		var mTo = Object.assign({}, this._oSession.mTarget);

		var sKeyCode = bIsPrevious ? KeyCodes.ARROW_UP : KeyCodes.ARROW_DOWN,
			iDirection = bIsPrevious ? SELECTION_DIRECTION.PREVIOUS : SELECTION_DIRECTION.NEXT;

		var sType = oEvent.keyCode == sKeyCode ? "row" : "col";
		mTo[sType + "Index"] += iDirectionIndex;
		oFocusCellInfo[sType + "Index"] += iDirectionIndex;

		if (!this.getConfig("isNavigatableCell", this.getControl(), mTo)) {
			return;
		}

		this._selectCells(mFrom, mTo, {info: {focus: oFocusCellInfo, direction: iDirection}});
		oEvent.preventDefault();
		oEvent.setMarked();
	};

	CellSelector.prototype.onsapspacemodifiers = function (oEvent) {
		if (!this._bSelecting || oEvent.isMarked()) {
			return;
		}

		var mTo = Object.assign({}, this._oSession.mTarget);
		var oFocusCellInfo = this.getConfig("getCellInfo", this.getControl(), oEvent.target);

		if (oEvent.shiftKey) {
			// Select rows, if single row selection, only select focused row
			this._oSession.mSource.colIndex = -Infinity;
			mTo.colIndex = Infinity;
			this._selectCells(this._oSession.mSource, mTo, {info: {focus: oFocusCellInfo, boundaryChange: true}});
		} else if (oEvent.ctrlKey || oEvent.metaKey) {
			// Select columns
			this._oSession.mSource.rowIndex = -Infinity;
			mTo.rowIndex = Infinity;
			this._selectCells(this._oSession.mSource, mTo, {info: {focus: oFocusCellInfo, boundaryChange: true}});
		}
		oEvent.preventDefault();
		oEvent.setMarked();
	};

	CellSelector.prototype.onsaphomemodifiers = function (oEvent) {
		if (!this._bSelecting || oEvent.isMarked() || !oEvent.shiftKey || !this._isInSelectionArea(oEvent.target)) {
			return;
		}

		var mTo = Object.assign({}, this._oSession.mTarget);
		mTo.colIndex = -Infinity;
		this._selectCells(this._oSession.mSource, mTo, {info: {focus: mTo, boundaryChange: true}});
		oEvent.setMarked();
	};

	CellSelector.prototype.onsapendmodifiers = function (oEvent) {
		if (!this._bSelecting || oEvent.isMarked() || !oEvent.shiftKey || !this._isInSelectionArea(oEvent.target)) {
			return;
		}

		var mTo = Object.assign({}, this._oSession.mTarget);
		mTo.colIndex = Infinity;
		this._selectCells(this._oSession.mSource, mTo, {info: {focus: mTo, boundaryChange: true}});
		oEvent.setMarked();
	};

	CellSelector.prototype.onkeydown = function (oEvent) {
		if (this._bSelecting) {
			// CTRL+SHIFT+A: Clear Selection
			if (isKeyCombination(oEvent, KeyCodes.A, true, true)) {
				this._clearSelection();
			}
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};

	CellSelector.prototype.onkeyup = function (oEvent) {
		if (!this._bSelecting) {
			return;
		}
		oEvent.setMarked();
	};

	/**
	 * Checks if the given target element is in the selection area.
	 * @param {HTMLElement} oTarget target element
	 * @returns {boolean} bInArea - true: in selection area, false: not in area
	 * @private
	 */
	CellSelector.prototype._isInSelectionArea = function (oTarget) {
		var oFocusInfo = this.getConfig("getCellInfo", this.getControl(), oTarget);
		var bInArea = false;

		if (oFocusInfo) {
			var oNormalizedBounds = getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);
			var aRows = this.getControl().getRows();

			bInArea = !(oFocusInfo.rowIndex < oNormalizedBounds.from.rowIndex
				|| oFocusInfo.rowIndex > oNormalizedBounds.to.rowIndex
				|| oFocusInfo.colIndex < oNormalizedBounds.from.colIndex
				|| oFocusInfo.colIndex > oNormalizedBounds.to.colIndex)
				|| oFocusInfo.rowIndex == aRows[0].getIndex()
				|| oFocusInfo.rowIndex == aRows[aRows.length - 1].getIndex();
		}

		return bInArea;
	};

	/**
	 * Selects the cell from the source cell to the provided target cell's coordinates.
	 *
	 * The algorithm builds up a bounding box, goes through all the cells inside it and determines their selection state.
	 * The bounding box can either be ranging from
	 * a) source cell to target cell or
	 * b) source cell to current lower right cell.
	 * The bigger bounding box of the two will be inspected.
	 * @param {Object} mFrom source cell coordinates
	 * @param {int} mFrom.rowIndex row index
	 * @param {int} mFrom.colIndex column index
	 * @param {Object} mTo target cell coordinates
	 * @param {int} mTo.rowIndex row index
	 * @param {int} mTo.colIndex column index
	 * @param {object} oOptions cell selection options
	 * @param {object} oOptions.info options info
	 * @param {object} oOptions.info.focus focus info
	 * @param {boolean} oOptions.info.boundaryChange change of both both boundaries
	 * @private
	 */
	CellSelector.prototype._selectCells = function (mFrom, mTo, oOptions) {
		if (!this._bSelecting) {
			return;
		}

		this._oSession.aCells = [];
		this._savePreviousSelectionAreas();
		this._eraseSelection();

		if (!this._oSession.mTarget) {
			this._oSession.mTarget = mTo;
		}
		if (!mFrom) {
			this._oSession.mSource = mFrom = mTo;
		}
		if (!oOptions) {
			oOptions = {};
		}

		var mBounds = getNormalizedBounds(mFrom, mTo);

		// "Select cells" - returns the area to draw on (boundaries), border information for drawing and selected cell information
		var oSelection = this.getConfig("selectCells", this.getControl(), mBounds, oOptions);

		this._oSession.aCells = oSelection.cells;
		this._drawSelection(oSelection.bounds, oSelection.borderOptions);

		if (oOptions && oOptions.info && !oOptions.info.boundaryChange) {
			// Set new source and target positions
			this._oSession.mSource = mFrom;
			this._oSession.mTarget = mTo;
		} else {
			// If it is something like column, row (begin/end/whole) selection, the source and target positions need to be adjusted to the normalized bounds
			this._oSession.mSource = mBounds.from;
			this._oSession.mTarget = mBounds.to;
		}
	};

	/**
	 * Draws the selection for the given bounds.
	 * @param {Object} mBounds object containing the bounds information (from, to)
	 * @param {Object} mBounds.from from position
	 * @param {Object} mBounds.to to position
	 * @private
	 */
	CellSelector.prototype._drawSelection = function (mBounds, oOptions) {
		var aSelectionAreas = this.getConfig("getSelectionAreas", this.getControl(), mBounds.from, mBounds.to);

		// Iterate through every selection area
		aSelectionAreas.forEach(function (oArea, iIndex) {
			var oTableDomRef = this.getControl().getDomRef(oArea.container),
				oFromDomRef = this.getConfig("getCellRef", this.getControl(), oArea.from),
				oToDomRef = this.getConfig("getCellRef", this.getControl(), oArea.to);
			var mFromRect, mToRect, oTableRect;
			var oStyle = {};

			if (!oFromDomRef || !oToDomRef) {
				return;
			}

			mFromRect = oFromDomRef.getBoundingClientRect();
			mToRect = oToDomRef.getBoundingClientRect();
			oTableRect = oTableDomRef.getBoundingClientRect();

			// There are instances, where no offset needs to be factored in (e.g. fixed columns).
			var mOffsetLeft = oArea.hasOffset ? oTableRect.left : 0;

			oStyle.left = Math.min(mFromRect.left, mToRect.left) - mOffsetLeft;
			oStyle.top = Math.min(mFromRect.top, mToRect.top) - oTableRect.top;
			oStyle.width = Math.max(mToRect.right, mFromRect.right) - oStyle.left - mOffsetLeft;
			oStyle.height = Math.max(mToRect.bottom, mFromRect.bottom) - oStyle.top - oTableRect.top;

			oStyle.noBorderTop = !oOptions.top;
			oStyle.noBorderBottom = !oOptions.bottom;

			// if there are multiple areas omit the left/right border accordingly
			oStyle.noBorderRight = aSelectionAreas.length > 1 && iIndex < (aSelectionAreas.length - 1) ? true : false;
			oStyle.noBorderLeft = aSelectionAreas.length > 1 && iIndex > 0 ? true : false;

			// Draw selection area
			this._drawSelectionArea(oStyle, oArea.container);
		}.bind(this));
	};

	/**
	 * Draw the selection area for the given style in the given container.
	 * @param {Object} oTargetStyle object containing style information (left, top, width, height)
	 * @param {float} oTargetStyle.left left position
	 * @param {float} oTargetStyle.top top position
	 * @param {float} oTargetStyle.width width
	 * @param {float} oTargetStyle.height height
	 * @param {string} sContainer name of the container
	 * @private
	 */
	CellSelector.prototype._drawSelectionArea = function (oTargetStyle, sContainer) {
		if (!this._oSession.oCanvas[sContainer]) {
			this._oSession.oCanvas[sContainer] = document.createElement("div");
			this._oSession.oCanvas[sContainer].className = CSS_CLASS + "Canvas";
		}
		if (!this._oSession.oCanvas[sContainer].isConnected) {
			this.getControl().getDomRef(sContainer).append(this._oSession.oCanvas[sContainer]);
		}

		var oStyle = this._oSession.oCanvas[sContainer].style;
		oStyle.left = oTargetStyle.left + "px";
		oStyle.top = oTargetStyle.top + "px";
		oStyle.width = oTargetStyle.width + "px";
		oStyle.height = oTargetStyle.height + "px";
		oStyle.display = "block";

		oStyle.borderTop = oTargetStyle.noBorderTop ? "0px" : "";
		oStyle.borderBottom = oTargetStyle.noBorderBottom ? "0px" : "";
		oStyle.borderRight = oTargetStyle.noBorderRight ? "0px" : "";
		oStyle.borderLeft = oTargetStyle.noBorderLeft ? "0px" : "";
	};

	CellSelector.prototype._clearSelection = function () {
		this._bSelecting = false;
		this._eraseSelection();
		this._oSession.mSource = null;
		this._oSession.mTarget = null;
	};

	/**
	 * Erases the selection
	 * @private
	 */
	CellSelector.prototype._eraseSelection = function () {
		Object.values(this._oSession.oCanvas).forEach(function (oArea) {
			oArea.style = "";
		});
	};

	/**
	 * A special scroll handler, which handles selection accordingly when the table is scrolling vertically.
	 * @param {sap.ui.base.Event} oEvent scroll event
	 * @private
	 */
	CellSelector.prototype._handleScroll = function (oEvent) {
		// Rerender selection
		if (!this._bSelecting) {
			return;
		}
		this._selectCells(this._oSession.mSource, this._oSession.mTarget);
	};

	/**
	 * Saves all the previous selection areas for later reference and calculation.
	 * @private
	 */
	CellSelector.prototype._savePreviousSelectionAreas = function () {
		Object.entries(this._oSession.oCanvas).forEach(function (aEntries) {
			var sContainer = aEntries[0], oArea = aEntries[1];
			if (oArea.style.left && oArea.style.top && oArea.style.width && oArea.style.height) {
				if (!this._oSession.previousSelection) {
					this._oSession.previousSelection = {};
				}
				this._oSession.previousSelection[sContainer] = {
					top: parseFloat(oArea.style.top),
					left: parseFloat(oArea.style.left),
					width: parseFloat(oArea.style.width),
					height: parseFloat(oArea.style.height)
				};
			}
		}.bind(this));
	};

	/**
	 * Returns an object containing normalized coordinates for the given bounding area.
	 * <code>from</code> will contain the coordinates for the upper left corner of the bounding area,
	 * while <code>to</code> contains the coordinates of the lower right corner of the bounding area.
	 * @param {Object} mFrom
	 * @param {int} mFrom.rowIndex row index
	 * @param {int} mFrom.colIndex column index
	 * @param {Object} mTo
	 * @param {int} mTo.rowIndex row index
	 * @param {int} mTo.colIndex column index
	 * @returns object containing coordinates for from and to
	 */
	function getNormalizedBounds(mFrom, mTo) {
		return {
			from: {rowIndex: Math.min(mFrom.rowIndex, mTo.rowIndex), colIndex: Math.min(mFrom.colIndex, mTo.colIndex)},
			to: {rowIndex: Math.max(mFrom.rowIndex, mTo.rowIndex), colIndex: Math.max(mFrom.colIndex, mTo.colIndex)}
		};
	}

	/**
	 * Check if the given key combination applies to the event.
	 * @param {sap.ui.base.Event} oEvent event instance
	 * @param {string} sKeyCode key code
	 * @param {boolean} bShift shift key pressed
	 * @param {boolean} bCtrl control key pressed
	 * @returns is combination or not
	 */
	function isKeyCombination(oEvent, sKeyCode, bShift, bCtrl) {
		return oEvent.keyCode == sKeyCode && oEvent.shiftKey == bShift && (oEvent.ctrlKey == bCtrl || oEvent.metaKey == bCtrl);
	}

	PluginBase.setConfigs({
		"sap.m.Table": {
			selectableCells: ".sapMListTblCell:not([aria-hidden=true])"
		},
		"sap.ui.table.Table": {
			container: "tableCtrlCnt",
			selectableCells: ".sapUiTableDataCell",
			scrollEvent: "firstVisibleRowChanged",
			/**
			 * Checks if the selection is enabled for the control.
			 * @param {sap.ui.core.Control} oControl control instance
			 * @returns {boolean} is selection enabled or not
			 */
			isSelectionEnabled: function (oControl) {
				return !(oControl.getSelectionBehavior() !== "RowSelector" || oControl.getSelectionMode() == "None");
			},
			/**
			 * Retrieve the cell reference for a given position
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {Object} mPosition position
			 * @param {int} mPosition.rowIndex row index
			 * @param {int} mPosition.colIndex column index
			 * @returns {HTMLElement} cell's DOM element
			 */
			getCellRef: function (oTable, mPosition) {
				var oRow = this._getRowByIndex(oTable, mPosition.rowIndex);
				if (oRow) {
					var oColumn = this._getColumns(oTable)[mPosition.colIndex];
					var oCell = oColumn && oRow.getCells()[mPosition.colIndex];
					if (oCell) {
						return oCell.$().closest(".sapUiTableDataCell")[0];
					}
				}
			},
			/**
			 * Retrieve cell information for a given DOM element.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {HTMLElement} oTarget DOM element of cell
			 * @returns {Object} cell information containing rowIndex and colIndex
			 */
			getCellInfo: function (oTable, oTarget) {
				return {
					rowIndex: this.rowIndex(null, oTarget),
					colIndex: this.colIndex(oTable, oTarget)
				};
			},
			/**
			 * Returns the controls' available selection areas for the given bounds.
			 *
			 * Note: The order of the areas is from left to right. Area at index 0 is the leftmost area, etc.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {Object} mFrom from position
			 * @param {Object} mTo to position
			 * @returns {Object[]} array of objects (container, from, to) containing information for each area. It contains the name of the container
			 * and the area that will be selected in said container.
			 */
			getSelectionAreas: function (oTable, mFrom, mTo) {
				// push selection areas from left to right
				var aAreas = [], iFixedColumnCount = oTable.getFixedColumnCount();
				if (iFixedColumnCount > 0 && (mFrom.colIndex < iFixedColumnCount || mFrom.colIndex === -Infinity)) {
					var iToCol = mTo.colIndex === Infinity ? iFixedColumnCount - 1 : Math.min(mTo.colIndex, iFixedColumnCount - 1);
					var mFixedFrom = {rowIndex: mFrom.rowIndex, colIndex: mFrom.colIndex},
						mFixedTo = {rowIndex: mTo.rowIndex, colIndex: iToCol};
					aAreas.push({container: "sapUiTableCtrlScrFixed", from: mFixedFrom, to: mFixedTo});
				}
				if (mTo.colIndex >= iFixedColumnCount || mTo.colIndex === Infinity) {
					aAreas.push({container: this.container, from: mFrom, to: mTo, hasOffset: true});
				}
				return aAreas;
			},
			/**
			 * Retrieves selected cells and returns their position and the boundaries of the selection area fitted to the table and its border options.
			 *
			 * Note: Also modifies the original mSelectionBounds object and replaces MIN/MAX with real values.
			 *
			 * Note: As the selection area may vary based on control-specific settings (e.g. SingleSelection), the information is returned as well.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {Object} mSelectionBounds selection options
			 * @param {Object} oOptions selection options
			 * @returns {Object} oSelection object containg <code>bounds</code> (selection bounds) and <code>cells</code> (selected cell positions)
			 * @returns {Object} oSelection.bounds
			 * @returns {int[]} oSelection.cells
			 */
			selectCells: function (oTable, mSelectionBounds, oOptions) {
				var mBounds = {}, oBorderOptions = {top: true, bottom: true};
				mBounds.from = Object.assign({}, mSelectionBounds.from);
				mBounds.to = Object.assign({}, mSelectionBounds.to);
				var aCells = [];

				// Replace MIN/MAX with according number for focus object
				if (oOptions && oOptions.info) {
					if (oOptions.info.focus.rowIndex === -Infinity) {
						oOptions.info.focus.rowIndex = 0;
					} else if (oOptions.info.focus.rowIndex === Infinity) {
						oOptions.info.focus.rowIndex = oTable._getTotalRowCount();
					}
					if (oOptions.info.focus.colIndex === -Infinity) {
						oOptions.info.focus.colIndex = 0;
					} else if (oOptions.info.focus.colIndex === Infinity) {
						oOptions.info.focus.colIndex = this._getColumns(oTable).length - 1;
					}
					this._focusCell(oTable, oOptions.info.focus, oOptions.info.direction);
				}

				// Determine the first, last and last row of unfixed rows. Needs to factor in fixed rows.
				var iFirstRow = oTable.getFirstVisibleRow() + oTable.getFixedRowCount();
				var iLastRowIndex = iFirstRow + oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - oTable.getFixedRowCount() - 1;
				var iLowerFixedLimit = iFirstRow + oTable.getVisibleRowCount() - oTable.getFixedRowCount() - oTable.getFixedBottomRowCount();

				if ((mBounds.from.rowIndex < iFirstRow && mBounds.to.rowIndex < iFirstRow
					|| mBounds.from.rowIndex > iLastRowIndex && mBounds.to.rowIndex > iLastRowIndex)
					&& !(mBounds.from.rowIndex < oTable.getFixedRowCount() || mBounds.to.rowIndex >= iLowerFixedLimit)) {
					// If both FROM and TO are out of the view port and there is no need to render them, set bounds to none. Needs to factor in fixed rows.
					mBounds.from = {};
					mBounds.to = {};
				} else {
					if ((mBounds.from.rowIndex < iFirstRow && mBounds.from.rowIndex > (oTable.getFixedRowCount() - 1)) || mBounds.from.rowIndex === -Infinity) {
						// Case 1: FROM is "above" table, so return the position of the first row instead for rendering.
						mBounds.from.rowIndex = iFirstRow;
						oBorderOptions.top = mBounds.from.rowIndex == 0 ? true : false;
						if (mSelectionBounds.from.rowIndex === -Infinity) {
							// Case 1.A: If MIN is given, set it immediately to 0
							mSelectionBounds.from.rowIndex = 0;
							mBounds.from.rowIndex = oTable.getFixedRowCount() > 0 ? 0 : iFirstRow;
						}
					}
					if ((mBounds.to.rowIndex > iLastRowIndex && mBounds.to.rowIndex < (oTable._getTotalRowCount() - oTable.getFixedBottomRowCount())) || mBounds.to.rowIndex === Infinity) {
						// Case 2: TO is "below" table (currently visible rows), so return the position of the last visible row instead for rendering.
						mBounds.to.rowIndex = iLastRowIndex;
						oBorderOptions.bottom = mBounds.to.rowIndex == oTable._getTotalRowCount() - 1 ? true : false;
						if (mSelectionBounds.to.rowIndex === Infinity) {
							// Case 2.A: If MAX is given, set it immediately to the maximum row count
							mSelectionBounds.to.rowIndex = oTable._getTotalRowCount() - 1;
							mBounds.to.rowIndex = oTable.getFixedRowCount() > 0 ? oTable._getTotalRowCount() - 1 : iLastRowIndex;
						}
					}
				}

				// If table is in Single Selection Mode, only select the row with focus in it
				if (mBounds.from.colIndex === -Infinity && mBounds.from.colIndex === Infinity) {
					mBounds.from.rowIndex = oOptions.info.focus.rowIndex;
					mSelectionBounds.from.rowIndex = oOptions.info.focus.rowIndex;
				}

				var aVisibleColumns = this._getColumns(oTable);
				mBounds.from.colIndex = mSelectionBounds.from.colIndex = Math.max(mSelectionBounds.from.colIndex, 0);
				mBounds.to.colIndex = mSelectionBounds.to.colIndex = Math.min(mSelectionBounds.to.colIndex, aVisibleColumns.length - 1);

				for (var iRow = mSelectionBounds.from.rowIndex; iRow <= mSelectionBounds.to.rowIndex; iRow++) {
					var oRow = this._getRowByIndex(oTable, iRow);
					if (oRow) {
						for (var iCol = mSelectionBounds.from.colIndex; iCol <= mSelectionBounds.to.colIndex; iCol++) {
							aCells.push([iRow, iCol]);
						}
					}
				}

				return {
					bounds: mBounds,
					borderOptions: oBorderOptions,
					cells: aCells
				};
			},
			/**
			 * Retrieves the row index for the given cell's DOM reference.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {HTMLElement} oCellDomRef DOM reference of cell
			 * @returns {int} row index
			 */
			rowIndex: function (oTable, oCellDomRef) {
				return jQuery(oCellDomRef).control(0, true).getIndex();
			},
			/**
			 * Retrieves the column index for the given cell's DOM reference.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {HTMLElement} oCellDomRef DOM reference of cell
			 * @returns {int} column index
			 */
			colIndex: function (oTable, oCellDomRef) {
				return this._getColumns(oTable).indexOf(Core.byId(oCellDomRef.getAttribute("data-sap-ui-colid")));
			},
			contextByIndex: function(oTable, iRowIndex) {
				return oTable.getContextByIndex(iRowIndex);
			},
			columnByIndex: function(oTable, iColIndex) {
				var oColumn = this._getColumns(oTable)[iColIndex];
				if (!oColumn.getVisible()) {
					return;
				}
				return oColumn;
			},
			isNavigatableCell: function (oTable, mPosition) {
				if (mPosition.rowIndex < 0 || mPosition.rowIndex >= oTable._getTotalRowCount()
					|| mPosition.colIndex < 0 || mPosition.colIndex >= this._getColumns(oTable).length) {
					return false;
				}
				return true;
			},
			/**
			 * Scroll one row up or down based on the given direction.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {int} iDirection scroll direction
			 * @param {int} iRow row index
			 */
			_scrollRow: function (oTable, iDirection, iRow) {
				var iFirstRow = oTable.getFirstVisibleRow();
				if (iRow >= 0 && iRow < oTable._getTotalRowCount()) {
					if (oTable.getFixedRowCount() > 0 && iRow == oTable.getFixedRowCount()) {
						oTable.setFirstVisibleRow(0);
					} else {
						iDirection == SELECTION_DIRECTION.NEXT ? iFirstRow++ : iFirstRow--;
						oTable.setFirstVisibleRow(iFirstRow);
					}
				}
			},
			/**
			 * Focus the specified cell and scroll if necessary.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {Object} mPosition position object
			 * @param {int} mPosition.rowIndex row index
			 * @param {int} mPosition.colIndex column index
			 * @param {int} iDirection scroll direction
			 */
			_focusCell: function (oTable, mPosition, iDirection) {
				var oCellRef = this.getCellRef(oTable, mPosition);

				if (!oCellRef) {
					this._scrollRow(oTable, iDirection, mPosition.rowIndex);
					oCellRef = this.getCellRef(oTable, mPosition);
				}
				oCellRef &&	oCellRef.focus();
			},
			/**
			 * Get visible columns of the table.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @returns {sap.ui.table.Column[]} array of visible columns
			 */
			_getColumns: function (oTable) {
				return oTable.getColumns().filter(function (oColumn) {
					return oColumn.shouldRender();
				});
			},
			/**
			 * Retrieve a row by its index.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {int} iRowIndex row index
			 * @returns {sap.ui.table.Row|null} row instance
			 */
			_getRowByIndex: function (oTable, iRowIndex) {
				var aItems = oTable.getRows();
				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].getIndex() == iRowIndex) {
						return aItems[i];
					}
				}
			}
		}
	}, CellSelector);

	return CellSelector;
});