/*!
 * ${copyright}
 */


sap.ui.define("sap/m/semantic/SemanticPageRenderer", [], function() {
	"use strict";

	var SemanticPageRenderer = {};

	SemanticPageRenderer.render = function(oRenderManager, omPage) {

		oRenderManager.write("<div");
		oRenderManager.writeControlData(omPage);
		oRenderManager.addClass("sapMSemanticPage");
		if (!omPage.getShowFooter()) {
			oRenderManager.addClass("sapMSemanticPageHideFooter");
		}
		oRenderManager.writeClasses();
		oRenderManager.write(">");
		oRenderManager.renderControl(omPage._getPage());
		oRenderManager.write("</div>");
	};

	return SemanticPageRenderer;
}, /* bExport= */ true);
