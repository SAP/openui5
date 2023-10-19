/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/EventProvider",
	"sap/ui/core/Messaging",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason"
], function (Log, EventProvider, Messaging, Binding, ChangeReason) {
	/*global QUnit, sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.Binding", {
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
	QUnit.test("constructor", function (assert) {
		var oBinding = new Binding("~oModel", "some/path", "~oContext", "~mParameters");

		// code under test
		assert.strictEqual(oBinding.oModel, "~oModel");
		assert.strictEqual(oBinding.sPath, "some/path");
		assert.strictEqual(oBinding.oContext, "~oContext");
		assert.strictEqual(oBinding.mParameters, "~mParameters");
		assert.strictEqual(oBinding.bInitial, false);
		assert.strictEqual(oBinding.bSuspended, false);
		assert.strictEqual(oBinding.oDataState, null);
		assert.ok(oBinding.hasOwnProperty("bIgnoreMessages"));
		assert.strictEqual(oBinding.bIgnoreMessages, undefined);
		assert.ok(oBinding.hasOwnProperty("bIsBeingDestroyed"));
		assert.strictEqual(oBinding.bIsBeingDestroyed, undefined);
		assert.ok(oBinding.hasOwnProperty("bFiredAsync"));
		assert.strictEqual(oBinding.bFiredAsync, undefined);
	});

	//*********************************************************************************************
	QUnit.test("constructor, bRelative", function (assert) {
		var oBinding = new Binding(/*oModel*/null, "/absolute");

		// code under test
		assert.strictEqual(oBinding.bRelative, false);

		oBinding = new Binding(/*oModel*/null, "relative");

		// code under test
		assert.strictEqual(oBinding.bRelative, true);
	});

	//*********************************************************************************************
	QUnit.test("setContext", function (assert) {
		var oContext = {},
			oBinding = new Binding(/*oModel*/null, "some/path", oContext),
			oDataState = {
				getControlMessages : function () {},
				reset : function () {}
			},
			oMessaging = {removeMessages : function () {}};

		assert.strictEqual(oBinding.getContext(), oContext);

		this.mock(sap.ui).expects("require").withExactArgs("sap/ui/core/Messaging")
			.returns(oMessaging);
		this.mock(oBinding).expects("getDataState").withExactArgs().twice().returns(oDataState);
		this.mock(oDataState).expects("getControlMessages").withExactArgs()
			.returns("~messages");
		this.mock(oMessaging).expects("removeMessages").withExactArgs("~messages", true);
		this.mock(oDataState).expects("reset").withExactArgs();
		this.mock(oBinding).expects("checkDataState").withExactArgs();
		this.mock(oBinding).expects("_fireChange").withExactArgs({
			reason : ChangeReason.Context
		});

		// code under test
		oBinding.setContext();

		assert.strictEqual(oBinding.getContext(), undefined);

		// code under test: no new event
		oBinding.setContext();
	});

	//*********************************************************************************************
[{
	mParameters : undefined,
	mChangeParameters : {reason : ChangeReason.Context}
}, {
	mParameters : {foo : "bar"},
	mChangeParameters : {reason : ChangeReason.Context}
}, {
	mParameters : {detailedReason : "sDetailedReason"},
	mChangeParameters : {detailedReason : "sDetailedReason", reason : ChangeReason.Context}
}].forEach(function (oFixture, i) {
	QUnit.test("setContext: parameter detailedReason, " + i, function (assert) {
		var oBinding = new Binding(/*oModel*/null, "some/path"),
			oContext = {};

		assert.strictEqual(oBinding.getContext(), undefined);

		this.mock(oBinding).expects("_fireChange").withExactArgs(oFixture.mChangeParameters);

		// code under test
		oBinding.setContext(oContext, oFixture.mParameters);

		assert.strictEqual(oBinding.getContext(), oContext);

		// code under test: no new event
		oBinding.setContext(oContext);
	});
});

	//*********************************************************************************************
	QUnit.test("setIgnoreMessages", function (assert) {
		var oBinding = new Binding(/*oModel*/null, "some/path");

		// code under test
		oBinding.setIgnoreMessages("~boolean");

		// code under test
		assert.strictEqual(oBinding.bIgnoreMessages, "~boolean");
	});

	//*********************************************************************************************
[
	{bIgnoreMessages : undefined, bResult : undefined},
	{bIgnoreMessages : false, bResult : false},
	{bIgnoreMessages : true, supportsIgnoreMessages : false, bResult : false},
	{bIgnoreMessages : true, supportsIgnoreMessages : true, bResult : true}
].forEach(function (oFixture, i) {
	QUnit.test("getIgnoreMessages: #" + i, function (assert) {
		var oBinding = new Binding(/*oModel*/null, "some/path");

		this.mock(oBinding).expects("supportsIgnoreMessages").withExactArgs()
			.exactly(oFixture.hasOwnProperty("supportsIgnoreMessages") ? 1 : 0)
			.returns(oFixture.supportsIgnoreMessages);
		oBinding.bIgnoreMessages = oFixture.bIgnoreMessages;

		// code under test
		assert.strictEqual(oBinding.getIgnoreMessages(), oFixture.bResult);
	});
});

	//*********************************************************************************************
	QUnit.test("supportsIgnoreMessages", function (assert) {
		// code under test
		assert.strictEqual(Binding.prototype.supportsIgnoreMessages(), false);
	});

	//*********************************************************************************************
