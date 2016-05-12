/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";


	/**
	 * oDynamicPage Header renderer.
	 * @namespace
	 */
	var DynamicPageHeaderRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oPage An object representation of the control that should be rendered
	 */
	DynamicPageHeaderRenderer.render = function (oRm, oDynamicPageHeader) {
		var aContent = oDynamicPageHeader.getContent();

		// Dynamic Page Layout Header Root DOM Element.
		oRm.write("<header");
		oRm.writeControlData(oDynamicPageHeader);
		oRm.writeAttribute("tabindex", "0");
		oRm.writeAccessibilityState({
			role: "region"
		});
		oRm.addClass("sapMDynamicPageHeader");
		oRm.writeClasses();
		oRm.write(">");

		// Header Content
		if (aContent.length > 0) {
			oRm.write("<div");
			oRm.addClass("sapMDynamicPageHeaderContent");
			oRm.writeClasses();
			oRm.write(">");
			aContent.forEach(oRm.renderControl);
			oRm.write("</div>");

			if (oDynamicPageHeader.getPinnable() && !sap.ui.Device.system.phone) {
				DynamicPageHeaderRenderer._renderPinUnpinArea(oDynamicPageHeader, oRm);
			}
		}

		oRm.write("</header>");
	};

	DynamicPageHeaderRenderer._renderPinUnpinArea = function (oDynamicPageHeader, oRm) {
		oRm.write("<div");
		oRm.addClass("sapMDynamicPageHeaderPinButtonArea");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oDynamicPageHeader._getPinButton());
		oRm.write("</div>");
	};

	return DynamicPageHeaderRenderer;

}, /* bExport= */ true);
