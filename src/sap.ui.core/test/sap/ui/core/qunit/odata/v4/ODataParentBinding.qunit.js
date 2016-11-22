/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataParentBinding"
], function (jQuery, ChangeReason, _Helper, _SyncPromise, asODataParentBinding) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	/**
	 * Constructs a test object.
	 *
	 * @param {object} oTemplate
	 *   A template object to fill the binding, all properties are copied
	 */
	function ODataParentBinding(oTemplate) {
		jQuery.extend(this, oTemplate);
	}

	asODataParentBinding(ODataParentBinding.prototype);

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataParentBinding", {
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
	QUnit.test("initialize: absolute", function (assert) {
		var oBinding = new ODataParentBinding({
				bRelative : false,
				_fireChange : function () {}
			});

		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.initialize();
	});

	//*********************************************************************************************
	QUnit.test("initialize: relative, unresolved", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : null,
				bRelative : true,
				_fireChange : function () {}
			});

		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		oBinding.initialize();
	});

	//*********************************************************************************************
	QUnit.test("initialize: relative, resolved", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {},
				bRelative : true,
				_fireChange : function () {}
			});

		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.initialize();
	});

	//*********************************************************************************************
	[undefined, "up"].forEach(function (sGroupId) {
		QUnit.test("updateValue: absolute binding", function (assert) {
			var oBinding = new ODataParentBinding({
					oCache : {
						update : function () {}
					},
					sPath : "/absolute",
					bRelative : false,
					sUpdateGroupId : "myUpdateGroup"
				}),
				sPath = "SO_2_SOITEM/42",
				oResult = {};

			this.mock(oBinding.oCache).expects("update")
				.withExactArgs(sGroupId || "myUpdateGroup", "bar", Math.PI, "edit('URL')", sPath)
				.returns(Promise.resolve(oResult));

			// code under test
			return oBinding.updateValue(sGroupId, "bar", Math.PI, "edit('URL')", sPath)
				.then(function (oResult0) {
					assert.strictEqual(oResult0, oResult);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("updateValue: relative binding", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {
					updateValue : function () {}
				},
				sPath : "PRODUCT_2_BP",
				bRelative : true
			}),
			oResult = {};

		this.mock(_Helper).expects("buildPath").withExactArgs("PRODUCT_2_BP", "BP_2_XYZ/42")
			.returns("~BP_2_XYZ/42~");
		this.mock(oBinding.oContext).expects("updateValue")
			.withExactArgs("up", "bar", Math.PI, "edit('URL')", "~BP_2_XYZ/42~")
			.returns(Promise.resolve(oResult));

		this.mock(oBinding).expects("getUpdateGroupId").never();

		// code under test
		return oBinding.updateValue("up", "bar", Math.PI, "edit('URL')", "BP_2_XYZ/42")
			.then(function (oResult0) {
				assert.strictEqual(oResult0, oResult);
			});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions: own options", function(assert) {
		var oBinding = new ODataParentBinding({
				oModel : {
					mUriParameters : {}
				},
				mQueryOptions : {$select : "foo"}
			}),
			oContext = {},
			mResultingQueryOptions = {};

		this.mock(jQuery).expects("extend")
			.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mQueryOptions))
			.returns(mResultingQueryOptions);

		// code under test
		assert.strictEqual(oBinding.getQueryOptions(oContext), mResultingQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions: inherited options", function(assert) {
		var oBinding = new ODataParentBinding({
				oModel : {
					mUriParameters : {}
				},
				mQueryOptions : {}
			}),
			oContext = {},
			mInheritedQueryOptions = {},
			mResultingQueryOptions = {};

		this.mock(oBinding).expects("inheritQueryOptions")
			.withExactArgs(oContext).returns(mInheritedQueryOptions);
		this.mock(jQuery).expects("extend")
			.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mInheritedQueryOptions))
			.returns(mResultingQueryOptions);

		// code under test
		assert.strictEqual(oBinding.getQueryOptions(oContext), mResultingQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("inheritQueryOptions: no context", function(assert) {
		var oBinding = new ODataParentBinding({
				isRelative : function () { return true; }
			});

		// code under test
		assert.strictEqual(oBinding.inheritQueryOptions(undefined), undefined);
	});

	//*********************************************************************************************
	QUnit.test("inheritQueryOptions: base context", function(assert) {
		var oBinding = new ODataParentBinding({
				isRelative : function () { return true; }
			}),
			oContext = {};

		// code under test
		assert.strictEqual(oBinding.inheritQueryOptions(oContext), undefined);
	});

	//*********************************************************************************************
	QUnit.test("inheritQueryOptions: absolute binding with unnecessary context", function(assert) {
		var oBinding = new ODataParentBinding({
				isRelative : function () { return false; }
			}),
			oContext = {
				oBinding : {}
			};

		// code under test
		assert.strictEqual(oBinding.inheritQueryOptions(oContext), undefined);
	});

	//*********************************************************************************************
	QUnit.test("inheritQueryOptions: no parent query options", function(assert) {
		var oBinding = new ODataParentBinding({
				isRelative : function () { return true; },
				sPath : "bindingPath"
			}),
			oContext = {
				getQueryOptions : function () {}
			};

		this.mock(oContext).expects("getQueryOptions")
			.withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(oBinding.inheritQueryOptions(oContext), undefined);
	});

	//*********************************************************************************************
	[{ // $select=Bar
		options : {
			$select : "Bar"
		},
		path : "FooSet/WithoutExpand",
		result : undefined
	}, { // $expand(ExpandWithoutOptions)
		options : {
			$expand : {
				ExpandWithoutOptions : true
			}
		},
		path : "ExpandWithoutOptions",
		result : undefined
	}, { // $expand(FooSet=$select(Bar,Baz))
		options : {
			$expand : {
				FooSet : {
					$select : ["Bar", "Baz"]
				}
			}
		},
		path : "FooSet('0815')",
		result : {
			$select : ["Bar", "Baz"]
		}
	}, {// $expand(FooSet=$expand(BarSet=$select(Baz)))
		options : {
			$expand : {
				FooSet : {
					$expand : {
						BarSet : {
							$select : "Baz"
						}
					}
				}
			}
		},
		path : "FooSet('0815')/12/BarSet",
		result : {
			$select : "Baz"
		}
	}].forEach(function (oFixture) {
		QUnit.test("inheritQueryOptions: V4 context, path=" + oFixture.path, function(assert) {
			var oBinding = new ODataParentBinding({
					isRelative : function () { return true; },
					sPath : oFixture.path
				}),
				oContext = {
					getQueryOptions : function () {}
				};

			this.mock(oContext).expects("getQueryOptions")
				.withExactArgs().returns(oFixture.options);

			// code under test
			assert.deepEqual(oBinding.inheritQueryOptions(oContext), oFixture.result);
		});
	});
	//TODO handle encoding in getQueryOptions

	//*********************************************************************************************
	[
		["/canonical1", undefined], //set context
		[undefined, "foo eq 42"], //set filter
		["/canonical2", "foo eq 42"] //set context and filter
	].forEach(function (oFixture) {
		QUnit.test("createCache: proxy interface, " + oFixture[0] + ", " + oFixture[1],
			function (assert) {
				var oBinding = new ODataParentBinding({
						toString : function () { return "TheBinding"; }
					}),
					oFilterPromise = oFixture[1] && Promise.resolve(oFixture[1]),
					oPathPromise = oFixture[0] && Promise.resolve(oFixture[0]),
					oCache = {
						fetchValue : function () {},
						read : function () {}
					},
					oCacheProxy,
					oReadResult = {};

				function createCache(sPath, sFilter) {
					assert.strictEqual(sPath, oFixture[0]);
					assert.strictEqual(sFilter, oFixture[1]);
					return oCache;
				}

				this.mock(oCache).expects("read").withExactArgs(0, 10, "$auto")
					.returns(Promise.resolve(oReadResult));
				this.mock(oCache).expects("fetchValue").withExactArgs("$auto", "foo")
					.returns(Promise.resolve(oReadResult));

				// code under test
				oCacheProxy = oBinding.createCache(createCache, oPathPromise, oFilterPromise);

				assert.throws(function () {
					oCacheProxy._delete();
				}, new Error("DELETE request not allowed"));
				assert.throws(function () {
					oCacheProxy.create();
				}, new Error("POST request not allowed"));
				oCacheProxy.deregisterChange("path/to/property", {});
				assert.strictEqual(oCacheProxy.hasPendingChangesForPath(), false);
				oCacheProxy.resetChangesForPath();
				oCacheProxy.setActive(false);
				assert.throws(function () {
					oCacheProxy.post();
				}, new Error("POST request not allowed"));
				assert.throws(function () {
					oCacheProxy.update();
				}, new Error("PATCH request not allowed"));
				assert.strictEqual(oCacheProxy.toString(), "Cache proxy for " + oBinding);

				return Promise.all([
					oCacheProxy.read(0, 10, "$auto").then(function (oResult) {
						assert.strictEqual(oBinding.oCache, oCache);
						assert.strictEqual(oCache.$canonicalPath, oFixture[0]);
						assert.strictEqual(oResult, oReadResult);
					}),
					oCacheProxy.fetchValue("$auto", "foo").then(function (oResult) {
						assert.strictEqual(oBinding.oCache, oCache);
						assert.strictEqual(oCache.$canonicalPath, oFixture[0]);
						assert.strictEqual(oResult, oReadResult);
					})
				]);
			});
	});

	//*********************************************************************************************
	QUnit.test("createCache: deactivates previous cache", function (assert) {
		var oBinding = new ODataParentBinding();

		// code under test
		oBinding.createCache(function () {});

		oBinding.oCache = { setActive : function () {} };
		this.mock(oBinding.oCache).expects("setActive").withExactArgs(false);

		// code under test
		oBinding.createCache(function () {});
	});

	//*********************************************************************************************
	QUnit.test("createCache: use same cache for same path, async", function (assert) {
		var oBinding = new ODataParentBinding(),
			oCache = {
				setActive : function () {},
				read : function () { return Promise.resolve({}); }
			},
			oCacheMock = this.mock(oCache),
			oPathPromise = Promise.resolve("p"),
			createCache = this.spy(function () { return oCache; });

		// code under test
		oBinding.createCache(createCache, oPathPromise);

		return oBinding.oCache.read().then(function () {
			assert.strictEqual(oBinding.oCache, oCache);

			oCacheMock.expects("setActive").withExactArgs(false);
			oCacheMock.expects("setActive").withExactArgs(true);
			// code under test
			oBinding.createCache(createCache, oPathPromise);

			return oBinding.oCache.read().then(function () {
				assert.strictEqual(oBinding.oCache, oCache);
				assert.strictEqual(createCache.callCount, 1);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: use same cache for same path, sync", function (assert) {
		var oBinding = new ODataParentBinding(),
			oCache = {setActive : function () {}},
			oCacheMock = this.mock(oCache),
			oPathPromise = _SyncPromise.resolve("p"),
			createCache = this.spy(function () { return oCache; });

		// code under test
		oBinding.createCache(createCache, oPathPromise);

		assert.strictEqual(oBinding.oCache, oCache);

		oCacheMock.expects("setActive").withExactArgs(false);
		oCacheMock.expects("setActive").withExactArgs(true);

		// code under test
		oBinding.createCache(createCache, oPathPromise);

		assert.strictEqual(oBinding.oCache, oCache);
		assert.strictEqual(createCache.callCount, 1);
	});

	//*********************************************************************************************
	QUnit.test("createCache: create new cache for empty canonical path", function (assert) {
		var oBinding = new ODataParentBinding(),
			oCache = {setActive : function () {}},
			createCache = this.spy(function () { return oCache; });

		// code under test
		oBinding.createCache(createCache, undefined);

		// code under test
		oBinding.createCache(createCache, undefined);

		assert.strictEqual(createCache.callCount, 2);
	});

	//*********************************************************************************************
	QUnit.test("createCache: cache proxy !== binding's cache", function (assert) {
		var oBinding = new ODataParentBinding(),
			oCache = {read : function () {}},
			oPromise,
			oReadResult = {};

		this.mock(oCache).expects("read").returns(Promise.resolve(oReadResult));

		// create a binding asynchronously and read from it
		oBinding.createCache(function () {
			return {/*cache*/};
		}, Promise.resolve("Employees('42')"));
		oPromise = oBinding.oCache.read();

		// create a binding synchronously afterwards (overtakes the first one, but must win)
		oBinding.createCache(function () {
			return oCache;
		});

		assert.strictEqual(oBinding.oCache, oCache);
		return oPromise.then(function (oResult) {
			assert.strictEqual(oBinding.oCache, oCache);
			assert.strictEqual(oResult, oReadResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: fetchCanonicalPath fails", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {
					reportError : function () {}
				},
				toString : function () {return "MyBinding";}
			}),
			oError = new Error("canonical path failure");

		function unexpected () {
			assert.ok(false, "unexpected call");
		}

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding",
				"sap.ui.model.odata.v4.ODataParentBinding", sinon.match.same(oError));

		// code under test
		oBinding.createCache(unexpected, Promise.reject(oError));

		// code under test
		return oBinding.oCache.read("$auto", "foo").catch(function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: fetchFilter fails", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {
					reportError : function () {}
				},
				toString : function () {return "MyBinding";}
			}),
			oError = new Error("request filter failure");

		function unexpected () {
			assert.ok(false, "unexpected call");
		}

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding",
				"sap.ui.model.odata.v4.ODataParentBinding", sinon.match.same(oError));

		// code under test
		oBinding.createCache(unexpected, undefined, Promise.reject(oError));

		// code under test
		return oBinding.oCache.read("$auto", "foo").catch(function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});
});