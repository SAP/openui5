/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/test/TestUtils"
], function (Log, Binding, ChangeReason, TestUtils) {
	/*global QUnit*/
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
});