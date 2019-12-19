/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"./YearPickerRenderer",
	'./CalendarDate',
	'sap/ui/core/date/UniversalDate'
],	function(
	Renderer,
	YearPickerRenderer,
	CalendarDate,
	UniversalDate
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
			label: sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("YEAR_RANGE_PICKER")
		};
	};

	YearRangePickerRenderer.renderCells = function(oRm, oYRP) {
		var oSelectedDate = new CalendarDate(oYRP._getDate(), oYRP.getPrimaryCalendarType()),
			oFirstDate = new CalendarDate(oSelectedDate, oYRP.getPrimaryCalendarType()),
			oSecondDate,
			sFirstYear = "",
			sSecondYear = "",
			sId = oYRP.getId(),
			iColumns = oYRP.getColumns(),
			iYears = oYRP.getYears(),
			sWidth = "",
			mAccProps, sYyyymmdd, i;

		oFirstDate.setYear(oFirstDate.getYear() - Math.floor(oYRP.getRangeSize() / 2));
		oFirstDate.setYear(oFirstDate.getYear() - Math.floor(iYears / 2) * oYRP.getRangeSize());
		oFirstDate = oYRP._checkFirstDate(oFirstDate);

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

			oRm.attr("tabindex", "-1");
			oRm.attr("data-sap-year-start", sYyyymmdd);
			oRm.style("width", sWidth);
			oRm.accessibilityState(null, mAccProps);
			oRm.openEnd(); // div element

			// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
			sFirstYear = oYRP._oYearFormat.format(UniversalDate.getInstance(oFirstDate.toUTCJSDate(), oFirstDate.getCalendarType()), true);
			sSecondYear = oYRP._oYearFormat.format(UniversalDate.getInstance(oSecondDate.toUTCJSDate(), oSecondDate.getCalendarType()), true);

			oRm.text(sFirstYear + " - " + sSecondYear);
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
