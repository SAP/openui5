/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/f/library",
	"sap/f/GridNavigationMatrix"
], function (
	Element,
	ItemNavigation,
	KeyCodes,
	Log,
	library,
	GridNavigationMatrix
) {
	"use strict";

	// shortcut for sap.f.NavigationDirection
	const NavigationDirection = library.NavigationDirection;
	const PAGE_SIZE = 10;

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
	var GridItemNavigation = ItemNavigation.extend("sap.f.delegate.GridItemNavigation");

	/**
	 * @override
	 */
	GridItemNavigation.prototype.onfocusin = function (oEvent) {
		ItemNavigation.prototype.onfocusin.call(this, oEvent);

		const aMatrix = this._getGridInstance().getNavigationMatrix();

		if (aMatrix && oEvent.target === this.oDomRef) {
			this._mCurrentPosition = this._findPositionInMatrix(aMatrix, this.getItemDomRefs().indexOf(this.iFocusedIndex));
		}
	};

	/**
	 * @override
	 */
	GridItemNavigation.prototype.onsapfocusleave = function (oEvent) {
		ItemNavigation.prototype.onsapfocusleave.call(this, oEvent);

		if (oEvent.target === this.oDomRef) {
			this.resetFocusPosition();
		}
	};

	/**
	 * @override
	 */
	GridItemNavigation.prototype.onsapnext = function (oEvent) {
		this._moveFocus(oEvent);
	};

	/**
	 * @override
	 */
	GridItemNavigation.prototype.onsapprevious = function (oEvent) {
		this._moveFocus(oEvent);
	};

	/**
	 * @override
	 */
	GridItemNavigation.prototype.onsappageup = function(oEvent) {
		this._moveFocus(oEvent);
	};

	/**
	 * @override
	 */
	GridItemNavigation.prototype.onsappagedown = function (oEvent) {
		this._moveFocus(oEvent);
	};

	GridItemNavigation.prototype.resetFocusPosition = function () {
		this._mCurrentPosition = null;
	};

	GridItemNavigation.prototype.ontap = function () {
		// reset focus position when navigation is performed without keyboard
		this.resetFocusPosition();
	};

	GridItemNavigation.prototype._moveFocus = function (oEvent) {
		const oCurrentItem = oEvent.target;

		// only react on events of the domrefs
		if (this.getItemDomRefs().indexOf(oCurrentItem) === -1) {
			return;
		}

		oEvent.preventDefault();

		const aMatrix = this._getGridInstance().getNavigationMatrix();

		if (!aMatrix) {
			// grid control is not rendered or theme is not applied yet
			return;
		}

		const oStartPosition = this._findPositionInMatrix(aMatrix, oCurrentItem);

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
			case KeyCodes.PAGE_DOWN:
				this._moveFocusDown(oStartPosition, aMatrix, oCurrentItem, oEvent, PAGE_SIZE);
				break;
			case KeyCodes.PAGE_UP:
				this._moveFocusUp(oStartPosition, aMatrix, oCurrentItem, oEvent, PAGE_SIZE);
				break;
			default:
				break;
		}
	};

	GridItemNavigation.prototype._moveFocusDown = function (oStartPosition, aMatrix, oCurrentItem, oEvent, iMinSkipRows = 1) {
		const oPosition = {
			row: oStartPosition.row,
			column: this._mCurrentPosition.column
		};
		const oNextItemPosition = { ...oPosition };
		let oNextFocusItem = aMatrix[oNextItemPosition.row][oNextItemPosition.column];

		while (
			oPosition.row < aMatrix.length - 1
			&& (oNextFocusItem === oCurrentItem || oPosition.row - oStartPosition.row < iMinSkipRows)
		) {
			oPosition.row += 1;

			if (aMatrix[oPosition.row][oPosition.column] !== GridNavigationMatrix.EMPTY_CELL) {
				oNextFocusItem = aMatrix[oPosition.row][oPosition.column];
				oNextItemPosition.row = oPosition.row;
			}
		}

		if (oNextFocusItem === oCurrentItem) {
			this._onBorderReached(oEvent);
			return;
		}

		this._mCurrentPosition = oNextItemPosition;
		this.focusItem(this.getItemDomRefs().indexOf(oNextFocusItem), oEvent);
		Log.info("Grid matrix position: (" + this._mCurrentPosition.row + ", " + this._mCurrentPosition.column + ")");
	};

	GridItemNavigation.prototype._moveFocusRight = function (oStartPosition, aMatrix, oCurrentItem, oEvent) {
		oStartPosition.row = this._mCurrentPosition.row;
		let oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.column];

		while (
			oStartPosition.column < aMatrix[oStartPosition.row].length - 1
			&& oNextFocusItem === oCurrentItem
		) {
			oStartPosition.column += 1;

			if (aMatrix[oStartPosition.row][oStartPosition.column] !== GridNavigationMatrix.EMPTY_CELL) {
				oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.column];
			}
		}

		if (oNextFocusItem === oCurrentItem) {
			this._onBorderReached(oEvent);
			return;
		}

		this._mCurrentPosition = oStartPosition;
		this.focusItem(this.getItemDomRefs().indexOf(oNextFocusItem), oEvent);
		Log.info("Grid matrix position: (" + this._mCurrentPosition.row + ", " + this._mCurrentPosition.column + ")");
	};

	GridItemNavigation.prototype._moveFocusUp = function (oStartPosition, aMatrix, oCurrentItem, oEvent, iMinSkipRows = 1) {
		const oPosition = {
			row: oStartPosition.row,
			column: this._mCurrentPosition.column
		};
		const oNextItemPosition = { ...oPosition };
		let oNextFocusItem = aMatrix[oNextItemPosition.row][oNextItemPosition.column];

		while (
			oPosition.row > 0
			&& (oNextFocusItem === oCurrentItem || oStartPosition.row - oPosition.row < iMinSkipRows)
		) {
			oPosition.row -= 1;

			if (aMatrix[oPosition.row][oPosition.column] !== GridNavigationMatrix.EMPTY_CELL) {
				oNextFocusItem = aMatrix[oPosition.row][oPosition.column];
				oNextItemPosition.row = oPosition.row;
			}
		}

		if (oNextFocusItem === oCurrentItem) {
			this._onBorderReached(oEvent);
			return;
		}

		// move to the upper top row index
		while (oNextItemPosition.row > 0 && aMatrix[oNextItemPosition.row - 1][oNextItemPosition.column] === oNextFocusItem) {
			oNextItemPosition.row -= 1;
		}

		this._mCurrentPosition = oNextItemPosition;
		this.focusItem(this.getItemDomRefs().indexOf(oNextFocusItem), oEvent);
		Log.info("Grid matrix position: (" + this._mCurrentPosition.row + ", " + this._mCurrentPosition.column + ")");
	};

	GridItemNavigation.prototype._moveFocusLeft = function (oStartPosition, aMatrix, oCurrentItem, oEvent) {
		oStartPosition.row = this._mCurrentPosition.row;
		let oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.column];

		while (
			oStartPosition.column > 0
			&& oNextFocusItem === oCurrentItem
		) {
			oStartPosition.column -= 1;

			if (aMatrix[oStartPosition.row][oStartPosition.column] !== GridNavigationMatrix.EMPTY_CELL) {
				oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.column];
			}
		}

		if (oNextFocusItem === oCurrentItem) {
			this._onBorderReached(oEvent);
			return;
		}

		// move to the most left column index
		while (oStartPosition.column > 0 && aMatrix[oStartPosition.row][oStartPosition.column - 1] === oNextFocusItem) {
			oStartPosition.column -= 1;
		}

		this._mCurrentPosition = oStartPosition;
		this.focusItem(this.getItemDomRefs().indexOf(oNextFocusItem), oEvent);
		Log.info("Grid matrix position: (" + this._mCurrentPosition.row + ", " + this._mCurrentPosition.column + ")");
	};

	GridItemNavigation.prototype._findPositionInMatrix = function (aMatrix, oItem) {
		let oMatrixPositions = null;

		aMatrix.some(function (aInnerRow, iColumnIndex) {
			const iRowIndex = aInnerRow.indexOf(oItem);

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
		let sDirection;

		switch (oEvent.keyCode) {
			case KeyCodes.ARROW_RIGHT:
				sDirection = NavigationDirection.Right;
				break;
			case KeyCodes.ARROW_LEFT:
				sDirection = NavigationDirection.Left;
				break;
			case KeyCodes.ARROW_DOWN:
			case KeyCodes.PAGE_DOWN:
				sDirection = NavigationDirection.Down;
				break;
			case KeyCodes.ARROW_UP:
			case KeyCodes.PAGE_UP:
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
		const aMatrix = oGrid.getNavigationMatrix();
		let oCurrentItem,
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
		return Element.closestTo(this.oDomRef);
	};

	return GridItemNavigation;
});