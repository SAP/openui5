/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/unified/calendar/CalendarDate', './MonthRenderer', "sap/ui/core/CalendarType"],
	function(Renderer, CalendarDate, MonthRenderer, CalendarType) {
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

	DatesRowRenderer.apiVersion = 2;

	DatesRowRenderer.getStartDate = function(oDatesRow){

		return oDatesRow._getStartDate();

	};

	DatesRowRenderer.getClass = function(oRm, oDatesRow){

		var sClasses = ["sapUiCalDatesRow", "sapUiCalRow"];

		if (!oDatesRow.getShowDayNamesLine()) {
			sClasses.push("sapUiCalNoNameLine");
		}

		return sClasses;

	};

	DatesRowRenderer.addWrapperAdditionalStyles = function(oRm, oDatesRow){

		if (oDatesRow._iTopPosition) {
			oRm.style("top", oDatesRow._iTopPosition + "px");
		}

	};

	DatesRowRenderer.renderMonth = function(oRm, oDatesRow, oDate) {
		if (oDatesRow.isRelative && oDatesRow.isRelative()) {
			DatesRowRenderer.renderCustomIntervals(oRm, oDatesRow);
		} else {
			MonthRenderer.renderMonth.apply(this, arguments);
			this.renderWeekNumbers(oRm, oDatesRow);
		}
	};

	DatesRowRenderer.renderCustomIntervals = function (oRm, oDatesRow) {
		var iIntervalWidth;

		oRm.openStart("div", oDatesRow.getId() + "-customintervals");
		oRm.openEnd();

		var iIntervals = oDatesRow.getDays();
		iIntervalWidth = 100 / iIntervals;

		var oStartWeekNumber = oDatesRow._getRelativeInfo()._getIndexFromDate(oDatesRow.getStartDate());

		for (var j = 0; j < iIntervals; j++) {
			oRm.openStart("div");
			oRm.class('sapUiCalItem');
			if (oDatesRow._getRelativeInfo && oDatesRow._getRelativeInfo().bIsRelative) {
				oRm.class('sapUiRelativeCalItem');
				oRm.attr("data-sap-ui-index", oStartWeekNumber + j);
				oRm.attr("tabindex", "-1");
				var oAssociatedDate = oDatesRow._getRelativeInfo()._getDateFromIndex(oStartWeekNumber + j + 1);
				oRm.attr("data-sap-day", oDatesRow._oFormatYyyymmdd.format(oAssociatedDate, true));
			}

			oRm.style("width", iIntervalWidth + "%");
			oRm.openEnd();
			oRm.openStart("span");
			oRm.class("sapUiCalItemText");
			oRm.openEnd();
			oRm.text(oDatesRow._getRelativeInfo ? oDatesRow._getRelativeInfo().intervalLabelFormatter(oStartWeekNumber + j) : (oStartWeekNumber + j));
			oRm.close("span");
			oRm.close("div");
		}

			oRm.close("div");
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

		if (oDatesRow.getShowWeekNumbers() && oDatesRow.getPrimaryCalendarType() === CalendarType.Gregorian) {
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");

			oRm.openStart("div", oDatesRow.getId() + "-weeks");
			oRm.class("sapUiCalRowWeekNumbers");
			oRm.openEnd();

			iDays = oDatesRow.getDays();
			iDaysWidth = 100 / iDays;
			aWeekNumbers = oDatesRow.getWeekNumbers();

			aWeekNumbers.forEach(function(oWeek) {
				oRm.openStart("div", oDatesRow.getId() + "-week-" + oWeek.number + "-text");
				oRm.class('sapUiCalRowWeekNumber');
				oRm.style("width", oWeek.len * iDaysWidth + "%");
				oRm.attr("data-sap-ui-week", oWeek.number);
				oRm.openEnd();
				oRm.text(oResourceBundle.getText('CALENDAR_DATES_ROW_WEEK_NUMBER', [oWeek.number]));
				oRm.close("div");
			});

			oRm.close("div");
		}
	};

	DatesRowRenderer.renderDummyCell = function() {};

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
			oRm.openStart("div", sId + "-Head");
			oRm.openEnd();
			this.renderHeaderLine(oRm, oDatesRow, oLocaleData, oDate);
			oRm.close("div");
		}

		sWidth = ( 100 / iDays ) + "%";
		if (oDatesRow.getShowDayNamesLine()) {
			oRm.openStart("div", sId + "-Names");
			oRm.style("display", "inline");
			oRm.attr("role", "row");
			oRm.openEnd();
			this.renderDayNames(oRm, oDatesRow, oLocaleData, oDate.getDay(), iDays, false, sWidth);
			oRm.close("div");
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
			} else  {
				aMonthDays.push({iMonth: iMonth, iDays: 1});
			}
			oDay.setDate(oDay.getDate() + 1);
		}

		var aMonthNames = oLocaleData.getMonthsStandAlone("wide", oDatesRow.getPrimaryCalendarType());
		for (i = 0; i < aMonthDays.length; i++) {
			var oMonthDays = aMonthDays[i];
			sWidth = ( 100 / iDays * oMonthDays.iDays) + "%";
			oRm.openStart("div", sId + "-Head" + i);
			oRm.class("sapUiCalHeadText");
			oRm.style("width", sWidth);
			oRm.openEnd();
			oRm.text(aMonthNames[oMonthDays.iMonth]);
			oRm.close("div");
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
		var sCalendarType = oDatesRow.getPrimaryCalendarType();

		if (!oDate) {
			oDate = oDatesRow._getFocusedDate();
		}

		var oHelper = this.getDayHelper(oDatesRow, oDate);

		if (!bShowDayNamesLine) {
			if (oDatesRow._bLongWeekDays || !oDatesRow._bNamesLengthChecked) {
				oHelper.aWeekDays = oHelper.oLocaleData.getDaysStandAlone("abbreviated", sCalendarType);
			} else {
				oHelper.aWeekDays = oHelper.oLocaleData.getDaysStandAlone("narrow", sCalendarType);
			}
			oHelper.aWeekDaysWide = oHelper.oLocaleData.getDaysStandAlone("wide", sCalendarType);
		}
		var oDay = new CalendarDate(oDate, sCalendarType);

		oRm.openStart("div");
		oRm.attr("role", "row");
		oRm.openEnd();

		for (var i = 0; i < iDays; i++) {
			this.renderDay(oRm, oDatesRow, oDay, oHelper, false, false, i, sWidth, !bShowDayNamesLine);
			oDay.setDate(oDay.getDate() + 1);
		}

		oRm.close("div");

	};

	return DatesRowRenderer;

}, /* bExport= */ true);
