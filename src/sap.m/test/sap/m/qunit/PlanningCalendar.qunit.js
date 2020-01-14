/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/type/Date",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendRenderer",
	"sap/m/PlanningCalendarLegend",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/library",
	"sap/ui/core/format/DateFormat",
	"jquery.sap.global",
	"sap/m/SearchField",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/PlanningCalendarRow",
	"sap/m/PlanningCalendar",
	"sap/m/Title",
	"sap/ui/core/LocaleData",
	"sap/ui/core/CustomData",
	"sap/ui/Device",
	"sap/m/PlanningCalendarView",
	"sap/ui/base/ManagedObject",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/unified/calendar/OneMonthDatesRow",
	"sap/ui/unified/calendar/DatesRow",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleText",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	TypeDate,
	JSONModel,
	CalendarDate,
	DateTypeRange,
	CalendarLegend,
	CalendarLegendRenderer,
	PlanningCalendarLegend,
	CalendarAppointment,
	CalendarLegendItem,
	unifiedLibrary,
	DateFormat,
	jQuery,
	SearchField,
	Button,
	Label,
	mobileLibrary,
	PlanningCalendarRow,
	PlanningCalendar,
	Title,
	LocaleData,
	CustomData,
	Device,
	PlanningCalendarView,
	ManagedObject,
	EventExtension,
	OneMonthDatesRow,
	DatesRow,
	coreLibrary,
	Control,
	Element,
	InvisibleText,
	waitForThemeApplied
) {
	"use strict";

	// set language to en-GB, since we have specific language strings tested
	sap.ui.getCore().getConfiguration().setLanguage("en_GB");

	// shortcut for sap.m.PlanningCalendarBuiltInView
	var PlanningCalendarBuiltInView = mobileLibrary.PlanningCalendarBuiltInView;

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	// shortcut for sap.m.ScreenSize
	var ScreenSize = mobileLibrary.ScreenSize;

	// shortcut for sap.ui.unified.CalendarAppointmentVisualization
	var CalendarAppointmentVisualization = unifiedLibrary.CalendarAppointmentVisualization;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.ui.unified.GroupAppointmentsMode
	var GroupAppointmentsMode = unifiedLibrary.GroupAppointmentsMode;

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.ui.unified.CalendarIntervalType
	var CalendarIntervalType = unifiedLibrary.CalendarIntervalType;

	var styleElement = document.createElement("style");
	styleElement.textContent =
		".width300 {" +
		"	width: 300px;" +
		"}" +
		".width600 {" +
		"	width: 600px;" +
		"}" +
		".width1024{" +
		"	width: 1024px;" +
		"}";
	document.head.appendChild(styleElement);
	createAndAppendDiv("verySmallUiArea").className = "width300";
	createAndAppendDiv("smallUiArea").className = "width600";
	createAndAppendDiv("bigUiArea").className = "width1024";

	var oFormatYyyyMMddHHmm = DateFormat.getInstance({pattern: "yyyyMMddHHmm"}),
		oFormatYyyyMMdd = DateFormat.getInstance({pattern: "yyyyMMdd"}),
		/*the SUT won't be destroyed when single test is run*/
		bSkipDestroy = !!jQuery.sap.getUriParameters().get("testId");

	var oSelectedAppointment,
		sDomRefId;
	var handleAppointmentSelect = function(oEvent){
		oSelectedAppointment = oEvent.getParameter("appointment");
		sDomRefId = oEvent.getParameter("domRefId");
	};

	var bRowSelectionChange = false;
	var aChangedRows;
	var handleRowSelectionChange = function(oEvent){
		bRowSelectionChange = true;
		aChangedRows = oEvent.getParameter("rows");
	};

	var bStartDateChange = false;
	var handleStartDateChange = function(oEvent){
		bStartDateChange = true;
	};

	var bViewChange = false;
	var handleViewChange = function(oEvent){
		bViewChange = true;

	};

	var bIntervalSelect = false;
	var oIntervalStartDate;
	var oIntervalEndDate;
	var bSubInterval;
	var oIntervalRow;
	var handleIntervalSelect = function(oEvent){
		bIntervalSelect = true;
		oIntervalStartDate = oEvent.getParameter("startDate");
		oIntervalEndDate = oEvent.getParameter("endDate");
		bSubInterval = oEvent.getParameter("bubInterval");
		oIntervalRow = oEvent.getParameter("row");
	};
	var oPCStartDate = new Date("2015", "0", "1", "08", "00");

	var createPlanningCalendar = function(sID, oSearchField, oButton, oParamStartDate, sViewKey, oLegend, aSpecialDates, aRows) {

		if (!aSpecialDates || !aSpecialDates.length) {
			aSpecialDates = [
				new DateTypeRange(sID + "SD1", {
					startDate: new Date(2015, 0, 6),
					type: CalendarDayType.Type01,
					tooltip: "Heilige 3 Könige"
				}),
				new DateTypeRange(sID + "SD2", {
					startDate: new Date(2015, 0, 1, 12, 0),
					endDate: new Date(2015, 0, 1, 14, 0),
					type: CalendarDayType.Type02,
					tooltip: "Lunch"
				})
			];
		}

		if (!aRows) {
			aRows = [new PlanningCalendarRow(sID + "-Row1", {
				icon: "sap-icon://employee",
				title: "Max Mustermann",
				text: "Musterteam",
				tooltip: "Header tooltip",
				intervalHeaders: [ new CalendarAppointment(sID + "-R1H1",{
					startDate: new Date("2015", "0", "1", "09", "00"),
					endDate: new Date("2015", "0", "1", "11", "00"),
					type: CalendarDayType.Type02,
					color: "#FF0000",
					title: "SAPUI5",
					tooltip: "Test",
					icon: "sap-icon://sap-ui5"
				})
				],
				appointments: [ new CalendarAppointment(sID + "-R1A1", {
					startDate: oPCStartDate,
					endDate: new Date("2015", "0", "1", "09", "00"),
					type: CalendarDayType.Type01,
					color: "#FF00FF",
					title: "App 1",
					icon: "../../ui/unified/images/m_01.png",
					tooltip: "Tooltip",
					text: "Text"
				}),
					new CalendarAppointment(sID + "-R1A2", {
						startDate: new Date("2015", "0", "1", "07", "00"),
						endDate: oPCStartDate,
						type: CalendarDayType.Type02,
						title: "App 2",
						icon: "sap-icon://home",
						tooltip: "Tooltip",
						text: "Text",
						tentative: true
					}),
					new CalendarAppointment(sID + "-R1A3", {
						startDate: new Date("2015", "0", "2", "08", "30"),
						endDate: new Date("2015", "0", "2", "09", "30"),
						type: CalendarDayType.Type03,
						title: "App3",
						icon: "sap-icon://home",
						tooltip: "Tooltip"
					}),
					new CalendarAppointment(sID + "-R1A4", {
						startDate: new Date("2014", "6", "1", "0", "0"),
						endDate: new Date("2014", "6", "2", "0", "0"),
						type: CalendarDayType.Type04,
						title: "Meeting 4",
						tooltip: "Tooltip 4",
						selected: true
					})
				]
			}),
				new PlanningCalendarRow(sID + "-Row2", {
					icon: "../../ui/unified/images/m_01.png",
					title: "Edward",
					text: "the great",
					tooltip: "Header tooltip",
					nonWorkingDays: [2,3],
					nonWorkingHours: [11, 12],
					intervalHeaders: [ new CalendarAppointment(sID + "-R2H1",{
						startDate: new Date("2015", "0", "2", "00", "00"),
						endDate: new Date("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type01,
						title: "SAPUI5",
						tooltip: "Test",
						icon: "sap-icon://sap-ui5"
					})
					],
					appointments: [ new CalendarAppointment(sID + "-R2A1", {
						startDate: new Date("2015", "0", "1", "00", "00"),
						endDate: new Date("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type01,
						title: "App 1",
						tooltip: "Tooltip",
						text: "Text"
					})
					]
				})
			];
		}

		var oTC = new PlanningCalendar(sID, {
			startDate: oParamStartDate || oPCStartDate,
			legend: oLegend,
			rows: aRows,
			specialDates: aSpecialDates,
			toolbarContent: [oSearchField, oButton],
			appointmentSelect: handleAppointmentSelect,
			startDateChange: handleStartDateChange,
			rowSelectionChange: handleRowSelectionChange,
			viewChange: handleViewChange,
			intervalSelect: handleIntervalSelect
		});
		if (sViewKey) {
			oTC.setViewKey(sViewKey);
		}

		return oTC;
	};

	var initPlanningCalendar = function(sID, sSearchFieldId, sButtonId) {
		var oTC = sap.ui.getCore().byId(sID);
		var oUIArea;
		if (oTC) {
			oTC.removeAllToolbarContent();
			oUIArea = oTC.getUIArea();
			oTC.destroy();
		}

		if (!sap.ui.getCore().byId(sSearchFieldId)) {
			var oSearchField1 = new SearchField(sSearchFieldId, {
				width: "10rem",
				search: function() {
					alert("Search!"); // eslint-disable-line no-alert
				}
			});

			var oButton1 = new Button(sButtonId, {
				icon: "sap-icon://sap-ui5",
				type: ButtonType.Transparent,
				press: function() {
					alert("UI5 Button pressed"); // eslint-disable-line no-alert
				}
			});
		}

		oTC = createPlanningCalendar(sID, oSearchField1, oButton1);

		if (oUIArea) {
			oTC.placeAt(oUIArea.getId());
		}

		sap.ui.getCore().applyChanges();

		return oTC;

	};

	var _getListItem = function(oRow) {
		return sap.ui.getCore().byId(oRow.getId() + "-CLI");
	};

	var _getRowHeader = function(oRow) {
		var oListItem = _getListItem(oRow);

		return oListItem ? oListItem.getHeader() : null;
	};

	var _getRowTimeline = function(oRow) {
		var oListItem = _getListItem(oRow);

		return oListItem ? oListItem.getTimeline() : null;
	};

	var _switchToView = function(sViewName, oPC) {
		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			mIntervalStringsMap = {},
			sIntervalTypeDropdownId,
			oViewSwitch,
			aItemsToSelect,
			sViewI18Name,
			sErrMsg;

		mIntervalStringsMap[CalendarIntervalType.Hour] = "PLANNINGCALENDAR_HOURS";
		mIntervalStringsMap[CalendarIntervalType.Day] = "PLANNINGCALENDAR_DAYS";
		mIntervalStringsMap[CalendarIntervalType.Month] = "PLANNINGCALENDAR_MONTHS";
		mIntervalStringsMap[CalendarIntervalType.Week] = "PLANNINGCALENDAR_WEEK";
		mIntervalStringsMap[CalendarIntervalType.OneMonth] = "PLANNINGCALENDAR_ONE_MONTH";
		sViewI18Name = oRb.getText(mIntervalStringsMap[sViewName]);
		assert.ok(sViewI18Name, "There must be internationalized string corresponding to the viewName " + sViewName);
		sIntervalTypeDropdownId = oPC.getId() + "-Header-ViewSwitch-select";
		oViewSwitch = sap.ui.getCore().byId(sIntervalTypeDropdownId);
		aItemsToSelect = oViewSwitch.getItems().filter(function(item) {
			return item.getText().toLowerCase() === sViewI18Name.toLowerCase();
		});
		if (aItemsToSelect.length !== 1) {
			sErrMsg = "Cannot switch to view " + sViewName;
				assert.ok(false, sErrMsg);
				throw sErrMsg;
			}
		oViewSwitch.setSelectedItem(aItemsToSelect[0]);
		oViewSwitch.fireChange({ selectedItem: aItemsToSelect[0] });
	};

	var _switchToDate = function(oPC, oInterval, iDay, iMonth, iYear) {
		var bWizardUsesDaysPicker = (oPC.getViewKey() === "Days" || oPC.getViewKey() === "1 Week" || oPC.getViewKey() === "Hours"),
			sCalendarPickerId =  oPC._getHeader().getAggregation("_calendarPicker").getId(),
			sMonthPickerId =  oPC._getHeader().getAggregation("_monthPicker").getId(),
			sYearPickerId =  oPC._getHeader().getAggregation("_yearPicker").getId(),
			sCalendarPickerYearId = sCalendarPickerId + "--YP",
			sCalendarPickerMonthId = sCalendarPickerId + "--MP",
			sDate,
			$Date;

		qutils.triggerEvent("tap", oPC.getId() + "-Header-NavToolbar-PickerBtn");

		if (iYear !== undefined) {
			// click on Year button inside current picker
			qutils.triggerEvent("click", sMonthPickerId + "--Head-B2");

			// click on the wanted year
			$Date = jQuery("#" + sMonthPickerId + "--YP-y" + iYear + "0101");
			$Date.focus();
			oPC._getHeader().getAggregation("_monthPicker").getAggregation("monthPicker")._oItemNavigation.setFocusedIndex(iYear);
			sap.ui.getCore().applyChanges();
			qutils.triggerKeydown($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		}

		if (iMonth !== undefined) {
			if (bWizardUsesDaysPicker) { //we want to choose month, but the day picker is opened. Click on the month button atop
				// click on Month button inside calendar picker
				qutils.triggerEvent("tap", sMonthPickerId + "--Head-B1");
			}

			// click on the wanted month
			$Date = jQuery("#" + sMonthPickerId + "--MP-m" + iMonth);
			$Date.focus();
			// sets February
			oPC._getHeader().getAggregation("_monthPicker").getAggregation("monthPicker")._oItemNavigation.setFocusedIndex(iMonth);
			sap.ui.getCore().applyChanges();
			qutils.triggerKeydown($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		}

		if (bWizardUsesDaysPicker && iDay != undefined) {
			// click on 14 of September
			sDate = DateFormat().getInstance({pattern: "yyyymmdd"}).format(new Date(iYear, iMonth, iDay));
			$Date = jQuery("#" + sCalendarPickerId + "--Month0-" + sDate);
			$Date.focus();
			qutils.triggerKeyboardEvent($Date[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		}
	};

	/*	var _switchToMonth = function(oPC, iMonth) {
			var oMonthPicker = oPC.getAggregation("table").getAggregation("infoToolbar").getContent()[1].getAggregation("monthPicker");
			oMonthPicker.setMonth(iMonth);
			oMonthPicker.fireSelect();
		};

		var _switchToYear = function(oPC, iYear) {
			var oYearPicker = oPC.getAggregation("table").getAggregation("infoToolbar").getContent()[1].getAggregation("yearPicker");
			oYearPicker.setYear(iYear);
			oYearPicker.fireSelect();
		};*/

	var _clickTodayButton = function(oPC) {
		var sTodayButtonId = _getTodayButton.call(this, oPC).getId();
		qutils.triggerEvent("tap", sTodayButtonId);
		sap.ui.getCore().applyChanges();
	};

	var _getTodayButton = function(oPC) {
		return sap.ui.getCore().byId(oPC.getId() + "-Header-NavToolbar-TodayBtn");
	};

	var _getChangeMonthButtonText = function(oPC) {
		return jQuery("#" + oPC.getId() + "-Header-NavToolbar-PickerBtn").text();
	};

	//Verifies that given dates are "displayed" in the Planning Calendar
	//and month name(s) in the button is as expected
	var _assertDatesAreVisible = function(aDates, oPC, sMessagePrefix) {
		var sDaysSelector = oPC.getId() + "-" + _getIntervalId.call(this, oPC) + "-days",
			iAvailableDays = jQuery('#' + sDaysSelector).children().length,
			oFirstDate = aDates[0],
			oLastDate = aDates[aDates.length - 1],
			sExpectedDateRange = _formatDate.call(this, oFirstDate) + "-" + _formatDate.call(this, oLastDate),
			oDateDateFormat = DateFormat.getDateInstance({pattern: "d"}),
			oMonthDateFormat = DateFormat.getDateInstance({pattern: "MMMM"}),
			oYearDateFormat = DateFormat.getDateInstance({pattern: "YYYY"}),
			sResult;

		sMessagePrefix += ": expected dates: " + sExpectedDateRange;

		assert.equal(iAvailableDays, aDates.length, sMessagePrefix + ": Planning Calendar should show certain amount of days: ");
		sResult = DateFormat.getDateInstance({format: "yMMMMd"}).format(oFirstDate) + " - " + DateFormat.getDateInstance({format: "yMMMMd"}).format(oLastDate);

		assert.equal(_getChangeMonthButtonText.call(this, oPC), sResult, sMessagePrefix + ": Change month button should have certain text of " +
			sResult + ", current text: " + _getChangeMonthButtonText.call(this, oPC));

		aDates.forEach(function (oDate) {
			_assertDateIsVisible.call(this, oDate, oPC, sMessagePrefix);
		}.bind(this));
	};

	//Verifies that given Date is "displayed" in the Planning Calendar
	var _assertDateIsVisible = function(oDate, oPC, sMessagePrefix) {
		var that = this;

		function convertDate2DomId(oDate, sPrefix) {
			return sPrefix + "-" + oDate.getFullYear() + _padTo10.call(that, oDate.getMonth() + 1) + _padTo10.call(that, oDate.getDate());
		}

		var sDayId = convertDate2DomId(oDate, oPC.getId() + "-" + _getIntervalId.call(this, oPC));
		assert.equal(jQuery("#" + sDayId).length, 1, sMessagePrefix + ": Date " + _formatDate.call(this, oDate) + " should be visible (" + sDayId + ")");
	};

	//Verifies that given hour for given date is "displayed" in the Planning Calendar
	var _assertHourIsVisible = function(oDate, oPC, sMessagePrefix) {
		var that = this;

		function convertHourInDate2DomId(oDate, sPrefix) {
			return sPrefix + "-" + oDate.getFullYear() + _padTo10.call(that, oDate.getMonth() + 1) + _padTo10.call(that, oDate.getDate()) + _padTo10.call(that, oDate.getHours()) + "00";
		}

		var sHourInDayId = convertHourInDate2DomId(oDate, oPC.getId() + "-" + _getIntervalId.call(this, oPC));
		assert.equal(jQuery("#" + sHourInDayId).length, 1, sMessagePrefix + ": Hour " + _formatDateHour.call(this, oDate) + " should be visible (" + sHourInDayId + ")");
	};

	var _assertHoursAreVisible = function(aDates, oPC, sMessagePrefix) {
		var iAvailableDays = jQuery('#' + oPC.getId() + "-" + _getIntervalId.call(this, oPC) + "-times").children().length,
			sExpectedDateRange = _formatDateHour.call(this, aDates[0]) + "-" + _formatDateHour.call(this, aDates[aDates.length - 1]);

		sMessagePrefix += ": expected hours: " + sExpectedDateRange;
		assert.equal(iAvailableDays, aDates.length, sMessagePrefix + ": Planning Calendar should show certain amount of hours: ");

		aDates.forEach(function (oDate) {
			_assertHourIsVisible.call(this, oDate, oPC, sMessagePrefix);
		}.bind(this));
	};

	var _assertFocus = function(oTarget) {
		assert.strictEqual(document.activeElement.id, oTarget && oTarget.id, "Element with id: " + oTarget.id + " should be focused");
	};

	var _formatDate = function(oDate) {
		return DateFormat.getDateInstance({pattern: "dd.MM.yyyy"}).format(oDate);
	};

	var _formatDateHour = function(oDate) {
		return DateFormat.getDateInstance({pattern: "dd.MM.yyyy hh:mm"}).format(oDate);
	};

	var _padTo10 = function(i) {
		return (i > 9 ? i : "0" + i);
	};

	var _getIntervalId = function(oPC) {
		return _getIntervalPrefix.call(this, oPC);
	};

	var _getIntervalPrefix = function(oPC) {
		switch (oPC.getViewKey()) {
			case CalendarIntervalType.Hour:
				return "TimesRow";
			case CalendarIntervalType.Day:
				return "DatesRow";
			case CalendarIntervalType.Week:
				return "WeeksRow";
			case CalendarIntervalType.Month:
				return "MonthsRow";
			case CalendarIntervalType.OneMonth:
				return "OneMonthsRow";
			default:
				throw "Unknown viewKey:" + oPC.getViewKey();
		}
	};

	var _navBackward = function(oPC) {
		var sIdBackButton = oPC.getId() + "-Header-NavToolbar-PrevBtn";
		qutils.triggerEvent("tap", sIdBackButton);
		sap.ui.getCore().applyChanges();
	};

	var _navForward = function(oPC) {
		var  sIdForwardButton = oPC.getId() + "-Header-NavToolbar-NextBtn";
		qutils.triggerEvent("tap", sIdForwardButton);
		sap.ui.getCore().applyChanges();
	};

	var _navFocusPrev = function(oTarget) {
		qutils.triggerKeydown(oTarget.id, "ARROW_LEFT");
		sap.ui.getCore().applyChanges();
		return this.oPC2Interval._oItemNavigation.getFocusedDomRef();
	};

	var _navFocusNext = function(oTarget) {
		qutils.triggerKeydown(oTarget.id, "ARROW_RIGHT");
		sap.ui.getCore().applyChanges();
		return this.oPC2Interval._oItemNavigation.getFocusedDomRef();
	};

	/**
	 * Creates special dates, based on the view type (@CalendarIntervalType) by using CalendarDayType in the range
	 * provided by [@iTypeBegin, @iTypeEnd].
	 * @returns For Hours View: Special dates for as mucch hours as the range of types provides, each with 59 mins.
	 * For Days, 1Week and 1 Month -
	 **/
	function _createSpecialDates(iTypeBegin, iTypeEnd, sCalendarIntervalType, oStartDate) {
		var sTypeName = "",
			oSpecialDateStart,
			oSpecialDateEnd,
			aResult = [];

		oSpecialDateStart = new Date(oStartDate.getTime());
		oSpecialDateEnd = createEndDate(sCalendarIntervalType, oSpecialDateStart);

		for (var i = iTypeBegin; i <= iTypeEnd; i++) {
			sTypeName = i.toString();
			sTypeName = sTypeName.length === 1 ? "0" + sTypeName : sTypeName;
			sTypeName = "Type" + sTypeName;
			if (!CalendarDayType[sTypeName]) {
				throw "Test error: invalid type " + sTypeName;
			}
			sTypeName = CalendarDayType[sTypeName];
			aResult.push(new DateTypeRange({
				type: sTypeName,
				startDate: new Date(oSpecialDateStart.getTime()),
				endDate: new Date(oSpecialDateEnd.getTime())
			}));

			oSpecialDateStart = getNextStartDate(sCalendarIntervalType, oSpecialDateStart);
			oSpecialDateEnd = createEndDate(sCalendarIntervalType, oSpecialDateStart);
		}

		function getNextStartDate(sCalendarIntervalType, oDate1) {
			var oTempDate = new Date(oDate1.getTime());

			switch (sCalendarIntervalType) {
				case CalendarIntervalType.Hour:
				{
					oTempDate.setHours(oTempDate.getHours() + 1);
					break;
				}
				case CalendarIntervalType.Day:
				case CalendarIntervalType.Week:
				case CalendarIntervalType.OneMonth:
				{
					oTempDate.setDate(oTempDate.getDate() + 1);
					break;
				}
				case CalendarIntervalType.Month:
				{
					oTempDate.setMonth(oTempDate.getMonth() + 1);
					break;
				}
				default: throw "Invalid CalendarIntervalType: " + sCalendarIntervalType;
			}
			return oTempDate;
		}
		function createEndDate(sCalendarIntervalType, oStartDate) {
			var oEndDate = new Date(oStartDate.getTime());

			switch (sCalendarIntervalType) {
				case CalendarIntervalType.Hour:
				{
					oEndDate.setMinutes(59);
					break;
				}
				case CalendarIntervalType.Day:
				case CalendarIntervalType.Week:
				case CalendarIntervalType.OneMonth:
				{
					oEndDate.setHours(23, 59, 59);
					break;
				}
				case CalendarIntervalType.Month:
				{
					oEndDate.setDate(getLastMonthDate(oStartDate));
					break;
				}
				default: throw "Invalid CalendarIntervalType: " + sCalendarIntervalType;
			}
			return oEndDate;
		}

		function getLastMonthDate(oDate) {
			var oTempDate = new Date(oDate.getTime());
			oTempDate.setMonth(oTempDate.getMonth() + 1);
			oTempDate.setDate(0);
			return oTempDate.getDate();
		}
		return aResult;
	}


	var _createAppointmentsOfTypes = function(iTypeBegin, iTypeEnd, oStartDate) {
		var sTypeName = "",
			oAppStartDate,
			oAppEndDate,
			aResult = [];

		oAppStartDate = new Date(oStartDate.getTime());
		oAppEndDate = new Date(oAppStartDate.getTime());
		oAppEndDate.setMinutes(oAppStartDate.getMinutes() + 10);  //appointments duration

		for (var i = iTypeBegin; i <= iTypeEnd; i++) {
			sTypeName = i.toString();
			sTypeName = sTypeName.length === 1 ? "0" + sTypeName : sTypeName;
			sTypeName = "Type" + sTypeName;
			if (!CalendarDayType[sTypeName]) {
				throw "Test error: invalid type " + sTypeName;
			}
			sTypeName = CalendarDayType[sTypeName];
			aResult.push(new CalendarAppointment({
				type: sTypeName,
				startDate: new Date(oAppStartDate.getTime()),
				endDate: new Date(oAppEndDate.getTime())
			}));
			oAppStartDate.setMinutes(oAppStartDate.getMinutes() + 30);// 2appointments per hour
			oAppEndDate = new Date(oAppStartDate.getTime());
			oAppEndDate.setMinutes(oAppStartDate.getMinutes() + 10); //appointments duration
		}
		return aResult;
	};

	var oSearchField1 = new SearchField("SF1", {
		width: "10rem",
		search: function(oEvent) {
			alert("Search!"); // eslint-disable-line no-alert
		}
	});

	var oButton1 = new Button("B1", {
		icon: "sap-icon://sap-ui5",
		type: ButtonType.Transparent,
		press: function(oEvent) {
			alert("UI5 Button pressed"); // eslint-disable-line no-alert
		}
	});
	var oPC1 = createPlanningCalendar("PC1", oSearchField1, oButton1);
	oPC1.placeAt("bigUiArea");


	QUnit.module("internal controls");

	QUnit.test("PlanningCalendarHeaderToolbar is not visible when it doesn't contain any elements", function(assert) {
		// Prepare
		var oPC = createPlanningCalendar("PC7").placeAt("qunit-fixture"),
			oPCHeaderToolbar = oPC._getHeader()._getActionsToolbar();

		oPC.setBuiltInViews([PlanningCalendarBuiltInView.Hour]);
		sap.ui.getCore().applyChanges();

		assert.ok(!oPC.getToolbarContent().length, "PlanningCalendarHeader: Toolbar is empty");
		assert.notOk(oPCHeaderToolbar.getVisible(), "PlanningCalendarHeader: Toolbar is not visible");

		// Act
		oPC.addToolbarContent(new Button({text: "TEST"}));
		oPC.insertToolbarContent(new Label({text: "TEST"}));
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oPCHeaderToolbar.getVisible(), "PlanningCalendarHeader: Toolbar is visible");
		assert.equal(oPC.getToolbarContent().length, 2, "PlanningCalendarHeader: Toolbar has two elements");

		// Act
		oPC.removeAllToolbarContent();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.notOk(oPCHeaderToolbar.getVisible(), "PlanningCalendarHeader: Toolbar is not visible");

		// Assert
		assert.notOk(oPC._oHeaderObserver, "The ManagedObjectObserver not exists, because remove all toolbar content.");
		assert.equal(oPC.getToolbarContent().length, 0, "PlanningCalendarHeader: Toolbar has two elements");

		// Clean up
		oPC.destroy();
	});

	QUnit.test("PlanningCalendarHeaderToolbar is visible when it has at least one element", function(assert) {
		// Prepare
		var oButton = new Button({text: "TEST"}),
			oLabel = new Label({text: "TEST"}),
			oPC = createPlanningCalendar("PC8", oButton, oLabel).placeAt("bigUiArea"),
			oPCHeaderToolbar = oPC._getHeader()._getActionsToolbar();

		oPC.setBuiltInViews([PlanningCalendarBuiltInView.Hour]);
		sap.ui.getCore().applyChanges();

		assert.equal(oPC.getToolbarContent().length, 2, "PlanningCalendar: has two elements");
		assert.ok(oPCHeaderToolbar.getVisible(), "PlanningCalendarHeader: toolbar is visible");

		// Act
		oPC.removeToolbarContent(oLabel);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oPCHeaderToolbar.getVisible(), "PlanningCalendar: HeaderToolbar is visible");

		// Act
		oPC.removeToolbarContent(oButton);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.notOk(oPCHeaderToolbar.getVisible(), "PlanningCalendar: HeaderToolbar is not visible");

		// Clean up
		oPC.destroy();
	});

	QUnit.test("PlannigCalendarHeaderToolbar possibility to change Title text", function(assert) {
		// Prepare
		var oPC = createPlanningCalendar("PC7").placeAt("qunit-fixture"),
			oTitle = new Title({text: "TEST"}),
			oButton = new Button({text: "ButtonTest"});
			sap.ui.getCore().applyChanges();

		assert.notOk(oPC._oHeaderObserver, "The ManagedObjectObserver not exists, because a Title not added.");

		// Act
		oPC.addToolbarContent(oTitle);
		oPC.addToolbarContent(oButton);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oPC._oHeaderObserver, "The ManagedObjectObserver exists, because add title.");
		assert.equal(oPC._getHeader().getTitle(), "TEST", "PlanningCalendarHeader: header's title is correct");

		// Act
		oTitle.setText("new TEST");

		// Assert
		assert.equal(oPC._getHeader().getTitle(),"new TEST", "PlanningCalendarHeader: header's text has change correctly");

		// Act
		oPC.removeToolbarContent(oButton);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oPC._oHeaderObserver, "The ManagedObjectObserver exists correctly");

		// Act
		oPC.removeToolbarContent(oTitle);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.notOk(oPC._oHeaderObserver, "The ManagedObjectObserver not exists, because remove Title from toolbar content.");

		// Clean up
		oPC.destroy();
	});

	QUnit.test("PlanningCalendarRow", function(assert) {
		var oRow = sap.ui.getCore().byId("PC1-Row1");
		assert.ok(_getListItem(oRow), "ColumnListItem exist");
		assert.equal(_getListItem(oRow).getCells().length, 2, "row has 2 columns");

		var oRowHeader = _getRowHeader(oRow),
			$oRowHeader = oRowHeader.$();

		assert.ok(oRowHeader, "row header exist");
		assert.equal(oRowHeader.getTitle(), oRow.getTitle(), "row header Title");
		assert.equal(oRowHeader.getIcon(), oRow.getIcon(), "row header icon");
		assert.equal(oRowHeader.getDescription(), oRow.getText(), "row header Text");
		assert.notOk($oRowHeader.attr("role"), "row header doesn't have unnecessary role attribute");
		assert.strictEqual($oRowHeader.attr("title"), "Header tooltip", "row header has it's tooltip set in the DOM");

		assert.ok(_getRowTimeline(oRow), "CalendarRow exist");
		assert.ok(_getRowTimeline(oRow) instanceof sap.ui.unified.CalendarRow, "CalendarRow control");

		var oTimeline = _getRowTimeline(oRow);
		assert.ok(!oTimeline.getNonWorkingDays(), "Row1: CalendarRow - nonWorkingDays");
		assert.ok(!oTimeline.getNonWorkingHours(), "Row1: CalendarRow - nonWorkingHours");

		oRow = sap.ui.getCore().byId("PC1-Row2");
		oTimeline = _getRowTimeline(oRow);
		assert.ok(jQuery.sap.equal(oTimeline.getNonWorkingDays(), [2, 3]), "Row2: CalendarRow - nonWorkingDays");
		assert.ok(jQuery.sap.equal(oTimeline.getNonWorkingHours(), [11, 12]), "Row2: CalendarRow - nonWorkingHours");
	});

	QUnit.test("PlanningCalendarRow's customData is used", function (assert) {
		// Prepare
		var oCustomData = new CustomData();

		// Act
		var oPCRow = new PlanningCalendarRow({
			customData: oCustomData
		});
		var oPC = new PlanningCalendar();
		oPC.addRow(oPCRow);

		// Assert
		assert.deepEqual(_getListItem(oPCRow).getCustomData(), oPCRow.getCustomData(),
			"getCustomData of PlanningCalendarRow is used by internal ColumnListItem");

	});

	QUnit.test("PlanningCalendarRow - propagate properties/aggregations updates", function(assert) {
		// Arrange
		var fnDone = assert.async(),
			oModel = new JSONModel(),
			oPC = new PlanningCalendar({
				rows: {
					path: '/',
					template: new PlanningCalendarRow({
						title: "{title}",
						text: "{text}",
						tooltip: "{tooltip}"
					})
				}
			}),
			oRowHeader;

		assert.expect(6);

		// Act
		oModel.setData([{
			title: "title",
			text: "text",
			tooltip: "tooltip"
		}]);
		oPC.setModel(oModel);

		oRowHeader = _getRowHeader(oPC.getRows()[0]);

		setTimeout(function () {
			// Act
			oModel.setData([{
				title: "title UPDATED",
				text: "text UPDATED",
				tooltip: "tooltip UPDATED"
			}]);

			// Assert
			assert.equal(oRowHeader.getTitle(), "title UPDATED", "title is set correctly");
			assert.equal(oRowHeader.getDescription(), "text UPDATED", "text is set correctly");
			assert.equal(oRowHeader.getTooltip(), "tooltip UPDATED", "tooltip is set correctly");

			// Clean up
			oPC.destroy();

			fnDone();
		});

		// Assert
		assert.equal(oRowHeader.getTitle(), "title", "title is set correctly");
		assert.equal(oRowHeader.getDescription(), "text", "text is set correctly");
		assert.equal(oRowHeader.getTooltip(), "tooltip", "tooltip is set correctly");
	});

	QUnit.test("Table", function(assert) {
		var oTable = sap.ui.getCore().byId("PC1-Table");

		assert.equal(oTable.getColumns().length, 2, "Table columns");
		assert.equal(oTable.getItems().length, 2, "Table rows");
		assert.equal(oTable.getItems()[0].getId(), "PC1-Row1-CLI", "Table row1 is first row");

		assert.ok(oTable.getInfoToolbar(), "InfoToolbar exist");
		assert.equal(oTable.getInfoToolbar().getContent().length, 2, "InfoToolbar items");
		assert.equal(oTable.getInfoToolbar().getContent()[0].getId(), "PC1-CalHead", "InfoToolbar: Calendar head exist");
		assert.equal(oTable.getInfoToolbar().getContent()[1].getId(), "PC1-TimesRow", "InfoToolbar: TimesRow exist");
	});

	QUnit.module("rendering");

	QUnit.test("table", function(assert) {
		var oTable = sap.ui.getCore().byId("PC1-Table");

		assert.ok(oTable.getDomRef(), "Table rendered");
		assert.ok(jQuery("#PC1-Row1-Head").get(0), "Row1 Header rendered");
		assert.ok(jQuery("#PC1-Row1-CalRow").get(0), "Row1 CalendarRow rendered");
		assert.ok(jQuery("#PC1-Row2-Head").get(0), "Row2 Header rendered");
		assert.ok(jQuery("#PC1-Row2-CalRow").get(0), "Row2 CalendarRow rendered");

		assert.ok(jQuery("#SF1").get(0), "SearchField rendered");
		assert.ok(jQuery("#B1").get(0), "application button rendered");

		assert.ok(jQuery("#PC1-InfoToolbar").get(0), "Table info toolbar rendered");
		assert.ok(jQuery("#PC1-CalHead").get(0), "Calendar header rendered");
		assert.ok(jQuery("#PC1-TimesRow").get(0), "TimesRow rendered");
	});

	QUnit.test("Appointments", function(assert) {
		assert.ok(jQuery("#PC1-R1H1").get(0), "Row1: IntervalHeader1 rendered");
		assert.ok(jQuery("#PC1-R1A1").get(0), "Row1: Appointment1 rendered");
		assert.ok(!jQuery("#PC1-R1A2").get(0), "Row1: Appointment2 not rendered");
		assert.ok(!jQuery("#PC1-R1A3").get(0), "Row1: Appointment3 not rendered");
		assert.ok(!jQuery("#PC1-R1A4").get(0), "Row1: Appointment4 not rendered");
		assert.ok(!jQuery("#PC1-R2H1").get(0), "Row2: IntervalHeader1 rendered");
		assert.ok(jQuery("#PC1-R2A1").get(0), "Row2: Appointment1 rendered");
	});

	function _getCssColorProperty (oJQuerySet, sCssPropertyName) {
		return /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/.exec(oJQuerySet.css(sCssPropertyName));
	}

	function _getBorderColorPropertyName () {
		if (sap.ui.getCore().getConfiguration().getRTL()) {
			return "border-right-color";
		}
		return "border-left-color";
	}

	function _checkColor (oExtractedRGB, oExpectedRGB, sLabel) {
		assert.equal(oExtractedRGB[1], oExpectedRGB.R, sLabel + " (RED)");
		assert.equal(oExtractedRGB[2], oExpectedRGB.G, sLabel + " (GREEN)");
		assert.equal(oExtractedRGB[3], oExpectedRGB.B, sLabel + " (BLUE)");
	}

	QUnit.test("Check custom colors in Appointments", function (assert) {
		var oAppointment$ = jQuery("#PC1-R1A1");
		assert.ok(!oAppointment$.hasClass("sapUiCalendarAppType01"), "Row1: Color setting prevents default formatting");
		var oBorderColor = _getCssColorProperty(oAppointment$, _getBorderColorPropertyName());
		assert.ok(oBorderColor, "Row1: Appointment1 has a border color");
		_checkColor(oBorderColor, {R: 255, G: 0, B: 255}, "Row1: Appointment1 has the right custom border color");
	});

	QUnit.test("Check custom colors in IntervalHeader", function (assert) {
		var oIntervalHeader$ = jQuery("#PC1-R1H1");
		var oBorderColor;
		assert.ok(!oIntervalHeader$.hasClass("sapUiCalendarRowAppsIntHeadType02"), "Row2: Color setting prevents default formatting");
		oBorderColor = _getCssColorProperty(oIntervalHeader$, _getBorderColorPropertyName());
		assert.ok(oBorderColor, "Row2: IntervalHeader1 has a border color");
		_checkColor(oBorderColor, {R: 255, G:0, B: 0}, "Row2: IntervalHeader1 has the right custom border color");
	});

	QUnit.module("rendering - Hours View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());

		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			sap.ui.getCore().applyChanges();
		}
	});
	/*
	 2675
	 */
	QUnit.test("checks for the number of hours on small screen", function(assert) {
		//Arrange
		this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Hour, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), 600, "width is set to 600px"); // this is only for check that width of the screen is set to 600 px
		assert.equal(jQuery("#PC3-TimesRow-times").find('.sapUiCalItem').length , 6, "hours are 6");
	});
	/*
	 2683
	 */
	QUnit.test("checks for the number of hours on big screen", function(assert) {
		//Arrange
		this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.Hour, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px"); // this is only for check that width of the screen is set to 1024 px
		assert.equal(jQuery("#PC3-TimesRow-times").find('.sapUiCalItem').length , 12, "hours are 12");
	});
	QUnit.module("rendering - Days View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());

		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			sap.ui.getCore().applyChanges();
		}
	});
	/*
	 2678
	 */
	QUnit.test("checks for the number of days on small screen on Days View", function(assert) {
		//Arrange
		this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Day, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "600", "width is set to 600px"); // this is only for check that width of the screen is set to 600 px
		assert.equal(jQuery("#PC3-DatesRow-days .sapUiCalItem").length , 7, "days are 7");
	});
	/*
	 2677
	 */
	QUnit.test("checks for the number of days on big screen on Days View", function(assert) {
		//Arrange
		this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.Day, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px"); // this is only for check that width of the screen is set to 1024 px
		assert.equal(jQuery("#PC3-DatesRow-days .sapUiCalItem").length , 14, "days are 14");
	});
	QUnit.module("rendering - Months View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());
		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			sap.ui.getCore().applyChanges();
		}
	});
	/*
	 2688
	 */
	QUnit.test("checks for the number of months on very small screen", function(assert) {
		//Arrange
		this.prepareTest("verySmallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Month, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "300", "width is set to 300px"); // this is only for check that width of the screen is set to 300 px
		assert.equal(jQuery("#PC3-MonthsRow-months .sapUiCalItem").length , 3, "months are 3");
	});
	/*
	 2687
	 */
	QUnit.test("checks for the number of months on small screen", function(assert) {
		//Arrange
		this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Month, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "600", "width is set to 600px"); // this is only for check that width of the screen is set to 600 px
		assert.equal(jQuery("#PC3-MonthsRow-months .sapUiCalItem").length , 6, "months are 6");
	});
	/*
	 2686
	 */
	QUnit.test("checks for the number of months on big screen", function(assert) {
		//Arrange
		this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.Month, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px"); // this is only for check that width of the screen is set to 1024 px
		assert.equal(jQuery("#PC3-MonthsRow-months .sapUiCalItem").length , 12, "months are 12");
	});
	QUnit.module("rendering - 1Week View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());

		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			sap.ui.getCore().applyChanges();
		}
	});
	/*
	 2696
	 */
	QUnit.test("checks for the number of days on small screen on 1Week View", function(assert) {
		//Arrange
		this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Week, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "600", "width is set to 600px"); // this is only for check that width of the screen is set to 600 px
		assert.equal(jQuery("#PC3-WeeksRow-days .sapUiCalItem").length , 7, "days are 7");
	});
	/*
	 2695
	 */
	QUnit.test("checks for the number of days on big screen on 1Week View", function(assert) {
		//Arrange
		this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.Week, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px");  // this is only for check that width of the screen is set to 1024 px
		assert.equal(jQuery("#PC3-WeeksRow-days .sapUiCalItem").length , 7, "days are 7");
	});
	QUnit.module("rendering - 1Month View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());

		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			sap.ui.getCore().applyChanges();
		}
	});
	/*
	 2703
	 */
	QUnit.test("checks for the number of days on small screen", function(assert) {
		//Arrange
		this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.OneMonth, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "600", "width is set to 600px"); // this is only for check that width of the screen is set to 600 px
		assert.equal(jQuery("#PC3-OneMonthsRow-days .sapUiCalItem").length , 35, "days are 35");
	});
	/*
	 2702
	 */
	QUnit.test("checks for the number of days on big screen", function(assert) {
		//Arrange
		this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.OneMonth, this.oPC);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px"); // this is only for check that width of the screen is set to 1024 px
		assert.equal(jQuery("#PC3-OneMonthsRow-days .sapUiCalItem").length , 31, "days are 31");
	});

	QUnit.module("Setters", {
		beforeEach: function() {
			this.oPC = createPlanningCalendar("SelectionMode", new SearchField(), new Button());
			// TimesRow, DatesRow, MonthsRow represent all 5 existing intervals.
			// That is because the two left intervals (OneMonthsRow and WeeksRow)
			// inherit DatesRow one.
			this.aIntervalRepresentatives = [
				"sap.ui.unified.calendar.TimesRow",
				"sap.ui.unified.calendar.DatesRow",
				"sap.ui.unified.calendar.MonthsRow",
				"sap.ui.unified.calendar.OneMonthDatesRow"
			];
		},
		afterEach: function() {
			//Cleanup
			this.oPC.destroy();
		},
		checkInitItemPlacement: function  () {
			var oInfoToolbarContent = this.oPC._oInfoToolbar.getContent();

			assert.strictEqual(oInfoToolbarContent.length, 2, "Internal _oInfoToolbar has correct amount of controls in it's content.");
			assert.ok(oInfoToolbarContent[0].isA("CalendarHeader"), "First child of _oInfoToolbar is a CalendarHeader");
			assert.ok(oInfoToolbarContent[1].isA(this.aIntervalRepresentatives), "Second child of _oInfoToolbar is an interval");
			assert.notOk(jQuery("#SelectionMode-All").get(0), "Select All CheckBox not rendered");
		},
		checkItemPlacementInMultiSel: function (iInfoToolbarContentLength) {
			var oInfoToolbarContent = this.oPC._oInfoToolbar.getContent();

			assert.strictEqual(oInfoToolbarContent.length, iInfoToolbarContentLength, "Internal _oInfoToolbar has correct amount of controls in it's content.");
			assert.ok(oInfoToolbarContent[0].isA("CalendarHeader"), "First child of _oInfoToolbar is a CalendarHeader");
			assert.ok(oInfoToolbarContent[1].isA(this.aIntervalRepresentatives), "Second child of _oInfoToolbar is an interval");
			if (iInfoToolbarContentLength > 2) {
				assert.notOk(this.oPC._oCalendarHeader.getAllCheckBox(), "Select All CheckBox does not exist in the _oCalendarHeader");
			} else {
				assert.ok(this.oPC._oCalendarHeader.getAllCheckBox(), "Internal _oCalendarHeader holds the select all checkbox");
			}
			assert.ok(jQuery("#SelectionMode-All").get(0), "Select All CheckBox rendered");
		},
		checkItemPlacementAfterHidingRowHeaders: function (bDesktop) {
			var oInfoToolbarContent = this.oPC._oInfoToolbar.getContent();

			assert.strictEqual(oInfoToolbarContent.length, 3, "Internal _oInfoToolbar has correct amount of controls in it's content.");
			assert.ok(oInfoToolbarContent[0].isA("CalendarHeader"), "First child of _oInfoToolbar is a CalendarHeader");
			if (bDesktop) {
				assert.ok(oInfoToolbarContent[1].isA("sap.m.CheckBox"), "Second child of _oInfoToolbar is a checkBox");
				assert.ok(oInfoToolbarContent[2].isA(this.aIntervalRepresentatives), "Third child of _oInfoToolbar is an interval");
			} else {
				assert.ok(oInfoToolbarContent[1].isA(this.aIntervalRepresentatives), "Second child of _oInfoToolbar is an interval");
				assert.ok(oInfoToolbarContent[2].isA("sap.m.CheckBox"), "Third child of _oInfoToolbar is a checkBox");
			}
		}
	});

	QUnit.test("startDate", function(assert) {
		var oExpectedDate = new Date("2015", "0", "1", "08", "00");
		var iStartTime = oPC1.getStartDate().getTime();
		assert.equal(oExpectedDate.getTime(), iStartTime, "Start date is OK");
		assert.equal(sap.ui.getCore().byId("PC1-TimesRow").getStartDate().getTime(), iStartTime, "TimesRow Start date");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getStartDate().getTime(), iStartTime, "CalendarRow1 Start date");
		assert.equal(sap.ui.getCore().byId("PC1-Row2-CalRow").getStartDate().getTime(), iStartTime, "CalendarRow2 Start date");

		oExpectedDate = new Date("2015", "0", "1", "07", "00");
		oPC1.setStartDate(new Date("2015", "0", "1", "07", "00"));
		sap.ui.getCore().applyChanges();
		iStartTime = oPC1.getStartDate().getTime();
		assert.equal(oExpectedDate.getTime(), iStartTime, "Start date is OK");
		assert.equal(sap.ui.getCore().byId("PC1-TimesRow").getStartDate().getTime(), iStartTime, "TimesRow Start date");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getStartDate().getTime(), iStartTime, "CalendarRow1 Start date");
		assert.equal(sap.ui.getCore().byId("PC1-Row2-CalRow").getStartDate().getTime(), iStartTime, "CalendarRow2 Start date");
		assert.ok(jQuery("#PC1-R1A1").get(0), "Row1: Appointment1 still rendered");
		assert.ok(jQuery("#PC1-R1A2").get(0), "Row1: Appointment2 now rendered");
	});

	QUnit.test("viewKey", function(assert) {
		var sViewKey = oPC1.getViewKey();
		assert.equal(sViewKey, CalendarIntervalType.Hour, "Default ViewKey");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Hour, "CalendarRow1 intervalType");
		assert.equal(sap.ui.getCore().byId("PC1-Row2-CalRow").getIntervalType(), CalendarIntervalType.Hour, "CalendarRow2 intervalType");
		assert.ok(!sap.ui.getCore().byId("PC1-DatesRow"), "DatesRow control not exist");
		assert.ok(!sap.ui.getCore().byId("PC1-MonthsRow"), "MonthsRow control not exist");

		oPC1.setViewKey(CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();
		sViewKey = oPC1.getViewKey();
		assert.equal(sViewKey, CalendarIntervalType.Day, "Default ViewKey");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Day, "CalendarRow1 intervalType");
		assert.equal(sap.ui.getCore().byId("PC1-Row2-CalRow").getIntervalType(), CalendarIntervalType.Day, "CalendarRow2 intervalType");
		assert.ok(sap.ui.getCore().byId("PC1-TimesRow"), "TimesRow control still exist");
		assert.ok(sap.ui.getCore().byId("PC1-DatesRow"), "DatesRow control now exist");
		assert.ok(!sap.ui.getCore().byId("PC1-MonthsRow"), "MonthsRow control not exist");
		assert.ok(!jQuery("#PC1-TimesRow").get(0), "TimesRow not rendered");
		assert.ok(jQuery("#PC1-DatesRow").get(0), "DatesRow rendered");

		oPC1.setViewKey(CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();
		sViewKey = oPC1.getViewKey();
		assert.equal(sViewKey, CalendarIntervalType.Month, "Default ViewKey");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Month, "CalendarRow1 intervalType");
		assert.equal(sap.ui.getCore().byId("PC1-Row2-CalRow").getIntervalType(), CalendarIntervalType.Month, "CalendarRow2 intervalType");
		assert.ok(sap.ui.getCore().byId("PC1-TimesRow"), "TimesRow control still exist");
		assert.ok(sap.ui.getCore().byId("PC1-DatesRow"), "DatesRow control now exist");
		assert.ok(sap.ui.getCore().byId("PC1-MonthsRow"), "MonthsRow control not exist");
		assert.ok(!jQuery("#PC1-TimesRow").get(0), "TimesRow not rendered");
		assert.ok(!jQuery("#PC1-DatesRow").get(0), "DatesRow not rendered");
		assert.ok(jQuery("#PC1-MonthsRow").get(0), "MonthsRow rendered");
	});

	QUnit.test("width", function(assert) {
		assert.ok(!oPC1.getWidth(), "no width set ad default");
		var sStyle = oPC1.$().attr("style") || "";
		assert.ok(sStyle.search("width") < 0, "no width set on DOM");

		oPC1.setWidth("90%");
		sap.ui.getCore().applyChanges();
		sStyle = oPC1.$().attr("style") || "";
		var aTest = sStyle.match(/width:(\s?)(\d+(.?)(\d+))/);
		var iWidth = aTest ? aTest[2] : 0;
		assert.equal(iWidth, 90 + "", "width set on DOM");
	});

	QUnit.test("height", function(assert) {
		assert.ok(!oPC1.getHeight(), "no height set ad default");
		var sStyle = oPC1.$().attr("style") || "";
		assert.ok(sStyle.search("height") < 0, "no height set on DOM");

		oPC1.setHeight("90%");
		sap.ui.getCore().applyChanges();
		sStyle = oPC1.$().attr("style") || "";
		var aTest = sStyle.match(/height:(\s?)(\d+(.?)(\d+))/);
		var iheight = aTest ? aTest[2] : 0;
		assert.equal(iheight, 90 + "", "height set on DOM");
		assert.ok(sStyle.indexOf("height: 90%;") > -1 , "The height is kept in percents");

		// set fixed height because when in percent computed initially value in pixels
		// differs with 1 or 2 pixels from the "final" value
		oPC1.setHeight("800px");
		sap.ui.getCore().applyChanges();
		var $Table = oPC1.getDomRef().querySelector("table");

		// Table height is the PlanningCalendar height minus the height of the toolbars
		sStyle = oPC1.$().height() - oPC1._oInfoToolbar.$().height() + "px";
		assert.equal($Table.style.height, sStyle, "The height is set correctly to the Table");
	});

	QUnit.test("showIntervalHeaders", function(assert) {
		assert.ok(oPC1.getShowIntervalHeaders(), "ShowIntervalHeaders is enabled by default");
		assert.ok(oPC1.getShowEmptyIntervalHeaders(), "ShowEmptyIntervalHeaders is enabled by default");
		var aRows = oPC1.getRows();
		for (var i = 0; i < aRows.length; i++) {
			assert.ok(_getRowTimeline(aRows[i]).getShowIntervalHeaders(), "Row " + i + ": ShowIntervalHeaders set");
			assert.ok(_getRowTimeline(aRows[i]).getShowEmptyIntervalHeaders(), "Row " + i + ": ShowEmptyIntervalHeaders set");
		}

		oPC1.setShowIntervalHeaders(false);
		oPC1.setShowEmptyIntervalHeaders(false);
		sap.ui.getCore().applyChanges();
		for (var i = 0; i < aRows.length; i++) {
			assert.ok(!_getRowTimeline(aRows[i]).getShowIntervalHeaders(), "Row " + i + ": ShowIntervalHeaders not set");
			assert.ok(!_getRowTimeline(aRows[i]).getShowEmptyIntervalHeaders(), "Row " + i + ": ShowEmptyIntervalHeaders not set");
		}

		oPC1.setShowIntervalHeaders(true);
		oPC1.setShowEmptyIntervalHeaders(true);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("groupAppointmentsMode", function (assert) {
		//Assert: default value
		assert.equal(oPC1.getGroupAppointmentsMode(), GroupAppointmentsMode.Collapsed, "GroupAppointmentsMode is set to 'Collapsed' by default");
		var aRows = oPC1.getRows();
		for (var i = 0; i < aRows.length; i++) {
			assert.ok(_getRowTimeline(aRows[i]).getGroupAppointmentsMode(), "CalendarRow " + i + ": GroupAppointmentsMode is set to 'Collapsed'");
		}

		// Act
		oPC1.setGroupAppointmentsMode(GroupAppointmentsMode.Expanded);
		sap.ui.getCore().applyChanges();
		// Assert
		assert.equal(oPC1.getGroupAppointmentsMode(), GroupAppointmentsMode.Expanded, "GroupAppointmentsMode is set to 'Expanded'");
		for (var i = 0; i < aRows.length; i++) {
			assert.equal(_getRowTimeline(aRows[i]).getGroupAppointmentsMode(), GroupAppointmentsMode.Expanded, "CalendarRow " + i + ": GroupAppointmentsMode is set to 'Expanded'");
		}

		// Cleanup
		oPC1.setGroupAppointmentsMode(GroupAppointmentsMode.Collapsed);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("appointmentsReducedHeight", function(assert) {
		assert.ok(!oPC1.getAppointmentsReducedHeight(), "AppointmentsReducedHeight is disabled by default");
		var aRows = oPC1.getRows();
		for (var i = 0; i < aRows.length; i++) {
			assert.ok(!_getRowTimeline(aRows[i]).getAppointmentsReducedHeight(), "Row " + i + ": AppointmentsReducedHeight not set");
		}

		oPC1.setAppointmentsReducedHeight(true);
		sap.ui.getCore().applyChanges();
		for (var i = 0; i < aRows.length; i++) {
			assert.ok(_getRowTimeline(aRows[i]).getAppointmentsReducedHeight(), "Row " + i + ": AppointmentsReducedHeight set");
		}

		oPC1.setAppointmentsReducedHeight(false);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("appointmentsVisualization", function(assert) {
		assert.equal(oPC1.getAppointmentsVisualization(), CalendarAppointmentVisualization.Standard, "AppointmentVisualization default set");
		var aRows = oPC1.getRows();
		for (var i = 0; i < aRows.length; i++) {
			assert.equal(_getRowTimeline(aRows[i]).getAppointmentsVisualization(), CalendarAppointmentVisualization.Standard, "Row " + i + ": AppointmentVisualization default set");
		}

		oPC1.setAppointmentsVisualization(CalendarAppointmentVisualization.Filled);
		sap.ui.getCore().applyChanges();
		for (var i = 0; i < aRows.length; i++) {
			assert.equal(_getRowTimeline(aRows[i]).getAppointmentsVisualization(), CalendarAppointmentVisualization.Filled, "Row " + i + ": AppointmentVisualization Filled set");
		}

		oPC1.setAppointmentsVisualization(CalendarAppointmentVisualization.Standard);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("showRowHeaders", function(assert) {
		function getAppointmentsColumn() {
			return oPC1.getAggregation("table").getColumns()[1];
		}
		//Assert
		assert.ok(oPC1.getShowRowHeaders(), "ShowRowHeaders is enabled by default");
		assert.equal(getAppointmentsColumn().getDemandPopin(), true, "By Default appointments column is in Popin mode");
		assert.equal(getAppointmentsColumn().getMinScreenWidth().toLowerCase(), ScreenSize.Desktop.toLowerCase(),
			"By Default appointments column has minScreenWidth set to sap.m.ScreenSize.Desktop");

		//Act
		oPC1.setShowRowHeaders(false);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(!jQuery("#PC1-Row1-Head").is(":visible"), "Row1 Header not visible");
		assert.equal(getAppointmentsColumn().getDemandPopin(), false, "If showRowHeaders is false, appointments Column is NOT in Popin mode");
		assert.equal(getAppointmentsColumn().getMinScreenWidth(), "",
			"If showRowHeaders is false appointments column has minScreenWidth is empty");

		//Act
		oPC1.setShowRowHeaders(true);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(jQuery("#PC1-Row1-Head").is(":visible"), "Row1 Header visible");
		assert.equal(getAppointmentsColumn().getDemandPopin(), true, "If showRowHeaders is set to true, appointments column is in Popin mode");
		assert.equal(getAppointmentsColumn().getMinScreenWidth().toLowerCase(), ScreenSize.Desktop.toLowerCase(),
			"If showRowHeaders is set to true, appointments column has minScreenWidth set to sap.m.ScreenSize.Desktop");
	});

	QUnit.test("noDataText", function(assert) {
		var oTable = sap.ui.getCore().byId("PC1-Table");
		assert.ok(!oPC1.getNoDataText(), "noDataText empty by default");
		assert.ok(!oTable.getProperty("noDataText"), "noDataText of table empty by default"); // use getProperty("noDataText") because getter is overwritten in ListBase

		oPC1.setNoDataText("Test");
		sap.ui.getCore().applyChanges();
		assert.equal(oPC1.getNoDataText(), "Test", "noDataText set");
		assert.equal(oTable.getProperty("noDataText"), "Test", "noDataText set on table");

		oPC1.setNoDataText(null);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Calendar: minDate/maxDate", function(assert) {
		assert.ok(!oPC1.getMinDate(), "no minDate set by default");
		assert.ok(!sap.ui.getCore().byId("PC1-Header-Cal").getMinDate(), "Calendar no minDate set by default");

		assert.ok(!oPC1.getMaxDate(), "no maxDate set by default");
		assert.ok(!sap.ui.getCore().byId("PC1-Header-Cal").getMaxDate(), "Calendar no maxDate set by default");

		var oMinDate = new Date(2000, 0 , 1, 0, 0, 0);
		oPC1.setMinDate(oMinDate);
		assert.ok(jQuery.sap.equal(oMinDate, oPC1.getMinDate()), "no minDate set");
		assert.ok(jQuery.sap.equal(oMinDate, sap.ui.getCore().byId("PC1-Header-Cal").getMinDate()), "Calendar minDate set");

		var oMaxDate = new Date(2050, 11 , 31, 23, 59, 59);
		oPC1.setMaxDate(oMaxDate);
		assert.ok(jQuery.sap.equal(oMaxDate, oPC1.getMaxDate()), "no minDate set");
		assert.ok(jQuery.sap.equal(oMaxDate, sap.ui.getCore().byId("PC1-Header-Cal").getMaxDate()), "Calendar maxDate set");

		oPC1.setMinDate();
		assert.ok(!oPC1.getMinDate(), "no minDate set");
		assert.ok(!sap.ui.getCore().byId("PC1-Header-Cal").getMinDate(), "Calendar no minDate");

		oPC1.setMaxDate();
		assert.ok(!oPC1.getMaxDate(), "no maxDate");
		assert.ok(!sap.ui.getCore().byId("PC1-Header-Cal").getMaxDate(), "Calendar no maxDate");
	});

	QUnit.test("CustomMonthPicker: minDate/maxDate", function(assert) {
		// Prepare
		var oMinDate = new Date(2000, 0 , 1, 0, 0, 0),
			oMaxDate = new Date(2050, 11 , 31, 23, 59, 59),
			oCustomMonthPicker = this.oPC._getHeader().getAggregation("_monthPicker");

		// Act
		this.oPC.setMinDate(oMinDate);
		this.oPC.setMaxDate(oMaxDate);

		// Assert
		assert.deepEqual(
			oCustomMonthPicker.getMinDate(),
			this.oPC.getMinDate(),
			"CustomMonthPicker has minDate set"
		);
		assert.deepEqual(
			oCustomMonthPicker.getMaxDate(),
			this.oPC.getMaxDate(),
			"CustomMonthPicker has maxDate set"
		);
	});

	QUnit.test("CustomYearPicker: minDate/maxDate", function(assert) {
		// Prepare
		var oMinDate = new Date(2000, 0 , 1, 0, 0, 0),
			oMaxDate = new Date(2050, 11 , 31, 23, 59, 59),
			oCustomYearPicker = this.oPC._getHeader().getAggregation("_yearPicker");

		// Act
		this.oPC.setMinDate(oMinDate);
		this.oPC.setMaxDate(oMaxDate);

		// Assert
		assert.deepEqual(
			oCustomYearPicker.getMinDate(),
			this.oPC.getMinDate(),
			"CustomYearPicker has minDate set"
		);
		assert.deepEqual(
			oCustomYearPicker.getMaxDate(),
			this.oPC.getMaxDate(),
			"CustomYearPicker has maxDate set"
		);
	});

	QUnit.test("rows", function(assert) {
		var oSpyRerender;
		var oTable = sap.ui.getCore().byId("PC1-Table");
		assert.equal(oPC1.getRows().length, 2, "PlanningCalendarRows assigned");
		var iIntervals = 12;
		if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]) {
			iIntervals = 3;
		} else if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]) {
			iIntervals = 6;
		}

		var oRow = new PlanningCalendarRow("NewRow", {
			icon: "sap-icon://employee",
			title: "new Row"
		});
		oPC1.addRow(oRow);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getItems().length, 3, "Table rows");
		assert.equal(oTable.getItems()[2].getId(), "NewRow-CLI", "new row added to table");
		assert.ok(jQuery("#NewRow-Head").get(0), "new row Header rendered");
		assert.ok(jQuery("#NewRow-CalRow").get(0), "new row CalendarRow rendered");
		assert.equal(_getRowTimeline(oRow).getStartDate().getTime(), oPC1.getStartDate().getTime(), "Start date of CalendarRow");
		assert.equal(_getRowTimeline(oRow).getIntervalType(), CalendarIntervalType.Month, "IntervalType of CalendarRow");
		assert.equal(_getRowTimeline(oRow).getIntervals(), iIntervals, "Intervals of CalendarRow");

		oPC1.removeRow(oRow);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getItems().length, 2, "Table rows");
		assert.ok(!jQuery("#NewRow-Head").get(0), "new row Header not rendered");
		assert.ok(!jQuery("#NewRow-CalRow").get(0), "new row CalendarRow not rendered");

		oPC1.insertRow(oRow, 1);
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getItems().length, 3, "Table rows");
		assert.equal(oTable.getItems()[1].getId(), "NewRow-CLI", "new row added to table");
		assert.ok(jQuery("#NewRow-Head").get(0), "new row Header rendered");
		assert.ok(jQuery("#NewRow-CalRow").get(0), "new row CalendarRow rendered");
		assert.equal(_getRowTimeline(oRow).getStartDate().getTime(), oPC1.getStartDate().getTime(), "Start date of CalendarRow");
		assert.equal(_getRowTimeline(oRow).getIntervalType(), CalendarIntervalType.Month, "IntervalType of CalendarRow");
		assert.equal(_getRowTimeline(oRow).getIntervals(), iIntervals, "Intervals of CalendarRow");

		var aRemoved = oPC1.removeAllRows();
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getItems().length, 0, "Table rows removed");
		assert.equal(aRemoved.length, 3, "3 rows removed");

		for (var i = 0; i < aRemoved.length; i++) {
			aRemoved[i].destroy();
		}

		oPC1 = initPlanningCalendar("PC1", "SF1", "B1");
		oTable = sap.ui.getCore().byId("PC1-Table");

		oSpyRerender = sinon.spy(oPC1, "invalidate");
		oPC1.destroyRows();
		sap.ui.getCore().applyChanges();
		assert.equal(oTable.getItems().length, 0, "Table rows destroyed");
		assert.ok(!sap.ui.getCore().byId("PC1-Row1"), "Row1 destroyed");
		assert.ok(oSpyRerender.callCount > 0, "Calendar was rerendered");
		oSpyRerender.restore();

		oPC1 = initPlanningCalendar("PC1", "SF1", "B1");
	});

	QUnit.test("views", function(assert) {
		assert.equal(oPC1.getViews().length, 0, "no views set in aggregation per default");

		oPC1.setViewKey("D");
		var oView = new PlanningCalendarView("View-H", {
			key: "H",
			intervalType: CalendarIntervalType.Hour,
			description: "View1",
			intervalsS: 1,
			intervalsM: 2,
			intervalsL: 3
		});
		oPC1.addView(oView);
		oView = new PlanningCalendarView("View-D", {
			key: "D",
			intervalType: CalendarIntervalType.Day,
			description: "View2",
			intervalsS: 2,
			intervalsM: 4,
			intervalsL: 6,
			showSubIntervals: true
		});
		oPC1.addView(oView);
		sap.ui.getCore().applyChanges();
		assert.equal(oPC1.getViews().length, 2, "2 views set");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Day, "CalendarRow1 intervalType");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getShowSubIntervals(), true, "CalendarRow1 subIntervals");
		if (jQuery("#PC1").outerWidth() > 1100) {
			assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getIntervals(), 6, "CalendarRow1 intervals");
		}
		assert.ok(!jQuery("#PC1-TimesRow").get(0), "TimesRow not rendered");
		assert.ok(jQuery("#PC1-DatesRow").get(0), "DatesRow rendered");

		oView.setIntervalsL(5);
		sap.ui.getCore().applyChanges();
		if (jQuery("#PC1").outerWidth() > 1100) {
			assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getIntervals(), 5, "CalendarRow1 intervals");
		}

		oPC1.destroyViews();
		oPC1.setViewKey(CalendarIntervalType.Hour);
		sap.ui.getCore().applyChanges();
		assert.equal(oPC1.getViews().length, 0, "no views set in aggregation");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Hour, "CalendarRow1 intervalType");
		assert.equal(sap.ui.getCore().byId("PC1-Row1-CalRow").getShowSubIntervals(), false, "CalendarRow1 subIntervals");
	});

	QUnit.test("specialDates", function(assert) {

		var oTimesRow = sap.ui.getCore().byId("PC1-TimesRow");
		assert.equal(oTimesRow.getSpecialDates().length, 2, "TimesRow gets SpecialDates from PlanningCalendar");
		assert.ok(jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate rendered");

		oPC1.addSpecialDate(new DateTypeRange("SD1", {
			startDate: new Date(2015, 0, 1, 15, 30),
			type: CalendarDayType.Type01,
			tooltip: "Test"
		}));
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#PC1-TimesRow-201501011500").hasClass("sapUiCalItemType01"), "new SpecialDate rendered");

		oPC1.insertSpecialDate(new DateTypeRange("SD2", {
			startDate: new Date(2015, 0, 1, 16, 30),
			type: CalendarDayType.Type01,
			tooltip: "Test"
		}), 1);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#PC1-TimesRow-201501011600").hasClass("sapUiCalItemType01"), "new SpecialDate rendered");

		var oSD = oPC1.removeSpecialDate("SD1");
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#PC1-TimesRow--TimesRow-201501011500").hasClass("sapUiCalItemType01"), "new SpecialDate not longer rendered");
		oSD.destroy();

		var aRemoved = oPC1.removeAllSpecialDates();
		sap.ui.getCore().applyChanges();
		assert.equal(aRemoved.length, 3, "3 specialDates removed");
		assert.ok(!jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate not longer rendered");
		assert.ok(!jQuery("#PC1-TimesRow-201501011600").hasClass("sapUiCalItemType01"), "new SpecialDate not longer rendered");

		for (var i = 0; i < aRemoved.length; i++) {
			aRemoved[i].destroy();
		}

		oPC1 = initPlanningCalendar("PC1", "SF1", "B1");
		assert.ok(jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate rendered again");

		oPC1.destroySpecialDates();
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate not longer rendered");
	});

	QUnit.test("Row header", function(assert) {
		var oRow = sap.ui.getCore().byId("PC1-Row1");
		var oRowHeader = _getRowHeader(oRow);

		oRow.setTitle("Test");
		oRow.setText("Test");
		oRow.setIcon("sap-icon://sap-ui5");
		sap.ui.getCore().applyChanges();
		assert.equal(oRowHeader.getTitle(), "Test", "row header Title");
		assert.equal(oRowHeader.getDescription(), "Test", "row header Text");
		assert.equal(oRowHeader.getIcon(), "sap-icon://sap-ui5", "row header icon");
	});

	QUnit.test("Row nonWorkingIntervals", function(assert) {
		var oRow = sap.ui.getCore().byId("PC1-Row1");
		var oTimeline = _getRowTimeline(oRow);

		oRow.setNonWorkingDays([2, 3]);
		oRow.setNonWorkingHours([11, 12]);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.equal(oTimeline.getNonWorkingDays(), [2, 3]), "CalendarRow - nonWorkingDays");
		assert.ok(jQuery.sap.equal(oTimeline.getNonWorkingHours(), [11, 12]), "CalendarRow - nonWorkingHours");
	});

	QUnit.test("Row selected", function(assert) {
		var oRow = sap.ui.getCore().byId("PC1-Row1");
		var oColumnListItem = _getListItem(oRow);
		assert.ok(!oRow.getSelected(), "Row not selected as default");
		assert.ok(!oColumnListItem.getSelected(), "ColumnListItem not selected as default");

		oRow.setSelected(true);
		sap.ui.getCore().applyChanges();
		assert.ok(oRow.getSelected(), "Row now selected");
		assert.ok(oColumnListItem.getSelected(), "ColumnListItem now selected");
	});

	QUnit.test("Row appointments", function(assert) {
		var oRow = sap.ui.getCore().byId("PC1-Row1");
		var oTimeline = _getRowTimeline(oRow);
		assert.ok(jQuery.sap.equal(oRow.getAppointments(), oTimeline.getAppointments()), "CalendarRow appointments");
		assert.equal(oRow.getAppointments().length, 4, "number of appointments");

		var oAppointment = new CalendarAppointment("NewAppointment", {
			startDate: new Date("2015", "0", "1", "12", "00"),
			endDate: new Date("2015", "0", "1", "15", "00"),
			type: CalendarDayType.Type10,
			title: "New",
			text: "Appointment",
			tooltip: "Test",
			icon: "sap-icon://sap-ui5"
		});

		oRow.addAppointment(oAppointment);
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getAppointments().length, 5, "number of appointments after add");
		assert.equal(oRow.getAppointments()[4].getId(), "NewAppointment", "position of new appointments in array");
		assert.ok(oAppointment.getDomRef(), "Appointment rendered");

		oRow.removeAppointment(oAppointment);
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getAppointments().length, 4, "number of appointments after remove");
		assert.ok(!oAppointment.getDomRef(), "Appointment not rendered");

		oRow.insertAppointment(oAppointment, 1);
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getAppointments().length, 5, "number of appointments after insert");
		assert.equal(oRow.getAppointments()[1].getId(), "NewAppointment", "position of new appointments in array");
		assert.ok(oAppointment.getDomRef(), "Appointment rendered");

		var aRemoved = oRow.removeAllAppointments();
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getAppointments().length, 0, "number of appointments after remove all");
		assert.ok(oAppointment, "Appointment still exist");
		assert.ok(!oAppointment.getDomRef(), "Appointment not rendered");
		for (var i = 0; i < aRemoved.length; i++) {
			aRemoved[i].destroy();
		}

		oRow = sap.ui.getCore().byId("PC1-Row2");
		oTimeline = _getRowTimeline(oRow);
		assert.ok(sap.ui.getCore().byId("PC1-R2A1"), "Appointment exist before destroy");
		oRow.destroyAppointments();
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getAppointments().length, 0, "number of appointments after destroy");
		assert.ok(!sap.ui.getCore().byId("PC1-R2A1"), "Appointment destroyed");

		oPC1 = initPlanningCalendar("PC1", "SF1", "B1");
	});

	QUnit.test("Row intervalHeaders", function(assert) {
		var oRow = sap.ui.getCore().byId("PC1-Row1");
		var oTimeline = _getRowTimeline(oRow);
		assert.ok(jQuery.sap.equal(oRow.getIntervalHeaders(), oTimeline.getIntervalHeaders()), "CalendarRow IntervalHeaders");
		assert.equal(oRow.getIntervalHeaders().length, 1, "number of IntervalHeaders");

		var oIntervalHeader = new CalendarAppointment("NewIntervalHeader", {
			startDate: new Date("2015", "0", "1", "12", "00"),
			endDate: new Date("2015", "0", "1", "15", "00"),
			type: CalendarDayType.Type10,
			title: "New",
			tooltip: "Test",
			icon: "sap-icon://sap-ui5"
		});

		oRow.addIntervalHeader(oIntervalHeader);
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getIntervalHeaders().length, 2, "number of IntervalHeaders after add");
		assert.equal(oRow.getIntervalHeaders()[1].getId(), "NewIntervalHeader", "position of new IntervalHeaders in array");
		assert.ok(oIntervalHeader.getDomRef(), "IntervalHeader rendered");

		oRow.removeIntervalHeader(oIntervalHeader);
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getIntervalHeaders().length, 1, "number of IntervalHeaders after remove");
		assert.ok(!oIntervalHeader.getDomRef(), "IntervalHeader not rendered");

		oRow.insertIntervalHeader(oIntervalHeader, 0);
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getIntervalHeaders().length, 2, "number of IntervalHeaders after insert");
		assert.equal(oRow.getIntervalHeaders()[0].getId(), "NewIntervalHeader", "position of new IntervalHeaders in array");
		assert.ok(oIntervalHeader.getDomRef(), "IntervalHeader rendered");

		var aRemoved = oRow.removeAllIntervalHeaders();
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getIntervalHeaders().length, 0, "number of IntervalHeaders after remove all");
		assert.ok(oIntervalHeader, "IntervalHeader still exist");
		assert.ok(!oIntervalHeader.getDomRef(), "IntervalHeader not rendered");
		for (var i = 0; i < aRemoved.length; i++) {
			aRemoved[i].destroy();
		}

		oRow = sap.ui.getCore().byId("PC1-Row2");
		assert.ok(sap.ui.getCore().byId("PC1-R2H1"), "IntervalHeader exist before destroy");
		oRow.destroyIntervalHeaders();
		sap.ui.getCore().applyChanges();
		assert.equal(oRow.getIntervalHeaders().length, 0, "number of IntervalHeaders after destroy");
		assert.ok(!sap.ui.getCore().byId("PC1-R2H1"), "IntervalHeader destroyed");

		oPC1 = initPlanningCalendar("PC1", "SF1", "B1");
	});

	QUnit.test("legend works with sap.ui.unified.CalendarLegend", function (assert) {
		// arrange
		var oLegendItem = new CalendarLegendItem({
				type: "Type01",
				text: "Text 2"
			}),
			oPC = createPlanningCalendar(
				"invalidationExample",
				new SearchField(),
				new Button(),
				new Date(Date.UTC(2015, 0, 7)),
				CalendarIntervalType.Week,
				new CalendarLegend({
					items: [oLegendItem]
				})
			);

		// act
		oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		var aRows = oPC.getRows();
		var oTimeline = _getRowTimeline(aRows[0]);

		// assert
		assert.equal(oTimeline.getRenderer().getLegendItems(oTimeline).length, 1,  "Legend items should be returned");

		// cleanup
		oPC.destroy();
	});

	QUnit.test("setCustomAppointmentsSorterCallback allows the app dev to custom sort the appointments via the setter", function
		(assert) {
		//arrange
		var oPC = createPlanningCalendar("PC4", new SearchField(), new Button()),
			fnCustom = function() {};

		//assert
		assert.notOk(oPC._fnCustomSortedAppointments, "there is not a custom sort");

		//act
		oPC.setCustomAppointmentsSorterCallback(fnCustom);

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), oPC._fnCustomSortedAppointments, "there is a custom sort");
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), fnCustom,
			"getCustomAppointmentsSorterCallback() returns the given custom function");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("customAppointmentsSorterCallback(function) in the constructor", function (assert) {
		//arrange & act
		var fnCustom = function() {},
			oPC = new PlanningCalendar({
				customAppointmentsSorterCallback: fnCustom
			});

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), oPC._fnCustomSortedAppointments, "when a fn is set to setCustomAppointmentsSorterCallback, the sort is custom");
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), fnCustom, "getCustomAppointmentsSorterCallback() returns the given custom function");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("customAppointmentsSorterCallback(number) in the constructor", function (assert) {
		//arrange & act
		var oPC = new PlanningCalendar({
			customAppointmentsSorterCallback: 1
		});

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), undefined,
			"when a number is set to setCustomAppointmentsSorterCallback, the sort is the default one");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("customAppointmentsSorterCallback(string) in the constructor", function (assert) {
		//arrange & act
		var oPC = new PlanningCalendar({
			customAppointmentsSorterCallback: "string is not allowed"
		});

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), undefined,
			"when a string is set to setCustomAppointmentsSorterCallback, the sort is the default one");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("setCustomAppointmentsSorterCallback(function)", function (assert) {
		//arrange & act
		var fnCustom = function() {},
			oPC = new PlanningCalendar({});

		oPC.setCustomAppointmentsSorterCallback(fnCustom);

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), oPC._fnCustomSortedAppointments, "when a fn is set to setCustomAppointmentsSorterCallback, the sort is custom");
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), fnCustom, "getCustomAppointmentsSorterCallback() returns the given custom function");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("setCustomAppointmentsSorterCallback(number)", function (assert) {
		//arrange & act
		var oPC = new PlanningCalendar();

		oPC.setCustomAppointmentsSorterCallback(1);

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), undefined,
			"when a number is set to setCustomAppointmentsSorterCallback, the sort is the default one");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("setCustomAppointmentsSorterCallback(string)", function (assert) {
		//arrange & act
		var oPC = new PlanningCalendar();

		oPC.setCustomAppointmentsSorterCallback("string is not allowed");

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), undefined,
			"when a string is set to setCustomAppointmentsSorterCallback, the sort is the default one");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("setCustomAppointmentsSorterCallback(null)", function (assert) {
		//arrange & act
		var fnCustom = function() {},
			oPC = new PlanningCalendar({
				customAppointmentsSorterCallback: fnCustom
			});

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), fnCustom,
			"getCustomAppointmentsSorterCallback() returns the given custom function");

		//act
		oPC.setCustomAppointmentsSorterCallback(null);

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), null, "the custom sort is removed");

	});

	QUnit.test("when sortAppointmentsCustomSemantic is set to undefined, the sort is the default one", function
		(assert) {
		//act
		var oPC = new PlanningCalendar({});
		oPC.setCustomAppointmentsSorterCallback(undefined);

		//assert
		assert.equal(oPC._fnCustomSortedAppointments === undefined, true, "there is not a custom sort");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("when a function is set to setCustomAppointmentsSorterCallback, it's called", function (assert) {
		//arrange
		var oPC = createPlanningCalendar("PC5"),
			oSortSpy = this.spy(),
			iAppointments = _getAppointmentsCount(oPC);

		//act
		oPC.setCustomAppointmentsSorterCallback(oSortSpy);
		oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		//assert
		assert.ok(oSortSpy.callCount > iAppointments, "the custom sort function is called, appointments: " +
			iAppointments + ", setCustomAppointmentsSorterCallback is called " + oSortSpy.callCount + " times");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("when setCustomAppointmentsSorterCallback after rendering, it's setting the new custom sorter", function (assert) {
		//arrange
		var fnCustom = function() {},
			fnCustom2 = function() {},
			oPC = new PlanningCalendar({
				customAppointmentsSorterCallback: fnCustom
			});
		oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		//act
		oPC.setCustomAppointmentsSorterCallback(fnCustom2);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), fnCustom2, "the second sorter function is set");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("when a new row is added to a PlanningCalendar with a custom sort function set, the row has also custom function set", function (assert) {
		//arrange
		var fnCustom = function() {},
			oPC = new PlanningCalendar({
				customAppointmentsSorterCallback: fnCustom
			}),
			oRow = new PlanningCalendarRow();
		oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		//act
		oPC.addRow(oRow);
		sap.ui.getCore().applyChanges();

		//assert
		assert.ok(_getRowTimeline(oRow)._fnCustomSortedAppointments, "the custom sorter function is set");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("when a new row is inserted to a PlanningCalendar with a custom sort function set, the row has also custom function set", function (assert) {
		//arrange
		var fnCustom = function() {},
			oPC = new PlanningCalendar({
				customAppointmentsSorterCallback: fnCustom
			}),
			oRow = new PlanningCalendarRow();
		oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		//act
		oPC.insertRow(oRow);
		sap.ui.getCore().applyChanges();

		//assert
		assert.ok(_getRowTimeline(oRow)._fnCustomSortedAppointments, "the custom sorter function is set");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("Sticky header", function (assert) {
		// arrange
		var oInfoToolbar,
			oToolbar,
			oPC = createPlanningCalendar(
				"invalidationExample",
				new SearchField(),
				new Button(),
				new Date(Date.UTC(2015, 0, 7)),
				CalendarIntervalType.Week
			);

		// act
		oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(oPC.getAggregation("table").getSticky().length, 0, "sticky property shouldn't be set on the info bar and on the toolbar inside Table");

		// act
		oPC.setStickyHeader(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(oPC.getAggregation("table").getSticky().length, 2, "sticky property should be set on the info bar and on the toolbar inside Table");

		// act
		oPC.setStickyHeader(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(oPC.getAggregation("table").getSticky().length, 0, "sticky property shouldn't be set on the info bar and on the toolbar inside Table");

		// cleanup
		oPC.destroy();
	});


	QUnit.test("singleSelection setter", function() {
		var oTable = sap.ui.getCore().byId("SelectionMode-Table");

		// Assert
		assert.strictEqual(this.oPC.getSingleSelection(), true, "Single selection set");
		assert.strictEqual(oTable.getMode(), ListMode.SingleSelectMaster, "Table selection mode is SingleSelectMaster");

		// Act
		this.oPC.setSingleSelection(false);

		// Assert
		assert.strictEqual(this.oPC.getSingleSelection(), false, "Single selection set");
		assert.strictEqual(oTable.getMode(), ListMode.MultiSelect, "Table selection mode is MultiSelect");

		// Act
		this.oPC.setSingleSelection(true);

		// Assert
		assert.strictEqual(this.oPC.getSingleSelection(), true, "Single selection set");
		assert.strictEqual(oTable.getMode(), ListMode.SingleSelectMaster, "Table selection mode is SingleSelectMaster");
	});

	QUnit.test("SelectAllCheckBox initial placement - desktop", function() {
		// Prepare
		this.oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		// Assert
		this.checkInitItemPlacement();
	});

	QUnit.test("SelectAllCheckBox initial placement - tablet/phone", function() {
		// Prepare
		this.oPC.placeAt("smallUiArea");
		sap.ui.getCore().applyChanges();

		// Assert
		this.checkInitItemPlacement();
	});

	QUnit.test("SelectAllCheckBox placement in multiple selection mode - desktop", function() {
		// Prepare
		this.oPC.setSingleSelection(false);
		this.oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		// Prepare
		this.oPC.setSingleSelection(false);
		sap.ui.getCore().applyChanges();

		// Assert
		// there should be 2 items in the infoToolbar content when selectAll checkBox exists.
		this.checkItemPlacementInMultiSel(2);
	});

	QUnit.test("SelectAllCheckBox placement in multiple selection mode - tablet/phone", function() {
		// Prepare
		this.oPC.setSingleSelection(false);
		this.oPC.placeAt("smallUiArea");
		sap.ui.getCore().applyChanges();

		// Assert
		// there should be 3 items in the infoToolbar content when selectAll checkBox exists.
		this.checkItemPlacementInMultiSel(3);
	});

	QUnit.test("SelectAllCheckBox placement after changing the view - desktop", function() {
		var oCalType = sap.ui.unified.CalendarIntervalType,
			// Check only for Day, Month and Hour view, because TimesRow, DatesRow and
			// MonthsRow represent all 5 existing intervals. That is because the two left intervals
			// (OneMonthsRow and WeeksRow) inherit DatesRow one.
			aCalTypes = [oCalType.Day, oCalType.Month, oCalType.Hour];

		// Prepare
		this.oPC.placeAt("bigUiArea");
		this.oPC.setSingleSelection(false);

		aCalTypes.forEach(function (oType) {
			// Act
			this.oPC.setViewKey(oType);
			sap.ui.getCore().applyChanges();

			// Assert
			// there should be 2 items in the _oInfoToolbar content
			this.checkItemPlacementInMultiSel(2);
		}.bind(this));
	});

	QUnit.test("SelectAllCheckBox placement after changing the view - tablet/phone", function() {
		var oCalType = sap.ui.unified.CalendarIntervalType,
			// Check only for Day, Month and Hour view, because TimesRow, DatesRow and
			// MonthsRow represent all 5 existing intervals. That is because the two left intervals
			// (OneMonthsRow and WeeksRow) inherit DatesRow one.
			aCalTypes = [oCalType.Day, oCalType.Month, oCalType.Hour];

		// Prepare
		this.oPC.placeAt("smallUiArea");
		this.oPC.setSingleSelection(false);

		aCalTypes.forEach(function (oType) {
			// Act
			this.oPC.setViewKey(oType);
			sap.ui.getCore().applyChanges();

			// Assert
			// there should be 3 items in the _oInfoToolbar content
			this.checkItemPlacementInMultiSel(3);
		}.bind(this));
	});

	QUnit.test("SelectAllCheckBox placement after hiding the row headers - desktop", function() {
		// Prepare
		this.oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		// Act
		// argument: true - desktop; false - tablet or phone
		this.oPC.setSingleSelection(false);
		this.oPC.setShowRowHeaders(false);

		// Assert
		this.checkItemPlacementAfterHidingRowHeaders(true);
	});

	QUnit.test("SelectAllCheckBox placement after hiding the row headers - tablet/phone", function() {
		// Prepare
		this.oPC.placeAt("smallUiArea");
		sap.ui.getCore().applyChanges();

		// Act
		this.oPC.setSingleSelection(false);
		this.oPC.setShowRowHeaders(false);

		// Assert
		// argument: true - desktop; false - tablet or phone
		this.checkItemPlacementAfterHidingRowHeaders(false);
	});

	QUnit.module("NonWorking Special Dates", {
		beforeEach: function() {
			this.oPC = createPlanningCalendar("PCNonWorking", new SearchField(), new Button());
			this.oSpecialDate = new DateTypeRange({
				startDate: new Date(2015, 0, 1, 15, 30),
				type: CalendarDayType.NonWorking
			});
			this.oSecondSpecialDate = new DateTypeRange({
				startDate: new Date(2015, 1, 2, 15, 30),
				type: CalendarDayType.NonWorking
			});
			this.oPC.placeAt("bigUiArea");
		},
		afterEach: function() {
			//Cleanup
			this.oPC.destroy();
		}
	});

	QUnit.test("Insert non working special date", function(assert) {
		//Prepare
		this.oPC.addSpecialDate(this.oSpecialDate);

		//Act
		this.oPC.insertSpecialDate(this.oSecondSpecialDate, 0);
		//Assert
		assert.equal(this.oPC.indexOfAggregation("specialDates", this.oSecondSpecialDate), 0, "Insert special dates at index 0 position it at the 0th index");

	});

	QUnit.test("Remove non working special date", function(assert) {
		//Prepare
		this.oPC.addSpecialDate(this.oSpecialDate);

		//Act
		this.oPC.removeSpecialDate(this.oSpecialDate);
		//Assert
		assert.equal(this.oPC.indexOfAggregation("specialDates", this.oSecondSpecialDate), -1, "Special date is removed");
	});

	QUnit.test("Remove all non working special date", function(assert) {
		this.oPC.addSpecialDate(this.oSpecialDate);
		//Act
		this.oPC.removeAllSpecialDates();
		//Assert
		assert.equal(this.oPC.indexOfAggregation("specialDates", this.oSecondSpecialDate), -1, "Special date is removed");
	});

	QUnit.module("Special Dates per PlanningCalendarRow", {
		beforeEach: function() {
			this.oPC = createPlanningCalendar("PCSpecialDatesInRows", new SearchField(), new Button());
			this.oDateNW = new DateTypeRange({
				startDate: new Date(2015, 0, 1),
				type: CalendarDayType.NonWorking
			});
			this.oSpecialDateRangeNW = new DateTypeRange({
				startDate: new Date(2015, 0, 14),
				endDate: new Date(2015, 0, 14),
				type: CalendarDayType.NonWorking
			});
			this.oSpecialDateRangeType04 = new DateTypeRange({
				startDate: new Date(2015, 0, 7),
				endDate: new Date(2015, 0, 9),
				type: CalendarDayType.Type04
			});
			this.oPC.placeAt("bigUiArea");
		},
		afterEach: function() {
			//Cleanup
			this.oPC.destroy();
		},

		_assertSpecialDatesEmpty: function() {
			// Checks that aggregation "specialDates" is empty for each PlanningCalendarRow
			this.oPC.getAggregation("rows").forEach(function (oRow) {
				assert.ok(!oRow.getAggregation("specialDates") ||
					oRow.getAggregation("specialDates").length === 0,
					"PlanningCalendarRow should have no items in its aggregation specialDates");
			});
		},

		_assertIsSpecialDateAvailable: function(oDate, oSecondDate, oThirdDate) {
			// assuming that in the first PCRow there are no items in the specialDates aggregation set
			// assuming that in the second PCRow there are 2 specialDates set to the aggregation - one with only startDate set of type NonWorking
			// and one with startDate and endDate of type 04.
			var oRowNoWork = this.oPC.getAggregation("rows")[1].getAggregation("specialDates");

			assert.equal(this.oPC.getAggregation("rows")[0].getAggregation("specialDates").length, 0, "first PlanningCalendarRow should have no items in its aggregation specialDates");
			assert.equal(oRowNoWork.length, 3, " second PlanningCalendarRow should have 3 items in its aggregation specialDates");
			assert.equal(oRowNoWork[0].getStartDate().toString(), oDate.getStartDate().toString(), "the right start of the special date is set");
			assert.equal(oRowNoWork[0].getEndDate(), null, "the special date should have no endDate");
			assert.equal(oRowNoWork[0].getType(), CalendarDayType.NonWorking, "the special date should be of type NonWorking");
			assert.equal(oRowNoWork[1].getStartDate().toString(), oSecondDate.getStartDate().toString(), "the right start of the special date range is set");
			assert.equal(oRowNoWork[1].getEndDate().toString(), oSecondDate.getEndDate().toString(), "the right end of the special date range is set");
			assert.equal(oRowNoWork[1].getType(), CalendarDayType.NonWorking, "the special date should be of type NonWorking");
			assert.equal(oRowNoWork[2].getStartDate().toString(), oThirdDate.getStartDate().toString(), "the right start of the special date range is set");
			assert.equal(oRowNoWork[2].getEndDate().toString(), oThirdDate.getEndDate().toString(), "the right end of the special date range is set");
			assert.equal(oRowNoWork[2].getType(), CalendarDayType.Type04, "the special date should be of type Type04");
		},

		_assertIsClassNoWorkAvailable: function () {
			var aIntervals = jQuery("#PCSpecialDatesInRows-Row2-CalRow-Apps").children(".sapUiCalendarRowAppsInt");

			assert.ok(jQuery(aIntervals[0]).hasClass("sapUiCalendarRowAppsNoWork"), "interval0 has class sapUiCalendarRowAppsNoWork because it is a special date");
			assert.ok(!jQuery(aIntervals[1]).hasClass("sapUiCalendarRowAppsNoWork"), "interval0 has no class sapUiCalendarRowAppsNoWork");
			assert.ok(!jQuery(aIntervals[2]).hasClass("sapUiCalendarRowAppsNoWork"), "interval02 has no class sapUiCalendarRowAppsNoWork");
			assert.ok(!jQuery(aIntervals[3]).hasClass("sapUiCalendarRowAppsNoWork"), "interval03 has no class sapUiCalendarRowAppsNoWork");
			assert.ok(!jQuery(aIntervals[4]).hasClass("sapUiCalendarRowAppsNoWork"), "interval04 has no class sapUiCalendarRowAppsNoWork");
			assert.ok(jQuery(aIntervals[5]).hasClass("sapUiCalendarRowAppsNoWork"), "interval05 has class sapUiCalendarRowAppsNoWork because it is a non-working day");
			assert.ok(jQuery(aIntervals[6]).hasClass("sapUiCalendarRowAppsNoWork"), "interval06 has class sapUiCalendarRowAppsNoWork because it is a non-working day");
			assert.ok(!jQuery(aIntervals[7]).hasClass("sapUiCalendarRowAppsNoWork"), "interval07 has no class sapUiCalendarRowAppsNoWork");
			assert.ok(!jQuery(aIntervals[8]).hasClass("sapUiCalendarRowAppsNoWork"), "interval08 has no class sapUiCalendarRowAppsNoWork, because it is a special date of other type than non-working");
			assert.ok(!jQuery(aIntervals[9]).hasClass("sapUiCalendarRowAppsNoWork"), "interval09 has no class sapUiCalendarRowAppsNoWork, because it is a special date of other type than non-working");
			assert.ok(!jQuery(aIntervals[10]).hasClass("sapUiCalendarRowAppsNoWork"), "interval10 has no class sapUiCalendarRowAppsNoWork");
			assert.ok(!jQuery(aIntervals[11]).hasClass("sapUiCalendarRowAppsNoWork"), "interval11 has no class sapUiCalendarRowAppsNoWork");
			assert.ok(jQuery(aIntervals[12]).hasClass("sapUiCalendarRowAppsNoWork"), "interval12 has class sapUiCalendarRowAppsNoWork because it is a non-working day");
			assert.ok(jQuery(aIntervals[13]).hasClass("sapUiCalendarRowAppsNoWork"), "interval13 has class sapUiCalendarRowAppsNoWork because it is a non-working day and a special date");
		},

		_assertIsClassNoWorkNotAvailable: function () {
			var aIntervals = jQuery("#PCSpecialDatesInRows-Row2-CalRow-Apps").children(".sapUiCalendarRowAppsInt");
			for (var i = 0; i < aIntervals.length; i++) {
				if (i === 5 || i === 6 || i === 12 || i === 13) {
					assert.ok(jQuery(aIntervals[i]).hasClass("sapUiCalendarRowAppsNoWork"), "interval" + i + " has class sapUiCalendarRowAppsNoWork because it is a non-working day");
				} else {
					assert.ok(!jQuery(aIntervals[i]).hasClass("sapUiCalendarRowAppsNoWork"), "interval" + i + " has no class sapUiCalendarRowAppsNoWork");
				}
			}
		}
	});

	QUnit.test("Add a special date to a row", function(assert) {
		//Act
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.setViewKey("Day");
		sap.ui.getCore().applyChanges();
		//Assert
		this._assertIsSpecialDateAvailable(this.oDateNW, this.oSpecialDateRangeNW, this.oSpecialDateRangeType04);
		this._assertIsClassNoWorkAvailable();
	});

	QUnit.test("Insert a special date in a row", function(assert) {
		//Prepare
		this.oPC.getAggregation("rows")[1].insertSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].insertSpecialDate(this.oSpecialDateRangeNW);
		//Act
		this.oPC.getAggregation("rows")[1].insertSpecialDate(this.oDateNW, 0);
		this.oPC.setViewKey("Day");
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oPC.getAggregation("rows")[1].indexOfAggregation("specialDates", this.oDateNW), 0, "Insert a special date at index 0");
		this._assertIsSpecialDateAvailable(this.oDateNW, this.oSpecialDateRangeNW, this.oSpecialDateRangeType04);
		this._assertIsClassNoWorkAvailable();
	});

	QUnit.test("Remove a special date from a row", function(assert) {
		//Prepare
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeNW);
		//Act
		this.oPC.getAggregation("rows")[1].removeSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].removeSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].removeSpecialDate(this.oSpecialDateRangeNW);
		this.oPC.setViewKey("Day");
		sap.ui.getCore().applyChanges();
		//Assert
		this._assertSpecialDatesEmpty();
		this._assertIsClassNoWorkNotAvailable();
	});

	QUnit.test("Remove all special dates in a row", function(assert) {
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeNW);
		//Act
		this.oPC.getAggregation("rows")[1].removeAllSpecialDates();
		this.oPC.setViewKey("Day");
		sap.ui.getCore().applyChanges();
		//Assert
		this._assertSpecialDatesEmpty();
		this._assertIsClassNoWorkNotAvailable();
	});

	QUnit.test("Destroy all special dates from a row", function(assert) {
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeNW);
		//Act
		this.oPC.getAggregation("rows")[1].destroySpecialDates();
		this.oPC.setViewKey("Day");
		sap.ui.getCore().applyChanges();
		//Assert
		this._assertSpecialDatesEmpty();
		this._assertIsClassNoWorkNotAvailable();
	});

	QUnit.module("events");

	QUnit.test("appointmentSelect", function(assert) {
		oSelectedAppointment = undefined;
		qutils.triggerEvent("tap", "PC1-R1A1");
		assert.equal(oSelectedAppointment.getId(), "PC1-R1A1", "appointmentSelect event fired and appointment returned");
		assert.ok(sap.ui.getCore().byId("PC1-R1A1").getSelected(), "Appointment is selected");
		assert.equal(sDomRefId, "PC1-R1A1", "sDomRefId returns the right ID of the appointment if clicked on the whole appointment");
		qutils.triggerEvent("tap", "PC1-R1A1-Title");
		assert.equal(sDomRefId, "PC1-R1A1", "sDomRefId returns the right ID of the appointment if clicked on the title of the appointment");
		qutils.triggerEvent("tap", "PC1-R1A1-Text");
		assert.equal(sDomRefId, "PC1-R1A1", "sDomRefId returns the right ID of the appointment if clicked on the text of the appointment");
		oPC1.setViewKey(CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("tap", "PC1-Row1-CalRow-Group0");
		assert.equal(sDomRefId, "PC1-Row1-CalRow-Group0", "sDomRefId returns the right ID of the group appointment");
		oPC1.setViewKey(CalendarIntervalType.Hours);
		sap.ui.getCore().applyChanges();
		oSelectedAppointment = undefined;
	});

	QUnit.test("rowSelectionChange", function(assert) {
		assert.equal(oPC1.getSelectedRows().length, 0, "No rows selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;
		qutils.triggerEvent("tap", "PC1-Row1-CLI_cell0");
		assert.ok(bRowSelectionChange, "rowSelectionChange fired");
		assert.equal(aChangedRows.length, 1, "one row changed");
		assert.equal(aChangedRows[0].getId(), "PC1-Row1", "Row1 changed");
		assert.ok(sap.ui.getCore().byId("PC1-Row1").getSelected(), "Row1 is selected");
		assert.equal(oPC1.getSelectedRows().length, 1, "one row selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;

		qutils.triggerEvent("tap", "PC1-Row2-CLI_cell0");
		assert.ok(bRowSelectionChange, "rowSelectionChange fired");
		assert.equal(aChangedRows.length, 2, "two row changed");
		assert.equal(aChangedRows[0].getId(), "PC1-Row1", "Row1 changed");
		assert.equal(aChangedRows[1].getId(), "PC1-Row2", "Row2 changed");
		assert.ok(!sap.ui.getCore().byId("PC1-Row1").getSelected(), "Row1 is not selected");
		assert.ok(sap.ui.getCore().byId("PC1-Row2").getSelected(), "Row2 is selected");
		assert.equal(oPC1.getSelectedRows().length, 1, "one row selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;
		oPC1.setSingleSelection(false);
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("tap", "PC1-All");
		assert.ok(bRowSelectionChange, "rowSelectionChange fired");
		assert.equal(aChangedRows.length, 1, "one row changed");
		assert.equal(aChangedRows[0].getId(), "PC1-Row1", "Row1 changed");
		assert.ok(sap.ui.getCore().byId("PC1-Row1").getSelected(), "Row1 is selected");
		assert.ok(sap.ui.getCore().byId("PC1-Row2").getSelected(), "Row2 is selected");
		assert.equal(oPC1.getSelectedRows().length, 2, "2 row selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;
		oPC1.setSingleSelection(true);
		sap.ui.getCore().applyChanges();
		assert.ok(!bRowSelectionChange, "rowSelectionChange not fired");
		assert.ok(!sap.ui.getCore().byId("PC1-Row1").getSelected(), "Row1 is not selected");
		assert.ok(!sap.ui.getCore().byId("PC1-Row2").getSelected(), "Row2 is not selected");
		assert.equal(oPC1.getSelectedRows().length, 0, "No row selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;

	});

	QUnit.test("startDateChange", function(assert) {
		bStartDateChange = false;
		// via navigation on TimesRow
		qutils.triggerEvent("tap", "PC1-Header-NavToolbar-PrevBtn");
		assert.ok(bStartDateChange, "startDateChange fired");
		var oStartDate = oPC1.getStartDate();
		var oExpectedDate = new Date("2014", "11", "31", "20", "00");

		if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]) {
			oExpectedDate = new Date("2015", "0", "1", "02", "00");
		} else if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]) {
			oExpectedDate = new Date("2015", "0", "1", "02", "00");
		}
		assert.equal(oExpectedDate.getTime(), oStartDate.getTime(), "Start date is OK");

		bStartDateChange = false;
		// via navigation on DatesRow
		oPC1.setViewKey(CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("tap", "PC1-Header-NavToolbar-PrevBtn");
		assert.ok(bStartDateChange, "startDateChange fired");
		oStartDate = oPC1.getStartDate();
		oExpectedDate = new Date("2014", "11", "17", "20", "00");
		if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]) {
			oExpectedDate = new Date("2014", "11", "25", "02", "00");
		} else if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]) {
			oExpectedDate = new Date("2014", "11", "25", "02", "00");
		}
		assert.equal(oExpectedDate.getTime(), oStartDate.getTime(), "Start date is OK");

		bStartDateChange = false;
		// via navigation on MonthsRow
		oPC1.setViewKey(CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("tap", "PC1-Header-NavToolbar-PrevBtn");
		assert.ok(bStartDateChange, "startDateChange fired");
		oStartDate = oPC1.getStartDate();
		oExpectedDate = new Date("2013", "11", "01", "20", "00");
		if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]) {
			oExpectedDate = new Date("2014", "08", "01", "02", "00");
		} else if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]) {
			oExpectedDate = new Date("2014", "05", "01", "02", "00");
		}
		assert.equal(oExpectedDate.getTime(), oStartDate.getTime(), "Start date is OK");

		bStartDateChange = false;

		//change view
		oPC1.setViewKey(CalendarIntervalType.Hour);
		sap.ui.getCore().applyChanges();
		jQuery("#PC1-Header-ViewSwitch").focus();

		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ARROW_DOWN"); //to Days
		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ARROW_DOWN"); //to Months
		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ARROW_DOWN"); //to Week
		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ENTER");
		sap.ui.getCore().applyChanges();
		assert.ok(bStartDateChange, "startDateChange fired when view is switched to Week");
		bStartDateChange = false;

		oPC1.setViewKey(CalendarIntervalType.Hour);
		sap.ui.getCore().applyChanges();

		bStartDateChange = false;
		// via today button
		qutils.triggerEvent("tap", "PC1-Header-NavToolbar-TodayBtn");
		assert.ok(bStartDateChange, "startDateChange fired");
		oStartDate = oPC1.getStartDate();
		oExpectedDate = new Date();
		assert.equal(oExpectedDate.getFullYear(), oStartDate.getFullYear(), "Start date is OK");
		assert.equal(oExpectedDate.getMonth(), oStartDate.getMonth(), "Start date is OK");
		assert.equal(oExpectedDate.getDate(), oStartDate.getDate(), "Start date is OK");
		// If more tests are about to be added here, please consider that last date is the current one.

		oPC1 = initPlanningCalendar("PC1", "SF1", "B1");
	});

	QUnit.test("viewChange", function(assert) {
		bViewChange = false;
		jQuery("#PC1-Header-ViewSwitch-select").focus();
		qutils.triggerKeyboardEvent("PC1-Header-ViewSwitch-select", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("PC1-Header-ViewSwitch-select", "ENTER");
		sap.ui.getCore().applyChanges();
		assert.ok(bViewChange, "viewChange fired");

		oPC1.setViewKey(CalendarIntervalType.Hour);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("intervalselect", function (assert) {

		// Start with hour view
		oPC1.setViewKey(CalendarIntervalType.Hour);

		bIntervalSelect = false;
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		oIntervalRow = undefined;
		jQuery("#PC1-TimesRow-201501011200").focus();
		qutils.triggerKeyboardEvent("PC1-TimesRow-201501011200", "ENTER");
		sap.ui.getCore().applyChanges();
		assert.ok(bIntervalSelect, "intervalSelect fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201501011200", "interval start date returned");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201501011259", "interval end date returned");
		assert.ok(!bSubInterval, "No sub-interval");
		assert.ok(!oIntervalRow, "No row");
		assert.ok(!jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemSel"), "interval not longer selected");

		bIntervalSelect = false;
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		oIntervalRow = undefined;
		qutils.triggerEvent("tap", "PC1-Row1-CalRow-AppsInt3");
		assert.ok(bIntervalSelect, "intervalSelect fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201501011100", "interval start date returned");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201501011159", "interval end date returned");
		assert.ok(!bSubInterval, "No sub-interval");
		assert.equal(oIntervalRow.getId(), "PC1-Row1", "row returned");
	});

	QUnit.test("rowHeaderClick", function (assert) {
		// Arrange
		var oSpy,
			oSecondRow = oPC1.getRows()[1], // Get second row
			handleRowHeaderClick = function (oEvent) {
				var oRow = oEvent.getParameter("row");
				var sRowHeaderId = oEvent.getParameter("headerId");

				// Assert
				assert.ok(oRow, "There must be a returned row");
				assert.ok(oRow instanceof PlanningCalendarRow, "Returned row must derive from sap.m.PlanningCalendarRow");
				assert.strictEqual(oRow, oSecondRow, "Returned row must be reference to the second row");
				assert.strictEqual(sRowHeaderId, oSecondRow.sId + "-Head", "Returned id must be equal to the second row header id");
			};

		oSpy = sinon.spy(handleRowHeaderClick);
		oPC1.attachEvent("rowHeaderClick", oSpy);

		// Act - click on the second row header
		qutils.triggerEvent("click", "PC1-Row2-Head-content");

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Event method must be called once");

		// Cleanup
		oPC1.detachEvent("rowHeaderClick", oSpy);
	});

	QUnit.module("Proxy calls", {
		beforeEach: function () {
			this.sut = createPlanningCalendar("invalidationExample", new SearchField(), new Button(), new Date(2015, 0, 7), CalendarIntervalType.Week);
			this.sutInterval = this.sut.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			this.sut.placeAt("bigUiArea");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
			this.sut = undefined;
		}
	});

	QUnit.test("Calling 'invalidate()' on PlanningCalendar invokes its interval child 'invalidate()'", function (assert) {
		//prepare
		var oPCInvalidateSpy = this.spy(this.sut, 'invalidate'),
			oIntervalInvalidateSpy = this.spy(this.sutInterval, 'invalidate');

		//act
		this.sut._bDateRangeChanged = true;
		this.sut.invalidate();
		//assert
		assert.strictEqual(oPCInvalidateSpy.callCount, 1, "'PlanningCalendar invalidate()' was called once");
		assert.strictEqual(oIntervalInvalidateSpy.callCount, 1, "'WeeksRow invalidate()' was called once");
		assert.ok(oPCInvalidateSpy.callCount == oIntervalInvalidateSpy.callCount == 1, "Both methods are called exact (1) time");
	});

	QUnit.test("Calling 'exit()' on PlanningCalendar invokes its interval child 'destroy()'", function (assert) {
		//prepare
		var oPCExitSpy = this.spy(this.sut, 'exit'),
			oIntervalDestroySpy = this.spy(this.sutInterval, 'destroy');

		//act
		this.sut.exit();
		//assert
		assert.strictEqual(oPCExitSpy.callCount, 1, "'PlanningCalendar exit()' was called once");
		assert.strictEqual(oIntervalDestroySpy.callCount, 1, "'WeeksRow destroy()' was called once");
		assert.ok(oPCExitSpy.callCount == oIntervalDestroySpy.callCount == 1, "Both methods are called exact (1) time");
	});

	QUnit.test("'_handleCalendarSelect()' invokes its internal child methods 'fireSelect()'", function (assert) {
		//prepare
		var oCalendarSelectSpy = this.spy(this.sutInterval, 'fireSelect'),
			oPlanningCalendarIntervalSelectSpy = this.spy(this.sut, 'fireIntervalSelect'),
			aIntervalDomChilds = this.sutInterval.$('days').children(),
			oFirstCalendarIntervalItem = aIntervalDomChilds[0],
			oStartDate = this.sut.getStartDate(),
			oEndDate = new Date(oStartDate.getTime());

		//act
		oEndDate.setDate(oStartDate.getDate() + 1);
		qutils.triggerKeydown(oFirstCalendarIntervalItem, "ENTER", false, false, false);
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(oCalendarSelectSpy.callCount, 1, "CalendarSelect fired once");
		assert.strictEqual(oPlanningCalendarIntervalSelectSpy.callCount, 1, "PlanningCalendar IntervalSelect fired once");
	});

	QUnit.module("Private API", {
		beforeEach: function () {
			this.sut = createPlanningCalendar("invalidationExample", new SearchField(), new Button(), new Date(Date.UTC(2015, 0, 7)), CalendarIntervalType.Week);
			this.sutInterval = this.sut.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			this.sut.placeAt("bigUiArea");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
			this.sut = undefined;
		}
	});

	QUnit.test("'_updateTodayButtonState()' has correct output", function (assert) {
		//prepare
		var _dateMatchesVisibleRangeSpy = this.spy(this.sut, '_dateMatchesVisibleRange');
		//act
		this.sut._updateTodayButtonState();
		//assert
		assert.strictEqual(_dateMatchesVisibleRangeSpy.callCount, 1, "'_dateMatchesVisibleRangeSpy()' was called once");
	});

	QUnit.test("today button enabled state is updated when the view is changed", function(assert) {
		//arrange
		this.sut.setViewKey(CalendarIntervalType.Day);
		this.sut.setStartDate(new Date());
		var oEnabledSpy = this.spy(this.sut._oTodayButton, 'setEnabled');
		sap.ui.getCore().applyChanges();

		//act
		this.sut.setViewKey(CalendarIntervalType.OneMonth);
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(oEnabledSpy.called, true, 'today button state is updated');
		assert.strictEqual(oEnabledSpy.lastCall.args[0], false, 'today button state is updated correctly');
	});

	QUnit.test("'_dateMatchesVisibleRange()' has correct output" , function (assert) {
		//prepare
		var sViewKey = this.sut.getViewKey(),
			oView = this.sut._getView(sViewKey),
			iIntervals = this.sut._getIntervals(oView),
			oStartDate = this.sut.getStartDate(),
			oDate = new Date(oStartDate.getTime());

		//act
		oDate.setUTCDate(oStartDate.getUTCDate() - iIntervals);
		for (var iIndex = 1; iIndex < iIntervals * 3; iIndex++) {
			if (iIndex > iIntervals && iIndex <= iIntervals * 2) {
				assert.ok(this.sut._dateMatchesVisibleRange(oDate, sViewKey), "Date '" + oDate + "' is visible on the current viewport");
			} else {
				assert.notOk(this.sut._dateMatchesVisibleRange(oDate, sViewKey), "Date '" + oDate + "' is NOT visible on the current viewport");
			}
			oDate.setUTCDate(oDate.getUTCDate() + 1);
		}
	});

	QUnit.test("'_getViews()' has correct output", function (assert) {
		//prepare
		var sViewKey = this.sut.getViewKey(),
			oWeekView = this.sut._getView(sViewKey);
		//The act of this test is done in the module beforeEach
		//assert
		assert.strictEqual(Object.keys(this.sut._oViews).length, 5, "Correct number (5) of views assigned to PlanningCalendar");
		assert.strictEqual(oWeekView.getIntervalsS(), 7, "Correct number (7) intervals for S screen sizes");
		assert.strictEqual(oWeekView.getIntervalsM(), 7, "Correct number (7) intervals for M screen sizes");
		assert.strictEqual(oWeekView.getIntervalsL(), 7, "Correct number (7) intervals for L screen sizes");
	});

	QUnit.test("'_onRowDeselectAppointment' behaves correctly when deselecting not existing appointments", function (assert) {
		//prepare
		var oSetPropertySpy;
		_getRowTimeline(this.sut.getRows()[0]).aSelectedAppointments.push("dummy appointment");
		oSetPropertySpy = this.spy(ManagedObject.prototype, "setProperty");

		//act
		this.sut._onRowDeselectAppointment();

		//assert
		assert.strictEqual(oSetPropertySpy.callCount, 0, "If the appointment does not exist, setProperty is not called");

		//cleanup
		oSetPropertySpy.restore();

	});

	QUnit.test("_getHeader returns the planning calendar header", function(assert) {
		var oHeaderToolbar = this.sut.getAggregation("header"),
			oResult;

		// act
		oResult = this.sut._getHeader();

		//assert
		assert.equal(oResult.getId(), oHeaderToolbar.getId(), "_getHeader should return the header of the planning calendar " +
			"set to the hidden aggregation 'header'");

	});

	QUnit.test("_adjustColumnHeadersTopOffset called from onThemeChanged", function(assert) {
		// arrange
		var iAdjustCallCount,
			oPC = createPlanningCalendar(
				"adjustSticky",
				new SearchField(),
				new Button(),
				new Date(Date.UTC(2015, 0, 7)),
				CalendarIntervalType.Hours
			),
			fnAdjustColumnHeader = sinon.spy(oPC, "_adjustColumnHeadersTopOffset");

		// assert
		assert.strictEqual(fnAdjustColumnHeader.callCount, 0, "_adjustColumnHeadersTopOffset() is not called if the control is not rendered");

		// act
		oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();
		iAdjustCallCount = fnAdjustColumnHeader.callCount;
		oPC.onThemeChanged();

		// assert
		assert.strictEqual(fnAdjustColumnHeader.callCount, (iAdjustCallCount + 1), "_adjustColumnHeadersTopOffset() called from onThemeChanged()");

		// cleanup
		oPC.destroy();
	});

	QUnit.module("Interaction", {
		beforeEach: function() {
			var oSearchField = new SearchField(),
				oButton = new Button();
			this.o1Sep2016MidOfWeek = new Date(2016, 8, 1, 1);
			this.o10Sep2016Morning = new Date(2016, 8, 10, 9);
			this.o10Sep2016 = new Date(2016, 8, 10);
			this.oPC2 = createPlanningCalendar("startDateAtTheMiddleOfTheWeek", oSearchField, oButton, this.o1Sep2016MidOfWeek,
				CalendarIntervalType.Week);
			this.oPC2.placeAt("bigUiArea");
			sap.ui.getCore().applyChanges();
			this.oPC2Interval = this.oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
		},
		afterEach: function() {
			if (!bSkipDestroy) {
				this.oPC2.destroy();
			}
		}
	});

	QUnit.test("keyboard navigation", function(assert) {
		// test here only interaction between rows, other things are tested on CalendarRow
		var fnDone = assert.async();

		jQuery("#PC1-R1A1").focus();
		assert.equal(document.activeElement.id, "PC1-R1A1", "Appointment1 focused");
		qutils.triggerKeydown("PC1-R1A1", "END");
		assert.equal(document.activeElement.id, "PC1-R2A1", "Appointment1 focused");

		qutils.triggerKeydown("PC1-R2A1", "HOME");
		sap.ui.getCore().applyChanges();

		setTimeout(function(){
			assert.equal(document.activeElement.id, "PC1-R1A2", "Appointment2 focused");
			qutils.triggerKeydown("PC1-R1A1", "ARROW_DOWN");
			assert.equal(document.activeElement.id, "PC1-R2A1", "Appointment1 focused");
			qutils.triggerKeydown("PC1-R1A1", "ARROW_UP");
			sap.ui.getCore().applyChanges();
			assert.equal(document.activeElement.id, "PC1-R1A2", "Appointment2 focused");
			fnDone();
		}, 0);

	});


	QUnit.test("keyboard navigation HOME & END for 1 Month view", function(assert) {
		_switchToView(CalendarIntervalType.OneMonth, this.oPC2);
		this.oPC2.setStartDate(this.o1Sep2016MidOfWeek);
		this.oPC2.rerender();
		var sMonthIdPrefix = this.oPC2.getId() + "-OneMonthsRow-";

		jQuery("#" +  sMonthIdPrefix + "20160901").focus();
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160901", "1st of September focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160901", "END");
		sap.ui.getCore().applyChanges();
		assert.equal(document.activeElement.id,  sMonthIdPrefix + "20160930", "30 of September focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160930", "HOME");
		sap.ui.getCore().applyChanges();
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160901", "1st of September focused");

		jQuery("#" +  sMonthIdPrefix + "20160910").focus();
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160910", "10th of September focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160910", "END");
		sap.ui.getCore().applyChanges();
		assert.equal(document.activeElement.id,  sMonthIdPrefix + "20160930", "30 of September focused");
	});

	QUnit.test("keyboard navigation ARROW_RIGHT for 1 Month view at the border of 2 months", function (assert) {
		// Prepare
		var oApp1stOct2016 = new CalendarAppointment("app1stOct2016", {
			startDate: new Date(2016, 9, 1, 17),
			endDate: new Date(2016, 9, 1, 18)
		}), $30Sep, $1stOct, aDays;


		this.oPC2.getRows()[0].addAppointment(oApp1stOct2016);
		_switchToView(CalendarIntervalType.OneMonth, this.oPC2);
		this.oPC2.setStartDate(this.o1Sep2016MidOfWeek);
		sap.ui.getCore().applyChanges();

		// Get days
		this.oPC2Interval = this.oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];

		aDays = this.oPC2Interval.$("days").children();
		$30Sep = aDays[29];
		$1stOct = aDays[30];

		// Act
		// Focus 30th of Sep, 2016 and move right via keyboard, expect appointment for 1 of Oct to be visible once
		// the view is switched to October
		qutils.triggerEvent("mousedown", $30Sep); //focus should be done via mouse events, since this is the way Month.js handles focusing
		qutils.triggerEvent("mouseup", $30Sep);
		_navFocusNext.call(this, $1stOct);

		// Assert
		aDays = this.oPC2Interval.$("days").children();
		$1stOct = aDays[0];

		assert.ok(oApp1stOct2016.getDomRef(), "Once moved to October, the 1st appoint. should be visible");
		assert.equal($1stOct.getAttribute("data-sap-day"), "20161001", "Once moved to October, the first day of the month is moved to the beginning of the OneMonthsRow");

	});

	QUnit.test("When start date is defined the planning calendar should shift to the first day of the week that includes the start date ", function(assert) {
		//assert initial state
		_assertDatesAreVisible.call(this, [
				new Date(2016, 7, 29),
				new Date(2016, 7, 30),
				new Date(2016, 7, 31),
				new Date(2016, 8, 1),
				new Date(2016, 8, 2),
				new Date(2016, 8, 3),
				new Date(2016, 8, 4)],
			this.oPC2, "Initially set start date");
		//act
		this.oPC2.setStartDate(this.o10Sep2016);
		sap.ui.getCore().applyChanges();

		//assert
		_assertDatesAreVisible.call(this, [
				new Date(2016, 8, 5),
				new Date(2016, 8, 6),
				new Date(2016, 8, 7),
				new Date(2016, 8, 8),
				new Date(2016, 8, 9),
				new Date(2016, 8, 10),
				new Date(2016, 8, 11)],
			this.oPC2, "StartDate modified afterwards");
	});

	QUnit.test("Navigation backward via back button", function(assert) {
		//act
		_navBackward.call(this, this.oPC2);//one week before week 29th of August 2016 - 4th of September, 2016

		//assert
		_assertDatesAreVisible.call(this, [
				new Date(2016, 7, 22),
				new Date(2016, 7, 23),
				new Date(2016, 7, 24),
				new Date(2016, 7, 25),
				new Date(2016, 7, 26),
				new Date(2016, 7, 27),
				new Date(2016, 7, 28)],
			this.oPC2, "Initially navigating back once");

		//act
		_navBackward.call(this, this.oPC2);//two weeks before

		//assert
		_assertDatesAreVisible.call(this, [
				new Date(2016, 7, 15),
				new Date(2016, 7, 16),
				new Date(2016, 7, 17),
				new Date(2016, 7, 18),
				new Date(2016, 7, 19),
				new Date(2016, 7, 20),
				new Date(2016, 7, 21)],
			this.oPC2, "Navigating back twice");
	});

	QUnit.test("Navigaton buttons disabled when on min/max dates", function(assert){
		//Prepare
		var oStartDate = this.oPC2.getStartDate();

		//Arrange
		this.oPC2.setMinDate(new Date(1999, 1, 1, 0, 0, 0));
		this.oPC2.setStartDate(new Date(1999, 1, 1, 0, 0, 0));
		this.oPC2._dateNav.setCurrent(new Date(1999, 1, 1, 0, 0, 0));

		//Act
		this.oPC2._applyArrowsLogic(true);

		//Assert
		assert.equal(this.oPC2._getHeader()._oPrevBtn.getEnabled(), false, "Back Arrow Is Disabled");

		//Arrange
		this.oPC2.setMaxDate(new Date(2222,22,22,22,22,22));
		this.oPC2.setStartDate(new Date(2222,22,22,22,22,22));
		this.oPC2._dateNav.setCurrent(new Date(2222,22,22,22,22,22));

		//Act
		this.oPC2._applyArrowsLogic(false);

		//Assert
		assert.equal(this.oPC2._getHeader()._oNextBtn.getEnabled(), false, "Forward Arrow Is Disabled");

		//Clean
		this.oPC2.setStartDate(oStartDate);
		this.oPC2._dateNav.setCurrent(oStartDate);
	});

	QUnit.test("previous button when minDate >= current view start date initially", function(assert) {
		// arange
		var oPC = new PlanningCalendar({
			viewKey: "One Month",
			startDate: new Date(2019, 11, 6),
			minDate: new Date(2019, 11, 1)
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(
			oPC._getHeader()._oPrevBtn.getEnabled(),
			false,
			"previous button is disabled");

		// clean
		oPC.destroy();
	});

	QUnit.test("today press disables previous button if necessary", function(assert) {
		// arrange
		var oFakeNow = new Date(2019, 11, 22),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			oPC = new PlanningCalendar({
				viewKey: "One Month",
				startDate: new Date(2020, 0, 6),
				minDate: new Date(2019, 11, 1)
			}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oPC._getHeader()._oTodayBtn.firePress();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(
			oPC._getHeader()._oPrevBtn.getEnabled(),
			false,
			"previous button is disabled");

		// clean
		clock.restore();
		oPC.destroy();
	});

	QUnit.test("previous button when navigated to a view where minDate = start date without the hours", function(assert) {
		// arrange
		var oPC = new PlanningCalendar({
				viewKey: "One Month",
				startDate: new Date(2020, 0, 6, 8, 0, 0),
				minDate: new Date(2019, 11, 1, 0, 0, 0)
			}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oPC._getHeader()._oPrevBtn.firePress();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(
			oPC._getHeader()._oPrevBtn.getEnabled(),
			false,
			"previous button is disabled");

		// clean
		oPC.destroy();
	});

	QUnit.test("Navigation backward via keyboard left arrow (outside the current visible area)", function(assert) {
		var $Days = this.oPC2Interval.$("days"),
			aDays = $Days.children(),
			oNextTarget = aDays[0],
			oSelf = this,
			fnDone = assert.async();
		//Focus 29th of Aug (week 29 Aug - 4 Sep), 2016 and move left via keyboard 4 times, expect 22 -28 Aug 2016
		//act
		aDays.eq(0).focus();
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			oNextTarget = _navFocusPrev.call(oSelf, oNextTarget);
			_assertFocus.call(oSelf, oNextTarget);
			setTimeout(function () {
				oNextTarget = _navFocusPrev.call(oSelf, oNextTarget);
				_assertFocus.call(oSelf, oNextTarget);
				setTimeout(function () {
					oNextTarget = _navFocusPrev.call(oSelf, oNextTarget);
					_assertFocus.call(oSelf, oNextTarget);
					setTimeout(function () {
						oNextTarget = _navFocusPrev.call(oSelf, oNextTarget);
						_assertFocus.call(oSelf, oNextTarget);
						setTimeout(function () {
							_assertDatesAreVisible.call(oSelf, [
								new Date(2016, 7, 22),
								new Date(2016, 7, 23),
								new Date(2016, 7, 24),
								new Date(2016, 7, 25),
								new Date(2016, 7, 26),
								new Date(2016, 7, 27),
								new Date(2016, 7, 28)
							], oSelf.oPC2, "Navigated to the correct viewport");
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);
	});

	QUnit.test("Navigation backward via keyboard left arrow (outside the current visible area) at the border of the DST (Nov->Oct)", function(assert) {
		//prepare
		var oOriginalFormatLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
			sOriginalFormatLocale = oOriginalFormatLocale.getLanguage() + "_" +  oOriginalFormatLocale.getRegion(),
			$Days,
			aDays,
			oNextTarget,
			oSelf = this,
			fnDone = assert.async();

		sap.ui.getCore().getConfiguration().setFormatLocale("en-GB");
		this.oPC2.setStartDate(new Date("2014", "10", "5", "08", "00"));
		this.oPC2.rerender();

		$Days = this.oPC2Interval.$("days");
		aDays = $Days.children();
		oNextTarget = aDays[0];

		//Act - focus 2nd of Nov (week 02 Nov - 8 Nov), 2014 and move left via keyboard once, expect 26 Oct - 1 Nov 2014
		aDays.eq(0).focus();
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			oNextTarget = _navFocusPrev.call(oSelf, oNextTarget);
			_assertFocus.call(oSelf, oNextTarget);
			_assertDatesAreVisible.call(oSelf, [
				new Date(2014, 9, 27),
				new Date(2014, 9, 28),
				new Date(2014, 9, 29),
				new Date(2014, 9, 30),
				new Date(2014, 9, 31),
				new Date(2014, 10, 1),
				new Date(2014, 10, 2)
			], oSelf.oPC2, "Navigated to the correct viewport");
			sap.ui.getCore().getConfiguration().setFormatLocale(sOriginalFormatLocale);
			fnDone();
		}, 0);
	});

	QUnit.test("Navigation forward via forward button", function(assert) {
		//act
		_navForward.call(this, this.oPC2);//one week after week 29th of August 2016 - 4th of September, 2016

		//assert
		_assertDatesAreVisible.call(this, [
				new Date(2016, 8, 5),
				new Date(2016, 8, 6),
				new Date(2016, 8, 7),
				new Date(2016, 8, 8),
				new Date(2016, 8, 9),
				new Date(2016, 8, 10),
				new Date(2016, 8, 11)],
			this.oPC2, "Navigating forward once");

		//act
		_navForward.call(this, this.oPC2);//two weeks after

		//assert
		_assertDatesAreVisible.call(this, [
				new Date(2016, 8, 12),
				new Date(2016, 8, 13),
				new Date(2016, 8, 14),
				new Date(2016, 8, 15),
				new Date(2016, 8, 16),
				new Date(2016, 8, 17),
				new Date(2016, 8, 18)],
			this.oPC2, "Navigating forward twice");
	});

	QUnit.test("Navigation forward via keyboard right (outside the current visible area)", function(assert) {
		var $Days = this.oPC2Interval.$("days"),
			aDays = $Days.children(),
			oNextTarget = aDays[aDays.length - 1],
			oSelf = this,
			fnDone = assert.async();
		//Focus 4th of Sep, 2016 (week 29 Aug-4 Sep) and move right via keyboard 4 times, expect 5 -11 Sep 2016
		//act
		aDays.eq(aDays.length - 1).focus();
		sap.ui.getCore().applyChanges();

		setTimeout(function() {
			oNextTarget = _navFocusNext.call(oSelf, oNextTarget);
			_assertFocus.call(oSelf, oNextTarget);
			setTimeout(function () {
				oNextTarget = _navFocusNext.call(oSelf, oNextTarget);
				_assertFocus.call(oSelf, oNextTarget);
				setTimeout(function () {
					oNextTarget = _navFocusNext.call(oSelf, oNextTarget);
					_assertFocus.call(oSelf, oNextTarget);
					setTimeout(function () {
						oNextTarget = _navFocusNext.call(oSelf, oNextTarget);
						_assertFocus.call(oSelf, oNextTarget);
						setTimeout(function () {
							_assertDatesAreVisible.call(oSelf, [
								new Date(2016, 8, 5),
								new Date(2016, 8, 6),
								new Date(2016, 8, 7),
								new Date(2016, 8, 8),
								new Date(2016, 8, 9),
								new Date(2016, 8, 10),
								new Date(2016, 8, 11)
							], oSelf.oPC2, "Navigated to the correct viewport");
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);
	});

	QUnit.test("Navigation forward via keyboard right (outside the current visible area) when in days view", function(assert) {
		//Arrange
		this.oPC2.setViewKey(CalendarIntervalType.Day);

		var oStartDate = this.oPC2.getStartDate(),
			oLastDay,
			oComparisonDate = new Date(oStartDate.getTime());

		//Act
		oComparisonDate.setDate(oComparisonDate.getDate() + 1);
		sap.ui.getCore().applyChanges();
		oLastDay = new Date(2016, 8, 12);
		this.oPC2.shiftToDate(oLastDay, false);

		//Assert
		assert.deepEqual(this.oPC2.getStartDate(), oComparisonDate, "Navigation via keyboard when in days view works");
	});

	QUnit.test("Navigation forward via keyboard right (outside the current visible area) and reaching the limit", function(assert) {
		//Arrange
		this.oPC2.setViewKey(CalendarIntervalType.Day);
		var oStartDate = this.oPC2.getStartDate(),
			oComparisonDate = new Date(oStartDate.getTime()),
			oGoToDate = new Date(oStartDate.getTime()),
			oMaxDate = new Date(2016, 8, 14),
			oGoToDate2 = new Date(2016, 8, 15),
			oComparisonDate2 = new Date(2016, 8, 1);

		this.oPC2.setMinDate(new Date(oStartDate.getTime()));

		//Act
		oGoToDate.setDate(oGoToDate.getDate() - 1);
		this.oPC2.shiftToDate(oGoToDate, false);

		//Assert
		assert.deepEqual(this.oPC2.getStartDate(), oComparisonDate, "Navigation via keyboard stops on min date");

		//Arrange
		this.oPC2.setStartDate(oComparisonDate2);
		this.oPC2.setMaxDate(oMaxDate);

		//Act
		this.oPC2.shiftToDate(oGoToDate2, false);

		//Assert
		assert.deepEqual(this.oPC2.getStartDate(), oComparisonDate2, "Navigation via keyboard stops on max date");
	});

	QUnit.test("Navigation forward in week view where next week starts at 1st January (locale en_US)", function(assert) {
		var $Days,
			aDays,
			oNextTarget,
			oSelf = this,
			fnDone = assert.async(),
			oOriginalFormatLocale = sap.ui.getCore().getConfiguration().getFormatLocale();

		//arrange
		sap.ui.getCore().getConfiguration().setFormatLocale('en_US');
		this.oPC2.setStartDate(new Date(2016, 11, 31));
		this.oPC2.setViewKey(CalendarIntervalType.Week);

		$Days = this.oPC2Interval.$("days");
		aDays = $Days.children();
		oNextTarget = aDays[aDays.length - 1];

		//act
		aDays.eq(aDays.length - 1).focus();
		sap.ui.getCore().applyChanges();

		_navFocusNext.call(this, oNextTarget);
		setTimeout(function() {
			//assert
			_assertDatesAreVisible.call(oSelf, [
				new Date(2017, 0, 1),
				new Date(2017, 0, 2),
				new Date(2017, 0, 3),
				new Date(2017, 0, 4),
				new Date(2017, 0, 5),
				new Date(2017, 0, 6),
				new Date(2017, 0, 7)
			], oSelf.oPC2, "Navigated to 1st of January");

			//clear
			sap.ui.getCore().getConfiguration().setFormatLocale(oOriginalFormatLocale);
			fnDone();
		}, 0);
	});

	QUnit.test("Navigation backward and forward", function(assert) {
		var i;
		//act
		for (i = 0; i < 10; i++) {
			_navForward.call(this, this.oPC2);
		}
		for (i = 0; i < 9; i++) {
			_navBackward.call(this, this.oPC2);
		}
		//Expected is one week after the initial - Sep 5th, 2016 - Sep 11th, 2016

		//assert
		_assertDatesAreVisible.call(this, [
				new Date(2016, 8, 5),
				new Date(2016, 8, 6),
				new Date(2016, 8, 7),
				new Date(2016, 8, 8),
				new Date(2016, 8, 9),
				new Date(2016, 8, 10),
				new Date(2016, 8, 11)],
			this.oPC2, "Navigating forward once");
	});

	QUnit.test("Selecting the visible dates from the previous/next month in the calendar picker - in Hours view", function (assert) {
		// Prepare
		var oApp2ndSept2016 = new CalendarAppointment("app2ndSept2016", {
				startDate: new Date(2016, 8, 2, 6),
				endDate: new Date(2016, 8, 2, 10)
			}),
			fnDone = assert.async(),
			oPC2 = this.oPC2,
			aDays, $FirstInterval;

		this.oPC2.getRows()[0].addAppointment(oApp2ndSept2016);

		// Act
		_switchToView(CalendarIntervalType.Hour, this.oPC2);
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-Header-NavToolbar-PickerBtn");

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160902");
		$Day.focus();

		setTimeout(function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160902");
			qutils.triggerKeyboardEvent($Day.get(0), jQuery.sap.KeyCodes.ENTER, false, false, false);
			assert.ok($Day.hasClass("sapUiCalItemSel"), "Day marked as selected");

			this.oPC2Interval = oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			aDays = this.oPC2Interval.$("times").children();
			$FirstInterval = aDays[0];

			setTimeout(function(){
				// Assert
				assert.ok(oApp2ndSept2016.getDomRef(), "Once moved to date of previous/next month, the appointment there should be visible");
				assert.equal($FirstInterval.getAttribute("data-sap-time"), "201609020100", "Once clicked on a date from the visible range of the previous/next month, the PlanningCalendar is displaying the right view.");
				fnDone();
			}, 0);
		}, 0);
	});


	QUnit.test("Selecting the visible dates from the previous/next month in the calendar picker - in Days view", function (assert) {
		// Prepare
		var oApp30Aug2016 = new CalendarAppointment("app30Aug2016", {
				startDate: new Date(2016, 7, 30, 6),
				endDate: new Date(2016, 7, 30, 10)
			}),
			fnDone = assert.async(),
			oPC2 = this.oPC2,
			aDays, $FirstInterval;

		this.oPC2.getRows()[0].addAppointment(oApp30Aug2016);

		// Act
		_switchToView(CalendarIntervalType.Day, this.oPC2);
		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-Header-NavToolbar-PickerBtn");

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160830");

		$Day.focus();

		setTimeout(function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160830");
			qutils.triggerKeyboardEvent($Day.get(0), jQuery.sap.KeyCodes.ENTER, false, false, false);

			this.oPC2Interval = oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			aDays = this.oPC2Interval.$("days").children();
			$FirstInterval = aDays[0];

			setTimeout(function(){
				// Assert
				assert.ok(oApp30Aug2016.getDomRef(), "Once moved to date of previous/next month, the appointment there should be visible");
				assert.equal($FirstInterval.getAttribute("data-sap-day"), "20160830", "Once clicked on a date from the visible range of the previous/next month, the PlanningCalendar is displaying the right view.");
				fnDone();
			}, 0);
		}, 0);
	});


	QUnit.test("Selecting the visible dates from the previous/next month in the calendar picker - in Weeks view", function (assert) {
		// Prepare
		var oApp30Aug2016 = new CalendarAppointment("app30Aug2016", {
				startDate: new Date(2016, 7, 30, 6),
				endDate: new Date(2016, 7, 30, 10)
			}),
			fnDone = assert.async(),
			oPC2 = this.oPC2,
			aDays, $FirstInterval;

		this.oPC2.getRows()[0].addAppointment(oApp30Aug2016);

		// Act
		_switchToView(CalendarIntervalType.Week, this.oPC2);
		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-WeeksRow--Head-next");
		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-WeeksRow--Head-B1");

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-WeeksRow--Cal--Month0-20160830");

		$Day.focus();

		setTimeout(function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-WeeksRow--Cal--Month0-20160830");
			qutils.triggerKeyboardEvent($Day.get(0), jQuery.sap.KeyCodes.ENTER, false, false, false);

			this.oPC2Interval = oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			aDays = this.oPC2Interval.$("days").children();
			$FirstInterval = aDays[0];

			setTimeout(function(){
				// Assert
				assert.ok(oApp30Aug2016.getDomRef(), "Once moved to date of previous month/next, the appointment there should be visible");
				assert.equal($FirstInterval.getAttribute("data-sap-day"), "20160829", "Once clicked on a date from the visible range of the previous/next month, the PlanningCalendar is displaying the right view.");
				fnDone();
			}, 0);
		}, 0);
	});


	QUnit.test("'Today' button should be disabled when current day is visible", function(assert) {
		//assert
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), true, "Today button should be enabled as current day IS NOT visible");

		//act
		this.oPC2.setStartDate(new Date());
		//assert
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), false, "Today button should not be enabled  as current day IS visible");
	});

	QUnit.test("Clicking 'Today' button navigates to the week of the current day", function (assert) {
		//prepare
		var oFakeNow = this.o10Sep2016,
			clock = sinon.useFakeTimers(oFakeNow.getTime());
		this.oPC2.rerender(); //start date is 1st of September 2016

		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), true, "Today button should be enabled as current day IS NOT visible");
		//act
		_clickTodayButton.call(this, this.oPC2);
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), false, "Today button should not be enabled as current day IS visible");

		_assertDatesAreVisible.call(this, [
				new Date(2016, 8, 5),
				new Date(2016, 8, 6),
				new Date(2016, 8, 7),
				new Date(2016, 8, 8),
				new Date(2016, 8, 9),
				new Date(2016, 8, 10),
				new Date(2016, 8, 11)],
			this.oPC2, "StartDate modified afterwards");
		//assert
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), false, "Today button should not be enabled as current day IS visible");
		//cleanup
		clock.restore();

	});

	QUnit.test("Clicking 'Today' button in week view then changing back to hours shows the hours unchanged", function (assert) {
		//act
		var oFakeNow = new Date(2016, 8, 1, 3),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			aExpectedVisibleHours = [],
			iInterval;
		this.oPC2.setStartDate(this.o10Sep2016Morning);
		clock.tick(10); //start date is 10st of September 2016 09:00

		//act
		_clickTodayButton.call(this, this.oPC2);
		clock.tick(10);

		_switchToView.call(this, CalendarIntervalType.Hour, this.oPC2);
		clock.tick(10);

		//assert
		iInterval = jQuery("#" + this.oPC2.getId()).outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1] ? 6 : 12;

		//assert
		if (iInterval === 12) { //Hours View large
			aExpectedVisibleHours = [
				new Date(2016, 7, 29, 9),
				new Date(2016, 7, 29, 10),
				new Date(2016, 7, 29, 11),
				new Date(2016, 7, 29, 12),
				new Date(2016, 7, 29, 13),
				new Date(2016, 7, 29, 14),
				new Date(2016, 7, 29, 15),
				new Date(2016, 7, 29, 16),
				new Date(2016, 7, 29, 17),
				new Date(2016, 7, 29, 18),
				new Date(2016, 7, 29, 19),
				new Date(2016, 7, 29, 20)];
		} else {
			aExpectedVisibleHours = [
				new Date(2016, 7, 29, 9),
				new Date(2016, 7, 29, 10),
				new Date(2016, 7, 29, 11),
				new Date(2016, 7, 29, 12),
				new Date(2016, 7, 29, 13),
				new Date(2016, 7, 29, 14)];
		}

		_assertHoursAreVisible.call(this, aExpectedVisibleHours, this.oPC2,
			"10 Sept 2016, 09:00: Weeks->Today(01 Sep, 00:00)->Hours");

		//cleanup
		clock.restore();
	});

	QUnit.test("'Today' button visibility works only with week view", function (assert) {
		//prepare
		var oFakeNow = this.o10Sep2016,
			clock = sinon.useFakeTimers(oFakeNow.getTime());
		this.oPC2.rerender(); //start date is 1st of September 2016

		//act
		_clickTodayButton.call(this, this.oPC2);
		clock.tick(10);
		_switchToView.call(this, CalendarIntervalType.Hour, this.oPC2);
		clock.tick(10);

		//assert
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), true, "Today button should be enabled for non 'week' views although 'today' is in visible area");

		//act
		_switchToView.call(this, CalendarIntervalType.Week, this.oPC2);
		clock.tick(10);

		//assert
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), false, "Today button should not be enabled for non 'week' views when switched back from hours view");

		//cleanup
		clock.restore();
	});

	QUnit.test("If view changed from Week->Hours, we see hours for first day of the previously shown week", function (assert) {
		var iInterval;
		//startDate 1st of september 2016(Thursday)->show hours for the 1st day of week 29 Aug 2016 (Monday)
		//prepare
		_switchToView.call(this, CalendarIntervalType.Hour, this.oPC2);
		sap.ui.getCore().applyChanges();

		iInterval = jQuery("#" + this.oPC2.getId()).outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1] ? 6 : 12;

		//assert
		if (iInterval === 12) { //Hours View large
			_assertHoursAreVisible.call(this, [
					new Date(2016, 7, 29, 1),
					new Date(2016, 7, 29, 2),
					new Date(2016, 7, 29, 3),
					new Date(2016, 7, 29, 4),
					new Date(2016, 7, 29, 5),
					new Date(2016, 7, 29, 6),
					new Date(2016, 7, 29, 7),
					new Date(2016, 7, 29, 8),
					new Date(2016, 7, 29, 9),
					new Date(2016, 7, 29, 10),
					new Date(2016, 7, 29, 11),
					new Date(2016, 7, 29, 12)],
				this.oPC2, "1 Sept 2016, 01:00: Weeks->Hours");
		} else { //6, Hours View small - 6
			_assertHoursAreVisible.call(this, [
					new Date(2016, 7, 29, 1),
					new Date(2016, 7, 29, 2),
					new Date(2016, 7, 29, 3),
					new Date(2016, 7, 29, 4),
					new Date(2016, 7, 29, 5),
					new Date(2016, 7, 29, 6)],
				this.oPC2, "1 Sept 2016, 01:00: Weeks->Hours");
		}

	});


	QUnit.test("Week view - click on different dates keeps the focus and week", function(assert) {
		//Prepare
		var aWeekDays = this.oPC2Interval.$("days").children();

		//Act
		aWeekDays.eq(1).focus();
		sap.ui.getCore().applyChanges();
		aWeekDays.eq(2).focus();
		sap.ui.getCore().applyChanges();
		aWeekDays.eq(3).focus();
		sap.ui.getCore().applyChanges();

		//assert initial state
		_assertDatesAreVisible.call(this, [
				new Date(2016, 7, 29),
				new Date(2016, 7, 30),
				new Date(2016, 7, 31),
				new Date(2016, 8, 1),
				new Date(2016, 8, 2),
				new Date(2016, 8, 3),
				new Date(2016, 8, 4)],
			this.oPC2, "Initial week should not be changed");
	});

	QUnit.test("setStartDate should preserve the hours when navigation occurs in all views except hours view", function (assert) {
		// Prepare
		var oEvent = {
			oSource: {
				getStartDate: function () {
					return new Date(2015, 1, 12);
				}
			}
		};

		// Act
		_switchToView(CalendarIntervalType.Day, this.oPC2);
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 1, "The Hours are not changed to 00, but instead the original hours are preserved in Day view");

		// Act
		_switchToView(CalendarIntervalType.Week, this.oPC2);
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 1, "The Hours are not changed to 00, but instead the original hours are preserved in Week view");

		// Act
		_switchToView(CalendarIntervalType.Month, this.oPC2);
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 1, "The Hours are not changed to 00, but instead the original hours are preserved in Month view");

		// Act
		_switchToView(CalendarIntervalType.OneMonth, this.oPC2);
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 1, "The Hours are not changed to 00, but instead the original hours are preserved in OneMonth view");
	});

	QUnit.test("setStartDate should not preserve the hours when navigation occurs in custom views of type hour", function (assert) {
		// Prepare
		var oEvent = {
			oSource: {
				getStartDate: function () {
					return new Date(2015, 1, 12);
				}
			}
		};
		this.oPC2.addView(
			new PlanningCalendarView({
				key: "hour",
				intervalType: CalendarIntervalType.Hour,
				description: "hour",
				intervalsS: 7,
				intervalsM: 7,
				intervalsL: 7
			})
		);
		this.oPC2.setViewKey("hour");
		sap.ui.getCore().applyChanges();

		// Act
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 0, "The Hours are changed to 00");
	});


	QUnit.test("setStartDate should preserve the hours when navigation occurs in custom views of type hour", function (assert) {
		// Prepare
		var oEvent = {
			oSource: {
				getStartDate: function () {
					return new Date(2015, 1, 12);
				}
			}
		};
		this.oPC2.addView(
			new PlanningCalendarView({
				key: "day",
				intervalType: CalendarIntervalType.Day,
				description: "day",
				intervalsS: 7,
				intervalsM: 7,
				intervalsL: 7
			})
		);
		this.oPC2.setViewKey("day");
		sap.ui.getCore().applyChanges();

		// Act
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 1, "The Hours are not changed to 00, but instead the original hours are preserved in Day view");
	});

	QUnit.test('Clicking today is updating calendars start date and Navigations current date', function(assert) {
		var oToday = new Date();
		this.oPC2.setViewKey(CalendarIntervalType.Hour);
		sap.ui.getCore().applyChanges();

		//act
		_navBackward.call(this, this.oPC2);
		_clickTodayButton.call(this, this.oPC2);

		//assert
		assert.equal(this.oPC2._dateNav._current.getFullYear(), oToday.getFullYear(), 'year is correct');
		assert.equal(this.oPC2._dateNav._current.getMonth(), oToday.getMonth(), 'month is correct');
		assert.equal(this.oPC2._dateNav._current.getDate(), oToday.getDate(), 'date is correct');

		this.oPC2.setViewKey(CalendarIntervalType.Week);
	});

	QUnit.test("Date Picker close button works on mobile", function(assert) {
		var oHeader = this.oPC2._getHeader(),
			oCalendarPicker = Element.registry.get(oHeader.getAssociation("currentPicker")),
			oSpyCancel = sinon.spy(oHeader, "_closeCalendarPickerPopup");

		oHeader._openCalendarPickerPopup(oCalendarPicker);

		oHeader._handlePickerCancelEvent();

		assert.equal(oSpyCancel.callCount,1, "Close event was thrown once");
	});

	QUnit.module("OneMonth view", {
		beforeEach: function() {
			var oSearchField = new SearchField(),
				oButton = new Button();
			this.o14Sep2016MidOfMonth = new Date(2016, 8, 14);
			this.o10Feb2016 = new Date(2016, 1, 10);
			this.oPC = createPlanningCalendar("oneMonthPlanningCalendar", oSearchField, oButton, this.o14Sep2016MidOfMonth,
				CalendarIntervalType.OneMonth);
			this.oPC.placeAt("bigUiArea");
			sap.ui.getCore().applyChanges();
			this.oPCInterval = this.oPC.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
		},

		afterEach: function() {
			if (!bSkipDestroy) {
				this.oPC.destroy();
			}
		},

		_assertIntervalHasClass: function (iInterval, oPC, sCSSClass) {
			var iIntervalIndex = iInterval - 1;
			var oFirstCalendarRow = this._getFirstRow(oPC);
			var sIntervalId = oFirstCalendarRow.getId() + "-AppsInt" + iIntervalIndex.toString();

			assert.ok(jQuery("#" + sIntervalId).hasClass(sCSSClass), "Interval " + iInterval + " should have class " + sCSSClass + " applied");
		},

		_getFirstRow: function(oPC) {
			return oPC.getAggregation("table").getItems()[0].getCells()[1];
		},

		_get1stInNextMonth: function(oDate) {
			if (oDate.getMonth() == 11) {
				var oNext = new Date(oDate.getFullYear() + 1, 0, 1);
			} else {
				var oNext = new Date(oDate.getFullYear(), oDate.getMonth() + 1, 1);
			}

			return oNext;
		},

		_getNextDay: function(oDate) {
			var oNext = new Date(oDate.getTime());
			oNext.setDate(oNext.getDate() + 1);

			return oNext;
		},

		_getIntervalDom: function(oRow, iInterval) {
			var iIntervalIndex = iInterval - 1;
			var sIntervalId = oRow.getId() + "-AppsInt" + iIntervalIndex.toString();

			return document.getElementById(sIntervalId);
		},

		_clickInterval: function(oRow, iInterval) {
			jQuery(this._getIntervalDom(oRow, iInterval)).trigger('tap');
		},

		_clickAppointment: function(oAppointment) {
			oAppointment.$().trigger('tap');
		}
	});

	QUnit.test('OneMonth item is in the select', function(assert) {
		//act and assert
		_switchToView.call(this, CalendarIntervalType.OneMonth, this.oPC);
	});

	QUnit.test('interval shows 31 days', function(assert) {
		//assert
		assert.equal(this.oPCInterval.getStartDate().getMonth(), 8, 'it is september');
		assert.equal(this.oPCInterval.getDays(), 31, 'interval has 31 days in september');

		//act - change to february
		_switchToDate(this.oPC, this.oPCInterval, 1, 1, this.oPCInterval.getStartDate().getFullYear());

		//assert
		assert.equal(this.oPCInterval.getStartDate().getMonth(), 1, 'it is february');
		assert.equal(this.oPCInterval.getDays(), 31, 'interval has 31 days in february');
	});

	QUnit.test('start day is the first day of the month', function(assert) {
		//assert
		assert.equal(this.oPCInterval.getStartDate().getMonth(), 8, 'it is september');
		assert.equal(this.oPCInterval.getStartDate().getDate(), 1, 'interval starts at 1st of september');

		//act - change to 5th of june
		_switchToDate(this.oPC, this.oPCInterval, 5, 5, this.oPCInterval.getStartDate().getFullYear());

		//assert
		assert.equal(this.oPCInterval.getStartDate().getMonth(), 5, 'it is june');
		assert.equal(this.oPCInterval.getStartDate().getDate(), 1, 'interval starts at 1st of june');
	});

	QUnit.test('last days belong to the next month', function(assert) {
		//assert
		var o1Oct2016 = this._get1stInNextMonth(this.o14Sep2016MidOfMonth);
		var o1Mar2016 = this._get1stInNextMonth(this.o10Feb2016);
		var o2Mar2016 = this._getNextDay(o1Mar2016);

		_assertDateIsVisible.call(this, o1Oct2016, this.oPC, '');

		//act - change to 5th of february
		_switchToDate(this.oPC, this.oPCInterval, 5, 1, this.oPCInterval.getStartDate().getFullYear());

		//assert
		_assertDateIsVisible.call(this, o1Mar2016, this.oPC, '');
		_assertDateIsVisible.call(this, o2Mar2016, this.oPC, '');
	});

	QUnit.test('last days look different', function(assert) {
		//assert
		this._assertIntervalHasClass(31, this.oPC, 'sapUiCalItemOtherMonth'); //check that Oct 1 is disabled
	});

	QUnit.test('last days display appointments', function(assert) {
		var oAppointment1July2014 = sap.ui.getCore().byId(this.oPC.getId() + "-R1A4");

		//act
		_switchToDate(this.oPC, this.oPCInterval, this.oPCInterval.getStartDate().getDate(), 5, 2014);
		sap.ui.getCore().applyChanges();

		//assert
		assert.ok(oAppointment1July2014.getDomRef(), "appointment is rendered");
	});

	QUnit.test('intervalSelect fires correctly', function(assert) {
		var oRow = this._getFirstRow(this.oPC);
		var eventParams = {};
		bIntervalSelect = false;

		oRow.attachIntervalSelect(function(oEvent) {
			eventParams = oEvent.getParameters();
		});

		//act
		this._clickInterval(oRow, 31); //click first row of next month's first day - 1 Oct 2016

		//assert
		assert.equal(eventParams.startDate.getMonth(), 9, 'start date is in october');
		assert.equal(eventParams.startDate.getDate(), 1, 'start date is 1st day of the month');

		assert.equal(eventParams.endDate.getMonth(), 9, 'end date is in october');
		assert.equal(eventParams.endDate.getDate(), 1, 'end date is 1st day of the month');

		assert.equal(eventParams.subInterval, false, 'selected interval is not a sub-interval');
		assert.ok(!bIntervalSelect,
			"intervalSelect was not fired because the click was on the next month's first days and this serves as navigation, not selection");
	});

	QUnit.test('select fires correctly', function(assert) {
		var oRow = this._getFirstRow(this.oPC);
		var eventParams = {};
		oRow.attachSelect(function(oEvent) {
			eventParams = oEvent.getParameters();
		});
		var oAppointment1July2014 = sap.ui.getCore().byId(this.oPC.getId() + "-R1A4");

		//act
		_switchToDate(this.oPC, this.oPCInterval, this.oPCInterval.getStartDate().getDate(), 5, 2014);
		sap.ui.getCore().applyChanges();

		//act
		this._clickAppointment(oAppointment1July2014);

		//assert
		assert.equal(eventParams.appointment, oAppointment1July2014, 'appointment is the same that was clicked');
		assert.equal(eventParams.multiSelect, false, 'multiSelect is correct');
	});

	QUnit.test('last days intervals navigate to the next month', function(assert) {
		//act
		this._clickInterval(this._getFirstRow(this.oPC), 31); //click first row of next month's first day - 1 Oct 2016

		//assert
		assert.equal(this.oPC.getStartDate().getMonth(), 9, 'month changed to october');
	});

	QUnit.test('navigate backward with the arrows', function(assert) {
		//act
		_navBackward.call(this, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getMonth(), 7, 'month changed to august');
		assert.equal(this.oPC.getStartDate().getDate(), 1, 'start date is 1st');
	});

	QUnit.test('navigate forward with the arrows', function(assert) {
		//act
		_navForward.call(this, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getMonth(), 9, 'month changed to october');
		assert.equal(this.oPC.getStartDate().getDate(), 1, 'start date is 1st');
	});

	QUnit.test('today button is disabled when today is visible', function(assert) {
		var oToday = new Date();
		var oTodayBtn = _getTodayButton.call(this, this.oPC);

		//assert
		assert.equal(oTodayBtn.getEnabled(), true, 'today button is enabled');

		//act
		//_switchDate....
		_switchToDate(this.oPC, this.oPCInterval, this.oPCInterval.getStartDate().getDate(), oToday.getMonth(), oToday.getFullYear());

		//assert
		assert.equal(oTodayBtn.getEnabled(), false, 'today button is disabled when today is visible');
	});

	QUnit.test('clicking today navigates to todays month', function(assert) {
		var oToday = new Date();

		//act
		_clickTodayButton.call(this, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getFullYear(), oToday.getFullYear(), 'year is correct');
		assert.equal(this.oPC.getStartDate().getMonth(), oToday.getMonth(), 'month is correct');
		assert.equal(this.oPC.getStartDate().getDate(), 1, 'date is correct');
	});

	QUnit.test('switch to hours view shows the first hours of the month', function(assert) {
		//act
		_switchToView.call(this, CalendarIntervalType.Hour, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getFullYear(), 2016, 'year is the same');
		assert.equal(this.oPC.getStartDate().getMonth(), 8, 'month is the same');
		assert.equal(this.oPC.getStartDate().getDate(), 1, 'date is 1st');
		assert.equal(this.oPC.getStartDate().getHours(), 0, 'starts from midnight');
	});

	QUnit.test('switch to days view starts from 1st', function(assert) {
		//act
		_switchToView.call(this, CalendarIntervalType.Day, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getFullYear(), 2016, 'year is the same');
		assert.equal(this.oPC.getStartDate().getMonth(), 8, 'month is the same');
		assert.equal(this.oPC.getStartDate().getDate(), 1, 'date is 1st');
	});

	QUnit.test('switch to month view starts from the same month', function(assert) {
		//act
		_switchToView.call(this, CalendarIntervalType.Month, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getFullYear(), 2016, 'year is the same');
		assert.equal(this.oPC.getStartDate().getMonth(), 8, 'month is the same');
	});

	QUnit.test("Has sticky header on big size", function (assert) {

		//act
		_switchToView.call(this, CalendarIntervalType.Month, this.oPC);
		this.oPC.setStickyHeader(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(this.oPC.getAggregation("table").getSticky().length, 2, "sticky property should be set on the info bar and on the toolbar inside Table");
	});

	QUnit.test("Has sticky header on phone size", function (assert) {
		//Prepare
		this.oPC.setStickyHeader(true);
		_switchToView.call(this, CalendarIntervalType.Month, this.oPC);

		this.stub(Device, "system", {desktop: false, phone: true, tablet: false});
		this.stub(Device, "orientation", {portrait: true, landscape: false});

		//act
		this.oPC._updateStickyHeader();

		// assert
		assert.ok(this.oPC.getAggregation("table").getSticky().indexOf("InfoToolbar") > -1, "sticky property should be set on the info bar only");
		assert.ok(this.oPC.getAggregation("table").getSticky().indexOf("HeaderToolbar") === -1, "sticky property shouldn't be set on the toolbar");
	});

	QUnit.module("OneMonth view (size S)", {
		beforeEach: function () {
			this._simulateMobileEnvironment();
			this.o14Sep2016MidOfMonth = new Date(2016, 8, 14);
		},
		afterEach: function () {
			this._restoreDesktopEnvironment();
			this._destroyCalendar();
			this.o14Sep2016MidOfMonth = undefined;
		},
		_simulateMobileEnvironment: function () {
			this.oDeviceJsStub = sinon.sandbox.stub(Device, "system", {phone: true});
			jQuery("html").addClass("sapUiMedia-Std-Phone sapUiMedia-StdExt-Phone");
			jQuery("html").removeClass("sapUiMedia-Std-Desktop sapUiMedia-StdExt-Desktop");
		},
		_restoreDesktopEnvironment: function () {
			this.oDeviceJsStub.restore();
			jQuery("html").addClass("sapUiMedia-Std-Desktop sapUiMedia-StdExt-Desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Phone sapUiMedia-StdExt-Phone");
		},
		_createCalendar: function (oStartDate) {
			this._oPC = createPlanningCalendar("_oPC", new SearchField(), new Button(), (oStartDate || this.o14Sep2016MidOfMonth), CalendarIntervalType.OneMonth);
			this._oPC.placeAt("smallUiArea");
			this._oPCOneMonthsRow = this._oPC.getAggregation('table').getAggregation('infoToolbar').getContent()[1];
			sap.ui.getCore().applyChanges();
		},
		_destroyCalendar: function () {
			if (this._oPC) {
				this._oPC.destroy();
				this._oPC = undefined;
			}
		}
	});

	QUnit.test("'setViewKeys()' setter calls 'OneMonthsRow._setDisplayMode()' with correct 'iSize' parameter", function (assert) {
		//arrange
		var oSetDisplayModeSpy = this.spy(OneMonthDatesRow.prototype, "setMode"),
			iPhoneSize = 0;

		this._createCalendar();
		//assert
		assert.strictEqual(oSetDisplayModeSpy.callCount, 2, "'setMode()' is called correct number of times"); //viewKey setter + resizeHandler
		assert.strictEqual(oSetDisplayModeSpy.getCall(0).args[0], iPhoneSize, "The correct mode value is set");
	});

	QUnit.test("planning calendar start date is auto switched to 1st day of the month", function (assert) {
		//arrange
		this._createCalendar(this.o14Sep2016MidOfMonth);

		//assert
		assert.strictEqual(this._oPC.getStartDate().getTime(), new Date(2016, 8, 1).getTime(), "The correct date is auto adjusted for the first day of month");
	});

	QUnit.test("'setStartDate()' setter calls '_setRowsStartDate()' with correct date parameter", function (assert) {
		//arrange
		this._createCalendar(new Date(2015, 3, 5));
		var oSetRowsStartDateSpy = this.spy(this._oPC, "_setRowsStartDate");

		//act
		this._oPC.setStartDate(new Date(2015, 2, 4));

		//assert
		assert.strictEqual(oSetRowsStartDateSpy.callCount, 1, "'_setRowsStartDate()' is called only once");
		assert.strictEqual(oSetRowsStartDateSpy.getCall(0).args[0].getTime(), new Date(2015, 3, 1).getTime(), "'_setRowsStartDate()' is called with correct parameter");
	});

	QUnit.test("_setRowsStartDate", function(assert) {
		var oTestDate = new Date(5, 5, 5);
		this._createCalendar();
		this._oPC._setRowsStartDate(oTestDate);
		assert.equal(_getRowTimeline(this._oPC.getRows()[0]).getStartDate().getTime(), oTestDate.getTime(), 'row 1 start date');
		assert.equal(_getRowTimeline(this._oPC.getRows()[1]).getStartDate().getTime(), oTestDate.getTime(), 'row 2 start date');
	});

	QUnit.test("'_handleTodayPress()' event handler adjust the startDate to the 1st day of month", function (assert) {
		//arrange
		var oHandleTodayPressSpy = this.spy(PlanningCalendar.prototype, "_handleTodayPress"),
			oSetStartDateSpy;

		this._createCalendar();
		//set date outside the current month
		this._oPC.setStartDate(new Date(2000, 0, 1));
		oSetStartDateSpy = this.spy(this._oPC, "setStartDate");
		qutils.triggerEvent('tap', this._oPC._oTodayButton.getDomRef());
		//assert
		assert.strictEqual(oHandleTodayPressSpy.callCount, 1, "'_handleTodayPress()' handler is called once");
		assert.strictEqual(oSetStartDateSpy.callCount, 1, "'setStartDate()' setter is called once");
		//clear
		oHandleTodayPressSpy.restore();
		oSetStartDateSpy.restore();
	});

	QUnit.test("'_handleCalendarSelect()' event handler adjust the startDate to the 1st day of month", function (assert) {
		//arrange
		var oHandleCalendarSelectSpy = this.spy(PlanningCalendar.prototype, "_handleCalendarSelect"),
			oPCInterval,
			oPCIntervalMonth;

		this._createCalendar();
		oPCInterval = this._oPC.getAggregation('table').getAggregation('infoToolbar').getContent()[1];
		var $EventTarget = oPCInterval.$('days').children().eq(0),
			oEvent = { clientX: 100, clientY: 100, target: $EventTarget.children().get(0) },
			oMouseDownEvent = jQuery.Event("mousedown", oEvent),
			oMouseUpEvent = jQuery.Event("mouseup", oEvent);

		//Calendar selection is implemented on 'mouseup' event so to test this you have to simulate 'mousedown' + 'mouseup' event sequence
		$EventTarget.trigger(oMouseDownEvent);
		$EventTarget.trigger(oMouseUpEvent);
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(oHandleCalendarSelectSpy.callCount, 1, "'_handleStartDateChange()' event handler is called once");
		//clean
		oHandleCalendarSelectSpy.restore();
	});

	QUnit.test("'OneMonthDatesRow.init()' calls its super class 'init()' and then 'OneMonthDatesRow()' gets called and sets the internal private property 'iMode' to the value '1'", function (assert) {
		//arrange
		var oOneMonthDatesRowInitSpy = this.spy(OneMonthDatesRow.prototype, "init"),
			oDatesRowSpy = this.spy(DatesRow.prototype, "init"),
			oOneMonthDatesRowSetModeSpy = this.spy(OneMonthDatesRow.prototype, "setMode");

		this._createCalendar();
		//assert
		assert.strictEqual(oOneMonthDatesRowInitSpy.callCount, 1, "'OneMonthDatesRow.init()' method was called once");
		assert.strictEqual(oDatesRowSpy.callCount, 1, "'OneMonthDatesRow.init()' method was called once");
		assert.ok(oOneMonthDatesRowInitSpy.calledBefore(oDatesRowSpy), "The call sequence is as expected");
		assert.ok(oOneMonthDatesRowSetModeSpy.calledWithExactly(1), "'OneMonthDatesRow.setMode(1)' method was called");
		assert.strictEqual(this._oPCOneMonthsRow.iMode, 1, "'OneMonthDatesRow.setMode()' correctly set the internal 'iMode' property value");
		//clean
		oOneMonthDatesRowInitSpy.restore();
		oDatesRowSpy.restore();
		oOneMonthDatesRowSetModeSpy.restore();
	});

	QUnit.test("'OneMonthDatesRow.setMode()' updates the iMode property", function (assert) {
		//arrange
		var oOneMonthDatesRowInitSpy = this.spy(OneMonthDatesRow.prototype, "init"),
			oOneMonthDatesRowSetModeSpy = this.spy(OneMonthDatesRow.prototype, "setMode");
		this._createCalendar();

		//assert
		assert.ok(oOneMonthDatesRowSetModeSpy.calledAfter(oOneMonthDatesRowInitSpy), "'OneMonthDatesRow.setMode()' method was called after 'OneMonthDatesRow.init()'");
		assert.ok(oOneMonthDatesRowSetModeSpy.calledWithExactly(1), "'OneMonthDatesRow.setMode(1)' method was called");
		assert.strictEqual(this._oPCOneMonthsRow.iMode, 1, "'OneMonthDatesRow.setMode()' correctly sets the internal 'iMode' property value");
		//arrange
		this._oPCOneMonthsRow.setMode(0);
		//assert
		assert.strictEqual(this._oPCOneMonthsRow.iMode, 0, "'OneMonthDatesRow.setMode()' sets the internal 'iMode' property as expected");
		//arrange
		this._oPCOneMonthsRow.setMode(2);
		//assert
		assert.strictEqual(this._oPCOneMonthsRow.iMode, 2, "'OneMonthDatesRow.setMode()' sets the internal 'iMode' property as expected");

		//clean
		oOneMonthDatesRowInitSpy.restore();
		oOneMonthDatesRowSetModeSpy.restore();
	});

	QUnit.test("'CalendarRow.Renderer' calls its 'renderSingleDayInterval()'", function (assert) {
		//arrange
		/* CalendarRowInPCRenderer renderer is not exposed to the public, so obtain it via its parent */
		var oRow = new PlanningCalendarRow(),
			oPC = new PlanningCalendar({ rows: [oRow] }),
			oTimelineRenderer = _getRowTimeline(oRow).getRenderer(),
			oTimelineRendererSpy = this.spy(oTimelineRenderer, "renderSingleDayInterval");

		this._createCalendar();
		//assert
		assert.strictEqual(oTimelineRendererSpy.callCount, 4, "'renderSingleDayInterval()' is called as expected"); //Two rows
		//clean
		oTimelineRendererSpy.restore();
	});

	QUnit.test("Adding a row adds a row timeline with the correct startDate", function(assert) {
		//arrange
		var oRow = new PlanningCalendarRow(),
			oRowTimeline;

		this._createCalendar();

		this._oPC._oOneMonthsRow.removeAllSelectedDates();
		this._oPC._oOneMonthsRow.addSelectedDate(new sap.ui.unified.DateRange({ startDate: new Date(2019, 1, 18) }));

		//act
		this._oPC.addRow(oRow);

		oRowTimeline = _getRowTimeline(oRow);

		//assert
		assert.strictEqual(oRowTimeline.getStartDate().getFullYear(), 2019, "row's start date is correct");
		assert.strictEqual(oRowTimeline.getStartDate().getDate(), 18, "row's start date is correct");
		assert.strictEqual(oRowTimeline.getStartDate().getMonth(), 1, "row's start date is correct");
	});

	QUnit.test("Appointment select is fired", function (assert) {
		//arrange
		this._createCalendar(new Date(2015, 0, 1));
		this._oPC.placeAt("smallUiArea");
		sap.ui.getCore().applyChanges();

		oSelectedAppointment = undefined;
		qutils.triggerEvent("tap", "_oPC-R1A1");

		//act & assert
		assert.equal(oSelectedAppointment.getId(), "_oPC-R1A1", "appointmentSelect event fired and appointment returned");
		assert.ok(sap.ui.getCore().byId("_oPC-R1A1").getSelected(), "Appointment is selected");
		qutils.triggerEvent("tap", "_oPC-R1A2");
		assert.ok(!(sap.ui.getCore().byId("_oPC-R1A1").getSelected()),
			"Appointment 1 is deselected because another one is selected");
		assert.ok(sap.ui.getCore().byId("_oPC-R1A2").getSelected(), "Appointment 2 is selected");
		assert.equal(this._oPC.getSelectedAppointments().length, 1, "One appointment is selected");
		qutils.triggerEvent("tap", "_oPC-R1A2");
		assert.ok(!(sap.ui.getCore().byId("_oPC-R1A1").getSelected()),
			"Appointment 2 is deselected after a second click on it");
		assert.equal(this._oPC.getSelectedAppointments().length, 0, "No appointment is selected");

		//CTRL key included
		qutils.triggerEvent("tap", "_oPC-R1A2");
		sap.ui.test.qunit.triggerEvent("tap", sap.ui.getCore().byId("_oPC-R1A1").getDomRef(), {target :
				sap.ui.getCore().byId("_oPC-R1A1").getDomRef(), ctrlKey: true});
		assert.equal(this._oPC.getSelectedAppointments().length, 2, "Two appointments are selected");
		sap.ui.test.qunit.triggerEvent("tap", sap.ui.getCore().byId("_oPC-R1A1").getDomRef(), {target :
				sap.ui.getCore().byId("_oPC-R1A1").getDomRef(), ctrlKey: true});
		assert.equal(this._oPC.getSelectedAppointments().length, 1,
			"When deselecting an appointment while pressing CTRL key, only this particular appointment is deselected");
		sap.ui.test.qunit.triggerEvent("tap", sap.ui.getCore().byId("_oPC-R1A1").getDomRef(), {target :
				sap.ui.getCore().byId("_oPC-R1A1").getDomRef(), ctrlKey: true});
		qutils.triggerEvent("tap", "_oPC-R1A2");
		assert.equal(this._oPC.getSelectedAppointments().length, 0,
			"When deselecting an appointment without pressing CTRL key all selections are gone");

		// clean
		oSelectedAppointment = undefined;
	});

	QUnit.test("No sticky header on phone size", function (assert) {
		//arrange
		this._createCalendar();

		//act
		this._oPC.setStickyHeader(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(this._oPC.getAggregation("table").getSticky().length, 0, "sticky property shouldn't be set on the info bar and on the toolbar inside Table");
	});

	QUnit.test("Appointments for currently selected date should be rendered in One Month view on small screen", function (assert) {
		// arrange
		this._createCalendar(new Date(2015, 0, 1));

		// assert
		assert.equal(this._oPC.$().find(".sapUiCalendarNoApps").length, 0, "'No Entries' div should not be rendered");
		assert.equal(this._oPC.$().find(".sapUiCalendarApp:not(.sapUiCalendarAppDummy)").length, 3, "Appointments should be rendered");
	});

	QUnit.test("'No entries' text should be shown when no date is selected in One Month view on small screen and no appointments should be rendered", function (assert) {
		// arrange
		this._createCalendar(new Date(2015, 0, 1));

		var oGetSelectedDatesStub = this.stub(this._oPC._oOneMonthsRow, "getSelectedDates", function () {
			return [];
		});

		// act
		this._oPC.rerender();

		// assert
		assert.ok(this._oPC.$().find(".sapUiCalendarNoApps").get(0), "'No Entries' div should be rendered");
		assert.equal(this._oPC.$().find(".sapUiCalendarApp:not(.sapUiCalendarAppDummy)").length, 0, "Appointments should not be rendered");

		// cleanup
		oGetSelectedDatesStub.restore();
	});

	QUnit.module("ARIA", {
		beforeEach: function() {

			this.sOldLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			sap.ui.getCore().getConfiguration().setLanguage("en-US");//due to text strings for built-in CalendarDayType texts

			this.oLegend = new PlanningCalendarLegend({
				items: [
					new CalendarLegendItem({
						type: CalendarDayType.Type01,
						text: "National Holidays"
					})],
				appointmentItems: [
					new CalendarLegendItem({
						type: CalendarDayType.Type01,
						text: "Type Private Appointment"
					})
				]
			});

			this.oLegendWithItemsTypes01UpToTypes10 = new PlanningCalendarLegend({
				items: createLegendItems(1, 10, "National Holidays"),
				appointmentItems:  createLegendItems(1, 10, "Type Private Appointment")
			});

			this._testAriaAppointmentsAndSpecialDatesIfLegendIsDestroyed = function(sIntervalType, fnExtendSut) {
				//Prepare
				var sMessagePrefix = "After legend is destroyed",
					aAppointments = _createAppointmentsOfTypes(1, 20, new Date(2015, 0, 1, 19)),
					aSpecialDates = _createSpecialDates(1, 20,  sIntervalType, new Date(2015, 0, 1, 19)),
					oSut = createPlanningCalendar("accPC-LegendDestoyed", new SearchField(), new Button(),
						new Date(2015, 0, 1, 19),
						null, /*View key*/
						this.oLegendWithItemsTypes01UpToTypes10,
						aSpecialDates,
						[new PlanningCalendarRow({
							icon: "sap-icon://employee",
							title: "Max Mustermann",
							text: "Musterteam",
							tooltip: "Header tooltip",
							appointments: aAppointments
						})]);

				oSut.setViewKey(sIntervalType);
				if (fnExtendSut) {
					fnExtendSut(oSut);
				}
				oSut.placeAt("bigUiArea");
				sap.ui.getCore().applyChanges();

				//Act
				this.oLegendWithItemsTypes01UpToTypes10.destroy();
				sap.ui.getCore().applyChanges();

				//Assert
				//Appointments

				this.assertAppointmentsWithoutConnectedLegendHaveDefaultAriaLabelledBy(aAppointments, sMessagePrefix);

				//Special Dates
				this.assertSpecialDatesWithoutConnectedLegendHaveDefaultAriaDescribedBy(aSpecialDates, oSut, sMessagePrefix);

				//Cleanup
				this.destroySut(oSut);
			};

			this._testAriaAppointmentsAndSpecialDates = function(sIntervalType, fnExtendSut) {
				//Prepare
				var sMessagePrefix = "Initial legend is available",
					aAppointments = _createAppointmentsOfTypes(1, 20, new Date(2015, 0, 1, 19)),
					aSpecialDates = _createSpecialDates(1, 20,  sIntervalType, new Date(2015, 0, 1, 19)),
					oSut = createPlanningCalendar("accPC", new SearchField(), new Button(),
						new Date(2015, 0, 1, 19),
						null, /*View key*/
						this.oLegendWithItemsTypes01UpToTypes10,
						aSpecialDates,
						[new PlanningCalendarRow({
							icon: "sap-icon://employee",
							title: "Max Mustermann",
							text: "Musterteam",
							tooltip: "Header tooltip",
							appointments: aAppointments
						})]),
					aAppointmentsWithLegend = aAppointments.slice(0, 10) /* used legend has items for types01 to types10*/,
					aAppointmentsWithoutLegend = aAppointments.slice(10),
					aSpecialDatesWithLegend = aSpecialDates.slice(0, 10) /* used legend has items for types01 to types10*/,
					aSpecialDatesWithoutLegend = aSpecialDates.slice(10);

				oSut.setViewKey(sIntervalType);
				if (fnExtendSut) {
					fnExtendSut(oSut);
				}

				//Act
				oSut.placeAt("bigUiArea");
				sap.ui.getCore().applyChanges();

				//Assert
				//Appointments
				this.assertAppointmentsConnectedToLegendHaveLegendTextAsAriaLabelledByText(aAppointmentsWithLegend, sMessagePrefix);
				this.assertAppointmentsWithoutConnectedLegendHaveDefaultAriaLabelledBy(aAppointmentsWithoutLegend, sMessagePrefix);

				//Special Dates
				this.assertSpecialDatesConnectedToLegendHaveLegendTextAsAriaLabel(aSpecialDatesWithLegend, oSut, sMessagePrefix);
				this.assertSpecialDatesWithoutConnectedLegendHaveDefaultAriaDescribedBy(aSpecialDatesWithoutLegend, oSut, sMessagePrefix);

				//Cleanup
				this.destroySut(oSut);
			};

			this.assertAppointmentsConnectedToLegendHaveLegendTextAsAriaLabelledByText = function(aAppointmentsWithLegend, sMsgPref) {
				aAppointmentsWithLegend.forEach(function (oApp, iIndex) {
					var sLegendItemText = this.oLegendWithItemsTypes01UpToTypes10.getAppointmentItems()[iIndex].getText(),
						sAriaLabelledByText = oApp.$().find(".sapUiInvisibleText").text();

					assert.ok(sAriaLabelledByText.indexOf(sLegendItemText) >= 0, sMsgPref +
						": Appointment of type " + oApp.getType() + " starting at " + oFormatYyyyMMddHHmm.format(oApp.getStartDate()) +
						" should be aria-labelled by hidden element with text '" + sLegendItemText + "'. Current aria-labelledby text: " + sAriaLabelledByText);
				}, this);
			};

			this.assertAppointmentsWithoutConnectedLegendHaveDefaultAriaLabelledBy = function(aAppointmentsWithoutLegend, sMsgPref) {
				aAppointmentsWithoutLegend.forEach(function (oApp) {
					var sBuiltInTypeText = CalendarLegendRenderer.typeARIATexts[oApp.getType()].getText(),
						sAriaLabelledByText = oApp.$().find(".sapUiInvisibleText").text();

					assert.ok(sAriaLabelledByText.indexOf(sBuiltInTypeText) >= 0, sMsgPref +
						": Appointment of type " + oApp.getType() + " starting at " + oFormatYyyyMMddHHmm.format(oApp.getStartDate()) +
						" should be aria-labelled by hidden element with text '" + sBuiltInTypeText + "'. Current aria-labelledby text: " + sAriaLabelledByText);
				}, this);
			};

			this.assertSpecialDatesConnectedToLegendHaveLegendTextAsAriaLabel = function(oSpecialDatesWithLegend, oSutPC, sMsgPref) {
				var oFormat = oSutPC.getViewKey() === CalendarIntervalType.Hour ? oFormatYyyyMMddHHmm : oFormatYyyyMMdd;
				oSpecialDatesWithLegend.forEach(function (oSpecialDate) {
					var sSpecialDate = oFormat.format(oSpecialDate.getStartDate()),
						sSpecialDateSelector = "#" + oSutPC.getId() + "-" + _getIntervalId(oSutPC) + "-" + sSpecialDate,
						$specialDate,
						sAriaLabel;

					if (!jQuery(sSpecialDateSelector).length) {
						_navForward(oSutPC); // the special date might be on the next page
					}
					$specialDate = jQuery(sSpecialDateSelector);
					assert.ok($specialDate.length, sMsgPref + ": Special Date " + sSpecialDate + " should be available in the DOM");

					sAriaLabel = $specialDate.attr("aria-label");
					assert.ok(sAriaLabel && sAriaLabel.indexOf("National Holidays for type " + oSpecialDate.getType()) >= 0,
						sMsgPref + ": Special date " + sSpecialDate + " of type CalendarDayType." + oSpecialDate.getType() +
						" should has aria-label with value containing the corresponding legend item's text." +
						" Current aria-label: " + sAriaLabel);
				});
			};

			this.assertSpecialDatesWithoutConnectedLegendHaveDefaultAriaDescribedBy = function(aSpecialDatesWithoutLegend, oSutPC, sMsgPref) {
				var oFormat = oSutPC.getViewKey() === CalendarIntervalType.Hour ? oFormatYyyyMMddHHmm : oFormatYyyyMMdd;
				aSpecialDatesWithoutLegend.forEach(function (oSpecialDate, iIndex) {
					var sSpecialDate = oFormat.format(oSpecialDate.getStartDate()),
						sSpecialDateSelector = "#" + oSutPC.getId() + "-" + _getIntervalId(oSutPC) + "-" + sSpecialDate,
						$specialDate,
						sAriaDescribedBy;

					if (!jQuery(sSpecialDateSelector).length) {
						_navForward(oSutPC); // the special date might be on the next page
					}
					$specialDate = jQuery(sSpecialDateSelector);
					assert.ok($specialDate.length, sMsgPref + ": Special Date " + sSpecialDate + " should be available in the DOM");

					sAriaDescribedBy = $specialDate.attr("aria-describedby");

					assert.ok(sAriaDescribedBy && sAriaDescribedBy.indexOf(CalendarLegendRenderer.typeARIATexts[oSpecialDate.getType()].getId()) >= 0,
						sMsgPref + ": Special date " + sSpecialDate + " of type CalendarDayType." + oSpecialDate.getType() +
						" should be describedBy built-in text for this type. Current aria-describedby: " + sAriaDescribedBy);
				});
			};

			this.destroySut = function(oSut) {
				if (!bSkipDestroy) {
					oSut.destroy();
				}
			};
			function createLegendItems(iFrom, iTo, sTextPattern) {
				var sTypeName = "",
					aResult = [];

				for (var i = iFrom; i <= iTo; i++) {
					sTypeName = i.toString();
					sTypeName = sTypeName.length === 1 ? "0" + sTypeName : sTypeName;
					sTypeName = "Type" + sTypeName;

					if (!CalendarDayType[sTypeName]) {
						throw "Test error: invalid type " + sTypeName;
					}

					sTypeName = CalendarDayType[sTypeName];
					aResult.push(new CalendarLegendItem({
						type: sTypeName,
						text: sTextPattern + " for type " + sTypeName
					}));
				}
				return aResult;
			}
		},
		afterEach: function() {
			if (!bSkipDestroy) {
				this.oLegend.destroy();
				this.oLegendWithItemsTypes01UpToTypes10.destroy();
			}
			sap.ui.getCore().getConfiguration().setLanguage(this.sOldLanguage);
		}
	});

	QUnit.test("Week day and date aria", function(assert) {
		//Prepare
		var oSut = createPlanningCalendar("PC", new SearchField(), new Button(), new Date(2015, 0, 1)),
			oFormatDate = DateFormat.getInstance({style: "long", calendarType: "Gregorian"}),
			oDate = new CalendarDate(2015, 0, 2, CalendarType.Gregorian),
			sAriaDate = oFormatDate.format(oDate.toUTCJSDate(), true),
			aWeekDaysWide = oFormatDate.oLocaleData.getDaysStandAlone("wide", "Gregorian"),
			sWeekDayAriaText = aWeekDaysWide[5],
			sExpectedAria = sWeekDayAriaText + " " + sAriaDate;

		//Act
		oSut.setViewKey(CalendarIntervalType.Day);
		oSut.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-DatesRow-20150102").attr("aria-label"), sExpectedAria,
			"Correct week day and date aria are written");

		// Clean up
		oSut.destroy();
	});

	QUnit.test("role button set on header cells in different views when we have intervalSelect event attached", function(assert) {
		//Prepare
		var oSut = createPlanningCalendar("PC", new SearchField(), new Button(), new Date(2015, 0, 1)),
			sExpectedRole = "button";

		//Act
		oSut.setViewKey(CalendarIntervalType.Hour);
		oSut.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-TimesRow-201501010800").attr("role"), sExpectedRole, "Correct role 'button' is set in Hours view");

		//Act
		oSut.setViewKey(CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-DatesRow-20150102").attr("role"), sExpectedRole, "Correct role 'button' is set in Days view");

		//Act
		oSut.setViewKey(CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-MonthsRow-20150101").attr("role"), sExpectedRole, "Correct role 'button' is set in Month view");

		//Act
		oSut.setViewKey(CalendarIntervalType.Week);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-WeeksRow-20150102").attr("role"), sExpectedRole, "Correct role 'button' is set in Week view");

		//Act
		oSut.setViewKey(CalendarIntervalType.OneMonth);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-OneMonthsRow-20141201").attr("role"), sExpectedRole, "Correct role 'button' is set in One Month view");

		// Clean up
		oSut.destroy();
	});

	QUnit.test("role gridcell set on header cells in different views when there is no intervalSelect event attached", function(assert) {
		//Prepare
		var oSut = createPlanningCalendar("PC", new SearchField(), new Button(), new Date(2015, 0, 1)),
			sExpectedRole = "gridcell";
		oSut.detachEvent("intervalSelect", handleIntervalSelect);

		//Act
		oSut.setViewKey(CalendarIntervalType.Hour);
		oSut.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-TimesRow-201501010800").attr("role"), sExpectedRole, "Correct role 'gridcell' is set in Hours view");

		//Act
		oSut.setViewKey(CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-DatesRow-20150102").attr("role"), sExpectedRole, "Correct role 'gridcell' is set in Days view");

		//Act
		oSut.setViewKey(CalendarIntervalType.Month);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-MonthsRow-20150101").attr("role"), sExpectedRole, "Correct role 'gridcell' is set in Month view");

		//Act
		oSut.setViewKey(CalendarIntervalType.Week);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-WeeksRow-20150102").attr("role"), sExpectedRole, "Correct role 'gridcell' is set in Week view");

		//Act
		oSut.setViewKey(CalendarIntervalType.OneMonth);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-OneMonthsRow-20141201").attr("role"), sExpectedRole, "Correct role 'gridcell' is set in One Month view");

		// Clean up
		oSut.destroy();
	});

	QUnit.test("Hidden 'Selected' text when selecting/deselecting appointment", function (assert) {
		// Arrange
		var oSut = createPlanningCalendar("PC", new SearchField(), new Button(), new Date(2015, 0, 1)),
			sSelectedTextId = InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED"),
			$appointmentRef;

		oSut.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		$appointmentRef = jQuery("#PC-R1A1");

		// Assert
		assert.strictEqual($appointmentRef.attr("aria-labelledby").indexOf(sSelectedTextId), -1,
			"The appointment shouldn't have a hidden 'Selected' text");

		// Act - click on an appointment to select it
		qutils.triggerEvent("tap", "PC-R1A1");

		// Assert
		assert.ok($appointmentRef.attr("aria-labelledby").indexOf(sSelectedTextId) > -1,
			"The appointment should have a hidden 'Selected' text");

		// Act - click on an appointment again to deselect it
		qutils.triggerEvent("tap", "PC-R1A1");
		assert.strictEqual($appointmentRef.attr("aria-labelledby").indexOf(sSelectedTextId), -1,
			"The 'Selected' text should be removed from the references");

		oSut.destroy();
	});

	//Aria appointments & special dates for Hours view
	QUnit.test("Hours view: appointments and special dates", function (assert) {
		this._testAriaAppointmentsAndSpecialDates(CalendarIntervalType.Hour);
		this._testAriaAppointmentsAndSpecialDatesIfLegendIsDestroyed(CalendarIntervalType.Hour);
	});

	QUnit.test("Days view: appointments and special dates", function (assert) {
		this._testAriaAppointmentsAndSpecialDates(CalendarIntervalType.Day);
		this._testAriaAppointmentsAndSpecialDatesIfLegendIsDestroyed(CalendarIntervalType.Day);
	});

	QUnit.test("1 Week view: appointments and special dates", function (assert) {
		this._testAriaAppointmentsAndSpecialDates(CalendarIntervalType.Week);
		this._testAriaAppointmentsAndSpecialDatesIfLegendIsDestroyed(CalendarIntervalType.Week);
	});

	QUnit.test("1 Month view: appointments and special dates", function (assert) {
		this._testAriaAppointmentsAndSpecialDates(CalendarIntervalType.OneMonth);
		this._testAriaAppointmentsAndSpecialDatesIfLegendIsDestroyed(CalendarIntervalType.OneMonth);
	});

	QUnit.test("Months view: appointments and special dates", function (assert) {
		var fnExtendSut = function (oSutPC) {
			oSutPC.setGroupAppointmentsMode(GroupAppointmentsMode.Expanded);
		};
		this._testAriaAppointmentsAndSpecialDates(CalendarIntervalType.Month, fnExtendSut);
		this._testAriaAppointmentsAndSpecialDatesIfLegendIsDestroyed(CalendarIntervalType.Month, fnExtendSut);
	});

	QUnit.module("views", {
		beforeEach: function () {
			this.oPC = new PlanningCalendar();
		},
		afterEach: function () {
			this.oPC.destroy();
			this.oPC = null;
		}
	});

	QUnit.test("Toggle view select visibility", function (assert) {
		// Assert
		assert.strictEqual(this.oPC._oIntervalTypeSelect.getVisible(), true, "By default the planning calendar is " +
			"created with multiple predefined views so the internal select control should be visible");

		// Act
		// Note: adding a view removes all the predefined views leaving us with only one view for the control
		this.oPC.addView(
			new PlanningCalendarView({
				key: "test",
				intervalType: CalendarIntervalType.Day,
				description: "test",
				intervalsS: 7,
				intervalsM: 7,
				intervalsL: 7
			})
		);
		// Note: updating to the current view key because adding a new view removes all the previous views and
		// the old key is not valid any more
		this.oPC.setViewKey("test");

		// Calling here the onBeforeRendering method to force the update without rendering the control
		this.oPC.onBeforeRendering();

		// Assert
		assert.strictEqual(this.oPC._oIntervalTypeSelect.getVisible(), false, "When having only one view the view " +
			"select should not be visible");
	});

	QUnit.test("default built-in views", function (assert) {
		var aViewKey = PlanningCalendarBuiltInView.Hour;
		this.oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();
		assert.equal(this.oPC._oIntervalTypeSelect.getItems().length, 5, "By default the planning calendar is " +
			"created with 5 predefined views");
		assert.equal(this.oPC.getViews().length, 0, "By default in the planning calendar there are no custom views");
		assert.equal(this.oPC.getViewKey(), aViewKey, "By default the planning calendar view key is hour");
	});

	QUnit.test("setting the property builtInViews with two arguments", function (assert) {
		var oItemKey,
			aViewType = PlanningCalendarBuiltInView,
			aViewKey = PlanningCalendarBuiltInView.Day;
		this.oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		this.oPC.setBuiltInViews([aViewType.Day, aViewType.Hour]);
		sap.ui.getCore().applyChanges();

		// Note: updating to the current view key because adding a new view or setting the builtInViews property
		// with items removes all the previous views and the old key is not valid any more
		this.oPC.setViewKey(aViewType.Day);
		assert.equal(this.oPC._oIntervalTypeSelect.getItems().length, 2, "When the buildInViews property is set with " +
			"two views, only they are shown to the end user.");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[0].getKey();
		assert.equal(oItemKey, aViewType.Day, "The key of the first view is OK");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[1].getKey();
		assert.equal(oItemKey, aViewType.Hour, "The key of the second view is OK");
		assert.equal(this.oPC.getViews().length, 0, "By default in the planning calendar there are no custom views");
		assert.equal(this.oPC.getViewKey(), aViewKey, "When builtInViews property is set, the view key of the " +
			"planning calendar is the first assigned");
	});

	QUnit.test("setting the property builtInViews with no arguments", function (assert) {
		var oItemKey,
			aViewType = PlanningCalendarBuiltInView,
			aViewKey = PlanningCalendarBuiltInView.Hour;
		this.oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		this.oPC.setBuiltInViews([]);
		sap.ui.getCore().applyChanges();
		assert.equal(this.oPC._oIntervalTypeSelect.getItems().length, 5, "When the buildInViews property is set with " +
			"an empty array, the PlanningCalendar is showing the 5 predefined views");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[0].getKey();
		assert.equal(oItemKey, aViewType.Hour, "The key of the first view is OK");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[1].getKey();
		assert.equal(oItemKey, aViewType.Day, "The key of the second view is OK");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[2].getKey();
		assert.equal(oItemKey, aViewType.Month, "The key of the third view is OK");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[3].getKey();
		assert.equal(oItemKey, aViewType.Week, "The key of the fourth view is OK");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[4].getKey();
		assert.equal(oItemKey, aViewType.OneMonth, "The key of the fifth view is OK");
		assert.equal(this.oPC.getViews().length, 0, "By default in the planning calendar there are no custom views");
		assert.equal(this.oPC.getViewKey(), aViewKey, "When builtInViews property is set to empty array, " +
			"the view key of the planning calendar is the default one - hour");
	});

	QUnit.test("with custom view", function (assert) {
		var oItemKey;
		this.oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();
		this.oPC.addView(
			new PlanningCalendarView({
				key: "test",
				intervalType: CalendarIntervalType.Day,
				description: "test",
				intervalsS: 7,
				intervalsM: 7,
				intervalsL: 7
			})
		);
		// Note: updating to the current view key because adding a new view or setting the builtInViews property
		// with items removes all the previous views and the old key is not valid any more
		this.oPC.setViewKey("test");
		sap.ui.getCore().applyChanges();
		assert.equal(this.oPC._oIntervalTypeSelect.getItems().length, 1, "When the buildInViews property is set with " +
			"two views and there is a custom view, the PlanningCalendar is showing 3 views");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[0].getKey();
		assert.equal(oItemKey, "test", "The key of the first view is OK");
		assert.equal(this.oPC.getViews().length, 1, "When set, the there are views in the getViews array");
	});

	QUnit.test("adding custom views and setting the property builtInViews with two arguments", function (assert) {
		var oItemKey,
			aViewType = PlanningCalendarBuiltInView,
			aViewKey = PlanningCalendarBuiltInView.Day;
		this.oPC.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();

		this.oPC.addView(
			new PlanningCalendarView({
				key: "test",
				intervalType: CalendarIntervalType.Day,
				description: "test",
				intervalsS: 7,
				intervalsM: 7,
				intervalsL: 7
			})
		);
		// Note: updating to the current view key because adding a new view or setting the builtInViews property
		// with items removes all the previous views and the old key is not valid any more
		this.oPC.setViewKey("test");
		sap.ui.getCore().applyChanges();
		assert.equal(this.oPC._oIntervalTypeSelect.getItems().length, 1, "When the buildInViews property is set with " +
			"two views and there is a custom view, the PlanningCalendar is showing 3 views");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[0].getKey();
		assert.equal(oItemKey, "test", "The key of the first view is OK");

		this.oPC.setBuiltInViews([aViewType.Day, aViewType.Hour]);
		sap.ui.getCore().applyChanges();

		assert.equal(this.oPC._oIntervalTypeSelect.getItems().length, 3, "When the buildInViews property is set with " +
			"two views and there is a custom view, the PlanningCalendar is showing 3 views");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[0].getKey();
		assert.equal(oItemKey, aViewType.Day, "The key of the first view is OK");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[1].getKey();
		assert.equal(oItemKey, aViewType.Hour, "The key of the second view is OK");
		oItemKey = this.oPC._oIntervalTypeSelect.getItems()[2].getKey();
		assert.equal(oItemKey, "test", "The key of the third view is OK");
		assert.equal(this.oPC.getViews().length, 1, "When set, the there are views in the getViews array");
		assert.equal(this.oPC.getViewKey(), aViewKey, "When builtInViews property is set, the view key of the " +
			"planning calendar is the first assigned");
	});

	QUnit.module('CalendarAppointment');

	QUnit.test('_getComparer', function(assert) {
		var aAppInfos = [
			new CalendarAppointment({
				startDate: new Date(2015, 0, 2, 8, 0),
				endDate: new Date(2015, 0, 2, 10, 0),
				title: "3"
			}),
			new CalendarAppointment({
				startDate: new Date(2015, 0, 1, 8, 0),
				endDate: new Date(2015, 0, 3, 10, 0),
				title: "1"
			}),
			new CalendarAppointment({
				startDate: new Date(2014, 11, 31, 8, 0),
				endDate: new Date(2015, 0, 2, 11, 0),
				title: "2"
			}),
			new CalendarAppointment({
				startDate: new Date(2015, 0, 2, 9, 0),
				endDate: new Date(2015, 0, 2, 12, 0),
				title: "4"
			}),
			new CalendarAppointment({
				startDate: new Date(2015, 0, 1, 7, 0),
				endDate: new Date(2015, 0, 3, 5, 0),
				title: "0"
			})
		].map(function(appointment) {
			return { appointment: appointment };
		});

		var aSortedInfos = aAppInfos.sort(CalendarAppointment._getComparer(new Date(2015, 0, 2)));
		assert.equal(aSortedInfos[0].appointment.getTitle(), "0", 'item sorted correctly');
		assert.equal(aSortedInfos[1].appointment.getTitle(), "1", 'item sorted correctly');
		assert.equal(aSortedInfos[2].appointment.getTitle(), "2", 'item sorted correctly');
		assert.equal(aSortedInfos[3].appointment.getTitle(), "3", 'item sorted correctly');
	});

	QUnit.test('_getDateRangeIntersectionText', function(assert) {
		var aAppInfos = [
				new CalendarAppointment({
					startDate: new Date(2015, 0, 3, 8, 0),
					endDate: new Date(2015, 0, 3, 10, 0)
				}),
				new CalendarAppointment({
					startDate: new Date(2015, 0, 1, 8, 0),
					endDate: new Date(2015, 0, 3, 10, 0)
				}),
				new CalendarAppointment({
					startDate: new Date(2014, 11, 31, 8, 0),
					endDate: new Date(2015, 0, 2, 11, 0)
				}),
				new CalendarAppointment({
					startDate: new Date(2015, 0, 2, 9, 0),
					endDate: new Date(2015, 0, 4, 12, 0)
				}),
				new CalendarAppointment({
					startDate: new Date(2015, 0, 2, 7, 0),
					endDate: new Date(2015, 0, 2, 15, 0)
				}),
				new CalendarAppointment({
					startDate: new Date(2015, 0, 2, 7, 0),
					endDate: new Date(2015, 0, 2, 15, 34)
				}),
				new CalendarAppointment({
					startDate: new Date(2015, 0, 2, 7, 0),
					endDate: new Date(2015, 0, 2, 7, 34)
				})
			],
			oCurrentlyDisplayedDate = new Date(2015, 0, 2),
			oTimeFormat = DateFormat.getTimeInstance({pattern: 'HH:mm'}),
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			oLocaleData = LocaleData.getInstance(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()),
			oOriginalFormatLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
			sOriginalFormatLocale = oOriginalFormatLocale.getLanguage() + "_" +  oOriginalFormatLocale.getRegion();

		sap.ui.getCore().getConfiguration().setFormatLocale("en-GB");

		assert.equal(aAppInfos[0]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).start, '');
		assert.equal(aAppInfos[0]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).end, undefined);
		assert.equal(aAppInfos[1]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).start, "All Day");
		assert.equal(aAppInfos[1]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).end, undefined);
		// assert.equal(aAppInfos[2]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).start, "until"); // TODO: will be uncommented after chnage in the translation
		assert.equal(aAppInfos[2]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).end, "11:00");
		assert.equal(aAppInfos[3]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).start, "from");
		assert.equal(aAppInfos[3]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).end, "09:00");
		assert.equal(aAppInfos[4]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).start, "07:00");
		assert.equal(aAppInfos[4]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).end, "8 hrs");
		assert.equal(aAppInfos[5]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).start, "07:00");
		assert.equal(aAppInfos[5]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).end, "8 hrs, 34 mins");
		assert.equal(aAppInfos[6]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).start, "07:00");
		assert.equal(aAppInfos[6]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).end, "34 mins");

		sap.ui.getCore().getConfiguration().setFormatLocale(sOriginalFormatLocale);
	});

	QUnit.module('showDayNamesLine', {
		beforeEach: function () {
			this.oPC = new PlanningCalendar("OPC");
			this.oPC.placeAt("bigUiArea");
		},

		afterEach: function () {
			this.oPC.destroy();
			this.oPC = null;
		}
	});

	QUnit.test("test default value", function (assert) {
		var oDatesRow;

		this.oPC.setViewKey(CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();
		oDatesRow = sap.ui.getCore().byId("OPC-DatesRow");
		assert.equal(oDatesRow.getShowDayNamesLine(), false, "the default property of the DatesRow in the days view is false");

		this.oPC.setViewKey(CalendarIntervalType.Week);
		sap.ui.getCore().applyChanges();
		oDatesRow = sap.ui.getCore().byId("OPC-WeeksRow");
		assert.equal(oDatesRow.getShowDayNamesLine(), false, "the default property of the WeeksRow in the week view is false");

		this.oPC.setViewKey(CalendarIntervalType.OneMonth);
		sap.ui.getCore().applyChanges();
		oDatesRow = sap.ui.getCore().byId("OPC-OneMonthsRow");
		assert.equal(oDatesRow.getShowDayNamesLine(), false, "the default property of the OneMonthsRow in the one month view is false");

	});

	QUnit.test("Toggle showDayNamesLine", function (assert) {
		var oDatesRow,
			oWeeksRow,
			oOneMonthsRow;
		//initialize the views
		this.oPC.setViewKey(CalendarIntervalType.Day);
		this.oPC.setViewKey(CalendarIntervalType.Week);
		this.oPC.setViewKey(CalendarIntervalType.OneMonth);
		this.oPC.setViewKey(CalendarIntervalType.Hour);
		sap.ui.getCore().applyChanges();

		oDatesRow = sap.ui.getCore().byId("OPC-DatesRow");
		oWeeksRow = sap.ui.getCore().byId("OPC-WeeksRow");
		oOneMonthsRow = sap.ui.getCore().byId("OPC-OneMonthsRow");

		this.oPC.setShowDayNamesLine(true);
		assert.equal(oDatesRow.getShowDayNamesLine(), true, "the property is passed to the DatesRow in the days view after setting the property to the Hour view");

		assert.equal(oWeeksRow.getShowDayNamesLine(), true, "the property is passed to the WeeksRow in the week view after setting the property to the Hour view");

		assert.equal(oOneMonthsRow.getShowDayNamesLine(), true, "the property is passed to the OneMonthsRow in the one month view after setting the property to the Hour view");

		this.oPC.setViewKey(CalendarIntervalType.Day);
		sap.ui.getCore().applyChanges();
		this.oPC.setShowDayNamesLine(false);
		assert.equal(oDatesRow.getShowDayNamesLine(), false, "the property is passed to the DatesRow in the days view after setting the property to the Day view");

		assert.equal(oWeeksRow.getShowDayNamesLine(), false, "the property is passed to the WeeksRow in the week view after setting the property to the Day view");

		assert.equal(oOneMonthsRow.getShowDayNamesLine(), false, "the property is passed to the OneMonthsRow in the one month view after setting the property to the Day view");

		this.oPC.setViewKey(CalendarIntervalType.Week);
		sap.ui.getCore().applyChanges();
		this.oPC.setShowDayNamesLine(true);
		assert.equal(oDatesRow.getShowDayNamesLine(), true, "the property is passed to the DatesRow in the days view after setting the property to the Week view");

		assert.equal(oWeeksRow.getShowDayNamesLine(), true, "the property is passed to the WeeksRow in the week view after setting the property to the Week view");

		assert.equal(oOneMonthsRow.getShowDayNamesLine(), true, "the property is passed to the OneMonthsRow in the one month view after setting the property to the Week view");

		this.oPC.setViewKey(CalendarIntervalType.OneMonth);
		sap.ui.getCore().applyChanges();
		this.oPC.setShowDayNamesLine(false);
		assert.equal(oDatesRow.getShowDayNamesLine(), false, "the property is passed to the DatesRow in the days view after setting the property to the OneMonth view");

		assert.equal(oWeeksRow.getShowDayNamesLine(), false, "the property is passed to the WeeksRow in the week view after setting the property to the OneMonth view");

		assert.equal(oOneMonthsRow.getShowDayNamesLine(), false, "the property is passed to the OneMonthsRow in the one month view after setting the property to the OneMonth view");

	});

	QUnit.module('Destroy', {
		beforeEach: function () {
			this.oPC = new PlanningCalendar();
			this.oPC.placeAt("bigUiArea");
		},
		afterEach: function () {
			this.oPC.destroy();
			this.oPC = null;
		}
	});

	QUnit.test("When the control is destroyed there's no need of custom invalidation logic", function (assert) {
		//define
		var oControlInvalidateSpy = this.spy(Control.prototype, "invalidate");

		//act
		this.oPC.addSpecialDate(new DateTypeRange({startDate: new Date(), tooltip: "test"}));
		this.oPC._bIsBeingDestroyed = true;
		this.oPC.invalidate();

		//assert
		assert.strictEqual(oControlInvalidateSpy.callCount, 1,
			"When _bIsBeingDestroyed is true only the Control's 'invalidate' is executed and not our extra logic");

		//cleanup
		oControlInvalidateSpy.restore();
		this.oPC._bIsBeingDestroyed = false;
	});

	QUnit.module("WeekNumbers");

	QUnit.test("setViewKey -> Days - propagates showWeekNumbers property", function(assert) {
		//arrange
		var oPC = new PlanningCalendar({
				showWeekNumbers: false
			}),
			oSetShowWeekNumbersSpy = this.spy(DatesRow.prototype, "setShowWeekNumbers"),
			oDatesRow;

		//act
		oPC.setViewKey(CalendarIntervalType.Day);
		oDatesRow = oPC._oDatesRow;

		//assert
		assert.notOk(oDatesRow.getShowWeekNumbers(), "Planning Calendar propagated the showWeekNumbers property");
		assert.ok(oSetShowWeekNumbersSpy.calledWith(false), "setter called with the right arguments");

		//clean
		oPC.destroy();
	});

	QUnit.test("_viewAllowsWeekNumbers", function(assert) {
		//arrange
		var oPC = new PlanningCalendar();

		//act, assert
		assert.equal(oPC._viewAllowsWeekNumbers(CalendarIntervalType.Hour), false, "is not supported for Hour view");
		assert.equal(oPC._viewAllowsWeekNumbers(CalendarIntervalType.Day), true, "is supported for Day view");
		assert.equal(oPC._viewAllowsWeekNumbers(CalendarIntervalType.Week), true, "is supported for Week view");
		assert.equal(oPC._viewAllowsWeekNumbers(CalendarIntervalType.Month), false, "is not supported for Month view");
		assert.equal(oPC._viewAllowsWeekNumbers(CalendarIntervalType.OneMonth), true, "is supported for OneMonth view");

		//clean
		oPC.destroy();
	});

	QUnit.test("_getRowInstanceByViewKey", function(assert) {
		//arrange
		var oPC = new PlanningCalendar();

		//act, assert
		assert.ok(!oPC._getRowInstanceByViewKey(CalendarIntervalType.Hour), "returns no instance for Hours view, it was not created yet");
		assert.ok(!oPC._getRowInstanceByViewKey(CalendarIntervalType.Day), "returns no instance for Day view, it was not created yet");
		assert.ok(!oPC._getRowInstanceByViewKey(CalendarIntervalType.Week), "returns no instance for Week view, it was not created yet");
		assert.ok(!oPC._getRowInstanceByViewKey(CalendarIntervalType.Month), "returns no instance for Month view, it was not created yet");
		assert.ok(!oPC._getRowInstanceByViewKey(CalendarIntervalType.OneMonth), "returns no instance for OneMonth view, it was not created yet");

		//act
		oPC.setViewKey(CalendarIntervalType.Hour);
		oPC.setViewKey(CalendarIntervalType.Day);
		oPC.setViewKey(CalendarIntervalType.Week);
		oPC.setViewKey(CalendarIntervalType.Month);
		oPC.setViewKey(CalendarIntervalType.OneMonth);

		//assert
		assert.ok(oPC._getRowInstanceByViewKey(CalendarIntervalType.Hour), "returns an instance for Hours view");
		assert.ok(oPC._getRowInstanceByViewKey(CalendarIntervalType.Day), "returns an instance for Day view");
		assert.ok(oPC._getRowInstanceByViewKey(CalendarIntervalType.Week), "returns an instance for Week view");
		assert.ok(oPC._getRowInstanceByViewKey(CalendarIntervalType.Month), "returns an instance for Month view");
		assert.ok(oPC._getRowInstanceByViewKey(CalendarIntervalType.OneMonth), "returns an instance for OneMonth view");

		//clean
		oPC.destroy();
	});

	QUnit.module("Drag and Drop", {
		beforeEach: function () {
			this.oPC = new PlanningCalendar();
		},
		afterEach: function () {
			this.oPC.destroy();
			this.oPC = null;
		}
	});

	QUnit.test("_calcNewHoursAppPos: Calculate new position of the appointment in 'Hours' view", function(assert) {
		//arrange
		var oRowStartDate = new Date(2017, 10, 13),
			oAppStartDate = new Date(2017, 10, 13, 1, 0, 0),
			oAppEndDate = new Date(2017, 10, 13, 2, 0, 0),
			newAppPos;

		//act
		newAppPos = this.oPC._calcNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 10);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2017, 10, 13, 5, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 13, 6, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 16);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2017, 10, 13, 8, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 13, 9, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 8);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2017, 10, 13, 4, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 13, 5, 0, 0), "Correct new end position");
	});

	QUnit.test("_calcNewHoursAppPos: Calculate new position of the appointment in 'Hours' view near DST change", function(assert) {
		//arrange
		var oRowStartDate = new Date(2019, 9, 27),
			oAppStartDate = new Date(2019, 9, 27, 1, 0, 0),
			oAppEndDate = new Date(2019, 9, 27, 3, 0, 0),
			newAppPos;

		//act
		newAppPos = this.oPC._calcNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 4);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2019, 9, 27, 2, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 4, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2019, 9, 27, 3, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 5, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 8);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2019, 9, 27, 4, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 6, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 14);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2019, 9, 27, 7, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 9, 0, 0), "Correct new end position");
	});

	QUnit.test("_calcNewDaysAppPos: Calculate new position of the appointment in 'Days' view", function(assert) {
		//arrange
		var oRowStartDate = new Date(2017, 10, 13),
			oAppStartDate = new Date(2017, 10, 15, 1, 0, 0),
			oAppEndDate = new Date(2017, 10, 15, 2, 0, 0),
			newAppPos;

		//act
		newAppPos = this.oPC._calcNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 4);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2017, 10, 17, 1, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 17, 2, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 3);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2017, 10, 16, 1, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 16, 2, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2017, 10, 19, 1, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 19, 2, 0, 0), "Correct new end position");
	});

	QUnit.test("_calcNewDaysAppPos: Calculate new position of the appointment in 'Days' view near DST change", function(assert) {
		//arrange
		var oRowStartDate = new Date(2019, 9, 27),
			oAppStartDate = new Date(2019, 9, 27, 0, 0, 0),
			oAppEndDate = new Date(2019, 9, 27, 4, 0, 0),
			newAppPos;

		//act
		newAppPos = this.oPC._calcNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 1);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2019, 9, 28, 0, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 28, 4, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 2);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2019, 9, 29, 0, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 29, 4, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 0);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2019, 9, 27, 0, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 4, 0, 0), "Correct new end position");
	});

	QUnit.test("_calcNewMonthsAppPos: Calculate new position of the appointment in 'Months' view", function(assert) {
		//arrange
		var oRowStartDate = new Date(2017, 10, 13),
			oAppStartDate = new Date(2017, 11, 13, 1, 0, 0),
			oAppEndDate = new Date(2017, 11, 13, 2, 0, 0),
			newAppPos;

		//act
		newAppPos = this.oPC._calcNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 3);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2018, 1, 13, 1, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2018, 1, 13, 2, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 1);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2017, 11, 13, 1, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 11, 13, 2, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 2);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2018, 0, 13, 1, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2018, 0, 13, 2, 0, 0), "Correct new end position");
	});

	QUnit.test("_calcNewMonthsAppPos: Calculate new position of the appointment in 'Months' view near DST change", function(assert) {
		//arrange
		var oRowStartDate = new Date(2019, 9, 27),
			oAppStartDate = new Date(2019, 9, 27, 0, 0, 0),
			oAppEndDate = new Date(2019, 9, 27, 4, 0, 0),
			newAppPos;

		//act
		newAppPos = this.oPC._calcNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 1);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2019, 10, 27, 0, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 10, 27, 4, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 4);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2020, 1, 27, 0, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2020, 1, 27, 4, 0, 0), "Correct new end position");

		//act
		newAppPos = this.oPC._calcNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2020, 3, 27, 0, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2020, 3, 27, 4, 0, 0), "Correct new end position");
	});

	QUnit.test("_calcNewMonthsAppPos: Calculate new position of the appointment in 'Months' view when row start day is different than the appointment's day", function (assert) {
		//arrange
		var oRowStartDate = new Date(2017, 10, 13),
			oAppStartDate = new Date(2017, 11, 14, 1, 0, 0),
			oAppEndDate = new Date(2017, 11, 14, 2, 0, 0),
			newAppPos;

		//act
		newAppPos = this.oPC._calcNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 3);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2018, 1, 14, 1, 0, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2018, 1, 14, 2, 0, 0), "Correct new end position");
	});

	QUnit.test("setEnableAppointmentsDragAndDrop", function(assert) {
		//arrange
		var oPCRow1 = new PlanningCalendarRow("row1"),
			oPCRow2 = new PlanningCalendarRow("row2");

		this.oPC.addRow(oPCRow1);
		this.oPC.addRow(oPCRow2);

		//act
		oPCRow1.setEnableAppointmentsDragAndDrop(true);

		var oDragConfig = oPCRow1.getDragDropConfig();
		var oDropConfig = _getRowTimeline(oPCRow1).getDragDropConfig();

		//assert
		assert.equal(oDragConfig.length, 1, "One DragInfo found");
		assert.equal(oDragConfig[0].getSourceAggregation(), "appointments", "Source aggregation is correct");
		assert.equal(oDropConfig[0].getTargetAggregation(), "_intervalPlaceholders", "Target aggregation is correct");
		assert.equal(oDragConfig[0].getGroupName(), "DragDropConfig", "Group name is correct");
		assert.equal(oDropConfig[0].getGroupName(), "DragDropConfig", "Group name is correct");

		//act
		oPCRow1.setEnableAppointmentsDragAndDrop(true);

		//assert
		assert.equal(oPCRow1.getDragDropConfig().length, 1, "One config found");
		assert.equal(_getRowTimeline(oPCRow1).getDragDropConfig().length, 1, "One config found");
		assert.equal(oPCRow2.getDragDropConfig().length, 0, "Zero configs found");
		assert.equal(_getRowTimeline(oPCRow2).getDragDropConfig().length, 0, "Zero configs found");

		//act
		oPCRow1.setEnableAppointmentsDragAndDrop(false);

		//assert
		assert.equal(oPCRow1.getDragDropConfig().length, 0, "Zero configs found");
		assert.equal(_getRowTimeline(oPCRow1).getDragDropConfig().length, 0, "Zero configs found");
		assert.equal(oPCRow2.getDragDropConfig().length, 0, "Zero configs found");
		assert.equal(_getRowTimeline(oPCRow2).getDragDropConfig().length, 0, "Zero configs found");


		//act
		oPCRow1.setEnableAppointmentsDragAndDrop(true);
		oPCRow2.setEnableAppointmentsDragAndDrop(true);

		//assert
		assert.equal(oPCRow1.getDragDropConfig().length, 1, "One config found");
		assert.equal(_getRowTimeline(oPCRow1).getDragDropConfig().length, 1, "One config found");
		assert.equal(oPCRow2.getDragDropConfig().length, 1, "One config found");
		assert.equal(_getRowTimeline(oPCRow2).getDragDropConfig().length, 1, "One config found");

		//act
		oPCRow1.setEnableAppointmentsDragAndDrop(false);
		oPCRow2.setEnableAppointmentsDragAndDrop(true);

		//assert
		assert.equal(oPCRow1.getDragDropConfig().length, 0, "Zero configs found");
		assert.equal(_getRowTimeline(oPCRow1).getDragDropConfig().length, 0, "Zero configs found");
		assert.equal(oPCRow2.getDragDropConfig().length, 1, "One config found");
		assert.equal(_getRowTimeline(oPCRow2).getDragDropConfig().length, 1, "One config found");
	});

	QUnit.test("_calcCreateNewAppHours: Calculate proper position of the new appointment in 'Hours' view", function (assert) {
		//arrange
		var oRowStartDate = new Date(2017, 10, 13, 0, 38, 11),
			iStartIndex = 3,
			iEndIndex = 6,
			newAppPos;

		//act
		newAppPos = this.oPC._calcCreateNewAppHours(oRowStartDate, iStartIndex, iEndIndex);

		//assert
		assert.deepEqual(newAppPos.startDate, new Date(2017, 10, 13, 1, 30, 0), "Correct new start position");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 13, 3, 30, 0), "Correct new end position");
	});

	function _getAppointmentsCount(oPC) {
		var aRows = oPC.getRows(),
			iAppointments = 0;

		aRows.forEach(function(oRow){
			iAppointments += oRow.getAppointments().length;
		});

		return iAppointments;
	}

	QUnit.module("Resize Appointments", {
		beforeEach: function () {
			this.oPCRow = new PlanningCalendar();
		},

		afterEach: function () {
			this.oPCRow.destroy();
			this.oPCRow = null;
		}
	});

	QUnit.test("setEnableAppointmentsResize", function(assert) {
		//arrange
		var oPC = new PlanningCalendar(),
			oPCRow1 = new PlanningCalendarRow("row1");

		oPC.addRow(oPCRow1);

		//act
		oPCRow1.setEnableAppointmentsResize(true);

		var oDragConfig = oPCRow1.getDragDropConfig();

		//assert
		assert.equal(oDragConfig.length, 1, "One DragInfo found");
		assert.equal(oDragConfig[0].getSourceAggregation(), "appointments", "Source aggregation is correct");
		assert.equal(oDragConfig[0].getTargetAggregation(), "_intervalPlaceholders", "Source aggregation is correct");
		assert.equal(oDragConfig[0].getGroupName(), "ResizeConfig", "Group name is correct");

		//act
		oPCRow1.setEnableAppointmentsResize(false);

		//assert
		assert.equal(oPCRow1.getDragDropConfig().length, 0, "Zero configs found");

		//clean
		oPC.destroy();
	});

	QUnit.test("_calcResizeNewHoursAppPos: Calculate new size of the appointment in 'Hours' view", function (assert) {
		// arrange
		var oRowStartDate = new Date(2017, 10, 13, 0, 0, 0),
			oAppStartDate = new Date(2017, 10, 13, 1, 0, 0),
			oAppEndDate = new Date(2017, 10, 13, 2, 0, 0),
			newAppPos;

		// act - resize appointment's end with 5 hours (10 x 30 mins) from the beginning of the line
		newAppPos = this.oPCRow._calcResizeNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 9);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 13, 5, 0, 0), "End date hour is correct");

		// act - resize appointment's if end time is less than the start time than use just 30 mins from the beggining
		newAppPos = this.oPCRow._calcResizeNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 0);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 13, 1, 30, 0), "End date hour is correct");
	});

	QUnit.test("_calcResizeNewHoursAppPos: Calculate new size of the appointment in 'Hours' view near DST change", function (assert) {
		// arrange
		var oRowStartDate = new Date(2019, 9, 27, 0, 0, 0),
			oAppStartDate = new Date(2019, 9, 27, 1, 0, 0),
			oAppEndDate = new Date(2019, 9, 27, 3, 0, 0),
			newAppPos;

		// act - resize appointment's end to the 6th hour
		newAppPos = this.oPCRow._calcResizeNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 11);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 6, 0, 0), "End date hour is correct (6:00)");

		// act - resize appointment's end to the 5th hour
		newAppPos = this.oPCRow._calcResizeNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 9);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 5, 0, 0), "End date hour is correct (5:00)");

		// act - resize appointment's end to the 4th hour
		newAppPos = this.oPCRow._calcResizeNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 7);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 4, 0, 0), "End date hour is correct (4:00)");

		// act - resize appointment's end to the 3th hour
		newAppPos = this.oPCRow._calcResizeNewHoursAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 5);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2019, 9, 27, 3, 0, 0), "End date hour is correct (3:00)");
	});

	QUnit.test("_calcResizeNewDaysAppPos: Calculate new size of the appointment in 'Days' view", function (assert) {
		// arrange
		var oRowStartDate = new Date(2017, 10, 13),
			oAppStartDate = new Date(2017, 10, 13),
			oAppEndDate = new Date(2017, 10, 14),
			newAppPos;

		// act - resize appointment's end with 4 days from the beginning of the line
		newAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 3);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 17), "End date day is correct");

		// act - resize appointment's if end time is less than the start time than use just 1 day from the beggining
		newAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 0);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 14), "End date day is correct");
	});

	QUnit.test("_calcResizeNewDaysAppPos: Calculate new size of the appointment in 'Days' view - shrink event", function (assert) {
		// arrange
		var oRowStartDate = new Date(2017, 6, 13),
			oAppStartDate = new Date(2017, 6, 13),
			oAppEndDate = new Date(2017, 6, 20),
			newAppPos;

		// act - resize appointment's end with 5 days from the beginning of the line
		newAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 4);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 6, 18), "End date day is correct");
	});

	QUnit.test("_calcResizeNewMonthsAppPos: Calculate new size of the appointment in 'Months' view", function (assert) {
		// arrange
		var oRowStartDate = new Date(2017, 6, 13),
			oAppStartDate = new Date(2017, 6, 13),
			oAppEndDate = new Date(2017, 7, 13),
			newAppPos;

		// act - resize appointment's end with 4 Months from the beginning of the line
		newAppPos = this.oPCRow._calcResizeNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 3);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 1), "End date month is correct");

		// act - resize appointment's if end time is less than the start time than use just 1 month from the beggining
		newAppPos = this.oPCRow._calcResizeNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 0);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 7, 1), "End date month is correct");
	});

	QUnit.test("_calcResizeNewMonthsAppPos: Calculate new size of the appointment in 'Months' view - shrink event", function (assert) {
		// arrange
		var oRowStartDate = new Date(2017, 6, 13),
			oAppStartDate = new Date(2017, 6, 13),
			oAppEndDate = new Date(2017, 11, 13),
			newAppPos;

		// act - resize appointment's end with 4 Months from the beginning of the line
		newAppPos = this.oPCRow._calcResizeNewMonthsAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 3);

		// assert
		assert.deepEqual(newAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(newAppPos.endDate, new Date(2017, 10, 1), "End date month is correct");
	});

	QUnit.test("_calcResizeNewMonthsAppPos: Calculate new size of the appointment in '1 Month' view when appointment starts from previous month", function (assert) {
		// arrange
		var oRowStartDate = new Date(2017, 11, 1),
			oAppStartDate = new Date(2017, 10, 24),
			oAppEndDate = new Date(2017, 11, 7),
			oNewAppPos;

		// act - resize appointment's end with 6 Days from the beginning of the line
		oNewAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		// assert
		assert.deepEqual(oNewAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(oNewAppPos.endDate, new Date(2017, 11, 8), "End date month is correct");
	});

	QUnit.test("_calcResizeNewMonthsAppPos: Calculate new size of the appointment in '1 Month' view when aapointment starts from previous year", function (assert) {
		// arrange
		var oRowStartDate = new Date(2018, 0, 1),
			oAppStartDate = new Date(2017, 11, 24),
			oAppEndDate = new Date(2018, 0, 7),
			oNewAppPos;

		// act - resize appointment's end with 6 Days from the beginning of the line
		oNewAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		// assert
		assert.deepEqual(oNewAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(oNewAppPos.endDate, new Date(2018, 0, 8), "End date month is correct");
	});

	QUnit.test("_calcResizeNewMonthsAppPos: Calculate new size of the appointment in '1 Month' view when appointment starts from previous month", function (assert) {
		// arrange
		var oRowStartDate = new Date(2017, 11, 1),
			oAppStartDate = new Date(2017, 10, 24),
			oAppEndDate = new Date(2017, 11, 7),
			oNewAppPos;

		// act - resize appointment's end with 6 Days from the beginning of the line
		oNewAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		// assert
		assert.deepEqual(oNewAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(oNewAppPos.endDate, new Date(2017, 11, 8), "End date month is correct");
	});

	QUnit.test("_calcResizeNewMonthsAppPos: Calculate new size of the appointment in '1 Month' view when aapointment starts from previous year", function (assert) {
		// arrange
		var oRowStartDate = new Date(2018, 0, 1),
			oAppStartDate = new Date(2017, 11, 24),
			oAppEndDate = new Date(2018, 0, 7),
			oNewAppPos;

		// act - resize appointment's end with 6 Days from the beginning of the line
		oNewAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		// assert
		assert.deepEqual(oNewAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(oNewAppPos.endDate, new Date(2018, 0, 8), "End date month is correct");
	});

	QUnit.test("_calcResizeNewMonthsAppPos: Calculate new size of the appointment in '1 Month' view when appointment starts from previous month", function (assert) {
		// arrange
		var oRowStartDate = new Date(2017, 11, 1),
			oAppStartDate = new Date(2017, 10, 24),
			oAppEndDate = new Date(2017, 11, 7),
			oNewAppPos;

		// act - resize appointment's end with 6 Days from the beginning of the line
		oNewAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		// assert
		assert.deepEqual(oNewAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(oNewAppPos.endDate, new Date(2017, 11, 8), "End date month is correct");
	});

	QUnit.test("_calcResizeNewMonthsAppPos: Calculate new size of the appointment in '1 Month' view when aapointment starts from previous year", function (assert) {
		// arrange
		var oRowStartDate = new Date(2018, 0, 1),
			oAppStartDate = new Date(2017, 11, 24),
			oAppEndDate = new Date(2018, 0, 7),
			oNewAppPos;

		// act - resize appointment's end with 6 Days from the beginning of the line
		oNewAppPos = this.oPCRow._calcResizeNewDaysAppPos(oRowStartDate, oAppStartDate, oAppEndDate, 6);

		// assert
		assert.deepEqual(oNewAppPos.startDate, oAppStartDate, "Start date should not be changed");
		assert.deepEqual(oNewAppPos.endDate, new Date(2018, 0, 8), "End date month is correct");
	});

	QUnit.module("Create Appointments: setEnableAppointmentsCreate");

	QUnit.test("setEnableAppointmentsCreate", function(assert) {
		//arrange
		var oPC = new PlanningCalendar(),
			oPCRow1 = new PlanningCalendarRow("row1");

		oPC.addRow(oPCRow1);

		//act
		oPCRow1.setEnableAppointmentsCreate(true);

		var oDragConfig = _getRowTimeline(oPCRow1).getDragDropConfig();

		//assert
		assert.equal(oDragConfig.length, 1, "One DragInfo found");
		assert.equal(oDragConfig[0].getTargetAggregation(), "_intervalPlaceholders", "Source aggregation is correct");
		assert.equal(oDragConfig[0].getGroupName(), "CreateConfig", "Group name is correct");

		//act
		oPCRow1.setEnableAppointmentsCreate(false);

		//assert
		assert.equal(_getRowTimeline(oPCRow1).getDragDropConfig().length, 0, "Zero configs found");

		//clean
		oPC.destroy();
	});

	QUnit.module("Create Appointments: _calcCreateNewAppHours", {
		beforeEach: function () {
			this.oPCRow = new PlanningCalendar();
			this.oRowStartDate = new Date(2017, 10, 13, 0, 0, 0);
			this.test = function (assert, iStartIndex, iEndIndex, oExpectedStartDate, oExpectedEndDate) {
				// arrange
				var oNewAppPos;

				// act
				oNewAppPos = this.oPCRow._calcCreateNewAppHours(this.oRowStartDate, iStartIndex, iEndIndex);

				// assert
				assert.deepEqual(oNewAppPos.startDate, oExpectedStartDate, "startDate is ok");
				assert.deepEqual(oNewAppPos.endDate, oExpectedEndDate, "endDate is ok");
			};
		},
		afterEach: function () {
			this.oPCRow.destroy();
			this.oPCRow = null;
		}
	});

	QUnit.test("startIndex and endIndex are the same: indexes = 0 - (30 minutes event at the beginning of the row)", function (assert) {
		this.test(assert, 0, 0, this.oRowStartDate, new Date(2017, 10, 13, 0, 30, 0));
	});

	QUnit.test("startIndex and endIndex are the same: indexes = 3 - (30 minutes event in 1 hour and 30 mins from the row's startDate)", function (assert) {
		this.test(assert, 3, 3, new Date(2017, 10, 13, 1, 30, 0), new Date(2017, 10, 13, 2, 0, 0));
	});

	QUnit.test("startIndex is lower than the endIndex: startIndex = 0, endIndex = 1 - (1h event at the beginning of the row)", function (assert) {
		this.test(assert, 0, 1, this.oRowStartDate, new Date(2017, 10, 13, 1, 0, 0));
	});

	QUnit.test("startIndex is lower than the endIndex: startIndex = 3, endIndex = 6 - (2h event in 1h and 30 mins from the row's startDate)", function (assert) {
		this.test(assert, 3, 6, new Date(2017, 10, 13, 1, 30, 0), new Date(2017, 10, 13, 3, 30, 0));
	});

	QUnit.test("startIndex is greater than the end Index: startIndex = 1, endIndex = 0 -  (30mins event at the beginning of the row)", function (assert) {
		this.test(assert, 1, 0, this.oRowStartDate, new Date(2017, 10, 13, 0, 30, 0));
	});

	QUnit.test("startIndex is greater than the end Index: startIndex = 6, endIndex = 3 - (1h and 30 mins event in 1h and 30 mins from the row's startDate)", function (assert) {
		this.test(assert, 6, 3, new Date(2017, 10, 13, 1, 30, 0), new Date(2017, 10, 13, 3, 0, 0));
	});

	QUnit.module("Create Appointments near DST change: _calcCreateNewAppHours", {
		beforeEach: function () {
			this.oPCRow = new PlanningCalendar();
			this.oRowStartDate = new Date(2019, 9, 27, 0, 0, 0);
			this.test = function (assert, iStartIndex, iEndIndex, oExpectedStartDate, oExpectedEndDate) {
				// arrange
				var oNewAppPos;

				// act
				oNewAppPos = this.oPCRow._calcCreateNewAppHours(this.oRowStartDate, iStartIndex, iEndIndex);

				// assert
				assert.deepEqual(oNewAppPos.startDate, oExpectedStartDate, "startDate is ok");
				assert.deepEqual(oNewAppPos.endDate, oExpectedEndDate, "endDate is ok");
			};
		},
		afterEach: function () {
			this.oPCRow.destroy();
			this.oPCRow = null;
		}
	});

	QUnit.test("startIndex and endIndex are on the same side of DST (inside): startIndex = 0, endIndex = 2", function (assert) {
		this.test(assert, 0, 1, this.oRowStartDate, new Date(2019, 9, 27, 1, 0, 0));
	});

	QUnit.test("startIndex and endIndex are on the same side of DST (outside): startIndex = 10, endIndex = 12", function (assert) {
		this.test(assert, 10, 11, new Date(2019, 9, 27, 5, 0, 0), new Date(2019, 9, 27, 6, 0, 0));
	});

	QUnit.test("startIndex and endIndex are on the different sides of DST (inside-outside): startIndex = 6, endIndex = 7", function (assert) {
		this.test(assert, 6, 7, new Date(2019, 9, 27, 3, 0, 0), new Date(2019, 9, 27, 4, 0, 0));
	});

	QUnit.test("startIndex and endIndex are on the different sides of DST (inside-outside): startIndex = 6, endIndex = 7", function (assert) {
		this.test(assert, 4, 9, new Date(2019, 9, 27, 2, 0, 0), new Date(2019, 9, 27, 5, 0, 0));
	});

	QUnit.module("Create Appointments: _calcCreateNewAppDays", {
		beforeEach: function () {
			this.oPCRow = new PlanningCalendar();
			this.oRowStartDate = new Date(2017, 10, 13, 0, 0, 0);
			this.test = function (assert, iStartIndex, iEndIndex, oExpectedStartDate, oExpectedEndDate) {
				// arrange
				var oNewAppPos;

				// act
				oNewAppPos = this.oPCRow._calcCreateNewAppDays(this.oRowStartDate, iStartIndex, iEndIndex);

				// assert
				assert.deepEqual(oNewAppPos.startDate, oExpectedStartDate, "startDate is ok");
				assert.deepEqual(oNewAppPos.endDate, oExpectedEndDate, "endDate is ok");
			};
		},
		afterEach: function () {
			this.oPCRow.destroy();
			this.oPCRow = null;
		}
	});

	QUnit.test("startIndex and endIndex are the same: indexes = 0 - (1 day event at the beginning of the row)", function (assert) {
		this.test(assert, 0, 0, this.oRowStartDate, new Date(2017, 10, 14));
	});

	QUnit.test("startIndex and endIndex are the same: indexes = 3 - (1 day event in 3 days from the row's startDate)", function (assert) {
		this.test(assert, 3, 3, new Date(2017, 10, 16), new Date(2017, 10, 17));
	});

	QUnit.test("startIndex is lower than the endIndex: startIndex = 0, endIndex = 1 - (2 day event at the beginning of the row)", function (assert) {
		this.test(assert, 0, 1, this.oRowStartDate, new Date(2017, 10, 15));
	});

	QUnit.test("startIndex is lower than the endIndex: startIndex = 3, endIndex = 6 - (4 days event in 3 days from the row's startDate)", function (assert) {
		this.test(assert, 3, 6, new Date(2017, 10, 16), new Date(2017, 10, 20));
	});

	QUnit.test("startIndex is greater than the end Index: startIndex = 1, endIndex = 0 -  (1 day event at the beginning of the row)", function (assert) {
		this.test(assert, 1, 0, this.oRowStartDate, new Date(2017, 10, 14));
	});

	QUnit.test("startIndex is greater than the end Index: startIndex = 6, endIndex = 3 - (3 days event in 3 days from the row's startDate)", function (assert) {
		this.test(assert, 6, 3, new Date(2017, 10, 16), new Date(2017, 10, 19));
	});

	QUnit.module("Create Appointments: _calcCreateNewAppMonths", {
		beforeEach: function () {
			this.oPCRow = new PlanningCalendar();
			this.oRowStartDate = new Date(2017, 10, 13, 0, 0, 0);
			this.test = function (assert, iStartIndex, iEndIndex, oExpectedStartDate, oExpectedEndDate) {
				// arrange
				var oNewAppPos;

				// act
				oNewAppPos = this.oPCRow._calcCreateNewAppMonths(this.oRowStartDate, iStartIndex, iEndIndex);

				// assert
				assert.deepEqual(oNewAppPos.startDate, oExpectedStartDate, "startDate is ok");
				assert.deepEqual(oNewAppPos.endDate, oExpectedEndDate, "endDate is ok");
			};
		},
		afterEach: function () {
			this.oPCRow.destroy();
			this.oPCRow = null;
		}
	});

	QUnit.test("startIndex and endIndex are the same: indexes = 0 - (1 month event at the first day of beginning of the row)", function (assert) {
		this.test(assert, 0, 0, new Date(2017, 10, 1), new Date(2017, 11, 1));
	});

	QUnit.test("startIndex and endIndex are the same: indexes = 3 - (1 month event in 3 months from the row's startDate)", function (assert) {
		this.test(assert, 3, 3, new Date(2018, 1, 1), new Date(2018, 2, 1));
	});

	QUnit.test("startIndex is lower than the endIndex: startIndex = 0, endIndex = 1 - (2 months event at the first day of beginning of the row)", function (assert) {
		this.test(assert, 0, 1, new Date(2017, 10, 1), new Date(2017, 12, 1));
	});

	QUnit.test("startIndex is lower than the endIndex: startIndex = 3, endIndex = 6 - (4 months event in 3 months from the row's startDate)", function (assert) {
		this.test(assert, 3, 6, new Date(2018, 1, 1), new Date(2018, 5, 1));
	});

	QUnit.test("startIndex is greater than the end Index: startIndex = 1, endIndex = 0 -  (1 month event at the first day of beginning of the row)", function (assert) {
		this.test(assert, 1, 0, new Date(2017, 10, 1), new Date(2017, 11, 1));
	});

	QUnit.test("startIndex is greater than the end Index: startIndex = 6, endIndex = 3 - (3 months event in 3 months from the row's startDate)", function (assert) {
		this.test(assert, 6, 3, new Date(2018, 1, 1), new Date(2018, 4, 1));
	});

	QUnit.module("headerContent + binding");

	QUnit.test("headerContent is rendered properly in a js view", function(assert) {
		// Prepare
		var oModel = new JSONModel(),
			oPC = new PlanningCalendar(),
			oRow = new PlanningCalendarRow(oPC.getId() + "-Row", {
				icon: "sap-icon://employee",
				title: "Angela Merker",
				text: "Angela",
				tooltip: "Header tooltip",
				headerContent: {
					path: '/',
					template: new sap.m.ObjectListItem({
						title: "{title}",
						intro: "{intro}"
					})
				}
			}),
			oRowHead,
			oRowCustomHead;

		// Act
		oModel.setData([{
			title: "Alfonso",
			intro: "headerContent aggregation"
		}]);
		oPC.setModel(oModel);
		oPC.addRow(oRow);

		oRowHead = sap.ui.getCore().byId(oRow.getId() + "-Head");
		oRowCustomHead = sap.ui.getCore().byId(oRow.getId() + "-CustomHead");

		// Assert
		assert.equal(oRowHead, undefined, "when there's headerContent, it creates only '-CustomHead' instance");
		assert.equal(oRowCustomHead.getContent()[0].getTitle(), "Alfonso", "when there's headerContent, the content is set accordingly");

		// Destroy
		oPC.destroy();
	});

	QUnit.test("headerContent is rendered properly in a xml view", function (assert) {
		// Prepare
		var oPC,
			oModel = new JSONModel(),
			sXMLText =
				'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc">' +
				'	<PlanningCalendar id="pc" rows="{/people}">' +
				'		<rows id="idRow">' +
				'			<PlanningCalendarRow headerContent="{path : \'headerContent\', templateShareable: \'true\'}">' +
				'				<headerContent>' +
				'				<ObjectListItem title="{title}"/>' +
				'				</headerContent>' +
				'			</PlanningCalendarRow>' +
				'		</rows>' +
				'	</PlanningCalendar>' +
				'</mvc:View>',
			oView = sap.ui.xmlview({viewContent: sXMLText});

		oModel.setData({
			people: [{
				pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
				name: "John Miller",
				role: "team member",
				headerContent: [{
					title: "Alfonso",
					intro: "headerContent aggregation"
				}]
			}]
		});
		oView.setModel(oModel);
		oView.placeAt("bigUiArea");
		sap.ui.getCore().applyChanges();
		oPC = oView.byId("pc");

		// Assert
		assert.deepEqual(oPC.getRows()[0].getHeaderContent()[0].getTitle(), "Alfonso", "headerContent is successfully binded");

		//Destroy
		oView.destroy();
	});

	QUnit.test("PlanningCalendarRowHeader overides getIconDensityAware to return always false", function(assert) {
		// Prepare
		var oPC = new PlanningCalendar(),
			oRow = new PlanningCalendarRow(oPC.getId() + "-Row", {
				icon: "sap-icon://employee",
				title: "Angela Merker",
				text: "Angela",
				tooltip: "Header tooltip"
			}),
			oRowHead;

		// Act
		oPC.addRow(oRow);

		oRowHead = sap.ui.getCore().byId(oRow.getId() + "-Head");

		// Assert
		assert.equal(oRowHead.getIconDensityAware(), false, "icon density aware should be false");

		// Destroy
		oPC.destroy();
	});

	return waitForThemeApplied();
});