/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/TimeContent",
	"sap/ui/mdc/Field",
	"sap/m/Text",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/Token",
	"sap/m/TimePicker"
], function(QUnit, TimeContent, Field, Text, FieldInput, FieldMultiInput, Token, TimePicker) {
	"use strict";

	var oControlMap = {
		"Display": {
			getPathsFunction: "getDisplay",
			paths: ["sap/m/Text"],
			instances: [Text],
			createFunction: "createDisplay"
		},
		"Edit": {
			getPathsFunction: "getEdit",
			paths: ["sap/ui/mdc/field/FieldInput"],
			instances: [FieldInput],
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

	var aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		var oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction, function(assert) {
			assert.deepEqual(TimeContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		var oEditOperator = TimeContent.getEditOperator();
		assert.equal(oEditOperator["EQ"].name, "sap/m/TimePicker", "Correct editOperator 'EQ' name returned.");
		assert.equal(oEditOperator["EQ"].create, TimeContent._createDatePickerControl, "Correct editOperator 'EQ' create function returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(TimeContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultFieldHelp", function(assert) {
		var oUseDefaultFieldHelp = TimeContent.getUseDefaultFieldHelp();
		assert.equal(oUseDefaultFieldHelp.name, "defineConditions", "Correct useDefaultFieldHelp.name value returned.");
		assert.notOk(oUseDefaultFieldHelp.oneOperatorSingle, "Correct useDefaultFieldHelp.oneOperatorSingle value returned.");
		assert.ok(oUseDefaultFieldHelp.oneOperatorMulti, "Correct useDefaultFieldHelp.oneOperatorMulti value returned.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(TimeContent.getControlNames(null), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for ContentMode null");
		assert.deepEqual(TimeContent.getControlNames(undefined), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for ContentMode undefined");
		assert.deepEqual(TimeContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for not specified ContentMode");

		assert.deepEqual(TimeContent.getControlNames("Edit"), ["sap/ui/mdc/field/FieldInput"], "Correct controls returned for ContentMode 'Edit'");
		assert.deepEqual(TimeContent.getControlNames("Display"), ["sap/m/Text"], "Correct controls returned for ContentMode 'Display'");
		assert.deepEqual(TimeContent.getControlNames("EditMultiValue"), ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"], "Correct controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(TimeContent.getControlNames("EditMultiLine"), [null], "Correct controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(TimeContent.getControlNames("EditOperator"), [null], "Correct controls returned for ContentMode 'EditOperator'");
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
		return TimeContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	var fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(TimeContent, oControlMap[sContentMode].createFunction) : null;
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

			var fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			var fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			var fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			var fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");

			var aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			var aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			var aCreatedEditMultiValueControls = fnCreateControls(oContentFactory, "EditMultiValue", "-create");

			assert.throws(
				function() {
					TimeContent.create(oContentFactory, "EditMultiLine", null, oControlMap["EditMultiLine"].instances, "EditMultiLine-create");
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.TimeContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");

			var aCreatedEditOperatorEQControls = TimeContent.create(oContentFactory, "EditOperator", "EQ", [TimePicker], "EditOperatorEQ-create");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.ok(aCreatedEditMultiValueControls[0] instanceof aEditMultiValueControls[0], aEditMultiValueControls[0].getMetadata().getName() + " control created for ContentMode 'EditMultiValue'.");

			assert.ok(aCreatedEditOperatorEQControls[0] instanceof TimePicker, aCreatedEditOperatorEQControls[0].getMetadata().getName() + " control created for ContentMode 'EditOperator EQ'.");

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
					var oInstance = oValue.instances[0];
					var aControls = TimeContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);
					done();
				});
			});
		}
	});

	QUnit.test("_createDatePickerControl", function(assert) {
		var done = assert.async();
		var oContentFactory = this.oField._oContentFactory;
		this.oField.awaitControlDelegate().then(function() {
			var aControls = TimeContent._createDatePickerControl(oContentFactory, [TimePicker], "createDatePickerControl");

			assert.ok(aControls[0] instanceof TimePicker, "Correct control created in '_createDatePickerControl'.");
			done();
		});
	});

	QUnit.test("createEditMultiLine", function(assert) {
		var done = assert.async();
		this.oField.awaitControlDelegate().then(function() {
			assert.throws(
				function() {
					TimeContent.createEditMultiLine();
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.TimeContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");
			done();
		});
	});

	QUnit.start();
});