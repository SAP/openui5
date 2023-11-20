/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/DateTimeContent",
	"sap/ui/mdc/Field",
	"sap/m/Text",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/Token",
	"sap/m/DateTimePicker",
	"sap/m/DynamicDateRange",
	"sap/ui/mdc/condition/OperatorDynamicDateOption",
	"sap/ui/mdc/field/DynamicDateRangeConditionsType",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/DynamicDateFormat",
	"sap/m/library",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/odata/type/DateTimeWithTimezone"
], function(
	QUnit,
	DateTimeContent,
	Field,
	Text,
	FieldInput,
	FieldMultiInput,
	Token,
	DateTimePicker,
	DynamicDateRange,
	OperatorDynamicDateOption,
	DynamicDateRangeConditionsType,
	OperatorName,
	DynamicDateFormat,
	mobileLibrary,
	DateTimeType,
	DateTimeWithTimezoneType
) {
	"use strict";

	const oControlMap = {
		"Display": {
			getPathsFunction: "getDisplay",
			paths: ["sap/m/Text"],
			instances: [Text],
			createFunction: "createDisplay"
		},
		"Edit": {
			getPathsFunction: "getEdit",
			paths: ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"],
			instances: [DynamicDateRange, OperatorDynamicDateOption, DynamicDateRangeConditionsType, mobileLibrary, DynamicDateFormat],
			createFunction: "createEdit"
		},
		"EditMultiValue": {
			getPathsFunction: "getEditMultiValue",
			paths: ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"],
			instances: [FieldMultiInput, Token],
			createFunction: "createEditMultiValue"
		},
		"EditMultiLine": {
			getPathsFunction: "getEditMultiLine",
			paths: [null],
			instances: [null],
			createFunction: "createEditMultiLine",
			throwsError: true
		}
	};

	const aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		const oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction, function(assert) {
			assert.deepEqual(DateTimeContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		const oEditOperator = DateTimeContent.getEditOperator();
		assert.equal(oEditOperator[OperatorName.EQ].name, "sap/m/DateTimePicker", "Correct editOperator 'EQ' name returned.");
		assert.equal(oEditOperator[OperatorName.EQ].create, DateTimeContent._createDatePickerControl, "Correct editOperator 'EQ' create function returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(DateTimeContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultValueHelp", function(assert) {
		const oUseDefaultValueHelp = DateTimeContent.getUseDefaultValueHelp();
		assert.equal(oUseDefaultValueHelp.name, "defineConditions", "Correct useDefaultValueHelp.name value returned.");
		assert.notOk(oUseDefaultValueHelp.oneOperatorSingle, "Correct useDefaultValueHelp.oneOperatorSingle value returned.");
		assert.ok(oUseDefaultValueHelp.oneOperatorMulti, "Correct useDefaultValueHelp.oneOperatorMulti value returned.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(DateTimeContent.getControlNames(null), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode null");
		assert.deepEqual(DateTimeContent.getControlNames(undefined), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode undefined");
		assert.deepEqual(DateTimeContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"], "Correct controls returned for not specified ContentMode");

		assert.deepEqual(DateTimeContent.getControlNames("Edit"), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode 'Edit'");
		assert.deepEqual(DateTimeContent.getControlNames("Display"), ["sap/m/Text"], "Correct controls returned for ContentMode 'Display'");
		assert.deepEqual(DateTimeContent.getControlNames("EditMultiValue"), ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"], "Correct controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(DateTimeContent.getControlNames("EditMultiLine"), [null], "Correct controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(DateTimeContent.getControlNames("EditOperator"), [null], "Correct controls returned for ContentMode 'EditOperator'");
		assert.deepEqual(DateTimeContent.getControlNames("EditOperator", OperatorName.EQ), ["sap/m/DateTimePicker"], "Correct controls returned for ContentMode 'EditOperator' and 'EQ'");
	});

	QUnit.module("Content creation", {
		beforeEach: function() {
			this.oField = new Field("F1", {dataType: "sap.ui.model.type.DateTime", dataTypeFormatOptions: {style: "long", calendarType: "Gregorian", secondaryCalendarType: "Islamic", UTC: true}});
			this.aControls = [];
		},
		afterEach: function() {
			this.oField.destroy();
			delete this.oField;
			while (this.aControls.length > 0) {
				const oControl = this.aControls.pop();
				if (oControl) {
					oControl.destroy();
				}
			}
		}
	});

	const fnCreateControls = function(oContentFactory, sContentMode, sIdPostFix) {
		return DateTimeContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	const fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(DateTimeContent, oControlMap[sContentMode].createFunction) : null;
	};

	const fnSpyCalledOnce = function(fnSpyFunction, sContentMode, assert) {
		if (fnSpyFunction) {
			assert.ok(fnSpyFunction.calledOnce, oControlMap[sContentMode].createFunction + " called once.");
		}
	};

	QUnit.test("create", function(assert) {
		const done = assert.async();
		const oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			const aDisplayControls = oControlMap["Display"].instances;
			const aEditControls = oControlMap["Edit"].instances;
			const aEditMultiValueControls = oControlMap["EditMultiValue"].instances;

			const fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			const fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			const fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			const fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");

			const aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			const aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			const aCreatedEditMultiValueControls = fnCreateControls(oContentFactory, "EditMultiValue", "-create");

			assert.throws(
				function() {
					DateTimeContent.create(oContentFactory, "EditMultiLine", null, oControlMap["EditMultiLine"].instances, "EditMultiLine-create");
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.DateTimeContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");

			const aCreatedEditOperatorEQControls = DateTimeContent.create(oContentFactory, "EditOperator", OperatorName.EQ, [DateTimePicker], "EditOperatorEQ-create");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.ok(aCreatedEditMultiValueControls[0] instanceof aEditMultiValueControls[0], aEditMultiValueControls[0].getMetadata().getName() + " control created for ContentMode 'EditMultiValue'.");

			assert.ok(aCreatedEditOperatorEQControls[0] instanceof DateTimePicker, aCreatedEditOperatorEQControls[0].getMetadata().getName() + " control created for ContentMode 'EditOperator EQ'.");

			done();
		});
	});

	aControlMapKeys.forEach(function(sControlMapKey) {
		const oValue = oControlMap[sControlMapKey];
		if (oValue.createFunction && !oValue.throwsError) {
			QUnit.test(oValue.createFunction, function(assert) {
				const done = assert.async();
				const oContentFactory = this.oField._oContentFactory;
				this.oField.awaitControlDelegate().then(function() {
					const oInstance = oValue.instances[0];
					const aControls = DateTimeContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);
					done();
				});
			});
		}
	});

	QUnit.test("_createDatePickerControl", function(assert) {
		const done = assert.async();
		const oField = this.oField;
		const oContentFactory = oField._oContentFactory;
		oField.awaitControlDelegate().then(function() {
			const aControls = DateTimeContent._createDatePickerControl(oContentFactory, [DateTimePicker], "createDatePickerControl");

			assert.ok(aControls[0] instanceof DateTimePicker, "Correct control created in '_createDatePickerControl'.");
			assert.equal(aControls[0].getSecondaryCalendarType(), oField.getDataTypeFormatOptions().secondaryCalendarType, "secondaryCalendarType property forwarded.");
			assert.notOk(aControls[0].getShowTimezone(), "No Timezone shown");
			assert.notOk(aControls[0].getBindingInfo("timezone"), "Timezone not bound");
			assert.notOk(oContentFactory.getUnitType(), "No ConditionsType for Timezone");
			for (let i = 0; i < aControls.length; i++) {
				aControls[i].destroy();
			}
			done();
		});
	});

	QUnit.test("createEditMultiLine", function(assert) {
		const done = assert.async();
		this.oField.awaitControlDelegate().then(function() {
			assert.throws(
				function() {
					DateTimeContent.createEditMultiLine();
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.DateTimeContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");
			done();
		});
	});

	QUnit.module("Content creation for Timezone", {
		beforeEach: function() {
			this.oField = new Field("F1", {dataType: "sap.ui.model.odata.type.DateTimeWithTimezone", dataTypeFormatOptions: {style: "long", calendarType: "Gregorian", UTC: true, showTimezone: true}});
			this.aControls = [];
		},
		afterEach: function() {
			this.oField.destroy();
			delete this.oField;
			while (this.aControls.length > 0) {
				const oControl = this.aControls.pop();
				if (oControl) {
					oControl.destroy();
				}
			}
		}
	});

	QUnit.test("_createDatePickerControl", function(assert) {
		const done = assert.async();
		const oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			const aControls = DateTimeContent._createDatePickerControl(oContentFactory, [DateTimePicker], "createDatePickerControl");

			assert.ok(aControls[0] instanceof DateTimePicker, "Correct control created in '_createDatePickerControl'.");
			let oType = oContentFactory.getDataType();
			assert.ok(oType, "'cloned' type used");
			assert.equal(oType.getFormatOptions().showTimezone, false, "'cloned' type hides timezone");
			assert.ok(!oType.getFormatOptions().hasOwnProperty("showDate") || oType.getFormatOptions().showDate, "'cloned' type shows date");
			assert.ok(!oType.getFormatOptions().hasOwnProperty("showTime") || oType.getFormatOptions().showTime, "'cloned' type shows time");
			oType = oContentFactory.getDateOriginalType();
			assert.ok(oType, "Original type stored");
			assert.equal(oType.getFormatOptions().showTimezone, true, "Original type shows timezone");
			assert.ok(!oType.getFormatOptions().hasOwnProperty("showDate") || oType.getFormatOptions().showDate, "Original type shows date");
			assert.ok(!oType.getFormatOptions().hasOwnProperty("showTime") || oType.getFormatOptions().showTime, "Original type shows time");
			assert.ok(aControls[0].getShowTimezone(), "Timezone shown");
			oType = oContentFactory.getUnitType();
			assert.ok(oType, "own type for Timezone");
			assert.equal(oType.getFormatOptions().showTimezone, true, "timezone-type shows timezone");
			assert.equal(oType.getFormatOptions().showDate, false, "timezone-type don't shows date");
			assert.equal(oType.getFormatOptions().showTime, false, "timezone-type don't shows time");
			oType = oContentFactory.getUnitConditionsType(true);
			assert.ok(oType, "own ConditionsType for Timezone");
			const oBindingInfo = aControls[0].getBindingInfo("timezone");
			assert.ok(oBindingInfo, "Timezone bound");
			assert.equal(oBindingInfo && oBindingInfo.type, oType, "Timezone bound using own ConditionsType");
			assert.equal(oBindingInfo && oBindingInfo.parts[0].targetType, "sap.ui.mdc.raw:1", "Timezone bound using own TargetType");

			for (let i = 0; i < aControls.length; i++) {
				aControls[i].destroy();
			}
			done();
		});
	});

	QUnit.start();
});