/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding"
], function (jQuery, ChangeReason, Context, _Helper, _SyncPromise, ODataModel,
		asODataParentBinding) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0, max-nested-callbacks: 0*/
	"use strict";

	/**
	 * Returns a clone, that is a deep copy, of the given object.
	 *
	 * @param {object} o
	 *   any serializable object
	 * @returns {object}
	 *   a deep copy of <code>o</code>
	 */
	function clone(o) {
		return JSON.parse(JSON.stringify(o));
	}

	/**
	 * Constructs a test object.
	 *
	 * @param {object} [oTemplate={}]
	 *   A template object to fill the binding, all properties are copied
	 */
	function ODataParentBinding(oTemplate) {
		oTemplate = oTemplate || {};
		if (!("oCachePromise" in oTemplate)) {
			oTemplate.oCachePromise = _SyncPromise.resolve(); // mimic c'tor
		}
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
				fnErrorCallback = function () {},
				sPath = "SO_2_SOITEM/42",

				oResult = {};

			this.mock(oCache).expects("update")
				.withExactArgs(sGroupId || "myUpdateGroup", "bar", Math.PI,
					sinon.match.same(fnErrorCallback), "edit('URL')", sPath)
				.returns(Promise.resolve(oResult));

			// code under test
			return oBinding.updateValue(sGroupId, "bar", Math.PI, fnErrorCallback, "edit('URL')",
					sPath)
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
			fnErrorCallback = function () {},
			oResult = {};

		this.mock(_Helper).expects("buildPath").withExactArgs("PRODUCT_2_BP", "BP_2_XYZ/42")
			.returns("~BP_2_XYZ/42~");
		this.mock(oBinding.oContext).expects("updateValue")
			.withExactArgs("up", "bar", Math.PI, sinon.match.same(fnErrorCallback), "edit('URL')",
				"~BP_2_XYZ/42~")
			.returns(Promise.resolve(oResult));

		this.mock(oBinding).expects("getUpdateGroupId").never();

		// code under test
		return oBinding.updateValue("up", "bar", Math.PI, fnErrorCallback, "edit('URL')",
				"BP_2_XYZ/42")
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
	}, { // $expand(FooSet=$expand(BarSet=$select(Baz)))
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
		path : "15/FooSet('0815')/12/BarSet",
		result : {
			$select : "Baz"
		}
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
			var oModel = new ODataModel({
					serviceUrl : "/service/?sap-client=111",
					synchronizationMode : "None"
				}),
				oBinding = new ODataParentBinding({
					oModel : oModel,
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
				}),
				oBindingMock = this.mock(oBinding);

			oBindingMock.expects("hasPendingChanges").returns(false);
			oBindingMock.expects("applyParameters")
				.withExactArgs(oFixture.mExpectedParameters, ChangeReason.Change);

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
				oModel : {},
				mParameters : {},
				sPath : "/EMPLOYEES"
			});

		this.mock(oBinding).expects("hasPendingChanges").returns(false);

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
		childPath : "Property",
		childQueryOptions : {},
		expected : {$select : ["Property"]}
	}, {
		childPath : "NavigationProperty",
		childQueryOptions : {
			$select : ["Property"]
		},
		expected : {
			$expand : {
				"NavigationProperty" : {
					$select: ["Property", "Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "NavigationProperty/Property",
		childQueryOptions : {},
		expected : {
			$expand : {
				"NavigationProperty" : {
					$select: ["Property_1", "Property_2", "Property"]
				}
			}
		}
	}, {
		childPath : "NavigationProperty/Property_1",
		childQueryOptions : {},
		expected : {
			$expand : {
				"NavigationProperty" : {
					$select: ["Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "Property/NavigationProperty",
		childQueryOptions : {},
		expected : {
			$expand : {
				"Property/NavigationProperty" : {
					$select: ["Property_1", "Property_2"]
				}
			}
		}
	}, {
		childPath : "Property_1/Property_2",
		childQueryOptions : {},
		expected : {$select : ["Property_1/Property_2"]}
	}, {
		childPath : "NavigationProperty_1/NavigationProperty_2",
		childQueryOptions : {$foo : "bar"}, // will be taken as is
		expected : {
			$expand : {
				"NavigationProperty_1" : {
					$expand : {
						"NavigationProperty_2" : {
							$foo : "bar",
							$select: ["Property_1", "Property_2"]
						}
					},
					$select: ["Property_1", "Property_2"]
				}
			}
		}
	}].forEach(function (oFixture) {
		QUnit.test("wrapChildQueryOptions, " + oFixture.childPath, function (assert) {
			var oMetaModel = {
					getObject : function () {}
				},
				aMetaPathSegments = oFixture.childPath === ""
					? []
					: oFixture.childPath.split("/"),
				oBinding = new ODataParentBinding({
					oModel : {getMetaModel : function () {return oMetaModel;}}
				}),
				mWrappedQueryOptions,
				oMetaModelMock = this.mock(oMetaModel);

			aMetaPathSegments.forEach(function (sSegment, j, aMetaPathSegments) {
				var sPropertyMetaPath = "/EMPLOYEES/" + aMetaPathSegments.slice(0, j + 1).join("/"),
					sKind = sSegment.split("_")[0];

				oMetaModelMock.expects("getObject")
					.withExactArgs(sPropertyMetaPath)
					.returns({$kind : sKind});
				if (sKind === "NavigationProperty") {
					oMetaModelMock.expects("getObject")
						.withExactArgs(sPropertyMetaPath + "/")
						.returns({$Key : ["Property_1", "Property_2"]});
				}
			});

			// code under test
			mWrappedQueryOptions = oBinding.wrapChildQueryOptions("/EMPLOYEES", oFixture.childPath,
				oFixture.childQueryOptions);

			assert.deepEqual(mWrappedQueryOptions, oFixture.expected);
		});
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions: empty path", function (assert) {
		var oBinding = new ODataParentBinding(),
			mChildQueryOptions = {};

		// code under test
		assert.strictEqual(
			oBinding.wrapChildQueryOptions("/...", "", mChildQueryOptions),
			mChildQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions, returns undefined if $apply is present", function (assert) {
		var mChildQueryOptions = {
				$apply : "filter(Amount gt 3)"
			},
			oMetaModel = {
				getObject : function () {}
			},
			oMetaModelMock = this.mock(oMetaModel),
			oBinding = new ODataParentBinding({
				oModel : {getMetaModel : function () {return oMetaModel;}}
			});

		oMetaModelMock.expects("getObject")
			.withExactArgs("/EMPLOYEES/NavigationProperty")
			.returns({$kind : "NavigationProperty"});
		oMetaModelMock.expects("getObject")
			.withExactArgs("/EMPLOYEES/NavigationProperty/")
			.returns({});
		this.oLogMock.expects("debug").withExactArgs(
			"Cannot wrap $apply into $expand: NavigationProperty",
			JSON.stringify(mChildQueryOptions), "sap.ui.model.odata.v4.ODataParentBinding"
		);

		// code under test
		assert.strictEqual(
			oBinding.wrapChildQueryOptions("/EMPLOYEES", "NavigationProperty", mChildQueryOptions),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions, child path with bound function", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			oBinding = new ODataParentBinding({
				oModel : {getMetaModel : function () {return oMetaModel;}}
			});

		this.mock(oMetaModel).expects("getObject")
			.withExactArgs("/EMPLOYEES/name.space.boundFunction")
			.returns({$kind : "Function"});

		// code under test
		assert.strictEqual(
			oBinding.wrapChildQueryOptions("/EMPLOYEES", "name.space.boundFunction/Property", {}),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("wrapChildQueryOptions, structural property w/ query options", function (assert) {
		var oMetaModel = {
				getObject : function () {}
			},
			oBinding = new ODataParentBinding({
				oModel : {getMetaModel : function () {return oMetaModel;}}
			}),
			mChildLocalQueryOptions = {$apply : "filter(AGE gt 42)"};

		this.mock(oMetaModel).expects("getObject")
			.withExactArgs("/EMPLOYEES/Property")
			.returns({$kind : "Property"});
		this.oLogMock.expects("error").withExactArgs(
			"Failed to enhance query options for auto-$expand/$select as the child "
				+ "binding has query options, but its path 'Property' points to a "
				+ "structural property",
			JSON.stringify(mChildLocalQueryOptions),
			"sap.ui.model.odata.v4.ODataParentBinding");

		// code under test
		assert.strictEqual(oBinding.wrapChildQueryOptions("/EMPLOYEES", "Property",
			mChildLocalQueryOptions), undefined);
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
	}].forEach(function (oFixture, i) {
		QUnit.test("aggregateQueryOptions returns true: " + i, function (assert) {
			var oBinding = new ODataParentBinding({
					mAggregatedQueryOptions : oFixture.aggregatedQueryOptions,
					oCachePromise : _SyncPromise.resolve(Promise.resolve()) // pending!
				}),
				bMergeSuccess;

			// code under test
			bMergeSuccess = oBinding.aggregateQueryOptions(oFixture.childQueryOptions);

			assert.deepEqual(oBinding.mAggregatedQueryOptions, oFixture.expectedQueryOptions);
			assert.strictEqual(bMergeSuccess, true);
		});
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
				mOriginalQueryOptions = jQuery.extend(true, {}, oFixture.aggregatedQueryOptions),
				bMergeSuccess;

			// code under test
			bMergeSuccess = oBinding.aggregateQueryOptions(oFixture.childQueryOptions);

			assert.deepEqual(oBinding.mAggregatedQueryOptions, mOriginalQueryOptions);
			assert.strictEqual(bMergeSuccess, false);
		});
	});

	//*********************************************************************************************
	[{
		aggregatedQueryOptions : {},
		canMergeQueryOptions : true,
		hasChildQueryOptions : true,
		$kind : "Property"
	}, {
		aggregatedQueryOptions : {$select : "foo"},
		canMergeQueryOptions : true,
		hasChildQueryOptions : true,
		$kind : "Property"
	}, {
		aggregatedQueryOptions : {},
		canMergeQueryOptions : true,
		hasChildQueryOptions : true,
		$kind : "NavigationProperty"
	}, {
		aggregatedQueryOptions : {$select : "foo"},
		canMergeQueryOptions : true,
		hasChildQueryOptions : true,
		$kind : "NavigationProperty"
	}, {
		aggregatedQueryOptions : {},
		canMergeQueryOptions : true,
		hasChildQueryOptions : false, // child path has segments which are no properties
		$kind : "Property"
	}, {
		aggregatedQueryOptions : {},
		canMergeQueryOptions : true,
		hasChildQueryOptions : false, // child path has segments which are no properties
		$kind : "Property"
	}, {
		aggregatedQueryOptions : {},
		canMergeQueryOptions : false,
		hasChildQueryOptions : true,
		$kind : "NavigationProperty"
	}].forEach(function (oFixture) {
		QUnit.test("fetchIfChildCanUseCache, multiple calls aggregate query options, no cache yet: "
				+ JSON.stringify(oFixture),
			function (assert) {
				var mAggregatedQueryOptions = oFixture.aggregatedQueryOptions || {},
					oMetaModel = {
						fetchObject : function () {},
						getMetaPath : function () {}
					},
					oBinding = new ODataParentBinding({
						mAggregatedQueryOptions : oFixture.aggregatedQueryOptions,
						// cache will be created, waiting for child bindings
						oCachePromise : _SyncPromise.resolve(oFixture.isUnresolved
							? undefined : Promise.resolve()),
						aChildCanUseCachePromises : [],
						oContext : {},
						wrapChildQueryOptions : function () {},
						doFetchQueryOptions : function () {},
						aggregateQueryOptions : function () {},
						oModel : {getMetaModel : function () {return oMetaModel;}}
					}),
					oBindingMock = this.mock(oBinding),
					mChildLocalQueryOptions = {},
					mChildQueryOptions = oFixture.hasChildQueryOptions ? {} : undefined,
					oContext = Context.create(this.oModel, oBinding, "/EMPLOYEES('2')"),
					mLocalQueryOptions = {},
					oMetaModelMock = this.mock(oMetaModel),
					oPromise;

				oMetaModelMock.expects("getMetaPath")
					.withExactArgs("/EMPLOYEES('2')")
					.returns("/EMPLOYEES");
				oMetaModelMock.expects("getMetaPath")
					.withExactArgs("/childPath")
					.returns("/childMetaPath");
				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oBinding.oContext))
					.returns(_SyncPromise.resolve(mLocalQueryOptions));
				oMetaModelMock.expects("fetchObject")
					.withExactArgs("/EMPLOYEES/childMetaPath")
					.returns(_SyncPromise.resolve({$kind : oFixture.$kind}));
				this.mock(jQuery).expects("extend")
					.exactly(Object.keys(oFixture.aggregatedQueryOptions).length ? 0 : 1)
					.withExactArgs(true, {}, sinon.match.same(mLocalQueryOptions))
					.returns(mAggregatedQueryOptions);
				if (oFixture.$kind === "NavigationProperty") {
					oBindingMock.expects("selectKeyProperties").never();
					oMetaModelMock.expects("fetchObject")
						.withExactArgs("/EMPLOYEES/childMetaPath/")
						.returns(Promise.resolve().then(function () {
							oBindingMock.expects("selectKeyProperties")
								.withExactArgs(sinon.match.same(mLocalQueryOptions), "/EMPLOYEES");
						}));
				} else {
					oBindingMock.expects("selectKeyProperties")
						.withExactArgs(sinon.match.same(mLocalQueryOptions), "/EMPLOYEES");
				}
				oBindingMock.expects("wrapChildQueryOptions")
					.withExactArgs("/EMPLOYEES", "childMetaPath",
						sinon.match.same(mChildLocalQueryOptions))
					.returns(mChildQueryOptions);
				oBindingMock.expects("aggregateQueryOptions")
					.exactly(oFixture.hasChildQueryOptions ? 1 : 0)
					.withExactArgs(sinon.match.same(mChildQueryOptions))
					.returns(oFixture.canMergeQueryOptions);

				// code under test
				oPromise = oBinding.fetchIfChildCanUseCache(oContext, "childPath",
					_SyncPromise.resolve(mChildLocalQueryOptions));

				return oPromise.then(function (bUseCache) {
					assert.strictEqual(bUseCache,
							oFixture.hasChildQueryOptions && oFixture.canMergeQueryOptions);
					assert.strictEqual(oBinding.aChildCanUseCachePromises[0], oPromise);
					assert.strictEqual(oBinding.mAggregatedQueryOptions, mAggregatedQueryOptions);
				});
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: empty child path", function (assert) {
		var oMetaModel = {
				fetchObject : function () {},
				getMetaPath : function () {}
			},
			oBinding = new ODataParentBinding({
				mAggregatedQueryOptions : {},
				aChildCanUseCachePromises : [],
				oContext : {},
				wrapChildQueryOptions : function () {},
				doFetchQueryOptions : function () {},
				aggregateQueryOptions : function () {},
				oModel : {getMetaModel : function () {return oMetaModel;}}
			}),
			oBindingMock = this.mock(oBinding),
			mChildQueryOptions = {},
			mWrappedChildQueryOptions = {},
			oContext = Context.create(this.oModel, oBinding, "/TEAMS/0", 0),
			mLocalQueryOptions = {},
			oMetaModelMock = this.mock(oMetaModel),
			oPromise;

		oMetaModelMock.expects("getMetaPath").withExactArgs("/TEAMS/0").returns("/TEAMS");
		oMetaModelMock.expects("getMetaPath").withExactArgs("/").returns("/");
		oBindingMock.expects("doFetchQueryOptions")
			.withExactArgs(sinon.match.same(oBinding.oContext))
			.returns(_SyncPromise.resolve(mLocalQueryOptions));
		oMetaModelMock.expects("fetchObject").withExactArgs("/TEAMS")
			.returns(_SyncPromise.resolve({$kind : "EntitySet"}));
		oBindingMock.expects("selectKeyProperties")
			.withExactArgs(sinon.match.same(mLocalQueryOptions), "/TEAMS");
		oBindingMock.expects("wrapChildQueryOptions")
			.withExactArgs("/TEAMS", "", sinon.match.same(mChildQueryOptions))
			.returns(mWrappedChildQueryOptions);
		oBindingMock.expects("aggregateQueryOptions")
			.withExactArgs(sinon.match.same(mWrappedChildQueryOptions))
			.returns(true);

		// code under test
		oPromise = oBinding.fetchIfChildCanUseCache(oContext, "",
			_SyncPromise.resolve(mChildQueryOptions));

		return oPromise.then(function (bUseCache) {
			assert.strictEqual(bUseCache, true);
			assert.deepEqual(oBinding.aChildCanUseCachePromises, [oPromise]);
		});
	});

	//*********************************************************************************************
	[{
		oProperty : {$kind : "notAProperty"},
		sPath : "/EMPLOYEE_2_TEAM/INVALID"
	}, {
		oProperty : undefined,
		sPath : "/EMPLOYEE_2_TEAM/My$count"
	}].forEach(function (oFixture, i) {
		QUnit.test("fetchIfChildCanUseCache, error handling, " + i, function (assert) {
			var oMetaModel = {
					fetchObject : function () {},
					getMetaPath : function () {}
				},
				mOriginalAggregatedQueryOptions = {$expand : { "foo" : {$select : ["bar"]}}},
				oBinding = new ODataParentBinding({
					mAggregatedQueryOptions : mOriginalAggregatedQueryOptions,
					// cache will be created, waiting for child bindings
					oCachePromise : _SyncPromise.resolve(Promise.resolve()),
					doFetchQueryOptions : function () {
						return _SyncPromise.resolve({});
					},
					oModel : {getMetaModel : function () {return oMetaModel;}},
					aChildCanUseCachePromises : [],
					bRelative : false
				}),
				oContext = Context.create(this.oModel, oBinding, "/EMPLOYEES('2')"),
				oMetaModelMock = this.mock(oMetaModel),
				sPath = oFixture.sPath,
				oPromise;

			oMetaModelMock.expects("getMetaPath")
				.withExactArgs("/EMPLOYEES('2')")
				.returns("/EMPLOYEES");
			oMetaModelMock.expects("getMetaPath")
				.withExactArgs(sPath)
				.returns(sPath);
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("/EMPLOYEES" + sPath)
				.returns(_SyncPromise.resolve(oFixture.oProperty));
			this.mock(oBinding).expects("selectKeyProperties")
				.withExactArgs(sinon.match.object, "/EMPLOYEES");
			this.oLogMock.expects("error").withExactArgs(
				"Failed to enhance query options for auto-$expand/$select as the child "
					+ "binding's path '" + sPath.slice(1)
					+ "' does not point to a property",
				JSON.stringify(oFixture.oProperty),
				"sap.ui.model.odata.v4.ODataParentBinding");

			// code under test
			oPromise = oBinding.fetchIfChildCanUseCache(oContext, sPath.slice(1));

			return oPromise.then(function (bUseCache) {
				assert.strictEqual(bUseCache, false);
				assert.deepEqual(oBinding.mAggregatedQueryOptions, mOriginalAggregatedQueryOptions);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: $count in child path", function (assert) {
		var oBinding = new ODataParentBinding({
			oModel : {getMetaModel : function () {return {};}}
		});

		// code under test
		assert.strictEqual(oBinding.fetchIfChildCanUseCache(null, "$count").getResult(), true);
		assert.strictEqual(oBinding.fetchIfChildCanUseCache(null, "EMPLOYEE_2_EQUIPMENTS/$count")
			.getResult(), true);
	});

	//*********************************************************************************************
	QUnit.test("fetchIfChildCanUseCache: operation binding", function (assert) {
		var oBinding = new ODataParentBinding({
			oModel : {getMetaModel : function () {return {};}},
			oOperation : {}
		});

		// code under test
		assert.strictEqual(
			oBinding.fetchIfChildCanUseCache(/*arguments do not matter*/).getResult(),
			true);
	});

	//*********************************************************************************************
	[
		// cache is already created or failed, treat both cases the same way!
		{isPending : function () {return false;}},
		// Note: when ODLB removes its virtual context, dependent binding are destroyed and forget
		// their cache promise; if any call to their fetchIfChildCanUseCache() has been waiting too
		// long (e.g. for $metadata) aggregateQueryOptions() can well be called on a destroyed
		// binding
		// @see ODataModel.integration.qunit.js
		//      "Auto-$expand/$select: no canonical path for virtual context"
		undefined
	].forEach(function (oCachePromise) {
		var sTitle = "aggregateQueryOptions: cache already created; promise = " + oCachePromise;

		QUnit.test(sTitle, function (assert) {
			var mAggregatedQueryOptions = {
					$expand : {
						"EMPLOYEE_2_TEAM" : {}
					},
					$select : ["Name", "AGE"]
				},
				oBinding = new ODataParentBinding({
					mAggregatedQueryOptions : clone(mAggregatedQueryOptions),
					oCachePromise : oCachePromise
				});

			// code under test
			assert.strictEqual(
				oBinding.aggregateQueryOptions({$select : ["Name"]}),
				true, "same $select as before");
			assert.deepEqual(oBinding.mAggregatedQueryOptions, mAggregatedQueryOptions);

			// code under test
			assert.strictEqual(
				oBinding.aggregateQueryOptions({$select : ["ROOM_ID"]}),
				false, "new $select is not allowed");
			assert.deepEqual(oBinding.mAggregatedQueryOptions, mAggregatedQueryOptions);

			// code under test
			assert.strictEqual(
				oBinding.aggregateQueryOptions({$expand : {"EMPLOYEE_2_TEAM" : {}}}),
				true, "same $expand as before");
			assert.deepEqual(oBinding.mAggregatedQueryOptions, mAggregatedQueryOptions);

			// code under test
			assert.strictEqual(
				oBinding.aggregateQueryOptions({$expand : {"EMPLOYEE_2_EQUIPMENTS" : {}}}),
				false, "new $expand is not allowed");
			assert.deepEqual(oBinding.mAggregatedQueryOptions, mAggregatedQueryOptions);
		});
	});

	//*********************************************************************************************
	["$auto", undefined].forEach(function (sGroupId) {
		QUnit.test("deleteFromCache(" + sGroupId + ") : binding w/ cache", function (assert) {
			var oCache = {
					_delete : function () {}
				},
				oBinding = new ODataParentBinding({
					oCachePromise : _SyncPromise.resolve(oCache),
					getUpdateGroupId : function () {}
				}),
				fnCallback = {},
				oResult = {};

			this.mock(oBinding).expects("getUpdateGroupId").exactly(sGroupId ? 0 : 1)
				.withExactArgs().returns("$auto");
			this.mock(oCache).expects("_delete")
				.withExactArgs("$auto", "EMPLOYEES('1')", "1/EMPLOYEE_2_EQUIPMENTS/3",
					sinon.match.same(fnCallback))
				.returns(_SyncPromise.resolve(oResult));

			assert.strictEqual(
				oBinding.deleteFromCache(sGroupId, "EMPLOYEES('1')", "1/EMPLOYEE_2_EQUIPMENTS/3",
					fnCallback).getResult(),
				oResult);
		});
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
				oCachePromise : _SyncPromise.resolve(),
				oContext : oContext,
				getUpdateGroupId : function () {},
				sPath : "TEAM_2_EMPLOYEES"
			}),
			fnCallback = {},
			oResult = {};

		this.mock(_Helper).expects("buildPath")
			.withExactArgs(42, "TEAM_2_EMPLOYEES", "1/EMPLOYEE_2_EQUIPMENTS/3")
			.returns("~");
		this.mock(oParentBinding).expects("deleteFromCache")
			.withExactArgs("$auto", "EQUIPMENTS('3')", "~", sinon.match.same(fnCallback))
			.returns(_SyncPromise.resolve(oResult));

		assert.strictEqual(
			oBinding.deleteFromCache("$auto", "EQUIPMENTS('3')", "1/EMPLOYEE_2_EQUIPMENTS/3",
				fnCallback).getResult(),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: check group ID", function (assert) {
		var oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve({_delete : function () {}}),
				getUpdateGroupId : function () {}
			}),
			fnCallback = {};

		assert.throws(function () {
			oBinding.deleteFromCache("myGroup");
		}, new Error("Illegal update group ID: myGroup"));

		this.mock(oBinding).expects("getUpdateGroupId").returns("myGroup");

		assert.throws(function () {
			oBinding.deleteFromCache();
		}, new Error("Illegal update group ID: myGroup"));

		this.mock(oBinding.oCachePromise.getResult()).expects("_delete")
			.withExactArgs("$direct", "EMPLOYEES('1')", "42", sinon.match.same(fnCallback))
			.returns(Promise.resolve());

		return oBinding.deleteFromCache("$direct", "EMPLOYEES('1')", "42", fnCallback).then();
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: cache is not yet available", function (assert) {
		var oBinding = new ODataParentBinding({
				// simulate pending cache creation
				oCachePromise : _SyncPromise.resolve(Promise.resolve({ /* cache */}))
			});

		assert.throws(function () {
			oBinding.deleteFromCache("$auto");
		}, new Error("DELETE request not allowed"));
	});

	//*********************************************************************************************
	QUnit.test("deleteFromCache: no delete on deferred operation", function (assert) {
		var oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve(Promise.resolve({ /* cache */})),
				oOperation : {}
			});

		assert.throws(function () {
			oBinding.deleteFromCache("$auto");
		}, new Error("Cannot delete a deferred operation"));
	});

	//*********************************************************************************************
	[
		{sPath : "/Employees"}, // absolute binding
		{sPath : "TEAM_2_MANAGER"}, // relative binding without context
		{sPath : "/Employees(ID='1')", oContext : {}} // absolute binding with context (edge case)
	].forEach(function (oFixture) {
		QUnit.test("checkUpdate: absolute binding or relative binding without context"
				+ JSON.stringify(oFixture),
			function (assert) {
				var bRelative = oFixture.sPath[0] !== '/',
					oBinding = new ODataParentBinding({
						oCachePromise : _SyncPromise.resolve(
							bRelative ? undefined : { /* cache */}),
						oContext : oFixture.oContext,
						oModel : {
							getDependentBindings : function () {}
						},
						sPath : oFixture.sPath,
						bRelative : bRelative
					}),
					fnGetContext = function () {
						return {
							created : function () {
								return;
							}
						};
					},
					oDependent0 = {
						checkUpdate : function () {},
						getContext : fnGetContext
					},
					oDependent1 = {
						checkUpdate : function () {},
						getContext : fnGetContext
					};

				this.mock(oBinding.oModel).expects("getDependentBindings")
					.withExactArgs(sinon.match.same(oBinding), true)
					.returns([oDependent0, oDependent1]);
				this.mock(oDependent0).expects("checkUpdate").withExactArgs();
				this.mock(oDependent1).expects("checkUpdate").withExactArgs();

				// code under test
				oBinding.checkUpdate();

				assert.throws(function () {
					// code under test
					oBinding.checkUpdate(true);
				}, new Error("Unsupported operation:"
					+ " sap.ui.model.odata.v4.ODataParentBinding#checkUpdate must not be called"
					+ " with parameters"));

			}
		);
	});
	//TODO fire change event only if the binding's length changed, i.e. if getContexts will provide
	//  a different result compared to the previous call

	//*********************************************************************************************
	QUnit.test("checkUpdate: relative binding with standard context", function (assert) {
		var oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve(undefined),
				oContext : {/*simulate standard context*/},
				oModel : {
					getDependentBindings : function () {}
				},
				sPath : "TEAM_2_MANAGER",
				bRelative : true
			}),
			fnGetContext = function () {
				return {
					created : function () {
						return;
					}
				};
			},
			oDependent0 = {
				checkUpdate : function () {},
				getContext : fnGetContext
			},
			oDependent1 = {
				checkUpdate : function () {},
				getContext : fnGetContext
			};

		this.mock(oBinding.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding), true)
			.returns([oDependent0, oDependent1]);
		this.mock(oDependent0).expects("checkUpdate").withExactArgs();
		this.mock(oDependent1).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.checkUpdate();
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: relative binding with cache, parent binding data has changed",
			function (assert) {
		var oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve({
					$canonicalPath : "/TEAMS('4711')/TEAM_2_EMPLOYEES"
				}),
				oContext : {
					fetchCanonicalPath : function () {}
				},
				sPath : "TEAM_2_MANAGER",
				refreshInternal : function () {},
				bRelative : true
			}),
			oPathPromise = Promise.resolve("/TEAMS('8192')/TEAM_2_EMPLOYEES");

		this.mock(oBinding.oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(_SyncPromise.resolve(oPathPromise)); // data for path "/TEAMS/1" has changed
		this.mock(oBinding).expects("refreshInternal").withExactArgs();

		// code under test
		oBinding.checkUpdate();

		return oPathPromise;
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: relative binding with cache, parent binding not changed",
			function (assert) {
		var sPath = "/TEAMS('4711')/TEAM_2_EMPLOYEES",
			oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve({
					$canonicalPath : sPath
				}),
				oContext : {
					fetchCanonicalPath : function () {}
				},
				oModel : {
					getDependentBindings : function () {}
				},
				sPath : "TEAM_2_MANAGER",
				refreshInternal : function () {},
				bRelative : true
			}),
			fnGetContext = function () {
				return {
					created : function () {
						return;
					}
				};
			},
			oDependent0 = {
				checkUpdate : function () {},
				getContext : fnGetContext
			},
			oDependent1 = {
				checkUpdate : function () {},
				getContext : fnGetContext
			},
			oPathPromise = Promise.resolve(sPath);

		this.mock(oBinding.oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(_SyncPromise.resolve(oPathPromise));
		this.mock(oBinding.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding), true)
			.returns([oDependent0, oDependent1]);
		this.mock(oDependent0).expects("checkUpdate").withExactArgs();
		this.mock(oDependent1).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.checkUpdate();

		return oPathPromise;
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: error handling", function (assert) {
		var oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve({}),
				oContext : {
					fetchCanonicalPath : function () {}
				},
				oModel : {
					reportError : function () {}
				},
				sPath : "TEAM_2_EMPLOYEES",
				refreshInternal : function () {},
				bRelative : true,
				toString : function () {
					return "foo";
				}
			}),
			oError = {},
			oPathPromise = Promise.reject(oError);

		this.mock(oBinding.oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(_SyncPromise.resolve(oPathPromise));
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to update foo", "sap.ui.model.odata.v4.ODataParentBinding",
				sinon.match.same(oError));

		// code under test
		oBinding.checkUpdate();

		return oPathPromise.then(undefined, function () {});
	});

	//*********************************************************************************************
	QUnit.test("createInCache: with cache", function (assert) {
		var oCache = {
				create : function () {}
			},
			oBinding = new ODataParentBinding({
				oCachePromise : _SyncPromise.resolve(oCache)
			}),
			oResult = {},
			oCreatePromise = _SyncPromise.resolve(oResult),
			fnCancel = function () {},
			oInitialData = {};

		this.mock(oCache).expects("create")
			.withExactArgs("updateGroupId", "EMPLOYEES", "", sinon.match.same(oInitialData),
				sinon.match.same(fnCancel), /*fnErrorCallback*/sinon.match.func)
			.returns(oCreatePromise);

		// code under test
		assert.strictEqual(oBinding.createInCache("updateGroupId", "EMPLOYEES", "", oInitialData,
			fnCancel).getResult(), oResult);
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
				oCachePromise : _SyncPromise.resolve(),
				oContext : oContext,
				//getUpdateGroupId : function () {},
				sPath : "SO_2_SCHEDULE"
			}),
			fnCancel = {},
			oResult = {},
			oCreatePromise = _SyncPromise.resolve(oResult),
			oInitialData = {};

		this.mock(_Helper).expects("buildPath")
			.withExactArgs(42, "SO_2_SCHEDULE", "")
			.returns("~");
		this.mock(oParentBinding).expects("createInCache")
			.withExactArgs("updateGroupId", "SalesOrderList('4711')/SO_2_SCHEDULE", "~",
				oInitialData, sinon.match.same(fnCancel))
			.returns(oCreatePromise);

		assert.strictEqual(oBinding.createInCache("updateGroupId",
			"SalesOrderList('4711')/SO_2_SCHEDULE", "", oInitialData, fnCancel).getResult(),
			oResult);
	});

	//*********************************************************************************************
	[
		"EMPLOYEES",
		_SyncPromise.resolve(Promise.resolve("EMPLOYEES"))
	].forEach(function (vPostPath, i) {
		QUnit.test("createInCache: error callback: " + i, function (assert) {
			var oCache = {
					create : function () {}
				},
				oBinding = new ODataParentBinding({
					oCachePromise : _SyncPromise.resolve(oCache),
					oModel : {
						reportError : function () {}
					}
				}),
				fnCancel = function () {},
				oError = new Error(),
				oExpectation,
				oInitialData = {};

			oExpectation = this.mock(oCache).expects("create")
				.withExactArgs("updateGroupId", vPostPath, "", sinon.match.same(oInitialData),
					sinon.match.same(fnCancel), /*fnErrorCallback*/sinon.match.func)
				// we only want to observe fnErrorCallback, hence we neither resolve, nor reject
				.returns(new Promise(function () {}));

			// code under test
			oBinding.createInCache("updateGroupId", vPostPath, "", oInitialData, fnCancel);

			this.mock(oBinding.oModel).expects("reportError")
				.withExactArgs("POST on 'EMPLOYEES' failed; will be repeated automatically",
					"sap.ui.model.odata.v4.ODataParentBinding", sinon.match.same(oError));

			// code under test
			oExpectation.args[0][5](oError); // call fnErrorCallback to simulate error
		});
	});

	//*********************************************************************************************
	[{
		before : [],
		merge : ["foo"],
		after : ["foo"]
	}, {
		before : ["foo"],
		merge : ["bar"],
		after : ["foo", "bar"]
	}, {
		before : ["foo", "bar"],
		merge : ["bar", "baz"],
		after : ["foo", "bar", "baz"]
	}, {
		before : undefined,
		merge : ["foo", "bar"],
		after : ["foo", "bar"]
	}].forEach(function (oFixture) {
		QUnit.test("addToSelect", function (assert) {
			var oBinding = new ODataParentBinding(),
				mQueryOptions = {$foo : "bar"};

			mQueryOptions.$select = oFixture.before;
			oBinding.addToSelect(mQueryOptions, oFixture.merge);
			assert.deepEqual(mQueryOptions.$select, oFixture.after);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bKeys) {
		QUnit.test("selectKeyProperties: " + (bKeys ? "w/" : "w/o") + " keys", function (assert) {
			var oMetaModel = {
					getObject : function () {}
				},
				oBinding = new ODataParentBinding({
					oModel : {getMetaModel : function () {return oMetaModel;}}
				}),
				sMetaPath = "~",
				mQueryOptions = {},
				oType = bKeys ? {$Key : []} : {};

			this.mock(oBinding.oModel.getMetaModel()).expects("getObject")
				.withExactArgs(sMetaPath + "/").returns(oType);
			this.mock(oBinding).expects("addToSelect").exactly(bKeys ? 1 : 0)
				.withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(oType.$Key));

			// code under test
			oBinding.selectKeyProperties(mQueryOptions, sMetaPath);
		});
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
	}].forEach(function (oFixture, i) {
		QUnit.test("updateAggregatedQueryOptions " + i, function(assert) {
			var oBinding = new ODataParentBinding({
					mAggregatedQueryOptions : oFixture.aggregated
				}),
				mCurrentQueryOptions = oFixture.current;

			// code under test
			assert.deepEqual(oBinding.updateAggregatedQueryOptions(mCurrentQueryOptions),
				undefined);

			assert.deepEqual(oBinding.mAggregatedQueryOptions, oFixture.result);
		});
	});
});