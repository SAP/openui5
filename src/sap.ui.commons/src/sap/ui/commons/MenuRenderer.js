/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.Menu
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/ui/unified/MenuRenderer'],
	function(jQuery, Renderer, MenuRenderer1) {
	"use strict";


	var MenuRenderer = Renderer.extend(MenuRenderer1);

	return MenuRenderer;

}, /* bExport= */ true);
