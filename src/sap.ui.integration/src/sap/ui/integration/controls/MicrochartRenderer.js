/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library"
], function(mLibrary) {
	"use strict";

	const Size = mLibrary.Size;

	/**
	 * MicrochartRenderer renderer.
	 * @namespace
	 */
	const MicrochartRenderer = {
		apiVersion: 2
	};

	MicrochartRenderer.render = function (oRm, oMicrochart) {
		const sValueClass = "sapUiIntMicrochartValue" + oMicrochart.getValueColor();

		oRm.openStart("div", oMicrochart)
			.class("sapUiIntMicrochartChartWrapper")
			.openEnd();

		// chart
		oRm.openStart("div")
			.class("sapUiIntMicrochartChart")
			.class("sapUiIntMicrochartSize" + oMicrochart.getSize());

		if (oMicrochart.getSize() === Size.Responsive) {
			oRm.style("height", oMicrochart.getHeight());
		}

		oRm.openEnd();

		oRm.openStart("div")
			.class("sapUiIntMicrochartChartInner")
			.openEnd()
			.renderControl(oMicrochart.getChart())
			.close("div");

		oRm.close("div");

		// value
		const sDisplayValue = oMicrochart.getDisplayValue();
		if (sDisplayValue) {
			oRm.openStart("div")
				.class("sapMSLIInfo")
				.class(sValueClass)
				.openEnd()
				.text(sDisplayValue)
				.close("div");
		}

		oRm.close("div");
	};

	return MicrochartRenderer;

});
