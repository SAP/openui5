/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Context",
	"sap/ui/model/odata/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (Log, Context, ODataPropertyBinding, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataPropertyBinding (ODataPropertyBindingNoFakeService)", {
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
	QUnit.test("setContext: preliminary context", function (assert) {
		var oBinding = "ODataPropertyBinding",
			oContext = {
				isPreliminary : function () {}
			};

		this.mock(oContext).expects("isPreliminary").withExactArgs().returns(true);

		// code under test
		ODataPropertyBinding.prototype.setContext.call(oBinding, oContext);
	});

	//*********************************************************************************************
[null, undefined].forEach(function (oContext) {
	QUnit.test("setContext: unchanged context: " + oContext, function (assert) {
		var oBinding = {oContext : "Binding's Context"};

		this.mock(Context).expects("hasChanged")
			.withExactArgs(oBinding.oContext, sinon.match.same(oContext))
			.returns(false);

		// code under test
		ODataPropertyBinding.prototype.setContext.call(oBinding, oContext);
	});
});

	//*********************************************************************************************
	QUnit.test("setContext: unchanged context: V2 context", function (assert) {
		var oContext = {isPreliminary : function () {}},
			oBinding = {
				oContext : oContext
			};

		this.mock(oContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(Context).expects("hasChanged")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oContext))
			.returns(false);

		// code under test
		ODataPropertyBinding.prototype.setContext.call(oBinding, oContext);
	});

	//*********************************************************************************************
[
	{aControlMessages : [], bForceUpdate : false, bSameContext : true},
	{aControlMessages : [], bForceUpdate : false, bSameContext : false},
	{aControlMessages : [{}], bForceUpdate : true, bSameContext : false}
].forEach(function (oFixture) {
	var sTitle = "setContext: changed context (relative binding)"
			+ "; same context = " + oFixture.bSameContext
			+ "; number of control messages = " + oFixture.aControlMessages.length;

	QUnit.test(sTitle, function (assert) {
		var oContext = {
				isPreliminary : function () {}
			},
			oBinding = {
				oContext : oFixture.bSameContext ? oContext : "Binding's Context",
				checkUpdate : function () {},
				getDataState : function () {},
				isRelative : function () {}
			},
			oDataState = {
				getControlMessages : function () {}
			};

		this.mock(oContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(Context).expects("hasChanged")
			.withExactArgs(oBinding.oContext, sinon.match.same(oContext))
			.returns(true);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		if (!oFixture.bSameContext) {
			this.mock(oBinding).expects("getDataState").withExactArgs().returns(oDataState);
			this.mock(oDataState).expects("getControlMessages").withExactArgs()
				.returns(oFixture.aControlMessages);
		}

		this.mock(oBinding).expects("checkUpdate").withExactArgs(oFixture.bForceUpdate);

		// code under test
		ODataPropertyBinding.prototype.setContext.call(oBinding, oContext);

		assert.strictEqual(oBinding.oContext, oContext);
	});
});
});