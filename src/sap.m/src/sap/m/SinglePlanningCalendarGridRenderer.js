/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/calendar/CalendarDate', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/core/date/UniversalDate', 'sap/ui/core/InvisibleText', './PlanningCalendarLegend', 'sap/ui/unified/library'],
	function(CalendarDate, CalendarUtils, UniversalDate, InvisibleText, PlanningCalendarLegend, unifiedLibrary) {
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
		var SinglePlanningCalendarGridRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		SinglePlanningCalendarGridRenderer.render = function (oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.class("sapMSinglePCGrid");
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("_columnHeaders"));
			this.renderBlockersContainer(oRm, oControl);
			oRm.openStart("div");
			oRm.attr("role", "grid");
			oRm.class("sapMSinglePCGridContent");
			oRm.openEnd();
			this.renderRowHeaders(oRm, oControl);
			this.renderNowMarker(oRm, oControl);
			this.renderColumns(oRm, oControl);
			oRm.close("div"); // END .sapMSinglePCGridContent
			oRm.close("div"); // END .sapMSinglePCGrid
		};

		SinglePlanningCalendarGridRenderer.renderBlockersContainer = function (oRm, oControl) {
			var iColumns = oControl._getColumns(),
				iMaxLevel = oControl._getBlockersToRender().iMaxlevel,
				oStartDate = oControl.getStartDate(),
				// hackie thing to calculate the container width. When we have more than 1 line of blockers - we must add 3 px in order to render the blockers visually in the container.
				iContainerHeight = (iMaxLevel + 1) * oControl._getBlockerRowHeight() + 3,
				oFormat = oControl._getDateFormatter(),
				aSpecialDates = oControl.getSpecialDates(),
				oCalendarDate = CalendarDate.fromLocalJSDate(oStartDate),
				aDayTypes = oControl._getColumnHeaders()._getDateTypes(oCalendarDate),
				oType,
				sLegendItemType;


			oRm.openStart("div");
			oRm.attr("role", "grid");
			oRm.class("sapMSinglePCBlockersRow");
			oRm.openEnd();

			oRm.openStart("div");
			oRm.attr("role", "row");
			oRm.class("sapMSinglePCBlockersColumns");

			//day view
			if (aSpecialDates && oControl._getColumns() === 1) {
				if (aDayTypes && aDayTypes[0]) {
					oType = aDayTypes[0];
					oRm.class("sapUiCalItem" + oType.type);
					sLegendItemType = PlanningCalendarLegend.findLegendItemForItem(sap.ui.getCore().byId(oControl._sLegendId), oType);
				}

				oRm.class("sapMSpecialDaysInDayView");
			}

			oRm.style("height", iContainerHeight + "px");
			oRm.openEnd();

			this.renderDndPlaceholders(oRm, oControl, oControl.getAggregation("_blockersPlaceholders"));

			for (var i = 0; i < iColumns; i++) {
				var oColumnCalDate = new CalendarDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i);

				oRm.openStart("div");
				oRm.attr("role", "gridcell");
				oRm.attr("data-sap-start-date", oFormat.format(oColumnCalDate.toLocalJSDate()));
				oRm.attr("data-sap-end-date", oFormat.format(oColumnCalDate.toLocalJSDate()));
				oRm.attr("aria-labelledby", InvisibleText.getStaticId("sap.m", "SPC_BLOCKERS") +
				" " + "fullDay-" + oFormat.format(oColumnCalDate.toLocalJSDate()) + "-Descr");
				oRm.class("sapMSinglePCBlockersColumn");
				oRm.attr("tabindex", -1);

				if (oColumnCalDate.isSame(new CalendarDate())) {
					oRm.class("sapMSinglePCBlockersColumnToday");
				}

				if (CalendarUtils._isWeekend(oColumnCalDate, oControl._getCoreLocaleData())) {
					oRm.class("sapMSinglePCBlockersColumnWeekend");
				}

				oRm.openEnd();

				oRm.openStart("span", "fullDay-" + oFormat.format(oColumnCalDate.toLocalJSDate()) + "-Descr");
				oRm.class("sapUiInvisibleText");
				oRm.openEnd();
				oRm.text(oControl._getCellStartEndInfo(oColumnCalDate.toLocalJSDate()));
				//acc for day view + special dates + legend
				if (oControl._sLegendId && sLegendItemType) {
					oRm.text(sLegendItemType);
				}
				oRm.close("span");

				oRm.close("div"); // END .sapMSinglePCColumn
			}
			this.renderBlockers(oRm, oControl);
			oRm.close("div"); // END .sapMSinglePCColumns
			oRm.close("div"); // END .sapMSinglePCGridBlockers
		};

		SinglePlanningCalendarGridRenderer.renderBlockers = function (oRm, oControl) {
			var that = this,
				oBlockersList = oControl._getBlockersToRender().oBlockersList;

			oRm.openStart("div");
			oRm.attr("role", "grid");
			oRm.attr("aria-labelledby", InvisibleText.getStaticId("sap.m", "SPC_BLOCKERS"));
			oRm.class("sapMSinglePCBlockers");
			oRm.class("sapUiCalendarRowVisFilled"); // TODO: when refactor the CSS of appointments maybe we won't need this class

			oRm.openEnd();
			oBlockersList.getIterator().forEach(function (oBlocker) {
				that.renderBlockerAppointment(oRm, oControl, oBlocker);
			});
			oRm.close("div"); // END .sapMSinglePCBlockers
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
					},
					// Setting aria-selected attribute to all blockers
					selected: !!oBlocker.getSelected()
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

			if (oBlocker.getTentative()) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_TENTATIVE");
			}

			oRm.openStart("div", oBlocker);
			oRm.attr("data-sap-level", iBlockerLevel);
			oRm.attr("data-sap-width", iBlockerWidth);
			oRm.attr("tabindex", 0);

			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}
			oRm.accessibilityState(oBlocker, mAccProps);
			oRm.class("sapMSinglePCAppointmentWrap");
			oRm.class("sapUiCalendarRowApps"); // TODO: when refactor the CSS of appointments maybe we won't need this class
			if (!sColor && sType !== CalendarDayType.None) {
				oRm.class("sapUiCalendarApp" + sType);
			}
			if (sColor) {
				if (sap.ui.getCore().getConfiguration().getRTL()) {
					oRm.style("border-right-color", sColor);
				} else {
					oRm.style("border-left-color", sColor);
				}
			}

			oRm.style("top", iRowHeight * iBlockerLevel + 1 + "px"); // Adding 1px to render all of the blockers 1px below in order to have space on top of them.
			oRm.style(bIsRTL ? "right" : "left", Math.max(iLeftPosition, 0) + "%");
			oRm.style(bIsRTL ? "left" : "right", Math.max(iRightPosition, 0) + "%");
			oRm.openEnd();

			oRm.openStart("div");
			oRm.class("sapUiCalendarApp");

			if (oBlocker.getSelected()) {
				oRm.class("sapUiCalendarAppSel");
			}

			if (oBlocker.getTentative()) {
				oRm.class("sapUiCalendarAppTent");
			}

			if (sIcon) {
				oRm.class("sapUiCalendarAppWithIcon");
			}

			oRm.openEnd(); // div element

			// extra content DIV to make some styling possible
			oRm.openStart("div");
			oRm.class("sapUiCalendarAppCont");

			if (sColor) {
				oRm.style("background-color", oBlocker._getCSSColorForBackground(sColor));
			}

			oRm.openEnd(); // div element

			if (iLeftPosition < 0) {
				aClasses = ["sapUiCalendarAppArrowIconLeft", "sapUiCalendarAppArrowIcon"];
				oRm.icon("sap-icon://arrow-left", aClasses, { title: null });
			}

			if (sIcon) {
				aClasses = ["sapUiCalendarAppIcon"];
				var mAttributes = {};

				mAttributes["id"] = sId + "-Icon";
				mAttributes["title"] = null;
				oRm.icon(sIcon, aClasses, mAttributes);
			}

			if (sTitle) {
				oRm.openStart("span", sId + "-Title");
				oRm.class("sapUiCalendarAppTitle");
				oRm.openEnd(); // span element
				oRm.text(sTitle, true);
				oRm.close("span");
			}

			if (iRightPosition < 0) {
				aClasses = ["sapUiCalendarAppArrowIconRight", "sapUiCalendarAppArrowIcon"];
				oRm.icon("sap-icon://arrow-right", aClasses, { title: null });
			}

			oRm.openStart("span", sId + "-Descr");
			oRm.class("sapUiInvisibleText");
			oRm.openEnd(); // span element
			oRm.text(oControl._getAppointmentAnnouncementInfo(oBlocker));
			oRm.close("span");


			oRm.close("div");

			oRm.close("div");
			oRm.close("div");
		};

		SinglePlanningCalendarGridRenderer.renderRowHeaders = function (oRm, oControl) {
			var iStartHour = oControl._getVisibleStartHour(),
				iEndHour = oControl._getVisibleEndHour(),
				oStartDate = new Date(),
				oHoursFormat = oControl._getHoursFormat(),
				oAMPMFormat = oControl._getAMPMFormat();

			oRm.openStart("div");
			oRm.class("sapMSinglePCRowHeaders");
			oRm.openEnd();

			for (var i = iStartHour; i <= iEndHour; i++) {
				oStartDate.setHours(i);
				oRm.openStart("span");
				oRm.class("sapMSinglePCRowHeader");
				oRm.class("sapMSinglePCRowHeader" + i);

				if (oControl._shouldHideRowHeader(i)) {
					oRm.class("sapMSinglePCRowHeaderHidden");
				}

				oRm.openEnd();
				oRm.text(oHoursFormat.format(oStartDate));

				if (oControl._hasAMPM()) {
					oRm.openStart("span");
					oRm.class("sapMSinglePCRowHeaderAMPM");
					oRm.openEnd();
					oRm.text(" " + oAMPMFormat.format(oStartDate));
					oRm.close("span");
				}

				oRm.close("span"); // END .sapMSinglePCRowHeader
			}

			oRm.close("div"); // END .sapMSinglePCRowHeaders
		};

		SinglePlanningCalendarGridRenderer.renderColumns = function (oRm, oControl) {
			var iColumns = oControl._getColumns(),
				oStartDate = oControl.getStartDate(),
				oAppointmentsToRender = oControl._getAppointmentsToRender();

			oRm.openStart("div");
			oRm.attr("role", "grid");
			oRm.attr("aria-labelledby", InvisibleText.getStaticId("sap.m", "SPC_APPOINTMENTS"));
			oRm.class("sapMSinglePCColumns");
			oRm.openEnd();

			for (var i = 0; i < iColumns; i++) {
				var oColumnCalDate = new CalendarDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i),
				oFormat = oControl._getDateFormatter(),
					sDate = oFormat.format(oColumnCalDate.toLocalJSDate());

				oRm.openStart("div");
				oRm.attr("data-sap-day", sDate);
				oRm.class("sapMSinglePCColumn");

				if (oColumnCalDate.isSame(new CalendarDate())) {
					oRm.class("sapMSinglePCColumnToday");
				}

				if (CalendarUtils._isWeekend(oColumnCalDate, oControl._getCoreLocaleData())) {
					oRm.class("sapMSinglePCColumnWeekend");
				}

				oRm.openEnd();

				this.renderDndPlaceholders(oRm, oControl, oControl._dndPlaceholdersMap[oColumnCalDate]);

				this.renderRows(oRm, oControl, sDate);
				this.renderAppointments(oRm, oControl, oAppointmentsToRender[sDate], oColumnCalDate);
				oRm.close("div"); // END .sapMSinglePCColumn
			}

			oRm.close("div"); // END .sapMSinglePCColumns
		};

		SinglePlanningCalendarGridRenderer.renderDndPlaceholders = function (oRm, oControl, aPlaceholders) {
			oRm.openStart("div");
			oRm.class("sapMSinglePCOverlay");
			oRm.openEnd(); // span element
			aPlaceholders.forEach(oRm.renderControl);
			oRm.close("div");
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

				oRm.openStart("div");
				oRm.class("sapMSinglePCRow");

				if (!oControl._isVisibleHour(i)) {
					oRm.class("sapMSinglePCNonWorkingRow");
				}

				oRm.attr("data-sap-hour", i);
				oRm.attr("data-sap-start-date", oFormat.format(oCellStartDate));
				oRm.attr("data-sap-end-date", oFormat.format(oCellEndDate));
				oRm.attr("aria-labelledby", oFormat.format(oCellStartDate) + "-Descr");
				oRm.attr("tabindex", -1);
				oRm.openEnd();

				oRm.openStart("span", oFormat.format(oCellStartDate) + "-Descr");
				oRm.class("sapUiInvisibleText");
				oRm.openEnd();
				oRm.text(oControl._getCellStartEndInfo(oCellStartDate, oCellEndDate));
				oRm.close("span");

				oRm.close("div"); // END .sapMSinglePCRow
			}
		};

		SinglePlanningCalendarGridRenderer.renderAppointments = function (oRm, oControl, oAppointmentsByDate, oColumnDate) {
			var that = this;

			if (oAppointmentsByDate) {
				oRm.openStart("div");
				oRm.class("sapMSinglePCAppointments");
				oRm.class("sapUiCalendarRowVisFilled"); // TODO: when refactor the CSS of appointments maybe we won't need this class

				oRm.openEnd();
				oAppointmentsByDate.oAppointmentsList.getIterator().forEach(function (oAppointmentNode) {
					var iMaxLevel = oAppointmentsByDate.iMaxLevel,
						iLevel = oAppointmentNode.level,
						iWidth = oAppointmentNode.width,
						oAppointment = oAppointmentNode.getData();

					that.renderAppointment(oRm, oControl, iMaxLevel, iLevel, iWidth, oAppointment, oColumnDate);
				});
				oRm.close("div");
			}
		};

		SinglePlanningCalendarGridRenderer.renderAppointment = function(oRm, oControl, iMaxLevel, iAppointmentLevel, iAppointmentWidth, oAppointment, oColumnDate) {
			var oGridCalStart = CalendarDate.fromLocalJSDate(oControl.getStartDate()),
				oGridCalEnd = new CalendarDate(oGridCalStart),
				iRowHeight = oControl._getRowHeight(),
				oColumnStartDateAndHour = new UniversalDate(oColumnDate.getYear(), oColumnDate.getMonth(), oColumnDate.getDate(), oControl._getVisibleStartHour()),
				oColumnEndDateAndHour = new UniversalDate(oColumnDate.getYear(), oColumnDate.getMonth(), oColumnDate.getDate(), oControl._getVisibleEndHour(), 59, 59),
				oAppStartDate = oAppointment.getStartDate(),
				oAppEndDate = oAppointment.getEndDate(),
				oAppCalStart = CalendarDate.fromLocalJSDate(oAppStartDate),
				oAppCalEnd = CalendarDate.fromLocalJSDate(oAppEndDate),
				sTooltip = oAppointment.getTooltip_AsString(),
				sType = oAppointment.getType(),
				sColor = oAppointment.getColor(),
				sTitle = oAppointment.getTitle(),
				sText = oAppointment.getText(),
				sIcon = oAppointment.getIcon(),
				sId = oAppointment.getId(),
				sLineClamp = this._getLineClamp(oAppStartDate, oAppEndDate),
				mAccProps = {
					role: "gridcell",
					labelledby: {
						value: InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT"),
						append: true
					},
					// Setting aria-selected attribute to all appointments
					selected: !!oAppointment.getSelected()
				},
				aAriaLabels = oControl.getAriaLabelledBy(),
				bAppStartIsOutsideVisibleStartHour = oColumnStartDateAndHour.getTime() > oAppStartDate.getTime(),
				bAppEndIsOutsideVisibleEndHour = oColumnEndDateAndHour.getTime() < oAppEndDate.getTime(),
				iAppTop = bAppStartIsOutsideVisibleStartHour ? 0 : oControl._calculateTopPosition(oAppStartDate),
				iAppBottom = bAppEndIsOutsideVisibleEndHour ? 0 : oControl._calculateBottomPosition(oAppEndDate),
				iAppChunkWidth = 100 / (iMaxLevel + 1),
				iStartDayDiff,
				iEndDayDiff,
				bArrowLeft,
				bArrowRight,
				aClasses;

			oGridCalEnd.setDate(oGridCalEnd.getDate() + oControl._getColumns() - 1);
			iStartDayDiff = CalendarUtils._daysBetween(oAppCalStart, oGridCalStart);
			iEndDayDiff = CalendarUtils._daysBetween(oGridCalEnd, oAppCalEnd);
			bArrowLeft = oColumnDate.isSame(oGridCalStart);
			bArrowRight = oColumnDate.isSame(oGridCalEnd);

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

			if (oAppointment.getTentative()) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_TENTATIVE");
			}

			oRm.openStart("div", oAppointment);
			oRm.attr("data-sap-level", iAppointmentLevel);
			oRm.attr("data-sap-width", iAppointmentWidth);
			oRm.attr("tabindex", 0);

			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}
			oRm.accessibilityState(oAppointment, mAccProps);
			oRm.class("sapMSinglePCAppointmentWrap");
			oRm.class("sapUiCalendarRowApps"); // TODO: when refactor the CSS of appointments maybe we won't need this class
			if (!sColor && sType !== CalendarDayType.None) {
				oRm.class("sapUiCalendarApp" + sType);
			}
			if (sColor) {
				if (sap.ui.getCore().getConfiguration().getRTL()) {
					oRm.style("border-right-color", sColor);
				} else {
					oRm.style("border-left-color", sColor);
				}
			}
			oRm.style("top", iAppTop + "px");
			oRm.style("bottom", iAppBottom + "px");
			oRm.style(sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left", iAppChunkWidth * iAppointmentLevel + "%");
			oRm.style("width", iAppChunkWidth * iAppointmentWidth + "%"); // TODO: take into account the levels
			oRm.openEnd();

			oRm.openStart("div");
			oRm.class("sapUiCalendarApp");

			oRm.style("min-height", (iRowHeight - (iVerticalPaddingBetweenAppointments + iAppointmentBottomPadding + iAppointmentTopPadding)) / 2 + "px");

			if (oAppointment.getSelected()) {
				oRm.class("sapUiCalendarAppSel");
			}

			if (oAppointment.getTentative()) {
				oRm.class("sapUiCalendarAppTent");
			}

			// if (!sText) {
			// 	oRm.class("sapUiCalendarAppTitleOnly");
			// }

			if (sIcon) {
				oRm.class("sapUiCalendarAppWithIcon");
			}

			// if (!bRelativePos) {
			// 	// write position
			// 	if (oRow._bRTL) {
			// 		oRm.style("right", oAppointmentInfo.begin + "%");
			// 		oRm.style("left", oAppointmentInfo.end + "%");
			// 	} else {
			// 		oRm.style("left", oAppointmentInfo.begin + "%");
			// 		oRm.style("right", oAppointmentInfo.end + "%");
			// 	}
			// }

			// This makes the appointment focusable
			// if (oRow._sFocusedAppointmentId == sId) {
			// 	oRm.attr("tabindex", "0");
			// } else {
			// 	oRm.attr("tabindex", "-1");
			// }

			oRm.openEnd(); // div element

			// extra content DIV to make some styling possible
			oRm.openStart("div");
			oRm.class("sapUiCalendarAppCont");

			if (sColor) {
				oRm.style("background-color", oAppointment._getCSSColorForBackground(sColor));
			}

			oRm.openEnd(); // div element

			if (bArrowLeft && iStartDayDiff < 0) {
				aClasses = ["sapUiCalendarAppArrowIconLeft", "sapUiCalendarAppArrowIcon"];
				oRm.icon("sap-icon://arrow-left", aClasses, { title: null });
			}

			if (sIcon) {
				aClasses = ["sapUiCalendarAppIcon"];
				var mAttributes = {};

				mAttributes["id"] = sId + "-Icon";
				mAttributes["title"] = null;
				oRm.icon(sIcon, aClasses, mAttributes);
			}

			oRm.openStart("div");
			oRm.class("sapUiCalendarAppTitleWrapper");
			oRm.class("sapUiSPCAppLineClamp" + sLineClamp);
			oRm.openEnd();

			if (sTitle) {
				oRm.openStart("span", sId + "-Title");
				oRm.class("sapUiCalendarAppTitle");
				oRm.openEnd(); // span element
				oRm.text(sTitle, true);
				oRm.close("span");
			}

			if (sText) {
				oRm.openStart("span", sId + "-Text");
				oRm.class("sapUiCalendarAppText");
				oRm.openEnd(); // span element
				oRm.text(sText, true);
				oRm.close("span");
			}

			oRm.close("div");

			if (bArrowRight && iEndDayDiff < 0) {
				aClasses = ["sapUiCalendarAppArrowIconRight", "sapUiCalendarAppArrowIcon"];
				oRm.icon("sap-icon://arrow-right", aClasses, { title: null });
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

			oRm.openStart("span", sId + "-Descr");
			oRm.class("sapUiInvisibleText");
			oRm.openEnd(); // span element
			oRm.text(oControl._getAppointmentAnnouncementInfo(oAppointment));
			oRm.close("span");

			oRm.close("div");

			if (oControl.getEnableAppointmentsResize()
				&& !bAppStartIsOutsideVisibleStartHour
				&& !bAppEndIsOutsideVisibleEndHour) {
				this.renderResizeHandles(oRm);
			}

			oRm.close("div");
			oRm.close("div");
		};

		SinglePlanningCalendarGridRenderer.renderNowMarker = function (oRm, oControl) {
			var oDate = new Date();

			oRm.openStart("div", oControl.getId() + "-nowMarker");
			oRm.style("top", oControl._calculateTopPosition(oDate) + "px");
			oRm.class("sapMSinglePCNowMarker");

			if (!oControl._isVisibleHour(oDate.getHours())) {
				oRm.class("sapMSinglePCNowMarkerHidden");
			}

			oRm.openEnd();
			oRm.openStart("span", oControl.getId() + "-nowMarkerText");
			oRm.class("sapMSinglePCNowMarkerText");
			oRm.openEnd();
			oRm.text(oControl._formatTimeAsString(oDate));
			if (oControl._hasAMPM()) {
				oRm.openStart("span", oControl.getId() + "-nowMarkerAMPM");
				oRm.class("sapMSinglePCNowMarkerAMPM");
				oRm.openEnd();
				oRm.text(oControl._addAMPM(oDate));
				oRm.close("span");
			}
			oRm.close("span"); // END .sapMSinglePCNowMarkerText
			oRm.close("div"); // END .sapMSinglePCNowMarker
		};

		SinglePlanningCalendarGridRenderer.renderResizeHandles = function(oRm) {
			oRm.openStart("span");
			oRm.class("sapMSinglePCAppResizeHandleBottom");
			oRm.openEnd();
			oRm.close("span");
			oRm.openStart("span");
			oRm.class("sapMSinglePCAppResizeHandleTop");
			oRm.openEnd();
			oRm.close("span");
		};

		/**
		 * Calculates number of text lines that can be placed inside an appointment
		 * depending of its length in minutes.
		 *
		 * @param {Date} oAppStartDate start date of the appointment
		 * @param {Date} oAppEndDate end date of the appointment
		 * @return {String} Returns maximum allowed rows for the appointment as string
		 * @private
		 */
		SinglePlanningCalendarGridRenderer._getLineClamp = function (oAppStartDate, oAppEndDate) {
			var iMinutes = CalendarUtils._minutesBetween(oAppStartDate, oAppEndDate);

			if (iMinutes >= 51 && iMinutes < 69) {
				return "2";
			} else if (iMinutes >= 69 && iMinutes < 90) {
				return "3"; // maximum 3 lines of text will fit
			} else if (iMinutes >= 90 && iMinutes < 110) {
				return "4"; // maximum 4 lines of text will fit
			} else if (iMinutes >= 110 && iMinutes < 130) {
				return "5"; // maximum 5 lines of text will fit
			} else if (iMinutes >= 130 && iMinutes < 150) {
				return "6"; // 6 lines of text will fit
			} else if (iMinutes >= 150 && iMinutes < 170) {
				return "7"; // 7 lines of text will fit
			} else if (iMinutes >= 170 && iMinutes < 190) {
				return "8"; // 8 lines of text will fit
			} else if (iMinutes >= 190) {
				return "9"; // 9 lines of text will fit
			} else {
				return "1"; // maximum 1 lines of text will fit
			}
		};

		return SinglePlanningCalendarGridRenderer;

	}, true /* bExport */);
