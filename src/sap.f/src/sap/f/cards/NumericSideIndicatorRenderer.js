/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.NumericSideIndicatorRenderer
sap.ui.define([],
	function () {
        "use strict";

        var NumericSideIndicatorRenderer = {};

		/**
		 * Render a numeric header side indicator.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.NumericHeader} oControl An object representation of the control that should be rendered
		 */
		NumericSideIndicatorRenderer.render = function (oRm, oControl) {
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

		return NumericSideIndicatorRenderer;
	}, /* bExport= */ true);