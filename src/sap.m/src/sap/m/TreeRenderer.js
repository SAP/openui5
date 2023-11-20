/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './ListBaseRenderer'],
	function(Renderer, ListBaseRenderer) {
	"use strict";

	/**
	 * Tree renderer.
	 * @namespace
	 *
	 */
	var TreeRenderer = Renderer.extend(ListBaseRenderer);
	TreeRenderer.apiVersion = 2;

	TreeRenderer.getNoDataAriaRole = function() {
		return "treeitem";
	};

	return TreeRenderer;

}, /* bExport= */ true);