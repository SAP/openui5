/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/library"
],
	function(coreLibrary) {
		"use strict";


		/**
		 * FormattedText renderer.
		 * @namespace
		 */
		var FormattedTextRenderer = {
			apiVersion: 2
		};

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.ui.core.TextAlign
		var TextAlign = coreLibrary.TextAlign;

		// Renderer with "indexed" placeholders
		// (each placeholder has an index and is replaced with control with this index from the aggregation)

		FormattedTextRenderer.render = function (oRm, oControl) {
			var iWidth = oControl.getWidth(),
				iHeight = oControl.getHeight(),
				sTextDir = oControl.getTextDirection(),
				sTextAlign = oControl.getTextAlign(),
				sText = oControl._getDisplayHtml();

			// begin the rendering
			oRm.openStart("div", oControl);
			oRm.class("sapMFT");
			if (iWidth) {
				oRm.class("sapMFTOverflowWidth");
			}

			if (iHeight) {
				oRm.class("sapMFTOverflowHeight");
			}

			if (sTextDir !== TextDirection.Inherit){
				oRm.attr("dir", sTextDir.toLowerCase());
			}

			if (sTextAlign && sTextAlign != TextAlign.Initial) {
				oRm.style("text-align", sTextAlign.toLowerCase());
			}

			// render Tooltip
			if (oControl.getTooltip_AsString()) {
				oRm.attr("title", oControl.getTooltip_AsString());
			}
			oRm.style("width", iWidth || null);
			oRm.style("height", iHeight || null);
			oRm.openEnd(); // span element

			oControl.getControls().forEach(function(oLink) {
				oRm.renderControl(oLink);
			});

			sText = sText.replace(/\%\%(\d+)/g, function(sMatch) {
				return '<template id="' +  oControl.getId() + '-$' + sMatch.split("%%")[1] + '"></template>';
			});

			oRm.unsafeHtml(sText);

			// finalize the rendering
			oRm.close("div");
		};

		return FormattedTextRenderer;

	}, /* bExport= */ true);
