/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/date/UniversalDate'],
	function(jQuery, UniversalDate) {
	"use strict";


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

		oRm.write("<div");
		oRm.writeControlData(oRow);
		oRm.addClass("sapUiCalendarRow");

		// This makes the row focusable
		if (oRow._sFocusedAppointmentId) {
			oRm.writeAttribute("tabindex", "-1");
		} else {
			oRm.writeAttribute("tabindex", "0");
		}

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
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

		this.renderAppointmentsRow(oRm, oRow);

		oRm.write("</div>");
	};

	CalendarRowRenderer.renderAppointmentsRow = function(oRm, oRow){

		oRm.write("<div id=\"" + oRow.getId() + "-Apps\" class=\"sapUiCalendarRowApps\">");

		this.renderAppointments(oRm, oRow);

		oRm.write("</div>");

	};

	CalendarRowRenderer.renderAppointments = function(oRm, oRow){

		var aAppointments = oRow._getVisibleAppointments();
		var aIntervalHeaders = oRow._getVisibleIntervalHeaders();
		var oStartDate = oRow._getStartDate();
		var aNonWorkingItems = [];
		var iStartOffset = 0;
		var iNonWorkingMax = 0;
		var iIntervals = oRow.getIntervals();
		var sIntervalType = oRow.getIntervalType();
		var iWidth = 100 / iIntervals;
		var i = 0;

		switch (sIntervalType) {
		case sap.ui.unified.CalendarIntervalType.Hour:
			aNonWorkingItems = oRow.getNonWorkingHours() || [];
			iStartOffset = oStartDate.getUTCHours();
			iNonWorkingMax = 24;
			break;

		case sap.ui.unified.CalendarIntervalType.Day:
			aNonWorkingItems = oRow._getNonWorkingDays();
			iStartOffset = oStartDate.getUTCDay();
			iNonWorkingMax = 7;
			break;

		case sap.ui.unified.CalendarIntervalType.Month:
			aNonWorkingItems = oRow._getNonWorkingDays();
			iStartOffset = oStartDate.getUTCDay();
			iNonWorkingMax = 7;
			break;

		default:
			break;
		}

		for (i = 0; i < iIntervals; i++) {
			this.renderInterval(oRm, oRow, i, iWidth, aIntervalHeaders, aNonWorkingItems, iStartOffset, iNonWorkingMax);
		}

		oRm.write("<div id=\"" + oRow.getId() + "-Now\" class=\"sapUiCalendarRowNow\"></div>");

		for (i = 0; i < aAppointments.length; i++) {
			var oAppointmentInfo = aAppointments[i];

			this.renderAppointment(oRm, oRow, oAppointmentInfo);
		}

		// render dummy appointment for size calculation
		if (!oRow._iAppMinWidth) {
			oRm.write("<div id=\"" + oRow.getId() + "-DummyApp\" class=\"sapUiCalendarApp sapUiCalendarAppDummy\"></div>");
		}

	};

	CalendarRowRenderer.renderInterval = function(oRm, oRow, iInterval, iWidth,  aIntervalHeaders, aNonWorkingItems, iStartOffset, iNonWorkingMax){

		var sId = oRow.getId() + "-AppsInt" + iInterval;
		var i = 0;
		var oMyIntervalHeader;
		var bShowIntervalHeaders = oRow.getShowIntervalHeaders();

		if (bShowIntervalHeaders) {
			for (i = 0; i < aIntervalHeaders.length; i++) {
				var oIntervalHeader = aIntervalHeaders[i];
				if (oIntervalHeader.interval == iInterval) {
					oMyIntervalHeader = oIntervalHeader;
					break;
				}
			}
		}

		oRm.write("<div id=\"" + sId + "\"");
		oRm.addClass("sapUiCalendarRowAppsInt");
		oRm.addStyle("width", iWidth + "%");

		for (i = 0; i < aNonWorkingItems.length; i++) {
			if ((iInterval + iStartOffset) % iNonWorkingMax == aNonWorkingItems[i]) {
				oRm.addClass("sapUiCalendarRowAppsNoWork");
				break;
			}
		}

		if (!bShowIntervalHeaders) {
			oRm.addClass("sapUiCalendarRowAppsIntNoHead");
		}

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		if (bShowIntervalHeaders) {
			oRm.write("<div");
			oRm.addClass("sapUiCalendarRowAppsIntHead");

			if (oMyIntervalHeader) {
				if (oMyIntervalHeader.first) {
					oRm.writeElementData(oMyIntervalHeader.appointment);
					sId = oMyIntervalHeader.appointment.getId();
					oRm.addClass("sapUiCalendarRowAppsIntHeadFirst");
				}else {
					sId = oMyIntervalHeader.appointment.getId() + "-" + iInterval;
					oRm.writeAttribute('id', sId);
				}

				if (oMyIntervalHeader.appointment.getSelected()) {
					oRm.addClass("sapUiCalendarRowAppsIntHeadSel");
				}

				if (oMyIntervalHeader.appointment.getTentative()) {
					oRm.addClass("sapUiCalendarRowAppsIntHeadTent");
				}

				var sTooltip = oMyIntervalHeader.appointment.getTooltip_AsString();
				if (sTooltip) {
					oRm.writeAttributeEscaped('title', sTooltip);
				}

				var sType = oMyIntervalHeader.appointment.getType();
				if (sType && sType != sap.ui.unified.CalendarDayType.None) {
					oRm.addClass("sapUiCalendarRowAppsIntHead" + sType);
				}
			}

			oRm.writeClasses();
			oRm.write(">"); // div element

			if (oMyIntervalHeader && oMyIntervalHeader.first) {
				var sIcon = oMyIntervalHeader.appointment.getIcon();
				if (sIcon) {
					var aClasses = ["sapUiCalendarRowAppsIntHeadIcon"];
					var mAttributes = {};

					mAttributes["id"] = sId + "-Icon";
					mAttributes["title"] = null;
					oRm.writeIcon(sIcon, aClasses, mAttributes);
				}

				var sTitle = oMyIntervalHeader.appointment.getTitle();
				if (sTitle) {
					oRm.write("<span");
					oRm.writeAttribute("id", sId + "-Title");
					oRm.addClass("sapUiCalendarRowAppsIntHeadTitle");
					oRm.writeClasses();
					oRm.write(">"); // span element
					oRm.writeEscaped(sTitle, true);
					oRm.write("</span>");
				}

				var sText = oMyIntervalHeader.appointment.getText();
				if (sText) {
					oRm.write("<span");
					oRm.writeAttribute("id", sId + "-Text");
					oRm.addClass("sapUiCalendarRowAppsIntHeadText");
					oRm.writeClasses();
					oRm.write(">"); // span element
					oRm.writeEscaped(sText, true);
					oRm.write("</span>");
				}
			}

			oRm.write("</div>");
		}

		if (oRow.getShowSubIntervals()) {
			var sIntervalType = oRow.getIntervalType();
			var iSubIntervals = 0;

			switch (sIntervalType) {
			case sap.ui.unified.CalendarIntervalType.Hour:
				iSubIntervals = 4;
				break;

			case sap.ui.unified.CalendarIntervalType.Day:
				iSubIntervals = 24;
				break;

			case sap.ui.unified.CalendarIntervalType.Month:
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

				if (sIntervalType == sap.ui.unified.CalendarIntervalType.Month) {
					for (var j = 0; j < aNonWorkingItems.length; j++) {
						if ((i + iStartOffset) % iNonWorkingMax == aNonWorkingItems[j]) {
							oRm.addClass("sapUiCalendarRowAppsNoWork");
							break;
						}
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

	CalendarRowRenderer.renderAppointment = function(oRm, oRow, oAppointmentInfo){

		var oAppointment = oAppointmentInfo.appointment;
		var sTooltip = oAppointment.getTooltip_AsString();
		var sType = oAppointment.getType();
		var sTitle = oAppointment.getTitle();
		var sText = oAppointment.getText();
		var sIcon = oAppointment.getIcon();
		var sId = oAppointment.getId();

		oRm.write("<div");
		oRm.writeElementData(oAppointment);
		oRm.addClass("sapUiCalendarApp");

		if (oAppointment.getSelected()) {
			oRm.addClass("sapUiCalendarAppSel");
		}

		if (oAppointment.getTentative()) {
			oRm.addClass("sapUiCalendarAppTent");
		}

		if (!sText) {
			oRm.addClass("sapUiCalendarAppTitleOnly");
		}

		if (sIcon) {
			oRm.addClass("sapUiCalendarAppWithIcon");
		}

		// write position
		if (oRow._bRTL) {
			oRm.addStyle("right", oAppointmentInfo.begin + "%");
			oRm.addStyle("left", oAppointmentInfo.end + "%");
		} else {
			oRm.addStyle("left", oAppointmentInfo.begin + "%");
			oRm.addStyle("right", oAppointmentInfo.end + "%");
		}

		oRm.writeAttribute("data-sap-level", oAppointmentInfo.level);

		// This makes the appointment focusable
		if (oRow._sFocusedAppointmentId == sId) {
			oRm.writeAttribute("tabindex", "0");
		} else {
			oRm.writeAttribute("tabindex", "-1");
		}

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		if (sType && sType != sap.ui.unified.CalendarDayType.None) {
			oRm.addClass("sapUiCalendarApp" + sType);
		}

		oRm.writeAccessibilityState(oAppointment/*, mAccProps*/);

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">"); // div element

		// extra content DIV to make some styling possible
		oRm.write("<div");
		oRm.addClass("sapUiCalendarAppCont");
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

		oRm.write("</div>");
		oRm.write("</div>");
	};

	return CalendarRowRenderer;

}, /* bExport= */ true);
