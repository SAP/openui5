/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/DateContent",
	"sap/ui/mdc/FilterField", // use FilterField to allow multi-value and different operators
	"sap/ui/mdc/field/ConditionType",
	"sap/ui/mdc/field/ConditionsType",
	"sap/m/Text",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/Token",
	"sap/m/DatePicker",
	"sap/m/DateRangeSelection",
	"sap/m/DynamicDateRange",
	"sap/ui/mdc/condition/OperatorDynamicDateOption",
	"sap/ui/mdc/field/DynamicDateRangeConditionsType",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/library",
	"sap/m/DynamicDateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date"
], function(
	QUnit,
	DateContent,
	Field,
	ConditionType,
	ConditionsType,
	Text,
	FieldInput,
	FieldMultiInput,
	Token,
	DatePicker,
	DateRangeSelection,
	DynamicDateRange,
	OperatorDynamicDateOption,
	DynamicDateRangeConditionsType,
	OperatorName,
	mobileLibrary,
	DynamicDateFormat,
	JSONModel,
	DateType
) {
	"use strict";

	Field.prototype.checkCreateInternalContent = function() {}; // prevent creating internal control by itself

	const oControlMap = {
		"Display": {
			getPathsFunction: "getDisplay",
			paths: ["sap/m/Text"],
			instances: [Text],
			createFunction: "createDisplay",
			maxConditions: -1,
			boundProperty: "text",
			boundType: ConditionsType
		},
		"Edit": {
			getPathsFunction: "getEdit",
			paths: ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"],
			instances: [DynamicDateRange, OperatorDynamicDateOption, DynamicDateRangeConditionsType, mobileLibrary, DynamicDateFormat],
			createFunction: "createEdit",
			maxConditions: 1,
			boundProperty: "value",
			boundType: DynamicDateRangeConditionsType,
			detailTests: _checkDynamicDateRange
		},
		"EditMultiValue": {
			getPathsFunction: "getEditMultiValue",
			paths: ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"],
			instances: [FieldMultiInput, Token],
			createFunction: "createEditMultiValue",
			maxConditions: -1,
			boundAggregation: "tokens",
			boundProperty: "text",
			boundType: ConditionType
		},
		"EditMultiLine": {
			getPathsFunction: "getEditMultiLine",
			paths: [null],
			instances: [null],
			createFunction: "createEditMultiLine",
			maxConditions: 1,
			throwsError: true
		},
		"EditForHelp": {
			getPathsFunction: "getEditForHelp",
			paths: ["sap/ui/mdc/field/FieldInput"],
			instances: [FieldInput],
			createFunction: "createEditForHelp",
			maxConditions: 1,
			boundProperty: "value",
			boundType: ConditionsType
		}
	};

	const aControlMapKeys = Object.keys(oControlMap);

	const oModel = new JSONModel({ // just to fake ManagedObjectModel of Field to test bindings
		conditions: [],
		placeholder: "placeholder",
		editMode: "Editable",
		required: false,
		valueState: "None",
		valueStateText: "",
		tooltip: "Tooltip",
		textAlign: "Initial",
		textDirection: "Inherit",
		_operators: [OperatorName.EQ, OperatorName.TODAY, OperatorName.BT, OperatorName.NOTBT]
	});
	const oStub = sinon.stub(oModel, "getProperty");
	oStub.withArgs("/").callsFake(function(sPath, oContext) { // fake behaviour of ManagedObjectModel
		return oContext;
	});
	oStub.callThrough();

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		const oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction, function(assert) {
			assert.deepEqual(DateContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		const oEditOperator = DateContent.getEditOperator();
		assert.equal(oEditOperator[OperatorName.EQ].name, "sap/m/DatePicker", "Correct editOperator 'EQ' name returned.");
		assert.equal(oEditOperator[OperatorName.EQ].create, DateContent._createDatePickerControl, "Correct editOperator 'EQ' create function returned.");

		assert.equal(oEditOperator[OperatorName.BT].name, "sap/m/DateRangeSelection", "Correct editOperator 'BT' name returned.");
		assert.equal(oEditOperator[OperatorName.BT].create, DateContent._createDateRangePickerControl, "Correct editOperator 'BT' create function returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(DateContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultFieldHelp", function(assert) {
		const oUseDefaultFieldHelp = DateContent.getUseDefaultFieldHelp();
		assert.equal(oUseDefaultFieldHelp.name, "defineConditions", "Correct useDefaultFieldHelp.name value returned.");
		assert.notOk(oUseDefaultFieldHelp.oneOperatorSingle, "Correct useDefaultFieldHelp.oneOperatorSingle value returned.");
		assert.ok(oUseDefaultFieldHelp.oneOperatorMulti, "Correct useDefaultFieldHelp.oneOperatorMulti value returned.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(DateContent.getControlNames(null), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode null");
		assert.deepEqual(DateContent.getControlNames(undefined), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode undefined");
		assert.deepEqual(DateContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"], "Correct controls returned for not specified ContentMode");

		assert.deepEqual(DateContent.getControlNames("Edit"), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode 'Edit'");
		assert.deepEqual(DateContent.getControlNames("Display"), ["sap/m/Text"], "Correct controls returned for ContentMode 'Display'");
		assert.deepEqual(DateContent.getControlNames("EditMultiValue"), ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"], "Correct controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(DateContent.getControlNames("EditMultiLine"), [null], "Correct controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(DateContent.getControlNames("EditOperator"), [null], "Correct controls returned for ContentMode 'EditOperator'");
		assert.deepEqual(DateContent.getControlNames("EditOperator", OperatorName.EQ), ["sap/m/DatePicker"], "Correct controls returned for ContentMode 'EditOperator' and 'EQ'");
		assert.deepEqual(DateContent.getControlNames("EditOperator", OperatorName.BT), ["sap/m/DateRangeSelection"], "Correct controls returned for ContentMode 'EditOperator' and 'BT'");
		assert.deepEqual(DateContent.getControlNames("EditForHelp"), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for ContentMode 'Edit'");
	});

	QUnit.module("Content creation", {
		beforeEach: function() {
			this.oField = new Field("F1", {dataType: "sap.ui.model.type.Date", dataTypeFormatOptions: {style: "long", calendarType: "Gregorian", secondaryCalendarType: "Islamic", UTC: true}});
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
		return DateContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	const fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(DateContent, oControlMap[sContentMode].createFunction) : null;
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
			const aEditForHelpControls = oControlMap["EditForHelp"].instances;

			const fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			const fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			const fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			const fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");
			const fnCreateEditForHelpFunction = fnSpyOnCreateFunction("EditForHelp");

			const aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			const aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			const aCreatedEditMultiValueControls = fnCreateControls(oContentFactory, "EditMultiValue", "-create");
			const aCreatedEditForHelpControls = fnCreateControls(oContentFactory, "EditForHelp", "-create");

			assert.throws(
				function() {
					DateContent.create(oContentFactory, "EditMultiLine", null, oControlMap["EditMultiLine"].instances, "EditMultiLine-create");
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.DateContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");

			const aCreatedEditOperatorEQControls = DateContent.create(oContentFactory, "EditOperator", OperatorName.EQ, [DatePicker], "EditOperatorEQ-create");
			const aCreatedEditOperatorBTControls = DateContent.create(oContentFactory, "EditOperator", OperatorName.BT, [DateRangeSelection], "EditOperatorBT-create");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);
			fnSpyCalledOnce(fnCreateEditForHelpFunction, "EditForHelp", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.ok(aCreatedEditMultiValueControls[0] instanceof aEditMultiValueControls[0], aEditMultiValueControls[0].getMetadata().getName() + " control created for ContentMode 'EditMultiValue'.");

			assert.ok(aCreatedEditOperatorEQControls[0] instanceof DatePicker, aCreatedEditOperatorEQControls[0].getMetadata().getName() + " control created for ContentMode 'EditOperator EQ'.");
			assert.ok(aCreatedEditOperatorBTControls[0] instanceof DateRangeSelection, aCreatedEditOperatorEQControls[0].getMetadata().getName() + " control created for ContentMode 'EditOperator BT'.");
			assert.ok(aCreatedEditForHelpControls[0] instanceof aEditForHelpControls[0], aEditForHelpControls[0].getMetadata().getName() + " control created for ContentMode 'EditForHelp'.");

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
					this.oField.setMaxConditions(oValue.maxConditions);
					const oInstance = oValue.instances[0];
					const aControls = DateContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);
					aControls[0].setModel(oModel, "$field"); // to create bindings

					if (oValue.boundProperty || oValue.boundAggregation) {
						let oBindingInfo = aControls[0].getBindingInfo(oValue.boundAggregation || oValue.boundProperty);
						assert.ok(oBindingInfo, "Control BindingInfo created");
						const sPath = oBindingInfo.path || oBindingInfo.parts[0].path;
						assert.equal(sPath, "/conditions", "BindingInfo path");
						if (oValue.boundAggregation) {
							oBindingInfo = oBindingInfo.template.getBindingInfo(oValue.boundProperty);
						}
						assert.equal(oBindingInfo.type.getMetadata().getName(), oValue.boundType.getMetadata().getName(), "Type of binding");
					}
					if (oValue.detailTests) {
						oValue.detailTests.call(this, assert, aControls);
					}
					done();
				}.bind(this));
			});
		}
	});

	QUnit.test("_createDatePickerControl", function(assert) {
		const done = assert.async();
		const oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			const aControls = DateContent._createDatePickerControl(oContentFactory, [DatePicker], "createDatePickerControl");

			assert.ok(aControls[0] instanceof DatePicker, "Correct control created in '_createDatePickerControl'.");
			assert.equal(aControls[0].getSecondaryCalendarType(), this.oField.getDataTypeFormatOptions().secondaryCalendarType, "secondaryCalendarType property forwarded.");
			done();
		}.bind(this));
	});

	QUnit.test("_createDateRangePickerControl", function(assert) {
		const done = assert.async();
		const oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			const aControls = DateContent._createDateRangePickerControl(oContentFactory, [DateRangeSelection], "createDateRangePickerControl");

			assert.ok(aControls[0] instanceof DateRangeSelection, "Correct control created in '_createDateRangePickerControl'.");
			assert.equal(aControls[0].getSecondaryCalendarType(), this.oField.getDataTypeFormatOptions().secondaryCalendarType, "secondaryCalendarType property forwarded.");
			done();
		}.bind(this));
	});

	QUnit.test("createEditMultiLine", function(assert) {
		const done = assert.async();
		this.oField.awaitControlDelegate().then(function() {
			assert.throws(
				function() {
					DateContent.createEditMultiLine();
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.DateContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");
			done();
		});
	});

	function _checkDynamicDateRange(assert, aControls) {

		const oDynamicDateRange = aControls[0];
		const oFormatter = oDynamicDateRange.getFormatter();
		let aStandardOptions = oDynamicDateRange.getStandardOptions();
		let aCustomOptions = oDynamicDateRange.getCustomOptions();
		const oData = oModel.getData();
		const aOperators = oData._operators;
		const aDefaultOperators = this.oField.getSupportedOperators();

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
		oModel.checkUpdate(true);
		aStandardOptions = oDynamicDateRange.getStandardOptions();
		aCustomOptions = oDynamicDateRange.getCustomOptions();
		assert.equal(aStandardOptions.length + aCustomOptions.length, aDefaultOperators.length, "Option for each operator created on DynamicDateRange");
	}

	QUnit.start();
});