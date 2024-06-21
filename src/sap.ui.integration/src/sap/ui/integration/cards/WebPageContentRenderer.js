/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer", "sap/ui/integration/util/BindingResolver"], function (BaseContentRenderer, BindingResolver) {
	"use strict";

	// padding top and bottom
	var PADDING = "2px";

	/**
	 * WebPageContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var WebPageContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.WebPageContentRenderer", {
		apiVersion: 2,
		MIN_WEB_PAGE_CONTENT_HEIGHT: "150px" // default height of iframe element
	});

	/**
	 * @override
	 */
	WebPageContentRenderer.renderContent = function (oRm, oWebPageContent) {
		oRm.openStart("iframe", oWebPageContent.getId() + "-frame")
			.class("sapUiIntWPCFrame");

		oRm.style("height", "calc(" + oWebPageContent.getMinHeight() + " - " + PADDING + ")")
			.attr("src", oWebPageContent.getSrc())
			.attr("tabindex", "0")
			.attr("sandbox", oWebPageContent.getSandbox());

			if (oWebPageContent.getAllow()) {
				oRm.attr("allow", oWebPageContent.getAllow());
			}

			if (oWebPageContent.getAllowfullscreen()) {
				oRm.attr("allowfullscreen", oWebPageContent.getAllowfullscreen());
			}
			oRm.openEnd()
			.close("iframe");
	};

	/**
	 * @override
	 */
	WebPageContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (oConfiguration.minHeight) {
			return BindingResolver.resolveValue(oConfiguration.minHeight, oContent);
		}

		return WebPageContentRenderer.MIN_WEB_PAGE_CONTENT_HEIGHT;
	};

	return WebPageContentRenderer;
});
