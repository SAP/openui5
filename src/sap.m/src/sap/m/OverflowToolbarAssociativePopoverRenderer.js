/*!
 * ${copyright}
 */

sap.ui.define([
	'./PopoverRenderer', 'sap/ui/core/Renderer'
], function(PopoverRenderer, Renderer) {
	"use strict";

	/**
	 * OverflowToolbarAssociativePopover renderer
	 * @namespace
	 */
	var OverflowToolbarAssociativePopoverRenderer = Renderer.extend(PopoverRenderer);
	OverflowToolbarAssociativePopoverRenderer.apiVersion = 2;

	return OverflowToolbarAssociativePopoverRenderer;

}, /* bExport= */true);
