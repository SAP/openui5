/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, Context, Filter, FilterOperator, CountMode, ODataUtils,
		OperationMode, ODataListBinding, TestUtils) {
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
	QUnit.test("_getFilterForPredicate: encoded key predicates; integrative", function (assert) {
		var oExpectedFilter = new Filter({
				bAnd : true,
				aFilters : [
					new Filter("string", FilterOperator.EQ, "abc123' !\"§$%&/()=:;/?+"),
					new Filter("datetime", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 18, 9, 50, 58))),
					new Filter("datetimems", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 19, 9, 50, 58, 123))),
					new Filter("datetimeoffset", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 20, 9, 50, 58))),
					new Filter("time", FilterOperator.EQ,
						{"__edmType": "Edm.Time", "ms": 34936000}),
					new Filter("guid", FilterOperator.EQ, "42010aef-0de5-1edb-aead-63ba217fb0e7"),
					new Filter("null", FilterOperator.EQ, null),
					new Filter("decimal", FilterOperator.EQ, "-1.23"),
					new Filter("double", FilterOperator.EQ, "-2.34"),
					new Filter("float", FilterOperator.EQ, "-3.45"),
					new Filter("int64", FilterOperator.EQ, "-123"),
					new Filter("sbyte", FilterOperator.EQ, -78),
					new Filter("byte", FilterOperator.EQ, 255),
					new Filter("true", FilterOperator.EQ, true),
					new Filter("false", FilterOperator.EQ, false),
					new Filter("binary", FilterOperator.EQ, "0123456789abcdef")
				]
			}),
			sPredicate = "("
				+ "string='abc123''%20%21%22%c2%a7%24%25%26%2f%28%29%3d%3a%3b%2f%3f%2b',"
				+ "datetime=datetime'2021-06-18T09%3a50%3a58',"
				+ "datetimems=datetime'2021-06-19T09%3a50%3a58.123',"
				+ "datetimeoffset=datetimeoffset'2021-06-20T09%3a50%3a58Z',"
				// for following data types encoded characters cannot be in the key predicate
				+ "time=time'PT09H42M16S',"
				+ "guid=guid'42010aef-0de5-1edb-aead-63ba217fb0e7'," // only [A-Fa-f0-9] allowed
				+ "null=null,"
				+ "decimal=-1.23m,"
				+ "double=-2.34d,"
				+ "float=-3.45f,"
				+ "int64=-123l,"
				+ "sbyte=-78,"
				+ "byte=255,"
				+ "true=true,"
				+ "false=false,"
				+ "binary=binary'0123456789abcdef'" // [A-Fa-f0-9][A-Fa-f0-9]*
				+ ")";

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getFilterForPredicate.call({}, sPredicate),
			oExpectedFilter);
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
	oContext : {isTransient : function () {}},
	bInitial : true,
	oMetadata : {
		isLoaded : function () { return true; }
	},
	bMockIsTransient : true,
	bRelative : true
}].forEach(function (oFixture, i) {
	QUnit.test("initialize: not yet ready for initialization, #" + i, function (assert) {
		var oBinding = {
				oContext : oFixture.oContext,
				bInitial : oFixture.bInitial,
				oModel : {
					oMetadata : oFixture.oMetadata
				},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(oFixture.bRelative);
		if (oFixture.bMockIsTransient) {
			this.mock(oBinding.oContext).expects("isTransient").returns(true);
		}

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
	oContext : "~oStandardContext",
	bRelative : true
}, {
	oContext : {isTransient : function () {}},
	bRelative : true,
	bTransient : false
}, {
	oContext : {isTransient : function () {}},
	bRelative : true,
	bTransient : undefined
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
		if (oFixture.hasOwnProperty("bTransient")) {
			this.mock(oBinding.oContext).expects("isTransient").returns(oFixture.bTransient);
		}
		this.mock(oBinding.oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(bBoundToList);
		this.mock(oBinding).expects("getResolvedPath")
			.withExactArgs()
			.exactly(bBoundToList ? 0 : 1)
			.returns(sResolvedPath);
		this.oLogMock.expects("error")
			.withExactArgs("List Binding is not bound against a list for ~resolvedPath")
			.exactly(bBoundToList ? 0 : 1);
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason: ChangeReason.Change})
			.exactly(!bSuspended && bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("_fireRefresh")
			.withExactArgs({reason: ChangeReason.Refresh})
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
[true, false].forEach(function (bV2Context) {
	var sTitle = "setContext: calls checkDataState if context changes, use V2 context: "
			+ bV2Context;
	QUnit.test(sTitle, function (assert) {
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
			oNewContext = {
				isPreliminary : function () { return false; },
				isRefreshForced : function () { return false; },
				isUpdated : function () { return false; }
			};

		if (bV2Context) {
			oNewContext.isTransient = function () {};
			this.mock(oNewContext).expects("isTransient").withExactArgs().returns(undefined);
		}
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("~oContext", sinon.match.same(oNewContext))
			.returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oNewContext))
			.returns("~resolvedDeepPath");
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkDataState").withExactArgs();
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("checkExpandedList").withExactArgs().returns(false);
		this.mock(oBinding).expects("_refresh").withExactArgs();

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, oNewContext);
	});
});

	//*********************************************************************************************
	QUnit.test("setContext: context is transient", function (assert) {
		var oModel = {resolveDeep : function () {}},
			oBinding = {
				aAllKeys : null,
				oContext : "~oContext",
				aKeys : [],
				iLength : 0,
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				checkDataState : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oNewV2Context = {
				isPreliminary : function () { return false; },
				isRefreshForced : function () { return false; },
				isTransient : function () {},
				isUpdated : function () { return false; }
			};

		this.mock(oNewV2Context).expects("isRefreshForced").withExactArgs().returns(false);
		this.mock(oNewV2Context).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oNewV2Context).expects("isTransient").withExactArgs().returns(true);
		this.mock(oNewV2Context).expects("isUpdated").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("~oContext", sinon.match.same(oNewV2Context))
			.returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oNewV2Context))
			.returns("~resolvedDeepPath");
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkDataState").withExactArgs();

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oNewV2Context);
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
[true, false].forEach(function (bV2Context) {
	var sTitle = "_refresh: getResolvedPath is called, use V2 context: " + bV2Context;
	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oContext : bV2Context
					? {isTransient : function () {}}
					: "~context",
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").returns(true);
		if (bV2Context) {
			this.mock(oBinding.oContext).expects("isTransient").withExactArgs().returns(undefined);
		}
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding, undefined, undefined, "~mEntityTypes");

		assert.strictEqual(oBinding.bPendingRefresh, false);
	});
});

	//*********************************************************************************************
	QUnit.test("_refresh: parent context is transient", function (assert) {
		var oBinding = {
				oContext : {isTransient : function () {}},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").returns(true);
		this.mock(oBinding.oContext).expects("isTransient").withExactArgs().returns(true);

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(oBinding.bPendingRefresh, undefined);
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

	//*********************************************************************************************
	QUnit.test("_getContexts: return V2 contexts", function (assert) {
		var oModel = {
				getContext : function () {},
				resolveDeep : function () {}
			},
			oBinding = {
				oContext : "~context",
				aKeys : ["~key(0)", "~key(1)"],
				oModel : oModel,
				sPath : "~path",
				getResolvedPath : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("resolveDeep").withExactArgs("~path", "~context").returns("/~sDeepPath");
		oModelMock.expects("getContext").withExactArgs("/~key(0)", "/~sDeepPath(0)")
			.returns("~V2Context0");
		oModelMock.expects("getContext").withExactArgs("/~key(1)", "/~sDeepPath(1)")
			.returns("~V2Context1");

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getContexts.call(oBinding, 0, 2),
			["~V2Context0", "~V2Context1"]);
	});

	//*********************************************************************************************
[{
	bInitial : true
}, {
	sCountMode : CountMode.Request,
	bLengthFinal : false,
	bLengthRequested : true,
	sOperationMode : OperationMode.Auto
}, {
	sCountMode : CountMode.Both,
	bLengthFinal : false,
	bLengthRequested : true,
	sOperationMode : OperationMode.Auto
}].forEach(function (oBinding, i) {
	QUnit.test("getContexts: return empty array; #" + i, function (assert) {
		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 2), []);
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: return V2 contexts returned by _getContexts", function (assert) {
		var aResultContexts,
			oBinding = {
				aAllKeys : [],
				bLengthFinal : true,
				bRefresh : true,
				_getContexts : function () {},
				useClientMode : function () {}
			},
			aContexts = ["~V2Context0", "~V2Context1"];

		this.mock(oBinding).expects("_getContexts").withExactArgs(0, 2).returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);

		// code under test
		aResultContexts = ODataListBinding.prototype.getContexts.call(oBinding, 0, 2);

		assert.strictEqual(aResultContexts, aContexts);
		assert.strictEqual(oBinding.iLastLength, 2);
		assert.strictEqual(oBinding.iLastStartIndex, 0);
		assert.strictEqual(oBinding.iLastThreshold, undefined);
	});

	//*********************************************************************************************
[true, false].forEach(function (bLengthFinal) {
	QUnit.test("getContexts: use ODataUtils, bLengthFinal = " + bLengthFinal, function (assert) {
		var oBinding = {
				aKeys : [],
				iLength : 550,
				bLengthFinal : bLengthFinal,
				oModel : {getServiceMetadata : function () {}},
				bPendingRequest : false,
				_getContexts : function () {},
				_getLength : function () {},
				loadData : function () {},
				useClientMode : function () {}
			},
			aContexts = [],
			oInterval = {start : 0, end : 110},
			aIntervals = [{start : 0, end : 110}];

		this.mock(oBinding).expects("_getLength").withExactArgs().exactly(bLengthFinal ? 0 : 1);
		this.mock(oBinding).expects("_getContexts").withExactArgs(0, 10).returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(false);
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(oBinding.aKeys , 0, 10, 100, bLengthFinal ? oBinding.iLength : undefined)
			.returns(aIntervals);
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs(sinon.match.same(aIntervals))
			.returns(oInterval);
		this.mock(oBinding.oModel).expects("getServiceMetadata").withExactArgs().returns(true);
		this.mock(oBinding).expects("loadData")
			.withExactArgs(sinon.match.same(oInterval.start),
				sinon.match.same(oInterval.end - oInterval.start));

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 10, 100),
			aContexts);
	});
});

	//*********************************************************************************************
