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
	"sap/ui/model/odata/v4/ODataParentBinding",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, SyncPromise, Binding, ChangeReason, Context, asODataBinding, asODataParentBinding,
	_Helper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataParentBinding";

	function mustBeMocked() { throw new Error("Must be mocked"); }

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
			getResolvedPath : function () {}, // @see sap.ui.model.Binding#getResolvedPath
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
			fnBindingSpy = this.spy(asODataBinding, "call");

		asODataParentBinding.call(oBinding);

		assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
		assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, true);
		assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {});
		assert.deepEqual(oBinding.aChildCanUseCachePromises, []);
		assert.strictEqual(oBinding.bHasPathReductionToParent, false);
		assert.strictEqual(oBinding.iPatchCounter, 0);
		assert.strictEqual(oBinding.bPatchSuccess, true);
		assert.ok("oReadGroupLock" in oBinding);
		assert.strictEqual(oBinding.oReadGroupLock, undefined);
		assert.strictEqual(oBinding.oRefreshPromise, null);
		assert.ok("oResumePromise" in oBinding);
		assert.strictEqual(oBinding.oResumePromise, undefined);
		assert.ok(fnBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
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
		aChangedParameters : ["$search"],
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
		aChangedParameters : ["$orderby"],
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
		aChangedParameters : ["$expand"],
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
		aChangedParameters : ["$filter"],
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
		aChangedParameters : ["$filter", "$orderby"],
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
		aChangedParameters : ["$apply", "$expand", "$count", "$select"],
		mExpectedParameters : {
			$apply : "filter(NEW gt 0)",
			$count : true,
			$expand : {$search : "Foo NOT Bar"},
			$filter : "OLD gt 1"
		}
	}].forEach(function (oFixture) {
		QUnit.test("changeParameters: " + oFixture.sTestName, function () {
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

			this.mock(oBinding).expects("checkTransient").withExactArgs();
			this.mock(oBinding).expects("isUnchangedParameter").never();
			this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(false);
			this.mock(oBinding).expects("applyParameters").withExactArgs(
				oFixture.mExpectedParameters, oFixture.sChangeReason || ChangeReason.Change,
				oFixture.aChangedParameters);

			// code under test
			oBinding.changeParameters(oFixture.mParameters);
		});
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with undefined map", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		this.mock(oBinding).expects("isUnchangedParameter").never();
		this.mock(oBinding).expects("hasPendingChanges").never();

		// code under test
		assert.throws(function () {
			oBinding.changeParameters(undefined);
		}, new Error("Missing map of binding parameters"));
		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with binding-specific parameters", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		this.mock(oBinding).expects("isUnchangedParameter").withExactArgs("$$groupId", "newGroupId")
			.returns(false);
		this.mock(oBinding).expects("hasPendingChanges").never();

		//code under test
		assert.throws(function () {
			oBinding.changeParameters({
				$filter : "Amount gt 3",
				$$groupId : "newGroupId"
			});
		}, new Error("Unsupported parameter: $$groupId"));
		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: ignore unchanged binding-specific parameters", function () {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {$$ownRequest : true},
				sPath : "/ProductList",
				applyParameters : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("isUnchangedParameter").withExactArgs("$$ownRequest", true)
			.returns(true);
		oBindingMock.expects("isUnchangedParameter").withExactArgs("$$sharedRequest", undefined)
			.returns(true);
		oBindingMock.expects("hasPendingChanges").withExactArgs(true).returns(false);
		oBindingMock.expects("applyParameters")
			.withExactArgs({$$ownRequest : true, $count : true}, ChangeReason.Change, ["$count"]);

		// code under test
		oBinding.changeParameters({
			$$ownRequest : true,
			$$sharedRequest : undefined,
			$count : true
		});
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with pending changes", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		this.mock(oBinding).expects("isUnchangedParameter").never();
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(true);

		assert.throws(function () {
			// code under test
			oBinding.changeParameters({$filter : "Amount gt 3"});
		}, new Error("Cannot change parameters due to pending changes"));
		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged on error");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: with empty map", function () {
		var oBinding = new ODataParentBinding({
				oModel : {},
				sPath : "/EMPLOYEES"
			});

		this.mock(oBinding).expects("isUnchangedParameter").never();
		this.mock(oBinding).expects("hasPendingChanges").never();

		// code under test
		oBinding.changeParameters({});
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: try to delete non-existing parameters", function (assert) {
		var oBinding = new ODataParentBinding({
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		this.mock(oBinding).expects("isUnchangedParameter").never();
		// refreshing the binding is unnecessary, if the binding parameters are unchanged
		this.mock(oBinding).expects("hasPendingChanges").never();

		// code under test
		oBinding.changeParameters({$apply : undefined});

		assert.deepEqual(oBinding.mParameters, {}, "parameters unchanged");
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: no change to existing parameter", function () {
		var oBinding = new ODataParentBinding({
					oModel : {},
					mParameters : {
						$apply : "filter(Amount gt 3)"
					},
					sPath : "/EMPLOYEES"
				});

		this.mock(oBinding).expects("isUnchangedParameter").never();
		this.mock(oBinding).expects("hasPendingChanges").never();

		// code under test
		oBinding.changeParameters({$apply : "filter(Amount gt 3)"});
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

		this.mock(oBinding).expects("isUnchangedParameter").never();
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(false);
		this.mock(oBinding).expects("applyParameters")
			.withExactArgs({$expand : {SO_2_SOITEM : {$orderby : "ItemPosition"}}},
				ChangeReason.Change, ["$expand"])
			.callThrough();

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
		name : "$select",
		parameters : {$select : ["bar"]}
	}, {
		name : "$expand",
		parameters : {$expand : "foo"}
	}, {
		name : "$expand",
		parameters : {$expand : {foo : {}}}
	}, {
		name : "$expand",
		parameters : {$expand : {bar : {}}}
	}].forEach(function (oFixture, i) {
		QUnit.test("changeParameters: auto-$expand/$select, " + i, function (assert) {
			var oBinding = new ODataParentBinding({
					oModel : {
						bAutoExpandSelect : true
					},
					mParameters : {
						$expand : {bar : {}},
						$select : "bar"
					},
					applyParameters : function () {}
				}),
				sParametersAsJSON = JSON.stringify(oBinding.mParameters);

			this.mock(oBinding).expects("isUnchangedParameter").never();
			this.mock(oBinding).expects("hasPendingChanges").never();
			this.mock(oBinding).expects("applyParameters").never();

			// code under test
			assert.throws(function () {
				oBinding.changeParameters(oFixture.parameters);
			}, new Error("Cannot change " + oFixture.name
				+ " parameter in auto-$expand/$select mode: "
				+ JSON.stringify(oFixture.parameters[oFixture.name]) + " !== "
				+ (oFixture.name === "$select" ? '"bar"' : '{"bar":{}}'))
			);

			assert.strictEqual(JSON.stringify(oBinding.mParameters), sParametersAsJSON,
				"parameters unchanged on error");
		});
	});

	//*********************************************************************************************
	QUnit.test("changeParameters: ignore unchanged $expand/$select strings(!)", function () {
		var oBinding = new ODataParentBinding({
				oModel : {bAutoExpandSelect : true},
				mParameters : {
					$$ownRequest : true,
					$expand : "oldExpand",
					$select : "oldSelect"
				},
				sPath : "/ProductList",
				applyParameters : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("isUnchangedParameter").withExactArgs("$$ownRequest", true)
			.returns(true);
		oBindingMock.expects("isUnchangedParameter").withExactArgs("$$sharedRequest", undefined)
			.returns(true);
		oBindingMock.expects("hasPendingChanges").withExactArgs(true).returns(false);
		oBindingMock.expects("applyParameters")
			.withExactArgs({
				$$ownRequest : true,
				$count : true,
				$expand : "oldExpand",
				$select : "oldSelect"
			}, ChangeReason.Change, ["$count"]);

		// code under test
		oBinding.changeParameters({
			$$ownRequest : true,
			$$sharedRequest : undefined,
			$count : true,
			$expand : "oldExpand",
			$select : "oldSelect"
		});
	});

	//*********************************************************************************************
	QUnit.test("isUnchangedParameter", function (assert) {
		var oBinding = new ODataParentBinding({
				mParameters : {
					$$ownRequest : true
				}
			});

		assert.strictEqual(oBinding.isUnchangedParameter("$$ownRequest", true), true);
		assert.strictEqual(oBinding.isUnchangedParameter("$$ownRequest", 42), false);
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
		aggregatedQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$orderby : "~orderby~",
					$select : ["Team_Id", "Name"]
				}
			}
		},
		childQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$select : ["Team_Id", "MEMBER_COUNT"]
				}
			}
		},
		expectedQueryOptions : {
			$expand : {
				EMPLOYEE_2_TEAM : {
					$orderby : "~orderby~",
					$select : ["Team_Id", "Name", "MEMBER_COUNT"]
				}
			}
		},
		bIsProperty : true
	}, {
		aggregatedQueryOptions : {$select : ["Team_Id"]},
		childQueryOptions : {$select : ["*"]},
		expectedQueryOptions : {$select : ["Team_Id", "*"]}
	}, {
		aggregatedQueryOptions : {$select : ["*"]},
		childQueryOptions : {$select : ["Team_Id"]},
		expectedQueryOptions : {$select : ["*", "Team_Id"]}
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
				"/base/metapath", false, oFixture.bIsProperty);

			assert.deepEqual(oBinding.mAggregatedQueryOptions, oFixture.expectedQueryOptions);
			assert.strictEqual(bMergeSuccess, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("aggregateQueryOptions: merge mLateQueryOptions, do not embed", function (assert) {
		var oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {$search : "covfefe"},
				mLateQueryOptions : {$select : ["late"]}
			}),
			mChildQueryOptions = {
				$count : true,
				$filter : "baz eq 42",
				$select : ["bar"]
			};

		// code under test
		assert.ok(oBinding.aggregateQueryOptions({$expand : {foo : mChildQueryOptions}}));

		assert.deepEqual(oBinding.mAggregatedQueryOptions, {
			$expand : {foo : mChildQueryOptions},
			$search : "covfefe"
		});
		assert.deepEqual(oBinding.mLateQueryOptions, {
			$expand : {foo : mChildQueryOptions},
			$select : ["late"]
		});
		assert.notStrictEqual(oBinding.mAggregatedQueryOptions.$expand.foo, mChildQueryOptions);
		assert.notStrictEqual(oBinding.mAggregatedQueryOptions.$expand.foo.$select,
			mChildQueryOptions.$select, "do not embed child query options");
	});

	//*********************************************************************************************
	[{ // conflict: parent has $orderby, but child has different $orderby value
		aggregatedQueryOptions : {$orderby : "Category"},
		childQueryOptions : {$orderby : "Category desc"}
	}, { // aggregated query options remain unchanged on conflict ($select is not added)
		aggregatedQueryOptions : {$orderby : "Category"},
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
					mAggregatedQueryOptions : oFixture.aggregatedQueryOptions,
					mLateQueryOptions : {ignore : "me"} // must be ignored for mutable caches
				}),
				mOriginalQueryOptions = _Helper.clone(oFixture.aggregatedQueryOptions),
				bMergeSuccess;

			// code under test
			bMergeSuccess = oBinding.aggregateQueryOptions(oFixture.childQueryOptions,
				"/base/metapath", false);

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
							doFetchOrGetQueryOptions : function () {},
							oModel : {
								getMetaModel : function () { return oMetaModel; },
								oInterface : {
									fetchMetadata : fnFetchMetadata
								},
								resolve : function () {}
							},
							mParameters : {},
							sPath : "path"
						}),
						oBindingMock = this.mock(oBinding),
						mChildQueryOptions = oFixture.hasChildQueryOptions ? {} : undefined,
						mClonedQueryOptions = {},
						oContext = Context.create(this.oModel, oBinding, "/Set('2')"),
						oHelperMock = this.mock(_Helper),
						mLocalQueryOptions = {},
						oModelMock = this.mock(oBinding.oModel),
						oPromise;

					oModelMock.expects("resolve")
						.withExactArgs("childPath", sinon.match.same(oContext))
						.returns("/resolved/child/path");
					oHelperMock.expects("getMetaPath").withExactArgs("/Set('2')").returns("/Set");
					oHelperMock.expects("getMetaPath").withExactArgs("/resolved/child/path")
						.returns("/resolved/child/metaPath");
					oBindingMock.expects("doFetchOrGetQueryOptions")
						.withExactArgs(sinon.match.same(oBinding.oContext))
						.returns(SyncPromise.resolve(mLocalQueryOptions));
					oHelperMock.expects("fetchPropertyAndType")
						.withExactArgs(sinon.match.same(fnFetchMetadata),
							"/resolved/child/metaPath")
						.returns(Promise.resolve().then(function () {
							oBindingMock.expects("selectKeyProperties")
								.exactly(oFixture.initial ? 1 : 0)
								.withExactArgs(sinon.match.same(mClonedQueryOptions), "/Set");
							return {$kind : oFixture.$kind};
						}));
					oBindingMock.expects("getBaseForPathReduction")
						.withExactArgs().returns("/base/path");
					this.mock(oMetaModel).expects("getReducedPath")
						.withExactArgs("/resolved/child/path", "/base/path")
						.returns("/reduced/child/path");
					oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
						.returns("/reduced/child/metapath");
					oHelperMock.expects("getRelativePath")
						.withExactArgs("/reduced/child/metapath", "/Set")
						.returns("reducedChildMetaPath");
					oHelperMock.expects("clone").exactly(oFixture.initial ? 1 : 0)
						.withExactArgs(sinon.match.same(mLocalQueryOptions))
						.returns(mClonedQueryOptions);
					oHelperMock.expects("wrapChildQueryOptions")
						.withExactArgs("/Set", "reducedChildMetaPath", {},
							sinon.match.same(fnFetchMetadata))
						.returns(mChildQueryOptions);
					oBindingMock.expects("aggregateQueryOptions")
						.exactly(oFixture.hasChildQueryOptions ? 1 : 0)
						.withExactArgs(sinon.match.same(mChildQueryOptions), "/Set",
							bCacheCreationPending ? sinon.match.falsy : true, "~bIsProperty~")
						.returns(oFixture.canMergeQueryOptions);

					// code under test
					oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath", undefined,
						"~bIsProperty~");

					assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
					if (bCacheCreationPending) {
						assert.strictEqual(oBinding.mCanUseCachePromiseByChildPath.childPath,
							oPromise);
						assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath),
							["childPath"]);
					} else {
						assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), []);
					}
					return Promise.all([oPromise, oBinding.oCachePromise]).then(function (aResult) {
						assert.strictEqual(aResult[0],
							oFixture.hasChildQueryOptions && oFixture.canMergeQueryOptions
								? "/reduced/child/path"
								: undefined);
						assert.strictEqual(oBinding.mAggregatedQueryOptions,
							oFixture.initial ? mClonedQueryOptions : mAggregatedQueryOptions);
						assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, false);
						assert.strictEqual(oBinding.bHasPathReductionToParent, false);
					});
				}
			);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bReturnValueContext) {
	[false, true].forEach(function (bBrokenCache) {
		[false, true].forEach(function (bRejected) {
		var sTitle = "fetchIfChildCanUseCache: immutable cache"
				+ (bReturnValueContext ? ", return value context, " : "")
				+ ", broken cache=" + bBrokenCache + ", rejected=" + bRejected;

		QUnit.test(sTitle, function (assert) {
			var oCache = { // cache sent read request
					hasSentRequest : function () { return true; }
				},
				oCachePromise = bBrokenCache ? SyncPromise.reject({}) : SyncPromise.resolve(oCache),
				oMetaModel = {
					getReducedPath : function () {}
				},
				fnFetchMetadata = function () {},
				oBinding = new ODataParentBinding({
					bAggregatedQueryOptionsInitial : false,
					oCache : bBrokenCache ? undefined : oCache,
					oCachePromise : oCachePromise,
					doFetchOrGetQueryOptions : function () {},
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
					mParameters : {},
					sPath : "/Set"
				}),
				oBindingMock = this.mock(oBinding),
				mChildLocalQueryOptions = {},
				oContext = bReturnValueContext
					? Context.createNewContext(this.oModel, oBinding, "/Set('2')")
					: Context.create(this.oModel, oBinding, "/Set('2')"),
				oHelperMock = this.mock(_Helper),
				oModelMock = this.mock(oBinding.oModel),
				oPromise;

			oModelMock.expects("resolve")
				.withExactArgs("childPath", sinon.match.same(oContext))
				.returns("/resolved/child/path");
			oHelperMock.expects("getMetaPath").withExactArgs("/Set('2')").returns("/Set");
			oHelperMock.expects("getMetaPath").withExactArgs("/resolved/child/path")
				.returns("/resolved/child/metaPath");
			oBindingMock.expects("doFetchOrGetQueryOptions").returns(undefined);
			// Note: Usually fetchPropertyAndType does not reject, but return undefined
			oHelperMock.expects("fetchPropertyAndType")
				.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
				.returns(bRejected
					? SyncPromise.reject("~oError~")
					: SyncPromise.resolve({$kind : "Property"}));
			oHelperMock.expects("clone").never();
			oBindingMock.expects("selectKeyProperties").never();
			oBindingMock.expects("getBaseForPathReduction")
				.withExactArgs().returns("/base/path");
			this.mock(oMetaModel).expects("getReducedPath").exactly(bRejected ? 0 : 1)
				.withExactArgs("/resolved/child/path", "/base/path")
				.returns("/reduced/child/path");
			oHelperMock.expects("getMetaPath").exactly(bRejected ? 0 : 1)
				.withExactArgs("/reduced/child/path")
				.returns("/reduced/child/metapath");
			oHelperMock.expects("getRelativePath").exactly(bRejected ? 0 : 1)
				.withExactArgs("/reduced/child/metapath", "/Set")
				.returns("reducedChildMetaPath");
			oHelperMock.expects("wrapChildQueryOptions").exactly(bRejected ? 0 : 1)
				.returns({});
			oBindingMock.expects("aggregateQueryOptions").exactly(bRejected ? 0 : 1)
				.withExactArgs({}, "/Set", /*bIsCacheImmutable*/true, "~bIsProperty~")
				.returns(false);
			if (bRejected) {
				this.mock(oBinding.oModel).expects("reportError")
					.withExactArgs(oBinding + ": Failed to enhance query options for "
						+ "auto-$expand/$select for child childPath", sClassName,
						sinon.match.same("~oError~"));
			}

			// code under test
			oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath",
				SyncPromise.resolve(mChildLocalQueryOptions), "~bIsProperty~");

			assert.strictEqual(oBinding.oCachePromise, oCachePromise);
			assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
			assert.strictEqual(oBinding.mCanUseCachePromiseByChildPath.childPath, oPromise);
			assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), ["childPath"]);
			return oPromise.then(function (sReducedPath) {
				assert.notOk(bRejected);
				assert.strictEqual(sReducedPath, undefined);
			}, function (oError) {
				assert.ok(bRejected);
				assert.strictEqual(oError, "~oError~");
			}).then(function () {
				assert.strictEqual(oBinding.oCachePromise, oCachePromise);
				assert.strictEqual(oBinding.bHasPathReductionToParent, false);
				oCachePromise.catch(function () { /* avoid "Uncaught (in Promise)"*/ });
			});
			});
		});
	});
});

	//*********************************************************************************************
