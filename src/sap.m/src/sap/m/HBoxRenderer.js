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
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.HBox} oControl an object representation of the control that should be rendered
	 */
	HBoxRenderer.render = function(oRm, oControl){
		FlexBoxRenderer.render.apply(this, [oRm, oControl]);
	};

	return HBoxRenderer;

}, /* bExport= */ true);
