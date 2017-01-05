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
	/*eslint no-warning-comments: 0, max-nested-callbacks: 0*/
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
			var oCache = {
					update : function () {}
				},
				oBinding = new ODataParentBinding({
					oCachePromise : _SyncPromise.resolve(oCache),
					sPath : "/absolute",
					bRelative : false,
					sUpdateGroupId : "myUpdateGroup"
				}),
				sPath = "SO_2_SOITEM/42",
				oResult = {};

			this.mock(oCache).expects("update")
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
	QUnit.test("updateValue: cache is not yet available", function (assert) {
		var oCache = {
				update : function () {}
			},
			oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve(Promise.resolve(oCache))
			});

		this.mock(oCache).expects("update").never();

		// code under test
		assert.throws(function () {
			oBinding.updateValue("myUpdateGroup", "bar", Math.PI, "edit('URL')", "SO_2_SOITEM/42");
		}, new Error("PATCH request not allowed"));
	});

	//*********************************************************************************************
	QUnit.test("updateValue: relative binding", function (assert) {
		var oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve(undefined),
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
		QUnit.test("createCache: async " + oFixture[0] + ", " + oFixture[1],
			function (assert) {
				var oBinding = new ODataParentBinding(),
					oCache = {
						fetchValue : function () {},
						read : function () {}
					},
					oCachePromise,
					oFilterPromise = oFixture[1] && Promise.resolve(oFixture[1]),
					oPathPromise = oFixture[0] && Promise.resolve(oFixture[0]);

				function createCache(sPath, sFilter) {
					assert.strictEqual(sPath, oFixture[0]);
					assert.strictEqual(sFilter, oFixture[1]);
					return oCache;
				}

				// code under test
				oCachePromise = oBinding.createCache(createCache, oPathPromise, oFilterPromise)
					.then(function (oResolvedCache) {
						assert.strictEqual(oResolvedCache, oCache);
					});
				assert.strictEqual(oCachePromise.isFulfilled(), false,
					"Cache-Promise not yet resolved");
			});
	});

	//*********************************************************************************************
	QUnit.test("createCache: deactivates previous cache", function (assert) {
		var oCache = { setActive : function () {} },
			oBinding = new ODataParentBinding();

		// code under test
		oBinding.createCache(function () {});

		oBinding = new ODataParentBinding({
			oCachePromise : _SyncPromise.resolve(oCache)
		});
		this.mock(oCache).expects("setActive").withExactArgs(false);

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
		oBinding.oCachePromise = oBinding.createCache(createCache, oPathPromise);

		return oBinding.oCachePromise.then(function (oResolvedCache) {
			return oCache.read().then(function () {
				assert.strictEqual(oResolvedCache, oCache);

				oCacheMock.expects("setActive").withExactArgs(false);
				oCacheMock.expects("setActive").withExactArgs(true);
				// code under test
				oBinding.oCachePromise = oBinding.createCache(createCache, oPathPromise);

				return oBinding.oCachePromise.then(function (oResolvedCache2) {
					return oResolvedCache2.read().then(function () {
						assert.strictEqual(oResolvedCache2, oCache);
						assert.strictEqual(createCache.callCount, 1);
					});
				});
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
		oBinding.oCachePromise = oBinding.createCache(createCache, oPathPromise);

		assert.strictEqual(oBinding.oCachePromise.isFulfilled(), true);
		oBinding.oCachePromise.then(function (oResolvedCache) {
			assert.strictEqual(oResolvedCache, oCache);
		});

		oCacheMock.expects("setActive").withExactArgs(false);
		oCacheMock.expects("setActive").withExactArgs(true);

		// code under test
		oBinding.oCachePromise = oBinding.createCache(createCache, oPathPromise);

		assert.strictEqual(oBinding.oCachePromise.isFulfilled(), true);
		oBinding.oCachePromise.then(function (oResolvedCache) {
			assert.strictEqual(oResolvedCache, oCache);
		});
		assert.strictEqual(createCache.callCount, 1);
	});

	//*********************************************************************************************
	QUnit.test("createCache: create new cache for empty canonical path", function (assert) {
		var oBinding = new ODataParentBinding(),
			oCache = {setActive : function () {}},
			createCache = this.spy(function () { return oCache; });

		this.mock(oCache).expects("setActive").withExactArgs(false);

		// code under test
		oBinding.oCachePromise = oBinding.createCache(createCache, undefined);

		// code under test
		oBinding.oCachePromise = oBinding.createCache(createCache, undefined);

		assert.strictEqual(createCache.callCount, 2);
	});

	//*********************************************************************************************
	QUnit.test("createCache: cache promise !== binding's cache promise", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {
					reportError : function () {}
				},
				toString : function () {return "MyBinding";}
			}),
			oCache = {},
			createCache = this.spy(function () { return oCache; }),
			oPromise;

		// create a binding asynchronously and read from it
		oBinding.oCachePromise = oBinding.createCache(createCache,
			Promise.resolve("Employees('42')"));
		oPromise = oBinding.oCachePromise;

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding",
				"sap.ui.model.odata.v4.ODataParentBinding", sinon.match.instanceOf(Error));

		// create a binding synchronously afterwards (overtakes the first one, but must win)
		oBinding.oCachePromise = oBinding.createCache(createCache);
		return _SyncPromise.all([
			oPromise.then(function () {
				assert.ok(false, "Expected a rejected cache-promise");
			}, function (oError) {
				assert.strictEqual(oError.message,
					"Cache discarded as a new cache has been created");
				assert.strictEqual(oError.canceled, true);
			}),
			oBinding.oCachePromise.then(function (oResolvedCache) {
				assert.strictEqual(oResolvedCache, oCache);
			})
		]).then(function () {
			assert.strictEqual(createCache.callCount, 1);
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
		return oBinding.createCache(unexpected, Promise.reject(oError)).catch(function (oError0) {
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
		return oBinding.createCache(unexpected, undefined, Promise.reject(oError))
			.catch(function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});
	//*********************************************************************************************
	[{
		sTestName : "Add parameters",
		mParameters : {
			$search : "Foo NOT Bar"
		},
		mExpectedParameters : {
			$apply : "filter(OLD gt 0)",
			$expand : "foo",
			$search : "Foo NOT Bar",
			$select : "ProductID"
		}
	}, {
		sTestName : "Delete parameters",
		mParameters : {
			$expand : undefined
		},
		mExpectedParameters : {
			$apply : "filter(OLD gt 0)",
			$select : "ProductID"
		}
	}, {
		sTestName : "Change parameters",
		mParameters : {
			$apply : "filter(NEW gt 0)"
		},
		mExpectedParameters : {
			$apply : "filter(NEW gt 0)",
			$expand : "foo",
			$select : "ProductID"
		}
	}, {
		sTestName : "Add, delete, change parameters",
		mParameters : {
			$apply : "filter(NEW gt 0)",
			$expand : {$search : "Foo NOT Bar"},
			$search : "Foo NOT Bar",
			$select : undefined
		},
		mExpectedParameters : {
			$apply : "filter(NEW gt 0)",
			$expand : {$search : "Foo NOT Bar"},
			$search : "Foo NOT Bar"
		}
	}].forEach(function (oFixture) {
		QUnit.test("changeParameters: " + oFixture.sTestName, function (assert) {
			var oBinding = new ODataParentBinding({
					oModel : {},
					mParameters : {
						$apply: "filter(OLD gt 0)",
						$expand : "foo",
						$select : "ProductID"
					},
					sPath : "/ProductList",
					applyParameters : function () {}
				});

			this.mock(oBinding).expects("applyParameters")
				.withExactArgs(oFixture.mExpectedParameters, ChangeReason.Change);

			// code under test
			oBinding.changeParameters(oFixture.mParameters);
		});
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with binding parameters", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		//code under test
		assert.throws(function () {
			oBinding.changeParameters({"$filter" : "filter(Amount gt 3)",
				"$$groupId" : "newGroupId"});
		}, new Error("Unsupported parameter: $$groupId"));

		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with empty map", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				sPath : "/EMPLOYEES",
				applyParameters : function () {}
			});


		this.mock(oBinding).expects("applyParameters").never();

		// code under test
		oBinding.changeParameters({});
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with undefined map", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		// code under test
		assert.throws(function () {
			oBinding.changeParameters(undefined);
		}, new Error("Missing map of binding parameters"));

		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: try to delete non-existing parameters", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		// code under test
		oBinding.changeParameters({$apply: undefined});

		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: try to change existing parameter", function (assert) {
		var mParameters = {
				$apply: "filter(Amount gt 3)"
			},
			oBinding = new ODataParentBinding({
					oModel : {},
					mParameters : {
						$apply : "filter(Amount gt 3)"
					},
					sPath : "/EMPLOYEES",
					applyParameters : function () {}
				});

		this.mock(oBinding).expects("applyParameters").never();

		// code under test
		oBinding.changeParameters(mParameters);
	});

	//*********************************************************************************************
	QUnit.skip("changeParameters: adding not allowed parameter", function (assert) {
		var mParameters = {
				$apply: "filter(Amount gt 3)"
			},
			oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : mParameters,
				sPath : "/EMPLOYEES",
				applyParameters : function () {}
			}),
			mNewParameters = {
				$apply: "filter(Amount gt 5)",
				$foo: "bar"
			};

		// code under test
		assert.throws(function () {
			oBinding.changeParameters(mNewParameters);
		}, new Error("System query option $foo is not supported"));
		assert.deepEqual(oBinding.mParameters, mParameters, "parameters unchanged on error");
		// TODO do we need this test?
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: cloning mParameters", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES",
				applyParameters : function (mParameters) {
					this.mParameters = mParameters; // store mParameters at binding after validation
				}
			}),
			mParameters = {
				$expand : {
					SO_2_SOITEM : {
						$orderby : "ItemPosition"
					}
				}
			};

		// code under test
		oBinding.changeParameters(mParameters);

		mParameters.$expand.SO_2_SOITEM.$orderby = "ItemID";

		assert.strictEqual(oBinding.mParameters.$expand.SO_2_SOITEM.$orderby, "ItemPosition");
	});
});