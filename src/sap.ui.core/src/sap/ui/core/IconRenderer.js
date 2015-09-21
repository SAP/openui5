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
		// write the HTML into the render manager
		var oIconInfo = sap.ui.core.IconPool.getIconInfo(oControl.getSrc()),
			sWidth = oControl.getWidth(),
			sHeight = oControl.getHeight(),
			sColor = oControl.getColor(),
			sBackgroundColor = oControl.getBackgroundColor(),
			sSize = oControl.getSize(),
			sTooltip = oControl.getTooltip_AsString();

		oRm.write("<span");
		oRm.writeControlData(oControl);

		if (!oControl.getDecorative()) {
			oRm.writeAttribute("tabindex", 0);
		}

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		if (oIconInfo) {
			oRm.writeAttributeEscaped("data-sap-ui-icon-content", oIconInfo.content);
			oRm.writeAttribute("role", "img");
			oRm.writeAttributeEscaped("aria-label", sTooltip || oIconInfo.name);
			oRm.addStyle("font-family", "'" + jQuery.sap.encodeHTML(oIconInfo.fontFamily) + "'");
		}

		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}

		if (sHeight) {
			oRm.addStyle("height", sHeight);
			oRm.addStyle("line-height", sHeight);
		}

		if (!(sColor in sap.ui.core.IconColor)) {
			oRm.addStyle("color", jQuery.sap.encodeHTML(sColor));
		}

		if (!(sBackgroundColor in sap.ui.core.IconColor)) {
			oRm.addStyle("background-color", jQuery.sap.encodeHTML(sBackgroundColor));
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

		oRm.write("></span>");
	};

	return IconRenderer;

}, /* bExport= */ true);
