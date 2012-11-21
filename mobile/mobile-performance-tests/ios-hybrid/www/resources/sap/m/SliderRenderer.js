/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.SliderRenderer");

/**
 * @class Slider renderer.
 * @static
 */
sap.m.SliderRenderer = {};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oSld an object representation of the slider that should be rendered
 */
sap.m.SliderRenderer.render = function(oRm, oSld) {
	var iMin = oSld.getMin(),
		iMax = oSld.getMax(),
		iStep = oSld.getStep(),
		sName = oSld.getName(),
		bEnabled = oSld.getEnabled();

	// avoid render when not visible
	if (!oSld.getVisible()) {
		return;
	}

	oRm.write("<div");
	oRm.addClass("sapMSldCont");
	oRm.addStyle("width", oSld.getWidth());
	oRm.writeClasses();
	oRm.writeStyles();
	oRm.writeControlData(oSld);
	oRm.write(">");
		// render input range for screen readers
		oRm.write('<input type="range"');

			if (!bEnabled) {
				oRm.write("disabled");
			}

			if (sName !== "") {
				oRm.writeAttributeEscaped("name", sName);
			}

			oRm.writeAttribute("min", iMin);
			oRm.writeAttribute("max", iMax);
			oRm.writeAttribute("step", iStep);
			oRm.writeAttribute("value", oSld.getValue());
			oRm.write("/>");

		oRm.writeClasses();

		// render HTML
		oRm.write('<div');
			oRm.addClass("sapMSld");

			if (oSld.getProgress()) {
				oRm.addClass("sapMSldProgress");
				oRm.addStyle("-webkit-background-size", oSld.iProgressValue + oSld._sBackgroundSizeRemainder);
			}

			if (!bEnabled) {
				oRm.addClass("sapMSldDisabled");
			}

			oRm.writeClasses();
			oRm.writeStyles();

		oRm.write(">");
				// render slider thumb
				oRm.write('<span class="sapMSldThumb"');
					oRm.addStyle("left", oSld.iProgressValue + "%");
					oRm.writeStyles();
				oRm.write('><span></span></span>')
		oRm.write("</div>");
	oRm.write("</div>");
};
