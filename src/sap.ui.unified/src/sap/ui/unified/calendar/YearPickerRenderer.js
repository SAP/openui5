/*!
 * ${copyright}
 */

sap.ui.define([
		'sap/ui/unified/calendar/CalendarDate',
		'sap/ui/unified/calendar/CalendarUtils',
		'sap/ui/core/date/UniversalDate',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/InvisibleText'],
	function(CalendarDate, CalendarUtils, UniversalDate, DateFormat, InvisibleText) {
	"use strict";

	/*
	 * Inside the YearPickerRenderer CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * YearPicker renderer.
	 * @namespace
	 */
	var YearPickerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.YearPicker} oYP an object representation of the control that should be rendered
	 */
	YearPickerRenderer.render = function(oRm, oYP){
		var sTooltip = oYP.getTooltip_AsString();

		oRm.openStart("div", oYP);
		oRm.class("sapUiCalYearPicker");

		if (oYP._getSecondaryCalendarType()) {
			oRm.class("sapUiCalMonthSecType");
		}

		if (sTooltip) {
			oRm.attr('title', sTooltip);
		}

		oRm.accessibilityState(oYP, this.getAccessibilityState(oYP));

		oRm.openEnd(); // div element

		this.renderCells(oRm, oYP);

		oRm.close("div");

	};

	YearPickerRenderer.getAccessibilityState = function(oYP) {
		return {
			role: "grid",
			readonly: "true",
			multiselectable: oYP.getIntervalSelection(),
			roledescription: sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("YEAR_PICKER"),
			describedby: oYP._bCalendar ? InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_YEAR_RANGE_PICKER_OPEN_HINT") : ""
		};
	};

	YearPickerRenderer.renderCells = function(oRm, oYP) {

		var oDate = oYP.getProperty("_middleDate") ? oYP.getProperty("_middleDate") : oYP._getDate(),
			oFirstDate = new CalendarDate(oDate, oYP.getPrimaryCalendarType()),
			oMinYear = CalendarUtils._minDate(oYP.getProperty("primaryCalendarType")).getYear(),
			oMaxYear = CalendarUtils._maxDate(oYP.getProperty("primaryCalendarType")).getYear(),
			iYears = oYP.getYears(),
			sId = oYP.getId(),
			iColumns = oYP.getColumns(),
			sSecondaryType = oYP._getSecondaryCalendarType(),
			sWidth = "",
			bEnabled = false,
			oLocaleData = oYP._getLocaleData(),
			sYear,
			bApplySelection,
			bApplySelectionBetween,
			mAccProps, sYyyymmdd, i;

		oFirstDate.setYear(oFirstDate.getYear() - Math.floor(iYears / 2));

		if (oFirstDate.getYear() < oMinYear) {
			oFirstDate.setYear(oMinYear);
		} else if (oFirstDate.getYear() + iYears > oMaxYear) {
			oFirstDate.setYear(oMaxYear - iYears + 1);
		}

		if (iColumns > 0) {
			sWidth = ( 100 / iColumns ) + "%";
		} else {
			sWidth = ( 100 / iYears ) + "%";
		}

		for (i = 0; i < iYears; i++) {
			sYyyymmdd = oYP._oFormatYyyymmdd.format(oFirstDate.toUTCJSDate(), true);
			mAccProps = {
				role: "gridcell"
			};
			bEnabled = oYP._checkDateEnabled(oFirstDate);

			if (iColumns > 0 && i % iColumns == 0) {
				// begin of row
				oRm.openStart("div");
				oRm.accessibilityState(null, {role: "row"});
				oRm.openEnd(); // div element
			}

			oRm.openStart("div", sId + "-y" + sYyyymmdd);
			oRm.class("sapUiCalItem");

			bApplySelection = oYP._fnShouldApplySelection(oFirstDate);
			bApplySelectionBetween = oYP._fnShouldApplySelectionBetween(oFirstDate);

			if (bApplySelection) {
				oRm.class("sapUiCalItemSel");
				mAccProps["selected"] = true;
			}

			if (bApplySelectionBetween) {
				oRm.class("sapUiCalItemSelBetween");
				mAccProps["selected"] = true;
			}

			if (!bApplySelection && !bApplySelectionBetween) {
				mAccProps["selected"] = false;
			}

			if (!bEnabled) {
				oRm.class("sapUiCalItemDsbl"); // year disabled
				mAccProps["disabled"] = true;
			}

			// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
			sYear = oYP._oYearFormat.format(UniversalDate.getInstance(oFirstDate.toUTCJSDate(), oFirstDate.getCalendarType()), true);
			mAccProps["label"] = sYear;
			if (sSecondaryType) {
				var oSecondaryYears = oYP._getDisplayedSecondaryDates(oFirstDate),
					oSecondaryYearFormat = DateFormat.getDateInstance({format: "y", calendarType: oYP.getSecondaryCalendarType()}),
					sSecondaryYearInfo, sPattern;
				if (oSecondaryYears.start.getYear() === oSecondaryYears.end.getYear()) {
					sSecondaryYearInfo = oSecondaryYearFormat.format(oSecondaryYears.start.toUTCJSDate(), true);
				} else {
					sPattern = oLocaleData.getIntervalPattern();
					sSecondaryYearInfo = sPattern.replace(/\{0\}/, oSecondaryYearFormat.format(oSecondaryYears.start.toUTCJSDate()),true)
						.replace(/\{1\}/, oSecondaryYearFormat.format(oSecondaryYears.end.toUTCJSDate(), true));
				}
				mAccProps["label"] = mAccProps["label"] + " " + sSecondaryYearInfo;
			}

			oRm.attr("tabindex", "-1");
			oRm.attr("data-sap-year-start", sYyyymmdd);
			oRm.style("width", sWidth);
			oRm.accessibilityState(null, mAccProps);
			oRm.openEnd(); // div element
			oRm.text(sYear);

			if (sSecondaryType) {
				oRm.openStart("div", sId + "-y" + sYyyymmdd + "-secondary");
				oRm.class("sapUiCalItemSecText");
				oRm.openEnd();
				oRm.text(sSecondaryYearInfo);
				oRm.close("div");
			}

			oRm.close("div");

			oFirstDate.setYear(oFirstDate.getYear() + 1);

			if (iColumns > 0 && ((i + 1) % iColumns == 0)) {
				// end of row
				oRm.close("div");
			}
		}
	};

	return YearPickerRenderer;

}, /* bExport= */ true);
