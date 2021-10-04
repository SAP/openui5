/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/LinkContent",
	"sap/ui/mdc/Field",
	"sap/m/Link",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/TextArea",
	"sap/m/Token"
], function(QUnit, LinkContent, Field, Link, FieldInput, FieldMultiInput, TextArea, Token) {
	"use strict";

	var oControlMap = {
		"Display": {
			getPathsFunction: "getDisplay",
			paths: ["sap/m/Link"],
			instances: [Link],
			createFunction: "createDisplay"
		},
		"DisplayMultiLine": {
			getPathsFunction: "getDisplayMultiLine",
			paths: ["sap/m/Link"],
			instances: [Link],
			createFunction: "createDisplayMultiLine"
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
			paths: ["sap/m/TextArea"],
			instances: [TextArea],
			createFunction: "createEditMultiLine"
		}
	};

	var aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		var oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction, function(assert) {
			assert.deepEqual(LinkContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		assert.deepEqual(LinkContent.getEditOperator(), [null], "Correct editOperator value returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(LinkContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultFieldHelp", function(assert) {
		assert.notOk(LinkContent.getUseDefaultFieldHelp(), "DefaultFieldHelp is not used.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(LinkContent.getControlNames(null), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode null");
		assert.deepEqual(LinkContent.getControlNames(undefined), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode undefined");
		assert.deepEqual(LinkContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for not specified ContentMode");

		assert.deepEqual(LinkContent.getControlNames("Edit"), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode 'Edit'");
		assert.deepEqual(LinkContent.getControlNames("Display"), ["sap/m/Link"], "Correct default controls returned for ContentMode 'Display'");
		assert.deepEqual(LinkContent.getControlNames("EditMultiValue"), ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"], "Correct default controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(LinkContent.getControlNames("EditMultiLine"), ["sap/m/TextArea"], "Correct default controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(LinkContent.getControlNames("EditOperator"), [null], "Correct default controls returned for ContentMode 'EditOperator'");
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
		return LinkContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	var fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(LinkContent, oControlMap[sContentMode].createFunction) : null;
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
			var aEditMultiLineControls = oControlMap["EditMultiLine"].instances;

			var fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			var fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			var fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			var fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");

			var aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			var aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			var aCreatedEditMultiValueControls = fnCreateControls(oContentFactory, "EditMultiValue", "-create");
			var aCreatedEditMultiLineControls = fnCreateControls(oContentFactory, "EditMultiLine", "-create");

			var aCreatedEditOperatorControls = LinkContent.create(oContentFactory, "EditOperator", null, [null], "EditOperator" + "-create");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.ok(aCreatedEditMultiValueControls[0] instanceof aEditMultiValueControls[0], aEditMultiValueControls[0].getMetadata().getName() + " control created for ContentMode 'EditMultiValue'.");
			assert.ok(aCreatedEditMultiLineControls[0] instanceof aEditMultiLineControls[0], aEditMultiLineControls[0].getMetadata().getName() + " control created for ContentMode 'EditMultiLine'.");
			assert.equal(aCreatedEditOperatorControls[0], null, "No control created for ContentMode 'EditOperator'.");

			done();
		});
	});

	aControlMapKeys.forEach(function(sControlMapKey) {
		var oValue = oControlMap[sControlMapKey];
		if (oValue.createFunction) {
			QUnit.test(oValue.createFunction, function(assert) {
				var done = assert.async();
				var oContentFactory = this.oField._oContentFactory;
				this.oField.awaitControlDelegate().then(function() {
					var oInstance = oValue.instances[0];
					var aControls = LinkContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);
					done();
				});
			});
		}
	});

	QUnit.start();
});