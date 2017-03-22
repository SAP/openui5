/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library'],
	function (jQuery, library) {
		"use strict";

		var BlockLayoutRowRenderer = {};

		BlockLayoutRowRenderer.render = function (oRm, oBlockLayoutRow){
			this.startRow(oRm, oBlockLayoutRow);
			this.renderContent(oRm, oBlockLayoutRow);
			this.endRow(oRm, oBlockLayoutRow);
		};

		BlockLayoutRowRenderer.startRow = function (oRm, oBlockLayoutRow) {
			oRm.write("<div");
			oRm.writeControlData(oBlockLayoutRow);
			oRm.addClass("sapUiBlockLayoutRow");
			this.addRowRenderingClass(oRm, oBlockLayoutRow);
			oRm.writeStyles();
			oRm.writeClasses();
			oRm.write(">");
		};

		BlockLayoutRowRenderer.addRowRenderingClass = function (oRm, oBlockLayoutRow) {
			if (oBlockLayoutRow.getScrollable()) {
				oRm.addClass("sapUiBlockScrollingRow");
				if (oBlockLayoutRow.getContent().length >= 6) {
					oRm.addClass("sapUiBlockScrollingNarrowCells");
				}
			} else {
				oRm.addClass("sapUiBlockHorizontalCellsRow");
			}

			if (oBlockLayoutRow._rowSCase) {
				oRm.addClass("sapUiBlockRowSCase");
			}
		};

		BlockLayoutRowRenderer.renderContent = function (oRm, oBlockLayoutRow) {
			var aContent = oBlockLayoutRow.getContent(),
				scrollable = oBlockLayoutRow.getScrollable(),
				oBackgrounds = sap.ui.layout.BlockBackgroundType,
				sLayoutBackground = oBlockLayoutRow.getParent().getBackground(),
				aAccentedCells = oBlockLayoutRow.getAccentCells();

			aContent.forEach(function (cell) {
				if (scrollable) {
					cell.addStyleClass("sapUiBlockScrollableCell");
				} else {
					cell.addStyleClass("sapUiBlockHorizontalCell");
				}
			});

			switch (sLayoutBackground) {
				case oBackgrounds.Mixed:
					oBlockLayoutRow._processMixedCellStyles(aAccentedCells[0], aContent);
					break;
				case oBackgrounds.Accent :
					oBlockLayoutRow._processAccentCellStyles(aAccentedCells, aContent);
					break;
			}

			aContent.forEach(oRm.renderControl);
		};

		BlockLayoutRowRenderer.endRow = function (oRm) {
			oRm.write("</div>");
		};

		return BlockLayoutRowRenderer;

	}, /* bExport= */ true);
