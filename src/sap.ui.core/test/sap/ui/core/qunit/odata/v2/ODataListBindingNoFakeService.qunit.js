/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/ListBinding",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, Context, Filter, FilterOperator, ListBinding, ODataUtils,
		ODataListBinding, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataListBinding (ODataListBindingNoFakeService)", {
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
[
	{transitionMessagesOnly : true, headers : {"sap-messages" : "transientOnly"}},
	{transitionMessagesOnly : false, headers : undefined}
].forEach(function (oFixture, i) {
	QUnit.test("loadData calls read w/ parameters refresh, headers, " + i, function (assert) {
		var oBinding,
			oContext = {},
			oModel = {
				read : function () {},
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolveDeep : function () {}
			},
			bRefresh = "{boolean} bRefresh";

		this.mock(oModel).expects("createCustomParams").withExactArgs(undefined).returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", sinon.match.same(oContext))
			.returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs();

		oBinding = new ODataListBinding(oModel, "path", oContext);

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~path");
		oBinding.bSkipDataEvents = true;
		oBinding.bRefresh = bRefresh;
		oBinding.bTransitionMessagesOnly = oFixture.transitionMessagesOnly;

		this.mock(oModel).expects("read").withExactArgs("path", {
				headers : oFixture.headers,
				canonicalRequest : undefined,
				context : sinon.match.same(oContext),
				error : sinon.match.func,
				groupId : undefined,
				success : sinon.match.func,
				updateAggregatedMessages : bRefresh,
				urlParameters : ["~custom"]
			})
			.returns();

		// code under test
		oBinding.loadData();
	});
});

	//*********************************************************************************************
