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
	 * @param {sap.ui.core.Control} oPage An object representation of the control that should be rendered
	 */
	DynamicPageTitleRenderer.render = function (oRm, oDynamicPageTitle) {
		var oActions = oDynamicPageTitle._getOverflowToolbar(),
			oLeftContent = oDynamicPageTitle.getHeading(),
			aSnapContent = oDynamicPageTitle.getSnappedContent(),
			aExpandContent = oDynamicPageTitle.getExpandedContent();

		// Dynamic Page Layout Title Root DOM Element.
		oRm.write("<div");
		oRm.writeControlData(oDynamicPageTitle);
		// ACC State
		oRm.writeAccessibilityState({
			role: "heading",
			level: 2
		});
		oRm.addClass("sapMDynamicPageTitle");
		oRm.writeClasses();
		oRm.write(">");

		// Left Area
		oRm.write("<div");
		oRm.addClass("sapMDynamicPageTitleLeft");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<div");
		oRm.addClass("sapMDynamicPageTitleLeftInner");
		oRm.writeClasses();
		oRm.write(">");
		// Page Title Content
		oRm.write("<div");
		oRm.addClass("sapMDynamicPageTitleLeftHeading");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oLeftContent);
		oRm.write("</div>");

		if (aSnapContent.length > 0 || aExpandContent.length > 0) {
			// Snapped/Expand Content
			oRm.write("<div");
			oRm.addClass("sapMDynamicPageTitleLeftSnappedExpandContent");
			oRm.writeClasses();
			oRm.write(">");
			DynamicPageTitleRenderer._renderSnappedContent(oRm, oDynamicPageTitle, aSnapContent);
			DynamicPageTitleRenderer._renderExpandContent(oRm, oDynamicPageTitle, aExpandContent);
			oRm.write("</div>");
		}

		oRm.write("</div>");
		oRm.write("</div>");

		// Right Area
		oRm.write("<div");
		oRm.addClass("sapMDynamicPageTitleRight");
		oRm.writeClasses();
		oRm.write(">");
		// Actions
		oRm.write("<div");
		oRm.addClass("sapMDynamicPageTitleRightActions");
		oRm.writeClasses();
		oRm.write(">");

		if (oActions.getContent().length > 0) {
			oRm.renderControl(oActions);
		}

		oRm.write("</div>");
		oRm.write("</div>");
		oRm.write("</div>"); //Root end.
	};

	DynamicPageTitleRenderer._renderExpandContent = function (oRm, oDynamicPageTitle, aExpandContent) {
		if (aExpandContent.length > 0) {
			oRm.write("<div");
			oRm.writeAttributeEscaped("id", oDynamicPageTitle.getId() + '-expand-wrapper');
			oRm.writeClasses();
			oRm.write(">");
			aExpandContent.forEach(oRm.renderControl);
			oRm.write("</div>");
		}
	};

	DynamicPageTitleRenderer._renderSnappedContent = function (oRm, oDynamicPageTitle, aSnapContent) {
		if (aSnapContent.length > 0) {
			oRm.write("<div");
			oRm.writeAttributeEscaped("id", oDynamicPageTitle.getId() + '-snapped-wrapper');
			if (!oDynamicPageTitle._getShowSnapContent()) {
				oRm.addClass("sapUiHidden");
			}
			oRm.addClass("sapMDynamicPageTitleSnapped");
			oRm.writeClasses();
			oRm.write(">");
			aSnapContent.forEach(oRm.renderControl);
			oRm.write("</div>");
		}
	};

	return DynamicPageTitleRenderer;

}, /* bExport= */ true);
