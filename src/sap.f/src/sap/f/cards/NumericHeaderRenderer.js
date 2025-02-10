/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/f/cards/BaseHeaderRenderer",
	"sap/ui/core/Renderer"
], function (BaseHeaderRenderer, Renderer) {
	"use strict";

	const NumericHeaderRenderer = Renderer.extend(BaseHeaderRenderer);
	NumericHeaderRenderer.apiVersion = 2;

	/**
	 * @override
	 */
	NumericHeaderRenderer.renderHeaderAttributes = function (oRm, oHeader) {
		oRm.class("sapFCardNumericHeader");

		if (oHeader.getNumber() && oHeader.getNumberVisible()) {
			oRm.class("sapFCardHeaderHasNumber");
		}
	};

	/**
	 * @override
	 */
	NumericHeaderRenderer.hasNumericPart = function (oHeader) {
		const oBindingInfos = oHeader.mBindingInfos;
		const bHasMainIndicator = oHeader.getNumber() || oHeader.isBound("number");
		const bHasSideIndicators = oHeader.getSideIndicators().length > 0;
		const bHasDetails = oHeader.getDetails() || oBindingInfos.details;
		const bHasDataTimestamp = oHeader.getDataTimestamp() || oBindingInfos.dataTimestamp;

		return bHasMainIndicator || bHasSideIndicators || bHasDetails || bHasDataTimestamp;
	};

	/**
	 * @override
	 */
	NumericHeaderRenderer.renderNumericPart = function (oRm, oHeader) {
		if (oHeader.getProperty("useTileLayout")) {
			return;
		}

		const oMicroChart = oHeader.getMicroChart();

		oRm.openStart("div")
			.class("sapFCardNumericHeaderNumericPart")
			.class("sapFCardHeaderLastPart")
			.openEnd();

		oRm.openStart("div")
			.class("sapFCardHeaderNumericPartFirstLine")
			.openEnd();

		this._renderIndicators(oRm, oHeader);

		if (oMicroChart) {
			oRm.renderControl(oMicroChart);
		}

		oRm.close("div"); // sapFCardHeaderNumericPartFirstLine

		this._renderDetails(oRm, oHeader);

		oRm.close("div");
	};

	/**
	 * @override
	 */
	NumericHeaderRenderer.renderMainContentInTileLayout = function (oRm, oHeader) {
		oRm.openStart("div")
			.class("sapFCardHeaderText")
			.openEnd();

		BaseHeaderRenderer.renderMainPartFirstLine(oRm, oHeader);
		this._renderSubtitle(oRm, oHeader);

		oRm.close("div");

		this._renderAvatarAndIndicatorsLine(oRm, oHeader);
		this._renderDetails(oRm, oHeader);
	};

	/**
	 * @override
	 */
	NumericHeaderRenderer.renderMainPartSecondLine = function (oRm, oHeader) {
		this._renderSubtitle(oRm, oHeader);
	};

	/**
	 * Render subtitle and unit of measurement.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNumericHeader An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer._renderSubtitle = function(oRm, oNumericHeader) {
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

			if (oBindingInfos.subtitle || oBindingInfos.unitOfMeasurement) {
				oRm.class("sapFCardHeaderItemBinded");
			}

			oRm.openEnd();

			if (oSubtitle) {
				oRm.renderControl(oSubtitle);
			}

			if (oUnitOfMeasurement) {
				oRm.renderControl(oUnitOfMeasurement);
			}

			oRm.close("div");
		}
	};

	/**
	 * Render avatar, main indicator and side indicators if any.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNH An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer._renderAvatarAndIndicatorsLine = function(oRm, oNH) {
		oRm.openStart("div")
			.class("sapFCardAvatarAndIndicatorsLine")
			.openEnd();

		BaseHeaderRenderer.renderAvatar(oRm, oNH);
		this._renderIndicators(oRm, oNH);

		var oMicroChart = oNH.getMicroChart();
		if (oMicroChart) {
			oRm.renderControl(oMicroChart);
		}

		oRm.close("div");
	};

	/**
	 * Render main indicator and side indicators if any.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericHeader} oNH An object representation of the control that should be rendered
	 */
	NumericHeaderRenderer._renderIndicators = function(oRm, oNH) {
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
	NumericHeaderRenderer._renderDetails = function(oRm, oNumericHeader) {
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

			oRm.renderControl(oDetails);
		}

		if (bHasDataTimestamp) {
			oRm.renderControl(oDataTimestamp);
		}

		oRm.close("div");
	};

	return NumericHeaderRenderer;
}, /* bExport= */ true);