[{
	cache : null,
	cacheImmutable : true,
	fetchIfChildCanUseCacheOnParentCount : 1,
	title : "no cache"
}, {
	cache : null,
	cacheImmutable : true,
	fetchIfChildCanUseCacheOnParentCount : 0,
	title : "transient binding",
	transient : true
}, {
	cache : null,
	cacheImmutable : true,
	fetchIfChildCanUseCacheOnParentCount : 1,
	rejected : true,
	title : "no cache, parent rejects"
}, {
	cache : undefined,
	cacheImmutable : undefined,
	fetchIfChildCanUseCacheOnParentCount : 0,
	title : "cache pending"
}, {
	cache : {
		hasSentRequest : function () { return true; },
		setLateQueryOptions : function () {}
	},
	cacheImmutable : true,
	fetchIfChildCanUseCacheOnParentCount : 0,
	title : "immutable cache"
}, {
	cache : {
		hasSentRequest : function () { return false; },
		setLateQueryOptions : function () {}
	},
	cacheImmutable : true,
	fetchIfChildCanUseCacheOnParentCount : 0,
	index : 42,
	title : "non-virtual row context"
}, {
	cache : {
		hasSentRequest : function () { return false; },
		setLateQueryOptions : function () {}
	},
	cacheImmutable : true,
	fetchIfChildCanUseCacheOnParentCount : 0,
	keptAlive : true,
	title : "kept-alive context"
}].forEach(function (oFixture) {
	QUnit.test("fetchIfChildCanUseCache: late query options, " + oFixture.title, function (assert) {
		var oMetaModel = {
				getReducedPath : function () {}
			},
			oCachePromise = oFixture.cache === undefined
				? SyncPromise.resolve(Promise.resolve(null))
				: SyncPromise.resolve(oFixture.cache),
			fnFetchMetadata = {/*function*/},
			oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {$select : "foo"},
				bAggregatedQueryOptionsInitial : false,
				oCache : oFixture.cache,
				oCachePromise : oCachePromise,
				oContext : {
					getBinding : function () {}
				},
				doFetchOrGetQueryOptions : function () {},
				isFirstCreateAtEnd : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {},
					mUriParameters : {}
				},
				mParameters : {},
				sPath : "navigation"
			}),
			oBindingMock = this.mock(oBinding),
			mChildLocalQueryOptions = {},
			oChildQueryOptionsPromise
				= SyncPromise.resolve(Promise.resolve(mChildLocalQueryOptions)),
			oContext = Context.create(this.oModel, oBinding, "/Set('1')/navigation('2')",
				oFixture.index),
			oHelperMock = this.mock(_Helper),
			mLateQueryOptions = {},
			oModelMock = this.mock(oBinding.oModel),
			oParentBinding = new ODataParentBinding(),
			oPromise;

		oChildQueryOptionsPromise.then(function () {
			oBinding.oContext = undefined; // this might happen e.g. for a virtual parent context
		});
		if (oFixture.keptAlive) {
			oContext.isEffectivelyKeptAlive = function () { return true; };
		}
		oModelMock.expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");
		oHelperMock.expects("getMetaPath").withExactArgs("/Set('1')/navigation('2')")
			.returns("/Set/navigation");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved/child/path")
			.returns("/resolved/child/metaPath");
		oBindingMock.expects("doFetchOrGetQueryOptions").returns({});
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
			.returns(SyncPromise.resolve(Promise.resolve({$kind : "Property"})));
		oHelperMock.expects("clone").never();
		oBindingMock.expects("selectKeyProperties").never();
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");
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
			.withExactArgs({}, "/Set/navigation", oFixture.cacheImmutable, "~bIsProperty~")
			.callsFake(function () {
				oBinding.mLateQueryOptions = mLateQueryOptions;
				return true;
			});
		oBindingMock.expects("isTransient").withExactArgs().returns(oFixture.transient);
		if (oFixture.cache) {
			this.mock(oFixture.cache).expects("setLateQueryOptions")
				.withExactArgs(sinon.match.same(mLateQueryOptions));
		}
		this.mock(oBinding.oContext).expects("getBinding")
			.exactly(oFixture.fetchIfChildCanUseCacheOnParentCount)
			.withExactArgs().returns(oParentBinding);
		this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
			.exactly(oFixture.fetchIfChildCanUseCacheOnParentCount)
			.withExactArgs(sinon.match.same(oBinding.oContext), "navigation",
				sinon.match.same(mLateQueryOptions))
			.returns(SyncPromise.resolve(oFixture.rejected ? undefined : "/some/path"));

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath", mChildLocalQueryOptions,
			"~bIsProperty~");

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		if (oFixture.cacheImmutable) {
			assert.strictEqual(oBinding.oCachePromise, oCachePromise);
		} else {
			assert.notStrictEqual(oBinding.oCachePromise, oCachePromise);
		}
		if (oFixture.cache === null) {
			assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), []);
		} else {
			assert.strictEqual(oBinding.mCanUseCachePromiseByChildPath.childPath, oPromise);
			assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), ["childPath"]);
		}
		return oPromise.then(function (sResult) {
			assert.strictEqual(sResult, oFixture.rejected ? undefined : "/reduced/child/path");
			if (oFixture.cache === undefined) {
				assert.ok(oCachePromise.isFulfilled());
			}
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
				getReducedPath : function () {}
			},
			oCache0 = {
				getResourcePath : function () {},
				hasSentRequest : function () { return false; },
				setActive : function () {},
				setQueryOptions : function () {}
			},
			oCache0Mock = this.mock(oCache0),
			oCache1 = {},
			oCachePromise = SyncPromise.resolve(oCache0),
			fnFetchMetadata = {/*function*/},
			oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {$select : "foo"},
				bAggregatedQueryOptionsInitial : false,
				oCache : oCache0,
				oCachePromise : oCachePromise,
				doFetchOrGetQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {},
					mUriParameters : {}
				},
				mParameters : {},
				sPath : "/Set",
				bSharedRequest : oFixture.shared
			}),
			oBindingMock = this.mock(oBinding),
			mChildLocalQueryOptions = {},
			oContext = Context.create(this.oModel, oBinding, "/Set('2')"),
			oHelperMock = this.mock(_Helper),
			oModelMock = this.mock(oBinding.oModel),
			mNewQueryOptions = {},
			oPromise;

		if (oFixture.operation) {
			oBinding.oOperation = {};
		}
		oModelMock.expects("resolve")
			.withExactArgs("childPath@foo.bar", sinon.match.same(oContext))
			.returns("/resolved/child/path@foo.bar");
		oHelperMock.expects("getMetaPath").withExactArgs("/Set('2')").returns("/Set");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved/child/path@foo.bar")
			.returns("/resolved/child/metaPath@foo.bar");
		oBindingMock.expects("doFetchOrGetQueryOptions").returns(undefined);
		oHelperMock.expects("fetchPropertyAndType") // no @foo.bar here
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
			.returns(SyncPromise.resolve(Promise.resolve({$kind : "Property"})));
		oHelperMock.expects("clone").never();
		oBindingMock.expects("selectKeyProperties").never();
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/resolved/child/path@foo.bar", "/base/path")
			.returns("/reduced/child/path@foo.bar");
		oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path@foo.bar")
			.returns("/reduced/child/metapath@foo.bar");
		oHelperMock.expects("getRelativePath") // no @foo.bar here
			.withExactArgs("/reduced/child/metapath", "/Set")
			.returns("reducedChildMetaPath");
		oHelperMock.expects("wrapChildQueryOptions")
			.withExactArgs("/Set", "reducedChildMetaPath",
				sinon.match.same(mChildLocalQueryOptions), sinon.match.same(fnFetchMetadata))
			.returns({});
		oBindingMock.expects("aggregateQueryOptions")
			.withExactArgs({}, "/Set", /*bIsCacheImmutable*/false, "~bIsProperty~")
			.returns(false);
		oHelperMock.expects("merge").never();
		oCache0Mock.expects("setQueryOptions").never();
		oCache0Mock.expects("setActive").never();
		oBindingMock.expects("createAndSetCache").never();
		if (oFixture.shared) {
			oCache0Mock.expects("setActive").withExactArgs(false);
			oCache0Mock.expects("getResourcePath").withExactArgs().returns("resource/path");
			oBindingMock.expects("createAndSetCache")
				.withExactArgs(sinon.match.same(oBinding.mAggregatedQueryOptions),
					"resource/path", sinon.match.same(oContext))
				.returns(oCache1);
		} else if (!oFixture.operation) {
			oHelperMock.expects("merge").withExactArgs({},
				sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mAggregatedQueryOptions)).returns(mNewQueryOptions);
			oCache0Mock.expects("setQueryOptions").withExactArgs(mNewQueryOptions);
		}

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath@foo.bar",
			SyncPromise.resolve(mChildLocalQueryOptions), "~bIsProperty~");

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.notStrictEqual(oBinding.oCachePromise, oCachePromise);
		assert.strictEqual(oBinding.mCanUseCachePromiseByChildPath["childPath@foo.bar"], oPromise);
		assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath),
			["childPath@foo.bar"]);
		return oBinding.oCachePromise.then(function (oResultingCache) {
			assert.strictEqual(oPromise.getResult(), undefined);
			assert.strictEqual(oResultingCache, oFixture.shared ? oCache1 : oCache0);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: empty child path", function (assert) {
		var oMetaModel = {
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oBinding = new ODataParentBinding({
				oCache : undefined,
				oCachePromise : SyncPromise.resolve(Promise.resolve(null)),
				oContext : {},
				wrapChildQueryOptions : function () {},
				doFetchOrGetQueryOptions : function () {},
				isFirstCreateAtEnd : function () {},
				aggregateQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				mParameters : {},
				sPath : "/Set"
			}),
			oBindingMock = this.mock(oBinding),
			mChildQueryOptions = {},
			mClonedQueryOptions = {},
			oContext = Context.create(this.oModel, oBinding, "/Set/~", Context.VIRTUAL),
			oHelperMock = this.mock(_Helper),
			mLocalQueryOptions = {},
			oModelMock = this.mock(oBinding.oModel),
			oPromise,
			mWrappedChildQueryOptions = {};

		oBinding.mCanUseCachePromiseByChildPath[""] = "~n/a~";
		oModelMock.expects("resolve")
			.withExactArgs("", sinon.match.same(oContext))
			.returns("/resolved/child/path");
		oHelperMock.expects("getMetaPath").withExactArgs("/Set/~").returns("/Set");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved/child/path")
			.returns("/resolved/child/metaPath");
		oBindingMock.expects("doFetchOrGetQueryOptions")
			.withExactArgs(sinon.match.same(oBinding.oContext))
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
			.returns(SyncPromise.resolve({$kind : "EntitySet"}));
		oHelperMock.expects("clone")
			.withExactArgs(sinon.match.same(mLocalQueryOptions))
			.returns(mClonedQueryOptions);
		oBindingMock.expects("selectKeyProperties")
			.withExactArgs(mClonedQueryOptions, "/Set");
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");
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
			.withExactArgs(sinon.match.same(mWrappedChildQueryOptions), "/Set", undefined, false)
			.returns(true);

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "",
			SyncPromise.resolve(mChildQueryOptions), false);

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {"" : "~n/a~"}, "unchanged");
		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, "/reduced/child/path");
			assert.strictEqual(oBinding.bHasPathReductionToParent, false);
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
					getReducedPath : function () {}
				},
				fnFetchMetadata = function () {},
				mOriginalAggregatedQueryOptions = {$expand : {foo : {$select : ["bar"]}}},
				oBinding = new ODataParentBinding({
					mAggregatedQueryOptions : mOriginalAggregatedQueryOptions,
					bAggregatedQueryOptionsInitial : false,
					// cache will be created, waiting for child bindings
					oCache : undefined,
					oCachePromise : SyncPromise.resolve(Promise.resolve(null)),
					oContext : {},
					doFetchOrGetQueryOptions : function () {
						return SyncPromise.resolve({});
					},
					oModel : {
						getMetaModel : function () { return oMetaModel; },
						oInterface : {
							fetchMetadata : fnFetchMetadata
						},
						resolve : function () {}
					},
					mParameters : {},
					sPath : "/Set",
					bRelative : false
				}),
				oContext = Context.create(this.oModel, oBinding, "/Set('2')"),
				oHelperMock = this.mock(_Helper),
				oModelMock = this.mock(oBinding.oModel),
				sPath = oFixture.sPath,
				oPromise;

			oBinding.mCanUseCachePromiseByChildPath[""] = "~n/a~";
			oModelMock.expects("resolve")
				.withExactArgs(sPath, sinon.match.same(oContext))
				.returns("/resolved/child/path");
			oHelperMock.expects("getMetaPath").withExactArgs("/Set('2')").returns("/Set");
			oHelperMock.expects("getMetaPath").withExactArgs("/resolved/child/path")
				.returns("/resolved/child/metaPath");
			oHelperMock.expects("fetchPropertyAndType")
				.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
				.returns(SyncPromise.resolve(oFixture.oProperty));
			oHelperMock.expects("clone").never();
			this.mock(oBinding).expects("selectKeyProperties").never();
			this.mock(oBinding).expects("getBaseForPathReduction")
				.withExactArgs().returns("/base/path");
			this.mock(oMetaModel).expects("getReducedPath")
				.withExactArgs("/resolved/child/path", "/base/path")
				.returns("/reduced/child/path");
			oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
				.returns("/reduced/child/metapath");
			oHelperMock.expects("getRelativePath")
				.withExactArgs("/reduced/child/metapath", "/Set")
				.returns("reducedChildMetaPath");
			this.oLogMock.expects("error").withExactArgs(
				"Failed to enhance query options for auto-$expand/$select as the path "
					+ "'/resolved/child/path' does not point to a property",
				JSON.stringify(oFixture.oProperty), sClassName);

			// code under test
			oPromise = oBinding.fetchIfChildCanUseCache(oContext, sPath);

			assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
			assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {"" : "~n/a~"}, "unchanged");
			return oPromise.then(function (sReducedPath) {
				assert.strictEqual(sReducedPath, undefined);
				assert.deepEqual(oBinding.mAggregatedQueryOptions, mOriginalAggregatedQueryOptions);
				assert.strictEqual(oBinding.bHasPathReductionToParent, false);
			});
		});
	});

	//*********************************************************************************************
