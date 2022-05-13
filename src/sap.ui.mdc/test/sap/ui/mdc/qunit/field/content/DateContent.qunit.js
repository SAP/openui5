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
	"sap/m/library",
	"sap/m/DynamicDateUtil",
	"sap/m/DynamicDateFormat",
	"sap/ui/model/json/JSONModel"
], function(QUnit, DateContent, Field, ConditionType, ConditionsType, Text, FieldInput, FieldMultiInput, Token, DatePicker, DateRangeSelection, DynamicDateRange, OperatorDynamicDateOption, DynamicDateRangeConditionsType, mobileLibrary, DynamicDateUtil, DynamicDateFormat, JSONModel) {
	"use strict";

	var StandardDynamicDateRangeKeys = mobileLibrary.StandardDynamicDateRangeKeys;

	var oControlMap = {
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
			paths: ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/StandardDynamicDateRangeKeys", "sap/m/DynamicDateUtil", "sap/m/DynamicDateFormat"],
			instances: [DynamicDateRange, OperatorDynamicDateOption, DynamicDateRangeConditionsType, StandardDynamicDateRangeKeys, DynamicDateUtil, DynamicDateFormat],
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

	var aControlMapKeys = Object.keys(oControlMap);

	var oModel = new JSONModel({ // just to fake ManagedObjectModel of Field to test bindings
		conditions: [],
		placeholder: "placeholder",
		editMode: "Editable",
		required: false,
		valueState: "None",
		valueStateText: "",
		tooltip: "Tooltip",
		textAlign: "Initial",
		textDirection: "Inherit",
		operators: ["EQ", "TODAY", "BT", "NOTBT"]
	});

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		var oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction, function(assert) {
			assert.deepEqual(DateContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		var oEditOperator = DateContent.getEditOperator();
		assert.equal(oEditOperator["EQ"].name, "sap/m/DatePicker", "Correct editOperator 'EQ' name returned.");
		assert.equal(oEditOperator["EQ"].create, DateContent._createDatePickerControl, "Correct editOperator 'EQ' create function returned.");

		assert.equal(oEditOperator["BT"].name, "sap/m/DateRangeSelection", "Correct editOperator 'BT' name returned.");
		assert.equal(oEditOperator["BT"].create, DateContent._createDateRangePickerControl, "Correct editOperator 'BT' create function returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(DateContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultFieldHelp", function(assert) {
		var oUseDefaultFieldHelp = DateContent.getUseDefaultFieldHelp();
		assert.equal(oUseDefaultFieldHelp.name, "defineConditions", "Correct useDefaultFieldHelp.name value returned.");
		assert.notOk(oUseDefaultFieldHelp.oneOperatorSingle, "Correct useDefaultFieldHelp.oneOperatorSingle value returned.");
		assert.ok(oUseDefaultFieldHelp.oneOperatorMulti, "Correct useDefaultFieldHelp.oneOperatorMulti value returned.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(DateContent.getControlNames(null), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/StandardDynamicDateRangeKeys", "sap/m/DynamicDateUtil", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode null");
		assert.deepEqual(DateContent.getControlNames(undefined), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/StandardDynamicDateRangeKeys", "sap/m/DynamicDateUtil", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode undefined");
		assert.deepEqual(DateContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/StandardDynamicDateRangeKeys", "sap/m/DynamicDateUtil", "sap/m/DynamicDateFormat"], "Correct controls returned for not specified ContentMode");

		assert.deepEqual(DateContent.getControlNames("Edit"), ["sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/StandardDynamicDateRangeKeys", "sap/m/DynamicDateUtil", "sap/m/DynamicDateFormat"], "Correct controls returned for ContentMode 'Edit'");
		assert.deepEqual(DateContent.getControlNames("Display"), ["sap/m/Text"], "Correct controls returned for ContentMode 'Display'");
		assert.deepEqual(DateContent.getControlNames("EditMultiValue"), ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"], "Correct controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(DateContent.getControlNames("EditMultiLine"), [null], "Correct controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(DateContent.getControlNames("EditOperator"), [null], "Correct controls returned for ContentMode 'EditOperator'");
		assert.deepEqual(DateContent.getControlNames("EditOperator", "EQ"), ["sap/m/DatePicker"], "Correct controls returned for ContentMode 'EditOperator' and 'EQ'");
		assert.deepEqual(DateContent.getControlNames("EditOperator", "BT"), ["sap/m/DateRangeSelection"], "Correct controls returned for ContentMode 'EditOperator' and 'BT'");
		assert.deepEqual(DateContent.getControlNames("EditForHelp"), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for ContentMode 'Edit'");
	});

	QUnit.module("Content creation", {
		beforeEach: function() {
			this.oField = new Field("F1", {dataType: "sap.ui.model.type.Date", dataTypeFormatOptions: {style: "long", calendarType: "Gregorian", UTC: true}});
			this.aControls = [];
		},
		afterEach: function() {
			this.oField.destroy();
			delete this.oField;
			while (this.aControls.length > 0) {
				var oControl = this.aControls.pop();
				if (oControl) {
					oControl.destroy();
				}
			}
		}
	});

	var fnCreateControls = function(oContentFactory, sContentMode, sIdPostFix) {
		return DateContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	var fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(DateContent, oControlMap[sContentMode].createFunction) : null;
	};

	var fnSpyCalledOnce = function(fnSpyFunction, sContentMode, assert) {
		if (fnSpyFunction) {
			assert.ok(fnSpyFunction.calledOnce, oControlMap[sContentMode].createFunction + " called once.");
		}
	};

	QUnit.test("create", function(assert) {
		var done = assert.async();
		var oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			var aDisplayControls = oControlMap["Display"].instances;
			var aEditControls = oControlMap["Edit"].instances;
			var aEditMultiValueControls = oControlMap["EditMultiValue"].instances;
			var aEditForHelpControls = oControlMap["EditForHelp"].instances;

			var fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			var fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			var fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			var fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");
			var fnCreateEditForHelpFunction = fnSpyOnCreateFunction("EditForHelp");

			var aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			var aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			var aCreatedEditMultiValueControls = fnCreateControls(oContentFactory, "EditMultiValue", "-create");
			var aCreatedEditForHelpControls = fnCreateControls(oContentFactory, "EditForHelp", "-create");

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

			var aCreatedEditOperatorEQControls = DateContent.create(oContentFactory, "EditOperator", "EQ", [DatePicker], "EditOperatorEQ-create");
			var aCreatedEditOperatorBTControls = DateContent.create(oContentFactory, "EditOperator", "BT", [DateRangeSelection], "EditOperatorBT-create");

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
		var oValue = oControlMap[sControlMapKey];
		if (oValue.createFunction && !oValue.throwsError) {
			QUnit.test(oValue.createFunction, function(assert) {
				var done = assert.async();
				var oContentFactory = this.oField._oContentFactory;
				this.oField.awaitControlDelegate().then(function() {
					this.oField.setMaxConditions(oValue.maxConditions);
					var oInstance = oValue.instances[0];
					var aControls = DateContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);
					aControls[0].setModel(oModel, "$field"); // to create bindings

					if (oValue.boundProperty || oValue.boundAggregation) {
						var oBindingInfo = aControls[0].getBindingInfo(oValue.boundAggregation || oValue.boundProperty);
						assert.ok(oBindingInfo, "Control BindingInfo created");
						var sPath = oBindingInfo.path || oBindingInfo.parts[0].path;
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
		var done = assert.async();
		var oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			var aControls = DateContent._createDatePickerControl(oContentFactory, [DatePicker], "createDatePickerControl");

			assert.ok(aControls[0] instanceof DatePicker, "Correct control created in '_createDatePickerControl'.");
			done();
		});
	});

	QUnit.test("_createDateRangePickerControl", function(assert) {
		var done = assert.async();
		var oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			var aControls = DateContent._createDateRangePickerControl(oContentFactory, [DateRangeSelection], "createDateRangePickerControl");

			assert.ok(aControls[0] instanceof DateRangeSelection, "Correct control created in '_createDateRangePickerControl'.");
			done();
		});
	});

	QUnit.test("createEditMultiLine", function(assert) {
		var done = assert.async();
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

		var oDynamicDateRange = aControls[0];
		var oFormatter = oDynamicDateRange.getFormatter();
		var aOptions = oDynamicDateRange.getOptions();
		var oData = oModel.getData();
		var aOperators = oData.operators;
		var aDefaultOperators = this.oField._getOperators();

		assert.deepEqual(oFormatter.oOriginalFormatOptions.date, {UTC:true, style: "long"}, "Formatter set on DynamicDateRange");
		// check only some specific operators, nor every single one
		assert.equal(aOptions.length, aOperators.length, "Option for each operator created on DynamicDateRange");

		// EQ needs to be mapped on DATE
		assert.ok(aOptions.indexOf("DATE") >= 0, "DATE option created");
		// TODAY ist just taken
		assert.ok(aOptions.indexOf("TODAY") >= 0, "TODAY option created");
		// NOTBT needs to be mapped as custom Option
		assert.ok(aOptions.indexOf("Date-NOTBT") >= 0, "NOTBT option created for Date");
		var oOption = DynamicDateUtil.getOption("Date-NOTBT");
		assert.ok(oOption.isA('sap.ui.mdc.condition.OperatorDynamicDateOption'), "OperatorDynmaicDateOption added for NOTBT");
		assert.equal(oOption.getOperator().name, "NOTBT", "Operator assigned to Option");
		assert.equal(oOption.getType().getMetadata().getName(), "sap.ui.model.type.Date", "Date type assigned to Option");
		assert.deepEqual(oOption.getValueTypes(), ["custom", "custom"], "ValueTypes assigned to Option");

		// check for default operators
		oData.operators = [];
		oModel.checkUpdate(true);
		aOptions = oDynamicDateRange.getOptions();
		assert.equal(aOptions.length, aDefaultOperators.length, "Option for each operator created on DynamicDateRange");
	}

	QUnit.start();
});