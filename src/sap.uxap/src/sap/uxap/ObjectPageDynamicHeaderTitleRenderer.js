/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/f/DynamicPageTitleRenderer'],
	function(Renderer, DynamicPageTitleRenderer) {
		"use strict";

		var ObjectPageDynamicHeaderTitleRenderer = Renderer.extend(DynamicPageTitleRenderer);

		ObjectPageDynamicHeaderTitleRenderer.apiVersion = 2;

		return ObjectPageDynamicHeaderTitleRenderer;

	}, /* bExport= */ true);
