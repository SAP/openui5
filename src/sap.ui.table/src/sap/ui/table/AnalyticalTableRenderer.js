/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './TableRenderer'],
	function(jQuery, Renderer, TableRenderer) {
	"use strict";


	/**
	 * @class AnalyticalTable renderer. 
	 * @static
	 */
	var AnalyticalTableRenderer = Renderer.extend(TableRenderer);

	return AnalyticalTableRenderer;

}, /* bExport= */ true);
