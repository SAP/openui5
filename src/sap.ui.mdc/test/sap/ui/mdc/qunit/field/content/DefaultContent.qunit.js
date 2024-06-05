/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/mdc/Field",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/ExpandableText",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/ui/mdc/field/TokenizerDisplay",
	"sap/ui/mdc/field/TokenDisplay",
	"sap/m/TextArea",
	"sap/m/Token"
], function(QUnit, DefaultContent, Field, mLibrary, Text, ExpandableText, FieldInput, FieldMultiInput, TokenizerDisplay, TokenDisplay, TextArea, Token) {
	"use strict";

	const EmptyIndicatorMode = mLibrary.EmptyIndicatorMode;

	const oControlMap = {
		"Display": {
			getPathsFunction: "getDisplay",
			paths: ["sap/m/Text"],
			instances: [Text],
			createFunction: "createDisplay",
			bindings: [
				{
					text: {path: "$field>/conditions"},
					textAlign: {path: "$field>/textAlign"},
					textDirection: {path: "$field>/textDirection"},
					wrapping: {path: "$field>/multipleLines"},
					tooltip: {path: "$field>/tooltip"}
				},
				{}
			],
			properties: [
				{
					width: "100%",
					emptyIndicatorMode: EmptyIndicatorMode.Auto
				},
				{}
			]
		},
		"DisplayMultiValue": {
			getPathsFunction: "getDisplayMultiValue",
			paths: [ "sap/ui/mdc/field/TokenizerDisplay", "sap/ui/mdc/field/TokenDisplay"],
			instances: [TokenizerDisplay, TokenDisplay],
			createFunction: "createDisplayMultiValue",
			bindings: [
				{
					tokens: {path: "$field>/conditions"},
					//textAlign: {path: "$field>/textAlign",
					tooltip: {path: "$field>/tooltip"}
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
			paths: ["sap/m/ExpandableText"],
			instances: [ExpandableText],
			createFunction: "createDisplayMultiLine",
			bindings: [
				{
					text: {path: "$field>/conditions"},
					textAlign: {path: "$field>/textAlign"},
					textDirection: {path: "$field>/textDirection"},
					tooltip: {path: "$field>/tooltip"}
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
					value: {path: "$field>/conditions"},
					placeholder: {path: "$field>/placeholder"},
					textAlign: {path: "$field>/textAlign"},
					textDirection: {path: "$field>/textDirection"},
					required: {path: "$field>/required"},
					editable: {path: "$field>/editMode"},
					enabled: {path: "$field>/editMode"},
					valueState: {path: "$field>/valueState"},
					valueStateText: {path: "$field>/valueStateText"},
					showValueHelp: {path: "$field>/_valueHelpEnabled"},
					ariaAttributes: {path: "$field>/_ariaAttributes"},
					tooltip: {path: "$field>/tooltip"}
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
					value: {path: "$field>/conditions"},
					placeholder: {path: "$field>/placeholder"},
					textAlign: {path: "$field>/textAlign"},
					textDirection: {path: "$field>/textDirection"},
					required: {path: "$field>/required"},
					editable: {path: "$field>/editMode"},
					enabled: {path: "$field>/editMode"},
					valueState: {path: "$field>/valueState"},
					valueStateText: {path: "$field>/valueStateText"},
					showValueHelp: {path: "$field>/_valueHelpEnabled"},
					ariaAttributes: {path: "$field>/_ariaAttributes"},
					tooltip: {path: "$field>/tooltip"},
					tokens: {path: "$field>/conditions", length: 10, startIndex: -10}
				},
				{
					text: {path: "$field>"}
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
					value: {path: "$field>/conditions"},
					placeholder: {path: "$field>/placeholder"},
					textAlign: {path: "$field>/textAlign"},
					textDirection: {path: "$field>/textDirection"},
					required: {path: "$field>/required"},
					editable: {path: "$field>/editMode"},
					enabled: {path: "$field>/editMode"},
					valueState: {path: "$field>/valueState"},
					valueStateText: {path: "$field>/valueStateText"},
					tooltip: {path: "$field>/tooltip"}
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
		},
		"EditForHelp": {
			getPathsFunction: "getEditForHelp",
			paths: ["sap/ui/mdc/field/FieldInput"],
			instances: [FieldInput],
			createFunction: "createEditForHelp",
			bindings: [
				{
					value: {path: "$field>/conditions"},
					placeholder: {path: "$field>/placeholder"},
					textAlign: {path: "$field>/textAlign"},
					textDirection: {path: "$field>/textDirection"},
					required: {path: "$field>/required"},
					editable: {path: "$field>/editMode"},
					enabled: {path: "$field>/editMode"},
					valueState: {path: "$field>/valueState"},
					valueStateText: {path: "$field>/valueStateText"},
					showValueHelp: {path: "$field>/_valueHelpEnabled"},
					ariaAttributes: {path: "$field>/_ariaAttributes"},
					tooltip: {path: "$field>/tooltip"}
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
		}
	};

	const aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		const oValue = oControlMap[sControlMapKey];
		QUnit.test(oValue.getPathsFunction, function(assert) {
			assert.deepEqual(DefaultContent[oValue.getPathsFunction](), oValue.paths, "Correct control path returned for ContentMode '" + sControlMapKey + "'.");
		});
	});

	QUnit.test("getEditOperator", function(assert) {
		assert.deepEqual(DefaultContent.getEditOperator(), [null], "Correct editOperator value returned.");
	});

	QUnit.test("getUseDefaultEnterHandler", function(assert) {
		assert.ok(DefaultContent.getUseDefaultEnterHandler(), "Correct useDefaultEnterHandler value returned.");
	});

	QUnit.test("getUseDefaultValueHelp", function(assert) {
		const oUseDefaultValueHelp = DefaultContent.getUseDefaultValueHelp();
		assert.equal(oUseDefaultValueHelp.name, "defineConditions", "Correct useDefaultValueHelp.name value returned.");
		assert.notOk(oUseDefaultValueHelp.oneOperatorSingle, "Correct useDefaultValueHelp.oneOperatorSingle value returned.");
		assert.notOk(oUseDefaultValueHelp.oneOperatorMulti, "Correct useDefaultValueHelp.oneOperatorMulti value returned.");
	});

	QUnit.test("getControlNames", function(assert) {
		/* no need to use oOperator here as there is no editOperator*/
		assert.deepEqual(DefaultContent.getControlNames(null), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode null");
		assert.deepEqual(DefaultContent.getControlNames(undefined), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode undefined");
		assert.deepEqual(DefaultContent.getControlNames("idghsoidpgdfhkfokghkl"), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for not specified ContentMode");

		assert.deepEqual(DefaultContent.getControlNames("Edit"), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode 'Edit'");
		assert.deepEqual(DefaultContent.getControlNames("Display"), ["sap/m/Text"], "Correct default controls returned for ContentMode 'Display'");
		assert.deepEqual(DefaultContent.getControlNames("DisplayMultiValue"), ["sap/ui/mdc/field/TokenizerDisplay", "sap/ui/mdc/field/TokenDisplay"], "Correct default controls returned for ContentMode 'DisplayMultiValue'");
		assert.deepEqual(DefaultContent.getControlNames("DisplayMultiLine"), ["sap/m/ExpandableText"], "Correct default controls returned for ContentMode 'DisplayMultiLine'");
		assert.deepEqual(DefaultContent.getControlNames("EditMultiValue"), ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"], "Correct default controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(DefaultContent.getControlNames("EditMultiLine"), ["sap/m/TextArea"], "Correct default controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(DefaultContent.getControlNames("EditOperator"), [null], "Correct default controls returned for ContentMode 'EditOperator'");
		assert.deepEqual(DefaultContent.getControlNames("EditForHelp"), ["sap/ui/mdc/field/FieldInput"], "Correct default controls returned for ContentMode 'EditForHelp'");
	});

	QUnit.test("getNoFormatting", function(assert) {
		assert.notOk(DefaultContent.getNoFormatting("Display"), "Display");
		assert.notOk(DefaultContent.getNoFormatting("DisplayMultiValue"), "DisplayMultiValue");
		assert.notOk(DefaultContent.getNoFormatting("DisplayMultiLine"), "DisplayMultiLine");
		assert.notOk(DefaultContent.getNoFormatting("Edit"), "Edit");
		assert.ok(DefaultContent.getNoFormatting("EditMultiValue"), "EditMultiValue");
		assert.notOk(DefaultContent.getNoFormatting("EditMultiLine"), "EditMultiLine");
		assert.notOk(DefaultContent.getNoFormatting("EditOperator"), "EditOperator");
		assert.notOk(DefaultContent.getNoFormatting("EditForHelp"), "EditForHelp");
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
		return DefaultContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	const fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(DefaultContent, oControlMap[sContentMode].createFunction) : null;
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
			const aDisplayMultiValueControls = oControlMap["DisplayMultiValue"].instances;
			const aDisplayMultiLineControls = oControlMap["DisplayMultiLine"].instances;
			const aEditControls = oControlMap["Edit"].instances;
			const aEditMultiValueControls = oControlMap["EditMultiValue"].instances;
			const aEditMultiLineControls = oControlMap["EditMultiLine"].instances;
			const aEditForHelpControls = oControlMap["EditForHelp"].instances;

			const fnCreateDisplayFunction = fnSpyOnCreateFunction("Display");
			const fnCreateDisplayMultiValueFunction = fnSpyOnCreateFunction("DisplayMultiValue");
			const fnCreateDisplayMultiLineFunction = fnSpyOnCreateFunction("DisplayMultiLine");
			const fnCreateEditFunction = fnSpyOnCreateFunction("Edit");
			const fnCreateEditMultiValueFunction = fnSpyOnCreateFunction("EditMultiValue");
			const fnCreateEditMultiLineFunction = fnSpyOnCreateFunction("EditMultiLine");
			const fnCreateEditForHelpFunction = fnSpyOnCreateFunction("EditForHelp");

			const aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			const aCreatedDisplayMultiLineControls = fnCreateControls(oContentFactory, "DisplayMultiLine", "-create");
			fnSpyCalledOnce(fnCreateDisplayMultiLineFunction, "DisplayMultiLine", assert); // before DisplayMultiValue as called inside there too
			const aCreatedDisplayMultiValueControls = fnCreateControls(oContentFactory, "DisplayMultiValue", "-create");
			fnSpyCalledOnce(fnCreateDisplayMultiValueFunction, "DisplayMultiValue", assert);
			const aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			const aCreatedEditMultiValueControls = fnCreateControls(oContentFactory, "EditMultiValue", "-create");
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			const aCreatedEditMultiLineControls = fnCreateControls(oContentFactory, "EditMultiLine", "-create");
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);
			const aCreatedEditForHelpControls = fnCreateControls(oContentFactory, "EditForHelp", "-create");
			fnSpyCalledOnce(fnCreateEditForHelpFunction, "EditForHelp", assert);

			const aCreatedEditOperatorControls = DefaultContent.create(oContentFactory, "EditOperator", null, [null], "EditOperator" + "-create");


			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedDisplayMultiValueControls[0] instanceof aDisplayMultiValueControls[0], aDisplayMultiValueControls[0].getMetadata().getName() + " control created for ContentMode 'DisplayMultiValue'.");
			assert.ok(aCreatedDisplayMultiLineControls[0] instanceof aDisplayMultiLineControls[0], aDisplayMultiLineControls[0].getMetadata().getName() + " control created for ContentMode 'DisplayMultiLine'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.ok(aCreatedEditMultiValueControls[0] instanceof aEditMultiValueControls[0], aEditMultiValueControls[0].getMetadata().getName() + " control created for ContentMode 'EditMultiValue'.");
			assert.ok(aCreatedEditMultiLineControls[0] instanceof aEditMultiLineControls[0], aEditMultiLineControls[0].getMetadata().getName() + " control created for ContentMode 'EditMultiLine'.");
			assert.equal(aCreatedEditOperatorControls[0], null, "No control created for ContentMode 'EditOperator'.");
			assert.ok(aCreatedEditForHelpControls[0] instanceof aEditForHelpControls[0], aEditForHelpControls[0].getMetadata().getName() + " control created for ContentMode 'EditForHelp'.");

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
					const aControls = DefaultContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);

					for (const sName in oValue.bindings[0]) {
						const oBindingInfo = aControls[0].getBindingInfo(sName);
						const sPath = oBindingInfo && oBindingInfo.parts ? oBindingInfo.parts[0].path : oBindingInfo.path;
						const sModel = oBindingInfo && oBindingInfo.parts ? oBindingInfo.parts[0].model : oBindingInfo.model;
						assert.equal(sModel + ">" + sPath, oValue.bindings[0][sName].path, "Binding path for " + sName);
						if (oValue.bindings[0][sName].hasOwnProperty("length")) {
							assert.equal(oBindingInfo && oBindingInfo.length, oValue.bindings[0][sName].length, "Binding length for " + sName);
						}
						if (oValue.bindings[0][sName].hasOwnProperty("startIndex")) {
							assert.equal(oBindingInfo && oBindingInfo.startIndex, oValue.bindings[0][sName].startIndex, "Binding startIndex for " + sName);
						}
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