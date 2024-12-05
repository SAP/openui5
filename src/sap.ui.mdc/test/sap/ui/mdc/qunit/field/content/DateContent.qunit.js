sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"./ContentBasicTest",
	"sap/ui/mdc/field/content/DateContent",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/DynamicDateRangeConditionsType",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/OperatorDynamicDateOption",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/library",
	"sap/m/DatePicker",
	"sap/m/DateRangeSelection",
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDateFormat",
	"sap/ui/model/type/Date" // to be loaded
], (
	QUnit,
	ContentBasicTest,
	DateContent,
	ConditionsType,
	DynamicDateRangeConditionsType,
	FilterOperatorUtil,
	OperatorDynamicDateOption,
	BaseType,
	FieldEditMode,
	OperatorName,
	mobileLibrary,
	DatePicker,
	DateRangeSelection,
	DynamicDateRange,
	DynamicDateFormat,
	DateType
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
		],
		detailTests: _checkDynamicDateRange
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
			[OperatorName.EQ]: { name: "sap/m/DatePicker", create: DateContent._createDatePickerControl },
			[OperatorName.BT]: { name: "sap/m/DateRangeSelection", create: DateContent._createDateRangePickerControl }
		},
		modules: [DatePicker],
		instances: [DatePicker],
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
				valueFormat: "yyyy-MM-dd"
			}
		],
		events: [
			{
				change: {value: "X"},
				liveChange: {value: "X", previousValue: ""}
			}
		],
		detailTests: _checkDatePicker
	};
	ContentBasicTest.controlMapKeys.push("EditOperatorEQ");
	ContentBasicTest.controlMap.EditOperatorBT = {
		key: "EditOperator",
		operator: OperatorName.BT,
		getPathsFunction: "getEditOperator",
		paths: {
			[OperatorName.EQ]: { name: "sap/m/DatePicker", create: DateContent._createDatePickerControl },
			[OperatorName.BT]: { name: "sap/m/DateRangeSelection", create: DateContent._createDateRangePickerControl }
		},
		modules: [DateRangeSelection],
		instances: [DateRangeSelection],
		createFunction: "_createDateRangePickerControl",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		formatOptions: {pattern: "yyyy+MM+dd", calendarType: "Gregorian", secondaryCalendarType: "Islamic", UTC: true},
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
				displayFormat: "yyyy+MM+dd",
				valueFormat: "yyyy-MM-dd",
				delimiter: "..."
			}
		],
		events: [
			{
				change: {value: "X"},
				liveChange: {value: "X", previousValue: ""}
			}
		],
		detailTests: _checkDatePicker
	};
	ContentBasicTest.controlMapKeys.push("EditOperatorBT");

	const oDefaultValueHelp = {name: "defineConditions", oneOperatorSingle: false, oneOperatorMulti: true, single: false, multi: true};
	ContentBasicTest.test(QUnit, DateContent, "DateContent", "sap.ui.model.type.Date", {style: "long", calendarType: "Gregorian", secondaryCalendarType: "Islamic", UTC: true}, undefined, BaseType.Date, oDefaultValueHelp, true);

	function _checkDynamicDateRange(assert, aControls, oValue) {
		const oDynamicDateRange = aControls[0];
		const oFormatter = oDynamicDateRange.getFormatter();
		let aStandardOptions = oDynamicDateRange.getStandardOptions();
		let aCustomOptions = oDynamicDateRange.getCustomOptions();
		const oData = ContentBasicTest.model.getData();
		const aOperators = oData._operators;
		const aDefaultOperators = FilterOperatorUtil.getOperatorsForType(BaseType.Date);

		assert.deepEqual(oFormatter.oOriginalFormatOptions.date, {style: "long"}, "Formatter set on DynamicDateRange");
		// check only some specific operators, not every single one
		assert.equal(aStandardOptions.length + aCustomOptions.length, aOperators.length, "Option for each operator created on DynamicDateRange");

		// EQ needs to be mapped on DATE
		assert.ok(aStandardOptions.indexOf("DATE") >= 0, "DATE option created");
		// TODAY ist just taken
		assert.ok(aStandardOptions.indexOf("TODAY") >= 0, "TODAY option created");
		// NOTBT needs to be mapped as custom Option
		let oOption;
		for (let i = 0; i < aCustomOptions.length; i++) {
			if (aCustomOptions[i].getKey() === "Date-NOTBT") {
				oOption = aCustomOptions[i];
			}
		}
		assert.ok(oOption, "NOTBT option created for Date");
		assert.ok(oOption.isA('sap.ui.mdc.condition.OperatorDynamicDateOption'), "OperatorDynmaicDateOption added for NOTBT");
		assert.equal(oOption.getOperator().name, "NOTBT", "Operator assigned to Option");
		assert.equal(oOption.getType().getMetadata().getName(), "sap.ui.model.type.Date", "Date type assigned to Option");
		assert.deepEqual(oOption.getValueTypes(), ["custom", "custom"], "ValueTypes assigned to Option");

		// check for default operators
		oData._operators = aDefaultOperators;
		ContentBasicTest.model.checkUpdate(true);
		aStandardOptions = oDynamicDateRange.getStandardOptions();
		aCustomOptions = oDynamicDateRange.getCustomOptions();
		assert.equal(aStandardOptions.length + aCustomOptions.length, aDefaultOperators.length, "Option for each operator created on DynamicDateRange");
	}

	function _checkDatePicker(assert, aControls, oValue) {
		let oDataType = this.oContentFactory.getDataType();
		let oFormatOptions = oDataType.getFormatOptions();
		assert.equal(oFormatOptions.pattern, "yyyy-MM-dd", "DataType: pattern set");
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

	QUnit.start();
});