/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"], function(Device) {
	"use strict";

	/**
	 * WheelSliderContainerRenderer renderer.
	 * @namespace
	 */
	var WheelSliderContainerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given {@link sap.m.WheelSliderContainer} control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	WheelSliderContainerRenderer.render = function(oRM, oControl) {
		var aSliders = oControl.getSliders(),
			sLabelText = oControl.getLabelText() || "",
			oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			iSliderIndex,
			bRtl = sap.ui.getCore().getConfiguration().getRTL();

		oRM.openStart("div", oControl);
		oRM.class("sapMWSContainer");
		oRM.style("width", oControl.getWidth());
		oRM.style("height", oControl.getHeight());

		//WAI-ARIA region
		oRM.accessibilityState(oControl, {
			label: (sLabelText + " " + oRb.getText("TIMEPICKER_SCREENREADER_TAG")).trim()
		});

		oRM.openEnd();

		if (!Device.system.desktop) {
			oRM.openStart("div", oControl.getId() + "-label");
			oRM.class("sapMWSContainerLabel");
			oRM.openEnd();
			oRM.style("display", "block");
			oRM.text(sLabelText);
			oRM.close("div");
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

		oRM.close("div");
	};

	return WheelSliderContainerRenderer;
}, /* bExport= */ true);
