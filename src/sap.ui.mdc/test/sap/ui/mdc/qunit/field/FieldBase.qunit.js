/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 20]*/

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/Messaging",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/mdc/field/FieldBase",
	"sap/ui/mdc/ValueHelp",
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/Popover",
	"sap/ui/mdc/valuehelp/Dialog",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/valuehelp/base/ListContent",
	"sap/ui/mdc/valuehelp/content/Bool",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/field/FieldInfoBase",
	// to test V4 logic too
	"delegates/odata/v4/FieldBaseDelegate",
	"delegates/odata/v4/ValueHelpDelegate",
	"sap/ui/mdc/field/FieldInput",
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/ui/mdc/field/TokenizerDisplay",
	"sap/ui/mdc/field/TokenDisplay",
	"sap/ui/mdc/field/DynamicDateRangeConditionsType",
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/condition/ConditionValidateException",
	"sap/m/Label",
	"sap/m/MultiInput",
	"sap/m/Text",
	"sap/m/ExpandableText",
	"sap/m/Slider",
	"sap/m/Input",
	"sap/m/ProgressIndicator",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/SearchField",
	"sap/m/TextArea",
	"sap/m/DatePicker",
	"sap/m/TimePicker",
	"sap/m/DateTimePicker",
	"sap/m/DateRangeSelection",
	"sap/m/DynamicDateRange",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Token",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/OperatorDynamicDateOption",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/ConditionType",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/model/Context",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/Time",
	"sap/ui/model/odata/type/String",
	"sap/ui/core/Icon",
	"sap/ui/core/InvisibleText",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/date/Japanese",
	"./FieldBaseDelegateODataDefaultTypes",
	"test-resources/sap/m/qunit/plugins/ClipboardUtils",
	/* jQuery Plugin "cursorPos"*/
	"sap/ui/dom/jquery/cursorPos"
], function(
	Element,
	Library,
	Messaging,
	jQuery,
	qutils,
	nextUIUpdate,
	FieldBase,
	ValueHelp,
	ValueHelpDelegate,
	Popover,
	Dialog,
	Content,
	ListContent,
	Bool,
	Conditions,
	FieldInfoBase,
	FieldBaseDelegate,
	ValueHelpDelegateV4,
	FieldInput,
	FieldMultiInput,
	TokenizerDisplay,
	TokenDisplay,
	DynamicDateRangeConditionsType,
	DefaultContent,
	FieldEditMode,
	FieldDisplay,
	ConditionValidated,
	OperatorName,
	ConditionValidateException,
	Label,
	MultiInput,
	Text,
	ExpandableText,
	Slider,
	Input,
	ProgressIndicator,
	SegmentedButton,
	SegmentedButtonItem,
	SearchField,
	TextArea,
	DatePicker,
	TimePicker,
	DateTimePicker,
	DateRangeSelection,
	DynamicDateRange,
	Button,
	Link,
	Token,
	ConditionModel,
	Condition,
	FilterOperatorUtil,
	OperatorDynamicDateOption,
	ConditionsType,
	ConditionType,
	BaseType,
	Context,
	FormatException,
	ParseException,
	ValidateException,
	IntegerType,
	Currency,
	StringTypeBase,
	DateType,
	TimeType,
	StringType,
	Icon,
	InvisibleText,
	containsOrEquals,
	Device,
	KeyCodes,
	UI5Date,
	Japanese,
	FieldBaseDelegateODataDefaultTypes,
	ClipboardUtils
) {
	"use strict";

	let oField;
	let oCM;
	let sId;
	let sValue;
	let bValid;
	let oPromise;
	let iCount = 0;

	const _myChangeHandler = function(oEvent) {
		iCount++;
		sId = oEvent.oSource.getId();
		bValid = oEvent.getParameter("valid");
		oPromise = oEvent.getParameter("promise");

		if (bValid) {
			const aConditions = oEvent.getParameter("conditions");
			if (aConditions.length == 1) {
				sValue = aConditions[0].values[0];
			}
		} else {
			sValue = oEvent.getParameter("wrongValue");
		}
	};

	const _myFireChange = function(aConditions, bValid, vWrongValue, oPromise) {
		this.fireEvent("change", { conditions: aConditions, valid: bValid, wrongValue: vWrongValue, promise: oPromise });
	};

	const fnOnlyEQ = function() {return [OperatorName.EQ];};

	let sLiveId;
	let sLiveValue;
	let iLiveCount = 0;

	const _myLiveChangeHandler = function(oEvent) {
		iLiveCount++;
		sLiveId = oEvent.oSource.getId();
		sLiveValue = oEvent.getParameter("value");
	};

	let sPressId;
	let iPressCount = 0;

	const _myPressHandler = function(oEvent) {
		iPressCount++;
		sPressId = oEvent.oSource.getId();
	};

	let sSubmitId;
	let iSubmitCount = 0;
	let oSubmitPromise;

	const _mySubmitHandler = function(oEvent) {
		iSubmitCount++;
		sSubmitId = oEvent.oSource.getId();
		oSubmitPromise = oEvent.getParameter("promise");
	};

	let iParseError = 0; // eslint-disable-line no-unused-vars
	const _myParseErrorHandler = function(oEvent) {
		iParseError++;
	};

	let iValidationError = 0;
	const _myValidationErrorHandler = function(oEvent) {
		iValidationError++;
	};

	let iValidationSuccess = 0;
	const _myValidationSuccessHandler = function(oEvent) {
		iValidationSuccess++;
	};

	QUnit.module("Delegate", {
		beforeEach: function() {
		},
		afterEach: function() {
			if (oField) {
				oField.destroy();
				oField = undefined;
			}
			FieldBase._init();
		}
	});

	QUnit.test("default delegate", function(assert) {

		oField = new FieldBase("F1");
		assert.deepEqual(oField.getDelegate(), {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}, "Default delegate");

		const oDelegate = sap.ui.require("sap/ui/mdc/field/FieldBaseDelegate");
		assert.ok(oDelegate, "Delegate module loaded");
		assert.equal(oField.getControlDelegate(), oDelegate, "Delegate used");
		assert.deepEqual(oField.getPayload(), {}, "Payload used");

	});

	QUnit.test("V4 delegate", function(assert) {

		oField = new FieldBase("F1", {
			delegate: {name: "delegates/odata/v4/FieldBaseDelegate", payload: {x: 1}}
		});

		const oDelegate = sap.ui.require("delegates/odata/v4/FieldBaseDelegate");
		assert.equal(oField.getControlDelegate(), oDelegate, "Delegate used");
		assert.deepEqual(oField.getPayload(), {x: 1}, "Payload used");

	});

	QUnit.test("V4 delegate, async loading", function(assert) {

		const oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("delegates/odata/v4/FieldBaseDelegate").onFirstCall().returns(undefined);
		oStub.callThrough();

		oField = new FieldBase("F1", {
			delegate: {name: "delegates/odata/v4/FieldBaseDelegate", payload: {x: 1}}
		});

		const fnDone = assert.async();
		oField.awaitControlDelegate().then(function() {
			const oDelegate = sap.ui.require("delegates/odata/v4/FieldBaseDelegate");
			assert.equal(oField.getControlDelegate(), oDelegate, "Delegate used");
			assert.deepEqual(oField.getPayload(), {x: 1}, "Payload used");
			fnDone();
		});

		oStub.restore();

	});

	QUnit.test("call of delegate functions", async function(assert) {
		const oPayload = {x: 1};
		const oDelegate = sap.ui.require("sap/ui/mdc/field/FieldBaseDelegate");

		const oTypeUtil = oDelegate.getTypeMap(oPayload); // pre-initialize typed typeutil
		sinon.spy(oDelegate, "getTypeMap");
		sinon.spy(oTypeUtil, "getDataTypeInstance");
		sinon.spy(oTypeUtil, "getBaseType");

		oField = new FieldBase("F1", {
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: oPayload}
		}).placeAt("content");


		await nextUIUpdate();

		assert.ok(oDelegate.getTypeMap.calledWith(oField), "getTypeMap called");
		assert.ok(oTypeUtil.getDataTypeInstance.calledWith("sap.ui.model.type.String"), "getDataTypeClass called");
		assert.ok(oTypeUtil.getBaseType.calledWith("sap.ui.model.type.String"), "getBaseType called");

		oTypeUtil.getDataTypeInstance.restore();
		oDelegate.getTypeMap(oPayload).getBaseType.restore();

	});

	QUnit.module("Field rendering", {
		beforeEach: function() {
			FieldBaseDelegateODataDefaultTypes.enable();
			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				models: {cm: oCM}
			});
		},
		afterEach: function() {
			FieldBaseDelegateODataDefaultTypes.disable();
			oField.destroy();
			oField = undefined;
			oCM.destroy();
			oCM = undefined;
			FieldBase._init();
		}
	});

	function defaultRendering(assert) {

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "default content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is default");
		assert.equal(oContent.getModel("$field"), oField._oManagedObjectModel, "MultiInput has ManagedObjectModel of Field");
		assert.equal(oContent.getBindingPath("tokens"), "/conditions", "MultiInput tokens bound to Field conditions");
		assert.ok(oContent.getShowValueHelp(), "valueHelp used");
		assert.equal(oField._sDefaultValueHelp, "Field-DefineConditions-Help", "Default Field help set");
		const oValueHelp = Element.getElementById(oField._sDefaultValueHelp);
		assert.ok(oValueHelp && oValueHelp instanceof ValueHelp, "ValueHelp used");
		const oDialog = oValueHelp && oValueHelp.getDialog();
		assert.ok(oDialog, "Dialog used in ValueHelp");
		assert.ok(oDialog && oDialog instanceof Dialog, "Dialog used");
		const aDialogContent = oDialog && oDialog.getContent()[0];
		assert.ok(aDialogContent && aDialogContent instanceof Conditions, "ConditionPanel used");
		assert.deepEqual(oValueHelp.getDelegate(), {name: "sap/ui/mdc/ValueHelpDelegate", payload: {isDefaultHelp: true}}, "base delegate used on ValueHelp");

		const oSuggestControl = oField.getControlForSuggestion();
		assert.equal(oSuggestControl, oContent, "inner control is used for suggestion");

		assert.equal(oContent.aBeforeDelegates.length, 1, "Delegate with keyboard handling added");
		assert.ok(!!oContent.aBeforeDelegates[0].oDelegate.onsapup,  "Delegate has onsapup implemented");
		assert.ok(!!oContent.aBeforeDelegates[0].oDelegate.onsapdown,  "Delegate has onsapdown implemented");
		assert.ok(!!oContent.aBeforeDelegates[0].oDelegate.onsapbackspace,  "Delegate has onsapbackspace implemented");
		assert.ok(!!oContent.aBeforeDelegates[0].oDelegate.onsaphome,  "Delegate has onsaphome implemented");
		assert.ok(!!oContent.aBeforeDelegates[0].oDelegate.onsapend,  "Delegate has onsapend implemented");
		assert.ok(!!oContent.aBeforeDelegates[0].oDelegate.onsappageup,  "Delegate has onsappageup implemented");
		assert.ok(!!oContent.aBeforeDelegates[0].oDelegate.onsappagedown,  "Delegate has onsappagedown implemented");

	}

	QUnit.test("default rendering", async function(assert) {

		oField.placeAt("content");
		await nextUIUpdate();

		defaultRendering(assert);

	});

	QUnit.test("default rendering, async loading of control", async function(assert) {

		const oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/ui/mdc/field/FieldMultiInput").onFirstCall().returns(undefined);
		oStub.withArgs(["sap/ui/mdc/field/FieldMultiInput"]).onFirstCall().callsFake(function(vDependencies, fnCallback, fnErrCallback) {
			setTimeout(function() {
				oStub.wrappedMethod(vDependencies, fnCallback, fnErrCallback);
			}, 0);
		});
		oStub.callThrough();

		oField.placeAt("content");
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		assert.notOk(aContent && aContent.length > 0, "Content not created sync");

		const oDomRef = oField.getFocusDomRef();
		assert.equal(oDomRef && oDomRef.id, "F1", "Field rendered without content -> Focus DomRef points to Field");
		assert.equal(oDomRef && jQuery(oDomRef).attr("tabIndex"), "-1", "DomRef is focusable");

		const fnDone = assert.async();
		setTimeout(function() { // to wait async creation of inner control
			setTimeout(async function() { // to wait for invalidation
				await nextUIUpdate;
				defaultRendering(assert);

				const oDomRef = oField.getDomRef();
				assert.notOk(oDomRef && jQuery(oDomRef).attr("tabIndex"), "DomRef is not focusable");
				fnDone();
			}, 1);
		}, 1);// to make sure to be executed after require-timeout

		oStub.restore();

	});

	QUnit.test("default rendering, async loading of delegate", async function(assert) {

		oField.destroy();
		const oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/ui/mdc/field/FieldBaseDelegate").onFirstCall().returns(undefined);
		oStub.withArgs(["sap/ui/mdc/field/FieldBaseDelegate"]).onFirstCall().callsFake(function(vDependencies, fnCallback, fnErrCallback) {
			setTimeout(function() {
				oStub.wrappedMethod(vDependencies, fnCallback, fnErrCallback);
			}, 2); // to execute after timeout in nextUIUpdate
		});
		oStub.callThrough();

		oField = new FieldBase("F1", {
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {x: 1}},
			conditions: "{cm>/conditions/Name}"
		}).placeAt("content");
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		assert.notOk(aContent && aContent.length > 0, "Content not created sync");
		const oDomRef = oField.getFocusDomRef();
		assert.equal(oDomRef && oDomRef.id, "F1", "Field rendered without content -> Focus DomRef points to Field");

		const fnDone = assert.async();
		setTimeout(function() { // to wait async creation of inner control
			defaultRendering(assert);
			fnDone();
		}, 3);

		oStub.restore();

	});

	QUnit.test("FieldEditMode", async function(assert) {

		assert.ok(oField.getEditable(), "getEditable");

		oField.setEditMode(FieldEditMode.Display);
		oField.placeAt("content");
		await nextUIUpdate();

		let aContent = oField.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.TokenizerDisplay", "sap.ui.mdc.field.TokenizerDisplay is used");
		assert.equal(oContent.getModel("$field"), oField._oManagedObjectModel, "Text has ManagedObjectModel of Field");
		assert.equal(oContent.getBindingPath("tokens"), "/conditions", "Tokens value bound to Fields Conditions");
		assert.notOk(oField.getEditable(), "getEditable");
		// TODO: test for formatter

		oField.setEditMode(FieldEditMode.ReadOnly);
		await nextUIUpdate();

		aContent = oField.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is used");
		if (oContent.getMetadata().getName() == "sap.ui.mdc.field.FieldMultiInput") {
			assert.equal(oContent.getModel("$field"), oField._oManagedObjectModel, "MultiInput has ManagedObjectModel of Field");
			assert.notOk(oContent.getEditable(), "MultiInput is not editable");
		}
		assert.notOk(oField.getEditable(), "getEditable");

		oField.setEditMode(FieldEditMode.Disabled);
		await nextUIUpdate();

		aContent = oField.getAggregation("_content");
		assert.equal(oContent, aContent && aContent.length > 0 && aContent[0], "Contont control not changed");
		assert.notOk(oContent.getEnabled(), "MultiInput is not enabled");
		assert.notOk(oField.getEditable(), "getEditable");

	});

	QUnit.test("display mode rendering, async loading of control", async function(assert) {

		const oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/ui/mdc/field/TokenizerDisplay").onFirstCall().returns(undefined);
		oStub.withArgs(["sap/ui/mdc/field/TokenizerDisplay"]).onFirstCall().callsFake(function(vDependencies, fnCallback, fnErrCallback) {
			setTimeout(function() {
				oStub.wrappedMethod(vDependencies, fnCallback, fnErrCallback);
			}, 0);
		});
		oStub.callThrough();

		oField.setEditMode(FieldEditMode.Display);
		oField.placeAt("content");
		await nextUIUpdate();

		let aContent = oField.getAggregation("_content");
		assert.notOk(aContent && aContent.length > 0, "Content not created sync");

		const fnDone = assert.async();
		setTimeout(function() { // to wait async creation of inner control
			aContent = oField.getAggregation("_content");
			const oContent = aContent && aContent.length > 0 && aContent[0];
			assert.ok(oContent, "default content exist");
			assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.TokenizerDisplay", "sap.ui.mdc.field.TokenizerDisplay is used");
			fnDone();
		}, 0);

		oStub.restore();

	});

	QUnit.test("external control", async function(assert) {

		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		let oSlider = new Slider("S1");
		let oConditionsType = new ConditionsType();
		oConditionsType._sId = "S1-Type"; // to identify instance

		oSlider.bindProperty("value", { path: '$field>/conditions', type: oConditionsType});
		oField.setContent(oSlider);
		const oCondition = Condition.createCondition(OperatorName.EQ, [70]);
		oCM.addCondition("Name", oCondition);
		oField.placeAt("content");
		await nextUIUpdate();

		const fnDone = assert.async();
		sap.ui.require(["sap/ui/model/odata/type/Single"], function(aModules) { // as type-module is loaded by creating control, check after this is done
			setTimeout(async function() { // as the order of the CallBack function ist not clear and a Promise is used inside LoadModules called in ContentFactory
				assert.notOk(!!oField.getAggregation("_content"), "Field has no internal content");
				assert.ok(oSlider.getDomRef(), "Slider rendered");
				assert.equal(oSlider.getValue(), 70, "Value of Slider");
				assert.equal(oSlider.getModel("$field"), oField._oManagedObjectModel, "Slider has ManagedObjectModel of Field");
				assert.equal(oSlider.getBindingPath("value"), "/conditions", "Slider value bound to Fields conditions");
				assert.equal(oSlider.aBeforeDelegates.length, 1, "Delegate with keyboard handling added");
				assert.equal(oField._oContentFactory._oConditionsType, oConditionsType, "ConditionsType of Slider used in Field");
				const oFormatOptions = oConditionsType.getFormatOptions();
				assert.ok(oFormatOptions.valueType.isA("sap.ui.model.odata.type.Single"), "valueType");


				oField.destroyContent();
				await nextUIUpdate();

				let aContent = oField.getAggregation("_content");
				const oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent, "internal content exist");
				assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is used");
				assert.equal(oSlider.aBeforeDelegates.length, 0, "Delegate with keyboard handling removed");
				assert.notEqual(oField._oContentFactory._oConditionsType, oConditionsType, "ConditionsType of Slider not used in Field");
				assert.ok(oField._oContentFactory._oConditionsType._bCreatedByField, "ConditionsType is created by Field");

				oSlider = new Slider("S1");
				oConditionsType = new ConditionsType();
				oConditionsType._sId = "S1-Type"; // to identify instance
				oSlider.bindProperty("value", { path: '$field>/conditions', type: oConditionsType});
				oField.setContent(oSlider);
				await nextUIUpdate();

				aContent = oField.getAggregation("_content", []);
				assert.equal(aContent.length, 0, "Field has no internal content");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("external display control", async function(assert) {

		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		const oProgressIndicator = new ProgressIndicator("P1");
		const oConditionsType = new ConditionsType();
		oConditionsType._sId = "P1-Type"; // to identify instance
		oProgressIndicator.bindProperty("percentValue", { path: '$field>/conditions', type: oConditionsType});
		oField.setContentDisplay(oProgressIndicator);
		const oCondition = Condition.createCondition(OperatorName.EQ, [70]);
		oCM.addCondition("Name", oCondition);
		oField.placeAt("content");
		await nextUIUpdate();

		const fnDone = assert.async();
		sap.ui.require(["sap/ui/model/odata/type/Single"], function(aModules) { // as type-module is loaded by creating control, check after this is done
			setTimeout(async function() { // as the order of the CallBack function ist not clear and a Promise is used inside LoadModules called in ContentFactory
				let aContent = oField.getAggregation("_content");
				let oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent, "Field has internal content");
				assert.equal(oContent && oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is used");
				assert.notOk(oProgressIndicator.getDomRef(), "ProgressIndicator not rendered");
				assert.equal(oProgressIndicator.getPercentValue(), 0, "Value of ProgressIndicator not taken from Field");
				assert.notOk(oProgressIndicator.getModel("$field"), "ProgressIndicator not bound to ManagedObjectModel of Field as not rendered");
				assert.equal(oProgressIndicator.getBindingPath("percentValue"), "/conditions", "ProgressIndicator value bound to Fields conditions");
				assert.notEqual(oField._oContentFactory._oConditionsType, oConditionsType, "ConditionsType of ProgressIndicator not used in Field");
				assert.ok(oField._oContentFactory._oConditionsType._bCreatedByField, "ConditionsType is created by Field");

				oField.setEditMode(FieldEditMode.Display);
				await nextUIUpdate();
				assert.notOk(!!oField.getAggregation("_content"), "Field has no internal content");
				assert.ok(oProgressIndicator.getDomRef(), "ProgressIndicator is rendered");
				assert.equal(oField._oContentFactory._oConditionsType, oConditionsType, "ConditionsType of ProgressIndicator used in Field");
				const oFormatOptions = oConditionsType.getFormatOptions();
				assert.ok(oFormatOptions.valueType.isA("sap.ui.model.odata.type.Single"), "valueType");
				assert.equal(oProgressIndicator.getPercentValue(), 70, "Value of ProgressIndicator");
				assert.equal(oProgressIndicator.getModel("$field"), oField._oManagedObjectModel, "ProgressIndicator has ManagedObjectModel of Field");

				oField.destroyContentDisplay();
				await nextUIUpdate();
				aContent = oField.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent, "internal content exist");
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.notOk(oProgressIndicator.getModel("$field"), "ProgressIndicator not bound to ManagedObjectModel of Field");

				fnDone();
			}, 0);
		});

	});

	QUnit.test("external edit control", async function(assert) {

		// event if SegmentedButton makes not much sense - just for test of list binding
		const oItem = new SegmentedButtonItem("SBI");
		const oConditionType = new ConditionType();
		oConditionType._sId = "SB1-Type"; // to identify instance
		oItem.bindProperty("text", { path: '$field>', type: oConditionType});
		const oSegmentedButton = new SegmentedButton("SB1");
		oSegmentedButton.bindAggregation("items", { path: '$field>/conditions', template: oItem });
		oField.setContentEdit(oSegmentedButton);
		let oCondition = Condition.createCondition(OperatorName.EQ, ["A"], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oCondition = Condition.createCondition(OperatorName.EQ, ["B"], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oCM.checkUpdate(true, false); // to update bindings
		oField.placeAt("content");
		await nextUIUpdate();

		let aContent = oField.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		assert.notOk(!!oContent, "Field has no internal content");
		assert.ok(oSegmentedButton.getDomRef(), "SegmentedButton is rendered");
		assert.equal(oSegmentedButton.getModel("$field"), oField._oManagedObjectModel, "SegmentedButton has ManagedObjectModel of Field");
		const aItems = oSegmentedButton.getItems();
		assert.equal(aItems.length, 2, "SegmentedButton has 2 items");
		assert.equal(aItems[0].getText(), "A", "Text of Item0");
		assert.equal(aItems[1].getText(), "B", "Text of Item1");
		assert.equal(oField._oContentFactory._oConditionType, oConditionType, "ConditionType of SegmentedButton used in Field");

		oField.setEditMode(FieldEditMode.Display);
		await nextUIUpdate();
		aContent = oField.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "Field has internal content");
		assert.equal(oContent && oContent.getMetadata().getName(), "sap.ui.mdc.field.TokenizerDisplay", "sap.ui.mdc.field.TokenizerDisplay is used");
		assert.notOk(oSegmentedButton.getDomRef(), "SegmentedButton is not rendered");
		assert.notEqual(oField._oContentFactory._oConditionType, oConditionType, "ConditionType of SegmentedButton not used in Field");
		assert.ok(oField._oContentFactory._oConditionType, "ConditionType used");
		assert.ok(oField._oContentFactory._oConditionType._bCreatedByField, "ConditionType is created by Field");

		oField.setEditMode(FieldEditMode.Edit);
		oField.destroyContentEdit();
		await nextUIUpdate();
		aContent = oField.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "internal content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is used");

	});

	QUnit.test("getFocusDomRef", async function(assert) {

		oField.placeAt("content");
		await nextUIUpdate();
		assert.equal(oField.getFocusDomRef().id, "F1-inner-inner", "FocusDomRef");

	});

	QUnit.test("Label association", async function(assert) {

		const oLabel = new Label("L1", { text: "test", labelFor: oField }).placeAt("content");
		oField.placeAt("content");
		await nextUIUpdate();

		assert.equal(jQuery("#L1").attr("for"), "F1-inner-inner", "Label points to DomRef of inner control");

		oField.setEditMode(FieldEditMode.Display);
		await nextUIUpdate();

		assert.equal(jQuery("#L1").attr("for"), "F1-inner", "Label points to DomRef of inner control");
		oLabel.destroy();

	});

	QUnit.test("Label property & connectLabel", function(assert) {

		const oLabel = new Label("L1").placeAt("content");
		oField.setLabel("Test");
		oField.connectLabel(oLabel);

		assert.equal(oLabel.getText(), "Test", "Label text");
		assert.equal(oLabel.getLabelFor(), "F1", "Label labelFor");

		oField.setLabel("Hello");
		assert.equal(oLabel.getText(), "Hello", "Label text");

		oLabel.destroy();

	});

	QUnit.test("Label property & default help", async function(assert) {

		oField.setLabel("Test");
		oField.placeAt("content");
		await nextUIUpdate();
		const oValueHelp = Element.getElementById(oField._sDefaultValueHelp);
		oField.focus();

		assert.equal(oValueHelp.getDialog().getTitle(), "Test", "Field help title");
		assert.equal(oValueHelp.getDialog().getContent()[0].getLabel(), "Test", "DefineConditions Label");

	});

	QUnit.test("enhanceAccessibilityState", async function(assert) {

		oField.placeAt("content");
		const oParent = oField.getParent();
		let iCalled = 0;
		let sId = "";
		if (oParent) { // simulate enhanceAccessibilityState
			oParent.enhanceAccessibilityState = function(oElement, mAriaProps) {
				iCalled++;
				sId = oElement.getId();
			};
		}

		await nextUIUpdate();

		assert.ok(iCalled >= 1, "enhanceAccessibilityState called on Parent");
		assert.equal(sId, "F1-inner", "enhanceAccessibilityState called for inner control");
		delete oParent.enhanceAccessibilityState;

	});

	QUnit.test("getAccessibilityInfo", async function(assert) {

		assert.deepEqual(oField.getAccessibilityInfo(), {}, "empty accessibility info returned if no content");

		oField.placeAt("content");
		await nextUIUpdate();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.deepEqual(oField.getAccessibilityInfo(), oContent.getAccessibilityInfo(), "accessibility info of content returned");

	});

	QUnit.test("Currency rendering", async function(assert) {

		oField.setDataType("sap.ui.model.type.Currency");
		oField.placeAt("content");
		await nextUIUpdate();

		let aContent = oField.getAggregation("_content");
		assert.ok(aContent.length > 0, "default content exist");
		assert.equal(aContent.length, 2, "2 content controls");
		let oContent1 = aContent && aContent.length > 0 && aContent[0];
		let oContent2 = aContent && aContent.length > 1 && aContent[1];
		assert.ok(oContent1 instanceof MultiInput, "MultiInput rendered");
		assert.ok(oContent2 instanceof Input, "Input rendered");
		assert.ok(oContent1.getEditable(), "MultiInput editable");
		assert.ok(oContent2.getEditable(), "Input editable");
		assert.equal(oContent1.getModel("$field"), oField._oManagedObjectModel, "MultiInput has ManagedObjectModel of Field");
		assert.equal(oContent1.getBindingPath("tokens"), "/conditions", "MultiInput tokens bound to Field conditions");
		assert.notOk(oContent1.getShowValueHelp(), "no valueHelp");
		assert.equal(oField._oContentFactory._oConditionType.getFormatOptions().valueType.getFormatOptions().showMeasure, false, "showMeasure set to false on internal type");
		assert.equal(oField._oContentFactory._oConditionType.getFormatOptions().valueType.getFormatOptions().strictParsing, true, "strictParsing set to true on internal type");
		assert.equal(oField._oContentFactory._oUnitConditionsType.getFormatOptions().valueType.getFormatOptions().showNumber, false, "showNumber set to false on internal unit type");
		assert.equal(oField._oContentFactory._oUnitConditionsType.getFormatOptions().valueType.getFormatOptions().strictParsing, true, "strictParsing set to true on internal unit type");
		assert.deepEqual(oField.getAccessibilityInfo(), {children: [oContent1, oContent2]}, "accessibility info returned both controls as children");

		const oSuggestControl = oField.getControlForSuggestion();
		assert.equal(oSuggestControl, oContent2, "Unit control is used for suggestion");

		// in display mode only one control
		oContent1 = undefined; oContent2 = undefined;
		oField.setEditMode(FieldEditMode.Display);
		await nextUIUpdate();

		aContent = oField.getAggregation("_content");
		assert.ok(aContent.length > 0, "default content exist");
		assert.equal(aContent.length, 1, "1 content control");
		oContent1 = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent1 instanceof TokenizerDisplay, "TokenizerDisplay rendered");

		// editable: again 2 Fields but currency readOnly
		oContent1 = undefined; oContent2 = undefined;
		oField.setEditMode(FieldEditMode.EditableReadOnly);
		await nextUIUpdate();
		aContent = oField.getAggregation("_content");
		assert.equal(aContent.length, 2, "2 content controls");
		oContent1 = aContent && aContent.length > 0 && aContent[0];
		oContent2 = aContent && aContent.length > 1 && aContent[1];
		assert.ok(oContent1 instanceof MultiInput, "MultiInput rendered");
		assert.ok(oContent2 instanceof Input, "Input rendered");
		assert.ok(oContent1.getEditable(), "MultiInput editable");
		assert.notOk(oContent2.getEditable(), "Input not editable");
		assert.equal(oField._oContentFactory._oConditionType.getFormatOptions().valueType.getFormatOptions().showMeasure, false, "showMeasure set to false on internal type");
		assert.equal(oField._oContentFactory._oConditionType.getFormatOptions().valueType.getFormatOptions().strictParsing, true, "strictParsing set to true on internal type");

		// if no unit should be displayed only one control should be rendered (original data type must be used, not changed by one with showMeagure=false)
		oContent1 = undefined; oContent2 = undefined;
		oField.setDataTypeFormatOptions({showMeasure: false});
		await nextUIUpdate();
		aContent = oField.getAggregation("_content");
		assert.equal(aContent.length, 1, "1 content control");
		oContent1 = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent1 instanceof MultiInput, "MultiInput rendered");
		assert.notOk(oField._oUnitOriginalType, "original type used for inner control");

		// editable:  but currency in display mode
		oContent1 = undefined; oContent2 = undefined;
		oField.setDataTypeFormatOptions({showMeasure: true});
		oField.setEditMode(FieldEditMode.EditableDisplay);
		await nextUIUpdate();
		aContent = oField.getAggregation("_content", []);
		assert.equal(aContent.length, 1, "1 content control");
		oContent1 = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent1 instanceof MultiInput, "MultiInput rendered");
		assert.equal(oContent1.getBindingPath("description"), "/conditions", "MultiInput description bound to Field conditions");

	});

	QUnit.test("Empty Indicator", async function(assert) {

		// show empty indicator
		oField.setShowEmptyIndicator(true);
		oField.setEditMode(FieldEditMode.Display);
		oField.placeAt("content");
		await nextUIUpdate();

		// multi value
		let aContent = oField.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		let oContentDomRef = oContent && oContent.getDomRef();
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.TokenizerDisplay", "sap.ui.mdc.field.TokenizerDisplay is used");
		assert.ok(oContentDomRef, "content control is rendered");
		assert.ok(jQuery(oContentDomRef.children[3]).hasClass("sapMEmptyIndicator"), "Empty indicator rendered in ExpandableText control");
		assert.notEqual(jQuery(oContentDomRef.children[3]).css("display"), "none", "Empty indicator not hidden");

		// single value
		oField.setMaxConditions(1);
		await nextUIUpdate();
		aContent = oField.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		oContentDomRef = oContent && oContent.getDomRef();
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
		assert.ok(oContentDomRef, "content control is rendered");
		assert.ok(jQuery(oContentDomRef.children[0]).hasClass("sapMEmptyIndicator"), "Empty indicator rendered in Text control");
		assert.notEqual(jQuery(oContentDomRef.children[0]).css("display"), "none", "Empty indicator not hidden");

		// condition with empty key
		const oCondition = Condition.createItemCondition("", "");
		oCM.addCondition("Name", oCondition);
		oCM.checkUpdate(true, false); // update model syncronous
		await nextUIUpdate();

		oContentDomRef = oContent && oContent.getDomRef();
		assert.ok(oContentDomRef, "content control rendered");
		assert.ok(jQuery(oContentDomRef.children[0]).hasClass("sapMEmptyIndicator"), "Empty indicator rendered in Text control");
		assert.equal(jQuery(oContentDomRef.children[0]).css("display"), "none", "Empty indicator hidden");

		// edit mode
		oField.setEditMode(FieldEditMode.Editable);
		oCM.removeAllConditions();
		oCM.checkUpdate(true, false); // update model syncronous
		await nextUIUpdate();
		oContent = aContent && aContent.length > 0 && aContent[0];
		const oDomRef = oField.getDomRef();
		oContentDomRef = oContent && oContent.getDomRef();
		assert.ok(oContentDomRef, "content control rendered");
		assert.equal(oDomRef && oDomRef.children.length, 1, "Only one child rendered");
		assert.equal(oDomRef && oDomRef.children[0], oContentDomRef, "Content control is child");

	});

	QUnit.test("FieldBaseDelegate.createContent", async function(assert) {

		oField.destroy();

		const oDelegate = sap.ui.require("sap/ui/mdc/field/FieldBaseDelegate");
		const aTestContent = [new Text({text: "test"})];
		const _createContentStub = sinon.stub(oDelegate, "createContent").returns(Promise.resolve(aTestContent));

		oField = new FieldBase("F1", {
			conditions: "{cm>/conditions/Name}",
			models: {cm: oCM}
		});


		oField.placeAt("content");
		await nextUIUpdate();

		assert.ok(_createContentStub.called, "FieldBaseDelegate.createContent called during internal content creation");
		assert.ok(oField.getAggregation("_content")[0] === aTestContent[0], "Content created");
		_createContentStub.restore();
	});

	QUnit.module("Field APIs", {
		beforeEach: function() {
			FieldBaseDelegateODataDefaultTypes.enable();
			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				models: {cm: oCM}
			});
		},
		afterEach: function() {
			FieldBaseDelegateODataDefaultTypes.disable();
			oField.destroy();
			oField = undefined;
			oCM.destroy();
			oCM = undefined;
			FieldBase._init();
		}
	});

	QUnit.test("getMaxConditionsForHelp", async function(assert) {

		assert.equal(oField.getMaxConditionsForHelp(), -1, "default");
		oField.setDataType("sap.ui.model.type.Currency");
		oField.placeAt("content");
		await nextUIUpdate();

		assert.equal(oField.getMaxConditionsForHelp(), 1, "for Currency");

	});

	QUnit.test("getSupportedOperators", function(assert) {

		sinon.spy(FilterOperatorUtil, "getOperatorsForType");

		let aOperators = oField.getSupportedOperators();
		assert.ok(aOperators.length > 0, "Operators returned");
		assert.ok(FilterOperatorUtil.getOperatorsForType.calledWith(BaseType.String), "Default operators for string used");

		FilterOperatorUtil.getOperatorsForType.reset();
		oField.setDataType("sap.ui.model.type.Integer");
		aOperators = oField.getSupportedOperators();
		assert.ok(aOperators.length > 0, "Operators returned");
		assert.ok(FilterOperatorUtil.getOperatorsForType.calledWith(BaseType.Numeric), "Default operators for number used");

		FilterOperatorUtil.getOperatorsForType.reset();
		oField.setMaxConditions(1);
		oField.bindProperty("conditions", {path: "cm>/conditions/$search"});
		if (!oField.isSearchField()) {
			sinon.stub(oField, "isSearchField").returns(true);
		}
		aOperators = oField.getSupportedOperators();
		assert.ok(aOperators.length === 1, "Operators returned");
		assert.equal(aOperators[0], OperatorName.Contains, "Contains used for SearchField");
		assert.notOk(FilterOperatorUtil.getOperatorsForType.called, "No default operators of type used");

		FilterOperatorUtil.getOperatorsForType.restore();

	});

	QUnit.test("getFormatOptions", async function(assert) {

		const oContext = new Context(); // just dummy context
		oField.setBindingContext(oContext);
		oField.setValueHelp("X"); // just need ID
		oField.setDataType("sap.ui.model.type.String");
		oField.setEditMode(FieldEditMode.Display);
		oField.placeAt("content");
		await nextUIUpdate();
		let oFormatOptions = oField.getFormatOptions();
		assert.ok(oFormatOptions, "FormatOptions returned");
		assert.ok(oFormatOptions.valueType.isA("sap.ui.model.type.String"), "valueType");
		assert.notOk(oFormatOptions.originalDateType, "no originalDateType");
		assert.equal(oFormatOptions.display, FieldDisplay.Value, "display");
		assert.equal(oFormatOptions.valueHelpID, "X", "valueHelpID");
		assert.deepEqual(oFormatOptions.operators, oField.getSupportedOperators(), "operators");
		assert.equal(oFormatOptions.hideOperator, false, "hideOperator");
		assert.equal(oFormatOptions.maxConditions, -1, "maxConditions");
		assert.equal(oFormatOptions.bindingContext, oContext, "bindingContext");
		assert.ok(oFormatOptions.asyncParsing, "asyncParsing set");
		assert.notOk(oFormatOptions.navigateCondition, "no navigateCondition set");
		assert.ok(oFormatOptions.delegate, "delegate set");
		assert.equal(oFormatOptions.delegateName, "sap/ui/mdc/field/FieldBaseDelegate", "delegateName");
		assert.deepEqual(oFormatOptions.payload, {}, "payload");
		assert.notOk(oFormatOptions.preventGetDescription, "preventGetDescription not set");
		assert.ok(oFormatOptions.convertWhitespaces, "convertWhitespaces set");
		assert.notOk(oFormatOptions.multipleLines, "multipleLines not set");

		oField.setDataType("sap.ui.model.type.Currency");
		oField.setEditMode(FieldEditMode.Editable);
		oField.setMaxConditions(1);
		await nextUIUpdate();
		oFormatOptions = oField.getFormatOptions();
		assert.ok(oFormatOptions, "FormatOptions returned");
		assert.ok(oFormatOptions.valueType.isA("sap.ui.model.type.Currency"), "valueType");
		assert.ok(oFormatOptions.originalDateType.isA("sap.ui.model.type.Currency"), "originalDateType");
		assert.equal(oFormatOptions.display, FieldDisplay.Value, "display");
		assert.notOk(oFormatOptions.valueHelpID, "valueHelpID");
		assert.deepEqual(oFormatOptions.operators, oField.getSupportedOperators(), "operators");
		assert.equal(oFormatOptions.hideOperator, false, "hideOperator");
		assert.equal(oFormatOptions.maxConditions, 1, "maxConditions");
		assert.equal(oFormatOptions.bindingContext, oContext, "bindingContext");
		assert.ok(oFormatOptions.asyncParsing, "asyncParsing set");
		assert.notOk(oFormatOptions.navigateCondition, "no navigateCondition set");
		assert.ok(oFormatOptions.delegate, "delegate set");
		assert.equal(oFormatOptions.delegateName, "sap/ui/mdc/field/FieldBaseDelegate", "delegateName");
		assert.deepEqual(oFormatOptions.payload, {}, "payload");
		assert.notOk(oFormatOptions.preventGetDescription, "preventGetDescription not set");
		assert.notOk(oFormatOptions.convertWhitespaces, "convertWhitespaces not set");
		assert.equal(oFormatOptions.control, oField, "control");
		assert.notOk(oFormatOptions.multipleLines, "multipleLines not set");

		oFormatOptions = oField.getUnitFormatOptions();
		assert.ok(oFormatOptions, "FormatOptions returned");
		assert.ok(oFormatOptions.valueType.isA("sap.ui.model.type.Currency"), "valueType");
		assert.ok(oFormatOptions.originalDateType.isA("sap.ui.model.type.Currency"), "originalDateType");
		assert.equal(oFormatOptions.display, FieldDisplay.Value, "display");
		assert.equal(oFormatOptions.valueHelpID, "X", "valueHelpID");
		assert.deepEqual(oFormatOptions.operators, [OperatorName.EQ], "operators");
		assert.equal(oFormatOptions.hideOperator, true, "hideOperator");
		assert.equal(oFormatOptions.maxConditions, 1, "maxConditions");
		assert.equal(oFormatOptions.bindingContext, oContext, "bindingContext");
		assert.ok(oFormatOptions.asyncParsing, "asyncParsing set");
		assert.notOk(oFormatOptions.navigateCondition, "no navigateCondition set");
		assert.ok(oFormatOptions.delegate, "delegate set");
		assert.equal(oFormatOptions.delegateName, "sap/ui/mdc/field/FieldBaseDelegate", "delegateName");
		assert.deepEqual(oFormatOptions.payload, {}, "payload");
		assert.notOk(oFormatOptions.preventGetDescription, "preventGetDescription not set");
		assert.notOk(oFormatOptions.convertWhitespaces, "convertWhitespaces not set");
		assert.equal(oFormatOptions.control, oField, "control");
		assert.notOk(oFormatOptions.multipleLines, "multipleLines not set");

	});

	QUnit.test("getFormValueProperty", function(assert) {

		assert.equal(oField.getFormValueProperty(), "conditions", "Conditions are value property for Form");

	});

	QUnit.test("getFormFormattedValue", async function(assert) {

		const oCondition = Condition.createItemCondition("1", "Text");
		oCM.addCondition("Name", oCondition);
		oCM.checkUpdate(true, false); // update model syncronous
		oField.setDisplay(FieldDisplay.Description);
		oField.placeAt("content");
		await nextUIUpdate();

		assert.equal(oField.getFormFormattedValue(), "Text", "Formatted Value");

	});

	QUnit.test("getFormFormattedValue with unit", async function(assert) {

		oField.setDataType("sap.ui.model.type.Currency");
		const oCondition = Condition.createItemCondition([123.45, "USD"]);
		oCM.addCondition("Name", oCondition);
		oCM.checkUpdate(true, false); // update model syncronous
		oField.placeAt("content");
		await nextUIUpdate();

		const oType = new Currency();
		sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspaces and local dependend

		assert.equal(oField.getFormFormattedValue(), sValue, "Formatted Value");

	});

	QUnit.test("getFormFormattedValue with date", async function(assert) {

		oField.setDataType("sap.ui.model.type.Date");
		oField.setDataTypeFormatOptions({pattern: "dd/MM/yyyy"});
		oField.setMaxConditions(1);
		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		const oCondition = Condition.createCondition(OperatorName.EQ, [new Date(2020, 11, 18)]);
		oCM.addCondition("Name", oCondition);
		oCM.checkUpdate(true, false); // update model syncronous
		oField.placeAt("content");
		await nextUIUpdate();

		assert.equal(oField.getFormFormattedValue(), "18/12/2020", "Formatted Value");

	});

	QUnit.test("getFormFormattedValue with showEmptyIndicator", async function(assert) {

		const oResourceBundle = Library.getResourceBundleFor("sap.m");
		oField.setShowEmptyIndicator(true);
		oField.setDisplay(FieldDisplay.Description);
		oField.placeAt("content");
		await nextUIUpdate();

		assert.equal(oField.getFormFormattedValue(), oResourceBundle.getText("EMPTY_INDICATOR"), "Formatted Value");

	});

	QUnit.test("getFormObservingProperties", function(assert) {

		assert.deepEqual(oField.getFormObservingProperties(), ["conditions", "editMode"], "on editMode or condition change Semantic behavior might change");

	});

	QUnit.test("getFormRenderAsControl", async function(assert) {

		oField.placeAt("content");
		await nextUIUpdate();

		assert.notOk(oField.getFormRenderAsControl(), "In Edit mode control rendering for SemanticFormElement in display mode is not suppored");

		oField.setEditMode(FieldEditMode.Display);
		await nextUIUpdate();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];

		if (!oContent.getFormRenderAsControl) { // control might not implent it
			oContent.getFormRenderAsControl = function() {};
		}
		sinon.stub(oContent, "getFormRenderAsControl").returns(true);
		assert.ok(oField.getFormRenderAsControl(), "In display mode value of content control is used");

		oContent.getFormRenderAsControl.returns(false);
		assert.notOk(oField.getFormRenderAsControl(), "In display mode value of content control is used");

		delete oContent.getFormRenderAsControl; // to check default
		assert.notOk(oField.getFormRenderAsControl(), "false if control not supports it at all");

		oField.addAggregation("_content", new Text()); // fake multiple content (unit)
		assert.notOk(oField.getFormRenderAsControl(), "not supported for multiple content");

		oField.destroyAggregation("_content"); // fake content not created right now
		assert.ok(oField.getFormRenderAsControl(), "If no content right now, assume that it will be supported");

	});

	QUnit.test("getOverflowToolbarConfig", function(assert) {

		assert.ok(oField.isA("sap.m.IOverflowToolbarContent"), "Field is sap.m.IOverflowToolbarContent");

		const oCheckConfig = {
			canOverflow: true,
			invalidationEvents: [],
			propsUnrelatedToSize: ["conditions", "editMode", "display", "valueState", "valueStateText"] // only add properties taht are normally changed during livetime
		};
		const oConfig = oField.getOverflowToolbarConfig();
		assert.deepEqual(oConfig, oCheckConfig, "Configuration");

	});

	let oFieldEditMulti, oFieldEditSingle, oFieldDisplay, oFieldSearch;

	QUnit.module("conditions & properties", {
		beforeEach: async function() {
			FieldBaseDelegateODataDefaultTypes.enable();
			oCM = new ConditionModel();

			oFieldEditMulti = new FieldBase("F1", { editMode: FieldEditMode.Editable, conditions: "{cm>/conditions/Name}", models: {cm: oCM} });
			oFieldEditSingle = new FieldBase("F2", {
				editMode: FieldEditMode.Editable,
				conditions: "{cm>/conditions/Name}",
				maxConditions: 1,
				delegate: {name: "delegates/odata/v4/FieldBaseDelegate", payload: {x: 1}}, // to test V4 delegate
				models: {cm: oCM}
			});
			sinon.stub(oFieldEditSingle, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
			oFieldDisplay = new FieldBase("F3", { editMode: FieldEditMode.Display, conditions: "{cm>/conditions/Name}", models: {cm: oCM} });
			oFieldSearch = new FieldBase("F4", { maxConditions: 1, conditions: "{cm>/conditions/$search}", models: {cm: oCM} });
			if (!oFieldSearch.isSearchField()) {
				sinon.stub(oFieldSearch, "isSearchField").returns(true);
			}
			oFieldEditMulti.placeAt("content");
			oFieldEditSingle.placeAt("content");
			oFieldDisplay.placeAt("content");
			oFieldSearch.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			FieldBaseDelegateODataDefaultTypes.disable();
			oFieldEditMulti.destroy();
			oFieldEditSingle.destroy();
			oFieldDisplay.destroy();
			oFieldSearch.destroy();
			oFieldEditMulti = undefined;
			oFieldEditSingle = undefined;
			oFieldDisplay = undefined;
			oFieldSearch = undefined;
			oCM.destroy();
			oCM = undefined;
			FieldBase._init();
		}
	});

	QUnit.test("value", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, ["Test"], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oCondition = Condition.createCondition(OperatorName.EQ, ["bar"], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("$search", oCondition);

		const fnDone = assert.async();
		setTimeout(function() { // to update ConditionModel
			let aContent = oFieldEditMulti.getAggregation("_content");
			let oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is used");
			assert.equal(oContent.getValue && oContent.getValue(), "", "no value set on MultiInput control");
			const aTokens = oContent.getTokens ? oContent.getTokens() : [];
			assert.equal(aTokens.length, 1, "MultiInput has one Token");
			const oToken = aTokens[0];
			assert.equal(oToken && oToken.getText(), "Test", "Text on token set");

			aContent = oFieldEditSingle.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is used");
			assert.equal(oContent.getValue && oContent.getValue(), "Test", "Value set on Input control");
			assert.notOk(oFieldEditSingle._sDefaultValueHelp, "No default Field help set");

			aContent = oFieldDisplay.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.TokenizerDisplay", "sap.ui.mdc.field.TokenizerDisplay is used");
			assert.equal(oContent.getTokens && oContent.getTokens()[0].getText(), "Test", "Text set on Text control");

			aContent = oFieldSearch.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.m.SearchField", "sap.m.SearchField is used");
			assert.equal(oContent.getValue && oContent.getValue(), "bar", "value set on Searchfield control");
			assert.notOk(oFieldSearch._sDefaultValueHelp, "No default Field help set");
			fnDone();
		}, 0);

	});

	QUnit.test("description", async function(assert) {

		oFieldEditMulti.setDisplay(FieldDisplay.DescriptionValue);
		const oCondition = Condition.createCondition(OperatorName.EQ, ["Test", "Hello"]);
		oCM.addCondition("Name", oCondition);
		await nextUIUpdate();

		const fnDone = assert.async();
		setTimeout(async function() { // to update ConditionModel
			let aContent = oFieldEditMulti.getAggregation("_content");
			let oContent = aContent && aContent.length > 0 && aContent[0];
			const aTokens = oContent.getTokens ? oContent.getTokens() : [];
			const oToken = aTokens[0];
			assert.equal(oToken && oToken.getText(), "Hello (Test)", "Text on token set");

			aContent = oFieldEditSingle.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getValue && oContent.getValue(), "Test", "Value set on Input control");

			oFieldEditMulti.setDisplay(FieldDisplay.Description);
			oFieldEditSingle.setDisplay(FieldDisplay.Description);
			oFieldDisplay.setDisplay(FieldDisplay.DescriptionValue);
			await nextUIUpdate();

			// TODO should token text also belong on the property???
			aContent = oFieldEditSingle.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getValue(), "Hello", "Value set on Input control");
			aContent = oFieldDisplay.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getTokens && oContent.getTokens()[0].getText(), "Hello (Test)", "Text set on Text control");

			oFieldEditMulti.setDisplay(FieldDisplay.ValueDescription);
			oFieldEditSingle.setDisplay(FieldDisplay.ValueDescription);
			oFieldDisplay.setDisplay(FieldDisplay.ValueDescription);
			await nextUIUpdate();

			//			aContent = oFieldEditSingle.getAggregation("_content");
			//			oContent = aContent && aContent.length > 0 && aContent[0];
			//			assert.equal(oContent.getValue(), "Test", "Value set on Input control");
			aContent = oFieldDisplay.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			//					assert.equal(oContent.getText && oContent.getText(), "Test (Hello)", "Text set on Text control");
			fnDone();
		}, 0);

	});

	QUnit.test("multipleLines", async function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, ["Test"], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oFieldEditMulti.setMultipleLines(true);
		oFieldEditSingle.setMultipleLines(true);
		oFieldDisplay.setMultipleLines(true);
		await nextUIUpdate();

		const fnDone = assert.async();
		setTimeout(function() { // to update ConditionModel
			// TODO Multiline on MultiEdit????
			let aContent = oFieldEditSingle.getAggregation("_content");
			let oContent = aContent && aContent.length > 0 && aContent[0];
			assert.ok(oContent instanceof TextArea, "TextArea rendered");
			assert.equal(oContent.getValue && oContent.getValue(), "Test", "Text set on TextArea control");
			assert.equal(oContent.getRows(), 4, "Number of rows");
			const oFormatOptions = oFieldEditSingle.getFormatOptions();
			assert.ok(oFormatOptions.multipleLines, "multipleLines set on FormatOptions");

			aContent = oFieldDisplay.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.ok(oContent instanceof TokenizerDisplay, "TokenizerDisplay rendered");
			assert.equal(oContent.getTokens && oContent.getTokens()[0].getText(), "Test", "Text set on Token control");
			fnDone();
		}, 0);

	});

	QUnit.test("dataType Date", async function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, [new Date(2017, 8, 19)]);
		oCM.addCondition("Name", oCondition);
		oFieldEditMulti.setDataTypeFormatOptions({style: "long"});
		oFieldEditMulti.setDataType("sap.ui.model.type.Date");
		oFieldEditSingle.setDataTypeFormatOptions({style: "long", calendarType: "Japanese"});
		oFieldEditSingle.setDataType("sap.ui.model.type.Date");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("sap.ui.model.type.Date");

		oCondition = Condition.createCondition(OperatorName.EQ, [new Date(Date.UTC(2018, 11, 20))]);
		oCM.addCondition("Date", oCondition);
		const oFieldEditSingle2 = new FieldBase("F5", {
			editMode: FieldEditMode.Editable,
			conditions: "{cm>/conditions/Date}",
			maxConditions: 1,
			dataType: "sap.ui.model.odata.type.DateTime",
			dataTypeConstraints: {displayFormat: "Date"},
			dataTypeFormatOptions: {pattern: "dd/MM/yyyy"},
			models: {cm: oCM}
		});
		sinon.stub(oFieldEditSingle2, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oFieldEditSingle2.placeAt("content");

		// DateRangeSelection
		oCondition = Condition.createCondition(OperatorName.BT, [new Date(Date.UTC(2020, 1, 6)), new Date(Date.UTC(2020, 1, 8))]);
		oCM.addCondition("Date2", oCondition);
		const oFieldEditSingle3 = new FieldBase("F6", {
			editMode: FieldEditMode.Editable,
			conditions: "{cm>/conditions/Date2}",
			maxConditions: 1,
			dataType: "sap.ui.model.odata.type.DateTime",
			dataTypeConstraints: {displayFormat: "Date"},
			dataTypeFormatOptions: {pattern: "dd/MM/yyyy"},
			models: {cm: oCM}
		});
		sinon.stub(oFieldEditSingle3, "getSupportedOperators").callsFake(function() {return [OperatorName.BT];});
		oFieldEditSingle3.placeAt("content");

		// DynamicDateRange
		const oFieldEditSingle4 = new FieldBase("F7", {
			editMode: FieldEditMode.Editable,
			conditions: "{cm>/conditions/Date}",
			maxConditions: 1,
			dataType: "sap.ui.model.odata.type.DateTime",
			dataTypeConstraints: {displayFormat: "Date"},
			dataTypeFormatOptions: {pattern: "dd.MM.yyyy"},
			models: {cm: oCM}
		});
		oFieldEditSingle4.placeAt("content");

		// MultiInput with only EQ -> must use default help
		const oFieldEditMulti2 = new FieldBase("F8", {
			editMode: FieldEditMode.Editable,
			conditions: "{cm>/conditions/Name}",
			maxConditions: -1,
			dataType: "sap.ui.model.type.Date",
			dataTypeFormatOptions: {style: "long"},
			models: {cm: oCM}
		});
		sinon.stub(oFieldEditMulti2, "getSupportedOperators").callsFake(fnOnlyEQ); // fake only equals allowed
		oFieldEditMulti2.placeAt("content");

		oCM.checkUpdate(true, false); // to update bindings
		await nextUIUpdate();

		const fnDone = assert.async();
		sap.ui.require(["sap/ui/model/type/Date", "sap/ui/model/odata/type/DateTime"], function(aModules) { // as type-module is loaded by creating control, check after this is done
			setTimeout(async function() { // to update ConditionModel
				await nextUIUpdate();
				let aContent = oFieldEditMulti.getAggregation("_content");
				let oContent = aContent && aContent.length > 0 && aContent[0];
				let oToken = oContent && oContent.getTokens()[0];
				assert.equal(oToken.getText(), "=September 19, 2017", "Text set on Token");
				assert.ok(oContent.getShowValueHelp(), "valueHelp used");
				assert.equal(oFieldEditMulti._sDefaultValueHelp, "Field-DefineConditions-Help", "Default Field help set");

				aContent = oFieldDisplay.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "=Sep 19, 2017", "Text set on Text control");
				assert.notOk(oFieldDisplay._sDefaultValueHelp, "no Default Field help set");

				aContent = oFieldEditSingle.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent instanceof DatePicker, "DatePicker rendered");
				assert.equal(oContent.getValue(), "2017-09-19", "Value set on DatePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "September 19, 29 Heisei", "Value shown on DatePicker control");
				assert.notOk(oFieldEditSingle._sDefaultValueHelp, "no Default Field help set");

				aContent = oFieldEditSingle2.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent instanceof DatePicker, "DatePicker rendered");
				assert.equal(oContent.getValue(), "2018-12-20", "Value set on DatePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "20/12/2018", "Value shown on DatePicker control");
				assert.notOk(oFieldEditSingle2._sDefaultValueHelp, "no Default Field help set");

				// change pattern
				oFieldEditSingle2.setDataTypeFormatOptions({pattern: "yyyy/MM/dd"});
				await nextUIUpdate();
				aContent = oFieldEditSingle2.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent instanceof DatePicker, "DatePicker rendered");
				assert.equal(oContent.getValue(), "2018-12-20", "Value set on DatePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "2018/12/20", "Value shown on DatePicker control");

				// change edit mode
				oFieldEditSingle2.setEditMode(FieldEditMode.Display);
				await nextUIUpdate();
				aContent = oFieldEditSingle2.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "2018/12/20", "Text set on Text control");

				// DateRangeSelection
				aContent = oFieldEditSingle3.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent instanceof DateRangeSelection, "DateRangeSelection rendered");
				assert.equal(oContent.getValue(), "2020-02-06...2020-02-08", "Value set on DateRangeSelection control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "06/02/2020 ... 08/02/2020", "Value shown on DateRangeSelection control");
				assert.notOk(oFieldEditSingle3._sDefaultValueHelp, "no Default Field help set");

				oFieldEditSingle3.setEditMode(FieldEditMode.Display);
				await nextUIUpdate();
				aContent = oFieldEditSingle3.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "06/02/2020...08/02/2020", "Text set on Text control");

				// Input with default help
				aContent = oFieldEditSingle4.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				const oCompareValue = {
					"operator": "DATE",
					values: [UI5Date.getInstance(2018, 11, 20)] // DynamicDateRange works always with locale date
				};
				assert.ok(oContent instanceof DynamicDateRange, "DynamicDateRange rendered");
				assert.deepEqual(oContent.getValue(), oCompareValue, "Value set on DynamicDateRange control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "20.12.2018", "Value shown on DynamicDateRange control");

				oFieldEditSingle4.setEditMode(FieldEditMode.Display);
				await nextUIUpdate();
				aContent = oFieldEditSingle4.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				assert.equal(oContent.getText(), "=20.12.2018", "Text set on Text control");
				assert.notOk(oFieldEditSingle4._sDefaultValueHelp, "no Default Field help set");

				// MultiInput with only EQ -> must use default help
				aContent = oFieldEditMulti2.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				oToken = oContent && oContent.getTokens()[0];
				assert.equal(oToken.getText(), "September 19, 2017", "Text set on Token");
				assert.ok(oContent.getShowValueHelp(), "valueHelp used");
				assert.equal(oFieldEditMulti2._sDefaultValueHelp, "Field-DefineConditions-Help", "Default Field help set");

				// Input with given help
				oFieldEditSingle.setValueHelp("Test");
				oFieldEditSingle.setProperty("_valueHelpEnabled", true, true); // fake existing ValueHelp
				await nextUIUpdate();
				aContent = oFieldEditSingle.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent instanceof FieldInput, "Input rendered");
				assert.equal(oContent.getValue(), "September 19, 29 Heisei", "Value set on Input control");
				assert.ok(oContent.getShowValueHelp(), "valueHelp used");
				assert.notOk(oFieldEditSingle._sDefaultValueHelp, "no Default Field help set");

				oFieldEditSingle2.destroy();
				oFieldEditSingle3.destroy();
				oFieldEditSingle4.destroy();
				oFieldEditMulti2.destroy();
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType sap.ui.model.type.Time", async function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [new Date(1970, 0, 1, 19, 0, 0)]);
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDataType("sap.ui.model.type.Time");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("sap.ui.model.type.Time");
		await nextUIUpdate();

		const fnDone = assert.async();
		setTimeout(async function() { // to update ConditionModel
			await nextUIUpdate();
			let aContent = oFieldEditSingle.getAggregation("_content");
			let oContent = aContent && aContent.length > 0 && aContent[0];
			assert.ok(oContent instanceof TimePicker, "TimePicker rendered");
			assert.equal(oContent.getValue(), "19:00:00", "Value set on TimePicker control");
			// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
			assert.equal(jQuery(oContent.getFocusDomRef()).val(), " 7:00:00\u202fPM", "Value shown on TimePicker control");

			aContent = oFieldDisplay.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
			assert.equal(oContent.getText(), "=7:00:00\u202fPM", "Text set on Text control");
			fnDone();
		}, 0);

	});

	QUnit.test("dataType DateTimeOffset", async function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [new Date(2017, 10, 7, 13, 1, 24)]);
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDataTypeFormatOptions({pattern: "HH:mm:ss yyyy-MM-dd"});
		oFieldEditSingle.setDataType("Edm.DateTimeOffset");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("Edm.DateTimeOffset");
		await nextUIUpdate();

		const fnDone = assert.async();
		sap.ui.require(["sap/ui/model/odata/type/DateTimeOffset"], function(aModules) { // as type-module is loaded by creating control, check after this is done
			setTimeout(async function() { // to update ConditionModel
				await nextUIUpdate();
				let aContent = oFieldEditSingle.getAggregation("_content");
				let oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent instanceof DateTimePicker, "DateTimePicker rendered");
				assert.equal(oContent.getValue(), "2017-11-07T13:01:24", "Value set on DateTimePicker control");
				assert.equal(jQuery(oContent.getFocusDomRef()).val(), "13:01:24 2017-11-07", "Value shown on DateTimePicker control");

				aContent = oFieldDisplay.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
				// \u202f is a Narrow No-Break Space which has been introduced with CLDR version 43
				assert.equal(oContent.getText(), "=Nov 7, 2017, 1:01:24\u202fPM", "Text set on Text control");
				fnDone();
			}, 0);
		});

	});

	QUnit.test("dataType Boolean", async function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [true], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDisplay(FieldDisplay.Description);
		oFieldEditSingle.setDataType("Edm.Boolean");
		oFieldEditSingle.setLabel("Test");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("Edm.Boolean");
		await nextUIUpdate();

		const fnDone = assert.async();
		sap.ui.require(["sap/ui/model/odata/type/Boolean"], function(aModules) { // as type-module is loaded by creating control, check after this is done
			setTimeout(async function() { // to update ConditionModel
				await nextUIUpdate();
				setTimeout(function() { // to load delegates in ValueHelp
					let aContent = oFieldEditSingle.getAggregation("_content");
					let oContent = aContent && aContent.length > 0 && aContent[0];
					assert.ok(oContent instanceof Input, "Input rendered");
					assert.equal(oFieldEditSingle._sDefaultValueHelp, "BoolDefaultHelp", "Default Field help set");
					const oValueHelp = Element.getElementById("BoolDefaultHelp");
					assert.ok(oValueHelp && oValueHelp instanceof ValueHelp, "ValueHelp used");
					const oPopover = oValueHelp && oValueHelp.getTypeahead();
					assert.ok(oPopover, "Typeahead used in ValueHelp");
					assert.ok(oPopover && oPopover instanceof Popover, "Popover used");
					const aPopoverContent = oPopover && oPopover.getContent()[0];
					assert.ok(aPopoverContent && aPopoverContent instanceof Bool, "Bool content used");
					assert.equal(oContent.getValue(), "Yes", "Value set on Input control");
					assert.deepEqual(oValueHelp.getDelegate(), {name: "sap/ui/mdc/ValueHelpDelegate", payload: {isDefaultHelp: true}}, "base delegate used on ValueHelp");
					oFieldEditSingle.focus();
					assert.equal(oPopover.getTitle(), "", "no title on typeahead");

					aContent = oFieldDisplay.getAggregation("_content");
					oContent = aContent && aContent.length > 0 && aContent[0];
					assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
					assert.equal(oContent.getText(), "Yes", "Text set on Text control");

					// setting ValueHelp needs to remove default help
					oFieldEditSingle.setValueHelp("X");
					assert.notOk(oFieldEditSingle._sDefaultValueHelp, "No Default Field help set");

					if (oValueHelp) {
						oValueHelp.destroy(); // to initialze for next test
					}
					fnDone();
				}, 0);
			}, 0);
		});

	});

	QUnit.test("dataType Boolean, load BoolValueHelp async", async function(assert) {

		const oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/ui/mdc/valuehelp/content/Bool").onFirstCall().returns(undefined);
		oStub.callThrough();

		const oCondition = Condition.createCondition(OperatorName.EQ, [true], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDisplay(FieldDisplay.Description);
		oFieldEditSingle.setDataType("Edm.Boolean");
		oFieldDisplay.setMaxConditions(1);
		oFieldDisplay.setDataType("Edm.Boolean");
		await nextUIUpdate();

		let oValueHelp = Element.getElementById("BoolDefaultHelp");
		assert.notOk(oValueHelp, "BoolValueHelp not created sync");

		const fnDone = assert.async();
		sap.ui.require(["sap/ui/model/odata/type/Boolean"], function(aModules) { // as type-module is loaded by creating control, check after this is done
			setTimeout(async function() { // to update ConditionModel and wait for async control creation
				await nextUIUpdate();
				setTimeout(function() { // to load delegates in ValueHelp
					let aContent = oFieldEditSingle.getAggregation("_content");
					let oContent = aContent && aContent.length > 0 && aContent[0];
					assert.ok(oContent instanceof Input, "Input rendered");
					assert.equal(oFieldEditSingle._sDefaultValueHelp, "BoolDefaultHelp", "Default Field help set");
					oValueHelp = Element.getElementById("BoolDefaultHelp");
					assert.ok(oValueHelp && oValueHelp instanceof ValueHelp, "ValueHelp used");
					const oPopover = oValueHelp && oValueHelp.getTypeahead();
					assert.ok(oPopover, "Typeahead used in ValueHelp");
					assert.ok(oPopover && oPopover instanceof Popover, "Popover used");
					const aPopoverContent = oPopover && oPopover.getContent()[0];
					assert.ok(aPopoverContent && aPopoverContent instanceof Bool, "Bool content used");
					assert.equal(oContent.getValue(), "Yes", "Value set on Input control");

					aContent = oFieldDisplay.getAggregation("_content");
					oContent = aContent && aContent.length > 0 && aContent[0];
					assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
					assert.equal(oContent.getText(), "Yes", "Text set on Text control");

					if (oValueHelp) {
						oValueHelp.destroy(); // to initialze for next test
					}
					fnDone();
				}, 0);
			}, 0);
		});

		oStub.restore();

	});

	QUnit.test("dataType sap.ui.model.type.Currency", async function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [[123.45, "USD"]], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oFieldEditSingle.setDataType("sap.ui.model.type.Currency");
		oFieldEditMulti.setDataType("sap.ui.model.type.Currency");
		oFieldDisplay.setMaxConditions(1);
		sinon.stub(oFieldDisplay, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oFieldDisplay.setDataType("sap.ui.model.type.Currency");
		await nextUIUpdate();

		const fnDone = assert.async();
		let oType = new Currency({showMeasure: false});
		sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspaces and local dependend
		setTimeout(function() { // to update ConditionModel
			let aContent = oFieldEditSingle.getAggregation("_content");
			assert.equal(aContent.length, 2, "2 content controls");
			let oContent1 = aContent && aContent.length > 0 && aContent[0];
			let oContent2 = aContent && aContent.length > 1 && aContent[1];
			assert.ok(oContent1 instanceof Input, "Input rendered");
			assert.ok(oContent2 instanceof Input, "Input rendered");
			assert.equal(oContent1.getValue(), sValue, "Value set on number-Input control");
			assert.equal(oContent2.getValue(), "USD", "Value set on currency-Input control");

			aContent = oFieldEditMulti.getAggregation("_content");
			assert.equal(aContent.length, 2, "2 content controls");
			oContent1 = aContent && aContent.length > 0 && aContent[0];
			oContent2 = aContent && aContent.length > 1 && aContent[1];
			assert.ok(oContent1 instanceof MultiInput, "MultiInput rendered");
			assert.ok(oContent2 instanceof Input, "Input rendered");
			const aTokens = oContent1.getTokens ? oContent1.getTokens() : [];
			assert.equal(aTokens.length, 1, "MultiInput has one Token");
			const oToken = aTokens[0];
			assert.equal(oToken && oToken.getText(), sValue, "Text on token set");
			assert.equal(oContent2.getValue(), "USD", "Value set on currency-Input control");

			oType.destroy();
			oType = new Currency();
			sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspaces and local dependend
			aContent = oFieldDisplay.getAggregation("_content");
			assert.equal(aContent.length, 1, "1 content control");
			const oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
			assert.equal(oContent.getText(), sValue, "Text set on Text control");
			oType.destroy();
			fnDone();
		}, 0);

	});

	QUnit.test("invalid dataType", async function(assert) {

		const oSpy = sinon.spy(oFieldEditSingle.getContentFactory(), "checkDataTypeChanged");

		oFieldEditSingle.setDataType("Invalid");
		await nextUIUpdate();
		assert.ok(oSpy.calledOnce, "checkDataTypeChanged called");
		const oResult = oSpy.returnValues[0].unwrap(); // as SyncPromise is returned
		assert.ok(oResult instanceof Promise, "Promise reurned");

		const fnDone = assert.async();
		oResult.catch(function(oError) {
			assert.ok(oError, "Exception thrown");
			fnDone();
		});

	});

	QUnit.test("width", async function(assert) {

		oFieldEditMulti.setWidth("100px");
		oFieldEditSingle.setWidth("100px");
		oFieldDisplay.setWidth("100px");
		await nextUIUpdate();

		assert.equal(jQuery("#F1").width(), 100, "Width of Multi-Edit Field");
		assert.equal(jQuery("#F2").width(), 100, "Width of Single-Edit Field");
		assert.equal(jQuery("#F3").width(), 100, "Width of Display Field");

		let aContent = oFieldEditMulti.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getWidth(), "100%", "width of 100% set on MultiInput control");

		aContent = oFieldEditSingle.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getWidth(), "100%", "width of 100% set on Input control");

		// aContent = oFieldDisplay.getAggregation("_content");
		// oContent = aContent && aContent.length > 0 && aContent[0];
		// assert.equal(oContent.getWidth(), "100%", "width of 100% set on Text control");

	});

	QUnit.test("required", async function(assert) {

		const oLabel = new Label("L1", { text: "test", labelFor: oFieldEditMulti }).placeAt("content");
		oFieldEditMulti.setRequired(true);
		await nextUIUpdate();

		const aContent = oFieldEditMulti.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent.getRequired(), "Required set on Input control");
		assert.ok(oLabel.isRequired(), "Label rendered as required");

		sinon.spy(oLabel, "invalidate");
		oFieldEditMulti.setEditMode(FieldEditMode.ReadOnly);
		await nextUIUpdate();
		assert.ok(oLabel.invalidate.called, "Label invalidated"); // required for non-editable controls only removed in FormElement

		oLabel.destroy();

	});

	QUnit.test("placeholder", async function(assert) {

		oFieldEditMulti.setPlaceholder("Test");
		await nextUIUpdate();

		const aContent = oFieldEditMulti.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getPlaceholder(), "Test", "Placeholder set on MultiInput control");

	});

	QUnit.test("valueState", async function(assert) {

		oFieldEditMulti.setValueState("Error");
		oFieldEditMulti.setValueStateText("Test");
		await nextUIUpdate();

		const aContent = oFieldEditMulti.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getValueState(), "Error", "ValueState set on MultiInput control");
		assert.equal(oContent.getValueStateText(), "Test", "ValueStateText set on MultiInput control");

	});

	QUnit.test("textAlign", async function(assert) {

		oFieldEditMulti.setTextAlign("End");
		oFieldEditSingle.setTextAlign("End");
		// oFieldDisplay.setTextAlign("End");
		await nextUIUpdate();

		let aContent = oFieldEditMulti.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTextAlign(), "End", "TextAlign set on MultiInput control");

		aContent = oFieldEditSingle.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Input control");

		// aContent = oFieldDisplay.getAggregation("_content");
		// oContent = aContent && aContent.length > 0 && aContent[0];
		// assert.equal(oContent.getTextAlign(), "End", "TextAlign set on Text control");

	});

	QUnit.test("textDirection", async function(assert) {

		oFieldEditMulti.setTextDirection("RTL");
		oFieldEditSingle.setTextDirection("RTL");
		// oFieldDisplay.setTextDirection("RTL");
		await nextUIUpdate();

		let aContent = oFieldEditMulti.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on MultiInput control");

		aContent = oFieldEditSingle.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Input control");

		// aContent = oFieldDisplay.getAggregation("_content");
		// oContent = aContent && aContent.length > 0 && aContent[0];
		// assert.equal(oContent.getTextDirection(), "RTL", "TextDirection set on Text control");

	});

	QUnit.test("tooltip", async function(assert) {

		oFieldEditMulti.setTooltip("Test");
		await nextUIUpdate();

		const aContent = oFieldEditMulti.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getTooltip(), "Test", "Tooltip set on MultiInput control");

	});

	QUnit.test("tooltip with external content", async function(assert) {

		oFieldEditSingle.setTooltip("Test");
		oFieldEditSingle.setDataType("Edm.Float");
		let oSlider = new Slider("S1");
		const oConditionsType = new ConditionsType();
		oConditionsType._sId = "S1-Type"; // to identify instance
		oSlider.bindProperty("value", { path: '$field>/conditions', type: oConditionsType});
		oFieldEditSingle.setContent(oSlider);
		await nextUIUpdate();

		assert.equal(oSlider.getTooltip(), "Test", "Tooltip set on Slider control");

		oSlider.destroy();
		oSlider = new Slider("S1", {tooltip: "MyTooltip"});
		oSlider.bindProperty("value", { path: '$field>/conditions', type: oConditionsType});
		oFieldEditSingle.setContent(oSlider);
		await nextUIUpdate();

		assert.equal(oSlider.getTooltip(), "MyTooltip", "Tooltip not set on Slider control");

	});

	QUnit.test("ariaLabelledBy", async function(assert) {

		/* MultiInput */
		// initial empty
		let aContent = oFieldEditMulti.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getAriaLabelledBy().length, 0, "inner control not labelled");

		// add
		oFieldEditMulti.addAriaLabelledBy("X1");
		assert.equal(oContent.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oContent.getAriaLabelledBy()[0], "X1", "Inner control label added");
		oFieldEditMulti.addAriaLabelledBy("X2");
		assert.equal(oContent.getAriaLabelledBy().length, 2, "Inner control labelled");
		assert.equal(oContent.getAriaLabelledBy()[1], "X2", "Inner control label added");

		// remove
		oFieldEditMulti.removeAriaLabelledBy("X1");
		assert.equal(oContent.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oContent.getAriaLabelledBy()[0], "X2", "Inner control label removed");

		// remove inner controls to test initial setting
		oFieldEditMulti.destroyAggregation("_content");
		oFieldEditMulti.invalidate();
		await nextUIUpdate();
		aContent = oFieldEditMulti.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oContent.getAriaLabelledBy()[0], "X2", "Inner control label set");

		/* Input */
		// initial empty
		aContent = oFieldEditSingle.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getAriaLabelledBy().length, 0, "inner control not labelled");

		// add
		oFieldEditSingle.addAriaLabelledBy("X1");
		assert.equal(oContent.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oContent.getAriaLabelledBy()[0], "X1", "Inner control label added");
		oFieldEditSingle.addAriaLabelledBy("X2");
		assert.equal(oContent.getAriaLabelledBy().length, 2, "Inner control labelled");
		assert.equal(oContent.getAriaLabelledBy()[1], "X2", "Inner control label added");

		// remove
		oFieldEditSingle.removeAriaLabelledBy("X1");
		assert.equal(oContent.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oContent.getAriaLabelledBy()[0], "X2", "Inner control label removed");

		// remove inner controls to test initial setting
		oFieldEditSingle.destroyAggregation("_content");
		oFieldEditSingle.invalidate();
		await nextUIUpdate();
		aContent = oFieldEditSingle.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oContent.getAriaLabelledBy()[0], "X2", "Inner control label set");

		/* Text - test if ariaLabelledBy not supported breaks*/
		aContent = oFieldDisplay.getAggregation("_content");
		oContent = aContent && aContent.length > 0 && aContent[0];
		oFieldDisplay.addAriaLabelledBy("X1");
		oFieldDisplay.removeAriaLabelledBy("X1");

		/* externalContent */
		let oButton = new Button("B1");
		oButton.bindProperty("text", { path: '$field>/conditions', type: new ConditionsType() });
		oFieldEditSingle.setContent(oButton);
		await nextUIUpdate();
		assert.equal(oButton.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oButton.getAriaLabelledBy()[0], "X2", "Inner control label id");
		oFieldEditSingle.addAriaLabelledBy("X1");
		assert.equal(oButton.getAriaLabelledBy().length, 2, "Inner control labelled");
		assert.equal(oButton.getAriaLabelledBy()[1], "X1", "Inner control label added");
		oFieldEditSingle.destroyContent();

		oButton = new Button("B1");
		oButton.bindProperty("text", { path: '$field>/conditions', type: new ConditionsType() });
		oFieldEditSingle.setContentEdit(oButton);
		await nextUIUpdate();
		assert.equal(oButton.getAriaLabelledBy().length, 2, "Inner control labelled");
		assert.equal(oButton.getAriaLabelledBy()[0], "X2", "Inner control label id");
		assert.equal(oButton.getAriaLabelledBy()[1], "X1", "Inner control label id");
		oFieldEditSingle.removeAriaLabelledBy("X1");
		assert.equal(oButton.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oButton.getAriaLabelledBy()[0], "X2", "Inner control label id");
		oFieldEditSingle.destroyContentEdit();

		oButton = new Button("B1");
		oButton.bindProperty("text", { path: '$field>/conditions', type: new ConditionsType() });
		oFieldEditSingle.setEditMode(FieldEditMode.Display);
		oFieldEditSingle.setContentDisplay(oButton);
		await nextUIUpdate();
		assert.equal(oButton.getAriaLabelledBy().length, 1, "Inner control labelled");
		assert.equal(oButton.getAriaLabelledBy()[0], "X2", "Inner control label id");
		oFieldEditSingle.addAriaLabelledBy("X1");
		assert.equal(oButton.getAriaLabelledBy().length, 2, "Inner control labelled");
		assert.equal(oButton.getAriaLabelledBy()[1], "X1", "Inner control label added");
		oFieldEditSingle.destroyContentDisplay();

	});

	QUnit.module("Eventing", {
		beforeEach: async function() {
			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				models: {cm: oCM}
			});
			//			oField.attachChange(_myChangeHandler);
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			oField.attachLiveChange(_myLiveChangeHandler);
			oField.attachPress(_myPressHandler);
			oField.attachSubmit(_mySubmitHandler);
			oField.attachParseError(_myParseErrorHandler);
			oField.attachValidationError(_myValidationErrorHandler);
			oField.attachValidationSuccess(_myValidationSuccessHandler);
			Messaging.registerObject(oField, true); // to test valueState
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
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
			iSubmitCount = 0;
			sSubmitId = "";
			oSubmitPromise = null;
			iParseError = 0;
			iValidationError = 0;
			iValidationSuccess = 0;
			FieldBase._init();
		}
	});

	QUnit.test("with multi value", async function(assert) {

		const fnDone = assert.async();
		oField.setDisplay(FieldDisplay.DescriptionValue);
		await nextUIUpdate();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		let oBindingInfo = oContent && oContent.getBindingInfo("tokens");

		assert.equal(oBindingInfo && oBindingInfo.length, 10, "BindingInfo: Limit to create only 10 Tokens");
		assert.equal(oBindingInfo && oBindingInfo.startIndex, -10, "BindingInfo: StartIndex set to create last 10 Tokens");

		oContent.focus();

		oBindingInfo = oContent && oContent.getBindingInfo("tokens");
		assert.ok(oBindingInfo && !oBindingInfo.length, "BindingInfo: no limit to create only 10 Tokens");
		assert.ok(oBindingInfo && !oBindingInfo.startIndex, "BindingInfo: no StartIndex set for Tokens");

		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

		assert.equal(iCount, 1, "change event fired once");
		assert.equal(iParseError, 0, "ParseError event not fired");
		assert.equal(iValidationError, 0, "ValidationError event not fired");
		assert.equal(iValidationSuccess, 1, "ValidationSuccess event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, "X", "change event value");
		assert.ok(bValid, "change event valid");
		assert.ok(oPromise, "Promise returned");
		assert.equal(iSubmitCount, 1, "submit event fired once");
		assert.equal(sSubmitId, "F1", "submit event fired on Field");
		assert.ok(oSubmitPromise, "submit: Promise returned");
		oPromise.then(function(vResult) {
			assert.ok(vResult, "Promise resolved");
			let aConditions = oCM.getConditions("Name");
			assert.deepEqual(vResult, aConditions, "Promise result");
			assert.equal(aConditions.length, 1, "one condition in Codition model");
			assert.equal(aConditions[0].values[0], "X", "condition value");
			assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
			let aTokens = oContent.getTokens ? oContent.getTokens() : [];
			assert.equal(aTokens.length, 1, "MultiInput has one Token");
			let oToken = aTokens[0];
			assert.equal(oToken && oToken.getText(), "=X", "Text on token set");

			oSubmitPromise.then(function(vResult) {
				assert.ok(vResult, "submit: Promise resolved");
				assert.deepEqual(vResult, aConditions, "submit: Promise result");

				iCount = 0; sId = ""; sValue = ""; bValid = undefined; oPromise = undefined;
				iSubmitCount = 0; sSubmitId = ""; oSubmitPromise = undefined;
				iParseError = 0; iValidationError = 0; iValidationSuccess = 0;
				jQuery(oContent.getFocusDomRef()).val("X");
				qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
				setTimeout(function() { // to wait for valueStateMessage in IE (otherwise it fails after control destroyed)
					assert.equal(iCount, 1, "change event fired");
					assert.equal(iParseError, 1, "ParseError event fired once");
					assert.equal(iValidationError, 0, "ValidationError event not fired");
					assert.equal(iValidationSuccess, 0, "ValidationSuccess event not fired");
					assert.notOk(bValid, "change event not valid");
					assert.equal(sValue, "X", "change event value");
					assert.ok(oPromise, "Promise returned");
					assert.equal(iSubmitCount, 1, "submit event fired once");
					assert.equal(sSubmitId, "F1", "submit event fired on Field");
					assert.ok(oSubmitPromise, "submit: Promise returned");
					oPromise.then(function(vResult) {
						assert.notOk(true, "Promise must not be resolved");
						fnDone();
					}).catch(function(oException) {
						const oTokenDeleteIcon = oToken.getAggregation("deleteIcon");
						assert.ok(true, "Promise rejected");
						assert.ok(oException instanceof ParseException, "ParseExpetion returned");
						aConditions = oCM.getConditions("Name");
						assert.equal(aConditions.length, 1, "one condition in Codition model");
						assert.equal(aConditions[0].values[0], "X", "condition value");
						assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
						aTokens = oContent.getTokens ? oContent.getTokens() : [];
						assert.equal(aTokens.length, 1, "MultiInput has one Token");
						oToken = aTokens[0];
						assert.equal(oToken && oToken.getText(), "=X", "Text on token set");

						oSubmitPromise.then(function(vResult) {
							assert.notOk(true, "submit: Promise must not be resolved");
							fnDone();
						}).catch(function(oException) {
							assert.ok(true, "submit: Promise rejected");

							// delete Token
							iCount = 0; sId = ""; sValue = ""; bValid = undefined; oPromise = undefined;
							iSubmitCount = 0; sSubmitId = ""; oSubmitPromise = undefined;
							oTokenDeleteIcon.firePress();
							assert.equal(iCount, 1, "change event fired once");
							assert.equal(sId, "F1", "change event fired on Field");
							assert.equal(sValue, "", "change event value");
							assert.ok(bValid, "change event valid");
							assert.ok(oPromise, "Promise returned");
							assert.equal(iSubmitCount, 0, "submit event not fired");
							oPromise.then(function(vResult) {
								assert.ok(vResult, "Promise resolved");
								aConditions = oCM.getConditions("Name");
								assert.deepEqual(vResult, aConditions, "Promise result");
								assert.equal(aConditions.length, 0, "no condition in Codition model after delete Token");
								aTokens = oContent.getTokens ? oContent.getTokens() : [];
								assert.equal(aTokens.length, 0, "MultiInput has no Token after delete");

								//simulate liveChange by calling from internal control
								oContent.fireLiveChange({ value: "Y" });
								assert.equal(iLiveCount, 1, "liveChange event fired once");
								assert.equal(sLiveId, "F1", "liveChange event fired on Field");
								assert.equal(sLiveValue, "Y", "liveChange event value");
								fnDone();
							});
						});
					});
				}, 0);
			});
		});

	});

	QUnit.test("with multi value and maxConditions", async function(assert) {

		oField.setMaxConditions(2);
		const oCondition = Condition.createCondition(OperatorName.EQ, ["Test"]);
		oCM.addCondition("Name", oCondition);
		await nextUIUpdate();

		const fnDone = assert.async();
		setTimeout(function() { // to update ConditionModel
			const aContent = oField.getAggregation("_content");
			const oContent = aContent && aContent.length > 0 && aContent[0];
			oContent.focus();
			jQuery(oContent.getFocusDomRef()).val("X");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.ok(bValid, "change event valid");
			let aConditions = oCM.getConditions("Name");
			assert.equal(aConditions.length, 2, "two conditions in Codition model");
			assert.equal(aConditions[0].values[0], "Test", "first condition value");
			assert.equal(aConditions[0].operator, OperatorName.EQ, "first condition operator");
			assert.equal(aConditions[1].values[0], "X", "second condition value");
			assert.equal(aConditions[1].operator, OperatorName.EQ, "second condition operator");
			let aTokens = oContent.getTokens ? oContent.getTokens() : [];
			assert.equal(aTokens.length, 2, "MultiInput has two Tokens");
			let oToken = aTokens[1];
			assert.equal(oToken && oToken.getText(), "=X", "Text on token set");

			iCount = 0;
			sId = ""; sValue = ""; bValid = false;
			jQuery(oContent.getFocusDomRef()).val("Y");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.ok(bValid, "change event valid");
			aConditions = oCM.getConditions("Name");
			assert.equal(aConditions.length, 2, "two conditions in Codition model");
			assert.equal(aConditions[0].values[0], "X", "first condition value");
			assert.equal(aConditions[0].operator, OperatorName.EQ, "first condition operator");
			assert.equal(aConditions[1].values[0], "Y", "second condition value");
			assert.equal(aConditions[1].operator, OperatorName.EQ, "second condition operator");
			aTokens = oContent.getTokens ? oContent.getTokens() : [];
			assert.equal(aTokens.length, 2, "MultiInput has two Tokens");
			oToken = aTokens[0];
			assert.equal(oToken && oToken.getText(), "=X", "Text on token set");
			oToken = aTokens[1];
			assert.equal(oToken && oToken.getText(), "=Y", "Text on token set");
			fnDone();
		}, 0);

	});

	QUnit.test("wrong input on multi value", async function(assert) {

		oField.setDataTypeConstraints({maximum: 10});
		oField.setDataType("sap.ui.model.type.Integer");
		await nextUIUpdate();

		const fnDone = assert.async();
		let aContent = oField.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("15");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		setTimeout(async function() { // to wait for valueStateMessage in IE (otherwise it fails after control destroyed)
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(iParseError, 0, "ParseError event not fired");
			assert.equal(iValidationError, 1, "ValidationError event fired once");
			assert.equal(iValidationSuccess, 0, "ValidationSuccess event not fired");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.equal(sValue, "15", "change event value");
			assert.notOk(bValid, "change event not valid");
			assert.ok(oPromise, "Promise returned");
			const aConditions = oCM.getConditions("Name");
			assert.equal(aConditions.length, 0, "no condition in Codition model");
			const aTokens = oContent.getTokens ? oContent.getTokens() : [];
			assert.equal(aTokens.length, 0, "MultiInput has no Token");
			assert.equal(jQuery(oContent.getFocusDomRef()).val(), "15", "Value still in Input");
			assert.equal(oContent.getValueState(), "Error", "ValueState set on inner Control");
			assert.equal(oField.getValueState(), "Error", "ValueState set on Field");

			// on switch to display mode error must be removed (as wrong input is not stored)
			oField.setEditMode(FieldEditMode.Display);
			await nextUIUpdate();
			assert.equal(oField.getValueState(), "None", "ValueState on Field after switch to display mode"); // no check on inner control as it has no valueState property
			aContent = oField.getAggregation("_content");
			// eslint-disable-next-line require-atomic-updates
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getTokens().length, 0, "No tokens in content control");

			oPromise.then(function(vResult) {
				assert.notOk(true, "Promise must not be resolved");
				fnDone();
			}).catch(function(oException) {
				assert.ok(true, "Promise must be rejected");
				assert.ok(oException instanceof ValidateException, "ValidateExpetion returned");
				fnDone();
			});
		}, 0);

	});

	QUnit.test("wrong input on multi value without ConditionModel", async function(assert) {

		oField.destroy();
		oField = new FieldBase("F1", {
			dataTypeConstraints: {maximum: 10},
			dataType: "sap.ui.model.type.Integer",
			models: {cm: oCM}
		}).placeAt("content");
		oField.fireChangeEvent = _myFireChange;
		oField.attachEvent("change", _myChangeHandler);
		oField.attachParseError(_myParseErrorHandler);
		oField.attachValidationError(_myValidationErrorHandler);
		oField.attachValidationSuccess(_myValidationSuccessHandler);
		Messaging.registerObject(oField, true); // to test valueState
		await nextUIUpdate();

		const fnDone = assert.async();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("15");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		setTimeout(function() { // to wait for valueStateMessage in IE (otherwise it fails after control destroyed)
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(iParseError, 0, "ParseError event not fired");
			assert.equal(iValidationError, 1, "ValidationError event fired once");
			assert.equal(iValidationSuccess, 0, "ValidationSuccess event not fired");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.equal(sValue, "15", "change event value");
			assert.notOk(bValid, "change event not valid");
			const aConditions = oField.getConditions();
			assert.equal(aConditions.length, 0, "no conditions");
			assert.equal(jQuery(oContent.getFocusDomRef()).val(), "15", "Value still in Input");
			assert.equal(oField.getValueState(), "Error", "ValueState set on Field");
			assert.equal(oContent.getValueState(), "Error", "ValueState set on inner Content");

			fnDone();
		}, 0);

	});

	QUnit.test("empty input on multi value with not nullable type", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake only equals allowed
		oField.setDataTypeConstraints({nullable: false});
		oField.setDataType("sap.ui.model.odata.type.String");
		await nextUIUpdate();

		const fnDone = assert.async();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		sinon.spy(oField._oContentFactory._oConditionType, "parseValue");
		sinon.spy(oField._oContentFactory._oConditionType, "validateValue");

		oContent.focus();
		oContent.fireChange({ value: "" }); // simulate clear value after invalid input
		setTimeout(function() { // to wait for valueStateMessage in IE (otherwise it fails after control destroyed)
			assert.ok(oField._oContentFactory._oConditionType.parseValue.notCalled, "ConditionType parseValue not used");
			assert.ok(oField._oContentFactory._oConditionType.validateValue.notCalled, "ConditionType validateValue not used");
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.equal(sValue, undefined, "change event value");
			assert.ok(bValid, "change event valid");
			const aConditions = oField.getConditions();
			assert.equal(aConditions.length, 0, "no conditions");
			assert.equal(oField.getValueState(), "None", "ValueState not set on Field");

			fnDone();
		}, 0);

	});

	QUnit.test("with single value", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, "X", "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(iSubmitCount, 1, "submit event fired once");
		assert.equal(sSubmitId, "F1", "submit event fired on Field");
		assert.ok(oSubmitPromise, "submit: Promise returned");
		let aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0], "X", "condition value");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");

		//simulate liveChange by calling from internal control
		oContent.fireLiveChange({ value: "Y" });
		assert.equal(iLiveCount, 1, "liveChange event fired once");
		assert.equal(sLiveId, "F1", "liveChange event fired on Field");
		assert.equal(sLiveValue, "Y", "liveChange event value");

		// clear value
		iCount = 0;
		sId = "";
		sValue = undefined;
		jQuery(oContent.getFocusDomRef()).val("");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.notOk(sValue, "change event value");
		assert.ok(bValid, "change event valid");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 0, "no condition in Codition model");

	});

	QUnit.test("with single value and free condtitions", async function(assert) {

		oField.setMaxConditions(1);
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, "X", "change event value");
		assert.ok(bValid, "change event valid");
		const aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "X", "condition value");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(oContent.getValue(), "=X", "Condition is displayed with operator");

	});

	QUnit.test("with single value and dataType sap.ui.model.type.Currency", async function(assert) {

		oField.setDataType("sap.ui.model.type.Currency");
		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		const oContent2 = aContent && aContent.length > 1 && aContent[1];
		oContent1.focus();
		jQuery(oContent1.getFocusDomRef()).val("1.11");
		oContent2.focus();
		jQuery(oContent2.getFocusDomRef()).val("EUR");
		qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.ok(Array.isArray(sValue), "change event value is array");
		assert.equal(sValue[0], 1.11, "change event value0");
		assert.equal(sValue[1], "EUR", "change event value1");
		assert.ok(bValid, "change event valid");
		const aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.ok(aConditions[0] && Array.isArray(aConditions[0].values), "condition value is array");
		assert.equal(aConditions[0] && aConditions[0].values[0][0], 1.11, "condition value0");
		assert.equal(aConditions[0] && aConditions[0].values[0][1], "EUR", "condition value1");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition operator");

	});

	QUnit.test("with multi value and dataType sap.ui.model.type.Currency", async function(assert) {

		oField.setDataType("sap.ui.model.type.Currency");
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		const oContent2 = aContent && aContent.length > 1 && aContent[1];
		oContent1.focus();
		jQuery(oContent1.getFocusDomRef()).val("1.11");
		oContent2.focus();
		jQuery(oContent2.getFocusDomRef()).val("EUR");
		qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired twice");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.ok(Array.isArray(sValue), "change event value is array");
		assert.equal(sValue[0], 1.11, "change event value0");
		assert.equal(sValue[1], "EUR", "change event value1");
		assert.ok(bValid, "change event valid");
		let aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.ok(aConditions[0] && Array.isArray(aConditions[0].values), "condition value is array");
		assert.equal(aConditions[0] && aConditions[0].values[0][0], 1.11, "condition value-number");
		assert.equal(aConditions[0] && aConditions[0].values[0][1], "EUR", "condition value-unit");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition operator");

		iCount = 0;
		sId = undefined;
		sValue = undefined;
		oContent1.focus();
		jQuery(oContent1.getFocusDomRef()).val("1...3");
		qutils.triggerKeydown(oContent1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.ok(bValid, "change event valid");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 2, "two conditions in Codition model");
		assert.ok(aConditions[1] && Array.isArray(aConditions[1].values), "condition value is array");
		assert.equal(aConditions[1] && aConditions[1].values[0][0], 1, "condition value0-number");
		assert.equal(aConditions[1] && aConditions[1].values[0][1], "EUR", "condition value0-unit");
		assert.equal(aConditions[1] && aConditions[1].values[1][0], 3, "condition value1-number");
		assert.equal(aConditions[1] && aConditions[1].values[1][1], "EUR", "condition value1-unit");
		assert.equal(aConditions[1] && aConditions[1].operator, OperatorName.BT, "condition operator");

		iCount = 0;
		sId = undefined;
		sValue = undefined;
		oContent2.focus();
		jQuery(oContent2.getFocusDomRef()).val("USD");
		qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.ok(bValid, "change event valid");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 2, "two conditions in Codition model");
		assert.ok(aConditions[0] && Array.isArray(aConditions[0].values), "condition1 value is array");
		assert.equal(aConditions[0] && aConditions[0].values[0][0], 1.11, "condition1 value-number");
		assert.equal(aConditions[0] && aConditions[0].values[0][1], "USD", "condition1 value-unit");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition1 operator");
		assert.ok(aConditions[1] && Array.isArray(aConditions[1].values), "condition2 value is array");
		assert.equal(aConditions[1] && aConditions[1].values[0][0], 1, "condition2 value0-number");
		assert.equal(aConditions[1] && aConditions[1].values[0][1], "USD", "condition2 value0-unit");
		assert.equal(aConditions[1] && aConditions[1].values[1][0], 3, "condition2 value1-number");
		assert.equal(aConditions[1] && aConditions[1].values[1][1], "USD", "condition2 value1-unit");
		assert.equal(aConditions[1] && aConditions[1].operator, OperatorName.BT, "condition2 operator");

	});

	QUnit.test("wrong input on single value", async function(assert) {

		oField.setDataTypeConstraints({maximum: 10});
		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setDataType("sap.ui.model.type.Integer");
		oField.setMaxConditions(1);
		await nextUIUpdate();

		const fnDone = assert.async();
		let aContent = oField.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("15");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		setTimeout(async function() { // to wait for valueStateMessage in IE (otherwise it fails after control destroyed)
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.equal(sValue, "15", "change event value");
			assert.notOk(bValid, "change event not valid");
			assert.ok(oPromise, "Promise returned");
			assert.equal(iSubmitCount, 1, "submit event fired once");
			assert.equal(sSubmitId, "F1", "submit event fired on Field");
			assert.ok(oSubmitPromise, "submit: Promise returned");
			const aConditions = oCM.getConditions("Name");
			assert.equal(aConditions.length, 0, "no condition in Codition model");
			assert.equal(jQuery(oContent.getFocusDomRef()).val(), "15", "Value still in Input");
			assert.equal(iValidationError, 1, "ValidationError fired");
			assert.equal(oField.getValueState(), "Error", "ValueState on Field");
			assert.equal(oContent.getValueState(), "Error", "ValueState on Content");

			// on switch to display mode error must be removed (as wrong input is not stored)
			oField.setEditMode(FieldEditMode.Display);
			await nextUIUpdate();
			assert.equal(oField.getValueState(), "None", "ValueState after switch to display mode");
			aContent = oField.getAggregation("_content");
			// eslint-disable-next-line require-atomic-updates
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getText(), "", "Text in content control");

			oPromise.then(function(vResult) {
				assert.notOk(true, "Promise must not be resolved");
				fnDone();
			}).catch(function(oException) {
				assert.ok(true, "Promise must be rejected");
				oSubmitPromise.then(function(vResult) {
					assert.notOk(true, "submit: Promise must not be resolved");
					fnDone();
				}).catch(function(oException) {
					assert.ok(true, "submit: Promise rejected");
					fnDone();
				});
			});
		}, 0);

	});

	QUnit.test("empty input on single value with not nullable type", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake only equals allowed
		oField.setDataTypeConstraints({nullable: false});
		oField.setDataType("sap.ui.model.odata.type.String");
		oField.setMaxConditions(1);
		await nextUIUpdate();

		const fnDone = assert.async();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];

		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X"); // set something before it can be cleared
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

		sinon.spy(oField._oContentFactory._oConditionsType, "parseValue");
		sinon.spy(oField._oContentFactory._oConditionsType, "validateValue");
		iCount = 0;
		sId = undefined;
		sValue = undefined;
		bValid = undefined;
		jQuery(oContent.getFocusDomRef()).val("");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		setTimeout(function() { // to wait for valueStateMessage in IE (otherwise it fails after control destroyed)
			assert.ok(oField._oContentFactory._oConditionsType.parseValue.called, "ConditionsType parseValue used");
			assert.ok(oField._oContentFactory._oConditionsType.validateValue.called, "ConditionsType validateValue used");
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.equal(sValue, "", "change event value");
			assert.notOk(bValid, "change event not valid");
			const aConditions = oField.getConditions();
			assert.equal(aConditions.length, 1, "one conditions (from prevoius value)");
			assert.equal(iValidationError, 1, "ValidationError fired");

			fnDone();
		}, 0);

	});

	QUnit.test("with SearchField", async function(assert) {

		oField.setMaxConditions(1);
		oField.bindProperty("conditions", {path: "cm>/conditions/$search"});
		if (!oField.isSearchField()) {
			sinon.stub(oField, "isSearchField").returns(true);
		}
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyup(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, "X", "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(iSubmitCount, 1, "submit event fired once");
		assert.equal(sSubmitId, "F1", "submit event fired on Field");
		assert.ok(oSubmitPromise, "submit: Promise returned");
		let aConditions = oCM.getConditions("$search");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "X", "condition value");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.Contains, "condition operator");

		iCount = 0; sId = undefined; sValue = undefined; bValid = undefined;
		iSubmitCount = 0; sSubmitId = ""; oSubmitPromise = undefined;
		qutils.triggerTouchEvent("touchend", oContent.getId() + "-search");
		assert.equal(iCount, 0, "change event not fired");
		assert.equal(iSubmitCount, 1, "submit event fired once");
		assert.equal(sSubmitId, "F1", "submit event fired on Field");
		assert.ok(oSubmitPromise, "submit: Promise returned");
		assert.equal(aConditions, oCM.getConditions("$search"), "Conditions not changed");

		//simulate change by calling from internal control
		iCount = 0; sId = undefined; sValue = undefined; bValid = undefined;
		iSubmitCount = 0; sSubmitId = ""; oSubmitPromise = undefined;
		oContent.fireChange({ value: "Y" });
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, "Y", "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(iSubmitCount, 0, "submit event not fired ");
		aConditions = oCM.getConditions("$search");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "Y", "condition value");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.Contains, "condition operator");

		//simulate liveChange by calling from internal control
		oContent.fireLiveChange({ newValue: "Z" });
		assert.equal(iLiveCount, 1, "liveChange event fired once");
		assert.equal(sLiveId, "F1", "liveChange event fired on Field");
		assert.equal(sLiveValue, "Z", "liveChange event value");

	});

	QUnit.test("with external content single value", async function(assert) {

		const fnDone = assert.async();
		const oCondition = Condition.createCondition(OperatorName.EQ, [70]);
		oCM.addCondition("Name", oCondition);
		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		const oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType()});
		oField.setContent(oSlider);
		await nextUIUpdate();

		sap.ui.require(["sap/ui/model/odata/type/Single"], function(aModules) { // as type-module is loaded by creating control, check after this is done
			setTimeout(async function() { // to update ConditionModel
				assert.ok(!!oSlider.getDomRef(), "Slider is rendered");
				if (oSlider.getDomRef()) {
					oSlider.focus();
					qutils.triggerKeydown(oSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
					assert.equal(iCount, 1, "change event fired once");
					assert.equal(sId, "F1", "change event fired on Field");
					assert.equal(sValue, 71, "change event value");
					assert.ok(bValid, "change event valid");
					const aConditions = oCM.getConditions("Name");
					assert.equal(aConditions.length, 1, "one condition in Codition model");
					assert.equal(aConditions[0].values[0], 71, "condition value");
					assert.equal(iLiveCount, 1, "liveChange event fired once");
					assert.equal(sLiveId, "F1", "liveChange event fired on Field");
					assert.equal(sLiveValue, 71, "liveChange event value");

					qutils.triggerKeydown(oSlider.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
					assert.equal(iSubmitCount, 1, "submit event fired once");
					assert.equal(sSubmitId, "F1", "submit event fired on Field");
					assert.ok(oSubmitPromise, "submit: Promise returned");

					const oButton = new Button("B1");
					oButton.bindProperty("text", { path: '$field>/conditions', type: new ConditionsType() });
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
				}
				fnDone();
			}, 0);
		});

	});

	QUnit.test("with external content multi value", async function(assert) {

		const fnDone = assert.async();
		const oToken = new Token("T1");
		const oConditionType = new ConditionType();
		oToken.bindProperty("text", { path: '$field>', type: oConditionType});
		const oMultiInput = new MultiInput("MI1");
		oMultiInput.bindAggregation("tokens", { path: '$field>/conditions', template: oToken });
		oField.setContentEdit(oMultiInput);
		let oCondition = Condition.createCondition(OperatorName.EQ, ["A"], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oCondition = Condition.createCondition(OperatorName.EQ, ["B"], undefined, undefined, ConditionValidated.Validated);
		oCM.addCondition("Name", oCondition);
		oField.placeAt("content");
		await nextUIUpdate();

		setTimeout(function() { // to update ConditionModel
			assert.ok(oMultiInput.getDomRef(), "Tokenizer is rendered");
			let aTokens = oMultiInput.getTokens();
			assert.equal(aTokens.length, 2, "Tokenizer has 2 tokens");

			// simulate deletion of token
			aTokens[0].fireDelete();
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.equal(sValue, "B", "change event value");
			assert.ok(bValid, "change event valid");
			assert.ok(oPromise, "Promise returned");
			assert.equal(iSubmitCount, 0, "submit event not fired");
			oPromise.then(function(vResult) {
				assert.ok(vResult, "Promise resolved");
				const aConditions = oCM.getConditions("Name");
				assert.deepEqual(vResult, aConditions, "Promise result");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0].values[0], "B", "condition value");
				assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
				aTokens = oMultiInput.getTokens();
				assert.equal(aTokens.length, 1, "Tokenizer has one Token");
				assert.equal(aTokens[0].getText(), "B", "Text of Token0");

				fnDone();
			});
		}, 0);

	});

	QUnit.test("with type currency", async function(assert) {

		oField.setDataType("sap.ui.model.type.Currency");
		const oCondition = Condition.createCondition(OperatorName.EQ, [[123.45, "USD"]], undefined, undefined, ConditionValidated.NotValidated, {payload: "X"});
		oField.setConditions([oCondition]);
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		oContent1.focus();
		let aTokens = oContent1.getTokens ? oContent1.getTokens() : [];
		assert.equal(aTokens.length, 1, "MultiInput has one Token");
		let oTokenDeleteIcon;
		const oToken = aTokens[0];

		// delete Token
		if (oToken) {
			iCount = 0;
			sId = ""; sValue = ""; bValid = false;
			oTokenDeleteIcon = oToken.getAggregation("deleteIcon");
			oTokenDeleteIcon.firePress();
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.deepEqual(sValue, [undefined, "USD"], "change event value");
			assert.ok(bValid, "change event valid");
			const aConditions = oField.getConditions();
			assert.equal(aConditions.length, 1, "one dummy condition in Codition model after delete Token");
			assert.equal(aConditions[0].values[0][0], undefined, "condition value0");
			assert.equal(aConditions[0].values[0][1], "USD", "condition value1");
			assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
			assert.deepEqual(aConditions[0].payload, {payload: "X"}, "condition payload");
			aTokens = oContent1.getTokens ? oContent1.getTokens() : [];
			assert.equal(aTokens.length, 0, "MultiInput has no Token after delete");
		}

	});

	QUnit.test("wrong input with type currency", async function(assert) {

		oField.setDataType("sap.ui.model.type.Currency");
		const oCondition = Condition.createCondition(OperatorName.EQ, [[123.45, "USD"]], undefined, undefined, ConditionValidated.NotValidated, {payload: "X"});
		oField.setConditions([oCondition]);
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		const oContent2 = aContent && aContent.length > 0 && aContent[1];
		oContent1.focus();

		const fnDone = assert.async();
		jQuery(oContent1.getFocusDomRef()).val("A");
		qutils.triggerKeydown(oContent1.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		setTimeout(function() { // to wait to update ValueState via binding
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			// assert.equal(sValue, "A", "change event value");
			assert.notOk(bValid, "change event not valid");
			assert.ok(oPromise, "Promise returned");
			assert.equal(iSubmitCount, 1, "submit event fired once");
			assert.equal(sSubmitId, "F1", "submit event fired on Field");
			assert.ok(oSubmitPromise, "submit: Promise returned");
			const aConditions = oCM.getConditions("Name");
			assert.equal(aConditions.length, 1, "old condition still in Codition model");
			assert.equal(jQuery(oContent1.getFocusDomRef()).val(), "A", "Value still in Input");
			assert.equal(iParseError, 1, "PartseError fired");
			assert.equal(oField.getValueState(), "Error", "ValueState on Field");
			assert.equal(oContent1.getValueState(), "Error", "ValueState on Content1");
			assert.equal(oContent1.getValueStateText(), oField.getValueStateText(), "ValueStateText on Content1");
			assert.equal(oContent2.getValueState(), "None", "No ValueState on Content2");
			assert.equal(oContent2.getValueStateText(), "", "No ValueStateText on Content2");

			oPromise.then(function(vResult) {
				assert.notOk(true, "Promise must not be resolved");
				fnDone();
			}).catch(function(oException) {
				assert.ok(true, "Promise must be rejected");
				oSubmitPromise.then(function(vResult) {
					assert.notOk(true, "submit: Promise must not be resolved");
					fnDone();
				}).catch(function(oException) {
					assert.ok(true, "submit: Promise rejected");

					// currency part
					iCount = 0; sId = ""; sValue = ""; bValid = undefined; oPromise = undefined;
					iSubmitCount = 0; sSubmitId = ""; oSubmitPromise = undefined;
					iParseError = 0; iValidationError = 0; iValidationSuccess = 0;
					jQuery(oContent2.getFocusDomRef()).val("B");
					qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
					setTimeout(function() { // to wait to update ValueState via binding
						assert.equal(iCount, 1, "change event fired once");
						assert.equal(sId, "F1", "change event fired on Field");
						// assert.equal(sValue, "A", "change event value");
						assert.notOk(bValid, "change event not valid");
						assert.ok(oPromise, "Promise returned");
						assert.equal(iSubmitCount, 1, "submit event fired once");
						assert.equal(sSubmitId, "F1", "submit event fired on Field");
						assert.ok(oSubmitPromise, "submit: Promise returned");
						const aConditions = oCM.getConditions("Name");
						assert.equal(aConditions.length, 1, "old condition still in Codition model");
						assert.equal(jQuery(oContent1.getFocusDomRef()).val(), "A", "Value still in Input1");
						assert.equal(jQuery(oContent2.getFocusDomRef()).val(), "B", "Value still in Input2");
						assert.equal(iParseError, 1, "PartseError fired");
						assert.equal(oField.getValueState(), "Error", "ValueState on Field");
						assert.equal(oContent1.getValueState(), "Error", "ValueState on Content1");
						assert.notEqual(oContent1.getValueStateText(), oField.getValueStateText(), "ValueStateText on Content1");
						assert.equal(oContent2.getValueState(), "Error", "ValueState on Content2");
						assert.equal(oContent2.getValueStateText(), oField.getValueStateText(), "ValueStateText on Content2");

						oPromise.then(function(vResult) {
							assert.notOk(true, "Promise must not be resolved");
							fnDone();
						}).catch(function(oException) {
							assert.ok(true, "Promise must be rejected");
							oSubmitPromise.then(function(vResult) {
								assert.notOk(true, "submit: Promise must not be resolved");
								fnDone();
							}).catch(function(oException) {
								assert.ok(true, "submit: Promise rejected");

								// updating condition must remove value state
								let oCondition = Condition.createCondition(OperatorName.EQ, [[234, "USD"]], undefined, undefined, ConditionValidated.NotValidated, {payload: "X"});
								oField.setConditions([oCondition]);
								setTimeout(function() { // to wait to update ValueState via binding
									assert.equal(oField.getValueState(), "None", "No ValueState after updating condition");
									assert.equal(oField.getValueStateText(), "", "No ValueStateText on Field");
									assert.equal(oContent1.getValueState(), "None", "No ValueState on Content1");
									assert.equal(oContent1.getValueStateText(), "", "No ValueStateText on Content1");
									assert.equal(oContent2.getValueState(), "None", "No ValueState on Content2");
									assert.equal(oContent2.getValueStateText(), "", "No ValueStateText on Content2");

									// setting ValueStae from outside should show it on both Fields
									oField.setValueState("Warning");
									oField.setValueStateText("My Warning");
									setTimeout(function() { // to wait to update ValueState via binding
										assert.equal(oField.getValueState(), "Warning", "ValueState after updating condition");
										assert.equal(oField.getValueStateText(), "My Warning", "ValueStateText on Field");
										assert.equal(oContent1.getValueState(), "Warning", "ValueState on Content1");
										assert.equal(oContent1.getValueStateText(), "My Warning", "ValueStateText on Content1");
										assert.equal(oContent2.getValueState(), "Warning", "ValueState on Content2");
										assert.equal(oContent2.getValueStateText(), "My Warning", "ValueStateText on Content2");

										// updating conditions should not reset value state from outside
										oCondition = Condition.createCondition(OperatorName.EQ, [[567, "USD"]], undefined, undefined, ConditionValidated.NotValidated, {payload: "X"});
										oField.setConditions([oCondition]);
										setTimeout(function() { // to wait to update ValueState via binding
											assert.equal(oField.getValueState(), "Warning", "ValueState after updating condition");
											assert.equal(oField.getValueStateText(), "My Warning", "ValueStateText on Field");
											assert.equal(oContent1.getValueState(), "Warning", "ValueState on Content1");
											assert.equal(oContent1.getValueStateText(), "My Warning", "ValueStateText on Content1");
											assert.equal(oContent2.getValueState(), "Warning", "ValueState on Content2");
											assert.equal(oContent2.getValueStateText(), "My Warning", "ValueStateText on Content2");

											fnDone();
										});
									});
								});
							});
						});
					}, 0);
				});
			});
		}, 0);

	});

	QUnit.test("pasting multiple values", async function(assert) {

		const fnDone = assert.async();
		oField.setDisplay(FieldDisplay.DescriptionValue);
		await nextUIUpdate();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();

		const sPastedValues = "AA\nBB\nCC";
		// var sPastedValues = "AA\nBB\nC	D\nEE";
		const oFakeClipboardData = {
				getData: function() {
					return sPastedValues;
				}
		};

		if (window.clipboardData) {
			window.clipboardData.setData("text", sPastedValues);
		}

		qutils.triggerEvent("paste", oContent.getFocusDomRef(), {clipboardData: oFakeClipboardData});

		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.equal(sValue, undefined, "change event value");
		assert.equal(bValid, undefined, "change event valid-state not known");
		assert.ok(oPromise, "Promise returned");
		assert.equal(iSubmitCount, 0, "submit event not fired");
		oPromise.then(function(vResult) {
			assert.ok(vResult, "Promise resolved");
			const aConditions = oField.getConditions();
			assert.deepEqual(vResult, aConditions, "Promise returns same conditions like Field has set");
			assert.equal(aConditions.length, 3, "Three conditions returned");
			assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
			assert.equal(aConditions[0].values[0], "AA", "condition value");
			assert.equal(aConditions[1].operator, OperatorName.EQ, "condition operator");
			assert.equal(aConditions[1].values[0], "BB", "condition value");
			assert.equal(aConditions[2].operator, OperatorName.EQ, "condition operator");
			assert.equal(aConditions[2].values[0], "CC", "condition value");
			const aTokens = oContent.getTokens ? oContent.getTokens() : [];
			assert.equal(aTokens.length, 3, "MultiInput has three Tokens");
			let oToken = aTokens[0];
			assert.equal(oToken && oToken.getText(), "=AA", "Text on token set");
			oToken = aTokens[1];
			assert.equal(oToken && oToken.getText(), "=BB", "Text on token set");
			oToken = aTokens[2];
			assert.equal(oToken && oToken.getText(), "=CC", "Text on token set");
			setTimeout(function() { // as parsing is async (in PasteHandler) validation is called async too
				assert.equal(iParseError, 0, "ParseError event not fired");
				assert.equal(iValidationError, 0, "ValidationError event not fired");
				assert.equal(iValidationSuccess, 1, "ValidationSuccess event fired once");
				fnDone();
			}, 0);
		}).catch(function(oException) {
			assert.notOk(true, "submit: Promise must not be rejected");
			fnDone();
		});

	});

	QUnit.test("pasting single value", async function(assert) {

		oField.setDisplay(FieldDisplay.DescriptionValue);
		await nextUIUpdate();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();

		const sPastedValues = "AA";
		const oFakeClipboardData = {
				getData: function() {
					return sPastedValues;
				}
		};

		if (window.clipboardData) {
			window.clipboardData.setData("text", sPastedValues);
		}

		qutils.triggerEvent("paste", oContent.getFocusDomRef(), {clipboardData: oFakeClipboardData});

		assert.equal(iCount, 0, "change event not fired ");
		assert.equal(iParseError, 0, "ParseError event not fired");
		assert.equal(iValidationError, 0, "ValidationError event not fired");
		assert.equal(iValidationSuccess, 0, "ValidationSuccess event not fired");
		// faked paste-event don't triggers oninput event on Input control, so no LiveChange is fired
		// assert.equal(iLiveCount, 1, "liveChange event fired once");
		// assert.equal(sLiveId, "F1", "liveChange event fired on Field");
		// assert.equal(sLiveValue, "AA", "liveChange event value");
		assert.equal(iSubmitCount, 0, "submit event not fired");
		const aConditions = oField.getConditions();
		assert.equal(aConditions.length, 0, "No conditions returned");

	});

	QUnit.test("copy multiple values", async function(assert) {

		ClipboardUtils.stub();
		oField.setDisplay(FieldDisplay.DescriptionValue);
		oField.setConditions([Condition.createItemCondition(1, "Test"), Condition.createCondition(OperatorName.LT, [10])]);
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		const oTokenizer = oContent?.getAggregation("tokenizer");
		const aTokens = oTokenizer?.getTokens();

		for (let i = 0; i < aTokens.length; i++) {
			aTokens[i].setSelected(true);
		}

		oTokenizer.focus();
		qutils.triggerKeydown(oTokenizer.getFocusDomRef().id, KeyCodes.C, false, false, true);
		ClipboardUtils.triggerCopy(oTokenizer.getFocusDomRef());

		await new Promise((resolve) => {setTimeout(resolve,0);});
		const aClipboardContents = await navigator.clipboard.read();
		let oBlob = await aClipboardContents[0]?.getType("text/plain");
		let sText = await oBlob.text();
		assert.equal(sText, "1\tTest\r\n\t<10", "Clipboard filled");

		oBlob = await aClipboardContents[0]?.getType("text/html");
		sText = await oBlob.text();
		assert.equal(sText, "<table><tr><td>Test (1)</td></tr><tr><td><10</td></tr></table>", "Clipboard filled for HTML");

		ClipboardUtils.restore();

	});

	QUnit.test("check for user interaction", async function(assert) {

		const oIcon = new Icon("I1", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }).placeAt("content");
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];

		assert.notOk(oField.hasPendingUserInput(), "initial no user interaction");
		oField.focus();
		assert.notOk(oField.hasPendingUserInput(), "no user interaction after focus");
		jQuery(oContent.getFocusDomRef()).val("X");
		oContent.fireLiveChange({ newValue: "X" });
		assert.ok(oField.hasPendingUserInput(), "user interaction after liveChange");
		oContent.fireChange({ newValue: "X" });
		assert.notOk(oField.hasPendingUserInput(), "no user interaction after change");

		jQuery(oContent.getFocusDomRef()).val("");
		oContent.fireLiveChange({ newValue: "" });
		assert.ok(oField.hasPendingUserInput(), "user interaction after liveChange");
		jQuery(oContent.getFocusDomRef()).val("X");
		oContent.fireLiveChange({ newValue: "X" });
		assert.ok(oField.hasPendingUserInput(), "user interaction after liveChange to old value");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.notOk(oField.hasPendingUserInput(), "no user interaction after ENTER");

		jQuery(oContent.getFocusDomRef()).val("Z");
		oContent.fireLiveChange({ newValue: "Z" });
		assert.ok(oField.hasPendingUserInput(), "user interaction after liveChange");
		jQuery(oContent.getFocusDomRef()).val("X");
		oContent.fireLiveChange({ newValue: "X" });
		assert.ok(oField.hasPendingUserInput(), "user interaction after liveChange to old value");
		oIcon.focus();
		assert.notOk(oField.hasPendingUserInput(), "no user interaction after focusout");

		oIcon.destroy();

	});

	QUnit.module("Clone", {
		beforeEach: async function() {
			FieldBaseDelegateODataDefaultTypes.enable();
			oCM = new ConditionModel();
			oField = new FieldBase("F1", { conditions: "{cm>/conditions/Name}", models: {cm: oCM} });
			//			oField.attachChange(_myChangeHandler);
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			const oCondition = Condition.createCondition(OperatorName.EQ, ["Test"], undefined, undefined, ConditionValidated.Validated);
			oCM.addCondition("Name", oCondition);
			oCM.checkUpdate(true, false); // to update bindings
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			FieldBaseDelegateODataDefaultTypes.disable();
			oField.destroy();
			oField = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			FieldBase._init();
		}
	});

	QUnit.test("with internal content", async function(assert) {

		const oClone = oField.clone("myClone");
		oClone.fireChangeEvent = _myFireChange;
		oClone.placeAt("content");
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.equal(oContent.getModel("$field"), oField._oManagedObjectModel, "MultiInput has ManagedObjectModel of Field");
		let aTokens = oContent.getTokens ? oContent.getTokens() : [];
		const oToken = aTokens[0];
		assert.equal(oToken && oToken.getText(), "Test", "Text on token set");
		const aCloneContent = oClone.getAggregation("_content");
		const oCloneContent = aCloneContent && aCloneContent.length > 0 && aCloneContent[0];
		aTokens = oCloneContent.getTokens ? oCloneContent.getTokens() : [];
		assert.equal(aTokens.length, 1, "Clone has one Tokens");

		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1", "Event fired on original Field");

		iCount = 0;
		sId = "";
		sValue = "";

		oCloneContent.focus();
		jQuery(oCloneContent.getFocusDomRef()).val("Y");
		qutils.triggerKeydown(oCloneContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1-myClone", "Event fired on clone");

		oClone.destroy();

	});

	QUnit.test("with external content", async function(assert) {

		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		oCM.removeAllConditions();
		const oCondition = Condition.createCondition(OperatorName.EQ, [70]);
		oCM.addCondition("Name", oCondition);
		oCM.checkUpdate(true, false); // update model syncronous
		const oSlider = new Slider("S1");
		oSlider.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContent(oSlider);
		await nextUIUpdate();

		const oClone = oField.clone("myClone");
		oClone.fireChangeEvent = _myFireChange;
		oClone.placeAt("content");
		await nextUIUpdate();

		assert.notOk(oClone.getAggregation("_content"), "Clone has no internal content");
		const oCloneSlider = oClone.getContent();
		assert.ok(oCloneSlider instanceof Slider, "Clone has Slider as Content");
		assert.equal(oCloneSlider.getModel("$field"), oClone._oManagedObjectModel, "Clone-Slider has ManagedObjectModel of Clone");

		oSlider.focus();
		qutils.triggerKeydown(oSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1", "Event fired on original Field");

		iCount = 0;
		sId = "";
		sValue = "";

		oCloneSlider.focus();
		qutils.triggerKeydown(oCloneSlider.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1-myClone", "Event fired on clone");

		oClone.destroy();

	});

	QUnit.test("with external edit/display content", async function(assert) {

		oField.setMaxConditions(1);
		oField.setDataType("Edm.Float");
		oCM.removeAllConditions();
		const oCondition = Condition.createCondition(OperatorName.EQ, [70]);
		oCM.addCondition("Name", oCondition);
		oCM.checkUpdate(true, false); // update model syncronous
		const oSlider1 = new Slider("S1");
		oSlider1.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContentEdit(oSlider1);
		const oSlider2 = new Slider("S2");
		oSlider2.bindProperty("value", { path: '$field>/conditions', type: new ConditionsType() });
		oField.setContentDisplay(oSlider2);
		await nextUIUpdate();

		const oClone = oField.clone("myClone");
		oClone.fireChangeEvent = _myFireChange;
		oClone.placeAt("content");
		await nextUIUpdate();

		assert.notOk(oClone.getAggregation("_content"), "Clone has no internal content");
		const oCloneSlider1 = oClone.getContentEdit();
		assert.ok(oCloneSlider1 instanceof Slider, "Clone has Slider as ContentEdit");
		assert.equal(oCloneSlider1.getModel("$field"), oClone._oManagedObjectModel, "Clone-Slider for Edit mode has ManagedObjectModel of Clone");
		const oCloneSlider2 = oClone.getContentDisplay();
		assert.ok(oCloneSlider2 instanceof Slider, "Clone has Slider as ContentDisplay");
		assert.notOk(oCloneSlider2.getModel("$field"), "Clone-Slider for display mode not bound to ManagedObjectModel of Clone as not rendered");

		oSlider1.focus();
		qutils.triggerKeydown(oSlider1.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1", "Event fired on original Field");

		iCount = 0;
		sId = "";
		sValue = "";

		oCloneSlider1.focus();
		qutils.triggerKeydown(oCloneSlider1.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.equal(iCount, 1, "Event fired once");
		assert.equal(sId, "F1-myClone", "Event fired on clone");

		oClone.destroy();

	});

	// check only the use of the ValueHelp API. The ValueHelp itself is tested in own tests.
	// So use Stubs to simulate functions of ValueHelp

	QUnit.module("ValueHelp without key", {
		beforeEach: async function() {
			const oValueHelp = new ValueHelp("F1-H", {validateInput: false});
			sinon.stub(oValueHelp, "isValidationSupported").returns(false);
			sinon.stub(oValueHelp, "getIcon").returns("sap-icon://sap-ui5");

			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				valueHelp: oValueHelp,
				//				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler,
				models: {cm: oCM}
			});
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			const oCondition = Condition.createCondition(OperatorName.EQ, ["I2"]);
			oCM.addCondition("Name", oCondition);

			oCM.checkUpdate(true, false); // to update bindings
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			const oValueHelp = Element.getElementById("F1-H");
			if (oValueHelp) {
				oValueHelp.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
			FieldBase._init();
		}
	});

	QUnit.test("value help enabled", async function(assert) {

		const oDummyIcon = new Icon("I1", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }).placeAt("content");

		oField.setDisplay(FieldDisplay.DescriptionValue);
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		sinon.spy(oValueHelp, "onControlChange");
		sinon.spy(oValueHelp, "attachEvent");
		await nextUIUpdate();
		sinon.spy(oValueHelp, "connect");
		sinon.spy(oValueHelp, "toggleOpen");

		const oConfig = {
			maxConditions: -1,
			dataType: oField.getContentFactory().getDataType(),
			additionalDataType: oField.getContentFactory().getAdditionalDataType(),
			operators: oField.getSupportedOperators(),
			display: oField.getDisplay(),
			delegate: oField.getControlDelegate(),
			delegateName: oField.getDelegate().name,
			payload: oField.getPayload(),
			defaultOperatorName: null
		};

		oField.focus(); // as ValueHelp is connected with focus
		assert.ok(oValueHelp.connect.calledWith(oField, oConfig), "ValueHelp connected to Field");
		assert.ok(oValueHelp.attachEvent.calledWith("select"), "ValueHelp select-event attached to Field");
		oValueHelp.connect.reset();
		oValueHelp.attachEvent.reset();
		oDummyIcon.focus();
		oField.focus(); // on focus again connect called again, but events not attached twice
		assert.ok(oValueHelp.connect.calledWith(oField), "ValueHelp connected to Field");
		assert.notOk(oValueHelp.attachEvent.calledWith("select"), "ValueHelp select-event not attached again to Field");

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent.getShowValueHelp(), "valueHelp enabled");
		const oIcon = oContent.getAggregation("_endIcon", [])[1];
		assert.equal(oIcon && oIcon.getSrc(), "sap-icon://sap-ui5", "ValueHelpIcon set");
		assert.equal(oField.getFocusElementForValueHelp(true), oContent, "For Typeahead mode Content control is focus element");
		assert.equal(oField.getFocusElementForValueHelp(false), oIcon, "For Dialog mode icon is focus element");

		// simulate select event to see if field is updated
		const oCondition = Condition.createCondition(OperatorName.EQ, ["Hello"]);
		oValueHelp.fireSelect({ conditions: [oCondition] });
		assert.equal(iCount, 1, "Change Event fired once");
		let aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0], "Hello", "condition value");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.ok(oValueHelp.onControlChange.calledOnce, "onControlChange called on ValueHelp");
		assert.notOk(oField.hasPendingUserInput(), "no user interaction after select");

		oValueHelp.fireNavigated({ condition: Condition.createItemCondition("Y", "Navigate") });
		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0], "Hello", "condition value");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(oContent._$input.val(), "Navigate (Y)", "Field shown value");
		assert.ok(oField.hasPendingUserInput(), "user interaction after navigation");

		sinon.spy(oContent, "focus");
		oValueHelp.fireNavigated({ condition: undefined, leaveFocus: true });
		assert.equal(iLiveCount, 1, "LiveChange Event not fired");
		assert.equal(oContent._$input.val(), "Navigate (Y)", "Field shown value");
		assert.ok(oContent.focus.called, "focus set on content");

		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.ok(oValueHelp.onControlChange.calledTwice, "onControlChange called on ValueHelp");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 2, "two conditions in Codition model");
		assert.equal(aConditions[1].values[0], "Y", "condition value[0]");
		assert.equal(aConditions[1].values[1], "Navigate", "condition value[1]");
		assert.equal(aConditions[1].operator, OperatorName.EQ, "condition operator");
		assert.notOk(oField.hasPendingUserInput(), "no user interaction after ENTER");

		const fnDone = assert.async();
		// simulate value help request to see if ValueHelp opens
		oContent.fireValueHelpRequest();
		setTimeout(() => {
			assert.ok(oValueHelp.toggleOpen.calledOnce, "ValueHelp toggle open called");
			oContent.fireValueHelpRequest();
			setTimeout(() => {
				assert.ok(oValueHelp.toggleOpen.calledTwice, "ValueHelp toggle open called again");
				oDummyIcon.destroy();
				fnDone();
			},0);
		},0);
	});

	QUnit.test("with single value field", async function(assert) {

		oField.setDisplay(FieldDisplay.DescriptionValue);
		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		sinon.spy(oValueHelp, "toggleOpen");
		await nextUIUpdate();

		oField.focus(); // as ValueHelp is connected with focus

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent.getShowValueHelp(), "valueHelp enabled");
		const oIcon = oContent.getAggregation("_endIcon", [])[0];
		assert.equal(oIcon && oIcon.getSrc(), "sap-icon://sap-ui5", "ValueHelpIcon set");

		// simulate select event to see if field is updated
		const oCondition = Condition.createCondition(OperatorName.EQ, ["Hello"], undefined, undefined, ConditionValidated.Validated);
		oValueHelp.fireSelect({ conditions: [oCondition] });
		assert.equal(iCount, 1, "Change Event fired once");
		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		assert.equal(sLiveValue, "Hello", "liveChange event value");
		let aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0], "Hello", "condition value");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(oContent.getDOMValue(), "Hello", "value shown in inner control");

		// check selecting same value updates typed value
		iCount = 0; iLiveCount = 0; sLiveValue = undefined;
		oContent.setDOMValue("X");
		oValueHelp.fireSelect({ conditions: [oCondition] });
		assert.equal(iCount, 0, "no Change Event fired");
		assert.equal(iLiveCount, 1, "LiveChange Event fired once"); // as DOM is updated
		assert.equal(sLiveValue, "Hello", "liveChange event value");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(oContent.getDOMValue(), "Hello", "value shown in inner control");

		// check selecting same value again should not fire event
		iCount = 0; iLiveCount = 0; sLiveValue = undefined;
		oValueHelp.fireSelect({ conditions: [oCondition] });
		assert.equal(iCount, 0, "no Change Event fired");
		assert.equal(iLiveCount, 0, "no LiveChange Event fired"); // as DOM is not updated
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(oContent.getDOMValue(), "Hello", "value shown in inner control");

		// check navigation
		iCount = 0; iLiveCount = 0; sLiveValue = undefined;
		oValueHelp.fireNavigated({ condition: Condition.createItemCondition("Y", "Navigate") });
		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		assert.equal(sLiveValue, "Y", "liveChange event value");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0], "Hello", "condition value");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(oContent.getDOMValue(), "Navigate (Y)", "value shown in inner control");

		// simulate value help request to see if ValueHelp opens (use icon click to test own created icon)
		const oVHIcon = oContent && oContent.getAggregation("_endIcon")[0];
		oVHIcon.firePress();

		const fnDone = assert.async();
		setTimeout(() => {
			assert.ok(oValueHelp.toggleOpen.calledOnce, "ValueHelp toggle open called");
			oVHIcon.firePress();
			setTimeout(() => {
				assert.ok(oValueHelp.toggleOpen.calledTwice, "ValueHelp toggle open called again");
				fnDone();
			},0);
		},0);
	});

	QUnit.test("remove value help", async function(assert) {

		oField.setValueHelp();
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.notOk(oContent.getShowValueHelp(), "valueHelp disabled");

	});

	QUnit.test("focus of value help", function(assert) {

		const oIconContent = new Icon("I3", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }); // just dummy handler to make Icon focusable
		const oVHContent = new Content("C1");
		sinon.stub(oVHContent, "getContent").returns(Promise.resolve(oIconContent));
		sinon.stub(oVHContent, "isFocusInHelp").returns(true);
		const oVHPopover = new Popover("P1", {content: oVHContent});
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setDialog(oVHPopover);

		oField.focus(); // as ValueHelp is connected with focus

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		const oVHIcon = oContent && oContent.getAggregation("_endIcon")[1];

		// cannot check for bValueHelpRequested as it is reset in onsapfocusleave
		sinon.spy(oContent, "onsapfocusleave");
		sinon.spy(oContent, "preventChangeOnFocusLeave");

		oVHIcon.firePress();

		const fnDone = assert.async();
		setTimeout(function() { // to wait for promises in ValueHelp and open Popover
			assert.ok(oContent.onsapfocusleave.called, "onsapfocusleave on Input called");
			assert.ok(oContent.preventChangeOnFocusLeave.returnValues[0], "preventChangeOnFocusLeave on Input returns true");
			oContent.onsapfocusleave.reset();
			oContent.preventChangeOnFocusLeave.reset();

			const oPopover = oVHPopover.getAggregation("_container");
			assert.ok(oPopover.isOpen(), "Popover isOpen");
			assert.ok(containsOrEquals(oPopover.getDomRef(), document.activeElement), "Focus is on ValueHelp");

			oValueHelp.close();
			setTimeout(function() { // to wait for promises in ValueHelp and close Popover
				assert.ok(containsOrEquals(oField.getDomRef(), document.activeElement), "Focus is on Field");
				oVHContent.isFocusInHelp.returns(false);
				sinon.stub(oVHPopover, "isTypeahead").returns(true); // as focus stays in field only in typeahead case
				oField.focus(); // as ValueHelp is connected with focus
				oVHIcon.firePress();

				setTimeout(function() { // to wait for promises in ValueHelp and open Popover
					assert.notOk(oContent.onsapfocusleave.called, "onsapfocusleave on Input NOT called");
					assert.notOk(oContent.bValueHelpRequested, "bValueHelpRequested not set on Input");
					assert.ok(oPopover.isOpen(), "Popover isOpen");
					assert.ok(containsOrEquals(oField.getDomRef(), document.activeElement), "Focus is on Field");

					oValueHelp.close();
					setTimeout(function() { // to wait for promises in ValueHelp and close Popover
						fnDone();
					}, 400);
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.test("Skip opening ValueHelp with pending content on focus loss", async function (assert) {

		oField.setDisplay(FieldDisplay.DescriptionValue);

		const oIconContent = new Icon("I3", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }); // just dummy handler to make Icon focusable
		const oVHContent = new Content("C1");
		sinon.stub(oVHContent, "getContent").returns(Promise.resolve(oIconContent));
		const oVHPopover = new Popover("P1", {content: oVHContent});
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setTypeahead(oVHPopover);
		sinon.stub(oValueHelp, "isTypeaheadSupported").returns(Promise.resolve(true));
		sinon.spy(oValueHelp, "skipOpening");
		let fnResolve;
		const oPromise = new Promise(function(fResolve, fReject) {
			fnResolve = fResolve;
		});
		sinon.stub(ValueHelpDelegate, "retrieveContent").returns(oPromise);
		const oAlternateFocusTarget = new FieldBase("F4");
		oAlternateFocusTarget.placeAt("content");
		await nextUIUpdate();

		oField.focus();

		const aContent = oField.getAggregation("_content"),
		oContent = aContent && aContent.length > 0 && aContent[0];
		oContent._$input.val("I12");
		oContent.fireLiveChange({ value: "I12" });

		const fnDone = assert.async();
		setTimeout(async function() { // to wait for promises in ValueHelp and open Popover
			const oPopover = oVHPopover.getAggregation("_container");
			assert.notOk(oPopover.isOpen(), "Popover is not open");
			oAlternateFocusTarget.focus();
			fnResolve();
			await nextUIUpdate();
			setTimeout(function() { // to wait for promises in ValueHelp and open Popover
				assert.notOk(oPopover.isOpen(), "Popover should not open due to focus loss");
				assert.ok(oValueHelp.skipOpening.called, "Opening of ValueHelp skipped");

				oValueHelp.close();
				setTimeout(function() { // to wait for promises in ValueHelp and close Popover
					oAlternateFocusTarget.destroy();
					ValueHelpDelegate.retrieveContent.restore();
					fnDone();
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.test("shouldOpenOnFocus - ValueHelp should open on focus", function (assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());

		sinon.stub(oValueHelp, "shouldOpenOnFocus").returns(Promise.resolve(true));
		sinon.spy(oValueHelp, "toggleOpen");
		sinon.stub(oValueHelp, "isOpen").callsFake(function() {
			return this.toggleOpen.called;
		});

		oField.focus();

		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				assert.ok(oValueHelp.shouldOpenOnFocus.calledOnce, "shouldOpenOnFocus called once");
				assert.ok(oValueHelp.toggleOpen.calledOnce, "open called once");

				//do the same test with opensOnFocus(false) and the open should not be called
				oField.getFocusDomRef().blur();
				oValueHelp.shouldOpenOnFocus.resetHistory();
				oValueHelp.shouldOpenOnFocus.returns(Promise.resolve(false));
				oValueHelp.toggleOpen.resetHistory();

				oField.focus();

				setTimeout(function () {
					assert.ok(oValueHelp.shouldOpenOnFocus.calledOnce, "shouldOpenOnFocus called once");
					assert.notOk(oValueHelp.toggleOpen.called, "open not called");

					// Typehaead schold not open if Dialog was opened
					oField.getFocusDomRef().blur();
					oValueHelp.shouldOpenOnFocus.resetHistory();
					oValueHelp.shouldOpenOnFocus.returns(Promise.resolve(true));
					oValueHelp.toggleOpen.resetHistory();
					const aContent = oField.getAggregation("_content");
					const oContent = aContent && aContent.length > 0 && aContent[0];

					oField.focus();
					oContent.fireValueHelpRequest(); // simulate value help request to open value help

					setTimeout(function () {
						assert.ok(oValueHelp.shouldOpenOnFocus.calledOnce, "shouldOpenOnFocus called once");
						assert.ok(oValueHelp.toggleOpen.calledOnce, "open called once");
						oValueHelp.close();

						//in display mode value help must not open
						oField.getFocusDomRef().blur();
						oValueHelp.shouldOpenOnFocus.resetHistory();
						oValueHelp.shouldOpenOnFocus.returns(Promise.resolve(true));
						oValueHelp.toggleOpen.resetHistory();

						oField.setEditMode(FieldEditMode.Display);
						setTimeout(async function() { // to wait for promises taht changes inner controls
							await nextUIUpdate();
							const oFocusDomRef = oField.getFocusDomRef();
							jQuery(oFocusDomRef).attr("tabindex", 0); // to make it focusable
							oField.focus();

							setTimeout(function () {
								assert.notOk(oValueHelp.shouldOpenOnFocus.called, "shouldOpenOnFocus must not be called");
								assert.notOk(oValueHelp.toggleOpen.called, "open not called");

								oValueHelp.close();
								resolve();
							},350);
						});
					},350);
				},350);
			},350);
		});
	});

	QUnit.test("FocusInfo.targetInfo.silent - ValueHelp should not open on focus", function (assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());

		sinon.stub(oValueHelp, "shouldOpenOnFocus").returns(Promise.resolve(true));
		sinon.spy(oValueHelp, "toggleOpen");
		sinon.stub(oValueHelp, "isOpen").callsFake(function() {
			return this.toggleOpen.called;
		});

		oField.focus({targetInfo: {silent: true}});

		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				assert.notOk(oValueHelp.shouldOpenOnFocus.called, "shouldOpenOnFocus called once");
				assert.notOk(oField._iFocusTimer, "FocusTimer not triggered");
				assert.notOk(oValueHelp.toggleOpen.called, "open called once");
				resolve();
			},350);
		});
	});

	QUnit.test("shouldOpenOnClick - FieldHelp should open on click", function (assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());

		sinon.stub(oValueHelp, "shouldOpenOnClick").returns(Promise.resolve(true));
		sinon.spy(oValueHelp, "toggleOpen");

		oField.focus();
		let oInnerField = oField.getAggregation("_content")[0];
		qutils.triggerEvent("tap", oInnerField.getId());

		assert.ok(oValueHelp.shouldOpenOnClick.calledOnce, "shouldOpenOnClick called once");
		const fnDone = assert.async();
		setTimeout(function() { // As opened after Promise is resolved
			assert.ok(oValueHelp.toggleOpen.calledOnce, "open called once");
			assert.ok(oValueHelp.toggleOpen.calledWith(true), "open called for typeahed");

			//do the same test with openByClick(false) and the open should not be called
			oValueHelp.shouldOpenOnClick.resetHistory();
			oValueHelp.shouldOpenOnClick.returns(Promise.resolve(false));
			oValueHelp.toggleOpen.resetHistory();

			oField.focus();
			qutils.triggerEvent("tap", oInnerField.getId());

			assert.ok(oValueHelp.shouldOpenOnClick.calledOnce, "shouldOpenOnClick called once");
			setTimeout(function() { // As opened after Promise is resolved
				assert.notOk(oValueHelp.toggleOpen.called, "open not called");

				//in display mode value help must not open
				oValueHelp.shouldOpenOnClick.resetHistory();
				oValueHelp.shouldOpenOnClick.returns(Promise.resolve(true));
				oValueHelp.toggleOpen.resetHistory();

				oField.setEditMode(FieldEditMode.Display);
				setTimeout(async function() { // to wait for promises that changes inner controls
					await nextUIUpdate();
					oField.focus();
					oInnerField = oField.getAggregation("_content")[0];
					qutils.triggerEvent("tap", oInnerField.getId());

					assert.notOk(oValueHelp.shouldOpenOnClick.calledOnce, "shouldOpenOnClick must not be called");
					setTimeout(function() { // As opened after Promise is resolved
						assert.notOk(oValueHelp.toggleOpen.called, "open not called");

						oValueHelp.close();
						fnDone();
					}, 0);
				}, 0);
			}, 0);
		}, 0);
	});

	QUnit.test("Opening ValueHelp after isTypeaheadSupported-Promise is resolved", function (assert) {

		const oIconContent = new Icon("I3", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }); // just dummy handler to make Icon focusable
		const oVHContent = new Content("C1");
		sinon.stub(oVHContent, "getContent").returns(Promise.resolve(oIconContent));
		const oVHPopover = new Popover("P1", {content: oVHContent});
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setTypeahead(oVHPopover);
		let fnResolve;
		const oPromise = new Promise(function(fResolve, fReject) {
			fnResolve = fResolve;
		});

		sinon.stub(oValueHelp, "isTypeaheadSupported").returns(oPromise);
		sinon.spy(oValueHelp, "open");

		oField.focus();

		const aContent = oField.getAggregation("_content"),
		oContent = aContent && aContent.length > 0 && aContent[0];

		oContent._$input.val("I");
		oContent.fireLiveChange({ value: "I" });
		assert.ok(oValueHelp.isTypeaheadSupported.calledOnce, "isTypeaheadSupported called once");
		// oValueHelp.isTypeaheadSupported.returns(Promise.resolve(false));
		oValueHelp.isTypeaheadSupported.resetHistory();

		const fnDone = assert.async();
		setTimeout(function() { // to wait for promises in ValueHelp and open Popover
			assert.ok(oValueHelp.isTypeaheadSupported.calledOnce, "isTypeaheadSupported called once in throttle interval");
			assert.notOk(oValueHelp.open.called, "oValueHelp not opened");
			assert.equal(oValueHelp.getFilterValue(), "", "no FilterValue");

			oValueHelp.isTypeaheadSupported.resetHistory();
			// oValueHelp.isTypeaheadSupported.returns(true);
			fnResolve(true);
			oPromise.then(function() {
				setTimeout(function() { // to wait for promises in ValueHelp and open Popover
					assert.ok(oField._bOpenByTyping, "Promise result stored in Field"); // calles while open again to check focus
					assert.ok(oValueHelp.open.called, "oValueHelp opened");
					assert.equal(oValueHelp.getFilterValue(), "I", "FilterValue set");

					oValueHelp.close();
					setTimeout(function() { // to wait for promises in ValueHelp and close Popover
						fnDone();
					});
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.test("Closing ValueHelp on escape key", function (assert) {

		const oIconContent = new Icon("I3", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }); // just dummy handler to make Icon focusable
		const oVHContent = new Content("C1");
		sinon.stub(oVHContent, "getContent").returns(Promise.resolve(oIconContent));
		const oVHPopover = new Popover("P1", {content: oVHContent});
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setDialog(oVHPopover);

		oField.focus(); // as ValueHelp is connected with focus

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];

		// simulate value help request to see if ValueHelp opens
		oContent.fireValueHelpRequest();
		const fnDone = assert.async();
		setTimeout(function() { // to wait for promises in ValueHelp and open Popover
			assert.ok(oValueHelp.isOpen(), "ValueHelp open");

			oContent._$input.val("I12");
			oContent.fireLiveChange({ value: "I12" }); // to check if no reopen after throttle
			oContent.fireLiveChange({ value: "I12", escPressed: true });
			setTimeout(function() { // to wait for promises in ValueHelp and close Popover
				assert.notOk(oValueHelp.isOpen(), "ValueHelp closed");

				// open again to test escape without LiveChange event
				oContent.fireValueHelpRequest();
				setTimeout(function() { // to wait for promises in ValueHelp and open Popover
					qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ESCAPE, false, false, false);
					setTimeout(function() { // to wait for promises in ValueHelp and close Popover
						assert.notOk(oValueHelp.isOpen(), "ValueHelp closed");
						fnDone();
					}, 400);
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.test("showValueStateMessage - should adjust according to ValueHelp opening state", function (assert) {
		const oContent = oField.getCurrentContent()[0];
		const oValueHelp = Element.getElementById(oField.getValueHelp());

		sinon.stub(oValueHelp, "shouldOpenOnFocus").returns(true);
		sinon.spy(oValueHelp, "toggleOpen");
		sinon.stub(oValueHelp, "isOpen").callsFake(function() {
			return this.toggleOpen.called;
		});

		assert.ok(oContent.getShowValueStateMessage(), "showValueStateMessage is enabled as the ValueHelp is closed.");
		oField.focus();
		oValueHelp.fireOpened();
		assert.notOk(oContent.getShowValueStateMessage(), "showValueStateMessage is disabled as the ValueHelp is opened.");
		oValueHelp.fireClosed();
		assert.ok(oContent.getShowValueStateMessage(), "showValueStateMessage is enabled as the ValueHelp is closed.");
	});

	let vGetItemsForValue;
	let bAsync = false;
	QUnit.module("ValueHelp with key", {
		beforeEach: async function() {
			const oValueHelp = new ValueHelp("F1-H", {validateInput: false});
			sinon.stub(oValueHelp, "isValidationSupported").returns(true); // otherwise it will not be taken to determine key or description
			sinon.stub(oValueHelp, "getIcon").returns("sap-icon://sap-ui5");
			sinon.stub(oValueHelp, "getAriaAttributes").returns({ // fake attributes. Real attributes tested in ValueHelp unit tests
				contentId: "Test",
				role: "combobox",
				roleDescription: undefined,
				ariaHasPopup: "listbox",
				valueHelpEnabled: true
			});

			const fnGetItemForValue = function(oConfig) {
				vGetItemsForValue = oConfig.value;
				let oResult = null;
				if (oConfig.value === "I1" || oConfig.value === "Item1") {
					oResult = {key: "I1", description: "Item1"};
				} else if (oConfig.value === "I2" || oConfig.value === "Item2") {
					// oResult = {key: "I2", description: "Item2"};
				} else if (oConfig.value === "I3" || oConfig.value === "Item3") {
					oResult = {key: "I3", description: "Item3"};
				}
				if (bAsync) {
					return new Promise(function(fnResolve) {
						fnResolve(oResult);
					});
				} else {
					return oResult;
				}
			};
			sinon.stub(oValueHelp, "getItemForValue").callsFake(fnGetItemForValue);
			sinon.spy(oValueHelp, "navigate");
			sinon.spy(oValueHelp, "open");
			sinon.spy(oValueHelp, "close");
			sinon.spy(oValueHelp, "fireDisconnect");
			sinon.spy(oValueHelp, "onControlChange");

			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				valueState: "{cm>/fieldPath/Name/valueState}",
				valueStateText: "{cm>/fieldPath/Name/valueStateText}",
				display: FieldDisplay.Description,
				valueHelp: oValueHelp,
				dataType: "sap.ui.model.type.String",
				dataTypeConstraints: {search: '^$|^[A-Za-z0-5]+$'}, // to test validation error
				//				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler,
				submit: _mySubmitHandler,
				models: {cm: oCM}
			});
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			const oCondition = Condition.createCondition(OperatorName.EQ, ["I2"], undefined, undefined, ConditionValidated.Validated); // use validated condition
			oCM.addCondition("Name", oCondition);
			oCM.checkUpdate(true, false); // to update bindings
			Messaging.registerObject(oField, true); // to test valueState

			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			const oValueHelp = Element.getElementById("F1-H");
			if (oValueHelp) {
				oValueHelp.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
			iSubmitCount = 0;
			sSubmitId = "";
			oSubmitPromise = null;
			FieldBase._init();
			vGetItemsForValue = undefined;
			bAsync = false;
		}
	});

	QUnit.test("value/key handling", async function(assert) {

		const oIcon = new Icon("I3", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }).placeAt("content"); // just dummy handler to make Icon focusable
		oField.setMaxConditions(2);
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setValidateInput(false); // to show keys if not found in help
		const oConfig = {
			parsedValue: "I2",
			parsedDescription: undefined,
			value: "I2",
			caseSensitive: true,
			checkKey: true,
			checkDescription: false,
			context: {inParameters: undefined, outParameters: undefined, payload: undefined},
			control: oField,
			dataType: oField.getContentFactory().retrieveDataType(),
			exactMatch: true,
			exception: FormatException,
			bindingContext: undefined
		};
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called");
		oField.setDisplay(FieldDisplay.DescriptionValue);
		await nextUIUpdate();
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		const aTokens = oContent.getTokens ? oContent.getTokens() : [];
		assert.equal(aTokens.length, 1, "MultiInput has one Token");
		const oToken = aTokens[0];
		assert.equal(oToken && oToken.getText(), "I2", "Text on token is key, as ValueHelp has no description yet");

		// no check for DataUpdate as ValueHelp waits in Promise until content or data are loaded

		// simulate value help request to see if ValueHelp opens
		oField.focus();
		oContent.setDOMValue("I"); // to test clearing of content
		oContent.fireLiveChange({ newValue: "I" }); // simulate user input
		oField._sFilterValue = "I"; // als typeahead is async and nit tested here
		oContent.fireValueHelpRequest();

		let aConditions = oValueHelp.getConditions();
		assert.equal(aConditions.length, 1, "Condition set on ValueHelp");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "selected item set as condition");

		// simulate select event to see if field is updated
		oValueHelp.getItemForValue.resetHistory();
		let oCondition = Condition.createItemCondition("I3", "Item3");
		oValueHelp.fireSelect({ conditions: [oCondition], add: false, close: false });
		assert.equal(iCount, 1, "Change Event fired once");
		assert.equal(sValue, "I3", "Change event value");
		assert.ok(bValid, "Change event valid");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");
		assert.equal(aConditions[0] && aConditions[0].values[1], "Item3", "condition description");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.notOk(oValueHelp.getItemForValue.called, "getItemForValue not called");
		assert.ok(oValueHelp.onControlChange.called, "onControlChange called on ValueHelp");
		assert.equal(oContent.getDOMValue(), "I", "value still shown in inner control");

		// simulate Enter & close: Filter value must be removed but no change fired.
		iCount = 0;
		sValue = ""; bValid = undefined;
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		oValueHelp.fireClosed(); // as normally Enter triggers close, but here not really open
		assert.equal(iCount, 0, "Change Event not fired");
		assert.equal(oContent.getDOMValue(), "", "no value shown in inner control");
		assert.equal(oContent.getProperty("value"), "", "no value set in inner control"); // as getValue returns DomValue, not property
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");

		// simulate select event to see if field is updated
		oValueHelp.getItemForValue.resetHistory();
		iCount = 0;
		sValue = ""; bValid = undefined;
		sinon.stub(oField._oContentFactory._oConditionsType, "parseValue").throws(new ParseException("Error"));
		oField.setValueState("Error"); // as valueState is set async
		oField.setValueStateText("Error");
		oContent.setValue("I"); // to test clearing of content
		assert.ok(oField.isInvalidInput(), "parse error"); // just to be sure that set before test
		oValueHelp.fireSelect({ conditions: aConditions, add: false, close: true }); // check choosing old conditions after wrong input
		assert.equal(iCount, 1, "Change Event fired once");
		assert.ok(bValid, "Change event valid");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");
		assert.equal(aConditions[0] && aConditions[0].values[1], "Item3", "condition description");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.notOk(oValueHelp.getItemForValue.called, "getItemForValue not called");
		assert.equal(oContent.getDOMValue(), "", "value not longer shown in inner control");
		assert.equal(oField.getValueState(), "None", "No ValueState on Field");
		assert.equal(oField.getValueStateText(), "", "No ValueStateText on Field");
		assert.equal(oContent.getValueState(), "None", "No ValueState on inner content");
		assert.equal(oContent.getValueStateText(), "", "No ValueStateText on inner content");
		assert.notOk(oField.isInvalidInput(), "no parse error");

		// simulate select event with close to see if field is updated
		oValueHelp.getItemForValue.resetHistory();
		oCondition = Condition.createItemCondition("I1", "Item1");
		iCount = 0;
		sValue = ""; bValid = undefined;
		oField.setValueState("Error"); // as valueState is set async
		oField.setValueStateText("Error");
		oContent.setValue("J"); // to test clearing of content
		assert.ok(oField.isInvalidInput(), "parse error"); // just to be sure that set before test
		oValueHelp.fireSelect({ conditions: [oCondition], add: true, close: true });
		assert.equal(iCount, 1, "Change Event fired once");
		assert.ok(bValid, "Change event valid");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 2, "two condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");
		assert.equal(aConditions[0] && aConditions[0].values[1], "Item3", "condition description");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(aConditions[1] && aConditions[1].values[0], "I1", "condition value");
		assert.equal(aConditions[1] && aConditions[1].values[1], "Item1", "condition description");
		assert.equal(aConditions[1] && aConditions[1].operator, OperatorName.EQ, "condition operator");
		assert.notOk(oValueHelp.getItemForValue.called, "getItemForValue not called");
		assert.equal(oContent.getDOMValue(), "", "no value shown in inner control");
		assert.equal(oContent.getProperty("value"), "", "no value set in inner control"); // as getValue returns DomValue, not property
		assert.equal(oField.getValueState(), "None", "No ValueState"); // after updating conditions valueStae should be cleared
		assert.equal(oField.getValueStateText(), "", "No ValueStateText");
		assert.equal(oContent.getValueState(), "None", "No ValueState on inner content");
		assert.equal(oContent.getValueStateText(), "", "No ValueStateText on inner content");
		assert.notOk(oField.isInvalidInput(), "no parse error");
		oField._oContentFactory._oConditionsType.parseValue.restore();

		oIcon.destroy();

	});

	QUnit.test("select on single field", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		// only key, no description and async formatting
		bAsync = true;

		oField.focus(); // as ValueHelp is connected with focus

		oValueHelp.getItemForValue.resetHistory();
		let oCondition = Condition.createItemCondition("I2", "Item2");
		oValueHelp.fireSelect({ conditions: [oCondition], add: true });
		assert.equal(iCount, 0, "No Change Event fired");
		let aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
		assert.equal(aConditions[0] && aConditions[0].values[1], "Item2", "condition description");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.notOk(oValueHelp.getItemForValue.called, "getItemForValue not called");
		assert.equal(oContent.getDOMValue(), "Item2", "value shown in inner control");

		oValueHelp.getItemForValue.resetHistory();
		iCount = 0;
		sValue = ""; bValid = undefined;
		oCondition = Condition.createCondition(OperatorName.EQ, ["I3"], undefined, undefined, ConditionValidated.Validated);
		oValueHelp.fireSelect({ conditions: [oCondition], add: false });
		assert.equal(iCount, 1, "Change Event fired once");
		assert.ok(bValid, "Change event valid");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");
		assert.equal(aConditions[0] && aConditions[0].values[1], undefined, "condition description");
		assert.equal(aConditions[0] && aConditions[0].operator, OperatorName.EQ, "condition operator");
		const fnDone = assert.async();
		setTimeout(function() { // as text is updated async
			assert.equal(oContent.getDOMValue(), "Item3", "value shown in inner control");
			const oConfig = {
				parsedValue: "I3",
				parsedDescription: undefined,
				value: "I3",
				caseSensitive: true,
				checkKey: true,
				checkDescription: false,
				context: {inParameters: undefined, outParameters: undefined, payload: undefined},
				control: oField,
				dataType: oField.getContentFactory().retrieveDataType(),
				exactMatch: true,
				exception: FormatException,
				bindingContext: undefined
			};
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called");
			fnDone();
		}, 0);

	});

	QUnit.test("keyboard support on closed ValueHelp", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		sinon.stub(oValueHelp, "isNavigationEnabled").returns(false);

		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		sinon.spy(oContent, "onsapprevious");
		sinon.spy(oContent, "onsapnext");
		sinon.spy(oContent, "onsapup");
		sinon.spy(oContent, "onsapdown");
		sinon.spy(oContent, "onsaphome");
		sinon.spy(oContent, "onsapend");
		sinon.spy(oContent, "onsappageup");
		sinon.spy(oContent, "onsappagedown");
		sinon.spy(oContent, "onsapbackspace");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.ok(oContent.onsapnext.called, "onsapnext called on content control");
		oContent.onsapnext.resetHistory();

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oContent.onsapnext.called, "onsapnext called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_LEFT, false, false, false);
		assert.ok(oContent.onsapprevious.called, "onsapprevious called on content control");
		oContent.onsapprevious.resetHistory();

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oContent.onsapprevious.called, "onsapprevious called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oContent.onsapup.called, "onsapup called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oContent.onsapdown.called, "onsapdown called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.HOME, false, false, false);
		assert.ok(oContent.onsaphome.called, "onsaphome called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.END, false, false, false);
		assert.ok(oContent.onsapend.called, "onsapend called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.PAGE_UP, false, false, false);
		assert.ok(oContent.onsappageup.called, "onsappageup called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.PAGE_DOWN, false, false, false);
		assert.ok(oContent.onsappagedown.called, "onsappagedown called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.BACKSPACE, false, false, false);
		assert.ok(oContent.onsapbackspace.called, "onsapbackspace called on content control");

	});

	QUnit.test("keyboard support on closed ValueHelp with active navigation", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		sinon.stub(oValueHelp, "isNavigationEnabled").returns(true);

		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		sinon.spy(oContent, "onsapprevious");
		sinon.spy(oContent, "onsapnext");
		sinon.spy(oContent, "onsapup");
		sinon.spy(oContent, "onsapdown");
		sinon.spy(oContent, "onsaphome");
		sinon.spy(oContent, "onsapend");
		sinon.spy(oContent, "onsappageup");
		sinon.spy(oContent, "onsappagedown");
		sinon.spy(oContent, "onsapbackspace");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.ok(oContent.onsapnext.called, "onsapnext called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_LEFT, false, false, false);
		assert.ok(oContent.onsapprevious.called, "onsapprevious called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oContent.onsapup.notCalled, "onsapup not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oContent.onsapdown.notCalled, "onsapdown not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.HOME, false, false, false);
		assert.ok(oContent.onsaphome.notCalled, "onsaphome not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.END, false, false, false);
		assert.ok(oContent.onsapend.notCalled, "onsapend not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.PAGE_UP, false, false, false);
		assert.ok(oContent.onsappageup.notCalled, "onsappageup not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.PAGE_DOWN, false, false, false);
		assert.ok(oContent.onsappagedown.notCalled, "onsappagedown not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.BACKSPACE, false, false, false);
		assert.ok(oContent.onsapbackspace.called, "onsapbackspace called on content control");

	});

	QUnit.test("keyboard support on open ValueHelp", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const oVHContent = new Content("C1");
		const oVHPopover = new Popover("P1", {content: oVHContent});
		oValueHelp.setTypeahead(oVHPopover);
		sinon.stub(oVHContent, "isNavigationEnabled").returns(true);
		sinon.stub(oVHPopover, "isOpen").returns(true);
		sinon.stub(oVHPopover, "getUseAsValueHelp").returns(false);

		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		sinon.spy(oContent, "onsapprevious");
		sinon.spy(oContent, "onsapnext");
		sinon.spy(oContent, "onsapup");
		sinon.spy(oContent, "onsapdown");
		sinon.spy(oContent, "onsaphome");
		sinon.spy(oContent, "onsapend");
		sinon.spy(oContent, "onsappageup");
		sinon.spy(oContent, "onsappagedown");
		sinon.spy(oContent, "onsapbackspace");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_RIGHT, false, false, false);
		assert.ok(oContent.onsapnext.called, "onsapnext called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_LEFT, false, false, false);
		assert.ok(oContent.onsapprevious.called, "onsapprevious called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oContent.onsapup.notCalled, "onsapup not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oContent.onsapdown.notCalled, "onsapdown not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.HOME, false, false, false);
		assert.ok(oContent.onsaphome.notCalled, "onsaphome not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.END, false, false, false);
		assert.ok(oContent.onsapend.notCalled, "onsapend not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.PAGE_UP, false, false, false);
		assert.ok(oContent.onsappageup.notCalled, "onsappageup not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.PAGE_DOWN, false, false, false);
		assert.ok(oContent.onsappagedown.notCalled, "onsappagedown not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.BACKSPACE, false, false, false);
		assert.ok(oContent.onsapbackspace.called, "onsapbackspace called on content control");

	});

	QUnit.test("navigation in open ValueHelp", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		sinon.stub(oValueHelp, "isOpen").returns(true);
		sinon.stub(oValueHelp, "isNavigationEnabled").returns(true);

		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		sinon.spy(oContent, "onsapprevious");
		sinon.spy(oContent, "onsapnext");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(1), "navigate called");
		assert.ok(oContent.onsapnext.notCalled, "onsapnext not called on content control");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(-1), "navigate called");
		assert.ok(oContent.onsapprevious.notCalled, "onsapprevious not called on content control");

		let oCondition = Condition.createItemCondition("I3", "Item 3");
		oValueHelp.fireNavigated({ condition: oCondition });
		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		let aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
		assert.equal(oContent._$input.val(), "Item 3", "Field shown value");

		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.ok(oValueHelp.onControlChange.called, "onControlChange called on ValueHelp");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 2, "two conditions in Codition model");
		assert.equal(aConditions[1] && aConditions[1].values[0], "I3", "condition value");
		assert.equal(aConditions[1] && aConditions[1].values[1], "Item 3", "condition description");
		assert.equal(iSubmitCount, 0, "submit event not fired");

		iLiveCount = 0;
		oValueHelp.getItemForValue.resetHistory();
		oCondition = Condition.createItemCondition("X");
		oCondition.validated = ConditionValidated.Validated;
		oValueHelp.fireNavigated({ condition: oCondition });
		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 2, "condition in Codition model not changed");
		assert.equal(oContent._$input.val(), "X", "Field shown value");
		assert.ok(oValueHelp.getItemForValue.notCalled, "no request for description triggered");

		// no navigation in non-editable field
		oValueHelp.navigate.resetHistory();
		oField.setEditMode(FieldEditMode.ReadOnly);
		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oValueHelp.navigate.notCalled, "navigate not called");
		assert.ok(oContent.onsapnext.notCalled, "onsapnext not called on content control");
		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oValueHelp.navigate.notCalled, "navigate not called");
		assert.ok(oContent.onsapprevious.notCalled, "onsapprevious not called on content control");


	});

	QUnit.test("navigation single Field in open ValueHelp", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		sinon.stub(oValueHelp, "isOpen").returns(true);
		sinon.stub(oValueHelp, "isNavigationEnabled").returns(true);
		await nextUIUpdate();

		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(1), "navigate called");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(-1), "navigate called");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.PAGE_DOWN, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(10), "navigate called");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.PAGE_UP, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(-10), "navigate called");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.HOME, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(-9999), "navigate called");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.END, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(9999), "navigate called");

		const oCondition = Condition.createItemCondition("I3", "Item 3");
		oValueHelp.fireNavigated({ condition: oCondition });
		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		let aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
		assert.equal(oContent._$input.val(), "Item 3", "Field shown value");
		assert.notOk(oContent.hasStyleClass("sapMFocus"), "Focus outline removed");

		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.ok(oValueHelp.onControlChange.called, "onControlChange called on ValueHelp");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one conditions in Codition model");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");
		assert.equal(aConditions[0] && aConditions[0].values[1], "Item 3", "condition description");
		assert.equal(iSubmitCount, 0, "submit event not fired");

		qutils.triggerEvent("tap", oContent.getFocusDomRef().id);
		assert.ok(oContent.hasStyleClass("sapMFocus"), "Focus outline restored");

	});

	QUnit.test("navigation single Field in closed ValueHelp", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const oVHContent = new Content("C1");
		const oVHPopover = new Popover("P1", {content: oVHContent});
		oValueHelp.setTypeahead(oVHPopover);
		sinon.stub(oVHContent, "isNavigationEnabled").returns(true);
		sinon.stub(oVHPopover, "isOpen").returns(false);
		sinon.stub(oVHPopover, "getUseAsValueHelp").returns(true); // simulate ComboBox case
		await nextUIUpdate();

		oField.focus(); // as ValueHelp is connected with focus

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(1), "navigate called");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oValueHelp.navigate.calledWith(-1), "navigate called");

		// no additionTest for navigation events needed as same as for open value help

		oVHContent.isNavigationEnabled.returns(false);
		oValueHelp.navigate.reset();

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_DOWN, false, false, false);
		assert.ok(oValueHelp.navigate.notCalled, "navigate not called");

		qutils.triggerKeydown(oField.getFocusDomRef().id, KeyCodes.ARROW_UP, false, false, false);
		assert.ok(oValueHelp.navigate.notCalled, "navigate not called");


	});

	QUnit.test("filtering", async function(assert) {

		oField.setDisplay(FieldDisplay.DescriptionValue);
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const oVHContent = new Content("C1");
		const oVHPopover = new Popover("P1", {content: oVHContent});
		oValueHelp.setTypeahead(oVHPopover);
		sinon.stub(oValueHelp, "isTypeaheadSupported").returns(Promise.resolve(true));
		oValueHelp.setConditions([Condition.createItemCondition("I1", "Item1")]); // should stay on multi-value-suggestion
		await nextUIUpdate();
		sinon.spy(oValueHelp, "initBeforeOpen");


		const fnDone = assert.async();
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent._$input.val("i");
		oContent.fireLiveChange({ value: "I" });

		setTimeout(function() { // to wait for Promises and opening
			assert.equal(oValueHelp.getFilterValue(), "I", "FilterValue set");
			assert.equal(oValueHelp.getConditions().length, 1, "One condition set on ValueHelp");
			assert.ok(oValueHelp.open.called, "open called");
			assert.ok(oValueHelp.open.calledWith, true, "open called as Suggestion");
			assert.ok(oValueHelp.initBeforeOpen.calledOnce, "initBeforeOpen called once");

			oContent._$input.val("=A");
			oContent.fireLiveChange({ value: "=A" });

			setTimeout(function() { // to wait for Promises and opening
				assert.equal(oValueHelp.getFilterValue(), "A", "FilterValue set");
				assert.ok(oValueHelp.initBeforeOpen.calledOnce, "initBeforeOpen called once");

				oContent._$input.val("=X");
				oContent.fireLiveChange({ value: "=X" });

				setTimeout(function() { // to wait for Promises and opening
					assert.equal(oValueHelp.getFilterValue(), "X", "FilterValue set");

					oContent._$input.val("B (C)");
					oContent.fireLiveChange({ value: "B (C)" });

					setTimeout(function() { // to wait for Promises and opening
						assert.equal(oValueHelp.getFilterValue(), "C", "FilterValue set");

						sinon.stub(oValueHelp, "isOpen").returns(true); // as it not really opens without content
						sinon.stub(ValueHelpDelegate, "showTypeahead").returns(false); // to fake closing on empty input
						oContent._$input.val("");
						oContent.fireLiveChange({ value: "" });

						setTimeout(function() { // to wait for Promises and closing
							assert.ok(oValueHelp.close.called, "close called");
							oValueHelp.isOpen.restore();
							ValueHelpDelegate.showTypeahead.restore();

							oValueHelp.close(); // to be sure
							fnDone();
						}, 400);
					}, 400);
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.test("filtering and switching to value help", async function(assert) {

		oField.setDisplay(FieldDisplay.DescriptionValue);
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const oVHContent = new Content("C1");
		const oVHPopover = new Popover("P1", {content: oVHContent});
		oValueHelp.setTypeahead(oVHPopover);
		sinon.stub(oValueHelp, "isTypeaheadSupported").returns(Promise.resolve(true));
		oValueHelp.setConditions([Condition.createItemCondition("I1", "Item1")]); // should stay on multi-value-suggestion
		await nextUIUpdate();
		sinon.spy(oValueHelp, "initBeforeOpen");

		const fnDone = assert.async();
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent._$input.val("i");
		oContent.fireLiveChange({ value: "I" });

		setTimeout(function() { // to wait for Promises and opening
			oValueHelp.fireSwitchToValueHelp();
			setTimeout(function() { // to wait for Promises and opening and closing
				assert.equal(oValueHelp.getFilterValue(), "I", "FilterValue set");
				assert.equal(oValueHelp.getConditions().length, 1, "One condition set on ValueHelp");
				assert.ok(oValueHelp.open.called, "open called");
				assert.ok(oValueHelp.open.calledWith, false, "open called as ValueHelp");
				assert.ok(oValueHelp.initBeforeOpen.calledOnce, "initBeforeOpen called once");

				oValueHelp.close();
				setTimeout(function() { // to wait for closing
					fnDone();
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.test("change while open", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());

		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.fireValueHelpRequest();
		oContent._$input.val("=Item1");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

		assert.equal(oValueHelp.getFilterValue(), "", "FilterValue reset");
		const oConfig = {
			parsedValue: "Item1",
			parsedDescription: "Item1",
			value: "Item1",
			checkKey: true,
			checkDescription: true,
			control: oField,
			dataType: oField.getContentFactory().retrieveDataType(),
			exactMatch: true,
			caseSensitive: true,
			exception: ParseException,
			bindingContext: undefined
		};
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called");
		let aConditions = oValueHelp.getConditions();
		assert.equal(aConditions.length, 2, "Condition set on ValueHelp");
		assert.equal(aConditions[1] && aConditions[1].values[0], "I1", "selected item set as condition");
		assert.ok(oValueHelp.close.called, "close called");
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 2, "two conditions in Codition model");
		assert.equal(aConditions[1] && aConditions[1].values[0], "I1", "condition value");
		assert.ok(oValueHelp.onControlChange.called, "onControlChange called on ValueHelp");

	});

	QUnit.test("invalid input", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setValidateInput(true);
		const fnDone = assert.async();
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent._$input.val("Invalid");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

		const oConfig = {
			parsedValue: "Invalid",
			parsedDescription: "Invalid",
			value: "Invalid",
			checkKey: true,
			checkDescription: true,
			control: oField,
			dataType: oField.getContentFactory().retrieveDataType(),
			exactMatch: false,
			caseSensitive: undefined,
			exception: ParseException,
			bindingContext: undefined
		};
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called");
		setTimeout(function() { // to wait for update of valueState via Model
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.equal(sValue, "Invalid", "change event value");
			assert.notOk(bValid, "change event not valid");
			assert.equal(oContent.getValueState(), "Error", "ValueState set");
			assert.equal(oContent.getValueStateText(), "Value \"Invalid\" does not exist.", "ValueState text");
			let aConditions = oValueHelp.getConditions();
			assert.equal(aConditions.length, 1, "Condition set on ValueHelp");
			assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
			assert.ok(oValueHelp.close.called, "close called");
			aConditions = oCM.getConditions("Name");
			assert.equal(aConditions.length, 1, "one condition in Codition model");
			assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
			assert.notOk(oValueHelp.onControlChange.called, "onControlChange not called on ValueHelp");

			// allow "invalid" entry
			iCount = 0; sId = null; sValue = null; bValid = null;
			oValueHelp.setValidateInput(false);
			oContent._$input.val("=Unknown");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
			setTimeout(function() { // to wait for update of valueState via Model
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.ok(bValid, "change event valid");
				assert.equal(oContent.getValueState(), "None", "ValueState set");
				assert.equal(oContent.getValueStateText(), "", "ValueState text");
				aConditions = oValueHelp.getConditions();
				assert.equal(aConditions.length, 2, "Condition set on ValueHelp");
				assert.equal(aConditions[1] && aConditions[1].values[0], "Unknown", "condition value");
				assert.ok(oValueHelp.close.called, "close called");
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 2, "two conditions in Codition model");
				assert.equal(aConditions[1] && aConditions[1].values[0], "Unknown", "condition value");
				assert.ok(oValueHelp.onControlChange.calledOnce, "onControlChange called on ValueHelp");

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("invalid input on singleValue Field", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setValidateInput(true);

		const fnDone = assert.async();
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent._$input.val("Invalid");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

		const oConfig = {
			parsedValue: "Invalid",
			parsedDescription: "Invalid",
			value: "Invalid",
			checkKey: true,
			checkDescription: true,
			control: oField,
			dataType: oField.getContentFactory().retrieveDataType(),
			exactMatch: false,
			caseSensitive: undefined,
			exception: ParseException,
			bindingContext: undefined
		};
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called");
		setTimeout(function() { // to wait for valueStateMessage in IE (otherwise it fails after control destroyed)
			assert.equal(iCount, 1, "change event fired once");
			assert.equal(sId, "F1", "change event fired on Field");
			assert.equal(sValue, "Invalid", "change event value");
			assert.notOk(bValid, "change event not valid");
			assert.equal(oContent.getValueState(), "Error", "ValueState set");
			assert.equal(oContent.getValueStateText(), "Value \"Invalid\" does not exist.", "ValueState text");
			let aConditions = oValueHelp.getConditions();
			assert.equal(aConditions.length, 1, "Condition set on ValueHelp");
			assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
			assert.ok(oValueHelp.close.called, "close called");
			aConditions = oCM.getConditions("Name");
			assert.equal(aConditions.length, 1, "two conditions in Codition model");
			assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");

			// allow "invalid" entry
			iCount = 0; sId = null; sValue = null; bValid = null;
			oValueHelp.setValidateInput(false);
			oContent._$input.val("Unknown");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
			setTimeout(function() { // to update value state
				assert.equal(iCount, 1, "change event fired once");
				assert.equal(sId, "F1", "change event fired on Field");
				assert.equal(sValue, "Unknown", "change event value");
				assert.ok(bValid, "change event valid");
				assert.equal(oContent.getValueState(), "None", "ValueState set");
				assert.equal(oContent.getValueStateText(), "", "ValueState text");
				let aConditions = oValueHelp.getConditions();
				assert.equal(aConditions.length, 1, "Condition set on ValueHelp");
				assert.equal(aConditions[0] && aConditions[0].values[0], "Unknown", "condition value");
				assert.ok(oValueHelp.close.called, "close called");
				aConditions = oCM.getConditions("Name");
				assert.equal(aConditions.length, 1, "two conditions in Codition model");
				assert.equal(aConditions[0] && aConditions[0].values[0], "Unknown", "condition value");

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("one ValueHelp on 2 Fields", async function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());

		const oCM2 = new ConditionModel();
		let oCondition = Condition.createCondition(OperatorName.EQ, ["I3"]);
		oCM2.addCondition("Name", oCondition);

		const oField2 = new FieldBase("F2", {
			conditions: "{cm2>/conditions/Name}",
			display: FieldDisplay.Description,
			valueHelp: oValueHelp,
			//			change: _myChangeHandler,
			liveChange: _myLiveChangeHandler,
			models: {cm2: oCM2}
		});
		oField2.fireChangeEvent = _myFireChange;
		oField2.attachEvent("change", _myChangeHandler);
		oField2.placeAt("content");
		await nextUIUpdate();

		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		const aContent2 = oField2.getAggregation("_content");
		const oContent2 = aContent2 && aContent2.length > 0 && aContent2[0];

		oCondition = Condition.createCondition(OperatorName.EQ, ["I1", "Item1"]);
		oValueHelp.fireSelect({ conditions: [oCondition] });
		let aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model of first Field");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I1", "condition value");
		aConditions = oCM2.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model of second Field");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I3", "condition value");

		oCondition = Condition.createItemCondition("I2", "Item2");
		oValueHelp.fireNavigated({ condition: oCondition });
		assert.equal(oContent._$input.val(), "Item2", "Field shown value");
		assert.equal(oContent2._$input.val(), "", "Field2 show no value");

		oField2.focus(); // as ValueHelp is connected with focus
		assert.ok(oValueHelp.fireDisconnect.called, "disconnect event fired");

		oCondition = Condition.createCondition(OperatorName.EQ, ["I1", "Item1"]);
		oValueHelp.fireSelect({ conditions: [oCondition] });
		aConditions = oCM.getConditions("Name");
		assert.equal(aConditions.length, 2, "two conditions in Codition model of first Field");
		assert.equal(aConditions[1] && aConditions[1].values[0], "I2", "condition value");
		aConditions = oCM2.getConditions("Name");
		assert.equal(aConditions.length, 1, "one condition in Codition model of second Field");
		assert.equal(aConditions[0] && aConditions[0].values[0], "I1", "condition value");

		oCondition = Condition.createItemCondition("I3", "Item3");
		oValueHelp.fireNavigated({ condition: oCondition });
		assert.equal(oContent._$input.val(), "", "Field shows no value");
		assert.equal(oContent2._$input.val(), "Item3", "Field2 shown value");

		oField2.destroy();
		oCM2.destroy();

	});

	QUnit.test("async parsing", function(assert) {

		bAsync = true;
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const fnDone = assert.async();
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		jQuery(oContent.getFocusDomRef()).val("Item3");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.notOk(sValue, "change event has no value");
		assert.ok(oPromise, "Promise returned");
		assert.equal(iSubmitCount, 1, "submit event fired once");
		assert.equal(sSubmitId, "F1", "submit event fired on Field");
		assert.ok(oSubmitPromise, "submit: Promise returned");
		oPromise.then(function(vResult) {
			assert.ok(vResult, "Promise resolved");
			const aConditions = oCM.getConditions("Name");
			assert.deepEqual(vResult, aConditions, "Promise result");
			assert.equal(aConditions.length, 2, "two conditions in Codition model");
			assert.equal(aConditions[1].values[0], "I3", "condition value");
			assert.equal(aConditions[1].values[1], "Item3", "condition value");
			assert.equal(aConditions[1].operator, OperatorName.EQ, "condition operator");
			const aTokens = oContent.getTokens ? oContent.getTokens() : [];
			assert.equal(aTokens.length, 2, "MultiInput has two Tokens");
			const oToken = aTokens[1];
			assert.equal(oToken && oToken.getText(), "Item3", "Text on token set");
			assert.ok(oValueHelp.onControlChange.calledOnce, "onControlChange called on ValueHelp");
			assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");

			oSubmitPromise.then(function(vResult) {
				assert.ok(vResult, "submit: Promise resolved");
				assert.deepEqual(vResult, aConditions, "submit: Promise result");
				fnDone();
			}).catch(function(oException) {
				assert.notOk(true, "submit: Promise must not be rejected");
				fnDone();
			});
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not be rejected");
			fnDone();
		});

	});

	QUnit.test("async parsing single value", async function(assert) {

		bAsync = true;
		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const fnDone = assert.async();
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		jQuery(oContent.getFocusDomRef()).val("Item3");
		oContent.fireLiveChange({ newValue: "Item3" });
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.ok(oPromise, "Promise returned");
		assert.ok(oField.hasPendingUserInput(), "user interaction after ENTER");
		oPromise.then(function(vResult) {
			assert.ok(vResult, "Promise resolved");
			const aConditions = oCM.getConditions("Name");
			assert.deepEqual(vResult, aConditions, "Promise result");
			assert.equal(aConditions.length, 1, "one condition in Codition model");
			assert.equal(aConditions[0].values[0], "I3", "condition value");
			assert.equal(aConditions[0].values[1], "Item3", "condition value");
			assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
			assert.ok(oValueHelp.onControlChange.calledOnce, "onControlChange called on ValueHelp");
			assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");
			assert.notOk(oField.hasPendingUserInput(), "no user interaction after Promise resolved");
			fnDone();
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not be rejected");
			fnDone();
		});

	});

	QUnit.test("async parsing single value and same result", async function(assert) {

		bAsync = true;
		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const fnDone = assert.async();
		oField.setConditions([Condition.createItemCondition("I3", "Item3")]);
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		jQuery(oContent.getFocusDomRef()).val("I3");
		oContent.fireLiveChange({ newValue: "I3" });
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.ok(oPromise, "Promise returned");
		assert.ok(oField.hasPendingUserInput(), "user interaction after ENTER");
		oPromise.then(function(vResult) {
			assert.ok(vResult, "Promise resolved");
			const aConditions = oCM.getConditions("Name");
			assert.deepEqual(vResult, aConditions, "Promise result");
			assert.equal(aConditions.length, 1, "one condition in Codition model");
			assert.equal(aConditions[0].values[0], "I3", "condition value");
			assert.equal(aConditions[0].values[1], "Item3", "condition value");
			assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
			assert.ok(oValueHelp.onControlChange.notCalled, "onControlChange not called on ValueHelp");
			assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");
			assert.notOk(oField.hasPendingUserInput(), "no user interaction after Promise resolved");
			fnDone();
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not be rejected");
			fnDone();
		});

	});

	QUnit.test("invalid input with async parsing", function(assert) {

		sinon.stub(FilterOperatorUtil, "getDefaultOperator").returns(FilterOperatorUtil.getOperator(OperatorName.Contains)); // fake contains as default operator
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setValidateInput(true);

		const fnGetItemsForValue = function(oConfig) {
			vGetItemsForValue = oConfig.value;
			if (oConfig.value === "Invalid") {
				return Promise.reject(new ParseException("InvalidValue"));
			} else if (oConfig.value === "Unknown") {
				return Promise.reject(new ParseException("UnknownValue"));
			} else if (oConfig.value === "Item9") {
				return Promise.reject(new ParseException("InvalidValue"));
			}
			return null;
		};
		oValueHelp.getItemForValue.restore();
		sinon.stub(oValueHelp, "getItemForValue").callsFake(fnGetItemsForValue);
		sinon.stub(oValueHelp, "isOpen").returns(true); // to simulate open suggestion

		const fnDone = assert.async();

		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent._$input.val("=Invalid");
		oContent.fireLiveChange({ newValue: "=Invalid" });
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

		assert.equal(vGetItemsForValue, "Invalid", "getItemForValue called");
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.ok(oPromise, "Promise returned");
		assert.ok(oField.hasPendingUserInput(), "user interaction after ENTER");
		oPromise.then(function(vResult) {
			assert.ok(true, "Promise must be resolved");

			setTimeout(function() { // for model update
				setTimeout(function() { // for ManagedObjectModel update
					assert.equal(oContent.getValueState(), "None", "ValueState set");
					assert.equal(oContent.getValueStateText(), "", "ValueStateText");
					let aConditions = oCM.getConditions("Name");
					assert.equal(aConditions.length, 2, "two condition in Codition model");
					assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
					assert.equal(aConditions[1] && aConditions[1].operator, OperatorName.EQ, "condition operator");
					assert.equal(aConditions[1] && aConditions[1].values[0], "Invalid", "condition value");
					assert.equal(aConditions[1] && aConditions[1].validated, ConditionValidated.NotValidated, "condition not validated");
					aConditions = oValueHelp.getConditions();
					assert.equal(aConditions.length, 2, "Conditions set on ValueHelp");
					assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
					assert.equal(aConditions[1] && aConditions[1].operator, OperatorName.EQ, "condition operator");
					assert.equal(aConditions[1] && aConditions[1].values[0], "Invalid", "condition value");
					assert.equal(aConditions[1] && aConditions[1].validated, ConditionValidated.NotValidated, "condition not validated");
					assert.ok(oValueHelp.close.called, "close called");
					assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");
					assert.notOk(oField.hasPendingUserInput(), "no user interaction after Promise rejected");
					assert.ok(oValueHelp.onControlChange.called, "onControlChange called on ValueHelp");

					// use default operator
					vGetItemsForValue = undefined;
					iCount = 0; sId = null; sValue = null; bValid = null; oPromise = null;
					oContent._$input.val("Invalid");
					qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

					assert.equal(vGetItemsForValue, "Invalid", "getItemForValue called");
					assert.equal(iCount, 1, "change event fired once");
					assert.equal(sId, "F1", "change event fired on Field");
					assert.ok(oPromise, "Promise returned");
					oPromise.then(function(vResult) {
						assert.ok(true, "Promise must be resolved");
						setTimeout(function() { // for model update
							setTimeout(function() { // for ManagedObjectModel update
								assert.equal(oContent.getValueState(), "None", "ValueState set");
								assert.equal(oContent.getValueStateText(), "", "ValueStateText");
								aConditions = oValueHelp.getConditions();
								assert.equal(aConditions.length, 3, "Conditions set on ValueHelp");
								assert.equal(aConditions[1] && aConditions[2].operator, OperatorName.Contains, "condition operator");
								assert.equal(aConditions[1] && aConditions[2].values[0], "Invalid", "condition value");
								assert.ok(oValueHelp.close.called, "close called");
								aConditions = oCM.getConditions("Name");
								assert.deepEqual(vResult, aConditions, "Promise result");
								assert.equal(aConditions.length, 3, "thtee conditions in Codition model");
								assert.equal(aConditions[1] && aConditions[2].operator, OperatorName.Contains, "condition operator");
								assert.equal(aConditions[1] && aConditions[2].values[0], "Invalid", "condition value");
								assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");

								// allow "invalid" entry
								iCount = 0; sId = null; sValue = null; bValid = null; oPromise = null;
								oValueHelp.setValidateInput(false);
								oContent._$input.val("=Unknown");
								qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
								assert.equal(iCount, 1, "change event fired once");
								assert.equal(sId, "F1", "change event fired on Field");
								assert.ok(oPromise, "Promise returned");
								oPromise.then(function(vResult) {
									assert.ok(true, "Promise must be resolved");
									setTimeout(function() { // for model update
										setTimeout(function() { // for ManagedObjectModel update
											assert.equal(oContent.getValueState(), "None", "ValueState set");
											assert.equal(oContent.getValueStateText(), "", "ValueState text");
											aConditions = oValueHelp.getConditions();
											assert.equal(aConditions.length, 4, "Conditions set on ValueHelp");
											assert.equal(aConditions[2] && aConditions[3].operator, OperatorName.EQ, "condition operator");
											assert.equal(aConditions[2] && aConditions[3].values[0], "Unknown", "condition value");
											assert.equal(aConditions[1] && aConditions[3].validated, ConditionValidated.NotValidated, "condition not validated");
											assert.ok(oValueHelp.close.called, "close called");
											aConditions = oCM.getConditions("Name");
											assert.deepEqual(vResult, aConditions, "Promise result");
											assert.equal(aConditions.length, 4, "four conditions in Codition model");
											assert.equal(aConditions[2] && aConditions[3].operator, OperatorName.EQ, "condition operator");
											assert.equal(aConditions[2] && aConditions[3].values[0], "Unknown", "condition value");
											assert.equal(aConditions[1] && aConditions[3].validated, ConditionValidated.NotValidated, "condition not validated");
											assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");

											// validation error
											iCount = 0; sId = null; sValue = null; bValid = null; oPromise = null;
											oValueHelp.onControlChange.resetHistory();
											oContent._$input.val("=Item9");
											qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
											assert.equal(iCount, 1, "change event fired once");
											assert.equal(sId, "F1", "change event fired on Field");
											assert.ok(oPromise, "Promise returned");
											oPromise.then(function(vResult) {
												assert.notOk(true, "Promise must not be resolved");

												FilterOperatorUtil.getDefaultOperator.restore();
												fnDone();
											}).catch(function(oException) {
												assert.ok(true, "Promise must be rejected");
												assert.ok(oException.message.startsWith("Enter a valid value"));
												assert.notOk(oValueHelp.onControlChange.called, "onControlChange not called on ValueHelp");
												setTimeout(function() { // for model update
													setTimeout(function() { // for ManagedObjectModel update
														assert.equal(oContent.getValueState(), "Error", "ValueState set");
														assert.ok(oContent.getValueStateText().startsWith("Enter a valid value"), "ValueStateText");
														aConditions = oCM.getConditions("Name");
														assert.equal(aConditions.length, 4, "four conditions in Codition model");
														aConditions = oValueHelp.getConditions();
														assert.equal(aConditions.length, 4, "Conditions set on ValueHelp");
														assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");

														FilterOperatorUtil.getDefaultOperator.restore();
														fnDone();
													}, 0);
												}, 0);
											});
										}, 0);
									}, 0);
								}).catch(function(oException) {
									assert.notOk(true, "Promise must not be rejected");

									FilterOperatorUtil.getDefaultOperator.restore();
									fnDone();
								});
							}, 0);
						}, 0);
					}).catch(function(oException) {
						assert.notOk(true, "Promise must not be rejected");

						FilterOperatorUtil.getDefaultOperator.restore();
						fnDone();
					});
				}, 0);
			}, 0);
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not be rejected");
			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		});

	});

	QUnit.test("invalid input with async parsing on singleValue Field", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.setValidateInput(true);
		const fnGetItemsForValue = function(oConfig) {
			vGetItemsForValue = oConfig.value;
			if (oConfig.value === "Invalid") {
				return Promise.reject(new ParseException("InvalidValue"));
			} else if (oConfig.value === "Unknown") {
				return Promise.reject(new ParseException("UnknownValue"));
			} else if (oConfig.value === "Item9") {
				return Promise.reject(new ParseException("InvalidValue"));
			} else if (oConfig.value === "") { // "" is parsed to empty condition if not found on ValueHelp -> null don't meet Type constraints
				return Promise.reject(new ParseException("NoEmptyItem"));
			}
			return null;
		};
		oValueHelp.getItemForValue.restore();
		sinon.stub(oValueHelp, "getItemForValue").callsFake(fnGetItemsForValue);
		sinon.stub(oValueHelp, "isOpen").returns(true); // to simulate open suggestion

		const oType = oField._oContentFactory.retrieveDataType();
		sinon.stub(oType, "validateValue").withArgs(null).throws(new ValidateException("NoNull")); // fake null not allowd
		oType.validateValue.callThrough();

		const fnDone = assert.async();
		oField.focus(); // as ValueHelp is connected with focus
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oContent._$input.val("Invalid");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);

		assert.equal(vGetItemsForValue, "Invalid", "getItemForValue called");
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "F1", "change event fired on Field");
		assert.ok(oPromise, "Promise returned");
		oPromise.then(function(vResult) {
			assert.notOk(true, "Promise must not be resolved");
			fnDone();
		}).catch(function(oException) {
			assert.ok(true, "Promise must be rejected");
			assert.equal(oException.message, "InvalidValue");
			assert.notOk(oValueHelp.onControlChange.called, "onControlChange not called on ValueHelp");
			setTimeout(function() { // for model update
				setTimeout(function() { // for ManagedObjectModel update
					assert.equal(oContent.getValueState(), "Error", "ValueState set");
					assert.equal(oContent.getValueStateText(), "InvalidValue", "ValueState text");
					let aConditions = oValueHelp.getConditions();
					assert.equal(aConditions.length, 1, "Condition set on ValueHelp");
					assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
					assert.ok(oValueHelp.close.called, "close called");
					aConditions = oCM.getConditions("Name");
					assert.equal(aConditions.length, 1, "two conditions in Codition model");
					assert.equal(aConditions[0] && aConditions[0].values[0], "I2", "condition value");
					assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");

					// allow "invalid" entry
					iCount = 0; sId = null; sValue = null; bValid = null; oPromise = null;
					oValueHelp.setValidateInput(false);
					oContent._$input.val("Unknown");
					qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
					assert.equal(iCount, 1, "change event fired once");
					assert.equal(sId, "F1", "change event fired on Field");
					assert.ok(oPromise, "Promise returned");
					oPromise.then(function(vResult) {
						assert.ok(true, "Promise must be resolved");
						setTimeout(function() { // for model update
							setTimeout(function() { // for ManagedObjectModel update
								assert.equal(oContent.getValueState(), "None", "ValueState set");
								assert.equal(oContent.getValueStateText(), "", "ValueState text");
								aConditions = oValueHelp.getConditions();
								assert.equal(aConditions.length, 1, "Condition set on ValueHelp");
								assert.equal(aConditions[0] && aConditions[0].values[0], "Unknown", "condition value");
								assert.ok(oValueHelp.close.called, "close called");
								aConditions = oCM.getConditions("Name");
								assert.deepEqual(vResult, aConditions, "Promise result");
								assert.equal(aConditions.length, 1, "one condition in Codition model");
								assert.equal(aConditions[0] && aConditions[0].values[0], "Unknown", "condition value");
								assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");

								// validation error
								iCount = 0; sId = null; sValue = null; bValid = null; oPromise = null;
								oValueHelp.onControlChange.resetHistory();
								oContent._$input.val("Item9");
								qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
								assert.equal(iCount, 1, "change event fired once");
								assert.equal(sId, "F1", "change event fired on Field");
								assert.ok(oPromise, "Promise returned");
								oPromise.then(function(vResult) {
									assert.notOk(true, "Promise must not be resolved");
									fnDone();
								}).catch(function(oException) {
									assert.ok(true, "Promise must be rejected");
									assert.ok(oException.message.startsWith("Enter a valid value"));
									assert.notOk(oValueHelp.onControlChange.called, "onControlChange not called on ValueHelp");
									setTimeout(function() { // for model update
										setTimeout(function() { // for ManagedObjectModel update
											assert.equal(oContent.getValueState(), "Error", "ValueState set");
											assert.ok(oContent.getValueStateText().startsWith("Enter a valid value"), "ValueStateText");
											aConditions = oCM.getConditions("Name");
											assert.equal(aConditions.length, 1, "one condition in Codition model");
											assert.equal(aConditions[0] && aConditions[0].values[0], "Unknown", "condition value");
											aConditions = oValueHelp.getConditions();
											assert.equal(aConditions.length, 1, "Condition set on ValueHelp");
											assert.equal(aConditions[0] && aConditions[0].values[0], "Unknown", "condition value");
											assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");

											// empty key is invalid value
											iCount = 0; sId = null; sValue = null; bValid = null; oPromise = null;
											oValueHelp.onControlChange.resetHistory();
											oContent._$input.val("");
											qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
											assert.equal(iCount, 1, "change event fired once");
											assert.equal(sId, "F1", "change event fired on Field");
											assert.ok(oPromise, "Promise returned");
											oPromise.then(function(vResult) {
												assert.notOk(true, "Promise must not be resolved");
												fnDone();
											}).catch(function(oException) {
												assert.ok(true, "Promise must be rejected");
												assert.equal(oException.message, "NoNull");
												assert.notOk(oValueHelp.onControlChange.called, "onControlChange not called on ValueHelp");
												setTimeout(function() { // for model update
													setTimeout(function() { // for ManagedObjectModel update
														assert.equal(oContent.getValueState(), "Error", "ValueState set");
														assert.equal(oContent.getValueStateText(), "NoNull", "ValueStateText");
														aConditions = oCM.getConditions("Name");
														assert.equal(aConditions.length, 1, "one condition in Codition model");
														assert.equal(aConditions[0] && aConditions[0].values[0], "Unknown", "condition value");
														aConditions = oValueHelp.getConditions();
														assert.equal(aConditions.length, 1, "Condition set on ValueHelp");
														assert.equal(aConditions[0] && aConditions[0].values[0], "Unknown", "condition value");
														assert.equal(oField._aAsyncChanges.length, 0, "no async changes stored in Field");
														fnDone();
													}, 0);
												}, 0);
											});
										}, 0);
									}, 0);
								});
							}, 0);
						}, 0);
					}).catch(function(oException) {
						assert.notOk(true, "Promise must not be rejected");
						fnDone();
					});
				}, 0);
			}, 0);
		});

	});

	QUnit.test("aria attributes on multi Field", async function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		const oVHIcon = oContent && oContent.getAggregation("_endIcon", [])[1];
		const $FocusDomRef = jQuery(oField.getFocusDomRef());
		const oResourceBundle = Library.getResourceBundleFor("sap.m");
		const sText = oResourceBundle.getText("MULTIINPUT_ARIA_ROLE_DESCRIPTION");
		const sValueHelpEnabledID = InvisibleText.getStaticId("sap.m", "INPUT_VALUEHELP");

		oField.focus(); // as ValueHelp is connected with focus

		assert.equal($FocusDomRef.attr("role"), "combobox", "Role Combobox set");
		assert.equal($FocusDomRef.attr("aria-roledescription"), sText, "Role Description set - default from MultiInput");
		assert.equal($FocusDomRef.attr("aria-haspopup"), "listbox", "aria-haspopup set");
		assert.equal($FocusDomRef.attr("autocomplete"), "off", "autocomplete off set");
		assert.equal($FocusDomRef.attr("aria-expanded"), "false", "aria-expanded set to false");
		assert.notOk($FocusDomRef.attr("aria-controls"), "aria-controls not set");
		assert.notOk($FocusDomRef.attr("aria-activedescendant"), "aria-activedescendant not set");
		assert.ok($FocusDomRef.attr("aria-describedby") && $FocusDomRef.attr("aria-describedby").search(sValueHelpEnabledID) >= 0, "ValueHelpEnabled text set");

		// open ValueHelp
		oValueHelp.getAriaAttributes.returns({ // fake attributes. Real attributes tested in ValueHelp unit tests
			contentId: "Test",
			role: "combobox",
			roleDescription: "RoleDescription",
			ariaHasPopup: "listbox",
			valueHelpEnabled: false
		});
		oVHIcon.firePress();
		sinon.stub(oValueHelp, "isOpen").returns(true);
		oValueHelp.fireOpened({itemId: "myItem"});
		await nextUIUpdate();
		assert.equal($FocusDomRef.attr("role"), "combobox", "Open: Role Combobox set");
		assert.equal($FocusDomRef.attr("aria-roledescription"), "RoleDescription", "Open: Role Description set - from ValueHelp");
		assert.equal($FocusDomRef.attr("aria-haspopup"), "listbox", "Open: aria-haspopup set");
		assert.equal($FocusDomRef.attr("autocomplete"), "off", "Open: autocomplete off set");
		assert.equal($FocusDomRef.attr("aria-expanded"), "true", "Open: aria-expanded set to true");
		assert.equal($FocusDomRef.attr("aria-controls"), "Test", "Open: aria-controls set");
		assert.notOk($FocusDomRef.attr("aria-activedescendant"), "Open: aria-activedescendant not set");

		oValueHelp.close();
		oValueHelp.fireClosed();
		await nextUIUpdate();

		assert.equal($FocusDomRef.attr("aria-expanded"), "false", "Closed: aria-expanded set to false");
		assert.notOk($FocusDomRef.attr("aria-controls"), "Closed: aria-controls not set");
		assert.notOk($FocusDomRef.attr("aria-activedescendant"), "Closed: aria-activedescendant not set");
		assert.notOk($FocusDomRef.attr("aria-describedby") && $FocusDomRef.attr("aria-describedby").search(sValueHelpEnabledID) >= 0, "ValueHelpEnabled text not set");

		oValueHelp.fireNavigated({ condition: Condition.createItemCondition("I3", "Item 3"), itemId: "ItemId"});
		await nextUIUpdate();
		assert.equal($FocusDomRef.attr("aria-expanded"), "true", "Navigation: aria-expanded set to true");
		assert.equal($FocusDomRef.attr("aria-controls"), "Test", "Navigation: aria-controls set");
		assert.equal($FocusDomRef.attr("aria-activedescendant"), "ItemId", "Navigation: aria-activedescendant set");

		oValueHelp.close();

		oField.setValueHelp();
		await nextUIUpdate();
		assert.notOk($FocusDomRef.attr("role"), "no Help: no Role set");
		assert.equal($FocusDomRef.attr("aria-roledescription"), sText, "no Help: Role Description set to MultiInput default");
		assert.notOk($FocusDomRef.attr("aria-haspopup"), "no Help: aria-haspopup not set");
		assert.equal($FocusDomRef.attr("autocomplete"), "off", "no Help: autocomplete set from Input");
		assert.notOk($FocusDomRef.attr("aria-expanded"), "no Help: aria-expanded not set");
		assert.notOk($FocusDomRef.attr("aria-controls"), "no Help: aria-controls not set");
		assert.notOk($FocusDomRef.attr("aria-activedescendant"), "no Help: aria-activedescendant not set");

	});

	QUnit.test("aria attributes on single Field", async function(assert) {

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		const oVHIcon = oContent && oContent.getAggregation("_endIcon", [])[0];
		const $FocusDomRef = jQuery(oField.getFocusDomRef());
		const sValueHelpEnabledID = InvisibleText.getStaticId("sap.m", "INPUT_VALUEHELP");

		oField.focus(); // as ValueHelp is connected with focus

		assert.equal($FocusDomRef.attr("role"), "combobox", "Role Combobox set");
		assert.equal($FocusDomRef.attr("aria-haspopup"), "listbox", "aria-haspopup set");
		assert.equal($FocusDomRef.attr("autocomplete"), "off", "autocomplete off set");
		assert.equal($FocusDomRef.attr("aria-expanded"), "false", "aria-expanded set to false");
		assert.notOk($FocusDomRef.attr("aria-controls"), "aria-controls not set");
		assert.notOk($FocusDomRef.attr("aria-activedescendant"), "aria-activedescendant not set");
		assert.ok($FocusDomRef.attr("aria-describedby") && $FocusDomRef.attr("aria-describedby").search(sValueHelpEnabledID) >= 0, "ValueHelpEnabled text set");

		// open ValueHelp
		oValueHelp.getAriaAttributes.returns({ // fake attributes. Real attributes tested in ValueHelp unit tests
			contentId: "Test",
			role: "combobox",
			roleDescription: "RoleDescription",
			ariaHasPopup: "listbox",
			valueHelpEnabled: false
		});
		oVHIcon.firePress();
		sinon.stub(oValueHelp, "isOpen").returns(true);
		oValueHelp.fireOpened({itemId: "myItem"});
		await nextUIUpdate();
		assert.equal($FocusDomRef.attr("aria-expanded"), "true", "Open: aria-expanded set to true");
		assert.equal($FocusDomRef.attr("aria-controls"), "Test", "Open: aria-controls set");
		assert.equal($FocusDomRef.attr("aria-activedescendant"), "myItem", "Open: aria-activedescendant set");
		assert.notOk(oContent.hasStyleClass("sapMFocus"), "Focus outline removed");

		oValueHelp.close();
		oValueHelp.fireClosed();
		await nextUIUpdate();

		assert.equal($FocusDomRef.attr("aria-expanded"), "false", "Closed: aria-expanded set to false");
		assert.notOk($FocusDomRef.attr("aria-controls"), "Closed: aria-controls not set");
		assert.notOk($FocusDomRef.attr("aria-activedescendant"), "Closed: aria-activedescendant not set");
		assert.notOk($FocusDomRef.attr("aria-describedby") && $FocusDomRef.attr("aria-describedby").search(sValueHelpEnabledID) >= 0, "ValueHelpEnabled text not set");
		assert.ok(oContent.hasStyleClass("sapMFocus"), "Focus outline restored");

		oValueHelp.fireNavigated({ condition: Condition.createItemCondition("I3", "Item 3"), itemId: "ItemId"});
		await nextUIUpdate();
		assert.equal($FocusDomRef.attr("aria-expanded"), "true", "Navigation: aria-expanded set to true");
		assert.equal($FocusDomRef.attr("aria-controls"), "Test", "Navigation: aria-controls set");
		assert.equal($FocusDomRef.attr("aria-activedescendant"), "ItemId", "Navigation: aria-activedescendant set");

		oValueHelp.close();

		oField.setValueHelp();
		await nextUIUpdate();
		assert.notOk($FocusDomRef.attr("role"), "no Help: no Role set");
		assert.notOk($FocusDomRef.attr("aria-haspopup"), "no Help: aria-haspopup not set");
		assert.equal($FocusDomRef.attr("autocomplete"), "off", "no Help: autocomplete set from Input");
		assert.notOk($FocusDomRef.attr("aria-expanded"), "no Help: aria-expanded not set");
		assert.notOk($FocusDomRef.attr("aria-controls"), "no Help: aria-controls not set");
		assert.notOk($FocusDomRef.attr("aria-activedescendant"), "no Help: aria-activedescendant not set");

	});

	QUnit.test("aria attributes on single Field with only typeahed", async function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oValueHelp.getIcon.returns(null); // no icon
		oValueHelp.getAriaAttributes.returns({ // fake attributes. Real attributes tested in ValueHelp unit tests
			contentId: "Test",
			role: null,
			roleDescription: undefined,
			ariaHasPopup: "listbox",
			valueHelpEnabled: false
		});
		oField.setValueHelp(); // to retrigger check for icon
		oField.setValueHelp(oValueHelp);

		sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
		oField.setMaxConditions(1);
		await nextUIUpdate();
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		const oVHIcon = oContent && oContent.getAggregation("_endIcon", [])[0];
		const $FocusDomRef = jQuery(oField.getFocusDomRef());
		const sValueHelpEnabledID = InvisibleText.getStaticId("sap.m", "INPUT_VALUEHELP");

		oField.focus(); // as ValueHelp is connected with focus

		assert.notOk(oVHIcon, "No value help icon");
		assert.notOk($FocusDomRef.attr("role"), "No role set");
		assert.equal($FocusDomRef.attr("aria-haspopup"), "listbox", "aria-haspopup set");
		assert.equal($FocusDomRef.attr("autocomplete"), "off", "autocomplete off set");
		assert.notOk($FocusDomRef.attr("aria-expanded"), "aria-expanded not set");
		assert.notOk($FocusDomRef.attr("aria-controls"), "aria-controls not set");
		assert.notOk($FocusDomRef.attr("aria-activedescendant"), "aria-activedescendant not set");
		assert.ok(!$FocusDomRef.attr("aria-describedby") || $FocusDomRef.attr("aria-describedby").search(sValueHelpEnabledID) < 0, "ValueHelpEnabled text not set");

	});

	QUnit.test("external control", async function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const oVHContent = new Content("C1");
		const oVHPopover = new Popover("P1", {content: oVHContent});
		sinon.stub(oVHPopover, "getUseAsValueHelp").returns(true); // simulate ComboBox case
		sinon.stub(oValueHelp, "isTypeaheadSupported").returns(Promise.resolve(true));
		oValueHelp.setTypeahead(oVHPopover);
		const oConditionsType = new ConditionsType();
		const oInput = new Input("I1", {value: {path: '$field>/conditions', type: oConditionsType}});

		oField.setMaxConditions(1);
		oField.setContent(oInput);
		await nextUIUpdate();

		oField.focus(); // as ValueHelp is connected with focus

		const fnDone = assert.async();
		assert.ok(oInput.getShowValueHelp(), "Input has value help");
		assert.equal(oInput.getValueHelpIconSrc(), oValueHelp.getIcon(), "ValueHelpIcon set");
		oInput._$input.val("I");
		oInput.fireLiveChange({ value: "I" });

		setTimeout(function() { // to wait for Promises and opening
			setTimeout(function() { // second timeout because poipover opens async
				assert.ok(oValueHelp.open.calledWith(true), "oValueHelp opened as suggestion");
				assert.equal(oValueHelp.getFilterValue(), "I", "FilterValue set");

				oValueHelp.open.reset();
				oValueHelp.close();
				setTimeout(function() { // to wait for Promises and close
					oInput.fireValueHelpRequest();
					setTimeout(function() { // to wait for Promises and opening
						assert.ok(oValueHelp.open.calledWith(false), "oValueHelp opened as value help");

						oValueHelp.close();
						setTimeout(function() { // to wait for Promises and close
							fnDone();
						}, 400);
					}, 400);
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.test("Autocomplete", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const oIconContent = new Icon("I3", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }); // just dummy handler to make Icon focusable
		const oVHContent = new ListContent("C1", {caseSensitive: true});
		sinon.stub(oVHContent, "getContent").returns(Promise.resolve(oIconContent));
		sinon.stub(oVHContent, "isFocusInHelp").returns(true);
		const oVHPopover = new Popover("P1", {content: oVHContent});
		oValueHelp.setTypeahead(oVHPopover);

		const fnDone = assert.async();
		oField.focus(); // as ValueHelp is connected with focus
		let aContent = oField.getAggregation("_content");
		let oContent = aContent && aContent.length > 0 && aContent[0];
		oContent._$input.val("I");
		oContent.fireLiveChange({ value: "I" });

		setTimeout(async function() { // to wait for Promises and opening
			let oCondition = Condition.createItemCondition("I1", "Item1");
			oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "I", itemId: "myItem", caseSensitive: true});
			assert.equal(oContent._$input.val(), "Item1", "Output text");
			// jQuery Plugin "cursorPos"
			assert.equal(oContent._$input.cursorPos(), 1, "CursorPosition");
			assert.equal(oContent.getFocusDomRef().selectionStart, 1, "Selection start");
			assert.equal(oContent.getFocusDomRef().selectionEnd, 5, "Selection end");
			const oAriaAttributes = oField.getProperty("_ariaAttributes");
			assert.equal(oAriaAttributes.aria.activedescendant, "myItem", "Aria-activedescendant");

			oField.setDisplay(FieldDisplay.Value); // destroys and creates new content
			await nextUIUpdate();
			aContent = oField.getAggregation("_content");
			// eslint-disable-next-line require-atomic-updates
			oContent = aContent && aContent.length > 0 && aContent[0];
			oContent.focus();
			oContent._$input.val("i");
			oContent.fireLiveChange({ value: "i" });

			setTimeout(async function() { // to wait for Promises and opening
				oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "i", itemId: "myItem", caseSensitive: true});
				assert.equal(oContent._$input.val(), "i", "Output text");
				// jQuery Plugin "cursorPos"
				assert.equal(oContent._$input.cursorPos(), 1, "CursorPosition");
				assert.equal(oContent.getFocusDomRef().selectionStart, 1, "Selection start");
				assert.equal(oContent.getFocusDomRef().selectionEnd, 1, "Selection end");

				oVHContent.setCaseSensitive(false);
				oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "i", itemId: "myItem", caseSensitive: false});
				assert.equal(oContent._$input.val(), "i1", "Output text");
				// jQuery Plugin "cursorPos"
				assert.equal(oContent._$input.cursorPos(), 1, "CursorPosition");
				assert.equal(oContent.getFocusDomRef().selectionStart, 1, "Selection start");
				assert.equal(oContent.getFocusDomRef().selectionEnd, 2, "Selection end");

				oField.setDisplay(FieldDisplay.DescriptionValue); // destroys and creates new content
				await nextUIUpdate();
				aContent = oField.getAggregation("_content");
				// eslint-disable-next-line require-atomic-updates
				oContent = aContent && aContent.length > 0 && aContent[0];
				oContent.focus();
				oContent._$input.val("I");
				oContent.fireLiveChange({ value: "I" });

				setTimeout(async function() { // to wait for Promises and opening
					oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "I", itemId: "myItem", caseSensitive: false});
					assert.equal(oContent._$input.val(), "Item1", "Output text");
					// jQuery Plugin "cursorPos"
					assert.equal(oContent._$input.cursorPos(), 1, "CursorPosition");
					assert.equal(oContent.getFocusDomRef().selectionStart, 1, "Selection start");
					assert.equal(oContent.getFocusDomRef().selectionEnd, 5, "Selection end");

					oCondition = Condition.createItemCondition("I1", "myItem1");
					oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "I", itemId: "myItem", caseSensitive: false});
					assert.equal(oContent._$input.val(), "I1", "Output text");
					// jQuery Plugin "cursorPos"
					assert.equal(oContent._$input.cursorPos(), 1, "CursorPosition");
					assert.equal(oContent.getFocusDomRef().selectionStart, 1, "Selection start");
					assert.equal(oContent.getFocusDomRef().selectionEnd, 2, "Selection end");

					oField.setDisplay(FieldDisplay.ValueDescription); // destroys and creates new content
					await nextUIUpdate();
					aContent = oField.getAggregation("_content");
					// eslint-disable-next-line require-atomic-updates
					oContent = aContent && aContent.length > 0 && aContent[0];
					oContent.focus();
					oContent._$input.val("I");
					oContent.fireLiveChange({ value: "I" });

					setTimeout(function() { // to wait for Promises and opening
						oCondition = Condition.createItemCondition("I1", "Item1");
						oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "I", itemId: "myItem", caseSensitive: false});
						assert.equal(oContent._$input.val(), "I1", "Output text");
						// jQuery Plugin "cursorPos"
						assert.equal(oContent._$input.cursorPos(), 1, "CursorPosition");
						assert.equal(oContent.getFocusDomRef().selectionStart, 1, "Selection start");
						assert.equal(oContent.getFocusDomRef().selectionEnd, 2, "Selection end");

						oContent._$input.val("It");
						oContent.fireLiveChange({ value: "It" });

						setTimeout(function() { // to wait for Promises and opening
							oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "I", itemId: "myItem", caseSensitive: false}); // outdated FilterValue
							assert.equal(oContent._$input.val(), "It", "Output text");
							// jQuery Plugin "cursorPos"
							assert.equal(oContent._$input.cursorPos(), 2, "CursorPosition");
							assert.equal(oContent.getFocusDomRef().selectionStart, 2, "Selection start");
							assert.equal(oContent.getFocusDomRef().selectionEnd, 2, "Selection end");

							oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "It", itemId: "myItem", caseSensitive: false}); // now description must be used
							assert.equal(oContent._$input.val(), "Item1", "Output text");
							// jQuery Plugin "cursorPos"
							assert.equal(oContent._$input.cursorPos(), 2, "CursorPosition");
							assert.equal(oContent.getFocusDomRef().selectionStart, 2, "Selection start");
							assert.equal(oContent.getFocusDomRef().selectionEnd, 5, "Selection end");

							oContent._$input.val("Ite");
							oContent.fireLiveChange({ value: "Ite" }); // don't wait for debounce
							oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "It", itemId: "myItem", caseSensitive: false}); // outdated
							assert.equal(oContent._$input.val(), "Ite", "Output text");
							// jQuery Plugin "cursorPos"
							assert.equal(oContent._$input.cursorPos(), 3, "CursorPosition");
							assert.equal(oContent.getFocusDomRef().selectionStart, 3, "Selection start");
							assert.equal(oContent.getFocusDomRef().selectionEnd, 3, "Selection end");

							oValueHelp.close(); // to be sure
							oIconContent.destroy();

							oContent._$input.val("=I");
							oContent.fireLiveChange({ value: "=I" }); // with operator symbol autocomplete should be deactivated

							setTimeout(function() { // to wait for Promises and opening
								oCondition = Condition.createItemCondition("I1", "Item1");
								oValueHelp.fireTypeaheadSuggested({condition: oCondition, filterValue: "I", itemId: "myItem", caseSensitive: false});
								assert.equal(oContent._$input.val(), "=I", "Output text");
								// jQuery Plugin "cursorPos"
								assert.equal(oContent._$input.cursorPos(), 2, "CursorPosition");
								assert.equal(oContent.getFocusDomRef().selectionStart, 2, "Selection start");
								assert.equal(oContent.getFocusDomRef().selectionEnd, 2, "Selection end");

								oValueHelp.close(); // to be sure
								oIconContent.destroy();
								fnDone();
							}, 400);
						}, 400);
					}, 400);
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.module("ValueHelp for currency", {
		beforeEach: async function() {
			const oValueHelp = new ValueHelp("F1-H", {validateInput: true});
			sinon.stub(oValueHelp, "isValidationSupported").returns(true); // otherwise it will not be taken to determine key or description
			sinon.stub(oValueHelp, "isTypeaheadSupported").returns(Promise.resolve(true)); // to simulate suggestion
			sinon.stub(oValueHelp, "getIcon").returns("sap-icon://sap-ui5");

			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				dataType: "sap.ui.model.type.Currency",
				maxConditions: 1,
				conditions: "{cm>/conditions/Price}",
				valueHelp: oValueHelp,
				liveChange: _myLiveChangeHandler,
				models: {cm: oCM}
			});
			sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			const oCondition = Condition.createCondition(OperatorName.EQ, [[123.45, "USD"]]);
			oCM.addCondition("Price", oCondition);

			oCM.checkUpdate(true, false); // to update bindings
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			const oValueHelp = Element.getElementById("F1-H");
			if (oValueHelp) {
				oValueHelp.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
			FieldBase._init();
		}
	});

	QUnit.test("Select currency", async function(assert) {

		const oIntType = new IntegerType();
		const oStringType = new StringType();
		oField._oContentFactory.setCompositeTypes([oIntType, oStringType]); // fake composite types

		const oIcon = new Icon("I1", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }).placeAt("content");
		await nextUIUpdate();

		const fnDone = assert.async();
		const oValueHelp = Element.getElementById(oField.getValueHelp());
		sinon.spy(oValueHelp, "connect");

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		const oContent2 = aContent && aContent.length > 1 && aContent[1];
		assert.notOk(oContent1.getShowValueHelp(), "Number Input has no value help");
		assert.ok(oContent2.getShowValueHelp(), "Currency Input has value help");

		oContent2.focus(); // as ValueHelp is connected with focus
		assert.ok(oValueHelp.connect.calledOnce, "ValueHelp connected");
		assert.equal(oValueHelp.connect.args[0][0], oField, "ValueHelp connected to Field");
		assert.equal(oValueHelp.connect.args[0][1].dataType, oStringType, "Type of currency part used for ValueHelp");
		// simulate select event to see if field is updated
		let oCondition = Condition.createCondition(OperatorName.EQ, ["EUR", "EUR"], {inTest: "X"}, {outTest: "Y"}, ConditionValidated.Validated, {payloadTest: "Z"});
		oValueHelp.fireSelect({ conditions: [oCondition] });
		assert.equal(iCount, 0, "Change Event not fired");
		let aConditions = oCM.getConditions("Price");
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0][0], 123.45, "condition value0");
		assert.equal(aConditions[0].values[0][1], "EUR", "condition value1");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.ok(aConditions[0].hasOwnProperty("inParameters"), "Condition has in-partameters");
		assert.equal(aConditions[0].inParameters.inTest, "X", "In-parameter value");
		assert.ok(aConditions[0].hasOwnProperty("outParameters"), "Condition has out-partameters");
		assert.equal(aConditions[0].outParameters.outTest, "Y", "Out-parameter value");
		assert.ok(aConditions[0].hasOwnProperty("payload"), "Condition has payload");
		assert.equal(aConditions[0].payload.payloadTest, "Z", "payload value");
		assert.equal(oContent2.getDOMValue(), "EUR", "value in inner control");

		setTimeout(function() { // wait for Model update
			oIcon.focus();
			setTimeout(function() { // for fieldGroup delay
				assert.equal(iCount, 1, "Change Event fired");
				oContent2.focus(); // as ValueHelp is connected with focus

				oCM.removeAllConditions();
				setTimeout(function() { // wait for Model update
					oCondition = Condition.createCondition(OperatorName.EQ, ["USD", "USD"], {inTest: "X"}, {outTest: "Y"}, ConditionValidated.Validated, {payloadTest: "Z"});
					oValueHelp.fireSelect({ conditions: [oCondition] });
					aConditions = oCM.getConditions("Price");
					assert.equal(aConditions.length, 1, "one condition in Codition model");
					assert.equal(aConditions[0].values[0][0], undefined, "condition value0");
					assert.equal(aConditions[0].values[0][1], "USD", "condition value1");
					assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
					assert.ok(aConditions[0].hasOwnProperty("inParameters"), "Condition has in-partameters");
					assert.equal(aConditions[0].inParameters.inTest, "X", "In-parameter value");
					assert.ok(aConditions[0].hasOwnProperty("outParameters"), "Condition has out-partameters");
					assert.equal(aConditions[0].outParameters.outTest, "Y", "Out-parameter value");
					assert.ok(aConditions[0].hasOwnProperty("payload"), "Condition has payload");
					assert.equal(aConditions[0].payload.payloadTest, "Z", "payload value");

					oField._oContentFactory.setCompositeTypes();
					oIntType.destroy();
					oStringType.destroy();
					oIcon.destroy();
					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("Select in currency stand-alone", async function(assert) {

		oField.setDataTypeFormatOptions({showNumber: false, showMeasure: true});
		await nextUIUpdate();

		const oIntType = new IntegerType();
		const oStringType = new StringType();
		oField._oContentFactory.setCompositeTypes([oIntType, oStringType]); // fake composite types

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		sinon.spy(oValueHelp, "connect");

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		assert.equal(aContent.length, 1, "Only one content control");
		assert.ok(oContent1.getShowValueHelp(), "Currency Input has value help");
		const oSuggestControl = oField.getControlForSuggestion();
		assert.equal(oSuggestControl && oSuggestControl.getId(), oContent1 && oContent1.getId(), "Currency control is used for suggestion");

		oContent1.focus(); // as ValueHelp is connected with focus
		assert.ok(oValueHelp.connect.calledOnce, "ValueHelp connected");
		assert.equal(oValueHelp.connect.args[0][0], oField, "ValueHelp connected to Field");
		assert.equal(oValueHelp.connect.args[0][1].dataType, oStringType, "Type of currency part used for ValueHelp");
		// simulate select event to see if field is updated
		const oCondition = Condition.createCondition(OperatorName.EQ, ["EUR", "EUR"], undefined, undefined, ConditionValidated.Validated, {payloadTest: "Z"});
		oValueHelp.fireSelect({ conditions: [oCondition] });
		assert.equal(iCount, 1, "Change Event fired");
		const aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0][0], 123.45, "condition value0");
		assert.equal(aConditions[0].values[0][1], "EUR", "condition value1");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.ok(aConditions[0].hasOwnProperty("payload"), "Condition has payload");
		assert.equal(aConditions[0].payload.payloadTest, "Z", "payload value");
		assert.equal(oContent1.getDOMValue(), "EUR", "value in inner control");

	});

	QUnit.test("Enter currency with async parsing", async function(assert) {

		const oIcon = new Icon("I1", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }).placeAt("content");
		await nextUIUpdate();

		const fnDone = assert.async();
		const oValueHelp = Element.getElementById(oField.getValueHelp());

		const aContent = oField.getAggregation("_content");
		const oContent2 = aContent && aContent.length > 1 && aContent[1];

		oContent2.focus(); // as ValueHelp is connected with focus

		// simulate select event to see if field is updated
		let fnResolve;
		let oFHPromise = new Promise(function(fResolve, fReject) {
			fnResolve = fResolve;
		});
		const fnGetItemsForValue = function(oConfig) {
			vGetItemsForValue = oConfig.value;
			if (oConfig.value === "CAD") {
				return oFHPromise;
			} else if (oConfig.value === "USD") {
				return oFHPromise;
			} else if (oConfig.value === "JPY") {
				return oFHPromise;
			}
			return null;
		};
		sinon.stub(oValueHelp, "getItemForValue").callsFake(fnGetItemsForValue);

		oContent2._$input.val("CAD"); // just reuse valid currency as otherwise type thows error before ValueHelp

		setTimeout(function() { // for fieldGroup delay
			oIcon.focus();
			setTimeout(function() { // for fieldGroup delay
				assert.equal(iCount, 1, "Change Event fired");
				assert.ok(oPromise, "Promise returned");
				fnResolve({key: "EUR", description: "Euro", inParameters: {inTest: "X"}, outParameters: {outTest: "Y"}});

				oPromise.then(function(vResult) {
					assert.ok(vResult, "Promise resolved");
					let aConditions = oCM.getConditions("Price");
					assert.equal(aConditions.length, 1, "one condition in Codition model");
					assert.equal(aConditions[0].values[0][0], 123.45, "condition value0");
					assert.equal(aConditions[0].values[0][1], "EUR", "condition value1");
					assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
					assert.ok(aConditions[0].hasOwnProperty("inParameters"), "Condition has in-partameters");
					assert.equal(aConditions[0].inParameters.inTest, "X", "In-parameter value");
					assert.ok(aConditions[0].hasOwnProperty("outParameters"), "Condition has out-partameters");
					assert.equal(aConditions[0].outParameters.outTest, "Y", "Out-parameter value");
					setTimeout(function() { // update of Input
						assert.equal(oContent2.getDOMValue(), "EUR", "value in inner control");

						oContent2.focus(); // as ValueHelp is connected with focus
						oIcon.destroy();
						iCount = 0; oPromise = undefined;

						oFHPromise = new Promise(function(fResolve, fReject) {
							fnResolve = fResolve;
						});
						oContent2._$input.val("USD");
						qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
						assert.equal(iCount, 1, "Change Event fired");
						assert.ok(oPromise, "Promise returned");
						fnResolve({key: "USD", description: "$", payload: {payloadTest: "X"}});

						oPromise.then(function(vResult) {
							assert.ok(vResult, "Promise resolved");
							aConditions = oCM.getConditions("Price");
							assert.equal(aConditions.length, 1, "one condition in Codition model");
							assert.equal(aConditions[0].values[0][0], 123.45, "condition value0");
							assert.equal(aConditions[0].values[0][1], "USD", "condition value1");
							assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
							assert.notOk(aConditions[0].hasOwnProperty("inParameters"), "Condition has no in-partameters");
							assert.notOk(aConditions[0].hasOwnProperty("outParameters"), "Condition has no out-partameters");
							assert.ok(aConditions[0].hasOwnProperty("payload"), "Condition has payload");
							assert.equal(aConditions[0].payload.payloadTest, "X", "Payload-parameter value");
							setTimeout(function() { // update of Input
								assert.equal(aConditions[0].payload.payloadTest, "X", "Payload-parameter value");

								// validation error
								iCount = 0; oPromise = undefined;

								oFHPromise = new Promise(function(fResolve, fReject) {
									fnResolve = fResolve;
								});
								const oConditionsType = oContent2.getBinding("value").getType();
								sinon.stub(oConditionsType, "validateValue").callsFake(function(aConditions) {
									if (aConditions && aConditions[0] && aConditions[0].values[0][1] === "JPY") {
										throw new ConditionValidateException("MyError", undefined, aConditions[0], aConditions);
									}
								});
								oContent2._$input.val("JPY");
								qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
								assert.equal(iCount, 1, "Change Event fired");
								assert.ok(oPromise, "Promise returned");
								fnResolve({key: "JPY", description: "¥", payload: {payloadTest: "O"}});

								oPromise.then(function(vResult) {
									assert.notOk(vResult, "Promise must not be resolved");
									fnDone();
								}).catch(function(oException) {
									assert.ok(true, "Promise must be rejected");
									assert.equal(oException.message, "MyError");
									// Conditions and OutParameters must not be updated
									aConditions = oCM.getConditions("Price");
									assert.equal(aConditions.length, 1, "one condition in Codition model");
									assert.equal(aConditions[0].values[0][0], 123.45, "condition value0");
									assert.equal(aConditions[0].values[0][1], "USD", "condition value1");
									assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
									assert.notOk(aConditions[0].hasOwnProperty("inParameters"), "Condition has no in-partameters");
									assert.notOk(aConditions[0].hasOwnProperty("outParameters"), "Condition has no out-partameters");
									assert.ok(aConditions[0].hasOwnProperty("payload"), "Condition has payload");
									assert.equal(aConditions[0].payload.payloadTest, "X", "Payload-parameter value");
									setTimeout(function() { // update of Input
										assert.equal(aConditions[0].payload.payloadTest, "X", "Payload-parameter value");

										fnDone();
									}, 0);
								});
							}, 0);
						}).catch(function(oException) {
							assert.notOk(true, "Promise must not be rejected");
							fnDone();
						});
					}, 0);
				}).catch(function(oException) {
					assert.notOk(true, "Promise must not be rejected");
					oIcon.destroy();
					fnDone();
				});
			}, 0);
		}, 0);

	});

	QUnit.test("navigate to currency", function(assert) {

		iLiveCount = 0; // TODO: as in IE sometimes a change event on the Input control is fired.
		const oValueHelp = Element.getElementById(oField.getValueHelp());

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		const oContent2 = aContent && aContent.length > 1 && aContent[1];

		oContent2.focus(); // as ValueHelp is connected with focus
		oValueHelp.fireNavigated({ condition: Condition.createItemCondition("EUR", "EUR"), itemId: "ItemId"});
		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		assert.equal(oContent1._$input.val(), "123.45", "number-Field shown value");
		assert.equal(oContent2._$input.val(), "EUR", "currency-Field shown value");

	});

	QUnit.test("filtering for currency", async function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const oVHContent = new Content("C1");
		const oVHPopover = new Popover("P1", {content: oVHContent});
		sinon.stub(oVHPopover, "getUseAsValueHelp").returns(true); // simulate ComboBox case
		oValueHelp.setTypeahead(oVHPopover);
		oValueHelp.setConditions([Condition.createItemCondition("EUR", "EUR")]); // to test clearing on filtering
		await nextUIUpdate();

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		const oContent2 = aContent && aContent.length > 1 && aContent[1];
		const fnDone = assert.async();
		oContent2.focus(); // as ValueHelp is connected with focus
		oContent2._$input.val("E");
		oContent2.fireLiveChange({ value: "E" });
		setTimeout(function() { // to wait for Promises and opening
			assert.equal(oValueHelp.getFilterValue(), "E", "FilterValue set");
			assert.equal(oValueHelp.getConditions().length, 0, "no Conditions on ValueHelp");
			oContent1._$input.val("2");
			oContent1.fireLiveChange({ value: "2" });
			setTimeout(function() { // to wait for Promises and opening
				assert.equal(oValueHelp.getFilterValue(), "E", "FilterValue not changed");

				oValueHelp.close();
				setTimeout(function() { // to wait for Promises and closing
					fnDone();
				}, 400);
			}, 400);
		}, 400);

	});

	QUnit.module("ValueHelp for currency with multi-value", {
		beforeEach: async function() {
			const oValueHelp = new ValueHelp("F1-H", {validateInput: true});
			sinon.stub(oValueHelp, "isValidationSupported").returns(true); // otherwise it will not be taken to determine key or description
			sinon.stub(oValueHelp, "isTypeaheadSupported").returns(Promise.resolve(true)); // to simulate suggestion
			sinon.stub(oValueHelp, "getIcon").returns("sap-icon://sap-ui5");

			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				dataType: "sap.ui.model.type.Currency",
				conditions: "{cm>/conditions/Price}",
				valueHelp: oValueHelp,
				liveChange: _myLiveChangeHandler,
				models: {cm: oCM}
			});
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);
			let oCondition = Condition.createCondition(OperatorName.EQ, [[123.45, "USD"]]);
			oCM.addCondition("Price", oCondition);
			oCondition = Condition.createCondition(OperatorName.BT, [[100, "USD"], [200, "USD"]]);
			oCM.addCondition("Price", oCondition);

			oCM.checkUpdate(true, false); // to update bindings
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			const oValueHelp = Element.getElementById("F1-H");
			if (oValueHelp) {
				oValueHelp.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
			FieldBase._init();
		}
	});

	QUnit.test("Select currency", function(assert) {

		const fnDone = assert.async();
		const oValueHelp = Element.getElementById(oField.getValueHelp());

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		const oContent2 = aContent && aContent.length > 1 && aContent[1];
		assert.notOk(oContent1.getShowValueHelp(), "Number MultiInput has no value help");
		assert.ok(oContent2.getShowValueHelp(), "Currency Input has value help");

		oContent2.focus(); // as ValueHelp is connected with focus
		// simulate select event to see if field is updated
		let oCondition = Condition.createCondition(OperatorName.EQ, ["EUR", "EUR"]);
		oValueHelp.fireSelect({ conditions: [oCondition] });
		assert.equal(iCount, 0, "Change Event not fired");
		let aConditions = oCM.getConditions("Price");
		assert.equal(aConditions.length, 2, "two conditions in Codition model");
		assert.equal(aConditions[0].values[0][0], 123.45, "condition value0-number");
		assert.equal(aConditions[0].values[0][1], "EUR", "condition value0-unit");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(aConditions[1].values[0][0], 100, "condition value0-number");
		assert.equal(aConditions[1].values[0][1], "EUR", "condition value0-unit");
		assert.equal(aConditions[1].values[1][0], 200, "condition value1-number");
		assert.equal(aConditions[1].values[1][1], "EUR", "condition value1-unit");
		assert.equal(aConditions[1].operator, OperatorName.BT, "condition operator");
		assert.equal(oContent2.getDOMValue(), "EUR", "value in inner control");

		qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "Change Event fired");

		setTimeout(function() { // wait for Model update
			oCM.removeAllConditions();
			setTimeout(function() { // wait for Model update
				oCondition = Condition.createCondition(OperatorName.EQ, ["USD", "USD"]);
				oValueHelp.fireSelect({ conditions: [oCondition] });
				aConditions = oCM.getConditions("Price");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0].values[0][0], undefined, "condition value0");
				assert.equal(aConditions[0].values[0][1], "USD", "condition value1");
				assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");

				// check selecting same value updates typed value
				iCount = 0;
				oContent2.setDOMValue("X");
				oValueHelp.fireSelect({ conditions: [oCondition] });
				assert.equal(iCount, 0, "no Change Event fired");
				aConditions = oCM.getConditions("Price");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(oContent2.getDOMValue(), "USD", "value in inner control");

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("navigate to currency", function(assert) {

		const fnDone = assert.async();
		iLiveCount = 0; // TODO: as in IE sometimes a change event on the Input control is fired.
		const oValueHelp = Element.getElementById(oField.getValueHelp());

		const aContent = oField.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 0 && aContent[0];
		const oContent2 = aContent && aContent.length > 1 && aContent[1];

		oContent2.focus(); // as ValueHelp is connected with focus
		const oCondition = Condition.createCondition(OperatorName.EQ, ["EUR", "EUR"], {inTest: "X"}, {outTest: "Y"}, ConditionValidated.Validated, {payloadTest: "Z"});
		oValueHelp.fireNavigated({ condition: oCondition });
		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		assert.equal(oContent1.getDOMValue(), "", "value in inner number-control");
		assert.equal(oContent2.getDOMValue(), "EUR", "value in inner unit-control");

		qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		let aConditions = oCM.getConditions("Price");
		assert.equal(aConditions.length, 2, "two conditions in Codition model");
		assert.equal(aConditions[0].values[0][0], 123.45, "condition0 value0-number");
		assert.equal(aConditions[0].values[0][1], "EUR", "condition0 value0-unit");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition0 operator");
		assert.ok(aConditions[0].hasOwnProperty("inParameters"), "Condition0 has in-partameters");
		assert.equal(aConditions[0].inParameters.inTest, "X", "In-parameter value");
		assert.ok(aConditions[0].hasOwnProperty("outParameters"), "Condition0 has out-partameters");
		assert.equal(aConditions[0].outParameters.outTest, "Y", "Out-parameter value");
		assert.ok(aConditions[0].hasOwnProperty("payload"), "Condition0 has payload");
		assert.equal(aConditions[0].payload.payloadTest, "Z", "Payload value");
		assert.equal(aConditions[1].values[0][0], 100, "condition1 value0-number");
		assert.equal(aConditions[1].values[0][1], "EUR", "condition1 value0-unit");
		assert.equal(aConditions[1].values[1][0], 200, "condition1 value1-number");
		assert.equal(aConditions[1].values[1][1], "EUR", "condition1 value1-unit");
		assert.equal(aConditions[1].operator, OperatorName.BT, "condition operator");
		assert.ok(aConditions[1].hasOwnProperty("inParameters"), "Condition1 has in-partameters");
		assert.equal(aConditions[1].inParameters.inTest, "X", "In-parameter value");
		assert.ok(aConditions[1].hasOwnProperty("outParameters"), "Condition1 has out-partameters");
		assert.equal(aConditions[1].outParameters.outTest, "Y", "Out-parameter value");
		assert.ok(aConditions[0].hasOwnProperty("payload"), "Condition0 has payload");
		assert.equal(aConditions[0].payload.payloadTest, "Z", "Payload value");

		setTimeout(function() { // wait for Model update
			oCM.removeAllConditions();
			setTimeout(function() { // wait for Model update
				oValueHelp.fireNavigated({ condition: oCondition });
				qutils.triggerKeydown(oContent2.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
				aConditions = oCM.getConditions("Price");
				assert.equal(aConditions.length, 1, "one condition in Codition model");
				assert.equal(aConditions[0].values[0][0], undefined, "condition0 value0-number");
				assert.equal(aConditions[0].values[0][1], "EUR", "condition0 value0-unit");
				assert.equal(aConditions[0].operator, OperatorName.EQ, "condition0 operator");
				assert.ok(aConditions[0].hasOwnProperty("inParameters"), "Condition0 has in-partameters");
				assert.equal(aConditions[0].inParameters.inTest, "X", "In-parameter value");
				assert.ok(aConditions[0].hasOwnProperty("outParameters"), "Condition0 has out-partameters");
				assert.equal(aConditions[0].outParameters.outTest, "Y", "Out-parameter value");
				assert.ok(aConditions[0].hasOwnProperty("payload"), "Condition0 has payload");
				assert.equal(aConditions[0].payload.payloadTest, "Z", "Payload value");

				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.module("ValueHelp with \"\" as key", {
		beforeEach: async function() {
			const oValueHelp = new ValueHelp("F1-H", {validateInput: true});
			sinon.stub(oValueHelp, "isValidationSupported").returns(true); // otherwise it will not be taken to determine key or description
			sinon.stub(oValueHelp, "isTypeaheadSupported").returns(Promise.resolve(true)); // to simulate suggestion
			sinon.stub(oValueHelp, "getIcon").returns("sap-icon://sap-ui5");
			const fnGetItemForValue = function(oConfig) {
				vGetItemsForValue = oConfig.value;
				if (oConfig.value === "" || oConfig.value === "Empty") {
					return {key: "", description: "Empty"};
				} else if (oConfig.value === "I1" || oConfig.value === "Item1") {
					return {key: "I1", description: "Item1"};
				} else if (oConfig.value === "I2" || oConfig.value === "Item2") {
					return {key: "I2", description: "Item2"};
				}
			};
			sinon.stub(oValueHelp, "getItemForValue").callsFake(fnGetItemForValue);

			oField = new FieldBase("F1", {
				dataType: "sap.ui.model.odata.type.String",
				display: FieldDisplay.Description,
				maxConditions: 1,
				valueHelp: oValueHelp,
				liveChange: _myLiveChangeHandler
			});
			// TODO: FilterField case
			sinon.stub(oField, "getSupportedOperators").callsFake(fnOnlyEQ); // fake Field
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);

			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			const oValueHelp = Element.getElementById("F1-H");
			if (oValueHelp) {
				oValueHelp.destroy();
			}
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
			FieldBase._init();
		}
	});

	QUnit.test("displayed value", function(assert) {

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.notOk(oContent.getValue(), "Input control is empty");

		const oCondition = Condition.createCondition(OperatorName.EQ, [""], undefined, undefined, ConditionValidated.Validated);
		oField.setConditions([oCondition]);
		assert.equal(oContent.getValue(), "Empty");

	});

	QUnit.test("ValueHelp select", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		oField.focus(); // as ValueHelp is connected with focus

		const oCondition = Condition.createCondition(OperatorName.EQ, ["", "Empty"]);
		oValueHelp.fireSelect({ conditions: [oCondition] });

		const aConditions = oField.getConditions();
		assert.equal(aConditions.length, 1, "one condition set");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		assert.equal(aConditions[0].values[0], "", "condition value");
		assert.equal(aConditions[0].values[1], "Empty", "condition description");

	});

	QUnit.test("ValueHelp navigate", function(assert) {

		const oValueHelp = Element.getElementById(oField.getValueHelp());
		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		oField.focus(); // as ValueHelp is connected with focus

		const oCondition = Condition.createCondition(OperatorName.EQ, ["", "Empty"]);
		oValueHelp.fireNavigated({condition: oCondition});

		assert.equal(iLiveCount, 1, "LiveChange Event fired once");
		assert.equal(oContent.getValue(), "Empty");

	});

	// test FieldInfo only from API side, simulate behaviour
	QUnit.module("FieldInfo not triggerable", {
		beforeEach: async function() {
			const oFieldInfo = new FieldInfoBase("F1-I");
			sinon.stub(oFieldInfo, "isTriggerable").returns(Promise.resolve(false));
			sinon.stub(oFieldInfo, "getTriggerHref").returns(Promise.resolve("test.test"));
			sinon.stub(oFieldInfo, "getDirectLinkHrefAndTarget").returns(null);
			sinon.stub(oFieldInfo, "checkDirectNavigation").returns(Promise.resolve(false));
			sinon.stub(oFieldInfo, "getContent").returns(Promise.resolve(Element.getElementById("L1")));
			sinon.spy(oFieldInfo, "open");

			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				maxConditions: 1, // TODO: needed for Link?
				editMode: FieldEditMode.Display,
				fieldInfo: oFieldInfo,
				//				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler,
				models: {cm: oCM}
			});
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);

			const oCondition = Condition.createCondition(OperatorName.EQ, ["Test"], undefined, undefined, ConditionValidated.Validated);
			oCM.addCondition("Name", oCondition);

			oCM.checkUpdate(true, false); // to update bindings
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			const oFieldInfo = Element.getElementById("F1-I");
			if (oFieldInfo) {
				oFieldInfo.destroy();
			}
			const oLabel = Element.getElementById("L1");
			if (oLabel) {
				oLabel.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
			FieldBase._init();
		}
	});

	QUnit.test("Rendering", function(assert) {

		const aContent = oField.getAggregation("_content");
		const oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "content exist");
		assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");
		assert.equal(oContent.getText && oContent.getText(), "Test", "Text used");

	});

	QUnit.module("FieldInfo triggerable", {
		beforeEach: async function() {
			const oFieldInfo = new FieldInfoBase("F1-I");
			sinon.stub(oFieldInfo, "isTriggerable").returns(Promise.resolve(true));
			sinon.stub(oFieldInfo, "getTriggerHref").returns(Promise.resolve(undefined));
			sinon.stub(oFieldInfo, "getDirectLinkHrefAndTarget").returns(Promise.resolve(null));
			sinon.stub(oFieldInfo, "checkDirectNavigation").returns(Promise.resolve(false));
			sinon.stub(oFieldInfo, "getContent").returns(Promise.resolve(Element.getElementById("L1")));
			sinon.spy(oFieldInfo, "open");

			oCM = new ConditionModel();
			oField = new FieldBase("F1", {
				conditions: "{cm>/conditions/Name}",
				maxConditions: 1, // TODO: needed for Link?
				editMode: FieldEditMode.Display,
				fieldInfo: oFieldInfo,
				//				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler,
				models: {cm: oCM}
			});
			oField.fireChangeEvent = _myFireChange;
			oField.attachEvent("change", _myChangeHandler);

			const oCondition = Condition.createCondition(OperatorName.EQ, ["Test"], undefined, undefined, ConditionValidated.Validated);
			oCM.addCondition("Name", oCondition);

			oCM.checkUpdate(true, false); // to update bindings
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			const oFieldInfo = Element.getElementById("F1-I");
			if (oFieldInfo) {
				oFieldInfo.destroy();
			}
			const oLabel = Element.getElementById("L1");
			if (oLabel) {
				oLabel.destroy();
			}
			oCM.destroy();
			oCM = undefined;
			iCount = 0;
			sId = "";
			sValue = "";
			iLiveCount = 0;
			sLiveId = "";
			sLiveValue = "";
			FieldBase._init();
		}
	});

	QUnit.test("Rendering", function(assert) {

		const fnDone = assert.async();
		setTimeout(function() { // to wait for promise
			let aContent = oField.getAggregation("_content");
			let oContent = aContent && aContent.length > 0 && aContent[0];
			assert.ok(oContent, "content exist");
			assert.equal(oContent.getMetadata().getName(), "sap.m.Link", "sap.m.Link is used");
			assert.equal(oContent.getText && oContent.getText(), "Test", "Text used");
			assert.notOk(oContent.getHref && oContent.getHref(), "no Href used");

			const oFieldInfo = Element.getElementById("F1-I");
			oFieldInfo.getTriggerHref.returns(Promise.resolve("test.test"));
			oFieldInfo.getDirectLinkHrefAndTarget.returns(Promise.resolve({href: "myHref", target: "myTarget"}));
			oFieldInfo.fireDataUpdate();
			setTimeout(async function() { // to wait for promise
				assert.equal(oContent.getHref && oContent.getHref(), "myHref", "Href used");
				assert.equal(oContent.getTarget && oContent.getTarget(), "myTarget", "Target used");

				oFieldInfo.isTriggerable.returns(Promise.resolve(false));
				oFieldInfo.fireDataUpdate();
				await nextUIUpdate();
				setTimeout(function() { // to wait for promise
					assert.ok(oContent._bIsBeingDestroyed, "Link destroyed");
					aContent = oField.getAggregation("_content");
					oContent = aContent && aContent.length > 0 && aContent[0];
					assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");

					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	QUnit.test("opening", function(assert) {

		const fnDone = assert.async();
		setTimeout(function() { // to wait for promise
			setTimeout(function() { // to wait rendering of Link
				const aContent = oField.getAggregation("_content");
				const oContent = aContent && aContent.length > 0 && aContent[0];
				const oFieldInfo = Element.getElementById("F1-I");

				assert.equal(oContent.getMetadata().getName(), "sap.m.Link", "sap.m.Link is used");
				if (oContent.firePress) {
					oContent.firePress(); // simulate link click
					setTimeout(function() {
						assert.ok(oFieldInfo.open.called, "FieldInfo opened");
						fnDone();
					}, 0);
				} else {
					fnDone();
				}
			}, 0);
		}, 0);

	});

	QUnit.test("Remove", function(assert) {

		const fnDone = assert.async();
		setTimeout(async function() { // to wait for promise
			let aContent = oField.getAggregation("_content");
			let oContent = aContent && aContent.length > 0 && aContent[0];

			oField.destroyFieldInfo();
			await nextUIUpdate();
			assert.ok(oContent._bIsBeingDestroyed, "Link destroyed");
			aContent = oField.getAggregation("_content");
			oContent = aContent && aContent.length > 0 && aContent[0];
			assert.equal(oContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used");

			fnDone();
		}, 0);

	});

	QUnit.test("Clone", function(assert) {

		const fnDone = assert.async();
		setTimeout(async function() { // to wait for promise
			// to add stubs on cloning
			const oFieldInfo = oField.getFieldInfo();
			oFieldInfo.clone = function(sIdSuffix, aLocalIds) {
				const oCloneFieldInfo = FieldInfoBase.prototype.clone.apply(this, arguments);
				sinon.stub(oCloneFieldInfo, "isTriggerable").returns(Promise.resolve(true));
				sinon.stub(oCloneFieldInfo, "getTriggerHref").returns(Promise.resolve(undefined));
				sinon.stub(oCloneFieldInfo, "getDirectLinkHrefAndTarget").returns(Promise.resolve(null));
				sinon.stub(oCloneFieldInfo, "getContent").returns(Promise.resolve(Element.getElementById("L1")));
				return oCloneFieldInfo;
			};

			sinon.spy(DefaultContent, "createDisplay"); // to check if sap.m.Text is created before sap.m.Link

			const oClone = oField.clone("myClone");
			oClone.placeAt("content");
			await nextUIUpdate();

			setTimeout(async function() { // to wait for promise
				let aContent = oField.getAggregation("_content");
				let oContent = aContent && aContent.length > 0 && aContent[0];
				let aCloneContent = oClone.getAggregation("_content");
				let oCloneContent = aCloneContent && aCloneContent.length > 0 && aCloneContent[0];
				const oCloneFieldInfo = oClone.getFieldInfo();
				assert.ok(!!oCloneFieldInfo, "Clone has FieldInfo");
				assert.equal(oCloneFieldInfo && oCloneFieldInfo.getId(), "F1-I-myClone", "FieldInfo is cloned");
				assert.equal(oCloneContent.getMetadata().getName(), "sap.m.Link", "sap.m.Link is used on Clone");
				assert.equal(oCloneContent.getText && oContent.getText(), "Test", "Text used on Clone");
				assert.notOk(DefaultContent.createDisplay.called, "no sap.m.Text control created before sap.m.Link");

				oCloneFieldInfo.isTriggerable.returns(Promise.resolve(false));
				oCloneFieldInfo.fireDataUpdate();
				await nextUIUpdate();
				setTimeout(function() { // to wait for promise
					aContent = oField.getAggregation("_content");
					oContent = aContent && aContent.length > 0 && aContent[0];
					aCloneContent = oClone.getAggregation("_content");
					oCloneContent = aCloneContent && aCloneContent.length > 0 && aCloneContent[0];
					assert.equal(oContent.getMetadata().getName(), "sap.m.Link", "sap.m.Link is still used on Original");
					assert.equal(oCloneContent.getMetadata().getName(), "sap.m.Text", "sap.m.Text is used on Clone");

					oClone.destroy();
					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

	let oField2;
	let oIcon;
	let aFieldGroupIds;
	let sFieldGroupControl;
	const validateFieldGroup = function(oEvent) {
		aFieldGroupIds = oEvent.getParameters().fieldGroupIds;
		sFieldGroupControl = oEvent.getSource().getId();
	};

	QUnit.module("FieldGroup handling", {
		beforeEach: async function() {
			oField = new FieldBase("F1", {
				fieldGroupIds: "MyFieldGroup",
				validateFieldGroup: validateFieldGroup
			}).placeAt("content");

			oField2 = new FieldBase("F2", {
				dataType: "sap.ui.model.type.Currency",
				maxConditions: 1,
				fieldGroupIds: "MyFieldGroup",
				validateFieldGroup: validateFieldGroup
			}).placeAt("content");

			oIcon = new Icon("I3", { src: "sap-icon://sap-ui5", decorative: false, press: function(oEvent) {} }).placeAt("content"); // just dummy handler to make Icon focusable
			await nextUIUpdate();
		},
		afterEach: function() {
			oField.destroy();
			oField = undefined;
			oField2.destroy();
			oField2 = undefined;
			oIcon.destroy();
			oIcon = undefined;
			FieldBase._init();
			aFieldGroupIds = undefined;
			sFieldGroupControl = undefined;
		}
	});

	QUnit.test("normal Field leave FieldGroup", function(assert) {

		const fnDone = assert.async();
		oField.focus();
		setTimeout(function() { // for fieldGroup delay
			oIcon.focus();
			setTimeout(function() { // for fieldGroup delay
				assert.equal(sFieldGroupControl, "F1", "Field is source for FieldGroup change");
				assert.equal(aFieldGroupIds && aFieldGroupIds.length, 1, "One FieldGroupId");
				assert.equal(aFieldGroupIds && aFieldGroupIds[0], "MyFieldGroup", "FieldGroupId");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("normal Field stay in FieldGroup", function(assert) {

		const fnDone = assert.async();
		oField.focus();
		setTimeout(function() { // for fieldGroup delay
			oField2.focus();
			setTimeout(function() { // for fieldGroup delay
				assert.notOk(sFieldGroupControl, "no FieldGroup change");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("currency Field leave FieldGroup", function(assert) {

		const fnDone = assert.async();
		const aContent = oField2.getAggregation("_content");
		const oContent2 = aContent && aContent.length > 1 && aContent[1];
		oContent2.focus();
		setTimeout(function() { // for fieldGroup delay
			oIcon.focus();
			setTimeout(function() { // for fieldGroup delay
				assert.equal(sFieldGroupControl, "F2", "Field is source for FieldGroup change");
				assert.equal(aFieldGroupIds && aFieldGroupIds.length, 1, "One FieldGroupId");
				assert.equal(aFieldGroupIds && aFieldGroupIds[0], "MyFieldGroup", "FieldGroupId");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("currency Field stay in FieldGroup", function(assert) {

		const fnDone = assert.async();
		const aContent = oField2.getAggregation("_content");
		const oContent1 = aContent && aContent.length > 1 && aContent[1];
		const oContent2 = aContent && aContent.length > 1 && aContent[1];
		oContent2.focus();
		setTimeout(function() { // for fieldGroup delay
			oContent1.focus();
			setTimeout(function() { // for fieldGroup delay
				assert.notOk(sFieldGroupControl, "no FieldGroup change on navigating between currency and number");
				oField.focus();
				setTimeout(function() { // for fieldGroup delay
					assert.notOk(sFieldGroupControl, "no FieldGroup change");
					fnDone();
				}, 0);
			}, 0);
		}, 0);

	});

});
