/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global'
], function(jQuery) {
	"use strict";

	/**
	 * ConditionPanel renderer.
	 * @namespace
	 */
	var P13nConditionPanelRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be rendered
	 */
	P13nConditionPanelRenderer.render = function(oRm, oControl) {
		// start ConditionPanel
		oRm.write("<section");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMConditionPanel");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");

		// render content
		oRm.write("<div");
		oRm.addClass("sapMConditionPanelContent");
		oRm.addClass("sapMConditionPanelBG");

		oRm.writeClasses();
		oRm.write(">");
		var aChildren = oControl.getAggregation("content");
		var iLength = aChildren.length;
		for (var i = 0; i < iLength; i++) {
			oRm.renderControl(aChildren[i]);
		}
		oRm.write("</div>");

		oRm.write("</section>");
	};

	return P13nConditionPanelRenderer;

}, /* bExport= */true);
