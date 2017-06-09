/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/ui/unified/calendar/CalendarUtils', './MonthRenderer', './DatesRowRenderer'],
	function(jQuery, Renderer, CalendarUtils, MonthRenderer, DatesRowRenderer) {
		"use strict";

		/**
		 * OneMonthDatesRowRenderer renderer.
		 * @namespace
		 */
		var OneMonthDatesRowRenderer = Renderer.extend(DatesRowRenderer);

		OneMonthDatesRowRenderer.getClass = function(oDatesRow){
			if (oDatesRow.iMode < 2) {
				return MonthRenderer.getClass(oDatesRow);
			} else {
				return DatesRowRenderer.getClass(oDatesRow);
			}
		};

		/**
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.unified.DatesRow} oDatesRow The DatesRow to be rendered
		 * @param {sap.ui.unified.calendar.CalendarDate} oDate The start date
		 */
		OneMonthDatesRowRenderer.renderDays = function(oRm, oDatesRow, oDate) {
			if (oDatesRow.iMode < 2) {
				MonthRenderer.renderDays(oRm, oDatesRow, oDate);
			} else {
				DatesRowRenderer.renderDays(oRm, oDatesRow, oDate);
			}
		};

		return OneMonthDatesRowRenderer;

	}, /* bExport=  */ true);
