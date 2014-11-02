/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global"],
	function(jQuery) {
	"use strict";

	/**
	 * @class FontIcon renderer.
	 * @static
	 * @name sap.ui.core.IconRenderer
	 */
	var IconRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 * @name sap.ui.core.IconRenderer.render
	 * @function
	 */
	IconRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager
		var oIconInfo = sap.ui.core.IconPool.getIconInfo(oControl.getSrc()),
			sWidth = oControl.getWidth(),
			sHeight = oControl.getHeight(),
			sColor = oControl.getColor(),
			sBackgroundColor = oControl.getBackgroundColor(),
			sSize = oControl.getSize(),
			tooltip = oControl.getTooltip_AsString(),

			//in IE8 :before is not supported, text needs to be rendered in span
			bTextNeeded = (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 9);

		oRm.write("<span");
		oRm.writeControlData(oControl);

		if (!oControl.getDecorative()) {
			oRm.writeAttribute("tabindex", 0);
		}

		if (tooltip) {
			oRm.writeAttributeEscaped("title", tooltip);
		}

		if (oIconInfo) {

			if (!bTextNeeded) {
				oRm.writeAttribute("data-sap-ui-icon-content", oIconInfo.content);
			}

			oRm.addStyle("font-family", "'" + oIconInfo.fontFamily + "'");
		}

		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}

		if (sHeight) {
			oRm.addStyle("height", sHeight);
			oRm.addStyle("line-height", sHeight);
		}

		if (sColor) {
			oRm.addStyle("color", sColor);
		}

		if (sBackgroundColor) {
			oRm.addStyle("background-color", sBackgroundColor);
		}

		if (sSize) {
			oRm.addStyle("font-size", sSize);
		}

		oRm.addClass("sapUiIcon");

		if (oIconInfo && !oIconInfo.suppressMirroring) {
			oRm.addClass("sapUiIconMirrorInRTL");
		}

		oRm.writeClasses();
		oRm.writeStyles();

		oRm.write(">"); // span element

		if (oIconInfo && bTextNeeded) {
			oRm.write(oIconInfo.content);
		}

		oRm.write("</span>");
	};

	return IconRenderer;

}, /* bExport= */ true);