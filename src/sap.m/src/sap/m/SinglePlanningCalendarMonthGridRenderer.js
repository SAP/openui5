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
		var SinglePlanningCalendarMonthGridRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		SinglePlanningCalendarMonthGridRenderer.render = function(oRm, oControl) {
			var oLocaleData = oControl._getCoreLocaleData();
			var oDensitySizes = oControl._getDensitySizes();

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMSinglePCGrid");
			oRm.addClass("sapMSPCMonthGrid");
			oRm.writeClasses();
			oRm.write(">");

			this.renderDayNames(oRm, oControl, oLocaleData);

			oRm.write("<div");
			oRm.addClass("sapMSinglePCGridContent");
			oRm.writeClasses();
			oRm.write(">");

			this.renderCells(oRm, oControl, oLocaleData, oDensitySizes);

			oRm.write("</div>"); // END .sapMSinglePCGridContent
			oRm.write("</div>"); // END .sapMSinglePCGrid
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
				iWeekMaxAppCount;

			for (var i = 0; i < oControl._getRows(); i++) {
				iWeekMaxAppCount = 0;

				oRm.write("<div");
				oRm.writeAttribute("role", "grid");
				oRm.addClass("sapMSPCMonthWeek");
				oRm.writeClasses();
				oRm.write(">");

				// render week number
				oRm.write("<div");
				oRm.addClass("sapMSPCMonthWeekNumber");
				oRm.writeClasses();
				oRm.write(">");
				oRm.write(aVerticalLabels[i]);
				oRm.write("</div>");

				for (var j = 0; j < iColumns; j++) {
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

				oRm.write("<div");
				oRm.addClass("sapMSPCMonthDays");
				oRm.addClass("sapMSPCMonthDaysMax" + iWeekMaxAppCount);
				oRm.writeClasses();
				oRm.write(">");

				for (var j = 0; j < iColumns; j++) {
					iCellIndex = i * iColumns + j;
					oDay = aCells[iCellIndex];
					this.renderDay(oRm, oControl, oDay, oLocaleData, aMoreCountPerCell[iCellIndex], iCellIndex);
				}

				oRm.write("<div");
				oRm.addClass("sapMSinglePCBlockers");
				oRm.addClass("sapUiCalendarRowVisFilled");
				oRm.writeClasses();
				oRm.write(">");

				for (var j = 0; j < iColumns; j++) {
					iCellIndex = i * iColumns + j;
					oDay = aCells[iCellIndex];

					// render appointments which started in previous rows
					if (j === 0) {
						this.renderAppointments(oRm, oControl, aPreviousWeekAppsPerDay[iCellIndex], j, aMoreCountPerCell[iCellIndex], oDensitySizes);
					}

					this.renderAppointments(oRm, oControl, aAppsPerDay[iCellIndex], j, aMoreCountPerCell[iCellIndex], oDensitySizes);
				}

				oRm.write("</div>"); // end appointments
				oRm.write("</div>"); // end cells
				oRm.write("</div>"); // end grid
			}
		};

		SinglePlanningCalendarMonthGridRenderer.renderDay = function(oRm, oControl, oDay, oLocaleData, more, iCellIndex) {
			var aSpecialDates = oControl.getSpecialDates(),
				aDayTypes = Month.prototype._getDateTypes.call(oControl, oDay),
				oFormat = oControl._getDateFormatter(),
				oType,
				sLegendItemType;

			oRm.write("<div");
			oRm.addClass("sapMSPCMonthDay");

			if (CalendarUtils._isWeekend(oDay, oLocaleData)) {
				oRm.addClass("nonWorkingTimeframe");
			}

			if (aSpecialDates) {
				if (aDayTypes && aDayTypes[0]) {
					oType = aDayTypes[0];
					oRm.addClass("sapUiCalendarSpecialDay" + oType.type);
					sLegendItemType = PlanningCalendarLegend.findLegendItemForItem(Core.byId(oControl._sLegendId), oType);
				}
			}

			oRm.writeClasses();
			oRm.writeAttribute("sap-ui-date", oDay.valueOf().toString());
			oRm.writeAttribute("tabindex", -1);
			oRm.writeAttribute("aria-labelledby", oFormat.format(oDay.toLocalJSDate()) + "-Descr");
			oRm.write(">");

			this.renderDndPlaceholder(oRm, oControl.getAggregation("_appsPlaceholders")[iCellIndex]);

			oRm.write("<div");
			oRm.addClass("specialDateIndicator");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");

			//render day number
			oRm.write("<div");
			oRm.addClass("sapMSPCMonthDayNumber");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write(oDay.getDate());
			oRm.write("</div>");

			if (more) {
				oRm.write("<div");
				oRm.addClass("sapMSPCMonthLnkMore");
				oRm.writeClasses();
				oRm.write(">");

				oRm.renderControl(oControl._getMoreLink(more, oDay, iCellIndex));
				oRm.write("</div>");
			}

			oRm.write("<span");
			oRm.writeAttribute("id", oFormat.format(oDay.toLocalJSDate()) + "-Descr");
			oRm.addClass("sapUiInvisibleText");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write(oControl._getCellStartInfo(oDay.toLocalJSDate()));
			//acc for day view + special dates + legend
			if (oControl._sLegendId && sLegendItemType) {
				oRm.writeEscaped(sLegendItemType);
			}
			oRm.write("</span>");

			oRm.write("</div>");
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
					selected: oAppointment.getSelected() ? true : false
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

			oRm.write("<div");
			oRm.writeElementData(oAppointment);
			oRm.writeAttribute("data-sap-level", iLevel);
			oRm.writeAttribute("data-sap-width", iWidth);
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
				if (Core.getConfiguration().getRTL()) {
					oRm.addStyle("border-right-color", sColor);
				} else {
					oRm.addStyle("border-left-color", sColor);
				}
			}
			oRm.addStyle(bIsRTL ? "right" : "left", "calc(" + (iColumn * 100) / iColumns + "% + " + iBorderThickness + "px)");
			oRm.addStyle(bIsRTL ? "left" : "right", "calc(" + (iRight * 100) / iColumns + "% + " + iBorderThickness + "px)");
			oRm.addStyle("top", (iLevel * oDensitySizes.appHeight + oDensitySizes.cellHeaderHeight) + "rem");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapUiCalendarApp");

			if (oAppointment.getSelected()) {
				oRm.addClass("sapUiCalendarAppSel");
			}

			if (oAppointment.getTentative()) {
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
				oRm.addStyle("background-color", oAppointment._getCSSColorForBackground(sColor));
				oRm.writeStyles();
			}

			oRm.writeClasses();
			oRm.write(">"); // div element

			if (app.hasPrevious < 0) {
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

			if (app.hasNext < 0) {
				aClasses = ["sapUiCalendarAppArrowIconRight", "sapUiCalendarAppArrowIcon"];
				oRm.writeIcon("sap-icon://arrow-right", aClasses, { title: null });
			}

			oRm.write("<span id=\"" + sId + "-Descr\" class=\"sapUiInvisibleText\">" +
				oControl._getAppointmentAnnouncementInfo(oAppointment) + "</span>");

			oRm.write("</div>");

			oRm.write("</div>");
			oRm.write("</div>");
		};

		SinglePlanningCalendarMonthGridRenderer.renderDayNames = function(oRm, oControl, oLocaleData) {
			var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek(),
				sId = oControl.getId(),
				sDayId,
				sCalendarType = Core.getConfiguration().getCalendarType(),
				aWeekDays = oLocaleData.getDaysStandAlone("abbreviated", sCalendarType),
				aWeekDaysWide = oLocaleData.getDaysStandAlone("wide", sCalendarType),
				iDayIndex;

			oRm.write("<div id=\"" + sId + "-Names\" class='sapMSPCMonthDayNames'>");

			for (var i = 0; i < 7; i++) {
				iDayIndex = (i + iFirstDayOfWeek) % 7;

				oRm.write("<div");
				oRm.addClass("sapUiCalWH");

				sDayId = sId + "-WH" + iDayIndex;

				oRm.writeAttribute("id", sDayId);
				if (i == 0) {
					oRm.addClass("sapUiCalFirstWDay");
				}

				oRm.writeAccessibilityState(null, {
					role: "columnheader",
					label: aWeekDaysWide[iDayIndex]
				});
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");
				oRm.write(aWeekDays[iDayIndex % 7]);
				oRm.write("</div>");
			}

			oRm.write("</div>");
		};

		SinglePlanningCalendarMonthGridRenderer.renderDndPlaceholder = function(oRm, oPlaceholder) {
			oRm.write("<div class=\"sapMSinglePCOverlay\">");
			oRm.renderControl(oPlaceholder);
			oRm.write("</div>");
		};

		return SinglePlanningCalendarMonthGridRenderer;

	}, true /* bExport */);
