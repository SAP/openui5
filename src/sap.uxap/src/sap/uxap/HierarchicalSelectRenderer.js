/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/SelectRenderer", "sap/ui/core/Renderer"
], function (SelectRenderer, Renderer) {
	"use strict";

	/**
	 * @class ObjectPageRenderer renderer.
	 * @static
	 */
	var HierarchicalSelectRenderer = Renderer.extend(SelectRenderer);
	HierarchicalSelectRenderer.apiVersion = 2;

	HierarchicalSelectRenderer.addClass = function (oRm) {
		oRm.class("sapUxAPHierarchicalSelect");
	};

	return HierarchicalSelectRenderer;

}, /* bExport= */ true);
