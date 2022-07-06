/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"./YearPickerRenderer",
	"./CalendarDate",
	'sap/ui/core/format/DateFormat',
	"sap/ui/core/date/UniversalDate",
	"sap/ui/unified/calendar/CalendarUtils"
],	function(
	Renderer,
	YearPickerRenderer,
	CalendarDate,
	DateFormat,
	UniversalDate,
	CalendarUtils
) {
	"use strict";

	/*
	 * Inside the YearRangePickerRenderer CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * YearRangePicker renderer.
	 * @namespace
	 */
	var YearRangePickerRenderer = Renderer.extend(YearPickerRenderer);
	YearRangePickerRenderer.apiVersion = 2;

	YearRangePickerRenderer.getAccessibilityState = function() {
		return {
			role: "grid",
			readonly: "true",
			multiselectable: false,
			roledescription: sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("YEAR_RANGE_PICKER")
		};
	};

	YearRangePickerRenderer.renderCells = function(oRm, oYRP) {
		var oDate = oYRP.getProperty("_middleDate") ? oYRP.getProperty("_middleDate") : oYRP._getDate(),
			oSelectedDate = new CalendarDate(oDate, oYRP.getPrimaryCalendarType()),
			oFirstDate = new CalendarDate(oSelectedDate, oYRP.getPrimaryCalendarType()),
			oMinYear = CalendarUtils._minDate(oYRP.getProperty("primaryCalendarType")).getYear(),
			oMaxYear = CalendarUtils._maxDate(oYRP.getProperty("primaryCalendarType")).getYear(),
			oSecondDate,
			sFirstYear = "",
			sSecondYear = "",
			sResultRange = "",
			sId = oYRP.getId(),
			iColumns = oYRP.getColumns(),
			iYears = oYRP.getYears(),
			sSecondaryType = oYRP._getSecondaryCalendarType(),
			oLocaleData = oYRP._getLocaleData(),
			sPattern = oLocaleData.getIntervalPattern(),
			sWidth = "",
			mAccProps, sYyyymmdd, i;

		oFirstDate.setYear(oFirstDate.getYear() - Math.floor(oYRP.getRangeSize() / 2));
		oFirstDate.setYear(oFirstDate.getYear() - Math.floor(iYears / 2) * oYRP.getRangeSize());

		if (oFirstDate.getYear() < oMinYear) {
			oFirstDate.setYear(oMinYear);
		} else if (oFirstDate.getYear() > oMaxYear - iYears) {
			oFirstDate.setYear(oMaxYear - Math.floor(iYears) * oYRP.getRangeSize() + 1);
		}

		oSecondDate = new CalendarDate(oFirstDate, oYRP.getPrimaryCalendarType());
		oSecondDate.setYear(oSecondDate.getYear() + oYRP.getRangeSize() - 1);

		if (iColumns > 0) {
			sWidth = ( 100 / iColumns ) + "%";
		} else {
			sWidth = ( 100 / iYears ) + "%";
		}

		for (i = 0; i < iYears; i++) {
			sYyyymmdd = oYRP._oFormatYyyymmdd.format(oFirstDate.toUTCJSDate(), true);
			mAccProps = {
				role: "gridcell"
			};

			if (iColumns > 0 && i % iColumns == 0) {
				// begin of row
				oRm.openStart("div");
				oRm.accessibilityState(null, {role: "row"});
				oRm.openEnd(); // div element
			}

			oRm.openStart("div", sId + "-y" + sYyyymmdd);
			oRm.class("sapUiCalItem");

			if (!oYRP._checkDateEnabled(oFirstDate, oSecondDate)) {
				oRm.class("sapUiCalItemDsbl"); // year range disabled
				mAccProps["disabled"] = true;
			}

			// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
			sFirstYear = oYRP._oYearFormat.format(UniversalDate.getInstance(oFirstDate.toUTCJSDate(), oFirstDate.getCalendarType()), true);
			sSecondYear = oYRP._oYearFormat.format(UniversalDate.getInstance(oSecondDate.toUTCJSDate(), oSecondDate.getCalendarType()), true);
			sResultRange = sPattern.replace(/\{0\}/, sFirstYear).replace(/\{1\}/, sSecondYear);

			mAccProps["label"] = sResultRange;
			if (sSecondaryType) {
				var oSecondaryYears = oYRP._getDisplayedSecondaryDates(oFirstDate),
					oSecondaryYearFormat = DateFormat.getDateInstance({format: "y", calendarType: oYRP.getSecondaryCalendarType()}),
					sSecondaryYearInfo;
				if (oSecondaryYears.start.getYear() === oSecondaryYears.end.getYear()) {
					sSecondaryYearInfo = oSecondaryYearFormat.format(oSecondaryYears.start.toUTCJSDate(), true);
				} else {
					sSecondaryYearInfo = sPattern.replace(/\{0\}/, oSecondaryYearFormat.format(oSecondaryYears.start.toUTCJSDate(), true))
						.replace(/\{1\}/, oSecondaryYearFormat.format(oSecondaryYears.end.toUTCJSDate(), true));
				}
				mAccProps["label"] = mAccProps["label"] + " " + sSecondaryYearInfo;
			}

			oRm.attr("tabindex", "-1");
			oRm.attr("data-sap-year-start", sYyyymmdd);
			oRm.style("width", sWidth);
			oRm.accessibilityState(null, mAccProps);
			oRm.openEnd(); // div element
			if (CalendarUtils._isBetween(oYRP._oDate, oFirstDate, oSecondDate, true)) {
				// calculate in which year range is the selected year in order to focus it after rendering
				oYRP._iSelectedIndex = i;
			}

			oRm.text(sResultRange);

			if (sSecondaryType) {
				oRm.openStart("div", sId + "-y" + sYyyymmdd + "-secondary");
				oRm.class("sapUiCalItemSecText");
				oRm.openEnd();
				oRm.text(sSecondaryYearInfo);
				oRm.close("div");
			}

			oRm.close("div");

			if (iColumns > 0 && ((i + 1) % iColumns == 0)) {
				// end of row
				oRm.close("div");
			}

			oFirstDate.setYear(oSecondDate.getYear() + 1);
			oSecondDate.setYear(oSecondDate.getYear() + oYRP.getRangeSize());
		}
	};


	return YearRangePickerRenderer;

}, /* bExport= */ true);
