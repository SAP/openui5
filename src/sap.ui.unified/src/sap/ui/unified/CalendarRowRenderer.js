/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/date/UniversalDate', 'sap/ui/unified/CalendarAppointment', 'sap/ui/unified/CalendarLegendRenderer',
		'sap/ui/Device', 'sap/ui/unified/library', 'sap/ui/core/InvisibleText', "sap/base/Log"],
	function (UniversalDate, CalendarAppointment, CalendarLegendRenderer, Device, library, InvisibleText, Log) {
		"use strict";


	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;

	// shortcut for sap.ui.unified.CalendarIntervalType
	var CalendarIntervalType = library.CalendarIntervalType;

	// shortcut for sap.ui.unified.CalendarAppointmentVisualization
	var CalendarAppointmentVisualization = library.CalendarAppointmentVisualization;


	/**
	 * CalendarRow renderer.
	 * @namespace
	 */
	var CalendarRowRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarRow} oRow an object representation of the control that should be rendered
	 */
	CalendarRowRenderer.render = function(oRm, oRow){
		var sTooltip = oRow.getTooltip_AsString();
		var sVisualisation = oRow.getAppointmentsVisualization();

		var aTypes = this.getLegendItems(oRow);

		oRm.openStart("div", oRow);
		oRm.class("sapUiCalendarRow");

		if (!Device.system.phone && oRow.getAppointmentsReducedHeight()) {
			oRm.class("sapUiCalendarRowAppsRedHeight");
		}

		if (sVisualisation != CalendarAppointmentVisualization.Standard) {
			oRm.class("sapUiCalendarRowVis" + sVisualisation);
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		var sWidth = oRow.getWidth();
		if (sWidth) {
			oRm.style("width", sWidth);
		}

		var sHeight = oRow.getHeight();
		if (sHeight) {
			oRm.style("height", sHeight);
		}

	//		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		oRm.accessibilityState(oRow/*, mAccProps*/);
		oRm.openEnd(); // div element

		this.renderAppointmentsRow(oRm, oRow, aTypes);

		oRm.close("div");
	};

	CalendarRowRenderer.renderAppointmentsRow = function(oRm, oRow, aTypes){

		var sId = oRow.getId();
		oRm.openStart("div", sId + "-Apps");
		oRm.class("sapUiCalendarRowApps");
		oRm.openEnd();

		this.renderBeforeAppointments(oRm, oRow);
		this.renderAppointments(oRm, oRow, aTypes);
		this.renderAfterAppointments(oRm, oRow);

		oRm.close("div");

	};

	/**
	 * This hook method is reserved for derived classes to render more handles.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.unified.CalendarRow} oRow An object representation of the control that should be rendered.
	 */
	CalendarRowRenderer.renderBeforeAppointments = function(oRm, oRow) {
	};

	/**
	 * This hook method is reserved for derived classes to render more handles.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.unified.CalendarRow} oRow An object representation of the control that should be rendered.
	 */
	CalendarRowRenderer.renderAfterAppointments = function(oRm, oRow) {
	};

	/**
	 * This hook method is reserved for derived classes to render resize handles in the appointment.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.unified.CalendarRow} oRow An object representation of the control that should be rendered.
	 * @param {sap.ui.unified.CalendarAppointment} oAppointment An object representation of the control that should be rendered.
	 */
	CalendarRowRenderer.renderResizeHandle = function (oRm, oRow, oAppointment) {
	};

	CalendarRowRenderer.renderAppointments = function(oRm, oRow, aTypes){

		var aAppointments = oRow._getVisibleAppointments();
		var aIntervalHeaders = oRow._getVisibleIntervalHeaders();
		var oStartDate = oRow._getStartDate();
		var aNonWorkingItems = [];
		var iStartOffset = 0;
		var iNonWorkingMax = 0;
		var aNonWorkingSubItems = [];
		var iSubStartOffset = 0;
		var iNonWorkingSubMax = 0;
		var iIntervals = oRow.getIntervals();
		var sIntervalType = oRow.getIntervalType();
		var iWidth = 100 / iIntervals;
		var i = 0;
		var oIntervalNextStartDate = new UniversalDate(oStartDate);
		var bFirstOfType = false;
		var bLastOfType = false;

		switch (sIntervalType) {
			case CalendarIntervalType.Hour:
				aNonWorkingItems = oRow.getNonWorkingHours() || [];
				iStartOffset = oStartDate.getUTCHours();
				iNonWorkingMax = 24;
				break;

			case CalendarIntervalType.Day:
			case CalendarIntervalType.Week:
			case CalendarIntervalType.OneMonth:
				aNonWorkingItems = oRow._getNonWorkingDays();
				iStartOffset = oStartDate.getUTCDay();
				iNonWorkingMax = 7;
				aNonWorkingSubItems = oRow.getNonWorkingHours() || [];
				iSubStartOffset = oStartDate.getUTCHours();
				iNonWorkingSubMax = 24;
				break;

			case CalendarIntervalType.Month:
				aNonWorkingSubItems = oRow._getNonWorkingDays();
				iSubStartOffset = oStartDate.getUTCDay();
				iNonWorkingSubMax = 7;
				break;

			default:
				break;
		}

		if (oRow._isOneMonthsRowOnSmallSizes()) {
			this.renderSingleDayInterval(oRm, oRow, aAppointments, aTypes, aIntervalHeaders, aNonWorkingItems, iStartOffset, iNonWorkingMax, aNonWorkingSubItems, iSubStartOffset, iNonWorkingSubMax, true, true);
		} else {
			for (i = 0; i < iIntervals; i++) {
				if (bLastOfType) {
					bFirstOfType = true;
				} else {
					bFirstOfType = false;
				}
				bLastOfType = false;

				switch (sIntervalType) {
					case CalendarIntervalType.Hour:
						oIntervalNextStartDate.setUTCHours(oIntervalNextStartDate.getUTCHours() + 1);
						if (oIntervalNextStartDate.getUTCHours() == 0) {
							bLastOfType = true;
						}
						break;

					case CalendarIntervalType.Day:
					case CalendarIntervalType.Week:
					case CalendarIntervalType.OneMonth:
						oIntervalNextStartDate.setUTCDate(oIntervalNextStartDate.getUTCDate() + 1);
						if (oIntervalNextStartDate.getUTCDate() == 1) {
							bLastOfType = true;
						}
						break;

					case CalendarIntervalType.Month:
						oIntervalNextStartDate.setUTCMonth(oIntervalNextStartDate.getUTCMonth() + 1);
						if (oIntervalNextStartDate.getUTCMonth() == 0) {
							bLastOfType = true;
						}
						break;

					default:
						break;
				}

				this.renderInterval(oRm, oRow, i, iWidth, aIntervalHeaders, aNonWorkingItems, iStartOffset, iNonWorkingMax, aNonWorkingSubItems, iSubStartOffset, iNonWorkingSubMax, bFirstOfType, bLastOfType);
			}

			this.renderIntervalHeaders(oRm, oRow, iWidth, aIntervalHeaders, iIntervals);

			oRm.openStart("div", oRow.getId() + "-Now");
			oRm.class("sapUiCalendarRowNow");
			oRm.openEnd();
			oRm.close("div");

			for (i = 0; i < aAppointments.length; i++) {
				var oAppointmentInfo = aAppointments[i];

				this.renderAppointment(oRm, oRow, oAppointmentInfo, aTypes);
			}

			// render dummy appointment for size calculation
			oRm.openStart("div", oRow.getId() + "-DummyApp");
			oRm.class("sapUiCalendarApp");
			oRm.class("sapUiCalendarAppTitleOnly");
			oRm.class("sapUiCalendarAppDummy");
			oRm.openEnd();
			oRm.close("div");
		}
	};

	CalendarRowRenderer.writeCustomAttributes = function (oRm, oRow) {
	};

	CalendarRowRenderer.renderInterval = function(oRm, oRow, iInterval, iWidth,  aIntervalHeaders, aNonWorkingItems, iStartOffset, iNonWorkingMax, aNonWorkingSubItems, iSubStartOffset, iNonWorkingSubMax, bFirstOfType, bLastOfType){

		var sId = oRow.getId() + "-AppsInt" + iInterval;
		var i;
		var bShowIntervalHeaders = oRow.getShowIntervalHeaders() && (oRow.getShowEmptyIntervalHeaders() || aIntervalHeaders.length > 0);
		var iMonth = oRow.getStartDate().getMonth();
		var iDaysLength = new Date(oRow.getStartDate().getFullYear(), iMonth + 1, 0).getDate();

		oRm.openStart("div", sId);
		oRm.class("sapUiCalendarRowAppsInt");
		oRm.style("width", iWidth + "%");

		if (iInterval >= iDaysLength && oRow.getIntervalType() === CalendarIntervalType.OneMonth){
			oRm.class("sapUiCalItemOtherMonth");
		}
		for (i = 0; i < aNonWorkingItems.length; i++) {
			if ((iInterval + iStartOffset) % iNonWorkingMax == aNonWorkingItems[i]) {
				oRm.class("sapUiCalendarRowAppsNoWork");
				break;
			}
		}

		if (!bShowIntervalHeaders) {
			oRm.class("sapUiCalendarRowAppsIntNoHead");
		}

		if (bFirstOfType) {
			oRm.class("sapUiCalendarRowAppsIntFirst");
		}

		if (bLastOfType) {
			oRm.class("sapUiCalendarRowAppsIntLast");
		}

		this.writeCustomAttributes(oRm, oRow);
		oRm.openEnd(); // div element

		if (bShowIntervalHeaders) {
			oRm.openStart("div");
			oRm.class("sapUiCalendarRowAppsIntHead");
			oRm.openEnd();
			oRm.close("div");
		}

		if (oRow.getShowSubIntervals()) {
			var sIntervalType = oRow.getIntervalType();
			var iSubIntervals = 0;

			switch (sIntervalType) {
			case CalendarIntervalType.Hour:
				iSubIntervals = 4;
				break;

			case CalendarIntervalType.Day:
			case CalendarIntervalType.Week:
			case CalendarIntervalType.OneMonth:
				iSubIntervals = 24;
				break;

			case CalendarIntervalType.Month:
				var oStartDate = oRow._getStartDate();
				var oIntervalStartDate = new UniversalDate(oStartDate);
				oIntervalStartDate.setUTCMonth(oIntervalStartDate.getUTCMonth() + iInterval + 1, 0);
				iSubIntervals = oIntervalStartDate.getUTCDate();
				oIntervalStartDate.setUTCDate(1);
				iStartOffset = oIntervalStartDate.getUTCDay();
				break;

			default:
				break;
			}

			var iSubWidth = 100 / iSubIntervals;
			for (i = 0; i < iSubIntervals; i++) {
				oRm.openStart("div");
				oRm.class("sapUiCalendarRowAppsSubInt");
				oRm.style("width", iSubWidth + "%");

				for (var j = 0; j < aNonWorkingSubItems.length; j++) {
					if ((i + iSubStartOffset) % iNonWorkingSubMax == aNonWorkingSubItems[j]) {
						oRm.class("sapUiCalendarRowAppsNoWork");
						break;
					}
				}

				oRm.openEnd();
				oRm.close("div");
			}
		}

		oRm.close("div");

	};

	CalendarRowRenderer.renderIntervalHeaders = function(oRm, oRow, iWidth,  aIntervalHeaders, iIntervals){

		var bShowIntervalHeaders = oRow.getShowIntervalHeaders() && (oRow.getShowEmptyIntervalHeaders() || aIntervalHeaders.length > 0);

		if (bShowIntervalHeaders) {
			for (var i = 0; i < aIntervalHeaders.length; i++) {
				var oIH = aIntervalHeaders[i],
					iLeftPercent,
					iRightPercent;

				if (oRow._bRTL) {
					iRightPercent = iWidth * oIH.interval;
					iLeftPercent = iWidth * (iIntervals - oIH.last - 1);
				} else {
					iLeftPercent = iWidth * oIH.interval;
					iRightPercent = iWidth * (iIntervals - oIH.last - 1);
				}

				this.renderIntervalHeader(oRm, oRow, oIH, oRow._bRTL, iLeftPercent, iRightPercent);
			}
		}

	};

	CalendarRowRenderer.renderIntervalHeader = function(oRm, oRow, oIntervalHeader, bRtl, left, right) {
		var sId = oIntervalHeader.appointment.getId();

		var oArrowValues = oRow._calculateAppoitnmentVisualCue(oIntervalHeader.appointment);

		oRm.openStart("div", oIntervalHeader.appointment);
		oRm.class("sapUiCalendarRowAppsIntHead");

		if (left !== undefined) {
			oRm.style("left", left + "%");
		}

		if (right !== undefined) {
			oRm.style("right", right + "%");
		}

		oRm.class("sapUiCalendarRowAppsIntHeadFirst");

		if (oIntervalHeader.appointment.getSelected()) {
			oRm.class("sapUiCalendarRowAppsIntHeadSel");
		}

		if (oIntervalHeader.appointment.getTentative()) {
			oRm.class("sapUiCalendarRowAppsIntHeadTent");
		}

		var sTooltip = oIntervalHeader.appointment.getTooltip_AsString();
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		var sType = oIntervalHeader.appointment.getType();
		var sColor = oIntervalHeader.appointment.getColor();
		if (!sColor && sType && sType != CalendarDayType.None) {
			oRm.class("sapUiCalendarRowAppsIntHead" + sType);
		}

		if (sColor) {
			if (bRtl) {
				oRm.style("border-right-color", sColor);
			} else {
				oRm.style("border-left-color", sColor);
			}
		}

		oRm.openEnd(); //div element
		oRm.openStart("div");

		oRm.class("sapUiCalendarIntervalHeaderCont");

		if (sColor) {
			oRm.style("background-color", oIntervalHeader.appointment._getCSSColorForBackground(sColor));
		}
		oRm.openEnd();

		if (oArrowValues.appTimeUnitsDifRowStart > 0) {
			oRm.icon("sap-icon://arrow-left", ["sapUiCalendarAppArrowIconLeft"], { title: null });
		}

		var sIcon = oIntervalHeader.appointment.getIcon();
		if (sIcon) {
			var aClasses = ["sapUiCalendarRowAppsIntHeadIcon"];
			var mAttributes = {};

			mAttributes["id"] = sId + "-Icon";
			mAttributes["title"] = null;
			oRm.icon(sIcon, aClasses, mAttributes);
		}

		var sTitle = oIntervalHeader.appointment.getTitle();
		if (sTitle) {
			oRm.openStart("span", sId + "-Title");
			oRm.class("sapUiCalendarRowAppsIntHeadTitle");
			oRm.openEnd(); // span element
			oRm.text(sTitle);
			oRm.close("span");
		}

		var sText = oIntervalHeader.appointment.getText();
		if (sText) {
			oRm.openStart("span", sId + "-Text");
			oRm.class("sapUiCalendarRowAppsIntHeadText");
			oRm.openEnd(); // span element
			oRm.text(sText);
			oRm.close("span");
		}

		if (oArrowValues.appTimeUnitsDifRowEnd > 0) {
			oRm.icon("sap-icon://arrow-right",["sapUiCalendarAppArrowIconRight"], { title: null });
		}

		oRm.close("div");
		oRm.close("div");
	};

	CalendarRowRenderer.renderAppointment = function(oRm, oRow, oAppointmentInfo, aTypes, bRelativePos){

		var oAppointment = oAppointmentInfo.appointment;
		var sTooltip = oAppointment.getTooltip_AsString();
		var sType = oAppointment.getType();
		var sColor = oAppointment.getColor();
		var sTitle = oAppointment.getTitle();
		var sText = oAppointment.getText();
		var sIcon = oAppointment.getIcon();
		var sId = oAppointment.getId();
		var mAccProps = {
			labelledby: {value: InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT") + " " + sId + "-Descr", append: true},
			selected: null
		};
		var aAriaLabels = oRow.getAriaLabelledBy();

		var oArrowValues = oRow._calculateAppoitnmentVisualCue(oAppointment);

		if (aAriaLabels.length > 0) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + aAriaLabels.join(" ");
		}

		if (sTitle) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Title";
		}

		if (sText) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Text";
		}

		oRm.openStart("div", oAppointment);
		oRm.class("sapUiCalendarApp");

		if (oAppointment.getSelected()) {
			oRm.class("sapUiCalendarAppSel");
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");
		}

		if (oAppointment.getTentative()) {
			oRm.class("sapUiCalendarAppTent");
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_TENTATIVE");
		}

		if (!sText) {
			oRm.class("sapUiCalendarAppTitleOnly");
		}

		if (sIcon) {
			oRm.class("sapUiCalendarAppWithIcon");
		}

		if (!bRelativePos) {
			// write position
			if (oRow._bRTL) {
				oRm.style("right", oAppointmentInfo.begin + "%");
				oRm.style("left", oAppointmentInfo.end + "%");
			} else {
				oRm.style("left", oAppointmentInfo.begin + "%");
				oRm.style("right", oAppointmentInfo.end + "%");
			}
		}

		oRm.attr("data-sap-level", oAppointmentInfo.level);

		// This makes the appointment focusable
		if (oRow._sFocusedAppointmentId == sId) {
			oRm.attr("tabindex", "0");
		} else {
			oRm.attr("tabindex", "-1");
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (!sColor && sType && sType != CalendarDayType.None) {
			oRm.class("sapUiCalendarApp" + sType);
		}

		if (sColor) {
			if (oRow._bRTL) {
				oRm.style("border-right-color", sColor);
			} else {
				oRm.style("border-left-color", sColor);
			}
		}

		oRm.accessibilityState(oAppointment, mAccProps);
		oRm.openEnd(); //div element

		// extra content DIV to make some styling possible
		oRm.openStart("div");
		oRm.class("sapUiCalendarAppCont");

		if (sColor && oRow.getAppointmentsVisualization() === CalendarAppointmentVisualization.Filled) {
			oRm.style("background-color", oAppointment._getCSSColorForBackground(sColor));
		}

		oRm.openEnd(); // div element

		if (oArrowValues.appTimeUnitsDifRowStart > 0) {
			oRm.icon("sap-icon://arrow-left", ["sapUiCalendarAppArrowIconLeft"], { title: null });
		}

		if (sIcon) {
			var aClasses = ["sapUiCalendarAppIcon"];
			var mAttributes = {};

			mAttributes["id"] = sId + "-Icon";
			mAttributes["title"] = null;
			oRm.icon(sIcon, aClasses, mAttributes);
		}

		oRm.openStart("div");
		oRm.class("sapUiCalendarAppTitleWrapper");
		oRm.openEnd();

		if (sTitle) {
			oRm.openStart("span", sId + "-Title");
			oRm.class("sapUiCalendarAppTitle");
			oRm.openEnd(); // span element
			oRm.text(sTitle);
			oRm.close("span");
		}

		if (sText) {
			oRm.openStart("span", sId + "-Text");
			oRm.class("sapUiCalendarAppText");
			oRm.openEnd(); // span element
			oRm.text(sText);
			oRm.close("span");
		}

		oRm.close("div");

		if (oArrowValues.appTimeUnitsDifRowEnd > 0) {
			oRm.icon("sap-icon://arrow-right", ["sapUiCalendarAppArrowIconRight"], { title: null });
		}

		// ARIA information about start and end
		var sAriaText = oRow._oRb.getText("CALENDAR_START_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getStartDate());
		sAriaText = sAriaText + "; " + oRow._oRb.getText("CALENDAR_END_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getEndDate());

		if (sType && sType != CalendarDayType.None) {

			sAriaText = sAriaText + "; " + this.getAriaTextForType(sType, aTypes);
		}

		oRm.openStart("span", sId + "-Descr");
		oRm.class("sapUiInvisibleText");
		oRm.openEnd();
		oRm.text(sAriaText);
		oRm.close("span");
		oRm.close("div");

		this.renderResizeHandle(oRm, oRow, oAppointment);

		oRm.close("div");
	};

	CalendarRowRenderer.renderSingleDayInterval = function(oRm, oRow, aAppointments, aTypes, aIntervalHeaders, aNonWorkingItems, iStartOffset, iNonWorkingMax, aNonWorkingSubItems, iSubStartOffset, iNonWorkingSubMax, bFirstOfType, bLastOfType) {
		var iInterval = 1,
			iWidth = 100,
			sId = oRow.getId() + "-AppsInt" + iInterval,
			i,
			bShowIntervalHeaders = oRow.getShowIntervalHeaders() && (oRow.getShowEmptyIntervalHeaders() || aIntervalHeaders.length > 0),
			oRowStartDate = oRow.getStartDate(),
			iMonth = oRowStartDate.getMonth(),
			iDaysLength = new Date(oRowStartDate.getFullYear(), iMonth + 1, 0).getDate(),
			sNoAppointments,
			oPC = oRow._getPlanningCalendar(),
			// gets a concatenated array with appointments + interval headers, which intersect the visible interval
			// then sorts the array using our custom comparer
			aSortedAppInfos,
			oAppointmentInfo,
			aSelectedDates = [];

		oRowStartDate.setHours(0, 0, 0, 0); // get the appointments and interval headers for the whole day
		aSortedAppInfos = aAppointments.concat(oRow.getIntervalHeaders().filter(function(oIntHeadApp) {
			var iAppStart = oIntHeadApp.getStartDate().getTime(),
				iAppEnd = oIntHeadApp.getEndDate().getTime(),
				iRowStart = oRowStartDate.getTime(),
				iRowEnd = iRowStart + 1000 * 60 * 60 * 24;
			return !(iAppStart >= iRowEnd || iAppEnd <= iRowStart);
		}).map(function(oIntHeadApp) {
			return {appointment: oIntHeadApp, isHeader: true};
		})).sort(CalendarAppointment._getComparer(oRowStartDate));

		if (oPC) {
			aSelectedDates = oPC._getSelectedDates();
		}

		oRm.openStart("div", sId);
		oRm.class("sapUiCalendarRowAppsInt");
		oRm.class("sapUiCalendarMonthRowAppsS");
		oRm.style("width", iWidth + "%");

		if (iInterval >= iDaysLength && oRow.getIntervalType() === CalendarIntervalType.OneMonth){
			oRm.class("sapUiCalItemOtherMonth");
		}

		for (i = 0; i < aNonWorkingItems.length; i++) {
			if ((iInterval + iStartOffset) % iNonWorkingMax == aNonWorkingItems[i]) {
				oRm.class("sapUiCalendarRowAppsNoWork");
				break;
			}
		}

		if (!bShowIntervalHeaders) {
			oRm.class("sapUiCalendarRowAppsIntNoHead");
		}

		if (bFirstOfType) {
			oRm.class("sapUiCalendarRowAppsIntFirst");
		}

		if (bLastOfType) {
			oRm.class("sapUiCalendarRowAppsIntLast");
		}

		oRm.openEnd(); // div element

		if (bShowIntervalHeaders) {
			oRm.openStart("div");
			oRm.class("sapUiCalendarRowAppsIntHead");
			oRm.openEnd();
			oRm.close("div");
		}

		if (aSelectedDates.length > 0) {
			var iStart = 0,
				iEnd = aSortedAppInfos.length;

			if (oPC.getRows()[0]._calculateVisibleAppointments) {
				var oStartAndEnd = oPC.getRows()[0]._calculateVisibleAppointments(aSelectedDates, aSortedAppInfos);
				iStart = oStartAndEnd.iStart;
				iEnd = oStartAndEnd.iEnd;
			}

			for (i = iStart; i < iEnd; i++) {
				oAppointmentInfo = aSortedAppInfos[i];

				oRm.openStart("div");
				oRm.class("sapUiCalendarAppContainer");
				oRm.openEnd();
				oRm.openStart("div");
				oRm.class("sapUiCalendarAppContainerLeft");
				oRm.openEnd();
				oRm.openStart("div");
				oRm.class("sapUiCalendarAppStart");
				oRm.openEnd();
				oRm.text(oAppointmentInfo.appointment._getDateRangeIntersectionText(oRowStartDate).start);
				oRm.close("div");
				oRm.openStart("div");
				oRm.class("sapUiCalendarAppEnd");
				oRm.openEnd();
				oRm.text(oAppointmentInfo.appointment._getDateRangeIntersectionText(oRowStartDate).end);
				oRm.close("div");
				oRm.close("div");
				oRm.openStart("div");
				oRm.class("sapUiCalendarAppContainerRight");
				oRm.openEnd();
				if (oAppointmentInfo.isHeader) {
					this.renderIntervalHeader(oRm, oRow, oAppointmentInfo);
				} else {
					this.renderAppointment(oRm, oRow, oAppointmentInfo, aTypes, true);
				}
				oRm.close("div");
				oRm.close("div");
			}
		}

		if (aAppointments.length === 0 || aSelectedDates.length === 0) {
			oRm.openStart("div");
			oRm.class("sapUiCalendarNoApps");
			oRm.openEnd();
			var oPCRow = sap.ui.getCore().byId(oRow.getAssociation("row"));
			sNoAppointments = oPCRow.getNoAppointmentsText() ? oPCRow.getNoAppointmentsText() : sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PLANNINGCALENDAR_ROW_NO_APPOINTMENTS");
			oRm.text(sNoAppointments);
			oRm.close("div");
		}
		oRm.openStart("div", oRow.getId() + "-Now");
		oRm.class("sapUiCalendarRowNow");
		oRm.openEnd();
		oRm.close("div");

		// render dummy appointment for size calculation
		oRm.openStart("div", oRow.getId() + "-DummyApp");
		oRm.class("sapUiCalendarApp");
		oRm.class("sapUiCalendarAppTitleOnly");
		oRm.class("sapUiCalendarAppDummy");
		oRm.style("margin", "0");
		oRm.style("height", "0px");
		oRm.openEnd();
		oRm.close("div");

		if (oRow.getShowSubIntervals()) {
			var sIntervalType = oRow.getIntervalType();
			var iSubIntervals = 0;

			switch (sIntervalType) {
				case CalendarIntervalType.Hour:
					iSubIntervals = 4;
					break;

				case CalendarIntervalType.Day:
				case CalendarIntervalType.Week:
				case CalendarIntervalType.OneMonth:
					iSubIntervals = 24;
					break;

				case CalendarIntervalType.Month:
					var oIntervalStartDate = new UniversalDate(oRowStartDate);
					oIntervalStartDate.setUTCMonth(oIntervalStartDate.getUTCMonth() + iInterval + 1, 0);
					iSubIntervals = oIntervalStartDate.getUTCDate();
					oIntervalStartDate.setUTCDate(1);
					iStartOffset = oIntervalStartDate.getUTCDay();
					break;

				default:
					break;
			}

			var iSubWidth = 100 / iSubIntervals;
			for (i = 0; i < iSubIntervals; i++) {
				oRm.openStart("div");
				oRm.class("sapUiCalendarRowAppsSubInt");
				oRm.style("width", iSubWidth + "%");

				for (var j = 0; j < aNonWorkingSubItems.length; j++) {
					if ((i + iSubStartOffset) % iNonWorkingSubMax == aNonWorkingSubItems[j]) {
						oRm.class("sapUiCalendarRowAppsNoWork");
						break;
					}
				}
				oRm.openEnd(); // div element
				oRm.close("div");
			}
		}

		oRm.close("div");
	};

	/**
	 * Retrieves the legend items if such are associated with the given CalendarRow.
	 * Could be overridden by subclasses.
	 * @param {sap.ui.unified.CalendarRow} oCalRow the row to take the legend for
	 * @returns {Array} a list of legend items is such is associated to the CalendarRow, or empty array.
	 * @protected
	 */
	CalendarRowRenderer.getLegendItems = function (oCalRow) {
		var aResult = [],
			oLegend,
			sLegendId = oCalRow.getLegend();

		if (sLegendId) {
			oLegend = sap.ui.getCore().byId(sLegendId);
			if (oLegend) {
				aResult = oLegend.getItems();
			} else {
				Log.error("CalendarLegend with id '" + sLegendId + "' does not exist!", oCalRow);
			}
		}
		return aResult;
	};

	/**
	 * Retrieves text for given CalendarDayType based on given type and legend items.
	 * @param {sap.ui.unified.CalendarDayType} sType the type to obtain information about
	 * @param {sap.ui.unified.CalendarLegendItem[]} aLegendItems ot be used.
	 * @returns {string} The matching legend item's text or the default text for this type.
	 * @private
	 */
	CalendarRowRenderer.getAriaTextForType = function(sType, aLegendItems) {
		// as legend must not be rendered add text of type
		var sTypeLabelText,
			oStaticLabel,
			oItem, i;

		if (aLegendItems && aLegendItems.length) {
			for (var i = 0; i < aLegendItems.length; i++) {
				oItem = aLegendItems[i];
				if (oItem.getType() === sType) {
					sTypeLabelText = oItem.getText();
					break;
				}
			}
		}

		if (!sTypeLabelText) {
			//use static invisible labels - "Type 1", "Type 2"
			oStaticLabel = CalendarLegendRenderer.getTypeAriaText(sType);
			if (oStaticLabel) {
				sTypeLabelText = oStaticLabel.getText();
			}
		}
		return sTypeLabelText;
	};
	return CalendarRowRenderer;

}, /* bExport= */ true);
