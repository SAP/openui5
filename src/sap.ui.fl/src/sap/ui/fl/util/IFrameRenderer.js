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
	 * @param {sap.ui.fl.util.IFrame} oIFrame
	 *            The iframe to be rendered
	 */
	IFrameRenderer.render = function(oRm, oIFrame) {
		oRm.openStart("iframe", oIFrame);

		_setDimensionAsStyle(oRm, "width", oIFrame.getWidth());
		_setDimensionAsStyle(oRm, "height", oIFrame.getHeight());
		oRm.style("display", "block");
		oRm.style("border", "none");

		oRm.attr("sandbox", "allow-forms allow-popups allow-scripts allow-same-origin allow-modals");

		if (oIFrame.getUseLegacyNavigation()) {
			oRm.attr("src", oIFrame.getUrl());
		} else {
			// With the new location.replace approach, the actual
			// target url will be set onAfterRendering
			oRm.attr("src", "about:blank");
		}

		var sTitle = oIFrame.getTitle();
		if (sTitle) {
			oRm.attr("title", sTitle);
		}

		oRm.openEnd();

		oRm.close("iframe");
	};

	return IFrameRenderer;
}, /* bExport= */ true);
