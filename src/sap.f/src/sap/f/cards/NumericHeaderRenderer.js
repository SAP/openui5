/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.NumericHeader
sap.ui.define([], function () {
	"use strict";

	var NumericHeaderRenderer = {
		apiVersion: 2
	};

	/**
	 * Render a numeric header.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNumericHeader An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer.render = function (oRm, oNumericHeader) {
		var bLoading = oNumericHeader.isLoading(),
			oError = oNumericHeader.getAggregation("_error"),
			sTabIndex;

		oRm.openStart("div", oNumericHeader)
			.class("sapFCardHeader")
			.class("sapFCardNumericHeader");

		if (bLoading) {
			oRm.class("sapFCardHeaderLoading");
		}

		if (oNumericHeader.hasListeners("press")) {
			oRm.class("sapFCardClickable");
		}

		if (oError) {
			oRm.class("sapFCardHeaderError");
		}

		//Accessibility state
		oRm.accessibilityState(oNumericHeader, {
			role: oNumericHeader.getAriaRole(),
			roledescription: { value: oNumericHeader.getAriaRoleDescription(), append: true }
		});
		oRm.openEnd();

		oRm.openStart("div")
			.attr("id", oNumericHeader.getId() + "-focusable")
			.class("sapFCardHeaderContent");

		if (oNumericHeader.getProperty("focusable")) {
			sTabIndex = oNumericHeader._isInsideGridContainer() ? "-1" : "0";
			oRm.attr("tabindex", sTabIndex);
		}

		oRm.accessibilityState({
			labelledby: { value: oNumericHeader._getAriaLabelledBy(), append: true },
			role: oNumericHeader.getFocusableElementAriaRole()
		});

		oRm.openEnd();

		if (oError) {
			oRm.renderControl(oError);
		} else {
			NumericHeaderRenderer.renderHeaderText(oRm, oNumericHeader);
			NumericHeaderRenderer.renderIndicators(oRm, oNumericHeader);
			NumericHeaderRenderer.renderDetails(oRm, oNumericHeader);
		}

		oRm.close("div");

		if (!oError) {
			NumericHeaderRenderer.renderToolbar(oRm, oNumericHeader);
		}

		oRm.close("div");
	};

	/**
	 * Render toolbar.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNumericHeader An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer.renderToolbar = function (oRm, oNumericHeader) {
		var oToolbar = oNumericHeader.getToolbar();

		if (oToolbar) {
			oRm.openStart("div")
				.class("sapFCardHeaderToolbarCont")
				.openEnd();

			oRm.renderControl(oToolbar);

			oRm.close("div");
		}
	};

	/**
	 * Render title and subtitle texts.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNumericHeader An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer.renderHeaderText = function(oRm, oNumericHeader) {
		var oTitle = oNumericHeader.getAggregation("_title"),
			sStatus = oNumericHeader.getStatusText(),
			oBindingInfos = oNumericHeader.mBindingInfos;

		// TODO reuse title and subtitle rendering from the default header if possible
		oRm.openStart("div")
			.class("sapFCardHeaderText")
			.openEnd();

		oRm.openStart("div")
			.class("sapFCardHeaderTextFirstLine")
			.openEnd();

		if (oTitle) {
			if (oBindingInfos.title) {
				oTitle.addStyleClass("sapFCardHeaderItemBinded");
			}
			oTitle.addStyleClass("sapFCardTitle");
			oRm.renderControl(oTitle);
		}

		if (sStatus) {
			oRm.openStart("span", oNumericHeader.getId() + "-status")
				.class("sapFCardStatus");

			if (oBindingInfos.statusText) {
				oRm.class("sapFCardHeaderItemBinded");
			}

			oRm.openEnd()
				.text(sStatus)
				.close("span");
		}

		oRm.close("div");

		NumericHeaderRenderer.renderSubtitle(oRm, oNumericHeader);

		oRm.close("div");
	};

	/**
	 * Render subtitle and unit of measurement.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNumericHeader An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer.renderSubtitle = function(oRm, oNumericHeader) {
		var oBindingInfos = oNumericHeader.mBindingInfos,
			oSubtitle = oNumericHeader.getAggregation("_subtitle"),
			oUnitOfMeasurement = oNumericHeader.getAggregation("_unitOfMeasurement"),
			bHasSubtitle = oSubtitle && oSubtitle.getText() || oBindingInfos && oBindingInfos.subtitle,
			bHasUnitOfMeasurement = oUnitOfMeasurement && oUnitOfMeasurement.getText() || oBindingInfos && oBindingInfos.unitOfMeasurement;

		if (bHasSubtitle || bHasUnitOfMeasurement) {
			oRm.openStart("div")
				.class("sapFCardSubtitle");

			if (bHasSubtitle && oUnitOfMeasurement) {
				oRm.class("sapFCardSubtitleAndUnit");
			}

			oRm.openEnd();

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
			oRm.close("div");
		}
	};

	/**
	 * Render main indicator and side indicators if any.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNH An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer.renderIndicators = function(oRm, oNH) {
		if (!oNH.getNumber() && !oNH.isBound("number") && oNH.getSideIndicators().length === 0) {
			return;
		}

		var oNumericIndicators = oNH._getNumericIndicators(),
			oMainIndicator = oNumericIndicators._getMainIndicator();

		if (oNH.isBound("scale") || oNH.isBound("number") || oNH.isBound("trend") || oNH.isBound("state")) {
			oMainIndicator.addStyleClass("sapFCardHeaderItemBinded");
		} else {
			oMainIndicator.removeStyleClass("sapFCardHeaderItemBinded");
		}

		oRm.renderControl(oNumericIndicators);
	};

	/**
	 * Render details if any.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNumericHeader An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer.renderDetails = function(oRm, oNumericHeader) {
		var oBindingInfos = oNumericHeader.mBindingInfos,
			oDetails = oNumericHeader.getAggregation("_details"),
			bHasDetails = oNumericHeader.getDetails() || oBindingInfos.details,
			oDataTimestamp = oNumericHeader.getAggregation("_dataTimestamp"),
			bHasDataTimestamp = oNumericHeader.getDataTimestamp() || oBindingInfos.dataTimestamp;

		if (!bHasDetails && !bHasDataTimestamp) {
			return;
		}

		oRm.openStart("div")
			.class("sapFCardHeaderDetailsWrapper");

		if (bHasDataTimestamp) {
			oRm.class("sapFCardHeaderLineIncludesDataTimestamp");
		}

		oRm.openEnd();

		//show placeholder when there is binded value also
		if (bHasDetails) {
			if (oBindingInfos.details) {
				oDetails.addStyleClass("sapFCardHeaderItemBinded");
			}

			oDetails.addStyleClass("sapFCardHeaderDetails");
			oRm.renderControl(oDetails);
		}

		if (bHasDataTimestamp) {
			oRm.renderControl(oDataTimestamp);
		}

		oRm.close("div");
	};

	return NumericHeaderRenderer;
}, /* bExport= */ true);