[
	{parameters : undefined, expected : false},
	{parameters : {}, expected : false},
	{parameters : {foo : "bar"}, expected : false},
	{parameters : {transitionMessagesOnly : false}, expected : false},
	{parameters : {transitionMessagesOnly : 0}, expected : false},
	{parameters : {transitionMessagesOnly : true}, expected : true},
	{parameters : {transitionMessagesOnly : {}}, expected : true}
].forEach(function (oFixture, i) {
	QUnit.test("constructor: parameter transitionMessagesOnly, " + i, function (assert) {
		var oBinding,
			oModel = {
				read : function () {},
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams")
			.withExactArgs(sinon.match.same(oFixture.parameters))
			.returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context").returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs()
			.returns(true);

		// code under test
		oBinding = new ODataListBinding(oModel, "path", "context", undefined /*aSorters*/,
			undefined /*aFilters*/, oFixture.parameters);

		assert.strictEqual(oBinding.bTransitionMessagesOnly, oFixture.expected);
	});
});

	//*********************************************************************************************
[{ // no data
	oIn : {aData : [], iLength : 100, iStart : 0, iThreshold : 0},
	oOut : {length : 100, startIndex : 0}
}, { // data at the beginning
	oIn : {aData : [{iLength : 10, iStart : 0}], iLength : 100, iStart : 0, iThreshold : 0},
	oOut : {length : 90, startIndex : 10}
}, { // data at the end
	oIn : {aData : [{iLength : 10, iStart : 90}], iLength : 100, iStart : 0, iThreshold : 0},
	oOut : {length : 90, startIndex : 0}
}, { // data at the beginning and at the end
	oIn : {
		aData : [{iLength : 10, iStart : 0}, {iLength : 10, iStart : 90}],
		iLength : 100,
		iStart : 0,
		iThreshold : 0
	},
	oOut : {length : 80, startIndex : 10}
}, { // data in middle of the requested range
	oIn : {aData : [{iLength : 10, iStart : 30}], iLength : 100, iStart : 0, iThreshold : 0},
	oOut : {length : 100, startIndex : 0}
}, { // no data with threshold
	oIn : {aData : [], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 150, startIndex : 0}
}, { // data at the beginning with threshold
	oIn : {aData : [{iLength : 10, iStart : 0}], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 140, startIndex : 10}
}, { // data at the end of the requested range with threshold
	oIn : {aData : [{iLength : 10, iStart : 90}], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 150, startIndex : 0}
}, { // data at the end (requested range including threshold)
	oIn : {aData : [{iLength : 60, iStart : 90}], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 90, startIndex : 0}
}, { // data at the beginning and in the middle of the requested range with threshold
	oIn : {
		aData : [{iLength : 10, iStart : 0}, {iLength : 10, iStart : 90}],
		iLength : 100,
		iStart : 0,
		iThreshold : 50
	},
	oOut : {length : 140, startIndex : 10}
}, { // data at the beginning and at the end with threshold
	oIn : {
		aData : [{iLength : 10, iStart : 0}, {iLength : 20, iStart : 130}],
		iLength : 100,
		iStart : 0,
		iThreshold : 50
	},
	oOut : {length : 120, startIndex : 10}
}, { // prepend complete threshold
	oIn : {aData : [], iLength : 30, iStart : 80, iThreshold : 50},
	oOut : {length : 130, startIndex : 30}
}, { // prepend complete threshold start with 0
	oIn : {aData : [], iLength : 30, iStart : 40, iThreshold : 50},
	oOut : {length : 120, startIndex : 0}
}, { // read at most to final length
	oIn : {aData : [], iFinalLength : 80, iLength : 30, iStart : 20, iThreshold : 50},
	oOut : {length : 80, startIndex : 0}
}, { // read at least threshold data
	oIn : {aData : [{iLength : 120, iStart : 0}], iLength : 100, iStart : 0, iThreshold : 50},
	oOut : {length : 50, startIndex : 120}
}, { // read at least threshold data start > threshold
	oIn : {aData : [{iLength : 60, iStart : 70}], iLength : 20, iStart : 70, iThreshold : 50},
	oOut : {length : 120, startIndex : 20}
}, { // only few entries missing at the beginning and the end
	oIn : {aData : [{iLength : 100, iStart : 30}], iLength : 20, iStart : 70, iThreshold : 50},
	oOut : {length : 120, startIndex : 20}
}, { // all data available
	oIn : {aData : [{iLength : 100, iStart : 0}], iLength : 20, iStart : 0, iThreshold : 50},
	oOut : {length : 0, startIndex : 70}
}, { // extend length because it is less than threshold but close the gap only
	oIn : {
		aData : [{iLength : 70, iStart : 0}, {iLength : 100, iStart : 90}],
		iLength : 20,
		iStart : 20,
		iThreshold : 50
	},
	oOut : {length : 20, startIndex : 70}
}, { // extend length because it is less than threshold; final length ignored
	oIn : {
		aData : [{iLength : 70, iStart : 0}],
		iFinalLength : 80,
		iLength : 20,
		iStart : 20,
		iThreshold : 50
	},
	oOut : {length : 50, startIndex : 70}
}].forEach(function (oFixture, i) {
	QUnit.test("calculateSection: #" + i, function (assert) {
		var oBinding = {
				aKeys : [],
				bLengthFinal : !!oFixture.oIn.iFinalLength,
				iLength : oFixture.oIn.iFinalLength
			},
			oResult;

		oFixture.oIn.aData.forEach(function (oAvailableData) {
			var i = oAvailableData.iStart,
				n = i + oAvailableData.iLength;

			for (; i < n; i += 1) {
				oBinding.aKeys[i] = "key" + i;
			}
		});

		// code under test
		oResult = ODataListBinding.prototype.calculateSection.call(oBinding, oFixture.oIn.iStart,
			oFixture.oIn.iLength, oFixture.oIn.iThreshold);

		assert.deepEqual(oResult, oFixture.oOut);
	});
});

	//*********************************************************************************************
["resolvedPath", undefined, null].forEach(function (sResolvedPath) {
	QUnit.test("_checkDataStateMessages: with deepPath: " + sResolvedPath, function (assert) {
		var oModel = {
				getMessagesByPath : function () {}
			},
			oBinding = {
				sDeepPath : "deepPath",
				oModel : oModel
			},
			oDataState = {
				setModelMessages : function () {}
			},
			aMessagesByPath = "aMessages";

		this.mock(oModel).expects("getMessagesByPath").withExactArgs("deepPath", true)
			.exactly(sResolvedPath === "resolvedPath" ? 1 : 0)
			.returns(aMessagesByPath);
		this.mock(oDataState).expects("setModelMessages").withExactArgs(aMessagesByPath)
			.exactly(sResolvedPath === "resolvedPath" ? 1 : 0);

		// code under test
		ODataListBinding.prototype._checkDataStateMessages.call(oBinding, oDataState, sResolvedPath);
	});
});

	//*********************************************************************************************
	QUnit.test("_getFilterForPredicate: keys for predicate known", function (assert) {
		var oBinding = {},
			oDataUtilsMock = this.mock(ODataUtils),
			oExpectedFilter = new Filter({
				and : true,
				filters : [
					new Filter("SalesOrderID", FilterOperator.EQ, "~42~"),
					new Filter("ItemPosition", FilterOperator.EQ, "~10~")
				]
			}),
			sPredicate = "(SalesOrderID='42',ItemPosition='10')";

		oDataUtilsMock.expects("parseValue").withExactArgs("'10'").returns("~10~");
		oDataUtilsMock.expects("parseValue").withExactArgs("'42'").returns("~42~");

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getFilterForPredicate.call(oBinding, sPredicate),
			oExpectedFilter);
	});

	//*********************************************************************************************
	QUnit.test("_getFilterForPredicate: key for predicate unknown", function (assert) {
		var oModel = {
				oMetadata : {
					getKeyPropertyNamesByPath : function () {}
				}
			},
			oBinding = {
				sDeepPath : "~deepPath~",
				oModel : oModel
			};

		this.mock(oModel.oMetadata).expects("getKeyPropertyNamesByPath")
			.withExactArgs("~deepPath~")
			.returns(["SalesOrderID"]);
		this.mock(ODataUtils).expects("parseValue").withExactArgs("'42'").returns("~42~");

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getFilterForPredicate.call(oBinding, "('42')"),
			new Filter("SalesOrderID", FilterOperator.EQ, "~42~"));
	});

	//*********************************************************************************************
	QUnit.test("requestFilterForMessages: unresolved", function (assert) {
		var oModel = {getMessagesByPath : function () {}},
			oBinding = {
				oModel : oModel,
				getResolvedPath : function () {}
			},
			oPromise;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		this.mock(oModel).expects("getMessagesByPath").never();

		// code under test
		oPromise = ODataListBinding.prototype.requestFilterForMessages.call(oBinding);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oFilter) {
			assert.strictEqual(oFilter, null);
		});
	});

	//*********************************************************************************************
