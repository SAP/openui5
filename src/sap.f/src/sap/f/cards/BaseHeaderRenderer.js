/*!
 * ${copyright}
 */

// Provides renderer helper for sap.f.cards.BaseHeader
sap.ui.define([], function () {
	"use strict";

	const BaseHeaderRenderer = {
		apiVersion: 2
	};

	BaseHeaderRenderer.render = function (oRm, oHeader) {
		const oToolbar = oHeader.getToolbar();
		const oError = oHeader.getAggregation("_error");
		const bHasNumericPart = this.hasNumericPart(oHeader);

		oRm.openStart("div", oHeader)
			.class("sapFCardHeader");

		this.renderHeaderAttributes(oRm, oHeader);

		if (oHeader.isLoading()) {
			oRm.class("sapFCardHeaderLoading");
		}

		if (oHeader.getIconSrc() && oHeader.getIconVisible()) {
			oRm.class("sapFCardHeaderHasIcon");
		}

		if (oToolbar?.getVisible()) {
			oRm.class("sapFCardHeaderHasToolbar");
		}

		if (!bHasNumericPart) {
			oRm.class("sapFCardHeaderMainPartOnly");
		}

		oRm.openEnd();

		this.renderMainPart(oRm, oHeader);

		if (!oError) {
			this._renderInfoSections(oRm, oHeader);
		}

		if (bHasNumericPart && !oError) {
			this.renderNumericPart(oRm, oHeader);
		}

		if (oToolbar && !oError) {
			this._renderToolbar(oRm, oToolbar);
		}

		oRm.close("div");
	};

	BaseHeaderRenderer.renderHeaderAttributes = function (oRm, oHeader) { };

	BaseHeaderRenderer.renderMainPart = function (oRm, oHeader) {
		const bUseTileLayout = oHeader.getProperty("useTileLayout");
		const bRenderAsLink = oHeader.isLink();
		const oError = oHeader.getAggregation("_error");

		if (bRenderAsLink) {
			oRm.openStart("a", oHeader.getId() + "-focusable");
			this._renderLinkAttributes(oRm, oHeader);
		} else {
			oRm.openStart("div", oHeader.getId() + "-focusable");
		}

		oRm.class("sapFCardHeaderMainPart")
			.class("sapFCardHeaderFocusable");

		if (oHeader.isFocusable()) {
			oRm.attr("tabindex", "0");
		} else if (bRenderAsLink) {
			oRm.attr("tabindex", "-1");
		}

		if (oHeader.isInteractive()) {
			oRm.class("sapFCardSectionClickable");
		}

		if (!this.hasNumericPart(oHeader)) {
			oRm.class("sapFCardHeaderLastPart");
		}

		oRm.accessibilityState({
			labelledby: { value: oHeader._getAriaLabelledBy(), append: true },
			role: oHeader.getFocusableElementAriaRole(),
			roledescription: oHeader.getAriaRoleDescription()
		});

		oRm.openEnd();

		if (oError) {
			oRm.renderControl(oError);
		} else {
			if (bUseTileLayout) {
				this.renderMainContentInTileLayout(oRm, oHeader);
			} else {
				this.renderMainContent(oRm, oHeader);
			}

			this._renderBanner(oRm, oHeader);
		}

		if (bRenderAsLink) {
			oRm.close("a");
		} else {
			oRm.close("div");
		}
	};

	BaseHeaderRenderer.hasNumericPart = function (oHeader) {
		return false;
	};

	BaseHeaderRenderer.renderNumericPart = function (oRm, oHeader) { };

	BaseHeaderRenderer.renderMainContent = function (oRm, oHeader) {
		this.renderAvatar(oRm, oHeader);

		oRm.openStart("div")
			.class("sapFCardHeaderText")
			.openEnd();

		this.renderMainPartFirstLine(oRm, oHeader);
		this.renderMainPartSecondLine(oRm, oHeader);

		oRm.close("div");
	};

	BaseHeaderRenderer.renderMainContentInTileLayout = function (oRm, oHeader) {
		oRm.openStart("div")
			.class("sapFCardHeaderText")
			.openEnd();

		this.renderMainPartFirstLine(oRm, oHeader);
		this.renderMainPartSecondLine(oRm, oHeader);

		oRm.close("div");

		this.renderAvatar(oRm, oHeader);
	};

	BaseHeaderRenderer.renderMainPartFirstLine = function (oRm, oHeader) {
		const oTitle = oHeader.getAggregation("_title");
		const oBindingInfos = oHeader.mBindingInfos;
		const sStatus = oHeader.getStatusText();
		const sId = oHeader.getId();

		if (oTitle || oBindingInfos.title) {
			oRm.openStart("div")
				.class("sapFCardHeaderTextFirstLine")
				.openEnd();

			if (oBindingInfos.title) {
				oTitle.addStyleClass("sapFCardHeaderItemBinded");
			}

			oRm.renderControl(oTitle);

			if (sStatus && oHeader.getStatusVisible()) {
				oRm.openStart("span", sId + "-status")
					.class("sapFCardStatus");

				if (oBindingInfos.statusText) {
					oRm.class("sapFCardHeaderItemBinded");
				}

				oRm.openEnd()
					.text(sStatus)
					.close("span");
			}

			oRm.close("div"); // sapFCardHeaderTextFirstLine
		}
	};

	BaseHeaderRenderer.renderMainPartSecondLine = function (oRm, oHeader) {
		const oBindingInfos = oHeader.mBindingInfos;
		const bHasSubtitle = oHeader.getSubtitle() || oBindingInfos.subtitle;
		const oDataTimestamp = oHeader.getAggregation("_dataTimestamp");
		const bHasDataTimestamp = oHeader.getDataTimestamp() || oBindingInfos.dataTimestamp;
		const oSubtitle = oHeader.getAggregation("_subtitle");

		if (bHasSubtitle || bHasDataTimestamp) {
			oRm.openStart("div")
				.class("sapFCardHeaderTextSecondLine");

			if (bHasDataTimestamp) {
				oRm.class("sapFCardHeaderLineIncludesDataTimestamp");
			}

			oRm.openEnd();

			if (bHasSubtitle) {

				if (oBindingInfos.subtitle) {
					oSubtitle.addStyleClass("sapFCardHeaderItemBinded");
				}

				oRm.renderControl(oSubtitle);
			}

			if (bHasDataTimestamp) {
				oRm.renderControl(oDataTimestamp);
			}

			oRm.close("div"); //closes sapFCardHeaderTextSecondLine
		}
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

	BaseHeaderRenderer._renderBanner = function(oRm, oHeader) {
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

	/**
	 * Renders attributes for the case when header acts as <code>a</code> tag.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.Header} oHeader An object representation of the control that should be rendered
	 */
	BaseHeaderRenderer._renderLinkAttributes = function(oRm, oHeader) {
		oRm.attr("href", oHeader.getHref())
			.attr("rel", "noopener noreferrer");

		const sTarget = oHeader.getTarget();
		if (sTarget) {
			oRm.attr("target", sTarget);
		}

		// <a> elements are draggable per default, so set it to false
		oRm.attr("draggable", "false");
	};

	BaseHeaderRenderer._renderToolbar = function (oRm, oToolbar) {
		oRm.openStart("div")
			.class("sapFCardHeaderToolbarCont")
			.openEnd();

		oRm.renderControl(oToolbar);

		oRm.close("div");
	};

	BaseHeaderRenderer._renderInfoSections = function (oRm, oHeader) {
		const aInfoSections = oHeader.getInfoSection();
		if (!aInfoSections.length) {
			return;
		}

		oRm.openStart("div")
			.class("sapFCardHeaderInfoSection")
			.openEnd();

		aInfoSections.forEach((oContent) => {
			oRm.renderControl(oContent);
		});

		oRm.close("div");
	};

	return BaseHeaderRenderer;
}, /* bExport= */ true);
