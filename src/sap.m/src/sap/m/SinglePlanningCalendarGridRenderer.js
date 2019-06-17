/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/calendar/CalendarDate', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/core/date/UniversalDate', 'sap/ui/core/InvisibleText', 'sap/ui/unified/library'],
	function (CalendarDate, CalendarUtils,  UniversalDate, InvisibleText, unifiedLibrary) {
		"use strict";

		var iVerticalPaddingBetweenAppointments = 2;
		var iAppointmentBottomPadding = 2;
		var iAppointmentTopPadding = 1;

		// shortcut for sap.ui.unified.CalendarDayType
		var CalendarDayType = unifiedLibrary.CalendarDayType;

		/**
		 * SinglePlanningCalendarGrid renderer.
		 * @namespace
		 */
		var SinglePlanningCalendarGridRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		SinglePlanningCalendarGridRenderer.render = function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMSinglePCGrid");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_columnHeaders"));
			this.renderBlockersContainer(oRm, oControl);
			oRm.write("<div");
			oRm.writeAttribute("role", "grid");
			oRm.addClass("sapMSinglePCGridContent");
			oRm.writeClasses();
			oRm.write(">");
			this.renderRowHeaders(oRm, oControl);
			this.renderNowMarker(oRm, oControl);
			this.renderColumns(oRm, oControl);
			oRm.write("</div>"); // END .sapMSinglePCGridContent
			oRm.write("</div>"); // END .sapMSinglePCGrid
		};

		SinglePlanningCalendarGridRenderer.renderBlockersContainer = function (oRm, oControl) {
			var iColumns = oControl._getColumns(),
				iMaxLevel = oControl._getBlockersToRender().iMaxlevel,
				oStartDate = oControl.getStartDate(),
				// hackie thing to calculate the container witdth. When we have more than 1 line of blockers - we must add 3 px in order to render the blockers visually in the container.
				iContainerHeight = (iMaxLevel + 1) * oControl._getBlockerRowHeight() + 3,
				oFormat = oControl._getDateFormatter();


			oRm.write("<div");
			oRm.writeAttribute("role", "grid");
			oRm.addClass("sapMSinglePCBlockersRow");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.writeAttribute("role", "row");
			oRm.addClass("sapMSinglePCBlockersColumns");

			oRm.addStyle("height", iContainerHeight + "px");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			this.renderDndPlaceholders(oRm, oControl, oControl.getAggregation("_blockersPlaceholders"));

			for (var i = 0; i < iColumns; i++) {
				var oColumnCalDate = new CalendarDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i);

				oRm.write("<div");
				oRm.writeAttribute("role", "gridcell");
				oRm.writeAttribute("data-sap-start-date", oFormat.format(oColumnCalDate.toLocalJSDate()));
				oRm.writeAttribute("data-sap-end-date", oFormat.format(oColumnCalDate.toLocalJSDate()));
				oRm.writeAttribute("aria-labelledby", InvisibleText.getStaticId("sap.m", "SPC_BLOCKERS") +
				" " + "fullDay-" + oFormat.format(oColumnCalDate.toLocalJSDate()) + "-Descr");
				oRm.addClass("sapMSinglePCBlockersColumn");
				oRm.writeAttribute("tabindex", -1);

				if (oColumnCalDate.isSame(new CalendarDate())) {
					oRm.addClass("sapMSinglePCBlockersColumnToday");
				}

				if (CalendarUtils._isWeekend(oColumnCalDate, oControl._getCoreLocaleData())) {
					oRm.addClass("sapMSinglePCBlockersColumnWeekend");
				}

				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");

				oRm.write("<span");
				oRm.writeAttribute("id", "fullDay-" + oFormat.format(oColumnCalDate.toLocalJSDate()) + "-Descr");
				oRm.addClass("sapUiInvisibleText");
				oRm.writeClasses();
				oRm.write(">");
				oRm.write(oControl._getCellStartEndInfo(oColumnCalDate.toLocalJSDate()));
				oRm.write("</span>");

				oRm.write("</div>"); // END .sapMSinglePCColumn
			}
			this.renderBlockers(oRm, oControl);
			oRm.write("</div>"); // END .sapMSinglePCColumns
			oRm.write("</div>"); // END .sapMSinglePCGridBlockers
		};

		SinglePlanningCalendarGridRenderer.renderBlockers = function (oRm, oControl) {
			var that = this,
				oBlockersList = oControl._getBlockersToRender().oBlockersList;

			oRm.write("<div");
			oRm.writeAttribute("role", "grid");
			oRm.writeAttribute("aria-labelledby", InvisibleText.getStaticId("sap.m", "SPC_BLOCKERS"));
			oRm.addClass("sapMSinglePCBlockers");
			oRm.addClass("sapUiCalendarRowVisFilled"); // TODO: when refactor the CSS of appointments maybe we won't need this class

			oRm.writeClasses();
			oRm.write(">");
			oBlockersList.getIterator().forEach(function (oBlocker) {
				that.renderBlockerAppointment(oRm, oControl, oBlocker);
			});
			oRm.write("</div>"); // END .sapMSinglePCBlockers
		};

		SinglePlanningCalendarGridRenderer.renderBlockerAppointment = function(oRm, oControl, oBlockerNode) {
			var oGridCalStart = CalendarDate.fromLocalJSDate(oControl.getStartDate()),
				oBlocker = oBlockerNode.getData(),
				oBlockerCalStart = CalendarDate.fromLocalJSDate(oBlocker.getStartDate()),
				oBlockerCalEnd = CalendarDate.fromLocalJSDate(oBlocker.getEndDate()),
				iStartDayDiff = CalendarUtils._daysBetween(oBlockerCalStart, oGridCalStart),
				iEndDayDiff = CalendarUtils._daysBetween(oBlockerCalEnd, oGridCalStart),
				iColumns = oControl._getColumns(),
				iRowHeight = oControl._getBlockerRowHeight(),
				iBlockerLevel = oBlockerNode.level,
				iBlockerWidth = oBlockerNode.width,
				sTooltip = oBlocker.getTooltip_AsString(),
				sType = oBlocker.getType(),
				sColor = oBlocker.getColor(),
				sTitle = oBlocker.getTitle(),
				sText = oBlocker.getText(),
				sIcon = oBlocker.getIcon(),
				sId = oBlocker.getId(),
				mAccProps = {
					role: "gridcell",
					labelledby: {
						value: InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT"),
						append: true
					}
				},
				aAriaLabels = oControl.getAriaLabelledBy(),
				iLeftPosition = iStartDayDiff * (100 / iColumns),
				iRightPosition = (iColumns - iEndDayDiff - 1) * (100 / iColumns),
				bIsRTL = sap.ui.getCore().getConfiguration().getRTL(),
				aClasses;

			if (aAriaLabels.length > 0) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + aAriaLabels.join(" ");
			}

			if (sTitle) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Title";
			}

			// Put start/end information after the title
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Descr";

			if (sText) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Text";
			}

			if (oBlocker.getSelected()) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");
			}

			if (oBlocker.getTentative()) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_TENTATIVE");
			}

			oRm.write("<div");
			oRm.writeElementData(oBlocker);
			oRm.writeAttribute("data-sap-level", iBlockerLevel);
			oRm.writeAttribute("data-sap-width", iBlockerWidth);
			oRm.writeAttribute("tabindex", 0);

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}
			oRm.writeAccessibilityState(oBlocker, mAccProps);
			oRm.addClass("sapMSinglePCAppointmentWrap");
			oRm.addClass("sapUiCalendarRowApps"); // TODO: when refactor the CSS of appointments maybe we won't need this class
			if (!sColor && sType !== CalendarDayType.None) {
				oRm.addClass("sapUiCalendarApp" + sType);
			}
			if (sColor) {
				if (sap.ui.getCore().getConfiguration().getRTL()) {
					oRm.addStyle("border-right-color", sColor);
				} else {
					oRm.addStyle("border-left-color", sColor);
				}
			}

			oRm.addStyle("top", iRowHeight * iBlockerLevel + 1 + "px"); // Adding 1px to render all of the blockers 1px below in order to have space on top of them.
			oRm.addStyle(bIsRTL ? "right" : "left", Math.max(iLeftPosition, 0) + "%");
			oRm.addStyle(bIsRTL ? "left" : "right", Math.max(iRightPosition, 0) + "%");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapUiCalendarApp");

			if (oBlocker.getSelected()) {
				oRm.addClass("sapUiCalendarAppSel");
			}

			if (oBlocker.getTentative()) {
				oRm.addClass("sapUiCalendarAppTent");
			}

			if (sIcon) {
				oRm.addClass("sapUiCalendarAppWithIcon");
			}

			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">"); // div element

			// extra content DIV to make some styling possible
			oRm.write("<div");
			oRm.addClass("sapUiCalendarAppCont");

			if (sColor) {
				oRm.addStyle("background-color", oBlocker._getCSSColorForBackground(sColor));
				oRm.writeStyles();
			}

			oRm.writeClasses();
			oRm.write(">"); // div element

			if (iLeftPosition < 0) {
				aClasses = ["sapUiCalendarAppArrowIconLeft", "sapUiCalendarAppArrowIcon"];
				oRm.writeIcon("sap-icon://arrow-left", aClasses, { title: null });
			}

			if (sIcon) {
				aClasses = ["sapUiCalendarAppIcon"];
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

			if (iRightPosition < 0) {
				aClasses = ["sapUiCalendarAppArrowIconRight", "sapUiCalendarAppArrowIcon"];
				oRm.writeIcon("sap-icon://arrow-right", aClasses, { title: null });
			}

			oRm.write("<span id=\"" + sId + "-Descr\" class=\"sapUiInvisibleText\">" +
				oControl._getAppointmentStartEndInfo(oBlocker) + "</span>");

			oRm.write("</div>");

			oRm.write("</div>");
			oRm.write("</div>");
		};

		SinglePlanningCalendarGridRenderer.renderRowHeaders = function (oRm, oControl) {
			var iStartHour = oControl._getVisibleStartHour(),
				iEndHour = oControl._getVisibleEndHour(),
				oStartDate = new Date(),
				oHoursFormat = oControl._getHoursFormat(),
				oAMPMFormat = oControl._getAMPMFormat();

			oRm.write("<div");
			oRm.addClass("sapMSinglePCRowHeaders");
			oRm.writeClasses();
			oRm.write(">");

			for (var i = iStartHour; i <= iEndHour; i++) {
				oStartDate.setHours(i);
				oRm.write("<span");
				oRm.addClass("sapMSinglePCRowHeader");
				oRm.addClass("sapMSinglePCRowHeader" + i);

				if (oControl._shouldHideRowHeader(i)) {
					oRm.addClass("sapMSinglePCRowHeaderHidden");
				}

				oRm.writeClasses();
				oRm.write(">");
				oRm.write(oHoursFormat.format(oStartDate));

				if (oControl._hasAMPM()) {
					oRm.write("<span");
					oRm.addClass("sapMSinglePCRowHeaderAMPM");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write(" " + oAMPMFormat.format(oStartDate));
					oRm.write("</span>");
				}

				oRm.write("</span>"); // END .sapMSinglePCRowHeader
			}

			oRm.write("</div>"); // END .sapMSinglePCRowHeaders
		};

		SinglePlanningCalendarGridRenderer.renderColumns = function (oRm, oControl) {
			var iColumns = oControl._getColumns(),
				oStartDate = oControl.getStartDate(),
				oAppointmentsToRender = oControl._getAppointmentsToRender();

			oRm.write("<div");
			oRm.writeAttribute("role", "grid");
			oRm.writeAttribute("aria-labelledby", InvisibleText.getStaticId("sap.m", "SPC_APPOINTMENTS"));
			oRm.addClass("sapMSinglePCColumns");
			oRm.writeClasses();
			oRm.write(">");

			for (var i = 0; i < iColumns; i++) {
				var oColumnCalDate = new CalendarDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i),
				oFormat = oControl._getDateFormatter(),
					sDate = oFormat.format(oColumnCalDate.toLocalJSDate());

				oRm.write("<div");
				oRm.writeAttribute("data-sap-day", sDate);
				oRm.addClass("sapMSinglePCColumn");

				if (oColumnCalDate.isSame(new CalendarDate())) {
					oRm.addClass("sapMSinglePCColumnToday");
				}

				if (CalendarUtils._isWeekend(oColumnCalDate, oControl._getCoreLocaleData())) {
					oRm.addClass("sapMSinglePCColumnWeekend");
				}

				oRm.writeClasses();
				oRm.write(">");

				this.renderDndPlaceholders(oRm, oControl, oControl._dndPlaceholdersMap[oColumnCalDate]);

				this.renderRows(oRm, oControl, sDate);
				this.renderAppointments(oRm, oControl, oAppointmentsToRender[sDate], oColumnCalDate);
				oRm.write("</div>"); // END .sapMSinglePCColumn
			}

			oRm.write("</div>"); // END .sapMSinglePCColumns
		};

		SinglePlanningCalendarGridRenderer.renderDndPlaceholders = function (oRm, oControl, aPlaceholders) {
			oRm.write("<div class=\"sapMSinglePCOverlay\">");
			aPlaceholders.forEach(oRm.renderControl);
			oRm.write("</div>");
		};

		SinglePlanningCalendarGridRenderer.renderRows = function (oRm, oControl, sDate) {
			var iStartHour = oControl._getVisibleStartHour(),
				iEndHour = oControl._getVisibleEndHour(),
				oFormat = oControl._getDateFormatter(),
				oCellStartDate,
				oCellEndDate;

			for (var i = iStartHour; i <= iEndHour; i++) {
				oCellStartDate = oControl._parseDateStringAndHours(sDate, i);
				oCellEndDate = new Date(oCellStartDate.getFullYear(), oCellStartDate.getMonth(), oCellStartDate.getDate(), oCellStartDate.getHours() + 1);

				oRm.write("<div");
				oRm.addClass("sapMSinglePCRow");

				if (!oControl._isVisibleHour(i)) {
					oRm.addClass("sapMSinglePCNonWorkingRow");
				}

				oRm.writeAttribute("data-sap-hour", i);
				oRm.writeAttribute("data-sap-start-date", oFormat.format(oCellStartDate));
				oRm.writeAttribute("data-sap-end-date", oFormat.format(oCellEndDate));
				oRm.writeAttribute("aria-labelledby", oFormat.format(oCellStartDate) + "-Descr");
				oRm.writeAttribute("tabindex", -1);
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");

				oRm.write("<span");
				oRm.writeAttribute("id", oFormat.format(oCellStartDate) + "-Descr");
				oRm.addClass("sapUiInvisibleText");
				oRm.writeClasses();
				oRm.write(">");
				oRm.write(oControl._getCellStartEndInfo(oCellStartDate, oCellEndDate));
				oRm.write("</span>");

				oRm.write("</div>"); // END .sapMSinglePCRow
			}
		};

		SinglePlanningCalendarGridRenderer.renderAppointments = function (oRm, oControl, oAppointmentsByDate, oColumnDate) {
			var that = this;

			if (oAppointmentsByDate) {
				oRm.write("<div");
				oRm.addClass("sapMSinglePCAppointments");
				oRm.addClass("sapUiCalendarRowVisFilled"); // TODO: when refactor the CSS of appointments maybe we won't need this class

				oRm.writeClasses();
				oRm.write(">");
				oAppointmentsByDate.oAppointmentsList.getIterator().forEach(function (oAppointmentNode) {
					var iMaxLevel = oAppointmentsByDate.iMaxLevel,
						iLevel = oAppointmentNode.level,
						iWidth = oAppointmentNode.width,
						oAppointment = oAppointmentNode.getData();

					that.renderAppointment(oRm, oControl, iMaxLevel, iLevel, iWidth, oAppointment, oColumnDate);
				});
				oRm.write("</div>");
			}
		};

		SinglePlanningCalendarGridRenderer.renderAppointment = function(oRm, oControl, iMaxLevel, iAppointmentLevel, iAppointmentWidth, oAppointment, oColumnDate) {
			var iRowHeight = oControl._getRowHeight(),
				oColumnStartDateAndHour = new UniversalDate(oColumnDate.getYear(), oColumnDate.getMonth(), oColumnDate.getDate(), oControl._getVisibleStartHour()),
				oColumnEndDateAndHour = new UniversalDate(oColumnDate.getYear(), oColumnDate.getMonth(), oColumnDate.getDate(), oControl._getVisibleEndHour(), 59, 59),
				oAppStartDate = oAppointment.getStartDate(),
				oAppEndDate = oAppointment.getEndDate(),
				sTooltip = oAppointment.getTooltip_AsString(),
				sType = oAppointment.getType(),
				sColor = oAppointment.getColor(),
				sTitle = oAppointment.getTitle(),
				sText = oAppointment.getText(),
				sIcon = oAppointment.getIcon(),
				sId = oAppointment.getId(),
				mAccProps = {
					role: "gridcell",
					labelledby: {
						value: InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT"),
						append: true
					}
				},
				aAriaLabels = oControl.getAriaLabelledBy(),
				bAppStartIsOutsideVisibleStartHour = oColumnStartDateAndHour.getTime() > oAppStartDate.getTime(),
				bAppEndIsOutsideVisibleEndHour = oColumnEndDateAndHour.getTime() < oAppEndDate.getTime(),
				iAppTop = bAppStartIsOutsideVisibleStartHour ? 0 : oControl._calculateTopPosition(oAppStartDate),
				iAppBottom = bAppEndIsOutsideVisibleEndHour ? 0 : oControl._calculateBottomPosition(oAppEndDate),
				iAppChunkWidth = 100 / (iMaxLevel + 1),
				sLegendItemType;

			if (aAriaLabels.length > 0) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + aAriaLabels.join(" ");
			}

			if (sTitle) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Title";
			}

			// Put start/end information after the title
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Descr";

			if (sText) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Text";
			}

			if (oAppointment.getSelected()) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");
			}

			if (oAppointment.getTentative()) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_TENTATIVE");
			}

			oRm.write("<div");
			oRm.writeElementData(oAppointment);
			oRm.writeAttribute("data-sap-level", iAppointmentLevel);
			oRm.writeAttribute("data-sap-width", iAppointmentWidth);
			oRm.writeAttribute("tabindex", 0);

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}
			oRm.writeAccessibilityState(oAppointment, mAccProps);
			oRm.addClass("sapMSinglePCAppointmentWrap");
			oRm.addClass("sapUiCalendarRowApps"); // TODO: when refactor the CSS of appointments maybe we won't need this class
			if (!sColor && sType !== CalendarDayType.None) {
				oRm.addClass("sapUiCalendarApp" + sType);
			}
			if (sColor) {
				if (sap.ui.getCore().getConfiguration().getRTL()) {
					oRm.addStyle("border-right-color", sColor);
				} else {
					oRm.addStyle("border-left-color", sColor);
				}
			}
			oRm.addStyle("top", iAppTop + "px");
			oRm.addStyle("bottom", iAppBottom + "px");
			oRm.addStyle(sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left", iAppChunkWidth * iAppointmentLevel + "%");
			oRm.addStyle("width", iAppChunkWidth * iAppointmentWidth + "%"); // TODO: take into account the levels
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapUiCalendarApp");

			oRm.addStyle("min-height", (iRowHeight - (iVerticalPaddingBetweenAppointments + iAppointmentBottomPadding + iAppointmentTopPadding)) / 2 + "px");

			if (oAppointment.getSelected()) {
				oRm.addClass("sapUiCalendarAppSel");
			}

			if (oAppointment.getTentative()) {
				oRm.addClass("sapUiCalendarAppTent");
			}

			// if (!sText) {
			// 	oRm.addClass("sapUiCalendarAppTitleOnly");
			// }

			if (sIcon) {
				oRm.addClass("sapUiCalendarAppWithIcon");
			}

			// if (!bRelativePos) {
			// 	// write position
			// 	if (oRow._bRTL) {
			// 		oRm.addStyle("right", oAppointmentInfo.begin + "%");
			// 		oRm.addStyle("left", oAppointmentInfo.end + "%");
			// 	} else {
			// 		oRm.addStyle("left", oAppointmentInfo.begin + "%");
			// 		oRm.addStyle("right", oAppointmentInfo.end + "%");
			// 	}
			// }

			// This makes the appointment focusable
			// if (oRow._sFocusedAppointmentId == sId) {
			// 	oRm.writeAttribute("tabindex", "0");
			// } else {
			// 	oRm.writeAttribute("tabindex", "-1");
			// }

			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">"); // div element

			// extra content DIV to make some styling possible
			oRm.write("<div");
			oRm.addClass("sapUiCalendarAppCont");

			if (sColor) {
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
			// var sAriaText = oRow._oRb.getText("CALENDAR_START_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getStartDate());
			// sAriaText = sAriaText + "; " + oRow._oRb.getText("CALENDAR_END_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getEndDate());
			// if (sTooltip) {
			// 	sAriaText = sAriaText + "; " + sTooltip;
			// }

			// if (sType && sType != CalendarDayType.None) {
			//
			// 	sAriaText = sAriaText + "; " + this.getAriaTextForType(sType, aTypes);
			// }

			oRm.write("<span id=\"" + sId + "-Descr\" class=\"sapUiInvisibleText\">" +
				oControl._getAppointmentStartEndInfo(oAppointment));
			if (oControl._sLegendId) {
				sLegendItemType = oControl._findCorrespondingLegendItem(oControl, oAppointment);
				oRm.writeEscaped(sLegendItemType);
			}
			oRm.write("</span>");

			oRm.write("</div>");

			if (oControl.getEnableAppointmentsResize()
				&& !bAppStartIsOutsideVisibleStartHour
				&& !bAppEndIsOutsideVisibleEndHour) {
				this.renderResizeHandles(oRm);
			}

			oRm.write("</div>");
			oRm.write("</div>");
		};

		SinglePlanningCalendarGridRenderer.renderNowMarker = function (oRm, oControl) {
			var oDate = new Date();

			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-nowMarker");
			oRm.addStyle("top", oControl._calculateTopPosition(oDate) + "px");
			oRm.addClass("sapMSinglePCNowMarker");

			if (oControl._isOutsideVisibleHours(oDate.getHours())) {
				oRm.addClass("sapMSinglePCNowMarkerHidden");
			}

			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.write("<span");
			oRm.writeAttribute("id", oControl.getId() + "-nowMarkerText");
			oRm.addClass("sapMSinglePCNowMarkerText");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write(oControl._formatTimeAsString(oDate));
			if (oControl._hasAMPM()) {
				oRm.write("<span");
				oRm.writeAttribute("id", oControl.getId() + "-nowMarkerAMPM");
				oRm.addClass("sapMSinglePCNowMarkerAMPM");
				oRm.writeClasses();
				oRm.write(">");
				oRm.write(oControl._addAMPM(oDate));
				oRm.write("</span>");
			}
			oRm.write("</span>"); // END .sapMSinglePCNowMarkerText
			oRm.write("</div>"); // END .sapMSinglePCNowMarker
		};

		SinglePlanningCalendarGridRenderer.renderResizeHandles = function(oRm) {
			oRm.write("<span");
			oRm.addClass("sapMSinglePCAppResizeHandleBottom");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</span>");
			oRm.write("<span");
			oRm.addClass("sapMSinglePCAppResizeHandleTop");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</span>");
		};

		return SinglePlanningCalendarGridRenderer;

	}, true /* bExport */);
