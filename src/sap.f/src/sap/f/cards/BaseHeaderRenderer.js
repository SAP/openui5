/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.cards.NumericHeader
sap.ui.define([], function () {
	"use strict";

	var BaseHeaderRenderer = {
		apiVersion: 2
	};

	BaseHeaderRenderer.renderAvatar = function (oRm, oHeader) {
		var oAvatar = oHeader.getAggregation("_avatar"),
			oBindingInfos = oHeader.mBindingInfos,
			bIconVisible = oHeader.shouldShowIcon();

		if (bIconVisible && (!oHeader.isPropertyInitial("iconSrc") || !oHeader.isPropertyInitial("iconInitials"))) {
			oRm.openStart("div")
				.class("sapFCardHeaderImage")
				.openEnd();

			if (oBindingInfos.iconSrc && oBindingInfos.iconSrc.binding && !oBindingInfos.iconSrc.binding.getValue()) {
				oAvatar.addStyleClass("sapFCardHeaderItemBinded");
			}
			oRm.renderControl(oAvatar);
			oRm.renderControl(oHeader._oAriaAvatarText);
			oRm.close("div");
		}
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
