/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer"
], function(Renderer) {
	"use strict";

	/**
	 * HeaderInfoSectionRowRenderer renderer.
	 * @private
	 */
	var HeaderInfoSectionRowRenderer = {
		apiVersion: 2
	};

	HeaderInfoSectionRowRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl)
			.class("sapUiIntHeaderInfoSectionRow")
			.class(`sapUiIntHeaderInfoSectionItemJustify${oControl.getJustifyContent()}`)
			.openEnd();

		oControl.getColumns().forEach((oColumn) => {
			oRm.renderControl(oColumn);
		});

		const aItems = oControl.getItems();
		if (aItems.length) {
			oRm.openStart("div")
				.class("sapUiIntHeaderInfoSectionItemsGroup")
				.openEnd();

			aItems.forEach((oItem) => {
				oRm.renderControl(oItem);
			});

			oRm.close("div");
		}

		oRm.close("div");
	};

	return HeaderInfoSectionRowRenderer;
});
