/*!
 * ${copyright}
 */

sap.ui.define(['./ButtonRenderer', 'sap/ui/core/Renderer'],
	function(ButtonRenderer, Renderer) {
		"use strict";

	var AccButtonRenderer = Renderer.extend(ButtonRenderer);

	AccButtonRenderer.renderAccessibilityAttributes = function(oRm, oControl) {
		if (oControl.getTabIndex()) {
			oRm.writeAttribute("tabindex", oControl.getTabIndex());
		}
		if (oControl.getAriaHidden()){
			oRm.writeAttribute("aria-hidden", oControl.getAriaHidden());
		}
		if (oControl.getAriaHaspopup()) {
			oRm.writeAttribute("aria-haspopup", oControl.getAriaHaspopup());
		}
	};

	return AccButtonRenderer;
}, /* bExport= */ true);