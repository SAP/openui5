/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/BooleanContent",
	"sap/ui/mdc/Field",
	"sap/m/Text",
	"sap/ui/mdc/field/FieldInput"
], function(QUnit, BooleanContent, Field, Text, FieldInput) {
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
			paths: ["sap/ui/mdc/field/FieldInput"],
			instances: [FieldInput],
			createFunction: "createEdit"
		},
		"EditMultiValue": {
			getPathsFunction: "getEditMultiValue",
			paths: [null],
			instances: [null],
			createFunction: "createEditMultiValue",
			throwsError: true
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
			assert.deepEqual(BooleanContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		assert.deepEqual(BooleanContent.getEditOperator(), [null], "Correct editOperator value returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(BooleanContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultValueHelp", function(assert) {
		const oUseDefaultValueHelp = BooleanContent.getUseDefaultValueHelp();
		assert.equal(oUseDefaultValueHelp.name, "bool", "Correct useDefaultValueHelp.name value returned.");
		assert.ok(oUseDefaultValueHelp.oneOperatorSingle, "Correct useDefaultValueHelp.oneOperatorSingle value returned.");
		assert.ok(oUseDefaultValueHelp.oneOperatorMulti, "Correct useDefaultValueHelp.oneOperatorMulti value returned.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(BooleanContent.getControlNames(null), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode null");
		assert.deepEqual(BooleanContent.getControlNames(undefined), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode undefined");
		assert.deepEqual(BooleanContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for not specified ContentMode");

		assert.deepEqual(BooleanContent.getControlNames("Edit"), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode 'Edit'");
		assert.deepEqual(BooleanContent.getControlNames("Display"), ["sap/m/Text"], "Correct default controls returned for ContentMode 'Display'");
		assert.deepEqual(BooleanContent.getControlNames("EditMultiValue"), [null], "Correct default controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(BooleanContent.getControlNames("EditMultiLine"), [null], "Correct default controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(BooleanContent.getControlNames("EditOperator"), [null], "Correct default controls returned for ContentMode 'EditOperator'");
	});

	QUnit.module("Content creation", {
		beforeEach: function() {
			this.oField = new Field({});
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
		return BooleanContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	const fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(BooleanContent, oControlMap[sContentMode].createFunction) : null;
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

			const fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			const fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			const fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			const fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");

			const aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			const aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");

			const aCreatedEditOperatorControls = BooleanContent.create(oContentFactory, "EditOperator", null, [null], "EditOperator" + "-create");

			assert.throws(
				function() {
					BooleanContent.create(oContentFactory, "EditMultiValue", null, oControlMap["EditMultiValue"].instances, "EditMultiValue" + "-create");
				},
				/sap.ui.mdc.field.content.BooleanContent/,
				"createEditMultiValue throws an error.");
			assert.throws(
				function() {
					BooleanContent.create(oContentFactory, "EditMultiLine", null, oControlMap["EditMultiLine"].instances, "EditMultiLine" + "-create");
				},
				/sap.ui.mdc.field.content.BooleanContent/,
				"createEditMultiLine throws an error.");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.equal(aCreatedEditOperatorControls[0], null, "No control created for ContentMode 'EditOperator'.");

			done();
		}).catch(function() {
			throw new Error("awaitControlDelegate failed!");
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
					const aControls = BooleanContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);
					done();
				});
			});
		}
	});

	QUnit.test("createEditMultiValue", function(assert) {
		const done = assert.async();
		this.oField.awaitControlDelegate().then(function() {
			assert.throws(
				function() {
					BooleanContent.createEditMultiValue();
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.BooleanContent - createEditMultiValue not defined!"
					);
				},
				"createEditMultiValue throws an error.");
			done();
		});
	});

	QUnit.test("createEditMultiLine", function(assert) {
		const done = assert.async();
		this.oField.awaitControlDelegate().then(function() {
			assert.throws(
				function() {
					BooleanContent.createEditMultiLine();
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.BooleanContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");
			done();
		});
	});

	QUnit.start();
});