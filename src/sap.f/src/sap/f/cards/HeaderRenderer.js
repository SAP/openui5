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
		var sStatus = oHeader.getStatusText(),
			oTitle = oHeader.getAggregation("_title"),
			oSubtitle = oHeader.getAggregation("_subtitle"),
			oAvatar = oHeader.getAggregation("_avatar"),
			bLoading = oHeader.isLoading(),
			oBindingInfos = oHeader.mBindingInfos,
			oToolbar = oHeader.getToolbar();

		oRm.openStart("div", oHeader)
			.attr("tabindex", "0")
			.class("sapFCardHeader");

		if (bLoading) {
			oRm.class("sapFCardHeaderLoading");
		}

		if (oHeader.hasListeners("press")) {
			oRm.class("sapFCardClickable");
		}

		//Accessibility state
		oRm.accessibilityState(oHeader, {
			role: oHeader._sAriaRole,
			labelledby: { value: oHeader._getHeaderAccessibility(), append: true },
			roledescription: { value: oHeader._sAriaRoleDescritoion, append: true },
			level: { value: oHeader._sAriaHeadingLevel }
		});
		oRm.openEnd();

		if (oHeader.getIconSrc() || oHeader.getIconInitials() || oBindingInfos.iconSrc) {
			oRm.openStart("div")
				.class("sapFCardHeaderImage")
				.openEnd();

			if (oBindingInfos.iconSrc) {
				oAvatar.addStyleClass("sapFCardHeaderItemBinded");
			}
			oRm.renderControl(oAvatar);
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

			if (sStatus !== undefined) {
				oRm.openStart("span", oHeader.getId() + "-status")
					.class("sapFCardStatus");

				if (oBindingInfos.statusText) {
					oRm.class("sapFCardHeaderItemBinded");
				}

				oRm.openEnd()
					.text(sStatus)
					.close("span");
			}

			oRm.close("div");

			if (oHeader.getSubtitle() || oBindingInfos.subtitle) {
				if (oBindingInfos.subtitle) {
					oSubtitle.addStyleClass("sapFCardHeaderItemBinded");
				}
				oRm.renderControl(oSubtitle);
			}
		}

		oRm.close("div");

		if (oToolbar) {
			oRm.openStart("div")
				.class("sapFCardHeaderToolbar")
				.openEnd();

			oRm.renderControl(oToolbar);

			oRm.close("div");
		}

		oRm.close("div");
	};

	return HeaderRenderer;
}, /* bExport= */ true);