[true, false].forEach(function (bIgnoreMessages) {
	var sTitle = "_checkDataState: call _checkDataStateMessages if messages are not ignored;"
			+ " ignore messages: " + bIgnoreMessages;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				_checkDataStateMessages : function () {},
				getDataState : function () {},
				getIgnoreMessages : function () {}
			},
			oDataState = {
				changed : function () {}
			};

		this.mock(oBinding).expects("getDataState").withExactArgs().returns(oDataState);
		this.mock(oBinding).expects("getIgnoreMessages").withExactArgs().returns(bIgnoreMessages);
		this.mock(oBinding).expects("_checkDataStateMessages")
			.withExactArgs(sinon.match.same(oDataState), "~sResolvedPath")
			.exactly(bIgnoreMessages ? 0 : 1);
		this.mock(oDataState).expects("changed").withExactArgs().returns(false);

		// code under test
		Binding.prototype._checkDataState.call(oBinding, "~sResolvedPath");
	});
});

	//*********************************************************************************************
[
	{dataStateSet : true, dataStateChanged : false},
	{dataStateSet : true, dataStateChanged : true},
	{dataStateSet : false}
].forEach(function (oFixture) {
	var sTitle = "destroy - data state set: " + oFixture.dataStateSet + "; data state changed: "
			+ oFixture.dataStateChanged;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oDataState : null,
				mEventRegistry : oFixture.eventRegistry,
				_checkDataStateMessages : function () {},
				destroy : function () {},
				fireEvent : function () {},
				getDataState : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oDataState = {
				changed : function () {},
				getControlMessages : function () {},
				setModelMessages : function () {}
			},
			oDataStateMock = this.mock(oDataState);

		if (oFixture.dataStateSet) {
			oBinding.oDataState = oDataState;

			oDataStateMock.expects("getControlMessages")
				.withExactArgs().returns("~oControlMessages");
			this.mock(Messaging).expects("removeMessages")
				.withExactArgs("~oControlMessages", true);
			oDataStateMock.expects("setModelMessages").withExactArgs();
			oDataStateMock.expects("changed").withExactArgs().returns(oFixture.dataStateChanged);

			if (oFixture.dataStateChanged) {
				oBindingMock.expects("fireEvent")
					.withExactArgs("DataStateChange", {dataState : oDataState})
					.callsFake(function () {
						// code under test - recursive call
						Binding.prototype.destroy.call(oBinding);
					});
				oBindingMock.expects("fireEvent")
					.withExactArgs("AggregatedDataStateChange", {dataState : oDataState});
			} else {
				oBindingMock.expects("fireEvent").never();
			}

			this.mock(EventProvider.prototype).expects("destroy").on(oBinding).withExactArgs();
		}

		assert.strictEqual(oBinding.bIsBeingDestroyed, undefined);

		// code under test
		Binding.prototype.destroy.call(oBinding);

		assert.strictEqual(oBinding.bIsBeingDestroyed, true);
		assert.strictEqual(oBinding.oDataState, oFixture.dataStateSet ? undefined : null);
	});
});

	//*********************************************************************************************
	QUnit.test("getResolvedPath", function (assert) {
		var oModel = {resolve : function () {}};

		this.mock(oModel).expects("resolve").withExactArgs("~sPath", "~oContext")
			.returns("~resolvedPath");

		// code under test: return resolved path
		assert.strictEqual(new Binding(oModel, "~sPath", "~oContext").getResolvedPath(),
			"~resolvedPath");

		// code under test: path cannot be resolved without a model
		assert.strictEqual(new Binding(undefined, "~sPath", "~oContext").getResolvedPath(),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("checkDataState", function (assert) {
		var oBinding = new Binding("~oModel", "~sPath", "~oContext");

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("_checkDataState").withExactArgs("~resolvedPath", "~mPaths");

		// code under test
		oBinding.checkDataState("~mPaths");
	});

	//*********************************************************************************************
	QUnit.test("_checkDataStateMessages", function (assert) {
		var oModel = {
				getMessagesByPath : function () {}
			},
			oBinding = new Binding(oModel, "/n/a"),
			oDataState = {
				setModelMessages : function () {}
			},
			oDataStateMock = this.mock(oDataState);

		this.mock(oModel).expects("getMessagesByPath").withExactArgs("~resolvedPath")
			.returns("~messages");
		oDataStateMock.expects("setModelMessages").withExactArgs("~messages");

		// code under test
		oBinding._checkDataStateMessages(oDataState, "~resolvedPath");

		oDataStateMock.expects("setModelMessages").withExactArgs([]);

		// code under test
		oBinding._checkDataStateMessages(oDataState, undefined);
	});
});