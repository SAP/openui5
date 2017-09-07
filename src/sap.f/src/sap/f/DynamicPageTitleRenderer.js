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
		if (oDynamicPageTitleState.breadcrumbs) {
			oRm.write("<div id=" + oDynamicPageTitleState.id + "-top");
			oRm.addClass("sapFDynamicPageTitleTop");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oDynamicPageTitleState.breadcrumbs);
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

		this._renderLeftArea(oRm, oDynamicPageTitleState);
		this._renderRightArea(oRm, oDynamicPageTitleState);

		oRm.write("</div>"); // Root end.
	};

	DynamicPageTitleRenderer._renderLeftArea = function (oRm, oDynamicPageTitleState) {
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
		oRm.addClass(oDynamicPageTitleState.isPrimaryAreaBegin ? "sapFDynamicPageTitleAreaLowPriority" : "sapFDynamicPageTitleAreaHighPriority");
		oRm.writeClasses();
		oRm.write(">");
		oDynamicPageTitleState.content.forEach(oRm.renderControl);
		oRm.write("</div>");

		// Dummy invisible element just to let display:flex with justify-content: space between
		// to allocate space between the Middle area and the Actions,
		// otherwise the areas would be stickied together.
		oRm.write("<span class=\"sapFDynamicPageTitleMainInvisibleEl\"></span>");
		oRm.write("</div>");
	};

	DynamicPageTitleRenderer._renderRightArea = function (oRm, oDynamicPageTitleState) {
		// Right Area
		oRm.write("<div");
		oRm.addClass("sapFDynamicPageTitleMainRight");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<div");
		oRm.addClass("sapFDynamicPageTitleMainRightActions");
		oRm.writeClasses();
		oRm.write(">");
		if (oDynamicPageTitleState.hasActions) {
			oRm.renderControl(oDynamicPageTitleState.actionBar);
		}
		oRm.write("</div>");
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
