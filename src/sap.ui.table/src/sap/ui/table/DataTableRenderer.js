/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.DataTable
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './TreeTableRenderer'],
	function(jQuery, Renderer, TreeTableRenderer) {
	"use strict";


	/**
	 * DataTableRenderer
	 * @namespace
	 */
	var DataTableRenderer = Renderer.extend(TreeTableRenderer);
	

	return DataTableRenderer;

}, /* bExport= */ true);
