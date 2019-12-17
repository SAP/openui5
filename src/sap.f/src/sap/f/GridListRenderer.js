/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/m/ListBaseRenderer"
], function (Renderer, ListBaseRenderer) {
	"use strict";

	/**
	 * GridListRenderer renderer.
	 * @namespace
	 */
	var GridListRenderer = Renderer.extend(ListBaseRenderer);

	/**
	 * This hook method is called to render container attributes.
	 * @override
	 */
	GridListRenderer.renderContainerAttributes = function (rm, oControl) {
		ListBaseRenderer.renderContainerAttributes.apply(this, arguments);
		rm.addClass("sapFGridList");
	};

	/**
	 * This hook method is called to render list tag
	 * @override
	 */
	GridListRenderer.renderListStartAttributes = function (rm, oControl) {
		ListBaseRenderer.renderListStartAttributes.apply(this, arguments);
		this.renderGridAttributes(rm, oControl);
	};

	/**
	 * Adds classes for grid stylings.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	GridListRenderer.renderGridAttributes = function (rm, oControl) {
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