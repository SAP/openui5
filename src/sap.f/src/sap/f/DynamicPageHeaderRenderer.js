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
	 * @param {sap.ui.core.Control} oDynamicPageHeader An object representation of the control that should be rendered
	 */
	DynamicPageHeaderRenderer.render = function (oRm, oDynamicPageHeader) {
		var aContent = oDynamicPageHeader.getContent(),
			bHeaderHasContent = aContent.length > 0,
			bPhone = sap.ui.Device.system.phone,
			bHeaderPinnable = oDynamicPageHeader.getPinnable() && bHeaderHasContent && !bPhone;


		// Dynamic Page Layout Header Root DOM Element.
		oRm.write("<header");
		oRm.writeControlData(oDynamicPageHeader);
		oRm.writeAccessibilityState({
			role: "region"
		});
		oRm.addClass("sapContrastPlus");
		oRm.addClass("sapFDynamicPageHeader");
		if (bHeaderPinnable) {
			oRm.addClass("sapFDynamicPageHeaderPinnable");
		}
		if (bHeaderHasContent) {
			oRm.addClass("sapFDynamicPageHeaderWithContent");
		}
		oRm.writeClasses();
		oRm.write(">");

		// Header Content
		if (bHeaderHasContent) {
			oRm.write("<div");
			oRm.addClass("sapFDynamicPageHeaderContent");
			oRm.writeClasses();
			oRm.write(">");
			aContent.forEach(oRm.renderControl);
			oRm.write("</div>");

			if (bHeaderPinnable) {
				DynamicPageHeaderRenderer._renderPinUnpinArea(oDynamicPageHeader, oRm);
			}
		}

		oRm.write("</header>");
	};

	DynamicPageHeaderRenderer._renderPinUnpinArea = function (oDynamicPageHeader, oRm) {
		oRm.write("<div");
		oRm.addClass("sapFDynamicPageHeaderPinButtonArea");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oDynamicPageHeader._getPinButton());
		oRm.write("</div>");
	};

	return DynamicPageHeaderRenderer;

}, /* bExport= */ true);