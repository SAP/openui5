/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class DatePicker renderer.
	 * @static
	 */
	var CalendarRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.Calendar} oCal an object representation of the control that should be rendered
	 */
	CalendarRenderer.render = function(oRm, oCal){
	
		oCal._iMode = 0; // it's rendered always as DayPicker
	
		var oDate = oCal._getFocusedDate();
		var sId = oCal.getId();
		var sTooltip = oCal.getTooltip_AsString();
	
		oRm.write("<div");
		oRm.writeControlData(oCal);
		oRm.addClass("sapUiCal");
		oRm.writeClasses();
		// This makes the calendar focusable and therefore
		// the white empty areas can be clicked without closing the calendar
		// by accident.
		oRm.writeAttribute("tabindex", "-1");
	
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		oRm.writeAccessibilityState(oCal, {
			role: "dialog",
			label: rb.getText("DATEPICKER_DIALOG")
		});
	
		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}
	
		oRm.write(">"); // div element
	
		this.renderHeader(oRm, oCal, oDate);
	
		this.renderDayPicker(oRm, oCal, oDate);
	
		oRm.write("<button id=\"" + sId + "-cancel\" class=\"sapUiCancel\" tabindex=\"-1\">");
		oRm.write(rb.getText("CALENDAR_CANCEL"));
		oRm.write("</button>");
	
		// dummy element to catch tabbing in from next element
		oRm.write("<div id=\"" + sId + "-end\" tabindex=\"0\" style=\"width:0;height:0;position:absolute;right:0;bottom:0;\"></div>");
	
		oRm.write("</div>");
	};
	
	CalendarRenderer.renderHeader = function(oRm, oCal, oDate){
	
		var oLocaleData = oCal._getLocaleData();
		var sId = oCal.getId();
		var iMonth = oDate.getUTCMonth();
		var iYear = oDate.getUTCFullYear();
		var aMonthNames = [];
		if (oCal._bLongMonth || !oCal._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide");
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
		}
	
		oRm.write("<div");
		oRm.addClass("sapUiCalHead");
		oRm.writeClasses();
		oRm.write(">"); // div element
		oRm.write("<button id=\"" + sId + "-prev\" class=\"sapUiCalPrev\" tabindex=\"-1\">");
		oRm.writeIcon("sap-icon://slim-arrow-left");
		oRm.write("</button>");
	
		oRm.write("<button");
		oRm.writeAttributeEscaped('id', sId + '-month');
		oRm.addClass("sapUiCalMonthPick");
		oRm.writeAttribute('tabindex', "-1");
		oRm.writeClasses();
		oRm.write(">"); // button element
		oRm.write(aMonthNames[iMonth]);
		oRm.write("</button>");
	
		oRm.write("<button");
		oRm.writeAttributeEscaped('id', sId + '-year');
		oRm.addClass("sapUiCalYearPick");
		oRm.writeAttribute('tabindex', "-1");
		oRm.writeClasses();
		oRm.write(">"); // button element
		oRm.write(iYear);
		oRm.write("</button>");
	
		oRm.write("<button id=\"" + sId + "-next\" class=\"sapUiCalNext\" tabindex=\"-1\">");
		oRm.writeIcon("sap-icon://slim-arrow-right");
		oRm.write("</button>");
		oRm.write("</div>");
	
	};
	
	CalendarRenderer.renderDayPicker = function(oRm, oCal, oDate){
	
		var oLocaleData = oCal._getLocaleData();
		var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
		var sId = oCal.getId();
	
		// week numbers
		var aWeekDays = [];
		if (oCal._bLongWeekDays || !oCal._bNamesLengthChecked) {
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
		this.renderDays(oRm, oCal, oDate);
		oRm.write("</div>");
	
	};
	
	CalendarRenderer.renderDays = function(oRm, oCal, oDate){
	
		if (!oDate) {
			oDate = oCal._getFocusedDate();
		}
	
		var sLocale = oCal.getLocale();
		var oLocaleData = oCal._getLocaleData();
		var iMonth = oDate.getUTCMonth();
		var iYear = oDate.getUTCFullYear();
		var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
		var iWeekendStart = oLocaleData.getWeekendStart();
		var iWeekendEnd = oLocaleData.getWeekendEnd();
		var oToday = new Date();
		var sId = oCal.getId();
	
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
	
			sYyyymmdd = oCal._oFormatYyyymmdd.format(oDay, true);
			iWeekDay = oDay.getUTCDay();
			iSelected = oCal._checkDateSelected(oDay);
			oType = oCal._getDateType(oDay);
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
				oRm.write(this.calculateWeekNumber(oDay, iYear, sLocale, oLocaleData));
				oRm.write("</span>");
			}
	
			oRm.write("</div>");
	
			oDay.setUTCDate(oDay.getUTCDate() + 1);
	
		} while (oDay.getUTCMonth() != iNextMonth || oDay.getUTCDay() != iFirstDayOfWeek);
	
	};
	
	CalendarRenderer.calculateWeekNumber = function(oDate, iYear, sLocale, oLocaleData){
	
		var iWeekNum = 0;
		var iWeekDay = 0;
		var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
	
		switch (sLocale) {
		case "en-US":
			/*
			 * in US the week starts with Sunday
			 * The first week of the year starts with January 1st. But Dec. 31 is still in the last year
			 * So the week beginning in December and ending in January has 2 week numbers
			 */
			var oJanFirst = new Date(oDate.getTime());
			oJanFirst.setUTCFullYear(iYear, 0, 1);
			iWeekDay = oJanFirst.getUTCDay();
	
			//get the date for the same weekday like jan 1.
			var oCheckDate = new Date(oDate.getTime());
			oCheckDate.setUTCDate(oCheckDate.getUTCDate() - oCheckDate.getUTCDay() + iWeekDay);
	
			iWeekNum = Math.round((oCheckDate.getTime() - oJanFirst.getTime()) / 86400000 / 7) + 1;
	
			break;
	
		default:
			// normally the first week of the year is the one where the first Thursday of the year is
			// find Thursday of this week
			// if the checked day is before the 1. day of the week use a day of the previous week to check
			var oThursday = new Date(oDate.getTime());
			oThursday.setUTCDate(oThursday.getUTCDate() - iFirstDayOfWeek);
			iWeekDay = oThursday.getUTCDay();
			oThursday.setUTCDate(oThursday.getUTCDate() - iWeekDay + 4);
	
			var oFirstDayOfYear = new Date(oThursday.getTime());
			oFirstDayOfYear.setUTCMonth(0, 1);
			iWeekDay = oFirstDayOfYear.getUTCDay();
			var iAddDays = 0;
			if (iWeekDay > 4) {
				iAddDays = 7; // first day of year is after Thursday, so first Thursday is in the next week
			}
			var oFirstThursday = new Date(oFirstDayOfYear.getTime());
			oFirstThursday.setUTCDate(1 - iWeekDay + 4 + iAddDays);
	
			iWeekNum = Math.round((oThursday.getTime() - oFirstThursday.getTime()) / 86400000 / 7) + 1;
	
			break;
		}
	
		return iWeekNum;
	
	};
	
	CalendarRenderer.renderMonthPicker = function(oRm, oCal, oDate){
	
		var oLocaleData = oCal._getLocaleData();
		var sId = oCal.getId();
		var aMonthNames = [];
		if (oCal._bLongMonth || !oCal._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide");
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
		}
		var iMonth = oDate.getUTCMonth();
	
		oRm.write("<div id=\"" + sId + "-months\" class=\"sapUiCalMonths\">");
	
		for ( var i = 0; i < 12; i++) {
			oRm.write("<div");
			oRm.writeAttribute("id", sId + "-m" + i);
			oRm.addClass("sapUiCalMonth");
			if (i == iMonth) {
				oRm.addClass("sapUiCalMonthSel");
			}
			oRm.writeAttribute("tabindex", "-1");
			oRm.writeClasses();
			oRm.write(">"); // div element
			oRm.write(aMonthNames[i]);
			oRm.write("</div>");
		}
	
		oRm.write("</div>");
	
	};
	
	CalendarRenderer.renderYearPicker = function(oRm, oCal, oDate){
	
		var sId = oCal.getId();
		var iCurrentYear = oDate.getUTCFullYear();
		var iYear = 0;
	
		oRm.write("<div id=\"" + sId + "-years\" class=\"sapUiCalYears\">");
	
		for ( var i = 0; i < 20; i++) {
			iYear = iCurrentYear - 10 + i;
			oRm.write("<div");
			oRm.writeAttribute("id", sId + "-y" + iYear);
			oRm.addClass("sapUiCalYear");
			if (i == 10) {
				oRm.addClass("sapUiCalYearSel");
			}
			oRm.writeAttribute("tabindex", "-1");
			oRm.writeClasses();
			oRm.write(">"); // div element
			oRm.write(iYear);
			oRm.write("</div>");
		}
	
		oRm.write("</div>");
	
	};

	return CalendarRenderer;

}, /* bExport= */ true);
