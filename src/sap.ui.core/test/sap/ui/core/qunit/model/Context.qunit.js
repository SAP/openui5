/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Context",
	"sap/ui/test/TestUtils"
], function (Log, Context, TestUtils) {
	/*global QUnit,sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.Context", {
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
	QUnit.test("getMessages", function (assert) {
		var oModel = {
				getMessages : function () {}
			},
			oContext = new Context(oModel, "path");

		this.mock(oModel).expects("getMessages")
			.withExactArgs(sinon.match.same(oContext))
			.returns("messages");

		// code under test
		assert.strictEqual(oContext.getMessages(), "messages");
	});
});