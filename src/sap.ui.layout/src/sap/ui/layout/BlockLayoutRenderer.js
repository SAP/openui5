/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		var BlockLayoutRenderer = {};

		BlockLayoutRenderer.render = function(rm, blockLayout){
			this.startLayout(rm, blockLayout);
			this.addContent(rm, blockLayout);
			this.endLayout(rm);
		};

		BlockLayoutRenderer.startLayout = function (rm, blockLayout) {
			var backgroundType = blockLayout.getBackground();

			rm.write("<div");
			rm.writeControlData(blockLayout);
			rm.addClass("sapUiBlockLayout");
			if (backgroundType == "Light") {
				rm.addClass("sapUiBlockLayoutLightBackground");
			}
			rm.writeStyles();
			rm.writeClasses();
			rm.write(">");
		};

		BlockLayoutRenderer.addContent = function (rm, blockLayout) {
			var content = blockLayout.getContent();
			content.forEach(rm.renderControl);
		};

		BlockLayoutRenderer.endLayout = function (rm) {
			rm.write("</div>");
		};

		return BlockLayoutRenderer;

	}, /* bExport= */ true);
