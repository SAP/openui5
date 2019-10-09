/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/Month',
	'sap/ui/core/date/UniversalDate',
	'./PlanningCalendarLegend',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/Core',
	'sap/ui/unified/library'],
	function(
		CalendarDate,
		CalendarUtils,
		Month,
		UniversalDate,
		PlanningCalendarLegend,
		InvisibleText,
		Core,
		unifiedLibrary) {
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
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
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
					iMoreCount = oControl._getMoreCountPerCell(iCellIndex);
					aMoreCountPerCell.push(iMoreCount);
					aAppsPerDay.push(aApps);

					iWeekMaxAppCount = Math.max(iWeekMaxAppCount, oControl._aAppsLevelsPerDay[iCellIndex].length);
				}

				oRm.openStart("div");
				oRm.class("sapMSPCMonthDays");
				oRm.class("sapMSPCMonthDaysMax" + iWeekMaxAppCount);
				oRm.openEnd();

				for (j = 0; j < iColumns; j++) {
					iCellIndex = i * iColumns + j;
					oDay = aCells[iCellIndex];
					this.renderDay(oRm, oControl, oDay, oLocaleData, aMoreCountPerCell[iCellIndex], iCellIndex);
				}

				oRm.openStart("div");
				oRm.class("sapMSinglePCBlockers");
				oRm.class("sapUiCalendarRowVisFilled");
				oRm.openEnd();

				for (j = 0; j < iColumns; j++) {
					iCellIndex = i * iColumns + j;
					oDay = aCells[iCellIndex];

					// render appointments which started in previous rows
					if (j === 0) {
						this.renderAppointments(oRm, oControl, aPreviousWeekAppsPerDay[iCellIndex], j, aMoreCountPerCell[iCellIndex], oDensitySizes);
					}

					this.renderAppointments(oRm, oControl, aAppsPerDay[iCellIndex], j, aMoreCountPerCell[iCellIndex], oDensitySizes);
				}

				oRm.close("div"); // end appointments
				oRm.close("div"); // end cells
				oRm.close("div"); // end grid
			}
		};

		SinglePlanningCalendarMonthGridRenderer.renderDay = function(oRm, oControl, oDay, oLocaleData, more, iCellIndex) {
			var aSpecialDates = oControl.getSpecialDates(),
				aDayTypes = Month.prototype._getDateTypes.call(oControl, oDay),
				oFormat = oControl._getDateFormatter(),
				oType,
				sLegendItemType;

			oRm.openStart("div");
			oRm.class("sapMSPCMonthDay");

			if (CalendarUtils._isWeekend(oDay, oLocaleData)) {
				oRm.class("nonWorkingTimeframe");
			}

			if (aSpecialDates) {
				if (aDayTypes && aDayTypes[0]) {
					oType = aDayTypes[0];
					oRm.class("sapUiCalendarSpecialDay" + oType.type);
					sLegendItemType = PlanningCalendarLegend.findLegendItemForItem(Core.byId(oControl._sLegendId), oType);
				}
			}

			oRm.attr("sap-ui-date", oDay.valueOf().toString());
			oRm.attr("tabindex", -1);
			oRm.attr("aria-labelledby", oFormat.format(oDay.toLocalJSDate()) + "-Descr");
			oRm.openEnd();

			this.renderDndPlaceholder(oRm, oControl.getAggregation("_appsPlaceholders")[iCellIndex]);

			oRm.openStart("div");
			oRm.class("specialDateIndicator");
			oRm.openEnd();
			oRm.close("div");

			//render day number
			oRm.openStart("div");
			oRm.class("sapMSPCMonthDayNumber");
			oRm.openEnd();
			oRm.text(oDay.getDate());
			oRm.close("div");

			if (more) {
				oRm.openStart("div");
				oRm.class("sapMSPCMonthLnkMore");
				oRm.openEnd();

				oRm.renderControl(oControl._getMoreLink(more, oDay, iCellIndex));
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
			oRm.close("span");

			oRm.close("div");
		};

		SinglePlanningCalendarMonthGridRenderer.renderAppointments = function(oRm, oControl, apps, iColumn, iMore, oDensitySizes) {
			var MAX_APPS = oControl._getMaxAppointments(),
				iMaxLvl = iMore ? MAX_APPS - 2 : MAX_APPS - 1;

			for (var i = 0; i < apps.length; i++) {
				if (apps[i].level <= iMaxLvl) {
					this.renderAppointment(oRm, oControl, apps[i], iColumn, oDensitySizes);
				}
			}
		};

		SinglePlanningCalendarMonthGridRenderer.renderAppointment = function(oRm, oControl, app, iColumn, oDensitySizes) {
			var oAppointment = app.data,
				iWidth = app.width,
				iLevel = app.level,
				iColumns = oControl._getColumns(),
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
					},
					// Setting aria-selected attribute to all blockers
					selected: !!oAppointment.getSelected()
				},
				// aAriaLabels = oControl.getAriaLabelledBy(),
				iRight = iColumns - iColumn - iWidth,
				bIsRTL = Core.getConfiguration().getRTL(),
				aClasses,
				iBorderThickness = Core.getConfiguration().getTheme().indexOf("_hc") ? 2 : 1;

			iRight = iRight < 0 ? 0 : iRight;

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
				if (Core.getConfiguration().getRTL()) {
					oRm.style("border-right-color", sColor);
				} else {
					oRm.style("border-left-color", sColor);
				}
			}
			oRm.style(bIsRTL ? "right" : "left", "calc(" + (iColumn * 100) / iColumns + "% + " + iBorderThickness + "px)");
			oRm.style(bIsRTL ? "left" : "right", "calc(" + (iRight * 100) / iColumns + "% + " + iBorderThickness + "px)");
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

			if (sColor) {
				oRm.style("background-color", oAppointment._getCSSColorForBackground(sColor));
			}

			oRm.openEnd(); // div element

			if (app.hasPrevious < 0) {
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

			if (app.hasNext < 0) {
				aClasses = ["sapUiCalendarAppArrowIconRight", "sapUiCalendarAppArrowIcon"];
				oRm.icon("sap-icon://arrow-right", aClasses, { title: null });
			}

			oRm.openStart("span", sId + "-Descr");
			oRm.class("sapUiInvisibleText");
			oRm.openEnd(); // span element
			oRm.text(oControl._getAppointmentAnnouncementInfo(oAppointment));
			oRm.close("span");

			oRm.close("div");

			oRm.close("div");
			oRm.close("div");
		};

		SinglePlanningCalendarMonthGridRenderer.renderDayNames = function(oRm, oControl, oLocaleData) {
			var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek(),
				sId = oControl.getId(),
				sDayId,
				sCalendarType = Core.getConfiguration().getCalendarType(),
				aWeekDays = oLocaleData.getDaysStandAlone("abbreviated", sCalendarType),
				aWeekDaysWide = oLocaleData.getDaysStandAlone("wide", sCalendarType),
				iDayIndex;

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

				oRm.accessibilityState(null, {
					role: "columnheader",
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

	}, true /* bExport */);
