/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.NumericHeader
sap.ui.define([],
	function () {
        "use strict";

        var NumericHeaderRenderer = {},
			oRb = sap.ui.getCore().getLibraryResourceBundle("sap.f");

		/**
		 * Render a numeric header.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.NumericHeader} oControl An object representation of the control that should be rendered
		 */
		NumericHeaderRenderer.render = function (oRm, oControl) {
			oRm.write("<header");
			oRm.writeControlData(oControl);
			oRm.addClass("sapFCardHeader");
			oRm.addClass("sapFCardNumericHeader");
			oRm.writeAttribute("tabindex", "0");
			//Accessibility state
			oRm.writeAccessibilityState(oControl, {
				role: "group",
				labelledBy: {value: oControl._getHeaderAccessibility(), append: true},
				roledescription: {value: oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), append: true}
			});
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			NumericHeaderRenderer.renderHeaderText(oRm, oControl);

			NumericHeaderRenderer.renderIndicators(oRm, oControl);

			var oDetails = oControl.getAggregation("_details");
			if (oDetails) {
				oDetails.addStyleClass("sapFCardHeaderDetails");
				oRm.renderControl(oDetails);
			}

			oRm.write("</header>");
		};

		/**
		 * Render title and subtitle texts.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.NumericHeader} oControl An object representation of the control that should be rendered
		 */
		NumericHeaderRenderer.renderHeaderText = function(oRm, oControl) {
			var oTitle = oControl.getAggregation("_title"),
				oSubtitle = oControl.getAggregation("_subtitle"),
				oUnitOfMeasurement = oControl.getAggregation("_unitOfMeasurement");

			// TODO reuse title and subtitle rendering from the default header if possible
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
		 * @param {sap.f.cards.NumericHeader} oControl An object representation of the control that should be rendered
		 */
		NumericHeaderRenderer.renderIndicators = function(oRm, oControl) {
			var oMainIndicator = oControl.getAggregation("_mainIndicator"),
				oSideIndicators = oControl.getAggregation("sideIndicators");

			oRm.write("<div");
			oRm.addClass("sapFCardHeaderIndicators");
			oRm.writeClasses();
			oRm.write(">");

			if (oMainIndicator) {
				oMainIndicator.addStyleClass("sapFCardHeaderMainIndicator");
				oRm.renderControl(oMainIndicator);

				oRm.write("<div");
				oRm.addClass("sapFCardHeaderIndicatorsGap");
				oRm.writeClasses();
				oRm.write(">");
				oRm.write("</div>");
			}

			if (oSideIndicators) {
				oRm.write("<div");
				oRm.addClass("sapFCardHeaderSideIndicators");
				oRm.writeClasses();
				oRm.write(">");

				// TODO min-width for side indicator. Now it starts to truncate too early
				// Maybe wrap them when card is toooo small
				oSideIndicators.forEach(function(oIndicator) {
					oRm.renderControl(oIndicator);
				});
				oRm.write("</div>");
			}

			oRm.write("</div>");
		};

		return NumericHeaderRenderer;
	}, /* bExport= */ true);