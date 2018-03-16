/*!
 * ${copyright}
 */

sap.ui.define(['./FlexBoxRenderer'],
	function(FlexBoxRenderer) {
	"use strict";


	/**
	 * VBox renderer.
	 * @namespace
	 */
	var VBoxRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	VBoxRenderer.render = function(oRm, oControl){
		FlexBoxRenderer.render.apply(this, [oRm, oControl]);
	};


	return VBoxRenderer;

}, /* bExport= */ true);
