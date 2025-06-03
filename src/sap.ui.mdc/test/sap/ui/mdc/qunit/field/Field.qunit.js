/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 10]*/

sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/library",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/FieldInput",
	// make sure delegate is loaded (test delegate loading in FieldBase test)
	"delegates/odata/v4/FieldBaseDelegate",
	"sap/m/Label",
	// async. loading of content control tested in FieldBase test
	"sap/m/Input",
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
	"sap/ui/model/type/Date",
	"sap/ui/model/type/Time",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/type/Single",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/json/JSONModel",
	"sap/ui/events/KeyCodes",
	"sap/ui/test/utils/nextUIUpdate",
	"./FieldBaseDelegateODataDefaultTypes"
], (
	coreLibrary,
	Messaging,
	Message,
	MessageType,
	jQuery,
	qutils,
	library,
	Field,
	Condition,
	ConditionValidated,
	FieldEditMode,
	FieldDisplay,
	OperatorName,
	ConditionsType,
	FieldInput,
	FieldBaseDelegate,
	Label,
	Input,
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
	DateType,
	TimeType,
	oDataCurrencyType,
	DateTimeWithTimezoneType,
	DateTimeOffsetType,
	DateTimeType,
	SingleType,
	StringOdataType,
	JSONModel,
	KeyCodes,
	nextUIUpdate,
	FieldBaseDelegateODataDefaultTypes
) => {
	"use strict";

	const { ValueState } = coreLibrary;

	let oField;
	let sId;
	let sValue;
	let bValid;
	let iCount = 0;
	let oPromise;

	const _myChangeHandler = (oEvent) => {
		iCount++;
		sId = oEvent.oSource.getId();
		sValue = oEvent.getParameter("value");
		bValid = oEvent.getParameter("valid");
		oPromise = oEvent.getParameter("promise");
	};

	let sLiveId;
	let sLiveValue;
	let iLiveCount = 0;

	const _myLiveChangeHandler = (oEvent) => {
		iLiveCount++;
		sLiveId = oEvent.oSource.getId();
		sLiveValue = oEvent.getParameter("value");
	};

	let iParseError = 0;
	let oParseErrorParameters = null;
	const _myParseErrorHandler = (oEvent) => {
		iParseError++;
		oParseErrorParameters = oEvent.getParameters();
	};

	let iFormatError = 0;
	let oFormatErrorParameters = null;
	const _myFormatErrorHandler = (oEvent) => {
		iFormatError++;
		oFormatErrorParameters = oEvent.getParameters();
	};

	let iValidationError = 0;
	let oValidationErrorParameters = null;
	const _myValidationErrorHandler = (oEvent) => {
		iValidationError++;
		oValidationErrorParameters = oEvent.getParameters();
	};

	let iValidationSuccess = 0;
	let oValidationSuccessParameters = null;
	const _myValidationSuccessHandler = (oEvent) => {
		iValidationSuccess++;
		oValidationSuccessParameters = oEvent.getParameters();
	};

	let sPressId;
	let iPressCount = 0;

	const _myPressHandler = (oEvent) => {
		iPressCount++;
		sPressId = oEvent.oSource.getId();
	};

	const _cleanupEvents = () => {
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
		oFormatErrorParameters = null;
		iFormatError = 0;
		oParseErrorParameters = null;
		iValidationError = 0;
		oValidationErrorParameters = null;
		iValidationSuccess = 0;
		oValidationSuccessParameters = null;
	};

	QUnit.module("Field API", {
		beforeEach() {
			oField = new Field("F1");
		},
		afterEach() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("getOverflowToolbarConfig", (assert) => {

		assert.ok(oField.isA("sap.m.IOverflowToolbarContent"), "Field is sap.m.IOverflowToolbarContent");

		const oCheckConfig = {
			canOverflow: true,
			invalidationEvents: [],
			propsUnrelatedToSize: ["conditions", "editMode", "display", "valueState", "valueStateText", "value", "additionalValue"]
		};
		const oConfig = oField.getOverflowToolbarConfig();
		assert.deepEqual(oConfig, oCheckConfig, "Configuration");

	});

	QUnit.module("Field rendering", {
		beforeEach() {
			oField = new Field("F1");
		},
		afterEach() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("default rendering", async (assert) => {

		oField.placeAt("content");
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent, "default content exist");
		assert.equal(oContent?.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is default");
		assert.notOk(oContent?.getShowValueHelp(), "no valueHelp");

	});

	QUnit.test("FieldEditMode", async (assert) => {

		oField.setEditMode(FieldEditMode.Display);
		oField.placeAt("content");
		await nextUIUpdate();

		let aContent = oField.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");

		oField.setEditMode(FieldEditMode.ReadOnly);
		await nextUIUpdate();
		aContent = oField.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is used");
		assert.notOk(oContent.getEditable(), "Input is not editable");

	});

	QUnit.test("external control", async (assert) => {

		let oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		oField.setValue(70);
		oField.placeAt("content");
		await nextUIUpdate();

		assert.ok(oSlider.getDomRef(), "Slider rendered");
		assert.equal(oSlider.getValue(), 70, "Value of Slider");

		oField.destroyContent();
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent, "internal content exist");
		assert.equal(oContent?.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is used");

		oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		await nextUIUpdate();

		assert.ok(oSlider.getDomRef(), "Slider rendered");
		assert.equal(oSlider.getValue(), 70, "Value of Slider");

	});

	QUnit.test("internal control creation", (assert) => {

		const fnDone = assert.async();
		setTimeout(() => { // async control creation in applySettings
			const aContent = oField.getAggregation("_content");
			const oContent = aContent?.length > 0 && aContent[0];
			assert.notOk(oContent, "no content exist before rendering"); // as no data type can be determined
			fnDone();
		}, 0);

	});

	let oFieldEdit, oFieldDisplay;

	QUnit.module("properties", {
		beforeEach: async () => {
			FieldBaseDelegateODataDefaultTypes.enable();
			oFieldEdit = new Field("F1", { editMode: FieldEditMode.Editable });
			oFieldDisplay = new Field("F2", { editMode: FieldEditMode.Display });
			oFieldEdit.placeAt("content");
			oFieldDisplay.placeAt("content");
			await nextUIUpdate();
		},
		afterEach() {
			FieldBaseDelegateODataDefaultTypes.disable();
			oFieldEdit.destroy();
			oFieldDisplay.destroy();
			oFieldEdit = undefined;
			oFieldDisplay = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("value", (assert) => {

		oFieldEdit.setValue("Test");
		oFieldDisplay.setValue("Test");

		let aContent = oFieldEdit.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Test", "Value set on Input control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "Test", "Text set on Text control");

		oFieldEdit.setValue();
		oFieldDisplay.setValue();
		aContent = oFieldEdit.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "", "no Value set on Input control");
		let aConditions = oFieldEdit.getConditions();
		assert.equal(aConditions.length, 0, "no internal conditions");
		assert.equal(oFieldEdit.getValue(), null, "Field has initial value (null)");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "", "no Text set on Text control");
		aConditions = oFieldDisplay.getConditions();
		assert.equal(aConditions.length, 0, "no internal conditions");
		assert.equal(oFieldDisplay.getValue(), null, "Field has initial value (null)");

	});

	QUnit.test("additionalValue", async (assert) => {

		oFieldEdit.setValue("Test");
		oFieldEdit.setAdditionalValue("Hello");
		oFieldDisplay.setAdditionalValue("Hello");
		oFieldDisplay.setValue("Test"); // value after additional value to test this direction

		const fnDone = assert.async();
		let aContent = oFieldEdit.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Test", "Value set on Input control");
		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "Test", "Text set on Text control");

		oFieldEdit.setDisplay(FieldDisplay.Description);
		oFieldDisplay.setDisplay(FieldDisplay.Description);
		await nextUIUpdate();

		// eslint-disable-next-line require-atomic-updates
		aContent = oFieldEdit.getAggregation("_content");
		// eslint-disable-next-line require-atomic-updates
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Hello", "Value set on Input control");
		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "Hello", "Text set on Text control");

		oFieldEdit.setDisplay(FieldDisplay.DescriptionValue);
		oFieldDisplay.setDisplay(FieldDisplay.DescriptionValue);
		await nextUIUpdate();

		// eslint-disable-next-line require-atomic-updates
		aContent = oFieldEdit.getAggregation("_content");
		// eslint-disable-next-line require-atomic-updates
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Hello (Test)", "Value set on Input control");
		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getText(), "Hello (Test)", "Text set on Text control");

		oFieldEdit.setDisplay(FieldDisplay.Description);
		oFieldDisplay.setDisplay(FieldDisplay.Description);
		oFieldEdit.setAdditionalValue("");
		oFieldDisplay.setAdditionalValue(null);
		await nextUIUpdate();
		let aConditions = oFieldEdit.getConditions();
		assert.notEqual(aConditions[0].values[1], "", "Conditions not updated syncronously");

		setTimeout(() => { // async set of condition
			setTimeout(async () => { // model update
				aConditions = oFieldEdit.getConditions();
				assert.deepEqual(aConditions[0].values[1], "", "Conditions additionalValue");
				aContent = oFieldEdit.getAggregation("_content");
				oContent = aContent?.length > 0 && aContent[0];
				assert.equal(oContent.getValue(), "Test", "Value set on Input control");
				aConditions = oFieldDisplay.getConditions();
				assert.equal(aConditions[0].values.length, 1, "Conditions has no additionalValue part");
				aContent = oFieldDisplay.getAggregation("_content");
				oContent = aContent?.length > 0 && aContent[0];
				assert.equal(oContent.getText(), "Test", "Text set on Text control");

				// change between "" and null should not lead to an update as output is the same
				oFieldEdit.setAdditionalValue(null);
				oFieldDisplay.setAdditionalValue("");
				await nextUIUpdate();

				setTimeout(() => { // async set of condition
					setTimeout(() => { // model update
						aConditions = oFieldEdit.getConditions();
						assert.deepEqual(aConditions[0].values[1], "", "Conditions not updated");
						aContent = oFieldEdit.getAggregation("_content");
						oContent = aContent?.length > 0 && aContent[0];
						assert.equal(oContent.getValue(), "Test", "Value set on Input control");
						aConditions = oFieldDisplay.getConditions();
						assert.equal(aConditions[0].values.length, 1, "Conditions not updated");
						aContent = oFieldDisplay.getAggregation("_content");
						oContent = aContent?.length > 0 && aContent[0];
						assert.equal(oContent.getText(), "Test", "Text set on Text control");
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("setValue / setAdditionalValue consider Delegate.createCondition", (assert) => {

		const oTestPayload = {
			"payloadKey" : "payloadValue"
		};

		const oDelegate = sap.ui.require("sap/ui/mdc/field/FieldBaseDelegate");
		sinon.stub(oDelegate, "createConditionPayload").returns(oTestPayload);
		sinon.spy(oDelegate, "createCondition");

		oFieldEdit.setValue("Test");
		oFieldEdit.setAdditionalValue("Hello");

		return new Promise((resolve) => {
			setTimeout(() => { // async set of condition
				assert.ok(oDelegate.createCondition.called, "createCondition was called");
				assert.ok(oDelegate.createConditionPayload.called, "createConditionPayload was called");
				assert.equal(oDelegate.createCondition.lastCall.args[1], oFieldEdit, "Correct control instance was given");
				assert.deepEqual(oDelegate.createCondition.lastCall.args[2], ["Test", "Hello"], "Correct value configuration was given");
				assert.deepEqual(oDelegate.createCondition.lastCall.args[3], {
					"operator": OperatorName.EQ,
					"values": [
						"Test"
					],
					"isEmpty": null,
					"validated": "Validated",
					"payload": oTestPayload
				}, "Correct current condition was given");
				assert.deepEqual(oFieldEdit.getConditions()[0].payload, oTestPayload, "Correct payload found on updated condition");
				oDelegate.createConditionPayload.restore();
				oDelegate.createCondition.restore();
				resolve();
			}, 0);
		});
	});

	QUnit.test("multipleLines", async (assert) => {

		oFieldEdit.setValue("Test");
		oFieldDisplay.setValue("Test");
		oFieldEdit.setMultipleLines(true);
		oFieldDisplay.setMultipleLines(true);
		await nextUIUpdate();

		let aContent = oFieldEdit.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent instanceof TextArea, "TextArea rendered");
		assert.equal(oContent.getValue(), "Test", "Text set on TextArea control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent instanceof ExpandableText, "ExpandableText rendered");
		assert.equal(oContent.getText(), "Test", "Text set on ExpandableText control");

	});

	QUnit.test("dataType Date", (assert) => {

		oFieldEdit.setDataType("sap.ui.model.type.Date");
		oFieldEdit.setValue(new Date(2017, 8, 19));
		oFieldDisplay.setDataType("sap.ui.model.type.Date");
		oFieldDisplay.setValue(new Date(2017, 8, 19));

		const fnDone = assert.async();
		setTimeout(() => {
			let aContent = oFieldEdit.getAggregation("_content");
			let oContent = aContent?.length > 0 && aContent[0];
			assert.ok(oContent instanceof DatePicker, "DatePicker rendered");
			assert.equal(oContent.$("inner").val(), "Sep 19, 2017", "Value shown on DatePicker control");

			aContent = oFieldDisplay.getAggregation("_content");
			oContent = aContent?.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
			assert.equal(oContent.getText(), "Sep 19, 2017", "Text set on Text control");
			fnDone();
		}, 50); // wait for rendering in IE

	});

	QUnit.test("dataType Time", async (assert) => {

		oFieldEdit.setDataType("sap.ui.model.type.Time");
		oFieldEdit.setValue(new Date(1970, 0, 1, 9, 0, 0));
		oFieldDisplay.setDataType("sap.ui.model.type.Time");
		oFieldDisplay.setValue(new Date(1970, 0, 1, 9, 0, 0));
		await nextUIUpdate();

		let aContent = oFieldEdit.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent instanceof TimePicker, "TimePicker rendered");
		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oContent.$("inner").val(), " 9:00:00\u202fAM", "Value set on TimePicker control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
		assert.equal(oContent.getText(), "9:00:00\u202fAM", "Text set on Text control");

	});

	QUnit.test("dataType DateTimeOffset", async (assert) => {

		oFieldEdit.setDataType("Edm.DateTimeOffset");
		oFieldEdit.setValue(new Date(2017, 10, 7, 13, 1, 24));
		oFieldDisplay.setDataType("Edm.DateTimeOffset");
		oFieldDisplay.setValue(new Date(2017, 10, 7, 13, 1, 24));
		await nextUIUpdate();

		let aContent = oFieldEdit.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent instanceof DateTimePicker, "DateTimePicker rendered");
		// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
		assert.equal(oContent.$("inner").val(), "Nov 7, 2017, 1:01:24\u202fPM", "Value set on DateTimePicker control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
		assert.equal(oContent.getText(), "Nov 7, 2017, 1:01:24\u202fPM", "Text set on Text control");

	});

	QUnit.test("dataType sap.ui.model.type.Currency", async (assert) => {

		oFieldEdit.setDataType("sap.ui.model.type.Currency");
		oFieldEdit.setValue([12.34, "USD"]);
		oFieldDisplay.setDataType("sap.ui.model.type.Currency");
		oFieldDisplay.setValue([12.34, "USD"]);
		await nextUIUpdate();

		let oType = new CurrencyType({ showMeasure: false });
		sValue = oType.formatValue([12.34, "USD"], "string"); // because of special whitspaced and local dependend
		let aContent = oFieldEdit.getAggregation("_content");
		const oContent1 = aContent?.length > 0 && aContent[0];
		const oContent2 = aContent?.length > 1 && aContent[1];
		assert.ok(oContent1 instanceof Input, "Input rendered");
		assert.equal(oContent1.getValue(), sValue, "Value set on number-Input control");
		assert.ok(oContent2 instanceof Input, "Input rendered");
		assert.equal(oContent2.getValue(), "USD", "Value set on currency-Input control");

		oType.destroy();
		oType = new CurrencyType();
		sValue = oType.formatValue([12.34, "USD"], "string"); // because of special whitspaced and local dependend
		aContent = oFieldDisplay.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
		assert.equal(oContent.getText(), sValue, "Text set on Text control");
		oType.destroy();

	});

	QUnit.test("width", async (assert) => {

		oFieldEdit.setWidth("100px");
		oFieldDisplay.setWidth("100px");
		await nextUIUpdate();

		assert.equal(jQuery("#F1").width(), 100, "Width of Edit Field");
		assert.equal(jQuery("#F2").width(), 100, "Width of Display Field");

		let aContent = oFieldEdit.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getWidth(), "100%", "width of 100% set on FieldBase control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getWidth(), "100%", "width of 100% set on FieldBase control");

	});

	QUnit.test("required", async (assert) => {

		const oLabel = new Label("L1", { text: "test", labelFor: oFieldEdit }).placeAt("content");
		oFieldEdit.setRequired(true);
		await nextUIUpdate();

		const aContent = oFieldEdit.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent.getRequired(), "Required set on Input control");
		assert.ok(oLabel.isRequired(), "Label rendered as required");
		oLabel.destroy();

	});

	QUnit.test("placeholder", async (assert) => {

		oFieldEdit.setPlaceholder("Test");
		await nextUIUpdate();

		const aContent = oFieldEdit.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getPlaceholder(), "Test", "Placeholder set on Input control");

	});

	QUnit.test("valueState", async (assert) => {

		oFieldEdit.setValueState(ValueState.Error);
		oFieldEdit.setValueStateText("Test");
		await nextUIUpdate();

		const aContent = oFieldEdit.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getValueState(), ValueState.Error, "ValueState set on Input control");
		assert.equal(oContent.getValueStateText(), "Test", "ValueStateText set on Input control");

	});

	QUnit.test("value / additionalValue / valueState together", async (assert) => {

		oFieldEdit.setDisplay(FieldDisplay.DescriptionValue);
		await nextUIUpdate();

		sinon.spy(oFieldEdit, "setConditions");

		oFieldEdit.setValue("Test");
		oFieldEdit.setAdditionalValue("Hello");
		oFieldEdit.setValueState(ValueState.Error);

		const fnDone = assert.async();
		setTimeout(() => { // async set of condition
			setTimeout(() => { // model update
				assert.ok(oFieldEdit.setConditions.calledOnce, "Conditions are only updated once");
				const aConditions = oFieldEdit.getConditions();
				assert.deepEqual(aConditions[0].values[0], "Test", "Condition key");
				assert.deepEqual(aConditions[0].values[1], "Hello", "Conditions description");
				assert.equal(oFieldEdit.getValueState(), ValueState.Error, "ValueState set");
				const aContent = oFieldEdit.getAggregation("_content");
				const oContent = aContent?.length > 0 && aContent[0];
				assert.equal(oContent.getValue(), "Hello (Test)", "Value set on Input control");
				assert.equal(oContent.getValueState(), ValueState.Error, "ValueState set on Input control");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("textAlign", async (assert) => {

		oFieldEdit.setTextAlign("End");
		oFieldDisplay.setTextAlign("End");
		await nextUIUpdate();

		let aContent = oFieldEdit.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Input control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Text control");

	});

	QUnit.test("textDirection", async (assert) => {

		oFieldEdit.setTextDirection("RTL");
		oFieldDisplay.setTextDirection("RTL");
		await nextUIUpdate();

		let aContent = oFieldEdit.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Input control");

		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Text control");

	});

	QUnit.module("Eventing", {
		beforeEach: async () => {
			FieldBaseDelegateODataDefaultTypes.enable();
			oField = new Field("F1", {
				dataType: "Edm.String"
			});
			oField.attachChange(_myChangeHandler);
			oField.attachLiveChange(_myLiveChangeHandler);
			oField.attachPress(_myPressHandler);
			oField.attachParseError(_myParseErrorHandler);
			oField.attachFormatError(_myFormatErrorHandler);
			oField.attachValidationError(_myValidationErrorHandler);
			oField.attachValidationSuccess(_myValidationSuccessHandler);
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach() {
			FieldBaseDelegateODataDefaultTypes.disable();
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("with internal content", (assert) => {

		const aContent = oField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, "X", "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(oField.getValue(), "X", "Field value");
		assert.ok(oPromise, "Promise returned");
		return oPromise.then((vResult) => {
			assert.ok(true, "Promise resolved");
			assert.equal(vResult, "X", "Promise result");

			// just fake change with additional value
			const aConditions = [Condition.createItemCondition("key", "text")];
			oField.setConditions(aConditions);
			oField.fireChangeEvent(aConditions, true, undefined, Promise.resolve(oField.getResultForChangePromise(aConditions)));
			assert.equal(iCount, 2, "change event fired again");
			assert.equal(sValue, "key", "change event value");
			assert.equal(oField.getValue(), "key", "Field value");
			assert.equal(oField.getAdditionalValue(), "text", "Field additionalValue");
			assert.ok(oPromise, "Promise returned");
			return oPromise.then((vResult) => {
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
				qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.equal(sValue, null, "change event value");
				assert.ok(oPromise, "Promise returned");
				return oPromise.then((vResult) => {
					assert.ok(true, "Promise resolved");
					assert.equal(vResult, null, "Promise result");
				});
			});
		});

	});

	QUnit.test("with external content", async (assert) => {

		oField.setValue(70);
		const oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		await nextUIUpdate();

		oSlider.focus();
		qutils.triggerKeydown(oSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, 71, "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(oField.getValue(), 71, "Field value");
		assert.equal(iLiveCount, 1, "liveChange event fired once");
		assert.equal(sLiveId, "F1", "liveChange event fired on Field");
		assert.equal(sLiveValue, 71, "liveChange event value");

		const oButton = new Button("B1");
		oField.setContent(oButton);
		oSlider.placeAt("content");
		await nextUIUpdate();
		oSlider.focus();
		qutils.triggerKeydown(oSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "change event of field not fired again");

		oButton.firePress(); //simulate press
		assert.equal(iPressCount, 1, "Press event fired once");
		assert.equal(sPressId, "F1", "Press event fired on Field");
		oSlider.destroy();

	});

	QUnit.test("cleanup wrong input", async (assert) => {

		const fnDone = assert.async();
		Messaging.registerObject(oField, true); // to test valueState
		oField.setDataType("sap.ui.model.type.Date");
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("XXXX");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iParseError, 1, "ParseError fired");
		assert.equal(oParseErrorParameters?.element, oContent, "ParseError fired for content");
		assert.equal(iCount, 1, "change event fired again");
		assert.notOk(bValid, "Value is not valid");
		assert.equal(sValue, "XXXX", "Value of change event");
		assert.deepEqual(oField.getValue(), null, "Field value");
		assert.ok(oPromise, "Promise returned");
		setTimeout(() => { // to wait for valueStateMessage
			oPromise.then((vResult) => {
				assert.notOk(true, "Promise must not be resolved");
				fnDone();
			}).catch((oException) => {
				assert.ok(true, "Promise rejected");
				assert.ok(oException instanceof ParseException, "ParseExpetion returned");
				assert.equal(oField.getValueState(), ValueState.Error, "ValueState");
				oContent.getFocusDomRef().blur();
				// cleanup should remove valueState
				oField.setValue();
				setTimeout(() => { // to wait for ManagedObjectModel update
					setTimeout(() => { // to wait for Message update
						assert.equal(jQuery(oContent.getFocusDomRef()).val(), "", "no value shown");
						assert.equal(oField.getValueState(), ValueState.None, "ValueState on Field  removed");
						assert.equal(oContent.getValueState(), ValueState.None, "ValueState on Content  removed");

						fnDone();
					}, 0);
				}, 0);
			});
		}, 0);

	});

	QUnit.module("Clone", {
		beforeEach: async () => {
			oField = new Field("F1");
			oField.setValue("Test");
			oField.attachChange(_myChangeHandler);
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("with internal content", async (assert) => {

		const oClone = oField.clone("myClone");
		oClone.placeAt("content");
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "Test", "value set on Input control");
		const aCloneContent = oClone.getAggregation("_content");
		const oCloneContent = aCloneContent?.length > 0 && aCloneContent[0];
		assert.equal(oCloneContent.getValue(), "Test", "Value set on clone Input control");

		oField.setValue("Hello");
		await nextUIUpdate();
		assert.equal(oContent.getValue(), "Hello", "value set on Input control");
		assert.equal(oCloneContent.getValue(), "Test", "Value set on clone Input control");

		oClone.setValue("World");
		await nextUIUpdate();
		assert.equal(oContent.getValue(), "Hello", "value set on Input control");
		assert.equal(oCloneContent.getValue(), "World", "Value set on clone Input control");

		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
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
		qutils.triggerKeydown(oCloneContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1-myClone", "Event fired on clone");
		assert.equal(sValue, "Y", "Event value");
		assert.equal(oField.getValue(), "X", "Field value");
		assert.equal(oClone.getValue(), "Y", "Clone value");

		oClone.destroy();

	});

	QUnit.test("with external content", async (assert) => {

		oField.setValue(70);
		const oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		await nextUIUpdate();
		const oClone = oField.clone("myClone");
		oClone.placeAt("content");
		await nextUIUpdate();

		const oCloneSlider = oClone.getContent();
		assert.ok(oCloneSlider instanceof Slider, "Clone has Slider as Content");
		assert.equal(oCloneSlider.getValue(), 70, "Value set on clone Slider control");

		oField.setValue(80);
		await nextUIUpdate();

		assert.equal(oSlider.getValue(), 80, "value set on Slider control");
		assert.equal(oCloneSlider.getValue(), 70, "Value set on clone Slider control");

		oClone.setValue(60);
		await nextUIUpdate();

		assert.equal(oSlider.getValue(), 80, "value set on Slider control");
		assert.equal(oCloneSlider.getValue(), 60, "Value set on clone Slider control");

		oSlider.focus();
		qutils.triggerKeydown(oSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1", "Event fired on original Field");
		assert.equal(sValue, 81, "Event value");
		assert.equal(oField.getValue(), 81, "Field value");
		assert.equal(oClone.getValue(), 60, "Clone value");

		iCount = 0;
		sId = "";
		sValue = "";

		oCloneSlider.focus();
		qutils.triggerKeydown(oCloneSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		//assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1-myClone", "Event fired on clone");
		assert.equal(sValue, 61, "Event value");
		assert.equal(oField.getValue(), 81, "Field value");
		assert.equal(oClone.getValue(), 61, "Clone value");

		oClone.destroy();

	});

	let oModel;
	let oType;
	let oField2;
	let oType2;
	let oField3;
	let oType3;
	let oField4;
	let oType4;
	let oType4a;
	let oType4b;
	let oField5;
	let oType5;
	let oField6;
	let oField7;
	const ODataCurrencyCodeList = {
		"EUR": { Text: "Euro", UnitSpecificScale: 2 },
		"USD": { Text: "US-Dollar", UnitSpecificScale: 2 },
		"JPY": { Text: "Japan Yen", UnitSpecificScale: 0 },
		"SEK": { Text: "Swedish krona", UnitSpecificScale: 5 }
	};
	let oAdditionalType;

	QUnit.module("Binding", {
		beforeEach: async () => {
			FieldBaseDelegateODataDefaultTypes.enable();
			oModel = new JSONModel({
				value: 10,
				date: new Date(Date.UTC(2018, 11, 20)),
				price: 123.45,
				currencyCode: "USD",
				units: ODataCurrencyCodeList,
				price2: undefined,
				currencyCode2: undefined,
				units2: undefined,
				items: [{ key: "A", description: "Text A"},
				{ key: "A", description: "Text A" }, // to test same value
				{ key: "B", description: "Text B" }
				]
			});

			oType = new IntegerType();
			oType._bMyType = true;

			oField = new Field("F1", {
				value: { path: "/value", type: oType },
				change: _myChangeHandler,
				parseError: _myParseErrorHandler,
				formatError: _myFormatErrorHandler,
				validationError: _myValidationErrorHandler,
				validationSuccess: _myValidationSuccessHandler
				}).placeAt("content");
			oField.setModel(oModel);

			oType2 = new DateTimeType({ style: "long" }, { displayFormat: "Date" });
			oType2._bMyType = true;

			oField2 = new Field("F2", {
				value: { path: "/date", type: oType2 },
				change: _myChangeHandler,
				parseError: _myParseErrorHandler,
				formatError: _myFormatErrorHandler,
				validationError: _myValidationErrorHandler,
				validationSuccess: _myValidationSuccessHandler
			}).placeAt("content");
			oField2.setModel(oModel);

			oType3 = new StringType({}, { maxLength: 1 });
			oType3._bMyType = true;
			oAdditionalType = new StringType({parseKeepsEmptyString: true}, { maxLength: 20 });
			oAdditionalType._bMyType = true;
			let oBindingContext = oModel.getContext("/items/0/");
			oField3 = new Field("F3", {
				value: { path: "key", type: oType3 },
				additionalValue: { path: "description", type: oAdditionalType, mode: "OneWay" },
				display: FieldDisplay.DescriptionValue,
				change: _myChangeHandler,
				parseError: _myParseErrorHandler,
				formatError: _myFormatErrorHandler,
				validationError: _myValidationErrorHandler,
				validationSuccess: _myValidationSuccessHandler
			}).placeAt("content");
			oField3.setModel(oModel);
			oField3.setBindingContext(oBindingContext);

			oType4 = new oDataCurrencyType();
			oType4._bMyType = true;
			oType4a = new SingleType();
			oType4a._bMyType = true;
			oType4b = new StringOdataType(undefined, {maxLength: 3});
			oType4b._bMyType = true;

			oField4 = new Field("F4", {
				delegate: { name: "delegates/odata/v4/FieldBaseDelegate", payload: { x: 1 } }, // to test V4 delegate
				value: { parts: [{ path: '/price', type: oType4a }, { path: '/currencyCode', type: oType4b }, { path: '/units' }], type: oType4 },
				change: _myChangeHandler,
				parseError: _myParseErrorHandler,
				formatError: _myFormatErrorHandler,
				validationError: _myValidationErrorHandler,
				validationSuccess: _myValidationSuccessHandler
			}).placeAt("content");
			oField4.setModel(oModel);

			// test late setting of values
			oType5 = new oDataCurrencyType();
			oType5._bMyType = true;

			oField5 = new Field("F5", {
				delegate: { name: "delegates/odata/v4/FieldBaseDelegate", payload: { x: 2 } }, // to test V4 delegate
				value: { parts: [{ path: '/price2' }, { path: '/currencyCode2' }, { path: '/units2' }], type: oType5 },
				change: _myChangeHandler,
				parseError: _myParseErrorHandler,
				formatError: _myFormatErrorHandler,
				validationError: _myValidationErrorHandler,
				validationSuccess: _myValidationSuccessHandler
			}).placeAt("content");
			oField5.setModel(oModel);

			oField6 = new Field("F6", {
				delegate: { name: "delegates/odata/v4/FieldBaseDelegate", payload: { x: 2 } }, // to test V4 delegate
				value: { path: "key", type: oType3 },
				additionalValue: { parts: [{ path: '/price2', type: oType4a }, { path: '/currencyCode2', type: oType4b }, { path: '/units2' }], type: oType4 },
				change: _myChangeHandler,
				parseError: _myParseErrorHandler,
				formatError: _myFormatErrorHandler,
				validationError: _myValidationErrorHandler,
				validationSuccess: _myValidationSuccessHandler
			}).placeAt("content");
			oField6.setModel(oModel);

			oBindingContext = oModel.getContext("/items/1/");
			oField7 = new Field("F7", {
				value: { path: "key", type: "sap.ui.model.type.String", constraints: { maxLength: 1 } },
				additionalValue: { path: "description", type: "sap.ui.model.type.String", formatOptions: {parseKeepsEmptyString: true}, constraints: { maxLength: 20 }, mode: "OneWay" },
				display: FieldDisplay.DescriptionValue,
				change: _myChangeHandler,
				parseError: _myParseErrorHandler,
				formatError: _myFormatErrorHandler,
				validationError: _myValidationErrorHandler,
				validationSuccess: _myValidationSuccessHandler
			}).placeAt("content");
			oField7.setBindingContext(oBindingContext);
			await nextUIUpdate();
			oField7.setModel(oModel); // set Model after inner control is created, to not use type from Binding
		},
		afterEach() {
			FieldBaseDelegateODataDefaultTypes.disable();
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
			oField6.destroy();
			oField6 = undefined;
			oField7.destroy();
			oField7 = undefined;
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
			oType4a.destroy();
			oType4a = undefined;
			oType4b.destroy();
			oType4b = undefined;
			oType5.destroy();
			oType5 = undefined;
			oAdditionalType.destroy();
			oAdditionalType = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("using given type", (assert) => {

		assert.ok(oField._oContentFactory.getDataType()._bMyType, "Given Type is used in Field");
		let aContent = oField.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getValue(), "10", "Value set on Input control");
		let oBindingInfo = oContent.getBindingInfo("value");
		let oConditionsType = oBindingInfo.type;
		let oMyType = oConditionsType.getFormatOptions().valueType;
		assert.ok(oMyType._bMyType, "Given Type is used in Binding for Input");

		assert.notOk(oField2._oContentFactory.getDataType()._bMyType, "Given Type is not used used in Field");
		assert.ok(oField2._oContentFactory.getDataType().isA("sap.ui.model.odata.type.DateTime"), "DateTime type used");
		aContent = oField2.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent instanceof DatePicker, "DatePicker used");
		assert.equal(oContent.getValue(), "2018-12-20", "Value set on DatePicker control");
		assert.equal(jQuery(oContent.getFocusDomRef()).val(), "December 20, 2018", "Value shown on DatePicker control");
		oBindingInfo = oContent.getBindingInfo("value");
		oConditionsType = oBindingInfo.type;
		oMyType = oConditionsType.getFormatOptions().valueType;
		assert.notOk(oMyType._bMyType, "Given Type is not used in Binding for Input");
		assert.ok(oMyType.isA("sap.ui.model.odata.type.DateTime"), "DateTime type used in ConditionsType");

		const oDummyType = new oDataCurrencyType({ showMeasure: false });
		const sValue = oDummyType.formatValue([123.45, "USD", ODataCurrencyCodeList], "string"); // because of special whitspaces and local dependend
		assert.notOk(oField4._oContentFactory.getDataType()._bMyType, "Given Type is not used used in Field");
		assert.ok(oField4._oContentFactory.getDataType().isA("sap.ui.model.odata.type.Currency"), "Currency type used");
		assert.ok(oField4._oContentFactory.getDataType().mCustomUnits, "Currency list used");
		assert.ok(oField4.getBinding("value").getType().mCustomUnits, "Currency list used on binding-type");
		assert.deepEqual(oField4._oContentFactory.getCompositeTypes(), [oType4a, oType4b, undefined], "Composite types stored");
		aContent = oField4.getAggregation("_content");
		assert.equal(aContent.length, 2, "2 content controls");
		let oContent1 = aContent?.length > 0 && aContent[0];
		let oContent2 = aContent?.length > 1 && aContent[1];
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
		oContent1 = aContent?.length > 0 && aContent[0];
		oContent2 = aContent?.length > 1 && aContent[1];
		assert.ok(oContent1 instanceof Input, "Input rendered");
		assert.ok(oContent2 instanceof Input, "Input rendered");
		assert.equal(oContent1.getValue(), "", "Value set on number-Input control");
		assert.equal(oContent2.getValue(), "", "Value set on currency-Input control");

	});

	QUnit.test("change binding", async (assert) => {

		oField2.bindProperty("value", { path: "/value", type: oType });
		await nextUIUpdate();

		assert.ok(oField2._oContentFactory.getDataType()._bMyType, "Given Type is used in Field");
		const aContent = oField2.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent instanceof Input, "Input used");
		assert.equal(oContent.getValue(), "10", "Value set on Input control");
		const oBindingInfo = oContent.getBindingInfo("value");
		const oConditionsType = oBindingInfo.type;
		const oMyType = oConditionsType.getFormatOptions().valueType;
		assert.ok(oMyType._bMyType, "Given Type is used in Binding for Input");

	});

	QUnit.test("update Value", (assert) => {

		const aContent = oField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		jQuery(oContent.getFocusDomRef()).val("11");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(oModel.getData().value, 11, "Value in Model updated");

	});

	QUnit.test("additionalValue with oneway-binding", (assert) => {

		assert.ok(oField3._oContentFactory.getAdditionalDataType()._bMyType, "Given Type is used in Field");
		const aContent = oField3.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		const oBindingInfo = oContent.getBindingInfo("value");
		const oConditionsType = oBindingInfo.type;
		const oMyType = oConditionsType.getFormatOptions().additionalValueType;
		assert.ok(oMyType._bMyType, "Given Type is used as additionalValueType in Binding for Input");

		const fnDone = assert.async();
		setTimeout(() => { // as conditions are updated async
			let aConditions = oField3.getConditions();
			let oCondition = aConditions.length === 1 && aConditions[0];
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
			setTimeout(() => { // as conditions are updated async
				aConditions = oField3.getConditions();
				oCondition = aConditions.length === 1 && aConditions[0];
				assert.deepEqual(oCondition.values, ["A", "Text A"], "Condition ok");


				oModel.getData().items[0].key = "B";
				oModel.getData().items[0].description = "Text B";
				oModel.checkUpdate(true);
				setTimeout(() => { // as conditions are updated async
					aConditions = oField3.getConditions();
					oCondition = aConditions.length === 1 && aConditions[0];
					assert.deepEqual(oCondition.values, ["B", "Text B"], "Condition ok");
					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("additionalValue with twoway binding", async (assert) => {

		oField3.bindProperty("additionalValue", { path: "description", type: oAdditionalType });
		await nextUIUpdate();

		assert.ok(oField3._oContentFactory.getAdditionalDataType()._bMyType, "Given Type is used in Field3");
		assert.ok(oField6._oContentFactory.getAdditionalDataType()._bMyType, "Given Type is used in Field6");
		assert.deepEqual(oField6._oContentFactory.getAdditionalCompositeTypes(), [oType4a, oType4b, undefined], "Composite types stored in Field6");

		const fnDone = assert.async();
		setTimeout(() => { // as conditions are updated async
			const aConditions = oField3.getConditions();
			const oCondition = aConditions.length === 1 && aConditions[0];
			assert.deepEqual(oCondition.values, ["A", "Text A"], "Condition ok");

			oField3.setConditions([Condition.createItemCondition("B", "Text B")]); // fake user input
			oModel.checkUpdate(true); // otherwise following test behave strange
			assert.equal(oModel.getData().items[0].key, "B", "Key updated in Model");
			assert.equal(oModel.getData().items[0].description, "Text B", "Description updated in Model");

			oField3.setConditions([]); // fake user clears field
			oModel.checkUpdate(true); // otherwise following test behave strange
			assert.equal(oModel.getData().items[0].key, "", "Key updated in Model");
			assert.equal(oModel.getData().items[0].description, "", "Description updated in Model");

			oField3.setConditions([Condition.createItemCondition("B", "Text B")]); // fake user input
			oModel.checkUpdate(true); // otherwise following test behave strange
			oField3.setConditions([Condition.createCondition(OperatorName.EQ, ["E"], undefined, undefined, ConditionValidated.NotValidated)]); // fake invalid input from valuehelp with validateInput=false
			oModel.checkUpdate(true); // otherwise following test behave strange
			assert.equal(oModel.getData().items[0].key, "E", "Key updated in Model");
			assert.equal(oModel.getData().items[0].description, "", "Description updated in Model");

			fnDone();
		}, 0);

	});

	QUnit.test("using given type - provided as string", (assert) => {

		const oType = oField7._oContentFactory.getDataType();
		const oAdditionalType = oField7._oContentFactory.getAdditionalDataType();
		const oBinding = oField7.getBinding("value");
		const oAdditionalBinding = oField7.getBinding("additionalValue");

		assert.equal(oType.getMetadata().getName(), "sap.ui.model.type.String", "used Type");
		assert.deepEqual(oType.getConstraints(), { maxLength: 1 }, "used Constraints");
		assert.notEqual(oType, oBinding.getType(), "Type from Binding not used");
		assert.equal(oAdditionalType.getMetadata().getName(), "sap.ui.model.type.String", "used AdditionalType");
		assert.deepEqual(oAdditionalType.getFormatOptions(), {parseKeepsEmptyString: true}, "used Additional-FormatOptions");
		assert.deepEqual(oAdditionalType.getConstraints(), { maxLength: 20 }, "used Additional-Constraints");
		assert.notEqual(oAdditionalType, oAdditionalBinding.getType(), "Type from Additional-Binding not used");
		const aContent = oField7.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		const oBindingInfo = oContent?.getBindingInfo("value");
		const oConditionsType = oBindingInfo?.type;
		const oMyType = oConditionsType?.getFormatOptions().valueType;
		const oMyAdditionalType = oConditionsType?.getFormatOptions().additionalValueType;
		assert.equal(oMyType, oType, "Given Type is used in Binding for Input");
		assert.equal(oMyAdditionalType, oAdditionalType, "Given AdditionalType is used in Binding for Input");
	});

	QUnit.test("ParseError handling", (assert) => {

		Messaging.registerObject(oField2, true); // to test valueState
		const aContent = oField2.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("XXXX");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iParseError, 1, "ParseError fired");
		assert.equal(oParseErrorParameters?.element, oField2, "ParseError fired for Field");
		assert.equal(oParseErrorParameters?.property, "value", "ParseError 'property'");
		assert.equal(oParseErrorParameters?.type, oType2, "ParseError 'type'");

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oField2.getValueState(), ValueState.Error, "Field: ValueState");
			assert.equal(oField2.getValueStateText(), oParseErrorParameters?.message, "Field: ValueStateText");
			assert.equal(oContent.getValueState(), ValueState.Error, "Content: ValueState");
			assert.equal(oContent.getValueStateText(), oParseErrorParameters?.message, "Content: ValueStateText");

			const aMessages = Messaging.getMessageModel().getObject("/");
			const oMessage = aMessages?.[0];
			assert.equal(aMessages?.length, 1, "One Message in MessageModel");
			assert.equal(oMessage.getType(), MessageType.Error, "Message 'type'");
			assert.equal(oMessage.getMessage(), oParseErrorParameters?.message, "Message 'message'");
			assert.deepEqual(oMessage.getTargets(), [oField2.getId() + "/value"], "Message 'targets'");
			assert.deepEqual(oMessage.getControlIds(), [oField2.getId()], "Message 'controlIds'");

			fnDone();
		}, 0);

	});

	QUnit.test("FormatError handling", (assert) => {

		Messaging.registerObject(oField2, true); // to test valueState
		const aContent = oField2.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		const oData = oModel.getData();
		oData.date = "XXXX";
		oModel.setData(oData);
		oModel.checkUpdate(true, false);
		assert.equal(iFormatError, 1, "FormatError fired");
		assert.equal(oFormatErrorParameters?.element, oField2, "FormatError fired for Field");
		assert.equal(oFormatErrorParameters?.property, "value", "FormatError 'property'");
		assert.equal(oFormatErrorParameters?.type, oType2, "FormatError 'type'");

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oField2.getValueState(), ValueState.None, "Field: ValueState"); // as message seems not to be forwarded to MessageModel
			assert.equal(oField2.getValueStateText(), "", "Field: ValueStateText");
			assert.equal(oContent.getValueState(), ValueState.None, "Content: ValueState");
			assert.equal(oContent.getValueStateText(), "", "Content: ValueStateText");

			const aMessages = Messaging.getMessageModel().getObject("/");
			assert.equal(aMessages?.length, 0, "No Message in MessageModel");

			fnDone();
		}, 0);

	});

	QUnit.test("ValidationError & ValidationSuccess handling", (assert) => {

		Messaging.registerObject(oField3, true); // to test valueState
		const aContent = oField3.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("A1");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iValidationError, 1, "ValidationError fired");
		assert.equal(oValidationErrorParameters?.element, oField3, "ValidationError fired for Field");
		assert.equal(oValidationErrorParameters?.property, "value", "ValidationError 'property'");
		assert.equal(oValidationErrorParameters?.type, oType3, "ValidationError 'type'");

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oField3.getValueState(), ValueState.Error, "Field: ValueState");
			assert.equal(oField3.getValueStateText(), oValidationErrorParameters?.message, "Field: ValueStateText");
			assert.equal(oContent.getValueState(), ValueState.Error, "Content: ValueState");
			assert.equal(oContent.getValueStateText(), oValidationErrorParameters?.message, "Content: ValueStateText");

			let aMessages = Messaging.getMessageModel().getObject("/");
			const oMessage = aMessages?.[0];
			assert.equal(aMessages?.length, 1, "One Message in MessageModel");
			assert.equal(oMessage.getType(), MessageType.Error, "Message 'type'");
			assert.equal(oMessage.getMessage(), oValidationErrorParameters?.message, "Message 'message'");
			assert.deepEqual(oMessage.getTargets(), [oField3.getId() + "/value"], "Message 'targets'");
			assert.deepEqual(oMessage.getControlIds(), [oField3.getId()], "Message 'controlIds'");

			jQuery(oContent.getFocusDomRef()).val("B");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
			assert.equal(iValidationSuccess, 1, "ValidationSuccess fired");
			assert.equal(oValidationSuccessParameters?.element, oField3, "ValidationSuccess fired for Field");
			assert.equal(oValidationSuccessParameters?.property, "value", "ValidationSuccess 'property'");
			assert.equal(oValidationSuccessParameters?.type, oType3, "ValidationSuccess 'type'");

			setTimeout(() => { // to wait for valueStateMessage
				assert.equal(oField3.getValueState(), ValueState.None, "Field: ValueState");
				assert.equal(oField3.getValueStateText(), "", "Field: ValueStateText");
				assert.equal(oContent.getValueState(), ValueState.None, "Content: ValueState");
				assert.equal(oContent.getValueStateText(), "", "Content: ValueStateText");

				aMessages = Messaging.getMessageModel().getObject("/");
				assert.equal(aMessages?.length, 0, "No Message in MessageModel");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("ParseError handling for Currency", (assert) => {

		Messaging.registerObject(oField4, true); // to test valueState
		const aContent = oField4.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iParseError, 1, "ParseError fired");
		assert.equal(oParseErrorParameters?.element, oField4, "ParseError fired for Field");
		assert.equal(oParseErrorParameters?.property, "value", "ParseError 'property'");
		assert.equal(oParseErrorParameters?.type, oType4, "ParseError 'type'");

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oField4.getValueState(), ValueState.Error, "Field: ValueState");
			assert.equal(oField4.getValueStateText(), oParseErrorParameters?.message, "Field: ValueStateText");
			assert.equal(oContent.getValueState(), ValueState.Error, "Content: ValueState");
			assert.equal(oContent.getValueStateText(), oParseErrorParameters?.message, "Content: ValueStateText");

			let aMessages = Messaging.getMessageModel().getObject("/");
			let oMessage = aMessages?.[0];
			assert.equal(aMessages?.length, 1, "One Message in MessageModel");
			assert.equal(oMessage.getType(), MessageType.Error, "Message 'type'");
			assert.equal(oMessage.getMessage(), oParseErrorParameters?.message, "Message 'message'");
			assert.deepEqual(oMessage.getTargets(), [oField4.getId() + "/value"], "Message 'targets'");
			assert.deepEqual(oMessage.getControlIds(), [oContent.getId()], "Message 'controlIds'");

			oContent = aContent?.length > 0 && aContent[1];
			oContent.focus();
			jQuery(oContent.getFocusDomRef()).val("XXXX");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
			assert.equal(iParseError, 2, "ParseError fired");
			assert.equal(oParseErrorParameters?.element, oField4, "ParseError fired for Field");
			assert.equal(oParseErrorParameters?.property, "value", "ParseError 'property'");
			assert.equal(oParseErrorParameters?.type, oType4, "ParseError 'type'");

			setTimeout(() => { // to wait for valueStateMessage
				assert.equal(oField4.getValueState(), ValueState.Error, "Field: ValueState");
				assert.equal(oField4.getValueStateText(), oParseErrorParameters?.message, "Field: ValueStateText");
				assert.equal(oContent.getValueState(), ValueState.Error, "Content: ValueState");
				assert.equal(oContent.getValueStateText(), oParseErrorParameters?.message, "Content: ValueStateText");

				aMessages = Messaging.getMessageModel().getObject("/");
				oMessage = aMessages?.[0];
				assert.equal(aMessages?.length, 1, "One Message in MessageModel");
				assert.equal(oMessage.getType(), MessageType.Error, "Message 'type'");
				assert.equal(oMessage.getMessage(), oParseErrorParameters?.message, "Message 'message'");
				assert.deepEqual(oMessage.getTargets(), [oField4.getId() + "/value"], "Message 'targets'");
				assert.deepEqual(oMessage.getControlIds(), [oContent.getId()], "Message 'controlIds'");

				fnDone();
			}, 0);
		}, 0);

	});

	// ValidationExcetion hard to test on both Content controls, as wrong Currencies are handled as ParseExpetion by Currency type

	QUnit.test("Model-Message handling for Currency", (assert) => {

		Messaging.registerObject(oField4, true); // to test valueState
		const aContent = oField4.getAggregation("_content");
		const oContent0 = aContent?.length > 0 && aContent[0];
		const oContent1 = aContent?.length > 0 && aContent[1];

		const oMessage0 = new Message({
			message: "My warning message",
			type: MessageType.Warning,
			target: '/price',
			fullTarget: '/price',
			processor: oModel
		});
		Messaging.addMessages(oMessage0);

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oField4.getValueState(), ValueState.Warning, "Field: ValueState");
			assert.equal(oField4.getValueStateText(), oMessage0.getMessage(), "Field: ValueStateText");
			assert.equal(oContent0.getValueState(), ValueState.Warning, "Content0: ValueState");
			assert.equal(oContent0.getValueStateText(), oMessage0.getMessage(), "Content0: ValueStateText");
			assert.equal(oContent1.getValueState(), ValueState.None, "Content1: ValueState");
			assert.equal(oContent1.getValueStateText(), "", "Content1: ValueStateText");

			let aMessages = Messaging.getMessageModel().getObject("/");
			assert.equal(aMessages?.length, 1, "One Message in MessageModel");
			assert.deepEqual(oMessage0.getControlIds(), [oContent0.getId()], "Message0 'controlIds'");

			const oMessage1 = new Message({
				message: "My warning message",
				type: MessageType.Warning,
				target: '/currencyCode',
				fullTarget: '/currencyCode',
				processor: oModel
			});
			Messaging.addMessages(oMessage1);

			setTimeout(() => { // to wait for valueStateMessage
				assert.equal(oField4.getValueState(), ValueState.Warning, "Field: ValueState");
				assert.equal(oField4.getValueStateText(), oMessage0.getMessage(), "Field: ValueStateText");
				assert.equal(oContent0.getValueState(), ValueState.Warning, "Content0: ValueState");
				assert.equal(oContent0.getValueStateText(), oMessage0.getMessage(), "Content0: ValueStateText");
				assert.equal(oContent1.getValueState(), ValueState.Warning, "Content1: ValueState");
				assert.equal(oContent1.getValueStateText(), oMessage1.getMessage(), "Content1: ValueStateText");

				aMessages = Messaging.getMessageModel().getObject("/");
				assert.equal(aMessages?.length, 2, "Two Messages in MessageModel");
				assert.deepEqual(oMessage0.getControlIds(), [oContent0.getId()], "Message0 'controlIds'");
				assert.deepEqual(oMessage1.getControlIds(), [oContent1.getId()], "Message1 'controlIds'");

				Messaging.removeAllMessages();

				setTimeout(() => { // to wait for valueStateMessage
					assert.equal(oField4.getValueState(), ValueState.None, "Field: ValueState");
					assert.equal(oField4.getValueStateText(), "", "Field: ValueStateText");
					assert.equal(oContent0.getValueState(), ValueState.None, "Content0: ValueState");
					assert.equal(oContent0.getValueStateText(), "", "Content0: ValueStateText");
					assert.equal(oContent1.getValueState(), ValueState.None, "Content1: ValueState");
					assert.equal(oContent1.getValueStateText(), "", "Content1: ValueStateText");

					aMessages = Messaging.getMessageModel().getObject("/");
					assert.equal(aMessages?.length, 0, "No Messages in MessageModel");

					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("BindingContext change to same value on wrong input", (assert) => {

		Messaging.registerObject(oField3, true); // to activate message manager
		const fnDone = assert.async();

		setTimeout(() => { // as conditions are updated async
			const aContent = oField3.getAggregation("_content");
			const oContent = aContent?.length > 0 && aContent[0];

			oField3.focus();
			oContent._$input.val("A1");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

			setTimeout(() => { // as valueState is updates async
				assert.equal(oField3.getValueState(), ValueState.Error, "ValueState set");

				const oBindingContext = oModel.getContext("/items/1/");
				oField3.setBindingContext(oBindingContext);

				setTimeout(() => { // as propertys are updated async
					assert.equal(oField3.getValueState(), ValueState.None, "ValueState not set");
					assert.equal(oContent.getDOMValue(), "Text A (A)", "new value set on Input");
					fnDone();
				}, 50); // as different Timeout-0 are involved
			}, 50); // as different Timeout-0 are involved
		}, 0);

	});

	QUnit.test("BindingContext change to different value on wrong input", (assert) => {

		Messaging.registerObject(oField3, true); // to activate message manager
		const fnDone = assert.async();

		setTimeout(() => { // as conditions are updated async
			const aContent = oField3.getAggregation("_content");
			const oContent = aContent?.length > 0 && aContent[0];

			oField3.focus();
			oContent._$input.val("A1");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

			setTimeout(() => { // as valueState is updates async
				assert.equal(oField3.getValueState(), ValueState.Error, "ValueState set");

				const oBindingContext = oModel.getContext("/items/2/");
				oField3.setBindingContext(oBindingContext);

				setTimeout(() => { // as propertys are updated async
					assert.equal(oField3.getValueState(), ValueState.None, "ValueState not set");
					assert.equal(oContent.getDOMValue(), "Text B (B)", "new value set on Input");
					fnDone();
				}, 50); // as different Timeout-0 are involved
			}, 50); // as different Timeout-0 are involved
		}, 0);

	});

	QUnit.test("internal control creation", (assert) => {

		oField.destroy();
		oField = new Field("F1", {
			value: { path: "/value", type: oType },
			change: _myChangeHandler
		});

		const fnDone = assert.async();
		setTimeout(() => { // async control creation in applySettings
			let aContent = oField.getAggregation("_content");
			let oContent = aContent?.length > 0 && aContent[0];
			assert.notOk(oContent, "no content exist before rendering"); // as edit mode is not explicit defined

			oField.setMultipleLines(false);
			oField.setEditMode(FieldEditMode.Display);
			setTimeout(() => { // async control creation in observeChanges
				aContent = oField.getAggregation("_content");
				oContent = aContent?.length > 0 && aContent[0];
				assert.ok(oContent, "content exist after setting editMode and multipleLines");

				oField.destroy();
				oField = new Field("F1", {
					value: { path: "/value", type: oType },
					editMode: FieldEditMode.Editable,
					multipleLines: true,
					change: _myChangeHandler
				});

				setTimeout(() => { // async control creation in applySettings
					aContent = oField.getAggregation("_content");
					oContent = aContent?.length > 0 && aContent[0];
					assert.ok(oContent, "content exist before rendering");

					oField.destroy();
					oField = new Field("F1", {
						value: { path: "/value", type: oType },
						editMode: { path: "/editMode"},
						multipleLines: true,
						change: _myChangeHandler
					});

					setTimeout(() => { // async control creation in applySettings
						aContent = oField.getAggregation("_content");
						oContent = aContent?.length > 0 && aContent[0];
						assert.notOk(oContent, "content not exist before rendering"); // as editMode has not set by binding right now

						oField.destroy();
						oField = new Field("F1", {
							value: { path: "/value", type: oType },
							editMode: { path: "/editMode"},
							multipleLines: true,
							change: _myChangeHandler
						});
						oField.setModel(oModel);

						setTimeout(() => { // async control creation in applySettings
							aContent = oField.getAggregation("_content");
							oContent = aContent?.length > 0 && aContent[0];
							assert.ok(oContent, "content exist before rendering");
							fnDone();
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.module("nullable data type", {
		beforeEach() {
			oField = new Field("F1", {
				dataType: "sap.ui.model.odata.type.String"
			});
		},
		afterEach() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("empty string and nullable", (assert) => {

		oField.setValue("");
		oField.setAdditionalValue("Empty");
		let aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(aConditions[0].values[0], "", "condition value");
		assert.equal(aConditions[0].values[1], "Empty", "condition description");

		oField.setValue("");
		oField.setAdditionalValue(null);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
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
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(aConditions[0].values[0], null, "condition value");
		assert.equal(aConditions[0].values[1], "Null", "condition description");

	});

	QUnit.test("empty string not nullable", (assert) => {

		oField.setDataTypeConstraints({ nullable: false });
		oField.setValue("");
		oField.setAdditionalValue("Empty");
		let aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
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
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(aConditions[0].values[0], null, "condition value");
		assert.equal(aConditions[0].values[1], "Null", "condition description");

	});

	QUnit.test("empty digsequence-string not nullable", (assert) => {

		oField.setDataTypeConstraints({ maxLength: 3, isDigitSequence: true, nullable: false });
		oField.setValue("000");
		oField.setAdditionalValue("Empty");
		let aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
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
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(aConditions[0].values[0], null, "condition value");
		assert.equal(aConditions[0].values[1], "Null", "condition description");

	});

	const oCurrencyCodeList = {
		"EUR": { Text: "Euro", UnitSpecificScale: 2 },
		"USD": { Text: "US-Dollar", UnitSpecificScale: 2 }
	};

	QUnit.module("currency data type", {
		beforeEach() {
			oField = new Field("F1", {
				dataType: "sap.ui.model.odata.type.Currency",
				dataTypeFormatOptions: { parseAsString: false },
				delegate: { name: "delegates/odata/v4/FieldBaseDelegate", payload: {} },
				change: _myChangeHandler
			});
		},
		afterEach() {
			oField.destroy();
			oField = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("creation of Condition", (assert) => {

		sinon.spy(oField, "setConditions");
		sinon.spy(oField, "setProperty");

		oField.setValue([undefined, undefined, undefined]);
		let aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "No condition");
		assert.equal(oField.setConditions.getCalls().length, 0, "condition not changed");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");

		oField.setProperty.reset();
		oField.setValue([undefined, undefined, oCurrencyCodeList]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "No condition");
		assert.equal(oField.setConditions.getCalls().length, 0, "condition not changed");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");

		oField.setProperty.reset();
		oField.setValue([null, "", oCurrencyCodeList]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "No condition");
		assert.equal(oField.setConditions.getCalls().length, 0, "condition not changed");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");

		oField.setProperty.reset();
		oField.setValue([123.45, "USD", oCurrencyCodeList]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.deepEqual(aConditions[0].values[0], [123.45, "USD", oCurrencyCodeList], "condition value");
		assert.equal(aConditions[0].values[1], null, "condition description");
		assert.equal(oField.setConditions.getCalls().length, 1, "condition changed once");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");

		oField.setProperty.reset();
		oField.setValue([1, "USD", oCurrencyCodeList]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(oField.setConditions.getCalls().length, 2, "condition changed");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.deepEqual(aConditions[0].values[0], [1, "USD", oCurrencyCodeList], "condition value");
		assert.equal(aConditions[0].values[1], null, "condition description");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");

		oField.setProperty.reset();
		oField.setValue([1, "USD"]);
		aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "One condition");
		assert.equal(oField.setConditions.getCalls().length, 2, "condition not changed");
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");

	});

	QUnit.test("Output", async (assert) => {

		oField.setValue([undefined, undefined, oCurrencyCodeList]);
		oField.setValue([1, "USD"]); // to check that currency list is still used

		oField.placeAt("content");
		await nextUIUpdate();

		const oType = new CurrencyType({ showMeasure: false });
		sValue = oType.formatValue([1, "USD"], "string"); // because of special whitspaces and local dependend
		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent?.length > 0 && aContent[0];
		const oContent2 = aContent?.length > 1 && aContent[1];
		assert.equal(oContent1.getValue(), sValue, "number value");
		assert.equal(oContent2.getValue(), "USD", "unit value");

	});

	QUnit.test("update of user input", async (assert) => {

		oField.setValue([1, "USD", oCurrencyCodeList]);
		oField.placeAt("content");
		await nextUIUpdate();

		sinon.spy(oField, "setProperty");

		oField.setConditions([Condition.createItemCondition([1, "USD"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		oField.setConditions([Condition.createItemCondition([2, "USD"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");
		oField.setConditions([Condition.createItemCondition([2, "EUR"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		let oPromise = Promise.resolve(oField.getResultForChangePromise(oField.getConditions()));
		oField.fireChangeEvent(oField.getConditions(), true, undefined, oPromise); // fake change event
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated with change event");
		assert.deepEqual(oField.getValue(), [2, "EUR"], "Field value");

		oField.setProperty.reset();
		oField.setConditions([Condition.createItemCondition([3, "EUR"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		oPromise = Promise.resolve(oField.getResultForChangePromise(oField.getConditions()));
		oField.fireChangeEvent(undefined, undefined, undefined, oPromise); // fake change event with promise
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated directly");
		return oPromise.then((vResult) => {
			assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated after promise of change event resolved");
			assert.deepEqual(oField.getValue(), [3, "EUR"], "Field value");
		});

	});

	QUnit.test("update of user input for initial condition", async (assert) => {

		oField.setValue([null, null, oCurrencyCodeList]);
		oField.placeAt("content");
		await nextUIUpdate();

		sinon.spy(oField, "setProperty");

		oField.setConditions([Condition.createItemCondition([2, null])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		let oPromise = Promise.resolve(oField.getResultForChangePromise(oField.getConditions()));
		oField.fireChangeEvent(oField.getConditions(), true, undefined, oPromise); // fake change event
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated with change event");
		assert.deepEqual(oField.getValue(), [2, null], "Field value");

		oField.setValue([null, "", oCurrencyCodeList]);
		oField.setProperty.reset();
		oField.setConditions([Condition.createItemCondition([2, null])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		oPromise = Promise.resolve(oField.getResultForChangePromise(oField.getConditions()));
		oField.fireChangeEvent(oField.getConditions(), true, undefined, oPromise); // fake change event
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated with change event");
		assert.deepEqual(oField.getValue(), [2, ""], "Field value");

		oField.setValue([null, "", oCurrencyCodeList]);
		oField.setProperty.reset();
		oField.setConditions([Condition.createItemCondition([null, "USD"])]); // fake user Input with parsing
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");

		oPromise = Promise.resolve(oField.getResultForChangePromise(oField.getConditions()));
		oField.fireChangeEvent(oField.getConditions(), true, undefined, oPromise); // fake change event
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated with change event");
		assert.deepEqual(oField.getValue(), [null, "USD"], "Field value");

	});

	QUnit.test("initialization of value", async (assert) => {

		oField.setValue([1, "USD", oCurrencyCodeList]);
		oField.setEditMode(FieldEditMode.EditableDisplay); // to have only one control -> update not only on change event
		oField.placeAt("content");
		await nextUIUpdate();

		sinon.spy(oField, "setProperty");

		oField.setValue([null, null, oCurrencyCodeList]);
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");
		assert.deepEqual(oField.getValue(), [null, null, oCurrencyCodeList], "Value");

		oField.setValue([1, "USD", oCurrencyCodeList]);
		oField.setProperty.reset();
		oField.setValue([null, null, null]);
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");
		assert.deepEqual(oField.getValue(), [null, null, null], "Value");

		oField.setValue([1, "USD", oCurrencyCodeList]);
		oField.setProperty.reset();
		oField.setValue([null, "", oCurrencyCodeList]);
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");
		assert.deepEqual(oField.getValue(), [null, "", oCurrencyCodeList], "Value");

		oField.setValue([1, "USD", oCurrencyCodeList]);
		oField.setProperty.reset();
		oField.setValue([undefined, undefined, oCurrencyCodeList]);
		assert.equal(oField.setProperty.withArgs("value").getCalls().length, 1, "value only updated once");
		assert.deepEqual(oField.getValue(), [undefined, undefined, oCurrencyCodeList], "Value");

	});

	QUnit.test("update while user input pending", async (assert) => {

		// simulates OutParameter sets unit while user alredy types number
		oField.placeAt("content");
		await nextUIUpdate();
		oField.setValue([undefined, undefined, oCurrencyCodeList]); // after rendering to create internal data type (as we don't use binding here)

		sinon.spy(oField, "setProperty");

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent?.length > 0 && aContent[0];
		const oContent2 = aContent?.length > 1 && aContent[1];

		oContent1.focus();
		oContent1._$input.val("1");
		oContent1.onChange(); // simulate user input
		oContent2.focus();

		const fnDone = assert.async();
		setTimeout(() => { // model update
			assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");
			assert.deepEqual(oField.getValue(), [undefined, undefined, oCurrencyCodeList], "Value of Field");
			let aConditions = oField.getConditions();
			assert.equal(aConditions.length, 1, "One condition exist");
			let oCondition = aConditions[0];
			assert.deepEqual(oCondition?.values[0], [1, null], "Value of condition");
			assert.equal(iCount, 0, "change event not fired");

			oField.setValue([undefined, "EUR"]); // simulate OutParameter
			aConditions = oField.getConditions();
			oCondition = aConditions[0];
			assert.deepEqual(oCondition?.values[0], [1, "EUR", oCurrencyCodeList], "Value of condition");

			setTimeout(() => { // model update
				assert.equal(oContent2.getValue(), "EUR", "Value set on currency control");

				oField.setProperty.reset();
				qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false); // trigger update
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

				setTimeout(() => { // model update
					assert.equal(oField.setProperty.withArgs("value").getCalls().length, 0, "value not updated");
					assert.deepEqual(oField.getValue(), [1, "EUR", oCurrencyCodeList], "Value of Field");
					aConditions = oField.getConditions();
					assert.equal(aConditions.length, 1, "One condition exist");
					oCondition = aConditions[0];
					assert.deepEqual(oCondition?.values[0], [1, "USD"], "Value of condition");
					assert.equal(iCount, 0, "change event not fired");

					oField.setValue([2, "EUR"]); // simulate OutParameter
					aConditions = oField.getConditions();
					oCondition = aConditions[0];
					assert.deepEqual(oCondition?.values[0], [2, "USD", oCurrencyCodeList], "Value of condition");

					setTimeout(() => { // model update
						const sNumber = oField._oContentFactory.getDataType().formatValue([2, "USD"], "string"); // use parser of type to have locale dependent parsing
						assert.equal(oContent1.getValue(), sNumber, "Value set on number control");

						oField.setProperty.reset();
						qutils.triggerKeydown(oContent1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false); // trigger update
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

	QUnit.module("DateTime with timezone", {
		beforeEach: async () => {
			FieldBaseDelegateODataDefaultTypes.enable();
			oModel = new JSONModel({
				dateTime: "2022-02-25T07:06:30+01:00",
				timezone: "Europe/Berlin"
			});

			oType = new DateTimeWithTimezoneType({showTimezone: true});
			oType._bMyType = true;
			oType2 = new DateTimeOffsetType({}, {V4: true});
			oType2._bMyType = true;
			oType3 = new StringType();
			oType3._bMyType = true;

			oField = new Field("F1", {
				value: {parts: [{path: "/dateTime", type: oType2}, {path: "/timezone", type: oType3}], type: oType},
				change: _myChangeHandler
			}).placeAt("content");
			oField.setModel(oModel);

			oField2 = new Field("F12", {
				value: {parts: [{path: "/dateTime", type: oType2}, {path: "/timezone", type: oType3}], type: oType},
				editMode: FieldEditMode.Display,
				change: _myChangeHandler
			}).placeAt("content");
			oField2.setModel(oModel);
			await nextUIUpdate();
		},
		afterEach() {
			FieldBaseDelegateODataDefaultTypes.disable();
			oField.destroy();
			oField = undefined;
			oField2.destroy();
			oField2 = undefined;
			oModel.destroy();
			oModel = undefined;
			oType.destroy();
			oType = undefined;
			oType2.destroy();
			oType2 = undefined;
			oType3.destroy();
			oType3 = undefined;
			_cleanupEvents();
		}
	});

	QUnit.test("inner control binding", (assert) => {

		assert.notOk(oField._oContentFactory.getDataType()._bMyType, "Given Type is not used used in Field");
		assert.ok(oField._oContentFactory.getDataType().isA("sap.ui.model.odata.type.DateTimeWithTimezone"), "DateTimeWithTimezone type used");
		assert.deepEqual(oField._oContentFactory.getCompositeTypes(), [oType2, oType3], "Composite types stored");
		let aContent = oField.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent instanceof DateTimePicker, "DateTimePicker used");
		assert.equal(oContent.getValue(), "2022-02-25T07:06:30", "Value set on DateTimePicker control");
		assert.equal(oContent.getTimezone(), "Europe/Berlin", "Timezone set on DateTimePicker control");
		let oBindingInfo = oContent.getBindingInfo("value");
		let oConditionsType = oBindingInfo.type;
		let oMyType = oConditionsType.getFormatOptions().valueType;
		assert.notOk(oMyType._bMyType, "Given Type is not used in Binding for DateTimePicker");
		assert.ok(oMyType.isA("sap.ui.model.odata.type.DateTimeWithTimezone"), "DateTimeWithTimezone type used in ConditionsType");
		let aCompositeTypes = oConditionsType.getFormatOptions().compositeTypes;
		assert.deepEqual(aCompositeTypes, [oType2, oType3], "Composite types stored used in ConditionsType");
		let oMyOriginalType = oConditionsType.getFormatOptions().originalDateType;
		assert.equal(oMyOriginalType, oType, "original type used in ConditionsType as originalDateType");

		const sText = oType.formatValue([new Date(2022, 1, 25, 7, 6, 30, 0), "Europe/Berlin"], "string"); // as it might locale dependent (formatting and parsing tested in ConditionType)
		assert.ok(oField2._oContentFactory.getDataType()._bMyType, "Given Type is used used in Field");
		assert.deepEqual(oField2._oContentFactory.getCompositeTypes(), [oType2, oType3], "Composite types stored");
		aContent = oField2.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent instanceof Text, "Text used");
		assert.equal(oContent.getText(), sText, "Text set on text control");
		oBindingInfo = oContent.getBindingInfo("text");
		oConditionsType = oBindingInfo.type;
		oMyType = oConditionsType.getFormatOptions().valueType;
		assert.ok(oMyType._bMyType, "Given Type is used in Binding for Text");
		aCompositeTypes = oConditionsType.getFormatOptions().compositeTypes;
		assert.deepEqual(aCompositeTypes, [oType2, oType3], "Composite types stored used in ConditionsType");
		oMyOriginalType = oConditionsType.getFormatOptions().originalDateType;
		assert.notOk(oMyOriginalType, "no type used in ConditionsType as originalDateType");

	});
});
