/*!
 * ${copyright}
 */

// Provides default renderer for the sap.ui.ux3.ThingInspector
sap.ui.define(['sap/ui/core/Renderer', './OverlayRenderer'],
	function(Renderer, OverlayRenderer) {
	"use strict";


	/**
	 * ThingInspector renderer.
	 * @namespace
	 */
	var ThingInspectorRenderer = Renderer.extend(OverlayRenderer);

	/**
	 * Renders the ThingInspector content
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	ThingInspectorRenderer.renderContent = function(rm, oControl) {
		rm.write("<div role='Main' class='sapUiUx3TIContent' id='" + oControl.getId() + "-content'>");
		rm.renderControl(oControl._oThingViewer);
		rm.write("</div>");
	};

	/**
	 * Add root class to ThingInspector
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	ThingInspectorRenderer.addRootClasses = function(rm, oControl) {
		rm.addClass("sapUiUx3TI");
	};

	/**
	 * Add class to ThingInspector
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	ThingInspectorRenderer.addOverlayClasses = function(rm, oControl) {
		rm.addClass("sapUiUx3TIOverlay");
	};

	return ThingInspectorRenderer;

}, /* bExport= */ true);
