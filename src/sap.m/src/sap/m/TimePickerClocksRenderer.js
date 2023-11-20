/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * TimePickerClocksRenderer renderer.
	 * @namespace
	 */
	var TimePickerClocksRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given {@link sap.m.TimePickerClocks} control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.TimePickerClocks} oControl An object representation of the control that should be rendered
	 */
	TimePickerClocksRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl); // outer wrapper
		oRm.class("sapMTPClocksContainer");
		oRm.openEnd();

		this.renderButtons(oRm, oControl);
		this.renderClocks(oRm, oControl);

		oRm.close("div"); // outer wrapper
	};

	/**
	 * Renders the buttons for the given {@link sap.m.TimePickerClocks} control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.TimePickerClocks} oControl An object representation of the control that should be rendered
	 */
	TimePickerClocksRenderer.renderButtons = function(oRm, oControl) {
		var aButtons = oControl.getAggregation("_buttons"),
			oSegButton = oControl.getAggregation("_buttonAmPm"),
			aSeparators = aButtons && aButtons.length ? Array(aButtons.length - 1).fill(":") : [],
			iIndex;

		if (aButtons) {

			if (oSegButton) {
				aButtons.push(oSegButton);
				aSeparators.push(" ");
			}
			oRm.openStart("div"); // buttons wrapper
			oRm.class("sapMTPCButtons");
			oRm.attr("dir", "ltr");
			oRm.openEnd();

			for (iIndex = 0; iIndex < aButtons.length; iIndex++) {
				oRm.renderControl(aButtons[iIndex]);
				if (aSeparators[iIndex]) {
					oRm.openStart("span");
					oRm.attr("aria-hidden", "true");
					oRm.openEnd();
					oRm.text(aSeparators[iIndex]);
					oRm.close("span");
				}
			}

			oRm.renderControl(oControl._getCurrentTimeButton());

			oRm.close("div"); // buttons wrapper

		}
	};

	/**
	 * Renders the clocks for the given {@link sap.m.TimePickerClocks} control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.TimePickerClocks} oControl An object representation of the control that should be rendered
	 */
	TimePickerClocksRenderer.renderClocks = function(oRm, oControl) {
		var aClocks = oControl.getAggregation("_clocks"),
			iIndex;

		if (aClocks) {

			oRm.openStart("div"); // clocks wrapper
			oRm.class("sapMTPCClocks");
			oRm.attr("role", "img");
			oRm.attr("aria-label", oControl._getAriaLabel());
			oRm.openEnd();

			// render clocks
			for (iIndex = 0; iIndex < aClocks.length; iIndex++) {
				if (iIndex === oControl._getActiveClock()) {
					aClocks[iIndex].addStyleClass("sapMTPCActive");
				}
				oRm.renderControl(aClocks[iIndex]);
			}

			oRm.close("div"); // clocks wrapper

		}
	};

	return TimePickerClocksRenderer;
}, /* bExport= */ true);
