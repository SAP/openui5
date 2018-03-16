/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./ListBaseRenderer"],
	function(Renderer, ListBaseRenderer) {
	"use strict";


	/**
	 * List renderer.
	 *
	 * ListRenderer extends the ListBaseRenderer
	 * @namespace
	 * @alias sap.m.ListRenderer
	 */
	var ListRenderer = Renderer.extend(ListBaseRenderer);

	return ListRenderer;

}, /* bExport= */ true);
