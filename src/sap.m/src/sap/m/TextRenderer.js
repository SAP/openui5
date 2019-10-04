/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Text
sap.ui.define([
	'sap/ui/core/Renderer',
	'sap/ui/core/library',
	'sap/m/HyphenationSupport',
	'./library'
], function(
	Renderer,
	coreLibrary,
	HyphenationSupport,
	mobileLibrary
) {
		"use strict";

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.ui.core.TextDirection
		var WrappingType = mobileLibrary.WrappingType;

		/**
		 * Text renderer.
		 *
		 * @author SAP SE
		 * @namespace
		 */
		var TextRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Text} oText An object representation of the control that should be rendered.
		 */
		TextRenderer.render = function(oRm, oText) {
			// get control values
			var sWidth = oText.getWidth(),
				sText = oText.getText(true),
				sTextDir = oText.getTextDirection(),
				sTooltip = oText.getTooltip_AsString(),
				nMaxLines = oText.getMaxLines(),
				bWrapping = oText.getWrapping(),
				sWrappingType = oText.getWrappingType(),
				sTextAlign = oText.getTextAlign(),
				bRenderWhitespace = oText.getRenderWhitespace();

			// start writing html
			oRm.openStart("span", oText);
			oRm.class("sapMText");
			oRm.class("sapUiSelectable");

			// set classes for wrapping
			if (!bWrapping || nMaxLines == 1) {
				oRm.class("sapMTextNoWrap");
			} else if (bWrapping && sWrappingType !== WrappingType.Hyphenated) {
				// no space text must break
				if (sText && sText.length > 0 && !/\s/.test(sText)) {
					oRm.class("sapMTextBreakWord");
				}
			}

			// write style and attributes
			sWidth ? oRm.style("width", sWidth) : oRm.class("sapMTextMaxWidth");
			if (sTextDir !== TextDirection.Inherit){
				oRm.attr("dir", sTextDir.toLowerCase());
			}
			sTooltip && oRm.attr("title", sTooltip);
			if (sTextAlign) {
				sTextAlign = Renderer.getTextAlign(sTextAlign, sTextDir);
				if (sTextAlign) {
					oRm.style("text-align", sTextAlign);
				}
			}

			if (bRenderWhitespace) {
				var whitespaceClass = bWrapping ? "sapMTextRenderWhitespaceWrap" : "sapMTextRenderWhitespace";
				oRm.class(whitespaceClass);
			}

			HyphenationSupport.writeHyphenationClass(oRm, oText);

			// finish writing html
			oRm.openEnd();

			// handle max lines
			if (oText.hasMaxLines()) {
				this.renderMaxLines(oRm, oText);
			} else {
				this.renderText(oRm, oText);
			}

			// finalize
			oRm.close("span");
		};

		/**
		 * Renders the max lines inner wrapper.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.Text} oText An object representation of the control that should be rendered
		 */
		TextRenderer.renderMaxLines = function(oRm, oText) {
			oRm.openStart("span");
			oRm.attr("id", oText.getId() + "-inner");
			oRm.class("sapMTextMaxLine");

			// check native line clamp support
			if (oText.canUseNativeLineClamp()) {
				oRm.class("sapMTextLineClamp");
				oRm.style("-webkit-line-clamp", oText.getMaxLines());
			}

			oRm.openEnd();
			this.renderText(oRm, oText);
			oRm.close("span");
		};

		/**
		 * Renders the normalized text property.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Text} oText An object representation of the control that should be rendered.
		 */
		TextRenderer.renderText = function(oRm, oText) {
			var sText = HyphenationSupport.getTextForRender(oText, "main");
			oRm.text(sText);
		};

		return TextRenderer;

	}, /* bExport= */ true);