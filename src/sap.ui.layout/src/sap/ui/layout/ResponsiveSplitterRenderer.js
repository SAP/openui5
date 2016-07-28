/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/IconPool'],
	function (IconPool) {
	"use strict";

	/**
	 * ResponsiveSplitter renderer.
	 * @namespace
	 */
	var ResponsiveSplitterRenderer = {};
	IconPool.insertFontFaceStyle();

	ResponsiveSplitterRenderer.render = function (oRm, oControl) {
		oRm.write("<div ");
		oRm.addClass("sapUiResponsiveSplitter");
		oRm.writeControlData(oControl);
		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.writeClasses();
		oRm.write(">");

		var aPages = oControl.getAggregation("_pages");

		if (aPages) {
			oControl.getAggregation("_pages").forEach(oRm.renderControl);
			this.renderPaginator(oRm, oControl);
		}

		oRm.write("</div>");
	};

	ResponsiveSplitterRenderer.renderPaginator = function (oRm, oControl) {
		var bpCount = oControl._getMaxPageCount(),
			aPages = oControl.getAggregation("_pages") || [],
			oBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');

		oRm.write("<div ");
		oRm.writeAttribute("role", "navigation");
		oRm.addClass("sapUiResponsiveSplitterPaginator");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div ");
		oRm.addClass("sapUiResponsiveSplitterPaginatorNavButton");
		oRm.addClass("sapUiResponsiveSplitterHiddenPaginatorButton");
		oRm.addClass("sapUiResponsiveSplitterPaginatorButtonBack");
		oRm.writeClasses();
		oRm.write("></div>");

		oRm.write("<div ");
		oRm.addClass("sapUiResponsiveSplitterPaginatorButtons");
		oRm.writeClasses();
		oRm.writeAttribute("role", "radiogroup");
		oRm.writeAttributeEscaped("aria-label", oBundle.getText("RESPONSIVESPLITTER_ARIA_PAGINATOR_LABEL"));
		if (aPages.length > 0) {
			oRm.writeAttribute("aria-controls", aPages[0].getParent().getId());
		}
		oRm.write(">");

		for (var i = 0; i < bpCount; i++) {
			oRm.write("<div tabindex='0' ");
			oRm.write("page-index='" + i + "'");
			if (i === 0) {
				oRm.addClass("sapUiResponsiveSplitterPaginatorSelectedButton");
			}
			oRm.addClass("sapUiResponsiveSplitterHiddenElement");
			oRm.addClass("sapUiResponsiveSplitterPaginatorButton");
			oRm.writeClasses();
			oRm.writeAttribute("role", "radio");
			oRm.writeAttribute("aria-checked", false);
			oRm.write("></div>");
		}

		oRm.write("</div>");

		oRm.write("<div ");
		oRm.addClass("sapUiResponsiveSplitterPaginatorNavButton");
		oRm.addClass("sapUiResponsiveSplitterHiddenPaginatorButton");
		oRm.addClass("sapUiResponsiveSplitterPaginatorButtonForward");
		oRm.writeClasses();
		oRm.write("></div>");

		oRm.write("</div>");
	};

	return ResponsiveSplitterRenderer;

}, /* bExport= */ true);
