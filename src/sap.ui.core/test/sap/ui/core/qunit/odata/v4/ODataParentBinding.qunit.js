/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, SyncPromise, Binding, ChangeReason, Context, asODataBinding, ODataModel,
		asODataParentBinding, SubmitMode, _Helper) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0, max-nested-callbacks: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataParentBinding";

	/**
	 * Constructs a test object.
	 *
	 * @param {object} [oTemplate={}]
	 *   A template object to fill the binding, all properties are copied
	 */
	function ODataParentBinding(oTemplate) {
		asODataParentBinding.call(this);

		Object.assign(this, {
			getDependentBindings : function () {}, // implemented by all sub-classes
			//Returns the metadata for the class that this object belongs to.
			getMetadata : function () {
				return {
					getName : function () {
						return sClassName;
					}
				};
			},
			isSuspended : Binding.prototype.isSuspended
		}, oTemplate);
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataParentBinding", {
		before : function () {
			asODataParentBinding(ODataParentBinding.prototype);
		},

		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("initialize members for mixin", function (assert) {
		var oBinding = {},
			oBindingSpy = this.spy(asODataBinding, "call");

		asODataParentBinding.call(oBinding);

		assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
		assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, true);
		assert.deepEqual(oBinding.aChildCanUseCachePromises, []);
		assert.strictEqual(oBinding.iPatchCounter, 0);
		assert.strictEqual(oBinding.bPatchSuccess, true);
		assert.ok("oReadGroupLock" in oBinding);
		assert.strictEqual(oBinding.oReadGroupLock, undefined);
		assert.strictEqual(oBinding.oRefreshPromise, null);
		assert.ok("oResumePromise" in oBinding);
		assert.strictEqual(oBinding.oResumePromise, undefined);
		assert.ok(oBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: binding with mParameters", function (assert) {
		var oBinding = new ODataParentBinding({
				getQueryOptionsFromParameters : function () {},
				mParameters : {$$groupId : "group"},
				bRelative : true
			}),
			mQueryOptions = {},
			mResult = {};

		this.mock(oBinding).expects("getQueryOptionsFromParameters").withExactArgs()
			.returns(mQueryOptions);
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(mQueryOptions), "foo")
			.returns(mResult);

		// code under test
		assert.strictEqual(oBinding.getQueryOptionsForPath("foo"), mResult);
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: absolute binding, no parameters", function (assert) {
		var oBinding = new ODataParentBinding({
				mParameters : {},
				bRelative : false
			});

		this.mock(_Helper).expects("getQueryOptionsForPath").never();

		// code under test
		assert.deepEqual(oBinding.getQueryOptionsForPath("foo"), {});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: quasi-absolute binding, no parameters", function (assert) {
		var oBinding = new ODataParentBinding({
				mParameters : {},
				bRelative : true
			}),
			oContext = {}; // no V4 context

		this.mock(_Helper).expects("getQueryOptionsForPath").never();

		// code under test
		assert.deepEqual(oBinding.getQueryOptionsForPath("foo", oContext), {});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: relative binding using this (base) context",
			function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {}, // no V4 context
				mParameters : {},
				bRelative : true
			});

		this.mock(_Helper).expects("getQueryOptionsForPath").never();

		// code under test
		assert.deepEqual(oBinding.getQueryOptionsForPath("foo"), {});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: inherit query options", function (assert) {
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

		this.mock(_Helper).expects("getQueryOptionsForPath").never();
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
	// Note: We decided not to analyze $expand for embedded $filter/$orderby and to treat $apply
	// in the same way. We also decided to use the weakest change reason (Change) in these cases.
	[{
		sTestName : "Add parameter $search",
		sChangeReason : ChangeReason.Filter,
		mParameters : {
			$search : "Foo NOT Bar"
		},
		mExpectedParameters : {
			$apply : "filter(OLD gt 0)",
			$expand : "foo",
			$filter : "OLD gt 1",
			$search : "Foo NOT Bar",
			$select : "ProductID"
		}
	}, {
		sTestName : "Add parameter $orderby",
		sChangeReason : ChangeReason.Sort,
		mParameters : {
			$orderby : "Category"
		},
		mExpectedParameters : {
			$apply : "filter(OLD gt 0)",
			$expand : "foo",
			$filter : "OLD gt 1",
			$orderby : "Category",
			$select : "ProductID"
		}
	}, {
		sTestName : "Delete parameter $expand",
		mParameters : {
			$expand : undefined
		},
		mExpectedParameters : {
			$apply : "filter(OLD gt 0)",
			$filter : "OLD gt 1",
			$select : "ProductID"
		}
	}, {
		sTestName : "Delete parameter $filter",
		sChangeReason : ChangeReason.Filter,
		mParameters : {
			$filter : undefined
		},
		mExpectedParameters : {
			$apply : "filter(OLD gt 0)",
			$expand : "foo",
			$select : "ProductID"
		}
	}, {
		sTestName : "Change parameters $filter and $orderby",
		sChangeReason : ChangeReason.Filter,
		mParameters : {
			$filter : "NEW gt 1",
			$orderby : "Category"
		},
		mExpectedParameters : {
			$apply : "filter(OLD gt 0)",
			$expand : "foo",
			$filter : "NEW gt 1",
			$orderby : "Category",
			$select : "ProductID"
		}
	}, {
		sTestName : "Add, delete, change parameters",
		mParameters : {
			$apply : "filter(NEW gt 0)",
			$expand : {$search : "Foo NOT Bar"},
			$count : true,
			$select : undefined
		},
		mExpectedParameters : {
			$apply : "filter(NEW gt 0)",
			$count : true,
			$expand : {$search : "Foo NOT Bar"},
			$filter : "OLD gt 1"
		}
	}].forEach(function (oFixture) {
		QUnit.test("changeParameters: " + oFixture.sTestName, function (assert) {
			var oBinding = new ODataParentBinding({
					oModel : {},
					mParameters : {
						$apply : "filter(OLD gt 0)",
						$expand : "foo",
						$filter : "OLD gt 1",
						$select : "ProductID"
					},
					sPath : "/ProductList",
					applyParameters : function () {}
				});

			this.mock(oBinding).expects("checkSuspended").never();
			this.mock(oBinding).expects("hasPendingChanges").returns(false);
			this.mock(oBinding).expects("applyParameters").withExactArgs(
				oFixture.mExpectedParameters, oFixture.sChangeReason || ChangeReason.Change);

			// code under test
			oBinding.changeParameters(oFixture.mParameters);
		});
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with undefined map", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES",
				applyParameters : function () {}
			});

		this.mock(oBinding).expects("applyParameters").never();

		// code under test
		assert.throws(function () {
			oBinding.changeParameters(undefined);
		}, new Error("Missing map of binding parameters"));
		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with binding parameters", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES",
				applyParameters : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("applyParameters").never();
		oBindingMock.expects("hasPendingChanges").returns(false);

		//code under test
		assert.throws(function () {
			oBinding.changeParameters({
				"$filter" : "Amount gt 3",
				"$$groupId" : "newGroupId"
			});
		}, new Error("Unsupported parameter: $$groupId"));
		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with pending changes", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES",
				applyParameters : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("applyParameters").never();
		oBindingMock.expects("hasPendingChanges").returns(true);

		assert.throws(function () {
			//code under test
			oBinding.changeParameters({"$filter" : "Amount gt 3"});
		}, new Error("Cannot change parameters due to pending changes"));
		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with empty map", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				sPath : "/EMPLOYEES",
				applyParameters : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("hasPendingChanges").returns(false);
		oBindingMock.expects("applyParameters").never();

		// code under test
		oBinding.changeParameters({});
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: try to delete non-existing parameters", function (assert) {
		var oBinding = new ODataParentBinding({
				applyParameters : function () {},
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		// refreshing the binding is unnecessary, if the binding parameters are unchanged
		this.mock(oBinding).expects("applyParameters").never();

		// code under test
		oBinding.changeParameters({$apply : undefined});

		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: try to change existing parameter", function (assert) {
		var mParameters = {
				$apply : "filter(Amount gt 3)"
			},
			oBinding = new ODataParentBinding({
					oModel : {},
					mParameters : {
						$apply : "filter(Amount gt 3)"
					},
					sPath : "/EMPLOYEES",
					applyParameters : function () {}
				}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("hasPendingChanges").returns(false);
		oBindingMock.expects("applyParameters").never();

		// code under test
		oBinding.changeParameters(mParameters);
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: cloning mParameters", function (assert) {
		var oBinding = new ODataParentBinding({
				sGroupId : "myGroup",
				oModel : {bAutoExpandSelect : false},
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

		this.mock(oBinding).expects("hasPendingChanges").returns(false);

		// code under test
		oBinding.changeParameters(mParameters);

		mParameters.$expand.SO_2_SOITEM.$orderby = "ItemID";

		assert.strictEqual(oBinding.mParameters.$expand.SO_2_SOITEM.$orderby, "ItemPosition");
	});

	//*********************************************************************************************
	[{
		name : "$select",
		parameters : {$select : "foo"}
	}, {
		name : "$expand",
		parameters : {$expand : "foo"}
	}, {
		name : "$expand",
		parameters : {$expand : undefined}
	}, {
		name : "$expand",
		parameters : {$expand : {foo : {}}}
	}].forEach(function (oFixture, i) {
		QUnit.test("changeParameters: auto-$expand/$select, " + i, function (assert) {
			var oBinding = new ODataParentBinding({
					oModel : {
						bAutoExpandSelect : true
					},
					mParameters : {},
					applyParameters : function () {}
				});

			this.mock(oBinding).expects("applyParameters").never();

			// code under test
			assert.throws(function () {
				oBinding.changeParameters(oFixture.parameters);
			}, new Error("Cannot change $expand or $select parameter in auto-$expand/$select mode: "
				+ oFixture.name + "=" + JSON.stringify(oFixture.parameters[oFixture.name]))
			);

			assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
		});
	});

	//*********************************************************************************************
	[{
		aggregatedQueryOptions : {},
		childQueryOptions : {},
		expectedQueryOptions : {}
	}, {
		aggregatedQueryOptions : {$select : ["Name"]},
		childQueryOptions : {$select : ["ID"]},
		expectedQueryOptions : {$select : ["Name", "ID"]}
	}, {
		aggregatedQueryOptions : {},
		childQueryOptions : {$select : ["ID"]},
		expectedQueryOptions : {$select : ["ID"]}
	}, {
		aggregatedQueryOptions : {$select : ["Name"]},
		childQueryOptions : {},
		expectedQueryOptions : {$select : ["Name"]}
	}, {
		aggregatedQueryOptions : {$select : ["ID", "Name"]},
		childQueryOptions : {$select : ["ID"]},
		expectedQueryOptions : {$select : ["ID", "Name"]}
	}, {
		aggregatedQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {$select : ["Team_Id", "Name"]}
			}
		},
		childQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$expand : {
						TEAM_2_MANAGER : {$select : ["Name"]}
					},
					$select : ["Team_Id", "MEMBER_COUNT"]
				}
			},
			$select : ["ID"]
		},
		expectedQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$expand : {
						TEAM_2_MANAGER : {$select : ["Name"]}
					},
					$select : ["Team_Id", "Name", "MEMBER_COUNT"]
				}
			},
			$select : ["ID"]
		}
	}, {
		aggregatedQueryOptions : {$select : ["Team_Id"]},
		childQueryOptions : {$select : ["*"] },
		expectedQueryOptions : {$select : ["Team_Id", "*"] }
	}, {
		aggregatedQueryOptions : {$select : ["*"]},
		childQueryOptions : {$select : ["Team_Id"]},
		expectedQueryOptions : {$select : ["*", "Team_Id"] }
	}, {
		aggregatedQueryOptions : {},
		childQueryOptions : {$count : true},
		expectedQueryOptions : {$count : true}
	}, {
		aggregatedQueryOptions : {$count : true},
		childQueryOptions : {},
		expectedQueryOptions : {$count : true}
	}, {
		aggregatedQueryOptions : {$count : false},
		childQueryOptions : {$count : true},
		expectedQueryOptions : {$count : true}
	}, {
		aggregatedQueryOptions : {$count : true},
		childQueryOptions : {$count : false},
		expectedQueryOptions : {$count : true}
	}, {
		aggregatedQueryOptions : {},
		childQueryOptions : {$count : false},
		expectedQueryOptions : {}
	}, {
		aggregatedQueryOptions : {$orderby : "Category"},
		childQueryOptions : {$orderby : "Category"},
		expectedQueryOptions : {$orderby : "Category"}
	}, {
		aggregatedQueryOptions : {$apply : "filter(Amount gt 3)"},
		childQueryOptions : {},
		expectedQueryOptions : {$apply : "filter(Amount gt 3)"}
	}, {
		aggregatedQueryOptions : {$filter : "Amount gt 3"},
		childQueryOptions : {},
		expectedQueryOptions : {$filter : "Amount gt 3"}
	}, {
		aggregatedQueryOptions : {$orderby : "Category"},
		childQueryOptions : {},
		expectedQueryOptions : {$orderby : "Category"}
	}, {
		aggregatedQueryOptions : {$search : "Foo NOT Bar"},
		childQueryOptions : {},
		expectedQueryOptions : {$search : "Foo NOT Bar"}
	}, {
		aggregatedQueryOptions : {},
		childQueryOptions : {
			$expand : {
				foo : {
					$filter : "bar gt 3",
					$select : ["bar"]
				}
			}
		},
		expectedQueryOptions : {
			$expand : {
				foo : {
					$filter : "bar gt 3",
					$select : ["bar"]
				}
			}
		}
	}, {
		aggregatedQueryOptions : {$expand : {foo : {$select : ["bar"]}}},
		childQueryOptions : {},
		expectedQueryOptions : {$expand : {foo : {$select : ["bar"]}}}
	}].forEach(function (oFixture, i) {
		QUnit.test("aggregateQueryOptions returns true: " + i, function (assert) {
			var oBinding = new ODataParentBinding({
					mAggregatedQueryOptions : oFixture.aggregatedQueryOptions,
					oCache : undefined,
					oCachePromise : SyncPromise.resolve(Promise.resolve(null)) // pending!
				}),
				bMergeSuccess;

			// code under test
			bMergeSuccess = oBinding.aggregateQueryOptions(oFixture.childQueryOptions,
				"/base/metapath", false);

			assert.deepEqual(oBinding.mAggregatedQueryOptions, oFixture.expectedQueryOptions);
			assert.strictEqual(bMergeSuccess, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("aggregateQueryOptions: do not embed child query options", function (assert) {
		var oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {}
			}),
			mChildQueryOptions = {$select : ["bar"], $count : true, $filter : "baz eq 42"};

		// code under test
		assert.ok(oBinding.aggregateQueryOptions({$expand : {foo : mChildQueryOptions}}, false));

		assert.deepEqual(oBinding.mAggregatedQueryOptions, {$expand : {foo : mChildQueryOptions}});
		assert.notStrictEqual(oBinding.mAggregatedQueryOptions.$expand.foo, mChildQueryOptions);
		assert.notStrictEqual(oBinding.mAggregatedQueryOptions.$expand.foo.$select,
			mChildQueryOptions.$select);
	});

	//*********************************************************************************************
	[{ // conflict: parent has $orderby, but child has different $orderby value
		aggregatedQueryOptions : {$orderby : "Category"},
		childQueryOptions : {$orderby : "Category desc"}
	}, { // aggregated query options remain unchanged on conflict ($select is not added)
		aggregatedQueryOptions : {$orderby : "Category" },
		childQueryOptions : {
			$orderby : "Category desc",
			$select : ["Name"]
		}
	}, { // conflict: parent has $apply, but child does not
		aggregatedQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$apply : "filter(Amount gt 3)"
				}
			}
		},
		childQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {}
			}
		}
	}, { // conflict: parent has $filter, but child does not
		aggregatedQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$filter : "Amount gt 3"
				}
			}
		},
		childQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {}
			}
		}
	}, { // conflict: parent has $orderby, but child does not
		aggregatedQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$orderby : "Category"
				}
			}
		},
		childQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {}
			}
		}
	}, { // conflict: parent has $search, but child does not
		aggregatedQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$search : "Foo NOT Bar"
				}
			}
		},
		childQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {}
			}
		}
	}, { // conflict: parent has no $orderby, but child has $orderby
		aggregatedQueryOptions : {},
		childQueryOptions : {$orderby : "Category", $select : ["Name"]}
	}, {
		aggregatedQueryOptions : {$filter : "Amount gt 3"},
		childQueryOptions : {$filter : "Price gt 300"}
	}].forEach(function (oFixture, i) {
		QUnit.test("aggregateQueryOptions returns false: " + i, function (assert) {
			var oBinding = new ODataParentBinding({
					mAggregatedQueryOptions : oFixture.aggregatedQueryOptions
				}),
				mOriginalQueryOptions = _Helper.clone(oFixture.aggregatedQueryOptions),
				bMergeSuccess;

			// code under test
			bMergeSuccess = oBinding.aggregateQueryOptions(oFixture.childQueryOptions, false);

			assert.deepEqual(oBinding.mAggregatedQueryOptions, mOriginalQueryOptions);
			assert.strictEqual(bMergeSuccess, false);
		});
	});

	//*********************************************************************************************
	[{
		canMergeQueryOptions : true,
		hasChildQueryOptions : true,
		initial : true,
		$kind : "Property"
	}, {
		canMergeQueryOptions : true,
		hasChildQueryOptions : true,
		initial : false,
		$kind : "Property"
	}, {
		canMergeQueryOptions : true,
		hasChildQueryOptions : true,
		initial : true,
		$kind : "NavigationProperty"
	}, {
		canMergeQueryOptions : true,
		hasChildQueryOptions : true,
		initial : false,
		$kind : "NavigationProperty"
	}, {
		canMergeQueryOptions : true,
		hasChildQueryOptions : false, // child path has segments which are no properties
		initial : true,
		$kind : "Property"
	}, {
		canMergeQueryOptions : false,
		hasChildQueryOptions : true,
		initial : true,
		$kind : "NavigationProperty"
	}].forEach(function (oFixture, i) {
		[true, false].forEach(function (bCacheCreationPending) {
			QUnit.test("fetchIfChildCanUseCache, multiple calls aggregate query options, "
					+ (bCacheCreationPending ? "no cache yet: " : "use parent's cache: ") + i,
				function (assert) {
					var mAggregatedQueryOptions = {},
						oMetaModel = {
							fetchObject : function () {},
							getMetaPath : function () {},
							getReducedPath : function () {}
						},
						fnFetchMetadata = function () {},
						oBinding = new ODataParentBinding({
							bAggregatedQueryOptionsInitial : oFixture.initial,
							mAggregatedQueryOptions : mAggregatedQueryOptions,
							oCache : bCacheCreationPending ? undefined : null,
							oCachePromise : bCacheCreationPending
								? SyncPromise.resolve(Promise.resolve(null))
								: SyncPromise.resolve(null),
							oContext : {},
							doFetchQueryOptions : function () {},
							oModel : {
								getMetaModel : function () { return oMetaModel; },
								oInterface : {
									fetchMetadata : fnFetchMetadata
								},
								resolve : function () {}
							},
							sPath : "path"
						}),
						oBindingMock = this.mock(oBinding),
						mChildLocalQueryOptions = {},
						mChildQueryOptions = oFixture.hasChildQueryOptions ? {} : undefined,
						oContext = Context.create(this.oModel, oBinding, "/Set('2')"),
						mExtendResult = {},
						oHelperMock = this.mock(_Helper),
						mLocalQueryOptions = {},
						oMetaModelMock = this.mock(oMetaModel),
						oModelMock = this.mock(oBinding.oModel),
						oPromise;

					oModelMock.expects("resolve")
						.withExactArgs("path", sinon.match.same(oBinding.oContext))
						.returns("/resolved/path");
					oModelMock.expects("resolve")
						.withExactArgs("childPath", sinon.match.same(oContext))
						.returns("/resolved/child/path");
					oMetaModelMock.expects("getMetaPath")
						.withExactArgs("/Set('2')")
						.returns("/Set");
					oMetaModelMock.expects("getMetaPath")
						.withExactArgs("/resolved/child/path")
						.returns("/resolved/child/metaPath");
					oBindingMock.expects("doFetchQueryOptions")
						.withExactArgs(sinon.match.same(oBinding.oContext))
						.returns(SyncPromise.resolve(mLocalQueryOptions));
					this.mock(_Helper).expects("fetchPropertyAndType")
						.withExactArgs(sinon.match.same(fnFetchMetadata),
							"/resolved/child/metaPath")
						.returns(Promise.resolve().then(function () {
							oBindingMock.expects("selectKeyProperties")
								.exactly(oFixture.initial ? 1 : 0)
								.withExactArgs(sinon.match.same(mLocalQueryOptions), "/Set");
							return {$kind : oFixture.$kind};
						}));
					oBindingMock.expects("getBaseForPathReduction")
						.withExactArgs().returns("/base/path");
					oMetaModelMock.expects("getReducedPath")
						.withExactArgs("/resolved/child/path", "/base/path")
						.returns("/reduced/child/path");
					oHelperMock.expects("getRelativePath")
						.withExactArgs("/reduced/child/path", "/resolved/path")
						.returns("childPath");
					oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
						.returns("/reduced/child/metapath");
					oHelperMock.expects("getRelativePath")
						.withExactArgs("/reduced/child/metapath", "/Set")
						.returns("reducedChildMetaPath");
					this.mock(_Helper).expects("clone").exactly(oFixture.initial ? 1 : 0)
						.withExactArgs(sinon.match.same(mLocalQueryOptions))
						.returns(mExtendResult);
					oHelperMock.expects("wrapChildQueryOptions")
						.withExactArgs("/Set", "reducedChildMetaPath",
							sinon.match.same(mChildLocalQueryOptions),
							sinon.match.same(fnFetchMetadata))
						.returns(mChildQueryOptions);
					oBindingMock.expects("aggregateQueryOptions")
						.exactly(oFixture.hasChildQueryOptions ? 1 : 0)
						.withExactArgs(sinon.match.same(mChildQueryOptions), "/Set",
							bCacheCreationPending ? sinon.match.falsy : true)
						.returns(oFixture.canMergeQueryOptions);

					// code under test
					oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath",
						SyncPromise.resolve(mChildLocalQueryOptions));

					return Promise.all([oPromise, oBinding.oCachePromise]).then(function (aResult) {
						assert.strictEqual(aResult[0],
							oFixture.hasChildQueryOptions && oFixture.canMergeQueryOptions
								? "/reduced/child/path"
								: undefined);
						assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
						assert.strictEqual(oBinding.mAggregatedQueryOptions,
							oFixture.initial ? mExtendResult : mAggregatedQueryOptions);
						assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, false);
					});
				}
			);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bReturnValueContext) {
	[false, true].forEach(function (bRejected) {
		var sTitle = "fetchIfChildCanUseCache: immutable cache, "
				+ (bReturnValueContext ? "return value context, " : "")
				+ "rejected=" + bRejected;

		QUnit.test(sTitle, function (assert) {
			var oCache = { // cache sent read request
					bSentRequest : true,
					setQueryOptions : function () {}
				},
				oCachePromise = bRejected
					? SyncPromise.reject({}) // "Failed to create cache..."
					: SyncPromise.resolve(Promise.resolve(oCache)), // it might become pending again
				oMetaModel = {
					fetchObject : function () {},
					getMetaPath : function () {},
					getReducedPath : function () {}
				},
				fnFetchMetadata = function () {},
				oBinding = new ODataParentBinding({
					bAggregatedQueryOptionsInitial : false,
					oCache : bRejected ? undefined : oCache,
					oCachePromise : oCachePromise,
					doFetchQueryOptions : function () {},
					oModel : {
						getMetaModel : function () {
							return oMetaModel;
						},
						oInterface : {
							fetchMetadata : fnFetchMetadata
						},
						reportError : function () {},
						resolve : function () {}
					},
					sPath : "/Set"
				}),
				oBindingMock = this.mock(oBinding),
				mChildLocalQueryOptions = {},
				oContext = bReturnValueContext
					? Context.createReturnValueContext(this.oModel, oBinding, "/Set('2')")
					: Context.create(this.oModel, oBinding, "/Set('2')"),
				oHelperMock = this.mock(_Helper),
				oMetaModelMock = this.mock(oMetaModel),
				oModelMock = this.mock(oBinding.oModel),
				oPromise;

			oModelMock.expects("resolve").exactly(bReturnValueContext ? 0 : 1)
				.withExactArgs("/Set", sinon.match.same(oBinding.oContext))
				.returns("/resolved/path");
			oModelMock.expects("resolve")
				.withExactArgs("childPath", sinon.match.same(oContext))
				.returns("/resolved/child/path");
			oMetaModelMock.expects("getMetaPath")
				.withExactArgs("/Set('2')")
				.returns("/Set");
			oMetaModelMock.expects("getMetaPath")
				.withExactArgs("/resolved/child/path")
				.returns("/resolved/child/metaPath");
			oBindingMock.expects("doFetchQueryOptions")
				.returns(SyncPromise.resolve({}));
			this.mock(_Helper).expects("fetchPropertyAndType")
				.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
				.returns(SyncPromise.resolve({$kind : "Property"}));
			oBindingMock.expects("getBaseForPathReduction")
				.withExactArgs().returns("/base/path");
			oMetaModelMock.expects("getReducedPath")
				.withExactArgs("/resolved/child/path", "/base/path")
				.returns("/reduced/child/path");
			oHelperMock.expects("getRelativePath")
				.withExactArgs("/reduced/child/path",
					bReturnValueContext ? "/Set('2')" : "/resolved/path")
				.returns("childPath");
			oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
				.returns("/reduced/child/metapath");
			oHelperMock.expects("getRelativePath")
				.withExactArgs("/reduced/child/metapath", "/Set")
				.returns("reducedChildMetaPath");
			oHelperMock.expects("wrapChildQueryOptions").returns({});
			oBindingMock.expects("aggregateQueryOptions")
				.withExactArgs({}, "/Set", /*bIsCacheImmutable*/true)
				.returns(false);
			if (bRejected) {
				this.mock(oBinding.oModel).expects("reportError")
					.withExactArgs(oBinding + ": Failed to enhance query options for "
						+ "auto-$expand/$select for child childPath", sClassName,
						sinon.match.same(oCachePromise.getResult()));
			} else {
				this.mock(oCache).expects("setQueryOptions").never();
			}

			// code under test
			oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath",
				SyncPromise.resolve(mChildLocalQueryOptions));

			return Promise.all([oPromise, !bRejected && oCachePromise]).then(function (aResults) {
				var sReducedPath = aResults[0];

				assert.strictEqual(sReducedPath, undefined);
				assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
				if (!bRejected) {
					assert.strictEqual(oBinding.oCachePromise.getResult(),
						oCachePromise.getResult());
				}
				// ensure that oCachePromise remains rejected
				assert.strictEqual(oBinding.oCachePromise.isRejected(),
					oCachePromise.isRejected());
			});
		});
	});
});

	//*********************************************************************************************
