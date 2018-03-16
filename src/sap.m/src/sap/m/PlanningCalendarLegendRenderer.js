/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/CalendarLegendRenderer', 'sap/ui/core/Renderer'],
	function(CalendarLegendRenderer, Renderer) {
		"use strict";


		/**
		 * <code>PlanningCalendarLegend</code> renderer.
		 * @namespace
		 */
		var PlanningCalendarLegendRenderer = Renderer.extend(CalendarLegendRenderer);

		/**
		 * Renders a header for the <code>items</code> list.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.unified.CalendarLegend} oLeg an object representation of the legend that should be rendered
		 * @override
		 */
		PlanningCalendarLegendRenderer.renderItemsHeader = function(oRm, oLeg) {
			var sItemsHeader = oLeg.getItemsHeader();
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
			var sAppointmentItemsHeader = oLeg.getAppointmentItemsHeader();
			if (sAppointmentItemsHeader && oLeg.getAppointmentItems().length) {
				this._renderItemsHeader(oRm, sAppointmentItemsHeader);
			} else if (oLeg.getAppointmentItems().length && (oLeg.getItems().length || oLeg.getStandardItems().length)) {
				//the upper list has items, and the lower list too, but the second header is an empty string
				//and we still need a delimiter
				oRm.write("<hr/>");
			}
		};

		/**
		 * Renders the <code>items</code> list header.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {string} sHeaderText Item's header text
		 * @private
		 */
		PlanningCalendarLegendRenderer._renderItemsHeader = function(oRm, sHeaderText) {
			oRm.write("<div class='sapMPlanCalLegendHeader'>");
			oRm.writeEscaped(sHeaderText);
			oRm.write("</div><hr/>");
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
				sColumnWidth;

			this.renderAppointmentsItemsHeader(oRm, oLeg);

			oRm.write("<div");
			oRm.addClass("sapUiUnifiedLegendItems");
			oRm.writeClasses();
			sColumnWidth = oLeg.getColumnWidth();
			oRm.writeAttribute("style", "column-width:" + sColumnWidth + ";-moz-column-width:" + sColumnWidth + ";-webkit-column-width:" + sColumnWidth + ";");
			oRm.writeStyles();
			oRm.write(">");

			// rendering special day and colors
			for (i = 0; i < aAppointmentItems.length; i++) {
				this.renderLegendItem(oRm, "sapUiCalLegDayType" + oLeg._getItemType(aAppointmentItems[i], aAppointmentItems).slice(4), aAppointmentItems[i], ["sapUiUnifiedLegendSquareColor", "sapMPlanCalLegendAppCircle"]);
			}

			oRm.write("</div>");
		};

		return PlanningCalendarLegendRenderer;

	}, /* bExport= */ true);
