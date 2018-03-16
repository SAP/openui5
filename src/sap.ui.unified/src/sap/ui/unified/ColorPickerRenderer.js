/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.ColorPicker
sap.ui.define([],
	function() {
	"use strict";


	/**
	 * ColorPicker renderer.
	 * @namespace
	 */
	var ColorPickerRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ColorPickerRenderer.render = function(oRm, oControl){
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.getAggregation("_grid"));
		oRm.write("</div>");
	};

	return ColorPickerRenderer;

}, /* bExport= */ true);
