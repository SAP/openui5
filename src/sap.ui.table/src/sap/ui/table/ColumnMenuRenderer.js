/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.table.ColumnMenuRenderer
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/ui/unified/MenuRenderer'],
	function(jQuery, Renderer, MenuRenderer) {
	"use strict";


	/**
	 * Renderer for the sap.ui.table.ColumnMenuRendere
	 * @namespace
	 */
	var ColumnMenuRenderer = Renderer.extend(MenuRenderer);

	return ColumnMenuRenderer;

}, /* bExport= */ true);
