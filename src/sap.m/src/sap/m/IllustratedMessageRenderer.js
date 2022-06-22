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
			bIllustratedMessageEnableVerticalResponsiveness = oIllustratedMessage.getEnableVerticalResponsiveness();

		// IllustratedMessage's Root DOM Element.
		oRm.openStart("figure", oIllustratedMessage);
		oRm.class("sapMIllustratedMessage");
		if (bIllustratedMessageEnableVerticalResponsiveness) {
			oRm.class("sapMIllustratedMessageScalable");
		}
		oRm.openEnd();

			oRm.renderControl(oIllustratedMessageIllustration);

			oRm.openStart("figcaption").openEnd();
				oRm.renderControl(sIllustratedMessageTitle);
				oRm.renderControl(sIllustratedMessageDescription.addStyleClass("sapMIllustratedMessageDescription"));
			oRm.close("figcaption");

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
