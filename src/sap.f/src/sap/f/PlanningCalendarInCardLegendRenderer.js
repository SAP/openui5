/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/PlanningCalendarLegendRenderer', 'sap/ui/core/Renderer'],
	function(PlanningCalendarLegendRenderer, Renderer) {
		"use strict";


		/**
		 * <code>PlanningCalendarInCardLegend</code> renderer.
		 * @namespace
		 */
		var PlanningCalendarInCardLegendRenderer = Renderer.extend(PlanningCalendarLegendRenderer);

		/**
		 * Renders a header for the <code>items</code> list.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.unified.PlanningCalendarInCardLegend} oLeg an object representation of the legend that should be rendered
		 * @override
		 */
		PlanningCalendarInCardLegendRenderer.renderItemsHeader = function(oRm, oLeg) {};

		/**
		 * Renders a header for the <code>appointmentItems</code> list.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.unified.PlanningCalendarInCardLegend} oLeg an object representation of the legend that should be rendered
		 */
		PlanningCalendarInCardLegendRenderer.renderAppointmentsItemsHeader = function(oRm, oLeg) {};

		/**
		 * Renders additional content after the <code>items</code> list - a second list for the <code>appointmentItems</code> with a header.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.unified.PlanningCalendarInCardLegend} oLeg an object representation of the legend that should be rendered
		 * @override
		 */
		PlanningCalendarInCardLegendRenderer.renderAdditionalContent = function(oRm, oLeg) {};

		/**
		 * Renders additional content after the <code>items</code> list - a second list for the <code>appointmentItems</code> with a header.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.unified.PlanningCalendarInCardLegend} oLeg an object representation of the legend that should be rendered
		 * @override
		 */
		PlanningCalendarInCardLegendRenderer.renderAdditionalItems = function(oRm, oLeg) {
			var aAppointmentItems = oLeg.getAppointmentItems(),
				iVisibleLegendItems = oLeg.getVisibleLegendItemsCount(),
				iAppItemslength,
				i;

			if (oLeg.getItems().length >= iVisibleLegendItems) {
				iAppItemslength = 0;
			} else if (oLeg.getItems().length + oLeg.getAppointmentItems().length > iVisibleLegendItems) {
				iAppItemslength = iVisibleLegendItems - oLeg.getItems().length;
			} else {
				iAppItemslength = oLeg.getAppointmentItems().length;
			}
			// rendering special day and colors
			for (i = 0; i < iAppItemslength; i++) {
				this.renderLegendItem(oRm, "sapUiCalLegDayType" + oLeg._getItemType(aAppointmentItems[i], aAppointmentItems).slice(4), aAppointmentItems[i], ["sapUiUnifiedLegendSquareColor", "sapMPlanCalLegendAppCircle"]);
			}

			if (oLeg.getItems().length + oLeg.getAppointmentItems().length > iVisibleLegendItems){
				oRm.renderControl(oLeg._getMoreLabel(oLeg.getItems().length + oLeg.getAppointmentItems().length - iVisibleLegendItems));
			}
		};

		/**
		 * Determines how many custom items will be rendered.
		 * @param {sap.ui.unified.CalendarLegend} oLeg an object representation of the legend that should be rendered
		 * @param {integer} iCustomItemsLength the length of the custom items
		 * @returns {integer} the length of the custom items to be rendered
		 * @override
		 */
		PlanningCalendarInCardLegendRenderer.defineItemsLength = function(oLeg, iCustomItemsLength) {
			var iVisibleLegendItems = oLeg.getVisibleLegendItemsCount();

			if (iCustomItemsLength >= iVisibleLegendItems) {
				return iVisibleLegendItems;
			} else {
				return iCustomItemsLength;
			}
		};

		return PlanningCalendarInCardLegendRenderer;

	}, /* bExport= */ true);
