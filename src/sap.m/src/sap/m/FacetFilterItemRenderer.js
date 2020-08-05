/*!
 * ${copyright}
 */

sap.ui.define(['./ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(ListItemBaseRenderer, Renderer) {
	"use strict";

	var FacetFilterItemRenderer = Renderer.extend(ListItemBaseRenderer);
	FacetFilterItemRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control}
	 *          oControl An object representation of the control that should be rendered
	 */
	FacetFilterItemRenderer.renderLIContent = function(oRm, oControl) {

		oRm.openStart("div", oControl);
		if (oControl.getParent() && oControl.getParent().getWordWrap()) {
			oRm.class("sapMFFLITitleWrap");
		} else {
			oRm.class("sapMFFLITitle");
		}
		oRm.openEnd();
		oRm.text(oControl.getText());
		oRm.close("div");

	};

	return FacetFilterItemRenderer;

}, /* bExport= */ true);
