/*!
 * ${copyright}
 */

sap.ui.define(['./library', 'sap/ui/core/library', "sap/base/Log"],
	function(library, coreLibrary, Log) {
		"use strict";

		// shortcut for sap.ui.core.TitleLevel
		var TitleLevel = coreLibrary.TitleLevel;

		var BlockLayoutCellRenderer = {
			apiVersion: 2
		};

		BlockLayoutCellRenderer.render = function (rm, blockLayoutCell) {
			this.startCell(rm, blockLayoutCell);
			this.addContent(rm, blockLayoutCell);
			this.endCell(rm);
		};

		BlockLayoutCellRenderer.startCell = function (oRm, oBlockLayoutCell) {
			var sCellColor = this.getCellColor(oRm, oBlockLayoutCell);

			oRm.openStart("div", oBlockLayoutCell)
				.class("sapUiBlockLayoutCell");
			sCellColor && oRm.class(sCellColor); // Set any of the predefined cell colors
			this.setWidth(oRm, oBlockLayoutCell);

			oRm.openEnd();
		};

		BlockLayoutCellRenderer.getCellColor = function (oRm, oBlockLayoutCell) {
			var sColorSet = oBlockLayoutCell.getBackgroundColorSet(),
				sColorIndex = oBlockLayoutCell.getBackgroundColorShade();

			if (!sColorSet && !sColorIndex) {
				return "";
			} else if (( sColorSet && !sColorIndex ) || ( !sColorSet && sColorIndex )) { // XOR check. Both values need to be either defined or not defined.
				Log.warning("Both, backgroundColorSet and backgroundColorShade should be defined. ColoSet is not applied to " + oBlockLayoutCell.getId() + ".");
				return "";
			}

			// Get only the unique part of the string
			sColorSet = sColorSet.replace("ColorSet", "");
			sColorIndex = sColorIndex.replace("Shade", "");

			return "sapUiBlockLayoutCellColor" + sColorSet + sColorIndex;
		};

		BlockLayoutCellRenderer.setWidth = function (rm, blockLayoutCell) {
			var width = blockLayoutCell.getWidth();
			if (blockLayoutCell._getParentRowScrollable()) {
				if (width !== 0) {
					rm.style("width", width + "%");
				}
			} else {
				this.addFlex(rm, blockLayoutCell._getFlexWidth());
			}

		};

		BlockLayoutCellRenderer.addFlex = function (rm, flex) {
			rm.style("-webkit-flex", flex);
			rm.style("-ms-flex", flex);
			rm.style("flex", flex);
		};

		BlockLayoutCellRenderer.addTitle = function (rm, blockLayoutCell) {
			var oTitleLink = blockLayoutCell.getTitleLink();

			var sTitleText = blockLayoutCell.getTitle();

			if (sTitleText || oTitleLink) {
				var alignmentClass = "sapUiBlockCell" + blockLayoutCell.getTitleAlignment(),
					titleClass = "sapUiBlockCellTitle " + alignmentClass;

				// remove bottom margin if cell does not have a content
				if (blockLayoutCell.getContent().length === 0) {
					titleClass += " sapUiBlockCellTitleNoContent";
				}

				var level = blockLayoutCell.getTitleLevel(),
					autoLevel = level === TitleLevel.Auto,
					tag = autoLevel ? "h2" : level.toLowerCase();

				var aTitleClassesSeparated = titleClass.split(" ");

				rm.openStart(tag, this.getTitleId(blockLayoutCell));

				for (var index = 0; index < aTitleClassesSeparated.length; index++) {
					rm.class(aTitleClassesSeparated[index]);
				}

				rm.openEnd();

				if (oTitleLink) {
					rm.renderControl(oTitleLink);
				} else {
					rm.text(sTitleText);
				}

				rm.close(tag);
			}
		};

		BlockLayoutCellRenderer.getTitleId = function (blockLayoutCell) {
			return blockLayoutCell.getId() + "-Title";
		};

		BlockLayoutCellRenderer.hasTitle = function (blockLayoutCell) {
			return blockLayoutCell.getTitleLink() || blockLayoutCell.getTitle();
		};

		BlockLayoutCellRenderer.addContent = function (rm, blockLayoutCell) {
			var content = blockLayoutCell.getContent(),
				bHasTitle = this.hasTitle(blockLayoutCell);

			rm.openStart("div")
				.class("sapUiBlockCellContent");

			if (blockLayoutCell.getTitleAlignment() === "Center") {
				rm.class("sapUiBlockCellCenteredContent");
			}

			rm.openEnd();

			if (bHasTitle) {
				this.addTitle(rm, blockLayoutCell);
			}

			content.forEach(rm.renderControl, rm);
			rm.close("div");
		};

		BlockLayoutCellRenderer.endCell = function (rm) {
			rm.close("div");
		};

		return BlockLayoutCellRenderer;
	}, /* bExport= */ true);