/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	function _setDimensionAsStyle(oRm, sDimension, sValue) {
		if (sValue !== "" || sValue.toLowerCase() === "auto") {
			oRm.style(sDimension, sValue);
		}
	}

	 function createsSandboxAttributesString(oAdvancedSettings) {
		return Object.keys(oAdvancedSettings)
		.filter((sKey) => oAdvancedSettings[sKey])
		.map((sKey) => sKey.replace(/[A-Z]/g, "-$&").toLowerCase())
		.join(" ");
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

		const oAdvancedSettings = oIFrame.getAdvancedSettings();
		const { additionalSandboxParameters: aAdditionalSandboxParameters, ...oFilteredAdvancedSettings } = oAdvancedSettings;
		const sAdditionalSandboxParameters = aAdditionalSandboxParameters?.join(" ");
		const sSandboxAttributes = createsSandboxAttributesString(oFilteredAdvancedSettings);
		const sCombinedSandboxAttributes = sAdditionalSandboxParameters ? `${sSandboxAttributes} ${sAdditionalSandboxParameters}` : sSandboxAttributes;
		oRm.attr("sandbox", sCombinedSandboxAttributes);
		// Always set the src to about:blank to avoid adding history entries when parameters are resolved
		oRm.attr("src", "about:blank");

		var sTitle = oIFrame.getTitle();
		if (sTitle) {
			oRm.attr("title", sTitle);
		}

		oRm.openEnd();

		oRm.close("iframe");
	};

	return IFrameRenderer;
});
