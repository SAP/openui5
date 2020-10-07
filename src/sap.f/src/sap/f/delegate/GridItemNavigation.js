/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/events/KeyCodes",
	"sap/base/Log"
], function (
	ItemNavigation,
	KeyCodes,
	Log
) {
	"use strict";

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
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
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

	GridItemNavigation.prototype.onfocusin = function (oEvent) {
		ItemNavigation.prototype.onfocusin.call(this, oEvent);

		var oGridControl = jQuery(this.oDomRef).control(0),
			aMatrix = oGridControl._makeMatrix(oGridControl);

		if (oEvent.target === this.oDomRef) {
			this._mCurrentPosition = this._findPositionInMatrix(aMatrix, this.getItemDomRefs().indexOf(this.iFocusedIndex));
		}
	};

	GridItemNavigation.prototype.onsapfocusleave = function (oEvent) {
		ItemNavigation.prototype.onsapfocusleave.call(this, oEvent);
		this._mCurrentPosition = null;
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
		var aItemDomRefs = this.getItemDomRefs();

		// only react on events of the domrefs
		if (aItemDomRefs.indexOf(oEvent.target) === -1) {
			return;
		}
		var oCurrentItem = oEvent.target,
			oGridControl = oEvent.srcControl,
			aMatrix = oGridControl._makeMatrix(oGridControl),
			oStartPosition = this._findPositionInMatrix(aMatrix, oCurrentItem),
			oNextFocusItem;

		if (!this._mCurrentPosition) {
			this._mCurrentPosition = {
				col: oStartPosition.col,
				row: oStartPosition.row
			};
		}

		switch (oEvent.keyCode) {
			case KeyCodes.ARROW_DOWN:
				this._moveFocusDown(oStartPosition, aMatrix, oCurrentItem, oGridControl, oEvent, oNextFocusItem, aItemDomRefs);
				break;
			case KeyCodes.ARROW_RIGHT:
				this._moveFocusRight(oStartPosition, aMatrix, oCurrentItem, oGridControl, oEvent, oNextFocusItem, aItemDomRefs);
				break;
			case KeyCodes.ARROW_UP:
				this._moveFocusUp(oStartPosition, aMatrix, oCurrentItem, oGridControl, oEvent, oNextFocusItem, aItemDomRefs);
				break;
			case KeyCodes.ARROW_LEFT:
				this._moveFocusLeft(oStartPosition, aMatrix, oCurrentItem, oGridControl, oEvent, oNextFocusItem, aItemDomRefs);
				break;
			default:
				break;
		}
	};

	GridItemNavigation.prototype._moveFocusDown = function (oStartPosition, aMatrix, oCurrentItem, oGridControl, oEvent, oNextFocusItem, aItemDomRefs) {
		oStartPosition.col = this._mCurrentPosition.col;

		while (oStartPosition.row < aMatrix.length &&
			(aMatrix[oStartPosition.row][oStartPosition.col] === oCurrentItem || aMatrix[oStartPosition.row][oStartPosition.col] === false)) {
			oStartPosition.row += 1;
		}

		if (oStartPosition.row >= aMatrix.length) {
			this._mCurrentPosition = null;
			oGridControl._onItemNavigationBorderReached(oEvent);
			return;
		}

		if (oStartPosition.row < aMatrix.length) {
		Log.info("Grid matrix position:"  + oStartPosition.row, oStartPosition.col);
			oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.col];
			if (oNextFocusItem) {
				this._mCurrentPosition = oStartPosition;
				this.focusItem(aItemDomRefs.indexOf(oNextFocusItem), oEvent);
				return;
			} else {
				this._mCurrentPosition = null;
				oGridControl._onItemNavigationBorderReached(oEvent);
			}
		}

	};

	GridItemNavigation.prototype._moveFocusRight = function (oStartPosition, aMatrix, oCurrentItem, oGridControl, oEvent, oNextFocusItem, aItemDomRefs) {
		oStartPosition.row = this._mCurrentPosition.row;
		while (oStartPosition.col < aMatrix[oStartPosition.row].length &&
			(aMatrix[oStartPosition.row][oStartPosition.col] === oCurrentItem || aMatrix[oStartPosition.row][oStartPosition.col] === false)) {
			oStartPosition.col += 1;
		}


		if (oStartPosition.row < aMatrix.length) {
			Log.info("Grid matrix position:"  + oStartPosition.row, oStartPosition.col);

			oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.col];
			if (oNextFocusItem) {
				this._mCurrentPosition = oStartPosition;
				this.focusItem(aItemDomRefs.indexOf(oNextFocusItem), oEvent);
				return;
			} else {
				this._mCurrentPosition = null;
				var oLastItemDomRef = aItemDomRefs[aItemDomRefs.length - 1];
				if (oLastItemDomRef === oCurrentItem) {
					oGridControl._onItemNavigationBorderReached(oEvent);
					return;
				}
			}
		}
	};

	GridItemNavigation.prototype._moveFocusUp = function (oStartPosition, aMatrix, oCurrentItem, oGridControl, oEvent, oNextFocusItem, aItemDomRefs) {

		oStartPosition.col = this._mCurrentPosition.col;
		while (oStartPosition.row > 0 && (aMatrix[oStartPosition.row][oStartPosition.col] === oCurrentItem || aMatrix[oStartPosition.row][oStartPosition.col] === false)) {
			oStartPosition.row -= 1;
		}

		if (oStartPosition.row <= 0) {
			this._mCurrentPosition = null;
			oGridControl._onItemNavigationBorderReached(oEvent);
			return;
		}
		if (oStartPosition.row > 0) {
			Log.info("Grid matrix position:"  + oStartPosition.row, oStartPosition.col);

			oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.col];
			if (oNextFocusItem) {
				this._mCurrentPosition = oStartPosition;
				this.focusItem(aItemDomRefs.indexOf(oNextFocusItem), oEvent);
				return;
			} else {
				this._mCurrentPosition = null;
				oGridControl._onItemNavigationBorderReached(oEvent);
			}
		}
	};

	GridItemNavigation.prototype._moveFocusLeft = function (oStartPosition, aMatrix, oCurrentItem, oGridControl, oEvent, oNextFocusItem, aItemDomRefs) {

		oStartPosition.row = this._mCurrentPosition.row;

		while (oStartPosition.col >= 0 && (aMatrix[oStartPosition.row][oStartPosition.col] === oCurrentItem || aMatrix[oStartPosition.row][oStartPosition.col] === false)) {
			oStartPosition.col -= 1;
		}

		if (oStartPosition.row >= 0) {
			Log.info("Grid matrix position:"  + oStartPosition.row, oStartPosition.col);

			oNextFocusItem = aMatrix[oStartPosition.row][oStartPosition.col];
			if (oNextFocusItem) {
				this._mCurrentPosition = oStartPosition;
				this.focusItem(aItemDomRefs.indexOf(oNextFocusItem), oEvent);
				return;
			} else {
				this._mCurrentPosition = null;
				if (aMatrix[0][0] === oCurrentItem) {
					oGridControl._onItemNavigationBorderReached(oEvent);
				}
			}
		}
	};

	GridItemNavigation.prototype._findPositionInMatrix = function (aMatrix, oItem) {

		var oMatrixPositions = null;

		aMatrix.some(function (aInnerRow, iColumnIndex) {

			var iRowIndex = aInnerRow.indexOf(oItem);

			if (iRowIndex !== -1) {
				oMatrixPositions = {};
				oMatrixPositions.row = iColumnIndex;
				oMatrixPositions.col = iRowIndex;
				return true;
			}
			return false;
		});
		return oMatrixPositions;
	};

	return GridItemNavigation;
});
