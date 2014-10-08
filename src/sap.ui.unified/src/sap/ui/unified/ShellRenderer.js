/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.Shell
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './ShellLayoutRenderer'],
	function(jQuery, Renderer, ShellLayoutRenderer) {
	"use strict";


	/**
	 * @class Renderer for the sap.ui.unified.Shell
	 * @static
	 */
	var ShellRenderer = Renderer.extend(ShellLayoutRenderer);
	

	return ShellRenderer;

}, /* bExport= */ true);
