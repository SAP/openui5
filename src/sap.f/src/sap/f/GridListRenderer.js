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
	GridListRenderer.apiVersion = 2;

	/**
	 * This hook method is called to render container attributes.
	 * @override
	 */
	GridListRenderer.renderContainerAttributes = function (oRM, oControl) {
		ListBaseRenderer.renderContainerAttributes.apply(this, arguments);
		oRM.class("sapFGridList");
	};

	/**
	 * This hook method is called to render list tag
	 * @override
	 */
	GridListRenderer.renderListStartAttributes = function (oRM, oControl) {
		ListBaseRenderer.renderListStartAttributes.apply(this, arguments);
		this.renderGridAttributes(oRM, oControl);
	};

	/**
	 * Adds classes for grid stylings.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	GridListRenderer.renderGridAttributes = function (oRM, oControl) {
		var oGridLayout = oControl.getGridLayoutConfiguration();
		if (oGridLayout) {
			oGridLayout.addGridStyles(oRM);
		} else {
			oRM.class("sapFGridListDefault");
		}

		if (oControl.isGrouped()) {
			oRM.class("sapFGridListGroup");
		}
	};

	return GridListRenderer;
}, /* bExport= */ true);