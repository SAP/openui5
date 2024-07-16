/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/f/cards/BaseHeaderRenderer",
	"sap/ui/core/Renderer"
], function (BaseHeaderRenderer, Renderer) {
	"use strict";

	var HeaderRenderer = Renderer.extend(BaseHeaderRenderer);
	HeaderRenderer.apiVersion = 2;

	/**
	 * Render a header.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.Header} oHeader An object representation of the control that should be rendered
	 */
	HeaderRenderer.render = function (oRm, oHeader) {
		var sId = oHeader.getId(),
			oBindingInfos = oHeader.mBindingInfos,
			sStatus = oHeader.getStatusText(),
			oTitle = oHeader.getAggregation("_title"),
			oSubtitle = oHeader.getAggregation("_subtitle"),
			bHasSubtitle = oHeader.getSubtitle() || oBindingInfos.subtitle,
			oDataTimestamp = oHeader.getAggregation("_dataTimestamp"),
			bHasDataTimestamp = oHeader.getDataTimestamp() || oBindingInfos.dataTimestamp,
			bLoading = oHeader.isLoading(),
			oError = oHeader.getAggregation("_error"),
			oToolbar = oHeader.getToolbar(),
			bUseTileLayout = oHeader.getProperty("useTileLayout"),
			bRenderAsLink = oHeader.isLink();

		oRm.openStart("div", oHeader)
			.class("sapFCardHeader");

		if (bLoading) {
			oRm.class("sapFCardHeaderLoading");
		}

		if (oHeader.isInteractive()) {
			oRm.class("sapFCardSectionClickable");
		}

		if (oHeader.getIconSrc() && oHeader.getIconVisible()) {
			oRm.class("sapFCardHeaderHasIcon");
		}

		if (oToolbar?.getVisible()) {
			oRm.class("sapFCardHeaderHasToolbar");
		}

		oRm.openEnd();

		if (bRenderAsLink) {
			oRm.openStart("a");
			BaseHeaderRenderer.linkAttributes(oRm, oHeader);
		} else {
			oRm.openStart("div");
		}

		oRm.attr("id", sId + "-focusable")
			.class("sapFCardHeaderWrapper");

		if (oHeader.getProperty("focusable") && !oHeader._isInsideGridContainer()) {
			oRm.attr("tabindex", "0");
		}

		if (!oHeader._isInsideGridContainer()) {
			oRm.accessibilityState({
				labelledby: {value: oHeader._getAriaLabelledBy(), append: true},
				role: oHeader.getFocusableElementAriaRole(),
				roledescription: oHeader.getAriaRoleDescription()
			});
		}

		oRm.openEnd();

		if (oError) {
			oRm.renderControl(oError);

			oRm.close("div");
			oRm.close("div");
			return;
		}

		if (!bUseTileLayout) {
			BaseHeaderRenderer.renderAvatar(oRm, oHeader);
		}

		oRm.openStart("div")
			.class("sapFCardHeaderText")
			.openEnd();

		if (oHeader.getTitle() || oBindingInfos.title) {
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

			oRm.close("div");

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
		}

		oRm.close("div");

		if (bUseTileLayout) {
			BaseHeaderRenderer.renderAvatar(oRm, oHeader);
		}

		BaseHeaderRenderer.renderBanner(oRm, oHeader);

		if (bRenderAsLink) {
			oRm.close("a");
		} else {
			oRm.close("div");
		}

		if (oToolbar) {
			oRm.openStart("div")
				.class("sapFCardHeaderToolbarCont")
				.openEnd();
			oRm.renderControl(oToolbar);

			oRm.close("div");
		}

		oRm.close("div");
	};

	return HeaderRenderer;
});
