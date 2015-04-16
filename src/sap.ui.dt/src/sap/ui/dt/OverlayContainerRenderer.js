/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.layout.OverlayContainer
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * layout/OverlayContainer renderer.
	 * @namespace
	 */
	var OverlayContainerRenderer = {
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	OverlayContainerRenderer.render = function(oRm, oOverlayContainer) {
		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oOverlayContainer);
	
		oRm.addStyle("width", 0);
		oRm.addStyle("height", 0);
		oRm.addStyle("overflow", "hidden");
		oRm.addStyle("float", "left");
		oRm.writeStyles();
		oRm.write(">"); // div element
	
		// render content
		var aContent = oOverlayContainer.getContent();
	
		jQuery.each(aContent, function(index, oOverlay) {
			oRm.renderControl(oOverlay);
		});
	
		oRm.write("</div>");
	};
	

	return OverlayContainerRenderer;

}, /* bExport= */ true);
