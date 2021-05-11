/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
	"use strict";

	/**
	 * DateTimeInput renderer.
	 * @namespace
	 */
	var DateTimeInputRenderer = {
		apiVersion: 2
	};

	DateTimeInputRenderer.render = function(oRm, oControl) {

		oRm.openStart("div", oControl);
		oRm.class("sapMDTI");

		var sWidth = oControl.getWidth();
		if (sWidth) {
			oRm.style("width", sWidth);
		}

		oRm.openEnd();

		var oPicker = oControl.getAggregation("_picker");
		if (oPicker) {
			oRm.renderControl(oPicker);
		}

		oRm.close("div");

	};

	return DateTimeInputRenderer;

}, /* bExport= */ true);
