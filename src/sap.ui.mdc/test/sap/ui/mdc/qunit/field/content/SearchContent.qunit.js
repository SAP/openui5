/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/SearchContent",
	"sap/ui/mdc/Field",
	"sap/m/Text",
	"sap/m/SearchField",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/TextArea",
	"sap/m/Token"
], function(QUnit, SearchContent, Field, Text, SearchField, FieldMultiInput, TextArea, Token) {
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
			paths: ["sap/m/SearchField"],
			instances: [SearchField],
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
		},
		"EditForHelp": {
			getPathsFunction: "getEditForHelp",
			paths: [null],
			instances: [null],
			createFunction: "createEditForHelp",
			throwsError: true
		}
	};

	var aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		var oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction, function(assert) {
			assert.deepEqual(SearchContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		assert.deepEqual(SearchContent.getEditOperator(), [null], "Correct editOperator value returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.notOk(SearchContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultFieldHelp", function(assert) {
		assert.notOk(SearchContent.getUseDefaultFieldHelp(), "DefaultFieldHelp is not used.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(SearchContent.getControlNames(null), ["sap/m/SearchField"], "Correct default controls returned for ContentMode null");
		assert.deepEqual(SearchContent.getControlNames(undefined), ["sap/m/SearchField"], "Correct default controls returned for ContentMode undefined");
		assert.deepEqual(SearchContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/m/SearchField"], "Correct default controls returned for not specified ContentMode");

		assert.deepEqual(SearchContent.getControlNames("Edit"), ["sap/m/SearchField"], "Correct default controls returned for ContentMode 'Edit'");
		assert.deepEqual(SearchContent.getControlNames("Display"), ["sap/m/Text"], "Correct default controls returned for ContentMode 'Display'");
		assert.deepEqual(SearchContent.getControlNames("EditMultiValue"), [null], "Correct default controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(SearchContent.getControlNames("EditMultiLine"), [null], "Correct default controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(SearchContent.getControlNames("EditOperator"), [null], "Correct default controls returned for ContentMode 'EditOperator'");
		assert.deepEqual(SearchContent.getControlNames("EditForHelp"), [null], "Correct default controls returned for ContentMode 'EditForHelp'");
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
		return SearchContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	var fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(SearchContent, oControlMap[sContentMode].createFunction) : null;
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

			var fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			var fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			var fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			var fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");
			var fnCreateEditForHelpFunction = fnSpyOnCreateFunction("EditForHelp");

			var aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			var aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");

			assert.throws(
				function() {
					SearchContent.create(oContentFactory, "EditMultiValue", null, oControlMap["EditMultiValue"].instances, "EditMultiValue-create");
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.SearchContent - createEditMultiValue not defined!"
					);
				},
				"createEditMultiValue throws an error.");

			assert.throws(
				function() {
					SearchContent.create(oContentFactory, "EditMultiLine", null, oControlMap["EditMultiLine"].instances, "EditMultiLine-create");
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.SearchContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");

			assert.throws(
				function() {
					SearchContent.create(oContentFactory, "EditForHelp", null, oControlMap["EditForHelp"].instances, "EditForHelp-create");
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.SearchContent - createEditForHelp not defined!"
					);
				},
				"createEditForHelp throws an error.");

			var aCreatedEditOperatorControls = SearchContent.create(oContentFactory, "EditOperator", null, [null], "EditOperator" + "-create");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);
			fnSpyCalledOnce(fnCreateEditForHelpFunction, "EditForHelp", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.equal(aCreatedEditOperatorControls[0], null, "No control created for ContentMode 'EditOperator'.");

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
					var aControls = SearchContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);
					done();
				});
			});
		}
	});

	QUnit.test("createEditMultiValue", function(assert) {
		var done = assert.async();
		this.oField.awaitControlDelegate().then(function() {
			assert.throws(
				function() {
					SearchContent.createEditMultiValue();
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.SearchContent - createEditMultiValue not defined!"
					);
				},
				"createEditMultiValue throws an error.");
			done();
		});
	});

	QUnit.test("createEditMultiLine", function(assert) {
		var done = assert.async();
		this.oField.awaitControlDelegate().then(function() {
			assert.throws(
				function() {
					SearchContent.createEditMultiLine();
				},
				function(oError) {
					return (
						oError instanceof Error &&
						oError.message === "sap.ui.mdc.field.content.SearchContent - createEditMultiLine not defined!"
					);
				},
				"createEditMultiLine throws an error.");
			done();
		});
	});

	QUnit.start();
});