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
	 * @param {sap.ui.core.Control} oIllustratedMessage An object representation of the control that should be rendered
	 */
	IllustratedMessageRenderer.render = function (oRm, oIllustratedMessage) {
		var oIllustratedMessageIllustration = oIllustratedMessage._getIllustration(),
			oIllustratedMessageTitle = oIllustratedMessage._getTitle(),
			oIllustratedMessageDescription = oIllustratedMessage._getDescription(),
			oIllustratedMessageAdditionalContent = oIllustratedMessage.getAdditionalContent();

		// IllustratedMessage's Root DOM Element.
		oRm.openStart("figure", oIllustratedMessage);
		oRm.class("sapFIllustratedMessage");
		oRm.openEnd();

			oRm.renderControl(oIllustratedMessageIllustration);

			oRm.openStart("figcaption").openEnd();
				oRm.renderControl(oIllustratedMessageTitle);
				oRm.renderControl(oIllustratedMessageDescription.addStyleClass("sapFIllustratedMessageDescription"));
			oRm.close("figcaption");

			oRm.openStart("div");
			oRm.class("sapFIllustratedMessageAdditionalContent"); // helper class in order to hide the additional content when on Base breakpoint
			oRm.openEnd();
				oIllustratedMessageAdditionalContent.forEach(function (oControl) {
					oRm.renderControl(oControl);
				});
		oRm.close("div");

		oRm.close("figure"); // Root end.
	};

	return IllustratedMessageRenderer;

}, /* bExport= */ true);
