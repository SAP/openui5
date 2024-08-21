/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/base/i18n/Formatting',
	'sap/base/i18n/Localization',
	'sap/ui/core/Element',
	'sap/ui/core/Theming',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/Month',
	'sap/ui/core/IconPool',// side effect: required when calling RenderManager#icon
	'./PlanningCalendarLegend',
	'sap/ui/core/InvisibleText',
	'sap/ui/unified/library',
	'sap/ui/core/date/UI5Date'
], function(
	Formatting,
	Localization,
	Element,
	Theming,
	CalendarDate,
	CalendarUtils,
	Month,
	_IconPool,
	PlanningCalendarLegend,
	InvisibleText,
	unifiedLibrary,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	/**
	 * SinglePlanningCalendarMonthGrid renderer.
	 * @namespace
	 */
	var SinglePlanningCalendarMonthGridRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.SinglePlanningCalendarMonthGrid} oControl An object representation of the control that should be rendered
	 */
	SinglePlanningCalendarMonthGridRenderer.render = function(oRm, oControl) {
		var oLocaleData = oControl._getCoreLocaleData();
		var oDensitySizes = oControl._getDensitySizes();

		oRm.openStart("div", oControl);
		oRm.class("sapMSinglePCGrid");
		oRm.class("sapMSPCMonthGrid");
		oRm.openEnd();

		this.renderDayNames(oRm, oControl, oLocaleData);

		oRm.openStart("div");
		oRm.class("sapMSinglePCGridContent");
		oRm.openEnd();

		this.renderCells(oRm, oControl, oLocaleData, oDensitySizes);

		oRm.close("div"); // END .sapMSinglePCGridContent
		oRm.close("div"); // END .sapMSinglePCGrid
	};

	SinglePlanningCalendarMonthGridRenderer.renderCells = function(oRm, oControl, oLocaleData, oDensitySizes) {
		var aCells = oControl._getCells(),
			aVerticalLabels = oControl._getVerticalLabels(),
			iColumns = oControl._getColumns(),
			aMoreCountPerCell = [],
			aAppsPerDay = [],
			iCellIndex,
			oDay,
			aApps,
			aPreviousWeekApps,
			aPreviousWeekAppsPerDay = [],
			iMoreCount,
			iWeekMaxAppCount,
			i,
			j;

		for (i = 0; i < oControl._getRows(); i++) {
			iWeekMaxAppCount = 0;

			oRm.openStart("div");
			oRm.attr("role", "grid");
			oRm.class("sapMSPCMonthWeek");
			oRm.openEnd();

			// render week number
			oRm.openStart("div");
			oRm.class("sapMSPCMonthWeekNumber");
			oRm.openEnd();
			oRm.text(aVerticalLabels[i]);
			oRm.close("div");

			for (j = 0; j < iColumns; j++) {
				iCellIndex = i * iColumns + j;
				oDay = aCells[iCellIndex];
				aApps = oControl._getAppointmetsForADay(oDay);
				aPreviousWeekApps = oControl._getPreviousAppointmetsForADay(oDay);
				aPreviousWeekAppsPerDay.push(aPreviousWeekApps);
				iMoreCount = oControl._aMoreCountPerDay[iCellIndex];
				aMoreCountPerCell.push(iMoreCount);
				aAppsPerDay.push(aApps);

				iWeekMaxAppCount = Math.max(iWeekMaxAppCount, oControl._aAppsLevelsPerDay[iCellIndex].length);
			}

			oRm.openStart("div");
			oRm.class("sapMSPCMonthDays");
			oRm.class("sapMSPCMonthDaysMax" + iWeekMaxAppCount);
			oRm.attr("role", "row");
			oRm.openEnd();

			oRm.openStart("div");
			oRm.attr("role", "gridcell" );
			oRm.openEnd();

			oRm.openStart("div");
			oRm.class("sapMSinglePCBlockers");
			oRm.class("sapUiCalendarRowVisFilled");
			oRm.attr("role", "list" );
			oRm.openEnd();

			for (j = 0; j < iColumns; j++) {
				iCellIndex = i * iColumns + j;
				oDay = aCells[iCellIndex];

				// render appointments which started in previous rows
				if (j === 0) {
					this.renderAppointments(oRm, oControl, aPreviousWeekAppsPerDay[iCellIndex], j, aMoreCountPerCell[iCellIndex], oDensitySizes, i, oDay, aCells);
				}

				this.renderAppointments(oRm, oControl, aAppsPerDay[iCellIndex], j, aMoreCountPerCell[iCellIndex], oDensitySizes, i, oDay, aCells);
			}

			oRm.close("div"); // end appointments
			oRm.close("div");

			for (j = 0; j < iColumns; j++) {
				iCellIndex = i * iColumns + j;
				oDay = aCells[iCellIndex];
				this.renderDay(oRm, oControl, oDay, oLocaleData, aMoreCountPerCell[iCellIndex], iCellIndex);
			}
			oRm.close("div"); // end cells
			oRm.close("div"); // end grid
		}
	};

	SinglePlanningCalendarMonthGridRenderer.renderDay = function(oRm, oControl, oDay, oLocaleData, more, iCellIndex) {
		var aSpecialDates = oControl._getSpecialDates(),
			aDayTypes = Month.prototype._getDateTypes.call(oControl, oDay),
			oFormat = oControl._getDateFormatter(),
			bToday = oDay.isSame(CalendarDate.fromLocalJSDate(UI5Date.getInstance())),
			oType,
			sLegendItemType,
			sMoreLinkDescId;

		oRm.openStart("div");
		oRm.class("sapMSPCMonthDay");
		if (oControl._checkDateSelected(oDay)) {
			oRm.class("sapMSPCMonthDaySelected");
		}
		if (bToday) {
			oRm.class("sapMSPCMonthDayToday");
		}
		oRm.attr("role", "gridcell");

		if (oControl._isNonWorkingDay(oDay)) {
			oRm.class("nonWorkingTimeframe");
		}

		if (aSpecialDates) {
			if (aDayTypes && aDayTypes[0]) {
				oType = aDayTypes[0];
				oRm.class("sapUiCalendarSpecialDay" + oType.type);
				sLegendItemType = PlanningCalendarLegend.findLegendItemForItem(Element.getElementById(oControl._sLegendId), oType);
			}
		}

		oRm.attr("sap-ui-date", oDay.valueOf().toString());
		oRm.attr("tabindex", -1);
		oRm.attr("aria-labelledby", oFormat.format(oDay.toLocalJSDate()) + "-Descr");
		oRm.openEnd();

		this.renderDndPlaceholder(oRm, oControl.getAggregation("_appsPlaceholders")[iCellIndex]);

		if (bToday) {
			oRm.openStart("div");
			oRm.class("sapMSPCMonthNowMarker");
			oRm.openEnd();
		}

		oRm.openStart("div");
		oRm.class("specialDateIndicator");

		if (aDayTypes[0]?.color) {
			oRm.style("background-color", aDayTypes[0].color);
		}

		oRm.openEnd();
		oRm.close("div");

		//render day number
		oRm.openStart("div");
		oRm.class("sapMSPCMonthDayNumber");
		oRm.openEnd();
		oRm.text(oDay.getDate());
		oRm.close("div");

		if (more) {
			sMoreLinkDescId = oFormat.format(oDay.toLocalJSDate()) + "-MoreLinkDesc";
			oRm.openStart("div");
			oRm.class("sapMSPCMonthLnkMore");
			oRm.openEnd();

			oRm.renderControl(oControl._getMoreLink(more, oDay, iCellIndex, sMoreLinkDescId));

			oRm.openStart("span", sMoreLinkDescId);
			oRm.class("sapUiInvisibleText");
			oRm.openEnd();
			oRm.text(oControl._getMoreLinkDescription(more, oDay.toLocalJSDate()));
			oRm.close("span");

			oRm.close("div");
		}

		oRm.openStart("span", oFormat.format(oDay.toLocalJSDate()) + "-Descr");
		oRm.class("sapUiInvisibleText");
		oRm.openEnd();
		oRm.text(oControl._getCellStartInfo(oDay.toLocalJSDate()));
		//acc for day view + special dates + legend
		if (oControl._sLegendId && sLegendItemType) {
			oRm.text(sLegendItemType);
		}
		if (oControl._doesContainAppointments(oDay)) {
			oRm.text(oControl._getCellDescription());
		}
		oRm.close("span");

		if (bToday) {
			oRm.close("div"); // close today wrapper
		}

		oRm.close("div");
	};

	SinglePlanningCalendarMonthGridRenderer.renderAppointments = function(oRm, oControl, apps, iColumn, iMore, oDensitySizes, iRow, oDay, aDays) {
		var MAX_APPS = oControl._getMaxAppointments(),
			iMaxLvl = iMore ? MAX_APPS - 2 : MAX_APPS - 1,
			iColumns = oControl._getColumns(),
			iRowEndIndex,
			oApp,
			bRenderDateOutsideRow;

		for (var i = 0; i < apps.length; i++) {
			oApp = apps[i];
			iRowEndIndex = oControl._getRowEndIndex(aDays, aDays.indexOf(oDay), iColumns);

			if (oApp.level <= iMaxLvl) {
				bRenderDateOutsideRow = oApp._nextDay > iRowEndIndex;
				if (oApp._nextDay === undefined || bRenderDateOutsideRow) {
					continue;
				}
				this.renderAppointment(oRm, oControl, oApp, iColumn, oDensitySizes, iRow, oDay);
			} else if (oApp._overflows) {
				//If it's an overflowing appointment, start from first available level of next day.
				oApp.level = oApp._nextDayLevel;
				if (oApp._nextDay && oApp._nextDayLevel < oControl._getMaxAppointments() - 1) {
					this.renderAppointment(oRm, oControl, oApp, oApp._nextDay, oDensitySizes, iRow, oDay);
				}
			}
		}
	};

	SinglePlanningCalendarMonthGridRenderer.renderAppointment = function(oRm, oControl, app, iColumn, oDensitySizes, iRow, oDay) {
		var oAppointment = app.data,
			iWidth = app.width,
			iLevel = app.level,
			aCells = oControl._getCells(),
			iColumns = oControl._getColumns(),
			sTooltip = oAppointment.getTooltip_AsString(),
			sType = oAppointment.getType(),
			sColor = oAppointment.getColor(),
			sTitle = oAppointment.getTitle(),
			sText = oAppointment.getText(),
			sIcon = oAppointment.getIcon(),
			sId = oAppointment.getId(),
			oStartDate = oAppointment.getStartDate(),
			oEndDate = oAppointment.getEndDate(),
			aCustomContent = oAppointment.getCustomContent(),
			bHasCustomContent = !!aCustomContent.length,
			bIsFullDay = !oEndDate || oControl._isAllDayAppointment(oStartDate, oEndDate),
			oValue = bIsFullDay ? InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_ALL_DAY_PREFIX") : InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT"),
			bDraggable = oAppointment.getParent().getEnableAppointmentsDragAndDrop(),
			oToday = oDay && oDay.isSame(CalendarDate.fromLocalJSDate(UI5Date.getInstance())),
			mAccProps = {
				role: "listitem",
				labelledby: {
					value: oValue,
					append: true
				},
				// Prevents aria-selected from being added on the appointment
				selected: null
			},
			iRight = iColumns - iColumn - iWidth,
			bIsRTL = Localization.getRTL(),
			sThemeName = Theming.getTheme(),
			iAppStartDateIndex = oControl._findStartDateIndex(aCells, app, oControl._iStartDayOffset),
			bFirstRenderedDayIsAfterStart = app._nextDay > iAppStartDateIndex,
			oNextDate = aCells[app._nextDay],
			iAppNextDateColumn = oControl._getDateColumn(aCells, oNextDate, iColumns),
			iAppNextDateRow = oControl._getDateRow(aCells, oNextDate, iColumns),
			bNextDateIsWithinRow = iAppNextDateRow === iRow,
			aClasses,
			iBorderThickness,
			iAppEndDateColumn,
			bAppContinuesOutsideCells,
			oEndCalendarDate;

			if (app._overflows || bNextDateIsWithinRow) {

				if (!app._partRendered) {
					app._partRendered = true;
					bFirstRenderedDayIsAfterStart = app._nextDay > iAppStartDateIndex;
					iColumn = iAppNextDateColumn;
					iRight = iColumns - iAppNextDateColumn + 1 - iWidth;
					oEndCalendarDate = CalendarDate.fromLocalJSDate(oEndDate);
					iAppEndDateColumn = oControl._getDateColumn(aCells, oEndCalendarDate, iColumns);

					if (iRight > 0 || bAppContinuesOutsideCells) {
						iRight = iColumns - iAppEndDateColumn - 1;

						if (iAppEndDateColumn < iColumn || bAppContinuesOutsideCells) {
							iRight = 0;
						}
					}
				}
			}
			if (app._overflows) {
				iLevel = app.level;
			}

			if (sThemeName.includes("horizon")){
				if (oToday) {
					iBorderThickness = sThemeName.indexOf("_hc") ? 0.4375 : 0.0625;
				} else {
					iBorderThickness = sThemeName.indexOf("_hc") ? 0.1875 : 0.0625;
				}
			} else {
				if (oToday) {
					iBorderThickness = sThemeName.indexOf("_hc") ? 0.3125 : 0.0625;
				} else {
					iBorderThickness = sThemeName.indexOf("_hc") ? 0.125 : 0.0625;
				}
			}

		iRight = iRight < 0 ? 0 : iRight;

		if (!bHasCustomContent && sTitle) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-" + iColumn + "_" + iRow + "-Title";
		}

		// Put start/end information after the title
		mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-" + iColumn + "_" + iRow + "-Descr";

		if (!bHasCustomContent && sText) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-" + iColumn + "_" + iRow + "-Text";
		}

		if (oAppointment.getTentative()) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_TENTATIVE");
		}

		if (oAppointment.getSelected()) {
			mAccProps["describedby"] = {
				value: InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED"),
				append: true
			};
		}

		oRm.openStart("div", oAppointment.getId() + "-" + iColumn + "_" + iRow);
		oRm.attr("draggable", bDraggable);
		oRm.attr("data-sap-ui-draggable", bDraggable);
		oRm.attr("data-sap-ui-related", oAppointment.getId());
		oRm.attr("data-sap-level", iLevel);
		oRm.attr("data-sap-width", iWidth);
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
			if (Localization.getRTL()) {
				oRm.style("border-right-color", sColor);
			} else {
				oRm.style("border-left-color", sColor);
			}
		}
		oRm.style(bIsRTL ? "right" : "left", "calc(" + (iColumn * 100) / iColumns + "% + " + iBorderThickness + "rem)");
		oRm.style(bIsRTL ? "left" : "right", "calc(" + (iRight * 100) / iColumns + "% + " + iBorderThickness + "rem)");
		oRm.style("top", (iLevel * oDensitySizes.appHeight + oDensitySizes.cellHeaderHeight) + "rem");
		oRm.openEnd();

		oRm.openStart("div");
		oRm.class("sapUiCalendarApp");

		if (oAppointment.getSelected()) {
			oRm.class("sapUiCalendarAppSel");
		}

		if (oAppointment.getTentative()) {
			oRm.class("sapUiCalendarAppTent");
		}

		if (sIcon) {
			oRm.class("sapUiCalendarAppWithIcon");
		}

		oRm.openEnd(); // div element

		// extra content DIV to make some styling possible
		oRm.openStart("div");
		oRm.class("sapUiCalendarAppCont");

		if (sColor && !oAppointment.getSelected()) {
			oRm.style("background-color", oAppointment._getCSSColorForBackground(sColor));
		}

		oRm.openEnd(); // div element

		if ((app.hasPrevious < 0 || app._overflows || bFirstRenderedDayIsAfterStart)) {
			aClasses = ["sapUiCalendarAppArrowIconLeft", "sapUiCalendarAppArrowIcon"];
			oRm.icon("sap-icon://arrow-left", aClasses, { title: null, role: "img" });
		}

		if (!bHasCustomContent && sIcon) {
			aClasses = ["sapUiCalendarAppIcon"];
			var mAttributes = {};

			mAttributes["id"] = sId + "-Icon";
			mAttributes["title"] = null;
			mAttributes["role"] = "img";
			oRm.icon(sIcon, aClasses, mAttributes);
		}

		if (!bHasCustomContent && sTitle) {
			oRm.openStart("span", sId + "-" + iColumn + "_" + iRow + "-Title");
			oRm.class("sapUiCalendarAppTitle");
			oRm.openEnd(); // span element
			oRm.text(sTitle, true);
			oRm.close("span");
		}

		if (bHasCustomContent) {
			aCustomContent.forEach(function (oContent) {
				oRm.renderControl(oContent);
			});
		}

		if (app.hasNext < 0) {
			aClasses = ["sapUiCalendarAppArrowIconRight", "sapUiCalendarAppArrowIcon"];
			oRm.icon("sap-icon://arrow-right", aClasses, { title: null, role: "img" });
		}

		oRm.openStart("span", sId + "-" + iColumn + "_" + iRow + "-Descr");
		oRm.class("sapUiInvisibleText");
		oRm.openEnd(); // span element
		oRm.text(oControl._getAppointmentAnnouncementInfo(oAppointment));
		oRm.close("span");

		oRm.close("div");

		oRm.close("div");
		oRm.close("div");
	};

	SinglePlanningCalendarMonthGridRenderer.renderDayNames = function(oRm, oControl, oLocaleData) {
		var iFirstDayOfWeek = oControl._getFirstDayOfWeek(),
			sId = oControl.getId(),
			sDayId,
			sCalendarType = Formatting.getCalendarType(),
			aWeekDays = oLocaleData.getDaysStandAlone("abbreviated", sCalendarType),
			aWeekDaysWide = oLocaleData.getDaysStandAlone("wide", sCalendarType),
			oStartDate = UI5Date.getInstance(oControl.getStartDate()),
			oFirstRenderedDate,
			iDayIndex;

		oStartDate.setDate(oStartDate.getDate() - oStartDate.getDay() + iFirstDayOfWeek);
		oFirstRenderedDate = CalendarDate.fromLocalJSDate(oStartDate);
		oRm.openStart("div", sId + "-Names");
		oRm.class("sapMSPCMonthDayNames");
		oRm.openEnd(); // span element

		for (var i = 0; i < 7; i++) {
			iDayIndex = (i + iFirstDayOfWeek) % 7;
			sDayId = sId + "-WH" + iDayIndex;

			oRm.openStart("div", sDayId);
			oRm.class("sapUiCalWH");

			if (i === 0) {
				oRm.class("sapUiCalFirstWDay");
			}

			if (CalendarUtils._isWeekend(oFirstRenderedDate, oLocaleData)) {
				oRm.class("sapUiCalItemWeekEnd");
			}
			oFirstRenderedDate.setDate(oFirstRenderedDate.getDate() + 1);

			oRm.accessibilityState(null, {
				label: aWeekDaysWide[iDayIndex]
			});
			oRm.openEnd();
			oRm.text(aWeekDays[iDayIndex % 7]);
			oRm.close("div");
		}

		oRm.close("div");
	};

	SinglePlanningCalendarMonthGridRenderer.renderDndPlaceholder = function(oRm, oPlaceholder) {
		oRm.openStart("div");
		oRm.class("sapMSinglePCOverlay");
		oRm.openEnd(); // span element
		oRm.renderControl(oPlaceholder);
		oRm.close("div");
	};

	return SinglePlanningCalendarMonthGridRenderer;

});
