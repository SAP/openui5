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

	HierarchicalSelectRenderer.addClass = function (oRm) {
		oRm.addClass("sapUxAPHierarchicalSelect");
	};

	return HierarchicalSelectRenderer;

}, /* bExport= */ true);
