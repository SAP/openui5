/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.m.SliderTooltipContainer
sap.ui.define(['sap/ui/core/Renderer'],
	function(Renderer) {
	"use strict";

	/**
	 * SliderTooltipContainer renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var SliderTooltipContainerRenderer = {
			apiVersion: 2
		},
		CONSTANTS = {
			MAIN_CLASS: "sapMSliderTooltipContainer"
		};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the renderer output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	SliderTooltipContainerRenderer.render = function(oRm, oControl) {
		var aTooltips = oControl.getAssociatedTooltipsAsControls();
		oRm.openStart("div", oControl)
			.style("width", oControl.getWidth())
			.openEnd();

		oRm.openStart("div")
			.attr("id", oControl.getId() + "-container")
			.style("left", "0%")
			.style("right", "0%")
			.class(CONSTANTS.MAIN_CLASS);

		if (!oControl.getEnabled()) {
			oRm.class(CONSTANTS.MAIN_CLASS + "Disabled");
		}

		oRm.openEnd();

		if (aTooltips && aTooltips.length) {
			aTooltips.forEach(function(oTooltip) {
				oRm.renderControl(oTooltip);
			});
		}

		oRm.close("div")
			.close("div");
	};

	return SliderTooltipContainerRenderer;

}, /* bExport= */ true);