/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListRenderer, Renderer) {
	"use strict";


	
	
	/**
	 * FacetFilterList renderer.
	 * @namespace
	 *
	 * ListRenderer extends the ListBaseRenderer
	 */
	var FacetFilterListRenderer = Renderer.extend(ListRenderer);
	

	return FacetFilterListRenderer;

}, /* bExport= */ true);
