/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.Menu
sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/unified/MenuRenderer'],
	function(Renderer, UnifiedMenuRenderer) {
	"use strict";


	var MenuRenderer = Renderer.extend(UnifiedMenuRenderer);

	return MenuRenderer;

}, /* bExport= */ true);