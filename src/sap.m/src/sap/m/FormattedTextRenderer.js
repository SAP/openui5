/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";


		/**
		 * FormattedText renderer.
		 * @namespace
		 */
		var FormattedTextRenderer = {};

		/**
		 * Renders the HTML for the FormattedText, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for
		 * writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		FormattedTextRenderer.render = function (oRm, oControl) {
			var sHtml = oControl.getHtmlText();

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMFT");
			oRm.writeClasses();
			// render Tooltip
			if (oControl.getTooltip_AsString()) {
				oRm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
			}
			oRm.addStyle("width", oControl.getWidth() || null);
			oRm.addStyle("height", oControl.getHeight() || null);
			oRm.writeStyles();
			oRm.write(">"); // span element
			// render the remainder of the HTML
			oRm.write(sHtml);
			oRm.write("</div>");
		};

		return FormattedTextRenderer;

	}, /* bExport= */ true);
