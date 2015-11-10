/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";

	/**
	 * PlanningCalendar renderer.
	 * @namespace
	 */
	var PlanningCalendarRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.fw.RenderManager}.
	 *
	 * @param {sap.ui.fw.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.commons.Slider} oTC An object representation of the <code>PlanningCalendar</code> control that should be rendered.
	 */
	PlanningCalendarRenderer.render = function(oRm, oTC){

		var sTooltip = oTC.getTooltip_AsString();

		oRm.write("<div");
		oRm.writeControlData(oTC);
		oRm.addClass("sapMPlanCal");

		if (!oTC.getSingleSelection()) {
			oRm.addClass("sapMPlanCalMultiSel");
		}

		if (!oTC.getShowRowHeaders()) {
			oRm.addClass("sapMPlanCalNoHead");
		}

//		// This makes the row focusable
//		oRm.writeAttribute("tabindex", "-1");

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		var sWidth = oTC.getWidth();
		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}

		var sHeight = oTC.getHeight();
		if (sHeight) {
			oRm.addStyle("height", sHeight);
		}

//		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		oRm.writeAccessibilityState(oTC/*, mAccProps*/);

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		var oTable = oTC.getAggregation("table");
		oRm.renderControl(oTable);

		oRm.write("</div>");
	};

	return PlanningCalendarRenderer;

}, /* bExport= */ true);
