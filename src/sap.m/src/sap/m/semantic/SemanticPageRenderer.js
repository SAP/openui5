/*!
 * ${copyright}
 */


sap.ui.define([], function() {
	"use strict";

	var SemanticPageRenderer = {
		apiVersion: 2
	};

	SemanticPageRenderer.render = function(oRenderManager, omPage) {

		oRenderManager.openStart("div", omPage);
		oRenderManager.class("sapMSemanticPage");
		oRenderManager.openEnd();
		oRenderManager.renderControl(omPage._getPage());
		oRenderManager.close("div");
	};

	return SemanticPageRenderer;
}, /* bExport= */ true);
