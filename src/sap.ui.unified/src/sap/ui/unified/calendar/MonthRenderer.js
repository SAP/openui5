/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/calendar/CalendarUtils', 'sap/ui/unified/calendar/CalendarDate', 'sap/ui/unified/CalendarLegend', 'sap/ui/unified/CalendarLegendRenderer',
	'sap/ui/core/library', 'sap/ui/unified/library', "sap/base/Log", 'sap/ui/core/InvisibleText', "sap/ui/core/format/DateFormat", "sap/ui/core/Locale"],
	function(CalendarUtils, CalendarDate, CalendarLegend, CalendarLegendRenderer, coreLibrary, library, Log, InvisibleText, DateFormat, Locale) {
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

		oRm.write("<div");
		oRm.writeControlData(oMonth);
		oRm.addClass(this.getClass(oRm, oMonth));
		if (oMonth._getSecondaryCalendarType()) {
			oRm.addClass("sapUiCalMonthSecType");
		}
		oRm.writeClasses();

		this.addWrapperAdditionalStyles(oRm, oMonth);

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		if (oMonth._getShowHeader()) {
			oAriaLabel.value = oAriaLabel.value + " " + sId + "-Head";
		}

		if (sWidth) {
			oRm.addStyle("width", sWidth);
			oRm.writeStyles();
		}

		oRm.writeAccessibilityState(oMonth, {
			role: "grid",
			multiselectable: !oMonth.getSingleSelection() || oMonth.getIntervalSelection(),
			labelledby: oAriaLabel,
			describedby: oMonth._bCalendar
				? InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_MONTH_PICKER_OPEN_HINT")
					+ " "
					+ InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_YEAR_PICKER_OPEN_HINT")
				: ""
		});

		oRm.write(">"); // div element

		oRm.write("<span id=\"" + sId + "-Descr\" style=\"display: none;\">" + rb.getText("CALENDAR_DIALOG") + "</span>");

		if (oMonth.getIntervalSelection()) {
			oRm.write("<span id=\"" + sId + "-Start\" style=\"display: none;\">" + rb.getText("CALENDAR_START_DATE") + "</span>");
			oRm.write("<span id=\"" + sId + "-End\" style=\"display: none;\">" + rb.getText("CALENDAR_END_DATE") + "</span>");
		}

		this.renderMonth(oRm, oMonth, oDate);

		oRm.write("</div>");

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

		var sClasses = "sapUiCalMonthView",
			sCalendarType = oMonth.getPrimaryCalendarType(),
			bShowWeekNumbers = oMonth.getShowWeekNumbers();

		if (sCalendarType == CalendarType.Islamic || !bShowWeekNumbers) {
			// on Islamic calendar week numbers are not used
			sClasses = sClasses + " sapUiCalNoWeekNum";
		}

		return sClasses;

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
		oRm.write("<div id=\"" + sId + "-days\" class=\"sapUiCalItems\" role=\"row\">"); // extra DIV around the days to allow rerendering only it's content
		this.renderDays(oRm, oMonth, oDate);
		oRm.write("</div>");

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

		oRm.write("<div");
		oRm.writeAttribute("id", sId + "-CW");
		oRm.addStyle("display", "none");
		oRm.writeStyles();
		oRm.writeAccessibilityState(null, {role: "columnheader"});
		oRm.write(">"); // div
		oRm.write(rb.getText("CALENDAR_WEEK"));
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAccessibilityState(null, {role: "row"});
		oRm.addStyle("overflow", "hidden");
		oRm.writeStyles();
		oRm.write(">"); // div

		this.renderDayNames(oRm, oMonth, oLocaleData, iFirstDayOfWeek, 7, true, undefined);

		oRm.write("</div>");

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
			oRm.write("<div id=\"" + sId + "-Head\"class=\"sapUiCalHeadText\" >");
			oRm.write(aMonthNames[oDate.getMonth()]);
			oRm.write("</div>");
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
			oRm.write("<div");
			oRm.addClass("sapUiCalWH");
			if (bDayNumberAsId) {
				// month mode -> use the day number as ID
				sDayId = sId + "-WH" + ((i + iFirstDayOfWeek) % 7);
			} else {
				// just use counter as ID
				sDayId = sId + "-WH" + i;
			}
			oRm.writeAttribute("id", sDayId );
			if (i == 0) {
				oRm.addClass("sapUiCalFirstWDay");
			}
			if (sWidth) {
				oRm.addStyle("width", sWidth);
			}
			oRm.writeAccessibilityState(null, {
				role: "columnheader",
				label: aWeekDaysWide[(i + iStartDay) % 7],
				hidden: true
			});
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">"); // div element
			oRm.write(aWeekDays[(i + iStartDay) % 7]);
			oRm.write("</div>");
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
			sAriaType = "",
			oLegend = oHelper.oLegend;

		var sYyyymmdd = oMonth._oFormatYyyymmdd.format(oDay.toUTCJSDate(), true);
		var iWeekDay = oDay.getDay();
		var iSelected = oMonth._checkDateSelected(oDay);
		var aDayTypes = oMonth._getDateTypes(oDay);
		var bEnabled = oMonth._checkDateEnabled(oDay);
		var i = 0;
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		var sNonWorkingDayText = rb.getText("LEGEND_NON_WORKING_DAY");
		var aTooltipTexts = [];

		// Days before 0001.01.01 should be disabled.
		if (bBeforeFirstYear) {
			bEnabled = false;
		}

		var iWeekNumber = 0;
		if (bWeekNum) {
			iWeekNumber = oMonth._calculateWeekNumber(oDay);
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

		oRm.write("<div");
		oRm.writeAttribute("id", oHelper.sId + "-" + sYyyymmdd);
		oRm.addClass("sapUiCalItem");
		oRm.addClass("sapUiCalWDay" + iWeekDay);
		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}
		if (iWeekDay == oHelper.iFirstDayOfWeek) {
			oRm.addClass("sapUiCalFirstWDay");
		}
		if (bOtherMonth && oHelper.iMonth != oDay.getMonth()) {
			oRm.addClass("sapUiCalItemOtherMonth");
			mAccProps["disabled"] = true;
		}
		if (oDay.isSame(oHelper.oToday)) {
			oRm.addClass("sapUiCalItemNow");
			aTooltipTexts.push(rb.getText("LEGEND_TODAY"));
		}

		if (iSelected > 0) {
			oRm.addClass("sapUiCalItemSel"); // day selected
			mAccProps["selected"] = true;
		} else {
			mAccProps["selected"] = false;
		}
		if (iSelected == 2) {
			oRm.addClass("sapUiCalItemSelStart"); // interval start
			mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-Start";
		} else if (iSelected == 3) {
			oRm.addClass("sapUiCalItemSelEnd"); // interval end
			mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-End";
		} else if (iSelected == 4) {
			oRm.addClass("sapUiCalItemSelBetween"); // interval between
		} else if (iSelected == 5) {
			oRm.addClass("sapUiCalItemSelStart"); // interval start
			oRm.addClass("sapUiCalItemSelEnd"); // interval end
			mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-Start";
			mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-End";
		}

		aDayTypes.forEach(function(oDayType) {
			if (oDayType.type != CalendarDayType.None) {
				if (oDayType.type === CalendarDayType.NonWorking) {
					aTooltipTexts.push(sNonWorkingDayText);
					oRm.addClass("sapUiCalItemWeekEnd");
					return;
				}
				oRm.addClass("sapUiCalItem" + oDayType.type);
				sAriaType = oDayType.type;
				if (oDayType.tooltip) {
					aTooltipTexts.push(oDayType.tooltip);
				}
			}
		});

		if (oHelper.aNonWorkingDays) { // check if there are nonWorkingDays passed and add text to them
			oHelper.aNonWorkingDays.forEach(function (iNonWorkingDay) {
				if (oDay.getDay() === iNonWorkingDay) {
					aTooltipTexts.push(sNonWorkingDayText);
				}
			});
		} else if ((oDay.getDay() === oHelper.iWeekendStart || oDay.getDay() === oHelper.iWeekendEnd)) { // otherwise add the text to the NonWorkigDays from the locale
			aTooltipTexts.push(sNonWorkingDayText);
		}

		if (aTooltipTexts.length) {
			var aTooltips = aTooltipTexts.filter(function(sText, iPos) {
				return aTooltipTexts.indexOf(sText) === iPos;
			});
			oRm.writeAttributeEscaped('title', aTooltips.join(" "));
		}

		//oMonth.getDate() is a public date object, so it is always considered local timezones.
		if (((oMonth.getParent() && oMonth.getParent().getMetadata().getName() === "sap.ui.unified.CalendarOneMonthInterval")
			|| (oMonth.getMetadata().getName() === "sap.ui.unified.calendar.OneMonthDatesRow"))
			&& oMonth.getStartDate() && oDay.getMonth() !== oMonth.getStartDate().getMonth()) {
			oRm.addClass("sapUiCalItemOtherMonth");
		}

		if (!bEnabled) {
			oRm.addClass("sapUiCalItemDsbl"); // day disabled
			mAccProps["disabled"] = true;
		}

		if (oHelper.aNonWorkingDays) {
			for (i = 0; i < oHelper.aNonWorkingDays.length; i++) {
				if (iWeekDay == oHelper.aNonWorkingDays[i]) {
					oRm.addClass("sapUiCalItemWeekEnd");
					break;
				}
			}
		} else if ((iWeekDay >= oHelper.iWeekendStart && iWeekDay <= oHelper.iWeekendEnd) ||
				( oHelper.iWeekendEnd < oHelper.iWeekendStart && ( iWeekDay >= oHelper.iWeekendStart || iWeekDay <= oHelper.iWeekendEnd))) {
			oRm.addClass("sapUiCalItemWeekEnd");
		}

		oRm.writeAttribute("tabindex", "-1");
		oRm.writeAttribute("data-sap-day", sYyyymmdd);
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

		oRm.writeAccessibilityState(null, mAccProps);
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		oRm.write("<span");
		oRm.addClass("sapUiCalItemText");
		oRm.writeClasses();
		oRm.write(">"); // span

		// Date text for days before 0001.01.01 should not be visible.
		if (!bBeforeFirstYear) {
			oRm.write(oDay.getDate());
		}
		oRm.write("</span>");

		if (bWeekNum && iWeekDay == oHelper.iFirstDayOfWeek) {
			// add week number - inside first day of the week to allow better position and make it easier for ItemNavigation
			oRm.write("<span");
			oRm.writeAttribute("id", oHelper.sId + "-WNum-" +  iWeekNumber);
			oRm.addClass("sapUiCalWeekNum");
			oRm.writeClasses();
			oRm.writeAccessibilityState(null, {role: "rowheader", desribedby: oHelper.sId + "-CW"});
			oRm.write(">"); // span
			oRm.write(iWeekNumber);
			oRm.write("</span>");
		}

		if (bDayName) {
			oRm.write("<span");
			oRm.addClass("sapUiCalDayName");
			oRm.writeClasses();
			oRm.write(">"); // span
			oRm.write(oHelper.aWeekDays[iWeekDay]);
			oRm.write("</span>");
		}

		if (oHelper.sSecondaryCalendarType) {
			oRm.write("<span");
			oRm.addClass("sapUiCalItemSecText");
			oRm.writeClasses();
			oRm.write(">"); // span
			oRm.write(oSecondaryDay.getDate());
			oRm.write("</span>");
		}

		oRm.write("</div>");

	};

	return MonthRenderer;

}, /* bExport= */ true);