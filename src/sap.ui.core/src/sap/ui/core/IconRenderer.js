/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global"],
	function(jQuery) {
	"use strict";

	/**
	 * Font-Icon renderer.
	 * @namespace
	 * @alias sap.ui.core.IconRenderer
	 */
	var IconRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	IconRenderer.render = function(oRm, oControl) {

		var sWidth = oControl.getWidth(),
			sHeight = oControl.getHeight(),
			sColor = oControl.getColor(),
			sBackgroundColor = oControl.getBackgroundColor(),
			sSize = oControl.getSize(),
			sTooltip = oControl.getTooltip_AsString();

		var mAttributes = {}, mStyles = {};

		if (!oControl.getDecorative()) {
			mAttributes["tabindex"] = 0;
		}

		if (sTooltip) {
			mAttributes["title"] = sTooltip;
		}

		if (sWidth) {
			mStyles["width"] = sWidth;
		}

		if (sHeight) {
			mStyles["height"] = mStyles["line-height"] = sHeight;
		}

		if (sColor) {
			mStyles["color"] = sColor;
		}

		if (sBackgroundColor) {
			mStyles["background-color"] = sBackgroundColor;
		}

		if (sSize) {
			mStyles["font-size"] = sSize;
		}

		oRm.writeIcon(oControl.getSrc(), [], mAttributes, mStyles, oControl);
	};

	return IconRenderer;

}, /* bExport= */ true);