[undefined, true].forEach(function (bImmutable, i) {
	QUnit.test("fetchIfChildCanUseCache, advertised action #" + i, function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getReducedPath : function () {}
			},
			oModel = {
				getMetaModel : function () { return oMetaModel; },
				resolve : function () {}
			},
			oCache = {
				hasSentRequest : function () { return bImmutable; },
				setQueryOptions : function () {}
			},
			oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {$expand : {foo : {$select : ["bar"]}}},
				bAggregatedQueryOptionsInitial : false,
				oCache : bImmutable ? oCache : undefined,
				oCachePromise : SyncPromise.resolve(bImmutable ? oCache : Promise.resolve(oCache)),
				oContext : {},
				doFetchOrGetQueryOptions : function () {
					return SyncPromise.resolve({});
				},
				oModel : oModel,
				mParameters : {},
				sPath : "/Set",
				bRelative : false
			}),
			oContext = Context.create(oModel, oBinding, "/Set('2')"),
			oHelperMock = this.mock(_Helper),
			sPath = "#foo.bar.AcFoo",
			oPromise;

		this.mock(oBinding).expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oHelperMock.expects("getMetaPath").withExactArgs("/Set('2')").returns("/Set");
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(sPath, sinon.match.same(oContext))
			.returns("/resolved/child/path/" + sPath);
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/resolved/child/path/" + sPath, "/base/path")
			.returns("/reduced/child/path/" + sPath);
		oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path/" + sPath)
			.returns("/reduced/child/metapath/" + sPath);
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/metapath/" + sPath, "/Set")
			.returns(sPath);
		this.mock(oBinding).expects("aggregateQueryOptions")
			.withExactArgs({$select : ["foo.bar.AcFoo"]}, "/Set", bImmutable, "~bIsProperty~")
			.returns(!bImmutable);
		this.mock(oMetaModel).expects("fetchObject").withExactArgs("/Set/")
			.returns(SyncPromise.resolve());

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sPath, null, "~bIsProperty~");

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.strictEqual(oBinding.mCanUseCachePromiseByChildPath[sPath], oPromise);
		assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), [sPath]);
		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath,
				bImmutable ? undefined : "/reduced/child/path/" + sPath);
			assert.strictEqual(oBinding.bHasPathReductionToParent, false);
		});
	});
});

	//*********************************************************************************************
