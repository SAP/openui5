/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	var HeaderRenderer = {
		apiVersion: 2
	};

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
			oAvatar = oHeader.getAggregation("_avatar"),
			oDataTimestamp = oHeader.getAggregation("_dataTimestamp"),
			bHasDataTimestamp = oHeader.getDataTimestamp() || oBindingInfos.dataTimestamp,
			bLoading = oHeader.isLoading(),
			oError = oHeader.getAggregation("_error"),
			oToolbar = oHeader.getToolbar(),
			bIconVisible = oHeader.getIconVisible ? oHeader.getIconVisible() : true,
			sTabIndex;

		oRm.openStart("div", oHeader)
			.class("sapFCardHeader");

		if (bLoading) {
			oRm.class("sapFCardHeaderLoading");
		}

		if (oHeader._isInteractive()) {
			oRm.class("sapFCardClickable");
		}

		if (oError) {
			oRm.class("sapFCardHeaderError");
		}

		//Accessibility state
		oRm.accessibilityState(oHeader, {
			role: oHeader.getAriaRole(),
			roledescription: { value: oHeader.getAriaRoleDescription(), append: true }
		});
		oRm.openEnd();

		oRm.openStart("div")
			.attr("id", sId + "-focusable")
			.class("sapFCardHeaderWrapper");

		if (oHeader.getProperty("focusable")) {
			sTabIndex = oHeader._isInsideGridContainer() ? "-1" : "0";
			oRm.attr("tabindex", sTabIndex);
		}

		oRm.accessibilityState({
			labelledby: { value: oHeader._getAriaLabelledBy(), append: true },
			role: oHeader.getFocusableElementAriaRole()
		});

		oRm.openEnd();

		if (oError) {
			oRm.renderControl(oError);

			oRm.close("div");
			oRm.close("div");
			return;
		}

		if (bIconVisible && (oHeader.getIconSrc() || oHeader.getIconInitials() || oBindingInfos.iconSrc)) {
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

			if (sStatus) {
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

		oRm.close("div");

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
}, /* bExport= */ true);
