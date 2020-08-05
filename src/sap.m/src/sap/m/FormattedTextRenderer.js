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
		var FormattedTextRenderer = {
			apiVersion: 2
		};

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
			oRm.openStart("div", oControl);
			oRm.class("sapMFT");
			if (iWidth) {
				oRm.class("sapMFTOverflowWidth");
			}

			if (iHeight) {
				oRm.class("sapMFTOverflowHeight");
			}

			// render Tooltip
			if (oControl.getTooltip_AsString()) {
				oRm.attr("title", oControl.getTooltip_AsString());
			}
			oRm.style("width", iWidth || null);
			oRm.style("height", iHeight || null);
			oRm.openEnd(); // span element

			// render HTML text and replace placeholders if any
			while (sText !== '' && sText !== sNewText) {
				sNewText = sText.replace(/(?:\%\%(\d+))/, _placeholderReplacer);
			}

			// output the rest of the text (if any)
			if (sText !== '') {
				try { // unsafeHtml assumes that sText contains only HTML tags
					oRm.unsafeHtml(sText);
				} catch (error){
					oRm.text(sText);
				}
			}

			// finalize the rendering
			oRm.close("div");

			// placeholder processing function
			function _placeholderReplacer(match, index, pos) {
				var iMatchLen = match.length;

				// output the text before the placeholder (if any) and increase string pointer accordingly
				try { // unsafeHtml assumes that sText contains only HTML tags
					oRm.unsafeHtml(sText.substr(0, pos));
				} catch (error){
					oRm.text(sText.substr(0, pos));
				}
				iStrPos += pos;

				// output control (if exists and not used yet), or error message otherwise
				if (aControls && aControls[index] !== undefined) {
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
					oRm.text(match);
					// log an error for missing control
					Log.error("Missing control for placeholder '" + match + "' (htmlText@" + iStrPos + ")!", 'sap.m.FormattedText:', oControl.getId());
				}
				sText = sText.substr(pos + iMatchLen);
				iStrPos += iMatchLen;
			}
		};

		return FormattedTextRenderer;

	}, /* bExport= */ true);
