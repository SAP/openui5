/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/calendar/CalendarUtils', 'sap/ui/core/date/UniversalDate', 'sap/ui/unified/CalendarLegendRenderer',
		'sap/ui/unified/library', "sap/base/Log"],
	function(CalendarUtils, UniversalDate, CalendarLegendRenderer, library, Log) {
		"use strict";


	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;


	/**
	 * Month renderer.
	 * @namespace
	 */
	var TimesRowRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.TimesRow} oTimesRow An object representation of the control that should be rendered
	 */
	TimesRowRenderer.render = function(oRm, oTimesRow){

		var oDate = oTimesRow._getStartDate();
		var sTooltip = oTimesRow.getTooltip_AsString();
		var sId = oTimesRow.getId();
		var oAriaLabel = {value: sId + "-Descr", append: true};

		oRm.openStart("div", oTimesRow);
		oRm.class("sapUiCalTimesRow");
		oRm.class("sapUiCalRow");

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (oTimesRow._getShowHeader()) {
			oAriaLabel.value = oAriaLabel.value + " " + sId + "-Head";
		}

		oRm.accessibilityState(oTimesRow, {
			role: "grid",
			readonly: "true",
			multiselectable: !oTimesRow.getSingleSelection() || oTimesRow.getIntervalSelection(),
			labelledby: oAriaLabel
		});

		oRm.openEnd(); // div element
		oRm.openStart("span", sId + "-Descr");
		oRm.style("display", "none");
		oRm.openEnd();
		oRm.text(oTimesRow._rb.getText("CALENDAR_DIALOG"));
		oRm.close("span");

		if (oTimesRow.getIntervalSelection()) {
			oRm.openStart("span", sId + "-Start");
			oRm.style("display", "none");
			oRm.openEnd();
			oRm.text(oTimesRow._rb.getText("CALENDAR_START_TIME"));
			oRm.close("span");
			oRm.openStart("span", sId + "-End");
			oRm.style("display", "none");
			oRm.openEnd();
			oRm.text(oTimesRow._rb.getText("CALENDAR_END_TIME"));
			oRm.close("span");
		}

		this.renderRow(oRm, oTimesRow, oDate);

		oRm.close("div");
	};

	TimesRowRenderer.renderRow = function(oRm, oTimesRow, oDate){

		var sId = oTimesRow.getId();

		// header line
		this.renderHeader(oRm, oTimesRow, oDate);

		// time items
		oRm.openStart("div", sId + "-times"); // extra DIV around the times to allow rerendering only it's content
		oRm.class("sapUiCalItems");
		oRm.attr("role", "row");
		oRm.openEnd();
		this.renderTimes(oRm, oTimesRow, oDate);
		oRm.close("div");
	};

	TimesRowRenderer.renderHeader = function(oRm, oTimesRow, oDate){

		// header
		if (oTimesRow._getShowHeader()) {
			var oLocaleData = oTimesRow._getLocaleData();
			var sId = oTimesRow.getId();

			oRm.openStart("div", sId + "-Head");
			oRm.openEnd();
			this.renderHeaderLine(oRm, oTimesRow, oLocaleData, oDate);
			oRm.close("div");
		}

	};

	TimesRowRenderer.renderHeaderLine = function(oRm, oTimesRow, oLocaleData, oDate){

		var oFormatDate = oTimesRow._getFormatDate();
		var sId = oTimesRow.getId();
		var iItems = oTimesRow.getItems();
		var oItemDate = oTimesRow._getIntervalStart(oDate);
		var iMinutes = oTimesRow.getIntervalMinutes();
		var sWidth = "";
		var sDay = 0;
		var aDayIntervals = [];
		var i = 0;

		for (i = 0; i < iItems; i++) {
			sDay = oFormatDate.format(oItemDate, true);
			if (aDayIntervals.length > 0 && aDayIntervals[aDayIntervals.length - 1].sDay == sDay) {
				aDayIntervals[aDayIntervals.length - 1].iItems++;
			}else {
				aDayIntervals.push({sDay: sDay, iItems: 1});
			}
			oItemDate.setUTCMinutes(oItemDate.getUTCMinutes() + iMinutes);
		}

		for (i = 0; i < aDayIntervals.length; i++) {
			var oDayInterval = aDayIntervals[i];
			sWidth = ( 100 / iItems * oDayInterval.iItems) + "%";
			oRm.openStart("div", sId + "-Head" + i);
			oRm.class("sapUiCalHeadText");
			oRm.style("width", sWidth);
			oRm.openEnd();
			oRm.text(oDayInterval.sDay);
			oRm.close("div");
		}

	};

	TimesRowRenderer.renderTimes = function(oRm, oTimesRow, oDate){

		var oHelper = this.getHelper(oTimesRow, oDate);
		var iItems = oTimesRow.getItems();
		var sWidth = ( 100 / iItems ) + "%";
		var oItemDate = oTimesRow._getIntervalStart(oDate);
		var sOldAmPm = "";
		var sAmPm = "";

		for (var i = 0; i < iItems; i++) {
			if (oHelper.oFormatTimeAmPm) {
				sAmPm = oHelper.oFormatTimeAmPm.format(oItemDate, true);
				if (sOldAmPm == sAmPm) {
					sAmPm = "";
				} else {
					sOldAmPm = sAmPm;
				}
			}
			this.renderTime(oRm, oTimesRow, oItemDate, oHelper, sWidth, sAmPm);
			oItemDate.setUTCMinutes(oItemDate.getUTCMinutes() + oHelper.iMinutes);
		}

	};

	TimesRowRenderer.getHelper = function(oTimesRow, oDate){

		var oHelper = {};

		oHelper.sLocale = oTimesRow._getLocale();
		oHelper.oLocaleData = oTimesRow._getLocaleData();
		oHelper.oNow = CalendarUtils._createUniversalUTCDate(new Date(), undefined, true);
		oHelper.sCurrentTime = oTimesRow._rb.getText("CALENDAR_CURRENT_TIME");
		oHelper.sId = oTimesRow.getId();
		oHelper.oFormatLong = oTimesRow._getFormatLong();
		oHelper.oFormatTime = oTimesRow._getFormatTime();
		oHelper.oFormatTimeAmPm = oTimesRow._oFormatTimeAmPm;
		oHelper.iMinutes = oTimesRow.getIntervalMinutes();

		var sLegendId = oTimesRow.getLegend();
		if (sLegendId) {
			var oLegend = sap.ui.getCore().byId(sLegendId);
			if (oLegend) {
				if (!(oLegend instanceof sap.ui.unified.CalendarLegend)) {
					throw new Error(oLegend + " is not an sap.ui.unified.CalendarLegend. " + oTimesRow);
				}
				oHelper.oLegend = oLegend;
			} else {
				Log.warning("CalendarLegend " + sLegendId + " does not exist!", oTimesRow);
			}
		}

		return oHelper;

	};

	TimesRowRenderer.renderTime = function(oRm, oTimesRow, oDate, oHelper, sWidth, sAmPm){
		var sRole = oTimesRow._getAriaRole();
		var mAccProps = {
				role: sRole,
				// aria-selected isn't valid for role="button"
				selected: sRole !== "gridcell" ? null : false,
				label: "",
				describedby: ""
			};

		var sYyyyMMddHHmm = oTimesRow._oFormatYyyyMMddHHmm.format(oDate.getJSDate(), true);
		var iSelected = oTimesRow._checkDateSelected(oDate);
		var oType = oTimesRow._getDateType(oDate);
		var bEnabled = oTimesRow._checkTimeEnabled(oDate);

		oRm.openStart("div", oHelper.sId + "-" + sYyyyMMddHHmm);
		oRm.class("sapUiCalItem");
		if (sWidth) {
			oRm.style("width", sWidth);
		}

		var oNextInterval = new UniversalDate(oDate.getTime());
		oNextInterval.setUTCMinutes(oNextInterval.getUTCMinutes() + oHelper.iMinutes);

		if (oDate.getTime() <= oHelper.oNow.getTime() && oNextInterval.getTime() > oHelper.oNow.getTime()) {
			oRm.class("sapUiCalItemNow");
			mAccProps["label"] = oHelper.sCurrentTime + " ";
		}

		if (iSelected > 0) {
			oRm.class("sapUiCalItemSel"); // time selected

			if (sRole === "gridcell") {
				// aria-selected isn't valid for role="button"
				mAccProps["selected"] = true;
			}
		}
		if (iSelected == 2) {
			oRm.class("sapUiCalItemSelStart"); // interval start
			mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-Start";
		} else if (iSelected == 3) {
			oRm.class("sapUiCalItemSelEnd"); // interval end
			mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-End";
		} else if (iSelected == 4) {
			oRm.class("sapUiCalItemSelBetween"); // interval between
		} else if (iSelected == 5) {
			oRm.class("sapUiCalItemSelStart"); // interval start
			oRm.class("sapUiCalItemSelEnd"); // interval end
			mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-Start";
			mAccProps["describedby"] = mAccProps["describedby"] + " " + oHelper.sId + "-End";
		}

		if (oType && oType.type != CalendarDayType.None) {
			oRm.class("sapUiCalItem" + oType.type);
			if (oType.tooltip) {
				oRm.attr('title', oType.tooltip);
			}
		}

		if (!bEnabled) {
			oRm.class("sapUiCalItemDsbl"); // time disabled
			mAccProps["disabled"] = true;
		}

		oRm.attr("tabindex", "-1");
		oRm.attr("data-sap-time", sYyyyMMddHHmm);
		mAccProps["label"] = mAccProps["label"] + oHelper.oFormatLong.format(oDate, true);

		if (oType && oType.type != CalendarDayType.None) {
			CalendarLegendRenderer.addCalendarTypeAccInfo(mAccProps, oType.type, oHelper.oLegend);
		}

		oRm.accessibilityState(null, mAccProps);
		oRm.openEnd();
		oRm.openStart("span");
		oRm.class("sapUiCalItemText");
		oRm.openEnd();
		oRm.text(oHelper.oFormatTime.format(oDate, true));
		if (sAmPm) {
			oRm.openStart("span");
			oRm.class("sapUiCalItemTextAmPm");
			oRm.openEnd();
			oRm.text(sAmPm);
			oRm.close("span");
		}
		oRm.close("span");
		oRm.close("div");

	};

	return TimesRowRenderer;

}, /* bExport= */ true);