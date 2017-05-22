/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library'],
	function(jQuery, library) {
		"use strict";

		var BlockLayoutCellRenderer = {};

		BlockLayoutCellRenderer.render = function (rm, blockLayoutCell) {
			this.startCell(rm, blockLayoutCell);
			this.addContent(rm, blockLayoutCell);
			this.endCell(rm);
		};

		BlockLayoutCellRenderer.startCell = function (oRm, oBlockLayoutCell) {
			var sCellColor = this.getCellColor(oRm, oBlockLayoutCell);

			oRm.write("<div");
			oRm.writeControlData(oBlockLayoutCell);
			oRm.addClass("sapUiBlockLayoutCell");
			sCellColor && oRm.addClass(sCellColor); // Set any of the predefined cell colors

			if (oBlockLayoutCell._getDifferentSBreakpointSize()) {
				this.setDifferentSBreakpointSize(oRm, oBlockLayoutCell._getWidthToRowWidthRatio());
			} else {
				this.setWidth(oRm, oBlockLayoutCell);
			}

			oRm.writeStyles();
			oRm.writeClasses();
			oRm.write(">");
		};

		BlockLayoutCellRenderer.getCellColor = function (oRm, oBlockLayoutCell) {
			var sColorSet = oBlockLayoutCell.getBackgroundColorSet(),
				sColorIndex = oBlockLayoutCell.getBackgroundColorShade();

			if (!sColorSet && !sColorIndex) {
				return "";
			} else if (( sColorSet && !sColorIndex ) || ( !sColorSet && sColorIndex )) { // XOR check. Both values need to be either defined or not defined.
				jQuery.sap.log.warning("Both, backgroundColorSet and backgroundColorShade should be defined. ColoSet is not applied to " + oBlockLayoutCell.getId() + ".");
				return "";
			}

			// Get only the unique part of the string
			sColorSet = sColorSet.replace("ColorSet", "");
			sColorIndex = sColorIndex.replace("Shade", "");

			return "sapUiBlockLayoutCellColor" + sColorSet + sColorIndex;
		};

		BlockLayoutCellRenderer.setDifferentSBreakpointSize = function (rm, widthToRowWidthRatio) {
			switch (widthToRowWidthRatio) {
				case 0.25:
					rm.addClass("sapUiBlockSmallCell");
					break;
				case 0.5:
					rm.addClass("sapUiBlockMediumCell");
					break;
				default: break;
			}
		};

		BlockLayoutCellRenderer.setWidth = function (rm, blockLayoutCell) {
			if (blockLayoutCell._getParentRowScrollable()) {
				var width = blockLayoutCell.getWidth();
				if (width !== 0) {
					rm.addStyle("width", width + "%");
				}
			} else {
				var flex = (blockLayoutCell.getWidth() === 0 ) ? 1 : blockLayoutCell.getWidth();
				this.addFlex(rm, flex);
			}
		};

		BlockLayoutCellRenderer.addFlex = function (rm, flex) {
			rm.addStyle("-webkit-flex", flex);
			rm.addStyle("-ms-flex", flex);
			rm.addStyle("flex", flex);
		};

		BlockLayoutCellRenderer.addTitle = function (rm, blockLayoutCell) {
			if (blockLayoutCell.getTitle()) {
				var alignmentClass = "sapUiBlockCell" + blockLayoutCell.getTitleAlignment(),
					titleClass = "sapUiBlockCellTitle " + alignmentClass;

				// remove bottom margin if cell does not have a content
				if (blockLayoutCell.getContent().length === 0) {
					titleClass += " sapUiBlockCellTitleNoContent";
				}

				var level = blockLayoutCell.getTitleLevel(),
					autoLevel = level === sap.ui.core.TitleLevel.Auto,
					tag = autoLevel ? "h2" : level;

				rm.write("<" + tag + " id='" + this.getTitleId(blockLayoutCell) + "' class='" + titleClass + "'>");
				rm.writeEscaped(blockLayoutCell.getTitle());
				rm.write("</" + tag + ">");
			}
		};

		BlockLayoutCellRenderer.getTitleId = function (blockLayoutCell) {
			return blockLayoutCell.getId() + "-Title";
		};

		BlockLayoutCellRenderer.addContent = function (rm, blockLayoutCell) {
			var content = blockLayoutCell.getContent(),
				contentClass = "sapUiBlockCellContent ";

			if (blockLayoutCell.getTitleAlignment() === "Center") {
				contentClass += "sapUiBlockCellCenteredContent";
			}

			rm.write("<div class='" + contentClass + "' aria-labelledby='" + this.getTitleId(blockLayoutCell) +  "' >");
			this.addTitle(rm, blockLayoutCell);
			content.forEach(rm.renderControl);
			rm.write("</div>");
		};

		BlockLayoutCellRenderer.endCell = function (rm) {
			rm.write("</div>");
		};

		return BlockLayoutCellRenderer;

	}, /* bExport= */ true);
