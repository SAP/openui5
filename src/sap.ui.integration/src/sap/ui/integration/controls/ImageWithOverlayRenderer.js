/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer"
], function(Renderer) {
	"use strict";

	/**
	 * ImageWithOverlayRenderer renderer.
	 * @private
	 */
	var ImageWithOverlayRenderer = {
		apiVersion: 2
	};

	ImageWithOverlayRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl)
			.class("sapUiIntImageWithOverlay");

		if (oControl.getPadding() === "MediumStart") {
			oRm.class("sapUiIntImageWithOverlayPaddingMediumStart");
		}

		oRm.openEnd();
		oRm.renderControl(oControl.getAggregation("image"));
		oRm.renderControl(oControl._getTextsLayout());
		oRm.close("div");
	};

	return ImageWithOverlayRenderer;

});
