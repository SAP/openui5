/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/LanguageTag",
	"sap/base/i18n/Localization",
	"sap/ui/core/ElementRegistry",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarAppointment",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/unified/library",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery",
	"sap/m/SearchField",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/PlanningCalendarRow",
	"sap/m/PlanningCalendar",
	"sap/m/Title",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/ui/core/CustomData",
	"sap/ui/Device",
	"sap/m/PlanningCalendarView",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	'sap/base/Log',
	"sap/base/util/deepEqual",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Locale",
	"sap/ui/core/date/UI5Date",
	// load all required calendars in advance
	"sap/ui/core/date/Islamic"
], function(
	Formatting,
	LanguageTag,
	Localization,
	ElementRegistry,
	nextUIUpdate,
	Library,
	qutils,
	createAndAppendDiv,
	JSONModel,
	DateTypeRange,
	CalendarLegend,
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
	IllustratedMessage,
	IllustratedMessageType,
	IllustratedMessageSize,
	CustomData,
	Device,
	PlanningCalendarView,
	ManagedObject,
	Element,
	BaseLog,
	deepEqual,
	KeyCodes,
	Locale,
	UI5Date
) {
	"use strict";

	// set language to en-GB, since we have specific language strings tested
	Localization.setLanguage("en_GB");

	// shortcut for sap.m.PlanningCalendarBuiltInView
	var PlanningCalendarBuiltInView = mobileLibrary.PlanningCalendarBuiltInView;

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

	createAndAppendDiv("verySmallUiArea").style.width = "300px";
	createAndAppendDiv("smallUiArea").style.width = "600px";
	createAndAppendDiv("bigUiArea").style.width = "1024px";

	var oFormatYyyyMMddHHmm = DateFormat.getInstance({pattern: "yyyyMMddHHmm"}),
		/*the SUT won't be destroyed when single test is run*/
		bSkipDestroy = new URLSearchParams(window.location.search).has("testId");

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
	var oPCStartDate = UI5Date.getInstance("2015", "0", "1", "08", "00");

	var createPlanningCalendar = function(sID, oSearchField, oButton, oParamStartDate, sViewKey, oLegend, aSpecialDates, aRows) {

		if (!aSpecialDates || !aSpecialDates.length) {
			aSpecialDates = [
				new DateTypeRange(sID + "SD1", {
					startDate: UI5Date.getInstance(2015, 0, 6),
					type: CalendarDayType.Type01,
					tooltip: "Heilige 3 Könige"
				}),
				new DateTypeRange(sID + "SD2", {
					startDate: UI5Date.getInstance(2015, 0, 1, 12, 0),
					endDate: UI5Date.getInstance(2015, 0, 1, 14, 0),
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
					startDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
					endDate: UI5Date.getInstance("2015", "0", "1", "11", "00"),
					type: CalendarDayType.Type02,
					color: "#FF0000",
					title: "SAPUI5",
					tooltip: "Test",
					icon: "sap-icon://sap-ui5"
				})
				],
				appointments: [ new CalendarAppointment(sID + "-R1A1", {
					startDate: oPCStartDate,
					endDate: UI5Date.getInstance("2015", "0", "1", "09", "00"),
					type: CalendarDayType.Type01,
					color: "#FF00FF",
					title: "App 1",
					icon: "../../ui/unified/images/m_01.png",
					tooltip: "Tooltip",
					text: "Text"
				}),
					new CalendarAppointment(sID + "-R1A2", {
						startDate: UI5Date.getInstance("2015", "0", "1", "07", "00"),
						endDate: oPCStartDate,
						type: CalendarDayType.Type02,
						title: "App 2",
						icon: "sap-icon://home",
						tooltip: "Tooltip",
						text: "Text",
						tentative: true
					}),
					new CalendarAppointment(sID + "-R1A3", {
						startDate: UI5Date.getInstance("2015", "0", "2", "08", "30"),
						endDate: UI5Date.getInstance("2015", "0", "2", "09", "30"),
						type: CalendarDayType.Type03,
						title: "App3",
						icon: "sap-icon://home",
						tooltip: "Tooltip"
					}),
					new CalendarAppointment(sID + "-R1A4", {
						startDate: UI5Date.getInstance("2014", "6", "1", "0", "0"),
						endDate: UI5Date.getInstance("2014", "6", "2", "0", "0"),
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
						startDate: UI5Date.getInstance("2015", "0", "2", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
						type: CalendarDayType.Type01,
						title: "SAPUI5",
						tooltip: "Test",
						icon: "sap-icon://sap-ui5"
					})
					],
					appointments: [ new CalendarAppointment(sID + "-R2A1", {
						startDate: UI5Date.getInstance("2015", "0", "1", "00", "00"),
						endDate: UI5Date.getInstance("2015", "0", "2", "23", "59"),
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

	var initPlanningCalendar = async function(sID, sSearchFieldId, sButtonId) {
		var oTC = Element.getElementById(sID);
		var oUIArea;
		if (oTC) {
			oTC.removeAllToolbarContent();
			oUIArea = oTC.getUIArea();
			oTC.destroy();
		}

		if (!Element.getElementById(sSearchFieldId)) {
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

		await nextUIUpdate();

		return oTC;

	};

	var _getListItem = function(oRow) {
		return Element.getElementById(oRow.getId() + "-CLI");
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
		var oRb = Library.getResourceBundleFor("sap.m"),
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
		oViewSwitch = Element.getElementById(sIntervalTypeDropdownId);
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

	var _clickTodayButton = async function(oPC, clock) {
		var sTodayButtonId = _getTodayButton.call(this, oPC).getId();
		qutils.triggerEvent("tap", sTodayButtonId);
		await nextUIUpdate(clock);
	};

	var _getTodayButton = function(oPC) {
		return Element.getElementById(oPC.getId() + "-Header-NavToolbar-TodayBtn");
	};

	var _getChangeMonthButtonText = function(oPC) {
		return jQuery("#" + oPC.getId() + "-Header-NavToolbar-PickerBtn").text();
	};

	//Verifies that given dates are "displayed" in the Planning Calendar
	//and month name(s) in the button is as expected
	var _assertDatesAreVisible = function(aDates, oPC, sMessagePrefix) {
		var sDaysSelector = oPC.getId() + "-" + _getIntervalId.call(this, oPC),
			iAvailableDays = jQuery('#' + sDaysSelector).find(".sapUiCalItem").length,
			oFirstDate = aDates[0],
			oLastDate = aDates[aDates.length - 1],
			sExpectedDateRange = _formatDate.call(this, oFirstDate) + "-" + _formatDate.call(this, oLastDate),
			sResult;

		sMessagePrefix += ": expected dates: " + sExpectedDateRange;

		QUnit.assert.equal(iAvailableDays, aDates.length, sMessagePrefix + ": Planning Calendar should show certain amount of days: ");
		sResult = DateFormat.getDateInstance({format: "yMMMMd"}).format(oFirstDate) + " - " + DateFormat.getDateInstance({format: "yMMMMd"}).format(oLastDate);

		QUnit.assert.equal(_getChangeMonthButtonText.call(this, oPC), sResult, sMessagePrefix + ": Change month button should have certain text of " +
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
		QUnit.assert.equal(jQuery("#" + sDayId).length, 1, sMessagePrefix + ": Date " + _formatDate.call(this, oDate) + " should be visible (" + sDayId + ")");
	};

	//Verifies that given hour for given date is "displayed" in the Planning Calendar
	var _assertHourIsVisible = function(oDate, oPC, sMessagePrefix) {
		var that = this;

		function convertHourInDate2DomId(oDate, sPrefix) {
			return sPrefix + "-" + oDate.getFullYear() + _padTo10.call(that, oDate.getMonth() + 1) + _padTo10.call(that, oDate.getDate()) + _padTo10.call(that, oDate.getHours()) + "00";
		}

		var sHourInDayId = convertHourInDate2DomId(oDate, oPC.getId() + "-" + _getIntervalId.call(this, oPC));
		QUnit.assert.equal(jQuery("#" + sHourInDayId).length, 1, sMessagePrefix + ": Hour " + _formatDateHour.call(this, oDate) + " should be visible (" + sHourInDayId + ")");
	};

	var _assertHoursAreVisible = function(aDates, oPC, sMessagePrefix) {
		var iAvailableDays = jQuery('#' + oPC.getId() + "-" + _getIntervalId.call(this, oPC) + "-times").children().length,
			sExpectedDateRange = _formatDateHour.call(this, aDates[0]) + "-" + _formatDateHour.call(this, aDates[aDates.length - 1]);

		sMessagePrefix += ": expected hours: " + sExpectedDateRange;
		QUnit.assert.equal(iAvailableDays, aDates.length, sMessagePrefix + ": Planning Calendar should show certain amount of hours: ");

		aDates.forEach(function (oDate) {
			_assertHourIsVisible.call(this, oDate, oPC, sMessagePrefix);
		}.bind(this));
	};

	var _assertFocus = function(oTarget) {
		QUnit.assert.strictEqual(document.activeElement.id, oTarget && oTarget.id, "Element with id: " + oTarget.id + " should be focused");
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
			case "OneMonth":
				return "OneMonthsRow";
			default:
				throw "Unknown viewKey:" + oPC.getViewKey();
		}
	};

	var _navBackward = async function(oPC) {
		var sIdBackButton = oPC.getId() + "-Header-NavToolbar-PrevBtn";
		qutils.triggerEvent("tap", sIdBackButton);
		await nextUIUpdate();
	};

	var _navForward = async function(oPC) {
		var  sIdForwardButton = oPC.getId() + "-Header-NavToolbar-NextBtn";
		qutils.triggerEvent("tap", sIdForwardButton);
		await nextUIUpdate();
	};

	var _navFocusPrev = async function(oTarget) {
		qutils.triggerKeydown(oTarget.id, "ARROW_LEFT");
		await nextUIUpdate();
		return this.oPC2Interval._oItemNavigation.getFocusedDomRef();
	};

	var _navFocusNext = async function(oTarget) {
		qutils.triggerKeydown(oTarget.id, "ARROW_RIGHT");
		await nextUIUpdate();
		return this.oPC2Interval._oItemNavigation.getFocusedDomRef();
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

	QUnit.test("PlanningCalendarHeaderToolbar is not visible when it doesn't contain any elements", async function(assert) {
		// Prepare
		var oPC = createPlanningCalendar("PC7").placeAt("qunit-fixture"),
			oPCHeaderToolbar = oPC._getHeader()._getActionsToolbar();

		oPC.setBuiltInViews([PlanningCalendarBuiltInView.Hour]);
		await nextUIUpdate();

		assert.ok(!oPC.getToolbarContent().length, "PlanningCalendarHeader: Toolbar is empty");
		assert.notOk(oPCHeaderToolbar.getVisible(), "PlanningCalendarHeader: Toolbar is not visible");

		// Act
		oPC.addToolbarContent(new Button({text: "TEST"}));
		oPC.insertToolbarContent(new Label({text: "TEST"}));
		await nextUIUpdate();

		// Assert
		assert.ok(oPCHeaderToolbar.getVisible(), "PlanningCalendarHeader: Toolbar is visible");
		assert.equal(oPC.getToolbarContent().length, 2, "PlanningCalendarHeader: Toolbar has two elements");

		// Act
		oPC.removeAllToolbarContent();
		await nextUIUpdate();

		// Assert
		assert.notOk(oPCHeaderToolbar.getVisible(), "PlanningCalendarHeader: Toolbar is not visible");

		// Assert
		assert.notOk(oPC._oHeaderObserver, "The ManagedObjectObserver not exists, because remove all toolbar content.");
		assert.equal(oPC.getToolbarContent().length, 0, "PlanningCalendarHeader: Toolbar has two elements");

		// Clean up
		oPC.destroy();
	});

	QUnit.test("PlanningCalendarHeaderToolbar is visible when it has at least one element", async function(assert) {
		// Prepare
		var oButton = new Button({text: "TEST"}),
			oLabel = new Label({text: "TEST"}),
			oPC = createPlanningCalendar("PC8", oButton, oLabel).placeAt("bigUiArea"),
			oPCHeaderToolbar = oPC._getHeader()._getActionsToolbar();

		oPC.setBuiltInViews([PlanningCalendarBuiltInView.Hour]);
		await nextUIUpdate();

		assert.equal(oPC.getToolbarContent().length, 2, "PlanningCalendar: has two elements");
		assert.ok(oPCHeaderToolbar.getVisible(), "PlanningCalendarHeader: toolbar is visible");

		// Act
		oPC.removeToolbarContent(oLabel);
		await nextUIUpdate();

		// Assert
		assert.ok(oPCHeaderToolbar.getVisible(), "PlanningCalendar: HeaderToolbar is visible");

		// Act
		oPC.removeToolbarContent(oButton);
		await nextUIUpdate();

		// Assert
		assert.notOk(oPCHeaderToolbar.getVisible(), "PlanningCalendar: HeaderToolbar is not visible");

		// Clean up
		oPC.destroy();
	});

	QUnit.test("PlannigCalendarHeaderToolbar possibility to change Title text", async function(assert) {
		// Prepare
		var oPC = createPlanningCalendar("PC7").placeAt("qunit-fixture"),
			oTitle = new Title({text: "TEST"}),
			oButton = new Button({text: "ButtonTest"});
			await nextUIUpdate();

		assert.notOk(oPC._oHeaderObserver, "The ManagedObjectObserver not exists, because a Title not added.");

		// Act
		oPC.addToolbarContent(oTitle);
		oPC.addToolbarContent(oButton);
		await nextUIUpdate();

		// Assert
		assert.ok(oPC._oHeaderObserver, "The ManagedObjectObserver exists, because add title.");
		assert.equal(oPC._getHeader().getTitle(), "TEST", "PlanningCalendarHeader: header's title is correct");

		// Act
		oTitle.setText("new TEST");

		// Assert
		assert.equal(oPC._getHeader().getTitle(),"new TEST", "PlanningCalendarHeader: header's text has change correctly");

		// Act
		oPC.removeToolbarContent(oButton);
		await nextUIUpdate();

		// Assert
		assert.ok(oPC._oHeaderObserver, "The ManagedObjectObserver exists correctly");

		// Act
		oPC.removeToolbarContent(oTitle);
		await nextUIUpdate();

		// Assert
		assert.notOk(oPC._oHeaderObserver, "The ManagedObjectObserver not exists, because remove Title from toolbar content.");

		// Clean up
		oPC.destroy();
	});

	QUnit.test("PlanningCalendarRow", function(assert) {
		var oRow = Element.getElementById("PC1-Row1");
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
		assert.ok(_getRowTimeline(oRow).isA("sap.ui.unified.CalendarRow"), "CalendarRow control");

		var oTimeline = _getRowTimeline(oRow);
		assert.ok(!oTimeline.getNonWorkingDays(), "Row1: CalendarRow - nonWorkingDays");
		assert.ok(!oTimeline.getNonWorkingHours(), "Row1: CalendarRow - nonWorkingHours");

		oRow = Element.getElementById("PC1-Row2");
		oTimeline = _getRowTimeline(oRow);
		assert.deepEqual(oTimeline.getNonWorkingDays(), [2, 3], "Row2: CalendarRow - nonWorkingDays");
		assert.deepEqual(oTimeline.getNonWorkingHours(), [11, 12], "Row2: CalendarRow - nonWorkingHours");
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

	QUnit.test("PlanningCalendarRow - propagate selected property to table", async function(assert) {
		const oRow1 = new PlanningCalendarRow({
				title: "Row 1",
				selected: true
			}),
			oRow2 = new PlanningCalendarRow({
				title: "Row 2"
			}),
			oPC = new PlanningCalendar({
				rows: [
					oRow1,
					oRow2
				]
			});

		// act
		oPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oPCSelectedRows = oPC.getSelectedRows(),
			aTableSelectedItems = oPC.getAggregation("table").getSelectedItems(),
			oTableItem = _getListItem(oRow1);

		// assert
		assert.equal(oPCSelectedRows.length, 1, "One row is selected in the Planning Calendar");
		assert.equal(oPCSelectedRows[0], oRow1, "Correct row is selected in the Planning Calendar");
		assert.equal(aTableSelectedItems.length, 1, "One row is selected in the Table");
		assert.equal(aTableSelectedItems[0], oTableItem, "The selected row in Planning Calendar is synched with the Table");
	});

	QUnit.test("Table", function(assert) {
		var oTable = Element.getElementById("PC1-Table");

		assert.equal(oTable.getColumns().length, 2, "Table columns");
		assert.equal(oTable.getItems().length, 2, "Table rows");
		assert.equal(oTable.getItems()[0].getId(), "PC1-Row1-CLI", "Table row1 is first row");

		assert.ok(oTable.getInfoToolbar(), "InfoToolbar exist");
		assert.equal(oTable.getInfoToolbar().getContent().length, 2, "InfoToolbar items");
		assert.equal(oTable.getInfoToolbar().getContent()[0].getId(), "PC1-CalHead", "InfoToolbar: Calendar head exist");
		assert.equal(oTable.getInfoToolbar().getContent()[1].getId(), "PC1-TimesRow", "InfoToolbar: TimesRow exist");
	});

	QUnit.module("rendering");

	QUnit.test("Resizing the calendar triggers pickers selection update", async function(assert) {
		// prepare
		var oPlanningCalendar = new PlanningCalendar();
		oPlanningCalendar.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oUpdatePickerStateSpy = this.spy(oPlanningCalendar, "_updatePickerSelection");

		// act
		oPlanningCalendar.setWidth("400px");
		await nextUIUpdate();

		// assert
		assert.ok(oUpdatePickerStateSpy.calledTwice, "Calendar picker is properly updated.");

		// clean
		oPlanningCalendar.destroy();
	});

	QUnit.test("table", function(assert) {
		var oTable = Element.getElementById("PC1-Table");

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
		if (Localization.getRTL()) {
			return "border-right-color";
		}
		return "border-left-color";
	}

	function _checkColor (oExtractedRGB, oExpectedRGB, sLabel) {
		QUnit.assert.equal(oExtractedRGB[1], oExpectedRGB.R, sLabel + " (RED)");
		QUnit.assert.equal(oExtractedRGB[2], oExpectedRGB.G, sLabel + " (GREEN)");
		QUnit.assert.equal(oExtractedRGB[3], oExpectedRGB.B, sLabel + " (BLUE)");
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

	QUnit.test("rowHeaderDescription property", async function (assert) {
		// Prepare
		var oPC = new PlanningCalendar({
				builtInViews: ["Day"],
				rows: [
					new PlanningCalendarRow({
						title: "One",
						rowHeaderDescription: "Has popup"
					}),
					new PlanningCalendarRow({
						title: "Two"
					})
				]
			}),
			oRb = Library.getResourceBundleFor("sap.m");

		oPC.placeAt("qunit-fixture");
		await nextUIUpdate();

		var aRowHeaderElements = oPC.getDomRef().querySelectorAll(".sapMPlanCalRowHead");

		// Assert
		assert.notOk(aRowHeaderElements[1].getAttribute("aria-description"), "There is no custom description");
		assert.notOk(aRowHeaderElements[2].getAttribute("aria-description"), "There is no default description");

		// Act
		oPC.attachEventOnce("rowHeaderPress", function() {});

		// Assert
		assert.strictEqual(aRowHeaderElements[1].getAttribute("aria-description"), "Has popup", "Custom description is set");
		assert.strictEqual(
			aRowHeaderElements[2].getAttribute("aria-description"),
			oRb.getText("PLANNING_CALENDAR_ROW_HEADER_DESCRIPTION"),
			"Default description is set"
		);

		// Clean
		oPC.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Title rendered with a proper id", async function(assert) {
		// prepare
		var oPlanningCalendar = new PlanningCalendar({
			ariaLabelledBy: ["idtitle"],
			toolbarContent: [
				new Title("idtitle", {text: "title of planning calendar"})
			]
		});

		oPlanningCalendar.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oInnerTitle = oPlanningCalendar._getHeader()._oTitle;
		const oTitleDomRef = oPlanningCalendar.getDomRef().querySelector(`[data-sap-ui='${oInnerTitle.getId()}']`);

		// assert
		assert.ok(oTitleDomRef, "There is a sap.m.Title rendered with the given ID.");

		// clean
		oPlanningCalendar.destroy();
	});

	QUnit.module("rendering - Hours View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());

		},
		afterEach: async function () {
			this.oPC.destroy();
			await nextUIUpdate();
		},
		prepareTest: async function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			await nextUIUpdate();
		}
	});

	QUnit.test("checks for the number of hours on small screen", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("smallUiArea");

		//Act
		_switchToView(CalendarIntervalType.Hour, this.oPC);
		await nextUIUpdate();

		//Assert
		assert.equal(this.oPC.$().outerWidth(), 600, "width is set to 600px"); // this is only for check that width of the screen is set to 600 px

		iVisibleIntervals = jQuery("#PC3-TimesRow-times").find('.sapUiCalItem').length;
		assert.equal(iVisibleIntervals , 6, "hours are 6");

		oEndDate = UI5Date.getInstance(oPCStartDate.getTime());
		oEndDate.setHours(oEndDate.getHours() + iVisibleIntervals - 1);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 6, "correct number of shown intervals");
	});

	QUnit.test("checks for the number of hours on big screen", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("bigUiArea");

		//Act
		_switchToView(CalendarIntervalType.Hour, this.oPC);
		await nextUIUpdate();

		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px"); // this is only for check that width of the screen is set to 1024 px

		iVisibleIntervals = this.oPC.getVisibleIntervalsCount();
		assert.equal(iVisibleIntervals , 12, "hours are 12");

		oEndDate = UI5Date.getInstance(oPCStartDate.getTime());
		oEndDate.setHours(oEndDate.getHours() + iVisibleIntervals - 1);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 12, "correct number of shown intervals");
	});
	QUnit.module("rendering - Days View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());

		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: async function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			await nextUIUpdate();
		}
	});

	QUnit.test("checks for the number of days on small screen on Days View", async function(assert) {
		var oEndDate, iVisibleIntervals;
		//Arrange
		await this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Day, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "600", "width is set to 600px"); // this is only for check that width of the screen is set to 600 px

		iVisibleIntervals = jQuery("#PC3-DatesRow .sapUiCalItem").length;
		assert.equal(iVisibleIntervals, 7, "days are 7");


		oEndDate = UI5Date.getInstance(oPCStartDate.getTime());
		oEndDate.setDate(oEndDate.getDate() + iVisibleIntervals - 1);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 7, "correct number of shown intervals");
	});

	QUnit.test("checks for the number of days on big screen on Days View", async function(assert) {
		var oEndDate, iVisibleIntervals;
		//Arrange
		await this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.Day, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px"); // this is only for check that width of the screen is set to 1024 px

		iVisibleIntervals = jQuery("#PC3-DatesRow .sapUiCalItem").length;
		assert.equal(iVisibleIntervals , 14, "days are 14");

		oEndDate = UI5Date.getInstance(oPCStartDate.getTime());
		oEndDate.setDate(oEndDate.getDate() + iVisibleIntervals - 1);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 14, "correct number of shown intervals");
	});

	QUnit.module("rendering - Months View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());
		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: async function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			await nextUIUpdate();
		}
	});

	QUnit.test("checks for the number of months on very small screen", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("verySmallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Month, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "300", "width is set to 300px"); // this is only for check that width of the screen is set to 300 px

		iVisibleIntervals = jQuery("#PC3-MonthsRow-months .sapUiCalItem").length;
		assert.equal(iVisibleIntervals, 3, "months are 3");

		oEndDate = UI5Date.getInstance(oPCStartDate.getTime());
		oEndDate.setMonth(oEndDate.getMonth() + iVisibleIntervals - 1);

		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 3, "correct number of shown intervals");
	});

	QUnit.test("checks for the number of months on small screen", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Month, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "600", "width is set to 600px"); // this is only for check that width of the screen is set to 600 px

		iVisibleIntervals = jQuery("#PC3-MonthsRow-months .sapUiCalItem").length;
		assert.equal(iVisibleIntervals , 6, "months are 6");

		oEndDate = UI5Date.getInstance(oPCStartDate.getTime());
		oEndDate.setMonth(oEndDate.getMonth() + iVisibleIntervals - 1);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 6, "correct number of shown intervals");
	});

	QUnit.test("checks for the number of months on big screen", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.Month, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px"); // this is only for check that width of the screen is set to 1024 px

		iVisibleIntervals = jQuery("#PC3-MonthsRow-months .sapUiCalItem").length;
		assert.equal(iVisibleIntervals , 12, "months are 12");

		oEndDate = UI5Date.getInstance(oPCStartDate.getTime());
		oEndDate.setMonth(oEndDate.getMonth() + iVisibleIntervals - 1);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 12, "correct number of shown intervals");
	});
	QUnit.module("rendering - 1Week View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());
		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: async function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			await nextUIUpdate();
		}
	});

	QUnit.test("checks for the number of days on small screen on 1Week View", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.Week, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "600", "width is set to 600px"); // this is only for check that width of the screen is set to 600 px

		iVisibleIntervals = jQuery("#PC3-WeeksRow .sapUiCalItem").length;
		assert.equal(iVisibleIntervals, 7, "days are 7");
		oEndDate = UI5Date.getInstance(2015,0,4,8,0,0);

		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 7, "correct number of shown intervals");
	});

	QUnit.test("checks for the number of days on big screen on 1Week View", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.Week, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px");  // this is only for check that width of the screen is set to 1024 px

		iVisibleIntervals = jQuery("#PC3-WeeksRow .sapUiCalItem").length;
		assert.equal(iVisibleIntervals, 7, "days are 7");

		oEndDate = UI5Date.getInstance(2015,0,4,8,0,0);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 7, "correct number of shown intervals");
	});
	QUnit.module("rendering - 1Month View", {
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());

		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: async function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			await nextUIUpdate();
		}
	});

	QUnit.test("checks for the number of days on small screen", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("smallUiArea");
		//Act
		_switchToView(CalendarIntervalType.OneMonth, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "600", "width is set to 600px"); // this is only for check that width of the screen is set to 600 px

		iVisibleIntervals = jQuery("#PC3-OneMonthsRow .sapUiCalItem").length;
		assert.equal(iVisibleIntervals, 42, "42 days are rendered");

		oEndDate = UI5Date.getInstance(this.oPC.getStartDate().getTime());
		oEndDate.setMonth(oEndDate.getMonth() + 1);
		oEndDate.setDate(oEndDate.getDate() - 1);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 42, "correct number of shown intervals");
	});

	QUnit.test("checks for the number of days on big screen", async function(assert) {
		var oEndDate, iVisibleIntervals;

		//Arrange
		await this.prepareTest("bigUiArea");
		//Act
		_switchToView(CalendarIntervalType.OneMonth, this.oPC);
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.$().outerWidth(), "1024", "width is set to 1024 px"); // this is only for check that width of the screen is set to 1024 px

		iVisibleIntervals = jQuery("#PC3-OneMonthsRow .sapUiCalItem").length;
		assert.equal(iVisibleIntervals , 31, "days are 31");

		oEndDate = UI5Date.getInstance(oPCStartDate.getTime());
		oEndDate.setDate(oEndDate.getDate() + iVisibleIntervals - 1);
		assert.equal(this.oPC.getEndDate().getTime(), oEndDate.getTime(), "end date is correct");

		assert.equal(this.oPC.getVisibleIntervalsCount(), 31, "correct number of shown intervals");
	});

	QUnit.module("rendering - relativeView",{
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());
			this.oPC.setBuiltInViews(["Day", "Hour"]);
			this.oPC.setMinDate(this.oPC.getStartDate());
			this.oPC.setMaxDate(this.oPC.getStartDate());
			this.oRelativeView = new PlanningCalendarView({
				key: "test",
						intervalType: "Day",
						relative: true,
						description: "Project in Weeks",
						intervalSize: 7,
						intervalLabelFormatter: function(iIntervalIndex) {
							return "Week " + (iIntervalIndex + 1);
						},
						intervalsS: 4,
						intervalsM: 8,
						intervalsL: 1
			});
			this.oRelativeView2 = new PlanningCalendarView({
				key: "test2",
						intervalType: "Day",
						relative: true,
						description: "Project in Days",
						intervalSize: 1,
						intervalLabelFormatter: function(iIntervalIndex) {
							return "Day " + (iIntervalIndex + 1);
						},
						intervalsS: 4,
						intervalsM: 8,
						intervalsL: 1
			});
			this.oPC.addView(this.oRelativeView);
			this.oPC.addView(this.oRelativeView2);
			this.oPC.setViewKey("test");
		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: async function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			await nextUIUpdate();
		}
	});

	QUnit.test("checks for the number of week on small screen in relative period", async function(assert) {
		var iVisibleIntervals;
		//Arrange
		await this.prepareTest("smallUiArea");
		//Assert
		assert.ok(this.oPC.isRelative(), "Relative period is active");
		iVisibleIntervals = jQuery("#PC3-DatesRow-customintervals .sapUiCalItem").length;
		assert.equal(iVisibleIntervals, 8, "week are 8");
		assert.equal(this.oPC.getVisibleIntervalsCount(), 8, "correct number of shown intervals");
	});

	QUnit.module("Size of views - relativeView",{
		beforeEach: function () {
			this.oPC = createPlanningCalendar("PC3", new SearchField(), new Button());
			this.oPC.setBuiltInViews(["Day", "Hour"]);
			this.oPC.setMinDate(this.oPC.getStartDate());
			this.oPC.setMaxDate(this.oPC.getStartDate());
			this.oRelativeView = new PlanningCalendarView({
				key: "test",
						intervalType: "Day",
						relative: true,
						description: "Project in Days",
						intervalSize: 1,
						intervalLabelFormatter: function(iIntervalIndex) {
							return "Day " + (iIntervalIndex + 1);
						},
						intervalsS: 4,
						intervalsM: 8,
						intervalsL: 1
			});
			this.oPC.addView(this.oRelativeView);
			this.oPC.setViewKey("test");
		},
		afterEach: function () {
			this.oPC.destroy();
		},
		prepareTest: async function (sTargetElementId) {
			this.oPC.placeAt(sTargetElementId);
			await nextUIUpdate();
		}
	});

	QUnit.test("checks for the number of days on small screen in relative period and header button", async function(assert) {
		var iVisibleIntervals;
		//Arrange
		await this.prepareTest("smallUiArea");
		//Assert
		assert.ok(this.oPC.isRelative(), "Relative period is active");
		iVisibleIntervals = jQuery("#PC3-DatesRow-customintervals .sapUiCalItem").length;
		assert.strictEqual(iVisibleIntervals, 8, "days are 8");
		assert.strictEqual(this.oPC._getHeader()._oPickerBtn.getText(), "Day 1 - Day 8");
		assert.strictEqual(this.oPC.getVisibleIntervalsCount(), 8, "correct number of shown intervals");
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
		afterEach: async function() {
			//Cleanup
			this.oPC.destroy();
			await nextUIUpdate();
		},
		checkInitItemPlacement: function  () {
			var oInfoToolbarContent = this.oPC._oInfoToolbar.getContent();

			QUnit.assert.strictEqual(oInfoToolbarContent.length, 2, "Internal _oInfoToolbar has correct amount of controls in it's content.");
			QUnit.assert.ok(oInfoToolbarContent[0].isA("sap.m._PlanningCalendarInternalHeader"), "First child of _oInfoToolbar is a CalendarHeader");
			QUnit.assert.ok(oInfoToolbarContent[1].isA(this.aIntervalRepresentatives), "Second child of _oInfoToolbar is an interval");
			QUnit.assert.notOk(jQuery("#SelectionMode-All").get(0), "Select All CheckBox not rendered");
		},
		checkItemPlacementInMultiSel: function (iInfoToolbarContentLength) {
			var oInfoToolbarContent = this.oPC._oInfoToolbar.getContent();

			QUnit.assert.strictEqual(oInfoToolbarContent.length, iInfoToolbarContentLength, "Internal _oInfoToolbar has correct amount of controls in it's content.");
			QUnit.assert.ok(oInfoToolbarContent[0].isA("sap.m._PlanningCalendarInternalHeader"), "First child of _oInfoToolbar is a CalendarHeader");
			QUnit.assert.ok(oInfoToolbarContent[1].isA(this.aIntervalRepresentatives), "Second child of _oInfoToolbar is an interval");
			if (iInfoToolbarContentLength > 2) {
				QUnit.assert.notOk(this.oPC._oCalendarHeader.getAllCheckBox(), "Select All CheckBox does not exist in the _oCalendarHeader");
			} else {
				QUnit.assert.ok(this.oPC._oCalendarHeader.getAllCheckBox(), "Internal _oCalendarHeader holds the select all checkbox");
			}
			QUnit.assert.ok(jQuery("#SelectionMode-All").get(0), "Select All CheckBox rendered");
		},
		checkItemPlacementAfterHidingRowHeaders: function (bDesktop) {
			var oInfoToolbarContent = this.oPC._oInfoToolbar.getContent();

			QUnit.assert.strictEqual(oInfoToolbarContent.length, 3, "Internal _oInfoToolbar has correct amount of controls in it's content.");
			QUnit.assert.ok(oInfoToolbarContent[0].isA("sap.m._PlanningCalendarInternalHeader"), "First child of _oInfoToolbar is a CalendarHeader");
			if (bDesktop) {
				QUnit.assert.ok(oInfoToolbarContent[1].isA("sap.m.CheckBox"), "Second child of _oInfoToolbar is a checkBox");
				QUnit.assert.ok(oInfoToolbarContent[2].isA(this.aIntervalRepresentatives), "Third child of _oInfoToolbar is an interval");
			} else {
				QUnit.assert.ok(oInfoToolbarContent[1].isA(this.aIntervalRepresentatives), "Second child of _oInfoToolbar is an interval");
				QUnit.assert.ok(oInfoToolbarContent[2].isA("sap.m.CheckBox"), "Third child of _oInfoToolbar is a checkBox");
			}
		}
	});

	QUnit.test("calendarWeekNumbering", async function(assert) {
		var sInitialWeekNumbering = "ISO_8601",
			sChangedWeekNumbering = "MiddleEastern",
			sInitialFirstDay = "Mon",
			sChangedFirstDay = "Sat",
			iInitialFirstDayOfWeek = 1, // Mon
			iChangedFirstDayOfWeek = 6, // Sat
			oHeader,
			oPicker;

		this.oPC.setCalendarWeekNumbering(sInitialWeekNumbering);

		this.oPC.placeAt("smallUiArea");
		await nextUIUpdate();

		oHeader = this.oPC._getHeader();

		// act
		oHeader._oPickerBtn.firePress();
		await nextUIUpdate();
		oPicker = oHeader._oPopup.getContent()[0];

		// assert
		assert.strictEqual(oPicker.getCalendarWeekNumbering(), sInitialWeekNumbering, "Picker has proper initial calendarWeekNumbering");
		assert.strictEqual(oPicker.getAggregation("month")[0].getDomRef().querySelectorAll(".sapUiCalWH")[1].textContent, sInitialFirstDay, "Picker - First day is correct for the calendarWerekNumbering set initially");

		// act
		this.oPC.setViewKey("One Month");
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oPC._oOneMonthsRow.getCalendarWeekNumbering(), sInitialWeekNumbering, "One Month row has proper initial calendarWeekNumbering");
		assert.strictEqual(this.oPC._oOneMonthsRow.getDomRef().querySelector(".sapUiCalWH").textContent, sInitialFirstDay, "One Month - First day is correct for the calendarWerekNumbering set initially");

		// act
		this.oPC.setViewKey("Week");
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oPC._oWeeksRow.getCalendarWeekNumbering(), sInitialWeekNumbering, "One Week row has proper initial calendarWeekNumbering");
		assert.strictEqual(this.oPC._oWeeksRow.getDomRef().querySelector(".sapUiCalDayName").textContent, sInitialFirstDay, "One Week - First day is correct for the calendarWerekNumbering set initially");
		assert.strictEqual(this.oPC._dateNav.getWeekConfiguration().firstDayOfWeek, iInitialFirstDayOfWeek, "One Week - First day of week of the DateNavigation is correct for the calendarWerekNumbering set initially");

		// act
		this.oPC.setCalendarWeekNumbering(sChangedWeekNumbering);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oPicker.getCalendarWeekNumbering(), sChangedWeekNumbering, "Picker has proper calendarWeekNumbering after changing the PlanningCalendar property");
		assert.strictEqual(oPicker.getAggregation("month")[0].getDomRef().querySelectorAll(".sapUiCalWH")[1].textContent, sChangedFirstDay, "Picker - First day is correct when calendarWerekNumbering is changed");
		assert.strictEqual(this.oPC._oWeeksRow.getCalendarWeekNumbering(), sChangedWeekNumbering, "One Week row has proper calendarWeekNumbering after changing the PlanningCalendar property");
		assert.strictEqual(this.oPC._oWeeksRow.getDomRef().querySelector(".sapUiCalDayName").textContent, sChangedFirstDay, "One Week - First day is correct when calendarWerekNumbering is changed");
		assert.strictEqual(this.oPC._dateNav.getWeekConfiguration().firstDayOfWeek, iChangedFirstDayOfWeek, "One Week - First day of week of the DateNavigation is correct when calendarWerekNumbering is changed");

		// act
		this.oPC.setViewKey("One Month");
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oPC._oOneMonthsRow.getCalendarWeekNumbering(), sChangedWeekNumbering, "One Month row has proper calendarWeekNumbering after changing the PlanningCalendar property");
		assert.strictEqual(this.oPC._oOneMonthsRow.getDomRef().querySelector(".sapUiCalWH").textContent, sChangedFirstDay, "One Month - First day is correct when calendarWerekNumbering is changed");
	});

	QUnit.test("startDate", async function(assert) {
		var oExpectedDate = UI5Date.getInstance("2015", "0", "1", "08", "00");
		var iStartTime = oPC1.getStartDate().getTime();
		assert.equal(oExpectedDate.getTime(), iStartTime, "Start date is OK");
		assert.equal(Element.getElementById("PC1-TimesRow").getStartDate().getTime(), iStartTime, "TimesRow Start date");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getStartDate().getTime(), iStartTime, "CalendarRow1 Start date");
		assert.equal(Element.getElementById("PC1-Row2-CalRow").getStartDate().getTime(), iStartTime, "CalendarRow2 Start date");

		oExpectedDate = UI5Date.getInstance("2015", "0", "1", "07", "00");
		oPC1.setStartDate(UI5Date.getInstance("2015", "0", "1", "07", "00"));
		await nextUIUpdate();
		iStartTime = oPC1.getStartDate().getTime();
		assert.equal(oExpectedDate.getTime(), iStartTime, "Start date is OK");
		assert.equal(Element.getElementById("PC1-TimesRow").getStartDate().getTime(), iStartTime, "TimesRow Start date");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getStartDate().getTime(), iStartTime, "CalendarRow1 Start date");
		assert.equal(Element.getElementById("PC1-Row2-CalRow").getStartDate().getTime(), iStartTime, "CalendarRow2 Start date");
		assert.ok(jQuery("#PC1-R1A1").get(0), "Row1: Appointment1 still rendered");
		assert.ok(jQuery("#PC1-R1A2").get(0), "Row1: Appointment2 now rendered");
	});

	QUnit.test("Start date in different views is right", async function(assert) {
		//Arrange
		var oStartDate = UI5Date.getInstance(2020, 3, 1, 7, 0, 0, 0);
		oPC1.setStartDate(oStartDate);
		oPC1._iSize = 1;
		oPC1._iSizeScreen = 1;

		//Act
		oPC1.setViewKey(CalendarIntervalType.Hours);
		await nextUIUpdate();
		var oTempStartDate = oPC1.getStartDate();

		//Assert
		assert.deepEqual(oTempStartDate, oStartDate, "Start date is right in Hours View");

		//Act
		oPC1.setViewKey(CalendarIntervalType.OneMonth);
		await nextUIUpdate();
		oTempStartDate = oPC1.getStartDate();

		//Assert
		assert.deepEqual(oTempStartDate, oStartDate, "Start date is right in OneMonth View");

		//Reset
		oPC1.setViewKey(CalendarIntervalType.Hours);
		await nextUIUpdate();
	});

	QUnit.test("viewKey", async function(assert) {
		var sViewKey = oPC1.getViewKey();
		assert.equal(sViewKey, CalendarIntervalType.Hour, "Default ViewKey");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Hour, "CalendarRow1 intervalType");
		assert.equal(Element.getElementById("PC1-Row2-CalRow").getIntervalType(), CalendarIntervalType.Hour, "CalendarRow2 intervalType");
		assert.ok(!Element.getElementById("PC1-DatesRow"), "DatesRow control not exist");
		assert.ok(!Element.getElementById("PC1-MonthsRow"), "MonthsRow control not exist");

		oPC1.setViewKey(CalendarIntervalType.Day);
		await nextUIUpdate();
		sViewKey = oPC1.getViewKey();
		assert.equal(sViewKey, CalendarIntervalType.Day, "Default ViewKey");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Day, "CalendarRow1 intervalType");
		assert.equal(Element.getElementById("PC1-Row2-CalRow").getIntervalType(), CalendarIntervalType.Day, "CalendarRow2 intervalType");
		assert.ok(Element.getElementById("PC1-TimesRow"), "TimesRow control still exist");
		assert.ok(Element.getElementById("PC1-DatesRow"), "DatesRow control now exist");
		assert.ok(!Element.getElementById("PC1-MonthsRow"), "MonthsRow control not exist");
		assert.ok(!jQuery("#PC1-TimesRow").get(0), "TimesRow not rendered");
		assert.ok(jQuery("#PC1-DatesRow").get(0), "DatesRow rendered");

		oPC1.setViewKey(CalendarIntervalType.Month);
		await nextUIUpdate();
		sViewKey = oPC1.getViewKey();
		assert.equal(sViewKey, CalendarIntervalType.Month, "Default ViewKey");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Month, "CalendarRow1 intervalType");
		assert.equal(Element.getElementById("PC1-Row2-CalRow").getIntervalType(), CalendarIntervalType.Month, "CalendarRow2 intervalType");
		assert.ok(Element.getElementById("PC1-TimesRow"), "TimesRow control still exist");
		assert.ok(Element.getElementById("PC1-DatesRow"), "DatesRow control now exist");
		assert.ok(Element.getElementById("PC1-MonthsRow"), "MonthsRow control not exist");
		assert.ok(!jQuery("#PC1-TimesRow").get(0), "TimesRow not rendered");
		assert.ok(!jQuery("#PC1-DatesRow").get(0), "DatesRow not rendered");
		assert.ok(jQuery("#PC1-MonthsRow").get(0), "MonthsRow rendered");
	});

	QUnit.test("width", async function(assert) {
		assert.ok(!oPC1.getWidth(), "no width set ad default");
		var sStyle = oPC1.$().attr("style") || "";
		assert.ok(sStyle.search("width") < 0, "no width set on DOM");

		oPC1.setWidth("90%");
		await nextUIUpdate();
		sStyle = oPC1.$().attr("style") || "";
		var aTest = sStyle.match(/width:(\s?)(\d+(.?)(\d+))/);
		var iWidth = aTest ? aTest[2] : 0;
		assert.equal(iWidth, 90 + "", "width set on DOM");
	});

	QUnit.test("height", async function(assert) {
		assert.ok(!oPC1.getHeight(), "no height set ad default");
		var sStyle = oPC1.$().attr("style") || "";
		assert.ok(sStyle.search("height") < 0, "no height set on DOM");

		oPC1.setHeight("90%");
		await nextUIUpdate();
		sStyle = oPC1.$().attr("style") || "";
		var aTest = sStyle.match(/height:(\s?)(\d+(.?)(\d+))/);
		var iheight = aTest ? aTest[2] : 0;
		assert.equal(iheight, 90 + "", "height set on DOM");
		assert.ok(sStyle.indexOf("height: 90%;") > -1 , "The height is kept in percents");

		// set fixed height because when in percent computed initially value in pixels
		// differs with 1 or 2 pixels from the "final" value
		oPC1.setHeight("800px");
		await nextUIUpdate();
		var $Table = oPC1.getDomRef().querySelector("table");

		// Table height is the PlanningCalendar height minus the height of the toolbars
		sStyle = oPC1.$().height() - oPC1._oInfoToolbar.$().height() + "px";
		assert.equal($Table.style.height, sStyle, "The height is set correctly to the Table");
	});

	QUnit.test("showIntervalHeaders", async function(assert) {
		assert.ok(oPC1.getShowIntervalHeaders(), "ShowIntervalHeaders is enabled by default");
		assert.ok(oPC1.getShowEmptyIntervalHeaders(), "ShowEmptyIntervalHeaders is enabled by default");
		var aRows = oPC1.getRows();
		for (var i = 0; i < aRows.length; i++) {
			assert.ok(_getRowTimeline(aRows[i]).getShowIntervalHeaders(), "Row " + i + ": ShowIntervalHeaders set");
			assert.ok(_getRowTimeline(aRows[i]).getShowEmptyIntervalHeaders(), "Row " + i + ": ShowEmptyIntervalHeaders set");
		}

		oPC1.setShowIntervalHeaders(false);
		oPC1.setShowEmptyIntervalHeaders(false);
		await nextUIUpdate();
		for (var i = 0; i < aRows.length; i++) {
			assert.ok(!_getRowTimeline(aRows[i]).getShowIntervalHeaders(), "Row " + i + ": ShowIntervalHeaders not set");
			assert.ok(!_getRowTimeline(aRows[i]).getShowEmptyIntervalHeaders(), "Row " + i + ": ShowEmptyIntervalHeaders not set");
		}

		oPC1.setShowIntervalHeaders(true);
		oPC1.setShowEmptyIntervalHeaders(true);
		await nextUIUpdate();
	});

	QUnit.test("groupAppointmentsMode", async function (assert) {
		//Assert: default value
		assert.equal(oPC1.getGroupAppointmentsMode(), GroupAppointmentsMode.Collapsed, "GroupAppointmentsMode is set to 'Collapsed' by default");
		var aRows = oPC1.getRows();
		for (var i = 0; i < aRows.length; i++) {
			assert.ok(_getRowTimeline(aRows[i]).getGroupAppointmentsMode(), "CalendarRow " + i + ": GroupAppointmentsMode is set to 'Collapsed'");
		}

		// Act
		oPC1.setGroupAppointmentsMode(GroupAppointmentsMode.Expanded);
		await nextUIUpdate();
		// Assert
		assert.equal(oPC1.getGroupAppointmentsMode(), GroupAppointmentsMode.Expanded, "GroupAppointmentsMode is set to 'Expanded'");
		for (var i = 0; i < aRows.length; i++) {
			assert.equal(_getRowTimeline(aRows[i]).getGroupAppointmentsMode(), GroupAppointmentsMode.Expanded, "CalendarRow " + i + ": GroupAppointmentsMode is set to 'Expanded'");
		}

		// Cleanup
		oPC1.setGroupAppointmentsMode(GroupAppointmentsMode.Collapsed);
		await nextUIUpdate();
	});

	QUnit.test("appointmentsVisualization", async function(assert) {
		assert.equal(oPC1.getAppointmentsVisualization(), CalendarAppointmentVisualization.Standard, "AppointmentVisualization default set");
		var aRows = oPC1.getRows();
		for (var i = 0; i < aRows.length; i++) {
			assert.equal(_getRowTimeline(aRows[i]).getAppointmentsVisualization(), CalendarAppointmentVisualization.Standard, "Row " + i + ": AppointmentVisualization default set");
		}

		oPC1.setAppointmentsVisualization(CalendarAppointmentVisualization.Filled);
		await nextUIUpdate();
		for (var i = 0; i < aRows.length; i++) {
			assert.equal(_getRowTimeline(aRows[i]).getAppointmentsVisualization(), CalendarAppointmentVisualization.Filled, "Row " + i + ": AppointmentVisualization Filled set");
		}

		oPC1.setAppointmentsVisualization(CalendarAppointmentVisualization.Standard);
		await nextUIUpdate();
	});

	QUnit.test("showRowHeaders", async function(assert) {
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
		await nextUIUpdate();

		//Assert
		assert.ok(!jQuery("#PC1-Row1-Head").is(":visible"), "Row1 Header not visible");
		assert.equal(getAppointmentsColumn().getDemandPopin(), false, "If showRowHeaders is false, appointments Column is NOT in Popin mode");
		assert.equal(getAppointmentsColumn().getMinScreenWidth(), "",
			"If showRowHeaders is false appointments column has minScreenWidth is empty");

		//Act
		oPC1.setShowRowHeaders(true);
		await nextUIUpdate();

		//Assert
		assert.ok(jQuery("#PC1-Row1-Head").is(":visible"), "Row1 Header visible");
		assert.equal(getAppointmentsColumn().getDemandPopin(), true, "If showRowHeaders is set to true, appointments column is in Popin mode");
		assert.equal(getAppointmentsColumn().getMinScreenWidth().toLowerCase(), ScreenSize.Desktop.toLowerCase(),
			"If showRowHeaders is set to true, appointments column has minScreenWidth set to sap.m.ScreenSize.Desktop");
	});

	QUnit.test("noData: Illistrated Message", async function(assert) {
		var oTable = Element.getElementById("PC1-Table"),
			oIMNoData = new IllustratedMessage({
				illustrationType: IllustratedMessageType.EmptyPlanningCalendar,
				illustrationSize: IllustratedMessageSize.Dialog
			});

		oPC1.setNoData(oIMNoData);
		await nextUIUpdate();

		assert.equal(oPC1.getNoData(), oIMNoData, "IllustratedMessage is set");
		assert.equal(oTable.getAggregation("noData"), oIMNoData, "IllustratedMessage is set on table");

		oPC1.setNoData();
		await nextUIUpdate();
	});

	QUnit.test("noDataText", async function(assert) {
		var oTable = Element.getElementById("PC1-Table");
		assert.ok(!oPC1.getNoDataText(), "noDataText empty by default");
		assert.ok(!oTable.getProperty("noDataText"), "noDataText of table empty by default"); // use getProperty("noDataText") because getter is overwritten in ListBase

		oPC1.setNoDataText("Test");
		await nextUIUpdate();
		assert.equal(oPC1.getNoDataText(), "Test", "noDataText set");
		assert.equal(oTable.getProperty("noDataText"), "Test", "noDataText set on table");

		oPC1.setNoDataText(null);
		await nextUIUpdate();
	});

	QUnit.test("Calendar: minDate/maxDate", function(assert) {
		assert.ok(!oPC1.getMinDate(), "no minDate set by default");
		assert.ok(!Element.getElementById("PC1-Header-Cal").getMinDate(), "Calendar no minDate set by default");

		assert.ok(!oPC1.getMaxDate(), "no maxDate set by default");
		assert.ok(!Element.getElementById("PC1-Header-Cal").getMaxDate(), "Calendar no maxDate set by default");

		var oMinDate = UI5Date.getInstance(2000, 0 , 1, 0, 0, 0);
		oPC1.setMinDate(oMinDate);
		assert.ok(deepEqual(oMinDate, oPC1.getMinDate()), "no minDate set");
		assert.ok(deepEqual(oMinDate, Element.getElementById("PC1-Header-Cal").getMinDate()), "Calendar minDate set");

		var oMaxDate = UI5Date.getInstance(2050, 11 , 31, 23, 59, 59);
		oPC1.setMaxDate(oMaxDate);
		assert.ok(deepEqual(oMaxDate, oPC1.getMaxDate()), "no minDate set");
		assert.ok(deepEqual(oMaxDate, Element.getElementById("PC1-Header-Cal").getMaxDate()), "Calendar maxDate set");

		oPC1.setMinDate();
		assert.ok(!oPC1.getMinDate(), "no minDate set");
		assert.ok(!Element.getElementById("PC1-Header-Cal").getMinDate(), "Calendar no minDate");

		oPC1.setMaxDate();
		assert.ok(!oPC1.getMaxDate(), "no maxDate");
		assert.ok(!Element.getElementById("PC1-Header-Cal").getMaxDate(), "Calendar no maxDate");
	});

	QUnit.test("CustomMonthPicker: minDate/maxDate", function(assert) {
		// Prepare
		var oMinDate = UI5Date.getInstance(2000, 0 , 1, 0, 0, 0),
			oMaxDate = UI5Date.getInstance(2050, 11 , 31, 23, 59, 59),
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
		var oMinDate = UI5Date.getInstance(2000, 0 , 1, 0, 0, 0),
			oMaxDate = UI5Date.getInstance(2050, 11 , 31, 23, 59, 59),
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

	QUnit.test("rows", async function(assert) {
		var oSpyRerender;
		var oTable = Element.getElementById("PC1-Table");
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
		await nextUIUpdate();
		assert.equal(oTable.getItems().length, 3, "Table rows");
		assert.equal(oTable.getItems()[2].getId(), "NewRow-CLI", "new row added to table");
		assert.ok(jQuery("#NewRow-Head").get(0), "new row Header rendered");
		assert.ok(jQuery("#NewRow-CalRow").get(0), "new row CalendarRow rendered");
		assert.equal(_getRowTimeline(oRow).getStartDate().getTime(), oPC1.getStartDate().getTime(), "Start date of CalendarRow");
		assert.equal(_getRowTimeline(oRow).getIntervalType(), CalendarIntervalType.Month, "IntervalType of CalendarRow");
		assert.equal(_getRowTimeline(oRow).getIntervals(), iIntervals, "Intervals of CalendarRow");

		oPC1.removeRow(oRow);
		await nextUIUpdate();
		assert.equal(oTable.getItems().length, 2, "Table rows");
		assert.ok(!jQuery("#NewRow-Head").get(0), "new row Header not rendered");
		assert.ok(!jQuery("#NewRow-CalRow").get(0), "new row CalendarRow not rendered");

		oPC1.insertRow(oRow, 1);
		await nextUIUpdate();
		assert.equal(oTable.getItems().length, 3, "Table rows");
		assert.equal(oTable.getItems()[1].getId(), "NewRow-CLI", "new row added to table");
		assert.ok(jQuery("#NewRow-Head").get(0), "new row Header rendered");
		assert.ok(jQuery("#NewRow-CalRow").get(0), "new row CalendarRow rendered");
		assert.equal(_getRowTimeline(oRow).getStartDate().getTime(), oPC1.getStartDate().getTime(), "Start date of CalendarRow");
		assert.equal(_getRowTimeline(oRow).getIntervalType(), CalendarIntervalType.Month, "IntervalType of CalendarRow");
		assert.equal(_getRowTimeline(oRow).getIntervals(), iIntervals, "Intervals of CalendarRow");

		var aRemoved = oPC1.removeAllRows();
		await nextUIUpdate();
		assert.equal(oTable.getItems().length, 0, "Table rows removed");
		assert.equal(aRemoved.length, 3, "3 rows removed");

		for (var i = 0; i < aRemoved.length; i++) {
			aRemoved[i].destroy();
		}

		// eslint-disable-next-line require-atomic-updates
		oPC1 = await initPlanningCalendar("PC1", "SF1", "B1");
		oTable = Element.getElementById("PC1-Table");

		oSpyRerender = this.spy(oPC1, "invalidate");
		oPC1.destroyRows();
		await nextUIUpdate();
		assert.equal(oTable.getItems().length, 0, "Table rows destroyed");
		assert.ok(!Element.getElementById("PC1-Row1"), "Row1 destroyed");
		assert.ok(oSpyRerender.callCount > 0, "Calendar was rerendered");

		// eslint-disable-next-line require-atomic-updates
		oPC1 = await initPlanningCalendar("PC1", "SF1", "B1");
	});

	QUnit.test("views", async function(assert) {
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
		await nextUIUpdate();
		assert.equal(oPC1.getViews().length, 2, "2 views set");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Day, "CalendarRow1 intervalType");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getShowSubIntervals(), true, "CalendarRow1 subIntervals");
		if (jQuery("#PC1").outerWidth() > 1100) {
			assert.equal(Element.getElementById("PC1-Row1-CalRow").getIntervals(), 6, "CalendarRow1 intervals");
		}
		assert.ok(!jQuery("#PC1-TimesRow").get(0), "TimesRow not rendered");
		assert.ok(jQuery("#PC1-DatesRow").get(0), "DatesRow rendered");

		oView.setIntervalsL(5);
		await nextUIUpdate();
		if (jQuery("#PC1").outerWidth() > 1100) {
			assert.equal(Element.getElementById("PC1-Row1-CalRow").getIntervals(), 5, "CalendarRow1 intervals");
		}

		oPC1.destroyViews();
		oPC1.setViewKey(CalendarIntervalType.Hour);
		await nextUIUpdate();
		assert.equal(oPC1.getViews().length, 0, "no views set in aggregation");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getIntervalType(), CalendarIntervalType.Hour, "CalendarRow1 intervalType");
		assert.equal(Element.getElementById("PC1-Row1-CalRow").getShowSubIntervals(), false, "CalendarRow1 subIntervals");
	});

	QUnit.test("specialDates", async function(assert) {

		var oTimesRow = Element.getElementById("PC1-TimesRow");
		assert.equal(oTimesRow.getSpecialDates().length, 2, "TimesRow gets SpecialDates from PlanningCalendar");
		assert.ok(jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate rendered");

		oPC1.addSpecialDate(new DateTypeRange("SD1", {
			startDate: UI5Date.getInstance(2015, 0, 1, 15, 30),
			type: CalendarDayType.Type01,
			tooltip: "Test"
		}));
		await nextUIUpdate();
		assert.ok(jQuery("#PC1-TimesRow-201501011500").hasClass("sapUiCalItemType01"), "new SpecialDate rendered");

		oPC1.insertSpecialDate(new DateTypeRange("SD2", {
			startDate: UI5Date.getInstance(2015, 0, 1, 16, 30),
			type: CalendarDayType.Type01,
			tooltip: "Test"
		}), 1);
		await nextUIUpdate();
		assert.ok(jQuery("#PC1-TimesRow-201501011600").hasClass("sapUiCalItemType01"), "new SpecialDate rendered");

		var oSD = oPC1.removeSpecialDate("SD1");
		await nextUIUpdate();
		assert.ok(!jQuery("#PC1-TimesRow--TimesRow-201501011500").hasClass("sapUiCalItemType01"), "new SpecialDate not longer rendered");
		oSD.destroy();

		var aRemoved = oPC1.removeAllSpecialDates();
		await nextUIUpdate();
		assert.equal(aRemoved.length, 3, "3 specialDates removed");
		assert.ok(!jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate not longer rendered");
		assert.ok(!jQuery("#PC1-TimesRow-201501011600").hasClass("sapUiCalItemType01"), "new SpecialDate not longer rendered");

		for (var i = 0; i < aRemoved.length; i++) {
			aRemoved[i].destroy();
		}

		// eslint-disable-next-line require-atomic-updates
		oPC1 = await initPlanningCalendar("PC1", "SF1", "B1");
		assert.ok(jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate rendered again");

		oPC1.destroySpecialDates();
		await nextUIUpdate();
		assert.ok(!jQuery("#PC1-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate not longer rendered");
	});

	QUnit.test("Row header", async function(assert) {
		var oRow = Element.getElementById("PC1-Row1");
		var oRowHeader = _getRowHeader(oRow);

		oRow.setTitle("Test");
		oRow.setText("Test");
		oRow.setIcon("sap-icon://sap-ui5");
		await nextUIUpdate();
		assert.equal(oRowHeader.getTitle(), "Test", "row header Title");
		assert.equal(oRowHeader.getDescription(), "Test", "row header Text");
		assert.equal(oRowHeader.getIcon(), "sap-icon://sap-ui5", "row header icon");
		assert.equal(oRowHeader.getAvatar().getSrc(), "sap-icon://sap-ui5", "row header avatar icon");
	});

	QUnit.test("Row header icon", async function(assert) {
		var oRow = Element.getElementById("PC1-Row1");
		var oRowHeader = _getRowHeader(oRow);

		oRow.setIcon("sap-icon://sap-ui5");
		await nextUIUpdate();

		assert.strictEqual(oRowHeader.getAvatar().getSrc(), oRow.getIcon(), "row header icon is sync with Avatar img");
		assert.ok(oRowHeader.getAvatar().getVisible(),"Avatar is visible when there is icon set");

		oRow.setIcon();
		await nextUIUpdate();

		assert.strictEqual(oRowHeader.getAvatar().getSrc(), oRow.getIcon(), "row header icon is sync with Avatar img");
		assert.notOk(oRowHeader.getAvatar().getVisible(),"Avatar is not visible when there is no icon set");

		oRow.setIcon("../../ui/unified/images/m_01.png");
		await nextUIUpdate();

		assert.strictEqual(oRowHeader.getAvatar().getSrc(), oRow.getIcon(), "row header icon is sync with Avatar img");
		assert.ok(oRowHeader.getAvatar().getVisible(),"Avatar is visible when there is icon set");
	});

	QUnit.test("specialDates in relative period not rendered", async function(assert){
		// arrange
		var oPC11 = createPlanningCalendar("PC11");

		oPC11.setBuiltInViews(["Day", "Hour"]);
		oPC11.setMinDate(this.oPC.getStartDate());
		oPC11.setMaxDate(this.oPC.getStartDate());
		var oView = this.oRelativeView = new PlanningCalendarView({
			key: "test",
					intervalType: "Day",
					relative: true,
					description: "Project in Weeks",
					intervalSize: 7,
					intervalLabelFormatter: function(iIntervalIndex) {
						return "Week " + (iIntervalIndex + 1);
					},
					intervalsS: 4,
					intervalsM: 8,
					intervalsL: 13
		});

		await nextUIUpdate();

		//act
		oPC11.addView(oView);
		oPC11.setViewKey("test");
		await nextUIUpdate();

		// assert
		assert.notOk(jQuery("#oPC11-TimesRow-201501011200").hasClass("sapUiCalItemType02"), "SpecialDate not rendered");

		// act
		oPC11.addSpecialDate(new DateTypeRange("SD1", {
			startDate: UI5Date.getInstance(2015, 0, 1, 15, 30),
			type: CalendarDayType.Type01,
			tooltip: "Test"
		}));
		await nextUIUpdate();

		// assert
		assert.notOk(jQuery("#oPC11-TimesRow-201501011500").hasClass("sapUiCalItemType01"), "new SpecialDate not rendered");

		//act
		oPC11.insertSpecialDate(new DateTypeRange("SD2", {
			startDate: UI5Date.getInstance(2015, 0, 1, 16, 30),
			type: CalendarDayType.Type01,
			tooltip: "Test"
		}), 1);
		await nextUIUpdate();

		// assert
		assert.notOk(jQuery("#oPC11-TimesRow-201501011600").hasClass("sapUiCalItemType01"), "new SpecialDate not rendered");

		// cleanup
		oPC11.destroy();
	});

	QUnit.test("Row nonWorkingIntervals", async function(assert) {
		var oRow = Element.getElementById("PC1-Row1");
		var oTimeline = _getRowTimeline(oRow);

		oRow.setNonWorkingDays([2, 3]);
		oRow.setNonWorkingHours([11, 12]);
		await nextUIUpdate();
		assert.ok(deepEqual(oTimeline.getNonWorkingDays(), [2, 3]), "CalendarRow - nonWorkingDays");
		assert.ok(deepEqual(oTimeline.getNonWorkingHours(), [11, 12]), "CalendarRow - nonWorkingHours");
	});

	QUnit.test("Row selected", async function(assert) {
		var oRow = Element.getElementById("PC1-Row1");
		var oColumnListItem = _getListItem(oRow);
		assert.ok(!oRow.getSelected(), "Row not selected as default");
		assert.ok(!oColumnListItem.getSelected(), "ColumnListItem not selected as default");

		oRow.setSelected(true);
		await nextUIUpdate();
		assert.ok(oRow.getSelected(), "Row now selected");
		assert.ok(oColumnListItem.getSelected(), "ColumnListItem now selected");
	});

	QUnit.test("Row appointments", async function(assert) {
		var oRow = Element.getElementById("PC1-Row1");
		var oTimeline = _getRowTimeline(oRow);
		assert.ok(deepEqual(oRow.getAppointments(), oTimeline.getAppointments()), "CalendarRow appointments");
		assert.equal(oRow.getAppointments().length, 4, "number of appointments");

		var oAppointment = new CalendarAppointment("NewAppointment", {
			startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
			endDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
			type: CalendarDayType.Type10,
			title: "New",
			text: "Appointment",
			tooltip: "Test",
			icon: "sap-icon://sap-ui5"
		});

		oRow.addAppointment(oAppointment);
		await nextUIUpdate();
		assert.equal(oRow.getAppointments().length, 5, "number of appointments after add");
		assert.equal(oRow.getAppointments()[4].getId(), "NewAppointment", "position of new appointments in array");
		assert.ok(oAppointment.getDomRef(), "Appointment rendered");

		oRow.removeAppointment(oAppointment);
		await nextUIUpdate();
		assert.equal(oRow.getAppointments().length, 4, "number of appointments after remove");
		assert.ok(!oAppointment.getDomRef(), "Appointment not rendered");

		oRow.insertAppointment(oAppointment, 1);
		await nextUIUpdate();
		assert.equal(oRow.getAppointments().length, 5, "number of appointments after insert");
		assert.equal(oRow.getAppointments()[1].getId(), "NewAppointment", "position of new appointments in array");
		assert.ok(oAppointment.getDomRef(), "Appointment rendered");

		var aRemoved = oRow.removeAllAppointments();
		await nextUIUpdate();
		assert.equal(oRow.getAppointments().length, 0, "number of appointments after remove all");
		assert.ok(oAppointment, "Appointment still exist");
		assert.ok(!oAppointment.getDomRef(), "Appointment not rendered");
		for (var i = 0; i < aRemoved.length; i++) {
			aRemoved[i].destroy();
		}

		oRow = Element.getElementById("PC1-Row2");
		oTimeline = _getRowTimeline(oRow);
		assert.ok(Element.getElementById("PC1-R2A1"), "Appointment exist before destroy");
		oRow.destroyAppointments();
		await nextUIUpdate();
		assert.equal(oRow.getAppointments().length, 0, "number of appointments after destroy");
		assert.ok(!Element.getElementById("PC1-R2A1"), "Appointment destroyed");

		oPC1 = await initPlanningCalendar("PC1", "SF1", "B1");
	});

	QUnit.test("Row intervalHeaders", async function(assert) {
		var oRow = Element.getElementById("PC1-Row1");
		var oTimeline = _getRowTimeline(oRow);
		assert.ok(deepEqual(oRow.getIntervalHeaders(), oTimeline.getIntervalHeaders()), "CalendarRow IntervalHeaders");
		assert.equal(oRow.getIntervalHeaders().length, 1, "number of IntervalHeaders");

		var oIntervalHeader = new CalendarAppointment("NewIntervalHeader", {
			startDate: UI5Date.getInstance("2015", "0", "1", "12", "00"),
			endDate: UI5Date.getInstance("2015", "0", "1", "15", "00"),
			type: CalendarDayType.Type10,
			title: "New",
			tooltip: "Test",
			icon: "sap-icon://sap-ui5"
		});

		oRow.addIntervalHeader(oIntervalHeader);
		await nextUIUpdate();
		assert.equal(oRow.getIntervalHeaders().length, 2, "number of IntervalHeaders after add");
		assert.equal(oRow.getIntervalHeaders()[1].getId(), "NewIntervalHeader", "position of new IntervalHeaders in array");
		assert.ok(oIntervalHeader.getDomRef(), "IntervalHeader rendered");

		oRow.removeIntervalHeader(oIntervalHeader);
		await nextUIUpdate();
		assert.equal(oRow.getIntervalHeaders().length, 1, "number of IntervalHeaders after remove");
		assert.ok(!oIntervalHeader.getDomRef(), "IntervalHeader not rendered");

		oRow.insertIntervalHeader(oIntervalHeader, 0);
		await nextUIUpdate();
		assert.equal(oRow.getIntervalHeaders().length, 2, "number of IntervalHeaders after insert");
		assert.equal(oRow.getIntervalHeaders()[0].getId(), "NewIntervalHeader", "position of new IntervalHeaders in array");
		assert.ok(oIntervalHeader.getDomRef(), "IntervalHeader rendered");

		var aRemoved = oRow.removeAllIntervalHeaders();
		await nextUIUpdate();
		assert.equal(oRow.getIntervalHeaders().length, 0, "number of IntervalHeaders after remove all");
		assert.ok(oIntervalHeader, "IntervalHeader still exist");
		assert.ok(!oIntervalHeader.getDomRef(), "IntervalHeader not rendered");
		for (var i = 0; i < aRemoved.length; i++) {
			aRemoved[i].destroy();
		}

		oRow = Element.getElementById("PC1-Row2");
		assert.ok(Element.getElementById("PC1-R2H1"), "IntervalHeader exist before destroy");
		oRow.destroyIntervalHeaders();
		await nextUIUpdate();
		assert.equal(oRow.getIntervalHeaders().length, 0, "number of IntervalHeaders after destroy");
		assert.ok(!Element.getElementById("PC1-R2H1"), "IntervalHeader destroyed");

		oPC1 = await initPlanningCalendar("PC1", "SF1", "B1");
	});

	QUnit.test("legend works with sap.ui.unified.CalendarLegend", async function (assert) {
		// arrange
		var oLegendItem = new CalendarLegendItem({
				type: "Type01",
				text: "Text 2"
			}),
			oPC = createPlanningCalendar(
				"invalidationExample",
				new SearchField(),
				new Button(),
				UI5Date.getInstance(Date.UTC(2015, 0, 7)),
				CalendarIntervalType.Week,
				new CalendarLegend({
					items: [oLegendItem]
				})
			);

		// act
		oPC.placeAt("bigUiArea");
		await nextUIUpdate();

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

	QUnit.test("when a function is set to setCustomAppointmentsSorterCallback, it's called", async function (assert) {
		//arrange
		var iRenderingCount = 0,
			oPC = createPlanningCalendar("PC5").addEventDelegate({
				onAfterRendering: function() { iRenderingCount++; }
			}),
			oSortSpy = this.spy(),
			iAppointments = _getAppointmentsCount(oPC);

		//act
		oPC.setCustomAppointmentsSorterCallback(oSortSpy);
		oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		//assert
		assert.equal(iAppointments, 5, "there are totally 5  appointments exists");
		// for the 1st row's 4 sorted appointments the sort method is called 3 times, for the 2nd row there is only 1 appointment
		// the rendering count calculation below can be removed after the invalidation issue during the rendering is fixed in the core
		assert.ok(oSortSpy.callCount / iRenderingCount, 3, "setCustomAppointmentsSorterCallback is called 3 times per rendering");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("when setCustomAppointmentsSorterCallback after rendering, it's setting the new custom sorter", async function (assert) {
		//arrange
		var fnCustom = function() {},
			fnCustom2 = function() {},
			oPC = new PlanningCalendar({
				customAppointmentsSorterCallback: fnCustom
			});
		oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		//act
		oPC.setCustomAppointmentsSorterCallback(fnCustom2);
		await nextUIUpdate();

		//assert
		assert.deepEqual(oPC.getCustomAppointmentsSorterCallback(), fnCustom2, "the second sorter function is set");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("when a new row is added to a PlanningCalendar with a custom sort function set, the row has also custom function set", async function (assert) {
		//arrange
		var fnCustom = function() {},
			oPC = new PlanningCalendar({
				customAppointmentsSorterCallback: fnCustom
			}),
			oRow = new PlanningCalendarRow();
		oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		//act
		oPC.addRow(oRow);
		await nextUIUpdate();

		//assert
		assert.ok(_getRowTimeline(oRow)._fnCustomSortedAppointments, "the custom sorter function is set");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("when a new row is inserted to a PlanningCalendar with a custom sort function set, the row has also custom function set", async function (assert) {
		//arrange
		var fnCustom = function() {},
			oPC = new PlanningCalendar({
				customAppointmentsSorterCallback: fnCustom
			}),
			oRow = new PlanningCalendarRow();
		oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		//act
		oPC.insertRow(oRow);
		await nextUIUpdate();

		//assert
		assert.ok(_getRowTimeline(oRow)._fnCustomSortedAppointments, "the custom sorter function is set");

		//cleanup
		oPC.destroy();
	});

	QUnit.test("Sticky header", async function (assert) {
		// arrange
		var oPC = createPlanningCalendar(
				"invalidationExample",
				new SearchField(),
				new Button(),
				UI5Date.getInstance(Date.UTC(2015, 0, 7)),
				CalendarIntervalType.Week
			);

		// act
		oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		// assert
		assert.equal(oPC.getAggregation("table").getSticky().length, 0, "sticky property shouldn't be set on the info bar and on the toolbar inside Table");

		// act
		oPC.setStickyHeader(true);
		await nextUIUpdate();

		// assert
		assert.equal(oPC.getAggregation("table").getSticky().length, 2, "sticky property should be set on the info bar and on the toolbar inside Table");
		assert.ok(oPC.getAggregation("table").getStickyFocusOffset() > 0, "The sticky UI element has proper focus offset");

		// act
		oPC.setStickyHeader(false);
		await nextUIUpdate();

		// assert
		assert.equal(oPC.getAggregation("table").getSticky().length, 0, "sticky property shouldn't be set on the info bar and on the toolbar inside Table");

		// cleanup
		oPC.destroy();
	});
	QUnit.test("Sticky header resizing", async function (assert) {
		// arrange
		var oPCWithSticky = new PlanningCalendar({
			stickyHeader: true
		});
		oPCWithSticky.placeAt("bigUiArea");
		await nextUIUpdate();

		//act
		var oResizingSpy = this.spy(oPCWithSticky, "_adjustColumnHeadersTopOffset");
		oPCWithSticky.setWidth("800px");
		await nextUIUpdate();

		// assert
		assert.equal(oResizingSpy.callCount, 4, "_adjustColumnHeadersTopOffset is called four times");

		// cleanup
		oPCWithSticky.destroy();
	});

	QUnit.test("singleSelection setter", function(assert) {
		var oTable = Element.getElementById("SelectionMode-Table");

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

	QUnit.test("SelectAllCheckBox initial placement - desktop", async function() {
		// Prepare
		this.oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		// Assert
		this.checkInitItemPlacement();
	});

	QUnit.test("SelectAllCheckBox initial placement - tablet/phone", async function() {
		// Prepare
		this.oPC.placeAt("smallUiArea");
		await nextUIUpdate();

		// Assert
		this.checkInitItemPlacement();
	});

	QUnit.test("SelectAllCheckBox placement in multiple selection mode - desktop", async function() {
		// Prepare
		this.oPC.setSingleSelection(false);
		this.oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		// Prepare
		this.oPC.setSingleSelection(false);
		await nextUIUpdate();

		// Assert
		// there should be 2 items in the infoToolbar content when selectAll checkBox exists.
		this.checkItemPlacementInMultiSel(2);
	});

	QUnit.test("SelectAllCheckBox placement in multiple selection mode - tablet/phone", async function() {
		// Prepare
		this.oPC.setSingleSelection(false);
		this.oPC.placeAt("smallUiArea");
		await nextUIUpdate();

		// Assert
		// there should be 3 items in the infoToolbar content when selectAll checkBox exists.
		this.checkItemPlacementInMultiSel(3);
	});

	QUnit.test("SelectAllCheckBox placement after changing the view - desktop", async function() {
		// Check only for Day, Month and Hour view, because TimesRow, DatesRow and
		// MonthsRow represent all 5 existing intervals. That is because the two left intervals
		// (OneMonthsRow and WeeksRow) inherit DatesRow one.
		var aCalTypes = [CalendarIntervalType.Day, CalendarIntervalType.Month, CalendarIntervalType.Hour];

		// Prepare
		this.oPC.placeAt("bigUiArea");
		this.oPC.setSingleSelection(false);

		aCalTypes.forEach(async function (oType) {
			// Act
			this.oPC.setViewKey(oType);
			await nextUIUpdate(this.clock);

			// Assert
			// there should be 2 items in the _oInfoToolbar content
			this.checkItemPlacementInMultiSel(2);
		}.bind(this));
		await nextUIUpdate(this.clock);
	});

	QUnit.test("SelectAllCheckBox placement after changing the view - tablet/phone", async function() {
		// Check only for Day, Month and Hour view, because TimesRow, DatesRow and
		// MonthsRow represent all 5 existing intervals. That is because the two left intervals
		// (OneMonthsRow and WeeksRow) inherit DatesRow one.
		var aCalTypes = [CalendarIntervalType.Day, CalendarIntervalType.Month, CalendarIntervalType.Hour];

		// Prepare
		this.oPC.placeAt("smallUiArea");
		this.oPC.setSingleSelection(false);

		aCalTypes.forEach(async function (oType) {
			// Act
			this.oPC.setViewKey(oType);
			await nextUIUpdate();

			// Assert
			// there should be 3 items in the _oInfoToolbar content
			this.checkItemPlacementInMultiSel(3);
		}.bind(this));
		await nextUIUpdate();
	});

	QUnit.test("SelectAllCheckBox placement after hiding the row headers - desktop", async function() {
		// Prepare
		this.oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		// Act
		// argument: true - desktop; false - tablet or phone
		this.oPC.setSingleSelection(false);
		this.oPC.setShowRowHeaders(false);

		// Assert
		this.checkItemPlacementAfterHidingRowHeaders(true);
	});

	QUnit.test("SelectAllCheckBox placement after hiding the row headers - tablet/phone", async function() {
		// Prepare
		this.oPC.placeAt("smallUiArea");
		await nextUIUpdate();

		// Act
		this.oPC.setSingleSelection(false);
		this.oPC.setShowRowHeaders(false);

		// Assert
		// argument: true - desktop; false - tablet or phone
		this.checkItemPlacementAfterHidingRowHeaders(false);
	});

	QUnit.test("firstDayOfWeek", async function(assert) {
		var oStartDate = UI5Date.getInstance(2015, 0, 1, 8),
			sCurrentPickerId, oPicker, oRow, aDays, $Date, oErrorSpy;

		// Prepare
		this.oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		sCurrentPickerId = this.oPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);
		oRow = this.oPC.getAggregation("table").getInfoToolbar().getContent()[1];

		// Act
		this.oPC.setFirstDayOfWeek(3);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 3, "firstDayOfWeek in Hours view propagated to picker");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of TimesRow not changed");

		// Act
		this.oPC.setViewKey("Day");
		await nextUIUpdate();

		sCurrentPickerId = this.oPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);
		oRow = this.oPC.getAggregation("table").getInfoToolbar().getContent()[1];

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 3, "firstDayOfWeek in Days view propagated to picker");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of DatesRow not changed");

		// Act
		this.oPC.setViewKey("Month");
		await nextUIUpdate();

		sCurrentPickerId = this.oPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);
		oRow = this.oPC.getAggregation("table").getInfoToolbar().getContent()[1];

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), -1, "firstDayOfWeek in Month view not propagated to picker");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of MonthsRow not changed");

		// Act
		this.oPC.setViewKey("Week");
		await nextUIUpdate();

		sCurrentPickerId = this.oPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);
		oRow = this.oPC.getAggregation("table").getInfoToolbar().getContent()[1];
		oStartDate.setFullYear(2014, 11, 31, 8);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 3, "firstDayOfWeek in Week view propagated to picker");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of WeeksRow changed");

		// Act
		this.oPC.setFirstDayOfWeek(2);
		await nextUIUpdate();

		oStartDate.setDate(30);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 2, "firstDayOfWeek in Week view propagated to picker");
		assert.strictEqual(oRow.getFirstDayOfWeek(), 2, "firstDayOfWeek of WeeksRow changed");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of WeeksRow changed");

		// Act
		this.oPC.setStartDate(UI5Date.getInstance(2014, 11, 22, 8));
		await nextUIUpdate();

		aDays = oRow.getDomRef().querySelectorAll(".sapUiCalItem");
		$Date = aDays[6];

		// Assert
		assert.strictEqual($Date.getAttribute("data-sap-day"), "20141222", "passed startDate is always visible");

		// Act
		this.oPC.setViewKey("One Month");
		await nextUIUpdate();

		sCurrentPickerId = this.oPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);
		oRow = this.oPC.getAggregation("table").getInfoToolbar().getContent()[1];
		oStartDate.setDate(1);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), -1, "firstDayOfWeek in OneMonth view not propagated to picker");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of DatesRow changed");

		// Act
		this.oPC.placeAt("smallUiArea");
		await nextUIUpdate();
		oStartDate.setFullYear(2014, 11, 1, 8);

		// Assert
		assert.strictEqual(oRow.getFirstDayOfWeek(), 2, "firstDayOfWeek of DatesRow changed");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of DatesRow changed");

		// Act
		this.oPC.setFirstDayOfWeek(5);
		await nextUIUpdate();

		sCurrentPickerId = this.oPC._getHeader().getAssociation("currentPicker");
		oPicker = Element.getElementById(sCurrentPickerId);

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), 5, "firstDayOfWeek in OneMonth view propagated to picker");
		assert.strictEqual(oRow.getFirstDayOfWeek(), 5, "firstDayOfWeek of DatesRow changed");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of DatesRow not changed");

		// Act
		this.oPC.setFirstDayOfWeek(-1);
		await nextUIUpdate();

		aDays = oRow.getDomRef().querySelectorAll(".sapUiCalItem");
		$Date = aDays[0];

		// Assert
		assert.strictEqual(oPicker.getFirstDayOfWeek(), -1, "firstDayOfWeek in OneMonth view propagated to picker");
		assert.strictEqual(oRow.getFirstDayOfWeek(), -1, "firstDayOfWeek of DatesRow changed");
		assert.strictEqual($Date.getAttribute("data-sap-day"), "20141201", "correct first rendered date");
		assert.strictEqual(oRow.getStartDate().getTime(), oStartDate.getTime(), "startDate of DatesRow not changed");

		oErrorSpy = this.spy(BaseLog, "error");

		// Act
		this.oPC.setFirstDayOfWeek(10);

		// Assert
		assert.strictEqual(oErrorSpy.callCount, 1, "There is an error in the console when invalid value is passed.");
		assert.strictEqual(this.oPC.getFirstDayOfWeek(), -1, "The value is not set.");

	});

	QUnit.module("NonWorking Special Dates", {
		beforeEach: function() {
			this.oPC = createPlanningCalendar("PCNonWorking", new SearchField(), new Button());
			this.oSpecialDate = new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 1, 15, 30),
				type: CalendarDayType.NonWorking
			});
			this.oSecondSpecialDate = new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 1, 2, 15, 30),
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
				startDate: UI5Date.getInstance(2015, 0, 1),
				type: CalendarDayType.NonWorking
			});
			this.oSpecialDateRangeNW = new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 14),
				endDate: UI5Date.getInstance(2015, 0, 14),
				type: CalendarDayType.NonWorking
			});
			this.oSpecialDateRangeType04 = new DateTypeRange({
				startDate: UI5Date.getInstance(2015, 0, 7),
				endDate: UI5Date.getInstance(2015, 0, 9),
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
				QUnit.assert.ok(!oRow.getAggregation("specialDates") ||
					oRow.getAggregation("specialDates").length === 0,
					"PlanningCalendarRow should have no items in its aggregation specialDates");
			});
		},

		_assertIsSpecialDateAvailable: function(oDate, oSecondDate, oThirdDate) {
			// assuming that in the first PCRow there are no items in the specialDates aggregation set
			// assuming that in the second PCRow there are 2 specialDates set to the aggregation - one with only startDate set of type NonWorking
			// and one with startDate and endDate of type 04.
			var oRowNoWork = this.oPC.getAggregation("rows")[1].getAggregation("specialDates");

			QUnit.assert.equal(this.oPC.getAggregation("rows")[0].getAggregation("specialDates").length, 0, "first PlanningCalendarRow should have no items in its aggregation specialDates");
			QUnit.assert.equal(oRowNoWork.length, 3, " second PlanningCalendarRow should have 3 items in its aggregation specialDates");
			QUnit.assert.equal(oRowNoWork[0].getStartDate().toString(), oDate.getStartDate().toString(), "the right start of the special date is set");
			QUnit.assert.equal(oRowNoWork[0].getEndDate(), null, "the special date should have no endDate");
			QUnit.assert.equal(oRowNoWork[0].getType(), CalendarDayType.NonWorking, "the special date should be of type NonWorking");
			QUnit.assert.equal(oRowNoWork[1].getStartDate().toString(), oSecondDate.getStartDate().toString(), "the right start of the special date range is set");
			QUnit.assert.equal(oRowNoWork[1].getEndDate().toString(), oSecondDate.getEndDate().toString(), "the right end of the special date range is set");
			QUnit.assert.equal(oRowNoWork[1].getType(), CalendarDayType.NonWorking, "the special date should be of type NonWorking");
			QUnit.assert.equal(oRowNoWork[2].getStartDate().toString(), oThirdDate.getStartDate().toString(), "the right start of the special date range is set");
			QUnit.assert.equal(oRowNoWork[2].getEndDate().toString(), oThirdDate.getEndDate().toString(), "the right end of the special date range is set");
			QUnit.assert.equal(oRowNoWork[2].getType(), CalendarDayType.Type04, "the special date should be of type Type04");
		},

		_assertIsClassNoWorkAvailable: function () {
			var aIntervals = jQuery("#PCSpecialDatesInRows-Row2-CalRow-Apps").children(".sapUiCalendarRowAppsInt");

			QUnit.assert.ok(jQuery(aIntervals[0]).hasClass("sapUiCalendarRowAppsNoWork"), "interval0 has class sapUiCalendarRowAppsNoWork because it is a special date");
			QUnit.assert.ok(!jQuery(aIntervals[1]).hasClass("sapUiCalendarRowAppsNoWork"), "interval0 has no class sapUiCalendarRowAppsNoWork");
			QUnit.assert.ok(!jQuery(aIntervals[2]).hasClass("sapUiCalendarRowAppsNoWork"), "interval02 has no class sapUiCalendarRowAppsNoWork");
			QUnit.assert.ok(!jQuery(aIntervals[3]).hasClass("sapUiCalendarRowAppsNoWork"), "interval03 has no class sapUiCalendarRowAppsNoWork");
			QUnit.assert.ok(!jQuery(aIntervals[4]).hasClass("sapUiCalendarRowAppsNoWork"), "interval04 has no class sapUiCalendarRowAppsNoWork");
			QUnit.assert.ok(jQuery(aIntervals[5]).hasClass("sapUiCalendarRowAppsNoWork"), "interval05 has class sapUiCalendarRowAppsNoWork because it is a non-working day");
			QUnit.assert.ok(jQuery(aIntervals[6]).hasClass("sapUiCalendarRowAppsNoWork"), "interval06 has class sapUiCalendarRowAppsNoWork because it is a non-working day");
			QUnit.assert.ok(!jQuery(aIntervals[7]).hasClass("sapUiCalendarRowAppsNoWork"), "interval07 has no class sapUiCalendarRowAppsNoWork");
			QUnit.assert.ok(!jQuery(aIntervals[8]).hasClass("sapUiCalendarRowAppsNoWork"), "interval08 has no class sapUiCalendarRowAppsNoWork, because it is a special date of other type than non-working");
			QUnit.assert.ok(!jQuery(aIntervals[9]).hasClass("sapUiCalendarRowAppsNoWork"), "interval09 has no class sapUiCalendarRowAppsNoWork, because it is a special date of other type than non-working");
			QUnit.assert.ok(!jQuery(aIntervals[10]).hasClass("sapUiCalendarRowAppsNoWork"), "interval10 has no class sapUiCalendarRowAppsNoWork");
			QUnit.assert.ok(!jQuery(aIntervals[11]).hasClass("sapUiCalendarRowAppsNoWork"), "interval11 has no class sapUiCalendarRowAppsNoWork");
			QUnit.assert.ok(jQuery(aIntervals[12]).hasClass("sapUiCalendarRowAppsNoWork"), "interval12 has class sapUiCalendarRowAppsNoWork because it is a non-working day");
			QUnit.assert.ok(jQuery(aIntervals[13]).hasClass("sapUiCalendarRowAppsNoWork"), "interval13 has class sapUiCalendarRowAppsNoWork because it is a non-working day and a special date");
		},

		_assertIsClassNoWorkNotAvailable: function () {
			var aIntervals = jQuery("#PCSpecialDatesInRows-Row2-CalRow-Apps").children(".sapUiCalendarRowAppsInt");
			for (var i = 0; i < aIntervals.length; i++) {
				if (i === 5 || i === 6 || i === 12 || i === 13) {
					QUnit.assert.ok(jQuery(aIntervals[i]).hasClass("sapUiCalendarRowAppsNoWork"), "interval" + i + " has class sapUiCalendarRowAppsNoWork because it is a non-working day");
				} else {
					QUnit.assert.ok(!jQuery(aIntervals[i]).hasClass("sapUiCalendarRowAppsNoWork"), "interval" + i + " has no class sapUiCalendarRowAppsNoWork");
				}
			}
		}
	});

	QUnit.test("Add a special date to a row", async function(assert) {
		//Act
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.setViewKey("Day");
		await nextUIUpdate();
		//Assert
		this._assertIsSpecialDateAvailable(this.oDateNW, this.oSpecialDateRangeNW, this.oSpecialDateRangeType04);
		this._assertIsClassNoWorkAvailable();
	});

	QUnit.test("Add a special date with dual property to a row", async function(assert) {
		//Act
		this.oPC.getAggregation("rows")[1].addSpecialDate(new DateTypeRange({
			startDate: UI5Date.getInstance(2015, 0, 7),
			endDate: UI5Date.getInstance(2015, 0, 9),
			type: CalendarDayType.Type04,
			secondaryType: CalendarDayType.NonWorking
		}));
		await nextUIUpdate();

		var oSpecialDates = this.oPC.getAggregation("rows")[1]._getSpecialDates();
		assert.equal(oSpecialDates[0].getType(), CalendarDayType.Type04, "The special date should be of type Type04");
		assert.equal(oSpecialDates[1].getType(), CalendarDayType.NonWorking, "the special date should be of type NonWorking");
	});

	QUnit.test("Insert a special date in a row", async function(assert) {
		//Prepare
		this.oPC.getAggregation("rows")[1].insertSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].insertSpecialDate(this.oSpecialDateRangeNW);
		//Act
		this.oPC.getAggregation("rows")[1].insertSpecialDate(this.oDateNW, 0);
		this.oPC.setViewKey("Day");
		await nextUIUpdate();
		//Assert
		assert.equal(this.oPC.getAggregation("rows")[1].indexOfAggregation("specialDates", this.oDateNW), 0, "Insert a special date at index 0");
		this._assertIsSpecialDateAvailable(this.oDateNW, this.oSpecialDateRangeNW, this.oSpecialDateRangeType04);
		this._assertIsClassNoWorkAvailable();
	});

	QUnit.test("Remove a special date from a row", async function(assert) {
		//Prepare
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeNW);
		//Act
		this.oPC.getAggregation("rows")[1].removeSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].removeSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].removeSpecialDate(this.oSpecialDateRangeNW);
		this.oPC.setViewKey("Day");
		await nextUIUpdate();
		//Assert
		this._assertSpecialDatesEmpty();
		this._assertIsClassNoWorkNotAvailable();
	});

	QUnit.test("Remove all special dates in a row", async function(assert) {
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeNW);
		//Act
		this.oPC.getAggregation("rows")[1].removeAllSpecialDates();
		this.oPC.setViewKey("Day");
		await nextUIUpdate();
		//Assert
		this._assertSpecialDatesEmpty();
		this._assertIsClassNoWorkNotAvailable();
	});

	QUnit.test("Destroy all special dates from a row", async function(assert) {
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oDateNW);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeType04);
		this.oPC.getAggregation("rows")[1].addSpecialDate(this.oSpecialDateRangeNW);
		//Act
		this.oPC.getAggregation("rows")[1].destroySpecialDates();
		this.oPC.setViewKey("Day");
		await nextUIUpdate();
		//Assert
		this._assertSpecialDatesEmpty();
		this._assertIsClassNoWorkNotAvailable();
	});

	QUnit.test("Working days", function(assert) {
		// Prepare
		var oPC = new PlanningCalendar({
				builtInViews: ["Day", "OneMonth", "Week"],
				startDate: UI5Date.getInstance(2023, 10, 1),
				specialDates: [
					new DateTypeRange({
						startDate: UI5Date.getInstance(2023, 10, 1),
						endDate: UI5Date.getInstance(2023, 10, 3),
						type: "Type06",
						secondaryType: "Working"
					}),
					new DateTypeRange({
						startDate: UI5Date.getInstance(2023, 10, 2),
						type: "NonWorking"
					}),
					new DateTypeRange({
						startDate: UI5Date.getInstance(2023, 10, 4),
						type: "Working"
					}),
					new DateTypeRange({
						startDate: UI5Date.getInstance(2023, 10, 6),
						type: "NonWorking"
					})
				],
				rows: [
					new PlanningCalendarRow({
						nonWorkingDays: [3, 5],
						title: "One",
						specialDates: [
							new DateTypeRange({
								startDate: UI5Date.getInstance(2023, 10, 2),
								type: "NonWorking"
							}),
							new DateTypeRange({
								startDate: UI5Date.getInstance(2023, 10, 3),
								type: "Working"
							}),
							new DateTypeRange({
								startDate: UI5Date.getInstance(2023, 10, 4),
								type: "NonWorking"
							}),
							new DateTypeRange({
								startDate: UI5Date.getInstance(2023, 10, 5),
								type: "Working"
							})
						]
					})
				]
			}),
			oPlanningCalendarRowTimeLine = oPC.getAggregation("table").getItems()[0].getCells()[1],
			aNonWorkingDays = oPlanningCalendarRowTimeLine._getNonWorkingDays(),
			iStartOffest = oPlanningCalendarRowTimeLine._getStartDate().getUTCDate(),
			iNonWorkingMax = 7;

		// Act
		// Assert
		assert.notOk(oPlanningCalendarRowTimeLine._isNonWorkingInterval(0, aNonWorkingDays, iStartOffest, iNonWorkingMax), "1st of November is a working day");
		assert.ok(oPlanningCalendarRowTimeLine._isNonWorkingInterval(1, aNonWorkingDays, iStartOffest, iNonWorkingMax), "2nd of November is a non working day");
		assert.notOk(oPlanningCalendarRowTimeLine._isNonWorkingInterval(2, aNonWorkingDays, iStartOffest, iNonWorkingMax), "3d of November is a working day");
		assert.ok(oPlanningCalendarRowTimeLine._isNonWorkingInterval(3, aNonWorkingDays, iStartOffest, iNonWorkingMax), "4th of November is a non-working day");
		assert.notOk(oPlanningCalendarRowTimeLine._isNonWorkingInterval(4, aNonWorkingDays, iStartOffest, iNonWorkingMax), "5th of November is a working day");
	});

	QUnit.module("events");

	QUnit.test("appointmentSelect", async function(assert) {
		oSelectedAppointment = undefined;
		qutils.triggerEvent("tap", "PC1-R1A1");
		assert.equal(oSelectedAppointment.getId(), "PC1-R1A1", "appointmentSelect event fired and appointment returned");
		assert.ok(Element.getElementById("PC1-R1A1").getSelected(), "Appointment is selected");
		assert.equal(sDomRefId, "PC1-R1A1", "sDomRefId returns the right ID of the appointment if clicked on the whole appointment");
		qutils.triggerEvent("tap", "PC1-R1A1-Title");
		assert.equal(sDomRefId, "PC1-R1A1", "sDomRefId returns the right ID of the appointment if clicked on the title of the appointment");
		qutils.triggerEvent("tap", "PC1-R1A1-Text");
		assert.equal(sDomRefId, "PC1-R1A1", "sDomRefId returns the right ID of the appointment if clicked on the text of the appointment");

		oSelectedAppointment = undefined;
		oPC1.setViewKey(CalendarIntervalType.Month);
		await nextUIUpdate();
		qutils.triggerEvent("tap", "PC1-Row1-CalRow-Group0");

		assert.equal(sDomRefId, "PC1-Row1-CalRow-Group0", "sDomRefId returns the right ID of the group appointment");

		oPC1.setViewKey(CalendarIntervalType.Hours);
		await nextUIUpdate();
	});

	QUnit.test('Old event handlers are cleaned up before reattaching', function(assert) {
		var row = oPC1.getRows()[0];
		var oRowTimeline = _getRowTimeline(row);
		var oDetachSpy = this.spy(oRowTimeline, 'detachEvent');
		var oAttachSpy = this.spy(oRowTimeline, 'attachEvent');

		oPC1._updateRowTimeline(row);

		assert.ok(oAttachSpy.calledAfter(oDetachSpy), 'Attach is called after Detach.');

	});

	QUnit.test("appointmentSelect for group appointments", async function(assert) {
		// arrange
		var oPC = createPlanningCalendar("PC9").placeAt("qunit-fixture"),
			aSelectedAppointments;

		oPC.attachEvent("appointmentSelect", function(oEvent) {
			aSelectedAppointments = oEvent.getParameter("appointments");
		});

		oPC.setViewKey(CalendarIntervalType.Month);
		await nextUIUpdate();

		// act
		qutils.triggerEvent("tap", "PC9-Row1-CalRow-Group0");

		// assert
		assert.ok(aSelectedAppointments[0].getSelected(), "The appointment is selected as part of a group");
		assert.ok(aSelectedAppointments[1].getSelected(), "The appointment is selected as part of a group");

		// act
		qutils.triggerEvent("tap", "PC9-Row1-CalRow-Group0");

		// assert
		assert.notOk(aSelectedAppointments[0].getSelected(), "The appointment is deselected as part of a group");
		assert.notOk(aSelectedAppointments[1].getSelected(), "The appointment is deselected as part of a group");

		// clean
		oPC.destroy();
	});

	QUnit.test("rowSelectionChange", async function(assert) {
		assert.equal(oPC1.getSelectedRows().length, 0, "No rows selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;
		qutils.triggerEvent("tap", "PC1-Row1-CLI-cell0");
		assert.ok(bRowSelectionChange, "rowSelectionChange fired");
		assert.equal(aChangedRows.length, 1, "one row changed");
		assert.equal(aChangedRows[0].getId(), "PC1-Row1", "Row1 changed");
		assert.ok(Element.getElementById("PC1-Row1").getSelected(), "Row1 is selected");
		assert.equal(oPC1.getSelectedRows().length, 1, "one row selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;

		qutils.triggerEvent("tap", "PC1-Row2-CLI-cell0");
		assert.ok(bRowSelectionChange, "rowSelectionChange fired");
		assert.equal(aChangedRows.length, 2, "two row changed");
		assert.equal(aChangedRows[0].getId(), "PC1-Row1", "Row1 changed");
		assert.equal(aChangedRows[1].getId(), "PC1-Row2", "Row2 changed");
		assert.ok(!Element.getElementById("PC1-Row1").getSelected(), "Row1 is not selected");
		assert.ok(Element.getElementById("PC1-Row2").getSelected(), "Row2 is selected");
		assert.equal(oPC1.getSelectedRows().length, 1, "one row selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;
		oPC1.setSingleSelection(false);
		await nextUIUpdate();
		qutils.triggerEvent("tap", "PC1-All");
		assert.ok(bRowSelectionChange, "rowSelectionChange fired");
		assert.equal(aChangedRows.length, 1, "one row changed");
		assert.equal(aChangedRows[0].getId(), "PC1-Row1", "Row1 changed");
		assert.ok(Element.getElementById("PC1-Row1").getSelected(), "Row1 is selected");
		assert.ok(Element.getElementById("PC1-Row2").getSelected(), "Row2 is selected");
		assert.equal(oPC1.getSelectedRows().length, 2, "2 row selected");

		bRowSelectionChange = false;
		aChangedRows = undefined;
		oPC1.setSingleSelection(true);
		await nextUIUpdate();
		assert.ok(!bRowSelectionChange, "rowSelectionChange not fired");
		assert.ok(!Element.getElementById("PC1-Row1").getSelected(), "Row1 is not selected");
		assert.ok(!Element.getElementById("PC1-Row2").getSelected(), "Row2 is not selected");
		assert.equal(oPC1.getSelectedRows().length, 0, "No row selected");

		bRowSelectionChange = false;
	});

	QUnit.test("startDateChange", async function(assert) {
		bStartDateChange = false;
		// via navigation on TimesRow
		qutils.triggerEvent("tap", "PC1-Header-NavToolbar-PrevBtn");
		assert.ok(bStartDateChange, "startDateChange fired");
		var oStartDate = oPC1.getStartDate();
		var oExpectedDate = UI5Date.getInstance("2014", "11", "31", "20", "00");

		if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]) {
			oExpectedDate = UI5Date.getInstance("2015", "0", "1", "02", "00");
		} else if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]) {
			oExpectedDate = UI5Date.getInstance("2015", "0", "1", "02", "00");
		}

		assert.equal(oExpectedDate.getTime(), oStartDate.getTime(), "Start date is OK");

		bStartDateChange = false;
		// via navigation on DatesRow
		oPC1.setViewKey(CalendarIntervalType.Day);
		await nextUIUpdate();
		qutils.triggerEvent("tap", "PC1-Header-NavToolbar-PrevBtn");
		assert.ok(bStartDateChange, "startDateChange fired");
		oStartDate = oPC1.getStartDate();
		oExpectedDate = UI5Date.getInstance("2014", "11", "17", "20", "00");
		if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]) {
			oExpectedDate = UI5Date.getInstance("2014", "11", "25", "02", "00");
		} else if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]) {
			oExpectedDate = UI5Date.getInstance("2014", "11", "25", "02", "00");
		}
		assert.equal(oExpectedDate.getTime(), oStartDate.getTime(), "Start date is OK");

		bStartDateChange = false;
		// via navigation on MonthsRow
		oPC1.setViewKey(CalendarIntervalType.Month);
		await nextUIUpdate();
		qutils.triggerEvent("tap", "PC1-Header-NavToolbar-PrevBtn");
		assert.ok(bStartDateChange, "startDateChange fired");
		oStartDate = oPC1.getStartDate();
		oExpectedDate = UI5Date.getInstance("2013", "11", "01", "20", "00");
		if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]) {
			oExpectedDate = UI5Date.getInstance("2014", "08", "01", "02", "00");
		} else if (jQuery("#PC1").outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]) {
			oExpectedDate = UI5Date.getInstance("2014", "05", "01", "02", "00");
		}
		assert.equal(oExpectedDate.getTime(), oStartDate.getTime(), "Start date is OK");

		bStartDateChange = false;

		//change view
		oPC1.setViewKey(CalendarIntervalType.Hour);
		await nextUIUpdate();
		jQuery("#PC1-Header-ViewSwitch").trigger("focus");

		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ARROW_DOWN"); //to Days
		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ARROW_DOWN"); //to Months
		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ARROW_DOWN"); //to Week
		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ENTER");
		await nextUIUpdate();
		assert.ok(bStartDateChange, "startDateChange fired when view is switched to Week");
		bStartDateChange = false;

		oPC1.setViewKey(CalendarIntervalType.Hour);
		bStartDateChange = false;
		await nextUIUpdate();

		// via today button
		qutils.triggerEvent("tap", "PC1-Header-NavToolbar-TodayBtn");
		assert.ok(bStartDateChange, "startDateChange fired");
		oStartDate = oPC1.getStartDate();
		oExpectedDate = UI5Date.getInstance();
		assert.equal(oExpectedDate.getFullYear(), oStartDate.getFullYear(), "Start date is OK");
		assert.equal(oExpectedDate.getMonth(), oStartDate.getMonth(), "Start date is OK");
		assert.equal(oExpectedDate.getDate(), oStartDate.getDate(), "Start date is OK");
		// If more tests are about to be added here, please consider that last date is the current one.

		oPC1.setStartDate(UI5Date.getInstance(2020,1,1));
		oPC1.setViewKey(CalendarIntervalType.OneMonth);
		bStartDateChange = false;
		await nextUIUpdate();

		var oPC1Interval = oPC1.getAggregation("table").getAggregation("infoToolbar").getContent()[1],
			aDays = oPC1Interval.getDomRef().querySelectorAll(".sapUiCalItem"),
			$02Mar = aDays[30];

		$02Mar.focus();
		await nextUIUpdate();
		assert.ok(bStartDateChange, "selected day from next month must fire startDateChange");
	});

	QUnit.test("viewChange", async function(assert) {
		oPC1 = await initPlanningCalendar("PC1", "SF1", "B1");
		bViewChange = false;
		jQuery("#PC1-Header-ViewSwitch-select").trigger("focus");
		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ARROW_DOWN");
		qutils.triggerKeydown("PC1-Header-ViewSwitch-select", "ENTER");
		await nextUIUpdate();
		assert.ok(bViewChange, "viewChange fired");

		oPC1.setViewKey(CalendarIntervalType.Hour);
		await nextUIUpdate();
	});

	QUnit.test("intervalselect", async function (assert) {

		// Start with hour view
		oPC1.setViewKey(CalendarIntervalType.Hour);

		bIntervalSelect = false;
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;
		bSubInterval = undefined;
		oIntervalRow = undefined;
		jQuery("#PC1-TimesRow-201501011200").trigger("focus");
		qutils.triggerKeydown("PC1-TimesRow-201501011200", "ENTER");
		await nextUIUpdate();
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

	QUnit.test("intervalselect 1Month View", async function (assert) {
		// Start with oneMonth view
		//prepare
		var oStartDate = oPC1.getStartDate();
		oPC1.setViewKey(CalendarIntervalType.OneMonth);
		oPC1.setStartDate(UI5Date.getInstance(2015,1,1));
		await nextUIUpdate();

		bIntervalSelect = false;
		bStartDateChange = false;
		oIntervalStartDate = undefined;
		oIntervalEndDate = undefined;

		//act
		qutils.triggerKeydown("PC1-OneMonthsRow-20150301", "ENTER");
		await nextUIUpdate();

		// Assert
		assert.ok(bIntervalSelect, "intervalSelect fired");
		assert.ok(bStartDateChange, "startDateChange fired");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalStartDate), "201503010000", "interval start date returned");
		assert.equal(oFormatYyyyMMddHHmm.format(oIntervalEndDate), "201503012359", "interval end date returned");
		assert.ok(!jQuery("#PC1-OneMonthsRow-20150301").hasClass("sapUiCalItemSel"), "interval not longer selected");

		// Cleanup
		oPC1.setViewKey(CalendarIntervalType.Hour);
		oPC1.setStartDate(oStartDate);
		await nextUIUpdate();
	});

	QUnit.test("rowHeaderPress", function (assert) {
		// Arrange
		var oSpy,
			oSecondRow = oPC1.getRows()[1], // Get second row
			handleRowHeaderPress = function (oEvent) {
				var oRow = oEvent.getParameter("row");
				var sRowHeaderId = oEvent.getParameter("headerId");

				// Assert
				assert.ok(oRow, "There must be a returned row");
				assert.ok(oRow instanceof PlanningCalendarRow, "Returned row must derive from sap.m.PlanningCalendarRow");
				assert.strictEqual(oRow, oSecondRow, "Returned row must be reference to the second row");
				assert.strictEqual(sRowHeaderId, oSecondRow.sId + "-Head", "Returned id must be equal to the second row header id");
			};

		oSpy = this.spy(handleRowHeaderPress);
		oPC1.attachEvent("rowHeaderPress", oSpy);

		// Act - click on the second row header
		qutils.triggerEvent("click", "PC1-Row2-Head-content");

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Event method must be called once");

		// Cleanup
		oPC1.detachEvent("rowHeaderPress", oSpy);
	});

	QUnit.module("Proxy calls", {
		beforeEach: async function () {
			this.sut = createPlanningCalendar("invalidationExample", new SearchField(), new Button(), UI5Date.getInstance(2015, 0, 7), CalendarIntervalType.Week);
			this.sutInterval = this.sut.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			this.sut.placeAt("bigUiArea");
			await nextUIUpdate();
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

	QUnit.test("'_handleCalendarSelect()' invokes its internal child methods 'fireSelect()'", async function (assert) {
		//prepare
		var oCalendarSelectSpy = this.spy(this.sutInterval, 'fireSelect'),
			oPlanningCalendarIntervalSelectSpy = this.spy(this.sut, 'fireIntervalSelect'),
			aIntervalDomChilds = this.sutInterval.getDomRef().querySelectorAll(".sapUiCalItem"),
			oFirstCalendarIntervalItem = aIntervalDomChilds[0],
			oStartDate = this.sut.getStartDate(),
			oEndDate = UI5Date.getInstance(oStartDate.getTime());

		//act
		oEndDate.setDate(oStartDate.getDate() + 1);
		qutils.triggerKeydown(oFirstCalendarIntervalItem, "ENTER", false, false, false);
		await nextUIUpdate();
		//assert
		assert.strictEqual(oCalendarSelectSpy.callCount, 1, "CalendarSelect fired once");
		assert.strictEqual(oPlanningCalendarIntervalSelectSpy.callCount, 1, "PlanningCalendar IntervalSelect fired once");
	});

	QUnit.module("Private API", {
		beforeEach: async function () {
			this.sut = createPlanningCalendar("invalidationExample", new SearchField(), new Button(), UI5Date.getInstance(Date.UTC(2015, 0, 7)), CalendarIntervalType.Week);
			this.sutInterval = this.sut.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
			this.sut.placeAt("bigUiArea");
			await nextUIUpdate();
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

	QUnit.test("today button enabled state is updated when the view is changed", async function(assert) {
		//arrange
		this.sut.setViewKey(CalendarIntervalType.Day);
		this.sut.setStartDate(UI5Date.getInstance());
		var oEnabledSpy = this.spy(this.sut._oTodayButton, 'setEnabled');
		await nextUIUpdate();

		//act
		this.sut.setViewKey(CalendarIntervalType.OneMonth);
		await nextUIUpdate();

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
			oDate = UI5Date.getInstance(oStartDate.getTime());

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
		assert.strictEqual(oSetPropertySpy.callCount, 1, "If an appointment with the specified id does not exist in the DOM," +
			"setProperty is not called for it. setProperty(\"selected\") is called only if an appointment is present and selected.");

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

	QUnit.test("_adjustColumnHeadersTopOffset called from onThemeChanged", async function(assert) {
		// arrange
		var iAdjustCallCount,
			oPC = createPlanningCalendar(
				"adjustSticky",
				new SearchField(),
				new Button(),
				UI5Date.getInstance(Date.UTC(2015, 0, 7)),
				CalendarIntervalType.Hours
			),
			fnAdjustColumnHeader = this.spy(oPC, "_adjustColumnHeadersTopOffset");

		// assert
		assert.strictEqual(fnAdjustColumnHeader.callCount, 0, "_adjustColumnHeadersTopOffset() is not called if the control is not rendered");

		// act
		oPC.placeAt("bigUiArea");
		await nextUIUpdate();
		iAdjustCallCount = fnAdjustColumnHeader.callCount;
		oPC.onThemeChanged();

		// assert
		assert.strictEqual(fnAdjustColumnHeader.callCount, (iAdjustCallCount + 1), "_adjustColumnHeadersTopOffset() called from onThemeChanged()");

		// cleanup
		oPC.destroy();
	});

	QUnit.test("'_handleDateSelect()' with min/max dates", function (assert) {
		//prepare
		var oTestDate = UI5Date.getInstance(2015, 0, 1, 0, 0, 0),
			oMinDate = UI5Date.getInstance(2015, 1, 1, 0, 0, 0);

		this.sut.setViewKey(CalendarIntervalType.Month);
		this.sut.setMinDate(oMinDate);

		// act
		this.sut._handleDateSelect({
			getSource: function() {
				return	{
					getStartDate: function () {
						return oTestDate;
					}
				};
			}
		});

		// assert
		assert.strictEqual(this.sut._oMonthsRow.getStartDate().getTime(), oMinDate.getTime(), "Month selection focused on min date, not first day of year");
	});

	QUnit.test("'_handleDateSelect()' sets a date to the row only if the selected date is new", function (assert) {
		//prepare
		var _rowSetDateSpy = this.spy(this.sut._oWeeksRow, 'displayDate');
		var oTestUTCDate = UI5Date.getInstance(Date.UTC(2015, 0, 5));
		var oTestDate = UI5Date.getInstance(2015, 0, 5 , oTestUTCDate.getHours(), oTestUTCDate.getMinutes(), oTestUTCDate.getSeconds());

		//act
		this.sut._handleDateSelect({
			getSource: function() {
				return	{
					getStartDate: function () {
						return oTestDate;
					}
				};
			}
		});
		//assert
		assert.strictEqual(_rowSetDateSpy.callCount, 0, "'_handleDateSelect()' was not called when the date is the same");

		//act
		this.sut._handleDateSelect({
			getSource: function() {
				return	{
					getStartDate: function () {
						return UI5Date.getInstance(Date.UTC(2015, 0, 8));
					}
				};
			}
		});
		//assert
		assert.strictEqual(_rowSetDateSpy.callCount, 1, "'_handleDateSelect()' was called once when the date is different");
	});

	QUnit.module("Interaction", {
		beforeEach: async function() {
			var oSearchField = new SearchField(),
				oButton = new Button();
			this.o1Sep2016MidOfWeek = UI5Date.getInstance(2016, 8, 1, 1);
			this.o10Sep2016Morning = UI5Date.getInstance(2016, 8, 10, 9);
			this.o10Sep2016 = UI5Date.getInstance(2016, 8, 10);
			this.oPC2 = createPlanningCalendar("startDateAtTheMiddleOfTheWeek", oSearchField, oButton, this.o1Sep2016MidOfWeek,
				CalendarIntervalType.Week);
			this.oPC2.placeAt("bigUiArea");
			await nextUIUpdate(this.clock);
			this.oPC2Interval = this.oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];
		},
		afterEach: async function() {
			if (!bSkipDestroy) {
				this.oPC2.destroy();
				await nextUIUpdate(this.clock);
			}
		}
	});

	QUnit.test("keyboard navigation", async function(assert) {
		// test here only interaction between rows, other things are tested on CalendarRow
		var fnDone = assert.async();

		jQuery("#PC1-R1A1").trigger("focus");
		assert.equal(document.activeElement.id, "PC1-R1A1", "Appointment1 focused");
		qutils.triggerKeydown("PC1-R1A1", "END");
		assert.equal(document.activeElement.id, "PC1-R2A1", "Appointment1 focused");

		qutils.triggerKeydown("PC1-R2A1", "HOME");
		await nextUIUpdate();

		setTimeout(async function(){
			assert.equal(document.activeElement.id, "PC1-R1A2", "Appointment2 focused");
			qutils.triggerKeydown("PC1-R1A1", "ARROW_DOWN");
			assert.equal(document.activeElement.id, "PC1-R2A1", "Appointment1 focused");
			qutils.triggerKeydown("PC1-R1A1", "ARROW_UP");
			await nextUIUpdate();
			assert.equal(document.activeElement.id, "PC1-R1A2", "Appointment2 focused");
			fnDone();
		}, 0);

	});


	QUnit.test("keyboard navigation HOME & END for 1 Month view", async function(assert) {
		_switchToView(CalendarIntervalType.OneMonth, this.oPC2);
		this.oPC2.setStartDate(this.o1Sep2016MidOfWeek);
		this.oPC2.invalidate();
		await nextUIUpdate();
		var sMonthIdPrefix = this.oPC2.getId() + "-OneMonthsRow-";

		jQuery("#" +  sMonthIdPrefix + "20160901").trigger("focus");
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160901", "1st of September focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160901", "END");
		await nextUIUpdate();
		assert.equal(document.activeElement.id,  sMonthIdPrefix + "20160930", "30 of September focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160930", "HOME");
		await nextUIUpdate();
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160901", "1st of September focused");

		jQuery("#" +  sMonthIdPrefix + "20160910").trigger("focus");
		assert.equal(document.activeElement.id, sMonthIdPrefix + "20160910", "10th of September focused");

		qutils.triggerKeydown(sMonthIdPrefix + "20160910", "END");
		await nextUIUpdate();
		assert.equal(document.activeElement.id,  sMonthIdPrefix + "20160930", "30 of September focused");
	});

	QUnit.test("keyboard navigation ARROW_RIGHT for 1 Month view at the border of 2 months", async function (assert) {
		// Prepare
		var oApp1stOct2016 = new CalendarAppointment("app1stOct2016", {
			startDate: UI5Date.getInstance(2016, 9, 1, 17),
			endDate: UI5Date.getInstance(2016, 9, 1, 18)
		}), $30Sep, $1stOct, aDays;


		this.oPC2.getRows()[0].addAppointment(oApp1stOct2016);
		_switchToView(CalendarIntervalType.OneMonth, this.oPC2);
		this.oPC2.setStartDate(this.o1Sep2016MidOfWeek);
		await nextUIUpdate();

		// Get days
		this.oPC2Interval = this.oPC2.getAggregation("table").getAggregation("infoToolbar").getContent()[1];

		aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem");
		$30Sep = aDays[29];
		$1stOct = aDays[30];

		// Act
		// Focus 30th of Sep, 2016 and move right via keyboard, expect appointment for 1 of Oct to be visible once
		// the view is switched to October
		qutils.triggerEvent("mousedown", $30Sep); //focus should be done via mouse events, since this is the way Month.js handles focusing
		qutils.triggerEvent("mouseup", $30Sep);
		await nextUIUpdate();
		await _navFocusNext.call(this, $1stOct);

		// Assert
		aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem");
		$1stOct = aDays[0];

		assert.ok(oApp1stOct2016.getDomRef(), "Once moved to October, the 1st appoint. should be visible");
		assert.equal($1stOct.getAttribute("data-sap-day"), "20161001", "Once moved to October, the first day of the month is moved to the beginning of the OneMonthsRow");

	});

	QUnit.test("When start date is defined the planning calendar should shift to the first day of the week that includes the start date ", async function(assert) {
		//assert initial state
		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 7, 29),
				UI5Date.getInstance(2016, 7, 30),
				UI5Date.getInstance(2016, 7, 31),
				UI5Date.getInstance(2016, 8, 1),
				UI5Date.getInstance(2016, 8, 2),
				UI5Date.getInstance(2016, 8, 3),
				UI5Date.getInstance(2016, 8, 4)],
			this.oPC2, "Initially set start date");
		//act
		this.oPC2.setStartDate(this.o10Sep2016);
		await nextUIUpdate();

		//assert
		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 8, 5),
				UI5Date.getInstance(2016, 8, 6),
				UI5Date.getInstance(2016, 8, 7),
				UI5Date.getInstance(2016, 8, 8),
				UI5Date.getInstance(2016, 8, 9),
				UI5Date.getInstance(2016, 8, 10),
				UI5Date.getInstance(2016, 8, 11)],
			this.oPC2, "StartDate modified afterwards");
	});

	QUnit.test("Navigation backward via back button", async function(assert) {
		//act
		await _navBackward.call(this, this.oPC2);//one week before week 29th of August 2016 - 4th of September, 2016

		//assert
		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 7, 22),
				UI5Date.getInstance(2016, 7, 23),
				UI5Date.getInstance(2016, 7, 24),
				UI5Date.getInstance(2016, 7, 25),
				UI5Date.getInstance(2016, 7, 26),
				UI5Date.getInstance(2016, 7, 27),
				UI5Date.getInstance(2016, 7, 28)],
			this.oPC2, "Initially navigating back once");

		//act
		await _navBackward.call(this, this.oPC2);//two weeks before

		//assert
		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 7, 15),
				UI5Date.getInstance(2016, 7, 16),
				UI5Date.getInstance(2016, 7, 17),
				UI5Date.getInstance(2016, 7, 18),
				UI5Date.getInstance(2016, 7, 19),
				UI5Date.getInstance(2016, 7, 20),
				UI5Date.getInstance(2016, 7, 21)],
			this.oPC2, "Navigating back twice");
	});

	QUnit.test("Navigation via back/next buttons with altered firstDayOfWeek", function (assert) {
		// Arrange
		var iSelectedDate;

		this.oPC2.setStartDate(UI5Date.getInstance(2023, 1, 5));
		this.oPC2.setBuiltInViews(["Week"]);
		this.oPC2.setFirstDayOfWeek(0);

		iSelectedDate = this.oPC2._getHeader().getStartDate().getDate();

		// Assert
		assert.equal(iSelectedDate, 29, "Start date is correct");

		// Act
		this.oPC2._applyArrowsLogic();
		iSelectedDate = this.oPC2._getHeader().getStartDate().getDate();

		// Assert
		assert.equal(iSelectedDate, 5, "Start date changes correctly with Next arrow");

		// Act
		this.oPC2._applyArrowsLogic(true);
		iSelectedDate = this.oPC2._getHeader().getStartDate().getDate();

		// Assert
		assert.equal(iSelectedDate, 29, "Start date changes correctly with Back arrow");
	});

	QUnit.test("Change in date navigation does not reset firstDayOfWeek", async function (assert) {
		// Arrange
		var oStartDate = UI5Date.getInstance(2023, 9, 16),
			oShiftToDate = UI5Date.getInstance(2023, 9, 19),
			oNewStartDate = UI5Date.getInstance(2023, 9, 18);

		this.oPC2.setStartDate(oStartDate);
		this.oPC2.setBuiltInViews(["Week"]);
		await nextUIUpdate();

		// Assert - Default behaviour
		assert.deepEqual(this.oPC2._dateNav.getStart(), oStartDate, "Start date is October 16th");

		// Act - Set FirstDayOfWeek to wednesday
		this.oPC2.setFirstDayOfWeek(3);
		await nextUIUpdate();

		// Assert - First day of week is changed to wednesday
		assert.deepEqual(this.oPC2._dateNav.getStart(), oNewStartDate, "Start date changes to firstDayOfWeek");

		// Act - Date navigation change
		this.oPC2.shiftToDate(oShiftToDate);
		await nextUIUpdate();

		// Assert - First day of week has not been reset
		assert.deepEqual(this.oPC2._dateNav.getStart(), oNewStartDate, "Start date remains the same after change in date navigation");
	});

	QUnit.test("Start date is updated when firstDayOfWeek is changed", async function(assert) {
		// Arrange
		var oStartDate = UI5Date.getInstance(2023, 9, 16),
			oShiftToDate = UI5Date.getInstance(2023, 9, 17),
			oShiftToDate2 = UI5Date.getInstance(2023, 9, 18),
			oNewStartDate = UI5Date.getInstance(2023, 9, 19);

		this.oPC2.setStartDate(oStartDate);
		this.oPC2.setBuiltInViews(["Week"]);
		await nextUIUpdate();

		// Assert - Default behaviour
		assert.deepEqual(this.oPC2._dateNav.getStart(), oStartDate, "Nav start date is October 16th");
		assert.deepEqual(this.oPC2.getStartDate(), oStartDate, "PlanningCalendar start date matches navigation start date");

		// Arrange - Update navigation more than once to de-sync Planning Calendar and DateNavigation start dates
		this.oPC2.shiftToDate(oShiftToDate);
		await nextUIUpdate();
		this.oPC2.shiftToDate(oShiftToDate2);
		await nextUIUpdate();

		// Act - Change FirstDayOfWeek
		this.oPC2.setFirstDayOfWeek(4);
		await nextUIUpdate();

		// Assert - Changing first day of week updates Planning Calendar start date
		assert.deepEqual(this.oPC2._dateNav.getStart(), oNewStartDate, "Nav start date is now October 19th");
		assert.deepEqual(this.oPC2.getStartDate(), oNewStartDate, "PlanningCalendar start date matches navigation start date ");
	});

	QUnit.test("CalendarWeekNumbering does not overwrite firstDayOfWeek", async function (assert) {
		// Arrange
		var oStartDate = UI5Date.getInstance(2023, 9, 16),
			oNewStartDate = UI5Date.getInstance(2023, 9, 18),
			oNewStartDate2 = UI5Date.getInstance(2023, 9, 19);

		this.oPC2.setStartDate(oStartDate);
		this.oPC2.setBuiltInViews(["Week"]);

		// Act
		this.oPC2.setFirstDayOfWeek(3);
		await nextUIUpdate();

		// Assert - First day of week is changed to wednesday
		assert.deepEqual(this.oPC2._dateNav.getStart(), oNewStartDate, "Start date changes to firstDayOfWeek");

		// Act
		this.oPC2.setCalendarWeekNumbering("MiddleEastern");
		await nextUIUpdate();

		assert.deepEqual(this.oPC2._dateNav.getStart(), oNewStartDate, "Start Date is unchanged after CalendarWeekNumbering is set");

		// Act
		this.oPC2.setFirstDayOfWeek(4);
		await nextUIUpdate();

		// Assert
		assert.deepEqual(this.oPC2._dateNav.getStart(), oNewStartDate2, "Start date changes to firstDayOfWeek again");
	});

	QUnit.test("Navigaton buttons disabled when on min/max dates", function(assert) {
		var oStartDate = this.oPC2.getStartDate();

		//Arrange & Act
		this.oPC2.setMinDate(UI5Date.getInstance(1999, 1, 1, 0, 0, 0));
		this.oPC2.setStartDate(UI5Date.getInstance(1999, 1, 1, 0, 0, 0));
		this.oPC2._dateNav.setCurrent(UI5Date.getInstance(1999, 1, 1, 0, 0, 0));

		//Assert
		assert.equal(this.oPC2._getHeader()._oPrevBtn.getEnabled(), false, "Back Arrow Is Disabled");

		//Arrange  & Act
		this.oPC2.setMaxDate(UI5Date.getInstance(2222,22,22,22,22,22));
		this.oPC2.setStartDate(UI5Date.getInstance(2222,22,22,22,22,22));
		this.oPC2._dateNav.setCurrent(UI5Date.getInstance(2222,22,22,22,22,22));

		//Assert
		assert.equal(this.oPC2._getHeader()._oNextBtn.getEnabled(), false, "Forward Arrow Is Disabled");

		//Clean
		this.oPC2.setStartDate(oStartDate);
		this.oPC2._dateNav.setCurrent(oStartDate);
	});

	QUnit.test("Selected date is in visible range after navigation", function(assert){
		this.oPC2._dateNav.setCurrent(UI5Date.getInstance(2016, 8, 2));
		this.oPC2.setStartDate(UI5Date.getInstance());
		this.oPC2._applyArrowsLogic();

		assert.ok(1, "Error is not thrown.");
	});

	QUnit.test("previous button when minDate >= current view start date initially", async function(assert) {
		// arange
		var oPC = new PlanningCalendar({
			viewKey: "One Month",
			startDate: UI5Date.getInstance(2019, 11, 6),
			minDate: UI5Date.getInstance(2019, 11, 1)
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.strictEqual(
			oPC._getHeader()._oPrevBtn.getEnabled(),
			false,
			"previous button is disabled");

		// clean
		oPC.destroy();
		await nextUIUpdate();
	});

	QUnit.test("today press disables previous button if necessary", async function(assert) {
		// arrange
		var oFakeNow = UI5Date.getInstance(2019, 11, 22),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			oPC = new PlanningCalendar({
				viewKey: "One Month",
				startDate: UI5Date.getInstance(2020, 0, 6),
				minDate: UI5Date.getInstance(2019, 11, 1)
			}).placeAt("qunit-fixture");
		await nextUIUpdate(clock);

		// act
		oPC._getHeader()._oTodayBtn.firePress();
		await nextUIUpdate(clock);

		// assert
		assert.strictEqual(
			oPC._getHeader()._oPrevBtn.getEnabled(),
			false,
			"previous button is disabled");

		// clean
		clock.restore();
		oPC.destroy();
		await nextUIUpdate(clock);
	});

	QUnit.test("previous button when navigated to a view where minDate = start date without the hours", async function(assert) {
		// arrange
		var oPC = new PlanningCalendar({
				viewKey: "One Month",
				startDate: UI5Date.getInstance(2020, 0, 6, 8, 0, 0),
				minDate: UI5Date.getInstance(2019, 11, 1, 0, 0, 0)
			}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oPC._getHeader()._oPrevBtn.firePress();
		await nextUIUpdate();

		// assert
		assert.strictEqual(
			oPC._getHeader()._oPrevBtn.getEnabled(),
			false,
			"previous button is disabled");

		// clean
		oPC.destroy();
	});

	QUnit.test("Navigation backward via keyboard left arrow (outside the current visible area)", async function(assert) {
		var aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem"),
			oNextTarget = aDays[0];
		//Focus 29th of Aug (week 29 Aug - 4 Sep), 2016 and move left via keyboard 4 times, expect 22 -28 Aug 2016
		//act
		aDays[0].focus();
		await nextUIUpdate();

		oNextTarget = await _navFocusPrev.call(this, oNextTarget);
		_assertFocus.call(this, oNextTarget);

		oNextTarget = await _navFocusPrev.call(this, oNextTarget);
		_assertFocus.call(this, oNextTarget);

		oNextTarget = await _navFocusPrev.call(this, oNextTarget);
		_assertFocus.call(this, oNextTarget);

		oNextTarget = await _navFocusPrev.call(this, oNextTarget);
		_assertFocus.call(this, oNextTarget);

		_assertDatesAreVisible.call(this, [
			UI5Date.getInstance(2016, 7, 22),
			UI5Date.getInstance(2016, 7, 23),
			UI5Date.getInstance(2016, 7, 24),
			UI5Date.getInstance(2016, 7, 25),
			UI5Date.getInstance(2016, 7, 26),
			UI5Date.getInstance(2016, 7, 27),
			UI5Date.getInstance(2016, 7, 28)
		], this.oPC2, "Navigated to the correct viewport");
	});

	QUnit.test("Navigation backward via keyboard left arrow (outside the current visible area) at the border of the DST (Nov->Oct)", async function(assert) {
		//prepare
		var oOriginalFormatLocale = new Locale(Formatting.getLanguageTag()),
			sOriginalFormatLocale = oOriginalFormatLocale.getLanguage() + "_" +  oOriginalFormatLocale.getRegion(),
			aDays,
			oNextTarget;

		Formatting.setLanguageTag("en-GB");
		this.oPC2.setStartDate(UI5Date.getInstance("2014", "10", "5", "08", "00"));
		this.oPC2.invalidate();
		await nextUIUpdate();

		aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem");
		oNextTarget = aDays[0];

		//Act - focus 2nd of Nov (week 02 Nov - 8 Nov), 2014 and move left via keyboard once, expect 26 Oct - 1 Nov 2014
		oNextTarget.focus();
		await nextUIUpdate();
		oNextTarget = await _navFocusPrev.call(this, oNextTarget);
		_assertFocus.call(this, oNextTarget);
		_assertDatesAreVisible.call(this, [
			UI5Date.getInstance(2014, 9, 27),
			UI5Date.getInstance(2014, 9, 28),
			UI5Date.getInstance(2014, 9, 29),
			UI5Date.getInstance(2014, 9, 30),
			UI5Date.getInstance(2014, 9, 31),
			UI5Date.getInstance(2014, 10, 1),
			UI5Date.getInstance(2014, 10, 2)
		], this.oPC2, "Navigated to the correct viewport");
		Formatting.setLanguageTag(sOriginalFormatLocale);
	});

	QUnit.test("Navigation forward via forward button", async function(assert) {
		//act
		await _navForward.call(this, this.oPC2);//one week after week 29th of August 2016 - 4th of September, 2016

		//assert
		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 8, 5),
				UI5Date.getInstance(2016, 8, 6),
				UI5Date.getInstance(2016, 8, 7),
				UI5Date.getInstance(2016, 8, 8),
				UI5Date.getInstance(2016, 8, 9),
				UI5Date.getInstance(2016, 8, 10),
				UI5Date.getInstance(2016, 8, 11)],
			this.oPC2, "Navigating forward once");

		//act
		await _navForward.call(this, this.oPC2);//two weeks after

		//assert
		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 8, 12),
				UI5Date.getInstance(2016, 8, 13),
				UI5Date.getInstance(2016, 8, 14),
				UI5Date.getInstance(2016, 8, 15),
				UI5Date.getInstance(2016, 8, 16),
				UI5Date.getInstance(2016, 8, 17),
				UI5Date.getInstance(2016, 8, 18)],
			this.oPC2, "Navigating forward twice");
	});

	QUnit.test("Navigation forward via keyboard right (outside the current visible area)", async function(assert) {
		var aDays = this.oPC2Interval.getDomRef().querySelectorAll(".sapUiCalItem"),
			oNextTarget = aDays[aDays.length - 1],
			oSelf = this,
			fnDone = assert.async();
		//Focus 4th of Sep, 2016 (week 29 Aug-4 Sep) and move right via keyboard 4 times, expect 5 -11 Sep 2016
		//act
		aDays[aDays.length - 1].focus();
		await nextUIUpdate();

		oNextTarget = await _navFocusNext.call(oSelf, oNextTarget);
		_assertFocus.call(oSelf, oNextTarget);

		oNextTarget = await _navFocusNext.call(oSelf, oNextTarget);
		_assertFocus.call(oSelf, oNextTarget);

		oNextTarget = await _navFocusNext.call(oSelf, oNextTarget);
		_assertFocus.call(oSelf, oNextTarget);

		oNextTarget = await _navFocusNext.call(oSelf, oNextTarget);
		_assertFocus.call(oSelf, oNextTarget);

		_assertDatesAreVisible.call(oSelf, [
			UI5Date.getInstance(2016, 8, 5),
			UI5Date.getInstance(2016, 8, 6),
			UI5Date.getInstance(2016, 8, 7),
			UI5Date.getInstance(2016, 8, 8),
			UI5Date.getInstance(2016, 8, 9),
			UI5Date.getInstance(2016, 8, 10),
			UI5Date.getInstance(2016, 8, 11)
		], oSelf.oPC2, "Navigated to the correct viewport");
		fnDone();
	});

	QUnit.test("Navigation forward via keyboard right (outside the current visible area) when in days view", async function(assert) {
		//Arrange
		this.oPC2.setViewKey(CalendarIntervalType.Day);

		var oStartDate = this.oPC2.getStartDate(),
			oLastDay;

		//Act
		oStartDate.setDate(oStartDate.getDate() + 1);
		await nextUIUpdate();
		oLastDay = UI5Date.getInstance(2016, 8, 12, 0, 0, 0);
		this.oPC2.shiftToDate(oLastDay, false);

		//Assert
		assert.deepEqual(this.oPC2.getStartDate(), oStartDate, "Navigation via keyboard when in days view works");
	});

	QUnit.test("Navigation forward via keyboard right (outside the current visible area) and reaching the limit", function(assert) {
		//Arrange
		this.oPC2.setViewKey(CalendarIntervalType.Day);
		var oStartDate = this.oPC2.getStartDate(),
			oComparisonDate = UI5Date.getInstance(oStartDate.getTime()),
			oGoToDate = UI5Date.getInstance(oStartDate.getTime()),
			oMaxDate = UI5Date.getInstance(2016, 8, 14),
			oGoToDate2 = UI5Date.getInstance(2016, 8, 15),
			oComparisonDate2 = UI5Date.getInstance(2016, 8, 1);

		this.oPC2.setMinDate(UI5Date.getInstance(oStartDate.getTime()));

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

	QUnit.test("Navigation forward in week view where next week starts at 1st January (locale en_US)", async function(assert) {
		var oSelf = this,
			fnDone = assert.async(),
			sOriginalFormatLocale = Formatting.getLanguageTag().toString();

		//arrange
		Formatting.setLanguageTag('en_US');
		this.oStub3 = this.stub(Localization, "getLanguageTag").callsFake(function () {
			return new LanguageTag("en_US");//first date of week is Sunday (JS Date.getDay() = 0)
		});
		await nextUIUpdate();
		this.oPC2.setStartDate(UI5Date.getInstance(2017, 0, 1));
		await nextUIUpdate();
		this.oPC2.setViewKey(CalendarIntervalType.Week);
		await nextUIUpdate();

		setTimeout(function() {
			//assert
			_assertDatesAreVisible.call(oSelf, [
				UI5Date.getInstance(2017, 0, 1),
				UI5Date.getInstance(2017, 0, 2),
				UI5Date.getInstance(2017, 0, 3),
				UI5Date.getInstance(2017, 0, 4),
				UI5Date.getInstance(2017, 0, 5),
				UI5Date.getInstance(2017, 0, 6),
				UI5Date.getInstance(2017, 0, 7)
			], oSelf.oPC2, "Navigated to 1st of January");

			//clear
			Formatting.setLanguageTag(sOriginalFormatLocale);
			fnDone();
		}, 0);
	});

	QUnit.test("Navigation backward and forward", async function(assert) {
		var i;
		//act
		for (i = 0; i < 10; i++) {
			await _navForward.call(this, this.oPC2);
		}
		for (i = 0; i < 9; i++) {
			await _navBackward.call(this, this.oPC2);
		}
		//Expected is one week after the initial - Sep 5th, 2016 - Sep 11th, 2016

		//assert
		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 8, 5),
				UI5Date.getInstance(2016, 8, 6),
				UI5Date.getInstance(2016, 8, 7),
				UI5Date.getInstance(2016, 8, 8),
				UI5Date.getInstance(2016, 8, 9),
				UI5Date.getInstance(2016, 8, 10),
				UI5Date.getInstance(2016, 8, 11)],
			this.oPC2, "Navigating forward once");
	});

	QUnit.test("Selecting the visible dates from the previous/next month in the calendar picker - in Hours view", async function (assert) {
		// Prepare
		var oApp2ndSept2016 = new CalendarAppointment("app2ndSept2016", {
				startDate: UI5Date.getInstance(2016, 8, 2, 6),
				endDate: UI5Date.getInstance(2016, 8, 2, 10)
			}),
			fnDone = assert.async(),
			oPC2 = this.oPC2,
			aDays, $FirstInterval;

		this.oPC2.getRows()[0].addAppointment(oApp2ndSept2016);

		// Act
		_switchToView(CalendarIntervalType.Hour, this.oPC2);
		await nextUIUpdate();
		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-Header-NavToolbar-PickerBtn");
		await nextUIUpdate();

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160902");
		$Day.trigger("focus");

		setTimeout(async function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160902");
			qutils.triggerKeydown($Day.get(0), KeyCodes.ENTER, false, false, false);
			await nextUIUpdate();
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


	QUnit.test("Selecting the visible dates from the previous/next month in the calendar picker - in Days view", async function (assert) {
		// Prepare
		var oApp30Aug2016 = new CalendarAppointment("app30Aug2016", {
				startDate: UI5Date.getInstance(2016, 7, 30, 6),
				endDate: UI5Date.getInstance(2016, 7, 30, 10)
			}),
			fnDone = assert.async(),
			oPC2 = this.oPC2,
			aDays, $FirstInterval;

		this.oPC2.getRows()[0].addAppointment(oApp30Aug2016);

		// Act
		_switchToView(CalendarIntervalType.Day, this.oPC2);
		await nextUIUpdate();

		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-Header-NavToolbar-PickerBtn");
		await nextUIUpdate();

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160830");

		$Day.trigger("focus");

		setTimeout(async function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-Header-Cal--Month0-20160830");
			qutils.triggerKeydown($Day.get(0), KeyCodes.ENTER, false, false, false);
			await nextUIUpdate();

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


	QUnit.test("Selecting the visible dates from the previous/next month in the calendar picker - in Weeks view", async function (assert) {
		// Prepare
		var oApp30Aug2016 = new CalendarAppointment("app30Aug2016", {
				startDate: UI5Date.getInstance(2016, 7, 30, 6),
				endDate: UI5Date.getInstance(2016, 7, 30, 10)
			}),
			fnDone = assert.async(),
			oPC2 = this.oPC2,
			aDays, $FirstInterval;

		this.oPC2.getRows()[0].addAppointment(oApp30Aug2016);

		// Act
		_switchToView(CalendarIntervalType.Week, this.oPC2);
		await nextUIUpdate();

		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-WeeksRow--Head-next");
		qutils.triggerEvent("tap", "startDateAtTheMiddleOfTheWeek-WeeksRow--Head-B1");

		var $Day = jQuery("#startDateAtTheMiddleOfTheWeek-WeeksRow--Cal--Month0-20160830");

		$Day.trigger("focus");

		setTimeout(function(){
			$Day = jQuery("#startDateAtTheMiddleOfTheWeek-WeeksRow--Cal--Month0-20160830");
			qutils.triggerKeydown($Day.get(0), KeyCodes.ENTER, false, false, false);

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
		this.oPC2.setStartDate(UI5Date.getInstance());
		//assert
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), false, "Today button should not be enabled  as current day IS visible");
	});

	QUnit.test("Clicking 'Today' button navigates to the week of the current day", async function (assert) {
		//prepare
		var oFakeNow = this.o10Sep2016,
			clock = sinon.useFakeTimers(oFakeNow.getTime());
		this.oPC2.invalidate(); //start date is 1st of September 2016
		await nextUIUpdate(clock);

		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), true, "Today button should be enabled as current day IS NOT visible");
		//act
		await _clickTodayButton.call(this, this.oPC2, clock);
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), false, "Today button should not be enabled as current day IS visible");

		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 8, 5),
				UI5Date.getInstance(2016, 8, 6),
				UI5Date.getInstance(2016, 8, 7),
				UI5Date.getInstance(2016, 8, 8),
				UI5Date.getInstance(2016, 8, 9),
				UI5Date.getInstance(2016, 8, 10),
				UI5Date.getInstance(2016, 8, 11)],
			this.oPC2, "StartDate modified afterwards");
		//assert
		assert.equal(_getTodayButton.call(this, this.oPC2).getEnabled(), false, "Today button should not be enabled as current day IS visible");
		assert.strictEqual(document.activeElement.id, "startDateAtTheMiddleOfTheWeek-WeeksRow-20160910", "Correct DOM element is focused");
		//cleanup
		clock.restore();

	});

	QUnit.test("Clicking 'Today' button in week view then changing back to hours shows the hours unchanged", async function (assert) {
		//act
		var oFakeNow = UI5Date.getInstance(2016, 8, 1, 3),
			clock = sinon.useFakeTimers(oFakeNow.getTime()),
			aExpectedVisibleHours = [],
			iInterval;
		this.oPC2.setStartDate(this.o10Sep2016Morning);
		clock.tick(10); //start date is 10st of September 2016 09:00

		//act
		await _clickTodayButton.call(this, this.oPC2, clock);
		clock.tick(10);

		_switchToView.call(this, CalendarIntervalType.Hour, this.oPC2);
		clock.tick(10);

		//assert
		iInterval = jQuery("#" + this.oPC2.getId()).outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1] ? 6 : 12;

		//assert
		if (iInterval === 12) { //Hours View large
			aExpectedVisibleHours = [
				UI5Date.getInstance(2016, 7, 29, 9),
				UI5Date.getInstance(2016, 7, 29, 10),
				UI5Date.getInstance(2016, 7, 29, 11),
				UI5Date.getInstance(2016, 7, 29, 12),
				UI5Date.getInstance(2016, 7, 29, 13),
				UI5Date.getInstance(2016, 7, 29, 14),
				UI5Date.getInstance(2016, 7, 29, 15),
				UI5Date.getInstance(2016, 7, 29, 16),
				UI5Date.getInstance(2016, 7, 29, 17),
				UI5Date.getInstance(2016, 7, 29, 18),
				UI5Date.getInstance(2016, 7, 29, 19),
				UI5Date.getInstance(2016, 7, 29, 20)];
		} else {
			aExpectedVisibleHours = [
				UI5Date.getInstance(2016, 7, 29, 9),
				UI5Date.getInstance(2016, 7, 29, 10),
				UI5Date.getInstance(2016, 7, 29, 11),
				UI5Date.getInstance(2016, 7, 29, 12),
				UI5Date.getInstance(2016, 7, 29, 13),
				UI5Date.getInstance(2016, 7, 29, 14)];
		}

		_assertHoursAreVisible.call(this, aExpectedVisibleHours, this.oPC2,
			"10 Sept 2016, 09:00: Weeks->Today(01 Sep, 00:00)->Hours");

		//cleanup
		clock.restore();
	});

	QUnit.test("'Today' button visibility works only with week view", async function (assert) {
		//prepare
		var oFakeNow = this.o10Sep2016,
			clock = sinon.useFakeTimers(oFakeNow.getTime());
		this.oPC2.invalidate(); //start date is 1st of September 2016

		await nextUIUpdate(clock);

		//act
		await _clickTodayButton.call(this, this.oPC2, clock);
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

	QUnit.test("If view changed from Week->Hours, we see hours for first day of the previously shown week", async function (assert) {
		var iInterval;
		//startDate 1st of september 2016(Thursday)->show hours for the 1st day of week 29 Aug 2016 (Monday)
		//prepare
		_switchToView.call(this, CalendarIntervalType.Hour, this.oPC2);
		await nextUIUpdate();

		iInterval = jQuery("#" + this.oPC2.getId()).outerWidth() < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1] ? 6 : 12;

		//assert
		if (iInterval === 12) { //Hours View large
			_assertHoursAreVisible.call(this, [
					UI5Date.getInstance(2016, 7, 29, 1),
					UI5Date.getInstance(2016, 7, 29, 2),
					UI5Date.getInstance(2016, 7, 29, 3),
					UI5Date.getInstance(2016, 7, 29, 4),
					UI5Date.getInstance(2016, 7, 29, 5),
					UI5Date.getInstance(2016, 7, 29, 6),
					UI5Date.getInstance(2016, 7, 29, 7),
					UI5Date.getInstance(2016, 7, 29, 8),
					UI5Date.getInstance(2016, 7, 29, 9),
					UI5Date.getInstance(2016, 7, 29, 10),
					UI5Date.getInstance(2016, 7, 29, 11),
					UI5Date.getInstance(2016, 7, 29, 12)],
				this.oPC2, "1 Sept 2016, 01:00: Weeks->Hours");
		} else { //6, Hours View small - 6
			_assertHoursAreVisible.call(this, [
					UI5Date.getInstance(2016, 7, 29, 1),
					UI5Date.getInstance(2016, 7, 29, 2),
					UI5Date.getInstance(2016, 7, 29, 3),
					UI5Date.getInstance(2016, 7, 29, 4),
					UI5Date.getInstance(2016, 7, 29, 5),
					UI5Date.getInstance(2016, 7, 29, 6)],
				this.oPC2, "1 Sept 2016, 01:00: Weeks->Hours");
		}

	});


	QUnit.test("Week view - click on different dates keeps the focus and week", async function(assert) {
		//Prepare
		var aWeekDays = this.oPC2Interval.$("days").children();

		//Act
		aWeekDays.eq(1).trigger("focus");
		await nextUIUpdate();
		aWeekDays.eq(2).trigger("focus");
		await nextUIUpdate();
		aWeekDays.eq(3).trigger("focus");
		await nextUIUpdate();

		//assert initial state
		_assertDatesAreVisible.call(this, [
				UI5Date.getInstance(2016, 7, 29),
				UI5Date.getInstance(2016, 7, 30),
				UI5Date.getInstance(2016, 7, 31),
				UI5Date.getInstance(2016, 8, 1),
				UI5Date.getInstance(2016, 8, 2),
				UI5Date.getInstance(2016, 8, 3),
				UI5Date.getInstance(2016, 8, 4)],
			this.oPC2, "Initial week should not be changed");
	});

	QUnit.test("setStartDate should preserve the hours when navigation occurs in all views except hours view", function (assert) {
		// Prepare
		var oEvent = {
			oSource: {
				getStartDate: function () {
					return UI5Date.getInstance(2015, 1, 12);
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

	QUnit.test("setStartDate should not preserve the hours when navigation occurs in custom views of type hour", async function (assert) {
		// Prepare
		var oEvent = {
			oSource: {
				getStartDate: function () {
					return UI5Date.getInstance(2015, 1, 12);
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
		await nextUIUpdate();

		// Act
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 0, "The Hours are changed to 00");
	});


	QUnit.test("setStartDate should preserve the hours when navigation occurs in custom views of type hour", async function (assert) {
		// Prepare
		var oEvent = {
			oSource: {
				getStartDate: function () {
					return UI5Date.getInstance(2015, 1, 12);
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
		await nextUIUpdate();

		// Act
		this.oPC2._handleStartDateChange(oEvent);

		// Assert
		assert.strictEqual(this.oPC2.getStartDate().getHours(), 1, "The Hours are not changed to 00, but instead the original hours are preserved in Day view");
	});

	QUnit.test('Clicking today is updating calendars start date and Navigations current date', async function(assert) {
		var oToday = UI5Date.getInstance();
		this.oPC2.setViewKey(CalendarIntervalType.Hour);
		await nextUIUpdate();

		//act
		await _navBackward.call(this, this.oPC2);
		await _clickTodayButton.call(this, this.oPC2);

		//assert
		assert.equal(this.oPC2._dateNav._current.getFullYear(), oToday.getFullYear(), 'year is correct');
		assert.equal(this.oPC2._dateNav._current.getMonth(), oToday.getMonth(), 'month is correct');
		assert.equal(this.oPC2._dateNav._current.getDate(), oToday.getDate(), 'date is correct');

		this.oPC2.setViewKey(CalendarIntervalType.Week);
	});

	QUnit.test("Date Picker close button works on mobile", function(assert) {
		var oHeader = this.oPC2._getHeader(),
			oCalendarPicker = ElementRegistry.get(oHeader.getAssociation("currentPicker")),
			oSpyCancel = this.spy(oHeader, "_closeCalendarPickerPopup");

		oHeader._openCalendarPickerPopup(oCalendarPicker);

		oHeader._handlePickerCancelEvent();

		assert.equal(oSpyCancel.callCount,1, "Close event was thrown once");
	});

	QUnit.test("Selection is correct after resizing", async function(assert) {
		// Prepare
		var oSelectedDate = UI5Date.getInstance(2019, 11, 3);

		this.oPC2.setViewKey("One Month");
		this.oPC2._oOneMonthsRow.addSelectedDate(new DateTypeRange({
			startDate: oSelectedDate
		}));

		// Act
		this.oPC2.setWidth("200px");
		await nextUIUpdate();

		// Assert
		assert.equal(this.oPC2._oOneMonthsRow.getSelectedDates()[0].getStartDate().getTime(), oSelectedDate.getTime(),
			"After resizing the selected date is the same as one selected from the user.");
	});

	QUnit.module("Miscellaneous", {
		beforeEach: function() {
			this.oPC = new PlanningCalendar();
		},
		afterEach: function() {
			this.oPC.destroy();
		}
	});

	QUnit.test("View Switch remains the same type after Overflow", async function(assert) {
		var fnDone = assert.async(),
			oViewSwitch,
			oContainer = document.getElementById("smallUiArea"),
			bIsSelectBeforeOverflow,
			bIsSelectAfterOverflow;

		this.oPC.placeAt("smallUiArea");
		await nextUIUpdate();

		oViewSwitch = this.oPC._getHeader()._oViewSwitch;
		bIsSelectBeforeOverflow = oViewSwitch.getDomRef().classList.contains("sapMSegBSelectWrapper");

		// shrink width to force overflow
		oContainer.style.width = "80px";
		setTimeout(function() {
			// return width back to previous
			oContainer.style.width = "600px";
			setTimeout(function() {
				bIsSelectAfterOverflow = oViewSwitch.getDomRef().classList.contains("sapMSegBSelectWrapper");
				assert.equal(bIsSelectBeforeOverflow, bIsSelectAfterOverflow, "The View Switch is the same type before and after Overflow");
				fnDone();
			}, 200);
		}, 200);
	});

	QUnit.test("CalendarAppointment handles shortened background hex color values properly", function(assert) {
		var oAppointment = new CalendarAppointment();

		// Assert
		assert.strictEqual(oAppointment._getCSSColorForBackground("#ff00ff"), "rgba(255, 0, 255, 0.2)",
			"Proper value returned from _getCSSColorForBackground when the hex value is not shortened");
		assert.strictEqual(oAppointment._getCSSColorForBackground("#f0f"), "rgba(255, 0, 255, 0.2)",
			"Proper value returned from _getCSSColorForBackground when the hex value is shortened");
	});

	QUnit.test("Internal Table's busy indicator is displayed while loading of data", async function(assert) {
		var oTable = this.oPC.getAggregation("table");

		// Prepare
		this.oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		// Act
		this.oPC._onBindingDataRequestedListener();
		await nextUIUpdate();

		// Assert
		assert.ok(oTable.getBusy(), "Busy Indicator of internal Table is set on data loading");

		// Act
		this.oPC._onBindingDataReceivedListener();
		await nextUIUpdate();

		// Assert
		assert.notOk(oTable.getBusy(), "Busy Indicator of internal Table is unset on data loading");
	});

	function _getAppointmentsCount(oPC) {
		var aRows = oPC.getRows(),
			iAppointments = 0;

		aRows.forEach(function(oRow){
			iAppointments += oRow.getAppointments().length;
		});

		return iAppointments;
	}

	QUnit.module("PC with secondaryCalendarType", {
		beforeEach: function() {
			this.oPC = new PlanningCalendar();
		},
		afterEach: function() {
			this.oPC.destroy();
		}
	});

	QUnit.test("initial PC with two calendar types", function (assert) {
		//Assert
		assert.notOk(this.oPC.getSecondaryCalendarType(), "Default value for second calendar type in PC is undefined");
		assert.notOk(this.oPC._getSecondaryCalendarType(), "If no second calendar type is explicitly set, it must be undefined");
	});

	QUnit.test("set the same primary and secondary calendar types", function (assert){
		// Act
		this.oPC.setPrimaryCalendarType("Islamic");
		this.oPC.setSecondaryCalendarType("Islamic");

		// Assert
		assert.equal(this.oPC._getSecondaryCalendarType(), undefined, "After a primary calendar type is set, the secondaryCalendarType defaults to no value from the calendar type enum");

		//if remove _bSecondaryCalendarTypeSet form setter for secondaryCalendarType, calendar type is set automatically to Gregorian (default for Calendar Type enum)
		assert.equal(this.oPC._getSecondaryCalendarType(), undefined, "the secondaryCalendarType cannot be the same as the primaryCalendarType");

		// Act
		this.oPC.setSecondaryCalendarType("Gregorian");

		// Assert
		assert.strictEqual(this.oPC._getSecondaryCalendarType(), "Gregorian", "secondary calendar type is correctly set to Gregorian");
	});

	QUnit.test("headerButton", async function (assert){
		// Prepare
		this.oPC.setViewKey(CalendarIntervalType.Day);
		this.oPC.setStartDate(UI5Date.getInstance(2021, 0, 1));
		this.oPC.setPrimaryCalendarType("Gregorian");
		this.oPC.placeAt("bigUiArea");
		await nextUIUpdate();

		// Act
		var sButtonText = this.oPC._getHeader()._oPickerBtn.getText();
		var sSecondaryButtonText = this.oPC._getHeader()._oPickerBtn.getAdditionalText();

		// Assert
		assert.strictEqual(sButtonText, "1 January 2021 - 14 January 2021");
		assert.equal(sSecondaryButtonText, "", "The button has no additional text with only one calendar type");

		// Act
		this.oPC.setSecondaryCalendarType("Islamic");
		await nextUIUpdate();
		sSecondaryButtonText = this.oPC._getHeader()._oPickerBtn.getAdditionalText();

		// Assert
		assert.strictEqual(sSecondaryButtonText, "17 Jumada I 1442 AH - 30 Jumada I 1442 AH", "button shuld have additional text '17 Jumada I 1442 AH - 30 Jumada I 1442 AH'");

	});
});