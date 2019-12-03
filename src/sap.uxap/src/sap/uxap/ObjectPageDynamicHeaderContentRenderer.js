/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/f/DynamicPageHeaderRenderer'],
	function(Renderer, DynamicPageHeaderRenderer) {
		"use strict";

		var ObjectPageDynamicHeaderContentRenderer = Renderer.extend(DynamicPageHeaderRenderer);

		ObjectPageDynamicHeaderContentRenderer.apiVersion = 2;

		return ObjectPageDynamicHeaderContentRenderer;

	}, /* bExport= */ true);
