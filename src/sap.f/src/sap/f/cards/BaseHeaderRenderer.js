/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.NumericHeader
sap.ui.define([], function () {
	"use strict";

	var BaseHeaderRenderer = {
		apiVersion: 2
	};

	BaseHeaderRenderer.renderBanner = function(oRm, oHeader) {
		const aBannerLines = oHeader.getBannerLines() || [];
		const aVisibleLines = aBannerLines.filter((oText) => {
			return oText.getVisible();
		});

		if (!aVisibleLines.length) {
			return;
		}

		oRm.openStart("div")
			.class("sapFCardHeaderBanner")
			.openEnd();

		oRm.openStart("div")
			.class("sapFCardHeaderBannerInner")
			.openEnd();

		aBannerLines.forEach((oBannerLine) => {
			oRm.openStart("div")
				.class("sapFCardHeaderBannerLine")
				.openEnd();

			oRm.renderControl(oBannerLine);

			oRm.close("div");
		});

		oRm.close("div");

		oRm.close("div");
	};

	return BaseHeaderRenderer;
}, /* bExport= */ true);