[true, false].forEach(function (bWithFilter) {
	[{
		aFilterForPredicate : [],
		aMessages : [] // contains sap.ui.core.message.Message objects
	}, {
		aFilterForPredicate : bWithFilter ? [] : ["(~keyPredicate~)"],
		aMessages : [{aFullTargets : ["~deepPath~(~keyPredicate~)"], message : "out"}]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{aFullTargets : ["~deepPath~(~keyPredicate~)"], message : "in"}]
	}, {
		aFilterForPredicate : bWithFilter
			? ["(~keyPredicate0~)", "(~keyPredicate2~)"]
			: ["(~keyPredicate0~)", "(~keyPredicate1~)", "(~keyPredicate2~)", "(~keyPredicate3~)"],
		aMessages : [
			{aFullTargets : ["~deepPath~"], message : "out"},
			{aFullTargets : ["~deepPath~(~keyPredicate0~)/foo"], message : "in"},
			{aFullTargets : ["~deepPath~(~keyPredicate1~)"], message : "out"},
			{aFullTargets : ["~deepPath~(~keyPredicate2~)"], message : "in"},
			{aFullTargets : ["~deepPath~(~keyPredicate3~)"], message : "out"}
		]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{
			aFullTargets : ["~deepPath~(~keyPredicate~)/A", "~deepPath~(~keyPredicate~)/B"],
			message : "in"
		}]
	}, {
		aFilterForPredicate : ["(~keyPredicate1~)", "(~keyPredicate2~)"],
		aMessages : [{
			aFullTargets : ["~deepPath~(~keyPredicate1~)/A", "~deepPath~(~keyPredicate2~)/B"],
			message : "in"
		}]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{
			aFullTargets : ["~parentEntity~", "~deepPath~(~keyPredicate~)/B"],
			message : "in"
		}]
	}].forEach(function (oFixture, i) {
	var sTitle = "requestFilterForMessages: with filter: " + bWithFilter + ", " + i;

	QUnit.test(sTitle, function (assert) {
		var oCallback = {
				fnFilter : function () {}
			},
			oCallbackMock = this.mock(oCallback),
			aFilterForPredicate = oFixture.aFilterForPredicate,
			aFilters = [],
			aMessages = oFixture.aMessages,
			oModel = {getMessagesByPath : function () {}},
			oBinding = {
				sDeepPath : "~deepPath~",
				oModel : oModel,
				_getFilterForPredicate : function () {},
				getResolvedPath : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oPromise;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("resolvedPath");
		this.mock(oModel).expects("getMessagesByPath").withExactArgs("~deepPath~", true)
			.returns(aMessages);
		if (aMessages.length && bWithFilter) {
			aMessages.forEach(function (oMessage) {
				oCallbackMock.expects("fnFilter").withExactArgs(sinon.match.same(oMessage))
					.returns(oMessage.message === "in");
			});
		} else {
			oCallbackMock.expects("fnFilter").never();
		}
		if (aFilterForPredicate.length) {
			aFilterForPredicate.forEach(function (sPredicate) {
				var oFilter = new Filter("~property~", FilterOperator.EQ, "~value~");

				oBindingMock.expects("_getFilterForPredicate").withExactArgs(sPredicate)
					.returns(oFilter);
				aFilters.push(oFilter);
			});
		} else {
			oBindingMock.expects("_getFilterForPredicate").never();
		}

		// code under test
		oPromise = ODataListBinding.prototype.requestFilterForMessages
			.call(oBinding, bWithFilter ? oCallback.fnFilter : undefined);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oFilter) {
			if (aFilters.length === 0) {
				assert.strictEqual(oFilter, null);
			} else if (aFilters.length === 1) {
				assert.deepEqual(oFilter, aFilters[0]);
			} else {
				assert.strictEqual(oFilter.bAnd, undefined);
				assert.deepEqual(oFilter.aFilters, aFilters);
			}
		});
	});
	});
});

	//*********************************************************************************************
