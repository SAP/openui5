/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";


	/**
	 * oDynamicPage Header renderer.
	 * @namespace
	 */
	var DynamicPageHeaderRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oDynamicPageHeader An object representation of the control that should be rendered
	 */
	DynamicPageHeaderRenderer.render = function (oRm, oDynamicPageHeader) {
		var oDynamicPageHeaderState = oDynamicPageHeader._getState(),
			sSapFDynamicPageHeader = "sapFDynamicPageHeader",
			sBackgroundDesign = oDynamicPageHeader.getBackgroundDesign();

		// Dynamic Page Layout Header Root DOM Element.
		oRm.openStart("header", oDynamicPageHeader);
		oRm.accessibilityState({
			role: "region"
		});
		oRm.class("sapContrastPlus");
		oRm.class(sSapFDynamicPageHeader);
		if (oDynamicPageHeaderState.headerHasContent) {
			oRm.class("sapFDynamicPageHeaderWithContent");
		}
		if (oDynamicPageHeaderState.headerPinnable) {
			oRm.class("sapFDynamicPageHeaderPinnable");
		}

		if (sBackgroundDesign) {
			oRm.class(sSapFDynamicPageHeader + sBackgroundDesign);
		}

		oRm.openEnd();

		// Header Content
		this._renderHeaderContent(oRm, oDynamicPageHeaderState);

		// Collapse button
		oRm.renderControl(oDynamicPageHeaderState.collapseButton);

		// Pin button
		if (oDynamicPageHeaderState.headerPinnable) {
			oRm.renderControl(oDynamicPageHeaderState.pinButton);
		}

		oRm.close("header");
	};

	DynamicPageHeaderRenderer._renderHeaderContent = function (oRm, oDynamicPageHeaderState) {
		if (oDynamicPageHeaderState.headerHasContent) {
			oRm.openStart("div");
			oRm.class("sapFDynamicPageHeaderContent");
			oRm.openEnd();
			oDynamicPageHeaderState.content.forEach(oRm.renderControl, oRm);
			oRm.close("div");
		}
	};

	return DynamicPageHeaderRenderer;

}, /* bExport= */ true);