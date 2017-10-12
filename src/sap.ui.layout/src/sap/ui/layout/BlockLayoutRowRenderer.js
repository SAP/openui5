/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
	function (library) {
		"use strict";

		// shortcut for sap.ui.layout.BlockBackgroundType
		var BlockBackgroundType = library.BlockBackgroundType;

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
		};

		BlockLayoutRowRenderer.renderContent = function (oRm, oBlockLayoutRow) {
			var aContent = oBlockLayoutRow.getContent(),
				bScrollable = oBlockLayoutRow.getScrollable(),
				oBackgrounds = BlockBackgroundType,
				sLayoutBackground = oBlockLayoutRow.getParent().getBackground(),
				aAccentedCells = oBlockLayoutRow.getAccentCells(),
				iContentCounter = 0,
				flexWidth;

			aContent.forEach(function (oCell, index) {
				(index % 2) == 0 ? oCell.addStyleClass("sapUiBlockLayoutOddCell") : oCell.addStyleClass("sapUiBlockLayoutEvenCell");
				if (bScrollable) {
					oCell.addStyleClass("sapUiBlockScrollableCell");
				} else {
					oCell.addStyleClass("sapUiBlockHorizontalCell");
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
			var arrangement = oBlockLayoutRow._getCellArangementForCurrentSize();
			if (bScrollable) {
				/**
				 * The arrangement is passed from the BlockLayout to the BlockLayoutRow after the BlockLayout is rendered.
				 * This means that we need to rerender the BlockLayoutRow after its initial rendering, because the size was previously unknown
				 */
				aContent.forEach(oRm.renderControl);
			} else if (arrangement) {
				for (var i = 0; i < arrangement.length; i++) {
					var aSubRow = arrangement[i];
					oRm.write("<div ");
					oRm.addStyle("display", "flex");
					oRm.writeStyles();
					oRm.write(">");

					for (var j = 0; j < aSubRow.length; j++) {
						flexWidth = aSubRow[j];
						aContent[iContentCounter]._setFlexWidth(flexWidth);
						oRm.renderControl(aContent[iContentCounter]);
						iContentCounter++;
					}
					oRm.write("</div>");
				}
			}
		};

		BlockLayoutRowRenderer.endRow = function (oRm) {
			oRm.write("</div>");
		};

		return BlockLayoutRowRenderer;
	}, /* bExport= */ true);
