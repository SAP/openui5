/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/f/library",
	"sap/ui/thirdparty/jquery"
], function (
	ItemNavigation,
	KeyCodes,
	Log,
	library,
	jQuery
) {
	"use strict";

	// shortcut for sap.f.NavigationDirection
	var NavigationDirection = library.NavigationDirection;

	/**
	 * Constructor for a new <code>sap.f.delegate.GridItemNavigation</code>.
	 *
	 * @param {object} [mSettings] Initial settings
	 *
	 * @class
	 * ...
	 *
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.core.delegate.ItemNavigation
	 *
	 * @private
	 * @constructor
	 * @alias sap.f.delegate.GridItemNavigation
	 */
	var GridItemNavigation = ItemNavigation.extend("sap.f.delegate.GridItemNavigation", /** @lends sap.f.GridItemNavigation.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

			},
			events: {

			}
		}
	});

	GridItemNavigation.prototype.resetFocusPosition = function () {
		this._mCurrentPosition = null;
	};

	GridItemNavigation.prototype.onfocusin = function (oEvent) {
		ItemNavigation.prototype.onfocusin.call(this, oEvent);

		var aMatrix = this._getGridInstance().getNavigationMatrix();

		if (aMatrix && oEvent.target === this.oDomRef) {
			this._mCurrentPosition = this._findPositionInMatrix(aMatrix, this.getItemDomRefs().indexOf(this.iFocusedIndex));
		}
	};

	GridItemNavigation.prototype.onsapfocusleave = function (oEvent) {
		ItemNavigation.prototype.onsapfocusleave.call(this, oEvent);

		if (oEvent.target === this.oDomRef) {
			this.resetFocusPosition();
		}
	};

	GridItemNavigation.prototype.ontap = function (oEvent) {
		// reset focus position when navigation is performed without keyboard
		this.resetFocusPosition();
	};

	/**
	 * Handles the onsapnext event
	 * Sets the focus to the next item
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	GridItemNavigation.prototype.onsapnext = function (oEvent) {
		this._moveFocus(oEvent);
	};

	/**
	 * Handles the onsapprevious event
	 * Sets the focus to the previous item
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	GridItemNavigation.prototype.onsapprevious = function (oEvent) {
		this._moveFocus(oEvent);
	};

	GridItemNavigation.prototype._moveFocus = function (oEvent) {
		var aItemDomRefs = this.getItemDomRefs(),
			oCurrentItem = oEvent.target,
			aMatrix,
			oStartPosition;

		// only react on events of the domrefs
		if (aItemDomRefs.indexOf(oEvent.target) === -1) {
			return;
		}

		oEvent.preventDefault();

		aMatrix = this._getGridInstance().getNavigationMatrix();

		if (!aMatrix) {
			// grid control is not rendered or theme is not applied yet
			return;
		}

		oStartPosition = this._findPositionInMatrix(aMatrix, oCurrentItem);

		if (!this._mCurrentPosition) {
			this._mCurrentPosition = {
				column: oStartPosition.column,
				row: oStartPosition.row
			};
		}

		switch (oEvent.keyCode) {
			case KeyCodes.ARROW_DOWN:
				this._moveFocusDown(oStartPosition, aMatrix, oCurrentItem, oEvent);
				break;
			case KeyCodes.ARROW_RIGHT:
				this._moveFocusRight(oStartPosition, aMatrix, oCurrentItem, oEvent);
				break;
			case KeyCodes.ARROW_UP:
				this._moveFocusUp(oStartPosition, aMatrix, oCurrentItem, oEvent);
				break;
			case KeyCodes.ARROW_LEFT:
				this._moveFocusLeft(oStartPosition, aMatrix, oCurrentItem, oEvent);
				break;
			default:
				break;
		}

		Log.info("Grid matrix position: (" + oStartPosition.row + ", " + oStartPosition.column + ")");
	};

	GridItemNavigation.prototype._moveFocusDown = function (oStartPosition, aMatrix, oCurrentItem, oEvent) {

		var aItemDomRefs = this.getItemDomRefs(),
			oNextFocusItem;

		oStartPosition.column = this._mCurrentPosition.column;

		while (oStartPosition.row < aMatrix.length &&
			(aMatrix[oStartPosition.row][oStartPosition.column] === oCurrentItem || aMatrix[oStartPosition.row][oStartPosition.column] === false)) {
			oStartPosition.row += 1;
		}

		if (oStartPosition.row >= aMatrix.length) {
			this._onBorderReached(oEvent);
			return;
		}

		oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.column];
		if (oNextFocusItem) {
			this._mCurrentPosition = oStartPosition;
			this.focusItem(aItemDomRefs.indexOf(oNextFocusItem), oEvent);
		} else {
			this._onBorderReached(oEvent);
		}
	};

	GridItemNavigation.prototype._moveFocusRight = function (oStartPosition, aMatrix, oCurrentItem, oEvent) {
		var aItemDomRefs = this.getItemDomRefs(),
			oNextFocusItem;

		oStartPosition.row = this._mCurrentPosition.row;

		while (oStartPosition.column < aMatrix[oStartPosition.row].length &&
			(aMatrix[oStartPosition.row][oStartPosition.column] === oCurrentItem || aMatrix[oStartPosition.row][oStartPosition.column] === false)) {
			oStartPosition.column += 1;
		}

		if (oStartPosition.column >= aMatrix[oStartPosition.row].length) {
			this._onBorderReached(oEvent);
			return;
		}

		oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.column];
		if (oNextFocusItem) {
			this._mCurrentPosition = oStartPosition;
			this.focusItem(aItemDomRefs.indexOf(oNextFocusItem), oEvent);
		} else {
			this._onBorderReached(oEvent);
		}
	};

	GridItemNavigation.prototype._moveFocusUp = function (oStartPosition, aMatrix, oCurrentItem, oEvent) {
		var aItemDomRefs = this.getItemDomRefs(),
			oNextFocusItem;

		oStartPosition.column = this._mCurrentPosition.column;

		while (oStartPosition.row >= 0 &&
			(aMatrix[oStartPosition.row][oStartPosition.column] === oCurrentItem || aMatrix[oStartPosition.row][oStartPosition.column] === false)) {
			oStartPosition.row -= 1;
		}

		if (oStartPosition.row < 0) {
			this._onBorderReached(oEvent);
			return;
		}

		oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.column];
		if (oNextFocusItem) {

			// move to the upper top row index
			while (oStartPosition.row > 0 && aMatrix[oStartPosition.row - 1][oStartPosition.column] === oNextFocusItem) {
				oStartPosition.row -= 1;
			}

			this._mCurrentPosition = oStartPosition;
			this.focusItem(aItemDomRefs.indexOf(oNextFocusItem), oEvent);
		} else {
			this._onBorderReached(oEvent);
		}
	};

	GridItemNavigation.prototype._moveFocusLeft = function (oStartPosition, aMatrix, oCurrentItem, oEvent) {
		var aItemDomRefs = this.getItemDomRefs(),
			oNextFocusItem;

		oStartPosition.row = this._mCurrentPosition.row;

		while (oStartPosition.column >= 0 &&
			(aMatrix[oStartPosition.row][oStartPosition.column] === oCurrentItem || aMatrix[oStartPosition.row][oStartPosition.column] === false)) {
			oStartPosition.column -= 1;
		}

		if (oStartPosition.column < 0) {
			this._onBorderReached(oEvent);
			return;
		}

		oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.column];
		if (oNextFocusItem) {

			// move to the most left column index
			while (oStartPosition.column > 0 && aMatrix[oStartPosition.row][oStartPosition.column - 1] === oNextFocusItem) {
				oStartPosition.column -= 1;
			}

			this._mCurrentPosition = oStartPosition;
			this.focusItem(aItemDomRefs.indexOf(oNextFocusItem), oEvent);
		} else {
			this._onBorderReached(oEvent);
		}
	};

	GridItemNavigation.prototype._findPositionInMatrix = function (aMatrix, oItem) {

		var oMatrixPositions = null;

		aMatrix.some(function (aInnerRow, iColumnIndex) {

			var iRowIndex = aInnerRow.indexOf(oItem);

			if (iRowIndex !== -1) {
				oMatrixPositions = {};
				oMatrixPositions.row = iColumnIndex;
				oMatrixPositions.column = iRowIndex;
				return true;
			}
			return false;
		});
		return oMatrixPositions;
	};

	GridItemNavigation.prototype._onBorderReached = function (oEvent) {
		var sDirection;

		switch (oEvent.keyCode) {
			case KeyCodes.ARROW_RIGHT:
				sDirection = NavigationDirection.Right;
				break;
			case KeyCodes.ARROW_LEFT:
				sDirection = NavigationDirection.Left;
				break;
			case KeyCodes.ARROW_DOWN:
				sDirection = NavigationDirection.Down;
				break;
			case KeyCodes.ARROW_UP:
				sDirection = NavigationDirection.Up;
				break;
		}

		this._getGridInstance().onItemNavigationBorderReached({
			event: oEvent,
			row: this._mCurrentPosition.row,
			column: this._mCurrentPosition.column,
			direction: sDirection
		});
	};

	GridItemNavigation.prototype.focusItemByDirection = function (oGrid, sDirection, iRow, iColumn) {
		var oCurrentItem,
			aMatrix = oGrid.getNavigationMatrix(),
			aRow,
			iRowIndex,
			iColIndex;

		switch (sDirection) {
			case NavigationDirection.Right:
				iRowIndex = iRow;
				iColIndex = -1;
				aRow = aMatrix[iRow];

				if (aRow) {
					do {
						oCurrentItem = aRow[++iColIndex];
					} while (!oCurrentItem);
				}
				break;
			case NavigationDirection.Left:
				iRowIndex = iRow;
				iColIndex = aMatrix[0].length;
				aRow = aMatrix[iRow];

				if (aRow) {
					do {
						oCurrentItem = aRow[--iColIndex];
					} while (!oCurrentItem);
				}
				// move to the most left column index
				if (oCurrentItem) {
					while (iColIndex > 0 && aMatrix[iRow][iColIndex - 1] === oCurrentItem) {
						iColIndex--;
					}
				}

				break;
			case NavigationDirection.Down:
				iRowIndex = -1;
				iColIndex = iColumn;

				while (!oCurrentItem && aMatrix[++iRowIndex] && aMatrix[iRowIndex][iColumn] !== undefined) {
					oCurrentItem = aMatrix[iRowIndex][iColumn];
				}
				break;
			case NavigationDirection.Up:
				iRowIndex = aMatrix.length;
				iColIndex = iColumn;

				while (!oCurrentItem && aMatrix[--iRowIndex] && aMatrix[iRowIndex][iColumn] !== undefined) {
					oCurrentItem = aMatrix[iRowIndex][iColumn];
				}

				// move to the upper top row index
				if (oCurrentItem) {
					while (iRowIndex > 0 && aMatrix[iRowIndex - 1][iColumn] === oCurrentItem) {
						iRowIndex--;
					}
				}
				break;
			default:
				break;
		}

		if (!oCurrentItem) {
			return;
		}

		this._mCurrentPosition = {
			column: iColIndex,
			row: iRowIndex
		};

		oCurrentItem.focus();
	};

	GridItemNavigation.prototype._getGridInstance = function () {
		return jQuery(this.oDomRef).control(0);
	};

	return GridItemNavigation;
});