/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/theming/Parameters'],
	function(jQuery, library, Parameters) {
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

			this.addColoringStyle(rm, blockLayoutCell);
			rm.writeStyles();
			rm.writeClasses();
			rm.write(">");
		};

		BlockLayoutCellRenderer.addColoringStyle = function (rm, blockLayoutCell) {
			var setIndex = blockLayoutCell.getBackgroundColorSet(),
				colorIndex = blockLayoutCell.getBackgroundColorIndex(),
				letters = ['', 'A', 'B', 'C', 'D'],
				letterIndex = letters[colorIndex];

			var param = Parameters.get("_sap_ui_layout_BlockLayout_BlockColorAccentType" + setIndex + letterIndex);

			if (setIndex !== 0 && colorIndex !== 0) {
				rm.addStyle("background-color", param);
			}

			if (colorIndex > 4) {
				jQuery.sap.log.warning("You are using a color index for BlockLayoutCell: " + blockLayoutCell.getId() + " that's not supported");
			}

			if (setIndex > 10) {
				jQuery.sap.log.warning("You are using a set index for BlockLayoutCell: " + blockLayoutCell.getId() + " that's not supported");
			}
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
