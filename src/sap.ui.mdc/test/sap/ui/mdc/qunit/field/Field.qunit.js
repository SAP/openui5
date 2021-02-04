/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 10]*/

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/library",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/EditMode",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/odata/v4/FieldBaseDelegate", // make sure delegate is loaded (test delegate loading in FieldBase test)
	"sap/m/Label",
	"sap/m/Input", // async. loading of content control tested in FieldBase test
	"sap/m/Text",
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
	"sap/ui/events/KeyCodes"
], function(
	jQuery,
	qutils,
	library,
	Field,
	Condition,
	EditMode,
	FieldDisplay,
	ConditionsType,
	FieldInput,
	FieldBaseDelegate,
	Label,
	Input,
	Text,
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
	KeyCodes
) {
	"use strict";

	var oField;
	var sId;
	var sValue;
	var bValid;
	var iCount = 0;
	var oPromise;

	var _myChangeHandler = function(oEvent) {
		iCount++;
		sId = oEvent.oSource.getId();
		sValue = oEvent.getParameter("value");
		bValid = oEvent.getParameter("valid");
		oPromise = oEvent.getParameter("promise");
	};

	var sLiveId;
	var sLiveValue;
	var iLiveCount = 0;

	var _myLiveChangeHandler = function(oEvent) {
		iLiveCount++;
		sLiveId = oEvent.oSource.getId();
		sLiveValue = oEvent.getParameter("value");
	};

	var iParseError = 0;
	var _myParseErrorHandler = function(oEvent) {
		iParseError++;
	};

	var sPressId;
	var iPressCount = 0;

	var _myPressHandler = function(oEvent) {
		iPressCount++;
		sPressId = oEvent.oSource.getId();
	};

	var _checkException = function(assert, oField, fnFunction, sName, vArgument) {

		var oException;

		try {
			fnFunction.call(oField, vArgument);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, sName + " fires exception");

	};

	var _cleanupEvents = function() {
		iCount = 0;
		sId = null;
		sValue = null;
		bValid = null;
		oPromise = null;
		iLiveCount = 0;
		sLiveId = null;
		sLiveValue = null;
		iPressCount = 0;
		sPressId = "";
		iParseError = 0;
	};

	QUnit.module("Field rendering", {
		beforeEach: function() {
			oField = new Field("F1");
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("default rendering", function(assert) {

		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "default content exist");
		assert.equal(oContent && oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is default");
		assert.notOk(oContent && oContent.getShowValueHelp(), "no valueHelp");

	});

	QUnit.test("EditMode", function(assert) {

		oField.setEditMode(EditMode.Display);
		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");

		oField.setEditMode(EditMode.ReadOnly);
		sap.ui.getCore().applyChanges();
		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is used");
		assert.notOk(oContent.getEditable(), "Input is not editable");

	});

	QUnit.test("external control", function(assert) {

		var oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		oField.setValue(70);
		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oSlider.getDomRef(), "Slider rendered");
		assert.equal(oSlider.getValue(), 70, "Value of Slider");

		oField.destroyContent();
		sap.ui.getCore().applyChanges();

		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "internal content exist");
		assert.equal(oContent && oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is used");

		oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		sap.ui.getCore().applyChanges();

		assert.ok(oSlider.getDomRef(), "Slider rendered");
		assert.equal(oSlider.getValue(), 70, "Value of Slider");

	});

	var oFieldEdit, oFieldDisplay;

	QUnit.module("properties", {
		beforeEach: function() {
			oFieldEdit = new Field("F1", { editMode: EditMode.Editable });
			oFieldDisplay = new Field("F2", { editMode: EditMode.Display });
			oFieldEdit.placeAt("content");
			oFieldDisplay.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oFieldEdit.destroy();
			oFieldDisplay.destroy();
			oFieldEdit = undefined;
			oFieldDisplay = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("value", function(assert) {

		oFieldEdit.setValue("Test");
		oFieldDisplay.setValue("Test");

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Test", "Value set on Input control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "Test", "Text set on Text control");

		oFieldEdit.setValue();
		oFieldDisplay.setValue();
		aContent = oFieldEdit.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "", "no Value set on Input control");
		var aConditions = oFieldEdit.getConditions();
		assert.equal(aConditions.length, 0, "no internal conditions");
		assert.equal(oFieldEdit.getValue(), null, "Field has initial value (null)");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "", "no Text set on Text control");
		aConditions = oFieldDisplay.getConditions();
		assert.equal(aConditions.length, 0, "no internal conditions");
		assert.equal(oFieldDisplay.getValue(), null, "Field has initial value (null)");

	});

	QUnit.test("additionalValue", function(assert) {

		oFieldEdit.setValue("Test");
		oFieldEdit.setAdditionalValue("Hello");
		oFieldDisplay.setAdditionalValue("Hello");
		oFieldDisplay.setValue("Test"); // value after additional value to test this direction

		var fnDone = assert.async();
		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Test", "Value set on Input control");
		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "Test", "Text set on Text control");

		oFieldEdit.setDisplay(FieldDisplay.Description);
		oFieldDisplay.setDisplay(FieldDisplay.Description);
		sap.ui.getCore().applyChanges();

		aContent = oFieldEdit.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Hello", "Value set on Input control");
		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "Hello", "Text set on Text control");

		oFieldEdit.setDisplay(FieldDisplay.DescriptionValue);
		oFieldDisplay.setDisplay(FieldDisplay.DescriptionValue);
		sap.ui.getCore().applyChanges();

		aContent = oFieldEdit.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Hello (Test)", "Value set on Input control");
		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "Hello (Test)", "Text set on Text control");

		oFieldEdit.setDisplay(FieldDisplay.Description);
		oFieldDisplay.setDisplay(FieldDisplay.Description);
		oFieldEdit.setAdditionalValue("");
		oFieldDisplay.setAdditionalValue("");
		sap.ui.getCore().applyChanges();
		var aConditions = oFieldEdit.getConditions();
		assert.notEqual(aConditions[0].values[1], "", "Conditions not updated syncronously");

		setTimeout(function() { // async set of condition
			setTimeout(function() { // model update
				aContent = oFieldEdit.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.equal(oContent.getValue(), "Test", "Value set on Input control");
				aContent = oFieldDisplay.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.equal(oContent.getText(), "Test", "Text set on Text control");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("multipleLines", function(assert) {

		oFieldEdit.setValue("Test");
		oFieldDisplay.setValue("Test");
		oFieldEdit.setMultipleLines(true);
		oFieldDisplay.setMultipleLines(true);
		sap.ui.getCore().applyChanges();

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent instanceof TextArea, "TextArea rendered");
		assert.equal(oContent.getValue(), "Test", "Text set on TextArea control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent instanceof Text, "Text rendered");
		assert.ok(oContent.getWrapping(), "Text wrapping enabled");
		assert.equal(oContent.getText(), "Test", "Text set on Text control");

	});

	QUnit.test("dataType Date", function(assert) {

		oFieldEdit.setDataType("sap.ui.model.type.Date");
		oFieldEdit.setValue(new Date(2017, 8, 19));
		oFieldDisplay.setDataType("sap.ui.model.type.Date");
		oFieldDisplay.setValue(new Date(2017, 8, 19));

		var fnDone = assert.async();
		setTimeout(function() {
			var aContent = oFieldEdit.getAggregation("_content");
			var oContent = aContent && aContent.length > 0 && aContent[0];
			assert.ok(oContent instanceof DatePicker, "DatePicker rendered");
			assert.equal(oContent.$("inner").val(), "Sep 19, 2017", "Value shown on DatePicker control");

			aContent = oFieldDisplay.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
			assert.equal(oContent.getText(), "Sep 19, 2017", "Text set on Text control");
			fnDone();
		}, 50); // wait for rendering in IE

	});

	QUnit.test("dataType Time", function(assert) {

		oFieldEdit.setDataType("sap.ui.model.type.Time");
		oFieldEdit.setValue(new Date(1970, 0, 1, 9, 0, 0));
		oFieldDisplay.setDataType("sap.ui.model.type.Time");
		oFieldDisplay.setValue(new Date(1970, 0, 1, 9, 0, 0));
		sap.ui.getCore().applyChanges();

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent instanceof TimePicker, "TimePicker rendered");
		assert.equal(oContent.$("inner").val(), " 9:00:00 AM", "Value set on TimePicker control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
		assert.equal(oContent.getText(), "9:00:00 AM", "Text set on Text control");

	});

	QUnit.test("dataType DateTimeOffset", function(assert) {

		oFieldEdit.setDataType("Edm.DateTimeOffset");
		oFieldEdit.setValue(new Date(2017, 10, 7, 13, 1, 24));
		oFieldDisplay.setDataType("Edm.DateTimeOffset");
		oFieldDisplay.setValue(new Date(2017, 10, 7, 13, 1, 24));
		sap.ui.getCore().applyChanges();

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent instanceof DateTimePicker, "DateTimePicker rendered");
		assert.equal(oContent.$("inner").val(), "Nov 7, 2017, 1:01:24 PM", "Value set on DateTimePicker control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
		assert.equal(oContent.getText(), "Nov 7, 2017, 1:01:24 PM", "Text set on Text control");

	});

	QUnit.test("dataType sap.ui.model.type.Currency", function(assert) {

		oFieldEdit.setDataType("sap.ui.model.type.Currency");
		oFieldEdit.setValue([12.34, "USD"]);
		oFieldDisplay.setDataType("sap.ui.model.type.Currency");
		oFieldDisplay.setValue([12.34, "USD"]);
		sap.ui.getCore().applyChanges();

		var oType = new CurrencyType({ showMeasure: false });
		sValue = oType.formatValue([12.34, "USD"], "string"); // because of special whitspaced and local dependend
		var aContent = oFieldEdit.getAggregation("_content");
		var oContent1 = aContent && aContent.length > 0 && aContent[0];
		var oContent2 = aContent && aContent.length > 1 && aContent[1];
		assert.ok(oContent1 instanceof Input, "Input rendered");
		assert.equal(oContent1.getValue(), sValue, "Value set on number-Input control");
		assert.ok(oContent2 instanceof Input, "Input rendered");
		assert.equal(oContent2.getValue(), "USD", "Value set on currency-Input control");

		oType.destroy();
		oType = new CurrencyType();
		sValue = oType.formatValue([12.34, "USD"], "string"); // because of special whitspaced and local dependend
		aContent = oFieldDisplay.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
		assert.equal(oContent.getText(), sValue, "Text set on Text control");
		oType.destroy();

	});

	QUnit.test("width", function(assert) {

		oFieldEdit.setWidth("100px");
		oFieldDisplay.setWidth("100px");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#F1").width(), 100, "Width of Edit Field");
		assert.equal(jQuery("#F2").width(), 100, "Width of Display Field");

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getWidth(), "100%", "width of 100% set on FieldBase control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getWidth(), "100%", "width of 100% set on FieldBase control");

	});

	QUnit.test("required", function(assert) {

		var oLabel = new Label("L1", { text: "test", labelFor: oFieldEdit }).placeAt("content");
		oFieldEdit.setRequired(true);
		sap.ui.getCore().applyChanges();

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent.getRequired(), "Required set on Input control");
		assert.ok(oLabel.isRequired(), "Label rendered as required");
		oLabel.destroy();

	});

	QUnit.test("placeholder", function(assert) {

		oFieldEdit.setPlaceholder("Test");
		sap.ui.getCore().applyChanges();

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getPlaceholder(), "Test", "Placeholder set on Input control");

	});

	QUnit.test("valueState", function(assert) {

		oFieldEdit.setValueState("Error");
		oFieldEdit.setValueStateText("Test");
		sap.ui.getCore().applyChanges();

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValueState(), "Error", "ValueState set on Input control");
		assert.equal(oContent.getValueStateText(), "Test", "ValueStateText set on Input control");

	});

	QUnit.test("textAlign", function(assert) {

		oFieldEdit.setTextAlign("End");
		oFieldDisplay.setTextAlign("End");
		sap.ui.getCore().applyChanges();

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Input control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Text control");

	});

	QUnit.test("textDirection", function(assert) {

		oFieldEdit.setTextDirection("RTL");
		oFieldDisplay.setTextDirection("RTL");
		sap.ui.getCore().applyChanges();

		var aContent = oFieldEdit.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Input control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Text control");

	});

	QUnit.test("maxConditions", function(assert) {

		assert.equal(oFieldEdit.getMaxConditions(), 1, "MaxConditions is 1");
		_checkException(assert, oFieldEdit, oFieldEdit.setMaxConditions, "setMaxConditions", 2);

	});

	QUnit.module("Eventing", {
		beforeEach: function() {
			oField = new Field("F1", {
				dataType: "Edm.String"
			});
			oField.attachChange(_myChangeHandler);
			oField.attachLiveChange(_myLiveChangeHandler);
			oField.attachPress(_myPressHandler);
			oField.attachParseError(_myParseErrorHandler);
			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("with internal content", function(assert) {

		var fnDone = assert.async();
		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, "X", "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(oField.getValue(), "X", "Field value");
		assert.ok(oPromise, "Promise returned");
		oPromise.then(function(vResult) {
			assert.ok(true, "Promise resolved");
			assert.equal(vResult, "X", "Promise result");

			// just fake change with additional value
			var aConditions = [Condition.createItemCondition("key", "text")];
			oField.setConditions(aConditions);
			oField._fireChange(aConditions, true, undefined, Promise.resolve(oField._getResultForPromise(aConditions)));
			assert.equal(iCount, 2, "change event fired again");
			assert.equal(sValue, "key", "change event value");
			assert.equal(oField.getValue(), "key", "Field value");
			assert.equal(oField.getAdditionalValue(), "text", "Field additionalValue");
			assert.ok(oPromise, "Promise returned");
			oPromise.then(function(vResult) {
				assert.ok(true, "Promise resolved");
				assert.equal(vResult, "key", "Promise result");

				//simulate liveChange by calling from internal control
				oContent.fireLiveChange({ value: "Y" });
				assert.equal(iLiveCount, 1, "liveChange event fired once");
				assert.equal(sLiveId, "F1", "liveChange event fired on Field");
				assert.equal(sLiveValue, "Y", "liveChange event value");

				// make empty
				iCount = 0;
				sId = undefined;
				sValue = "X"; // to see if empty later on
				oPromise = undefined;
				jQuery(oContent.getFocusDomRef()).val("");
				qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.equal(sValue, null, "change event value");
				assert.ok(oPromise, "Promise returned");
				oPromise.then(function(vResult) {
					assert.ok(true, "Promise resolved");
					assert.equal(vResult, null, "Promise result");

					// DatePicker
					iCount = 0;
					sId = undefined;
					sValue = undefined;
					oPromise = undefined;
					oField.setValue(new Date(2017, 8, 19));
					oField.setDataType("sap.ui.model.type.Date");
					sap.ui.getCore().applyChanges();

					aContent = oField.getAggregation("_content");
					oContent = aContent && aContent.length > 0 && aContent[0];
					oContent.focus();
					jQuery(oContent.getFocusDomRef()).val("XXXX");
					qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
					assert.equal(iParseError, 1, "ParseError fired");
					assert.equal(iCount, 1, "change event fired again");
					assert.notOk(bValid, "Value is not valid");
					assert.equal(sValue, "XXXX", "Value of change event");
					assert.deepEqual(oField.getValue(), new Date(2017, 8, 19), "Field value");
					assert.ok(oPromise, "Promise returned");
					oPromise.then(function(vResult) {
						assert.notOk(true, "Promise must not be resolved");
						fnDone();
					}).catch(function(oException) {
						assert.ok(true, "Promise rejected");
						assert.equal(oException, "XXXX", "wrongValue");
						fnDone();
					});
				});
			});
		});

	});

	QUnit.test("with external content", function(assert) {

		oField.setValue(70);
		var oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		sap.ui.getCore().applyChanges();

		oSlider.focus();
		qutils.triggerKeyboardEvent(oSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, 71, "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(oField.getValue(), 71, "Field value");
		assert.equal(iLiveCount, 1, "liveChange event fired once");
		assert.equal(sLiveId, "F1", "liveChange event fired on Field");
		assert.equal(sLiveValue, 71, "liveChange event value");

		var oButton = new Button("B1");
		oField.setContent(oButton);
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSlider.focus();
		qutils.triggerKeyboardEvent(oSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "change event of field not fired again");

		oButton.firePress(); //simulate press
		assert.equal(iPressCount, 1, "Press event fired once");
		assert.equal(sPressId, "F1", "Press event fired on Field");
		oSlider.destroy();

	});

	QUnit.module("Clone", {
		beforeEach: function() {
			oField = new Field("F1");
			oField.setValue("Test");
			oField.attachChange(_myChangeHandler);
			oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("with internal content", function(assert) {

		var oClone = oField.clone("myClone");
		oClone.placeAt("content");
		sap.ui.getCore().applyChanges();

		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Test", "value set on Input control");
		var aCloneContent = oClone.getAggregation("_content");
		var oCloneContent = aCloneContent && aCloneContent.length > 0 && aCloneContent[0];
		assert.equal(oCloneContent.getValue(), "Test", "Value set on clone Input control");

		oField.setValue("Hello");
		sap.ui.getCore().applyChanges();
		assert.equal(oContent.getValue(), "Hello", "value set on Input control");
		assert.equal(oCloneContent.getValue(), "Test", "Value set on clone Input control");

		oClone.setValue("World");
		sap.ui.getCore().applyChanges();
		assert.equal(oContent.getValue(), "Hello", "value set on Input control");
		assert.equal(oCloneContent.getValue(), "World", "Value set on clone Input control");

		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		//assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1", "Event fired on original Field");
		assert.equal(sValue, "X", "Event value");
		assert.equal(oField.getValue(), "X", "Field value");
		assert.equal(oClone.getValue(), "World", "Clone value");

		iCount = 0;
		sId = "";
		sValue = "";

		oCloneContent.focus();
		jQuery(oCloneContent.getFocusDomRef()).val("Y");
		qutils.triggerKeyboardEvent(oCloneContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1-myClone", "Event fired on clone");
		assert.equal(sValue, "Y", "Event value");
		assert.equal(oField.getValue(), "X", "Field value");
		assert.equal(oClone.getValue(), "Y", "Clone value");

		oClone.destroy();

	});

	QUnit.test("with external content", function(assert) {

		oField.setValue(70);
		var oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		sap.ui.getCore().applyChanges();
		var oClone = oField.clone("myClone");
		oClone.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oCloneSlider = oClone.getContent();
		assert.ok(oCloneSlider instanceof Slider, "Clone has Slider as Content");
		assert.equal(oCloneSlider.getValue(), 70, "Value set on clone Slider control");

		oField.setValue(80);
		sap.ui.getCore().applyChanges();

		assert.equal(oSlider.getValue(), 80, "value set on Slider control");
		assert.equal(oCloneSlider.getValue(), 70, "Value set on clone Slider control");

		oClone.setValue(60);
		sap.ui.getCore().applyChanges();

		assert.equal(oSlider.getValue(), 80, "value set on Slider control");
		assert.equal(oCloneSlider.getValue(), 60, "Value set on clone Slider control");

		oSlider.focus();
		qutils.triggerKeyboardEvent(oSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1", "Event fired on original Field");
		assert.equal(sValue, 81, "Event value");
		assert.equal(oField.getValue(), 81, "Field value");
		assert.equal(oClone.getValue(), 60, "Clone value");

		iCount = 0;
		sId = "";
		sValue = "";

		oCloneSlider.focus();
		qutils.triggerKeyboardEvent(oCloneSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		//assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1-myClone", "Event fired on clone");
		assert.equal(sValue, 61, "Event value");
		assert.equal(oField.getValue(), 81, "Field value");
		assert.equal(oClone.getValue(), 61, "Clone value");

		oClone.destroy();

	});

	var oModel;
	var oType;
	var oField2;
	var oType2;
	var oField3;
	var oType3;
	var oField4;
	var oType4;
	var oField5;
	var oType5;
	var ODataCurrencyCodeList = {
		"EUR": { Text: "Euro", UnitSpecificScale: 2 },
		"USD": { Text: "US-Dollar", UnitSpecificScale: 2 },
		"JPY": { Text: "Japan Yen", UnitSpecificScale: 0 },
		"SEK": { Text: "Swedish krona", UnitSpecificScale: 5 }
	};

	QUnit.module("Binding", {
		beforeEach: function() {
			oModel = new JSONModel({
				value: 10,
				date: new Date(Date.UTC(2018, 11, 20)),
				price: 123.45,
				currencyCode: "USD",
				units: ODataCurrencyCodeList,
				price2: undefined,
				currencyCode2: undefined,
				units2: undefined,
				items: [{ key: "A", description: "Text A" },
				{ key: "A", description: "Text A" }, // to test same value
				{ key: "B", description: "Text B" }
				]
			});

			oType = new IntegerType();
			oType._bMyType = true;

			oField = new Field("F1", {
				value: { path: "/value", type: oType },
				change: _myChangeHandler
			}).placeAt("content");
			oField.setModel(oModel);

			oType2 = new DateTimeType({ style: "long" }, { displayFormat: "Date" });
			oType2._bMyType = true;

			oField2 = new Field("F2", {
				value: { path: "/date", type: oType2 },
				change: _myChangeHandler
			}).placeAt("content");
			oField2.setModel(oModel);

			oType3 = new StringType({}, { maxLength: 1 });
			oType3._bMyType = true;
			var oBindingContext = oModel.getContext("/items/0/");
			oField3 = new Field("F3", {
				value: { path: "key", type: oType3 },
				additionalValue: { path: "description", mode: "OneWay" },
				display: FieldDisplay.DescriptionValue,
				change: _myChangeHandler
			}).placeAt("content");
			oField3.setModel(oModel);
			oField3.setBindingContext(oBindingContext);

			oType4 = new oDataCurrencyType();
			oType4._bMyType = true;

			oField4 = new Field("F4", {
				delegate: { name: "sap/ui/mdc/odata/v4/FieldBaseDelegate", payload: { x: 1 } }, // to test V4 delegate
				value: { parts: [{ path: '/price' }, { path: '/currencyCode' }, { path: '/units' }], type: oType4 },
				change: _myChangeHandler
			}).placeAt("content");
			oField4.setModel(oModel);

			// test late setting of values
			oType5 = new oDataCurrencyType();
			oType5._bMyType = true;

			oField5 = new Field("F5", {
				delegate: { name: "sap/ui/mdc/odata/v4/FieldBaseDelegate", payload: { x: 2 } }, // to test V4 delegate
				value: { parts: [{ path: '/price2' }, { path: '/currencyCode2' }, { path: '/units2' }], type: oType5 },
				change: _myChangeHandler
			}).placeAt("content");
			oField5.setModel(oModel);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			oField2.destroy();
			oField2 = undefined;
			oField3.destroy();
			oField3 = undefined;
			oField4.destroy();
			oField4 = undefined;
			oField5.destroy();
			oField5 = undefined;
			oModel.destroy();
			oModel = undefined;
			oType.destroy();
			oType = undefined;
			oType2.destroy();
			oType2 = undefined;
			oType3.destroy();
			oType3 = undefined;
			oType4.destroy();
			oType4 = undefined;
			oType5.destroy();
			oType5 = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("using given type", function(assert) {

		assert.ok(oField._oContentFactory.getDataType()._bMyType, "Given Type is used in Field");
		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "10", "Value set on Input control");
		var oBindingInfo = oContent.getBindingInfo("value");
		var oConditionsType = oBindingInfo.type;
		var oMyType = oConditionsType.getFormatOptions().valueType;
		assert.ok(oMyType._bMyType, "Given Type is used in Binding for Input");

		assert.notOk(oField2._oContentFactory.getDataType()._bMyType, "Given Type is not used used in Field");
		assert.ok(oField2._oContentFactory.getDataType().isA("sap.ui.model.odata.type.DateTime"), "DateTime type used");
		aContent = oField2.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent instanceof DatePicker, "DatePicker used");
		assert.equal(oContent.getValue(), "2018-12-20", "Value set on DatePicker control");
		assert.equal(jQuery(oContent.getFocusDomRef()).val(), "December 20, 2018", "Value shown on DatePicker control");
		oBindingInfo = oContent.getBindingInfo("value");
		oConditionsType = oBindingInfo.type;
		oMyType = oConditionsType.getFormatOptions().valueType;
		assert.notOk(oMyType._bMyType, "Given Type is not used in Binding for Input");
		assert.ok(oMyType.isA("sap.ui.model.odata.type.DateTime"), "DateTime type used in ConditionsType");

		var oDummyType = new oDataCurrencyType({ showMeasure: false });
		var sValue = oDummyType.formatValue([123.45, "USD", ODataCurrencyCodeList], "string"); // because of special whitspaces and local dependend
		assert.notOk(oField4._oContentFactory.getDataType()._bMyType, "Given Type is not used used in Field");
		assert.ok(oField4._oContentFactory.getDataType().isA("sap.ui.model.odata.type.Currency"), "Currency type used");
		assert.ok(oField4._oContentFactory.getDataType().mCustomUnits, "Currency list used");
		assert.ok(oField4.getBinding("value").getType().mCustomUnits, "Currency list used on binding-type");
		aContent = oField4.getAggregation("_content");
		assert.equal(aContent.length, 2, "2 content controls");
		var oContent1 = aContent && aContent.length > 0 && aContent[0];
		var oContent2 = aContent && aContent.length > 1 && aContent[1];
		assert.ok(oContent1 instanceof Input, "Input rendered");
		assert.ok(oContent2 instanceof Input, "Input rendered");
		assert.equal(oContent1.getValue(), sValue, "Value set on number-Input control");
		assert.equal(oContent2.getValue(), "USD", "Value set on currency-Input control");

		// test late setting of empty values (Currency type needs to be initialized)
		oModel.setProperty("/price2", null);
		oModel.setProperty("/currencyCode2", null);
		oModel.setProperty("/units2", null);
		assert.notOk(oField5._oContentFactory.getDataType()._bMyType, "Given Type is not used used in Field");
		assert.ok(oField5._oContentFactory.getDataType().isA("sap.ui.model.odata.type.Currency"), "Currency type used");
		assert.strictEqual(oField5._oContentFactory.getDataType().mCustomUnits, null, "Currency list initialized");
		assert.strictEqual(oField5.getBinding("value").getType().mCustomUnits, null, "Currency list initialized on binding-type");
		aContent = oField5.getAggregation("_content");
		assert.equal(aContent.length, 2, "2 content controls");
		oContent1 = aContent && aContent.length > 0 && aContent[0];
		oContent2 = aContent && aContent.length > 1 && aContent[1];
		assert.ok(oContent1 instanceof Input, "Input rendered");
		assert.ok(oContent2 instanceof Input, "Input rendered");
		assert.equal(oContent1.getValue(), "", "Value set on number-Input control");
		assert.equal(oContent2.getValue(), "", "Value set on currency-Input control");

	});

	QUnit.test("change binding", function(assert) {

		oField2.bindProperty("value", { path: "/value", type: oType });
		sap.ui.getCore().applyChanges();

		assert.ok(oField2._oContentFactory.getDataType()._bMyType, "Given Type is used in Field");
		var aContent = oField2.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent instanceof Input, "Input used");
		assert.equal(oContent.getValue(), "10", "Value set on Input control");
		var oBindingInfo = oContent.getBindingInfo("value");
		var oConditionsType = oBindingInfo.type;
		var oMyType = oConditionsType.getFormatOptions().valueType;
		assert.ok(oMyType._bMyType, "Given Type is used in Binding for Input");

	});

	QUnit.test("update Value", function(assert) {

		var aContent = oField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		jQuery(oContent.getFocusDomRef()).val("11");
		qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(oModel.getData().value, 11, "Value in Model updated");

	});

	QUnit.test("additionalValue with oneway-binding", function(assert) {

		var fnDone = assert.async();
		setTimeout(function() { // as conditions are updated async
			var aConditions = oField3.getConditions();
			var oCondition = aConditions.length === 1 && aConditions[0];
			assert.deepEqual(oCondition.values, ["A", "Text A"], "Condition ok");

			oField3.setConditions([Condition.createItemCondition("B", "Text B")]); // fake user input
			oModel.checkUpdate(true); // otherwise following test behave strange
			assert.equal(oModel.getData().items[0].key, "B", "Key updated in Model");
			assert.equal(oModel.getData().items[0].description, "Text A", "Description not updated in Model");
			aConditions = oField3.getConditions();
			oCondition = aConditions.length === 1 && aConditions[0];
			assert.deepEqual(oCondition.values, ["B", "Text B"], "Condition ok");

			oModel.getData().items[0].key = "A";
			oModel.checkUpdate(true);
			setTimeout(function() { // as conditions are updated async
				aConditions = oField3.getConditions();
				oCondition = aConditions.length === 1 && aConditions[0];
				assert.deepEqual(oCondition.values, ["A", "Text A"], "Condition ok");


				oModel.getData().items[0].key = "B";
				oModel.getData().items[0].description = "Text B";
				oModel.checkUpdate(true);
				setTimeout(function() { // as conditions are updated async
					aConditions = oField3.getConditions();
					oCondition = aConditions.length === 1 && aConditions[0];
					assert.deepEqual(oCondition.values, ["B", "Text B"], "Condition ok");
					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("BindingContext change to same value on wrong input", function(assert) {

		sap.ui.getCore().getMessageManager().registerObject(oField3, true); // to activate message manager
		var fnDone = assert.async();

		setTimeout(function() { // as conditions are updated async
			var aContent = oField3.getAggregation("_content");
			var oContent = aContent && aContent.length > 0 && aContent[0];

			oField3.focus();
			oContent._$input.val("A1");
			qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

			setTimeout(function() { // as valueState is updates async
				assert.equal(oField3.getValueState(), "Error", "ValueState set");

				var oBindingContext = oModel.getContext("/items/1/");
				oField3.setBindingContext(oBindingContext);

				setTimeout(function() { // as propertys are updated async
					assert.equal(oField3.getValueState(), "None", "ValueState not set");
					assert.equal(oContent.getDOMValue(), "Text A (A)", "new value set on Input");
					fnDone();
				}, 50); // as different Timeout-0 are involved
			}, 50); // as different Timeout-0 are involved
		}, 0);

	});

	QUnit.test("BindingContext change to different value on wrong input", function(assert) {

		sap.ui.getCore().getMessageManager().registerObject(oField3, true); // to activate message manager
		var fnDone = assert.async();

		setTimeout(function() { // as conditions are updated async
			var aContent = oField3.getAggregation("_content");
			var oContent = aContent && aContent.length > 0 && aContent[0];

			oField3.focus();
			oContent._$input.val("A1");
			qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

			setTimeout(function() { // as valueState is updates async
				assert.equal(oField3.getValueState(), "Error", "ValueState set");

				var oBindingContext = oModel.getContext("/items/2/");
				oField3.setBindingContext(oBindingContext);

				setTimeout(function() { // as propertys are updated async
					assert.equal(oField3.getValueState(), "None", "ValueState not set");
					assert.equal(oContent.getDOMValue(), "Text B (B)", "new value set on Input");
					fnDone();
				}, 50); // as different Timeout-0 are involved
			}, 50); // as different Timeout-0 are involved
		}, 0);

	});

	QUnit.module("nullable data type", {
		beforeEach: function() {
			oField = new Field("F1", {
				dataType: "sap.ui.model.odata.type.String"
			});
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("empty string and nullable", function(assert) {

		oField.setValue("");
		oField.setAdditionalValue("Empty");
		var aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.equal(aConditions[0].values[0], "", "condition value");
		assert.equal(aConditions[0].values[1], "Empty", "condition description");

		oField.setValue("");
		oField.setAdditionalValue(null);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.equal(aConditions[0].values[0], "", "condition value");
		assert.equal(aConditions[0].values.length, 1, "no condition description");

		oField.setValue(null);
		oField.setAdditionalValue(null);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "no condition");

		oField.setValue(null);
		oField.setAdditionalValue("Null");
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition"); // as value could be set later from binding
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.equal(aConditions[0].values[0], null, "condition value");
		assert.equal(aConditions[0].values[1], "Null", "condition description");

	});

	QUnit.test("empty string not nullable", function(assert) {

		oField.setDataTypeConstraints({ nullable: false });
		oField.setValue("");
		oField.setAdditionalValue("Empty");
		var aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.equal(aConditions[0].values[0], "", "condition value");
		assert.equal(aConditions[0].values[1], "Empty", "condition description");

		oField.setValue("");
		oField.setAdditionalValue(null);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "no condition");

		oField.setValue(null);
		oField.setAdditionalValue(null);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "no condition");

		oField.setValue(null);
		oField.setAdditionalValue("Null");
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition"); // as value could be set later from binding
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.equal(aConditions[0].values[0], null, "condition value");
		assert.equal(aConditions[0].values[1], "Null", "condition description");

	});

	QUnit.test("empty digsequence-string not nullable", function(assert) {

		oField.setDataTypeConstraints({ maxLength: 3, isDigitSequence: true, nullable: false });
		oField.setValue("000");
		oField.setAdditionalValue("Empty");
		var aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.equal(aConditions[0].values[0], "000", "condition value");
		assert.equal(aConditions[0].values[1], "Empty", "condition description");

		oField.setValue("000");
		oField.setAdditionalValue(null);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "no condition");

		oField.setValue(null);
		oField.setAdditionalValue(null);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "no condition");

		oField.setValue(null);
		oField.setAdditionalValue("Null");
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition"); // as value could be set later from binding
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.equal(aConditions[0].values[0], null, "condition value");
		assert.equal(aConditions[0].values[1], "Null", "condition description");

	});

	var oCurrencyCodeList = {
		"EUR": { Text: "Euro", UnitSpecificScale: 2 },
		"USD": { Text: "US-Dollar", UnitSpecificScale: 2 }
	};

	QUnit.module("currency data type", {
		beforeEach: function() {
			oField = new Field("F1", {
				dataType: "sap.ui.model.odata.type.Currency",
				dataTypeFormatOptions: { parseAsString: false },
				delegate: { name: "sap/ui/mdc/odata/v4/FieldBaseDelegate", payload: {} },
				change: _myChangeHandler
			});
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("creation of Condition", function(assert) {

		sinon.spy(oField, "setConditions");
		sinon.spy(oField, "setProperty");

		oField.setValue([undefined, undefined, undefined]);
		var aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "No condition");
		assert.equal(oField.setConditions.getCalls().length, 0, "condition not changed");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");

		oField.setValue([undefined, undefined, oCurrencyCodeList]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "No condition");
		assert.equal(oField.setConditions.getCalls().length, 0, "condition not changed");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 2, "value only updated once");

		oField.setValue([123.45, "USD", oCurrencyCodeList]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.deepEqual(aConditions[0].values[0], [123.45, "USD", oCurrencyCodeList], "condition value");
		assert.equal(aConditions[0].values[1], null, "condition description");
		assert.equal(oField.setConditions.getCalls().length, 1, "condition changed once");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 3, "value only updated once");

		oField.setValue([1, "USD", oCurrencyCodeList]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(oField.setConditions.getCalls().length, 2, "condition changed");
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		assert.deepEqual(aConditions[0].values[0], [1, "USD", oCurrencyCodeList], "condition value");
		assert.equal(aConditions[0].values[1], null, "condition description");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 4, "value only updated once");

		oField.setValue([1, "USD"]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(oField.setConditions.getCalls().length, 2, "condition not changed");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 5, "value only updated once");

	});

	QUnit.test("Output", function(assert) {

		oField.setValue([undefined, undefined, oCurrencyCodeList]);
		oField.setValue([1, "USD"]); // to check that currency list is still used

		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oType = new CurrencyType({ showMeasure: false });
		sValue = oType.formatValue([1, "USD"], "string"); // because of special whitspaces and local dependend
		var aContent = oField.getAggregation("_content");
		var oContent1 = aContent && aContent.length > 0 && aContent[0];
		var oContent2 = aContent && aContent.length > 1 && aContent[1];
		assert.equal(oContent1.getValue(), sValue, "number value");
		assert.equal(oContent2.getValue(), "USD", "unit value");

	});

	QUnit.test("update of user input", function(assert) {

		oField.setValue([1, "USD", oCurrencyCodeList]);
		oField.placeAt("content");
		sap.ui.getCore().applyChanges();

		sinon.spy(oField, "setProperty");

		oField.setConditions([Condition.createItemCondition([1, "USD"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		oField.setConditions([Condition.createItemCondition([2, "USD"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");
		oField.setConditions([Condition.createItemCondition([2, "EUR"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		var oPromise = Promise.resolve(oField._getResultForPromise(oField.getConditions()));
		oField._fireChange(oField.getConditions(), true, undefined, oPromise); // fake change event
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated with change event");
		assert.deepEqual(oField.getValue(), [2, "EUR"], "Field value");

		oField.setProperty.reset();
		oField.setConditions([Condition.createItemCondition([3, "EUR"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		var fnDone = assert.async();
		oPromise = Promise.resolve(oField._getResultForPromise(oField.getConditions()));
		oField._fireChange(undefined, undefined, undefined, oPromise); // fake change event with promise
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated directly");
		oPromise.then(function(vResult) {
			assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated after promise of change event resolved");
			assert.deepEqual(oField.getValue(), [3, "EUR"], "Field value");
			fnDone();
		});

	});

	QUnit.test("update while user input pending", function(assert) {

		// simulates OutParameter sets unit while user alredy types number
		oField.placeAt("content");
		sap.ui.getCore().applyChanges();
		oField.setValue([undefined, undefined, oCurrencyCodeList]); // after rendering to create internal data type (as we don't use binding here)

		sinon.spy(oField, "setProperty");

		var aContent = oField.getAggregation("_content");
		var oContent1 = aContent && aContent.length > 0 && aContent[0];
		var oContent2 = aContent && aContent.length > 1 && aContent[1];

		oContent1.focus();
		oContent1._$input.val("1");
		oContent1.onChange(); // simulate user input
		oContent2.focus();

		var fnDone = assert.async();
		setTimeout(function() { // model update
			assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");
			assert.deepEqual(oField.getValue(), [undefined, undefined, oCurrencyCodeList], "Value of Field");
			var aConditions = oField.getConditions();
			assert.equal(aConditions.length, 1, "One condition exist");
			var oCondition = aConditions[0];
			assert.deepEqual(oCondition && oCondition.values[0], [1, null], "Value of condition");
			assert.equal(iCount, 0, "change event not fired");

			oField.setValue([undefined, "EUR"]); // simulate OutParameter
			aConditions = oField.getConditions();
			oCondition = aConditions[0];
			assert.deepEqual(oCondition && oCondition.values[0], [1, "EUR", oCurrencyCodeList], "Value of condition");

			setTimeout(function() { // model update
				assert.equal(oContent2.getValue(), "EUR", "Value set on currency control");

				oField.setProperty.reset();
				qutils.triggerKeyboardEvent(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false); // trigger update
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.deepEqual(sValue, [1, "EUR", oCurrencyCodeList], "change event value");
				assert.ok(bValid, "change event valid");
				assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value updated once");
				assert.deepEqual(oField.getValue(), [1, "EUR", oCurrencyCodeList], "Value of Field");

				// test number set while unit change
				oField.setProperty.reset();
				iCount = 0;
				oContent2._$input.val("USD");
				oContent2.onChange(); // simulate user input
				oContent1.focus();

				setTimeout(function() { // model update
					assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");
					assert.deepEqual(oField.getValue(), [1, "EUR", oCurrencyCodeList], "Value of Field");
					aConditions = oField.getConditions();
					assert.equal(aConditions.length, 1, "One condition exist");
					oCondition = aConditions[0];
					assert.deepEqual(oCondition && oCondition.values[0], [1, "USD"], "Value of condition");
					assert.equal(iCount, 0, "change event not fired");

					oField.setValue([2, "EUR"]); // simulate OutParameter
					aConditions = oField.getConditions();
					oCondition = aConditions[0];
					assert.deepEqual(oCondition && oCondition.values[0], [2, "USD", oCurrencyCodeList], "Value of condition");

					setTimeout(function() { // model update
						var sNumber = oField._oContentFactory.getDataType().formatValue([2, "USD"], "string"); // use parser of type to have locale dependent parsing
						assert.equal(oContent1.getValue(), sNumber, "Value set on number control");

						oField.setProperty.reset();
						qutils.triggerKeyboardEvent(oContent1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false); // trigger update
						assert.equal(iCount, 1, "change event fired once");
						assert.equal(sId, "F1", "change event fired on Field");
						assert.deepEqual(sValue, [2, "USD", oCurrencyCodeList], "change event value");
						assert.ok(bValid, "change event valid");
						assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value updated once");
						assert.deepEqual(oField.getValue(), [2, "USD", oCurrencyCodeList], "Value of Field");

						fnDone();
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

});