["$count", "EMPLOYEE_2_EQUIPMENTS/$count"].forEach(function (sChildPath) {
	QUnit.test("fetchIfChildCanUseCache: " + sChildPath, function (assert) {
		var oMetaModel = {
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oBinding = new ODataParentBinding({
				doFetchOrGetQueryOptions : function () {
					return SyncPromise.resolve({});
				},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				mParameters : {},
				sPath : "/Set"
			}),
			oContext = Context.create(oBinding.oModel, oBinding, "/Set($uid=id-1-23)/ToMany"),
			oHelperMock = this.mock(_Helper),
			oPromise;

		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs()
			.returns("/base/path");
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(sChildPath, sinon.match.same(oContext))
			.returns("/resolved/child/path");
		oHelperMock.expects("getMetaPath").withExactArgs("/Set($uid=id-1-23)/ToMany")
			.returns("/Set/ToMany");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved/child/path")
			.returns("/resolved/child/metaPath");
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/metaPath")
			.returns(SyncPromise.resolve());
		oHelperMock.expects("clone").never();
		this.mock(oBinding).expects("selectKeyProperties").never();
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");
		oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
			.returns("/reduced/child/metaPath");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/metaPath", "/Set/ToMany").returns(sChildPath);

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sChildPath, null, "~bIsProperty~");

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {}, "unchanged due to $uid");
		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, "/reduced/child/path");
			assert.strictEqual(oBinding.bHasPathReductionToParent, false);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: $$aggregation", function (assert) {
		var mParameters = {/*$$aggregation : {.../}*/},
			oBinding = new ODataParentBinding({
				oContext : {},
				oModel : {
					getMetaModel : function () { return {}; },
					resolve : function () {}
				},
				mParameters : mParameters,
				sPath : "path"
			}),
			oContext = {
				getIndex : function () {},
				getPath : function () { return "/foo/bar/path"; }
			};

		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("n/a");
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");
		this.mock(_Helper).expects("isDataAggregation").withExactArgs(sinon.match.same(mParameters))
			.returns(true);

		assert.strictEqual(
			// code under test
			oBinding.fetchIfChildCanUseCache(oContext, "childPath", null, "~bIsProperty~")
				.getResult(),
			"/resolved/child/path");
		assert.strictEqual(oBinding.bHasPathReductionToParent, false);
		assert.deepEqual(oBinding.aChildCanUseCachePromises, [], "unchanged");
		assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {}, "unchanged");
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
			oContext = {
				getIndex : function () {},
				getPath : function () { return "/Foo/operation(...)/Bar/path"; }
			},
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("anything");
		oModelMock.expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");

		// code under test
		assert.strictEqual(
			oBinding.fetchIfChildCanUseCache(oContext, "childPath", null, "~bIsProperty~")
				.getResult(),
			"/resolved/child/path");
		assert.strictEqual(oBinding.bHasPathReductionToParent, false);
		assert.deepEqual(oBinding.aChildCanUseCachePromises, [], "unchanged");
		assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {}, "unchanged");
	});

	//*********************************************************************************************
[false, true].forEach(function (bReduced, i) {
	QUnit.test("fetchIfChildCanUseCache, operation parameter #" + i, function (assert) {
		var oMetaModel = {
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
				doFetchOrGetQueryOptions : function () {
					return SyncPromise.resolve({});
				},
				oModel : oModel,
				mParameters : {},
				sPath : "operation(...)"
			}),
			mChildQueryOptions = {},
			oChildQueryOptionsPromise = SyncPromise.resolve(Promise.resolve(mChildQueryOptions)),
			oContext = Context.create(oModel, oBinding, "/Set('2')/operation(...)/$Parameter"),
			oHelperMock = this.mock(_Helper),
			oModelMock = this.mock(oBinding.oModel),
			sPath = "foo/bar",
			oPromise;

		this.mock(oBinding).expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oModelMock.expects("resolve")
			.withExactArgs(sPath, sinon.match.same(oContext))
			.returns("/Set('2')/operation(...)/$Parameter/foo/bar");
		oHelperMock.expects("getMetaPath").withExactArgs("/Set('2')/operation(...)/$Parameter")
			.returns("/Set/operation/$Parameter");
		oHelperMock.expects("getMetaPath")
			.withExactArgs("/Set('2')/operation(...)/$Parameter/foo/bar")
			.returns("/Set/operation/$Parameter/foo/bar");
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/Set/operation/$Parameter/foo/bar")
			.returns(SyncPromise.resolve());
		oHelperMock.expects("clone").never();
		this.mock(oBinding).expects("selectKeyProperties").never();
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/Set('2')/operation(...)/$Parameter/foo/bar", "/base/path")
			.returns("/reduced/child/path");
		oHelperMock.expects("getMetaPath").withExactArgs("/reduced/child/path")
			.returns("/reduced/child/metapath");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/reduced/child/metapath", "/Set/operation/$Parameter")
			.returns(bReduced ? undefined : "unused");
		oHelperMock.expects("getRelativePath").exactly(bReduced ? 1 : 0)
			.withExactArgs("/Set('2')/operation(...)/$Parameter/foo/bar", "/Set('2')")
			.returns("operation(...)/$Parameter/foo/bar");
		this.mock(oParentBinding).expects("fetchIfChildCanUseCache").exactly(bReduced ? 1 : 0)
			.withExactArgs(sinon.match.same(oBinding.oContext), "operation(...)/$Parameter/foo/bar",
				sinon.match.same(mChildQueryOptions), "~bIsProperty~")
			.returns("/reduced/child/path");
		this.mock(oBinding).expects("aggregateQueryOptions").never();

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sPath, oChildQueryOptionsPromise,
			"~bIsProperty~");

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), []);
		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, "/reduced/child/path");
			assert.strictEqual(oBinding.bHasPathReductionToParent, bReduced);
		});
	});
});

//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: non-deferred function", function (assert) {
		var fnFetchMetadata = function () {},
			oBinding = new ODataParentBinding({
				doFetchOrGetQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return null; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				mParameters : {},
				sPath : "/Collection(42)"
			}),
			sChildPath = "Function(foo=42)",
			oContext = Context.create(this.oModel, oBinding, "/Collection(42)"),
			oModelMock = this.mock(oBinding.oModel),
			oPromise;

		oBinding.mCanUseCachePromiseByChildPath[""] = "~n/a~";
		this.mock(oBinding).expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		oModelMock.expects("resolve")
			.withExactArgs(sChildPath, sinon.match.same(oContext))
			.returns("/resolved/child/path");
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/path")
			.returns(SyncPromise.resolve([{$isBound : true, $kind : "Function"}]));
		this.mock(_Helper).expects("clone").never();
		this.mock(oBinding).expects("selectKeyProperties").never();
		this.mock(oBinding).expects("doFetchOrGetQueryOptions").withExactArgs(undefined)
			.returns(SyncPromise.resolve());

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sChildPath, SyncPromise.resolve());

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {"" : "~n/a~"}, "unchanged");
		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, undefined);
			assert.strictEqual(oBinding.bHasPathReductionToParent, false);
		});
	});

	//*********************************************************************************************
