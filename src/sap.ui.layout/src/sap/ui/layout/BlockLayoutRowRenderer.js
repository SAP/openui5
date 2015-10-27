/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";

		var BlockLayoutRowRenderer = {};

		BlockLayoutRowRenderer.render = function (rm, blockLayoutRow){
			this.startRow(rm, blockLayoutRow);
			this.renderContent(rm, blockLayoutRow);
			this.endRow(rm, blockLayoutRow);
		};

		BlockLayoutRowRenderer.startRow = function (rm, blockLayoutRow) {
			rm.write("<div");
			rm.writeControlData(blockLayoutRow);
			rm.addClass("sapUiBlockLayoutRow");
			this.addRowRenderingClass(rm, blockLayoutRow);
			rm.writeStyles();
			rm.writeClasses();
			rm.write(">");
		};

		BlockLayoutRowRenderer.addRowRenderingClass = function (rm, blockLayoutRow) {
			if (blockLayoutRow.getScrollable()) {
				rm.addClass("sapUiBlockScrollingRow");
				if (blockLayoutRow.getContent().length >= 6) {
					rm.addClass("sapUiBlockScrollingNarrowCells");
				}
			} else {
				rm.addClass("sapUiBlockHorizontalCellsRow");
			}

			if (blockLayoutRow._rowSCase) {
				rm.addClass("sapUiBlockRowSCase");
			}
		};

		BlockLayoutRowRenderer.renderContent = function (rm, blockLayoutRow) {
			var cell,
				content = blockLayoutRow.getContent(),
				scrollable = blockLayoutRow.getScrollable();

			for (var i = 0 ; i < content.length; i++) {
				cell = content[i];
				if (scrollable) {
					cell.addStyleClass("sapUiBlockScrollableCell");
				} else {
					cell.addStyleClass("sapUiBlockHorizontalCell");
				}
				rm.renderControl(cell);
			}
		};

		BlockLayoutRowRenderer.endRow = function (rm) {
			rm.write("</div>");
		};

		return BlockLayoutRowRenderer;

	}, /* bExport= */ true);
