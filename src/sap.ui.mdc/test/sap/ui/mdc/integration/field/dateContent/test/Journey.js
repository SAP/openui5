/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/mdc/integration/field/Util",
	"sap/ui/mdc/integration/field/pages/App",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/Time",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Core"
], function(
	Opa5,
	opaTest,
	FieldTestUtil,
	App,
	DateType,
	DateTimeType,
	TimeType,
	DateFormat,
	Core
) {
	"use strict";

	// shortcut for sap.m resource bundle
	var oRb = Core.getLibraryResourceBundle("sap.ui.core");

	Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 45 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 45,

		arrangements: {
			iStartMyUIComponentInViewMode: function() {

				// In some cases when a test fails in a success function,
				// the UI component is not properly teardown.
				// As a side effect, all the following tests in the stack
				// fails when the UI component is started, as only one UI
				// component can be started at a time.
				// Teardown the UI component to ensure it is not started
				// twice without a teardown, which results in less false
				// positives and more reliable reporting.
				if (this.hasUIComponentStarted()) {
					this.iTeardownMyUIComponent();
				}

				return this.iStartMyUIComponent({
					componentConfig: {
						name: "sap.ui.mdc.integration.field.dateContent",
						async: true,
						settings: {
							id: "testingComponent"
						}
					},
					hash: "",
					autoWait: true
				});
			}
		}
	});

	var oDateType = new DateType();
	var oDateTimeType = new DateTimeType();
	var oTimeType = new TimeType();

	var oFieldDate = new Date(2022, 10, 28, 12, 45, 52);
	var oToday = new Date();
	var oTomorrow = new Date(new Date().setDate(oToday.getDate() + 1));
	var oYesterday = new Date(new Date().setDate(oToday.getDate() - 1));
	var oInFiveDays = new Date(new Date().setDate(oToday.getDate() + 5));

	var aDynamicDates = [
		{
			dynamicDate: "Today",
			expectedDynamicDateRangeValue: {
				operator: "TODAY",
				values: []
			},
			expectedDynamicDateRangeInputValue: "Today (" + oDateType.formatValue(oToday, "string") + ")"
		},
		{
			dynamicDate: "Tomorrow",
			expectedDynamicDateRangeValue: {
				operator: "TOMORROW",
				values: []
			},
			expectedDynamicDateRangeInputValue: "Tomorrow (" + oDateType.formatValue(oTomorrow, "string") + ")"
		},
		{
			dynamicDate: "Yesterday",
			expectedDynamicDateRangeValue: {
				operator: "YESTERDAY",
				values: []
			},
			expectedDynamicDateRangeInputValue: "Yesterday (" + oDateType.formatValue(oYesterday, "string") + ")"
		}
	];

	var fnGetId = function(sId) {
		return "testingComponent---app--" + sId;
	};

	var getDateAsYYYYMMDD = function(oDate) {
		var sYear = oDate.getFullYear().toString();
		var iMonth = oDate.getMonth() + 1;
		var sMonth = iMonth < 10 ? "0" + iMonth : iMonth;
		var sDay = oDate.getDate() < 10 ? "0" + oDate.getDate().toString() : oDate.getDate().toString();

		return sYear + "-" + sMonth + "-" + sDay;
	};

	var getDateAsYYYYMMDDWithTime = function(oDate) {
		return getDateAsYYYYMMDD(oDate) + "T" + oDate.toTimeString().split(" ")[0];
	};

	var getRangeForDates = function(oStartDate, oEndDate, sConnection) {
		return oDateType.formatValue(oStartDate, "string") + sConnection + oDateType.formatValue(oEndDate, "string");
	};

	var getRangeForDateTimes = function(oStartDate, oEndDate, sConnection) {
		return oDateTimeType.formatValue(oStartDate, "string") + sConnection + oDateTimeType.formatValue(oEndDate, "string");
	};

	var aFields = [
		{ id: "F-Date", initialValue: oDateType.formatValue(oFieldDate, "string"), innerControl: "sap.m.DatePicker", valueStateText: oRb.getText("Date.Invalid") },
		{ id: "F-DateTime", initialValue: oDateTimeType.formatValue(oFieldDate, "string"), innerControl: "sap.m.DateTimePicker", valueStateText: oRb.getText("DateTime.Invalid") },
		{ id: "F-Time", initialValue: oTimeType.formatValue(oFieldDate, "string"), innerControl: "sap.m.TimePicker", valueStateText: oRb.getText("Date.Invalid") }
	];

	var aFilterFields = [
		// FilterFields with maxConditions="1"
		{ id: "FF-Date", innerControl: "sap.m.DatePicker", valueStateText: oRb.getText("Date.Invalid") },
		{ id: "FF-DateTime", innerControl: "sap.m.DateTimePicker", valueStateText: oRb.getText("DateTime.Invalid") },
		{ id: "FF-Time", innerControl: "sap.m.TimePicker", valueStateText: oRb.getText("Date.Invalid") },
		{ id: "FF-DateRange", innerControl: "sap.m.DateRangeSelection", valueStateText: oRb.getText("Date.Invalid") },
		{ id: "FF-DateTimeRange", innerControl: "sap.m.DynamicDateRange", valueStateText: "Incorrect value" },
		{ id: "FF-DDR-Date", innerControl: "sap.m.DynamicDateRange", valueStateText: "Incorrect value" },
		{ id: "FF-DDR-DateTime", innerControl: "sap.m.DynamicDateRange", valueStateText: "Incorrect value" },
		// FilterFields with maxConditions="-1"
		{ id: "FF-Date-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: oRb.getText("Date.Invalid") },
		{ id: "FF-DateTime-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: oRb.getText("DateTime.Invalid") },
		{ id: "FF-Time-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: oRb.getText("Time.Invalid") },
		{ id: "FF-DateRange-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: oRb.getText("Date.Invalid") },
		{ id: "FF-DateTimeRange-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: oRb.getText("DateTime.Invalid") },
		{ id: "FF-DDR-Date-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: oRb.getText("Date.Invalid") },
		{ id: "FF-DDR-DateTime-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: oRb.getText("DateTime.Invalid") }
	];

	QUnit.module("Sanity");

	opaTest("Start application and check if all controlls are displayed correctly", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		aFields.forEach(function(oField) {
			Then.onTheMDCField.iShouldSeeTheFieldWithValues(fnGetId(oField.id), oField.initialValue);
			Then.onTheApp.iShouldSeeFieldWithInnerControl(fnGetId(oField.id), oField.innerControl);
		});

		aFilterFields.forEach(function(oFilterField) {
			Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(fnGetId(oFilterField.id), "");
			Then.onTheApp.iShouldSeeFilterFieldWithInnerControl(fnGetId(oFilterField.id), oFilterField.innerControl);
		});
	});

	opaTest("Enter invalid value in each Field and check if handling is correct", function(Given, When, Then) {
		aFields.forEach(function(oField) {
			if (oField.innerControl !== "sap.m.TimePicker") {
				When.onTheMDCField.iEnterTextOnTheField(fnGetId(oField.id), "abc123");
				Then.onTheApp.iShouldSeeFieldWithValueState(fnGetId(oField.id), "Error", oField.valueStateText);
			}
		});
	});

	opaTest("Enter invalid value in each FilterField and check if handling is correct", function(Given, When, Then) {
		aFilterFields.forEach(function(oFilterField) {
			if (oFilterField.innerControl !== "sap.m.TimePicker") {
				When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId(oFilterField.id), "abc123");
				Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
				{
					id: fnGetId(oFilterField.id),
					valueState: "Error",
					valueStateText: oFilterField.valueStateText
				},
				"abc123");
			}
		});
	});

	QUnit.module("Field");

	opaTest("DatePicker - Enter Date: '" + oDateType.formatValue(oTomorrow, "string") + "'", function(Given, When, Then) {
		When.onTheMDCField.iEnterTextOnTheField(fnGetId("F-Date"), oDateType.formatValue(oTomorrow, "string"));
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(fnGetId("F-Date"), oDateType.formatValue(oTomorrow, "string"));
		Then.onTheApp.iShouldSeeFieldWithValueState(fnGetId("F-Date"), "None", "");
		Then.onTheApp.iShouldSeeFieldWithDatePickerProperties(fnGetId("F-Date"), {
			dateValue: FieldTestUtil.getDateWithoutTime(oTomorrow),
			value: getDateAsYYYYMMDD(oTomorrow)
		});
	});

	opaTest("DateTimePicker - Enter DateTime: '" + oDateTimeType.formatValue(oTomorrow, "string") + "'", function(Given, When, Then) {
		When.onTheMDCField.iEnterTextOnTheField(fnGetId("F-DateTime"), oDateTimeType.formatValue(oTomorrow, "string"));
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(fnGetId("F-DateTime"), oDateTimeType.formatValue(oTomorrow, "string"));
		Then.onTheApp.iShouldSeeFieldWithValueState(fnGetId("F-DateTime"), "None", "");
		Then.onTheApp.iShouldSeeFieldWithDatePickerProperties(fnGetId("F-DateTime"), {
			dateValue: oTomorrow,
			value: getDateAsYYYYMMDDWithTime(oTomorrow)
		});
	});

	// No TimePicker Test implemented yet - see comment below (L283)

	QUnit.module("FilterField maxConditions='1'");

	opaTest("DatePicker - Enter Date: '" + oDateType.formatValue(oToday, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-Date"), oDateType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-Date"),
				valueState: "None",
				valueStateText: ""
			},
			oDateType.formatValue(oToday, "string"));
		Then.onTheApp.iShouldSeeFilterFieldWithDatePickerProperties(fnGetId("FF-Date"), {
			dateValue: FieldTestUtil.getDateWithoutTime(oToday),
			value: getDateAsYYYYMMDD(oToday)
		});
	});

	opaTest("DateTimePicker - Enter DateTime: '" + oDateTimeType.formatValue(oToday, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DateTime"), oDateTimeType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTime"),
				valueState: "None",
				valueStateText: ""
			},
			oDateTimeType.formatValue(oToday, "string"));
		Then.onTheApp.iShouldSeeFilterFieldWithDateTimePickerProperties(fnGetId("FF-DateTime"), {
			dateValue: oToday,
			value: getDateAsYYYYMMDDWithTime(oToday)
		});
	});

	/*
	var getDateTimeForTimePicker = function(oDateTime) {
		var oDate = new Date(0).setHours(oDateTime.getHours(), oDateTime.getMinutes(), oDateTime.getSeconds());
		return new Date(oDate);
	};

	Not working as TimePicker will always set value to "--:--:-- --" when focusing, this causes issues with Opa -> BCP 2270119571
	opaTest("TimePicker - Enter Time: " + oTimeType.formatValue(oDate, "string"), function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-Time") }, oTimeType.formatValue(oDate, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues({ id: fnGetId("FF-Time") }, {
			conditions: [{
				isEmpty: null,
				operator: "EQ",
				validated: "NotValidated",
				values: [ getDateTimeForTimePicker(oDate) ]
			}]
		});
		Then.onTheApp.iShouldSeeFilterFieldWithTimePickerProperties({ id: fnGetId("FF-Time") }, {
			dateValue: getDateTimeForTimePicker(oDate),
			value: oDate.toTimeString().split(" ")[0]
		});
	});

	opaTest("TimePicker - Enter Time: " + oDateTime.toTimeString().split(" ")[0], function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-Time") }, oDateTime.toTimeString().split(" ")[0]);
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues({ id: fnGetId("FF-Time") }, {
			conditions: [{
				isEmpty: null,
				operator: "EQ",
				validated: "NotValidated",
				values: [ getDateTimeForTimePicker(oDateTime) ]
			}]
		});
		Then.onTheApp.iShouldSeeFilterFieldWithTimePickerProperties({ id: fnGetId("FF-Time") }, {
			dateValue: getDateTimeForTimePicker(oDateTime),
			value: oDateTime.toTimeString().split(" ")[0]
		});
	});
	*/

	opaTest("DateRangeSelection - Enter Dates: '" + getRangeForDates(oToday, oInFiveDays, " ... ") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DateRange"), getRangeForDates(oToday, oInFiveDays, " ... "));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateRange"),
				valueState: "None",
				valueStateText: ""
			},
			getRangeForDates(oToday, oInFiveDays, " ... "));
		Then.onTheApp.iShouldSeeFilterFieldWithDateRangeSelectionProperties(fnGetId("FF-DateRange"), {
			dateValue: FieldTestUtil.getDateWithoutTime(oToday),
			secondDateValue: FieldTestUtil.getDateWithoutTime(oInFiveDays, true),
			value: getDateAsYYYYMMDD(oToday) + "..." + getDateAsYYYYMMDD(oInFiveDays)
		});
	});

	opaTest("DateRangeSelection - Enter DateTimes: '" + getRangeForDateTimes(oToday, oInFiveDays, " - ") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DateTimeRange"), getRangeForDateTimes(oToday, oInFiveDays, " - "));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTimeRange"),
				valueState: "None",
				valueStateText: ""
			},
			getRangeForDateTimes(oToday, oInFiveDays, " - "));
		Then.onTheApp.iShouldSeeFilterFieldWithDynamicDateRangeProperties(fnGetId("FF-DateTimeRange"), {
			value: {
				operator: "DATETIMERANGE",
				values: [ oToday, oInFiveDays ]
			},
			innerControlValue: getRangeForDateTimes(oToday, oInFiveDays, " - ")
		});
	});

	aDynamicDates.forEach(function(oDynamicDate) {
		opaTest("DynamicDateRange - Enter DynamicDate: '" + oDynamicDate.dynamicDate + "'", function(Given, When, Then) {
			When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DDR-Date"), oDynamicDate.dynamicDate);
			Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
				{
					id: fnGetId("FF-DDR-Date"),
					valueState: "None",
					valueStateText: ""
				},
				oDynamicDate.expectedDynamicDateRangeInputValue);
			Then.onTheApp.iShouldSeeFilterFieldWithDynamicDateRangeProperties(fnGetId("FF-DDR-Date"), {
				value: oDynamicDate.expectedDynamicDateRangeValue,
				innerControlValue: oDynamicDate.expectedDynamicDateRangeInputValue
			});
		});
	});

	opaTest("DynamicDateRange - Enter DateTimes: '" + getRangeForDateTimes(oToday, oInFiveDays, " - ") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DDR-DateTime"), getRangeForDateTimes(oToday, oInFiveDays, " - "));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DDR-DateTime"),
				valueState: "None",
				valueStateText: ""
			},
			getRangeForDateTimes(oToday, oInFiveDays, " - "));
		Then.onTheApp.iShouldSeeFilterFieldWithDynamicDateRangeProperties(fnGetId("FF-DDR-DateTime"), {
			value: {
				operator: "DATETIMERANGE",
				values: [ oToday, oInFiveDays ]
			},
			innerControlValue: oDateTimeType.formatValue(oToday, "string") + " - " + oDateTimeType.formatValue(oInFiveDays, "string")
		});
	});

	QUnit.module("FilterField maxConditions='-1'");

	opaTest("DatePicker - Enter Dates: '" + oDateType.formatValue(oToday, "string") + "' and '" + oDateType.formatValue(oTomorrow, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-Date-2"), oDateType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-Date-2"),
				valueState: "None",
				valueStateText: ""
			},
			oDateType.formatValue(oToday, "string"));

		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-Date-2"), oDateType.formatValue(oTomorrow, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-Date-2"),
				valueState: "None",
				valueStateText: ""
			},
			[ oDateType.formatValue(oToday, "string"), oDateType.formatValue(oTomorrow, "string")]);
	});

	opaTest("DateTimePicker - Enter DateTimes: " + oDateTimeType.formatValue(oToday, "string") + "' and '" + oDateTimeType.formatValue(oTomorrow, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DateTime-2"), oDateTimeType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTime-2"),
				valueState: "None",
				valueStateText: ""
			},
			oDateTimeType.formatValue(oToday, "string"));

		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DateTime-2"), oDateTimeType.formatValue(oTomorrow, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTime-2"),
				valueState: "None",
				valueStateText: ""
			},
			[ oDateTimeType.formatValue(oToday, "string"), oDateTimeType.formatValue(oTomorrow, "string") ]);
	});

	opaTest("TimePicker - Enter Time: '" + oTimeType.formatValue(oToday, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-Time-2"), oTimeType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-Time-2"),
				valueState: "None",
				valueStateText: ""
			},
			oTimeType.formatValue(oToday, "string"));
	});

	opaTest("DateRangeSelection - Enter Dates: '" + getRangeForDates(oToday, oInFiveDays, "...") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DateRange-2"), getRangeForDates(oToday, oInFiveDays, "..."));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateRange-2"),
				valueState: "None",
				valueStateText: ""
			},
			getRangeForDates(oToday, oInFiveDays, "..."));
	});

	opaTest("DateRangeSelection - Enter DateTimes: '" + getRangeForDateTimes(oToday, oInFiveDays, "...") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DateTimeRange-2"), getRangeForDateTimes(oToday, oInFiveDays, "..."));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTimeRange-2"),
				valueState: "None",
				valueStateText: ""
			},
			getRangeForDateTimes(oToday, oInFiveDays, "..."));
	});

	opaTest("DynamicDateRange - Enter DynamicDates", function(Given, When, Then) {
		var aTokenTexts = aDynamicDates.map(function(oDynamicDate) {
			return oDynamicDate.dynamicDate;
		});

		aDynamicDates.forEach(function(oDynamicDate, iIndex) {
			When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DDR-Date-2"), oDynamicDate.dynamicDate);
			Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
				{
					id: fnGetId("FF-DDR-Date-2"),
					valueState: "None",
					valueStateText: ""
				},
				aTokenTexts.slice(0, iIndex));
		});
	});

	opaTest("DynamicDateRange - Enter DateTimes: '" + getRangeForDateTimes(oToday, oInFiveDays, "...") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(fnGetId("FF-DDR-DateTime-2"), getRangeForDateTimes(oToday, oInFiveDays, "..."));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DDR-DateTime-2"),
				valueState: "None",
				valueStateText: ""
			},
			[ oDateTimeType.formatValue(oToday, "string") + "..." + oDateTimeType.formatValue(oInFiveDays, "string") ]);
		Then.iTeardownMyUIComponent();
	});

});