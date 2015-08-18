/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.dt.Overlay
sap.ui.define(['sap/ui/dt/RenderingUtil'],
	function(RenderingUtil) {
	"use strict";


	/**
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 */
	var OverlayRenderer = {
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.dt.Overlay} oOverlay An object representation of the control that should be rendered.
	 * @protected 
	 */
	OverlayRenderer.render = function(oRm, oOverlay) {
		RenderingUtil.renderOverlay(oRm, oOverlay, "sapUiDtElementOverlay");
	};

	return OverlayRenderer;

}, /* bExport= */ true);
