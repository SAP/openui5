sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"./ContentBasicTest",
	"sap/ui/mdc/field/content/TimeContent",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/TimePicker",
	"sap/ui/model/type/Time" // to be loaded
], (
	QUnit,
	ContentBasicTest,
	TimeContent,
	ConditionsType,
	BaseType,
	FieldEditMode,
	OperatorName,
	TimePicker,
	TimeType
) => {
	"use strict";

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
			[OperatorName.EQ]: { name: "sap/m/TimePicker", create: TimeContent._createDatePickerControl }
		},
		modules: [TimePicker],
		instances: [TimePicker],
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
				displayFormat: "long",
				valueFormat: "HH:mm:ss"
			}
		],
		events:[
			{
				change: {value: "X"},
				liveChange: {value: "X", previousValue: ""}
			}
		],
		detailTests: _checkTimePicker
	};
	ContentBasicTest.controlMapKeys.push("EditOperatorEQ");

	const oDefaultValueHelp = {name: "defineConditions", oneOperatorSingle: false, oneOperatorMulti: true, single: false, multi: true};
	ContentBasicTest.test(QUnit, TimeContent, "TimeContent", "sap.ui.model.type.Time", {style: "long", calendarType: "Gregorian", secondaryCalendarType: "Islamic", UTC: true}, undefined, BaseType.Time, oDefaultValueHelp, true);

	function _checkTimePicker(assert, aControls, oValue) {
		let oDataType = this.oContentFactory.getDataType();
		let oFormatOptions = oDataType.getFormatOptions();
		assert.equal(oFormatOptions.pattern, "HH:mm:ss", "DataType: pattern set");
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