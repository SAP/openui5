/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/CalendarLegendRenderer",
	"sap/m/PlanningCalendarLegend",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/library",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery",
	"sap/m/SearchField",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/ObjectListItem",
	"sap/m/PlanningCalendarRow",
	"sap/m/PlanningCalendar",
	"sap/m/Text",
	"sap/ui/Device",
	"sap/m/PlanningCalendarView",
	"sap/ui/unified/calendar/OneMonthDatesRow",
	"sap/ui/unified/calendar/DatesRow",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/InvisibleText",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/core/Locale"
], function(
	qutils,
	createAndAppendDiv,
	JSONModel,
	CalendarDate,
	DateRange,
	DateTypeRange,
	CalendarLegendRenderer,
	PlanningCalendarLegend,
	CalendarAppointment,
	CalendarLegendItem,
	unifiedLibrary,
	DateFormat,
	jQuery,
	SearchField,
	Button,
	mobileLibrary,
	ObjectListItem,
	PlanningCalendarRow,
	PlanningCalendar,
	Text,
	Device,
	PlanningCalendarView,
	OneMonthDatesRow,
	DatesRow,
	coreLibrary,
	Control,
	XMLView,
	InvisibleText,
	KeyCodes,
	Core,
	Locale
) {
	"use strict";

	// set language to en-GB, since we have specific language strings tested
	Core.getConfiguration().setLanguage("en_GB");

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;


	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	// shortcut for sap.ui.unified.CalendarIntervalType
	var CalendarIntervalType = unifiedLibrary.CalendarIntervalType;

	createAndAppendDiv("verySmallUiArea").style.width = "300px";
	createAndAppendDiv("smallUiArea").style.width = "600px";
	createAndAppendDiv("bigUiArea").style.width = "1024px";

	var oFormatYyyyMMddHHmm = DateFormat.getInstance({pattern: "yyyyMMddHHmm"}),
		oFormatYyyyMMdd = DateFormat.getInstance({pattern: "yyyyMMdd"}),
		/*the SUT won't be destroyed when single test is run*/
		bSkipDestroy = new URLSearchParams(window.location.search).has("testId");

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
					startDate: new Date(2015, 0, 4, 12, 0),
					endDate: new Date(2015, 0, 4, 14, 0),
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
			primaryCalendarType: "Islamic"
		});
		if (sViewKey) {
			oTC.setViewKey(sViewKey);
		}

		return oTC;
	};

	var _switchToView = function(sViewName, oPC) {
		var oRb = Core.getLibraryResourceBundle("sap.m"),
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
		QUnit.assert.ok(sViewI18Name, "There must be internationalized string corresponding to the viewName " + sViewName);
		sIntervalTypeDropdownId = oPC.getId() + "-Header-ViewSwitch-select";
		oViewSwitch = Core.byId(sIntervalTypeDropdownId);
		aItemsToSelect = oViewSwitch.getItems().filter(function(item) {
			return item.getText().toLowerCase() === sViewI18Name.toLowerCase();
		});
		if (aItemsToSelect.length !== 1) {
			sErrMsg = "Cannot switch to view " + sViewName;
				QUnit.assert.ok(false, sErrMsg);
				throw sErrMsg;
			}
		oViewSwitch.setSelectedItem(aItemsToSelect[0]);
		oViewSwitch.fireChange({ selectedItem: aItemsToSelect[0] });
	};

	var _clickTodayButton = function(oPC) {
		var sTodayButtonId = _getTodayButton.call(this, oPC).getId();
		qutils.triggerEvent("tap", sTodayButtonId);
		Core.applyChanges();
	};

	var _getTodayButton = function(oPC) {
		return Core.byId(oPC.getId() + "-Header-NavToolbar-TodayBtn");
	};

	//Verifies that given Date is "displayed" in the Planning Calendar
	var _assertDateIsVisible = function(oDate, oPC, sMessagePrefix) {
		var that = this;

		function convertDate2DomId(oDate, sPrefix) {
			return sPrefix + "-" + oDate.getFullYear() + _padTo10.call(that, oDate.getMonth() + 1) + _padTo10.call(that, oDate.getDate());
		}

		var sDayId = convertDate2DomId(oDate, oPC.getId() + "-" + _getIntervalId.call(this, oPC));

		QUnit.assert.equal(jQuery("#" + sDayId).length, 1, sMessagePrefix + ": Date " + _formatDate.call(this, oDate) + " should be visible (" + sDayId + ")");
	};

	var _formatDate = function(oDate) {
		return DateFormat.getDateInstance({pattern: "dd.MM.yyyy", calendarType: "Islamic"}).format(oDate);
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
			case "OneMonth":
				return "OneMonthsRow";
			default:
				throw "Unknown viewKey:" + oPC.getViewKey();
		}
	};

	var _navBackward = function(oPC) {
		var sIdBackButton = oPC.getId() + "-Header-NavToolbar-PrevBtn";
		qutils.triggerEvent("tap", sIdBackButton);
		Core.applyChanges();
	};

	var _navForward = function(oPC) {
		var  sIdForwardButton = oPC.getId() + "-Header-NavToolbar-NextBtn";
		qutils.triggerEvent("tap", sIdForwardButton);
		Core.applyChanges();
	};

	var _navFocusNext = function(oTarget) {
		qutils.triggerKeydown(oTarget.id, "ARROW_RIGHT");
		Core.applyChanges();
		return this.oPC2Interval._oItemNavigation.getFocusedDomRef();
	};

	var _navFocusPrev = function(oTarget) {
		qutils.triggerKeydown(oTarget.id, "ARROW_LEFT");
		Core.applyChanges();
		return this.oPC2Interval._oItemNavigation.getFocusedDomRef();
	};


	var _assertFocus = function(oTarget) {
		QUnit.assert.strictEqual(document.activeElement.id, oTarget && oTarget.id, "Element with id: " + oTarget.id + " should be focused");
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
				case "OneMonth":
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
				case "OneMonth":
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
			this.o10Feb2016 = new Date(2016, 4, 10);
			this.oPC = createPlanningCalendar("oneMonthPlanningCalendar", oSearchField, oButton, this.o14Sep2016MidOfMonth,
				CalendarIntervalType.OneMonth);
			this.oPC.placeAt("bigUiArea");
			Core.applyChanges();
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

			QUnit.assert.ok(jQuery("#" + sIntervalId).hasClass(sCSSClass), "Interval " + iInterval + " should have class " + sCSSClass + " applied");
		},

		_getFirstRow: function(oPC) {
			return oPC.getAggregation("table").getItems()[0].getCells()[1];
		},

		_get1stInNextMonth: function(oDate) {
			var oNext = CalendarDate.fromLocalJSDate(oDate, "Islamic");

			oNext.setMonth(oNext.getMonth() + 1);
			oNext.setDate(1);

			return oNext.toLocalJSDate();
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
			Core.applyChanges();
		},

		_clickAppointment: function(oAppointment) {
			oAppointment.$().trigger('tap');
			Core.applyChanges();
		}
	});

	QUnit.test('OneMonth item is in the select', function(assert) {
		//act and assert
		_switchToView.call(this, CalendarIntervalType.OneMonth, this.oPC);
	});

	QUnit.test('interval shows 31 days', function(assert) {
		//assert
		assert.equal(this.oPCInterval.getStartDate().getMonth(), 8, 'it is Dhul-Qidah');
		assert.equal(this.oPCInterval.getDays(), 31, 'interval has 31 days in the view');
	});

	QUnit.test('start day is the first day of the month', function(assert) {
		//assert
		assert.equal(this.oPCInterval.getStartDate().getMonth(), 8, 'it is Dhul-Qidah');
		assert.equal(this.oPCInterval.getStartDate().getDate(), 4, 'interval starts at 1st of september');

		this.oPC.setStartDate(this._get1stInNextMonth(this.oPC.getStartDate()));

		//assert
		assert.equal(this.oPCInterval.getStartDate().getMonth(), 9, 'it is Dhul-Hijjah');
		assert.equal(this.oPCInterval.getStartDate().getDate(), 3, 'interval starts at 1st of june');
	});

	QUnit.test('last days belong to the next month', function(assert) {
		//assert
		var oDate1 = this._get1stInNextMonth(this.o14Sep2016MidOfMonth);

		_assertDateIsVisible.call(this, oDate1, this.oPC, '');
	});

	QUnit.test('last days look different', function(assert) {
		//assert
		this._assertIntervalHasClass(31, this.oPC, 'sapUiCalItemOtherMonth'); //check that Oct 1 is disabled
	});

	QUnit.test('intervalSelect fires correctly', function(assert) {
		var oRow = this._getFirstRow(this.oPC);
		var eventParams = {};

		var fnCalendarIntervalSelect = this.spy();
		this.oPC.attachIntervalSelect(fnCalendarIntervalSelect);

		oRow.attachIntervalSelect(function(oEvent) {
			eventParams = oEvent.getParameters();
		});

		//act
		this._clickInterval(oRow, 31); //click first row of next month's first day

		//assert
		assert.equal(eventParams.startDate.getMonth(), 9, 'start date is Dhul-Hijjah');
		assert.equal(eventParams.startDate.getDate(), 4, 'start date is 1st day of the month');

		assert.equal(eventParams.endDate.getMonth(), 9, 'end date is in Dhul-Hijjah');
		assert.equal(eventParams.endDate.getDate(), 4, 'end date is 1st day of the month');

		assert.equal(eventParams.subInterval, false, 'selected interval is not a sub-interval');
		assert.ok(fnCalendarIntervalSelect.notCalled,
			"intervalSelect was not fired on the calendar because the click was on the next month's first days and this serves as navigation, not selection");
	});

	QUnit.test('last days intervals navigate to the next month', function(assert) {
		//act
		this._clickInterval(this._getFirstRow(this.oPC), 31); //click first row of next month's first day - 1 Oct 2016

		//assert
		assert.equal(this.oPC.getStartDate().getMonth(), 8, 'month changed to Dhul-Hijjah');
	});

	QUnit.test('navigate backward with the arrows', function(assert) {
		//act
		_navBackward.call(this, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getMonth(), 7, 'month changed to Shawwal');
		assert.equal(this.oPC.getStartDate().getDate(), 5, 'start date is 1st');
	});

	QUnit.test('navigate forward with the arrows', function(assert) {
		//act
		_navForward.call(this, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getMonth(), 9, 'month changed to Dhul-Hijjah');
		assert.equal(this.oPC.getStartDate().getDate(), 3, 'start date is 1st');
	});

	QUnit.test('clicking today navigates to todays month', function(assert) {
		var oFakeNow = new Date(2016, 8, 10),
			clock = sinon.useFakeTimers(oFakeNow.getTime());

		this.oPC.setStartDate(new Date(2016, 5, 1));

		//act
		_clickTodayButton.call(this, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getFullYear(), oFakeNow.getFullYear(), 'year is correct');
		assert.equal(this.oPC.getStartDate().getMonth(), oFakeNow.getMonth(), 'month is correct');
		assert.equal(this.oPC.getStartDate().getDate(), 4, 'date is correct');
		assert.strictEqual(document.activeElement.id, "oneMonthPlanningCalendar-OneMonthsRow-20160910", "Correct DOM element is focused");

		//cleanup
		clock.restore();
	});

	QUnit.test('switch to hours view shows the first hours of the month', function(assert) {
		//act
		_switchToView.call(this, CalendarIntervalType.Hour, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getFullYear(), 2016, 'year is the same');
		assert.equal(this.oPC.getStartDate().getMonth(), 8, 'month is the same');
		assert.equal(this.oPC.getStartDate().getDate(), 4, 'date is 1st');
		assert.equal(this.oPC.getStartDate().getHours(), 0, 'starts from midnight');
	});

	QUnit.test('switch to days view starts from 1st', function(assert) {
		//act
		_switchToView.call(this, CalendarIntervalType.Day, this.oPC);

		//assert
		assert.equal(this.oPC.getStartDate().getFullYear(), 2016, 'year is the same');
		assert.equal(this.oPC.getStartDate().getMonth(), 8, 'month is the same');
		assert.equal(this.oPC.getStartDate().getDate(), 4, 'date is 1st');
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
		Core.applyChanges();

		// assert
		assert.equal(this.oPC.getAggregation("table").getSticky().length, 2, "sticky property should be set on the info bar and on the toolbar inside Table");
	});

	QUnit.test("Has sticky header on phone size", function (assert) {
		//Prepare
		this.oPC.setStickyHeader(true);
		_switchToView.call(this, CalendarIntervalType.Month, this.oPC);

		this.stub(Device, "system").value({desktop: false, phone: true, tablet: false});
		var orientationStub = this.stub(Device, "orientation").value({portrait: true, landscape: false});

		//act
		this.oPC._updateStickyHeader();

		// assert
		assert.ok(this.oPC.getAggregation("table").getSticky().indexOf("InfoToolbar") > -1, "sticky property should be set on the info bar only");
		assert.ok(this.oPC.getAggregation("table").getSticky().indexOf("HeaderToolbar") === -1, "sticky property shouldn't be set on the toolbar");

		// explicitly restore Device.orientation to avoid error during oPC.destroy
		orientationStub.restore();
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
			this.oDeviceJsStub = this.stub(Device, "system").value({phone: true});
			jQuery("html").addClass("sapUiMedia-Std-Phone sapUiMedia-StdExt-Phone");
			jQuery("html").removeClass("sapUiMedia-Std-Desktop sapUiMedia-StdExt-Desktop");
		},
		_restoreDesktopEnvironment: function () {
			this.oDeviceJsStub.restore();
			jQuery("html").addClass("sapUiMedia-Std-Desktop sapUiMedia-StdExt-Desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Phone sapUiMedia-StdExt-Phone");
		},
		_createCalendar: function (oStartDate) {
			this._iRenderingCount = 0;
			this._oPC = createPlanningCalendar("_oPC", new SearchField(), new Button(), (oStartDate || this.o14Sep2016MidOfMonth), CalendarIntervalType.OneMonth);
			this._oPC.addEventDelegate({
				onAfterRendering: function() { this._iRenderingCount++; }
			}, this);
			this._oPC.placeAt("smallUiArea");
			this._oPCOneMonthsRow = this._oPC.getAggregation('table').getAggregation('infoToolbar').getContent()[1];
			Core.applyChanges();
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
		assert.strictEqual(this._oPC.getStartDate().getTime(), new Date(2016, 8, 4).getTime(), "The correct date is auto adjusted for the first day of month");
	});

	QUnit.module("ARIA", {
		beforeEach: function(assert) {

			this.sOldLanguage = Core.getConfiguration().getLanguage();
			Core.getConfiguration().setLanguage("en-US");//due to text strings for built-in CalendarDayType texts

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

			this._testAriaAppointmentsAndSpecialDatesIfLegendIsDestroyed = function(sIntervalType, fnExtendSut, oPCStartDate) {
				//Prepare
				var sMessagePrefix = "After legend is destroyed",
					aAppointments = _createAppointmentsOfTypes(1, 20, new Date(2015, 0, 4, 19)),
					aSpecialDates = _createSpecialDates(1, 20,  sIntervalType, oPCStartDate || new Date(2015, 0, 4, 19)),
					oSut = createPlanningCalendar("accPC-LegendDestoyed", new SearchField(), new Button(),
						new Date(2015, 0, 4, 19),
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
				Core.applyChanges();

				//Act
				this.oLegendWithItemsTypes01UpToTypes10.destroy();
				Core.applyChanges();

				//Assert
				//Appointments

				this.assertAppointmentsWithoutConnectedLegendHaveDefaultAriaLabelledBy(aAppointments, sMessagePrefix);

				//Special Dates
				this.assertSpecialDatesWithoutConnectedLegendHaveDefaultAriaDescribedBy(aSpecialDates, oSut, sMessagePrefix);

				//Cleanup
				this.destroySut(oSut);
			};

			this._testAriaAppointmentsAndSpecialDates = function(sIntervalType, fnExtendSut, oPCStartDate) {
				//Prepare
				var sMessagePrefix = "Initial legend is available",
					aAppointments = _createAppointmentsOfTypes(1, 20, new Date(2015, 0, 4, 19)),
					aSpecialDates = _createSpecialDates(1, 20,  sIntervalType, oPCStartDate || new Date(2015, 0, 4, 19)),
					oSut = createPlanningCalendar("accPC", new SearchField(), new Button(),
						new Date(2015, 0, 4, 19),
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
				Core.applyChanges();

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
			Core.getConfiguration().setLanguage(this.sOldLanguage);
		}
	});

	QUnit.test("Week day and date aria", function(assert) {
		//Prepare
		var oSut = createPlanningCalendar("PC", new SearchField(), new Button(), new Date(2015, 0, 1)),
			oFormatDate = DateFormat.getInstance({style: "long", calendarType: "Islamic"}),
			oDate = new CalendarDate(2015, 0, 2, CalendarType.Islamic),
			sAriaDate = oFormatDate.format(oDate.toUTCJSDate(), true),
			aWeekDaysWide = oFormatDate.oLocaleData.getDaysStandAlone("wide", "Islamic"),
			sWeekDayAriaText = aWeekDaysWide[5],
			sExpectedAria = sWeekDayAriaText + " " + sAriaDate;

		//Act
		oSut.setViewKey(CalendarIntervalType.Day);
		oSut.placeAt("bigUiArea");
		Core.applyChanges();

		//Assert
		assert.strictEqual(jQuery("#" + oSut.getId() + "-DatesRow-20150102").attr("aria-label"), sExpectedAria,
			"Correct week day and date aria are written");

		// Clean up
		oSut.destroy();
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
			Core.applyChanges();
			this.oPC2Interval = this.oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
		},
		afterEach: function() {
			if (!bSkipDestroy) {
				this.oPC2.destroy();
			}
		},
		_getChangeMonthButtonText : function(oPC) {
			return jQuery("#" + oPC.getId() + "-Header-NavToolbar-PickerBtn").text();
		},

		_assertDatesAreVisible: function(aDates, oPC, sMessagePrefix) {
			var sDaysSelector = oPC.getId() + "-" + _getIntervalId.call(this, oPC),
				iAvailableDays = jQuery('#' + sDaysSelector).find(".sapUiCalItem").length,
				oFirstDate = aDates[0],
				oLastDate = aDates[aDates.length - 1],
				sExpectedDateRange = _formatDate.call(this, oFirstDate) + "-" + _formatDate.call(this, oLastDate),
				sResult;

			sMessagePrefix += ": expected dates: " + sExpectedDateRange;

			QUnit.assert.equal(iAvailableDays, aDates.length, sMessagePrefix + ": Planning Calendar should show certain amount of days: ");
			sResult = DateFormat.getDateInstance({format: "yMMMMd", calendarType: "Islamic"}).format(oFirstDate) + " - " + DateFormat.getDateInstance({format: "yMMMMd", calendarType: "Islamic"}).format(oLastDate);

			QUnit.assert.equal(this._getChangeMonthButtonText.call(this, oPC), sResult, sMessagePrefix + ": Change month button should have certain text of " +
				sResult + ", current text: " + this._getChangeMonthButtonText.call(this, oPC));

			aDates.forEach(function (oDate) {
				_assertDateIsVisible.call(this, oDate, oPC, sMessagePrefix);
			}.bind(this));
		},

		//Verifies that given Date is "displayed" in the Planning Calendar
		_assertDateIsVisible: function(oDate, oPC, sMessagePrefix) {
			var that = this;

			function convertDate2DomId(oDate, sPrefix) {
				return sPrefix + "-" + oDate.getFullYear() + _padTo10.call(that, oDate.getMonth() + 1) + _padTo10.call(that, oDate.getDate());
			}

			var sDayId = convertDate2DomId(oDate, oPC.getId() + "-" + _getIntervalId.call(this, oPC));
			QUnit.assert.equal(jQuery("#" + sDayId).length, 1, sMessagePrefix + ": Date " + _formatDate.call(this, oDate) + " should be visible (" + sDayId + ")");
		},

		_formatDateHour: function(oDate) {
			return DateFormat.getDateInstance({pattern: "dd.MM.yyyy hh:mm", calendarType: "Islamic"}).format(oDate);
		},

		_assertHoursAreVisible: function(aDates, oPC, sMessagePrefix) {
			var iAvailableDays = jQuery('#' + oPC.getId() + "-" + _getIntervalId.call(this, oPC) + "-times").children().length,
				sExpectedDateRange = this._formatDateHour.call(this, aDates[0]) + "-" + this._formatDateHour.call(this, aDates[aDates.length - 1]);

			sMessagePrefix += ": expected hours: " + sExpectedDateRange;
			QUnit.assert.equal(iAvailableDays, aDates.length, sMessagePrefix + ": Planning Calendar should show certain amount of hours: ");

			aDates.forEach(function (oDate) {
				this._assertHourIsVisible.call(this, oDate, oPC, sMessagePrefix);
			}.bind(this));
		},

		_assertHourIsVisible: function(oDate, oPC, sMessagePrefix) {
			var that = this;

			function convertHourInDate2DomId(oDate, sPrefix) {
				return sPrefix + "-" + oDate.getFullYear() + _padTo10.call(that, oDate.getMonth() + 1) + _padTo10.call(that, oDate.getDate()) + _padTo10.call(that, oDate.getHours()) + "00";
			}

			var sHourInDayId = convertHourInDate2DomId(oDate, oPC.getId() + "-" + _getIntervalId.call(this, oPC));
			QUnit.assert.equal(jQuery("#" + sHourInDayId).length, 1, sMessagePrefix + ": Hour " + this._formatDateHour.call(this, oDate) + " should be visible (" + sHourInDayId + ")");
		}
	});

	QUnit.test("keyboard navigation", function(assert) {
		// test here only interaction between rows, other things are tested on CalendarRow
		var fnDone = assert.async();

		jQuery("#PC1-R1A1").trigger("focus");
		assert.equal(document.activeElement.id, "PC1-R1A1", "Appointment1 focused");
		qutils.triggerKeydown("PC1-R1A1", "END");
		assert.equal(document.activeElement.id, "PC1-R2A1", "Appointment1 focused");

		qutils.triggerKeydown("PC1-R2A1", "HOME");
		Core.applyChanges();

		setTimeout(function(){
			assert.equal(document.activeElement.id, "PC1-R1A2", "Appointment2 focused");
			qutils.triggerKeydown("PC1-R1A1", "ARROW_DOWN");
			assert.equal(document.activeElement.id, "PC1-R2A1", "Appointment1 focused");
			qutils.triggerKeydown("PC1-R1A1", "ARROW_UP");
			Core.applyChanges();
			assert.equal(document.activeElement.id, "PC1-R1A2", "Appointment2 focused");
			fnDone();
		}, 0);

	});


	QUnit.test("keyboard navigation HOME & END for 1 Month view", function(assert) {
		_switchToView(CalendarIntervalType.OneMonth, this.oPC2);
		this.oPC2.setStartDate(this.o1Sep2016MidOfWeek);
		this.oPC2.rerender();
		var sMonthIdPrefix = this.oPC2.getId() + "-OneMonthsRow-";

		jQuery("#" +  sMonthIdPrefix + "20160901").trigger("focus");
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160901", "28th of Dhu'l-Q focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160901", "END");
		Core.applyChanges();
		assert.equal(document.activeElement.id,  sMonthIdPrefix + "20160930", "27th of Dhu'l-Q focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160930", "HOME");
		Core.applyChanges();
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160901", "27th of Dhu'l-Q focused focused");

		jQuery("#" +  sMonthIdPrefix + "20160910").trigger("focus");
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160901", "7th of Dhu'l-H focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160901", "END");
		Core.applyChanges();
		assert.equal(document.activeElement.id,  sMonthIdPrefix + "20160930", "27th of Dhu'l-H focused");
	});

	QUnit.test("When start date is defined the planning calendar should shift to the first day of the week that includes the start date ", function(assert) {
		//assert initial state
		this._assertDatesAreVisible.call(this, [
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
		Core.applyChanges();

		//assert
		this._assertDatesAreVisible.call(this, [
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
		this._assertDatesAreVisible.call(this, [
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
		this._assertDatesAreVisible.call(this, [
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

		//Assert
		assert.equal(this.oPC2._getHeader()._oPrevBtn.getEnabled(), false, "Back Arrow Is Disabled");

		//Arrange
		this.oPC2.setMaxDate(new Date(2222,22,22,22,22,22));
		this.oPC2.setStartDate(new Date(2222,22,22,22,22,22));
		this.oPC2._dateNav.setCurrent(new Date(2222,22,22,22,22,22));

		//Assert
		assert.equal(this.oPC2._getHeader()._oNextBtn.getEnabled(), false, "Forward Arrow Is Disabled");

		//Clean
		this.oPC2.setStartDate(oStartDate);
		this.oPC2._dateNav.setCurrent(oStartDate);
	});

	QUnit.test("Selected date is in visible range after navigation", function(assert){
		this.oPC2._dateNav.setCurrent(new Date(2016, 8, 2));
		this.oPC2.setStartDate(new Date());
		this.oPC2._applyArrowsLogic();

		assert.ok(1, "Error is not thrown.");
	});

	QUnit.test("previous button when minDate >= current view start date initially", function(assert) {
		// arange
		var oPC = new PlanningCalendar({
			viewKey: "One Month",
			startDate: new Date(2019, 11, 6),
			minDate: new Date(2019, 11, 1)
		}).placeAt("qunit-fixture");
		Core.applyChanges();

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
		Core.applyChanges();

		// act
		oPC._getHeader()._oTodayBtn.firePress();
		Core.applyChanges();

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
		Core.applyChanges();

		// act
		oPC._getHeader()._oPrevBtn.firePress();
		Core.applyChanges();

		// assert
		assert.strictEqual(
			oPC._getHeader()._oPrevBtn.getEnabled(),
			false,
			"previous button is disabled");

		// clean
		oPC.destroy();
	});

	QUnit.test("Navigation backward via keyboard left arrow (outside the current visible area)", function(assert) {
		var aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem"),
			oNextTarget = aDays[0],
			oSelf = this,
			fnDone = assert.async();
		//Focus 29th of Aug (week 29 Aug - 4 Sep), 2016 and move left via keyboard 4 times, expect 22 -28 Aug 2016
		//act
		aDays[0].focus();
		Core.applyChanges();
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
							this._assertDatesAreVisible.call(oSelf, [
								new Date(2016, 7, 22),
								new Date(2016, 7, 23),
								new Date(2016, 7, 24),
								new Date(2016, 7, 25),
								new Date(2016, 7, 26),
								new Date(2016, 7, 27),
								new Date(2016, 7, 28)
							], oSelf.oPC2, "Navigated to the correct viewport");
							fnDone();
						}.bind(this), 0);
					}.bind(this), 0);
				}.bind(this), 0);
			}.bind(this), 0);
		}.bind(this), 0);
	});

	QUnit.test("Navigation backward via keyboard left arrow (outside the current visible area) at the border of the DST (Nov->Oct)", function(assert) {
		//prepare
		var oOriginalFormatLocale = Core.getConfiguration().getFormatSettings().getFormatLocale(),
			sOriginalFormatLocale = oOriginalFormatLocale.getLanguage() + "_" +  oOriginalFormatLocale.getRegion(),
			aDays,
			oNextTarget,
			oSelf = this,
			fnDone = assert.async();

		Core.getConfiguration().setFormatLocale("en-GB");
		this.oPC2.setStartDate(new Date("2014", "10", "5", "08", "00"));
		this.oPC2.rerender();

		aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem");
		oNextTarget = aDays[0];

		//Act - focus 2nd of Nov (week 02 Nov - 8 Nov), 2014 and move left via keyboard once, expect 26 Oct - 1 Nov 2014
		oNextTarget.focus();
		Core.applyChanges();
		setTimeout(function() {
			oNextTarget = _navFocusPrev.call(oSelf, oNextTarget);
			_assertFocus.call(oSelf, oNextTarget);
			this._assertDatesAreVisible.call(oSelf, [
				new Date(2014, 9, 27),
				new Date(2014, 9, 28),
				new Date(2014, 9, 29),
				new Date(2014, 9, 30),
				new Date(2014, 9, 31),
				new Date(2014, 10, 1),
				new Date(2014, 10, 2)
			], oSelf.oPC2, "Navigated to the correct viewport");
			Core.getConfiguration().setFormatLocale(sOriginalFormatLocale);
			fnDone();
		}.bind(this), 0);
	});

	QUnit.test("Navigation forward via forward button", function(assert) {
		//act
		_navForward.call(this, this.oPC2);//one week after week 29th of August 2016 - 4th of September, 2016

		//assert
		this._assertDatesAreVisible.call(this, [
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
		this._assertDatesAreVisible.call(this, [
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
		var aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem"),
			oNextTarget = aDays[aDays.length - 1],
			oSelf = this,
			fnDone = assert.async();
		//Focus 4th of Sep, 2016 (week 29 Aug-4 Sep) and move right via keyboard 4 times, expect 5 -11 Sep 2016
		//act
		aDays[aDays.length - 1].focus();
		Core.applyChanges();

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
							this._assertDatesAreVisible.call(oSelf, [
								new Date(2016, 8, 5),
								new Date(2016, 8, 6),
								new Date(2016, 8, 7),
								new Date(2016, 8, 8),
								new Date(2016, 8, 9),
								new Date(2016, 8, 10),
								new Date(2016, 8, 11)
							], oSelf.oPC2, "Navigated to the correct viewport");
							fnDone();
						}.bind(this), 0);
					}.bind(this), 0);
				}.bind(this), 0);
			}.bind(this), 0);
		}.bind(this), 0);
	});

	QUnit.test("Navigation forward via keyboard right (outside the current visible area) when in days view", function(assert) {
		//Arrange
		this.oPC2.setViewKey(CalendarIntervalType.Day);

		var oStartDate = this.oPC2.getStartDate(),
			oLastDay,
			oComparisonDate = new Date(oStartDate.getTime());

		//Act
		oComparisonDate.setDate(oComparisonDate.getDate() + 1);
		Core.applyChanges();
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
		var oSelf = this,
			fnDone = assert.async(),
			oOriginalFormatLocale = Core.getConfiguration().getFormatLocale();

		//arrange
		Core.getConfiguration().setFormatLocale('en_US');
		this.oStub3 = this.stub(Core.getConfiguration(), "getLocale").callsFake(function () {
			return new Locale("en_US");//first date of week is Sunday (JS Date.getDay() = 0)
		});
		Core.applyChanges();
		this.oPC2.setStartDate(new Date(2017, 0, 1));
		Core.applyChanges();
		this.oPC2.setViewKey(CalendarIntervalType.Week);
		Core.applyChanges();

		setTimeout(function() {
			//assert
			this._assertDatesAreVisible.call(oSelf, [
				new Date(2017, 0, 1),
				new Date(2017, 0, 2),
				new Date(2017, 0, 3),
				new Date(2017, 0, 4),
				new Date(2017, 0, 5),
				new Date(2017, 0, 6),
				new Date(2017, 0, 7)
			], oSelf.oPC2, "Navigated to 1st of January");

			//clear
			Core.getConfiguration().setFormatLocale(oOriginalFormatLocale);
			fnDone();
		}.bind(this), 0);
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
		this._assertDatesAreVisible.call(this, [
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
		Core.applyChanges();
		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-Header-NavToolbar-PickerBtn");
		Core.applyChanges();

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160902");
		$Day.trigger("focus");

		setTimeout(function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160902");
			qutils.triggerKeyboardEvent($Day.get(0), KeyCodes.ENTER, false, false, false);
			Core.applyChanges();
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
		Core.applyChanges();

		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-Header-NavToolbar-PickerBtn");
		Core.applyChanges();

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160830");

		$Day.trigger("focus");

		setTimeout(function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160830");
			qutils.triggerKeyboardEvent($Day.get(0), KeyCodes.ENTER, false, false, false);
			Core.applyChanges();

			this.oPC2Interval = oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem");
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
		Core.applyChanges();

		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-WeeksRow--Head-next");
		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-WeeksRow--Head-B1");

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-WeeksRow--Cal--Month0-20160830");

		$Day.trigger("focus");

		setTimeout(function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-WeeksRow--Cal--Month0-20160830");
			qutils.triggerKeyboardEvent($Day.get(0), KeyCodes.ENTER, false, false, false);

			this.oPC2Interval = oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem");
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

		this._assertDatesAreVisible.call(this, [
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
		assert.strictEqual(document.activeElement.id, "startDateAtTheMiddleOfTheWeek-WeeksRow-20160910", "Correct DOM element is focused");
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

		this._assertHoursAreVisible.call(this, aExpectedVisibleHours, this.oPC2,
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
		Core.applyChanges();

		iInterval = jQuery("#" + this.oPC2.getId()).outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1] ? 6 : 12;

		//assert
		if (iInterval === 12) { //Hours View large
			this._assertHoursAreVisible.call(this, [
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
			this._assertHoursAreVisible.call(this, [
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
		aWeekDays.eq(1).trigger("focus");
		Core.applyChanges();
		aWeekDays.eq(2).trigger("focus");
		Core.applyChanges();
		aWeekDays.eq(3).trigger("focus");
		Core.applyChanges();

		//assert initial state
		this._assertDatesAreVisible.call(this, [
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
		Core.applyChanges();

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
		Core.applyChanges();

		// Act
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 1, "The Hours are not changed to 00, but instead the original hours are preserved in Day view");
	});

	QUnit.test('Clicking today is updating calendars start date and Navigations current date', function(assert) {
		var oToday = new Date();
		this.oPC2.setViewKey(CalendarIntervalType.Hour);
		Core.applyChanges();

		//act
		_navBackward.call(this, this.oPC2);
		_clickTodayButton.call(this, this.oPC2);

		//assert
		assert.equal(this.oPC2._dateNav._current.getFullYear(), oToday.getFullYear(), 'year is correct');
		assert.equal(this.oPC2._dateNav._current.getMonth(), oToday.getMonth(), 'month is correct');
		assert.equal(this.oPC2._dateNav._current.getDate(), oToday.getDate(), 'date is correct');

		this.oPC2.setViewKey(CalendarIntervalType.Week);
	});

	QUnit.test("Selection is correct after resizing", function(assert) {
		// Prepare
		var oSelectedDate = new Date(2019, 11, 3);

		this.oPC2.setViewKey("One Month");
		this.oPC2._oOneMonthsRow.addSelectedDate(new DateTypeRange({
			startDate: oSelectedDate
		}));

		// Act
		this.oPC2.setWidth("200px");
		Core.applyChanges();

		// Assert
		assert.equal(this.oPC2._oOneMonthsRow.getSelectedDates()[0].getStartDate().getTime(), oSelectedDate.getTime(),
			"After resizing the selected date is the same as one selected from the user.");
	});

});