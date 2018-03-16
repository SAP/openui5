/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.m.SliderTooltipContainer
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";

	/**
	 * SliderTooltipContainer renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var SliderTooltipContainerRenderer = {},
		CONSTANTS = {
			MAIN_CLASS: "sapMSliderTooltipContainer"
		};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the renderer output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	SliderTooltipContainerRenderer.render = function(oRm, oControl) {
		var aTooltips = oControl.getAssociatedTooltipsAsControls();
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addStyle("width", oControl.getWidth());
		oRm.writeStyles();
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-container");
		oRm.addStyle("left", "0%");
		oRm.addStyle("right", "0%");
		oRm.addClass(CONSTANTS.MAIN_CLASS);

		if (!oControl.getEnabled()) {
			oRm.addClass(CONSTANTS.MAIN_CLASS + "Disabled");
		}

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");

		if (aTooltips && aTooltips.length) {
			aTooltips.forEach(function(oTooltip) {
				oRm.renderControl(oTooltip);
			});
		}

		oRm.write("</div>");
		oRm.write("</div>");
	};

	return SliderTooltipContainerRenderer;

}, /* bExport= */ true);