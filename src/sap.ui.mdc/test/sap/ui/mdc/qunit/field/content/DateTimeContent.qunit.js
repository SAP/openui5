sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"./ContentBasicTest",
	"sap/ui/mdc/field/content/DateTimeContent",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/DynamicDateRangeConditionsType",
	"sap/ui/mdc/condition/OperatorDynamicDateOption",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/DateTimePicker",
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDateFormat",
	"sap/m/library",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/odata/type/DateTimeWithTimezone"
], (
	QUnit,
	ContentBasicTest,
	DateTimeContent,
	ConditionsType,
	DynamicDateRangeConditionsType,
	OperatorDynamicDateOption,
	BaseType,
	FieldEditMode,
	OperatorName,
	DateTimePicker,
	DynamicDateRange,
	DynamicDateFormat,
	mobileLibrary,
	DateTimeType,
	DateTimeWithTimezoneType
) => {
	"use strict";

	ContentBasicTest.controlMap.Edit = {
		getPathsFunction: "getEdit",
		paths: ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"],
		modules: [DynamicDateRange, OperatorDynamicDateOption, DynamicDateRangeConditionsType, mobileLibrary, DynamicDateFormat],
		instances: [DynamicDateRange],
		createFunction: "createEdit",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		formatOptions: {style: "long", calendarType: "Gregorian", secondaryCalendarType: "Islamic", UTC: true},
		bindings: [
			{
				value: {path: "$field>/conditions", type: DynamicDateRangeConditionsType},
				placeholder: {path: "$field>/placeholder"},
				required: {path: "$field>/required"},
				editable: {path: "$field>/editMode"},
				enabled: {path: "$field>/editMode"},
				valueState: {path: "$field>/valueState"},
				valueStateText: {path: "$field>/valueStateText"},
				tooltip: {path: "$field>/tooltip"}
			}
		],
		properties: [
			{
				width: "100%"
			}
		],
		events: [
			{
				change: {value: "X"}
			}
		]
	};
	ContentBasicTest.controlMap.EditMultiLine = {
		getPathsFunction: "getEditMultiLine",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createEditMultiLine",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		throwsError: true
	};
	delete ContentBasicTest.controlMap.EditOperator;
	ContentBasicTest.controlMapKeys.splice(ContentBasicTest.controlMapKeys.indexOf("EditOperator"), 1);
	ContentBasicTest.controlMap.EditOperatorEQ = {
		key: "EditOperator",
		operator: OperatorName.EQ,
		getPathsFunction: "getEditOperator",
		paths: {
			[OperatorName.EQ]: { name: "sap/m/DateTimePicker", create: DateTimeContent._createDatePickerControl }
		},
		modules: [DateTimePicker],
		instances: [DateTimePicker],
		createFunction: "_createDatePickerControl",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		formatOptions: {style: "long", calendarType: "Gregorian", secondaryCalendarType: "Islamic", UTC: true},
		bindings: [
			{
				value: {path: "$field>/conditions", type: ConditionsType},
				placeholder: {path: "$field>/placeholder"},
				textAlign: {path: "$field>/textAlign"},
				textDirection: {path: "$field>/textDirection"},
				required: {path: "$field>/required"},
				editable: {path: "$field>/editMode"},
				enabled: {path: "$field>/editMode"},
				valueState: {path: "$field>/valueState"},
				valueStateText: {path: "$field>/valueStateText"},
				tooltip: {path: "$field>/tooltip"}
			}
		],
		properties: [
			{
				width: "100%",
				displayFormatType: "Gregorian",
				secondaryCalendarType: "Islamic",
				displayFormat: "long",
				valueFormat: "yyyy-MM-dd'T'HH:mm:ss",
				showTimezone: undefined
			}
		],
		events: [
			{
				change: {value: "X"},
				liveChange: {value: "X", previousValue: ""}
			}
		],
		detailTests: _checkDateTimePicker
	};
	ContentBasicTest.controlMapKeys.push("EditOperatorEQ");

	const oDefaultValueHelp = {name: "defineConditions", oneOperatorSingle: false, oneOperatorMulti: true, single: false, multi: true};
	ContentBasicTest.test(QUnit, DateTimeContent, "DateTimeContent", "sap.ui.model.type.DateTime", {style: "long", calendarType: "Gregorian", secondaryCalendarType: "Islamic", UTC: true}, undefined, BaseType.DateTime, oDefaultValueHelp, true);

	function _checkDateTimePicker(assert, aControls, oValue) {
		assert.notOk(aControls[0].getBindingInfo("timezone"), "Timezone not bound");
		assert.notOk(this.oContentFactory.getUnitType(), "No ConditionsType for Timezone");

		let oDataType = this.oContentFactory.getDataType();
		let oFormatOptions = oDataType.getFormatOptions();
		assert.equal(oFormatOptions.pattern, "yyyy-MM-dd'T'HH:mm:ss", "DataType: pattern set");
		assert.notOk(oFormatOptions.hasOwnProperty("style"), "DataType: no style set");

		oDataType = this.oContentFactory.getDateOriginalType();
		oFormatOptions = oDataType.getFormatOptions();
		if (oValue.formatOptions.hasOwnProperty("style")) {
			assert.equal(oFormatOptions.style, oValue.formatOptions.style, "DateOriginalType: style set");
			assert.notOk(oFormatOptions.hasOwnProperty("pattern"), "DateOriginalType: no pattern set");
		} else {
			assert.equal(oFormatOptions.pattern, oValue.formatOptions.pattern, "DateOriginalType: pattern set");
			assert.notOk(oFormatOptions.hasOwnProperty("style"), "DateOriginalType: no style set");
		}
	}

	QUnit.module("Content creation for Timezone", {
		beforeEach: () => {
			ContentBasicTest.initContentFactory("sap.ui.model.odata.type.DateTimeWithTimezone", {pattern: "yyyy+MM+dd'T'HH:mm:ss", calendarType: "Gregorian", UTC: true, showTimezone: true}, undefined, BaseType.DateTime);
		},
		afterEach: () => {
			ContentBasicTest.cleanUpContentFactory();
		}
	});

	QUnit.test("check DateTimePicker", (assert) => {
		const aControls = DateTimeContent.create(this.oContentFactory, "EditOperator", OperatorName.EQ, [DateTimePicker], "ContentControl");

		assert.ok(aControls[0] instanceof DateTimePicker, "Correct control created in '_createDatePickerControl'.");
		assert.equal(aControls[0].getDisplayFormat(), "yyyy+MM+dd'T'HH:mm:ss", "displayFormat: given pattern used");
		let oType = this.oContentFactory.getDataType();
		assert.ok(oType, "'cloned' type used");
		assert.equal(oType.getFormatOptions().showTimezone, false, "'cloned' type hides timezone");
		assert.ok(!oType.getFormatOptions().hasOwnProperty("showDate") || oType.getFormatOptions().showDate, "'cloned' type shows date");
		assert.ok(!oType.getFormatOptions().hasOwnProperty("showTime") || oType.getFormatOptions().showTime, "'cloned' type shows time");
		oType = this.oContentFactory.getDateOriginalType();
		assert.ok(oType, "Original type stored");
		assert.equal(oType.getFormatOptions().showTimezone, true, "Original type shows timezone");
		assert.ok(!oType.getFormatOptions().hasOwnProperty("showDate") || oType.getFormatOptions().showDate, "Original type shows date");
		assert.ok(!oType.getFormatOptions().hasOwnProperty("showTime") || oType.getFormatOptions().showTime, "Original type shows time");
		assert.ok(aControls[0].getShowTimezone(), "Timezone shown");
		oType = this.oContentFactory.getUnitType();
		assert.ok(oType, "own type for Timezone");
		assert.equal(oType.getFormatOptions().showTimezone, true, "timezone-type shows timezone");
		assert.equal(oType.getFormatOptions().showDate, false, "timezone-type don't shows date");
		assert.equal(oType.getFormatOptions().showTime, false, "timezone-type don't shows time");
		oType = this.oContentFactory.getUnitConditionsType(true);
		assert.ok(oType, "own ConditionsType for Timezone");
		const oBindingInfo = aControls[0].getBindingInfo("timezone");
		assert.ok(oBindingInfo, "Timezone bound");
		assert.equal(oBindingInfo && oBindingInfo.type, oType, "Timezone bound using own ConditionsType");
		assert.equal(oBindingInfo && oBindingInfo.parts[0].targetType, "sap.ui.mdc.raw:1", "Timezone bound using own TargetType");

		aControls.forEach((oCreatedControl, iIndex) => {
			oCreatedControl.destroy();
		});
	});

	QUnit.start();
});