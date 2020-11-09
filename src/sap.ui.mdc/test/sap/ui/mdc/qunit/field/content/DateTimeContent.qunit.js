/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/DateTimeContent",
	"sap/ui/mdc/Field",
	"sap/m/Text",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/Token",
	"sap/m/DateTimePicker"
], function(QUnit, DateTimeContent, Field, Text, FieldInput, FieldMultiInput, Token, DateTimePicker) {
	"use strict";

	var oControlMap = {
		"Display": {
			getPathsFunction: DateTimeContent.getDisplay,
			paths: ["sap/m/Text"],
			instances: [Text],
			createFunction: DateTimeContent.createDisplay
		},
		"Edit": {
			getPathsFunction: DateTimeContent.getEdit,
			paths: ["sap/ui/mdc/field/FieldInput"],
			instances: [FieldInput],
			createFunction: DateTimeContent.createEdit
		},
		"EditMulti": {
			getPathsFunction: DateTimeContent.getEditMulti,
			paths: ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"],
			instances: [FieldMultiInput, Token],
			createFunction: DateTimeContent.createEditMulti
		},
		"EditMultiLine": {
			getPathsFunction: DateTimeContent.getEditMultiLine,
			paths: [null],
			instances: [null],
			createFunction: DateTimeContent.createEditMultiLine,
			throwsError: true
		}
	};

	var aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		var oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction.name, function(assert) {
			assert.deepEqual(oValue.getPathsFunction(), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		var oEditOperator = DateTimeContent.getEditOperator();
		assert.equal(oEditOperator["EQ"].name, "sap/m/DateTimePicker", "Correct editOperator 'EQ' name returned.");
		assert.equal(oEditOperator["EQ"].create, DateTimeContent._createDatePickerControl, "Correct editOperator 'EQ' create function returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(DateTimeContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultFieldHelp", function(assert) {
		var oUseDefaultFieldHelp = DateTimeContent.getUseDefaultFieldHelp();
		assert.equal(oUseDefaultFieldHelp.name, "defineConditions", "Correct useDefaultFieldHelp.name value returned.");
		assert.notOk(oUseDefaultFieldHelp.oneOperatorSingle, "Correct useDefaultFieldHelp.oneOperatorSingle value returned.");
		assert.ok(oUseDefaultFieldHelp.oneOperatorMulti, "Correct useDefaultFieldHelp.oneOperatorMulti value returned.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(DateTimeContent.getControlNames(null), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for ContentMode null");
		assert.deepEqual(DateTimeContent.getControlNames(undefined), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for ContentMode undefined");
		assert.deepEqual(DateTimeContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for not specified ContentMode");

		assert.deepEqual(DateTimeContent.getControlNames("Edit"), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for ContentMode 'Edit'");
		assert.deepEqual(DateTimeContent.getControlNames("Display"), ["sap/m/Text"], "Correct controls returned for ContentMode 'Display'");
		assert.deepEqual(DateTimeContent.getControlNames("EditMulti"), ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"], "Correct controls returned for ContentMode 'EditMulti'");
		assert.deepEqual(DateTimeContent.getControlNames("EditMultiLine"), [null], "Correct controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(DateTimeContent.getControlNames("EditOperator"), [null], "Correct controls returned for ContentMode 'EditOperator'");
	});

	QUnit.module("Content creation", {
		beforeEach: function() {
			this.oField = new Field({});
			this.aControls = [];
		},
		afterEach: function() {
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
		return DateTimeContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	var fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(DateTimeContent, oControlMap[sContentMode].createFunction.name) : null;
	};

	var fnSpyCalledOnce = function(fnSpyFunction, sContentMode, assert) {
		if (fnSpyFunction) {
			assert.ok(fnSpyFunction.calledOnce, oControlMap[sContentMode].createFunction.name + " called once.");
		}
	};

	QUnit.test("create", function(assert) {
		var done = assert.async();
		var oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			var aDisplayControls = oControlMap["Display"].instances;
			var aEditControls = oControlMap["Edit"].instances;
			var aEditMultiControls = oControlMap["EditMulti"].instances;

			var fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			var fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			var fnCreateEditMultiFunction = fnSpyOnCreateFunction("EditMulti");
			var fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");

			var aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			var aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			var aCreatedEditMultiControls = fnCreateControls(oContentFactory, "EditMulti", "-create");

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

			var aCreatedEditOperatorEQControls = DateTimeContent.create(oContentFactory, "EditOperator", "EQ", [DateTimePicker], "EditOperatorEQ-create");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiFunction, "EditMulti", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.ok(aCreatedEditMultiControls[0] instanceof aEditMultiControls[0], aEditMultiControls[0].getMetadata().getName() + " control created for ContentMode 'EditMulti'.");

			assert.ok(aCreatedEditOperatorEQControls[0] instanceof DateTimePicker, aCreatedEditOperatorEQControls[0].getMetadata().getName() + " control created for ContentMode 'EditOperator EQ'.");

			done();
		});
	});

	aControlMapKeys.forEach(function(sControlMapKey) {
		var oValue = oControlMap[sControlMapKey];
		if (oValue.createFunction && !oValue.throwsError) {
			QUnit.test(oValue.createFunction.name, function(assert) {
				var done = assert.async();
				var oContentFactory = this.oField._oContentFactory;
				this.oField.awaitControlDelegate().then(function() {
					var oInstance = oValue.instances[0];
					var aControls = DateTimeContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction.name);
					done();
				});
			});
		}
	});

	QUnit.test("_createDatePickerControl", function(assert) {
		var done = assert.async();
		var oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			var aControls = DateTimeContent._createDatePickerControl(oContentFactory, [DateTimePicker], "createDatePickerControl");

			assert.ok(aControls[0] instanceof DateTimePicker, "Correct control created in '_createDatePickerControl'.");
			done();
		});
	});

	QUnit.test("createEditMultiLine", function(assert) {
		var done = assert.async();
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

	QUnit.start();
});