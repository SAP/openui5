/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.m.SliderTooltip
sap.ui.define(['sap/ui/core/Renderer'],
	function(Renderer) {
	"use strict";

	/**
	 * SliderTooltip renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var SliderTooltipRenderer = {
		apiVersion: 2
	};

	SliderTooltipRenderer.CSS_CLASS = "sapMSliderTooltip";

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the renderer output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	SliderTooltipRenderer.render = function(oRM, oControl){
		oRM.openStart("div", oControl)
			.class(SliderTooltipRenderer.CSS_CLASS);

		if (!oControl.getEditable()) {
			oRM.class(SliderTooltipRenderer.CSS_CLASS + "NonEditableWrapper");
		}

		if (oControl.getWidth()) {
			oRM.style("width", oControl.getWidth());
		}

		oRM.openEnd();

		this.renderTooltipElement(oRM, oControl);

		oRM.close("div");
	};

	SliderTooltipRenderer.renderTooltipElement = function (oRM, oControl) {
		var bAccessibilityOn = sap.ui.getCore().getConfiguration().getAccessibility();

		oRM.openStart("input")
			.class(SliderTooltipRenderer.CSS_CLASS + "Input");

		if (!oControl.getEditable()) {
			oRM.class(SliderTooltipRenderer.CSS_CLASS + "NonEditable");
		}

		if (bAccessibilityOn) {
			oRM.accessibilityState(oControl, {});
		}

		oRM.attr("tabindex", "-1")
			.attr("value", oControl.getValue())
			.attr("type", "number")
			.attr("step", oControl.getStep())
			.attr("id", oControl.getId() + "-input")
			.openEnd()
			.close("input");
	};

	return SliderTooltipRenderer;

}, /* bExport= */ true);