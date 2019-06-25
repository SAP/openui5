/*!
 * ${copyright}
 */
sap.ui.define([
	"./library"], function (library) {
	"use strict";

	/**
	 * DynamicPage Title renderer.
	 * @namespace
	 */
	var DynamicPageTitleRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oDynamicPageTitle An object representation of the control that should be rendered
	 */
	DynamicPageTitleRenderer.render = function (oRm, oDynamicPageTitle) {
		var oDynamicPageTitleState = oDynamicPageTitle._getState(),
			sSapFDynamicPageTitle = "sapFDynamicPageTitle",
			sBackgroundDesign = oDynamicPageTitle.getBackgroundDesign();

		// DynamicPageTitle Root DOM Element.
		oRm.openStart("div", oDynamicPageTitle);
		oRm.class(sSapFDynamicPageTitle);

		if (sBackgroundDesign) {
			oRm.class(sSapFDynamicPageTitle + sBackgroundDesign);
		}

		oRm.openEnd();

		oRm.renderControl(oDynamicPageTitleState.focusSpan);

		this._renderTopArea(oRm, oDynamicPageTitleState);
		this._renderMainArea(oRm, oDynamicPageTitleState);
		this._renderSnappedExpandedContentArea(oRm, oDynamicPageTitleState);

		if (oDynamicPageTitleState.hasSnappedTitleOnMobile) {
			this._renderSnappedTitleOnMobile(oRm, oDynamicPageTitleState);
		}

		oRm.renderControl(oDynamicPageTitleState.expandButton);

		oRm.close("div");
	};

	DynamicPageTitleRenderer._renderTopArea = function (oRm, oDynamicPageTitleState) {
		if (oDynamicPageTitleState.hasTopContent) {
			oRm.openStart("div", oDynamicPageTitleState.id + "-top");
			oRm.class("sapFDynamicPageTitleTop");
			if (oDynamicPageTitleState.hasOnlyBreadcrumbs){
				oRm.class("sapFDynamicPageTitleTopBreadCrumbsOnly");
			}
			if (oDynamicPageTitleState.hasOnlyNavigationActions){
				oRm.class("sapFDynamicPageTitleTopNavActionsOnly");
			}
			oRm.openEnd();

			this._renderTopBreadcrumbsArea(oRm, oDynamicPageTitleState);
			this._renderTopNavigationArea(oRm, oDynamicPageTitleState);

			oRm.close("div");
		}
	};

	DynamicPageTitleRenderer._renderTopBreadcrumbsArea = function (oRm, oDynamicPageTitleState) {
		if (oDynamicPageTitleState.breadcrumbs) {
			oRm.openStart("div", oDynamicPageTitleState.id + "-breadcrumbs");
			oRm.class("sapFDynamicPageTitleTopLeft");
			oRm.openEnd();
			oRm.renderControl(oDynamicPageTitleState.breadcrumbs);
			oRm.close("div");
		}
	};

	DynamicPageTitleRenderer._renderTopNavigationArea = function (oRm, oDynamicPageTitleState) {
		if (oDynamicPageTitleState.hasNavigationActions) {
			oRm.openStart("div", oDynamicPageTitleState.id + "-topNavigationArea");
			oRm.class("sapFDynamicPageTitleTopRight");
			oRm.openEnd();
			oRm.close("div");
		}
	};

	DynamicPageTitleRenderer._renderMainArea = function (oRm, oDynamicPageTitleState) {
		oRm.openStart("div", oDynamicPageTitleState.id + "-main");
		oRm.class("sapFDynamicPageTitleMain");
		if (!oDynamicPageTitleState.hasContent) {
			oRm.class("sapFDynamicPageTitleMainNoContent");
		}
		oRm.openEnd();

		oRm.openStart("div");
		oRm.class("sapFDynamicPageTitleMainInner");
		oRm.openEnd();

		this._renderMainHeadingArea(oRm, oDynamicPageTitleState);
		this._renderMainContentArea(oRm, oDynamicPageTitleState);
		this._renderMainActionsArea(oRm, oDynamicPageTitleState);

		oRm.close("div");

		this._renderMainNavigationArea(oRm, oDynamicPageTitleState);

		oRm.close("div"); // Root end.
	};

	DynamicPageTitleRenderer._renderMainHeadingArea = function (oRm, oDynamicPageTitleState) {
		// Heading Area
		oRm.openStart("div", oDynamicPageTitleState.id + "-left-inner");
		oRm.class("sapFDynamicPageTitleMainHeading");
		oRm.style("flex-shrink", oDynamicPageTitleState.headingAreaShrinkFactor);
		oRm.openEnd();
		// Left Area -> heading aggregation
		oRm.openStart("div");
		oRm.class("sapFDynamicPageTitleHeading-CTX");
		oRm.class("sapFDynamicPageTitleMainHeadingInner");
		oRm.openEnd();
		if (oDynamicPageTitleState.heading) {
			// If heading is given, it should be used
			oRm.renderControl(oDynamicPageTitleState.heading);
		} else {
			// Otherwise, snapped and expanded heading should be used
			if (oDynamicPageTitleState.snappedHeading) {
				DynamicPageTitleRenderer._renderSnappedHeading(oRm, oDynamicPageTitleState);
			}
			if (oDynamicPageTitleState.expandedHeading) {
				DynamicPageTitleRenderer._renderExpandHeading(oRm, oDynamicPageTitleState);
			}
		}
		oRm.close("div");

		oRm.close("div");
	};

	DynamicPageTitleRenderer._renderMainContentArea = function (oRm, oDynamicPageTitleState) {
		// Content aggregation
		oRm.openStart("div", oDynamicPageTitleState.id + "-content");
		oRm.class("sapFDynamicPageTitleMainContent");
		oRm.class("sapFDynamicPageTitleContent-CTX");
		oRm.style("flex-shrink", oDynamicPageTitleState.contentAreaShrinkFactor);
		if (oDynamicPageTitleState.contentAreaFlexBasis) {
			oRm.style("flex-basis", oDynamicPageTitleState.contentAreaFlexBasis);
		}
		oRm.openEnd();
		oDynamicPageTitleState.content.forEach(oRm.renderControl, oRm);
		oRm.close("div");
	};

	DynamicPageTitleRenderer._renderMainActionsArea = function (oRm, oDynamicPageTitleState) {
		oRm.openStart("div", oDynamicPageTitleState.id + "-mainActions");
		oRm.class("sapFDynamicPageTitleMainActions");
		oRm.style("flex-shrink", oDynamicPageTitleState.actionsAreaShrinkFactor);
		if (oDynamicPageTitleState.actionsAreaFlexBasis) {
			oRm.style("flex-basis", oDynamicPageTitleState.actionsAreaFlexBasis);
		}
		oRm.openEnd();
		if (oDynamicPageTitleState.hasActions) {
			oRm.renderControl(oDynamicPageTitleState.actionBar);
		}
		oRm.close("div");
	};

	DynamicPageTitleRenderer._renderMainNavigationArea = function (oRm, oDynamicPageTitleState) {
		if (oDynamicPageTitleState.hasNavigationActions) {
			oRm.openStart("div", oDynamicPageTitleState.id + "-mainNavigationAreaWrapper");
			oRm.class("sapFDynamicPageTitleMainNavigationArea");
			oRm.openEnd();

			oRm.renderControl(oDynamicPageTitleState.separator);

			oRm.openStart("div", oDynamicPageTitleState.id + "-mainNavigationArea");
			oRm.class("sapFDynamicPageTitleMainNavigationAreaInner");
			oRm.openEnd();
			oRm.close("div");
			oRm.close("div");
		}
	};

	DynamicPageTitleRenderer._renderSnappedExpandedContentArea = function (oRm, oDynamicPageTitleState) {
		// Heading Area -> snappedContent/expandContent aggregation
		if (oDynamicPageTitleState.hasAdditionalContent) {
			oRm.openStart("div");
			oRm.class("sapFDynamicPageTitleMainHeadingSnappedExpandContent");
			oRm.openEnd();
			if (oDynamicPageTitleState.hasSnappedContent && !oDynamicPageTitleState.hasSnappedTitleOnMobile) {
				DynamicPageTitleRenderer._renderSnappedContent(oRm, oDynamicPageTitleState);
			}
			if (oDynamicPageTitleState.hasExpandedContent) {
				DynamicPageTitleRenderer._renderExpandContent(oRm, oDynamicPageTitleState);
			}
			oRm.close("div");
		}
	};

	DynamicPageTitleRenderer._renderExpandHeading = function (oRm, oDynamicPageTitleState) {
		oRm.openStart("div", oDynamicPageTitleState.id + "-expand-heading-wrapper");
		oRm.openEnd();
		oRm.renderControl(oDynamicPageTitleState.expandedHeading);
		oRm.close("div");
	};

	DynamicPageTitleRenderer._renderSnappedHeading = function (oRm, oDynamicPageTitleState) {
		oRm.openStart("div", oDynamicPageTitleState.id + "-snapped-heading-wrapper");
		if (!oDynamicPageTitleState.isSnapped) {
			oRm.class("sapUiHidden");
		}
		oRm.openEnd();
		oRm.renderControl(oDynamicPageTitleState.snappedHeading);
		oRm.close("div");
	};

	DynamicPageTitleRenderer._renderExpandContent = function (oRm, oDynamicPageTitleState) {
		oRm.openStart("div", oDynamicPageTitleState.id + "-expand-wrapper");
		oRm.openEnd();
		oDynamicPageTitleState.expandedContent.forEach(oRm.renderControl, oRm);
		oRm.close("div");
	};

	DynamicPageTitleRenderer._renderSnappedContent = function (oRm, oDynamicPageTitleState) {
		oRm.openStart("div", oDynamicPageTitleState.id + "-snapped-wrapper");
		if (!oDynamicPageTitleState.isSnapped) {
			oRm.class("sapUiHidden");
		}
		oRm.class("sapFDynamicPageTitleSnapped");
		oRm.openEnd();
		oDynamicPageTitleState.snappedContent.forEach(oRm.renderControl, oRm);
		oRm.close("div");
	};

	DynamicPageTitleRenderer._renderSnappedTitleOnMobile = function (oRm, oDynamicPageTitleState) {
		oRm.openStart("div", oDynamicPageTitleState.id + "-snapped-title-on-mobile-wrapper");
		if (!oDynamicPageTitleState.isSnapped) {
			oRm.class("sapUiHidden");
		}
		oRm.class("sapFDynamicPageTitleSnappedTitleOnMobile");
		oRm.openEnd();
		oRm.renderControl(oDynamicPageTitleState.snappedTitleOnMobileContext);
		oRm.renderControl(oDynamicPageTitleState.snappedTitleOnMobileIcon);
		oRm.close("div");
	};

	return DynamicPageTitleRenderer;

}, /* bExport= */ true);
