/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v2/_CreatedContextsCache"
], function (Log, _CreatedContextsCache) {
	/*global QUnit, sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2._CreatedContextsCache", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oCache = new _CreatedContextsCache();

		assert.deepEqual(oCache.mCache, {});
	});

	//*********************************************************************************************
[
	{sListID : "", sPath : "/bar", aResult : []},
	{sListID : "", sPath : "/foo", aResult : ["~oContext1", "~oContext0"]},
	{sListID : "id", sPath : "/foo", aResult : ["~oContextId0"]},
	{sListID : "baz", sPath : "/foo", aResult : []}
].forEach(function (oFixture) {
	var sTitle = "getContexts: " + oFixture.sPath
			+ (oFixture.sListID ? ", sListID=" + oFixture.sListID : "");

	QUnit.test(sTitle, function (assert) {
		var aContexts0, aContexts1,
			oCache = new _CreatedContextsCache();

		oCache.mCache = {
			"/foo" : {"" : ["~oContext1", "~oContext0"], "id" : ["~oContextId0"]}
		};

		// code under test
		aContexts0 = oCache.getContexts(oFixture.sPath, oFixture.sListID);

		// code under test
		aContexts1 = oCache.getContexts(oFixture.sPath, oFixture.sListID);

		assert.deepEqual(aContexts0, oFixture.aResult);
		assert.deepEqual(aContexts1, oFixture.aResult);
		assert.notStrictEqual(aContexts0, aContexts1); // cloned
	});
});

	//*********************************************************************************************
[{
	bAtEnd : false,
	bAtEndExpected : false,
	sListID : "",
	sPath : "/bar",
	oResult : {
		"/bar" : {"" : ["~oNewContext"]},
		"/foo" : {"" : ["~oContext"], "id" : ["~oContextId"]}
	}
}, {
	bAtEnd : false,
	bAtEndExpected : false,
	sListID : "id1",
	sPath : "/bar",
	oResult : {
		"/bar" : {"id1" : ["~oNewContext"]},
		"/foo" : {"" : ["~oContext"], "id" : ["~oContextId"]}
	}
}, {
	bAtEnd : true,
	bAtEndExpected : true,
	sListID : "id1",
	sPath : "/bar",
	oResult : {
		"/bar" : {"id1" : ["~oNewContext"]},
		"/foo" : {"" : ["~oContext"], "id" : ["~oContextId"]}
	}
}, {
	bAtEnd : false,
	bAtEndExpected : false,
	sListID : "id1",
	sPath : "/foo",
	oResult : {
		"/foo" : {"" : ["~oContext"], "id" : ["~oContextId"], "id1" : ["~oNewContext"]}
	}
}, {
	bAtEnd : false,
	bAtEndExpected : true,
	sListID : "",
	sPath : "/foo",
	oResult : {
		"/foo" : {"" : ["~oNewContext", "~oContext"], "id" : ["~oContextId"]}
	}
}, {
	bAtEnd : false,
	bAtEndExpected : false,
	sListID : "id",
	sPath : "/foo",
	oResult : {
		"/foo" : {"" : ["~oContext"], "id" : ["~oNewContext", "~oContextId"]}
	}
}, {
	bAtEnd : true,
	bAtEndExpected : true,
	sListID : "",
	sPath : "/foo",
	oResult : {
		"/foo" : {"" : ["~oContext", "~oNewContext"], "id" : ["~oContextId"]}
	}
}, {
	bAtEnd : true,
	bAtEndExpected : false,
	sListID : "id",
	sPath : "/foo",
	oResult : {
		"/foo" : {"" : ["~oContext"], "id" : ["~oContextId", "~oNewContext"]}
	}
}].forEach(function (oFixture, i) {
	QUnit.test("addContext: #" + i, function (assert) {
		var oCache = new _CreatedContextsCache(),
			aContexts = ["~oContext"],
			aContextIds = ["~oContextId"];

		aContexts.bAtEnd = true;
		aContextIds.bAtEnd = false;
		oCache.mCache = {
			"/foo" : {"" : aContexts, "id" : aContextIds}
		};

		// code under test
		oCache.addContext("~oNewContext", oFixture.sPath, oFixture.sListID, oFixture.bAtEnd);

		assert.deepEqual(oCache.mCache, oFixture.oResult);
		assert.strictEqual(oCache.mCache[oFixture.sPath][oFixture.sListID].bAtEnd,
			oFixture.bAtEndExpected);
	});
});

	//*********************************************************************************************
	QUnit.test("findAndRemoveContext", function (assert) {
		var oCache = new _CreatedContextsCache(),
			oCacheMock = this.mock(oCache);

		oCacheMock.expects("getCacheInfo").withExactArgs({/*unknown context*/}).returns(undefined);
		oCacheMock.expects("removeContext").never();

		// code under test
		oCache.findAndRemoveContext({/*unknown context*/});

		oCacheMock.expects("getCacheInfo")
			.withExactArgs("~oContext")
			.returns({cachePath : "~sCachePath", listID : "~sListID"});
		oCacheMock.expects("removeContext").withExactArgs("~oContext", "~sCachePath", "~sListID");

		// code under test
		oCache.findAndRemoveContext("~oContext");
	});

	//*********************************************************************************************
	QUnit.test("getCacheInfo", function (assert) {
		var oCache = new _CreatedContextsCache(),
			oCacheMock = this.mock(oCache),
			oContext = {};

		oCache.mCache = {
			"/foo" : {"": [{/*any V2 context*/}]},
			"/bar" : {
				"" : [{/*any V2 context*/}, {/*any V2 context*/}],
				"qux" : [{/*any V2 context*/}, oContext, {/*any V2 context*/}]
			}
		};

		oCacheMock.expects("removeContext").never();

		// code under test
		assert.strictEqual(oCache.getCacheInfo({/*unknown context*/}), undefined);

		// code under test
		assert.deepEqual(oCache.getCacheInfo(oContext), {cachePath : "/bar", listID : "qux"});
	});

	//*********************************************************************************************