[{
	bInitial : true,
	oMetadata : undefined,
	bRelative : false
}, {
	bInitial : true,
	oMetadata : {
		isLoaded : function () { return false; }
	},
	bRelative : false
}, {
	bInitial : false,
	oMetadata : {
		isLoaded : function () { return true; }
	},
	bRelative : false
}, {
	oContext : {bCreated : true},
	bInitial : true,
	oMetadata : {
		isLoaded : function () { return true; }
	},
	bRelative : true
}].forEach(function (oFixture, i) {
	QUnit.test("initialize: not yet ready for initialization, #" + i, function (assert) {
		var oBinding = {
				_checkPathType : function () {},
				isRelative : function () {},
				oContext : oFixture.oContext,
				bInitial : oFixture.bInitial,
				oModel : {
					oMetadata : oFixture.oMetadata
				}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(oFixture.bRelative);
		this.mock(oBinding).expects("_checkPathType").never();

		// code under test
		assert.strictEqual(ODataListBinding.prototype.initialize.call(oBinding), oBinding);
	});
});

	//*********************************************************************************************
[{
	bRelative : false
}, {
	//oContext : undefined
	bRelative : true
}, {
	oContext : {bCreated : false},
	bRelative : true
}].forEach(function (oFixture, i) {
	[true, false].forEach(function (bBoundToList) {
		[true, false].forEach(function (bSuspended) {
			[true, false].forEach(function (bDataAvailable) {
	var sTitle = "initialize: initialize, #" + i + ", bound to a list: " + bBoundToList
			+ ", suspended: " + bSuspended + ", data available: " + bDataAvailable;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oContext : oFixture.oContext,
				bDataAvailable : bDataAvailable,
				bInitial : true,
				oModel : {
					oMetadata : {
						isLoaded : function () {}
					}
				},
				bSuspended : bSuspended,
				_checkPathType : function () {},
				_fireChange : function () {},
				_fireRefresh : function () {},
				_initSortersFilters : function () {},
				checkDataState : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			sResolvedPath = "~resolvedPath";

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(oFixture.bRelative);
		this.mock(oBinding.oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(bBoundToList);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().exactly(bBoundToList ? 0 : 1)
			.returns(sResolvedPath);
		this.oLogMock.expects("error")
			.withExactArgs("List Binding is not bound against a list for ~resolvedPath")
			.exactly(bBoundToList ? 0 : 1);
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Change})
			.exactly(!bSuspended && bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason: ChangeReason.Refresh})
			.exactly(!bSuspended && !bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("checkDataState").withExactArgs();


		// code under test
		assert.strictEqual(ODataListBinding.prototype.initialize.call(oBinding), oBinding);

		assert.strictEqual(oBinding.bInitial, false);
	});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("setContext: calls checkDataState if context changes", function (assert) {
		var oModel = {resolveDeep : function () {}},
			oBinding = {
				oContext : "~oContext",
				bInitial : false,
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				_initSortersFilters : function () {},
				_refresh : function () {},
				checkDataState : function () {},
				checkExpandedList : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oContext = {
				bCreated : false,
				isPreliminary : function () { return false; },
				isRefreshForced : function () { return false; },
				isUpdated : function () { return false; }
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("~oContext", sinon.match.same(oContext))
			.returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("~resolvedDeepPath");
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkDataState").withExactArgs();
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("checkExpandedList").withExactArgs().returns(false);
		this.mock(oBinding).expects("_refresh").withExactArgs();

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oContext);

		assert.strictEqual(oBinding.oContext, oContext);
	});

	//*********************************************************************************************
	QUnit.test("checkExpandedList: getResolvedPath is called", function (assert) {
		var oModel = {_getObject : function () {}},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_getObject").withExactArgs("~sPath", "~oContext")
			.returns(undefined);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.checkExpandedList.call(oBinding), false);
		assert.strictEqual(oBinding.bUseExpandedList, false);
		assert.strictEqual(oBinding.aExpandRefs, undefined);
	});

	//*********************************************************************************************
	QUnit.test("_refresh: getResolvedPath is called", function (assert) {
		var oBinding = {
				oContext : "~oContext",
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding, undefined, undefined, "~mEntityTypes");

		assert.strictEqual(oBinding.bPendingRefresh, false);
	});

	//*********************************************************************************************
	QUnit.test("_fireRefresh: with resolved path", function (assert) {
		var oBinding = {
				fireEvent : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireEvent").withExactArgs("refresh", "~mParameters");

		// code under test
		ODataListBinding.prototype._fireRefresh.call(oBinding, "~mParameters");

		assert.strictEqual(oBinding.bRefresh, true);
	});

	//*********************************************************************************************
	QUnit.test("_fireRefresh: no resolved path", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._fireRefresh.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_checkPathType: getResolvedPath is called", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._checkPathType.call(oBinding), true);
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: no resolved path", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype.getDownloadUrl.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: with resolved path", function (assert) {
		var oBinding = {
				oModel : {_createRequestUrl : function () {}},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("_createRequestUrl")
			.withExactArgs("~resolvedPath", null, [])
			.returns("~requestUrl");

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getDownloadUrl.call(oBinding), "~requestUrl");
	});

	//*********************************************************************************************
	QUnit.test("_initSortersFilters: getResolvedPath is called", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._initSortersFilters.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_getEntityType: with resolved path", function (assert) {
		var oBinding = {
				oModel : {
					oMetadata : {_getEntityTypeByPath : function () {}}
				},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~resolvedPath")
			.returns("~entityType");

		// code under test
		assert.strictEqual(ODataListBinding.prototype._getEntityType.call(oBinding), "~entityType");
	});

	//*********************************************************************************************
	QUnit.test("_getEntityType: no resolved path", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._getEntityType.call(oBinding), undefined);
	});
});