/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	var MessageViewRenderer = {
		apiVersion: 2
	};

	var CSS_CLASS = "sapMMsgView";

	MessageViewRenderer.render = function (oRm, oControl) {
		oRm.openStart("div", oControl);
		oRm.class(CSS_CLASS);
		oRm.openEnd();
		oRm.renderControl(oControl._navContainer);
		oRm.close("div");
	};

	return MessageViewRenderer;

}, /* bExport= */ true);
