/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * TimePickerInputsRenderer renderer.
	 * @namespace
	 */
	var TimePickerInputsRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given {@link sap.m.TimePickerInputs} control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.TimePickerInputs} oControl An object representation of the control that should be rendered
	 */
	TimePickerInputsRenderer.render = function(oRm, oControl) {
		var aControls = oControl.getAggregation("_inputs"),
			oSegButton = oControl.getAggregation("_buttonAmPm"),
			aSeparators = aControls && aControls.length ? Array(aControls.length - 1).fill(":") : [],
			iIndex;

		if (aControls) {
			if (oSegButton) {
				aControls.push(oSegButton);
				aSeparators.push(" ");
			}

			oRm.openStart("div", oControl); // outer wrapper
			oRm.class("sapMTPInputsContainer");
			oRm.attr("role", "application");
			oRm.attr("aria-roledescription", oControl._getAriaRoleDescription());
			oRm.openEnd();

			// render buttons and separators
			for (iIndex = 0; iIndex < aControls.length; iIndex++) {
				oRm.renderControl(aControls[iIndex]);
				if (aSeparators[iIndex]) {
					oRm.openStart("span");
					oRm.attr("aria-hidden", "true");
					oRm.openEnd();
					oRm.text(aSeparators[iIndex]);
					oRm.close("span");
				}
			}

			oRm.renderControl(oControl._getCurrentTimeButton());

			oRm.close("div"); // outer wrapper
		}
	};

	return TimePickerInputsRenderer;
}, /* bExport= */ true);
