sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/ui/core/message/Message",
	"sap/ui/model/DataState"
], function (Log, deepEqual, Message, DataState) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.DataState", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor",function(assert) {
		var oDataState,
			oDataStateMock = this.mock(DataState);

		oDataStateMock.expects("getInitialProperties").withExactArgs().returns("~initial0");
		oDataStateMock.expects("getInitialProperties").withExactArgs().returns("~initial1");

		// code under test
		oDataState = new DataState();

		assert.strictEqual(oDataState.mProperties, "~initial0");
		assert.strictEqual(oDataState.mChangedProperties, "~initial1");
	});

	//*********************************************************************************************
	QUnit.test("test DataState API",function(assert) {
		var oDataState = new DataState();
		var mChanges = oDataState.getChanges();
		var aPropertyChecks = [
			"Value", "OriginalValue", "InvalidValue"
		];

		assert.equal(deepEqual(mChanges,{}),true, "Initially the changes are empty");

		for (var i = 0; i < aPropertyChecks.length; i++) {
			var sProp = aPropertyChecks[i];
			var sOldValue = oDataState["get" + sProp]();
			assert.equal(oDataState["set" + sProp](sProp),oDataState, "DataState object returned by " + "set" + sProp);
			assert.equal(sProp,oDataState["get" + sProp](), "DataState object returned correct value for " + "get" + sProp);
			mChanges = oDataState.getChanges();
			var sLowerPropName = sProp.substring(0,1).toLowerCase() + sProp.substring(1);
			assert.equal(mChanges[sLowerPropName].oldValue,sOldValue, "Changes contain correct old value for " + sProp);
			assert.equal(mChanges[sLowerPropName].value,oDataState["get" + sProp](), "Changes contain correct new value for " + sProp);
			oDataState["set" + sProp](sOldValue);
			mChanges = oDataState.getChanges();
			assert.equal(deepEqual(mChanges,{}),true, "Changes empty after apply of old value for " + sProp);
		}

		//checking dirty state
		oDataState.setOriginalValue("OriginalValue");
		oDataState.setValue("OriginalValue");
		assert.equal(oDataState.isDirty(),false, "Value same as Original not dirty");
		oDataState.setValue("Value");
		assert.equal(oDataState.isDirty(),true, "Value other that Original Dirty");
		oDataState.setValue("OriginalValue");
		assert.equal(oDataState.isDirty(),false, "Value same as Original not dirty");
		oDataState.setInvalidValue("ControlValue");
		assert.equal(oDataState.isDirty(),true, "Control Value set and dirty");
		assert.equal(oDataState.isControlDirty(),true, "Control Value set and controlDirty");
		oDataState.setInvalidValue(null);
		assert.equal(oDataState.isDirty(),true, "Value other that Original Dirty");
		assert.equal(oDataState.isControlDirty(),true, "Control Value set and controlDirty");
		oDataState.setInvalidValue(undefined);
		assert.equal(oDataState.isDirty(),false, "Control Value reset  and not dirty");
		assert.equal(oDataState.isControlDirty(),false, "Control Value reset and not controlDirty");
		oDataState.setInvalidValue(false);
		assert.equal(oDataState.isDirty(),true, "Value other that Original Dirty");
		assert.equal(oDataState.isControlDirty(),true, "Control Value set and controlDirty");

		//laundering
		oDataState.setLaundering(true);
		assert.equal(oDataState.isLaundering(),true, "Laundering set");
		oDataState.setLaundering(false);
		assert.equal(oDataState.isLaundering(),false, "Laundering reset");

		//messages
		oDataState.setModelMessages(["ModelMessage"]);
		assert.equal(oDataState.getModelMessages()[0],"ModelMessage", "Model Message set");
		oDataState.setControlMessages(["ControlMessage"]);
		assert.equal(oDataState.getControlMessages()[0],"ControlMessage", "Control Message set");
		assert.equal(oDataState.getMessages().length,2, "All Messages length 2");
		oDataState.setControlMessages(null);
		assert.equal(oDataState.getMessages().length,1, "All Messages length 1");
		assert.equal(oDataState.getControlMessages().length, 0, "Control Message reset");
		oDataState.setModelMessages(null);
		assert.equal(oDataState.getMessages().length, 0, "All Messages length 1");
		assert.equal(oDataState.getModelMessages().length, 0, "Control Message reset");
	});

	//*********************************************************************************************
