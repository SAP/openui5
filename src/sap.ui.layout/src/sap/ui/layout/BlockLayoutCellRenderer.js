/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";

		var BlockLayoutCellRenderer = {};

		BlockLayoutCellRenderer.render = function (rm, blockLayoutCell) {
			this.startCell(rm, blockLayoutCell);
			this.addContent(rm, blockLayoutCell);
			this.endCell(rm);
		};

		BlockLayoutCellRenderer.startCell = function (rm, blockLayoutCell) {
			rm.write("<div");
			rm.writeControlData(blockLayoutCell);
			rm.addClass("sapUiBlockLayoutCell");
			if (blockLayoutCell._getDifferentSBreakpointSize()) {
				this.setDifferentSBreakpointSize(rm, blockLayoutCell._getWidthToRowWidthRatio());
			} else {
				this.setWidth(rm, blockLayoutCell);
			}
			rm.writeStyles();
			rm.writeClasses();
			rm.write(">");
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
				var flex = (blockLayoutCell.getWidth() == 0 ) ? 1 : blockLayoutCell.getWidth();
				this.addFlex(rm, flex);
			}
		};

		BlockLayoutCellRenderer.addFlex = function (rm, flex) {
			rm.addStyle("flex", flex);
			rm.addStyle("-webkit-flex", flex);
		};

		BlockLayoutCellRenderer.addTitle = function (rm, blockLayoutCell) {
			if (blockLayoutCell.getTitle()) {
				var alignmentClass = "sapUiBlockCell" + blockLayoutCell.getTitleAlignment(),
					titleClass = "sapUiBlockCellTitle " + alignmentClass;

				var level = blockLayoutCell.getTitleLevel(),
					autoLevel = level == sap.ui.core.TitleLevel.Auto,
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

			if (blockLayoutCell.getTitleAlignment() == "Center") {
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