[
	{pendingRequest : false, interval : {start : 0, end : 110}, expectLoad : true},
	{pendingRequest : true, interval : {start : 0, end : 110}, expectLoad : false},
	{pendingRequest : true, interval : undefined, expectLoad : false},
	{pendingRequest : false, interval : undefined, expectLoad : false}
].forEach(function (oFixture) {
	var sTitle = "getContexts: use ODataUtils: pendingRequest = " + oFixture.pendingRequest
			+ ", interval = " + oFixture.interval;
	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				aKeys : [],
				iLength : 550,
				bLengthFinal : true,
				oModel : { getServiceMetadata : function () {}},
				bPendingRequest : oFixture.pendingRequest,
				_getContexts : function () {},
				_getLength : function () {},
				loadData : function () {},
				useClientMode : function () {}
			},
			aContexts = [],
			aIntervals = [{start : 0, end : 110}];

		this.mock(oBinding).expects("_getContexts").withExactArgs(0, 10).returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(false);
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(oBinding.aKeys , 0, 10, 100, oBinding.iLength)
			.returns(aIntervals);
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs(sinon.match.same(aIntervals))
			.returns(oFixture.interval);
		this.mock(oBinding.oModel).expects("getServiceMetadata").withExactArgs().returns(true);
		if (oFixture.interval) {
			this.mock(oBinding).expects("loadData")
				.withExactArgs(oFixture.interval.start,
					oFixture.interval.end - oFixture.interval.start)
				.exactly(oFixture.expectLoad ? 1 : 0);
		}

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 10, 100),
			aContexts);
	});
});
});