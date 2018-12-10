/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	var HeaderRenderer = {};

	/**
	 * Render a kpi header.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.f.cards.Header} oControl An object representation of the control that should be rendered
	 */
	HeaderRenderer.render = function (oRm, oControl) {
		oRm.write("<header");
		oRm.addClass("sapFCardHeader");
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

		var sStatus = oControl.getStatus();
		if (sStatus) {
			oRm.write("<span");
			oRm.addClass("sapFCardStatus");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sStatus);
			oRm.write("</span>");
		}

		oRm.write("</header>");
	};

	return HeaderRenderer;
});