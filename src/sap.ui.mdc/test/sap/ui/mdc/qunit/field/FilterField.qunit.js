/* global QUnit, sinon */

// only test what is not tested in FieldBase

/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/ValueHelp",
	"sap/ui/mdc/valuehelp/Dialog",
	"sap/ui/mdc/valuehelp/content/Conditions",
	// async. loading of content control tested in FieldBase test
	"sap/ui/mdc/field/FieldInput",
	// async. loading of content control tested in FieldBase test
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/OperatorName",
	// make sure delegate is loaded (test delegate loading in FieldBase test)
	"delegates/odata/v4/FieldBaseDelegate",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	// make sure types are loaded
	"sap/ui/model/type/String",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Date",
	"sap/ui/model/ParseException",
	"sap/ui/model/FormatException",
	"sap/m/SearchField",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated"
], (
	coreLibrary,
	Element,
	Messaging,
	Message,
	MessageType,
	jQuery,
	qutils,
	FilterField,
	ValueHelp,
	Dialog,
	Conditions,
	FieldInput,
	FieldMultiInput,
	ConditionModel,
	FilterOperatorUtil,
	BaseType,
	OperatorName,
	FieldBaseDelegate,
	KeyCodes,
	nextUIUpdate,
	StringType,
	IntegerType,
	DateType,
	ParseException,
	FormatException,
	SearchField,
	Condition,
	ConditionValidated
) => {
	"use strict";

	const { ValueState } = coreLibrary;

	let oFilterField;
	let sId;
	let sValue;
	let bValid;
	let aChangedConditions;
	let iCount = 0;
	let oPromise;

	const _myChangeHandler = (oEvent) => {
		iCount++;
		sId = oEvent.oSource.getId();
		sValue = oEvent.getParameter("value");
		bValid = oEvent.getParameter("valid");
		aChangedConditions = oEvent.getParameter("conditions");
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

	QUnit.module("FilterField rendering", {
		beforeEach() {
			oFilterField = new FilterField("FF1");
		},
		afterEach() {
			oFilterField.destroy();
			oFilterField = undefined;
		}
	});

	QUnit.test("default rendering", async (assert) => {

		oFilterField.placeAt("content");
		await nextUIUpdate();

		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.ok(oContent, "default content exist");
		assert.equal(oContent?.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is default");
		assert.ok(oContent?.getShowValueHelp(), "valueHelp used");
		assert.equal(oFilterField._sDefaultValueHelp, "Field-DefineConditions-Help", "Default Field help set");
		const oValueHelp = Element.getElementById(oFilterField._sDefaultValueHelp);
		assert.ok(oValueHelp instanceof ValueHelp, "ValueHelp used");

	});

	QUnit.test("internal control creation", (assert) => {

		const fnDone = assert.async();
		setTimeout(() => { // async control creation in applySettings
			let aContent = oFilterField.getAggregation("_content");
			let oContent = aContent?.length > 0 && aContent[0];
			assert.notOk(oContent, "no content exist before rendering");

			oFilterField.destroy();
			oFilterField = new FilterField("FF1", {
				dataType: "sap.ui.model.type.String"
			});

			setTimeout(() => { // async control creation in applySettings
				aContent = oFilterField.getAggregation("_content");
				oContent = aContent?.length > 0 && aContent[0];
				assert.ok(oContent, "content exist before rendering");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.module("Eventing", {
		beforeEach: async () => {
			oFilterField = new FilterField("FF1", {
				dataType: "sap.ui.model.type.Integer",
				dataTypeConstraints: {maximum: 100},
				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler
			}).placeAt("content");
			await nextUIUpdate();
		},
		afterEach() {
			oFilterField.destroy();
			oFilterField = undefined;
			iCount = 0;
			sId = null;
			sValue = null;
			bValid = null;
			aChangedConditions = null;
			oPromise = null;
			iLiveCount = 0;
			sLiveId = null;
			sLiveValue = null;
		}
	});

	QUnit.test("with internal content", (assert) => {

		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("10");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "FF1", "change event fired on Field");
		assert.equal(sValue, 10, "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(aChangedConditions.length, 1, "Conditions of the change event");
		assert.equal(aChangedConditions[0].values[0], 10, "condition value");
		assert.equal(aChangedConditions[0].operator, OperatorName.EQ, "condition operator");
		const aConditions = oFilterField.getConditions();
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0], 10, "condition value");
		assert.equal(aConditions[0].operator, OperatorName.EQ, "condition operator");
		const aTokens = oContent.getTokens ? oContent.getTokens() : [];
		assert.equal(aTokens.length, 1, "MultiInput has one Token");
		const oToken = aTokens[0];
		assert.equal(oToken?.getText(), "=10", "Text on token set");

		//simulate liveChange by calling from internal control
		oContent.fireLiveChange({value: "2"});
		assert.equal(iLiveCount, 1, "liveChange event fired once");
		assert.equal(sLiveId, "FF1", "liveChange event fired on Field");
		assert.equal(sLiveValue, "2", "liveChange event value");

		jQuery(oContent.getFocusDomRef()).val("1000");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 2, "change event fired again");
		assert.notOk(bValid, "Value is not valid");
		assert.equal(sValue, "1000", "change event wrongValue");

	});

	QUnit.test("clenaup wrong input for single value", async (assert) => {

		const fnDone = assert.async();
		Messaging.registerObject(oFilterField, true); // to test valueState
		oFilterField.setDataType("sap.ui.model.type.Integer");
		oFilterField.setMaxConditions(1);
		oFilterField.placeAt("content");
		await nextUIUpdate();

		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("XXXX");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.ok(oFilterField.isInvalidInput(), "ParseError fired");
		assert.equal(iCount, 1, "change event fired again");
		assert.notOk(bValid, "Value is not valid");
		assert.equal(sValue, "XXXX", "Value of change event");
		assert.deepEqual(oFilterField.getConditions(), [], "FilterField conditions");
		assert.ok(oPromise, "Promise returned");
		setTimeout(() => { // to wait for valueStateMessage
			oPromise.then((vResult) => {
				assert.notOk(true, "Promise must not be resolved");
				fnDone();
			}).catch((oException) => {
				assert.ok(true, "Promise rejected");
				assert.ok(oException instanceof ParseException, "ParseExpetion returned");
				assert.equal(oFilterField.getValueState(), ValueState.Error, "ValueState");

				// cleanup should remove valueState
				oFilterField.setConditions([]);
				setTimeout(() => { // to wait for ManagedObjectModel update
					setTimeout(() => { // to wait for Message update
						assert.equal(jQuery(oContent.getFocusDomRef()).val(), "", "no value shown");
						assert.equal(oFilterField.getValueState(), ValueState.None, "ValueState removed");

						fnDone();
					}, 0);
				}, 0);
			});
		}, 0);

	});

	QUnit.test("clenaup wrong input for multi value", async (assert) => {

		const fnDone = assert.async();
		Messaging.registerObject(oFilterField, true); // to test valueState
		oFilterField.setDataType("sap.ui.model.type.Date");
		oFilterField.placeAt("content");
		await nextUIUpdate();

		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("XXXX");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.ok(oFilterField.isInvalidInput(), "ParseError fired");
		assert.equal(iCount, 1, "change event fired again");
		assert.notOk(bValid, "Value is not valid");
		assert.equal(sValue, "XXXX", "Value of change event");
		assert.deepEqual(oFilterField.getConditions(), [], "FilterField conditions");
		assert.ok(oPromise, "Promise returned");
		setTimeout(() => { // to wait for valueStateMessage
			oPromise.then((vResult) => {
				assert.notOk(true, "Promise must not be resolved");
				fnDone();
			}).catch((oException) => {
				assert.ok(true, "Promise rejected");
				assert.ok(oException instanceof ParseException, "ParseExpetion returned");
				assert.equal(oFilterField.getValueState(), ValueState.Error, "ValueState");

				// cleanup should remove valueState
				oFilterField.setConditions([]);
				setTimeout(() => { // to wait for ManagedObjectModel update
					setTimeout(() => { // to wait for Message update
						assert.equal(jQuery(oContent.getFocusDomRef()).val(), "", "no value shown");
						assert.equal(oFilterField.getValueState(), ValueState.None, "ValueState removed");

						fnDone();
					}, 0);
				}, 0);
			});
		}, 0);

	});

	QUnit.module("API", {
		beforeEach() {
			oFilterField = new FilterField("FF1");
		},
		afterEach() {
			oFilterField.destroy();
			oFilterField = undefined;
		}
	});

	QUnit.test("getSupportedOperators", (assert) => {

		sinon.spy(FilterOperatorUtil, "getOperatorsForType");

		let aOperators = oFilterField.getSupportedOperators();
		assert.ok(aOperators.length > 0, "Operators returned");
		assert.ok(FilterOperatorUtil.getOperatorsForType.calledWith(BaseType.String), "Default operators for string used");

		FilterOperatorUtil.getOperatorsForType.resetHistory();
		oFilterField.setOperators([OperatorName.EQ]);
		aOperators = oFilterField.getSupportedOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], OperatorName.EQ, "right Operator returned");
		assert.notOk(FilterOperatorUtil.getOperatorsForType.called, "Default operators not used");

		FilterOperatorUtil.getOperatorsForType.restore();

	});

	QUnit.test("set/add/removeOperators", (assert) => {

		const oNE = FilterOperatorUtil.getOperator(OperatorName.NE);

		let aOperators = oFilterField.getOperators();
		assert.ok(aOperators.length == 0, "no Operators returned");

		oFilterField.setOperators(OperatorName.BT + "," + OperatorName.LT);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 2, "two Operator returned");
		assert.equal(aOperators[0], OperatorName.BT, "right Operator returned");
		assert.equal(aOperators[1], OperatorName.LT, "right Operator returned");

		oFilterField.setOperators([oNE]);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], OperatorName.NE, "right Operator returned");

		oFilterField.setOperators([OperatorName.BT]);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], OperatorName.BT, "right Operator returned");

		oFilterField.addOperator(OperatorName.EQ);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 2, "two Operators returned");

		oFilterField.removeOperator(OperatorName.EQ);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], OperatorName.BT, "right Operator returned");

		oFilterField.addOperators([OperatorName.LT, oNE]);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 3, "three Operators returned");

		oFilterField.removeOperators([OperatorName.LT, oNE]);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], OperatorName.BT, "right Operator returned");

		oFilterField.addOperators(OperatorName.LT);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 2, "two Operators returned");

		oFilterField.removeOperators(OperatorName.LT);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], OperatorName.BT, "right Operator returned");

		oFilterField.removeAllOperators();
		aOperators = oFilterField.getOperators();
		assert.ok(aOperators.length == 0, "no Operators returned");

		oFilterField.removeOperator(OperatorName.EQ);
		aOperators = oFilterField.getOperators();
		assert.ok(aOperators.length == 19, "all default Operators without EQreturned");
	});

	QUnit.test("set/getDefaultOperator", (assert) => {

		const oNE = FilterOperatorUtil.getOperator(OperatorName.NE);

		let sOperatorName = oFilterField.getDefaultOperator();
		assert.equal(sOperatorName, "", "no default Operator set");

		oFilterField.setDefaultOperator(OperatorName.BT);
		sOperatorName = oFilterField.getDefaultOperator();
		assert.equal(sOperatorName, OperatorName.BT, "correct defaultOperator returned");

		oFilterField.setDefaultOperator(oNE);
		sOperatorName = oFilterField.getDefaultOperator();
		assert.equal(sOperatorName, OperatorName.NE, "correct defaultOperator returned");

		oFilterField.setDefaultOperator();
		sOperatorName = oFilterField.getDefaultOperator();
		assert.equal(sOperatorName, "", "no default Operator set");

	});

	QUnit.test("value updates in searchfield scenario", async (assert) => { // BCP: 2280085536
		oFilterField.destroy();
		oFilterField = new FilterField("FF1", {
			propertyKey: "$search",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});

		sinon.spy(oFilterField, "fireChange");

		oFilterField.placeAt("content");
		await nextUIUpdate();


		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.SearchField", "sap.m.SearchField is used");

		oContent.fireChange({
			id: 'F1-inner-inner',
			value: '123'
		});

		assert.equal(oFilterField.fireChange.lastCall.args[0].value, '123', "Contains expected value");

		oContent.fireChange({
			id: 'F1-inner-inner',
			value: ''
		});

		assert.equal(oFilterField.fireChange.lastCall.args[0].value, undefined, "Contains expected value");

		oFilterField.fireChange.restore();
	});

	QUnit.test("search event handling", async (assert) => {
		oFilterField.destroy();
		oFilterField = new FilterField("FF1", {
			propertyKey: "$search",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});

		oFilterField.placeAt("content");
		await nextUIUpdate();

		sinon.spy(oFilterField._oContentFactory, "getHandleEnter");

		let aContent = oFilterField.getAggregation("_content");
		let oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.SearchField", "sap.m.SearchField is used");

		oContent.fireSearch();
		assert.equal(oFilterField._oContentFactory.getHandleEnter.callCount, 1, "HandleEnter called once");

		oContent.fireSearch();
		assert.equal(oFilterField._oContentFactory.getHandleEnter.callCount, 2, "HandleEnter called");

		oContent.fireSearch({ clearButtonPressed: true });
		assert.equal(oFilterField._oContentFactory.getHandleEnter.callCount, 2, "HandleEnter no additonal call");

		oContent.fireSearch({ clearButtonPressed: true });
		assert.equal(oFilterField._oContentFactory.getHandleEnter.callCount, 2, "HandleEnter no additonal call");

		oContent.fireSearch({ clearButtonPressed: false });
		assert.equal(oFilterField._oContentFactory.getHandleEnter.callCount, 3, "HandleEnter called");

		// check update on PropertyKey change
		oFilterField.setPropertyKey();
		await nextUIUpdate();

		aContent = oFilterField.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput is used");

		oFilterField.setPropertyKey("*key,description*");
		await nextUIUpdate();

		aContent = oFilterField.getAggregation("_content");
		oContent = aContent?.length > 0 && aContent[0];
		assert.equal(oContent.getMetadata().getName(), "sap.m.SearchField", "sap.m.SearchField is used");

		oFilterField._oContentFactory.getHandleEnter.restore();
	});

	QUnit.test("additionalDataType", (assert) => {

		let oType = new DateType();
		oType._bMyType = true;

		oFilterField.setAdditionalDataType(oType);
		assert.equal(oFilterField.getContentFactory().retrieveAdditionalDataType(), oType, "Given type used");
		oType.destroy();

		oFilterField.setAdditionalDataType({name: "sap.ui.model.type.Date", formatOptions: {style: "short"}, constraints: {minimum: new Date(1900, 0, 1)}});
		oType = oFilterField.getContentFactory().retrieveAdditionalDataType();
		assert.ok(oType, "Type created");
		assert.deepEqual(oType.getFormatOptions(), {style: "short"}, "used FormatOptions");
		assert.deepEqual(oType.getConstraints(), {minimum: new Date(1900, 0, 1)}, "used Constraints");

		oFilterField.setAdditionalDataType();
		assert.notOk(oFilterField.getContentFactory().retrieveAdditionalDataType(), "no type used");

	});

	QUnit.test("awaitFormatCondition", async (assert) => {
		oFilterField.setDisplay("ValueDescription");
		oFilterField.setConditions([Condition.createCondition(OperatorName.EQ, ["MyKey"], undefined, undefined, ConditionValidated.Validated)]);

		const oFormatOptions = oFilterField.getFormatOptions();
		assert.ok(oFormatOptions.awaitFormatCondition, "FilterField implements awaitFormatCondition");

		sinon.spy(oFormatOptions, "awaitFormatCondition");
		sinon.stub(oFilterField, "getFormatOptions").returns(oFormatOptions);
		sinon.stub(oFilterField.getControlDelegate(), "getDescription").returns({value: "MyKey", description: "MyDescription"});

		oFilterField.placeAt("content");
		await nextUIUpdate();

		assert.ok(oFormatOptions.awaitFormatCondition.called, "awaitFormatCondition called during formatting");
		await nextUIUpdate();

		assert.deepEqual(oFilterField.getConditions(), [
			{
				"operator": "EQ",
				"values": [
					"MyKey",
					"MyDescription"
				],
				"isEmpty": null,
				"validated": "Validated"
			}
		], "Condition was updated with description from formatting.");

		oFormatOptions.awaitFormatCondition.restore();
		oFilterField.getFormatOptions.restore();
		oFilterField.getControlDelegate().getDescription.restore();
	});

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

	let oCM;
	QUnit.module("ConditionModel binding", {
		beforeEach: async () => {
			oCM = new ConditionModel();
			oFilterField = new FilterField("FF1", {
				conditions: "{cm>/conditions/Name}",
				dataType: "sap.ui.model.type.Integer",
				dataTypeConstraints: {maximum: 10},
				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler,
				parseError: _myParseErrorHandler,
				formatError: _myFormatErrorHandler,
				validationError: _myValidationErrorHandler,
				validationSuccess: _myValidationSuccessHandler,
				models: {cm: oCM}
			}).placeAt("content");
			Messaging.registerObject(oFilterField, true); // to test valueState
			await nextUIUpdate();
		},
		afterEach() {
			oFilterField.destroy();
			oFilterField = undefined;
			oCM.destroy();
			oCM = undefined;
			iParseError = 0;
			oParseErrorParameters = null;
			iFormatError = 0;
			oFormatErrorParameters = null;
			iValidationError = 0;
			oValidationErrorParameters = null;
			iValidationSuccess = 0;
			oValidationSuccessParameters = null;
		}
	});

	QUnit.test("ParseError handling", (assert) => {

		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("X");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iParseError, 1, "ParseError fired");
		assert.equal(oParseErrorParameters?.element, oFilterField, "ParseError fired for FilterField");
		assert.equal(oParseErrorParameters?.property, "conditions", "ParseError 'property'");
		assert.notOk(oParseErrorParameters?.type, "ParseError 'type'");

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oFilterField.getValueState(), ValueState.Error, "FilterField: ValueState");
			assert.equal(oFilterField.getValueStateText(), oParseErrorParameters?.message, "FilterField: ValueStateText");
			assert.equal(oContent.getValueState(), ValueState.Error, "Content: ValueState");
			assert.equal(oContent.getValueStateText(), oParseErrorParameters?.message, "Content: ValueStateText");

			const aMessages = Messaging.getMessageModel().getObject("/");
			const oMessage = aMessages?.[0];
			assert.equal(aMessages?.length, 1, "One Message in MessageModel");
			assert.equal(oMessage.getType(), MessageType.Error, "Message 'type'");
			assert.equal(oMessage.getMessage(), oParseErrorParameters?.message, "Message 'message'");
			assert.deepEqual(oMessage.getTargets(), [oFilterField.getId() + "/conditions"], "Message 'targets'");
			assert.deepEqual(oMessage.getControlIds(), [oFilterField.getId()], "Message 'controlIds'");

			fnDone();
		}, 0);

	});

	QUnit.test("FormatError handling", (assert) => {

		Messaging.registerObject(oFilterField, true); // to test valueState
		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		const oType = oFilterField.getContentFactory().retrieveDataType();
		sinon.stub(oType, "formatValue").withArgs("XXXX", "string").throws(new FormatException("My FormatExeption")); // as Integer-type don't throw FormatException
		oCM.addCondition("Name", Condition.createCondition(OperatorName.EQ, ["XXXX"], undefined, undefined, ConditionValidated.notValidated));
		oCM.checkUpdate(true, false);
		assert.equal(iFormatError, 1, "FormatError fired");
		assert.equal(oFormatErrorParameters?.element, oFilterField, "FormatError fired for FilterField");
		assert.equal(oFormatErrorParameters?.property, "conditions", "FormatError 'property'");
		assert.notOk(oFormatErrorParameters?.type, "FormatError 'type'");

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oFilterField.getValueState(), ValueState.None, "FilterField: ValueState"); // as message seems not to be forwarded to MessageModel
			assert.equal(oFilterField.getValueStateText(), "", "FilterField: ValueStateText");
			assert.equal(oContent.getValueState(), ValueState.None, "Content: ValueState");
			assert.equal(oContent.getValueStateText(), "", "Content: ValueStateText");

			const aMessages = Messaging.getMessageModel().getObject("/");
			assert.equal(aMessages?.length, 0, "No Message in MessageModel");

			oType.formatValue.restore();
			fnDone();
		}, 0);

	});

	QUnit.test("ValidationError & ValidationSuccess handling", (assert) => {

		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("100");
		qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iValidationError, 1, "ValidationError fired");
		assert.equal(oValidationErrorParameters?.element, oFilterField, "ValidationError fired for FilterField");
		assert.equal(oValidationErrorParameters?.property, "conditions", "ValidationError 'property'");
		assert.notOk(oValidationErrorParameters?.type, "ValidationError 'type'");

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oFilterField.getValueState(), ValueState.Error, "FilterField: ValueState");
			assert.equal(oFilterField.getValueStateText(), oValidationErrorParameters?.message, "FilterField: ValueStateText");
			assert.equal(oContent.getValueState(), ValueState.Error, "Content: ValueState");
			assert.equal(oContent.getValueStateText(), oValidationErrorParameters?.message, "Content: ValueStateText");

			let aMessages = Messaging.getMessageModel().getObject("/");
			const oMessage = aMessages?.[0];
			assert.equal(aMessages?.length, 1, "One Message in MessageModel");
			assert.equal(oMessage.getType(), MessageType.Error, "Message 'type'");
			assert.equal(oMessage.getMessage(), oValidationErrorParameters?.message, "Message 'message'");
			assert.deepEqual(oMessage.getTargets(), [oFilterField.getId() + "/conditions"], "Message 'targets'");
			assert.deepEqual(oMessage.getControlIds(), [oFilterField.getId()], "Message 'controlIds'");

			jQuery(oContent.getFocusDomRef()).val("1");
			qutils.triggerKeydown(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
			assert.equal(iValidationSuccess, 2, "ValidationSuccess event fired"); // once from inner control and once from ConditionModel-Binding (As we cannot be sure that there is a real model update if same value is chosen again.)
			assert.equal(oValidationSuccessParameters?.element, oFilterField, "ValidationSuccess fired for FilterField");
			assert.equal(oValidationSuccessParameters?.property, "conditions", "ValidationSuccess 'property'");
			assert.notOk(oValidationSuccessParameters?.type, "ValidationSuccess 'type'");

			setTimeout(() => { // to wait for valueStateMessage
				assert.equal(oFilterField.getValueState(), ValueState.None, "FilterField: ValueState");
				assert.equal(oFilterField.getValueStateText(), "", "FilterField: ValueStateText");
				assert.equal(oContent.getValueState(), ValueState.None, "Content: ValueState");
				assert.equal(oContent.getValueStateText(), "", "Content: ValueStateText");

				aMessages = Messaging.getMessageModel().getObject("/");
				assert.equal(aMessages?.length, 0, "No Message in MessageModel");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.test("Model-Message handling", (assert) => {

		const aContent = oFilterField.getAggregation("_content");
		const oContent = aContent?.length > 0 && aContent[0];

		const oMessage = new Message({
			message: "My warning message",
			type: MessageType.Warning,
			target: '/conditions/Name',
			fullTarget: '/conditions/Name',
			processor: oCM
		});
		Messaging.addMessages(oMessage);

		const fnDone = assert.async();
		setTimeout(() => { // to wait for valueStateMessage
			assert.equal(oFilterField.getValueState(), ValueState.Warning, "FilterField: ValueState");
			assert.equal(oFilterField.getValueStateText(), oMessage.getMessage(), "FilterField: ValueStateText");
			assert.equal(oContent.getValueState(), ValueState.Warning, "Content: ValueState");
			assert.equal(oContent.getValueStateText(), oMessage.getMessage(), "Content: ValueStateText");

			let aMessages = Messaging.getMessageModel().getObject("/");
			assert.equal(aMessages?.length, 1, "One Message in MessageModel");
			assert.deepEqual(oMessage.getControlIds(), [oFilterField.getId()], "Message 'controlIds'");

			Messaging.removeAllMessages();

			setTimeout(() => { // to wait for valueStateMessage
				assert.equal(oFilterField.getValueState(), ValueState.None, "FilterField: ValueState");
				assert.equal(oFilterField.getValueStateText(), "", "FilterField: ValueStateText");
				assert.equal(oContent.getValueState(), ValueState.None, "Content: ValueState");
				assert.equal(oContent.getValueStateText(), "", "Content: ValueStateText");

				aMessages = Messaging.getMessageModel().getObject("/");
				assert.equal(aMessages?.length, 0, "No Messages in MessageModel");

				fnDone();
			}, 0);
		}, 0);

	});

});
