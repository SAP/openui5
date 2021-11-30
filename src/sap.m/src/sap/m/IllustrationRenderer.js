/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	/**
	 * Illustration renderer.
	 * @namespace
	 */
	var IllustrationRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oIllustration An object representation of the control that should be rendered
	 */
	IllustrationRenderer.render = function (oRm, oIllustration) {
		var sSymbolId = oIllustration._sSymbolId;

		oRm.openStart("svg", oIllustration);
		oRm.class("sapFIllustration");
		oRm.openEnd();

			oRm.openStart("use");
			oRm.attr('href', "#" + sSymbolId);
			oRm.openEnd();
			oRm.close("use");

		oRm.close("svg");
	};

	return IllustrationRenderer;

}, /* bExport= */ true);
