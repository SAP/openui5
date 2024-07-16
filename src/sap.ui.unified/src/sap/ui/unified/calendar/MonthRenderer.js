/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/CalendarLegend',
	'sap/ui/unified/CalendarLegendRenderer',
	'sap/ui/core/library',
	'sap/ui/unified/library',
	"sap/base/Log",
	'sap/ui/core/InvisibleText',
	'sap/ui/core/date/UI5Date',
	"sap/ui/core/date/CalendarUtils",
	"sap/ui/core/Locale"
], function(
	Element,
	Library,
	CalendarUtils,
	CalendarDate,
	CalendarLegend,
	CalendarLegendRenderer,
	coreLibrary,
	library,
	Log,
	InvisibleText,
	UI5Date,
	CalendarDateUtils,
	Locale
) {
"use strict";


// shortcut for sap.ui.unified.CalendarDayType
var CalendarDayType = library.CalendarDayType;

// shortcut for sap.ui.core.CalendarType
var CalendarType = coreLibrary.CalendarType;


/**
 * Month renderer.
 * @namespace
 */
var MonthRenderer = {
	apiVersion: 2
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.unified.calendar.Month} oMonth an object representation of the control that should be rendered
 */
MonthRenderer.render = function(oRm, oMonth){

	var oDate = this.getStartDate(oMonth),
		sTooltip = oMonth.getTooltip_AsString(),
		rb = Library.getResourceBundleFor("sap.ui.unified"),
		sId = oMonth.getId(),
		oAriaLabel = {value: "", append: !oMonth._bCalendar},
		sDescribedBy = "",
		sWidth = oMonth.getWidth();

	oRm.openStart("div", oMonth);
	this.getClass(oRm, oMonth).forEach(function (sClass) {
		oRm.class(sClass);
	});
	if (oMonth._getSecondaryCalendarType()) {
		oRm.class("sapUiCalMonthSecType");
	}

	this.addWrapperAdditionalStyles(oRm, oMonth);

	if (sTooltip) {
		oRm.attr("title", sTooltip);
	}

	if (oMonth._getShowHeader()) {
		oAriaLabel.value = sId + "-Head";
	}

	if (oMonth._bCalendar) {
		sDescribedBy = InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_MONTH_PICKER_OPEN_HINT")
				+ " " + InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_YEAR_PICKER_OPEN_HINT");
	}

	if (sWidth) {
		oRm.style("width", sWidth);
	}

	oRm.accessibilityState(oMonth, {
		role: "grid",
		roledescription: oMonth._bCalendar ? "" : rb.getText("CALENDAR_DIALOG"),
		multiselectable: !oMonth.getSingleSelection() || oMonth.getIntervalSelection(),
		labelledby: oAriaLabel,
		describedby: sDescribedBy
	});

	oRm.openEnd(); // div element

	if (oMonth.getIntervalSelection()) {
		oRm.openStart("span", sId + "-Start");
		oRm.style("display", "none");
		oRm.openEnd();
		oRm.text(rb.getText("CALENDAR_START_DATE"));
		oRm.close("span");

		oRm.openStart("span", sId + "-End");
		oRm.style("display", "none");
		oRm.openEnd();
		oRm.text(rb.getText("CALENDAR_END_DATE"));
		oRm.close("span");
	}

	this.renderMonth(oRm, oMonth, oDate);

	oRm.close("div");

};

MonthRenderer.addWrapperAdditionalStyles = function() {};

/**
 * @param {sap.ui.unified.calendar.Month} oMonth The month which start date will be returned
 * @returns {sap.ui.unified.calendar.CalendarDate|*} The start date of the month
 */
MonthRenderer.getStartDate = function(oMonth){

	return oMonth._getDate();

};

MonthRenderer.getClass = function(oRm, oMonth){

	var aClasses = ["sapUiCalMonthView"],
		sCalendarType = oMonth.getPrimaryCalendarType(),
		bShowWeekNumbers = oMonth.getShowWeekNumbers();

	if (sCalendarType === CalendarType.Islamic || !bShowWeekNumbers) {
		// on Islamic calendar week numbers are not used
		aClasses.push("sapUiCalNoWeekNum");
	}

	return aClasses;

};

/**
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.unified.calendar.Month} oMonth The month to be rendered
 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date which month and year will be set to the header
 */
MonthRenderer.renderMonth = function(oRm, oMonth, oDate){
	// header line
	this.renderHeader(oRm, oMonth, oDate);
	// days
	this.renderDays(oRm, oMonth, oDate);
};

/**
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.unified.calendar.Month} oMonth The month to be rendered
 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date which month and year will be set to the header
 */
MonthRenderer.renderHeader = function(oRm, oMonth, oDate){

	var oLocaleData = oMonth._getLocaleData();
	var iFirstDayOfWeek = oMonth._getFirstDayOfWeek();

	// header
	this.renderHeaderLine(oRm, oMonth, oLocaleData, oDate);

	oRm.openStart("div");
	oRm.accessibilityState(null, {role: "row"});
	oRm.style("overflow", "hidden");
	oRm.openEnd(); // div

	this.renderDayNames(oRm, oMonth, oLocaleData, iFirstDayOfWeek, 7, true, undefined);

	oRm.close("div");

};

/**
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.unified.calendar.Month} oMonth The month to e rendered
 * @param {sap.ui.core.LocaleData} oLocaleData The local date which month and year will be set to the header
 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date which month and year will be set to the header
 */
MonthRenderer.renderHeaderLine = function(oRm, oMonth, oLocaleData, oDate){
	CalendarUtils._checkCalendarDate(oDate);

	if (oMonth._getShowHeader()) {
		var sId = oMonth.getId();
		var sCalendarType = oMonth.getPrimaryCalendarType();
		var aMonthNames = oLocaleData.getMonthsStandAlone("wide", sCalendarType);

		oRm.openStart("div", sId + "-Head");
		oRm.class("sapUiCalHeadText");
		oRm.openEnd(); // div
		oRm.text(aMonthNames[oDate.getMonth()]);
		oRm.close("div");
	}

};

MonthRenderer.renderDayNames = function(oRm, oMonth, oLocaleData, iStartDay, iDays, bDayNumberAsId, sWidth){

	var iFirstDayOfWeek = oMonth._getFirstDayOfWeek();
	var sId = oMonth.getId();
	var sDayId = "";
	var sCalendarType = oMonth.getPrimaryCalendarType();

	var aWeekDays = [];
	if (oMonth._bLongWeekDays || !oMonth._bNamesLengthChecked) {
		aWeekDays = oLocaleData.getDaysStandAlone("abbreviated", sCalendarType);
	} else {
		aWeekDays = oLocaleData.getDaysStandAlone("narrow", sCalendarType);
	}
	var aWeekDaysWide = oLocaleData.getDaysStandAlone("wide", sCalendarType);

	if (oMonth.getShowWeekNumbers() && sCalendarType !== CalendarType.Islamic) { // on Islamic primary calendar week numbers are not shown, do not add dummy cell
		this.renderDummyCell(oRm, "sapUiCalWH", true, "columnheader");
	}

	for ( var i = 0; i < iDays; i++) {
		if (bDayNumberAsId) {
			// month mode -> use the day number as ID
			sDayId = sId + "-WH" + ((i + iFirstDayOfWeek) % 7);
		} else {
			// just use counter as ID
			sDayId = sId + "-WH" + i;
		}
		oRm.openStart("div", sDayId);
		oRm.class("sapUiCalWH");
		if (i === 0) {
			oRm.class("sapUiCalFirstWDay");
		}
		if (sWidth) {
			oRm.style("width", sWidth);
		}
		oRm.accessibilityState(null, {
			role: "columnheader",
			label: aWeekDaysWide[(i + iStartDay) % 7]
		});
		oRm.openEnd(); // div element
		oRm.text(aWeekDays[(i + iStartDay) % 7]);
		oRm.close("div");
	}

};

/**
 *
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.unified.calendar.Month} oMonth The month to be rendered
 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date which month and year will be set to the header
 */
MonthRenderer.renderDays = function(oRm, oMonth, oDate){
	var bWeekNum,
		aDays,
		iLength,
		oHelper,
		i,
		iTimestamp,
		bShowWeekNumbers;

	CalendarUtils._checkCalendarDate(oDate);

	if (!oDate) {
		oDate = oMonth._getFocusedDate();
	}

	iTimestamp = oDate.toUTCJSDate().getTime();
	if (!iTimestamp && iTimestamp !== 0) {
		// invalid date
		throw new Error("Date is invalid " + oMonth);
	}

	oHelper = this.getDayHelper(oMonth, oDate);

	aDays = oMonth._getVisibleDays(oDate, true);

	bShowWeekNumbers = oMonth.getShowWeekNumbers();

	bWeekNum = oMonth.getPrimaryCalendarType() !== CalendarType.Islamic && bShowWeekNumbers; // on Islamic calendar week numbers are not used

	iLength = aDays.length;
	for (i = 0; i < iLength; i++) {
		if (i % 7 === 0) {
			oRm.openStart("div");
			oRm.attr("role", "row");
			oRm.openEnd();

			if (bWeekNum) {
				this._renderWeekNumber(oRm, aDays[i], oHelper, oMonth);
			}
		}

		this.renderDay(oRm, oMonth, aDays[i], oHelper, true, bWeekNum, -1);

		if (i % 7 === 6 || i === iLength - 1) {
			oRm.close("div");
		}
	}

	if (iLength === 28) {
		// there are only 4 full weeks (28 days), add one hidden 'day' div in order to open space for 5-th week
		this.renderDummyCell(oRm, "sapUiCalItem", false, "");
	}
};

/**
 * Generates empty 'day' div that adds space for one more week in the calendar, in case of 4 full weeks only (28 days)
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {string} sClassName css class that will be added to the dummy element styles
 * @param {boolean} bVisible if set to true the dummy element will be visible
 * @param {string} sRole aria role attribute
 * @private
 */
MonthRenderer.renderDummyCell = function(oRm, sClassName, bVisible, sRole) {
	oRm.openStart("div");
	oRm.class(sClassName);
	oRm.class("sapUiCalDummy");
	oRm.style("visibility", bVisible ? "visible" : "hidden");
	oRm.attr("role", sRole);
	oRm.attr("aria-label", Library.getResourceBundleFor("sap.ui.unified").getText("CALENDAR_WEEK"));
	oRm.openEnd();
	oRm.close('div');
};

/**
 * Generates helper object from passed date
 * @param {sap.ui.unified.calendar.Month} oMonth the month instance
 * @param {sap.ui.unified.calendar.CalendarDate} oDate date instance
 * @returns {object} helper object
 * @private
 */
MonthRenderer.getDayHelper = function(oMonth, oDate){
	var oLegend,
		sLegendId,
		oLocaleData = oMonth._getLocaleData(),
		oHelper = {
			sLocale: oMonth._getLocale(),
			oLocaleData: oLocaleData,
			iMonth: oDate.getMonth(),
			iYear: oDate.getYear(),
			iFirstDayOfWeek: oMonth._getFirstDayOfWeek(),
			iWeekendStart: oLocaleData.getWeekendStart(),
			iWeekendEnd: oLocaleData.getWeekendEnd(),
			aNonWorkingDays: oMonth._getNonWorkingDays() || [],
			sToday: oLocaleData.getRelativeDay(0),
			oToday: CalendarDate.fromLocalJSDate(UI5Date.getInstance(), oMonth.getPrimaryCalendarType()),
			sId: oMonth.getId(),
			oFormatLong: oMonth._getFormatLong(),
			sPrimaryCalendarType: oMonth.getPrimaryCalendarType(),
			sSecondaryCalendarType: oMonth._getSecondaryCalendarType(),
			oLegend: undefined
		};

	sLegendId = oMonth.getLegend();
	// getLegend may return string or array we should proceed only if the result is a string
	if (sLegendId && typeof sLegendId === "string") {
		oLegend = Element.getElementById(sLegendId);
		if (oLegend) {
			if (!(oLegend instanceof CalendarLegend)) {
				throw new Error(oLegend + " is not an sap.ui.unified.CalendarLegend. " + oMonth);
			}
			oHelper.oLegend = oLegend;
		} else {
			Log.warning("CalendarLegend " + sLegendId + " does not exist!", oMonth);
		}
	}

	return oHelper;
};

/**
 *
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.unified.calendar.Month} oMonth The month to be rendered
 * @param {sap.ui.unified.calendar.CalendarDate} oDay The date which month and year will be set to the header
 * @param {Object} oHelper A helper instance
 * @param {boolean} bOtherMonth Whether there is other month
 * @param {boolean} bWeekNum Whether the week numbers must be rendered
 * @param {int} iNumber The day numbers
 * @param {string} sWidth The width to be set to the month
 * @param {boolean} bDayName Whether the day names must be rendered
 */
MonthRenderer.renderDay = function(oRm, oMonth, oDay, oHelper, bOtherMonth, bWeekNum, iNumber, sWidth, bDayName){
	CalendarUtils._checkCalendarDate(oDay);
	var oSecondaryDay = new CalendarDate(oDay, oHelper.sSecondaryCalendarType),
		mAccProps = {
			role: oMonth._getAriaRole(),
			selected: false,
			label: "",
			describedby: oMonth._getDayDescription()
		},
		bBeforeFirstYear = oDay._bBeforeFirstYear,
		sAriaType = "",
		oLegend = oHelper.oLegend;

	var sYyyymmdd = oMonth._oFormatYyyymmdd.format(oDay.toUTCJSDate(), true);
	var iWeekDay = oDay.getDay();
	var iSelected = oMonth._checkDateSelected(oDay);
	var aDayTypes = oMonth._getDateTypes(oDay);
	var sSpecialDateTypeFilter = oHelper && oHelper.oLegend ? oHelper.oLegend._getSpecialDateTypeFilter() : '';
	var bEnabled = oMonth._checkDateEnabled(oDay);
	var bShouldBeMarkedAsSpecialDate = oMonth._isSpecialDateMarkerEnabled(oDay);
	const sFirstSpecialDateType = aDayTypes.length > 0 && aDayTypes[0].type;
	const sSecondaryDateType = aDayTypes.length > 0 && aDayTypes[0].secondaryType;
	const bIsWeekend = oHelper.aNonWorkingDays.length
		? oHelper.aNonWorkingDays.some((iNonWorkingDay) => oDay.getDay() === iNonWorkingDay)
		: CalendarUtils._isWeekend(oDay, oMonth._getLocaleData());
	const bNonWorkingWeekend =  sFirstSpecialDateType !== CalendarDayType.Working
		&& sSecondaryDateType !== CalendarDayType.Working
		&& bIsWeekend;
	const bNonWorking = sFirstSpecialDateType === CalendarDayType.NonWorking
		|| sSecondaryDateType === CalendarDayType.NonWorking || bNonWorkingWeekend;

	const sNonWorkingDayText = oMonth._oUnifiedRB.getText("LEGEND_NON_WORKING_DAY");
	const aTooltipTexts = [];

	// Days before 0001.01.01 should be disabled.
	if (bBeforeFirstYear) {
		bEnabled = false;
	}

	oRm.openStart("div", oHelper.sId + "-" + sYyyymmdd);
	oRm.class("sapUiCalItem");
	oRm.class("sapUiCalWDay" + iWeekDay);
	if (sWidth) {
		oRm.style("width", sWidth);
	}
	if (iWeekDay === oHelper.iFirstDayOfWeek) {
		oRm.class("sapUiCalFirstWDay");
	}
	if (bOtherMonth && oHelper.iMonth !== oDay.getMonth()) {
		oRm.class("sapUiCalItemOtherMonth");
		mAccProps["disabled"] = true;
	}
	if (oDay.isSame(oHelper.oToday)) {
		oRm.class("sapUiCalItemNow");
		aTooltipTexts.push(oMonth._oUnifiedRB.getText("LEGEND_TODAY"));
	}

	if (iSelected > 0) {
		oRm.class("sapUiCalItemSel"); // day selected
		mAccProps["selected"] = true;
	} else {
		mAccProps["selected"] = false;
	}
	if (iSelected === 2) {
		oRm.class("sapUiCalItemSelStart"); // interval start
		mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-Start";
	} else if (iSelected === 3) {
		oRm.class("sapUiCalItemSelEnd"); // interval end
		mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-End";
	} else if (iSelected === 4) {
		oRm.class("sapUiCalItemSelBetween"); // interval between
	} else if (iSelected === 5) {
		oRm.class("sapUiCalItemSelStart"); // interval start
		oRm.class("sapUiCalItemSelEnd"); // interval end
		mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-Start";
		mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-End";
	}

	if (this.renderWeekNumbers && oMonth._oDate) {
		// TODO: We could replace the following lines with a sap.ui.unified.calendar.CalendarUtils.calculateWeekNumber usage
		// once the same method starts to respect the sap/ui/core/date/CalendarWeekNumbering types.
		const oWeekConfig = CalendarDateUtils.getWeekConfigurationValues(oMonth.getCalendarWeekNumbering(), new Locale(oMonth._getLocale()));
		oWeekConfig.firstDayOfWeek = oMonth._getFirstDayOfWeek();
		const oFirstDateOfWeek = CalendarDate.fromUTCDate(CalendarUtils.getFirstDateOfWeek(oDay.toLocalJSDate(), oWeekConfig), oMonth.getPrimaryCalendarType());
		mAccProps["describedby"] = mAccProps["describedby"] + " " + oMonth.getId() + "-week-" + oMonth._calculateWeekNumber(oFirstDateOfWeek) + "-text";
	}

	if (bNonWorking) {
		oRm.class("sapUiCalItemWeekEnd");
		aTooltipTexts.push(sNonWorkingDayText);
	}

	if (bShouldBeMarkedAsSpecialDate) {
		aDayTypes.forEach(function(oDayType, iIndex) {
			if (oDayType.type !== CalendarDayType.None) {
				if (sSpecialDateTypeFilter === "" || sSpecialDateTypeFilter === CalendarDayType.None || sSpecialDateTypeFilter === oDayType.type) {
					if (iIndex === 0) {
						oRm.class("sapUiCalItem" + oDayType.type);
					}
					sAriaType = oDayType.type;
					if (oDayType.tooltip) {
						aTooltipTexts.push(oDayType.tooltip);
					}
				}
			}
		});
	}

	if (aTooltipTexts.length) {
		const aTooltips = aTooltipTexts.filter((sText, iPos) => aTooltipTexts.indexOf(sText) === iPos );
		oRm.attr('title', aTooltips.join(" "));
	}

	//oMonth.getDate() is a public date object, so it is always considered local timezones.
	if (((oMonth.getParent() && oMonth.getParent().getMetadata().getName() === "sap.ui.unified.CalendarOneMonthInterval")
		|| (oMonth.getMetadata().getName() === "sap.ui.unified.calendar.OneMonthDatesRow"))
		&& oMonth.getStartDate() && oHelper.iMonth !== oDay.getMonth()) {
		oRm.class("sapUiCalItemOtherMonth");
	}

	if (!bEnabled) {
		oRm.class("sapUiCalItemDsbl"); // day disabled
		mAccProps["disabled"] = true;
	}

	oRm.attr("tabindex", "-1");
	oRm.attr("data-sap-day", sYyyymmdd);
	if (bDayName) {
		mAccProps["label"] = mAccProps["label"] + oHelper.aWeekDaysWide[iWeekDay] + " ";
	}
	mAccProps["label"] = mAccProps["label"] + oHelper.oFormatLong.format(oDay.toUTCJSDate(), true);

	if (sAriaType !== "") {
		CalendarLegendRenderer.addCalendarTypeAccInfo(mAccProps, sAriaType, oLegend);
	}

	if (oHelper.sSecondaryCalendarType) {
		mAccProps["label"] = mAccProps["label"] + " " + oMonth._oFormatSecondaryLong.format(oSecondaryDay.toUTCJSDate(), true);
	}

	oRm.accessibilityState(null, mAccProps);
	oRm.openEnd(); // div element

	if (aDayTypes[0] && bShouldBeMarkedAsSpecialDate){ //if there's a special date inside current month, render it
		oRm.openStart("div");
		oRm.class("sapUiCalSpecialDate");
		if (aDayTypes[0].color && (sSpecialDateTypeFilter === "" || sSpecialDateTypeFilter === CalendarDayType.None)) { // if there's a custom color and no special date filtering, render it

			oRm.style("background-color", aDayTypes[0].color);
		}
		oRm.openEnd(); // div
		oRm.close("div");
	}

	oRm.openStart("span");
	oRm.class("sapUiCalItemText");
	if (aDayTypes[0] && aDayTypes[0].color) {
		oRm.class("sapUiCalItemTextCustomColor");
	}
	oRm.openEnd(); // span

	// Date text for days before 0001.01.01 should not be visible.
	if (!bBeforeFirstYear) {
		oRm.text(oDay.getDate());
	}
	oRm.close("span");

	if (bDayName) {
		oRm.openStart("span");
		oRm.class("sapUiCalDayName");
		oRm.openEnd(); // span
		oRm.text(oHelper.aWeekDays[iWeekDay]);
		oRm.close("span");
	}

	if (oHelper.sSecondaryCalendarType) {
		oRm.openStart("span");
		oRm.class("sapUiCalItemSecText");
		oRm.openEnd(); // span
		oRm.text(oSecondaryDay.getDate());
		oRm.close("span");
	}

	oRm.close("div");

};

MonthRenderer._renderWeekNumber = function(oRm, oDay, oHelper, oMonth) {
	var iWeekNumber = oMonth._calculateWeekNumber(oDay);
	var sId = oHelper.sId + "-WNum-" + iWeekNumber;

	// add week number - inside first day of the week to allow better position and make it easier for ItemNavigation
	oRm.openStart("div", sId);
	oRm.class("sapUiCalWeekNum");
	oRm.accessibilityState(null, { role: "rowheader", labelledby: InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_WEEK") + " " +  sId});
	oRm.openEnd(); // span
	oRm.text(iWeekNumber);
	oRm.close("div");
};

return MonthRenderer;

});