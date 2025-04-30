/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer"
], function(Renderer) {
	"use strict";

	/**
	 * HeaderInfoSectionColumnRenderer renderer.
	 * @private
	 */
	var HeaderInfoSectionColumnRenderer = {
		apiVersion: 2
	};

	HeaderInfoSectionColumnRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl)
			.class("sapUiIntHeaderInfoSectionColumn")
			.openEnd();

		oControl.getRows().forEach((oRow) => {
			oRm.renderControl(oRow);
		});

		const aItems = oControl.getItems();
		if (aItems.length) {
			oRm.openStart("div", oControl)
				.class("sapUiIntHeaderInfoSectionItemsGroup")
				.openEnd();

			aItems.forEach((oItem) => {
				oRm.renderControl(oItem);
			});

			oRm.close("div");
		}

		oRm.close("div");
	};

	return HeaderInfoSectionColumnRenderer;
});
