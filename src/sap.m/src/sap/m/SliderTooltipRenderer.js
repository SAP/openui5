/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.m.SliderTooltip
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";

	/**
	 * SliderTooltip renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var SliderTooltipRenderer = {};

	SliderTooltipRenderer.CSS_CLASS = "sapMSliderTooltip";

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the renderer output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	SliderTooltipRenderer.render = function(oRM, oControl){
		oRM.write("<div");
		oRM.writeControlData(oControl);

		oRM.addClass(SliderTooltipRenderer.CSS_CLASS);
		oRM.writeClasses();

		if (oControl.getWidth()) {
			oRM.addStyle("width", oControl.getWidth());
		}

		oRM.writeStyles();
		oRM.write(">");

		this.renderTooltipElement(oRM, oControl);

		oRM.write("</div>");
	};

	SliderTooltipRenderer.renderTooltipElement = function (oRM, oControl) {
		var bAccessibilityOn = sap.ui.getCore().getConfiguration().getAccessibility();

		oRM.write('<input ');
		oRM.addClass(SliderTooltipRenderer.CSS_CLASS + "Input");

		if (!oControl.getEditable()) {
			oRM.addClass(SliderTooltipRenderer.CSS_CLASS + "NonEditable");
		}

		if (bAccessibilityOn) {
			oRM.writeAccessibilityState(oControl, {});
		}

		oRM.writeClasses();

		oRM.writeAttribute("tabindex", "-1");
		oRM.writeAttributeEscaped("value", oControl.getValue());
		oRM.writeAttributeEscaped("type", "number");
		oRM.writeAttributeEscaped("step", oControl.getStep());
		oRM.writeAttributeEscaped("id", oControl.getId() + "-input");

		oRM.write("/>");
	};

	return SliderTooltipRenderer;

}, /* bExport= */ true);