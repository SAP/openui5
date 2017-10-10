/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/unified/calendar/CalendarDate',
		'sap/ui/unified/CalendarLegendRenderer', 'sap/ui/unified/library'],
	function (jQuery, CalendarUtils, CalendarDate, CalendarLegendRenderer, library) {
		"use strict";


	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;


	/**
	 * Month renderer.
	 * @namespace
	 */
	var MonthsRowRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthsRow} oMonthsRow An object representation of the control that should be rendered
	 */
	MonthsRowRenderer.render = function(oRm, oMonthsRow){

		var oDate = oMonthsRow._getStartDate();
		var sTooltip = oMonthsRow.getTooltip_AsString();
		var sId = oMonthsRow.getId();
		var oAriaLabel = {value: sId + "-Descr", append: true};

		oRm.write("<div");
		oRm.writeControlData(oMonthsRow);
		oRm.addClass("sapUiCalMonthsRow");
		oRm.addClass("sapUiCalRow");
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		if (oMonthsRow._getShowHeader()) {
			oAriaLabel.value = oAriaLabel.value + " " + sId + "-Head";
		}

		oRm.writeAccessibilityState(oMonthsRow, {
			role: "grid",
			readonly: "true",
			multiselectable: !oMonthsRow.getSingleSelection() || oMonthsRow.getIntervalSelection(),
			labelledby: oAriaLabel
		});

		oRm.write(">"); // div element

		oRm.write("<span id=\"" + sId + "-Descr\" style=\"display: none;\">" + oMonthsRow._rb.getText("CALENDAR_DIALOG") + "</span>");

		if (oMonthsRow.getIntervalSelection()) {
			oRm.write("<span id=\"" + sId + "-Start\" style=\"display: none;\">" + oMonthsRow._rb.getText("CALENDAR_START_MONTH") + "</span>");
			oRm.write("<span id=\"" + sId + "-End\" style=\"display: none;\">" + oMonthsRow._rb.getText("CALENDAR_END_MONTH") + "</span>");
		}

		this.renderRow(oRm, oMonthsRow, oDate);

		oRm.write("</div>");

	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthsRow} oMonthsRow An object representation of the control that should be rendered
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The first date of the month
	 */
	MonthsRowRenderer.renderRow = function(oRm, oMonthsRow, oDate){

		var sId = oMonthsRow.getId();

		// header line
		this.renderHeader(oRm, oMonthsRow, oDate);

		// months
		oRm.write("<div id=\"" + sId + "-months\" class=\"sapUiCalItems\">"); // extra DIV around the months to allow rerendering only it's content
		this.renderMonths(oRm, oMonthsRow, oDate);
		oRm.write("</div>");

	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthsRow} oMonthsRow An object representation of the control that should be rendered
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The first date of the month
	 */
	MonthsRowRenderer.renderHeader = function(oRm, oMonthsRow, oDate){
		CalendarUtils._checkCalendarDate(oDate);

		// header
		if (oMonthsRow._getShowHeader()) {
			var oLocaleData = oMonthsRow._getLocaleData();
			var sId = oMonthsRow.getId();

			oRm.write("<div id=\"" + sId + "-Head\">");
			this.renderHeaderLine(oRm, oMonthsRow, oLocaleData, oDate);
			oRm.write("</div>");
		}

	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthsRow} oMonthsRow An object representation of the control that should be rendered
	 * @param {sap.ui.core.LocaleData} oLocalDate
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The first date of the month
	 */
	MonthsRowRenderer.renderHeaderLine = function(oRm, oMonthsRow, oLocaleData, oDate){
		CalendarUtils._checkCalendarDate(oDate);

		var sId = oMonthsRow.getId();
		var iMonths = oMonthsRow.getMonths();
		var oMonthDate = new CalendarDate(oDate);
		var sWidth = "";
		var iYear = 0;
		var aYearMonths = [];
		var i = 0;

		for (i = 0; i < iMonths; i++) {
			iYear = oMonthDate.getYear();
			if (aYearMonths.length > 0 && aYearMonths[aYearMonths.length - 1].iYear == iYear) {
				aYearMonths[aYearMonths.length - 1].iMonths++;
			}else {
				aYearMonths.push({iYear: iYear, iMonths: 1});
			}
			oMonthDate.setMonth(oMonthDate.getMonth() + 1);
		}

		for (i = 0; i < aYearMonths.length; i++) {
			var oYearMonths = aYearMonths[i];
			sWidth = ( 100 / iMonths * oYearMonths.iMonths) + "%";
			oRm.write("<div id=\"" + sId + "-Head" + i + "\"class=\"sapUiCalHeadText\" style=\"width:" + sWidth + "\">");
			oRm.write(oYearMonths.iYear);
			oRm.write("</div>");
		}

	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthsRow} oMonthsRow An object representation of the control that should be rendered
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The first date of the month
	 */
	MonthsRowRenderer.renderMonths = function(oRm, oMonthsRow, oDate){

		var oHelper = this.getHelper(oMonthsRow, oDate);
		var iMonths = oMonthsRow.getMonths();
		var sWidth = ( 100 / iMonths ) + "%";
		var oMonthDate = new CalendarDate(oDate);
		oMonthDate.setDate(1);

		for (var i = 0; i < iMonths; i++) {
			this.renderMonth(oRm, oMonthsRow, oMonthDate, oHelper, sWidth);
			oMonthDate.setMonth(oMonthDate.getMonth() + 1);
		}

	};

	/**
	 * @param {sap.ui.unified.calendar.MonthsRow} oMonthsRow An object representation of the control that should be rendered
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The first date of the month
	 * @returns {Object} A helper object, containing months props
	 */
	MonthsRowRenderer.getHelper = function(oMonthsRow, oDate){
		CalendarUtils._checkCalendarDate(oDate);

		var oHelper = {};

		oHelper.sLocale = oMonthsRow._getLocale();
		oHelper.oLocaleData = oMonthsRow._getLocaleData();
		oHelper.oToday = new CalendarDate();
		oHelper.sCurrentMonth = oMonthsRow._rb.getText("CALENDAR_CURRENT_MONTH");
		oHelper.sId = oMonthsRow.getId();
		oHelper.oFormatLong = oMonthsRow._getFormatLong();
		if (oMonthsRow._bLongMonth || !oMonthsRow._bNamesLengthChecked) {
			oHelper.aMonthNames = oHelper.oLocaleData.getMonthsStandAlone("wide");
		} else {
			oHelper.aMonthNames = oHelper.oLocaleData.getMonthsStandAlone("abbreviated");
			oHelper.aMonthNamesWide = oHelper.oLocaleData.getMonthsStandAlone("wide");
		}


		var sLegendId = oMonthsRow.getLegend();
		if (sLegendId) {
			var oLegend = sap.ui.getCore().byId(sLegendId);
			if (oLegend) {
				if (!(oLegend instanceof sap.ui.unified.CalendarLegend)) {
					throw new Error(oLegend + " is not an sap.ui.unified.CalendarLegend. " + oMonthsRow);
				}
				oHelper.oLegend = oLegend;
			} else {
				jQuery.sap.log.warning("CalendarLegend " + sLegendId + " does not exist!", oMonthsRow);
			}
		}

		return oHelper;

	};

	/**
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthsRow} oMonthsRow An object representation of the control that should be rendered
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The first date of the month
	 * @param {Object} oHelper A helper object, containing months props
	 * @param {string} sWidth The width of the month
	 */
	MonthsRowRenderer.renderMonth = function(oRm, oMonthsRow, oDate, oHelper, sWidth){
		CalendarUtils._checkCalendarDate(oDate);

		var mAccProps = {
				role: "gridcell",
				selected: false,
				label: "",
				describedby: ""
			};

		if (!oMonthsRow._bLongMonth && oMonthsRow._bNamesLengthChecked) {
			mAccProps["label"] = oHelper.aMonthNamesWide[oDate.getMonth()];
		}

		var sYyyymm = oMonthsRow._oFormatYyyymm.format(oDate.toUTCJSDate(), true);
		var iSelected = oMonthsRow._checkDateSelected(oDate);
		var oType = oMonthsRow._getDateType(oDate);
		var bEnabled = oMonthsRow._checkMonthEnabled(oDate);

		oRm.write("<div");
		oRm.writeAttribute("id", oHelper.sId + "-" + sYyyymm);
		oRm.addClass("sapUiCalItem");
		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}

		if (CalendarUtils._isSameMonthAndYear(oDate, oHelper.oToday)) {
			oRm.addClass("sapUiCalItemNow");
			mAccProps["label"] = oHelper.sCurrentMonth + " ";
		}

		if (iSelected > 0) {
			oRm.addClass("sapUiCalItemSel"); // day selected
			mAccProps["selected"] = true;
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

		if (oType && oType.type != CalendarDayType.None) {
			oRm.addClass("sapUiCalItem" + oType.type);
			if (oType.tooltip) {
				oRm.writeAttributeEscaped('title', oType.tooltip);
			}
		}

		if (!bEnabled) {
			oRm.addClass("sapUiCalItemDsbl"); // month disabled
			mAccProps["disabled"] = true;
		}

		oRm.writeAttribute("tabindex", "-1");
		oRm.writeAttribute("data-sap-month", sYyyymm);
		mAccProps["label"] = mAccProps["label"] + oHelper.oFormatLong.format(oDate.toUTCJSDate(), true);

		if (oType && oType.type != CalendarDayType.None) {
			CalendarLegendRenderer.addCalendarTypeAccInfo(mAccProps, oType.type, oHelper.oLegend);
		}

		oRm.writeAccessibilityState(null, mAccProps);
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		oRm.write("<span");
		oRm.addClass("sapUiCalItemText");
		oRm.writeClasses();
		oRm.write(">"); // span
		oRm.write(oHelper.aMonthNames[oDate.getMonth()]);
		oRm.write("</span>");

		oRm.write("</div>");

	};

	return MonthsRowRenderer;

}, /* bExport= */ true);
