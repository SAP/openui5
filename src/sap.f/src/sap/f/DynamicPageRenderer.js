/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	/**
	 * DynamicPage renderer.
	 * @namespace
	 */
	var DynamicPageRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oDynamicPage An object representation of the control that should be rendered
	 */
	DynamicPageRenderer.render = function (oRm, oDynamicPage) {
		var oDynamicPageTitle = oDynamicPage.getTitle(),
			oDynamicPageHeader = oDynamicPage.getHeader(),
			oDynamicPageFooter = oDynamicPage.getFooter(),
			oDynamicPageContent = oDynamicPage.getContent(),
			bHeaderExpanded = oDynamicPage.getHeaderExpanded(),
			aHeaderContent = oDynamicPageHeader ? oDynamicPageHeader.getContent() : [],
			bHeaderHasContent = aHeaderContent.length > 0,
			bShowFooter = oDynamicPage.getShowFooter(),
			bPreserveHeaderStateOnScroll = oDynamicPage._preserveHeaderStateOnScroll(),
			oLandmarkInfo = oDynamicPage.getLandmarkInfo(),
			sHeaderTag = oDynamicPage._getHeaderTag(oLandmarkInfo),
			sFooterTag = oDynamicPage._getFooterTag(oLandmarkInfo);

		// Dynamic Page Layout Root DOM Element.
		oRm.write("<article");
		oRm.writeControlData(oDynamicPage);
		oRm.addClass("sapFDynamicPage");
		if (oDynamicPage.getToggleHeaderOnTitleClick()) {
			oRm.addClass("sapFDynamicPageTitleClickEnabled");
		}

		oRm.writeClasses();
		oRm.writeAccessibilityState(oDynamicPage, oDynamicPage._formatLandmarkInfo(oLandmarkInfo, "Root"));
		oRm.write(">");
		// Renders Dynamic Page Custom ScrollBar for Desktop mode
		if (Device.system.desktop) {
			oRm.renderControl(oDynamicPage._getScrollBar().addStyleClass("sapFDynamicPageScrollBar"));
		}

		// Renders Dynamic Page Title.
		oRm.write("<" + sHeaderTag);
		oRm.writeAttributeEscaped("id", oDynamicPage.getId() + "-header");
		oRm.addClass("sapContrastPlus");
		oRm.addClass("sapFDynamicPageTitleWrapper");
		if (!bHeaderExpanded) {
			oRm.addClass("sapFDynamicPageTitleSnapped");
		}
		if (!bHeaderHasContent) {
			oRm.addClass("sapFDynamicPageTitleOnly");
		}
		oRm.writeClasses();
		oRm.writeAccessibilityState(oDynamicPage, oDynamicPage._formatLandmarkInfo(oLandmarkInfo, "Header"));
		oRm.write(">");
		oRm.renderControl(oDynamicPageTitle);
		if (bPreserveHeaderStateOnScroll) {
			oRm.renderControl(oDynamicPageHeader);
		}
		oRm.write("</" + sHeaderTag + ">");


		// Renders Dynamic Page Content
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPage.getId() + "-contentWrapper");
		oRm.addClass("sapFDynamicPageContentWrapper");
		oRm.writeClasses();
		oRm.write(">");
		if (!bPreserveHeaderStateOnScroll) {
			oRm.renderControl(oDynamicPageHeader);
		}
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPage.getId() + "-content");
		oRm.addClass("sapFDynamicPageContent");
		oRm.writeClasses();
		oRm.writeAccessibilityState(oDynamicPage, oDynamicPage._formatLandmarkInfo(oLandmarkInfo, "Content"));
		oRm.write(">");
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPage.getId() + "-contentFitContainer");
		if (oDynamicPage.getFitContent()) {
			oRm.addClass("sapFDynamicPageContentFitContainer");
		}

		if (oDynamicPageFooter && bShowFooter) {
			oRm.addClass("sapFDynamicPageContentFitContainerFooterVisible");
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oDynamicPageContent);
		// Renders Dynamic Page Footer Spacer
		DynamicPageRenderer.renderFooterSpacer(oRm, oDynamicPage, oDynamicPageFooter, bShowFooter);
		oRm.write("</div>");
		oRm.write("</div>");


		oRm.write("</div>");

		// Renders Dynamic Page Footer
		DynamicPageRenderer.renderFooter(oRm, oDynamicPage, oDynamicPageFooter, bShowFooter, sFooterTag, oLandmarkInfo);
		oRm.write("</article>"); //Root end.
	};

	DynamicPageRenderer.renderFooter = function (oRm, oDynamicPage, oDynamicPageFooter, bShowFooter, sFooterTag, oLandmarkInfo) {
		if (oDynamicPageFooter) {
			oRm.write("<" + sFooterTag);
			oRm.writeAttributeEscaped("id", oDynamicPage.getId() + "-footerWrapper");
			oRm.addClass("sapContrast sapContrastPlus sapFDynamicPageFooter sapFFooter-CTX");
			if (!bShowFooter) {
				oRm.addClass("sapUiHidden");
			}
			oRm.writeClasses();
			oRm.writeAccessibilityState(oDynamicPage, oDynamicPage._formatLandmarkInfo(oLandmarkInfo, "Footer"));
			oRm.write(">");
			oDynamicPageFooter.addStyleClass("sapFDynamicPageActualFooterControl");
			oRm.renderControl(oDynamicPageFooter);
			oRm.write("</" + sFooterTag + ">");
		}
	};

	DynamicPageRenderer.renderFooterSpacer = function (oRm, oDynamicPage, oDynamicPageFooter, bShowFooter) {
		if (oDynamicPageFooter) {
			oRm.write("<div");
			oRm.writeAttributeEscaped("id", oDynamicPage.getId() + "-spacer");
			if (bShowFooter) {
				oRm.addClass("sapFDynamicPageContentWrapperSpacer");
			}
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");
		}
	};

	return DynamicPageRenderer;

}, /* bExport= */ true);