[{
	cache : false,
	rejected : false,
	title : "no cache"
}, {
	cache : false,
	rejected : true,
	title : "no cache, parent rejects"
}, {
	cache : true,
	title : "immutable cache"
}].forEach(function (oFixture) {
	QUnit.test("fetchIfChildCanUseCache: late query options, " + oFixture.title, function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function () {},
				getReducedPath : function () {}
			},
			oCache = {
				bSentRequest : true,
				setLateQueryOptions : function () {},
				setQueryOptions : function () {}
			},
			oCachePromise = SyncPromise.resolve(oFixture.cache ? oCache : null),
			fnFetchMetadata = {/*function*/},
			oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {$select : "foo"},
				bAggregatedQueryOptionsInitial : false,
				oCache : oFixture.cache ? oCache : null,
				oCachePromise : oCachePromise,
				oContext : {
					getBinding : function () {}
				},
				doFetchQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {},
					mUriParameters : {}
				},
				sPath : "navigation"
			}),
			oBindingMock = this.mock(oBinding),
			mChildLocalQueryOptions = {},
			oContext = Context.create(this.oModel, oBinding, "/Set('1')/navigation('2')"),
			oHelperMock = this.mock(_Helper),
			mLateQueryOptions = {},
			oMetaModelMock = this.mock(oMetaModel),
			oModelMock = this.mock(oBinding.oModel),
			oParentBinding = new ODataParentBinding(),
			oPromise;

		oModelMock.expects("resolve")
			.withExactArgs("navigation", sinon.match.same(oBinding.oContext))
			.returns("/resolved/path");
		oModelMock.expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/Set('1')/navigation('2')")
			.returns("/Set/navigation");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/resolved/child/path")
			.returns("/resolved/child/metaPath");
		oBindingMock.expects("doFetchQueryOptions")
			.returns(SyncPromise.resolve({}));
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
			.returns(SyncPromise.resolve(Promise.resolve({$kind : "Property"})));
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oMetaModelMock.expects("getReducedPath")
			.withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/path", "/resolved/path")
			.returns("childPath");
		oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
			.returns("/reduced/child/metapath");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/metapath", "/Set/navigation")
			.returns("reducedChildMetaPath");
		oHelperMock.expects("wrapChildQueryOptions")
			.withExactArgs("/Set/navigation", "reducedChildMetaPath",
				sinon.match.same(mChildLocalQueryOptions), sinon.match.same(fnFetchMetadata))
			.returns({});
		oBindingMock.expects("aggregateQueryOptions")
			.withExactArgs({}, "/Set/navigation", /*bIsCacheImmutable*/true)
			.callsFake(function () {
				oBinding.mLateQueryOptions = mLateQueryOptions;
				return true;
			});
		this.mock(oCache).expects("setLateQueryOptions").exactly(oFixture.cache ? 1 : 0)
			.withExactArgs(sinon.match.same(mLateQueryOptions));
		this.mock(oBinding.oContext).expects("getBinding").exactly(oFixture.cache ? 0 : 1)
			.withExactArgs().returns(oParentBinding);
		this.mock(oParentBinding).expects("fetchIfChildCanUseCache").exactly(oFixture.cache ? 0 : 1)
			.withExactArgs(sinon.match.same(oBinding.oContext), "navigation",
				sinon.match(function (p) {
					return p.getResult() === mLateQueryOptions;
				})
			)
			.returns(SyncPromise.resolve(oFixture.rejected ? undefined : "/some/path"));

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath",
			SyncPromise.resolve(mChildLocalQueryOptions));

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.notStrictEqual(oBinding.oCachePromise, oCachePromise);
		return oBinding.oCachePromise.then(function (oCache0) {
			var bUseCache = oPromise.getResult();

			assert.strictEqual(bUseCache, oFixture.rejected ? undefined : "/reduced/child/path");
			assert.strictEqual(oCache0, oFixture.cache ? oCache : null);
		});
	});
});

	//*********************************************************************************************
