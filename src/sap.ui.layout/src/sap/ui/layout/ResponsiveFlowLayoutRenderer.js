/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
	"use strict";


	/**
	 * ResponsiveFlowLayout renderer.
	 * @namespace
	 */
	var ResponsiveFlowLayoutRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm The RenderManager that can be used for writing to the render
	 *            output buffer
	 * @param {sap.ui.core.Control}
	 *            oControl An object representation of the control that should be
	 *            rendered
	 */
	(function() {
		ResponsiveFlowLayoutRenderer.render = function(oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.class("sapUiRFL");

			var sRole = oControl._getAccessibleRole();
			var mAriaProps;
			if (sRole) {
				mAriaProps = {role: sRole};
			}

			oRm.accessibilityState(oControl, mAriaProps);

			oRm.openEnd(); // div element

			// rendering of content happens in oControl.fnRenderContent

			oRm.close("div");
		};
	}());


	return ResponsiveFlowLayoutRenderer;

}, /* bExport= */ true);
