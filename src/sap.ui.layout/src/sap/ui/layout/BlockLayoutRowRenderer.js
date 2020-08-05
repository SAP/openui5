/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
	function (library) {
		"use strict";

		// shortcut for sap.ui.layout.BlockBackgroundType
		var BlockBackgroundType = library.BlockBackgroundType;

		var BlockLayoutRowRenderer = {
			apiVersion: 2
		};

		BlockLayoutRowRenderer.render = function (oRm, oBlockLayoutRow){
			this.startRow(oRm, oBlockLayoutRow);
			this.renderContent(oRm, oBlockLayoutRow);
			this.endRow(oRm, oBlockLayoutRow);
		};

		BlockLayoutRowRenderer.startRow = function (oRm, oBlockLayoutRow) {
			oRm.openStart("div", oBlockLayoutRow)
				.class("sapUiBlockLayoutRow");
			this.addRowRenderingClass(oRm, oBlockLayoutRow);
			oRm.openEnd();
		};

		BlockLayoutRowRenderer.addRowRenderingClass = function (oRm, oBlockLayoutRow) {
			if (oBlockLayoutRow.getScrollable()) {
				oRm.class("sapUiBlockScrollingRow");
				if (oBlockLayoutRow.getContent().length >= 6) {
					oRm.class("sapUiBlockScrollingNarrowCells");
				}
			} else {
				oRm.class("sapUiBlockHorizontalCellsRow");
			}
		};

		BlockLayoutRowRenderer.renderContent = function (oRm, oBlockLayoutRow) {
			var aContent = oBlockLayoutRow.getContent(),
				bScrollable = oBlockLayoutRow.getScrollable(),
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
				case BlockBackgroundType.Mixed:
					if (aAccentedCells.length > 0) {
						oBlockLayoutRow._processMixedCellStyles(aAccentedCells[aAccentedCells.length - 1], aContent);
					}
					break;
				case BlockBackgroundType.Accent :
					oBlockLayoutRow._processAccentCellStyles(aAccentedCells, aContent);
					break;
			}

			var arrangement = oBlockLayoutRow._getCellArangementForCurrentSize();
			if (bScrollable) {
				/**
				 * The arrangement is passed from the BlockLayout to the BlockLayoutRow after the BlockLayout is rendered.
				 * This means that we need to rerender the BlockLayoutRow after its initial rendering, because the size was previously unknown
				 */
				aContent.forEach(oRm.renderControl, oRm);
			} else if (arrangement) {
				for (var i = 0; i < arrangement.length; i++) {
					var aSubRow = arrangement[i];
					oRm.openStart("div");
					oRm.style("display", "flex");
					oRm.openEnd();

					for (var j = 0; j < aSubRow.length; j++) {
						flexWidth = aSubRow[j];
						aContent[iContentCounter]._setFlexWidth(flexWidth);
						oRm.renderControl(aContent[iContentCounter]);
						iContentCounter++;
					}
					oRm.close("div");
				}
			}
		};

		BlockLayoutRowRenderer.endRow = function (oRm) {
			oRm.close("div");
		};

		return BlockLayoutRowRenderer;
	}, /* bExport= */ true);
