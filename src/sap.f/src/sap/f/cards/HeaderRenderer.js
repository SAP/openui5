/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	var HeaderRenderer = {};

	/**
	 * Render a header.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.Header} oControl An object representation of the control that should be rendered
	 */
	HeaderRenderer.render = function (oRm, oControl) {

		var sStatus = oControl.getStatusText(),
			oTitle = oControl.getAggregation("_title"),
			oSubtitle = oControl.getAggregation("_subtitle"),
			oAvatar = oControl.getAggregation("_avatar"),
			bLoading = oControl.isLoading(),
			oBindingInfos = oControl.mBindingInfos,
			oToolbar = oControl.getToolbar();

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeAttribute("tabindex", "0");
		oRm.addClass("sapFCardHeader");

		if (bLoading) {
			oRm.addClass("sapFCardHeaderLoading");
		}

		if (oControl.hasListeners("press")) {
			oRm.addClass("sapFCardClickable");
		}

		//Accessibility state
		oRm.writeAccessibilityState(oControl, {
			role: oControl._sAriaRole,
			labelledby: {value: oControl._getHeaderAccessibility(), append: true},
			roledescription: {value: oControl._sAriaRoleDescritoion, append: true},
			level: {value: oControl._sAriaHeadingLevel}
		});
		oRm.writeClasses();
		oRm.write(">");

		if (oControl.getIconSrc() || oControl.getIconInitials() || oBindingInfos.iconSrc) {
			oRm.write("<div");
			oRm.addClass("sapFCardHeaderImage");
			oRm.writeClasses();
			oRm.write(">");
			if (oBindingInfos.iconSrc) {
				oAvatar.addStyleClass("sapFCardHeaderItemBinded");
			}
			oRm.renderControl(oAvatar);
			oRm.write("</div>");
		}

		if (oControl.getTitle() || oBindingInfos.title) {

			oRm.write("<div");
			oRm.addClass("sapFCardHeaderText");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapFCardHeaderTextFirstLine");
			oRm.writeClasses();
			oRm.write(">");

			if (oBindingInfos.title) {
				oTitle.addStyleClass("sapFCardHeaderItemBinded");
			}
			oRm.writeClasses();
			oRm.renderControl(oTitle);

			if (sStatus !== undefined) {
				oRm.write("<span");
				oRm.writeAttribute('id', oControl.getId() + '-status');
				oRm.addClass("sapFCardStatus");
				if (oBindingInfos.statusText) {
					oRm.addClass("sapFCardHeaderItemBinded");
				}
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(sStatus);
				oRm.write("</span>");
			}

			oRm.write("</div>");

			if (oControl.getSubtitle() || oBindingInfos.subtitle) {
				if (oBindingInfos.subtitle) {
					oSubtitle.addStyleClass("sapFCardHeaderItemBinded");
				}
				oRm.renderControl(oSubtitle);
			}

			oRm.write("</div>");
		}

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

	return HeaderRenderer;
}, /* bExport= */ true);