[
	{operation : false, shared : false},
	{operation : true, shared : false},
	{operation : false, shared : true}
].forEach(function (oFixture) {
	var sTitle = "fetchIfChildCanUseCache, mutable cache, " + JSON.stringify(oFixture);

	QUnit.test(sTitle, function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function () {},
				getReducedPath : function () {}
			},
			oCache0 = {
				bSentRequest : false,
				bSharedRequest : oFixture.shared,
				setActive : function () {},
				setQueryOptions : function () {},
				sResourcePath : "resource/path"
			},
			oCache0Mock = this.mock(oCache0),
			oCache1,
			oCachePromise = SyncPromise.resolve(oCache0),
			fnFetchMetadata = {/*function*/},
			oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {$select : "foo"},
				bAggregatedQueryOptionsInitial : false,
				oCache : oCache0,
				oCachePromise : oCachePromise,
				doFetchQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {},
					mUriParameters : {}
				},
				sPath : "/Set"
			}),
			oBindingMock = this.mock(oBinding),
			mChildLocalQueryOptions = {},
			oContext = Context.create(this.oModel, oBinding, "/Set('2')"),
			oHelperMock = this.mock(_Helper),
			oMetaModelMock = this.mock(oMetaModel),
			oModelMock = this.mock(oBinding.oModel),
			mNewQueryOptions = {},
			oPromise;

		if (oFixture.operation) {
			oBinding.oOperation = {};
		}
		oModelMock.expects("resolve")
			.withExactArgs("/Set", sinon.match.same(oBinding.oContext))
			.returns("/resolved/path");
		oModelMock.expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/Set('2')")
			.returns("/Set");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/resolved/child/path")
			.returns("/resolved/child/metaPath");
		oBindingMock.expects("doFetchQueryOptions")
			.returns(SyncPromise.resolve({}));
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
			.returns(SyncPromise.resolve(Promise.resolve({$kind : "Property"})));
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oMetaModelMock.expects("getReducedPath")
			.withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/path", "/resolved/path")
			.returns("childPath");
		oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
			.returns("/reduced/child/metapath");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/metapath", "/Set")
			.returns("reducedChildMetaPath");
		oHelperMock.expects("wrapChildQueryOptions")
			.withExactArgs("/Set", "reducedChildMetaPath",
				sinon.match.same(mChildLocalQueryOptions), sinon.match.same(fnFetchMetadata))
			.returns({});
		oBindingMock.expects("aggregateQueryOptions")
			.withExactArgs({}, "/Set", /*bIsCacheImmutable*/false)
			.returns(false);
		oHelperMock.expects("merge").never();
		oCache0Mock.expects("setQueryOptions").never();
		oCache0Mock.expects("setActive").never();
		oBindingMock.expects("createAndSetCache").never();
		if (oFixture.shared) {
			oCache0Mock.expects("setActive").withExactArgs(false);
			oBindingMock.expects("createAndSetCache")
				.withExactArgs(sinon.match.same(oBinding.mAggregatedQueryOptions),
					oCache0.sResourcePath, sinon.match.same(oContext))
				.returns(oCache1);
		} else if (!oFixture.operation) {
			oHelperMock.expects("merge").withExactArgs({},
				sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mAggregatedQueryOptions)).returns(mNewQueryOptions);
			oCache0Mock.expects("setQueryOptions").withExactArgs(mNewQueryOptions);
		}

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath",
			SyncPromise.resolve(mChildLocalQueryOptions));

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.notStrictEqual(oBinding.oCachePromise, oCachePromise);
		return oBinding.oCachePromise.then(function (oResultingCache) {
			var bUseCache = oPromise.getResult();

			assert.strictEqual(bUseCache, undefined);
			assert.strictEqual(oResultingCache, oFixture.shared ? oCache1 : oCache0);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: empty child path", function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function () {},
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oBinding = new ODataParentBinding({
				oCache : undefined,
				oCachePromise : SyncPromise.resolve(Promise.resolve(null)),
				oContext : {},
				wrapChildQueryOptions : function () {},
				doFetchQueryOptions : function () {},
				aggregateQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				sPath : "/Set"
			}),
			oBindingMock = this.mock(oBinding),
			mChildQueryOptions = {},
			mWrappedChildQueryOptions = {},
			oContext = Context.create(this.oModel, oBinding, "/Set/0", 0),
			oHelperMock = this.mock(_Helper),
			mLocalQueryOptions = {},
			oMetaModelMock = this.mock(oMetaModel),
			oModelMock = this.mock(oBinding.oModel),
			oPromise;

		oModelMock.expects("resolve")
			.withExactArgs("/Set", sinon.match.same(oBinding.oContext))
			.returns("/resolved/path");
		oModelMock.expects("resolve")
			.withExactArgs("", sinon.match.same(oContext))
			.returns("/resolved/child/path");
		oMetaModelMock.expects("getMetaPath").withExactArgs("/Set/0").returns("/Set");
		oMetaModelMock.expects("getMetaPath").withExactArgs("/resolved/child/path")
			.returns("/resolved/child/metaPath");
		oBindingMock.expects("doFetchQueryOptions")
			.withExactArgs(sinon.match.same(oBinding.oContext))
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
			.returns(SyncPromise.resolve({$kind : "EntitySet"}));
		oBindingMock.expects("selectKeyProperties")
			.withExactArgs(sinon.match.same(mLocalQueryOptions), "/Set");
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oMetaModelMock.expects("getReducedPath")
			.withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/path", "/resolved/path")
			.returns("");
		oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
			.returns("/reduced/child/metapath");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/metapath", "/Set")
			.returns("");
		oHelperMock.expects("wrapChildQueryOptions")
			.withExactArgs("/Set", "", sinon.match.same(mChildQueryOptions),
				sinon.match.same(fnFetchMetadata))
			.returns(mWrappedChildQueryOptions);
		oBindingMock.expects("aggregateQueryOptions")
			.withExactArgs(sinon.match.same(mWrappedChildQueryOptions), "/Set", undefined)
			.returns(true);

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "",
			SyncPromise.resolve(mChildQueryOptions));

		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, "/reduced/child/path");
			assert.deepEqual(oBinding.aChildCanUseCachePromises, [oPromise]);
		});
	});

	//*********************************************************************************************
	[{
		oProperty : {$kind : "notAProperty"},
		sPath : "EMPLOYEE_2_TEAM/INVALID"
	}, {
		oProperty : undefined,
		sPath : "EMPLOYEE_2_TEAM/My$count"
	}].forEach(function (oFixture, i) {
		QUnit.test("fetchIfChildCanUseCache, error handling, " + i, function (assert) {
			var oMetaModel = {
					fetchObject : function () {},
					getMetaPath : function () {},
					getReducedPath : function () {}
				},
				fnFetchMetadata = function () {},
				mOriginalAggregatedQueryOptions = {$expand : { "foo" : {$select : ["bar"]}}},
				oBinding = new ODataParentBinding({
					mAggregatedQueryOptions : mOriginalAggregatedQueryOptions,
					bAggregatedQueryOptionsInitial : false,
					// cache will be created, waiting for child bindings
					oCache : undefined,
					oCachePromise : SyncPromise.resolve(Promise.resolve(null)),
					oContext : {},
					doFetchQueryOptions : function () {
						return SyncPromise.resolve({});
					},
					oModel : {
						getMetaModel : function () { return oMetaModel; },
						oInterface : {
							fetchMetadata : fnFetchMetadata
						},
						resolve : function () {}
					},
					sPath : "/Set",
					bRelative : false
				}),
				oContext = Context.create(this.oModel, oBinding, "/Set('2')"),
				oHelperMock = this.mock(_Helper),
				oMetaModelMock = this.mock(oMetaModel),
				oModelMock = this.mock(oBinding.oModel),
				sPath = oFixture.sPath,
				oPromise;

			oModelMock.expects("resolve")
				.withExactArgs("/Set", sinon.match.same(oBinding.oContext))
				.returns("/resolved/path");
			oModelMock.expects("resolve")
				.withExactArgs(sPath, sinon.match.same(oContext))
				.returns("/resolved/child/path");
			oMetaModelMock.expects("getMetaPath")
				.withExactArgs("/Set('2')")
				.returns("/Set");
			oMetaModelMock.expects("getMetaPath")
				.withExactArgs("/resolved/child/path")
				.returns("/resolved/child/metaPath");
			this.mock(_Helper).expects("fetchPropertyAndType")
				.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
				.returns(SyncPromise.resolve(oFixture.oProperty));
			this.mock(oBinding).expects("getBaseForPathReduction")
				.withExactArgs().returns("/base/path");
			oMetaModelMock.expects("getReducedPath")
				.withExactArgs("/resolved/child/path", "/base/path")
				.returns("/reduced/child/path");
			oHelperMock.expects("getRelativePath")
				.withExactArgs("/reduced/child/path", "/resolved/path")
				.returns("childPath");
			oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
				.returns("/reduced/child/metapath");
			oHelperMock.expects("getRelativePath")
				.withExactArgs("/reduced/child/metapath", "/Set")
				.returns("reducedChildMetaPath");
			this.oLogMock.expects("error").withExactArgs(
				"Failed to enhance query options for auto-$expand/$select as the path "
					+ "'/resolved/child/metaPath' does not point to a property",
				JSON.stringify(oFixture.oProperty), sClassName);

			// code under test
			oPromise = oBinding.fetchIfChildCanUseCache(oContext, sPath);

			return oPromise.then(function (bUseCache) {
				assert.strictEqual(bUseCache, undefined);
				assert.deepEqual(oBinding.mAggregatedQueryOptions, mOriginalAggregatedQueryOptions);
			});
		});
	});

	//*********************************************************************************************
[undefined, true].forEach(function (bImmutable, i) {
	QUnit.test("fetchIfChildCanUseCache, advertised action #" + i, function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function () {},
				getReducedPath : function () {}
			},
			oModel = {
				getMetaModel : function () { return oMetaModel; },
				resolve : function () {}
			},
			oCache = {
				bSentRequest : bImmutable,
				setQueryOptions : function () {}
			},
			oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {$expand : { "foo" : {$select : ["bar"]}}},
				bAggregatedQueryOptionsInitial : false,
				oCache : bImmutable ? oCache : undefined,
				oCachePromise : SyncPromise.resolve(bImmutable ? oCache : Promise.resolve(oCache)),
				oContext : {},
				doFetchQueryOptions : function () {
					return SyncPromise.resolve({});
				},
				oModel : oModel,
				sPath : "/Set",
				bRelative : false
			}),
			oContext = Context.create(oModel, oBinding, "/Set('2')"),
			oHelperMock = this.mock(_Helper),
			oMetaModelMock = this.mock(oMetaModel),
			oModelMock = this.mock(oBinding.oModel),
			sPath = "#foo.bar.AcFoo",
			oPromise;

		oModelMock.expects("resolve")
			.withExactArgs("/Set", sinon.match.same(oBinding.oContext))
			.returns("/resolved/path");
		oModelMock.expects("resolve")
			.withExactArgs(sPath, sinon.match.same(oContext))
			.returns("/resolved/child/path/" + sPath);
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/Set('2')")
			.returns("/Set");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/resolved/child/path/" + sPath)
			.returns("/resolved/child/metaPath/" + sPath);
		this.mock(oBinding).expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oMetaModelMock.expects("getReducedPath")
			.withExactArgs("/resolved/child/path/" + sPath, "/base/path")
			.returns("/reduced/child/path/" + sPath);
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/path/" + sPath, "/resolved/path")
			.returns("childPath");
		oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path/" + sPath)
			.returns("/reduced/child/metapath/" + sPath);
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/metapath/" + sPath, "/Set")
			.returns(sPath);
		this.mock(oBinding).expects("aggregateQueryOptions")
			.withExactArgs({$select : ["foo.bar.AcFoo"]}, "/Set", bImmutable)
			.returns(!bImmutable);
		oMetaModelMock.expects("fetchObject")
			.withExactArgs("/resolved/child/metaPath/")
			.returns(SyncPromise.resolve());

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sPath);

		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath,
				bImmutable ? undefined : "/reduced/child/path/" + sPath);
		});
	});
});

	//*********************************************************************************************
