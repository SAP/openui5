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
			oSideIndicators = oNumericIndicators.getSideIndicators(),
			bHasVisibleSideIndicator = oSideIndicators.some(function (oIndicator) {
				return oIndicator.getVisible();
			});

		oRm.openStart("div", oNumericIndicators)
			.class("sapFCardNumericIndicators")
			.class("sapFCardNumericIndicatorsSideAlign" + oNumericIndicators.getSideIndicatorsAlignment());

		if (oNumericIndicators.getNumberSize() === "S") {
			// TODO: replace this temporary solution for small numeric data with permanent one
			oRm.class("sapMTileSmallPhone");
		}

		oRm.openEnd();

		if (oMainIndicator && oNumericIndicators.getNumberVisible()) {
			oRm.openStart("div")
				.class("sapFCardNumericIndicatorsMain")
				.openEnd()
				.renderControl(oMainIndicator)
				.close("div");

			oRm.openStart("div")
				.class("sapFCardNumericIndicatorsGap")
				.openEnd()
				.close("div");
		}

		if (oSideIndicators.length !== 0 && bHasVisibleSideIndicator) {
			oRm.openStart("div")
				.class("sapFCardNumericIndicatorsSide")
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
