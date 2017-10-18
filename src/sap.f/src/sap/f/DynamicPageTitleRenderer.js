/*!
 * ${copyright}
 */
sap.ui.define([], function () {
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
		oRm.writeAttribute("tabindex", 0);
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

		this._renderMainLeftArea(oRm, oDynamicPageTitleState);
		this._renderMainRightArea(oRm, oDynamicPageTitleState);
		this._renderMainNavigationArea(oRm, oDynamicPageTitleState);

		oRm.write("</div>"); // Root end.
	};

	DynamicPageTitleRenderer._renderMainLeftArea = function (oRm, oDynamicPageTitleState) {
		// Left Area
		oRm.write("<div");
		oRm.addClass("sapFDynamicPageTitleMainLeft");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("id", oDynamicPageTitleState.id + "-left-inner");
		oRm.addClass("sapFDynamicPageTitleMainLeftInner");
		oRm.addClass(oDynamicPageTitleState.isPrimaryAreaBegin ? "sapFDynamicPageTitleAreaHighPriority" : "sapFDynamicPageTitleAreaLowPriority");
		oRm.writeClasses();
		oRm.write(">");
		// Left Area -> heading aggregation
		oRm.write("<div");
		oRm.addClass("sapFDynamicPageTitleHeading-CTX");
		oRm.addClass("sapFDynamicPageTitleMainLeftHeading");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oDynamicPageTitleState.heading);
		oRm.write("</div>");

		// Left Area -> snappedContent/expandContent aggregation
		if (oDynamicPageTitleState.hasAdditionalContent) {
			oRm.write("<div");
			oRm.addClass("sapFDynamicPageTitleMainLeftSnappedExpandContent");
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

		// Content aggregation
		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oDynamicPageTitleState.id + "-content");
		oRm.addClass("sapFDynamicPageTitleMainContent");
		oRm.addClass("sapFDynamicPageTitleContent-CTX");
		oRm.addClass(oDynamicPageTitleState.isPrimaryAreaBegin ? "sapFDynamicPageTitleAreaLowPriority" : "sapFDynamicPageTitleAreaHighPriority");
		oRm.writeClasses();
		if (oDynamicPageTitleState.contentAreaFlexBasis) {
			oRm.writeAttributeEscaped("style", "flex-basis: " + oDynamicPageTitleState.contentAreaFlexBasis + ";");
		}
		oRm.write(">");
		oDynamicPageTitleState.content.forEach(oRm.renderControl);
		oRm.write("</div>");

		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderMainRightArea = function (oRm, oDynamicPageTitleState) {
		oRm.write("<div");
		oRm.addClass("sapFDynamicPageTitleMainRight");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<div");
		oRm.writeAttribute("id", oDynamicPageTitleState.id + "-mainActions");
		oRm.addClass("sapFDynamicPageTitleMainRightActions");
		oRm.writeClasses();
		oRm.write(">");
		if (oDynamicPageTitleState.hasActions) {
			oRm.renderControl(oDynamicPageTitleState.actionBar);
		}
		oRm.write("</div>");
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
		if (!oDynamicPageTitleState.showSnapContent) {
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
