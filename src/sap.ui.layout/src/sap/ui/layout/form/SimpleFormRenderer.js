/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";


	/**
	 * SimpleForm renderer.
	 * @namespace
	 */
	var SimpleFormRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.layout.form.SimpleForm} oControl an object representation of the control that should be rendered
	 */
	SimpleFormRenderer.render = function(oRm, oControl){

		oControl._bChangedByMe = true;
		// write the HTML into the render manager
		oRm.openStart("div", oControl)
			.class("sapUiSimpleForm")
			.style("width", oControl.getWidth())
			.openEnd(); // div element
		var oForm = oControl.getAggregation("form");
		oRm.renderControl(oForm);
		oRm.close("div");
		oControl._bChangedByMe = false;

	};


	return SimpleFormRenderer;

}, /* bExport= */ true);
