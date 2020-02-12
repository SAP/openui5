/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/calendar/CalendarUtils', 'sap/ui/unified/calendar/CalendarDate', 'sap/ui/unified/CalendarLegend', 'sap/ui/unified/CalendarLegendRenderer',
	'sap/ui/core/library', 'sap/ui/unified/library', "sap/base/Log"],
	function(CalendarUtils, CalendarDate, CalendarLegend, CalendarLegendRenderer, coreLibrary, library, Log) {
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

		var oDate = this.getStartDate(oMonth);
		var sTooltip = oMonth.getTooltip_AsString();
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		var sId = oMonth.getId();
		var oAriaLabel = {value: sId + "-Descr", append: true};
		var sWidth = oMonth.getWidth();

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
			oAriaLabel.value = oAriaLabel.value + " " + sId + "-Head";
		}

		if (sWidth) {
			oRm.style("width", sWidth);
		}

		oRm.accessibilityState(oMonth, {
			role: "grid",
			multiselectable: !oMonth.getSingleSelection() || oMonth.getIntervalSelection(),
			labelledby: oAriaLabel
		});

		oRm.openEnd(); // div element

		oRm.openStart("span", sId + "-Descr");
		oRm.style("display", "none");
		oRm.openEnd();
		oRm.text(rb.getText("CALENDAR_DIALOG"));
		oRm.close("span");

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

		var sId = oMonth.getId();

		// header line
		this.renderHeader(oRm, oMonth, oDate);

		// days
		oRm.openStart("div", sId + "-days"); // extra DIV around the days to allow rerendering only it's content
		oRm.attr("role", "row");
		oRm.class("sapUiCalItems");
		oRm.openEnd();
		this.renderDays(oRm, oMonth, oDate);
		oRm.close("div");

	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.Month} oMonth The month to be rendered
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date which month and year will be set to the header
	 */
	MonthRenderer.renderHeader = function(oRm, oMonth, oDate){

		var oLocaleData = oMonth._getLocaleData();
		var iFirstDayOfWeek = oMonth._getFirstDayOfWeek();
		var sId = oMonth.getId();
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");

		// header
		this.renderHeaderLine(oRm, oMonth, oLocaleData, oDate);

		oRm.openStart("div", sId + "-CW");
		oRm.style("display", "none");
		oRm.accessibilityState(null, {role: "columnheader"});
		oRm.openEnd(); // div
		oRm.text(rb.getText("CALENDAR_WEEK"));
		oRm.close("div");

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
			oRm.accessibilityState(null, {role: "columnheader", label: aWeekDaysWide[(i + iStartDay) % 7]});
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
			i, iTimestamp,
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
			this.renderDay(oRm, oMonth, aDays[i], oHelper, true, bWeekNum, -1);
		}
		if (iLength === 28) {
			// there are only 4 full weeks (28 days), add one hidden 'day' div in order to open space for 5-th week
			this.renderDummyDay(oRm);
		}
	};

	/**
	 * Generates empty 'day' div that adds space for one more week in the calendar, in case of 4 full weeks only (28 days)
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @private
	 */
	MonthRenderer.renderDummyDay = function(oRm) {
		oRm.openStart("div");
		oRm.class("sapUiCalItem");
		oRm.style("visibility", "hidden");
		oRm.attr("tabindex", "-1");
		oRm.openEnd();
		oRm.close('div');
	};

	/**
	 * Generates helper object from passed date
	 * @param {sap.ui.unified.calendar.Month} oMonth the month instance
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate JavaScript date object
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
				aNonWorkingDays: oMonth._getNonWorkingDays(),
				sToday: oLocaleData.getRelativeDay(0),
				oToday: CalendarDate.fromLocalJSDate(new Date(), oMonth.getPrimaryCalendarType()),
				sId: oMonth.getId(),
				oFormatLong: oMonth._getFormatLong(),
				sSecondaryCalendarType: oMonth._getSecondaryCalendarType(),
				oLegend: undefined
			};

		sLegendId = oMonth.getLegend();
		// getLegend may return string or array we should proceed only if the result is a string
		if (sLegendId && typeof sLegendId === "string") {
			oLegend = sap.ui.getCore().byId(sLegendId);
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
				describedby: ""
			},
			bBeforeFirstYear = oDay._bBeforeFirstYear,
			sAriaType = "";

		var sYyyymmdd = oMonth._oFormatYyyymmdd.format(oDay.toUTCJSDate(), true);
		var iWeekDay = oDay.getDay();
		var iSelected = oMonth._checkDateSelected(oDay);
		var aDayTypes = oMonth._getDateTypes(oDay);
		var bEnabled = oMonth._checkDateEnabled(oDay);
		var i = 0;

		// Days before 0001.01.01 should be disabled.
		if (bBeforeFirstYear) {
			bEnabled = false;
		}

		var iWeekNumber = 0;
		if (bWeekNum) {
			iWeekNumber = CalendarUtils.calculateWeekNumber(oDay.toUTCJSDate(), oHelper.iYear, oHelper.sLocale, oHelper.oLocaleData);
			mAccProps["describedby"] = oHelper.sId + "-CW" + " " + oHelper.sId + "-WNum-" +  iWeekNumber;
		}

		if (!bDayName) {
			var sWHId = "";
			if (iNumber < 0) {
				sWHId = oHelper.sId + "-WH" + iWeekDay;
			} else {
				sWHId = oHelper.sId + "-WH" + iNumber;
			}
			mAccProps["describedby"] = mAccProps["describedby"] + " " + sWHId;
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
			mAccProps["label"] = oHelper.sToday + " ";
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

		aDayTypes.forEach(function(oDayType) {
			if (oDayType.type !== CalendarDayType.None) {
				if (oDayType.type === CalendarDayType.NonWorking) {
					oRm.class("sapUiCalItemWeekEnd");
					return;
				}
				oRm.class("sapUiCalItem" + oDayType.type);
				sAriaType = oDayType.type;
				if (oDayType.tooltip) {
					oRm.attr('title', oDayType.tooltip);
				}
			}
		});


		//oMonth.getDate() is a public date object, so it is always considered local timezones.
		if (((oMonth.getParent() && oMonth.getParent().getMetadata().getName() === "sap.ui.unified.CalendarOneMonthInterval")
			|| (oMonth.getMetadata().getName() === "sap.ui.unified.calendar.OneMonthDatesRow"))
			&& oMonth.getStartDate() && oDay.getMonth() !== oMonth.getStartDate().getMonth()) {
			oRm.class("sapUiCalItemOtherMonth");
		}

		if (!bEnabled) {
			oRm.class("sapUiCalItemDsbl"); // day disabled
			mAccProps["disabled"] = true;
		}

		if (oHelper.aNonWorkingDays) {
			for (i = 0; i < oHelper.aNonWorkingDays.length; i++) {
				if (iWeekDay === oHelper.aNonWorkingDays[i]) {
					oRm.class("sapUiCalItemWeekEnd");
					break;
				}
			}
		} else if ((iWeekDay >= oHelper.iWeekendStart && iWeekDay <= oHelper.iWeekendEnd) ||
				( oHelper.iWeekendEnd < oHelper.iWeekendStart && ( iWeekDay >= oHelper.iWeekendStart || iWeekDay <= oHelper.iWeekendEnd))) {
			oRm.class("sapUiCalItemWeekEnd");
		}

		oRm.attr("tabindex", "-1");
		oRm.attr("data-sap-day", sYyyymmdd);
		if (bDayName) {
			mAccProps["label"] = mAccProps["label"] + oHelper.aWeekDaysWide[iWeekDay] + " ";
		}
		mAccProps["label"] = mAccProps["label"] + oHelper.oFormatLong.format(oDay.toUTCJSDate(), true);

		if (sAriaType !== "") {
			CalendarLegendRenderer.addCalendarTypeAccInfo(mAccProps, sAriaType, oHelper.oLegend);
		}

		if (oHelper.sSecondaryCalendarType) {
			mAccProps["label"] = mAccProps["label"] + " " + oMonth._oFormatSecondaryLong.format(oSecondaryDay.toUTCJSDate(), true);
		}

		oRm.accessibilityState(null, mAccProps);
		oRm.openEnd(); // div element

		if (aDayTypes[0]){ //if there's a special date, render it
			oRm.openStart("div");
			oRm.class("sapUiCalSpecialDate");
			if (aDayTypes[0].color) { // if there's a custom color, render it

				oRm.style("background-color", aDayTypes[0].color);
			}
			oRm.openEnd(); // div
			oRm.close("div");
		}

		oRm.openStart("span");
		oRm.class("sapUiCalItemText");
		if (!!aDayTypes[0] && aDayTypes[0].color) {
			oRm.class("sapUiCalItemTextCustomColor");
		}
		oRm.openEnd(); // span

		// Date text for days before 0001.01.01 should not be visible.
		if (!bBeforeFirstYear) {
			oRm.text(oDay.getDate());
		}
		oRm.close("span");

		if (bWeekNum && iWeekDay === oHelper.iFirstDayOfWeek) {
			// add week number - inside first day of the week to allow better position and make it easier for ItemNavigation
			oRm.openStart("span", oHelper.sId + "-WNum-" +  iWeekNumber);
			oRm.class("sapUiCalWeekNum");
			oRm.accessibilityState(null, {role: "rowheader", desribedby: oHelper.sId + "-CW"});
			oRm.openEnd(); // span
			oRm.text(iWeekNumber);
			oRm.close("span");
		}

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

	return MonthRenderer;

}, /* bExport= */ true);