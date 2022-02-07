/*!
 * ${copyright}
 */

// Provides default renderer for JSONView
sap.ui.define(['./ViewRenderer'],
	function(ViewRenderer) {
	"use strict";


	/**
	 * JSONView renderer.
	 * @namespace
	 * @alias sap.ui.core.mvc.JSONViewRenderer
	 */
	var JSONViewRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.mvc.JSONView} oControl an object representation of the control that should be rendered
	 */
	JSONViewRenderer.render = function(rm, oControl){
		rm.openStart("div", oControl);
		rm.class("sapUiView");
		rm.class("sapUiJSONView");
		ViewRenderer.addDisplayClass(rm, oControl);
		rm.style("width", oControl.getWidth());
		rm.style("height", oControl.getHeight());
		rm.openEnd();

		oControl.getContent().forEach(rm.renderControl, rm);

		rm.close("div");
	};


	return JSONViewRenderer;

}, /* bExport= */ true);
