/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/date/UniversalDate', 'sap/ui/unified/CalendarAppointment',
		'sap/ui/unified/CalendarLegendRenderer', 'sap/ui/Device', 'sap/ui/unified/library', 'sap/ui/core/InvisibleText'],
	function (jQuery, UniversalDate, CalendarAppointment, CalendarLegendRenderer, Device, library, InvisibleText) {
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

		oRm.write("<div");
		oRm.writeControlData(oRow);
		oRm.addClass("sapUiCalendarRow");

		if (!Device.system.phone && oRow.getAppointmentsReducedHeight()) {
			oRm.addClass("sapUiCalendarRowAppsRedHeight");
		}

		if (sVisualisation != CalendarAppointmentVisualization.Standard) {
			oRm.addClass("sapUiCalendarRowVis" + sVisualisation);
		}

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		var sWidth = oRow.getWidth();
		if (sWidth) {
			oRm.addStyle("width", sWidth);
		}

		var sHeight = oRow.getHeight();
		if (sHeight) {
			oRm.addStyle("height", sHeight);
		}

	//		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		oRm.writeAccessibilityState(oRow/*, mAccProps*/);

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		this.renderAppointmentsRow(oRm, oRow, aTypes);

		oRm.write("</div>");
	};

	CalendarRowRenderer.renderAppointmentsRow = function(oRm, oRow, aTypes){

		var sId = oRow.getId();
		oRm.write("<div id=\"" + sId + "-Apps\" class=\"sapUiCalendarRowApps\">");

		this.renderBeforeAppointments(oRm, oRow);
		this.renderAppointments(oRm, oRow, aTypes);
		this.renderAfterAppointments(oRm, oRow);

		oRm.write("</div>");

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
		var aNonWorkingDates = [];
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
				aNonWorkingDates = oRow.getAggregation("_nonWorkingDates");
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

		if (oRow._isOneMonthIntervalOnSmallSizes()) {
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

				this.renderInterval(oRm, oRow, i, iWidth, aIntervalHeaders, aNonWorkingItems, aNonWorkingDates, iStartOffset, iNonWorkingMax, aNonWorkingSubItems, iSubStartOffset, iNonWorkingSubMax, bFirstOfType, bLastOfType);
			}

			this.renderIntervalHeaders(oRm, oRow, iWidth, aIntervalHeaders, iIntervals);

			oRm.write("<div id=\"" + oRow.getId() + "-Now\" class=\"sapUiCalendarRowNow\"></div>");

			for (i = 0; i < aAppointments.length; i++) {
				var oAppointmentInfo = aAppointments[i];

				this.renderAppointment(oRm, oRow, oAppointmentInfo, aTypes);
			}

			// render dummy appointment for size calculation
			oRm.write("<div id=\"" + oRow.getId() + "-DummyApp\" class=\"sapUiCalendarApp sapUiCalendarAppTitleOnly sapUiCalendarAppDummy\"></div>");
		}
	};

	CalendarRowRenderer.renderInterval = function(oRm, oRow, iInterval, iWidth,  aIntervalHeaders, aNonWorkingItems, aNonWorkingDates, iStartOffset, iNonWorkingMax, aNonWorkingSubItems, iSubStartOffset, iNonWorkingSubMax, bFirstOfType, bLastOfType){

		var sId = oRow.getId() + "-AppsInt" + iInterval;
		var i;
		var bShowIntervalHeaders = oRow.getShowIntervalHeaders() && (oRow.getShowEmptyIntervalHeaders() || aIntervalHeaders.length > 0);
		var iMonth = oRow.getStartDate().getMonth();
		var iDaysLength = new Date(oRow.getStartDate().getFullYear(), iMonth + 1, 0).getDate();
		var oRowStartDate = oRow.getStartDate();
		var oCurrentDate;
		var oNonWorkingStartDate;
		var oNonWorkingEndDate;

		oRm.write("<div id=\"" + sId + "\"");
		oRm.addClass("sapUiCalendarRowAppsInt");
		oRm.addStyle("width", iWidth + "%");

		if (iInterval >= iDaysLength && oRow.getIntervalType() === CalendarIntervalType.OneMonth){
			oRm.addClass("sapUiCalItemOtherMonth");
		}
		for (i = 0; i < aNonWorkingItems.length; i++) {
			if ((iInterval + iStartOffset) % iNonWorkingMax == aNonWorkingItems[i]) {
				oRm.addClass("sapUiCalendarRowAppsNoWork");
				break;
			}
		}

		if (aNonWorkingDates && aNonWorkingDates.length) {
			oCurrentDate = new Date(oRowStartDate.getTime());
			oCurrentDate.setHours(0,0,0);
			oCurrentDate.setDate(oRowStartDate.getDate() + iInterval);
			var fnDayMatchesCurrentDate = function(iDay) {
				return iDay === oCurrentDate.getDay();
			};

			for (i = 0; i < aNonWorkingDates.length; i++){
				if (aNonWorkingDates[i].getStartDate()) {
					oNonWorkingStartDate = new Date(aNonWorkingDates[i].getStartDate().getTime());
				}

				if (aNonWorkingDates[i].getEndDate()){
					oNonWorkingEndDate = new Date(aNonWorkingDates[i].getEndDate().getTime());
				} else {
					oNonWorkingEndDate = new Date(aNonWorkingDates[i].getStartDate().getTime());
					oNonWorkingEndDate.setHours(23, 59, 59);
				}

				if (oCurrentDate.getTime() >= oNonWorkingStartDate.getTime() && oCurrentDate.getTime() <= oNonWorkingEndDate.getTime()){
					var bAlreadyNonWorkingDate = aNonWorkingItems.some(fnDayMatchesCurrentDate);
					if (!bAlreadyNonWorkingDate) {
						oRm.addClass("sapUiCalendarRowAppsNoWork");
					}
				}
			}
		}

		if (!bShowIntervalHeaders) {
			oRm.addClass("sapUiCalendarRowAppsIntNoHead");
		}

		if (bFirstOfType) {
			oRm.addClass("sapUiCalendarRowAppsIntFirst");
		}

		if (bLastOfType) {
			oRm.addClass("sapUiCalendarRowAppsIntLast");
		}

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		if (bShowIntervalHeaders) {
			oRm.write("<div");
			oRm.addClass("sapUiCalendarRowAppsIntHead");
			oRm.writeClasses();
			oRm.write(">"); // div element
			oRm.write("</div>");
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
				oRm.write("<div");
				oRm.addClass("sapUiCalendarRowAppsSubInt");
				oRm.addStyle("width", iSubWidth + "%");

				for (var j = 0; j < aNonWorkingSubItems.length; j++) {
					if ((i + iSubStartOffset) % iNonWorkingSubMax == aNonWorkingSubItems[j]) {
						oRm.addClass("sapUiCalendarRowAppsNoWork");
						break;
					}
				}

				oRm.writeStyles();
				oRm.writeClasses();
				oRm.write(">"); // div element
				oRm.write("</div>");
			}
		}

		oRm.write("</div>");

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

				this.renderIntervalHeader(oRm, oIH, oRow._bRTL, iLeftPercent, iRightPercent);
			}
		}

	};

	CalendarRowRenderer.renderIntervalHeader = function(oRm, oIntervalHeader, bRtl, left, right) {
		var sId = oIntervalHeader.appointment.getId();

		oRm.write("<div");
		oRm.addClass("sapUiCalendarRowAppsIntHead");

		if (left !== undefined) {
			oRm.addStyle("left", left + "%");
		}

		if (right !== undefined) {
			oRm.addStyle("right", right + "%");
		}

		oRm.writeElementData(oIntervalHeader.appointment);

		oRm.addClass("sapUiCalendarRowAppsIntHeadFirst");

		if (oIntervalHeader.appointment.getSelected()) {
			oRm.addClass("sapUiCalendarRowAppsIntHeadSel");
		}

		if (oIntervalHeader.appointment.getTentative()) {
			oRm.addClass("sapUiCalendarRowAppsIntHeadTent");
		}

		var sTooltip = oIntervalHeader.appointment.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		var sType = oIntervalHeader.appointment.getType();
		var sColor = oIntervalHeader.appointment.getColor();
		if (!sColor && sType && sType != CalendarDayType.None) {
			oRm.addClass("sapUiCalendarRowAppsIntHead" + sType);
		}

		if (sColor) {
			if (bRtl) {
				oRm.addStyle("border-right-color", sColor);
			} else {
				oRm.addStyle("border-left-color", sColor);
			}
		}

		oRm.writeStyles();
		oRm.writeClasses();
		oRm.write(">"); // div element

		oRm.write("<div");
		oRm.addClass("sapUiCalendarIntervalHeaderCont");
		oRm.writeClasses();
		if (sColor) {
			oRm.addStyle("background-color", oIntervalHeader.appointment._getCSSColorForBackground(sColor));
			oRm.writeStyles();
		}
		oRm.write(">");

		var sIcon = oIntervalHeader.appointment.getIcon();
		if (sIcon) {
			var aClasses = ["sapUiCalendarRowAppsIntHeadIcon"];
			var mAttributes = {};

			mAttributes["id"] = sId + "-Icon";
			mAttributes["title"] = null;
			oRm.writeIcon(sIcon, aClasses, mAttributes);
		}

		var sTitle = oIntervalHeader.appointment.getTitle();
		if (sTitle) {
			oRm.write("<span");
			oRm.writeAttribute("id", sId + "-Title");
			oRm.addClass("sapUiCalendarRowAppsIntHeadTitle");
			oRm.writeClasses();
			oRm.write(">"); // span element
			oRm.writeEscaped(sTitle, true);
			oRm.write("</span>");
		}

		var sText = oIntervalHeader.appointment.getText();
		if (sText) {
			oRm.write("<span");
			oRm.writeAttribute("id", sId + "-Text");
			oRm.addClass("sapUiCalendarRowAppsIntHeadText");
			oRm.writeClasses();
			oRm.write(">"); // span element
			oRm.writeEscaped(sText, true);
			oRm.write("</span>");
		}

		oRm.write("</div>");
		oRm.write("</div>");
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
		var mAccProps = {labelledby: {value: InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT") + " " + sId + "-Descr", append: true}};
		var aAriaLabels = oRow.getAriaLabelledBy();

		if (aAriaLabels.length > 0) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + aAriaLabels.join(" ");
		}

		if (sTitle) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Title";
		}

		if (sText) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Text";
		}

		oRm.write("<div");
		oRm.writeElementData(oAppointment);
		oRm.addClass("sapUiCalendarApp");

		if (oAppointment.getSelected()) {
			oRm.addClass("sapUiCalendarAppSel");
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");
		}

		if (oAppointment.getTentative()) {
			oRm.addClass("sapUiCalendarAppTent");
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_TENTATIVE");
		}

		if (!sText) {
			oRm.addClass("sapUiCalendarAppTitleOnly");
		}

		if (sIcon) {
			oRm.addClass("sapUiCalendarAppWithIcon");
		}

		if (!bRelativePos) {
			// write position
			if (oRow._bRTL) {
				oRm.addStyle("right", oAppointmentInfo.begin + "%");
				oRm.addStyle("left", oAppointmentInfo.end + "%");
			} else {
				oRm.addStyle("left", oAppointmentInfo.begin + "%");
				oRm.addStyle("right", oAppointmentInfo.end + "%");
			}
		}

		oRm.writeAttribute("data-sap-level", oAppointmentInfo.level);

		// This makes the appointment focusable
		if (oRow._sFocusedAppointmentId == sId) {
			oRm.writeAttribute("tabindex", "0");
		} else {
			oRm.writeAttribute("tabindex", "-1");
		}

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		if (!sColor && sType && sType != CalendarDayType.None) {
			oRm.addClass("sapUiCalendarApp" + sType);
		}

		if (sColor) {
			if (oRow._bRTL) {
				oRm.addStyle("border-right-color", sColor);
			} else {
				oRm.addStyle("border-left-color", sColor);
			}
		}

		oRm.writeAccessibilityState(oAppointment, mAccProps);

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		// extra content DIV to make some styling possible
		oRm.write("<div");
		oRm.addClass("sapUiCalendarAppCont");

		if (sColor && oRow.getAppointmentsVisualization() === CalendarAppointmentVisualization.Filled) {
			oRm.addStyle("background-color", oAppointment._getCSSColorForBackground(sColor));
			oRm.writeStyles();
		}

		oRm.writeClasses();
		oRm.write(">"); // div element

		if (sIcon) {
			var aClasses = ["sapUiCalendarAppIcon"];
			var mAttributes = {};

			mAttributes["id"] = sId + "-Icon";
			mAttributes["title"] = null;
			oRm.writeIcon(sIcon, aClasses, mAttributes);
		}

		if (sTitle) {
			oRm.write("<span");
			oRm.writeAttribute("id", sId + "-Title");
			oRm.addClass("sapUiCalendarAppTitle");
			oRm.writeClasses();
			oRm.write(">"); // span element
			oRm.writeEscaped(sTitle, true);
			oRm.write("</span>");
		}

		if (sText) {
			oRm.write("<span");
			oRm.writeAttribute("id", sId + "-Text");
			oRm.addClass("sapUiCalendarAppText");
			oRm.writeClasses();
			oRm.write(">"); // span element
			oRm.writeEscaped(sText, true);
			oRm.write("</span>");
		}

		// ARIA information about start and end
		var sAriaText = oRow._oRb.getText("CALENDAR_START_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getStartDate());
		sAriaText = sAriaText + "; " + oRow._oRb.getText("CALENDAR_END_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getEndDate());
		if (sTooltip) {
			sAriaText = sAriaText + "; " + sTooltip;
		}

		if (sType && sType != CalendarDayType.None) {

			sAriaText = sAriaText + "; " + this.getAriaTextForType(sType, aTypes);
		}

		oRm.write("<span id=\"" + sId + "-Descr\" class=\"sapUiInvisibleText\">" + sAriaText + "</span>");

		oRm.write("</div>");

		this.renderResizeHandle(oRm, oRow, oAppointment);

		oRm.write("</div>");
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
			aSortedAppInfos = aAppointments.concat(oRow.getIntervalHeaders().filter(function(oIntHeadApp) {
				var iAppStart = oIntHeadApp.getStartDate().getTime(),
					iAppEnd = oIntHeadApp.getStartDate().getTime(),
					iRowStart = oRowStartDate.getTime(),
					iRowEnd = iRowStart + 1000 * 60 * 60 * 24;
				return (iAppStart >= iRowStart && iAppStart < iRowEnd) || (iAppEnd >= iRowStart && iAppEnd < iRowEnd);
			}).map(function(oIntHeadApp) {
				return {appointment: oIntHeadApp, isHeader: true};
			})).sort(CalendarAppointment._getComparer(oRowStartDate)),
			oAppointmentInfo;

		oRm.write("<div id=\"" + sId + "\"");
		oRm.addClass("sapUiCalendarRowAppsInt");
		oRm.addClass("sapUiCalendarMonthRowAppsS");
		oRm.addStyle("width", iWidth + "%");

		if (iInterval >= iDaysLength && oRow.getIntervalType() === CalendarIntervalType.OneMonth){
			oRm.addClass("sapUiCalItemOtherMonth");
		}

		for (i = 0; i < aNonWorkingItems.length; i++) {
			if ((iInterval + iStartOffset) % iNonWorkingMax == aNonWorkingItems[i]) {
				oRm.addClass("sapUiCalendarRowAppsNoWork");
				break;
			}
		}

		if (!bShowIntervalHeaders) {
			oRm.addClass("sapUiCalendarRowAppsIntNoHead");
		}

		if (bFirstOfType) {
			oRm.addClass("sapUiCalendarRowAppsIntFirst");
		}

		if (bLastOfType) {
			oRm.addClass("sapUiCalendarRowAppsIntLast");
		}

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		if (bShowIntervalHeaders) {
			oRm.write("<div");
			oRm.addClass("sapUiCalendarRowAppsIntHead");
			oRm.writeClasses();
			oRm.write(">"); // div element
			oRm.write("</div>");
		}

		for (i = 0; i < aSortedAppInfos.length; i++) {
			oAppointmentInfo = aSortedAppInfos[i];

			oRm.write("<div class=\"sapUiCalendarAppContainer\">");
				oRm.write("<div class=\"sapUiCalendarAppContainerLeft\">");
					oRm.write("<div>" + oAppointmentInfo.appointment._getDateRangeIntersectionText(oRowStartDate) + "</div>");
				oRm.write("</div>");
				oRm.write("<div class=\"sapUiCalendarAppContainerRight\">");
					if (oAppointmentInfo.isHeader) {
						this.renderIntervalHeader(oRm, oAppointmentInfo);
					} else {
						this.renderAppointment(oRm, oRow, oAppointmentInfo, aTypes, true);
					}
				oRm.write("</div>");
			oRm.write("</div>");
		}

		if (aAppointments.length === 0) {
			oRm.write("<div class=\"sapUiCalendarNoApps\">");
			sNoAppointments = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PLANNINGCALENDAR_ROW_NO_APPOINTMENTS");
			oRm.write(sNoAppointments);
			oRm.write("</div>");
		}

		oRm.write("<div id=\"" + oRow.getId() + "-Now\" class=\"sapUiCalendarRowNow\"></div>");

		// render dummy appointment for size calculation
		oRm.write("<div id=\"" + oRow.getId() + "-DummyApp\" class=\"sapUiCalendarApp sapUiCalendarAppTitleOnly sapUiCalendarAppDummy\" style='margin:0; height:0px;'></div>");

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
				oRm.write("<div");
				oRm.addClass("sapUiCalendarRowAppsSubInt");
				oRm.addStyle("width", iSubWidth + "%");

				for (var j = 0; j < aNonWorkingSubItems.length; j++) {
					if ((i + iSubStartOffset) % iNonWorkingSubMax == aNonWorkingSubItems[j]) {
						oRm.addClass("sapUiCalendarRowAppsNoWork");
						break;
					}
				}

				oRm.writeStyles();
				oRm.writeClasses();
				oRm.write(">"); // div element
				oRm.write("</div>");
			}
		}

		oRm.write("</div>");
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
				jQuery.sap.log.error("CalendarLegend with id '" + sLegendId + "' does not exist!", oCalRow);
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
