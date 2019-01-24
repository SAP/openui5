/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	var HeaderRenderer = {},
		oRb = sap.ui.getCore().getLibraryResourceBundle("sap.f");

	/**
	 * Render a header.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.Header} oControl An object representation of the control that should be rendered
	 */
	HeaderRenderer.render = function (oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeAttribute("tabindex", "0");
		oRm.addClass("sapFCardHeader");
		//Accessibility state
		oRm.writeAccessibilityState(oControl, {
			role: "group",
			labelledBy: {value: oControl._getHeaderAccessibility(), append: true},
			roledescription: {value: oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), append: true}
		});
		oRm.writeClasses();
		oRm.write(">");

		if (oControl.getIconSrc() || oControl.getIconInitials()) {
			oRm.renderControl(oControl._getAvatar());
		}

		if (oControl.getTitle()) {
			oRm.write("<div");
			oRm.addClass("sapFCardHeaderText");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl._getTitle());
			if (oControl.getSubtitle()) {
				oRm.renderControl(oControl._getSubtitle());
			}
			oRm.write("</div>");
		}

		var sStatus = oControl.getStatusText();
		if (sStatus) {
			oRm.write("<span");
			oRm.addClass("sapFCardStatus");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sStatus);
			oRm.write("</span>");
		}
		oRm.write("</div>");
	};

	return HeaderRenderer;
}, /* bExport= */ true);