[undefined, true].forEach(function (bImmutable) {
	var sTitle = "fetchIfChildCanUseCache: non-deferred function and 'value', bImmutable = "
			+ bImmutable;

	QUnit.test(sTitle, function (assert) {
		var oCache = {
				hasSentRequest : function () { return bImmutable; },
				setQueryOptions : function () {}
			},
			oMetaModel = {
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oBinding = new ODataParentBinding({
				oCache : bImmutable ? oCache : undefined,
				oCachePromise : SyncPromise.resolve(bImmutable ? oCache : Promise.resolve(oCache)),
				doFetchOrGetQueryOptions : function () {},
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					oInterface : {
						fetchMetadata : fnFetchMetadata
					},
					resolve : function () {}
				},
				mParameters : {},
				sPath : "/Function(foo=42)",
				bRelative : false
			}),
			oBindingMock = this.mock(oBinding),
			sChildPath = "value",
			oContext = Context.create(this.oModel, oBinding, "/Function(foo=42)"),
			mLocalQueryOptions = {},
			oModelMock = this.mock(oBinding.oModel),
			oPromise;

		oModelMock.expects("resolve")
			.withExactArgs(sChildPath, sinon.match.same(oContext))
			.returns("/resolved/child/path");
		this.mock(_Helper).expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/child/path")
			.returns(SyncPromise.resolve({$isCollection : true, $Type : "some.EntityType"}));
		oBindingMock.expects("doFetchOrGetQueryOptions").withExactArgs(undefined)
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.object).returns("~clone~");
		oBindingMock.expects("selectKeyProperties")
			.withExactArgs("~clone~", "/Function"); // Note: w/o $Key nothing happens
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/base/path");
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/resolved/child/path", "/base/path")
			.returns("/reduced/child/path");
		this.mock(_Helper).expects("getRelativePath")
			.withExactArgs("/reduced/child/path", "/Function")
			.returns("value");
		oBindingMock.expects("aggregateQueryOptions")
			.withExactArgs({}, "/Function", bImmutable, "~bIsProperty~")
			.returns(!bImmutable);

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sChildPath, undefined,
			"~bIsProperty~");

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.strictEqual(oBinding.mCanUseCachePromiseByChildPath[sChildPath], oPromise);
		assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), [sChildPath]);
		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, bImmutable ? undefined : "/reduced/child/path");
			assert.strictEqual(oBinding.bHasPathReductionToParent, false);
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
			oContext = {
				getIndex : function () {},
				getPath : function () { return "/TEAMS"; }
			},
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("anything");
		oModelMock.expects("resolve")
			.withExactArgs("childPath", sinon.match.same(oContext))
			.returns("/resolved/child/path");
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);

		assert.strictEqual(
			// code under test
			oBinding.fetchIfChildCanUseCache(oContext, "childPath", {}, "~bIsProperty~")
				.getResult(),
			"/resolved/child/path");
		assert.strictEqual(oBinding.bHasPathReductionToParent, false);
		assert.deepEqual(oBinding.aChildCanUseCachePromises, [], "unchanged");
		assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {}, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: delegate to parent binding", function (assert) {
		var oMetaModel = {
				getReducedPath : function () {}
			},
			fnFetchMetadata = function () {},
			oParentBinding = new ODataParentBinding(),
			oBinding = new ODataParentBinding({
				mCanUseCachePromiseByChildPath : {"SOITEMS_2_SO/Note" : "do not use"},
				oCache : null,
				oCachePromise : SyncPromise.resolve(Promise.resolve(null)),
				oContext : {
					getBinding : function () { return oParentBinding; },
					getPath : function () { return "/SalesOrderList('42')"; }
				},
				doFetchOrGetQueryOptions : function () {},
				isFirstCreateAtEnd : function () {},
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
			sChildPath = "SOITEMS_2_SO/Note",
			mChildQueryOptions = {},
			oChildQueryOptionsPromise = SyncPromise.resolve(Promise.resolve(mChildQueryOptions)),
			oContext = Context.create(this.oModel, oBinding,
				"/SalesOrderList('42')/SO_2_SOITEMS('23')", 23),
			oHelperMock = this.mock(_Helper),
			mLocalQueryOptions = {},
			oModelMock = this.mock(oBinding.oModel),
			oPromise;

		oChildQueryOptionsPromise.then(function () {
			oBinding.oContext = undefined; // this might happen e.g. for a virtual parent context
		});
		oModelMock.expects("resolve")
			.withExactArgs("SOITEMS_2_SO/Note", sinon.match.same(oContext))
			.returns("/SalesOrderList('42')/SO_2_SOITEMS('23')/SOITEMS_2_SO/Note");
		oHelperMock.expects("getMetaPath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEMS('23')")
			.returns("/SalesOrderList/SO_2_SOITEMS");
		oHelperMock.expects("getMetaPath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEMS('23')/SOITEMS_2_SO/Note")
			.returns("/SalesOrderList/SO_2_SOITEMS/SOITEMS_2_SO/Note");
		oBindingMock.expects("doFetchOrGetQueryOptions")
			.withExactArgs(sinon.match.same(oBinding.oContext))
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs(sinon.match.same(fnFetchMetadata),
				"/SalesOrderList/SO_2_SOITEMS/SOITEMS_2_SO/Note")
			.returns(SyncPromise.resolve({$kind : "Property"}));
		this.mock(_Helper).expects("clone").never();
		this.mock(oBinding).expects("selectKeyProperties").never();
		oBindingMock.expects("getBaseForPathReduction")
			.withExactArgs().returns("/SalesOrderList");
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEMS('23')/SOITEMS_2_SO/Note",
				"/SalesOrderList")
			.returns("/SalesOrderList('42')/Note");
		oHelperMock.expects("getMetaPath").withExactArgs("/SalesOrderList('42')/Note")
			.returns("/SalesOrderList/Note");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/SalesOrderList/Note", "/SalesOrderList/SO_2_SOITEMS")
			.returns(undefined);
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEMS('23')/SOITEMS_2_SO/Note",
				"/SalesOrderList('42')")
			.returns("SO_2_SOITEMS('23')/SOITEMS_2_SO/Note");
		this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(sinon.match.same(oBinding.oContext),
				"SO_2_SOITEMS('23')/SOITEMS_2_SO/Note", sinon.match.same(mChildQueryOptions),
				"~bIsProperty~")
			.returns(Promise.resolve("/SalesOrderList('42')/Note"));

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, sChildPath, oChildQueryOptionsPromise,
			"~bIsProperty~");

		assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
		assert.strictEqual(oBinding.mCanUseCachePromiseByChildPath[sChildPath], "do not use");
		assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), [sChildPath]);
		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, "/SalesOrderList('42')/Note");
			assert.strictEqual(oBinding.bHasPathReductionToParent, true);
		});
	});

	//*********************************************************************************************
[{
	sOldReducedPath : undefined,
	sChildPath : "childPath",
	bSameMetaPath : true
}, {
	sOldReducedPath : "ignore/me",
	sChildPath : "childPath",
	bSameMetaPath : true
}, {
	sOldReducedPath : "ignore/me",
	sChildPath : "child/path",
	bSameMetaPath : true
}, {
	sOldReducedPath : "ignore/me",
	sChildPath : "child/path",
	bSameMetaPath : false
}].forEach(function (o, i) {
	QUnit.test("fetchIfChildCanUseCache: mCanUseCachePromiseByChildPath, #" + i, function (assert) {
		var oCanUseCachePromise = SyncPromise.resolve(Promise.resolve(o.sOldReducedPath)),
			oMetaModel = {
				getReducedPath : function () {}
			},
			oBinding = new ODataParentBinding({
				oCache : {}, // not null
				oContext : "do not use",
				oModel : {
					getMetaModel : function () { return oMetaModel; },
					resolve : function () {}
				}
			}),
			oContext = {
				getIndex : function () {},
				getPath : function () { return "/TEAMS"; }
			},
			sExpectedReducedPath = o.sOldReducedPath ? "/resolved/child/path" : undefined,
			oHelperMock = this.mock(_Helper),
			oPromise;

		oBinding.mCanUseCachePromiseByChildPath[o.sChildPath] = oCanUseCachePromise;
		oBinding.bHasPathReductionToParent = "~bHasPathReductionToParent~";
		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs()
			.returns("/base/path");
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(o.sChildPath, sinon.match.same(oContext))
			.returns("/resolved/child/path");
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(_Helper).expects("isDataAggregation").withExactArgs(undefined).returns(false);
		oHelperMock.expects("getMetaPath").never();
		if (o.sChildPath === "child/path") {
			oHelperMock.expects("getMetaPath").withExactArgs(o.sOldReducedPath).returns("A");
			oHelperMock.expects("getMetaPath").withExactArgs("/resolved/child/path")
				.returns(o.bSameMetaPath ? "A" : "B");
		}
		if (o.bSameMetaPath) {
			this.mock(oMetaModel).expects("getReducedPath").never();
		} else {
			this.mock(oMetaModel).expects("getReducedPath")
				.withExactArgs("/resolved/child/path", "/base/path").returns("/reduced/path");
			sExpectedReducedPath = "/reduced/path";
		}

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, o.sChildPath, undefined, true);

		return oPromise.then(function (sReducedPath) {
			assert.strictEqual(sReducedPath, sExpectedReducedPath);

			// Note: we wait as long as possible to check that s.th. is unchanged
			assert.strictEqual(oBinding.bHasPathReductionToParent, "~bHasPathReductionToParent~",
				"unchanged");
			assert.deepEqual(oBinding.aChildCanUseCachePromises, [], "unchanged");
			assert.strictEqual(oBinding.mCanUseCachePromiseByChildPath[o.sChildPath],
				oCanUseCachePromise, "unchanged");
			assert.deepEqual(Object.keys(oBinding.mCanUseCachePromiseByChildPath), [o.sChildPath]);
		});
	});
});

	//*********************************************************************************************
