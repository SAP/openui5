/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/CalendarLegendRenderer', 'sap/ui/core/Renderer'], function(CalendarLegendRenderer, Renderer) {
	"use strict";


	/**
	 * <code>PlanningCalendarLegend</code> renderer.
	 * @namespace
	 */
	var PlanningCalendarLegendRenderer = Renderer.extend(CalendarLegendRenderer);
	PlanningCalendarLegendRenderer.apiVersion = 2;

	/**
	 * Renders a header for the <code>items</code> list.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarLegend} oLeg an object representation of the legend that should be rendered
	 * @override
	 */
	PlanningCalendarLegendRenderer.renderItemsHeader = function(oRm, oLeg) {
		var sItemsHeader = oLeg._getItemsHeader();

		if (sItemsHeader && (oLeg.getItems().length || oLeg.getStandardItems().length)) {
			this._renderItemsHeader(oRm, sItemsHeader);
		}
	};

	/**
	 * Renders a header for the <code>appointmentItems</code> list.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarLegend} oLeg an object representation of the legend that should be rendered
	 */
	PlanningCalendarLegendRenderer.renderAppointmentsItemsHeader = function(oRm, oLeg) {
		var sAppointmentItemsHeader = oLeg._getAppointmentItemsHeader();
		if (sAppointmentItemsHeader && oLeg.getAppointmentItems().length) {
			this._renderItemsHeader(oRm, sAppointmentItemsHeader);
		} else if (oLeg.getAppointmentItems().length && (oLeg.getItems().length || oLeg.getStandardItems().length)) {
			//the upper list has items, and the lower list too, but the second header is an empty string
			//and we still need a delimiter
			oRm.voidStart("hr");
			oRm.attr("role", "listitem");
			oRm.voidEnd();
		}
	};

	/**
	 * Renders the <code>items</code> list header.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {string} sHeaderText Item's header text
	 * @private
	 */
	PlanningCalendarLegendRenderer._renderItemsHeader = function(oRm, sHeaderText) {
		oRm.openStart("div");
		oRm.class("sapMPlanCalLegendHeader");
		oRm.attr("role", "listitem");
		oRm.attr("aria-level", "3");
		oRm.openEnd();
		oRm.text(sHeaderText);
		oRm.close("div");

		oRm.voidStart("hr");
		oRm.attr("role", "listitem");
		oRm.voidEnd();
	};

	/**
	 * Renders additional content after the <code>items</code> list - a second list for the <code>appointmentItems</code> with a header.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarLegend} oLeg an object representation of the legend that should be rendered
	 * @override
	 */
	PlanningCalendarLegendRenderer.renderAdditionalContent = function(oRm, oLeg) {
		var aAppointmentItems = oLeg.getAppointmentItems(),
			i,
			sColumnWidth,
			sTypeClass,
			aColorClasses = ["sapUiUnifiedLegendSquareColor", "sapMPlanCalLegendAppCircle"];

		this.renderAppointmentsItemsHeader(oRm, oLeg);

		oRm.openStart("div");
		oRm.class("sapUiUnifiedLegendItems");
		sColumnWidth = oLeg.getColumnWidth();
		oRm.style("column-width", sColumnWidth);
		oRm.style("-moz-column-width", sColumnWidth);
		oRm.style("-webkit-column-width", sColumnWidth);
		oRm.openEnd();

		// rendering special day and colors
		for (i = 0; i < aAppointmentItems.length; i++) {
			sTypeClass = "sapUiCalLegDayType" + oLeg._getItemType(aAppointmentItems[i], aAppointmentItems).slice(4);
			this.renderLegendItem(oRm, sTypeClass, aAppointmentItems[i], aColorClasses, i + 1 ,aAppointmentItems.length);
		}

		oRm.close("div");
	};

	return PlanningCalendarLegendRenderer;

});
