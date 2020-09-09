/*!
 * ${copyright}
 */

sap.ui.define([
	"./ButtonRenderer",
	"sap/ui/core/Renderer"
], function (ButtonRenderer, Renderer) {
	"use strict";

	var AccButtonRenderer = Renderer.extend(ButtonRenderer);
	AccButtonRenderer.apiVersion = 2;

	AccButtonRenderer.renderAccessibilityAttributes = function (oRM, oControl) {
		if (oControl.getTabIndex()) {
			oRM.attr("tabindex", oControl.getTabIndex());
		}
		if (oControl.getAriaHidden()) {
			oRM.attr("aria-hidden", oControl.getAriaHidden());
		}
		if (oControl.getAriaHaspopup()) {
			oRM.attr("aria-haspopup", oControl.getAriaHaspopup());
		}
	};

	return AccButtonRenderer;
}, /* bExport= */ true);