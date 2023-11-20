sap.ui.define([], function() {
	"use strict";

	var oRenderer = {apiVersion: 2};

	oRenderer.render = function(oControl, oRm) {
		oRm.openStart("div", oControl);
		oRm.openEnd();
		oRm.text(oControl.getText());
		oRm.close("div");
	};

	return oRenderer;
} /*, bExport = false */);