[{
	oContext : "~oContext1",
	sListID : "",
	sPath : "/foo",
	oResult : {
		"/baz" : {"" : ["~oContext5"]},
		"/foo" : {"" : ["~oContext2", "~oContext0"], "id" : ["~oContext3"]},
		"/quz" : {"id" : ["~oContext6"]}
	}
}, {
	oContext : "~oContext3",
	sListID : "id",
	sPath : "/foo",
	oResult : {
		"/baz" : {"" : ["~oContext5"]},
		"/foo" : {"" : ["~oContext2", "~oContext1", "~oContext0"]},
		"/quz" : {"id" : ["~oContext6"]}
	}
}, {
	oContext : "~oContext5",
	sListID : "",
	sPath : "/baz",
	oResult : {
		"/foo" : {"" : ["~oContext2", "~oContext1", "~oContext0"], "id" : ["~oContext3"]},
		"/quz" : {"id" : ["~oContext6"]}
	}
}, {
	oContext : "~oContext6",
	sListID : "id",
	sPath : "/quz",
	oResult : {
		"/baz" : {"" : ["~oContext5"]},
		"/foo" : {"" : ["~oContext2", "~oContext1", "~oContext0"], "id" : ["~oContext3"]}
	}
}].forEach(function (oFixture, i) {
	var sTitle = "removeContext: " + oFixture.oContext + " from " + oFixture.sPath
			+ (oFixture.sListID ? ", key=" + oFixture.sListID : "") + "; #" + i;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _CreatedContextsCache();

		oCache.mCache = {
			"/baz" : {"" : ["~oContext5"]},
			"/foo" : {"" : ["~oContext2", "~oContext1", "~oContext0"], "id" : ["~oContext3"]},
			"/quz" : {"id" : ["~oContext6"]}
		};

		// code under test
		oCache.removeContext(oFixture.oContext, oFixture.sPath, oFixture.sListID);

		assert.deepEqual(oCache.mCache, oFixture.oResult);
	});
});

	//*********************************************************************************************
