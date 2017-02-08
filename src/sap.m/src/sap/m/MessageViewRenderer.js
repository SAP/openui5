/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	var MessageViewRenderer = {};

	var CSS_CLASS = "sapMMsgView";

	MessageViewRenderer.render = function (oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeStyles();
		oRm.addClass(CSS_CLASS);
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._navContainer);
		oRm.write("</div>");
	};

	return MessageViewRenderer;

}, /* bExport= */ true);
