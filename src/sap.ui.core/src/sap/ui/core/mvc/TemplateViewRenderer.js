/*!
 * ${copyright}
 */

// Provides default renderer for JSView
sap.ui.define(['./ViewRenderer'],
	function(ViewRenderer) {
	"use strict";


	/**
	 * TemplateView renderer.
	 * @namespace
	 * @alias sap.ui.core.mvc.TemplateViewRenderer
	 */
	var TemplateViewRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the Template, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for rendering the view content
	 * @param {sap.ui.core.mvc.TemplateView} oControl an object representation of the control that should be rendered
	 */
	TemplateViewRenderer.render = function(rm, oControl){
		// write the HTML into the render manager
		rm.openStart("div", oControl);
		rm.class("sapUiView");
		rm.class("sapUiTmplView");
		ViewRenderer.addDisplayClass(rm, oControl);
		rm.style("width", oControl.getWidth());
		rm.style("height", oControl.getHeight());
		rm.openEnd();

		rm.renderControl(oControl._oTemplate);

		rm.close("div");
	};

	return TemplateViewRenderer;

}, /* bExport= */ true);
