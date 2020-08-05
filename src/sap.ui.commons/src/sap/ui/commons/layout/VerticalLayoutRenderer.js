/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.layout.VerticalLayout
sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/layout/VerticalLayoutRenderer'],
	function(Renderer, LayoutVerticalLayoutRenderer) {
	"use strict";


	var VerticalLayoutRenderer = Renderer.extend(LayoutVerticalLayoutRenderer);


	return VerticalLayoutRenderer;

}, /* bExport= */ true);
