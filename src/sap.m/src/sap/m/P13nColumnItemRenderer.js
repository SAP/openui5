/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ColumnListItemRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ColumnListItemRenderer, Renderer) {
	"use strict";


	/**
	 * @class ColumnItem renderer.
	 * @static
	 */
	var P13nColumnItemRenderer = Renderer.extend(ColumnListItemRenderer);

	return P13nColumnItemRenderer;

}, /* bExport= */ true);
