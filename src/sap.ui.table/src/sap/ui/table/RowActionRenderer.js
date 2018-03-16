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
	var RowActionRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oTable an object representation of the control that should be rendered
	 */
	RowActionRenderer.render = function(rm, oAction) {
		rm.write("<div");
		rm.writeControlData(oAction);
		rm.addClass("sapUiTableAction");
		if (!(oAction.getParent() instanceof Row)) {
			rm.addStyle("display", "none");
		}
		if (!oAction.getVisible()) {
			rm.addClass("sapUiTableActionHidden");
		}
		rm.writeClasses();
		rm.writeStyles();
		var sTooltip = oAction.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
		rm.write(">");

		var aIcons = oAction.getAggregation("_icons");

		rm.write("<div>");
		rm.renderControl(aIcons[0]);
		rm.write("</div>");

		rm.write("<div>");
		rm.renderControl(aIcons[1]);
		rm.write("</div>");

		rm.write("</div>");
	};

	return RowActionRenderer;

}, /* bExport= */ true);