[{
	aggregatedQueryOptions : {$select : ["Name", "AGE"]},
	childQueryOptions : {$select : ["Name"]},
	lateQueryOptions : {$select : ["Name"]},
	success : true,
	title : "same $select as before"
}, {
	aggregatedQueryOptions : {$select : ["Name", "AGE"]},
	childQueryOptions : {$select : ["ROOM_ID"]},
	lateQueryOptions : {$select : ["Name", "AGE", "ROOM_ID"]},
	success : true,
	title : "new property accepted and added to late properties"
}, {
	aggregatedQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id"]}}},
	childQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {}}},
	success : true,
	title : "same $expand as before"
}, {
	aggregatedQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id"]}}},
	childQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Name"]}}},
	lateQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id", "Name"]}}},
	success : true,
	title : "new $select in existing $expand"
}, {
	aggregatedQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id"]}}},
	childQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id"]}}},
	lateQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$select : ["Team_Id"]}}},
	success : true,
	title : "same $expand"
}, {
	aggregatedQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {}}},
	childQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$expand : {TEAM_2_MANAGER : {}}}}},
	lateQueryOptions : {$expand : {EMPLOYEE_2_TEAM : {$expand : {TEAM_2_MANAGER : {}}}}},
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
}].forEach(function (oFixture) {
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
			oMetaModelMock = this.mock(oMetaModel);

		this.mock(_Helper).expects("clone")
			.withExactArgs(sinon.match.same(oBinding.mLateQueryOptions))
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
	QUnit.test("deleteFromCache", function (assert) {
		var oBinding = new ODataParentBinding(),
			oCache = {
				_delete : function () { throw new Error(); }
			},
			oWithCacheExpectation;

		oWithCacheExpectation = this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.func, "~sPath~", true).returns("~oResult~");

		assert.strictEqual(
			// code under test
			oBinding.deleteFromCache("~oGroupLock~", "EMPLOYEES('1')", "~sPath~", "~oETagEntity~",
				"~fnCallback~"),
			"~oResult~");

		this.mock(oCache).expects("_delete")
			.withExactArgs("~oGroupLock~", "EMPLOYEES('1')", "~sCachePath~", "~oETagEntity~",
				"~fnCallback~")
			.returns("~oDeleteResult~");

		assert.strictEqual(
			// code under test
			oWithCacheExpectation.firstCall.args[0](oCache, "~sCachePath~"),
			"~oDeleteResult~");
	});

	//*********************************************************************************************
	[
		{sPath : "/Employees"}, // absolute binding
		{sPath : "TEAM_2_MANAGER"}, // relative binding without context
		{sPath : "/Employees(ID='1')", oContext : {}}, // absolute binding with context (edge case)
		{sPath : "TEAM_2_MANAGER", oContext : {}} // relative binding with standard context
	].forEach(function (oFixture) {
		QUnit.test("checkUpdateInternal: " + JSON.stringify(oFixture), function (assert) {
			var bRelative = oFixture.sPath[0] !== "/",
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
			return oBinding.checkUpdateInternal().then(function () {
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
				getResourcePath : function () {}
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

		this.mock(oCache).expects("getResourcePath").withExactArgs()
			.returns("TEAMS('4711')/TEAM_2_MANAGER");
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
				getResourcePath : function () {}
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

		this.mock(oCache).expects("getResourcePath").withExactArgs().returns(sPath);
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
		return oBinding.checkUpdateInternal().then(function () {
			assert.strictEqual(bDependent0Refreshed, true);
			assert.strictEqual(bDependent1Refreshed, true);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCancel) {
		QUnit.test("createInCache: with cache, canceled: " + bCancel, function (assert) {
			var sCanonicalPath = "/TEAMS('1')/EMPLOYEES",
				oCache = {
					getResourcePath : function () {},
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

			this.mock(oCache).expects("getResourcePath").exactly(bCancel ? 0 : 1).withExactArgs()
				.returns(sCanonicalPath);
			this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/TEAMS('1')");
			this.mock(_Helper).expects("getRelativePath")
				.withExactArgs("/TEAMS('1')/TEAM_2_EMPLOYEES", "/TEAMS('1')")
				.returns("TEAM_2_EMPLOYEES");
			this.mock(oCache).expects("create")
				.withExactArgs("groupLock", "EMPLOYEES", "TEAM_2_EMPLOYEES", sTransientPredicate,
					sinon.match.same(oInitialData),
					"bAtEndOfCreated",
					sinon.match.same(fnError), sinon.match.same(fnSubmit))
				.returns(oCreatePromise);

			// code under test
			return oBinding.createInCache("groupLock", "EMPLOYEES", "/TEAMS('1')/TEAM_2_EMPLOYEES",
					sTransientPredicate, oInitialData, "bAtEndOfCreated", fnError, fnSubmit)
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
	QUnit.test("createInCache: binding without mCacheByResourcePath", function (assert) {
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

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/TEAMS('1')");
		this.mock(_Helper).expects("getRelativePath")
			.withExactArgs("/TEAMS('1')/TEAM_2_EMPLOYEES", "/TEAMS('1')")
			.returns("TEAM_2_EMPLOYEES");
		this.mock(oCache).expects("create")
			.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES", "TEAM_2_EMPLOYEES",
				sTransientPredicate, sinon.match.same(oInitialData), "bAtEndOfCreated",
				sinon.match.same(fnError),
				sinon.match.same(fnSubmit))
			.returns(oCreatePromise);

		// code under test
		return oBinding.createInCache(
				oGroupLock, "EMPLOYEES", "/TEAMS('1')/TEAM_2_EMPLOYEES", sTransientPredicate,
				oInitialData, "bAtEndOfCreated", fnError, fnSubmit
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

		this.mock(oParentBinding).expects("createInCache")
			.withExactArgs(sinon.match.same(oGroupLock), "SalesOrderList('4711')/SO_2_SCHEDULE",
				"/path", sTransientPredicate, oInitialData, "bAtEndOfCreated",
				sinon.match.same(fnError), sinon.match.same(fnSubmit))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oBinding.createInCache(oGroupLock, "SalesOrderList('4711')/SO_2_SCHEDULE", "/path",
				sTransientPredicate, oInitialData, "bAtEndOfCreated", fnError, fnSubmit)
				.getResult(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("selectKeyProperties", function () {
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
		aggregated : {$select : ["foo", "bar"]},
		current : {$select : ["foo"]},
		result : {$select : ["foo", "bar"]}
	}, {
		aggregated : {$expand : {foo : {}, bar : {}}},
		current : {$expand : {foo : {}}},
		result : {$expand : {foo : {}, bar : {}}}
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
	}, {
		aggregated : {},
		initial : true,
		current : {$select : [], $expand : {foo : {}, bar : {}}},
		result : {$select : ["foo"], $expand : {foo : {}, bar : {}}}
	}].forEach(function (oFixture, i) {
		QUnit.test("updateAggregatedQueryOptions " + i, function (assert) {
			var oBinding = new ODataParentBinding({
					bAggregatedQueryOptionsInitial : oFixture.initial,
					mAggregatedQueryOptions : oFixture.aggregated
				});

			oBinding.destroy = function () {
				this.mAggregatedQueryOptions = undefined;
			};

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
	QUnit.test("doSuspend", function () {
		new ODataParentBinding().doSuspend(); // nothing more to test here :-)
	});

	//*********************************************************************************************
	QUnit.test("suspend: root binding", function (assert) {
		var oBinding = new ODataParentBinding({
				toString : function () { return "~"; }
			}),
			oBindingMock = this.mock(oBinding),
			oResult = {};

		oBindingMock.expects("isRoot").withExactArgs().returns(true);
		oBindingMock.expects("hasPendingChanges").withExactArgs(true).returns(false);
		oBindingMock.expects("removeReadGroupLock").withExactArgs();
		oBindingMock.expects("doSuspend").withExactArgs();

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
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(true);
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
			oResumePromise = new SyncPromise(function (resolve) {
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
			oResumePromise = new SyncPromise(function (resolve) {
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

		oBinding.oResumePromise = new SyncPromise(function (_resolve, reject) {
			fnReject = reject;
		});
		this.mock(oBinding).expects("_resume").withExactArgs(true);

		// code under test
		oResult = oBinding.resumeAsync();

		assert.ok(oResult instanceof Promise);

		fnReject(oError);

		return oResult.then(function () {
				assert.notOk(true);
			}, function (oError0) {
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
[undefined, 1].forEach(function (iCount) {
	QUnit.test(`createReadGroupLock: bLocked=true, timeout, count=${iCount}`, function (assert) {
		const oPromiseMock = this.mock(Promise);
		try {
			const oBinding = new ODataParentBinding({
				oModel : {addPrerenderingTask : mustBeMocked}
			});
			const oGroupLock = {
				toString : function () { return "~groupLock~"; },
				unlock : mustBeMocked
			};
			this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true)
				.returns(oGroupLock);
			const oModelMock = this.mock(oBinding.oModel);
			const oExpectation1 = oModelMock.expects("addPrerenderingTask")
				.withExactArgs(sinon.match.func);

			// code under test
			oBinding.createReadGroupLock("groupId", true, iCount);

			assert.strictEqual(oBinding.oReadGroupLock, oGroupLock);

			const oThenable1 = {then : mustBeMocked};
			oPromiseMock.expects("resolve").withExactArgs().returns(oThenable1);
			this.mock(oThenable1).expects("then").withExactArgs(sinon.match.func).callsArg(0);
			const oExpectation2 = oModelMock.expects("addPrerenderingTask")
				.withExactArgs(sinon.match.func);

			// code under test
			oExpectation1.callArg(0);

			let oExpectation3;
			if (iCount) {
				const oThenable2 = {then : mustBeMocked};
				oPromiseMock.expects("resolve").withExactArgs().returns(oThenable2);
				this.mock(oThenable2).expects("then").withExactArgs(sinon.match.func).callsArg(0);
				oExpectation3 = oModelMock.expects("addPrerenderingTask")
					.withExactArgs(sinon.match.func);

				// code under test
				oExpectation2.callArg(0);
			}

			this.oLogMock.expects("debug")
				.withExactArgs("Timeout: unlocked ~groupLock~", null, sClassName);
			this.mock(oBinding).expects("removeReadGroupLock").withExactArgs();

			// code under test
			(iCount ? oExpectation3 : oExpectation2).callArg(0);
		} finally {
			oPromiseMock.restore();
		}
	});
});

	//*********************************************************************************************
	QUnit.test("createReadGroupLock: bLocked=true, lock is used", function (assert) {
		const oPromiseMock = this.mock(Promise);
		try {
			const oBinding = new ODataParentBinding({
				oModel : {addPrerenderingTask : mustBeMocked}
			});
			this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true)
				.returns("~oGroupLock~");
			const oModelMock = this.mock(oBinding.oModel);
			const oExpectation1 = oModelMock.expects("addPrerenderingTask")
				.withExactArgs(sinon.match.func);

			// code under test
			oBinding.createReadGroupLock("groupId", true, 1);

			assert.strictEqual(oBinding.oReadGroupLock, "~oGroupLock~");

			const oThenable = {then : mustBeMocked};
			oPromiseMock.expects("resolve").withExactArgs().returns(oThenable);
			this.mock(oThenable).expects("then").withExactArgs(sinon.match.func).callsArg(0);
			const oExpectation2 = oModelMock.expects("addPrerenderingTask")
				.withExactArgs(sinon.match.func);

			// code under test
			oExpectation1.callArg(0);

			// simulate functions that use and remove that lock (like getContexts or fetchValue)
			oBinding.oReadGroupLock = undefined;

			// code under test - no further prerendering task
			oExpectation2.callArg(0);
		} finally {
			oPromiseMock.restore();
		}
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

		oPromiseMock.restore();
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
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("attachEvent")
			.withExactArgs("patchCompleted", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.attachPatchCompleted("~function~", "~listener~"), oBinding);

		oBindingMock.expects("detachEvent")
			.withExactArgs("patchCompleted", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.detachPatchCompleted("~function~", "~listener~"), oBinding);
	});

	//*********************************************************************************************
	QUnit.test("attachPatchSent/detachPatchSent", function (assert) {
		var oBinding = new ODataParentBinding({
				attachEvent : function () {},
				detachEvent : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("attachEvent")
			.withExactArgs("patchSent", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.attachPatchSent("~function~", "~listener~"), oBinding);

		oBindingMock.expects("detachEvent")
			.withExactArgs("patchSent", "~function~", "~listener~")
			.returns(oBinding);

		// code under test
		assert.strictEqual(oBinding.detachPatchSent("~function~", "~listener~"), oBinding);
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

		// firePatchCompleted invokes a patchCompleted event only if firePatchCompleted is called
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
		// assert.deepEqual(oBinding.mAggregatedQueryOptions, undefined);
		assert.deepEqual(oBinding.aChildCanUseCachePromises, []);
		assert.strictEqual(oBinding.oResumePromise, undefined);
	});

	//*********************************************************************************************
[false, true].forEach(function (bCanceled) {
	var sTitle = "createRefreshPromise/resolveRefreshPromise, canceled=" + bCanceled;

	QUnit.test(sTitle, function (assert) {
		var oBinding = new ODataParentBinding(),
			oError = new Error(),
			oErrorPromise = Promise.reject(oError),
			oRefreshPromise;

		oError.canceled = bCanceled;

		// code under test
		assert.notOk(oBinding.isRefreshWithoutBubbling());

		// code under test
		oRefreshPromise = oBinding.createRefreshPromise("~bPreventBubbling~");

		assert.strictEqual(oRefreshPromise, oBinding.oRefreshPromise);
		assert.strictEqual(oBinding.isRefreshWithoutBubbling(), "~bPreventBubbling~");

		// code under test
		assert.strictEqual(oBinding.resolveRefreshPromise(oErrorPromise), oErrorPromise);

		assert.strictEqual(oBinding.oRefreshPromise, null);
		assert.notOk(oBinding.isRefreshWithoutBubbling());

		// code under test
		assert.strictEqual(oBinding.resolveRefreshPromise("~n/a~"), "~n/a~");

		return oRefreshPromise.then(function () {
			assert.ok(bCanceled);
		}, function (oResult) {
			assert.notOk(bCanceled);
			assert.strictEqual(oResult, oError);
		});
	});
});

	//*********************************************************************************************
[undefined, "/Foo/1"].forEach(function (sPathPrefix) {
	[false, true].forEach(function (bIgnoreKeptAlive) {
	var sTitle = "hasPendingChangesInDependents: bIgnoreKeptAlive = " + bIgnoreKeptAlive
		+ " sPathPrefix = " + sPathPrefix;

	QUnit.test(sTitle, function (assert) {
		var oCache1 = {
				hasPendingChangesForPath : function () {}
			},
			oCache3_1 = {
				hasPendingChangesForPath : function () {}
			},
			oCache3_2 = {
				hasPendingChangesForPath : function () {}
			},
			oCache4 = {
				hasPendingChangesForPath : function () {}
			},
			oCache5 = {
				hasPendingChangesForPath : function () {}
			},
			oContext = {
				getIndex : function () { return undefined; },
				isEffectivelyKeptAlive : function () { return false; }
			},
			oContextWithIndex = {
				getIndex : function () { return 0; },
				isEffectivelyKeptAlive : function () { return false; }
			},
			oChild1 = new ODataParentBinding({
				oCache : oCache1,
				mCacheByResourcePath : {
					"Foo/1" : oCache1
				},
				oContext : oContext,
				mParameters : {$$ownRequest : "~$$ownRequest~"}
			}),
			oChild2 = new ODataParentBinding({
				oCache : null,
				oContext : oContext
			}),
			oChild3 = new ODataParentBinding({
				mCacheByResourcePath : {
					"Foo/1" : oCache3_1,
					"Foo/2" : oCache3_2
				},
				oCache : undefined,
				oContext : oContext
			}),
			oChild4 = new ODataParentBinding({
				oCache : oCache4,
				oContext : oContextWithIndex,
				mParameters : {$$ownRequest : "~$$ownRequest~"}
			}),
			oChild5 = new ODataParentBinding({
				oCache : oCache5,
				oContext : oContext
				// no mParameters here, simulate ODPrB (see BCP: 2280060324)
			}),
			oBinding = new ODataParentBinding({
				oModel : {
					withUnresolvedBindings : function () {}
				}
			}),
			oCache1Mock = this.mock(oCache1),
			oCache3_1Mock = this.mock(oCache3_1),
			oCache3_2Mock = this.mock(oCache3_2),
			oCache4Mock = this.mock(oCache4),
			oCache5Mock = this.mock(oCache5),
			oChild1Mock = this.mock(oChild1),
			oChild2Mock = this.mock(oChild2),
			oChild3Mock = this.mock(oChild3),
			oChild4Mock = this.mock(oChild4),
			oChild5Mock = this.mock(oChild5),
			bIgnoreTransient = bIgnoreKeptAlive ? "~$$ownRequest~" : false,
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("getDependentBindings").exactly(9).withExactArgs()
			.returns([oChild1, oChild2, oChild3, oChild4, oChild5]); // for all C.U.T
		oModelMock.expects("withUnresolvedBindings").never(); // this is overridden at the end...
		// these are overridden by and by
		// BEWARE: cannot override #never via #atLeast, only #exactly seems to work :-(
		oCache1Mock.expects("hasPendingChangesForPath").never();
		oCache3_1Mock.expects("hasPendingChangesForPath").never();
		oCache3_2Mock.expects("hasPendingChangesForPath").never();
		oCache4Mock.expects("hasPendingChangesForPath").never();
		oCache5Mock.expects("hasPendingChangesForPath").never();
		oChild1Mock.expects("hasPendingChangesInDependents").never();
		oChild2Mock.expects("hasPendingChangesInDependents").never();
		oChild3Mock.expects("hasPendingChangesInDependents").never();
		oChild4Mock.expects("hasPendingChangesInDependents").never();
		oChild5Mock.expects("hasPendingChangesInDependents").never();

		oCache1Mock.expects("hasPendingChangesForPath").withExactArgs("", false, bIgnoreTransient)
			.returns(true);

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix), true);

		oCache1Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreTransient).returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(true);

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix), true);

		oCache1Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreTransient).returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(true);

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix), true);

		oCache1Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreTransient).returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix), true);

		oCache1Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreTransient).returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		if (!sPathPrefix) {
			oCache3_1Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);
		} else {
			if (sPathPrefix === "/Foo/1") {
				oCache3_1Mock.expects("hasPendingChangesForPath")
					.withExactArgs("").returns(false);
			}
			oChild3Mock.expects("hasPendingChangesInDependents")
				.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(true);
		}

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix), true);

		oCache1Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreTransient).returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		if (!sPathPrefix) {
			oCache3_1Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(false);
			oCache3_2Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(true);
		} else {
			if (sPathPrefix === "/Foo/1") {
				oCache3_1Mock.expects("hasPendingChangesForPath")
					.withExactArgs("").returns(false);
			}
			oChild3Mock.expects("hasPendingChangesInDependents")
				.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(true);
		}

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix), true);

		oCache1Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreTransient).returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		if (!sPathPrefix) {
			oCache3_1Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(false);
			oCache3_2Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(false);
		} else if (sPathPrefix === "/Foo/1") {
			oCache3_1Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(false);
		}
		oChild3Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(true);

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix), true);

		oCache1Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreTransient).returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		if (!sPathPrefix) {
			oCache3_1Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
			oCache3_2Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		} else if (sPathPrefix === "/Foo/1") {
			oCache3_1Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(false);
		}
		oChild3Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oCache4Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, false).returns(false);
		oChild4Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(false, sPathPrefix).returns(true);

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix), true);

		oCache1Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreTransient).returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oChild3Mock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		if (!sPathPrefix) {
			oCache3_1Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(false);
			oCache3_2Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(false);
		} else if (sPathPrefix === "/Foo/1") {
			oCache3_1Mock.expects("hasPendingChangesForPath")
				.withExactArgs("").returns(false);
		}
		oChild3Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		oCache4Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, false).returns(false);
		oChild4Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(false, sPathPrefix).returns(false);
		oCache5Mock.expects("hasPendingChangesForPath")
			.withExactArgs("", false, bIgnoreKeptAlive ? undefined : false).returns(false);
		oChild5Mock.expects("hasPendingChangesInDependents")
			.withExactArgs(bIgnoreKeptAlive, sPathPrefix).returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs()
			.returns("/some/absolute/path");
		oModelMock.expects("withUnresolvedBindings")
			.withExactArgs("hasPendingChangesInCaches", "some/absolute/path").returns("~bResult~");

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix),
			"~bResult~");
	});
});
});

	//*********************************************************************************************
