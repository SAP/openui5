/*!
 * ${copyright}
 */

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

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMTileCnt");
		oRm.addClass(oControl._getContentType());
		oRm.addClass("ft-" + oControl.getFrameType());
		if (sTooltip.trim()) { // trim check needed since IE11 renders white spaces
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.writeClasses();
		oRm.write(">");
		this._renderContent(oRm, oControl);
		this._renderFooter(oRm, oControl);

		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the content of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose content should be rendered
	 */
	TileContentRenderer._renderContent = function(oRm, oControl) {
		var oCnt = oControl.getContent();
		if (oCnt) {
			oRm.write("<div");
			oRm.addClass("sapMTileCntContent");
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
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose footer should be rendered
	 */

	TileContentRenderer._renderFooter = function(oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString();
		var sFooterTxt = oControl._getFooterText(oRm, oControl);
		// footer text div
		oRm.write("<div");
		oRm.addClass("sapMTileCntFtrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-footer-text");
		if (sTooltip.trim()) { // check for white space(s) needed since the IE11 renders it
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.write(">");
		oRm.writeEscaped(sFooterTxt);
		oRm.write("</div>");
	};

	return TileContentRenderer;
}, /* bExport= */ true);
