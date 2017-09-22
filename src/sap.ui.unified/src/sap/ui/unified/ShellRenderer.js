/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.Shell
sap.ui.define(['sap/ui/core/Renderer', './ShellLayoutRenderer'],
	function(Renderer, ShellLayoutRenderer) {
	"use strict";


	/**
	 * Renderer for the sap.ui.unified.Shell
	 * @namespace
	 * @deprecated Since version 1.44.0.
	 */
	var ShellRenderer = Renderer.extend(ShellLayoutRenderer);


	return ShellRenderer;

}, /* bExport= */ true);
