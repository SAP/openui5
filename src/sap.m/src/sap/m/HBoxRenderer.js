/*!
 * ${copyright}
 */

sap.ui.define(['./FlexBoxRenderer'],
	function(FlexBoxRenderer) {
	"use strict";


	/**
	 * HBox renderer.
	 * @namespace
	 */
	var HBoxRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	HBoxRenderer.render = function(oRm, oControl){
		FlexBoxRenderer.render.apply(this, [oRm, oControl]);
	};


	return HBoxRenderer;

}, /* bExport= */ true);