[false, true].forEach(function (bIgnoreKeptAlive) {
	var sTitle = "hasPendingChangesInDependents:setKeepAlive = " + bIgnoreKeptAlive;

	QUnit.test(sTitle, function (assert) {
		var oContext0 = {
				getIndex : function () { return 1; },
				isEffectivelyKeptAlive : function () {}
			},
			oContext1 = {
				getIndex : function () { return 1; },
				isEffectivelyKeptAlive : function () {}
			},
			oContext2 = {
				getIndex : function () { return undefined; },
				isEffectivelyKeptAlive : function () {}
			},
			oChild0 = new ODataParentBinding({
				oCache : undefined,
				oContext : oContext0
			}),
			oChild1 = new ODataParentBinding({
				oCache : undefined,
				oContext : oContext1
			}),
			oChild2 = new ODataParentBinding({
				oCache : undefined,
				oContext : oContext2
			}),
			oBinding = new ODataParentBinding();

		this.mock(oBinding).expects("getDependentBindings").withExactArgs()
			.returns([oChild0, oChild1, oChild2]);
		this.mock(oChild0).expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		this.mock(oChild0).expects("hasPendingChangesInDependents").withExactArgs(false, undefined)
			.returns(false);
		if (bIgnoreKeptAlive) {
			this.mock(oContext0).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
			this.mock(oContext1).expects("isEffectivelyKeptAlive").withExactArgs().returns(true);
			this.mock(oContext1).expects("getIndex").never();
			this.mock(oContext2).expects("isEffectivelyKeptAlive").withExactArgs().returns(false);
			this.mock(oChild1).expects("hasPendingChangesForPath").never();
			this.mock(oChild2).expects("hasPendingChangesForPath").withExactArgs("").returns(true);
		} else {
			this.mock(oContext0).expects("isEffectivelyKeptAlive").never();
			this.mock(oContext1).expects("isEffectivelyKeptAlive").never();
			this.mock(oContext2).expects("isEffectivelyKeptAlive").never();
			this.mock(oChild1).expects("hasPendingChangesForPath").withExactArgs("").returns(true);
			this.mock(oChild2).expects("hasPendingChangesForPath").never();
		}

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(bIgnoreKeptAlive), true);
	});
});

	//*********************************************************************************************
[undefined, "/Foo/1"].forEach(function (sPathPrefix) {
	QUnit.test("resetChangesInDependents, sPathPrefix: " + sPathPrefix, function (assert) {
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
					"Foo/1" : oCache31,
					"Foo/2" : oCache32
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
			.withExactArgs(sinon.match.same(aPromises), sPathPrefix)
			.callsFake(function (aPromises0) {
				aPromises0.push("foo");
			});
		this.mock(oChild1).expects("resetInvalidDataState").withExactArgs();
		this.mock(oChild2).expects("resetChangesInDependents")
			.withExactArgs(sinon.match.same(aPromises), sPathPrefix)
			.callsFake(function (aPromises0) {
				aPromises0.push("bar");
			});
		this.mock(oChild2).expects("resetInvalidDataState").withExactArgs();
		this.mock(oCache3).expects("resetChangesForPath").withExactArgs("");
		this.mock(oChild3).expects("resetChangesInDependents")
			.withExactArgs(sinon.match.same(aPromises), sPathPrefix)
			.callsFake(function (aPromises0) {
				aPromises0.push("baz");
			});
		this.mock(oChild3).expects("resetInvalidDataState").withExactArgs();
		this.mock(oCache31).expects("resetChangesForPath")
			.exactly(!sPathPrefix || sPathPrefix === "/Foo/1" ? 1 : 0)
			.withExactArgs("");
		this.mock(oCache32).expects("resetChangesForPath").exactly(!sPathPrefix ? 1 : 0)
			.withExactArgs("");

		// code under test
		oBinding.resetChangesInDependents(aPromises, sPathPrefix);

		assert.strictEqual(aPromises.length, 6);
		assert.ok(SyncPromise.isThenable(aPromises[0]));
		assert.strictEqual(aPromises[1], "foo");
		assert.strictEqual(aPromises[2], undefined);
		assert.strictEqual(aPromises[3], "bar");
		assert.ok(SyncPromise.isThenable(aPromises[4]));
		assert.strictEqual(aPromises[5], "baz");

		return Promise.all(aPromises);
	});
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
					oCache : {},
					oOperation : "~truthy~",
					// getPath must not be called
					requestSideEffects : function () {}
				},
				sGroupId = "group",
				oHelperMock = this.mock(_Helper),
				oModel = {
					getDependentBindings : function () {}
				},
				aPaths = [],
				aPaths0 = ["A"],
				aPaths1 = [/*empty!*/],
				aPaths3 = ["B"],
				aPaths4 = ["C"],
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
					sinon.match.same(aPromises),
					oFixture.bPrefix ? "~/n/a/toN" : "n/a/toN");
			oHelperMock.expects("stripPathPrefix")
				.withExactArgs(oFixture.bPrefix ? "~/baz" : "baz", sinon.match.same(aPaths))
				.returns(aPaths3);
			this.mock(oChild3).expects("requestSideEffects")
				.withExactArgs(sGroupId, sinon.match.same(aPaths3))
				.returns(oPromise3);
			oHelperMock.expects("stripPathPrefix")
				.withExactArgs(oFixture.bPrefix ? "~" : "", sinon.match.same(aPaths))
				.returns(aPaths4);
			this.mock(oChild4).expects("requestSideEffects")
				.withExactArgs(sGroupId, sinon.match.same(aPaths4))
				.returns(oPromise4);

			// code under test
			oBinding.visitSideEffects(sGroupId, aPaths, oFixture.oContext, aPromises,
				oFixture.bPrefix ? "~" : undefined);

			assert.deepEqual(aPromises, [oPromise0, oPromise3, oPromise4]);
		});
	});

	//*********************************************************************************************
	QUnit.test("isMeta", function (assert) {
		var oBinding = new ODataParentBinding();

		assert.strictEqual(oBinding.isMeta(), false);
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
		var oBinding = new ODataParentBinding();

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/path");

		// code under test
		assert.strictEqual(oBinding.getBaseForPathReduction(), "/resolved/path");
	});

	//*********************************************************************************************
