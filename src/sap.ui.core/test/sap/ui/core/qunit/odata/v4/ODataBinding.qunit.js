/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/ODataBinding"
], function (jQuery, _ODataHelper, asODataBinding) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	/**
	 * Constructs a test object.
	 *
	 * @param {object} oTemplate
	 *   A template object to fill the binding, all properties are copied
	 */
	function ODataBinding(oTemplate) {
		jQuery.extend(this, oTemplate);
	}

	asODataBinding(ODataBinding.prototype);

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataBinding", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	//*********************************************************************************************
	QUnit.test("getGroupId: own group", function (assert) {
		var oBinding = new ODataBinding({
				sGroupId : "foo"
			});

		assert.strictEqual(oBinding.getGroupId(), "foo");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId: relative, inherits group", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {
					getGroupId : function () {}
				},
				bRelative : true
			}),
			oContext = {
				getGroupId : function () {}
			},
			oContextMock = this.mock(oContext);

		this.mock(oBinding.oModel).expects("getGroupId").twice()
			.withExactArgs().returns("fromModel");

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromModel");

		oBinding.oContext = oContext;
		oContextMock.expects("getGroupId").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromModel");

		oContextMock.expects("getGroupId").withExactArgs().returns("fromContext");

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromContext");
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId: own group", function (assert) {
		var oBinding = new ODataBinding({
				sUpdateGroupId : "foo"
			});

		assert.strictEqual(oBinding.getUpdateGroupId(), "foo");
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId: relative, inherits group", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {
					getUpdateGroupId : function () {}
				},
				bRelative : true
			}),
			oContext = {
				getUpdateGroupId : function () {}
			},
			oContextMock = this.mock(oContext);

		this.mock(oBinding.oModel).expects("getUpdateGroupId").twice()
			.withExactArgs().returns("fromModel");

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oBinding.oContext = oContext;
		oContextMock.expects("getUpdateGroupId").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oContextMock.expects("getUpdateGroupId").withExactArgs().returns("fromContext");

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromContext");
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oBinding = new ODataBinding();

		assert.throws(function () { //TODO implement
			oBinding.isInitial();
		}, new Error("Unsupported operation: isInitial"));

		assert.throws(function () { //TODO implement
			oBinding.resume();
		}, new Error("Unsupported operation: resume"));

		assert.throws(function () { //TODO implement
			oBinding.suspend();
		}, new Error("Unsupported operation: suspend"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: success", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {
					checkGroupId : function () {}
				},

				hasPendingChanges : function () {},
				refreshInternal : function () {}
			});

		this.mock(_ODataHelper).expects("isRefreshable")
			.withExactArgs(sinon.match.same(oBinding)).returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId");
		this.mock(oBinding).expects("refreshInternal").withExactArgs("groupId");

		oBinding.refresh("groupId");
	});

	//*********************************************************************************************
	QUnit.test("refresh: not refreshable", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(_ODataHelper).expects("isRefreshable")
			.withExactArgs(sinon.match.same(oBinding)).returns(false);

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: pending changes", function (assert) {
		var oBinding = new ODataBinding({
				hasPendingChanges : function () {}
			});

		this.mock(_ODataHelper).expects("isRefreshable")
			.withExactArgs(sinon.match.same(oBinding)).returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(true);

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Cannot refresh due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: invalid group ID", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {
					checkGroupId : function () {}
				},
				hasPendingChanges : function () {}
			}),
			oError = new Error();

		this.mock(_ODataHelper).expects("isRefreshable")
			.withExactArgs(sinon.match.same(oBinding)).returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.refresh("$invalid");
		}, oError);
	});
});