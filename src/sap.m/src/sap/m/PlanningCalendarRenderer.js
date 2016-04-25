/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * PlanningCalendar renderer.
	 * @namespace
	 */
	var PlanningCalendarRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.PlanningCalendar} oPC An object representation of the <code>PlanningCalendar</code> control that should be rendered.
	 */
	PlanningCalendarRenderer.render = function(oRm, oPC){

		var sId = oPC.getId();
		var sTooltip = oPC.getTooltip_AsString();

		oRm.write("<div");
		oRm.writeControlData(oPC);
		oRm.addClass("sapMPlanCal");

		if (!oPC.getSingleSelection()) {
			oRm.addClass("sapMPlanCalMultiSel");
		}

		if (!oPC.getShowRowHeaders()) {
			oRm.addClass("sapMPlanCalNoHead");
		}

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		var sWidth = oPC.getWidth();
		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}

		var sHeight = oPC.getHeight();
		if (sHeight) {
			oRm.addStyle("height", sHeight);
		}

		oRm.writeAccessibilityState(oPC);

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		var oTable = oPC.getAggregation("table");
		oRm.renderControl(oTable);

		var sAriaText = oPC._oRB.getText("PLANNINGCALENDAR");
		oRm.write("<span id=\"" + sId + "-Descr\" class=\"sapUiInvisibleText\">" + sAriaText + "</span>");

		sAriaText = oPC._oRB.getText("PLANNINGCALENDAR_VIEW");
		oRm.write("<span id=\"" + sId + "-SelDescr\" class=\"sapUiInvisibleText\">" + sAriaText + "</span>");

		oRm.write("</div>");
	};

	return PlanningCalendarRenderer;

}, /* bExport= */ true);