["$count", "EMPLOYEE_2_EQUIPMENTS/$count", "@odata.etag"].forEach(function (sChildPath) {
	QUnit.test("fetchIfChildCanUseCache: " + sChildPath, function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function () {},
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oBinding = new ODataParentBinding({
				doFetchQueryOptions : function () {
					return SyncPromise.resolve({});
				},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				sPath : "/Set"
			}),
			oContext = Context.create(oBinding.oModel, oBinding, "/Set('2')"),
			oMetaModelMock = this.mock(oMetaModel),
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs()
			.returns("/base/path");
		oModelMock.expects("resolve").withExactArgs("/Set", undefined)
			.returns("/resolved/path");
		oModelMock.expects("resolve").withExactArgs(sChildPath, sinon.match.same(oContext))
			.returns("/resolved/child/path");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/Set('2')")
			.returns("/Set");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/resolved/child/path")
			.returns("/resolved/child/metaPath");
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
			.returns(SyncPromise.resolve());
		oMetaModelMock.expects("getReducedPath").withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");

		// code under test
		assert.strictEqual(
			oBinding.fetchIfChildCanUseCache(oContext, sChildPath).getResult(),
			"/reduced/child/path");
	});
});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: $$aggregation", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {},
				oModel : {
					getMetaModel : function () { return {}; },
					resolve : function () {}
				},
				mParameters : {
					$$aggregation : {/*irrelevant*/}
				},
				sPath : "path"
			}),
			oContext = {},
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("n/a");
		oModelMock.expects("resolve")
			.withExactArgs("path", sinon.match.same(oBinding.oContext))
			.returns("/Foo/Bar/path");
		oModelMock.expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");

		// code under test
		assert.strictEqual(
			oBinding.fetchIfChildCanUseCache(oContext, "childPath").getResult(),
			"/resolved/child/path");
	});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: operation binding or dependent", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {},
				oModel : {
					getMetaModel : function () { return {}; },
					resolve : function () {}
				},
				sPath : "path"
			}),
			oContext = {},
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("anything");
		oModelMock.expects("resolve")
			.withExactArgs("path", sinon.match.same(oBinding.oContext))
			.returns("/Foo/operation(...)/Bar/path");
		oModelMock.expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");

		// code under test
		assert.strictEqual(
			oBinding.fetchIfChildCanUseCache(oContext, "childPath").getResult(),
			"/resolved/child/path");
	});

	//*********************************************************************************************
[false, true].forEach(function (bReduced, i) {
	QUnit.test("fetchIfChildCanUseCache, operation parameter #" + i, function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function () {},
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oModel = {
				getMetaModel : function () { return oMetaModel; },
				oInterface : {
					fetchMetadata : fnFetchMetadata
				},
				resolve : function () {}
			},
			oParentBinding = {
				fetchIfChildCanUseCache : function () {}
			},
			oBinding = new ODataParentBinding({
				oContext : {
					getBinding : function () { return oParentBinding; },
					getPath : function () { return "/Set('2')"; }
				},
				doFetchQueryOptions : function () {
					return SyncPromise.resolve({});
				},
				oModel : oModel,
				sPath : "operation(...)"
			}),
			oChildQueryOptionsPromise = {},
			oContext = Context.create(oModel, oBinding, "/Set('2')/operation(...)/$Parameter"),
			oHelperMock = this.mock(_Helper),
			oMetaModelMock = this.mock(oMetaModel),
			oModelMock = this.mock(oBinding.oModel),
			sPath = "foo/bar",
			oPromise;

		this.mock(oBinding).expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oModelMock.expects("resolve")
			.withExactArgs("operation(...)", sinon.match.same(oBinding.oContext))
			.returns("/Set('2')/operation(...)");
		oModelMock.expects("resolve")
			.withExactArgs(sPath, sinon.match.same(oContext))
			.returns("/Set('2')/operation(...)/$Parameter/foo/bar");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/Set('2')/operation(...)/$Parameter")
			.returns("/Set/operation/$Parameter");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/Set('2')/operation(...)/$Parameter/foo/bar")
			.returns("/Set/operation/$Parameter/foo/bar");
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/Set/operation/$Parameter/foo/bar")
			.returns(SyncPromise.resolve());
		oMetaModelMock.expects("getReducedPath")
			.withExactArgs("/Set('2')/operation(...)/$Parameter/foo/bar", "/base/path")
			.returns("/reduced/child/path");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/path", "/Set('2')/operation(...)")
			.returns(bReduced ? undefined : "childPath");
		oHelperMock.expects("getRelativePath").exactly(bReduced ? 1 : 0)
			.withExactArgs("/Set('2')/operation(...)/$Parameter/foo/bar", "/Set('2')")
			.returns("operation(...)/$Parameter/foo/bar");
		this.mock(oParentBinding).expects("fetchIfChildCanUseCache").exactly(bReduced ? 1 : 0)
			.withExactArgs(sinon.match.same(oBinding.oContext), "operation(...)/$Parameter/foo/bar",
				sinon.match.same(oChildQueryOptionsPromise))
			.returns("/reduced/child/path");
		this.mock(oBinding).expects("aggregateQueryOptions").never();

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sPath, oChildQueryOptionsPromise);

		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, "/reduced/child/path");
		});
	});
});

//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: non-deferred function", function (assert) {
		var oMetaModel = {
				getMetaPath : function (sPath) {
					return _Helper.getMetaPath(sPath);
				}
			},
			fnFetchMetadata = function () {},
			oBinding = new ODataParentBinding({
				doFetchQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				sPath : "/Collection(42)"
			}),
			sChildPath = "Function(foo=42)",
			oContext = Context.create(this.oModel, oBinding, "/Collection(42)"),
			oModelMock = this.mock(oBinding.oModel),
			oPromise;

		this.mock(oBinding).expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oModelMock.expects("resolve")
			.withExactArgs("/Collection(42)", undefined)
			.returns("/Collection(42)");
		oModelMock.expects("resolve")
			.withExactArgs(sChildPath, sinon.match.same(oContext))
			.returns("/resolved/child/path");
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/path")
			.returns(SyncPromise.resolve([{$isBound : true, $kind : "Function"}]));
		this.mock(oBinding).expects("doFetchQueryOptions").withExactArgs(undefined)
			.returns(SyncPromise.resolve());

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sChildPath,
			SyncPromise.resolve());

		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, undefined);
		});
	});

	//*********************************************************************************************
[undefined, true].forEach(function (bImmutable) {
	var sTitle = "fetchIfChildCanUseCache: non-deferred function and 'value', bImmutable = "
			+ bImmutable;

	QUnit.test(sTitle, function (assert) {
		var oCache = {
				bSentRequest : bImmutable,
				setQueryOptions : function () {}
			},
			oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function (sPath) {
					return _Helper.getMetaPath(sPath);
				},
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oBinding = new ODataParentBinding({
				oCache : bImmutable ? oCache : undefined,
				oCachePromise : SyncPromise.resolve(bImmutable ? oCache : Promise.resolve(oCache)),
				doFetchQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				sPath : "/Function(foo=42)",
				bRelative : false
			}),
			oBindingMock = this.mock(oBinding),
			sChildPath = "value",
			mChildQueryOptions = {},
			oContext = Context.create(this.oModel, oBinding, "/Function(foo=42)"),
			oHelperMock = this.mock(_Helper),
			mLocalQueryOptions = {},
			oModelMock = this.mock(oBinding.oModel),
			oPromise;

		oModelMock.expects("resolve")
			.withExactArgs("/Function(foo=42)", undefined)
			.returns("/Function(foo=42)");
		oModelMock.expects("resolve")
			.withExactArgs(sChildPath, sinon.match.same(oContext))
			.returns("/resolved/child/path");
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/path")
			.returns(SyncPromise.resolve({$isCollection : true, $Type : "some.EntityType"}));
		oBindingMock.expects("doFetchQueryOptions").withExactArgs(undefined)
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		oBindingMock.expects("selectKeyProperties")
			.withExactArgs(sinon.match.object, "/Function"); // Note: w/o $Key nothing happens
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/path", "/Function(foo=42)")
			.returns("childPath");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/path", "/Function")
			.returns("value");
		oBindingMock.expects("aggregateQueryOptions")
			.withExactArgs(sinon.match.same(mChildQueryOptions), "/Function", bImmutable)
			.returns(!bImmutable);

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sChildPath,
			SyncPromise.resolve(mChildQueryOptions));

		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, bImmutable ? undefined : "/reduced/child/path");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache, suspended parent binding", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {},
				oModel : {
					getMetaModel : function () { return {}; },
					resolve : function () {}
				},
				sPath : "/TEAMS"
			}),
			oContext = {},
			oModelMock = this.mock(oBinding.oModel),
			oPromise,
			oRootBinding = {
				isSuspended : function () {}
			};

		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("anything");
		oModelMock.expects("resolve")
			.withExactArgs("/TEAMS", sinon.match.same(oBinding.oContext))
			.returns("/TEAMS");
		oModelMock.expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");

		// getRootBinding cannot return undefined in fetchIfChildCanUseCache because it is
		// called on a resolved binding see
		// sap.ui.model.odata.v4.ODataBinding#fetchQueryOptionsForOwnCache
		this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
		this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath",
			SyncPromise.resolve({}));

		return oPromise.then(function (bUseCache) {
			assert.strictEqual(bUseCache, "/resolved/child/path");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: delegate to parent binding", function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function () {},
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oParentBinding = new ODataParentBinding(),
			oBinding = new ODataParentBinding({
				oCache : undefined,
				oCachePromise : SyncPromise.resolve(Promise.resolve(null)),
				oContext : {
					getBinding : function () { return oParentBinding; },
					getPath : function () { return "/SalesOrderList('42')"; }
				},
				doFetchQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				sPath : "SO_2_SOITEMS"
			}),
			oBindingMock = this.mock(oBinding),
			mChildQueryOptions = {},
			oChildQueryOptionsPromise = SyncPromise.resolve(mChildQueryOptions),
			oContext = Context.create(this.oModel, oBinding,
				"/SalesOrderList('42')/SO_2_SOITEMS('23')", 23),
			oHelperMock = this.mock(_Helper),
			mLocalQueryOptions = {},
			oMetaModelMock = this.mock(oMetaModel),
			oModelMock = this.mock(oBinding.oModel),
			oPromise;

		oModelMock.expects("resolve")
			.withExactArgs("SO_2_SOITEMS", sinon.match.same(oBinding.oContext))
			.returns("/SalesOrderList('42')/SO_2_SOITEMS");
		oModelMock.expects("resolve")
			.withExactArgs("SOITEMS_2_SO/Note", sinon.match.same(oContext))
			.returns("/SalesOrderList('42')/SO_2_SOITEMS('23')/SOITEMS_2_SO/Note");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEMS('23')")
			.returns("/SalesOrderList/SO_2_SOITEMS");
		oMetaModelMock.expects("getMetaPath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEMS('23')/SOITEMS_2_SO/Note")
			.returns("/SalesOrderList/SO_2_SOITEMS/SOITEMS_2_SO/Note");
		oBindingMock.expects("doFetchQueryOptions")
			.withExactArgs(sinon.match.same(oBinding.oContext))
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata),
				"/SalesOrderList/SO_2_SOITEMS/SOITEMS_2_SO/Note")
			.returns(SyncPromise.resolve({$kind : "Property"}));
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/SalesOrderList");
		oMetaModelMock.expects("getReducedPath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEMS('23')/SOITEMS_2_SO/Note",
				"/SalesOrderList")
			.returns("/SalesOrderList('42')/Note");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/SalesOrderList('42')/Note", "/SalesOrderList('42')/SO_2_SOITEMS")
			.returns(undefined);
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEMS('23')/SOITEMS_2_SO/Note",
				"/SalesOrderList('42')")
			.returns("SO_2_SOITEMS('23')/SOITEMS_2_SO/Note");
		this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(sinon.match.same(oBinding.oContext),
				"SO_2_SOITEMS('23')/SOITEMS_2_SO/Note", sinon.match.same(oChildQueryOptionsPromise))
			.returns(Promise.resolve("/SalesOrderList('42')/Note"));

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "SOITEMS_2_SO/Note",
			oChildQueryOptionsPromise);

		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, "/SalesOrderList('42')/Note");
		});
	});

	//*********************************************************************************************
