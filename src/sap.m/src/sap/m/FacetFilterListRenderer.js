/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListRenderer, Renderer) {
	"use strict";


	
	
	/**
	 * @class FacetFilterList renderer.
	 * @static
	 *
	 * ListRenderer extends the ListBaseRenderer
	 */
	var FacetFilterListRenderer = Renderer.extend(ListRenderer);
	

	return FacetFilterListRenderer;

}, /* bExport= */ true);
