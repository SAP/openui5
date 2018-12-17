/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.KpiSideIndicatorRenderer
sap.ui.define([],
	function () {
        "use strict";

        var KpiSideIndicatorRenderer = {};

		/**
		 * Render a kpi header side indicator.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.header.KPI} oControl An object representation of the control that should be rendered
		 */
		KpiSideIndicatorRenderer.render = function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapFCardHeaderSideIndicator");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			oRm.renderControl(oControl.getAggregation("_title"));

			oRm.renderControl(oControl.getAggregation("_number"));

			oRm.write("</div>");
		};

		return KpiSideIndicatorRenderer;
	}, /* bExport= */ true);