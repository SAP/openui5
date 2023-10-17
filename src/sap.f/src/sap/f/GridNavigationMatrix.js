/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */

sap.ui.define([
], function(

) {
	"use strict";

	return {
		EMPTY_CELL: false,

		/**
		 * Creates a matrix (2D array) of dom refs representing the grid items ordered as rendered on the page
		 * @param {HTMLElement} oGridDomRef The grid
		 * @param {Array.<HTMLElement>} aItemsDomRefs The children
		 * @returns {Array.<Array.<HTMLElement>>} The matrix
		 */
		create: function (oGridDomRef, aItemsDomRefs) {
			const mGridStyles = window.getComputedStyle(oGridDomRef);

			const oLayoutSizes = {
				columns: mGridStyles.gridTemplateColumns.split(/\s+/),
				rows: mGridStyles.gridTemplateRows.split(/\s+/),
				rowGap: parseFloat(mGridStyles.rowGap),
				columnGap: parseFloat(mGridStyles.columnGap),
				paddingTop: parseFloat(mGridStyles.paddingTop),
				paddingLeft: parseFloat(mGridStyles.paddingLeft),
				paddingRight: parseFloat(mGridStyles.paddingRight)
			};

			const aMatrix = Array.from(
				new Array(oLayoutSizes.rows.length),
				function () {
					return new Array(oLayoutSizes.columns.length).fill(this.EMPTY_CELL);
				}.bind(this)
			);

			aItemsDomRefs.forEach(function (oItemDomRef) {
				const oPos = this._getPosition(oGridDomRef, oItemDomRef, oLayoutSizes);

				this._addToMatrix(aMatrix, oPos, oItemDomRef);
			}.bind(this));

			return aMatrix;
		},

		_getPosition: function (oGridDomRef, oItemDomRef, oLayoutSizes) {
			const oGridRect = oGridDomRef.getBoundingClientRect();
			const oItemRect = oItemDomRef.getBoundingClientRect();
			const oGridRow = this._getGridRow(oGridRect, oItemRect, oLayoutSizes);
			const oGridCol = this._getGridCol(oGridRect, oItemRect, oLayoutSizes);

			return {
				xFrom: oGridRow.start,
				xTo: oGridRow.end,
				yFrom: oGridCol.start,
				yTo: oGridCol.end
			};
		},

		_getGridRow: function (oGridRect, oItemRect, oLayoutSizes) {
			let iStartRow = -1,
				iEndRow = 0,
				fSumRows = 0;
			const fTopOffsetInGrid = oItemRect.top - oGridRect.top - oLayoutSizes.paddingTop;
			const fBottomOffsetInGrid = fTopOffsetInGrid + oItemRect.height;

			for (let i = 0; i < oLayoutSizes.rows.length; i++) {
				fSumRows += parseFloat(oLayoutSizes.rows[i]);

				if (iStartRow === -1 && fTopOffsetInGrid < fSumRows) {
					iStartRow = i;
				}

				fSumRows += oLayoutSizes.rowGap;

				if (Math.round(fBottomOffsetInGrid) <= Math.round(fSumRows)) {
					iEndRow = i + 1;
					break;
				}
			}

			return {
				start: iStartRow,
				end: iEndRow
			};
		},

		_getGridCol: function (oGridRect, oItemRect, oLayoutSizes) {
			let iStartCol,
				iEndCol,
				fSumCols = 0,
				fLeftOffsetInGrid,
				fRightOffsetInGrid;

			if (undefined/*Configuration*/.getRTL()) {
				iEndCol = -1;
				iStartCol = oLayoutSizes.columns.length - 1;
				fRightOffsetInGrid = oGridRect.right - oLayoutSizes.paddingRight - oItemRect.right;
				fLeftOffsetInGrid = fRightOffsetInGrid + oItemRect.width;

				for (let i = oLayoutSizes.columns.length; i > 0; i--) {
					fSumCols += parseFloat(oLayoutSizes.columns[i - 1]);

					if (iEndCol === -1 && fRightOffsetInGrid < fSumCols) {
						iEndCol = i;
					}

					fSumCols += oLayoutSizes.columnGap;

					if (Math.round(fLeftOffsetInGrid) <= Math.round(fSumCols)) {
						iStartCol = i - 1;
						break;
					}
				}
			} else {
				iStartCol = -1;
				iEndCol = 0;
				fLeftOffsetInGrid = oItemRect.left - oGridRect.left - oLayoutSizes.paddingLeft;
				fRightOffsetInGrid = fLeftOffsetInGrid + oItemRect.width;

				for (let i = 0; i < oLayoutSizes.columns.length; i++) {
					fSumCols += parseFloat(oLayoutSizes.columns[i]);

					if (iStartCol === -1 && fLeftOffsetInGrid < fSumCols) {
						iStartCol = i;
					}

					fSumCols += oLayoutSizes.columnGap;

					if (Math.round(fRightOffsetInGrid) <= Math.round(fSumCols)) {
						iEndCol = i + 1;
						break;
					}
				}
			}

			return {
				start: iStartCol,
				end: iEndCol
			};
		},

		_addToMatrix: function (aMatrix, oPosition, oDomRef) {
			for (let iRow = oPosition.xFrom; iRow < oPosition.xTo; iRow++) {
				for (let iCol = oPosition.yFrom; iCol < oPosition.yTo; iCol++) {
					aMatrix[iRow][iCol] = oDomRef;
				}
			}
		}
	};

});