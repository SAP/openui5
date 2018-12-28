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

			var oTitle = oControl.getAggregation("_title");
			oTitle.addStyleClass("sapFCardHeaderSITitle");
			oRm.renderControl(oTitle);

			oRm.write("<div");
			oRm.addClass("sapFCardHeaderSINumber");
			oRm.writeClasses();
			oRm.write(">");

			var oNumber = oControl.getAggregation("_number");
			if (oNumber) {
				oRm.renderControl(oNumber);
			}

			var oUnit = oControl.getAggregation("_unit");
			if (oUnit) {
				oRm.renderControl(oUnit);
			}

			oRm.write("</div>");

			oRm.write("</div>");
		};

		return KpiSideIndicatorRenderer;
	}, /* bExport= */ true);