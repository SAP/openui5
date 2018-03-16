/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/unified/calendar/CalendarDate', './MonthRenderer'],
	function(Renderer, CalendarDate, MonthRenderer) {
	"use strict";

	/*
	 * Inside the DatesRowRenderer CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * DatesRow renderer.
	 * @namespace
	 */
	var DatesRowRenderer = Renderer.extend(MonthRenderer);

	DatesRowRenderer.getStartDate = function(oDatesRow){

		return oDatesRow._getStartDate();

	};

	DatesRowRenderer.getClass = function(oRm, oDatesRow){

		var sClasses = "sapUiCalDatesRow sapUiCalRow";

		if (!oDatesRow.getShowDayNamesLine()) {
			sClasses = sClasses + " sapUiCalNoNameLine";
		}

		return sClasses;

	};

	DatesRowRenderer.renderMonth = function(oRm, oDatesRow, oDate) {
		MonthRenderer.renderMonth.apply(this, arguments);
		this.renderWeekNumbers(oRm, oDatesRow);
	};

	/**
	 * Renders the week numbers in their own container.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.DatesRow} oDatesRow The row which will be rendered
	 * @since 1.52
	 */
	DatesRowRenderer.renderWeekNumbers = function (oRm, oDatesRow) {
		var oResourceBundle,
			iDays,
			iDaysWidth,
			aWeekNumbers;

		if (oDatesRow.getShowWeekNumbers() && oDatesRow.getPrimaryCalendarType() === sap.ui.core.CalendarType.Gregorian) {
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");

			oRm.write("<div id=\"" + oDatesRow.getId() + "-weeks\"");
			oRm.addClass("sapUiCalRowWeekNumbers");
			oRm.writeClasses();
			oRm.write(">");

			iDays = oDatesRow.getDays();
			iDaysWidth = 100 / iDays;
			aWeekNumbers = oDatesRow.getWeekNumbers();

			aWeekNumbers.forEach(function(oWeek) {
				oRm.write("<div");

				oRm.addClass('sapUiCalRowWeekNumber');
				oRm.writeClasses();

				oRm.addStyle("width", oWeek.len * iDaysWidth + "%");
				oRm.writeStyles();

				oRm.writeAttribute("data-sap-ui-week", oWeek.number);

				oRm.write(">" + oResourceBundle.getText('CALENDAR_DATES_ROW_WEEK_NUMBER', [oWeek.number]) + "</div>");
			});

			oRm.write("</div>");
		}
	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.DatesRow} oDatesRow The row which will be rendered
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date in context
	 */
	DatesRowRenderer.renderHeader = function(oRm, oDatesRow, oDate){

		var oLocaleData = oDatesRow._getLocaleData();
		var sId = oDatesRow.getId();
		var iDays = oDatesRow.getDays();
		var sWidth = "";

		// header
		if (oDatesRow._getShowHeader()) {
			oRm.write("<div id=\"" + sId + "-Head\">");
			this.renderHeaderLine(oRm, oDatesRow, oLocaleData, oDate);
			oRm.write("</div>");
		}

		sWidth = ( 100 / iDays ) + "%";
		if (oDatesRow.getShowDayNamesLine()) {
			oRm.write("<div id=\"" + sId + "-Names\" style=\"display: inline;\">");
			this.renderDayNames(oRm, oDatesRow, oLocaleData, oDate.getDay(), iDays, false, sWidth);
			oRm.write("</div>");
		}

	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.DatesRow} oDatesRow The row which will be rendered
	 * @param {sap.ui.core.LocaleData} oLocaleData The local date in context
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date in context
	 */
	DatesRowRenderer.renderHeaderLine = function(oRm, oDatesRow, oLocaleData, oDate){

		var sId = oDatesRow.getId();
		var iDays = oDatesRow.getDays();
		var oDay = new CalendarDate(oDate, oDatesRow.getPrimaryCalendarType());
		var sWidth = "";
		var iMonth = 0;
		var aMonthDays = [];
		var i = 0;

		for (i = 0; i < iDays; i++) {
			iMonth = oDay.getMonth();
			if (aMonthDays.length > 0 && aMonthDays[aMonthDays.length - 1].iMonth == iMonth) {
				aMonthDays[aMonthDays.length - 1].iDays++;
			}else {
				aMonthDays.push({iMonth: iMonth, iDays: 1});
			}
			oDay.setDate(oDay.getDate() + 1);
		}

		var aMonthNames = oLocaleData.getMonthsStandAlone("wide");
		for (i = 0; i < aMonthDays.length; i++) {
			var oMonthDays = aMonthDays[i];
			sWidth = ( 100 / iDays * oMonthDays.iDays) + "%";
			oRm.write("<div id=\"" + sId + "-Head" + i + "\"class=\"sapUiCalHeadText\" style=\"width:" + sWidth + "\">");
			oRm.write(aMonthNames[oMonthDays.iMonth]);
			oRm.write("</div>");
		}

	};
	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.DatesRow} oDatesRow The row which will be rendered
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date in context
	 */
	DatesRowRenderer.renderDays = function(oRm, oDatesRow, oDate){

		var iDays = oDatesRow.getDays();
		var sWidth = ( 100 / iDays ) + "%";
		var bShowDayNamesLine = oDatesRow.getShowDayNamesLine();

		if (!oDate) {
			oDate = oDatesRow._getFocusedDate();
		}

		var oHelper = this.getDayHelper(oDatesRow, oDate);

		if (!bShowDayNamesLine) {
			if (oDatesRow._bLongWeekDays || !oDatesRow._bNamesLengthChecked) {
				oHelper.aWeekDays = oHelper.oLocaleData.getDaysStandAlone("abbreviated");
			} else {
				oHelper.aWeekDays = oHelper.oLocaleData.getDaysStandAlone("narrow");
			}
			oHelper.aWeekDaysWide = oHelper.oLocaleData.getDaysStandAlone("wide");
		}

		var oDay = new CalendarDate(oDate, oDatesRow.getPrimaryCalendarType());

		for (var i = 0; i < iDays; i++) {
			this.renderDay(oRm, oDatesRow, oDay, oHelper, false, false, i, sWidth, !bShowDayNamesLine);
			oDay.setDate(oDay.getDate() + 1);
		}

	};

	return DatesRowRenderer;

}, /* bExport= */ true);
