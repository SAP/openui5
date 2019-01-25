/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
		"use strict";


		/**
		 * FormattedText renderer.
		 * @namespace
		 */
		var FormattedTextRenderer = {};

		FormattedTextRenderer.render = function (oRm, oControl) {
			var iWidth = oControl.getWidth();
			var iHeight = oControl.getHeight();

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMFT");
			if (iWidth) {
				oRm.addClass("sapMFTOverflowWidth");
			}

			if (iHeight) {
				oRm.addClass("sapMFTOverflowHeight");
			}
			oRm.writeClasses();
			// render Tooltip
			if (oControl.getTooltip_AsString()) {
				oRm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
			}
			oRm.addStyle("width", iWidth || null);
			oRm.addStyle("height", iHeight || null);
			oRm.writeStyles();
			oRm.write(">"); // span element
			// render the remainder of the HTML
			oRm.write(oControl._getDisplayHtml());
			oRm.write("</div>");
		};

		return FormattedTextRenderer;

	}, /* bExport= */ true);
