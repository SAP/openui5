/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.NumericHeader
sap.ui.define([],
	function () {
		"use strict";

		var NumericHeaderRenderer = {};

		/**
		 * Render a numeric header.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.NumericHeader} oControl An object representation of the control that should be rendered
		 */
		NumericHeaderRenderer.render = function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapFCardHeader");
			oRm.addClass("sapFCardNumericHeader");
			oRm.writeAttribute("tabindex", "0");
			//Accessibility state
			oRm.writeAccessibilityState(oControl, {
				role: oControl._sAriaRole,
				labelledby: {value: oControl._getHeaderAccessibility(), append: true},
				roledescription: {value: oControl._sAriaRoleDescritoion, append: true},
				level: {value: oControl._sAriaHeadingLevel}
			});
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			NumericHeaderRenderer.renderHeaderText(oRm, oControl);

			NumericHeaderRenderer.renderIndicators(oRm, oControl);

			var oDetails = oControl.getAggregation("_details");
			if (oDetails && oDetails.getText()) {
				oDetails.addStyleClass("sapFCardHeaderDetails");
				oRm.renderControl(oDetails);
			}

			oRm.write("</div>");
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
				oUnitOfMeasurement = oControl.getAggregation("_unitOfMeasurement"),
				sStatus = oControl.getStatusText();

			// TODO reuse title and subtitle rendering from the default header if possible
			oRm.write("<div");
			oRm.addClass("sapFCardHeaderText");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapFCardHeaderTextFirstLine");
			oRm.writeClasses();
			oRm.write(">");

			if (oTitle) {
				oTitle.addStyleClass("sapFCardTitle");
				oRm.renderControl(oTitle);
			}

			if (sStatus) {
				oRm.write("<span");
				oRm.writeAttribute('id', oControl.getId() + '-status');
				oRm.addClass("sapFCardStatus");
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(sStatus);
				oRm.write("</span>");
			}

			oRm.write("</div>");

			if (oSubtitle || oUnitOfMeasurement) {
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
			}

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

			if ((oMainIndicator && oMainIndicator.getValue()) || oSideIndicators.length !== 0){
				oRm.write("<div");
				oRm.addClass("sapFCardHeaderIndicators");
				oRm.writeClasses();
				oRm.write(">");

				if (oMainIndicator && oMainIndicator.getValue()) {
					oMainIndicator.addStyleClass("sapFCardHeaderMainIndicator");
					oRm.renderControl(oMainIndicator);

					oRm.write("<div");
					oRm.addClass("sapFCardHeaderIndicatorsGap");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("</div>");
				}

				if (oSideIndicators.length !== 0) {
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
			}
		};

		return NumericHeaderRenderer;
	}, /* bExport= */ true);
