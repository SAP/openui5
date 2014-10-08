/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class Slider renderer.
	 * @static
	 */
	var SliderRenderer = {};
	
	/**
	 * CSS class to be applied to the HTML root element of the Slider control.
	 *
	 * @type {string}
	 */
	SliderRenderer.CSS_CLASS = "sapMSlider";
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oSlider An object representation of the slider that should be rendered.
	 */
	SliderRenderer.render = function(oRm, oSlider) {
		var bEnabled = oSlider.getEnabled(),
			sTooltip = oSlider.getTooltip_AsString(),
			CSS_CLASS = SliderRenderer.CSS_CLASS;
	
		// avoid render when not visible
		if (!oSlider.getVisible()) {
			return;
		}
	
		oRm.write("<div");
		oRm.addClass(CSS_CLASS);
	
		if (!bEnabled) {
			oRm.addClass(CSS_CLASS + "Disabled");
		}
	
		oRm.addStyle("width", oSlider.getWidth());
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.writeControlData(oSlider);
	
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
	
		oRm.write(">");
		oRm.write('<div');
		oRm.writeAttribute("id", oSlider.getId() + "-inner");
		oRm.addClass(CSS_CLASS + "Inner");
	
		if (!bEnabled) {
			oRm.addClass(CSS_CLASS + "InnerDisabled");
		}
	
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");
	
		if (oSlider.getProgress()) {
			this.renderProgressIndicator(oRm, oSlider);
		}
	
		this.renderHandle(oRm, oSlider);
		oRm.write("</div>");
	
		if (oSlider.getName()) {
			this.renderInput(oRm, oSlider);
		}
	
		oRm.write("</div>");
	};
	
	SliderRenderer.renderProgressIndicator = function(oRm, oSlider) {
		oRm.write("<div");
		oRm.writeAttribute("id", oSlider.getId() + "-progress");
		oRm.addClass(SliderRenderer.CSS_CLASS + "Progress");
		oRm.addStyle("width", oSlider._sProgressValue);
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write("></div>");
	};
	
	SliderRenderer.renderHandle = function(oRm, oSlider) {
		var bEnabled = oSlider.getEnabled(),
			fValue = oSlider.getValue();
	
		oRm.write("<span");
		oRm.writeAttribute("id", oSlider.getId() + "-handle");
		oRm.writeAttribute("title", fValue);
		oRm.addClass(SliderRenderer.CSS_CLASS + "Handle");
		oRm.addStyle(sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left", oSlider._sProgressValue);
	
		// WAI-ARIA
		oRm.writeAccessibilityState(oSlider, {
			role: "slider",
			orientation: "horizontal",
			valuemin: oSlider.getMin(),
			valuemax: oSlider.getMax(),
			valuenow: fValue,
			valuetext: fValue,
			live: "assertive",
			disabled: !bEnabled
		});
	
		oRm.writeClasses();
		oRm.writeStyles();
	
		if (bEnabled) {
			oRm.writeAttribute("tabindex", "0");
		}
	
		oRm.write("></span>");
	};
	
	SliderRenderer.renderInput = function(oRm, oSlider) {
		oRm.write('<input type="text"');
		oRm.writeAttribute("id", oSlider.getId() + "-input");
		oRm.addClass(SliderRenderer.CSS_CLASS + "Input");
	
		if (!oSlider.getEnabled()) {
			oRm.write("disabled");
		}
	
		oRm.writeClasses();
		oRm.writeAttributeEscaped("name", oSlider.getName());
		oRm.writeAttribute("value", oSlider.getValue());
		oRm.write("/>");
	};

	return SliderRenderer;

}, /* bExport= */ true);
