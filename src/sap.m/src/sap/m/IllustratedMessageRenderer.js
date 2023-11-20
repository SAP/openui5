/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * IllustratedMessage renderer.
	 * @namespace
	 */
	var IllustratedMessageRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.IllustratedMessage} oIllustratedMessage An object representation of the control that should be rendered
	 */
	IllustratedMessageRenderer.render = function (oRm, oIllustratedMessage) {
		var oIllustratedMessageIllustration = oIllustratedMessage._getIllustration(),
			sIllustratedMessageTitle = oIllustratedMessage._getTitle(),
			sIllustratedMessageDescription = oIllustratedMessage._getDescription(),
			aIllustratedMessageAdditionalContent = oIllustratedMessage.getAdditionalContent(),
			bIllustratedMessageEnableVerticalResponsiveness = oIllustratedMessage.getEnableVerticalResponsiveness(),
			bRenderTitle = oIllustratedMessage._shouldRenderTitle(),
			bRenderDescription = oIllustratedMessage._shouldRenderDescription();

		// IllustratedMessage's Root DOM Element.
		oRm.openStart("figure", oIllustratedMessage);
		oRm.class("sapMIllustratedMessage");
		if (bIllustratedMessageEnableVerticalResponsiveness) {
			oRm.class("sapMIllustratedMessageScalable");
		}
		oRm.openEnd();

			oRm.openStart("div");
			oRm.class("sapMIllustratedMessageMainContent"); // wrapper div to allow horizontal layout for Dot breakpoint
			oRm.openEnd();

			oRm.renderControl(oIllustratedMessageIllustration);

			if (bRenderTitle || bRenderDescription) {
				oRm.openStart("figcaption").openEnd();
					if (bRenderTitle) {
						oRm.renderControl(sIllustratedMessageTitle);
					}
					if (bRenderDescription) {
						oRm.renderControl(sIllustratedMessageDescription.addStyleClass("sapMIllustratedMessageDescription"));
					}
				oRm.close("figcaption");
			}

			oRm.close("div"); // main content container end

			oRm.openStart("div");
			oRm.class("sapMIllustratedMessageAdditionalContent"); // helper class in order to hide the additional content when on Base breakpoint
			oRm.openEnd();
				aIllustratedMessageAdditionalContent.forEach(function (oControl) {
					oRm.renderControl(oControl);
				});
			oRm.close("div");

		oRm.close("figure"); // Root end.
	};

	return IllustratedMessageRenderer;

}, /* bExport= */ true);
