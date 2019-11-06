/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	function _setDimensionAsStyle (oRm, sDimension, sValue) {
		if (sValue !== "" || sValue.toLowerCase() === "auto") {
			oRm.style(sDimension, sValue);
		}
	}

	/**
	 * IFrame renderer.
	 * @namespace
	 */
	var IFrameRenderer = {apiVersion: 2};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            The RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oIFrame
	 *            The iframe to be rendered
	 */
	IFrameRenderer.render = function(oRm, oIFrame) {
		oRm.openStart("iframe", oIFrame);

		_setDimensionAsStyle(oRm, "width", oIFrame.getWidth());
		_setDimensionAsStyle(oRm, "height", oIFrame.getHeight());
		oRm.style("display", "block");
		oRm.style("border", "none");

		oRm.attr("src", oIFrame.getUrl());

		oRm.openEnd();

		oRm.close("iframe");
	};

	return IFrameRenderer;
}, /* bExport= */ true);
