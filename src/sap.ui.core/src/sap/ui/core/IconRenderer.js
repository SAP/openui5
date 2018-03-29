/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './IconPool', './library'], function(jQuery, IconPool, library) {
	"use strict";

	// shortcut for enum(s)
	var IconColor = library.IconColor;

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
		var vIconInfo = IconPool.getIconInfo(oControl.getSrc(), "mixed"),
			sWidth = oControl.getWidth(),
			sHeight = oControl.getHeight(),
			sColor = oControl.getColor(),
			sBackgroundColor = oControl.getBackgroundColor(),
			sSize = oControl.getSize(),
			bNoTabStop = oControl.getNoTabStop(),
			sTitle = oControl._getOutputTitle(vIconInfo),
			aLabelledBy,
			oInvisibleText,
			oAccAttributes,
			bIconInfo = false;

		if (vIconInfo instanceof Promise) {
			// if the icon info is still being loaded,
			// an invalidation is triggered after the icon info is available
			vIconInfo.then(oControl.invalidate.bind(oControl));
		} else if (vIconInfo) {
			// render icon info in renderer
			bIconInfo = true;
			aLabelledBy = oControl.getAriaLabelledBy();

			oAccAttributes = oControl._getAccessibilityAttributes(vIconInfo);
			// oInvisibleText must be retrieved after calling _getAccessibilityAttributes
			// because it may be created within the function
			oInvisibleText = oControl.getAggregation("_invisibleText");
		}

		oRm.write("<span");
		oRm.writeControlData(oControl);
		if (bIconInfo) {
			oRm.writeAccessibilityState(oControl, oAccAttributes);
		}


		if (sTitle) {
			oRm.writeAttributeEscaped("title", sTitle);
		}

		if (oControl.hasListeners("press") && !bNoTabStop) {
			oRm.writeAttribute("tabindex", 0);
		}

		if (bIconInfo) {
			oRm.writeAttributeEscaped("data-sap-ui-icon-content", vIconInfo.content);
			oRm.addStyle("font-family", "'" + jQuery.sap.encodeHTML(vIconInfo.fontFamily) + "'");
		}

		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}

		if (sHeight) {
			oRm.addStyle("height", sHeight);
			oRm.addStyle("line-height", sHeight);
		}

		if (sColor && !(sColor in IconColor)) {
			oRm.addStyle("color", jQuery.sap.encodeHTML(sColor));
		}

		if (sBackgroundColor && !(sBackgroundColor in IconColor)) {
			oRm.addStyle("background-color", jQuery.sap.encodeHTML(sBackgroundColor));
		}

		if (sSize) {
			oRm.addStyle("font-size", sSize);
		}

		oRm.addClass("sapUiIcon");

		if (bIconInfo && !vIconInfo.suppressMirroring) {
			oRm.addClass("sapUiIconMirrorInRTL");
		}

		if (oControl.hasListeners("press")) {
			oRm.addClass("sapUiIconPointer");
		}

		oRm.writeClasses();
		oRm.writeStyles();

		oRm.write(">");

		if (aLabelledBy && aLabelledBy.length && oInvisibleText) {
			oRm.renderControl(oInvisibleText);
		}

		oRm.write("</span>");
	};

	return IconRenderer;

}, /* bExport= */ true);
