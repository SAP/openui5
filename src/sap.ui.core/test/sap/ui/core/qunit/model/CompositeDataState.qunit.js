sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/CompositeDataState",
	"sap/ui/model/DataState"
], function (Log, CompositeDataState, DataState) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.CompositeDataState", {
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
	QUnit.test("constructor", function(assert) {
		const oDataState0 = {setParent() {}};
		const oDataState0setParentExpectation = this.mock(oDataState0).expects("setParent");
		const oDataState1 = {setParent() {}};
		const oDataState1setParentExpectation = this.mock(oDataState1).expects("setParent");
		const oDataState2 = {setParent() {}};
		const oDataState2setParentExpectation = this.mock(oDataState2).expects("setParent");

		// code under test
		const oCompositeDataState = new CompositeDataState([oDataState0, oDataState1, oDataState2]);

		const oExpectedProperties = {
			controlMessages: [],
			dirty: false,
			internalValue: [],
			invalidValue: undefined,
			laundering: false,
			messages: [],
			modelMessages: [],
			originalInternalValue: [],
			originalValue: [],
			value: []
		};
		assert.deepEqual(oCompositeDataState.mProperties, oExpectedProperties);
		assert.deepEqual(oCompositeDataState.mChangedProperties, oExpectedProperties);
		assert.notStrictEqual(oCompositeDataState.mChangedProperties, oCompositeDataState.mProperties);
		assert.deepEqual(oCompositeDataState.aDataStates, [oDataState0, oDataState1, oDataState2]);
		assert.ok(oDataState0setParentExpectation.calledWithExactly(oCompositeDataState));
		assert.ok(oDataState1setParentExpectation.calledWithExactly(oCompositeDataState));
		assert.ok(oDataState2setParentExpectation.calledWithExactly(oCompositeDataState));
	});

	//*********************************************************************************************
	QUnit.test("getAllMessages", function(assert) {
		var oDataState0 = {getAllMessages() {}, setParent() {}},
			oDataState1 = {getAllMessages() {}, setParent() {}},
			oDataState2 = {getAllMessages() {}, setParent() {}},
			oCompositeDataState = new CompositeDataState([oDataState0, oDataState1, oDataState2]);

		this.mock(oDataState0).expects("getAllMessages")
			.withExactArgs()
			.returns(["~msg0", "~msg1"]);
		this.mock(oDataState1).expects("getAllMessages")
			.withExactArgs()
			.returns(["~msg1", "~msg2"]);
		this.mock(oDataState2).expects("getAllMessages")
			.withExactArgs()
			.returns(["~msg3", "~msg0"]);

		// code under test
		assert.deepEqual(oCompositeDataState.getAllMessages(),
			["~msg0", "~msg1", "~msg2", "~msg3"]);
	});

	//*********************************************************************************************
	QUnit.test("isControlDirty: composite data state is already dirty", function(assert) {
		const oCompositeDataState = {};
		this.mock(DataState.prototype).expects("isControlDirty").on(oCompositeDataState).withExactArgs()
			.returns("~truthyValue");

		// code under test
		assert.strictEqual(CompositeDataState.prototype.isControlDirty.call(oCompositeDataState), "~truthyValue");
	});

	//*********************************************************************************************
	QUnit.test("isControlDirty: delegate to aggregated data states", function(assert) {
		const oDataState0 = {isControlDirtyInternal() {}};
		const oDataState1 = {isControlDirtyInternal() {}};
		const oDataState2 = {isControlDirtyInternal() {}};
		const oCompositeDataState = {aDataStates: [oDataState0, oDataState1, oDataState2]};
		this.mock(DataState.prototype).expects("isControlDirty").on(oCompositeDataState).withExactArgs().returns(false);
		this.mock(oDataState0).expects("isControlDirtyInternal").withExactArgs().returns(false);
		this.mock(oDataState1).expects("isControlDirtyInternal").withExactArgs().returns(true);
		this.mock(oDataState2).expects("isControlDirtyInternal").never(); // stop iteration with first dirty state

		// code under test
		assert.strictEqual(CompositeDataState.prototype.isControlDirty.call(oCompositeDataState), true);
	});

	//*********************************************************************************************
	QUnit.test("isControlDirty: delegate to aggregated data states; not dirty", function(assert) {
		const oDataState0 = {isControlDirtyInternal() {}};
		const oDataState1 = {isControlDirtyInternal() {}};
		const oDataState2 = {isControlDirtyInternal() {}};
		const oCompositeDataState = {aDataStates: [oDataState0, oDataState1, oDataState2]};
		this.mock(DataState.prototype).expects("isControlDirty").on(oCompositeDataState).withExactArgs().returns(false);
		this.mock(oDataState0).expects("isControlDirtyInternal").withExactArgs().returns(false);
		this.mock(oDataState1).expects("isControlDirtyInternal").withExactArgs().returns(false);
		this.mock(oDataState2).expects("isControlDirtyInternal").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(CompositeDataState.prototype.isControlDirty.call(oCompositeDataState), false);
	});
});