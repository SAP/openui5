/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/IconPool",
	"sap/ui/core/Lib"
], function(Core, IconPool, Lib) {
	"use strict";

	var oResourceBundle = Lib.getResourceBundleFor("sap.ui.layout");

	/**
	 * ResponsiveSplitter renderer.
	 * @namespace
	 */
	var ResponsiveSplitterRenderer = {
		apiVersion: 2
	};

	IconPool.insertFontFaceStyle();

	ResponsiveSplitterRenderer.render = function (oRm, oRespSplitter) {
		oRm.openStart("div", oRespSplitter)
			.class("sapUiResponsiveSplitter")
			.style("width", oRespSplitter.getWidth())
			.style("height", oRespSplitter.getHeight())
			.openEnd();

		var aPages = oRespSplitter.getAggregation("_pages");

		if (aPages) {
			aPages.forEach(oRm.renderControl, oRm);
			this.renderPaginator(oRm, oRespSplitter);
		}

		oRm.close("div");
	};

	ResponsiveSplitterRenderer.renderPaginator = function (oRm, oRespSplitter) {
		var iMaxPageCount = oRespSplitter._getMaxPageCount(),
			aPages = oRespSplitter.getAggregation("_pages") || [];

		// Render paginator when there are more than one pages.
		if (iMaxPageCount <= 1) {
			return;
		}

		oRm.openStart("div")
			.attr("role", "navigation")
			.class("sapUiResponsiveSplitterPaginator")
			.openEnd();

		// Paginator Button Back
		oRm.openStart("div")
			.class("sapUiResponsiveSplitterPaginatorNavButton")
			.class("sapUiResponsiveSplitterHiddenPaginatorButton")
			.class("sapUiResponsiveSplitterPaginatorButtonBack")
			.openEnd()
			.close("div");

		oRm.openStart("div")
			.class("sapUiResponsiveSplitterPaginatorButtons")
			.attr("role", "listbox")
			.attr("aria-multiselectable", true)	// Still, only one item at a time can be selected. Set to 'true', as JAWS won't announce selection and root's descriptions otherwise.
			.attr("aria-label", oResourceBundle.getText("RESPONSIVE_SPLITTER_ARIA_PAGINATOR_LABEL"));

		if (aPages.length > 0) {
			oRm.attr("aria-controls", aPages[0].getParent().getId());
		}

		oRm.openEnd();

		for (var i = 0; i < iMaxPageCount; i++) {
			oRm.openStart("div")
				.attr("tabindex", 0)
				.attr("page-index", i);

			if (i === 0) {
				oRm.class("sapUiResponsiveSplitterPaginatorSelectedButton");
			}

			oRm.class("sapUiResponsiveSplitterHiddenElement")
				.class("sapUiResponsiveSplitterPaginatorButton")
				.attr("role", "option")
				.attr("aria-selected", false)
				.openEnd()
				.close("div");
		}

		oRm.close("div");

		// Paginator Button Forward
		oRm.openStart("div")
			.class("sapUiResponsiveSplitterPaginatorNavButton")
			.class("sapUiResponsiveSplitterHiddenPaginatorButton")
			.class("sapUiResponsiveSplitterPaginatorButtonForward")
			.openEnd()
			.close("div");

		oRm.close("div");
	};

	return ResponsiveSplitterRenderer;
}, /* bExport= */ true);
