/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/core/InvisibleText"
	],
	function(InvisibleText) {
	"use strict";

	/**
	 * PlanningCalendar renderer.
	 * @namespace
	 */
	var PlanningCalendarRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.PlanningCalendar} oPC An object representation of the <code>PlanningCalendar</code> control that should be rendered.
	 */
	PlanningCalendarRenderer.render = function(oRm, oPC){

		var sId = oPC.getId();
		var sTooltip = oPC.getTooltip_AsString();
		var oHeader = oPC._getHeader();

		oRm.openStart("div", oPC);
		oRm.class("sapMPlanCal");
		oRm.accessibilityState({
			role: "region",
			labelledby: InvisibleText.getStaticId("sap.m", "PLANNINGCALENDAR")
		});
		this.addAdditionalClasses(oRm, oPC);
		if (oPC._iSize !== undefined && oPC._iSize !== null) {
			oRm.class("sapMSize" + oPC._iSize);
		}

		if (!oPC.getSingleSelection()) {
			oRm.class("sapMPlanCalMultiSel");
		}

		if (!oPC.getShowRowHeaders()) {
			oRm.class("sapMPlanCalNoHead");
		}

		if (oPC.getShowWeekNumbers() && oPC._viewAllowsWeekNumbers(oPC.getViewKey())) {
			oRm.class("sapMPlanCalWithWeekNumbers");
		}

		if (oPC.getShowDayNamesLine() && oPC._viewAllowsDayNamesLine(oPC.getViewKey())) {
			oRm.class("sapMPlanCalWithDayNamesLine");
		}

		if (sTooltip) {
			oRm.attr('title', sTooltip);
		}

		var sWidth = oPC.getWidth();
		if (sWidth) {
			oRm.style("width", sWidth);
		}

		var sHeight = oPC.getHeight();
		if (sHeight) {
			oRm.style("height", sHeight);
		}

		oRm.accessibilityState(oPC);
		oRm.openEnd(); // div element

		oRm.renderControl(oHeader);

		var oTable = oPC.getAggregation("table");
		oRm.renderControl(oTable);

		var sAriaText = oPC._oRB.getText("PLANNINGCALENDAR");
		oRm.openStart("span", sId + "-Descr");
		oRm.class("sapUiInvisibleText");
		oRm.openEnd(); //span
		oRm.text(sAriaText);
		oRm.close("span");

		sAriaText = oPC._oRB.getText("PLANNINGCALENDAR_VIEW");
		oRm.openStart("span", sId + "-SelDescr");
		oRm.class("sapUiInvisibleText");
		oRm.openEnd(); //span
		oRm.text(sAriaText);
		oRm.close("span");
		oRm.close("div");
	};

	/**
	 * A hook for extended classes to include additional classes.
	 *
	 * @private
	 */
	PlanningCalendarRenderer.addAdditionalClasses = function () {};

	return PlanningCalendarRenderer;

}, /* bExport= */ true);
