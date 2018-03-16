/*!
 * ${copyright}
 */

sap.ui.define(['./ListRenderer', 'sap/ui/core/Renderer'],
	function(ListRenderer, Renderer) {
	"use strict";

	/**
	 * FacetFilterList renderer.
	 *
	 * ListRenderer extends the ListBaseRenderer
	 * @namespace
	 * @alias sap.m.FacetFilterListRenderer
	 */
	var FacetFilterListRenderer = Renderer.extend(ListRenderer);

	return FacetFilterListRenderer;

}, /* bExport= */ true);