["", "id"].forEach(function (sListID) {
	var sTitle = "integrative: addContext, getContexts, removeContext; sListID='" + sListID + "'";

	QUnit.test(sTitle, function (assert) {
		var oCache = new _CreatedContextsCache();

		// code under test
		assert.deepEqual(oCache.getContexts("/foo", sListID), []);

		// code under test
		oCache.addContext("~oContext0", "/foo", sListID);

		assert.deepEqual(oCache.getContexts("/foo", sListID), ["~oContext0"]);

		// code under test
		oCache.removeContext("~oContext0", "/foo", sListID);

		assert.deepEqual(oCache.getContexts("/foo", sListID), []);
	});
});

	//*********************************************************************************************
	QUnit.test("removePersistedContexts: no created contexts", function (assert) {
		var oCache = new _CreatedContextsCache();

		this.mock(oCache).expects("getContexts").withExactArgs("~sPath", "~sListID").returns([]);

		// code under test
		assert.deepEqual(oCache.removePersistedContexts("~sPath", "~sListID"), []);
	});

	//*********************************************************************************************
	QUnit.test("removePersistedContexts: only transient contexts", function (assert) {
		var oCache = new _CreatedContextsCache(),
			oContext0 = {isTransient : function () {}},
			oContext1 = {isTransient : function () {}};

		this.mock(oCache).expects("getContexts")
			.withExactArgs("~sPath", "~sListID")
			.returns([oContext0, oContext1]);
		this.mock(oContext0).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(true);

		// code under test
		assert.deepEqual(oCache.removePersistedContexts("~sPath", "~sListID"), []);
	});

	//*********************************************************************************************
	QUnit.test("removePersistedContexts: transient and non-transient contexts", function (assert) {
		var oCache = new _CreatedContextsCache(),
			oCacheMock = this.mock(oCache),
			oContext0 = {isTransient : function () {}, resetCreatedPromise : function () {}},
			oContext1 = {isTransient : function () {}},
			oContext2 = {isTransient : function () {}, resetCreatedPromise : function () {}};

		oCacheMock.expects("getContexts")
			.withExactArgs("~sPath", "~sListID")
			.returns([oContext0, oContext1, oContext2]);
		this.mock(oContext0).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext0).expects("resetCreatedPromise").withExactArgs();
		oCacheMock.expects("removeContext")
			.withExactArgs(sinon.match.same(oContext0), "~sPath", "~sListID");
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext2).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext2).expects("resetCreatedPromise").withExactArgs();
		oCacheMock.expects("removeContext")
			.withExactArgs(sinon.match.same(oContext2), "~sPath", "~sListID");

		// code under test
		assert.deepEqual(oCache.removePersistedContexts("~sPath", "~sListID"),
			[oContext0, oContext2]);
	});

	//*********************************************************************************************
	QUnit.test("isAtEnd", function (assert) {
		var oCache = new _CreatedContextsCache(),
			aContexts = ["~oContextId"];

		aContexts.bAtEnd = "~bAtEnd";
		oCache.mCache = {"/foo" : {"id" : aContexts}};

		// code under test
		assert.strictEqual(oCache.isAtEnd("/foo", "id"), "~bAtEnd");
		assert.strictEqual(oCache.isAtEnd("/unknown", "id"), undefined);
		assert.strictEqual(oCache.isAtEnd("/foo", "unknown"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("findCreatedContext", function (assert) {
		var oCache = new _CreatedContextsCache(),
			oContext0 = {getPath : function () {}},
			oContext1 = {getPath : function () {}},
			oContext2 = {getPath : function () {}},
			oContext3 = {getPath : function () {}},
			oContext4 = {getPath : function () {}},
			oContext5 = {getPath : function () {}},
			oContextMock0 = this.mock(oContext0),
			oContextMock1 = this.mock(oContext1),
			oContextMock2 = this.mock(oContext2),
			oContextMock3 = this.mock(oContext3),
			oContextMock4 = this.mock(oContext4),
			oContextMock5 = this.mock(oContext5);

		oCache.mCache = {
			"/SalesOrderSet" : {"" : [oContext0], "foo" : [oContext1]},
			"/BusinessPartnerSet" : {"" : [oContext2, oContext3], "bar" : [oContext4]},
			"/SalesOrderLineItemSet" : {"" : [oContext5]}
		};

		oContextMock0.expects("getPath").withExactArgs().returns("/SalesOrderSet('id-000')");
		oContextMock1.expects("getPath").withExactArgs().returns("/SalesOrderSet('id-111')");
		oContextMock2.expects("getPath").withExactArgs().returns("/BusinessPartnerSet('id-123')");
		oContextMock3.expects("getPath").never();
		oContextMock4.expects("getPath").never();
		oContextMock5.expects("getPath").never();

		// code under test
		assert.strictEqual(oCache.findCreatedContext("/BusinessPartnerSet('id-123')/Address/City"),
			oContext2);

		oContextMock0.expects("getPath").withExactArgs().returns("/SalesOrderSet('id-000')");
		oContextMock1.expects("getPath").withExactArgs().returns("/SalesOrderSet('id-111')");
		oContextMock2.expects("getPath").withExactArgs().returns("/BusinessPartnerSet('id-123')");
		oContextMock3.expects("getPath").withExactArgs().returns("/BusinessPartnerSet('id-234')");
		oContextMock4.expects("getPath").withExactArgs().returns("/BusinessPartnerSet('id-345')");
		oContextMock5.expects("getPath").withExactArgs().returns("/SalesOrderLineItemSet('id-0')");

		// code under test
		assert.strictEqual(oCache.findCreatedContext("/BusinessPartnerSet('id-007')/Address/City"),
			undefined);
	});
});