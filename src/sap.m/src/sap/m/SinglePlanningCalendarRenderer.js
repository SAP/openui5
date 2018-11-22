/*!
 * ${copyright}
 */
sap.ui.define([],
function() {
	"use strict";

	/**
	 * SinglePlanningCalendar renderer.
	 * @namespace
	 */
	var SinglePlanningCalendarRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.SinglePlanningCalendar} oCalendar An object representation of the <code>SinglePlanningCalendarRenderer</code> control that should be rendered.
	 */
	SinglePlanningCalendarRenderer.render = function(oRm, oCalendar){
		oRm.write("<div");
		oRm.writeControlData(oCalendar);
		oRm.addClass("sapMSinglePC");
		oRm.addClass("sapUiSizeCompact"); // TODO: for now force Compact mode
		oRm.writeClasses();
		oRm.write(">");

		var oHeader = oCalendar._getHeader(),
			oGrid = oCalendar._getGrid();

		oRm.renderControl(oHeader);
		oRm.renderControl(oGrid);

		oRm.write("</div>");
	};

	return SinglePlanningCalendarRenderer;

}, /* bExport= */ true);