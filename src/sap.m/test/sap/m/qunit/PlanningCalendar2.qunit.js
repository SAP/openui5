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
		// CalendarRowInPCRenderer renderer is not exposed to the public, so obtain it via its parent
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
						null, // View key
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
						null, // View key
						this.oLegendWithItemsTypes01UpToTypes10,
						aSpecialDates,
						[new PlanningCalendarRow({
							icon: "sap-icon://employee",
							title: "Max Mustermann",
							text: "Musterteam",
							tooltip: "Header tooltip",
							appointments: aAppointments
						})]),
					aAppointmentsWithLegend = aAppointments.slice(0, 10), // used legend has items for types01 to types10
					aAppointmentsWithoutLegend = aAppointments.slice(10),
					aSpecialDatesWithLegend = aSpecialDates.slice(0, 10), // used legend has items for types01 to types10
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

	QUnit.test("with custom view and 'viewKey' comes from data binding", function(assert) {
		// prepare
		var oModel = new JSONModel();
		oModel.setData({
			startDate: new Date("2018", "6", "9"),
			viewKey: CalendarIntervalType.Day
		});

		var oPC = new PlanningCalendar({
			startDate: "{/startDate}",
			viewKey: "{/viewKey}",
			views: [
				new PlanningCalendarView({
					key: PlanningCalendarBuiltInView.Day
				}),
				new PlanningCalendarView({
					key: PlanningCalendarBuiltInView.Month
				})
			]
		}).setModel(oModel).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// act
		// assert
		assert.ok(true, "Error is not thrown");

		// cleanup
		oPC.destroy();
	});

	QUnit.test("Error should be thrown if view with key equal to 'viewKey' value doesn't exist", function(assert) {
		// prepare
		var sKey = "NotTestView",
			oPC = new PlanningCalendar({
				startDate: new Date("2018", "6", "9"),
				viewKey: sKey,
				views: [
					new PlanningCalendarView({
						key: "TestView"
					})
				]
			}),
			oExpectedError = new Error("PlanningCalendarView with key " + sKey + " not assigned " + oPC);

		// act
		// assert
		assert.throws(
			function() {
				oPC.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			oExpectedError,
			"throws correct Error object"
		);

		// cleanup
		oPC.destroy();
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
		assert.equal(aAppInfos[2]._getDateRangeIntersectionText(oCurrentlyDisplayedDate).start, "until");
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