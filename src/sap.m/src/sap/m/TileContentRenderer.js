/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/security/encodeCSS"],
	function(encodeCSS) {
	"use strict";

	/**
	 * TileContent renderer.
	 * @namespace
	 */
	var TileContentRenderer = {
		apiVersion: 2    // enable in-place DOM patching
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	TileContentRenderer.render = function(oRm, oControl) {

		var sTooltip = oControl.getTooltip_AsString();
		var sContentTypeClass = oControl._getContentType();
		if (sContentTypeClass) {
			sContentTypeClass = encodeCSS(sContentTypeClass);
		}
		var sFrameTypeClass = encodeCSS("sapMFrameType" + oControl.getFrameType());

		oRm.openStart("div", oControl);
		oRm.class("sapMTileCnt");
		oRm.class(sContentTypeClass);
		oRm.class(sFrameTypeClass);
		if (sTooltip.trim()) { // trim check needed since IE11 renders white spaces
			oRm.attr("title", sTooltip);
		}
		oRm.openEnd();
		this._renderContent(oRm, oControl);
		this._renderFooter(oRm, oControl);

		oRm.close("div");
	};

	/**
	 * Renders the HTML for the content of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose content should be rendered
	 */
	TileContentRenderer._renderContent = function(oRm, oControl) {
		if (!oControl._bRenderContent) {
			return;
		}

		var oContent = oControl.getContent();
		if (oContent) {
			oRm.openStart("div", oControl.getId() + "-content");
			oRm.class("sapMTileCntContent");
			oRm.openEnd();
			if (!oContent.hasStyleClass("sapMTcInnerMarker")) {
				oContent.addStyleClass("sapMTcInnerMarker");
			}
			oRm.renderControl(oContent);
			oRm.close("div");
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
		if (!oControl._bRenderFooter) {
			return;
		}

		var sColorClass = "sapMTileCntFooterTextColor" + oControl.getFooterColor();
		var sFooterTxt = oControl._getFooterText(oRm, oControl);
		// footer text div
		oRm.openStart("div", oControl.getId() + "-footer-text");
		oRm.class("sapMTileCntFtrTxt");
		oRm.class(encodeCSS(sColorClass));
		oRm.openEnd();
		oRm.text(sFooterTxt);
		oRm.close("div");
	};

	return TileContentRenderer;
}, /* bExport= */ true);