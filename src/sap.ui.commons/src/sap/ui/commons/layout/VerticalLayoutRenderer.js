/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.layout.VerticalLayout
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/ui/layout/VerticalLayoutRenderer'],
	function(jQuery, Renderer, VerticalLayoutRenderer1) {
	"use strict";


	var VerticalLayoutRenderer = Renderer.extend(VerticalLayoutRenderer1);


	return VerticalLayoutRenderer;

}, /* bExport= */ true);
