/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/CustomListItemRenderer",
	"sap/ui/core/Renderer",
	"sap/ui/Device"
], function (CustomListItemRenderer, Renderer, Device) {
	"use strict";

	var BoxRenderer = Renderer.extend(CustomListItemRenderer);

	BoxRenderer.renderLIAttributes = function (rm, oLI) {
		CustomListItemRenderer.renderLIAttributes(rm, oLI);
		rm.addClass("sapTntBox");
		this.renderWidthStyle(rm, oLI);
	};

	BoxRenderer.renderWidthStyle = function (rm, oLI) {
		var oBoxContainerList = oLI.getList(),
			sWidth;

		if (oBoxContainerList && oBoxContainerList.getMetadata().getName() === "sap.tnt.BoxContainerList") {
			sWidth = oBoxContainerList.getBoxWidth();
		}

		if (Device.browser.msie && sWidth) {
			rm.addStyle("width", sWidth);
		}
	};

	return BoxRenderer;
});