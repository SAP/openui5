/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/unified/calendar/CalendarUtils'],
	function(jQuery, CalendarUtils) {
	"use strict";


	/**
	 * Month renderer.
	 * @namespace
	 */
	var MonthRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.Month} oMonth an object representation of the control that should be rendered
	 */
	MonthRenderer.render = function(oRm, oMonth){

		var oDate = oMonth._getDate();
		var sTooltip = oMonth.getTooltip_AsString();

		oRm.write("<div");
		oRm.writeControlData(oMonth);
		oRm.addClass("sapUiCalMonthView");
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		oRm.write(">"); // div element

		this.renderMonth(oRm, oMonth, oDate);

		oRm.write("</div>");

	};

	MonthRenderer.renderMonth = function(oRm, oMonth, oDate){

		var oLocaleData = oMonth._getLocaleData();
		var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
		var sId = oMonth.getId();

		// week numbers
		var aWeekDays = [];
		if (oMonth._bLongWeekDays || !oMonth._bNamesLengthChecked) {
			aWeekDays = oLocaleData.getDaysStandAlone("abbreviated");
		} else {
			aWeekDays = oLocaleData.getDaysStandAlone("narrow");
		}
		for ( var i = 0; i < 7; i++) {
			oRm.write("<div");
			oRm.addClass("sapUiCalWH");
			if (i == 0) {
				oRm.addClass("sapUiCalFirstWDay");
			}
			oRm.writeClasses();
			oRm.write(">"); // div element
			oRm.write(aWeekDays[(i + iFirstDayOfWeek) % 7]);
			oRm.write("</div>");
		}

		// days
		oRm.write("<div id=\"" + sId + "-days\" class=\"sapUiCalDays\">"); // extra DIV around the days to allow rerendering only it's content
		this.renderDays(oRm, oMonth, oDate);
		oRm.write("</div>");

	};

	MonthRenderer.renderDays = function(oRm, oMonth, oDate){

		if (!oDate) {
			oDate = oMonth._getFocusedDate();
		}

		var sLocale = oMonth._getLocale();
		var oLocaleData = oMonth._getLocaleData();
		var iMonth = oDate.getUTCMonth();
		var iYear = oDate.getUTCFullYear();
		var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
		var iWeekendStart = oLocaleData.getWeekendStart();
		var iWeekendEnd = oLocaleData.getWeekendEnd();
		var oToday = new Date();
		var sId = oMonth.getId();

		// determine weekday of first day in month
		var oFirstDay = new Date(oDate.getTime());
		oFirstDay.setUTCDate(1);
		var iWeekDay = oFirstDay.getUTCDay();
		var iDaysOldMonth = iWeekDay - iFirstDayOfWeek;
		if (iDaysOldMonth < 0) {
			iDaysOldMonth = 7 + iDaysOldMonth;
		}

		if (iDaysOldMonth > 0) {
			// determine first day for display
			oFirstDay.setUTCDate(1 - iDaysOldMonth);
		}

		var oDay = new Date(oFirstDay.getTime());
		var sYyyymmdd = "";
		var iNextMonth = (iMonth + 1) % 12;
		var iSelected = 0;
		var oType;

		do {

			sYyyymmdd = oMonth._oFormatYyyymmdd.format(oDay, true);
			iWeekDay = oDay.getUTCDay();
			iSelected = oMonth._checkDateSelected(oDay);
			oType = oMonth._getDateType(oDay);
			oRm.write("<div");
			oRm.writeAttribute("id", sId + "-" + sYyyymmdd);
			oRm.addClass("sapUiCalDay");
			oRm.addClass("sapUiCalWDay" + iWeekDay);
			if (iWeekDay == iFirstDayOfWeek) {
				oRm.addClass("sapUiCalFirstWDay");
			}
			if (iMonth != oDay.getUTCMonth()) {
				oRm.addClass("sapUiCalDayOtherMonth");
			}
			if (oDay.getUTCMonth() == oToday.getMonth() && oDay.getUTCFullYear() == oToday.getFullYear() && oDay.getUTCDate() == oToday.getDate()) {
				oRm.addClass("sapUiCalDayToday");
			}

			if (iSelected > 0) {
				oRm.addClass("sapUiCalDaySel"); // day selected
			}
			if (iSelected == 2) {
				oRm.addClass("sapUiCalDaySelStart"); // interval start
			} else if (iSelected == 3) {
				oRm.addClass("sapUiCalDaySelEnd"); // interval end
			} else if (iSelected == 4) {
				oRm.addClass("sapUiCalDaySelBetween"); // interval between
			} else if (iSelected == 5) {
				oRm.addClass("sapUiCalDaySelStart"); // interval start
				oRm.addClass("sapUiCalDaySelEnd"); // interval end
			}

			if (oType) {
				oRm.addClass("sapUiCalDay" + oType.type);
				if (oType.tooltip) {
					oRm.writeAttributeEscaped('title', oType.tooltip);
				}
			}

			if ((iWeekDay >= iWeekendStart && iWeekDay <= iWeekendEnd) ||
					( iWeekendEnd < iWeekendStart && ( iWeekDay >= iWeekendStart || iWeekDay <= iWeekendEnd))) {
				oRm.addClass("sapUiCalDayWeekEnd");
			}
			oRm.writeAttribute("tabindex", "-1");
			oRm.writeAttribute("data-sap-day", sYyyymmdd);
			oRm.writeClasses();
			oRm.write(">"); // div element

			oRm.write("<span class=\"sapUiCalDayNum\">");
			oRm.write(oDay.getUTCDate());
			oRm.write("</span>");

			if (iWeekDay == iFirstDayOfWeek) {
				// add week number - inside first day of the week to allow better position and make it easier for ItemNavigation
				oRm.write("<span class=\"sapUiCalWeekNum\">");
				oRm.write(CalendarUtils.calculateWeekNumber(oDay, iYear, sLocale, oLocaleData));
				oRm.write("</span>");
			}

			oRm.write("</div>");

			oDay.setUTCDate(oDay.getUTCDate() + 1);

		} while (oDay.getUTCMonth() != iNextMonth || oDay.getUTCDay() != iFirstDayOfWeek);

	};

	return MonthRenderer;

}, /* bExport= */ true);
