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
	var DynamicPageTitleRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oDynamicPageTitle An object representation of the control that should be rendered
	 */
	DynamicPageTitleRenderer.render = function (oRm, oDynamicPageTitle) {
		var oDynamicPageTitleState = oDynamicPageTitle._getState();

		// DynamicPageTitle Root DOM Element.
		oRm.write("<div");
		if (oDynamicPageTitleState.isFocusable) {
			oRm.writeAttribute("tabindex", 0);
		}
		oRm.writeControlData(oDynamicPageTitle);
		oRm.writeAccessibilityState({role: "heading", level: 2});
		oRm.addClass("sapFDynamicPageTitle");
		oRm.writeClasses();
		oRm.write(">");

		this._renderTopArea(oRm, oDynamicPageTitleState);
		this._renderMainArea(oRm, oDynamicPageTitleState);
		oRm.renderControl(oDynamicPageTitleState.expandButton);

		oRm.write("<span id=\"" + oDynamicPageTitleState.id + "-Descr\" class=\"sapUiInvisibleText\">" + oDynamicPageTitleState.ariaText + "</span>");
		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderTopArea = function (oRm, oDynamicPageTitleState) {
		if (oDynamicPageTitleState.hasTopContent) {
			oRm.write("<div id=" + oDynamicPageTitleState.id + "-top");
			oRm.addClass("sapFDynamicPageTitleTop");
			if (oDynamicPageTitleState.hasOnlyBreadcrumbs){
				oRm.addClass("sapFDynamicPageTitleTopBreadCrumbsOnly");
			}
			if (oDynamicPageTitleState.hasOnlyNavigationActions){
				oRm.addClass("sapFDynamicPageTitleTopNavActionsOnly");
			}
			oRm.writeClasses();
			oRm.write(">");

			this._renderTopBreadcrumbsArea(oRm, oDynamicPageTitleState);
			this._renderTopNavigationArea(oRm, oDynamicPageTitleState);

			oRm.write("</div>");
		}
	};

	DynamicPageTitleRenderer._renderTopBreadcrumbsArea = function (oRm, oDynamicPageTitleState) {
		if (oDynamicPageTitleState.breadcrumbs) {
			oRm.write("<div");
			oRm.writeAttribute("id", oDynamicPageTitleState.id + "-breadcrumbs");
			oRm.addClass("sapFDynamicPageTitleTopLeft");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oDynamicPageTitleState.breadcrumbs);
			oRm.write("</div>");
		}
	};

	DynamicPageTitleRenderer._renderTopNavigationArea = function (oRm, oDynamicPageTitleState) {
		if (oDynamicPageTitleState.hasNavigationActions) {
			oRm.write("<div");
			oRm.writeAttribute("id", oDynamicPageTitleState.id + "-topNavigationArea");
			oRm.addClass("sapFDynamicPageTitleTopRight");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");
		}
	};

	DynamicPageTitleRenderer._renderMainArea = function (oRm, oDynamicPageTitleState) {
		oRm.write("<div id=" + oDynamicPageTitleState.id + "-main");
		oRm.addClass("sapFDynamicPageTitleMain");
		if (!oDynamicPageTitleState.hasContent) {
			oRm.addClass("sapFDynamicPageTitleMainNoContent");
		}
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapFDynamicPageTitleMainInner");
		oRm.writeClasses();
		oRm.write(">");

		this._renderMainHeadingArea(oRm, oDynamicPageTitleState);
		this._renderMainContentArea(oRm, oDynamicPageTitleState);
		this._renderMainActionsArea(oRm, oDynamicPageTitleState);

		oRm.write("</div>");

		this._renderMainNavigationArea(oRm, oDynamicPageTitleState);

		oRm.write("</div>"); // Root end.
	};

	DynamicPageTitleRenderer._renderMainHeadingArea = function (oRm, oDynamicPageTitleState) {
		// Heading Area
		oRm.write("<div");
		oRm.writeAttribute("id", oDynamicPageTitleState.id + "-left-inner");
		oRm.addClass("sapFDynamicPageTitleMainHeading");
		oRm.writeClasses();
		oRm.addStyle("flex-shrink", oDynamicPageTitleState.headingAreaShrinkFactor);
		oRm.writeStyles();
		oRm.write(">");
		// Left Area -> heading aggregation
		oRm.write("<div");
		oRm.addClass("sapFDynamicPageTitleHeading-CTX");
		oRm.addClass("sapFDynamicPageTitleMainHeadingInner");
		oRm.writeClasses();
		oRm.write(">");
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
		oRm.write("</div>");

		// Heading Area -> snappedContent/expandContent aggregation
		if (oDynamicPageTitleState.hasAdditionalContent) {
			oRm.write("<div");
			oRm.addClass("sapFDynamicPageTitleMainHeadingSnappedExpandContent");
			oRm.writeClasses();
			oRm.write(">");
			if (oDynamicPageTitleState.hasSnappedContent) {
				DynamicPageTitleRenderer._renderSnappedContent(oRm, oDynamicPageTitleState);
			}
			if (oDynamicPageTitleState.hasExpandedContent) {
				DynamicPageTitleRenderer._renderExpandContent(oRm, oDynamicPageTitleState);
			}
			oRm.write("</div>");
		}
		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderMainContentArea = function (oRm, oDynamicPageTitleState) {
		// Content aggregation
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPageTitleState.id + "-content");
		oRm.addClass("sapFDynamicPageTitleMainContent");
		oRm.addClass("sapFDynamicPageTitleContent-CTX");
		oRm.writeClasses();
		oRm.addStyle("flex-shrink", oDynamicPageTitleState.contentAreaShrinkFactor);
		if (oDynamicPageTitleState.contentAreaFlexBasis) {
			oRm.addStyle("flex-basis", oDynamicPageTitleState.contentAreaFlexBasis);
		}
		oRm.writeStyles();
		oRm.write(">");
		oDynamicPageTitleState.content.forEach(oRm.renderControl);
		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderMainActionsArea = function (oRm, oDynamicPageTitleState) {
		oRm.write("<div");
		oRm.writeAttribute("id", oDynamicPageTitleState.id + "-mainActions");
		oRm.addClass("sapFDynamicPageTitleMainActions");
		oRm.writeClasses();
		oRm.addStyle("flex-shrink", oDynamicPageTitleState.actionsAreaShrinkFactor);
		if (oDynamicPageTitleState.actionsAreaFlexBasis) {
			oRm.addStyle("flex-basis", oDynamicPageTitleState.actionsAreaFlexBasis);
		}
		oRm.writeStyles();
		oRm.write(">");
		if (oDynamicPageTitleState.hasActions) {
			oRm.renderControl(oDynamicPageTitleState.actionBar);
		}
		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderMainNavigationArea = function (oRm, oDynamicPageTitleState) {
		if (oDynamicPageTitleState.hasNavigationActions) {
			oRm.write("<div");
			oRm.writeAttribute("id", oDynamicPageTitleState.id + "-mainNavigationAreaWrapper");
			oRm.addClass("sapFDynamicPageTitleMainNavigationArea");
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oDynamicPageTitleState.separator);

			oRm.write("<div");
			oRm.writeAttribute("id", oDynamicPageTitleState.id + "-mainNavigationArea");
			oRm.addClass("sapFDynamicPageTitleMainNavigationAreaInner");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");
			oRm.write("</div>");
		}
	};

	DynamicPageTitleRenderer._renderExpandHeading = function (oRm, oDynamicPageTitleState) {
		oRm.write("<div");
		oRm.writeAttribute("id", oDynamicPageTitleState.id + "-expand-heading-wrapper");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oDynamicPageTitleState.expandedHeading);
		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderSnappedHeading = function (oRm, oDynamicPageTitleState) {
		oRm.write("<div");
		oRm.writeAttribute("id", oDynamicPageTitleState.id + "-snapped-heading-wrapper");
		if (!oDynamicPageTitleState.isSnapped) {
			oRm.addClass("sapUiHidden");
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oDynamicPageTitleState.snappedHeading);
		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderExpandContent = function (oRm, oDynamicPageTitleState) {
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPageTitleState.id + "-expand-wrapper");
		oRm.writeClasses();
		oRm.write(">");
		oDynamicPageTitleState.expandedContent.forEach(oRm.renderControl);
		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderSnappedContent = function (oRm, oDynamicPageTitleState) {
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPageTitleState.id + "-snapped-wrapper");
		if (!oDynamicPageTitleState.isSnapped) {
			oRm.addClass("sapUiHidden");
		}
		oRm.addClass("sapFDynamicPageTitleSnapped");
		oRm.writeClasses();
		oRm.write(">");
		oDynamicPageTitleState.snappedContent.forEach(oRm.renderControl);
		oRm.write("</div>");
	};

	return DynamicPageTitleRenderer;

}, /* bExport= */ true);
