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
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.VBox} oControl an object representation of the control that should be rendered
	 */
	VBoxRenderer.render = function(oRm, oControl){
		FlexBoxRenderer.render.apply(this, [oRm, oControl]);
	};

	return VBoxRenderer;

}, /* bExport= */ true);
