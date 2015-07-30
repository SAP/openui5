/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './ColumnMenuRenderer'],
	function(jQuery, Renderer, ColumnMenuRenderer) {
	"use strict";


	/**
	 * AnalyticalTable renderer.
	 * @namespace
	 */
	var AnalyticalColumnMenuRenderer = Renderer.extend(ColumnMenuRenderer);

	return AnalyticalColumnMenuRenderer;

}, /* bExport= */ true);
