/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.Card
sap.ui.define([], function () {
	"use strict";

	/**
	 * <code>Card</code> renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var CardRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oCard an object representation of the control that should be rendered
	 */
	CardRenderer.render = function (oRm, oCard) {

		//start
		oRm.write("<section");
		oRm.writeElementData(oCard);
		oRm.writeAttribute("tabindex", "0");
		oRm.addClass("sapFCard");
		oRm.writeClasses();
		oRm.addStyle("width", oCard.getWidth());
		oRm.addStyle("height", oCard.getHeight());
		oRm.writeStyles();
		oRm.write(">");

		//header
		oRm.renderControl(oCard._getHeader());

		//content
		CardRenderer.renderContentSection(oRm, oCard);

		//end
		oRm.write("</section>");
	};

	/**
	 * Render content section.
	 * Will be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	CardRenderer.renderContentSection = function (oRm, oCard) {
		var oContent = oCard._getContent();

		if (oContent) {
			oRm.write("<section");
			oRm.addClass("sapFCardContent");
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oContent);

			oRm.write("</section>");
		}
	};

	return CardRenderer;
});