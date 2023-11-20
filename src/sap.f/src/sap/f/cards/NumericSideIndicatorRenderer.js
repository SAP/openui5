/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.NumericSideIndicatorRenderer
sap.ui.define([], function () {
	"use strict";

	var NumericSideIndicatorRenderer = {
		apiVersion: 2
	};

	/**
	 * Render a numeric header side indicator.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.NumericSideIndicator} oNSI An object representation of the control that should be rendered
	 */
	NumericSideIndicatorRenderer.render = function (oRm, oNSI) {
		var oBindingInfos = oNSI.mBindingInfos;

		oRm.openStart("div", oNSI)
			.class("sapFCardHeaderSideIndicator")
			.class("sapFCardHeaderSideIndicatorState" + oNSI.getState());

		if (oBindingInfos.title || oBindingInfos.number || oBindingInfos.unit) {
			oRm.class("sapFCardHeaderItemBinded");
		}

		oRm.openEnd();

		var oTitle = oNSI.getAggregation("_title");
		if (oTitle) {
			oTitle.addStyleClass("sapFCardHeaderSITitle");
			oRm.renderControl(oTitle);
		}

		oRm.openStart("div")
			.class("sapFCardHeaderSINumber");

		if (oBindingInfos.title || oBindingInfos.number || oBindingInfos.unit || oBindingInfos.state) {
			oRm.class("sapFCardHeaderItemBinded");
		}

		oRm.openEnd();

		var oNumber = oNSI.getAggregation("_number");
		if (oNumber) {
			oRm.renderControl(oNumber);
		}

		var oUnit = oNSI.getAggregation("_unit");
		if (oUnit) {
			oRm.renderControl(oUnit);
		}

		oRm.close("div");

		oRm.close("div");
	};

	return NumericSideIndicatorRenderer;
}, /* bExport= */ true);
