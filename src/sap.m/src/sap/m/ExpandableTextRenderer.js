/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.ExpandableText
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
		var ExpandableTextRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.m.Text} oText An object representation of the control that should be rendered.
		 */
		ExpandableTextRenderer.render = function(oRm, oText) {
			// get control values
			var sDispalyedText = oText._getDisplayedText(),
				sTextDir = oText.getTextDirection(),
				sTooltip = oText.getTooltip_AsString(),
				sWrappingType = oText.getWrappingType(),
				sTextAlign = oText.getTextAlign(),
				bRenderWhitespace = oText.getRenderWhitespace(),
				bExpandable = oText._isExpandable(),
				bExpanded = oText.getProperty("expanded"),
				sEllipsisText = bExpanded ? "&nbsp;&nbsp;" : " ... ";

			// start writing HTML
			oRm.openStart("div", oText);
			oRm.class("sapMExText");
			oRm.class("sapUiSelectable");

			if (sWrappingType !== WrappingType.Hyphenated) {
				// no space text must break
				if (sDispalyedText && sDispalyedText.length > 0 && !/\s/.test(sDispalyedText)) {
					oRm.class("sapMExTextBreakWord");
				}
			}

			// write style and attributes
			oRm.attr("dir", sTextDir !== TextDirection.Inherit ? sTextDir.toLowerCase() : "auto");

			if (sTooltip)  {
				oRm.attr("title", sTooltip);
			}

			if (sTextAlign) {
				sTextAlign = Renderer.getTextAlign(sTextAlign, sTextDir);
				if (sTextAlign) {
					oRm.style("text-align", sTextAlign);
				}
			}

			if (bRenderWhitespace) {
				oRm.class("sapMExTextRenderWhitespaceWrap");
			}

			HyphenationSupport.writeHyphenationClass(oRm, oText);

			// finish writing HTML
			oRm.openEnd();

			oRm.openStart("span", oText.getId() + "-string");
			oRm.class("sapMExTextString");
			oRm.openEnd();

			oRm.text(HyphenationSupport.getTextForRender(oText, "main"));

			oRm.close("span");

			if (bExpandable) {

				oRm.openStart("span");
				oRm.class("sapMExTextEllipsis");
				oRm.openEnd();
				oRm.unsafeHtml(sEllipsisText);
				oRm.close("span");

				oRm.renderControl(oText._getShowMoreLink());
			}

			// finalize
			oRm.close("div");
		};

		return ExpandableTextRenderer;

	}, /* bExport= */ true);
