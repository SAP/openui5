/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log"
],
	function(Log) {
		"use strict";


		/**
		 * FormattedText renderer.
		 * @namespace
		 */
		var FormattedTextRenderer = {};

		// Renderer with "indexed" placeholders
		// (each placeholder has an index and is replaced with control with this index from the aggregation)

		FormattedTextRenderer.render = function (oRm, oControl) {
			var iWidth = oControl.getWidth(),
				iHeight = oControl.getHeight(),
				aControls = oControl.getAggregation("controls"),
				sText = oControl._getDisplayHtml(),
				aRenderedControls = [],
				sNewText = '',
				iStrPos = 0;

			// begin the rendering
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

			// render HTML text and replace placeholders if any
			while (sText !== '' && sText !== sNewText) {
				sNewText = sText.replace(/(?:\%\%(\d+))/, _placeholderReplacer);
			}

			// output the rest of the text (if any)
			if (sText !== '') {
				oRm.write(sText);
			}

			// finalize the rendering
			oRm.write("</div>");

			// placeholder processing function
			function _placeholderReplacer(match, index, pos) {
				var iMatchLen = match.length;

				// output the text before the placeholder (if any) and increase string pointer accordingly
				oRm.write(sText.substr(0, pos));
				iStrPos += pos;

				// output control (if exists and not used yet), or error message otherwise
				if (aControls[index] !== undefined) {
					if (aRenderedControls[index] === undefined) {
						// render the control
						oRm.renderControl(aControls[index]);
						// insert index in the "used" list with position where it is used
						aRenderedControls[index] = iStrPos;
					} else {
						// log an error for duplicated rendering of the same control
						Log.error("Control with index '" + index + "' (" + match + ", htmlText@" + iStrPos + ") is already rendered (htmlText@" + aRenderedControls[index] + ")!", 'sap.m.FormattedText:', oControl.getId());
					}
				} else {
					// write the placeholder anyway
					oRm.write(match);
					// log an error for missing control
					Log.error("Missing control for placeholder '" + match + "' (htmlText@" + iStrPos + ")!", 'sap.m.FormattedText:', oControl.getId());
				}
				sText = sText.substr(pos + iMatchLen);
				iStrPos += iMatchLen;
			}
		};

		return FormattedTextRenderer;

	}, /* bExport= */ true);
