/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/LinkContent",
	"sap/ui/mdc/Field",
	"sap/m/library",
	"sap/m/Link",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/TextArea",
	"sap/m/Token"
], function(QUnit, LinkContent, Field, mLibrary, Link, FieldInput, FieldMultiInput, TextArea, Token) {
	"use strict";

	const EmptyIndicatorMode = mLibrary.EmptyIndicatorMode;

	const oControlMap = {
		"Display": {
			getPathsFunction: "getDisplay",
			paths: ["sap/m/Link"],
			instances: [Link],
			createFunction: "createDisplay",
			bindings: [
				{
					text: "$field>/conditions",
					textAlign: "$field>/textAlign",
					textDirection: "$field>/textDirection",
					wrapping: "$field>/multipleLines",
					tooltip: "$field>/tooltip"
				},
				{}
			],
			properties: [
				{
					emptyIndicatorMode: EmptyIndicatorMode.Auto
				},
				{}
			]
		},
		"DisplayMultiLine": {
			getPathsFunction: "getDisplayMultiLine",
			paths: ["sap/m/Link"],
			instances: [Link],
			createFunction: "createDisplayMultiLine",
			bindings: [
				{
					text: "$field>/conditions",
					textAlign: "$field>/textAlign",
					textDirection: "$field>/textDirection",
					wrapping: "$field>/multipleLines",
					tooltip: "$field>/tooltip"
				},
				{}
			],
			properties: [
				{
					emptyIndicatorMode: EmptyIndicatorMode.Auto
				},
				{}
			]
		},
		"Edit": {
			getPathsFunction: "getEdit",
			paths: ["sap/ui/mdc/field/FieldInput"],
			instances: [FieldInput],
			createFunction: "createEdit",
			bindings: [
				{
					value: "$field>/conditions",
					placeholder: "$field>/placeholder",
					textAlign: "$field>/textAlign",
					textDirection: "$field>/textDirection",
					required: "$field>/required",
					editable: "$field>/editMode",
					enabled: "$field>/editMode",
					valueState: "$field>/valueState",
					valueStateText: "$field>/valueStateText",
					showValueHelp: "$field>/_valueHelpEnabled",
					ariaAttributes: "$field>/_ariaAttributes",
					tooltip: "$field>/tooltip"
				},
				{}
			],
			properties: [
				{
					width: "100%",
					autocomplete: false,
					showSuggestion: false
				},
				{}
			]
		},
		"EditMultiValue": {
			getPathsFunction: "getEditMultiValue",
			paths: ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"],
			instances: [FieldMultiInput, Token],
			createFunction: "createEditMultiValue",
			bindings: [
				{
					value: "$field>/conditions",
					placeholder: "$field>/placeholder",
					textAlign: "$field>/textAlign",
					textDirection: "$field>/textDirection",
					required: "$field>/required",
					editable: "$field>/editMode",
					enabled: "$field>/editMode",
					valueState: "$field>/valueState",
					valueStateText: "$field>/valueStateText",
					showValueHelp: "$field>/_valueHelpEnabled",
					ariaAttributes: "$field>/_ariaAttributes",
					tooltip: "$field>/tooltip",
					tokens: "$field>/conditions"
				},
				{
					text: "$field>"
				}
			],
			properties: [
				{
					width: "100%",
					autocomplete: false,
					showSuggestion: false
				},
				{}
			]
		},
		"EditMultiLine": {
			getPathsFunction: "getEditMultiLine",
			paths: ["sap/m/TextArea"],
			instances: [TextArea],
			createFunction: "createEditMultiLine",
			bindings: [
				{
					value: "$field>/conditions",
					placeholder: "$field>/placeholder",
					textAlign: "$field>/textAlign",
					textDirection: "$field>/textDirection",
					required: "$field>/required",
					editable: "$field>/editMode",
					enabled: "$field>/editMode",
					valueState: "$field>/valueState",
					valueStateText: "$field>/valueStateText",
					tooltip: "$field>/tooltip"
				},
				{}
			],
			properties: [
				{
					width: "100%",
					rows: 4
				},
				{}
			]
		}
	};

	const aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		const oValue = oControlMap[sControlMapKey];
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

	QUnit.test("getUseDefaultValueHelp", function(assert) {
		assert.notOk(LinkContent.getUseDefaultValueHelp(), "DefaultValueHelp is not used.");
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
				const oControl = this.aControls.pop();
				if (oControl) {
					oControl.destroy();
				}
			}
		}
	});

	const fnCreateControls = function(oContentFactory, sContentMode, sIdPostFix) {
		return LinkContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	const fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(LinkContent, oControlMap[sContentMode].createFunction) : null;
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
			const aEditMultiLineControls = oControlMap["EditMultiLine"].instances;

			const fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			const fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			const fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			const fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");

			const aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			const aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			const aCreatedEditMultiValueControls = fnCreateControls(oContentFactory, "EditMultiValue", "-create");
			const aCreatedEditMultiLineControls = fnCreateControls(oContentFactory, "EditMultiLine", "-create");

			const aCreatedEditOperatorControls = LinkContent.create(oContentFactory, "EditOperator", null, [null], "EditOperator" + "-create");

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
		const oValue = oControlMap[sControlMapKey];
		if (oValue.createFunction) {
			QUnit.test(oValue.createFunction, function(assert) {
				const done = assert.async();
				const oContentFactory = this.oField._oContentFactory;
				this.oField.awaitControlDelegate().then(function() {
					const oInstance = oValue.instances[0];
					const aControls = LinkContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);

					for (const sName in oValue.bindings[0]) {
						const oBindingInfo = aControls[0].getBindingInfo(sName);
						const sPath = oBindingInfo && oBindingInfo.parts ? oBindingInfo.parts[0].path : oBindingInfo.path;
						const sModel = oBindingInfo && oBindingInfo.parts ? oBindingInfo.parts[0].model : oBindingInfo.model;
						assert.equal(sModel + ">" + sPath, oValue.bindings[0][sName], "Binding path for " + sName);
					}
					for (const sProperty in oValue.properties[0]) {
						assert.equal(aControls[0].getProperty(sProperty), oValue.properties[0][sProperty], "Value for " + sProperty);
					}
					done();
				});
			});
		}
	});

	QUnit.start();
});