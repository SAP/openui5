/*!
 * ${copyright}
 */

sap.ui.define(['./TreeItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(TreeItemBaseRenderer, Renderer) {
	"use strict";

	/**
	 * StandardTreeItemRenderer renderer.
	 * @namespace
	 */
	var StandardTreeItemRenderer = Renderer.extend(TreeItemBaseRenderer);

	StandardTreeItemRenderer.renderLIContent = function(rm, oLI) {

		// render icon control
		if (oLI.getIcon()) {
			rm.renderControl(oLI._getIconControl());
		}

		rm.writeEscaped(oLI.getTitle());

	};

	StandardTreeItemRenderer.renderLIAttributes = function(rm, oLI) {
		TreeItemBaseRenderer.renderLIAttributes.apply(this, arguments);
		rm.addClass("sapMSTI");
	};

	return StandardTreeItemRenderer;

}, /* bExport= */ true);
