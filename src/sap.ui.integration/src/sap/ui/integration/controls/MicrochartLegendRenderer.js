/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Core"
], function(mLibrary, Core) {
	"use strict";

	var ValueColor = mLibrary.ValueColor;

	/**
	 * MicrochartLegendRenderer renderer.
	 * @namespace
	 */
	var MicrochartLegendRenderer = {
		apiVersion: 2
	};

	MicrochartLegendRenderer.render = function (oRm, oMicrochartLegend) {
		var oChart = Core.byId(oMicrochartLegend.getChart()),
			aLegendColors = [],
			aTexts = oMicrochartLegend.getAggregation("_titles");

		if (oChart) {
			aLegendColors = oChart._calculateChartData().map(function (oData) { return oData.color; });
		}

		oRm.openStart("div", oMicrochartLegend)
			.class("sapUiIntMicrochartLegend")
			.openEnd();

		aLegendColors.forEach(function (sColor, i) {
			oRm.openStart("div")
				.class("sapUiIntMicrochartLegendItem")
				.openEnd();

			oRm.openStart("div");
			MicrochartLegendRenderer.addColor(oRm, oMicrochartLegend, sColor);
			oRm.openEnd().close("div");

			oRm.renderControl(aTexts[i]);

			oRm.close("div");
		});

		oRm.close("div");
	};

	MicrochartLegendRenderer.addColor = function (oRm, oMicrochartLegend, sColor) {
		if (ValueColor[sColor]) {
			oRm.class("sapUiIntMicrochartLegendItem" + sColor);
		} else {
			var sColorAsCSSValue = oMicrochartLegend._mLegendColors[sColor] || sColor; // A value from the chart palette OR any CSS value.
			oRm.style("background", sColorAsCSSValue);
		}
	};

	return MicrochartLegendRenderer;

}, /* bExport= */ true);
