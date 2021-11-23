/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.NumericIndicators
sap.ui.define([], function () {
	"use strict";

	var NumericIndicatorsRenderer = {
		apiVersion: 2
	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericIndicators} oNumericIndicators An object representation of the control that should be rendered
	 */
	NumericIndicatorsRenderer.render = function (oRm, oNumericIndicators) {
		var oMainIndicator = oNumericIndicators.getAggregation("_mainIndicator"),
			oSideIndicators = oNumericIndicators.getSideIndicators();

		oRm.openStart("div", oNumericIndicators)
			.class("sapFCardHeaderIndicators")
			.openEnd();

		if (oMainIndicator) {
			oRm.openStart("div")
				.class("sapFCardHeaderMainIndicator")
				.openEnd()
				.renderControl(oMainIndicator)
				.close("div");

			oRm.openStart("div")
				.class("sapFCardHeaderIndicatorsGap")
				.openEnd()
				.close("div");
		}

		if (oSideIndicators.length !== 0) {
			oRm.openStart("div")
				.class("sapFCardHeaderSideIndicators")
				.openEnd();

			// TODO min-width for side indicator. Now it starts to truncate too early
			// Maybe wrap them when card is too small
			oSideIndicators.forEach(function(oIndicator) {
				oRm.renderControl(oIndicator);
			});
			oRm.close("div");
		}

		oRm.close("div");
	};

	return NumericIndicatorsRenderer;
});
