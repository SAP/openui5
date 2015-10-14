/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Text
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";

	/**
	 * TileContent renderer.
	 * @namespace
	 */
	var TileContentRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	TileContentRenderer.render = function(oRm, oControl) {

		var sTooltip = oControl.getTooltip_AsString();
		var sAltText = oControl.getAltText ? oControl.getAltText() : "";

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMTileCnt");
		oRm.addClass(oControl._getContentType());
		oRm.addClass(oControl.getSize());
		oRm.addClass("ft-" + oControl.getFrameType());
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.writeAttribute("aria-describedby", oControl.getId() + "-info");
		oRm.writeClasses();
		oRm.write(">");
		this.renderContent(oRm, oControl);
		this.renderFooter(oRm, oControl);

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-info");
		oRm.addStyle("display", "none");
		oRm.writeAttribute("aria-hidden", "true");
		oRm.writeStyles();
		oRm.write(">");
		oRm.writeEscaped(sAltText);
		oRm.write("</div>");
		oRm.write("</div>");
	};


	/**
	 * Renders the HTML for the content of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose content should be rendered
	 */
	TileContentRenderer.renderContent = function(oRm, oControl) {
		var oCnt = oControl.getContent();
		if (oCnt) {
			oRm.write("<div");
			oRm.addClass("sapMTileCntContent");
			oRm.addClass(oControl.getSize());
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + "-content");
			oRm.write(">");
			if (!oCnt.hasStyleClass("sapMTcInnerMarker")) {
				oCnt.addStyleClass("sapMTcInnerMarker");
			}
			oRm.renderControl(oCnt);
			oRm.write("</div>");
		}
	};

	/**
	 * Renders the HTML for the footer of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose footer should be rendered
	 */
	TileContentRenderer.renderFooter = function(oRm, oControl) {
		var sFooterTxt = oControl._getFooterText(oRm, oControl);
		// footer text div
		oRm.write("<div");
		oRm.addClass("sapMTileCntFtrTxt");
		oRm.addClass(oControl.getSize());
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-footer-text");
		oRm.writeAttributeEscaped("title", sFooterTxt);
		oRm.write(">");
		oRm.writeEscaped(sFooterTxt);
		oRm.write("</div>");
	};

	return TileContentRenderer;

}, /* bExport= */ true);
