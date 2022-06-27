/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/unified/calendar/CalendarDate", 'sap/ui/core/format/DateFormat', 'sap/ui/core/InvisibleText'],
	function(CalendarDate, DateFormat, InvisibleText) {
	"use strict";


	/**
	 * MonthPicker renderer.
	 * @namespace
	 */
	var MonthPickerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthPicker} oMP an object representation of the control that should be rendered
	 */
	MonthPickerRenderer.render = function(oRm, oMP){

		var iMonth = (oMP.getProperty("_firstMonth") !== undefined) ? oMP.getProperty("_firstMonth") : oMP.getMonth(),
			iMonths = oMP.getMonths(),
			iStartMonth = 0,
			iColumns = oMP.getColumns(),
			sTooltip = oMP.getTooltip_AsString(),
			oLocaleData = oMP._getLocaleData(),
			sId = oMP.getId(),
			sWidth = "",
			aMonthNames = [],
			aMonthNamesWide = [],
			sCalendarType = oMP.getPrimaryCalendarType(),
			sSecondaryType = oMP._getSecondaryCalendarType(),
			oPrimaryYearFormat = DateFormat.getDateInstance({format: "y", calendarType: oMP.getPrimaryCalendarType()}),
			iYear = oMP._iYear ? oMP._iYear : new Date().getFullYear(),
			sPrimaryCalTypeFormattedYear = oPrimaryYearFormat.format(new Date(iYear, 0, 1)),
			i,
			bApplySelection,
			bApplySelectionBetween;

		if (oMP._bLongMonth || !oMP._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
			aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		}

		oRm.openStart("div",oMP);
		oRm.class("sapUiCalMonthPicker");

		if (sSecondaryType) {
			oRm.class("sapUiCalMonthSecType");
		}

		if (sTooltip) {
			oRm.attr("tooltip", sTooltip);
		}

		oRm.accessibilityState(oMP, {
			role: "grid",
			readonly: "true",
			multiselectable: oMP.getIntervalSelection(),
			roledescription: sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("MONTH_PICKER"),
			describedby: oMP._bCalendar ? InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_YEAR_PICKER_OPEN_HINT") : ""
		});

		oRm.openEnd(); // div element
		var mAccProps;

		if (iMonths > 12) {
			iMonths = 12;
		} else if (iMonths < 12) {
			// Month blocks should start with multiple of number of displayed months
			iStartMonth = iMonth;
		}

		if (iColumns > 0) {
			sWidth = ( 100 / iColumns ) + "%";
		} else {
			sWidth = ( 100 / iMonths ) + "%";
		}

		for (i = 0; i < iMonths; i++) {
			var iCurrentMonth = i + iStartMonth,
				oCurrentDate = CalendarDate.fromLocalJSDate(new Date(), oMP.getPrimaryCalendarType());

			oCurrentDate.setMonth(iCurrentMonth, 1);
			oMP._iYear && oCurrentDate.setYear(oMP._iYear);

			mAccProps = {
					role: "gridcell"
				};
			if (!oMP._bLongMonth && oMP._bNamesLengthChecked) {
				mAccProps["label"] = aMonthNamesWide[iCurrentMonth];
			}

			if (iColumns > 0 && i % iColumns === 0) {
				// begin of row
				oRm.openStart("div");
				oRm.accessibilityState(null, {role: "row"});
				oRm.openEnd();
			}

			oRm.openStart("div", sId + "-m" + (iCurrentMonth));
			oRm.class("sapUiCalItem");

			bApplySelection = oMP._fnShouldApplySelection(oCurrentDate);
			bApplySelectionBetween = oMP._fnShouldApplySelectionBetween(oCurrentDate);

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

			if (iCurrentMonth < oMP._iMinMonth || iCurrentMonth > oMP._iMaxMonth) {
				oRm.class("sapUiCalItemDsbl"); // month disabled
				mAccProps["disabled"] = true;
			}

			mAccProps["label"] = aMonthNames[iCurrentMonth] + " " + sPrimaryCalTypeFormattedYear;
			if (sSecondaryType) {
				var sSecondaryCalendarType = oMP.getSecondaryCalendarType(),
					// always use wide month names for the screen reader
					aMonthNamesSecondary = oLocaleData.getMonthsStandAlone("abbreviated", sSecondaryCalendarType),
					oSecondaryYearFormat = DateFormat.getDateInstance({format: "y", calendarType: sSecondaryCalendarType}),
					oSecondaryMonths = oMP._getDisplayedSecondaryDates(iCurrentMonth),
					sSecondaryMonthInfo, sSecondaryYearInfo,  sPattern;

				if (oSecondaryMonths.start.getMonth() === oSecondaryMonths.end.getMonth()) {
					sSecondaryMonthInfo = aMonthNamesSecondary[oSecondaryMonths.start.getMonth()];
					sSecondaryYearInfo = oSecondaryYearFormat.format(oSecondaryMonths.start.toLocalJSDate());
				} else {
					sPattern = oLocaleData.getIntervalPattern();
					sSecondaryMonthInfo = sPattern.replace(/\{0\}/, aMonthNamesSecondary[oSecondaryMonths.start.getMonth()]).replace(/\{1\}/, aMonthNamesSecondary[oSecondaryMonths.end.getMonth()]);
					sSecondaryYearInfo = sPattern.replace(/\{0\}/, oSecondaryYearFormat.format(oSecondaryMonths.start.toLocalJSDate())).replace(/\{1\}/, oSecondaryYearFormat.format(oSecondaryMonths.end.toLocalJSDate()));
				}
				mAccProps["label"] = mAccProps["label"] + " " + sSecondaryMonthInfo + " " + sSecondaryYearInfo;
			}

			oRm.attr("tabindex", "-1");
			oRm.style("width", sWidth);
			oRm.accessibilityState(null, mAccProps);
			oRm.openEnd();
			oRm.text(aMonthNames[iCurrentMonth]);

			if (sSecondaryType) {
				oRm.openStart("div", sId + "-m" + iCurrentMonth + "-secondary");
				oRm.class("sapUiCalItemSecText");
				oRm.openEnd();
				oRm.text(sSecondaryMonthInfo);
				oRm.close("div");
			}

			oRm.close("div");

			if (iColumns > 0 && ((i + 1) % iColumns === 0)) {
				// end of row
				oRm.close("div");
			}
		}

		oRm.close("div");
	};

	return MonthPickerRenderer;

}, /* bExport= */ true);
