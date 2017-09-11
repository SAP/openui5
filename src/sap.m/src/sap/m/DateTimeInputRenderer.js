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
	var DateTimeInputRenderer = {};

	DateTimeInputRenderer.render = function(oRm, oControl) {

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMDTI");

		var sWidth = oControl.getWidth();
		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}

		oRm.writeStyles();
		oRm.writeClasses();
		oRm.write(">");

		var oPicker = oControl.getAggregation("_picker");
		if (oPicker) {
			oRm.renderControl(oPicker);
		}

		oRm.write("</div>");

	};

	return DateTimeInputRenderer;

}, /* bExport= */ true);
