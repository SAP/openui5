/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

	/**
	 * TimePickerSlidersRenderer renderer.
	 * @namespace
	 */
	var TimePickerSlidersRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TimePickerSlidersRenderer.render = function(oRenderManager, oControl) {
		var aSliders = oControl.getAggregation("_columns"),
			sLabelText = oControl.getLabelText() || "",
			oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		oRenderManager.write("<div onselectstart=\"return false;\"");
		oRenderManager.writeControlData(oControl);
		oRenderManager.addClass("sapMTimePickerContainer");
		oRenderManager.writeClasses();

		//WAI-ARIA region
		oRenderManager.writeAccessibilityState(oControl, {
			label: (sLabelText + " " + oRb.getText("TIMEPICKER_SCREENREADER_TAG")).trim()
		});

		oRenderManager.write(">");

		if (!sap.ui.Device.system.desktop) {
			oRenderManager.write("<div id=\"" + oControl.getId() + "-label" + "\"");
			oRenderManager.addClass("sapMTimePickerContainerLabel");
			oRenderManager.writeClasses();
			oRenderManager.write(">");
			oRenderManager.addStyle("display", "block");
			oRenderManager.write(sLabelText + "</div>");
		}

		for (var iSlider = 0; iSlider < aSliders.length; iSlider++) {

			oRenderManager.renderControl(aSliders[iSlider]);

		}
		oRenderManager.write("</div>");
	};


	return TimePickerSlidersRenderer;

}, /* bExport= */ false);
