/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataBinding"
], function (jQuery, _Helper, _SyncPromise, asODataBinding) {
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
				refreshInternal : function () {}
			});

		this.mock(oBinding).expects("isRefreshable").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId");
		this.mock(oBinding).expects("refreshInternal").withExactArgs("groupId");

		oBinding.refresh("groupId");
	});

	//*********************************************************************************************
	QUnit.test("refresh: not refreshable", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("isRefreshable").withExactArgs().returns(false);

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: pending changes", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("isRefreshable").withExactArgs().returns(true);
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
				}
			}),
			oError = new Error();

		this.mock(oBinding).expects("isRefreshable").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.refresh("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("isRefreshable", function (assert) {
		var oBinding = new ODataBinding({bRelative : false});
		assert.strictEqual(oBinding.isRefreshable(), true, "absolute");

		oBinding = new ODataBinding({bRelative : true});
		assert.strictEqual(oBinding.isRefreshable(), undefined, "relative - no context");

		oBinding = new ODataBinding({
			bRelative : true,
			oContext : {
				getBinding : function () {}
			}
		});
		assert.strictEqual(oBinding.isRefreshable(), false, "relative - V4 context");

		oBinding = new ODataBinding({
			bRelative : true,
			oContext : {}
		});
		assert.strictEqual(oBinding.isRefreshable(), true, "relative - base context");
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges", function (assert) {
		var oBinding = new ODataBinding(),
			oBindingMock = this.mock(oBinding),
			bResult = {/*some boolean*/};

		oBindingMock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChanges(), true);

		oBindingMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oBindingMock.expects("hasPendingChangesInDependents").withExactArgs().returns(bResult);

		// code under test
		assert.strictEqual(oBinding.hasPendingChanges(), bResult);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesForPath: with cache", function (assert) {
		var oCache = {
				hasPendingChangesForPath : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(oCache)
			}),
			oCacheMock = this.mock(oCache),
			oResult = {};

		["foo", ""].forEach(function (sPath) {
			oCacheMock.expects("hasPendingChangesForPath").withExactArgs(sPath).returns(oResult);

			assert.strictEqual(oBinding.hasPendingChangesForPath(sPath), oResult, "path=" + sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesForPath: without cache", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(undefined),
				sPath : "relative"
			}),
			sBuildPath = "~/foo",
			oContext = {
				hasPendingChangesForPath : function () {}
			},
			oContextMock = this.mock(oContext),
			oHelperMock = this.mock(_Helper),
			oResult = {};

		//code under test
		assert.strictEqual(oBinding.hasPendingChangesForPath("foo"), false, "foo");
		assert.strictEqual(oBinding.hasPendingChangesForPath(""), false, "empty path");

		oBinding.oContext = oContext;
		["foo", ""].forEach(function (sPath) {
			oHelperMock.expects("buildPath").withExactArgs(oBinding.sPath, sPath)
				.returns(sBuildPath);
			oContextMock.expects("hasPendingChangesForPath").withExactArgs(sBuildPath)
				.returns(oResult);

			//code under test
			assert.strictEqual(oBinding.hasPendingChangesForPath(sPath), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesForPath: without cache, base context", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(undefined),
				oContext : {}
			});
		assert.strictEqual(oBinding.hasPendingChangesForPath("foo"), false);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesForPath: cache is not yet available", function (assert) {
		var oCache = {
				hasPendingChangesForPath : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(Promise.resolve(oCache))
			});
		this.mock(oCache).expects("hasPendingChangesForPath").never();

		//code under test
		assert.strictEqual(oBinding.hasPendingChangesForPath("foo"), false);

		return oBinding.oCachePromise.then(); // wait for cache promise
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesInDependents", function (assert) {
		var oCache = {
				hasPendingChangesForPath : function () {}
			},
			oChild1 = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(oCache)
			}),
			oChild2 = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(undefined)
			}),
			oChild3 = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(Promise.resolve())
			}),
			oBinding = new ODataBinding({
				oModel : {
					getDependentBindings : function () {}
				}
			}),
			oChild1CacheMock = this.mock(oCache),
			oChild1Mock = this.mock(oChild1),
			oChild2Mock = this.mock(oChild2),
			oChild3Mock = this.mock(oChild3);

		this.mock(oBinding.oModel).expects("getDependentBindings").exactly(4)
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2, oChild3]);
		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);
		oChild1Mock.expects("hasPendingChangesInDependents").never();
		oChild2Mock.expects("hasPendingChangesInDependents").never();
		oChild3Mock.expects("hasPendingChangesInDependents").never();

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), false);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesInDependents: cache is not yet available", function (assert) {
		var oCache = {
				hasPendingChangesForPath : function () {}
			},
			oChild = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(Promise.resolve(oCache))
			}),
			oBinding = new ODataBinding({
				oModel : {
					getDependentBindings : function () {}
				}
			});

		this.mock(oBinding.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild]);
		this.mock(oCache).expects("hasPendingChangesForPath").never();

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), false);

		return oChild.oCachePromise.then(); // wait for cache promise
	});

	//*********************************************************************************************
	QUnit.test("resetChanges", function (assert) {
		var oBinding = new ODataBinding(),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("resetChangesForPath").withExactArgs("");
		oBindingMock.expects("resetChangesInDependents").withExactArgs();

		// code under test
		oBinding.resetChanges();
	});

	//*********************************************************************************************
	QUnit.test("resetChangesForPath: with cache", function (assert) {
		var oCache = {
				resetChangesForPath : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(oCache)
			}),
			oCacheMock = this.mock(oCache);

		["foo", ""].forEach(function (sPath) {
			oCacheMock.expects("resetChangesForPath").withExactArgs(sPath);

			oBinding.resetChangesForPath(sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChangesForPath: with cache is not yet available", function (assert) {
		var oCache = {
				resetChangesForPath : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(Promise.resolve(oCache))
			}),
			oCacheMock = this.mock(oCache);

		oCacheMock.expects("resetChangesForPath").never();

		oBinding.resetChangesForPath("");
	});

	//*********************************************************************************************
	QUnit.test("resetChangesForPath: without cache", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(undefined),
				sPath : "relative"
			}),
			sBuildPath = "~/foo",
			oContext = {
				resetChangesForPath : function () {}
			},
			oContextMock = this.mock(oContext),
			oHelperMock = this.mock(_Helper);

		//code under test
		oBinding.resetChangesForPath("foo");
		oBinding.resetChangesForPath("");

		oBinding.oContext = oContext;
		["foo", ""].forEach(function (sPath) {
			oHelperMock.expects("buildPath").withExactArgs(oBinding.sPath, sPath)
				.returns(sBuildPath);
			oContextMock.expects("resetChangesForPath").withExactArgs(sBuildPath);

			//code under test
			oBinding.resetChangesForPath(sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChangesForPath: without cache, base context", function (assert) {
		new ODataBinding({
			oCachePromise : _SyncPromise.resolve(undefined),
			oContext : {}
		}).resetChangesForPath("foo");
	});

	//*********************************************************************************************
	QUnit.test("resetChangesInDependents", function (assert) {
		var oCache = {
				resetChangesForPath : function () {}
			},
			oChild1 = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(oCache)
			}),
			oChild2 = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(undefined)
			}),
			oChild3 = new ODataBinding({
				oCachePromise : _SyncPromise.resolve(Promise.resolve(undefined))
			}),
			oBinding = new ODataBinding({
				oModel : {
					getDependentBindings : function () {}
				}
			});

		this.mock(oBinding.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2, oChild3]);
		this.mock(oCache).expects("resetChangesForPath").withExactArgs("");
		this.mock(oChild1).expects("resetChangesInDependents").withExactArgs();
		this.mock(oChild2).expects("resetChangesInDependents").withExactArgs();
		this.mock(oChild3).expects("resetChangesInDependents").never();

		// code under test
		oBinding.resetChangesInDependents();
	});
});