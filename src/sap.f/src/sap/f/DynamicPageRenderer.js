/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	/**
	 * DynamicPage renderer.
	 * @namespace
	 */
	var DynamicPageRenderer = {
		apiVersion: 2
	};

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
			bHeaderInTitleArea = bPreserveHeaderStateOnScroll || oDynamicPage._bHeaderInTitleArea,
			oLandmarkInfo = oDynamicPage.getLandmarkInfo(),
			sHeaderTag = oDynamicPage._getHeaderTag(oLandmarkInfo),
			sFooterTag = oDynamicPage._getFooterTag(oLandmarkInfo);

		// Dynamic Page Layout Root DOM Element.
		oRm.openStart("article", oDynamicPage);
		oRm.class("sapFDynamicPage");
		if (oDynamicPage.getToggleHeaderOnTitleClick()) {
			oRm.class("sapFDynamicPageTitleClickEnabled");
		}
		oRm.attr("aria-roledescription", oDynamicPage._getAriaRoleDescription());
		oRm.accessibilityState(oDynamicPage, oDynamicPage._formatLandmarkInfo(oLandmarkInfo, "Root"));
		oRm.openEnd();

		// Renders Dynamic Page Title.
		oRm.openStart(sHeaderTag, oDynamicPage.getId() + "-header");
		oRm.class("sapContrastPlus");
		oRm.class("sapFDynamicPageTitleWrapper");
		if (!bHeaderExpanded) {
			oRm.class(Device.system.phone && oDynamicPageTitle && oDynamicPageTitle.getSnappedTitleOnMobile() ?
					"sapFDynamicPageTitleSnappedTitleOnMobile" : "sapFDynamicPageTitleSnapped");
		}
		if (!bHeaderHasContent) {
			oRm.class("sapFDynamicPageTitleOnly");
		}
		oRm.accessibilityState(oDynamicPage, oDynamicPage._formatLandmarkInfo(oLandmarkInfo, "Header"));
		oRm.attr("data-sap-ui-customfastnavgroup", true);

		oRm.openEnd();
		oRm.renderControl(oDynamicPageTitle);

		// Sticky area
		oRm.openStart("div", oDynamicPage.getId() + "-stickyPlaceholder");
		oRm.openEnd();
		if (bHeaderInTitleArea) {
			oRm.renderControl(oDynamicPageHeader);
		}
		oRm.close("div");
		oRm.close(sHeaderTag);


		// Renders Dynamic Page Content
		oRm.openStart("div", oDynamicPage.getId() + "-contentWrapper");
		oRm.class("sapFDynamicPageContentWrapper");
		if (oDynamicPage.getBackgroundDesign()) {
			oRm.class("sapFDynamicPageContentWrapper" + oDynamicPage.getBackgroundDesign());
		}
		oRm.openEnd();


		oRm.openStart("div", oDynamicPage.getId() + "-headerWrapper");
		oRm.class("sapFDynamicPageHeaderWrapper");
		oRm.openEnd();
		if (!bHeaderInTitleArea) {
			oRm.renderControl(oDynamicPageHeader);
		}
		oRm.close("div");


		oRm.openStart("div", oDynamicPage.getId() + "-content");
		oRm.class("sapFDynamicPageContent");
		oRm.accessibilityState(oDynamicPage, oDynamicPage._formatLandmarkInfo(oLandmarkInfo, "Content"));
		oRm.openEnd();
		oRm.openStart("div", oDynamicPage.getId() + "-contentFitContainer");
		if (oDynamicPage.getFitContent()) {
			oRm.class("sapFDynamicPageContentFitContainer");
		}

		if (oDynamicPageFooter && bShowFooter) {
			oRm.class("sapFDynamicPageContentFitContainerFooterVisible");
		}
		oRm.openEnd();
		oRm.renderControl(oDynamicPageContent);
		oRm.close("div");
		oRm.close("div");


		oRm.close("div");

		// Renders Dynamic Page Footer
		DynamicPageRenderer.renderFooter(oRm, oDynamicPage, oDynamicPageFooter, bShowFooter, sFooterTag, oLandmarkInfo);
		oRm.close("article"); //Root end.
	};

	DynamicPageRenderer.renderFooter = function (oRm, oDynamicPage, oDynamicPageFooter, bShowFooter, sFooterTag, oLandmarkInfo) {
		if (oDynamicPageFooter) {
			oRm.openStart(sFooterTag, oDynamicPage.getId() + "-footerWrapper");
			oRm.class("sapContrast").class("sapContrastPlus").class("sapFDynamicPageFooter").class("sapMFooter-CTX");
			if (!bShowFooter) {
				oRm.class("sapUiHidden");
			}
			oRm.accessibilityState(oDynamicPage, oDynamicPage._formatLandmarkInfo(oLandmarkInfo, "Footer"));
			oRm.openEnd();
			oDynamicPageFooter.addStyleClass("sapFDynamicPageActualFooterControl");
			oRm.renderControl(oDynamicPageFooter);
			oRm.close(sFooterTag);
		}
	};

	return DynamicPageRenderer;

}, /* bExport= */ true);
