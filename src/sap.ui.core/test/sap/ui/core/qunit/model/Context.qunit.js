/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Context"
], function (Log, Context) {
	/*global QUnit,sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.Context", {
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

	//*********************************************************************************************
	QUnit.test("hasChanged", function (assert) {
		// code under test
		assert.strictEqual(new Context("~oModel", "~sPath").hasChanged(), false);
	});

	//*********************************************************************************************
[
	{oOldContext : null, oNewContext : undefined},
	{oOldContext : undefined, oNewContext : null},
	{oOldContext : new Context("~oModel", "/~sPath0"), oNewContext : undefined},
	{
		oOldContext : new Context("~oModel", "/~sPath0"),
		oNewContext : new Context("~oModel", "/~sPath1")
	}
].forEach(function (oFixture, i) {
	QUnit.test("Context.hasChanged: different contexts, #" + i, function (assert) {
		// code under test
		assert.strictEqual(Context.hasChanged(oFixture.oOldContext, oFixture.oNewContext), true);
	});
});

	//*********************************************************************************************
	QUnit.test("Context.hasChanged: same contexts", function (assert) {
		var oContext = new Context("~oModel", "/~sPath"),
			oContextMock = this.mock(oContext);

		// code under test
		assert.strictEqual(Context.hasChanged(undefined, undefined), false);

		// code under test
		assert.strictEqual(Context.hasChanged(null, null), false);

		oContextMock.expects("hasChanged").withExactArgs().returns("~truthy");

		// code under test
		assert.strictEqual(Context.hasChanged(oContext, oContext), true);

		oContextMock.expects("hasChanged").withExactArgs().returns(/*falsy*/undefined);

		// code under test
		assert.strictEqual(Context.hasChanged(oContext, oContext), false);
	});

	//*********************************************************************************************
	QUnit.test("setProperty", function (assert) {
		const oModel = {setProperty() {}};
		const oContext = new Context(oModel, "~sContextPath");

		this.mock(oModel).expects("setProperty")
			.withExactArgs("~sBindingPath", "~vValue", sinon.match.same(oContext), true)
			.returns(true);

		// code under test
		oContext.setProperty("~sBindingPath", "~vValue");
	});

	//*********************************************************************************************
	QUnit.test("setProperty: value cannot be set by model", function (assert) {
		const oModel = {setProperty() {}};
		const oContext = new Context(oModel, "~sContextPath");

		this.mock(oModel).expects("setProperty")
			.withExactArgs("~sBindingPath", "~vValue", sinon.match.same(oContext), true)
			.returns(false);

		assert.throws(function () {
			// code under test
			oContext.setProperty("~sBindingPath", "~vValue");
		 }, new Error("Cannot set the value ~vValue for the property ~sBindingPath as the context path ~sContextPath"
				+ " does not refer to an entry in the model data."));
	});
});