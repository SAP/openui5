/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * QuickViewPage renderer.
	 * @namespace
	 */
	var QuickViewPageRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.QuickViewPage} oQuickViewPage an object representation of the control that should be rendered
	 */
	QuickViewPageRenderer.render = function (oRM, oQuickViewPage) {
		var mPageContent = oQuickViewPage.getPageContent();

		oRM.openStart("div", oQuickViewPage)
			.class("sapMQuickViewPage")
			.openEnd();

		if (mPageContent.header) {
			oRM.renderControl(mPageContent.header);
		}

		oRM.renderControl(mPageContent.form);
		oRM.close("div");
	};

	return QuickViewPageRenderer;
}, /* bExport= */ true);