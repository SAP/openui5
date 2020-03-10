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
			var  bLoading = oControl.isLoading(),
				 oToolbar = oControl.getToolbar();

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapFCardHeader");
			oRm.addClass("sapFCardNumericHeader");
			if (bLoading) {
				oRm.addClass("sapFCardHeaderLoading");
			}
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


			oRm.write("<div");
			oRm.addClass("sapFCardHeaderContent");
			oRm.writeClasses();
			oRm.write(">");

			NumericHeaderRenderer.renderHeaderText(oRm, oControl);

			NumericHeaderRenderer.renderIndicators(oRm, oControl);

			NumericHeaderRenderer.renderDetails(oRm, oControl);

			oRm.write("</div>");

			if (oToolbar) {
				oRm.write("<div");
				oRm.addClass("sapFCardHeaderToolbar");
				oRm.writeClasses();
				oRm.write(">");

				oRm.renderControl(oToolbar);

				oRm.write("</div>");
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
				sStatus = oControl.getStatusText(),
				oBindingInfos = oControl.mBindingInfos;

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
				if (oBindingInfos.title) {
					oTitle.addStyleClass("sapFCardHeaderItemBinded");
				}
				oTitle.addStyleClass("sapFCardTitle");
				oRm.renderControl(oTitle);
			}

			if (sStatus) {
				oRm.write("<span");
				oRm.writeAttribute('id', oControl.getId() + '-status');
				oRm.addClass("sapFCardStatus");
				if (oBindingInfos.statusText) {
					oRm.addClass("sapCardStatusLoading");
					oRm.addClass("sapFCardHeaderItemBinded");
				}
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(sStatus);
				oRm.write("</span>");
			}

			oRm.write("</div>");

			if (((oSubtitle && oSubtitle.getText()) || ( oBindingInfos && oBindingInfos.subtitle))
				|| ((oUnitOfMeasurement && oUnitOfMeasurement.getText()) || ( oBindingInfos && oBindingInfos.unitOfMeasurement))) {
				oRm.write("<div");
				oRm.addClass("sapFCardSubtitle");
				oRm.writeClasses();
				oRm.write(">");

				if (oSubtitle) {
					if (oBindingInfos.subtitle) {
						oSubtitle.addStyleClass("sapFCardHeaderItemBinded");
					}
					oRm.renderControl(oSubtitle);
				}

				if (oUnitOfMeasurement) {
					oUnitOfMeasurement.addStyleClass("sapFCardHeaderUnitOfMeasurement");
					if (oBindingInfos.unitOfMeasurement) {
						oUnitOfMeasurement.addStyleClass("sapFCardHeaderItemBinded");
					}
					oRm.renderControl(oUnitOfMeasurement);
				}
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
				oSideIndicators = oControl.getAggregation("sideIndicators"),
				oBindingInfos = oControl.mBindingInfos;

			if ((oMainIndicator && oMainIndicator.getValue()) || oSideIndicators.length !== 0){
				oRm.write("<div");
				oRm.addClass("sapFCardHeaderIndicators");
				oRm.writeClasses();
				oRm.write(">");

				if (oMainIndicator) {
					oRm.write("<div");
					oRm.addClass("sapFCardHeaderMainIndicator");
					oRm.writeClasses();
					oRm.write(">");
					if (oBindingInfos.scale || oBindingInfos.number || oBindingInfos.trend || oBindingInfos.state) {
						oMainIndicator.addStyleClass("sapFCardHeaderItemBinded");
					} else {
						oMainIndicator.removeStyleClass("sapFCardHeaderItemBinded");
					}
					oRm.renderControl(oMainIndicator);
					oRm.write("</div>");

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
					// Maybe wrap them when card is too small
					oSideIndicators.forEach(function(oIndicator) {
						oRm.renderControl(oIndicator);
					});
					oRm.write("</div>");
				}

				oRm.write("</div>");
			}
		};

		/**
		 * Render details if any.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.f.cards.NumericHeader} oControl An object representation of the control that should be rendered
		 */
		NumericHeaderRenderer.renderDetails = function(oRm, oControl) {
			var oDetails = oControl.getAggregation("_details"),
				oBindingInfos = oControl.mBindingInfos;
			//show placeholder when there is binded value also
			if ((oDetails && oDetails.getText()) || oBindingInfos.details) {
					 oDetails.addStyleClass("sapFCardHeaderItemBinded");
					 oDetails.addStyleClass("sapFCardHeaderDetails");
					 oRm.renderControl(oDetails);
			}
		};

		return NumericHeaderRenderer;
	}, /* bExport= */ true);
