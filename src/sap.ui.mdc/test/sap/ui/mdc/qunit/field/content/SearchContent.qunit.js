/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/content/SearchContent",
	"sap/ui/mdc/FilterField",
	"sap/m/Text",
	"sap/m/SearchField",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/m/TextArea",
	"sap/m/Token",
	"sap/ui/model/json/JSONModel"
], function(QUnit, SearchContent, FilterField, Text, SearchField, FieldMultiInput, TextArea, Token, JSONModel) {
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

	const aControlMapKeys = Object.keys(oControlMap);

	QUnit.module("Getters");

	aControlMapKeys.forEach(function(sControlMapKey) {
		const oValue = oControlMap[sControlMapKey];
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

	QUnit.test("getUseDefaultValueHelp", function(assert) {
		assert.notOk(SearchContent.getUseDefaultValueHelp(), "DefaultValueHelp is not used.");
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

	let iChangeEvent = 0;
	function _myChangeHandler(oEvent) {
		iChangeEvent++;
	}

	let iSubmitEvent = 0;
	function _mySubmitHandler(oEvent) {
		iSubmitEvent++;
	}

	QUnit.module("Content creation", {
		beforeEach: function() {
			this.oField = new FilterField({
				maxConditions: 1,
				change: _myChangeHandler,
				submit: _mySubmitHandler
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
			iChangeEvent = 0;
			iSubmitEvent = 0;
		}
	});

	const fnCreateControls = function(oContentFactory, sContentMode, sIdPostFix) {
		return SearchContent.create(oContentFactory, sContentMode, null, oControlMap[sContentMode].instances, sContentMode + sIdPostFix);
	};

	const fnSpyOnCreateFunction = function(sContentMode) {
		return oControlMap[sContentMode].createFunction ? sinon.spy(SearchContent, oControlMap[sContentMode].createFunction) : null;
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
			const fnCreateEditForHelpFunction = fnSpyOnCreateFunction("EditForHelp");

			const aCreatedDisplayControls = fnCreateControls(oContentFactory, "Display", "-create");
			const aCreatedEditControls = fnCreateControls(oContentFactory, "Edit", "-create");
			this.aControls = aCreatedDisplayControls.concat(aCreatedEditControls);

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

			const aCreatedEditOperatorControls = SearchContent.create(oContentFactory, "EditOperator", null, [null], "EditOperator" + "-create");

			fnSpyCalledOnce(fnCreateDisplayFunction, "Display", assert);
			fnSpyCalledOnce(fnCreateEditFunction, "Edit", assert);
			fnSpyCalledOnce(fnCreateEditMultiValueFunction, "EditMultiValue", assert);
			fnSpyCalledOnce(fnCreateEditMultiLineFunction, "EditMultiLine", assert);
			fnSpyCalledOnce(fnCreateEditForHelpFunction, "EditForHelp", assert);

			assert.ok(aCreatedDisplayControls[0] instanceof aDisplayControls[0], aDisplayControls[0].getMetadata().getName() + " control created for ContentMode 'Display'.");
			assert.ok(aCreatedEditControls[0] instanceof aEditControls[0], aEditControls[0].getMetadata().getName() + " control created for ContentMode 'Edit'.");
			assert.equal(aCreatedEditOperatorControls[0], null, "No control created for ContentMode 'EditOperator'.");

			done();
		}.bind(this));
	});

	QUnit.test("eventing", function(assert) {

		const done = assert.async();
		const oContentFactory = this.oField._oContentFactory;
		const oModel = new JSONModel({ // fake model
			conditions: []
		});

		this.oField.awaitControlDelegate().then(function() {
			this.aControls = fnCreateControls(oContentFactory, "Edit", "-create");
			const oSearchField = this.aControls[0];
			oSearchField.setModel(oModel, "$field"); // To create binding

			// for testing just fire event of SearchField. Do not test if SearchField behaves right on user-intercation, just test the API usage.
			oSearchField.fireChange({value: "Test"});
			assert.equal(iChangeEvent, 1, "Change event fired once");

			oSearchField.fireSearch({clearButtonPressed: true});
			assert.equal(iSubmitEvent, 0, "Submit event not fired");
			oSearchField.fireSearch({escPressed: true});
			assert.equal(iSubmitEvent, 0, "Submit event not fired");
			oSearchField.fireSearch({searchButtonPressed: true});
			assert.equal(iSubmitEvent, 1, "Submit event fired once");

			done();
		}.bind(this));

	});

	aControlMapKeys.forEach(function(sControlMapKey) {
		const oValue = oControlMap[sControlMapKey];
		if (oValue.createFunction && !oValue.throwsError) {
			QUnit.test(oValue.createFunction, function(assert) {
				const done = assert.async();
				const oContentFactory = this.oField._oContentFactory;
				this.oField.awaitControlDelegate().then(function() {
					const oInstance = oValue.instances[0];
					this.aControls = SearchContent.create(oContentFactory, sControlMapKey, null, oValue.instances, sControlMapKey);

					assert.ok(this.aControls[0] instanceof oInstance, "Correct control created in " + oValue.createFunction);
					done();
				}.bind(this));
			});
		}
	});

	QUnit.test("createEditMultiValue", function(assert) {
		const done = assert.async();
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
		const done = assert.async();
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