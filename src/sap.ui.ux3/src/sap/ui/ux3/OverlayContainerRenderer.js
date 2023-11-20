/*!
 * ${copyright}
 */

// Provides default renderer for the sap.ui.ux3.OverlayContainer
sap.ui.define(['sap/ui/core/Renderer', './OverlayRenderer'],
	function(Renderer, OverlayRenderer) {
	"use strict";

/**
	 * OverlayContainer renderer.
	 * @namespace
	 */
	var OverlayContainerRenderer = Renderer.extend(OverlayRenderer);

	/**
	 * Renders the Overlay content
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	OverlayContainerRenderer.renderContent = function(rm, oControl) {
		rm.write("<div role='Main' class='sapUiUx3OCContent' id='" + oControl.getId() + "-content'>");
		var content = oControl.getContent();
		for (var i = 0; i < content.length; i++) {
			var control = content[i];
			rm.renderControl(control);
		}
		rm.write("</div>");
	};

	/**
	 * Add root class to Overlay
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	OverlayContainerRenderer.addRootClasses = function(rm, oControl) {
		rm.addClass("sapUiUx3OC");
	};

	/**
	 * Add class to Overlay
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	OverlayContainerRenderer.addOverlayClasses = function(rm, oControl) {
		rm.addClass("sapUiUx3OCOverlay");
	};


	return OverlayContainerRenderer;

}, /* bExport= */ true);
