/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.m.SliderTooltip
sap.ui.define(["sap/ui/core/Core"],
	function(Core) {
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
	 * @param {sap.m.SliderTooltip} oControl An object representation of the control that should be rendered
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
		var oRb = Core.getLibraryResourceBundle("sap.m");

		oRM.voidStart("input", oControl.getId() + "-input")
			.class(SliderTooltipRenderer.CSS_CLASS + "Input");

		if (!oControl.getEditable()) {
			oRM.class(SliderTooltipRenderer.CSS_CLASS + "NonEditable");
		}

		oRM.attr("aria-label", oRb.getText("SLIDER_INPUT_LABEL"));

		oRM.accessibilityState(oControl)
			.attr("tabindex", "-1")
			.attr("value", oControl.getValue())
			.attr("type", "number")
			.attr("step", oControl.getStep())
			.voidEnd();
	};

	return SliderTooltipRenderer;

}, /* bExport= */ true);