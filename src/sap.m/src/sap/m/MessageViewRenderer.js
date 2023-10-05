/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Core", "sap/ui/core/Lib"], function(Core, Lib) {
	"use strict";

	var MessageViewRenderer = {
		apiVersion: 2
	};

	var CSS_CLASS = "sapMMsgView";

	MessageViewRenderer.render = function (oRm, oControl) {
		var oResourceBundle = Lib.getResourceBundleFor("sap.m");

		oRm.openStart("section", oControl);
		oRm.class(CSS_CLASS);
		oRm.accessibilityState(oControl, {
			label: oResourceBundle.getText("MESSAGE_VIEW_ARIA_LABEL")
		});
		oRm.openEnd();
		oRm.renderControl(oControl._navContainer);
		oRm.close("section");
	};

	return MessageViewRenderer;

}, /* bExport= */ true);