[{
	aggregatedQueryOptions : {$select : ["Name", "AGE"]},
	childQueryOptions :  {$select : ["Name"]},
	success : true,
	title : "same $select as before"
}, {
	aggregatedQueryOptions : {$select : ["Name", "AGE"]},
	childQueryOptions :  {$select : ["ROOM_ID"]},
	lateQueryOptions : {$select : ["Name", "AGE", "ROOM_ID"]},
	success : true,
	title : "new property accepted and added to late properties"
}, {
	aggregatedQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id"]}}},
	childQueryOptions :  {$expand : {EMPLOYEE_2_TEAM : {}}},
	success : true,
	title : "same $expand as before"
}, {
	aggregatedQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id"]}}},
	childQueryOptions :  {$expand : {EMPLOYEE_2_TEAM : {$select : ["Name"]}}},
	lateQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id", "Name"]}}},
	success : true,
	title : "new $select in existing $expand"
}, {
	aggregatedQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {}}},
	childQueryOptions : {$expand : {"EMPLOYEE_2_TEAM" : {$expand : {TEAM_2_MANAGER : {}}}}},
	lateQueryOptions : {$expand : {"EMPLOYEE_2_TEAM" : {$expand : {TEAM_2_MANAGER : {}}}}},
	metadata : {
		"/base/metaPath/EMPLOYEE_2_TEAM/TEAM_2_MANAGER" : {}
	},
	success : true,
	title : "new $expand in existing $expand"
}, {
	aggregatedQueryOptions : {$select : ["AGE"]},
	childQueryOptions : {
		$expand : {
			EMPLOYEE_OF_THE_WEEK : {
				$expand : {EMPLOYEE_2_MANAGER : {$select : ["Name"]}}
			}
		}
	},
	lateQueryOptions : {
		$select : ["AGE"],
		$expand : {
			EMPLOYEE_OF_THE_WEEK : {
				$expand : {EMPLOYEE_2_MANAGER : {$select : ["Name"]}}
			}
		}
	},
	metadata : {
		"/base/metaPath/EMPLOYEE_OF_THE_WEEK" : {},
		"/base/metaPath/EMPLOYEE_OF_THE_WEEK/EMPLOYEE_2_MANAGER" : {}
	},
	success : true,
	title : "new $expand, single"
}, {
	aggregatedQueryOptions : {$select : ["AGE"]},
	childQueryOptions : {
		$expand : {
			EMPLOYEE_OF_THE_WEEK : {
				$expand : {EMPLOYEE_2_EQUIPMENTS : {$select : ["Name"]}}
			}
		}
	},
	metadata : {
		"/base/metaPath/EMPLOYEE_OF_THE_WEEK" : {},
		"/base/metaPath/EMPLOYEE_OF_THE_WEEK/EMPLOYEE_2_EQUIPMENTS" : {$isCollection : true}
	},
	success : false,
	title : "new $expand, collection"
}].forEach(function (oFixture, i) {
	QUnit.test("aggregateQueryOptions: cache is immutable, " + oFixture.title, function (assert) {
		var mAggregatedQueryOptions = {},
			oMetaModel = {
				fetchObject : function () {}
			},
			oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : mAggregatedQueryOptions,
				oCache : {},
				mLateQueryOptions : {},
				oModel : {
					getMetaModel : function () { return oMetaModel; }
				}
			}),
			oHelperMock = this.mock(_Helper),
			oMetaModelMock = this.mock(oMetaModel);

		oHelperMock.expects("merge")
			.withExactArgs({}, sinon.match.same(oBinding.mAggregatedQueryOptions),
				sinon.match.same(oBinding.mLateQueryOptions))
			.returns(oFixture.aggregatedQueryOptions);
		if (oFixture.metadata) {
			Object.keys(oFixture.metadata).forEach(function (sMetaPath) {
				oMetaModelMock.expects("fetchObject").withExactArgs(sMetaPath)
					.returns(SyncPromise.resolve(oFixture.metadata[sMetaPath]));
			});
		}

		assert.strictEqual(
			// code under test
			oBinding.aggregateQueryOptions(oFixture.childQueryOptions, "/base/metaPath", true),
			oFixture.success
		);
		assert.strictEqual(oBinding.mAggregatedQueryOptions, mAggregatedQueryOptions);
		assert.deepEqual(oBinding.mAggregatedQueryOptions, {}, "mAggregatedQueryOptions unchanged");
		if (oFixture.lateQueryOptions) {
			assert.strictEqual(oBinding.mLateQueryOptions, oFixture.aggregatedQueryOptions);
		}
	});
});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: binding w/ cache", function (assert) {
		var oCache = {
				_delete : function () {}
			},
			oBinding = new ODataParentBinding({
				oCache : oCache,
				getUpdateGroupId : function () {},
				oModel : {isAutoGroup : function () {return true;}}
			}),
			fnCallback = {},
			oETagEntity = {},
			oGroupLock =  {getGroupId : function () {}},
			oResult = {};

		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oCache).expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES('1')",
				"1/EMPLOYEE_2_EQUIPMENTS/3", sinon.match.same(oETagEntity),
				sinon.match.same(fnCallback))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oBinding.deleteFromCache(oGroupLock, "EMPLOYEES('1')", "1/EMPLOYEE_2_EQUIPMENTS/3",
					oETagEntity, fnCallback).getResult(),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: binding w/o cache", function (assert) {
		var oParentBinding = {
				deleteFromCache : function () {}
			},
			oContext = {
				getBinding : function () {
					return oParentBinding;
				},
				iIndex : 42
			},
			oBinding = new ODataParentBinding({
				oCache : null,
				oContext : oContext,
				getUpdateGroupId : function () {},
				oModel : {isAutoGroup : function () {return true;}},
				sPath : "TEAM_2_EMPLOYEES"
			}),
			fnCallback = {},
			oETagEntity = {},
			oGroupLock = {},
			oResult = {};

		this.mock(_Helper).expects("buildPath")
			.withExactArgs(42, "TEAM_2_EMPLOYEES", "1/EMPLOYEE_2_EQUIPMENTS/3")
			.returns("~");
		this.mock(oParentBinding).expects("deleteFromCache")
			.withExactArgs(sinon.match.same(oGroupLock), "EQUIPMENTS('3')", "~",
				sinon.match.same(oETagEntity), sinon.match.same(fnCallback))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oBinding.deleteFromCache(oGroupLock, "EQUIPMENTS('3')", "1/EMPLOYEE_2_EQUIPMENTS/3",
					oETagEntity, fnCallback).getResult(),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: check submit mode", function (assert) {
		var oCache = {_delete : function () {}},
			oBinding = new ODataParentBinding({
				oCache : oCache,
				getUpdateGroupId : function () {},
				oModel : {isAutoGroup : function () {}, isDirectGroup : function () {}}
			}),
			oETagEntity,
			oGroupLock = {getGroupId : function () {}},
			oGroupLockMock = this.mock(oGroupLock),
			oModelMock = this.mock(oBinding.oModel),
			fnCallback = {};

		oGroupLockMock.expects("getGroupId").withExactArgs().returns("myGroup");
		oModelMock.expects("isAutoGroup").withExactArgs("myGroup").returns(false);
		assert.throws(function () {
			oBinding.deleteFromCache(oGroupLock);
		}, new Error("Illegal update group ID: myGroup"));

		oGroupLockMock.expects("getGroupId").withExactArgs().returns("$direct");
		oModelMock.expects("isAutoGroup").withExactArgs("$direct").returns(false);
		oModelMock.expects("isDirectGroup").withExactArgs("$direct").returns(true);
		this.mock(oCache).expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES('1')", "42",
				sinon.match.same(oETagEntity), sinon.match.same(fnCallback))
			.returns(SyncPromise.resolve());

		return oBinding.deleteFromCache(oGroupLock, "EMPLOYEES('1')", "42", oETagEntity,
			fnCallback).then();
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: cache is not yet available", function (assert) {
		var oBinding = new ODataParentBinding({
				// simulate pending cache creation
				oCache : undefined
			});

		assert.throws(function () {
			oBinding.deleteFromCache("$auto");
		}, new Error("DELETE request not allowed"));
	});

	//*********************************************************************************************
	[
		{sPath : "/Employees"}, // absolute binding
		{sPath : "TEAM_2_MANAGER"}, // relative binding without context
		{sPath : "/Employees(ID='1')", oContext : {}}, // absolute binding with context (edge case)
		{sPath : "TEAM_2_MANAGER", oContext : {}} // relative binding with standard context
	].forEach(function (oFixture) {
		QUnit.test("checkUpdateInternal: " + JSON.stringify(oFixture), function (assert) {
			var bRelative = oFixture.sPath[0] !== '/',
				oCache = bRelative ? null : { /* cache */},
				oBinding = new ODataParentBinding({
					oCache : oCache,
					oCachePromise : SyncPromise.resolve(oCache),
					oContext : oFixture.oContext,
					sPath : oFixture.sPath,
					bRelative : bRelative
				}),
				fnGetContext = function () {
					return {
						created : function () {}
					};
				},
				oDependent0 = {
					checkUpdateInternal : function () {},
					getContext : fnGetContext
				},
				bDependent0Refreshed = false,
				oDependent0Promise = new SyncPromise(function (resolve) {
					setTimeout(function () {
						bDependent0Refreshed = true;
						resolve();
					});
				}),
				oDependent1 = {
					checkUpdateInternal : function () {},
					getContext : fnGetContext
				},
				bDependent1Refreshed = false,
				oDependent1Promise = new SyncPromise(function (resolve) {
					setTimeout(function () {
						bDependent1Refreshed = true;
						resolve();
					});
				});

			this.mock(oBinding).expects("getDependentBindings")
				.withExactArgs()
				.returns([oDependent0, oDependent1]);
			this.mock(oDependent0).expects("checkUpdateInternal").withExactArgs()
				.returns(oDependent0Promise);
			this.mock(oDependent1).expects("checkUpdateInternal").withExactArgs()
				.returns(oDependent1Promise);

			// code under test
			return oBinding.checkUpdateInternal().then(function (oResult) {
				assert.strictEqual(bDependent0Refreshed, true);
				assert.strictEqual(bDependent1Refreshed, true);
			});
		});
	});
	//TODO fire change event only if the binding's length changed, i.e. if getContexts will provide
	//  a different result compared to the previous call

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal: no cache, no dependents", function (assert) {
		var oBinding = new ODataParentBinding({
				bRelative : true
			});

		this.mock(oBinding).expects("getDependentBindings").withExactArgs().returns([]);

		// code under test
		assert.strictEqual(oBinding.checkUpdateInternal().isFulfilled(), true);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: with parameters", function (assert) {
		var bForceUpdate = {/*false or true*/};

		assert.throws(function () {
			// code under test
			new ODataParentBinding().checkUpdateInternal(bForceUpdate);
		}, new Error("Unsupported operation:"
			+ " sap.ui.model.odata.v4.ODataParentBinding#checkUpdateInternal must not be called"
			+ " with parameters"));
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal: relative binding with cache, parent binding data has changed",
			function (assert) {
		var oCache = {
				$resourcePath : "TEAMS('4711')/TEAM_2_MANAGER"
			},
			oBinding = new ODataParentBinding({
				oCache : oCache,
				oCachePromise : SyncPromise.resolve(oCache),
				oContext : {},
				sPath : "Manager_to_Team",
				refreshInternal : function () {},
				bRelative : true
			}),
			oPathPromise = Promise.resolve("TEAMS('8192')/TEAM_2_MANAGER"),
			bRefreshed = false;

		this.mock(oBinding).expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oBinding.oContext))
			.returns(SyncPromise.resolve(oPathPromise)); // data for path "/TEAMS/1" has changed
		this.mock(oBinding).expects("refreshInternal").withExactArgs("")
			.returns(new SyncPromise(function (resolve) {
				setTimeout(function () {
					bRefreshed = true;
					resolve();
				});
			}));

		// code under test
		return oBinding.checkUpdateInternal().then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.strictEqual(bRefreshed, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal: relative binding with cache, parent binding not changed",
			function (assert) {
		var sPath = "/TEAMS('4711')/TEAM_2_MANAGER",
			oCache = {
				$resourcePath : sPath
			},
			oBinding = new ODataParentBinding({
				oCache : oCache,
				oCachePromise : SyncPromise.resolve(oCache),
				oContext : {
					fetchCanonicalPath : function () {}
				},
				sPath : "Manager_to_Team",
				bRelative : true
			}),
			fnGetContext = function () {
				return {
					created : function () {}
				};
			},
			oDependent0 = {
				checkUpdateInternal : function () {},
				getContext : fnGetContext
			},
			bDependent0Refreshed = false,
			oDependent0Promise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependent0Refreshed = true;
					resolve();
				});
			}),
			oDependent1 = {
				checkUpdateInternal : function () {},
				getContext : fnGetContext
			},
			bDependent1Refreshed = false,
			oDependent1Promise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependent1Refreshed = true;
					resolve();
				});
			}),
			oPathPromise = Promise.resolve(sPath);

		this.mock(oBinding).expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oBinding.oContext))
			.returns(SyncPromise.resolve(oPathPromise));
		this.mock(oBinding).expects("getDependentBindings")
			.withExactArgs()
			.returns([oDependent0, oDependent1]);
		this.mock(oDependent0).expects("checkUpdateInternal").withExactArgs()
			.returns(oDependent0Promise);
		this.mock(oDependent1).expects("checkUpdateInternal").withExactArgs()
			.returns(oDependent1Promise);

		// code under test
		return oBinding.checkUpdateInternal().then(function (oResult) {
			assert.strictEqual(bDependent0Refreshed, true);
			assert.strictEqual(bDependent1Refreshed, true);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCancel) {
		QUnit.test("createInCache: with cache, canceled: " + bCancel, function (assert) {
			var sCanonicalPath = "/TEAMS('1')/EMPLOYEES",
				oCache = {
					$resourcePath : sCanonicalPath,
					create : function () {}
				},
				oCreateError = new Error("canceled"),
				oBinding = new ODataParentBinding({
					oCache : oCache,
					mCacheByResourcePath : {},
					oCachePromise : SyncPromise.resolve(oCache)
				}),
				oCreateResult = {},
				oCreatePromise = SyncPromise.resolve(
					bCancel ? Promise.reject(oCreateError) : oCreateResult),
				fnError = function () {},
				oInitialData = {},
				fnSubmit = function () {},
				sTransientPredicate = "($uid=id-1-23)";

			oBinding.mCacheByResourcePath[sCanonicalPath] = oCache;

			this.mock(oCache).expects("create")
				.withExactArgs("updateGroupId", "EMPLOYEES", "", sTransientPredicate,
					sinon.match.same(oInitialData),
					sinon.match.same(fnError), sinon.match.same(fnSubmit))
				.returns(oCreatePromise);

			// code under test
			return oBinding.createInCache("updateGroupId", "EMPLOYEES", "", sTransientPredicate,
				oInitialData, fnError, fnSubmit)
				.then(function (oResult) {
					assert.strictEqual(bCancel, false);
					assert.strictEqual(oResult, oCreateResult);
					assert.notOk(sCanonicalPath in oBinding.mCacheByResourcePath);
				}, function (oError) {
					assert.strictEqual(bCancel, true);
					assert.strictEqual(oError, oCreateError);
					assert.strictEqual(oBinding.mCacheByResourcePath[sCanonicalPath], oCache);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("createInCache: cache without $resourcePath", function (assert) {
		var oCache = {
				create : function () {}
			},
			oBinding = new ODataParentBinding({
				oCache : oCache,
				mCacheByResourcePath : undefined,
				oCachePromise : SyncPromise.resolve(oCache)
			}),
			oCreateResult = {},
			oCreatePromise = SyncPromise.resolve(oCreateResult),
			fnError = function () {},
			oGroupLock = {},
			oInitialData = {},
			fnSubmit = function () {},
			sTransientPredicate = "($uid=id-1-23)";

		this.mock(oCache).expects("create")
			.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES", "", sTransientPredicate,
				sinon.match.same(oInitialData), sinon.match.same(fnError),
				sinon.match.same(fnSubmit))
			.returns(oCreatePromise);

		// code under test
		return oBinding.createInCache(
				oGroupLock, "EMPLOYEES", "", sTransientPredicate, oInitialData, fnError, fnSubmit
			).then(function (oResult) {
				assert.strictEqual(oResult, oCreateResult);
			});
	});

	//*********************************************************************************************
	QUnit.test("createInCache: binding w/o cache", function (assert) {
		var oParentBinding = {
				createInCache : function () {}
			},
			oContext = {
				getBinding : function () {
					return oParentBinding;
				},
				iIndex : 42
			},
			oBinding = new ODataParentBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				oContext : oContext,
				//getUpdateGroupId : function () {},
				sPath : "SO_2_SCHEDULE"
			}),
			fnError = {},
			oGroupLock = {},
			oInitialData = {},
			oResult = {},
			fnSubmit = {},
			sTransientPredicate = "($uid=id-1-23)";

		this.mock(_Helper).expects("buildPath")
			.withExactArgs(42, "SO_2_SCHEDULE", "")
			.returns("~");
		this.mock(oParentBinding).expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock), "SalesOrderList('4711')/SO_2_SCHEDULE",
				"~", sTransientPredicate, oInitialData, sinon.match.same(fnError),
				sinon.match.same(fnSubmit))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oBinding.createInCache(oGroupLock, "SalesOrderList('4711')/SO_2_SCHEDULE", "",
				sTransientPredicate, oInitialData, fnError, fnSubmit).getResult(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("selectKeyProperties", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			oBinding = new ODataParentBinding({
				oModel : {getMetaModel : function () { return oMetaModel; }}
			}),
			mQueryOptions = {},
			oType = {};

		this.mock(oMetaModel).expects("getObject").withExactArgs("~/").returns(oType);
		this.mock(_Helper).expects("selectKeyProperties")
			.withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(oType));

		// code under test
		oBinding.selectKeyProperties(mQueryOptions, "~");
	});

	//*********************************************************************************************
	[{
		aggregated : {$filter : "foo"},
		current : {$filter : "bar"},
		result : {$filter : "bar"}
	}, {
		aggregated : {$select: ["foo", "bar"]},
		current : {$select : ["foo"]},
		result : {$select: ["foo", "bar"]}
	}, {
		aggregated : {$expand: {foo : {}, bar : {}}},
		current : {$expand: {foo : {}}},
		result : {$expand: {foo : {}, bar : {}}}
	}, {
		aggregated : {$filter : "foo"},
		current : {},
		result : {}
	}, {
		aggregated : {},
		initial : true,
		current : {$expand : {foo : {}}, $orderby : "bar"},
		result : {$expand : {foo : {}}, $orderby : "bar"}
	}, {
		aggregated : {},
		initial : true,
		current : {$select : ["foo"], $orderby : "bar"},
		result : {$select : ["foo"], $orderby : "bar"}
	}].forEach(function (oFixture, i) {
		QUnit.test("updateAggregatedQueryOptions " + i, function (assert) {
			var oBinding = new ODataParentBinding({
					bAggregatedQueryOptionsInitial : oFixture.initial,
					mAggregatedQueryOptions : oFixture.aggregated
				}),
				fnDestroy = function () {this.mAggregatedQueryOptions = undefined;};

			oBinding.destroy = fnDestroy;

			// code under test
			assert.deepEqual(oBinding.updateAggregatedQueryOptions(oFixture.current),
				undefined);

			assert.deepEqual(oBinding.mAggregatedQueryOptions, oFixture.result);

			// code under test
			oBinding.destroy();
			oBinding.updateAggregatedQueryOptions(oFixture.current);

			assert.deepEqual(oBinding.mAggregatedQueryOptions, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("suspend: root binding", function (assert) {
		var oBinding = new ODataParentBinding({
				toString : function () { return "~"; }
			}),
			oBindingMock = this.mock(oBinding),
			oResult = {};

		oBindingMock.expects("isRoot").withExactArgs().returns(true);
		oBindingMock.expects("hasPendingChanges").withExactArgs().returns(false);
		oBindingMock.expects("removeReadGroupLock").withExactArgs();

		// code under test
		oBinding.suspend();

		assert.strictEqual(oBinding.bSuspended, true);
		assert.strictEqual(oBinding.oResumePromise.isPending(), true);
		oBinding.oResumePromise.$resolve(oResult);
		assert.strictEqual(oBinding.oResumePromise.isPending(), false);
		assert.strictEqual(oBinding.oResumePromise.getResult(), oResult);

		assert.throws(function () {
			oBindingMock.expects("isRoot").withExactArgs().returns(true);

			// code under test
			oBinding.suspend();
		}, new Error("Cannot suspend a suspended binding: ~"));
	});

	//*********************************************************************************************
	QUnit.test("suspend: error on operation binding", function (assert) {
		var oBinding = new ODataParentBinding({
				oOperation : {},
				toString : function () { return "~"; }
			});

		this.mock(oBinding).expects("removeReadGroupLock").never();

		assert.throws(function () {
			// code under test
			oBinding.suspend();
		}, new Error("Cannot suspend an operation binding: ~"));
	});

	//*********************************************************************************************
	QUnit.test("suspend: error on non-root binding", function (assert) {
		var oBinding = new ODataParentBinding({
				toString : function () { return "~"; }
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);
		this.mock(oBinding).expects("removeReadGroupLock").never();

		assert.throws(function () {
			// code under test
			oBinding.suspend();
		}, new Error("Cannot suspend a relative binding: ~"));
	});

	//*********************************************************************************************
	QUnit.test("suspend: error on binding with pending changes", function (assert) {
		var oBinding = new ODataParentBinding({
				toString : function () { return "~"; }
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);
		this.mock(oBinding).expects("removeReadGroupLock").never();

		assert.throws(function () {
			// code under test
			oBinding.suspend();
		}, new Error("Cannot suspend a binding with pending changes: ~"));
	});

	//*********************************************************************************************
	QUnit.test("_resume: root binding (asynchronous)", function (assert) {
		var oBinding = new ODataParentBinding({
				_fireChange : function () {},
				oModel : {addPrerenderingTask : function () {}},
				resumeInternal : function () {},
				toString : function () { return "~"; }
			}),
			oBindingMock = this.mock(oBinding),
			oPromise,
			fnResolve,
			oResumePromise = new SyncPromise(function (resolve, reject) {
				fnResolve = resolve;
			});

		oBinding.bSuspended = true;
		oBinding.oResumePromise = oResumePromise;
		oBinding.oResumePromise.$resolve = fnResolve;
		oBindingMock.expects("isRoot").withExactArgs().returns(true);
		oBindingMock.expects("resumeInternal").never();
		oBindingMock.expects("getGroupId").withExactArgs().returns("groupId");
		oBindingMock.expects("createReadGroupLock").withExactArgs("groupId", true, 1);
		this.mock(oBinding.oModel).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func)
			.callsFake(function (fnCallback) {
				// simulate async nature of prerendering task
				oPromise = Promise.resolve().then(function () {
					assert.strictEqual(oBinding.bSuspended, true, "not yet!");
					assert.strictEqual(oResumePromise.isPending(), true);

					oBindingMock.expects("resumeInternal").withExactArgs(true)
						.callsFake(function () {
							// before we fire events to the world, suspend is over
							assert.strictEqual(oBinding.bSuspended, false, "now!");
							// must not resolve until resumeInternal() is over
							assert.strictEqual(oResumePromise.isPending(), true);
						});

					// code under test
					fnCallback();

					assert.strictEqual(oResumePromise.isPending(), false);
					assert.strictEqual(oResumePromise.getResult(), undefined);
					assert.strictEqual(oBinding.oResumePromise, undefined, "cleaned up");
				});
			});

		// code under test
		oBinding._resume(true);

		return oPromise.then(function () {
			oBindingMock.expects("isRoot").withExactArgs().returns(true);

			assert.throws(function () {
				// code under test
				oBinding._resume(true);
			}, new Error("Cannot resume a not suspended binding: ~"));
		});
	});

	//*********************************************************************************************
	QUnit.test("_resume: root binding (synchronous)", function (assert) {
		var oBinding = new ODataParentBinding({
				_fireChange : function () {},
				oModel : {addPrerenderingTask : function () {}},
				resumeInternal : function () {},
				toString : function () { return "~"; }
			}),
			oBindingMock = this.mock(oBinding),
			fnResolve,
			oResumePromise = new SyncPromise(function (resolve, reject) {
				fnResolve = resolve;
			});

		oBinding.bSuspended = true;
		oBinding.oResumePromise = oResumePromise;
		oBinding.oResumePromise.$resolve = fnResolve;
		oBindingMock.expects("isRoot").withExactArgs().returns(true);
		oBindingMock.expects("resumeInternal").never();
		oBindingMock.expects("getGroupId").withExactArgs().returns("groupId");
		oBindingMock.expects("createReadGroupLock").withExactArgs("groupId", true);
		oBindingMock.expects("resumeInternal").withExactArgs(true)
			.callsFake(function () {
				// before we fire events to the world, suspend is over
				assert.strictEqual(oBinding.bSuspended, false, "now!");
				// must not resolve until resumeInternal() is over
				assert.strictEqual(oResumePromise.isPending(), true);
			});

		// code under test
		oBinding._resume(false);

		assert.strictEqual(oResumePromise.isPending(), false);
		assert.strictEqual(oResumePromise.getResult(), undefined);
		assert.strictEqual(oBinding.oResumePromise, undefined, "cleaned up");

		assert.throws(function () {
			oBindingMock.expects("isRoot").withExactArgs().returns(true);

			// code under test
			oBinding._resume(false);
		}, new Error("Cannot resume a not suspended binding: ~"));
	});

	//*********************************************************************************************
	QUnit.test("_resume: error on operation binding", function (assert) {
		var oBinding = new ODataParentBinding({
				oOperation : {},
				toString : function () { return "~"; }
			});

		assert.throws(function () {
			// code under test
			oBinding._resume();
		}, new Error("Cannot resume an operation binding: ~"));
	});

	//*********************************************************************************************
	QUnit.test("_resume: error on non-root binding", function (assert) {
		var oBinding = new ODataParentBinding({
				toString : function () { return "~"; }
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);

		assert.throws(function () {
			// code under test
			oBinding._resume();
		}, new Error("Cannot resume a relative binding: ~"));
	});

	//*********************************************************************************************
	QUnit.test("_resume: async, destroyed in the meantime", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {addPrerenderingTask : function () {}},
				toString : function () { return "~"; }
			}),
			oPromise;

		oBinding.bSuspended = true;
		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("groupId", true, 1);
		this.mock(oBinding.oModel).expects("addPrerenderingTask")
			.withExactArgs(sinon.match.func)
			.callsFake(function (fnCallback) {
				// simulate async nature of prerendering task
				oPromise = Promise.resolve().then(function () {
					// code under test
					fnCallback();

					assert.strictEqual(oBinding.bSuspended, false);
					assert.strictEqual(oBinding.oResumePromise, undefined, "cleaned up");
				});
			});

		oBinding._resume(true);
		oBinding.destroy();

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("resume", function (assert) {
		var oBinding = new ODataParentBinding();

		this.mock(oBinding).expects("_resume").withExactArgs(false);

		// code under test
		assert.strictEqual(oBinding.resume(), undefined);

	});

	//*********************************************************************************************
	QUnit.test("resumeAsync: ", function (assert) {
		var oBinding = new ODataParentBinding(),
			oError = new Error(),
			fnReject,
			oResult;

		oBinding.oResumePromise = new SyncPromise(function (resolve, reject) {
			fnReject = reject;
		});
		this.mock(oBinding).expects("_resume").withExactArgs(true);

		// code under test
		oResult = oBinding.resumeAsync();

		assert.ok(oResult instanceof Promise);

		fnReject(oError);

		return oResult.then(function() {
				assert.notOk(true);
			}, function(oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	[false, undefined].forEach(function (bLocked) {
		QUnit.test("createReadGroupLock: bLocked=" + bLocked, function (assert) {
			var oBinding = new ODataParentBinding({
					oModel : {
						addPrerenderingTask : function () {},
						lockGroup : function () {}
					}
				}),
				oBindingMock = this.mock(oBinding),
				oGroupLock1 = {},
				oGroupLock2 = {};

			oBindingMock.expects("lockGroup").withExactArgs("groupId", bLocked)
				.returns(oGroupLock1);
			this.mock(oBinding.oModel).expects("addPrerenderingTask").never();

			// code under test
			oBinding.createReadGroupLock("groupId", bLocked);

			assert.strictEqual(oBinding.oReadGroupLock, oGroupLock1);

			oBindingMock.expects("removeReadGroupLock").withExactArgs();
			oBindingMock.expects("lockGroup").withExactArgs("groupId", bLocked)
				.returns(oGroupLock2);

			// code under test
			oBinding.createReadGroupLock("groupId", bLocked);

			assert.strictEqual(oBinding.oReadGroupLock, oGroupLock2);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bLockIsUsedAndRemoved) {
		var sTitle = "createReadGroupLock: bLocked=true, bLockIsUsedAndRemoved="
				+ bLockIsUsedAndRemoved;

		QUnit.test(sTitle, function (assert) {
			var oBinding = new ODataParentBinding({
					oModel : {addPrerenderingTask : function () {}},
					sPath : "/SalesOrderList('42')"
				}),
				iCount = bLockIsUsedAndRemoved ? 1 : undefined,
				oExpectation,
				oGroupLock = {
					toString: function () { return "~groupLock~"; },
					unlock : function () {}
				},
				oModelMock = this.mock(oBinding.oModel),
				oPromiseMock = this.mock(Promise),
				oThenable1 = {then : function () {}},
				oThenable2 = {then : function () {}};

			this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true)
				.returns(oGroupLock);
			// first prerendering task
			oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func).callsArg(0);
			// second prerendering task
			oPromiseMock.expects("resolve").withExactArgs().returns(oThenable1);
			this.mock(oThenable1).expects("then").withExactArgs(sinon.match.func).callsArg(0);
			if (iCount) {
				oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func)
					.callsArg(0);
				// third prerendering task
				oPromiseMock.expects("resolve").withExactArgs().returns(oThenable2);
				this.mock(oThenable2).expects("then").withExactArgs(sinon.match.func).callsArg(0);
			}
			oExpectation = oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func);

			// code under test
			oBinding.createReadGroupLock("groupId", true, iCount);

			assert.strictEqual(oBinding.oReadGroupLock, oGroupLock);

			if (bLockIsUsedAndRemoved) {
				// simulate functions that use and remove that lock (like getContexts or fetchValue)
				oBinding.oReadGroupLock = undefined;
				this.mock(oGroupLock).expects("unlock").never();
			} else {
				this.oLogMock.expects("debug")
					.withExactArgs("Timeout: unlocked ~groupLock~", null, sClassName);
				this.mock(oBinding).expects("removeReadGroupLock").withExactArgs();
			}

			// code under test
			oExpectation.callArg(0);
		});
	});

	//*********************************************************************************************
	QUnit.test("createReadGroupLock: lock re-created", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {
					addPrerenderingTask : function () {},
					lockGroup : function () {}
				}
			}),
			oExpectation,
			oGroupLock1 = {},
			oGroupLock2 = {},
			oModelMock = this.mock(oBinding.oModel),
			oPromiseMock = this.mock(Promise),
			oThenable1 = {then : function () {}};

		this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true)
			.returns(oGroupLock1);

		// first prerendering task
		oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func).callsArg(0);
		// second prerendering task
		oPromiseMock.expects("resolve").withExactArgs().returns(oThenable1);
		this.mock(oThenable1).expects("then").withExactArgs(sinon.match.func).callsArg(0);
		oExpectation = oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func);

		// code under test
		oBinding.createReadGroupLock("groupId", true);

		oBinding.oReadGroupLock = oGroupLock2;

		// code under test - the lock must not be removed because it is a different one now
		oExpectation.callArg(0);

		assert.strictEqual(oBinding.oReadGroupLock, oGroupLock2);
	});

	//*********************************************************************************************
	QUnit.test("removeReadGroupLock", function (assert) {
		var oBinding = new ODataParentBinding(),
			oGroupLock = {unlock : function () {}};

		oBinding.oReadGroupLock = oGroupLock;
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);

		// code under test
		oBinding.removeReadGroupLock();

		assert.strictEqual(oBinding.oReadGroupLock, undefined);

		// code under test
		oBinding.removeReadGroupLock();
	});

	//*********************************************************************************************
	QUnit.test("isPatchWithoutSideEffects: set locally", function (assert) {
		var oBinding = new ODataParentBinding({
				mParameters : {$$patchWithoutSideEffects : true}
			});

		// code under test
		assert.strictEqual(oBinding.isPatchWithoutSideEffects(), true);
	});

	//*********************************************************************************************
	QUnit.test("isPatchWithoutSideEffects: unset, root", function (assert) {
		var oBinding = new ODataParentBinding({mParameters : {}});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oBinding.isPatchWithoutSideEffects(), false);
	});

	//*********************************************************************************************
	QUnit.test("isPatchWithoutSideEffects: unresolved", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : null,
				mParameters : {}
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);

		// code under test
		assert.notOk(oBinding.isPatchWithoutSideEffects());
	});

	//*********************************************************************************************
	QUnit.test("isPatchWithoutSideEffects: inherited", function (assert) {
		var oParentBinding = new ODataParentBinding(),
			oContext = {
				getBinding : function () { return oParentBinding; }
			},
			oBinding = new ODataParentBinding({
				oContext : oContext,
				mParameters : {}
			}),
			bResult = {/*false or true*/};

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);
		this.mock(oParentBinding).expects("isPatchWithoutSideEffects").withExactArgs()
			.returns(bResult);

		// code under test
		assert.strictEqual(oBinding.isPatchWithoutSideEffects(), bResult);
	});

	//*********************************************************************************************
	QUnit.test("attachPatchCompleted/detachPatchCompleted", function (assert) {
		var oBinding = new ODataParentBinding({
				attachEvent : function () {},
				detachEvent : function () {}
			}),
			oBindingMock = this.mock(oBinding),
			fnFunction = {},
			oListener = {};

		oBindingMock.expects("attachEvent")
			.withExactArgs("patchCompleted", sinon.match.same(fnFunction),
				sinon.match.same(oListener));

		// code under test
		oBinding.attachPatchCompleted(fnFunction, oListener);

		oBindingMock.expects("detachEvent")
			.withExactArgs("patchCompleted", sinon.match.same(fnFunction),
				sinon.match.same(oListener));

		// code under test
		oBinding.detachPatchCompleted(fnFunction, oListener);
	});

	//*********************************************************************************************
	QUnit.test("attachPatchSent/detachPatchSent", function (assert) {
		var oBinding = new ODataParentBinding({
				attachEvent : function () {},
				detachEvent : function () {}
			}),
			oBindingMock = this.mock(oBinding),
			fnFunction = {},
			oListener = {};

		oBindingMock.expects("attachEvent")
			.withExactArgs("patchSent", sinon.match.same(fnFunction), sinon.match.same(oListener));

		// code under test
		oBinding.attachPatchSent(fnFunction, oListener);

		oBindingMock.expects("detachEvent")
			.withExactArgs("patchSent", sinon.match.same(fnFunction), sinon.match.same(oListener));

		// code under test
		oBinding.detachPatchSent(fnFunction, oListener);
	});

	//*********************************************************************************************
	QUnit.test("firePatchSent/firePatchCompleted", function (assert) {
		var oBinding = new ODataParentBinding({
				fireEvent : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fireEvent").withExactArgs("patchSent");

		// code under test
		oBinding.firePatchSent();

		// if there is a sequence of firePatchSent calls, the event is fired only for the first call
		// code under test
		oBinding.firePatchSent();

		// code under test
		oBinding.firePatchSent();

		// firePatchCompleted triggers a patchCompleted event only if firePatchCompleted is called
		// as often as firePatchSent
		// code under test
		oBinding.firePatchCompleted(true);

		// code under test
		oBinding.firePatchCompleted(true);

		oBindingMock.expects("fireEvent").withExactArgs("patchCompleted", {success : true});

		// code under test
		oBinding.firePatchCompleted(true);

		// code under test
		assert.throws(function () {
			oBinding.firePatchCompleted();
		}, new Error("Completed more PATCH requests than sent"));

		oBindingMock.expects("fireEvent").withExactArgs("patchSent");

		// code under test
		oBinding.firePatchSent();

		// code under test
		oBinding.firePatchSent();

		// if at least one PATCH failed patchCompleted event is fired with success = false
		// code under test
		oBinding.firePatchCompleted(false);

		oBindingMock.expects("fireEvent").withExactArgs("patchCompleted", {success : false});

		// code under test
		oBinding.firePatchCompleted(true);

		oBindingMock.expects("fireEvent").withExactArgs("patchSent");

		// code under test - bPatchSuccess is reset after patchCompleted event is fired
		oBinding.firePatchSent();

		oBindingMock.expects("fireEvent").withExactArgs("patchCompleted", {success : true});

		// code under test - bPatchSuccess is reset after patchCompleted event is fired
		oBinding.firePatchCompleted(true);
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oBinding = new ODataParentBinding();

		oBinding.aChildCanUseCachePromises = [{}, {}];
		oBinding.oResumePromise = {};
		this.mock(oBinding).expects("removeReadGroupLock").withExactArgs();
		this.mock(asODataBinding.prototype).expects("destroy").on(oBinding).withExactArgs();

		// code under test
		oBinding.destroy();

		//TODO does not work with SalesOrdersRTATest
//		assert.deepEqual(oBinding.mAggregatedQueryOptions, undefined);
		assert.deepEqual(oBinding.aChildCanUseCachePromises, []);
		assert.strictEqual(oBinding.oResumePromise, undefined);
	});

	//*********************************************************************************************
	QUnit.test("refreshDependentBindings", function (assert) {
		var oBinding = new ODataParentBinding({oContext : {/* sap.ui.model.Context */}}),
			bCheckUpdate = {},
			aDependentBindings = [{
				refreshInternal : function () {}
			}, {
				refreshInternal : function () {}
			}],
			bDependent0Refreshed = false,
			oDependent0Promise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependent0Refreshed = true;
					resolve();
				});
			}),
			bDependent1Refreshed = false,
			oDependent1Promise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependent1Refreshed = true;
					resolve();
				});
			}),
			bKeepCacheOnError = {},
			sResourcePathPrefix = {/*Path needed to avoid deleting all Caches*/},
			oPromise;

		this.mock(oBinding).expects("getDependentBindings").withExactArgs()
			.returns(aDependentBindings);
		this.mock(aDependentBindings[0]).expects("refreshInternal")
			.withExactArgs(sinon.match.same(sResourcePathPrefix), "group",
					sinon.match.same(bCheckUpdate), sinon.match.same(bKeepCacheOnError)
				)
			.returns(oDependent0Promise);
		this.mock(aDependentBindings[1]).expects("refreshInternal")
			.withExactArgs(sinon.match.same(sResourcePathPrefix), "group",
					sinon.match.same(bCheckUpdate), sinon.match.same(bKeepCacheOnError)
				)
			.returns(oDependent1Promise);

		// code under test
		oPromise = oBinding.refreshDependentBindings(sResourcePathPrefix, "group", bCheckUpdate,
			bKeepCacheOnError);

		assert.ok(oPromise.isPending(), "a SyncPromise");
		return oPromise.then(function () {
			assert.strictEqual(bDependent0Refreshed, true);
			assert.strictEqual(bDependent1Refreshed, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("createRefreshPromise/resolveRefreshPromise", function (assert) {
		var oBinding = new ODataParentBinding(),
			oError = new Error(),
			oErrorPromise = Promise.reject(oError),
			oRefreshPromise;

		// code under test
		oRefreshPromise = oBinding.createRefreshPromise();

		assert.strictEqual(oRefreshPromise, oBinding.oRefreshPromise);

		// code under test
		assert.strictEqual(oBinding.resolveRefreshPromise(oErrorPromise), oErrorPromise);

		assert.strictEqual(oBinding.oRefreshPromise, null);

		// code under test
		oBinding.resolveRefreshPromise(Promise.resolve({}));

		return oRefreshPromise.then(function () {
			assert.ok(false);
		}, function (oResult) {
			assert.strictEqual(oResult, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesInDependents", function (assert) {
		var oCache1 = {
				hasPendingChangesForPath : function () {}
			},
			oCache31 = {
				hasPendingChangesForPath : function () {}
			},
			oCache32 = {
				hasPendingChangesForPath : function () {}
			},
			oChild1 = new ODataParentBinding({
				oCache : oCache1
			}),
			oChild2 = new ODataParentBinding({
				oCache : null
			}),
			oChild3 = new ODataParentBinding({
				mCacheByResourcePath : {
					"/Foo/1" : oCache31,
					"/Foo/2" : oCache32
				},
				oCache : undefined
			}),
			oBinding = new ODataParentBinding({
				oContext : {},
				oModel :  {
					getDependentBindings : function () {},
					resolve : function () {},
					withUnresolvedBindings : function () {}
				},
				sPath : "path"
			}),
			oChild1CacheMock = this.mock(oCache1),
			oChild1Mock = this.mock(oChild1),
			oChild2Mock = this.mock(oChild2),
			oChild3Mock = this.mock(oChild3),
			oChild3CacheMock1 = this.mock(oCache31),
			oChild3CacheMock2 = this.mock(oCache32),
			oModelMock = this.mock(oBinding.oModel),
			bResult = {/*false,true*/};

		oModelMock.expects("withUnresolvedBindings").never();

		this.mock(oBinding).expects("getDependentBindings").exactly(8)
			.withExactArgs()
			.returns([oChild1, oChild2, oChild3]);
		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);
		oChild1Mock.expects("hasPendingChangesInDependents").never();
		oChild2Mock.expects("hasPendingChangesInDependents").never();
		oChild3Mock.expects("hasPendingChangesInDependents").never();
		oChild3CacheMock1.expects("hasPendingChangesForPath").never();
		oChild3CacheMock2.expects("hasPendingChangesForPath").never();

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
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock1.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock1.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock2.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock1.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock2.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock1.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock2.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oModelMock.expects("resolve")
			.withExactArgs("path", sinon.match.same(oBinding.oContext))
			.returns("/some/absolute/path");
		oModelMock.expects("withUnresolvedBindings")
			.withExactArgs("hasPendingChangesInCaches", "some/absolute/path")
			.returns(bResult);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), bResult);
	});

	//*********************************************************************************************
	QUnit.test("resetChangesInDependents", function (assert) {
		var oCache1 = {
				resetChangesForPath : function () {}
			},
			oCache3 = {
				resetChangesForPath : function () {}
			},
			oCache31 = {
				resetChangesForPath : function () {}
			},
			oCache32 = {
				resetChangesForPath : function () {}
			},
			oChild1 = new ODataParentBinding({
				oCachePromise : SyncPromise.resolve(Promise.resolve(oCache1))
			}),
			oChild2 = new ODataParentBinding({
				oCachePromise : SyncPromise.resolve(null)
			}),
			oChild3 = new ODataParentBinding({
				oCachePromise : SyncPromise.resolve(Promise.resolve(oCache3)),
				mCacheByResourcePath : {
					"/Foo/1" : oCache31,
					"/Foo/2" : oCache32
				}
			}),
			oBinding = new ODataParentBinding({
				getDependentBindings : function () {}
			}),
			aPromises = [];

		this.mock(oBinding).expects("getDependentBindings")
			.withExactArgs().returns([oChild1, oChild2, oChild3]);
		this.mock(oCache1).expects("resetChangesForPath").withExactArgs("");
		this.mock(oChild1).expects("resetChangesInDependents")
			.withExactArgs(sinon.match.same(aPromises))
			.callsFake(function (aPromises0) {
				aPromises0.push("foo");
			});
		this.mock(oChild1).expects("resetInvalidDataState").withExactArgs();
		this.mock(oChild2).expects("resetChangesInDependents")
			.withExactArgs(sinon.match.same(aPromises))
			.callsFake(function (aPromises0) {
				aPromises0.push("bar");
			});
		this.mock(oChild2).expects("resetInvalidDataState").withExactArgs();
		this.mock(oCache3).expects("resetChangesForPath").withExactArgs("");
		this.mock(oChild3).expects("resetChangesInDependents")
			.withExactArgs(sinon.match.same(aPromises))
			.callsFake(function (aPromises0) {
				aPromises0.push("baz");
			});
		this.mock(oChild3).expects("resetInvalidDataState").withExactArgs();
		this.mock(oCache31).expects("resetChangesForPath").withExactArgs("");
		this.mock(oCache32).expects("resetChangesForPath").withExactArgs("");

		// code under test
		oBinding.resetChangesInDependents(aPromises);

		assert.strictEqual(aPromises.length, 6);
		assert.ok(SyncPromise.isThenable(aPromises[0]));
		assert.strictEqual(aPromises[1], "foo");
		assert.strictEqual(aPromises[2], undefined);
		assert.strictEqual(aPromises[3], "bar");
		assert.ok(SyncPromise.isThenable(aPromises[4]));
		assert.strictEqual(aPromises[5], "baz");

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("resetChangesInDependents: synchronous error", function (assert) {
		var oBinding = new ODataParentBinding({
				getDependentBindings : function () {}
			}),
			oCache = {
				resetChangesForPath : function () {}
			},
			oChild = new ODataParentBinding({
				oCachePromise : SyncPromise.resolve(oCache)
			}),
			oError = new Error("Intentionally failed"),
			aPromises = [];

		this.mock(oBinding).expects("getDependentBindings").withExactArgs().returns([oChild]);
		this.mock(oCache).expects("resetChangesForPath").withExactArgs("").throws(oError);
		this.mock(oChild).expects("resetChangesInDependents").never();

		assert.throws(function () {
			// code under test
			oBinding.resetChangesInDependents(aPromises);
		}, oError);
	});

	//*********************************************************************************************
	[{
	}, {
		oContext : null,
		bPrefix : true
	}, {
		oContext : {getPath : function () {}}
	}].forEach(function (oFixture, i) {
		QUnit.test("visitSideEffects, " + i, function (assert) {
			var oBinding = new ODataParentBinding(),
				oChild0 = {
					oCache : {}, //TODO what if this is still pending?
					getPath : function () { return "foo(0)"; },
					requestSideEffects : function () {}
				},
				oChild1 = {
					oCache : {},
					getPath : function () { return "bar(1)"; }
				},
				oChild2 = {
					oCache : null, // no own cache
					getPath : function () { return "n/a/toN"; },
					visitSideEffects : function () {}
				},
				oChild3 = {
					oCache : {},
					getPath : function () { return "baz(3)"; },
					requestSideEffects : function () {}
				},
				oChild4 = {
					oCache : null, // no own cache
					getPath : function () { return "refresh(4)/toN"; },
					refreshInternal : function () {}
				},
				sGroupId = "group",
				oHelperMock = this.mock(_Helper),
				oModel = {
					getDependentBindings : function () {}
				},
				mNavigationPropertyPaths = oFixture.bPrefix
					? {"~/refresh/toN" : true}
					: {"refresh/toN" : true},
				aPaths = [],
				aPaths0 = ["A"],
				aPaths1 = [/*empty!*/],
				aPaths3 = ["A"],
				oPromise0 = {index : 0}, // give deepEqual a chance
				oPromise3 = {index : 3},
				oPromise4 = {index : 4},
				aPromises = [];

			if (oFixture.oContext) {
				oBinding.oModel = oModel;
				this.mock(oModel).expects("getDependentBindings")
					.withExactArgs(sinon.match.same(oFixture.oContext))
					.returns([oChild0, oChild1, oChild2, oChild3, oChild4]);
			} else {
				this.mock(oBinding).expects("getDependentBindings").withExactArgs()
					.returns([oChild0, oChild1, oChild2, oChild3, oChild4]);
			}
			oHelperMock.expects("stripPathPrefix")
				.withExactArgs(oFixture.bPrefix ? "~/foo" : "foo", sinon.match.same(aPaths))
				.returns(aPaths0);
			this.mock(oChild0).expects("requestSideEffects")
				.withExactArgs(sGroupId, sinon.match.same(aPaths0))
				.returns(oPromise0);
			oHelperMock.expects("stripPathPrefix")
				.withExactArgs(oFixture.bPrefix ? "~/bar" : "bar", sinon.match.same(aPaths))
				.returns(aPaths1);
			this.mock(oChild2).expects("visitSideEffects")
				.withExactArgs(sGroupId, sinon.match.same(aPaths), null,
					sinon.match.same(mNavigationPropertyPaths), sinon.match.same(aPromises),
					oFixture.bPrefix ? "~/n/a/toN" : "n/a/toN");
			oHelperMock.expects("stripPathPrefix")
				.withExactArgs(oFixture.bPrefix ? "~/baz" : "baz", sinon.match.same(aPaths))
				.returns(aPaths3);
			this.mock(oChild3).expects("requestSideEffects")
				.withExactArgs(sGroupId, sinon.match.same(aPaths3))
				.returns(oPromise3);
			this.mock(oChild4).expects("refreshInternal").withExactArgs("", sGroupId)
				.returns(oPromise4);

			// code under test
			oBinding.visitSideEffects(sGroupId, aPaths, oFixture.oContext, mNavigationPropertyPaths,
				aPromises, oFixture.bPrefix ? "~" : undefined);

			assert.deepEqual(aPromises, [oPromise0, oPromise3, oPromise4]);
		});
	});

	//*********************************************************************************************
	QUnit.test("isMeta", function (assert) {
		var oBinding = new ODataParentBinding();

		assert.strictEqual(oBinding.isMeta(), false);
	});

	//*********************************************************************************************
	QUnit.test("refreshSuspended", function (assert) {
		var oBinding = new ODataParentBinding();

		this.mock(oBinding).expects("getGroupId").never();
		this.mock(oBinding).expects("setResumeChangeReason").withExactArgs(ChangeReason.Refresh);

		// code under test
		oBinding.refreshSuspended();
	});

	//*********************************************************************************************
	QUnit.test("refreshSuspended: with group ID", function (assert) {
		var oBinding = new ODataParentBinding();

		this.mock(oBinding).expects("getGroupId").thrice().withExactArgs().returns("myGroup");
		this.mock(oBinding).expects("setResumeChangeReason").withExactArgs(ChangeReason.Refresh);

		// code under test
		oBinding.refreshSuspended("myGroup");

		assert.throws(function () {
			// code under test
			oBinding.refreshSuspended("otherGroup");
		}, new Error(oBinding + ": Cannot refresh a suspended binding with group ID 'otherGroup' "
			+ "(own group ID is 'myGroup')"));
	});

	//*********************************************************************************************
	QUnit.test("getResumePromise", function (assert) {
		var oBinding = new ODataParentBinding(),
			oResumePromise = {};

		oBinding.oResumePromise = oResumePromise;

		// code under test
		assert.strictEqual(oBinding.getResumePromise(), oResumePromise);
	});

	//*********************************************************************************************
[{path : "test"}, {path : "", context : {}}].forEach(function (oFixture, i) {
	QUnit.test("_findEmptyPathParentContext: Return element context " + i, function (assert) {
		var oBinding = new ODataParentBinding(),
			oContext;

		oBinding.sPath = oFixture.path;
		oBinding.oContext = {};
		oBinding.oElementContext = {};
		oContext = oFixture.context || oBinding.oElementContext;

		// code under test
		assert.strictEqual(oBinding._findEmptyPathParentContext(oContext), oContext);
	});
});

	//*********************************************************************************************
	QUnit.test("_findEmptyPathParentContext: Delegate to parent", function (assert) {
		var oBinding = new ODataParentBinding(),
			oContext = {},
			oParentBinding = {
				_findEmptyPathParentContext : function (oMyContext) {
					assert.strictEqual(oMyContext, oContext);
					return oContext;
				}
			};

		oContext.getBinding = function () { return oParentBinding; };
		oBinding.sPath = "";
		oBinding.oContext = oContext;

		// code under test
		assert.strictEqual(oBinding._findEmptyPathParentContext(oBinding.oElementContext),
			oContext);
	});

	//*********************************************************************************************
	QUnit.test("getBaseForPathReduction: root binding", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {},
				oModel : {resolve : function () {}},
				sPath : "quasi/absolute"
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
			.returns("/resolved/path");

		// code under test
		assert.strictEqual(oBinding.getBaseForPathReduction(), "/resolved/path");
	});

	//*********************************************************************************************
[
	{parentGroup : "groupId", delegate : true},
	{parentGroup : "otherGroupId", submitMode : SubmitMode.API, delegate : false},
	{parentGroup : "otherGroupId", submitMode : SubmitMode.Auto, delegate : true},
	{parentGroup : "otherGroupId", submitMode : SubmitMode.Direct, delegate : true}
].forEach(function (oFixture) {
	QUnit.test("getBaseForPathReduction: delegate to parent binding: " + JSON.stringify(oFixture),
			function (assert) {
		var oModel = {
				getGroupProperty : function () {},
				resolve : function () {}
			},
			oParentBinding = new ODataParentBinding({oModel : oModel}),
			oContext = {
				getBinding : function () {
					return oParentBinding;
				}
			},
			oBinding = new ODataParentBinding({
				oContext : oContext,
				oModel : oModel,
				sPath : "relative"
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("groupId");
		this.mock(oParentBinding).expects("getUpdateGroupId")
			.withExactArgs().returns(oFixture.parentGroup);
		this.mock(oParentBinding).expects("getBaseForPathReduction")
			.exactly(oFixture.delegate ? 1 : 0)
			.withExactArgs()
			.returns("/base/path");
		this.mock(oModel).expects("getGroupProperty").atLeast(0)
			.withExactArgs(oFixture.parentGroup, "submit")
			.returns(oFixture.submitMode);
		this.mock(oBinding.oModel).expects("resolve").exactly(oFixture.delegate ? 0 : 1)
			.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
			.returns("/resolved/path");

		// code under test
		assert.strictEqual(oBinding.getBaseForPathReduction(),
			oFixture.delegate ? "/base/path" : "/resolved/path");
	});
});

	//*********************************************************************************************
	QUnit.test("fetchResolvedQueryOptions: no autoExpandSelect", function (assert) {
		var oBinding = new ODataParentBinding({
				getQueryOptionsFromParameters : function () {},
				oModel : {
					bAutoExpandSelect : false
				}
			}),
			oPromise,
			mQueryOptions = {$select : ["foo"]};

		this.mock(oBinding).expects("getQueryOptionsFromParameters").withExactArgs()
			.returns(mQueryOptions);

		// code under test
		oPromise = oBinding.fetchResolvedQueryOptions();

		assert.strictEqual(oPromise.getResult(), mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("fetchResolvedQueryOptions: no $select", function (assert) {
		var oBinding = new ODataParentBinding({
				getQueryOptionsFromParameters : function () {},
				oModel : {
					bAutoExpandSelect : true
				}
			}),
			oPromise,
			mQueryOptions = {};

		this.mock(oBinding).expects("getQueryOptionsFromParameters").withExactArgs()
			.returns(mQueryOptions);

		// code under test
		oPromise = oBinding.fetchResolvedQueryOptions();

		assert.strictEqual(oPromise.getResult(), mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("fetchResolvedQueryOptions: autoExpandSelect", function (assert) {
		var oBinding = new ODataParentBinding({
				getQueryOptionsFromParameters : function () {},
				oModel : {
					bAutoExpandSelect : true,
					oInterface : {
						fetchMetadata : "fnFetchMetadata"
					},
					resolve : function () {}
				},
				sPath : "/path"
			}),
			oContext = {},
			oHelperMock = this.mock(_Helper),
			bProcessedBar = false,
			bProcessedFoo = false,
			bProcessedQualifiedName = false,
			oPromise,
			mQueryOptionsFromParameters = {
				$select : ["foo", "bar", "qualified.Name"],
				$expand : {}
			},
			mQueryOptionsAsString = JSON.stringify(mQueryOptionsFromParameters),
			mResolvedQueryOptions = {};

		this.mock(oBinding).expects("getQueryOptionsFromParameters").withExactArgs()
			.returns(mQueryOptionsFromParameters);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
			.returns("/resolved/path");
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/resolved/path")
			.returns("/meta/path");
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(mQueryOptionsFromParameters), {$select : []})
			.returns(mResolvedQueryOptions);
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs("fnFetchMetadata", "/meta/path/foo")
			.returns(Promise.resolve().then(function () {
				var mChildQueryOptions = {};

				oHelperMock.expects("wrapChildQueryOptions")
					.withExactArgs("/meta/path", "foo", {}, "fnFetchMetadata")
					.returns(mChildQueryOptions);
				oHelperMock.expects("aggregateQueryOptions")
					.withExactArgs(sinon.match.same(mResolvedQueryOptions),
						sinon.match.same(mChildQueryOptions))
					.callsFake(function () {
						bProcessedFoo = true;
					});
			}));
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs("fnFetchMetadata", "/meta/path/bar")
			.returns(Promise.resolve().then(function () {
				var mChildQueryOptions = {};

				oHelperMock.expects("wrapChildQueryOptions")
					.withExactArgs("/meta/path", "bar", {}, "fnFetchMetadata")
					.returns(mChildQueryOptions);
				oHelperMock.expects("aggregateQueryOptions")
					.withExactArgs(sinon.match.same(mResolvedQueryOptions),
						sinon.match.same(mChildQueryOptions))
					.callsFake(function () {
						bProcessedBar = true;
					});
			}));
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs("fnFetchMetadata", "/meta/path/qualified.Name")
			.returns(Promise.resolve().then(function () {
				oHelperMock.expects("wrapChildQueryOptions")
					.withExactArgs("/meta/path", "qualified.Name", {},
						"fnFetchMetadata")
					.returns(undefined);
				oHelperMock.expects("addToSelect")
					.withExactArgs(sinon.match.same(mResolvedQueryOptions), ["qualified.Name"])
					.callsFake(function () {
						bProcessedQualifiedName = true;
					});
			}));

		// code under test
		oPromise = oBinding.fetchResolvedQueryOptions(oContext);

		assert.strictEqual(oPromise.isPending(), true);

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, mResolvedQueryOptions);
			assert.strictEqual(bProcessedBar, true);
			assert.strictEqual(bProcessedFoo, true);
			assert.strictEqual(bProcessedQualifiedName, true);
			assert.strictEqual(JSON.stringify(mQueryOptionsFromParameters), mQueryOptionsAsString,
				"original query options unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("allow for super calls", function (assert) {
		var oBinding = new ODataParentBinding();

		assert.strictEqual(asODataParentBinding.prototype.doDeregisterChangeListener,
			oBinding.doDeregisterChangeListener);
		assert.strictEqual(asODataParentBinding.prototype.destroy, oBinding.destroy);
		assert.strictEqual(asODataParentBinding.prototype.fetchCache, oBinding.fetchCache);
		assert.strictEqual(asODataParentBinding.prototype.hasPendingChangesForPath,
			oBinding.hasPendingChangesForPath);
	});

	//*********************************************************************************************
	QUnit.test("getCacheQueryOptions: own mCacheQueryOptions", function (assert) {
		var oBinding = new ODataParentBinding({
				mCacheQueryOptions : {}
			});

		assert.strictEqual(
			// code under test
			oBinding.getCacheQueryOptions(),
			oBinding.mCacheQueryOptions
		);
	});

	//*********************************************************************************************
	QUnit.test("getCacheQueryOptions: mCacheQueryOptions from parent", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {
					getBinding : function() {}
				},
				sPath : "~path~"
			}),
			mCacheQueryOptions = {},
			mCacheQueryOptionsForPath = {},
			oParentBinding = new ODataParentBinding();

		this.mock(oBinding.oContext).expects("getBinding").withExactArgs().returns(oParentBinding);
		this.mock(oParentBinding).expects("getCacheQueryOptions").withExactArgs()
			.returns(mCacheQueryOptions);
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(mCacheQueryOptions), "~path~")
			.returns(mCacheQueryOptionsForPath);

		assert.strictEqual(
			// code under test
			oBinding.getCacheQueryOptions(),
			mCacheQueryOptionsForPath
		);
	});

	//*********************************************************************************************
	QUnit.test("refreshDependentListBindingsWithoutCache", function (assert) {
		var oBinding = new ODataParentBinding(),
			oDependent1 = {
				oCache : null,
				filter : {},
				refreshDependentListBindingsWithoutCache : function () {},
				refreshInternal : function () {}
			},
			oDependent2 = {},
			oDependent3 = {
				filter : {},
				refreshDependentListBindingsWithoutCache : function () {}
			},
			oPromise;

		this.mock(oBinding).expects("getDependentBindings").withExactArgs()
			.returns([oDependent1, oDependent2, oDependent3]);
		this.mock(oDependent1).expects("refreshInternal").withExactArgs("").resolves("~1");
		this.mock(oDependent1).expects("refreshDependentListBindingsWithoutCache").never();
		this.mock(oDependent3).expects("refreshDependentListBindingsWithoutCache").withExactArgs()
			.resolves("~2");

		// code under test
		oPromise = oBinding.refreshDependentListBindingsWithoutCache().then(function (aResults) {
			assert.deepEqual(aResults, ["~1", undefined, "~2"]);
		});

		assert.notOk(oPromise.isFulfilled());

		return oPromise;
	});
});
//TODO Fix issue with ODataModel.integration.qunit
//  "suspend/resume: list binding with nested context binding, only context binding is adapted"
//TODO ODLB#resumeInternal: checkUpdate on dependent bindings of header context after change
//  event (see ODLB#reset)
//TODO check: resumeInternal has no effect for operations
//TODO check/update jsdoc change-event for ODParentBinding#resume
//TODO error handling for write APIs, refresh
//   (change only in resume is probably not sufficient)
//TODO Performance: Compare previous aggregated query options with current state and
// do not recreate cache if there is no diff (e.g no UI change applied, UI change
// does not affect current $expand/$select)