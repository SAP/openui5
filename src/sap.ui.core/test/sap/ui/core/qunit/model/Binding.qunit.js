/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/test/TestUtils"
], function (Log, Binding, ChangeReason, TestUtils) {
	/*global QUnit, sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.Binding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
	QUnit.test("setContext", function (assert) {
		var oContext = {},
			oBinding = new Binding(/*oModel*/null, "some/path", oContext);

		assert.strictEqual(oBinding.getContext(), oContext);

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
	QUnit.test("setContext: sDetailedReason", function (assert) {
		var oBinding = new Binding(/*oModel*/null, "some/path"),
			oContext = {};

		assert.strictEqual(oBinding.getContext(), undefined);

		this.mock(oBinding).expects("_fireChange").withExactArgs({
			detailedReason : "sDetailedReason",
			reason : ChangeReason.Context
		});

		// code under test
		oBinding.setContext(oContext, "sDetailedReason");

		assert.strictEqual(oBinding.getContext(), oContext);

		// code under test: no new event
		oBinding.setContext(oContext);
	});

	//*********************************************************************************************
	QUnit.test("setIgnoreMessages and constructor", function (assert) {
		var oBinding = new Binding(/*oModel*/null, "some/path");

		// code under test
		assert.strictEqual(oBinding.bIgnoreMessages, false);

		// code under test
		oBinding.setIgnoreMessages(true);

		// code under test
		assert.strictEqual(oBinding.bIgnoreMessages, true);

		// code under test
		oBinding.setIgnoreMessages(false);

		// code under test
		assert.strictEqual(oBinding.bIgnoreMessages, false);

		// code under test
		oBinding.setIgnoreMessages(null);

		// code under test
		assert.strictEqual(oBinding.bIgnoreMessages, false);
	});

	//*********************************************************************************************
[
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
});