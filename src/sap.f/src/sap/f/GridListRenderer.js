/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/m/ListBaseRenderer",
	"sap/ui/layout/cssgrid/GridLayoutBase"
], function (Renderer, ListBaseRenderer, GridLayoutBase) {
	"use strict";

	/**
	 * GridListRenderer renderer
	 * @namespace
	 */
	var GridListRenderer = Renderer.extend(ListBaseRenderer);

	// List Hook
	GridListRenderer.renderContainerAttributes = function (rm, oControl) {
		rm.addClass("sapFGridList");
		ListBaseRenderer.renderContainerAttributes.apply(this, arguments);
	};

	// List Hook
	GridListRenderer.renderListStartAttributes = function (rm, oControl) {
		ListBaseRenderer.renderListStartAttributes.apply(this, arguments);
		this.renderGrid(rm, oControl);
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	GridListRenderer.renderGrid = function (rm, oControl) {
		var oGridLayout = oControl.getGridLayoutConfiguration();
		if (oGridLayout) {
			oGridLayout.renderSingleGridLayout(rm);
		} else {
			rm.addClass("sapFGridListDefault");
		}

		if (oControl.isGrouped()) {
			rm.addClass("sapFGridListGroup");
		}
	};

return GridListRenderer;

});