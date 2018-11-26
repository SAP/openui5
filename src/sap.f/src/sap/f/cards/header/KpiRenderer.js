/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.Avatar
sap.ui.define([],
	function () {
        "use strict";

        var KpiRenderer = {};

		/**
		 * Render a kpi header.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.header.KPI} oControl An object representation of the control that should be rendered
		 */
		KpiRenderer.render = function (oRm, oControl) {
			oRm.write("<div");
			oRm.addClass("sapFCardHeaderKpi");
			oRm.writeClasses();
			oRm.write(">");

			KpiRenderer.renderHeaderText(oRm, oControl);

			KpiRenderer.renderIndicators(oRm, oControl);

			var oDetails = oControl.getAggregation("_details");
			if (oDetails) {
				oDetails.addStyleClass("sapFCardHeaderDetails");
				oRm.renderControl(oDetails);
			}

			oRm.write("</div>");
		};

		/**
		 * Render title and subtitle texts.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.header.KPI} oControl An object representation of the control that should be rendered
		 */
		KpiRenderer.renderHeaderText = function(oRm, oControl) {
			var oTitle = oControl.getAggregation("_title"),
				oSubtitle = oControl.getAggregation("_subtitle"),
				oUnitOfMeasurement = oControl.getAggregation("_unitOfMeasurement");

			// TODO reuse title and subtitle if possible
			oRm.write("<div");
			oRm.addClass("sapFCardHeaderText");
			oRm.writeClasses();
			oRm.write(">");

			if (oTitle) {
				oTitle.addStyleClass("sapFCardTitle");
				oRm.renderControl(oTitle);
			}

			oRm.write("<div");
			oRm.addClass("sapFCardSubtitle");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div>");
			if (oSubtitle) {
				oRm.renderControl(oSubtitle);
			}
			oRm.write("</div>");
			oRm.write("<div>");
			if (oUnitOfMeasurement) {
				oUnitOfMeasurement.addStyleClass("sapFCardHeaderUnitOfMeasurement");
				oRm.renderControl(oUnitOfMeasurement);
			}
			oRm.write("</div>");

			oRm.write("</div>");
			oRm.write("</div>");
		};

		/**
		 * Render main indicator and side indicators if any.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.header.KPI} oControl An object representation of the control that should be rendered
		 */
		KpiRenderer.renderIndicators = function(oRm, oControl) {
			var oMainIndicator = oControl.getAggregation("_mainIndicator"),
				oSideIndicators = oControl.getAggregation("_sideIndicators");

			oRm.write("<div");
			oRm.addClass("sapFCardHeaderIndicators");
			oRm.writeClasses();
			oRm.write(">");

			if (oMainIndicator) {
				oMainIndicator.addStyleClass("sapFCardHeaderMainIndicator");
				oRm.renderControl(oMainIndicator);
			}

			if (oSideIndicators) {
				oRm.write("<div");
				oRm.addClass("sapFCardHeaderSideIndicators");
				oRm.writeClasses();
				oRm.write(">");
				oSideIndicators.forEach(function(oIndicator) {
					oIndicator.addStyleClass("sapFCardHeaderSideIndicator");
					oRm.renderControl(oIndicator);
				});
				oRm.write("</div>");
			}

			oRm.write("</div>");
		};

		return KpiRenderer;
	}, /* bExport= */ true);