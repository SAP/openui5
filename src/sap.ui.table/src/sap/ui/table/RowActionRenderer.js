/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.RowAction
sap.ui.define(['sap/ui/table/Row'],
	function(Row) {
	"use strict";

	/**
	 * RowAction renderer.
	 * @namespace
	 */
	var RowActionRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oTable an object representation of the control that should be rendered
	 */
	RowActionRenderer.render = function(rm, oAction) {
		rm.openStart("div", oAction);
		rm.class("sapUiTableAction");
		if (!(oAction.getParent() instanceof Row)) {
			rm.style("display", "none");
		}
		if (!oAction.getVisible()) {
			rm.class("sapUiTableActionHidden");
		}
		var sTooltip = oAction.getTooltip_AsString();
		if (sTooltip) {
			rm.attr("title", sTooltip);
		}
		rm.openEnd();

		var aIcons = oAction.getAggregation("_icons");
		rm.renderControl(aIcons[0]);
		rm.renderControl(aIcons[1]);

		rm.close("div");
	};

	return RowActionRenderer;

}, /* bExport= */ true);