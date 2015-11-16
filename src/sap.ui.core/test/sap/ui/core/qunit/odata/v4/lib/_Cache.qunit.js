/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils"
], function (Cache, Requestor, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Cache", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("Cache is not a constructor", function (assert) {
		assert.strictEqual(typeof Cache, "object");
	});

	//*********************************************************************************************
	[
		{index: 1, length: 1, result: ["b"]},
		{index: 0, length: 2, result: ["a", "b"]},
		{index: 4, length: 5, result: []},
		{index: 1, length: 5, result: ["b", "c"]}
	].forEach(function (oFixture) {
		QUnit.test("read(" + oFixture.index + ", " + oFixture.length + ")", function (assert) {
			var oRequestor = Requestor.create("/~/"),
				sUrl = "/~/Employees",
				oCache = Cache.create(oRequestor, sUrl),
				oPromise,
				oMockResult = {"@odata.context": "$metadata#TEAMS", value : ["a", "b", "c"]};

			this.oSandbox.mock(oRequestor).expects("request")
				.withExactArgs("GET", sUrl)
				.returns(Promise.resolve(oMockResult));

			// code under test
			oPromise = oCache.read(oFixture.index, oFixture.length);

			assert.ok(oPromise instanceof Promise, "returns a Promise");
			return oPromise.then(function (aResult){
				assert.deepEqual(aResult, {
					"@odata.context": "$metadata#TEAMS",
					value : oFixture.result
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("read(-1, 1)", function (assert) {
		var oRequestor = Requestor.create("/~/"),
			sUrl = "/~/Employees",
			oCache = Cache.create(oRequestor, sUrl);

		this.oSandbox.mock(oRequestor).expects("request").never();

		// code under test
		assert.throws(function () {
			oCache.read(-1, 1);
		}, new Error("Illegal index -1, must be >= 0"));
	});

	//*********************************************************************************************
	QUnit.test("read(1, -1)", function (assert) {
		var oRequestor = Requestor.create("/~/"),
			sUrl = "/~/Employees",
			oCache = Cache.create(oRequestor, sUrl);

		this.oSandbox.mock(oRequestor).expects("request").never();

		// code under test
		assert.throws(function () {
			oCache.read(1, -1);
		}, new Error("Illegal length -1, must be >= 0"));
	});

	//*********************************************************************************************
	QUnit.test("multiple read, same range", function (assert) {
		var oRequestor = Requestor.create("/~/"),
			sUrl = "/~/Employees",
			oCache = Cache.create(oRequestor, sUrl),
			oPromise1,
			oPromise2,
			oMockResult = {"@odata.context": "$metadata#TEAMS", value : ["a", "b", "c"]},
			oExpected = {
				"@odata.context": "$metadata#TEAMS",
				value : ["c"]
			};

		this.oSandbox.mock(oRequestor).expects("request")
			.withExactArgs("GET", sUrl)
			.returns(Promise.resolve(oMockResult));

		// code under test
		oPromise1 = oCache.read(2, 1).then(function (oResult) {
			assert.deepEqual(oResult, oExpected);
		});
		oPromise2 = oCache.read(2, 1).then(function (oResult) {
			assert.deepEqual(oResult, oExpected);
		});

		return Promise.all([oPromise1, oPromise2]);
	});

	//*********************************************************************************************
	QUnit.test("multiple read, different ranges", function (assert) {
		var oRequestor = Requestor.create("/~/"),
			sUrl = "/~/Employees",
			oCache = Cache.create(oRequestor, sUrl),
			oPromise1,
			oPromise2,
			oMockResult = {"@odata.context": "$metadata#TEAMS", value : ["a", "b", "c"]},
			oExpected1 = ["c"],
			oExpected2 = ["a", "b"];

		this.oSandbox.mock(oRequestor).expects("request")
			.withExactArgs("GET", sUrl)
			.returns(Promise.resolve(oMockResult));

		// code under test
		oPromise1 = oCache.read(2, 5).then(function (oResult) {
			assert.deepEqual(oResult.value, oExpected1);
		});
		oPromise2 = oCache.read(0, 2).then(function (oResult) {
			assert.deepEqual(oResult.value, oExpected2);
		});

		return Promise.all([oPromise1, oPromise2]);
	});

	//*********************************************************************************************
	QUnit.test("query params", function (assert) {
		var oRequestor = Requestor.create("/~/"),
			sUrl = "/~/Employees",
			mQueryParams = {
				"$select": "ID",
				"$expand" : "Address",
				"$filter" : "€",
				"foo" : ["bar", "baz€"]
			},
			oCache = Cache.create(oRequestor, sUrl, mQueryParams);

		this.oSandbox.mock(oRequestor).expects("request")
			.withExactArgs("GET", sUrl + "?%24select=ID&%24expand=Address&%24filter=%E2%82%AC"
				+ "&foo=bar&foo=baz%E2%82%AC")
			.returns(Promise.resolve({value:[]}));

		// code under test
		mQueryParams.$select = "foo"; // modification must not affect Cache
		return oCache.read(0, 5);
	});
	// TODO get rid of %-encoding of $, (, ) etc
});
