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

		if (!oWebPageContent.getOverflowWithShowMore()) {
			oRm.style("height", "calc(" + oWebPageContent.getMinHeight() + " - " + PADDING + ")");
		}

		if (oWebPageContent._bSrcChecked) {
			oRm.attr("src", oWebPageContent.getSrc());
		}

		oRm.attr("tabindex", "0");

		if (!oWebPageContent.getOmitSandbox()) {
			oRm.attr("sandbox", oWebPageContent.getSandbox());
		}

		if (oWebPageContent.getAllow()) {
			oRm.attr("allow", oWebPageContent.getAllow());
		}

		if (oWebPageContent.getAllowFullscreen()) {
			oRm.attr("allowfullscreen", oWebPageContent.getAllowFullscreen());
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

	/**
	 * @override
	 */
	WebPageContentRenderer.renderLoadingPlaceholder = function (oRm, oCardContent) {
		// Always render the placeholder for WebPage Content and hide it with CSS only to avoid iframe re-rendering.
		// Unnecessary iframe re-rendering causes the iframe to reload its page.
		oRm.renderControl(oCardContent.getAggregation("_loadingPlaceholder"));
	};

	return WebPageContentRenderer;
});