[
	{controlMessages : ["aControlMessages"], modelMessages : ["aModelMessages"]},
	{controlMessages : ["aControlMessages"], modelMessages : []},
	{controlMessages : [], modelMessages : ["aModelMessages"]}
].forEach(function (oFixture, i) {
	QUnit.test("getMessagesForProperties, " + i, function(assert) {
		var aConcatCalls,
			// cannot mock Array#concat as it is used in sinon-4
			oConcatSpy = this.spy(Array.prototype, "concat"),
			aControlMessages = oFixture.controlMessages,
			aMessages,
			aModelMessages = oFixture.modelMessages,
			mProperties = {
				controlMessages : aControlMessages,
				modelMessages : aModelMessages
			},
			oSortSpy = this.spy(Array.prototype, "sort");

		// code under test
		aMessages = DataState.getMessagesForProperties(mProperties);

		aConcatCalls = oConcatSpy.getCalls().filter(function (oCall) {
			return oCall.calledWithExactly(aControlMessages || [], aModelMessages || [])
				&& deepEqual(oCall.thisValue, []);
		});
		assert.strictEqual(aConcatCalls.length, 1, "[].concat(aModelMessages, aControlMessages)");
		assert.ok(oSortSpy.calledWithExactly(Message.compare), "sort(Message.compare)");
		assert.strictEqual(aMessages, aConcatCalls[0].returnValue);
		assert.strictEqual(mProperties.controlMessages, aControlMessages);
		assert.strictEqual(mProperties.modelMessages, aModelMessages);
	});
});

	//*********************************************************************************************
	QUnit.test("getMessagesForProperties, no messages", function(assert) {
		var oConcatSpy = this.spy(Array.prototype, "concat"),
			mProperties = {
				controlMessages : [],
				modelMessages : []
			},
			oSortSpy = this.spy(Array.prototype, "sort");

		// code under test
		assert.deepEqual(DataState.getMessagesForProperties(mProperties), []);

		assert.ok(oConcatSpy.neverCalledWith([], []));
		assert.ok(oSortSpy.neverCalledWith(Message.compare));
	});

	//*********************************************************************************************
	QUnit.test("getMessages", function(assert) {
		var oDataState = new DataState();

		oDataState.mChangedProperties = "mChangedProperties";
		this.mock(DataState).expects("getMessagesForProperties")
			.withExactArgs("mChangedProperties")
			.returns("aMessages");

		// code under test
		assert.strictEqual(oDataState.getMessages(), "aMessages");
	});

	//*********************************************************************************************
	QUnit.test("_getOldMessages", function(assert) {
		var oDataState = new DataState();

		oDataState.mProperties = "mProperties";
		this.mock(DataState).expects("getMessagesForProperties")
			.withExactArgs("mProperties")
			.returns("aMessages");

		// code under test
		assert.strictEqual(oDataState._getOldMessages(), "aMessages");
	});

	//*********************************************************************************************
	QUnit.test("getInitialProperties", function(assert) {
		var oInitialProperties;

		// code under test
		oInitialProperties = DataState.getInitialProperties();

		assert.deepEqual(oInitialProperties, {
			controlMessages : [],
			dirty : false,
			internalValue : undefined,
			invalidValue : undefined,
			laundering : false,
			messages : [],
			modelMessages : [],
			originalInternalValue : undefined,
			originalValue : undefined,
			value : undefined
		});

		// code under test
		assert.notStrictEqual(DataState.getInitialProperties(), oInitialProperties);
	});

	//*********************************************************************************************
	QUnit.test("reset", function(assert) {
		var oDataState = new DataState();

		this.mock(DataState).expects("getInitialProperties").withExactArgs().returns("~initial");

		assert.notStrictEqual(oDataState.mChangedProperties, "~initial");

		// code under test
		oDataState.reset();

		assert.strictEqual(oDataState.mChangedProperties, "~initial");
	});

	//*********************************************************************************************
	QUnit.test("getAllMessages", function(assert) {
		var oDataState = new DataState();

		this.mock(oDataState).expects("_getOldMessages")
			.withExactArgs()
			.returns(["~msg0", "~msg1"]);
		this.mock(oDataState).expects("getMessages").withExactArgs().returns(["~msg0", "~msg2"]);

		// code under test
		assert.deepEqual(oDataState.getAllMessages(), ["~msg0", "~msg2", "~msg1"]);
	});
});