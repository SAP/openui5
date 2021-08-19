/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v2/Context",
	"sap/ui/test/TestUtils"
], function (Log, BaseContext, Context, TestUtils) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.Context", {
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
	QUnit.test("constructor", function (assert) {
		var oContext;

		// code under test
		oContext = new Context("~oModel", "/~sPath");

		assert.ok(oContext instanceof Context);
		assert.ok(oContext instanceof BaseContext);
		// constructor parameters
		assert.strictEqual(oContext.oModel, "~oModel");
		assert.strictEqual(oContext.sPath, "/~sPath");
		// additional properties
		assert.strictEqual(oContext.bCreated, undefined);
		assert.strictEqual(oContext.sDeepPath, "/~sPath");
		assert.strictEqual(oContext.bForceRefresh, false);
		assert.strictEqual(oContext.bPreliminary, false);

		// code under test
		oContext = new Context("~oModel", "/~sPath", "/~sDeepPath");

		assert.strictEqual(oContext.sDeepPath, "/~sDeepPath");
	});

	//*********************************************************************************************
	QUnit.test("setForceRefresh and isRefreshForced", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.isRefreshForced(), false);
		oContext.setForceRefresh("~bForceFrefresh");
		assert.strictEqual(oContext.isRefreshForced(), "~bForceFrefresh");
	});

	//*********************************************************************************************
	QUnit.test("setPreliminary and isPreliminary", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.isPreliminary(), false);
		oContext.setPreliminary("~bPreliminary");
		assert.strictEqual(oContext.isPreliminary(), "~bPreliminary");
	});

	//*********************************************************************************************
	QUnit.test("setUpdated and isUpdated", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.isUpdated(), false);
		oContext.setUpdated("~bUpdated");
		assert.strictEqual(oContext.isUpdated(), "~bUpdated");
	});

	//*********************************************************************************************
	QUnit.test("setDeepPath and getDeepPath", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.getDeepPath(), "~sPath");
		oContext.setDeepPath("/~deepPath");
		assert.strictEqual(oContext.getDeepPath(), "/~deepPath");
	});

	//*********************************************************************************************
	[
		{isUpdated : true, result : true},
		{isUpdated : "true", result : "true"},
		{isUpdated : undefined, isRefreshForced : true, result : true},
		{isUpdated : undefined, isRefreshForced : false, result : false},
		{isUpdated : undefined, isRefreshForced : undefined, result : undefined},
		{isUpdated : false, isRefreshForced : true, result : true},
		{isUpdated : false, isRefreshForced : "true", result : "true"}
	].forEach(function (oFixture, i) {
		QUnit.test("hasChanged #" + i, function (assert) {
			var oContext = new Context("~oModel", "~sPath");

			oContext.setUpdated(oFixture.isUpdated);
			oContext.setForceRefresh(oFixture.isRefreshForced);

			// code under test
			assert.strictEqual(oContext.hasChanged(), oFixture.result);
		});
	});

	//*********************************************************************************************
	QUnit.test("isTransient", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.isTransient(), undefined);

		oContext.bCreated = "~bCreated";

		// code under test
		assert.strictEqual(oContext.isTransient(), "~bCreated");
	});
});
