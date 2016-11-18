/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/ODataBinding"
], function (jQuery, _Helper, asODataBinding) {
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
		var oBinding = new ODataBinding({
				hasPendingChanges : function () {}
			});

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
				},
				hasPendingChanges : function () {}
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
	QUnit.test("_hasPendingChanges(sPath): with cache", function (assert) {
		var oBinding = new ODataBinding({
				oCache : {
					hasPendingChanges : function () {}
				}
			}),
			oCacheMock = this.mock(oBinding.oCache),
			oResult = {};

		["foo", ""].forEach(function (sPath) {
			oCacheMock.expects("hasPendingChanges").withExactArgs(sPath).returns(oResult);

			assert.strictEqual(oBinding._hasPendingChanges(undefined, sPath), oResult,
				"path=" + sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges(sPath): without cache", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "relative"
			}),
			sBuildPath = "~/foo",
			oContext = {
				hasPendingChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oHelperMock = this.mock(_Helper),
			oResult = {};

		//code under test
		assert.strictEqual(oBinding._hasPendingChanges(undefined, "foo"), false);
		assert.strictEqual(oBinding._hasPendingChanges(undefined, ""), false);

		oBinding.oContext = oContext;
		["foo", ""].forEach(function (sPath) {
			oHelperMock.expects("buildPath").withExactArgs(oBinding.sPath, sPath)
				.returns(sBuildPath);
			oContextMock.expects("hasPendingChanges").withExactArgs(sBuildPath).returns(oResult);

			//code under test
			assert.strictEqual(oBinding._hasPendingChanges(undefined, sPath), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges(sPath): without cache, base context", function (assert) {
		assert.strictEqual(
			new ODataBinding({oContext : {}})._hasPendingChanges(undefined, "foo"),
			false);
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges(bAskParent): with cache", function (assert) {
		var oChild1 = new ODataBinding(),
			oChild2 = new ODataBinding(),
			oBinding = new ODataBinding({
				oCache : {
					hasPendingChanges : function () {}
				},
				oModel : {
					getDependentBindings : function () {}
				}
			}),
			oCacheMock = this.mock(oBinding.oCache),
			oChild1Mock = this.mock(oChild1),
			oChild2Mock = this.mock(oChild2);

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2]);
		[false, true].forEach(function (bAskParent) {
			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(true);
			oChild1Mock.expects("_hasPendingChanges").never();
			oChild2Mock.expects("_hasPendingChanges").never();

			// code under test
			assert.strictEqual(oBinding._hasPendingChanges(bAskParent), true,
				"cache returns true, bAskParent=" + bAskParent);

			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(false);
			oChild1Mock.expects("_hasPendingChanges").withExactArgs(false).returns(true);

			// code under test
			assert.strictEqual(oBinding._hasPendingChanges(bAskParent), true,
				"child1 returns true, bAskParent=" + bAskParent);

			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(false);
			oChild1Mock.expects("_hasPendingChanges").withExactArgs(false).returns(false);
			oChild2Mock.expects("_hasPendingChanges").withExactArgs(false).returns(false);

			// code under test
			assert.strictEqual(oBinding._hasPendingChanges(bAskParent), false,
				"all return false, bAskParent=" + bAskParent);
		});
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges(bAskParent): without cache", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "relative",
				oModel : {
					getDependentBindings : function () {}
				}
			}),
			oContext = {
				hasPendingChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oResult = {};

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([]);

		//code under test
		assert.strictEqual(oBinding._hasPendingChanges(false), false);
		assert.strictEqual(oBinding._hasPendingChanges(true), false);

		oBinding.oContext = oContext;
		oContextMock.expects("hasPendingChanges").never();

		//code under test
		assert.strictEqual(oBinding._hasPendingChanges(false), false);

		oContextMock.expects("hasPendingChanges").withExactArgs(oBinding.sPath).returns(oResult);

		//code under test
		assert.strictEqual(oBinding._hasPendingChanges(true), oResult);
	});

	//*********************************************************************************************
	QUnit.test("_resetChanges(sPath): with cache", function (assert) {
		var oBinding = new ODataBinding({
				oCache : {
					resetChanges : function () {}
				}
			}),
			oCacheMock = this.mock(oBinding.oCache);

		["foo", ""].forEach(function (sPath) {
			oCacheMock.expects("resetChanges").withExactArgs(sPath);

			oBinding._resetChanges(undefined, sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(sPath): without cache", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "relative"
			}),
			sBuildPath = "~/foo",
			oContext = {
				resetChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oHelperMock = this.mock(_Helper);

		//code under test
		oBinding._resetChanges(undefined, "foo");
		oBinding._resetChanges(undefined, "");

		oBinding.oContext = oContext;
		["foo", ""].forEach(function (sPath) {
			oHelperMock.expects("buildPath").withExactArgs(oBinding.sPath, sPath)
				.returns(sBuildPath);
			oContextMock.expects("resetChanges").withExactArgs(sBuildPath);

			//code under test
			oBinding._resetChanges(undefined, sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(sPath): without cache, base context", function (assert) {
		new ODataBinding({oContext : {}})._resetChanges(undefined, "foo");
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): with cache", function (assert) {
		var oChild1 = {
				_resetChanges : function () {}
			},
			oChild2 = {
				_resetChanges : function () {}
			},
			oBinding = new ODataBinding({
				oCache : {
					resetChanges : function () {}
				},
				oModel : {
					getDependentBindings : function () {}
				}
			}),
			oCacheMock = this.mock(oBinding.oCache),
			oChild1Mock = this.mock(oChild1),
			oChild2Mock = this.mock(oChild2);

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2]);
		[false, true].forEach(function (bAskParent) {
			oCacheMock.expects("resetChanges").withExactArgs("");
			oChild1Mock.expects("_resetChanges").withExactArgs(false);
			oChild2Mock.expects("_resetChanges").withExactArgs(false);

			// code under test
			oBinding._resetChanges(bAskParent);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): without cache", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "relative",
				oModel : {
					getDependentBindings : function () {}
				}
			}),
			oContext = {
				resetChanges : function () {}
			},
			oContextMock = this.mock(oContext);

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([]);

		//code under test
		oBinding._resetChanges(false);
		oBinding._resetChanges(true);

		oBinding.oContext = oContext;
		oContextMock.expects("resetChanges").never();

		//code under test
		oBinding._resetChanges(false);

		oContextMock.expects("resetChanges").withExactArgs(oBinding.sPath);

		//code under test
		oBinding._resetChanges(true);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): without cache, base context", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {
					getDependentBindings : function () {
						return [];
					}
				}
			});

		//code under test
		oBinding._resetChanges(true);
	});
});