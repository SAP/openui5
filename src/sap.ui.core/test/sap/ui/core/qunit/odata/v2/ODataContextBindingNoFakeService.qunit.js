/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	'sap/ui/model/ChangeReason',
	"sap/ui/model/odata/v2/ODataContextBinding",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, ODataContextBinding, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataContextBinding (ODataContextBindingNoFakeService)", {
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
[true, false, undefined].forEach(function (bCreatePreliminary) {
	QUnit.test("checkUpdate: createPreliminaryContext " + bCreatePreliminary, function (assert) {
		var oContext = {
				isPreliminary : function () {},
				isUpdated : function () {}
			},
			oModel = {
				createBindingContext : function () {}
			},
			oBinding = new ODataContextBinding(oModel, "path", oContext, {
				createPreliminaryContext : bCreatePreliminary,
				expand : "foo",
				select : "bar",
				usePreliminaryContext : true
			}),
			mExpectedParameters = bCreatePreliminary
				? {expand : "foo", select : "bar", usePreliminaryContext : true}
				: {createPreliminaryContext : undefined, expand : "foo", select : "bar",
					usePreliminaryContext : true};

		this.mock(oContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oContext).expects("isUpdated").withExactArgs().returns(false);
		this.mock(Object).expects("assign")
			.exactly(bCreatePreliminary ? 1 : 0)
			.withExactArgs({}, oBinding.mParameters)
			.callThrough();
		this.mock(oModel).expects("createBindingContext")
			.withExactArgs("path", sinon.match.same(oContext), mExpectedParameters)
			.returns("newContext");
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});
		// mimic binding initialization
		oBinding.bInitial = false;
		oBinding.oElementContext = "currentContext";

		// code under test
		oBinding.checkUpdate();

		assert.strictEqual(oBinding.oElementContext, "newContext");
	});
});
});