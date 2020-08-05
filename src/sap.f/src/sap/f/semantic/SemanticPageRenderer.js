/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	* <code>sap.f.semantic.SemanticPage</code> renderer.
	*/
	var SemanticPageRenderer = {
		apiVersion: 2
	};

	/**
	* Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	*
	* @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the Render-Output-Buffer
	* @param {sap.ui.core.Control} oSemanticPage An object representation of the control that should be rendered
	*/
	SemanticPageRenderer.render = function(oRenderManager, oSemanticPage) {
		oRenderManager.openStart("div", oSemanticPage);
		oRenderManager.class("sapFSemanticPage");
		oRenderManager.openEnd();
		oRenderManager.renderControl(oSemanticPage._getPage());
		oRenderManager.close("div");
	};

	return SemanticPageRenderer;
}, /* bExport= */ true);