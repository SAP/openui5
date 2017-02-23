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
				oCachePromise : _SyncPromise.resolve(),
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
	[{ // $select=Bar
		options : {
			$select : "Bar"
		},
		path : "FooSet/WithoutExpand",
		result : {}
	}, { // $expand(ExpandWithoutOptions)
		options : {
			$expand : {
				ExpandWithoutOptions : true
			}
		},
		path : "ExpandWithoutOptions",
		result : {}
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
		QUnit.test("getQueryOptionsForPath: binding with mParameters, " + oFixture.path,
				function(assert) {
			var oBinding = new ODataParentBinding({
					mParameters : {$$groupId : "group"},
					mQueryOptions : oFixture.options,
					bRelative : true
				}),
				mClonedQueryOptions = {},
				oContext = {};

			this.mock(jQuery).expects("extend")
				.withExactArgs(true, {}, oFixture.result)
				.returns(mClonedQueryOptions);

			// code under test
			assert.strictEqual(oBinding.getQueryOptionsForPath(oFixture.path, oContext),
				mClonedQueryOptions);
		});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: absolute binding, no parameters", function(assert) {
		var oBinding = new ODataParentBinding({
				mParameters : {},
				bRelative : false
			});

		this.mock(jQuery).expects("extend").never();

		// code under test
		assert.deepEqual(oBinding.getQueryOptionsForPath("foo"), {});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: quasi-absolute binding, no parameters", function(assert) {
		var oBinding = new ODataParentBinding({
				mParameters : {},
				bRelative : true
			}),
			oContext = {}; // no V4 context

		this.mock(jQuery).expects("extend").never();

		// code under test
		assert.deepEqual(oBinding.getQueryOptionsForPath("foo", oContext), {});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: relative binding using this (base) context", function(assert) {
		var oBinding = new ODataParentBinding({
				oContext : {}, // no V4 context
				mParameters : {},
				bRelative : true
			});


		this.mock(jQuery).expects("extend").never();

		// code under test
		assert.deepEqual(oBinding.getQueryOptionsForPath("foo"), {});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: inherit query options", function(assert) {
		var oBinding = new ODataParentBinding({
				oContext : {
						getQueryOptionsForPath : function () {}
				},
				mParameters : {},
				sPath : "foo",
				bRelative : true
			}),
			sPath = "bar",
			sResultingPath = "foo/bar",
			mResultingQueryOptions = {};

		this.mock(_Helper).expects("buildPath")
			.withExactArgs(oBinding.sPath, sPath)
			.returns(sResultingPath);
		this.mock(oBinding.oContext).expects("getQueryOptionsForPath").withExactArgs(sResultingPath)
			.returns(mResultingQueryOptions);

		// code under test
		assert.strictEqual(oBinding.getQueryOptionsForPath(sPath), mResultingQueryOptions);
	});
	//TODO getQueryOptionsForPath: find inherited query options based on metadata to support
	// structural properties within path
	//TODO handle encoding in getQueryOptionsForPath

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

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: cache not yet created", function (assert) {
		var oBinding = new ODataParentBinding({
				bRelative : false,
				// cache will be created, waiting for child bindings
				oCachePromise : _SyncPromise.resolve(Promise.resolve())
			}),
			mQueryOptions = {},
			oContext = {};

		// code under test
		oBinding.fetchIfChildCanUseCache(oContext, "Name", mQueryOptions)
			.then(function (bUseCache) {
				assert.strictEqual(bUseCache, true);
				assert.deepEqual(oBinding.mDependentQueryOptions, {$select : ["Name"]});
			});

		// code under test
		oBinding.fetchIfChildCanUseCache(oContext, "ID", mQueryOptions).then(function (bUseCache) {
			assert.strictEqual(bUseCache, true);
			assert.deepEqual(oBinding.mDependentQueryOptions, {$select : ["Name", "ID"]});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: cache already created", function (assert) {
		var oBinding = new ODataParentBinding({
				bRelative : false,
				// cache is already created
				oCachePromise : _SyncPromise.resolve({})
			}),
			oBindingMock = this.mock(oBinding),
			mQueryOptions = {},
			oContext = {};

		oBinding.mDependentQueryOptions = {$select : ["Name", "AGE"]};

		oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(undefined).twice()
			.returns(_SyncPromise.resolve({$select : ["ID"]})); // parent binding has own cache

		// code under test
		oBinding.fetchIfChildCanUseCache(oContext, "Name", mQueryOptions)
			.then(function (bUseCache) {
				assert.strictEqual(bUseCache, true);
				assert.deepEqual(oBinding.mDependentQueryOptions, {$select : ["Name", "AGE"]});
			});

		// code under test
		oBinding.fetchIfChildCanUseCache(oContext, "ROOM_ID", mQueryOptions)
			.then(function (bUseCache) {
				assert.strictEqual(bUseCache, false);
				assert.deepEqual(oBinding.mDependentQueryOptions, {$select : ["Name", "AGE"]});
			});

		// code under test
		oBinding.fetchIfChildCanUseCache(oContext, "ID", mQueryOptions).then(function (bUseCache) {
			assert.strictEqual(bUseCache, true);
			assert.deepEqual(oBinding.mDependentQueryOptions, {$select : ["Name", "AGE"]});
		});

		// parent binding has own cache and no own query options
		oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(undefined)
			.returns(_SyncPromise.resolve({}));

		// code under test
		oBinding.fetchIfChildCanUseCache(oContext, "TEAM_ID", mQueryOptions)
			.then(function (bUseCache) {
				assert.strictEqual(!!bUseCache, false);
				assert.deepEqual(oBinding.mDependentQueryOptions, {$select : ["Name", "AGE"]});
			}).catch(function (oError) { // ensure fetchIfChildCanUseCache has no script error
				assert.ok(false, oError);
			});
	});
//TODO propagate to parent binding in case the current binding does not have an own cache

});