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
	 * @param {sap.ui.core.Control} oPage An object representation of the control that should be rendered
	 */
	DynamicPageRenderer.render = function (oRm, oDynamicPage) {
		var oDynamicPageTitle = oDynamicPage.getTitle(),
			oDynamicPageHeader = oDynamicPage.getHeader(),
			bHeaderAlwaysExpanded = oDynamicPage.getHeaderAlwaysExpanded(),
			oDynamicPageFooter = oDynamicPage.getFooter(),
			oDynamicPageContent = oDynamicPage.getContent();

		// Dynamic Page Layout Root DOM Element.
		oRm.write("<article");
		oRm.writeControlData(oDynamicPage);
		oRm.addClass("sapMDynamicPage");
		oRm.writeClasses();
		oRm.write(">");

		// Renders Dynamic Page Custom ScrollBar for Desktop mode
		if (Device.system.desktop && oDynamicPage._allowScroll()) {
			oRm.renderControl(oDynamicPage._getScrollBar().addStyleClass("sapMDynamicPageScrollBar"));
		} else {
			oDynamicPage.addStyleClass("sapMDynamicPageSupressScroll");
		}

		// Renders Dynamic Page Title.
		oRm.write("<header");
		oRm.writeAttributeEscaped("id", oDynamicPage.getId() + '-header');
		oRm.addClass("sapMDynamicPageTitleWrapper");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oDynamicPageTitle);
		if (bHeaderAlwaysExpanded) {
			oRm.renderControl(oDynamicPageHeader);
		}
		oRm.write("</header>");


		// Renders Dynamic Page Content
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPage.getId() + '-contentWrapper');
		oRm.addClass("sapMDynamicPageContentWrapper");
		oRm.writeClasses();
		oRm.write(">");
		if (!bHeaderAlwaysExpanded) {
			oRm.renderControl(oDynamicPageHeader);
		}
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPage.getId() + '-content');
		oRm.addClass("sapMDynamicPageContent");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oDynamicPageContent);
		oRm.write("</div>");
		oRm.write("</div>");

		// Renders Dynamic Page Toolbar
		DynamicPageRenderer.renderPageToolbar(oRm, oDynamicPageFooter, oDynamicPage);
		oRm.write("</article>"); //Root end.
	};

	DynamicPageRenderer.renderPageToolbar = function (oRm, oDynamicPageToolbar, oDynamicPage) {
		if (oDynamicPageToolbar) {
			oRm.write("<footer");
			oRm.writeAttributeEscaped("id", oDynamicPage.getId() + '-footerWrapper');
			oRm.addClass("sapMDynamicPageFooter");
			if (!oDynamicPage.getShowFooter()) {
				oRm.addClass("sapUiHidden");
			}
			oRm.writeClasses();
			oRm.write(">");
			oDynamicPageToolbar.addStyleClass("sapMDynamicPageActualFooterControl");
			oRm.renderControl(oDynamicPageToolbar);
			oRm.write("</footer>");
		}
	};

	return DynamicPageRenderer;

}, /* bExport= */ true);
