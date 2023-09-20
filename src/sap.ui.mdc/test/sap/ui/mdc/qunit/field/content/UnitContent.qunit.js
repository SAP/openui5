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
	"sap/ui/model/odata/type/Unit",
	"sap/ui/mdc/odata/v4/TypeMap"
], function(QUnit, UnitContent, Field, FieldBaseDelegate, Text, FieldInput, FieldMultiInput, Token, InvisibleText, UnitType, ODataV4TypeMap) {
	"use strict";

	const sInvisibleTextIdNumber = InvisibleText.getStaticId("sap.ui.mdc", "field.NUMBER");
	const sInvisibleTextIdUnit = InvisibleText.getStaticId("sap.ui.mdc", "field.UNIT");

	const oControlMap = {
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

	const aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		const oValue = oControlMap[sControlMapKey];
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
				const oControl = this.aControls.pop();
				if (oControl) {
					oControl.destroy();
				}
			}
		}
	});

	const fnCreateControls = function(oContentFactory, sContentMode, sIdPostFix) {
		return UnitContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	const fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(UnitContent, oControlMap[sContentMode].createFunction) : null;
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
		const oValue = oControlMap[sControlMapKey];
		if (oValue.createFunction && !oValue.throwsError) {
			QUnit.test(oValue.createFunction, function(assert) {
				const done = assert.async();
				const oContentFactory = this.oField._oContentFactory;
				this.oField.awaitControlDelegate().then(function() {
					const aCreatedInstances = oValue.createdInstances;
					const aControls = UnitContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);
					assert.equal(aControls.length, aCreatedInstances.length, "number of created controls");

					for (let i = 0; i < aControls.length; i++) {
						assert.ok(aControls[i] instanceof aCreatedInstances[i].control, "Correct control created in " + oValue.createFunction);
						if (aCreatedInstances[i].boundProperty || aCreatedInstances[i].boundAggregation) {
							let oBindingInfo = aControls[i].getBindingInfo(aCreatedInstances[i].boundAggregation || aCreatedInstances[i].boundProperty);
							assert.ok(oBindingInfo, "Control BindingInfo created");
							const sPath = oBindingInfo.path || oBindingInfo.parts[0].path;
							assert.equal(sPath, "/conditions", "BindingInfo path");
							if (aCreatedInstances[i].boundAggregation) {
								oBindingInfo = oBindingInfo.template.getBindingInfo(aCreatedInstances[i].boundProperty);
							}
							const oConditionType = oBindingInfo.type;
							const oType = oConditionType.getFormatOptions().valueType;
							const oFormatOptions = oType.getFormatOptions();
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
		const done = assert.async();
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

	QUnit.module("Deprecations", {
		beforeEach: function() {
		},
		afterEach: function() {
			delete this.oField;
			while (this.aControls.length > 0) {
				const oControl = this.aControls.pop();
				if (oControl) {
					oControl.destroy();
				}
			}
		}
	});

	QUnit.test("Prefers deprecated getUnitTypeInstance, if available", function(assert) {

		const oAdjustDataTypeForUnitSpy = sinon.spy(UnitContent, "_adjustDataTypeForUnit");
		let oGetUnitTypeInstanceStub;
		const oTypeUtilStub = sinon.stub(FieldBaseDelegate, "getTypeMap").callsFake(function () {
			const oResult  = Object.assign({}, oTypeUtilStub.wrappedMethod.call(this), {getUnitTypeInstance: function () {
				return false;
			}});
			oGetUnitTypeInstanceStub = sinon.stub(oResult, "getUnitTypeInstance");
			return oResult;
		});

		this.oField = new Field({
			dataType: "sap.ui.model.odata.type.Unit",
			delegate: {name: "delegates/odata/v4/FieldBaseDelegate"}
		});
		this.aControls = [];

		return this.oField.awaitControlDelegate().then(function() {
			UnitContent.createEdit(this.oField._oContentFactory, [FieldInput, InvisibleText]);
			assert.ok(oAdjustDataTypeForUnitSpy.calledOnce, "_adjustDataTypeForUnit is called.");
			assert.ok(oGetUnitTypeInstanceStub.calledTwice, "getUnitTypeInstance is called twice.");
			const oType = this.oField._oContentFactory.retrieveDataType();
			assert.deepEqual(oGetUnitTypeInstanceStub.args[0], [oType, true, false], "getUnitTypeInstance is called with expected args.");
			assert.deepEqual(oGetUnitTypeInstanceStub.args[1], [oType, false, true], "getUnitTypeInstance is called with expected args.");

			oGetUnitTypeInstanceStub.restore();
			oTypeUtilStub.restore();
			oAdjustDataTypeForUnitSpy.restore();
		}.bind(this));
	});

	QUnit.test("Calls getDataTypeInstance with additional options, if getUnitTypeInstance is unavailable", function(assert) {

		const oAdjustDataTypeForUnitSpy = sinon.spy(UnitContent, "_adjustDataTypeForUnit");
		const oGetDataTypeInstanceSpy = sinon.spy(ODataV4TypeMap, "getDataTypeInstance");

		this.oField = new Field({
			dataType: "sap.ui.model.odata.type.Unit",
			delegate: {name: "delegates/odata/v4/FieldBaseDelegate"}
		});
		this.aControls = [];

		return this.oField.awaitControlDelegate().then(function() {
			const oType = this.oField._oContentFactory.retrieveDataType();
			const sType = oType.getMetadata().getName();
			const oFormatOptions = oType.getFormatOptions();

			UnitContent.createEdit(this.oField._oContentFactory, [FieldInput, InvisibleText], "t1");
			assert.ok(oAdjustDataTypeForUnitSpy.calledOnce, "_adjustDataTypeForUnit is called.");
			assert.ok(oGetDataTypeInstanceSpy.calledThrice, "oGetDataTypeInstanceSpy is called thrice.");
			assert.deepEqual(oGetDataTypeInstanceSpy.args[1], [sType, oFormatOptions, undefined, {showNumber: true, showMeasure: false}], "getDataTypeInstance is called with expected args.");
			assert.deepEqual(oGetDataTypeInstanceSpy.args[2], [sType, oFormatOptions, undefined, {showNumber: false, showMeasure: true}], "getDataTypeInstance is called with expected args.");
			oAdjustDataTypeForUnitSpy.restore();
			oGetDataTypeInstanceSpy.restore();
		}.bind(this));
	});

	QUnit.start();
});