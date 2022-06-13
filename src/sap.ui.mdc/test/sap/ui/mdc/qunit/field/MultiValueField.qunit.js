/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 10]*/

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/library",
	"sap/ui/mdc/MultiValueField",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/EditMode",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/FieldMultiInput", // async. loading of content control tested in FieldBase test
	"sap/ui/mdc/field/MultiValueFieldDelegate", // make sure delegate is loaded (test delegate loading in FieldBase test)
	"sap/ui/mdc/field/MultiValueFieldItem",
	"sap/ui/mdc/field/TokenizerDisplay",
	"sap/ui/mdc/field/TokenDisplay",
	"sap/ui/mdc/field/FieldHelpBase",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/ExpandableText",
	"sap/m/TextArea",
	"sap/m/DatePicker",
	"sap/m/TimePicker",
	"sap/m/DateTimePicker",
	"sap/m/Slider",
	"sap/m/Button",
	"sap/ui/model/ParseException",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Currency",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core"
], function(
	qutils,
	library,
	MultiValueField,
	Condition,
	EditMode,
	FieldDisplay,
	ConditionValidated,
	ConditionsType,
	FieldMultiInput,
	MultiValueFieldDelegate,
	MultiValueFieldItem,
	TokenizerDisplay,
	TokenDisplay,
	FieldHelpBase,
	Label,
	Text,
	ExpandableText,
	TextArea,
	DatePicker,
	TimePicker,
	DateTimePicker,
	Slider,
	Button,
	ParseException,
	StringType,
	IntegerType,
	CurrencyType,
	oDataCurrencyType,
	JSONModel,
	DateTimeType,
	KeyCodes,
	oCore
) {
	"use strict";

	var oField;
	var sId;
	var aChangeItems;
	var bValid;
	var iCount = 0;
	var oPromise;

	var _myChangeHandler = function(oEvent) {
		iCount++;
		sId = oEvent.oSource.getId();
		aChangeItems = oEvent.getParameter("items");
		bValid = oEvent.getParameter("valid");
		oPromise = oEvent.getParameter("promise");
	};

//	var sLiveId;
//	var sLiveValue;
//	var iLiveCount = 0;
//
//	var _myLiveChangeHandler = function(oEvent) {
//		iLiveCount++;
//		sLiveId = oEvent.oSource.getId();
//		sLiveValue = oEvent.getParameter("value");
//	};
//
//	var iParseError = 0;
//	var _myParseErrorHandler = function(oEvent) {
//		iParseError++;
//	};
//
//	var _checkException = function(assert, oField, fnFunction, sName, vArgument) {
//
//		var oException;
//
//		try {
//			fnFunction.call(oField, vArgument);
//		} catch (e) {
//			oException = e;
//		}
//
//		assert.ok(oException, sName + " fires exception");
//
//	};

	var _cleanupEvents = function() {
		iCount = 0;
		sId = null;
		aChangeItems = null;
		bValid = null;
		oPromise = null;
//		iLiveCount = 0;
//		sLiveId = null;
//		sLiveValue = null;
//		iParseError = 0;
	};

	QUnit.module("Field rendering", {
		beforeEach: function() {
			oField = new MultiValueField("F1");
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("default rendering", function(assert) {

		oField.placeAt("content");
		oCore.applyChanges();

		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "default content exist");
		assert.equal(oContent && oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is default");
		assert.notOk(oContent && oContent.getShowValueHelp(), "no valueHelp");

	});

	QUnit.test("EditMode", function(assert) {

		oField.setEditMode(EditMode.Display);
		oField.placeAt("content");
		oCore.applyChanges();

		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.TokenizerDisplay", "sap.ui.mdc.field.TokenizerDisplay is used");

		oField.setEditMode(EditMode.ReadOnly);
		oCore.applyChanges();
		aContent = oField.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is used");
		assert.notOk(oContent.getEditable(), "MultiInput is not editable");

	});

	QUnit.test("internal control creation", function(assert) {

		var fnDone = assert.async();
		setTimeout(function() { // async control creation in applySettings
			var aContent = oField.getAggregation("_content");
			var oContent = aContent && aContent.length > 0 && aContent[0];
			assert.notOk(oContent, "no content exist before rendering"); // as no data type can be determined
			fnDone();
		}, 0);

	});

	var oFieldEdit, oFieldDisplay;
	var oModel;
	var oType;
	var oItemTemplate;

	var _initModel = function() {
		oModel = new JSONModel({
			items: [{ key: 1, description: "Text 1" },
					{ key: 2, description: "Text 2" },
					{ key: 3, description: "Text 3" }
					]
		});

		oType = new IntegerType();
		oType._bMyType = true;

		oItemTemplate = new MultiValueFieldItem("MFI1", {
			key: {path: "key", type: oType},
			description: "{description}"
		});
	};

	var _cleanupModel = function() {
		oModel.destroy();
		oItemTemplate.destroy();
		oType.destroy();
		oModel = undefined;
		oItemTemplate = undefined;
		oType = undefined;
	};

	QUnit.module("Items", {
		beforeEach: function() {
			_initModel();
			oFieldEdit = new MultiValueField("F1", {
				editMode: EditMode.Editable,
				display: FieldDisplay.Description,
				items: {path: "/items", template: oItemTemplate}
				}).setModel(oModel);
			oFieldDisplay = new MultiValueField("F2", {
				editMode: EditMode.Display,
				display: FieldDisplay.Description,
				items: {path: "/items", template: oItemTemplate}
				}).setModel(oModel);
			oFieldEdit.placeAt("content");
			oFieldDisplay.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function() {
			oFieldEdit.destroy();
			oFieldDisplay.destroy();
			oFieldEdit = undefined;
			oFieldDisplay = undefined;
			_cleanupModel();
			_cleanupEvents();
		}
	});

	QUnit.test("used data type", function(assert) {

		var oType = oFieldEdit._oContentFactory.getDataType();
		assert.ok(oType.isA("sap.ui.model.type.Integer"), "used data type for Field");
		assert.ok(oType._bMyType, "Given Type is used in Field");

	});

	QUnit.test("conditions & Tokens", function(assert) {

		var fnDone = assert.async();
		setTimeout(function() { // async set of condition
			var aConditions = oFieldEdit.getConditions();
			assert.ok(aConditions.length, 3, "Conditions created");
			assert.equal(aConditions[0].operator, "EQ", "Condition0 operator");
			assert.equal(aConditions[0].values[0], 1, "Condition0 value0");
			assert.equal(aConditions[0].values[1], "Text 1", "Condition0 value1");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition0 validated");

			var aContent = oFieldEdit.getAggregation("_content");
			var oContent = aContent && aContent.length > 0 && aContent[0];
			var aTokens = oContent.getTokens();
			assert.ok(aTokens.length, 3, "Tokens created");
			assert.equal(aTokens[0].getText(), "Text 1", "Token0 text");

			aContent = oFieldDisplay.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			aTokens = oContent.getTokens();
			assert.ok(aTokens.length, 3, "Tokens created");
			assert.equal(aTokens[0].getText(), "Text 1", "Token0 text");
			assert.equal(aTokens[1].getText(), "Text 2", "Token1 text");
			assert.equal(aTokens[2].getText(), "Text 3", "Token2 text");

			fnDone();
		}, 0);

	});

	QUnit.module("user interaction", {
		beforeEach: function() {
			_initModel();
			sinon.stub(MultiValueFieldDelegate, "updateItems").callsFake(function(oPayload, aConditions, oMultiValueField) {
				var aItems = [];
				for (var i = 0; i < aConditions.length; i++) {
					var oCondition = aConditions[i];
					var oItem = {key: oCondition.values[0], description: oCondition.values[1]};
					aItems.push(oItem);
				}
				oModel.setProperty("/items", aItems);
				oModel.checkUpdate(true, false);
			});
			var oFieldHelp = new FieldHelpBase("F1-H");
			oField = new MultiValueField("F1", {
				editMode: EditMode.Editable,
				display: FieldDisplay.Description,
				items: {path: "/items", template: oItemTemplate},
				fieldHelp: oFieldHelp,
				dependents: [oFieldHelp],
				change: _myChangeHandler//,
//				liveChange: _myLiveChangeHandler,
//				parseError: _myParseErrorHandler
			}).setModel(oModel).placeAt("content");
			oCore.applyChanges();
			oField.focus(); // as FieldHelp is connected with focus
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			_cleanupModel();
			_cleanupEvents();
			MultiValueFieldDelegate.updateItems.restore();
		}
	});

	QUnit.test("update via FieldHelp", function(assert) {

		var fnDone = assert.async();
		setTimeout(function() { // async set of condition
			var oFieldHelp = oCore.byId(oField.getFieldHelp());
			var oCondition = Condition.createItemCondition(4, "Text 4");
			oFieldHelp.fireSelect({ conditions: [oCondition], add: false, close: true });

			setTimeout(function() { // async model update
				assert.ok(MultiValueFieldDelegate.updateItems.calledOnce, "MultiValueFieldDelegate.updateItems called once");
				assert.ok(MultiValueFieldDelegate.updateItems.calledWith({}, [oCondition], oField), "MultiValueFieldDelegate.updateItems arguments");
				assert.equal(iCount, 1, "Change event fired once");
				assert.equal(sId, "F1", "Change event fired on Field");
				assert.equal(aChangeItems.length, 1, "Change event: items");
				assert.equal(aChangeItems[0].getKey(), 4, "Change event: item key");
				assert.equal(aChangeItems[0].getDescription(), "Text 4", "Change event: item key");
				assert.ok(oPromise, "Promise returned");
				assert.ok(bValid, "Change event: valid");
				oPromise.then(function(vResult) {
					assert.ok(true, "Promise resolved");
					assert.ok(Array.isArray(vResult), "Result is array");
					assert.ok(vResult.length, 1, "One item returned");
					assert.ok(vResult[0].isA("sap.ui.mdc.field.MultiValueFieldItem"), "MultiItem returned");
					assert.equal(vResult[0].getKey(), 4, "Result: item key");
					assert.equal(vResult[0].getDescription(), "Text 4", "Result: item key");

					var aItems = oField.getItems();
					assert.equal(aItems.length, 1, "Field: items");
					assert.equal(aItems[0].getKey(), 4, "Field: item key");
					assert.equal(aItems[0].getDescription(), "Text 4", "Field: item key");

				fnDone();
				});
			}, 0);
		}, 0);

	});

	QUnit.test("internal control creation", function(assert) {

		oField = new MultiValueField("F3", {
			items: {path: "/items", template: oItemTemplate}
		});

		var fnDone = assert.async();
		setTimeout(function() { // async control creation in applySettings
			var aContent = oField.getAggregation("_content");
			var oContent = aContent && aContent.length > 0 && aContent[0];
			assert.notOk(oContent, "no content exist before rendering"); // as edit mode is not explicit defined

			oField.setEditMode(EditMode.Display);
			setTimeout(function() { // async control creation in observeChanges
				aContent = oField.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent, "content exist after setting editMode and multipleLines");

				oField.destroy();
				oField = new MultiValueField("F3", {
					items: {path: "/items", template: oItemTemplate},
					editMode: EditMode.Editable
				});

				setTimeout(function() { // async control creation in applySettings
					aContent = oField.getAggregation("_content");
					oContent = aContent && aContent.length > 0 && aContent[0];
					assert.ok(oContent, "content exist before rendering");

					oField.destroy();
					oField = new MultiValueField("F3", {
						items: {path: "/items", template: oItemTemplate},
						editMode: { path: "/editMode"}
					});

					setTimeout(function() { // async control creation in applySettings
						aContent = oField.getAggregation("_content");
						oContent = aContent && aContent.length > 0 && aContent[0];
						assert.notOk(oContent, "content not exist before rendering"); // as editMode has not set by binding right now

						oField.destroy();
						oField = new MultiValueField("F3", {
							items: {path: "/items", template: oItemTemplate},
							editMode: { path: "/editMode"}
						});
						oField.setModel(oModel);

						setTimeout(function() { // async control creation in applySettings
							aContent = oField.getAggregation("_content");
							oContent = aContent && aContent.length > 0 && aContent[0];
							assert.ok(oContent, "content exist before rendering");
							oField.destroy();
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

});
