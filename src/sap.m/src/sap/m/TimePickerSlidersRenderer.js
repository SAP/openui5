/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"], function(Device) {
	"use strict";

	/**
	 * TimePickerSlidersRenderer renderer.
	 * @namespace
	 */
	var TimePickerSlidersRenderer = {};

	/**
	 * Renders the HTML for the given {@link sap.m.TimePickerSliders} control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	TimePickerSlidersRenderer.render = function(oRM, oControl) {
		var aSliders = oControl.getAggregation("_columns"),
			sLabelText = oControl.getLabelText() || "",
			oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			iSliderIndex,
			bRtl = sap.ui.getCore().getConfiguration().getRTL();

		oRM.write("<div onselectstart=\"return false;\"");
		oRM.writeControlData(oControl);
		oRM.addClass("sapMTimePickerContainer");
		oRM.addStyle("width", oControl.getWidth());
		oRM.addStyle("height", oControl.getHeight());
		oRM.writeClasses();
		oRM.writeStyles();

		//WAI-ARIA region
		oRM.writeAccessibilityState(oControl, {
			label: (sLabelText + " " + oRb.getText("TIMEPICKER_SCREENREADER_TAG")).trim()
		});

		oRM.write(">");

		if (!Device.system.desktop) {
			oRM.write("<div id=\"" + oControl.getId() + "-label" + "\"");
			oRM.addClass("sapMTimePickerContainerLabel");
			oRM.writeClasses();
			oRM.write(">");
			oRM.addStyle("display", "block");
			oRM.writeEscaped(sLabelText);
			oRM.write("</div>");
		}

		if (bRtl) {
			for (iSliderIndex = aSliders.length - 1; iSliderIndex >= 0; iSliderIndex--) {
				oRM.renderControl(aSliders[iSliderIndex]);
			}
		} else {
			for (iSliderIndex = 0; iSliderIndex < aSliders.length; iSliderIndex++) {
				oRM.renderControl(aSliders[iSliderIndex]);
			}
		}

		oRM.write("</div>");
	};


	return TimePickerSlidersRenderer;

}, /* bExport= */ true);
