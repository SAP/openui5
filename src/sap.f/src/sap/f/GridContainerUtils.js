/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/Device"
], function (Device) {
	"use strict";

	return {
		/**
		 * @param {sap.ui.core.Control} oItem Item from the GridContainer
		 * @param {HTMLElement} oElement HTML Element
		 * @returns {boolean} Whether oElement is above oItem
		 */
		isAbove: function (oItem, oElement) {
			var fY1 = oItem.getDomRef().getBoundingClientRect().top,
				fY2 = oElement.getBoundingClientRect().top;

			return fY2 - fY1 < 0;
		},

		/**
		 * @param {sap.ui.core.Control} oItem Item from the GridContainer
		 * @param {HTMLElement} oElement HTML Element
		 * @returns {boolean} Whether oElement is below oItem
		 */
		isBelow: function (oItem, oElement) {
			var fY1 = oItem.getDomRef().getBoundingClientRect().top,
				fY2 = oElement.getBoundingClientRect().top;

			return fY2 - fY1 > 0;
		},

		/**
		 * @param {sap.ui.core.Control} oItem The item around which the closest will be searched
		 * @param {*} aElements Elements, which will be searched
		 * @returns {HTMLElement} The closest element to oItem
		 */
		findClosest: function (oItem, aElements) {
			var oClosestItem = null,
				fClosestDistance = Number.POSITIVE_INFINITY,
				fX1 = oItem.getDomRef().getBoundingClientRect().left,
				fY1 = oItem.getDomRef().getBoundingClientRect().top;

			aElements.forEach(function (oElement) {

				var fX2 = oElement.getBoundingClientRect().left,
					fY2 = oElement.getBoundingClientRect().top;

				var fDistSquared = (fX2 - fX1) * (fX2 - fX1) + (fY2 - fY1) * (fY2 - fY1);

				if (fDistSquared < fClosestDistance) {
					oClosestItem = oElement;
					fClosestDistance = fDistSquared;
				}
			});

			return oClosestItem;
		},

		/**
		 * @param {sap.ui.core.Control} oItem The closest Grid Container will be searched
		 * @param {*} aElements Elements, which will be searched
		 * @returns {HTMLElement} The closest element to oItem
		 */
		findClosestGridContainer: function (oItem, aElements) {
			var oClosestGridContainer = null,
				fClosestDistance = Number.POSITIVE_INFINITY,
				fY1 = oItem.getDomRef().getBoundingClientRect().top;

			aElements.forEach(function (oElement) {

				var fY2 = oElement.getBoundingClientRect().top;

				var fDistSquared = (fY2 - fY1) * (fY2 - fY1);

				if (fDistSquared < fClosestDistance) {
					oClosestGridContainer = oElement;
					fClosestDistance = fDistSquared;
				}
			});

			return oClosestGridContainer;
		},


		/**
		 * Indicates whether the grid is supported by the browser.
		 * @returns {boolean} If native grid is supported by the browser
		 */
		isGridSupportedByBrowser: function () {
			return !Device.browser.msie;
		},

		/**
		 * Creates an array of DomRef arrays representing the GridContainer's items ordered as rendered on the page
		 * @param {sap.f.GridContainer} oGrid The control instance
		 * @returns {HTMLElement[]} Array of DomRef arrays
		 */
		makeMatrix: function (oGrid) {
			var oGridDomRef = oGrid.getDomRef(),
				mGridStyles = window.getComputedStyle(oGridDomRef),

				bGridSupport = this.isGridSupportedByBrowser(),
				aCssRows = bGridSupport ? mGridStyles.gridTemplateRows.split(/\s+/) : [],
				iColumns = bGridSupport ? mGridStyles.gridTemplateColumns.split(/\s+/).length : oGrid.IeColumns,
				iRows = bGridSupport ? aCssRows.length : oGrid.IeRows,
				aMatrix = Array.from(new Array(iRows), function () { return new Array(iColumns).fill(false); }),
				oLayoutSettings = oGrid.getActiveLayoutSettings(),
				oLayoutSizes = {
					gap: oLayoutSettings.getGapInPx(),
					row: oLayoutSettings.getRowSizeInPx(),
					column: oLayoutSettings.getMinColumnSizeInPx() || oLayoutSettings.getColumnSizeInPx(),
					cssRows: aCssRows
				},
				aItems = oGrid.getItems();

			if (!aItems.length) {
				return [];
			}

			aItems.forEach(function (oItem) {
				if (!oItem.getVisible()) {
					return;
				}

				var oWrapperDomRef = oGrid.getItemWrapper(oItem),
					oPos = this._getPosition(oWrapperDomRef.getBoundingClientRect(), oGrid, oLayoutSizes);

				this._addToMatrix(aMatrix, oPos, oWrapperDomRef);
			}.bind(this));

			return aMatrix;
		},

		_getPosition: function (oItemRect, oGrid, oLayoutSizes) {
			var oGridRect = oGrid.getDomRef().getBoundingClientRect(),
				iTopOffsetInGrid = Math.round(oItemRect.top - oGridRect.top),
				iLeftOffsetInGrid = Math.round(oItemRect.left - oGridRect.left),

				iStartRow = Math.floor(iTopOffsetInGrid / (oLayoutSizes.row + oLayoutSizes.gap)),
				iStartCol = Math.floor(iLeftOffsetInGrid / (oLayoutSizes.column + oLayoutSizes.gap)),
				oLayoutSettings = oGrid.getActiveLayoutSettings(),
				iEndRow = oLayoutSettings.calculateRowsForItem(oItemRect.height),
				iEndCol = oLayoutSettings.calculateColumnsForItem(oItemRect.width);

			if (oGrid.getInlineBlockLayout() && this.isGridSupportedByBrowser()) {
				iStartRow = this._findStartRowOnInlineBlockLayout(iTopOffsetInGrid, oLayoutSizes);
				iEndRow = 1; // with InlineBlockLayout grid items always span 1 row
			}

			return {
				xFrom: iStartRow,
				xTo: iEndRow + iStartRow,
				yFrom: iStartCol,
				yTo: iEndCol + iStartCol
			};
		},

		/**
		 * Returns the starting row that the current item starts from when the grid has uneven rows.
		 * @param {int} iTopOffsetInGrid top position of item in the grid
		 * @param {object} oLayoutSizes the grid's layout sizes
		 * @returns {int} starting row
		 */
		_findStartRowOnInlineBlockLayout: function (iTopOffsetInGrid, oLayoutSizes) {
			var iStartRow = 0,
				iSumRows = 0,
				i;

			for (i = 0; i < oLayoutSizes.cssRows.length; i++) {
				iSumRows += Math.floor(Number.parseFloat(oLayoutSizes.cssRows[i]) + oLayoutSizes.gap);

				if (iTopOffsetInGrid < iSumRows) {
					break;
				}

				iStartRow++;
			}

			return iStartRow;
		},

		_addToMatrix: function (aMatrix, oPosition, oDomRef) {
			var iRow, iCol;

			for (iRow = oPosition.xFrom; iRow < oPosition.xTo; iRow++) {
				for (iCol = oPosition.yFrom; iCol < oPosition.yTo; iCol++) {
					aMatrix[iRow][iCol] = oDomRef;
				}
			}
		}

	};
});