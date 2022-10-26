/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/UnitContent",
	"sap/ui/mdc/Field",
	"delegates/odata/v4/FieldBaseDelegate", // as V4 type used for test
	"sap/m/Text",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/Token",
	"sap/ui/core/InvisibleText",
	"sap/ui/model/odata/type/Unit"
], function(QUnit, UnitContent, Field, FieldBaseDelegate, Text, FieldInput, FieldMultiInput, Token, InvisibleText, UnitType) {
	"use strict";

	var sInvisibleTextIdNumber = InvisibleText.getStaticId("sap.ui.mdc", "field.NUMBER");
	var sInvisibleTextIdUnit = InvisibleText.getStaticId("sap.ui.mdc", "field.UNIT");

	var oControlMap = {
		"Display": {
			getPathsFunction: "getDisplay",
			paths: ["sap/m/Text"],
			instances: [Text],
			createFunction: "createDisplay",
			createdInstances: [{control: Text, boundProperty: "text", type: "sap.ui.model.odata.type.Unit", formatOptions: {preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: true}}]
		},
		"Edit": {
			getPathsFunction: "getEdit",
			paths: ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"],
			instances: [FieldInput, InvisibleText],
			createFunction: "createEdit",
			createdInstances: [{control: FieldInput, boundProperty: "value", type: "sap.ui.model.odata.type.Unit", formatOptions: {showNumber: true, showMeasure: false, strictParsing: true, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: false}, invisibleTextId: sInvisibleTextIdNumber},
								{control: FieldInput, boundProperty: "value", type: "sap.ui.model.odata.type.Unit", formatOptions: {showNumber: false, showMeasure: true, strictParsing: true, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: false}, invisibleTextId: sInvisibleTextIdUnit}]
		},
		"EditMultiValue": {
			getPathsFunction: "getEditMultiValue",
			paths: ["sap/ui/mdc/field/FieldMultiInput", "sap/ui/mdc/field/FieldInput", "sap/m/Token", "sap/ui/core/InvisibleText"],
			instances: [FieldMultiInput, FieldInput, Token, InvisibleText],
			createFunction: "createEditMultiValue",
			createdInstances: [{control: FieldMultiInput, boundAggregation: "tokens", boundProperty: "text", type: "sap.ui.model.odata.type.Unit", formatOptions: {showNumber: true, showMeasure: false, strictParsing: true, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: false}, invisibleTextId: sInvisibleTextIdNumber},
								{control: FieldInput, boundProperty: "value", type: "sap.ui.model.odata.type.Unit", formatOptions: {showNumber: false, showMeasure: true, strictParsing: true, preserveDecimals: true, emptyString: 0, parseAsString: true, unitOptional: false}, invisibleTextId: sInvisibleTextIdUnit}]
		},
		"EditMultiLine": {
			getPathsFunction: "getEditMultiLine",
			paths: [null],
			instances: [null],
			createFunction: "createEditMultiLine",
			createdInstances: [],
			throwsError: true
		}
	};

	var aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		var oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction, function(assert) {
			assert.deepEqual(UnitContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		assert.deepEqual(UnitContent.getEditOperator(), [null], "Correct editOperator value returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(UnitContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultFieldHelp", function(assert) {
		assert.notOk(UnitContent.getUseDefaultFieldHelp(), "DefaultFieldHelp is not used.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(UnitContent.getControlNames(null), ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"], "Correct controls returned for ContentMode null");
		assert.deepEqual(UnitContent.getControlNames(undefined), ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"], "Correct controls returned for ContentMode undefined");
		assert.deepEqual(UnitContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"], "Correct controls returned for not specified ContentMode");

		assert.deepEqual(UnitContent.getControlNames("Edit"), ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"], "Correct controls returned for ContentMode 'Edit'");
		assert.deepEqual(UnitContent.getControlNames("Display"), ["sap/m/Text"], "Correct controls returned for ContentMode 'Display'");
		assert.deepEqual(UnitContent.getControlNames("EditMultiValue"), ["sap/ui/mdc/field/FieldMultiInput", "sap/ui/mdc/field/FieldInput", "sap/m/Token", "sap/ui/core/InvisibleText"], "Correct controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(UnitContent.getControlNames("EditMultiLine"), [null], "Correct controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(UnitContent.getControlNames("EditOperator"), [null], "Correct controls returned for ContentMode 'EditOperator'");
	});

	QUnit.module("Content creation", {
		beforeEach: function() {
			this.oField = new Field({
				dataType: "sap.ui.model.odata.type.Unit",
				delegate: {name: "delegates/odata/v4/FieldBaseDelegate"}
			});
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
		return UnitContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	var fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(UnitContent, oControlMap[sContentMode].createFunction) : null;
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
					UnitContent.create(oContentFactory, "EditMultiLine", null, oControlMap["EditMultiLine"].instances, "EditMultiLine-create");
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.UnitContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.ok(aCreatedEditMultiValueControls[0] instanceof aEditMultiValueControls[0], aEditMultiValueControls[0].getMetadata().getName() + " control created for ContentMode 'EditMultiValue'.");

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
					var aCreatedInstances = oValue.createdInstances;
					var aControls = UnitContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);
					assert.equal(aControls.length, aCreatedInstances.length, "number of created controls");

					for (var i = 0; i < aControls.length; i++) {
						assert.ok(aControls[i] instanceof aCreatedInstances[i].control, "Correct control created in " + oValue.createFunction);
						if (aCreatedInstances[i].boundProperty || aCreatedInstances[i].boundAggregation) {
							var oBindingInfo = aControls[i].getBindingInfo(aCreatedInstances[i].boundAggregation || aCreatedInstances[i].boundProperty);
							assert.ok(oBindingInfo, "Control BindingInfo created");
							var sPath = oBindingInfo.path || oBindingInfo.parts[0].path;
							assert.equal(sPath, "/conditions", "BindingInfo path");
							if (aCreatedInstances[i].boundAggregation) {
								oBindingInfo = oBindingInfo.template.getBindingInfo(aCreatedInstances[i].boundProperty);
							}
							var oConditionType = oBindingInfo.type;
							var oType = oConditionType.getFormatOptions().valueType;
							var oFormatOptions = oType.getFormatOptions();
							assert.equal(oType.getMetadata().getName(), aCreatedInstances[i].type, "Type of binding");
							assert.deepEqual(oFormatOptions, aCreatedInstances[i].formatOptions, "FormatOptions");
						}
						if (aCreatedInstances[i].invisibleTextId) {
							assert.ok(aControls[i].getAriaDescribedBy().indexOf(aCreatedInstances[i].invisibleTextId) >= 0, "InvisibleText set on ariaDescribedBy");
						}
					}
					done();
				});
			});
		}
	});

	QUnit.test("createEditMultiLine", function(assert) {
		var done = assert.async();
		this.oField.awaitControlDelegate().then(function() {
			assert.throws(
				function() {
					UnitContent.createEditMultiLine();
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.UnitContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");
			done();
		});
	});

	QUnit.start();
});