/*!
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/base/Log"
], function (PluginBase, KeyCodes, Core, Element, Log) {
	"use strict";

	var SELECTION_DIRECTION = {
		NEXT: 1,
		PREVIOUS: 2
	};

	var MOUSE_POSITION = {
		ABOVE: 0,
		RIGHT: 1,
		BELOW: 2,
		LEFT: 3,
		IN: 4
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
	 * Mouse Usage:
	 * - Left Click: Select the clicked cell.
	 * - Mousedown + Moving: Select an area of cells.
	 * - Drag Borders: Drag the horizontal/vertical borders to enhance the cell selection in the corresponding direction.
	 * - Drag Edge: Enhance your current cell selection in any direction, when dragging a corner.
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
		this._oSession.oEdge = {};
		this._oSession.oBorderLine = {};

		var sScrollEvent = this.getConfig("scrollEvent");
		sScrollEvent && oControl.attachEvent(sScrollEvent, this._handleScroll, this);

		this._fnMouseupHandler = this._onmouseup.bind(this);
		document.addEventListener("mouseup", this._fnMouseupHandler);
		var oContainerRef = this.getControl().getDomRef(this.getConfig("scrollContainer"));
		if (oContainerRef) {
			this._fnMouseleaveHandler = this._onMouseLeave.bind(this);
			oContainerRef.addEventListener("mouseleave", this._fnMouseleaveHandler);
		}
	};

	CellSelector.prototype.onDeactivate = function (oControl) {
		oControl.removeDelegate(this, this);
		this._oSession = {};
		this._oSession.oCanvas = {};
		this._oSession.oEdge = {};
		this._oSession.oBorderLine = {};

		var sScrollEvent = this.getConfig("scrollEvent");
		sScrollEvent && oControl.detachEvent(sScrollEvent, this._handleScroll, this);

		document.removeEventListener("mouseup", this._fnMouseupHandler);
		var oContainerRef = this.getControl().getDomRef(this.getConfig("scrollContainer"));
		if (oContainerRef) {
			oContainerRef.removeEventListener("mouseleave", this._fnMouseleaveHandler);
		}
	};

	CellSelector.prototype.onAfterRendering = function () {
		this._fnMouseupHandler = this._onmouseup.bind(this);
		document.addEventListener("mouseup", this._fnMouseupHandler);
		var oContainerRef = this.getControl().getDomRef(this.getConfig("scrollContainer"));
		if (oContainerRef) {
			this._fnMouseleaveHandler = this._onMouseLeave.bind(this);
			oContainerRef.addEventListener("mouseleave", this._fnMouseleaveHandler);
		}
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
		this.clearSelection();
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
				this.clearSelection();
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

	// Mouse Navigation

	CellSelector.prototype.ontouchstart = function (oEvent) {
		var oCellRef = this._getSelectableCell(oEvent.target);
		if (oEvent.isMarked() || !oCellRef) {
			return;
		} else if (!this.getConfig("isSelectionEnabled", this.getControl())) {
			Log.error("Cell selection is inactive, because preconditions are not met.");
			return;
		}

		var oCellInfo = this.getConfig("getCellInfo", this.getControl(), oCellRef);

		if (oCellInfo) {
			this._bSelecting = true;
			this._bMouseDown = true;
			this._bByEdge = false;
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
		}
		oEvent.setMarked();
	};

	CellSelector.prototype.ontouchmove = function (oEvent) {
		if (!this._bMouseDown || !this._bSelecting) {
			return;
		}

		var oTouchPosition = this._getMousePosition(this.getConfig("scrollContainer"), oEvent.clientX, oEvent.clientY);
		if (oTouchPosition.x == MOUSE_POSITION.IN && oTouchPosition.y == MOUSE_POSITION.IN) {
			this._bScrollSelecting = false;
		}

		var oTargetRef = this._getSelectableCell(oEvent.target);
		if (!oTargetRef) {
			return;
		}

		var oTargetInfo = this.getConfig("getCellInfo", this.getControl(), oTargetRef);
		if (oTargetInfo) {
			if (oTargetInfo.rowIndex == this._oSession.mTarget.rowIndex && oTargetInfo.colIndex == this._oSession.mTarget.colIndex) {
				// if current mouse position is equal to current saved target position, no change is needed
				return;
			}

			var oBounds = getNormalizedBounds(this._oSession.mSource, this._oSession.mTarget);

			if (this._oEdgeInfo && this._oEdgeInfo.isActive && this._oEdgeInfo.moveStart) {
				this._oEdgeInfo.moveStart = false;

				// Move Start position to opposite edge to ensure correct enlarging/decreasing of selection area
				if (this._oEdgeInfo.edgePosition === "NE") {
					this._oSession.mStart.rowIndex = oBounds.to.rowIndex;
					this._oSession.mStart.colIndex = oBounds.from.colIndex;
				} else if (this._oEdgeInfo.edgePosition === "SE") {
					this._oSession.mStart = oBounds.from;
				} else if (this._oEdgeInfo.edgePosition === "SW") {
					this._oSession.mStart.rowIndex = oBounds.from.rowIndex;
					this._oSession.mStart.colIndex = oBounds.to.colIndex;
				} else if (this._oEdgeInfo.edgePosition === "NW") {
					this._oSession.mStart = oBounds.to;
				}
			} else if (this._oBorderMoveInfo && this._oBorderMoveInfo.isActive) {
				// Move Start position to opposite border to ensure correct enlarging/decreasing of selection area
				var sDirection = this._oBorderMoveInfo.direction, bMoveStart = this._oBorderMoveInfo.moveStart;
				if (sDirection === "N") {
					this._oSession.mStart = bMoveStart ? oBounds.to : this._oSession.mStart;
					oTargetInfo.colIndex = oBounds.from.colIndex;
				} else if (sDirection === "E") {
					this._oSession.mStart = bMoveStart ? oBounds.from : this._oSession.mStart;
					oTargetInfo.rowIndex = oBounds.to.rowIndex;
				} else if (sDirection === "S") {
					this._oSession.mStart = bMoveStart ? oBounds.from : this._oSession.mStart;
					oTargetInfo.colIndex = oBounds.to.colIndex;
				} else if (sDirection === "W") {
					this._oSession.mStart = bMoveStart ? oBounds.to : this._oSession.mStart;
					oTargetInfo.rowIndex = oBounds.from.rowIndex;
				}
				this._oBorderMoveInfo.moveStart = false;
			}
			var mFrom = this._oSession.mStart, mTo = oTargetInfo;
			this._selectCells(mFrom, mTo, {info: {focus: oTargetInfo}});
		}
	};

	CellSelector.prototype._onMouseLeave = function (oEvent) {
		if (this._bMouseDown && this._bSelecting) {
			this._bScrollSelecting = true;
			var oMousePosition = this._getMousePosition(this.getConfig("scrollContainer"), oEvent.clientX, oEvent.clientY);
			this._onScrollSelect(oMousePosition);
		}
	};

	/**
	 * Event handler for scroll selection. If the mouse is outside of the table while selecting cells, the table will be scrolled accordingly.
	 *
	 * Returns a promise, which will resolve if selection is stopped or the control has been destroyed.
	 * @param {object} oMousePosition mouse position information
	 * @param {MOUSE_POSITION} oMousePosition.x x position
	 * @param {MOUSE_POSITION} oMousePosition.y y position
	 * @returns {Promise} event promise
	 */
	CellSelector.prototype._onScrollSelect = function (oMousePosition) {
		// recursively calls _onScrollSelect every 100ms, as long as scroll selecting is active
		return new Promise(function (resolve, reject) {
			if (!this._bScrollSelecting) {
				resolve();
				return;
			}
			setTimeout(function () {
				if (!this.getControl()) {
					// If during the asynchronous process, the control is somehow destroyed, simply resolve and return
					resolve();
					return;
				}
				var oContainerRef = this.getControl().getDomRef(this.getConfig("container"));
				if (oMousePosition.x === MOUSE_POSITION.LEFT) {
					if (this._oSession.mSource.colIndex < this._oSession.mTarget.colIndex && this._oSession.mSource.colIndex > 0) {
						this._oSession.mSource.colIndex--;
					} else if (this._oSession.mTarget.colIndex > 0) {
						this._oSession.mTarget.colIndex--;
					}
					oContainerRef.dispatchEvent(new WheelEvent("wheel", {deltaX: -1, deltaMode: window.WheelEvent.DOM_DELTA_LINE}));
					this._selectCells(this._oSession.mSource, this._oSession.mTarget);
				} else if (oMousePosition.x === MOUSE_POSITION.RIGHT) {
					this._oSession.mTarget.colIndex++;
					oContainerRef.dispatchEvent(new WheelEvent("wheel", {deltaX: 1, deltaMode: window.WheelEvent.DOM_DELTA_LINE}));
					this._selectCells(this._oSession.mSource, this._oSession.mTarget);
				}
				if (oMousePosition.y === MOUSE_POSITION.ABOVE) {
					if (this._oSession.mSource.rowIndex < this._oSession.mTarget.rowIndex && this._oSession.mSource.rowIndex > 0) {
						this._oSession.mSource.rowIndex--;
					} else if (this._oSession.mTarget.rowIndex > 0) {
						this._oSession.mTarget.rowIndex--;
					}
					oContainerRef.dispatchEvent(new WheelEvent("wheel", {deltaY: -1, deltaMode: window.WheelEvent.DOM_DELTA_LINE}));
				} else if (oMousePosition.y === MOUSE_POSITION.BELOW) {
					this._oSession.mTarget.rowIndex++;
					oContainerRef.dispatchEvent(new WheelEvent("wheel", {deltaY: 1, deltaMode: window.WheelEvent.DOM_DELTA_LINE}));
				}
				resolve();
			}.bind(this), 100);
		}.bind(this)).then(function () {
			if (!this._bScrollSelecting) {
				return;
			}
			this._onScrollSelect(oMousePosition);
		}.bind(this));
	};

	/**
	 * Event handler for mouse movement with border or edge handles while selecting cells. Sets the according selection flags, if a selection is active.
	 * @param {String} sFacing direction of movement
	 * @param {boolean} bBorder is the movement by border dragging
	 * @private
	 */
	CellSelector.prototype._onHandleMove = function (sFacing, bBorder) {
		if (this._oBorderMoveInfo && this._oBorderMoveInfo.isActive) {
			return;
		}
		this._bSelecting = true;
		this._bMouseDown = true;
		if (bBorder) {
			this._oBorderMoveInfo = {isActive: true, direction: sFacing, moveStart: true};
		} else {
			this._oEdgeInfo = {isActive: true, moveStart: true, edgePosition: sFacing};
		}
	};

	/**
	 * Event handler for mouseup. Stops the cell selection and sets the necessary flags accordingly.
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	CellSelector.prototype._onmouseup = function (oEvent) {
		this._bMouseDown = false;
		this._oEdgeInfo = null;
		this._oBorderMoveInfo = null;
		this._bScrollSelecting = false;
	};

	/**
	 * Checks if the given DOM reference is a selectable cell.
	 * @param {HTMLELement} oDomRef
	 * @returns {HTMLELement|null}
	 */
	 CellSelector.prototype._getSelectableCell = function (oDomRef) {
		return oDomRef && oDomRef.closest(this.getConfig("selectableCells"));
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

		var mDrawableBounds = this._getDrawableBounds(mBounds);

		if (!mDrawableBounds.from || !mDrawableBounds.to) {
			// If there are no drawable bounds, do not continue.
			return;
		}

		var oBorderOptions = this._getBorderOptions(mBounds, mDrawableBounds);
		this._oSession.aCells = oSelection.cells;
		this._drawSelection(mDrawableBounds, oBorderOptions);

		if (!oOptions.info || (oOptions.info && !oOptions.info.boundaryChange)) {
			// Set new source and target positions
			this._oSession.mSource = mFrom;
			this._oSession.mTarget = mTo;
		} else {
			// If it is something like column, row (begin/end/whole) selection, the source and target positions need to be adjusted to the normalized bounds
			this._oSession.mSource = mBounds.from;
			this._oSession.mTarget = mBounds.to;
		}
	};

	CellSelector.prototype._getDrawableBounds = function (mBounds) {
		var mDrawableBounds = {from: {}, to: {}};

		var mRange = this.getConfig("getVisibleRange", this.getControl(), mBounds); // from, to

		if (mBounds.to.rowIndex < mRange.from.rowIndex || mBounds.from.rowIndex > mRange.to.rowIndex) {
			mDrawableBounds = {};
		} else {
			mDrawableBounds.from.rowIndex = Math.max(mBounds.from.rowIndex, mRange.from.rowIndex);
			mDrawableBounds.from.colIndex = Math.max(mBounds.from.colIndex, mRange.from.colIndex);
			mDrawableBounds.to.rowIndex = Math.min(mBounds.to.rowIndex, mRange.to.rowIndex);
			mDrawableBounds.to.colIndex = Math.min(mBounds.to.colIndex, mRange.to.colIndex);
		}
		return mDrawableBounds;
	};

	CellSelector.prototype._getBorderOptions = function (mBounds, mDrawableBounds) {
		var oBorderOptions = {top: true, bottom: true};
		if (mDrawableBounds.from.rowIndex > mBounds.from.rowIndex) {
			oBorderOptions.top = false;
		}
		if (mDrawableBounds.to.rowIndex < mBounds.to.rowIndex) {
			oBorderOptions.bottom = false;
		}
		return oBorderOptions;
	};

	/**
	 * Draws the selection for the given bounds.
	 * @param {Object} mBounds object containing the bounds information (from, to)
	 * @param {Object} mBounds.from from position
	 * @param {Object} mBounds.to to position
	 * @private
	 */
	CellSelector.prototype._drawSelection = function (mBounds, oOptions) {
		if (!mBounds.from || !mBounds.to) {
			return;
		}

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

			// Draw Edge Handles
			if (!this._oSession.oEdge[oArea.container]) {
				this._oSession.oEdge[oArea.container] = {};
			}
			this._drawEdgeHandle(oStyle, oArea.container, "NE");
			this._drawEdgeHandle(oStyle, oArea.container, "SE");
			this._drawEdgeHandle(oStyle, oArea.container, "SW");
			this._drawEdgeHandle(oStyle, oArea.container, "NW");

			// Draw Border Lines
			if (!this._oSession.oBorderLine[oArea.container]) {
				this._oSession.oBorderLine[oArea.container] = {};
			}
			this._drawBorderLine(oStyle, oArea.container, "N");
			this._drawBorderLine(oStyle, oArea.container, "E");
			this._drawBorderLine(oStyle, oArea.container, "S");
			this._drawBorderLine(oStyle, oArea.container, "W");
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

	/**
	 * Draws the edge handles, which can be used to extend the cell selection in any direction.
	 * @param {object} oTargetStyle object containing style information
	 * @param {String} sContainer container name
	 * @param {String} sFacing direction of edge
	 * @private
	 */
	CellSelector.prototype._drawEdgeHandle = function (oTargetStyle, sContainer, sFacing) {
		if (!this._oSession.oEdge[sContainer][sFacing]) {
			this._oSession.oEdge[sContainer][sFacing] = {};

			this._oSession.oEdge[sContainer][sFacing].wrapper = document.createElement("div");
			this._oSession.oEdge[sContainer][sFacing].wrapper.className = CSS_CLASS + "EdgeWrapper";
		}
		if (!this._oSession.oEdge[sContainer][sFacing].wrapper.isConnected) {
			this._oSession.oCanvas[sContainer].append(this._oSession.oEdge[sContainer][sFacing].wrapper);
			this._oSession.oEdge[sContainer][sFacing].wrapper.addEventListener("mousedown", this._onHandleMove.bind(this, sFacing, false));
		}
		this._oSession.oEdge[sContainer][sFacing].wrapper.classList.add("sapMPluginsEdge" + sFacing);
	};

	/**
	 * Draws a line for the border, which can be dragged to extend selection.
	 * @param {object} oTargetStyle object containing style information
	 * @param {String} sContainer container name
	 * @param {String} sFacing direction of border
	 * @private
	 */
	CellSelector.prototype._drawBorderLine = function (oTargetStyle, sContainer, sFacing) {
		if (!this._oSession.oBorderLine[sContainer][sFacing]) {
			this._oSession.oBorderLine[sContainer][sFacing] = document.createElement("div");
			this._oSession.oBorderLine[sContainer][sFacing].className = CSS_CLASS + "BorderLine";
		}
		if (!this._oSession.oBorderLine[sContainer][sFacing].isConnected) {
			this._oSession.oCanvas[sContainer].append(this._oSession.oBorderLine[sContainer][sFacing]);
			this._oSession.oBorderLine[sContainer][sFacing].addEventListener("mousedown", this._onHandleMove.bind(this, sFacing, true));
		}

		var oStyle = this._oSession.oBorderLine[sContainer][sFacing].style;
		this._oSession.oBorderLine[sContainer][sFacing].classList.add("sapMPluginsBorder" + sFacing);
		if (sFacing === "N" || sFacing === "S") {
			oStyle.width = oTargetStyle.width + "px";
		} else {
			oStyle.height = oTargetStyle.height + "px";
		}
		oStyle.display = "block";
	};

	/**
	 * Clears the currently selected cells.
	 */
	CellSelector.prototype.clearSelection = function () {
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
		Object.values(this._oSession.oBorderLine).forEach(function (oArea) {
			Object.values(oArea).forEach(function (oBorder) {
				oBorder.style = "";
			});
		});
		Object.values(this._oSession.oEdge).forEach(function (oArea) {
			Object.values(oArea).forEach(function (oEdge) {
				Object.values(oEdge).forEach(function (oEdgePart) {
					oEdgePart.style = "";
				});
			});
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
	 * Retrieves the current mouse position and returns info on whether the mouse is inside the control or not.
	 * @param {String} sContainer container name
	 * @param {number} iX x position of mouse
	 * @param {y} iY y position of mouse
	 * @returns {object} object containing position information for x, y
	 */
	CellSelector.prototype._getMousePosition = function (sContainer, iX, iY) {
		var oContainerRef = this.getControl().getDomRef(sContainer);
		var oPosition = {x: MOUSE_POSITION.IN, y: MOUSE_POSITION.IN};
		if (oContainerRef) {
			var oContainerRect = oContainerRef.getBoundingClientRect();
			if (iY > oContainerRect.bottom) {
				oPosition.y = MOUSE_POSITION.BELOW;
			} else if (iY < oContainerRect.top) {
				oPosition.y = MOUSE_POSITION.ABOVE;
			}
			if (iX > oContainerRect.right) {
				oPosition.x = MOUSE_POSITION.RIGHT;
			} else if (iX < oContainerRect.left) {
				oPosition.x = MOUSE_POSITION.LEFT;
			}
		}
		return oPosition;
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
		"sap.ui.table.Table": {
			container: "tableCCnt",
			scrollContainer: "sapUiTableCtrlScr",
			selectableCells: ".sapUiTableDataCell",
			scrollEvent: "firstVisibleRowChanged",
			onActivate: function (oControl, oPlugin) {
				var sEvent = "rowSelectionChange";
				var oSelectionPlugin = oControl;
				oControl.getPlugins().forEach(function (oPlugin) {
					if (oPlugin.isA("sap.ui.table.plugins.SelectionPlugin")) {
						sEvent = "selectionChange";
						oSelectionPlugin = oPlugin;
					}
				});
				oSelectionPlugin.attachEvent(sEvent, oPlugin.clearSelection, oPlugin);
			},
			onDeactivate: function (oControl, oPlugin) {
				var sEvent = "rowSelectionChange";
				var oSelectionPlugin = oControl;
				oControl.getPlugins().forEach(function (oPlugin) {
					if (oPlugin.isA("sap.ui.table.plugins.SelectionPlugin")) {
						sEvent = "selectionChange";
						oSelectionPlugin = oPlugin;
						return;
					}
				});
				oSelectionPlugin.detachEvent(sEvent, oPlugin.clearSelection, oPlugin);
			},
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
						return oCell.$().closest(this.selectableCells)[0];
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
			 * Retrieve the visible row range for the given table.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @returns {Object} object containing from - to table range
			 */
			getVisibleRange: function (oTable) {
				var aRows = oTable.getRows();
				return {
					from: {rowIndex: aRows[0].getIndex(), colIndex: 0},
					to: {rowIndex: aRows[aRows.length - 1].getIndex(), colIndex: this._getColumns(oTable).length - 1}
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
					aAreas.push({container: "tableCtrlCnt", from: mFrom, to: mTo, hasOffset: true});
				}
				return aAreas;
			},
			/**
			 * Retrieves selected cells and returns their position and the boundaries of the selection area fitted to the table and its border options.
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
				var iBindingLength = oTable.getBinding("rows").getLength();
				mBounds.from = Object.assign({}, mSelectionBounds.from);
				mBounds.to = Object.assign({}, mSelectionBounds.to);

				mBounds.from.rowIndex = Math.max(mBounds.from.rowIndex, 0);
				mBounds.from.colIndex = Math.max(mBounds.from.colIndex, 0);

				mBounds.to.rowIndex = Math.min(mBounds.to.rowIndex, iBindingLength);
				mBounds.to.colIndex = Math.min(mBounds.to.colIndex, this._getColumns(oTable).length - 1);

				var aCells = [];

				// Replace MIN/MAX with according number for focus object
				if (oOptions && oOptions.info) {
					oOptions.info.focus.rowIndex = Math.min(Math.max(oOptions.info.focus.rowIndex, 0), iBindingLength);
					oOptions.info.focus.colIndex = Math.min(Math.max(oOptions.info.focus.colIndex, 0), this._getColumns(oTable).length - 1);
					this._focusCell(oTable, oOptions.info.focus, oOptions.info.direction);
				}

				// If table is in Single Selection Mode, only select the row with focus in it
				if (mBounds.from.colIndex === 0 && mBounds.to.colIndex === (this._getColumns(oTable).length - 1) && oTable.getSelectionMode() == "Single") {
					mBounds.from.rowIndex = mSelectionBounds.from.rowIndex = oOptions.info.focus.rowIndex;
					mBounds.to.rowIndex = mSelectionBounds.to.rowIndex = oOptions.info.focus.rowIndex;
				}

				for (var iRow = mBounds.from.rowIndex; iRow <= mBounds.to.rowIndex; iRow++) {
					var oRow = this._getRowByIndex(oTable, iRow);
					if (oRow) {
						for (var iCol = mBounds.from.colIndex; iCol <= mBounds.to.colIndex; iCol++) {
							aCells.push([iRow, iCol]);
						}
					}
				}

				return {borderOptions: oBorderOptions, cells: aCells};
			},
			/**
			 * Retrieves the row index for the given cell's DOM reference.
			 * @param {sap.ui.table.Table} oTable table instance
			 * @param {HTMLElement} oCellDomRef DOM reference of cell
			 * @returns {int} row index
			 */
			rowIndex: function (oTable, oCellDomRef) {
				return Element.closestTo(oCellDomRef, true).getIndex();
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
				if ((mPosition.rowIndex < 0 || mPosition.rowIndex >= oTable.getBinding("rows").getLength()
					|| mPosition.colIndex < 0 || mPosition.colIndex >= this._getColumns(oTable).length)
					&& !(mPosition.rowIndex == -Infinity || mPosition.rowIndex == Infinity
					|| mPosition.colIndex == -Infinity || mPosition.colIndex == Infinity)) {
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
				if (iRow >= 0 && iRow < oTable.getBinding("rows").getLength()) {
					if (oTable.getFixedRowCount() > 0 && iRow == oTable.getFixedRowCount()) {
						oTable.setFirstVisibleRow(0);
					} else {
						iDirection == SELECTION_DIRECTION.NEXT ? iFirstRow++ : iFirstRow--;
						iFirstRow = iFirstRow < 0 ? 0 : iFirstRow;
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
					if (!oCellRef) {
						oTable.setFirstVisibleRow(mPosition.rowIndex);
						oCellRef = this.getCellRef(oTable, mPosition);
					}
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
					return oColumn.getDomRef();
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