[
	{parentGroup : "groupId", delegate : true},
	{parentGroup : "otherGroupId", isApiGroup : true, delegate : false},
	{parentGroup : "otherGroupId", isApiGroup : false, delegate : true}
].forEach(function (oFixture) {
	QUnit.test("getBaseForPathReduction: delegate to parent binding: " + JSON.stringify(oFixture),
			function (assert) {
		var oModel = {
				isApiGroup : function () {}
			},
			oParentBinding = new ODataParentBinding({oModel : oModel}),
			oContext = {
				getBinding : function () {
					return oParentBinding;
				}
			},
			oBinding = new ODataParentBinding({
				oContext : oContext,
				oModel : oModel
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("groupId");
		this.mock(oParentBinding).expects("getUpdateGroupId")
			.withExactArgs().returns(oFixture.parentGroup);
		this.mock(oParentBinding).expects("getBaseForPathReduction")
			.exactly(oFixture.delegate ? 1 : 0)
			.withExactArgs()
			.returns("/base/path");
		this.mock(oModel).expects("isApiGroup").exactly("isApiGroup" in oFixture ? 1 : 0)
			.withExactArgs(oFixture.parentGroup)
			.returns(oFixture.isApiGroup);
		this.mock(oBinding).expects("getResolvedPath").exactly(oFixture.delegate ? 0 : 1)
			.withExactArgs().returns("/resolved/path");

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
		this.mock(_Helper).expects("clone").never();

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
		this.mock(_Helper).expects("clone").never();

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
			bProcessedNamespace = false,
			bProcessedQualifiedName = false,
			bProcessedStarOperator = false,
			oPromise,
			mQueryOptionsFromParameters = {
				$select : ["foo", "bar", "qualified.Name", "namespace.*", "*"],
				$expand : {}
			},
			mQueryOptionsAsString = JSON.stringify(mQueryOptionsFromParameters),
			mResolvedQueryOptions = {};

		this.mock(oBinding).expects("getQueryOptionsFromParameters").withExactArgs()
			.returns(mQueryOptionsFromParameters);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
			.returns("/resolved/path");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved/path")
			.returns("/meta/path");
		oHelperMock.expects("clone")
			.withExactArgs(sinon.match.same(mQueryOptionsFromParameters)).returns("~clone~");
		this.mock(Object).expects("assign").withExactArgs({}, "~clone~", {$select : []})
			.returns(mResolvedQueryOptions);
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs("fnFetchMetadata", "/meta/path/foo")
			.returns(Promise.resolve().then(function () {
				var mChildQueryOptions = {};

				oHelperMock.expects("wrapChildQueryOptions")
					.withExactArgs("/meta/path", "foo", {}, "fnFetchMetadata")
					.returns(mChildQueryOptions);
				oHelperMock.expects("aggregateExpandSelect")
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
				oHelperMock.expects("aggregateExpandSelect")
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
					.withExactArgs("/meta/path", "qualified.Name", {}, "fnFetchMetadata")
					.returns(undefined);
				oHelperMock.expects("addToSelect")
					.withExactArgs(sinon.match.same(mResolvedQueryOptions), ["qualified.Name"])
					.callsFake(function () {
						bProcessedQualifiedName = true;
					});
			}));
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs("fnFetchMetadata", "/meta/path/namespace.")
			.returns(Promise.resolve().then(function () {
				oHelperMock.expects("wrapChildQueryOptions")
					.withExactArgs("/meta/path", "namespace.*", {}, "fnFetchMetadata")
					.returns(undefined);
				oHelperMock.expects("addToSelect")
					.withExactArgs(sinon.match.same(mResolvedQueryOptions), ["namespace.*"])
					.callsFake(function () {
						bProcessedNamespace = true;
					});
			}));
		oHelperMock.expects("fetchPropertyAndType")
			.withExactArgs("fnFetchMetadata", "/meta/path/*")
			.returns(Promise.resolve().then(function () {
				oHelperMock.expects("wrapChildQueryOptions")
					.withExactArgs("/meta/path", "*", {}, "fnFetchMetadata")
					.returns(undefined);
				oHelperMock.expects("addToSelect")
					.withExactArgs(sinon.match.same(mResolvedQueryOptions), ["*"])
					.callsFake(function () {
						bProcessedStarOperator = true;
					});
			}));

		// code under test
		oPromise = oBinding.fetchResolvedQueryOptions(oContext);

		assert.strictEqual(oPromise.isPending(), true);

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, mResolvedQueryOptions);
			assert.strictEqual(bProcessedBar, true);
			assert.strictEqual(bProcessedFoo, true);
			assert.strictEqual(bProcessedNamespace, true);
			assert.strictEqual(bProcessedQualifiedName, true);
			assert.strictEqual(bProcessedStarOperator, true);
			assert.strictEqual(JSON.stringify(mQueryOptionsFromParameters), mQueryOptionsAsString,
				"original query options unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("allow for super calls", function (assert) {
		var oBinding = new ODataParentBinding();

		[
			"adjustPredicate",
			"destroy",
			"doDeregisterChangeListener",
			"getGeneration",
			"hasPendingChangesForPath",
			"isUnchangedParameter",
			"updateAfterCreate"
		].forEach(function (sMethod) {
			assert.strictEqual(asODataParentBinding.prototype[sMethod], oBinding[sMethod]);
		});
	});

	//*********************************************************************************************
	QUnit.test("getInheritableQueryOptions: own mCacheQueryOptions", function (assert) {
		var oBinding = new ODataParentBinding({
				mCacheQueryOptions : {}
			});

		assert.strictEqual(
			// code under test
			oBinding.getInheritableQueryOptions(),
			oBinding.mCacheQueryOptions
		);
	});

	//*********************************************************************************************
	QUnit.test("getInheritableQueryOptions: with mLateQueryOptions", function (assert) {
		var oBinding = new ODataParentBinding({
				mCacheQueryOptions : {},
				mLateQueryOptions : {}
			}),
			mMergedOptions = {};

		this.mock(_Helper).expects("merge")
			.withExactArgs({}, sinon.match.same(oBinding.mCacheQueryOptions),
				sinon.match.same(oBinding.mLateQueryOptions))
			.returns(mMergedOptions);

		assert.strictEqual(
			// code under test
			oBinding.getInheritableQueryOptions(),
			mMergedOptions
		);
	});

	//*********************************************************************************************
	QUnit.test("getInheritableQueryOptions: inherit from parent", function (assert) {
		var oBinding = new ODataParentBinding({
				oContext : {
					getBinding : function () {}
				},
				sPath : "~path~"
			}),
			mCacheQueryOptions = {},
			mCacheQueryOptionsForPath = {},
			oParentBinding = new ODataParentBinding();

		this.mock(oBinding.oContext).expects("getBinding").withExactArgs().returns(oParentBinding);
		this.mock(oParentBinding).expects("getInheritableQueryOptions").withExactArgs()
			.returns(mCacheQueryOptions);
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(mCacheQueryOptions), "~path~")
			.returns(mCacheQueryOptionsForPath);

		assert.strictEqual(
			// code under test
			oBinding.getInheritableQueryOptions(),
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

	//*********************************************************************************************
	QUnit.test("getGeneration", function (assert) {
		var oBinding = new ODataParentBinding();

		// code under test
		assert.strictEqual(oBinding.getGeneration(), 0);

		oBinding = new ODataParentBinding({
			oContext : {
				getGeneration : function () {}
			},
			bRelative : true
		});
		this.mock(oBinding.oContext).expects("getGeneration").withExactArgs().returns(42);

		// code under test
		assert.strictEqual(oBinding.getGeneration(), 42);

		oBinding = new ODataParentBinding({
			oContext : {},
			bRelative : true
		});

		// code under test
		assert.strictEqual(oBinding.getGeneration(), 0);
	});

	//*********************************************************************************************
	QUnit.test("onDelete: context", function (assert) {
		var oBinding = new ODataParentBinding({
				delete : function () {},
				findContextForCanonicalPath : function () {},
				oModel : {
					getDependentBindings : function () {}
				}
			}),
			oContext = {
				getPath : function () {}
			},
			oDependentBinding1 = {
				resetChanges : function () {}
			},
			oDependentBinding2 = {
				resetChanges : function () {}
			},
			iResets = 0;

		function reset() {
			iResets += 1;
		}

		this.mock(oBinding).expects("findContextForCanonicalPath").withExactArgs("/canonical/path")
			.returns(oContext);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/context/path");
		this.mock(oBinding).expects("getRelativePath").withExactArgs("/context/path")
			.returns("relative/path");
		this.mock(oBinding).expects("resetChangesForPath").withExactArgs("relative/path", [])
			.callsFake(reset);
		this.mock(oBinding.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext))
			.returns([oDependentBinding1, oDependentBinding2]);
		this.mock(oDependentBinding1).expects("resetChanges").withExactArgs().callsFake(reset);
		this.mock(oDependentBinding2).expects("resetChanges").withExactArgs().callsFake(reset);
		this.mock(oBinding).expects("delete")
			.withExactArgs(null, "canonical/path", sinon.match.same(oContext))
			.callsFake(function () {
				assert.strictEqual(iResets, 3);
			});

		// code under test
		oBinding.onDelete("/canonical/path");
	});

	//*********************************************************************************************
	QUnit.test("onDelete: no context", function () {
		var oBinding = new ODataParentBinding({
				findContextForCanonicalPath : function () {}
			});

		this.mock(oBinding).expects("findContextForCanonicalPath").withExactArgs("/canonical/path")
			.returns(undefined);
		this.mock(oBinding).expects("resetChangesForPath").never();

		// code under test
		oBinding.onDelete("/canonical/path");
	});

	//*********************************************************************************************
	QUnit.test("updateAfterCreate", function (assert) {
		var oBinding = new ODataParentBinding(),
			oDependent0 = {
				updateAfterCreate : function () {}
			},
			bDependent0Updated = false,
			oDependent1 = {
				updateAfterCreate : function () {}
			},
			bDependent1Updated = false,
			oPromise;

		this.mock(oBinding).expects("getDependentBindings").withExactArgs()
			.returns([oDependent0, oDependent1]);
		this.mock(oDependent0).expects("updateAfterCreate")
			.withExactArgs("~bSkipRefresh~", "~sGroupId~")
			.returns(new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependent0Updated = true;
					resolve();
				});
			}));
		this.mock(oDependent1).expects("updateAfterCreate")
			.withExactArgs("~bSkipRefresh~", "~sGroupId~")
			.returns(new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependent1Updated = true;
					resolve();
				});
			}));

		// code under test
		oPromise = oBinding.updateAfterCreate("~bSkipRefresh~", "~sGroupId~").then(function () {
			assert.strictEqual(bDependent0Updated, true);
			assert.strictEqual(bDependent1Updated, true);
		});

		assert.ok(oPromise.isPending(), "a SyncPromise");
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
