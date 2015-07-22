/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/_ODataHelper"
], function (Helper) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._ODataHelper", {
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
	QUnit.test("findInArray", function (assert) {
		var aArray = [{
				"name" : "foo"
			}, {
				"name" : "bar"
			}];

		assert.strictEqual(Helper.findInArray(aArray, "name", "foo"), aArray[0]);
		assert.strictEqual(Helper.findInArray(aArray, "name", "bar"), aArray[1]);
		assert.strictEqual(Helper.findInArray(aArray, "name", "baz"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("splitPath", function (assert) {
		assert.throws(function () {
			Helper.splitPath("foo");
		}, new Error("Not an absolute path: foo"));
		assert.deepEqual(Helper.splitPath("/EntityContainer"), ["EntityContainer"]);
		assert.deepEqual(Helper.splitPath("/EntityContainer/EntitySet/Link"),
			["EntityContainer", "EntitySet", "Link"]);
		assert.deepEqual(Helper.splitPath(
			"/EntityContainer/EntitySet(Fullname='foo.Container%2FBars')/Link"),
			["EntityContainer", "EntitySet(Fullname='foo.Container/Bars')", "Link"]);
	});

	//*********************************************************************************************
	QUnit.test("parsePathPart", function (assert) {
		assert.deepEqual(Helper.parsePathPart(undefined), undefined);
		assert.deepEqual(Helper.parsePathPart("Employees"), {
			all: "Employees",
			name: "Employees"
		});
		assert.deepEqual(Helper.parsePathPart("Employees(ID='1')"), {
			all: "Employees(ID='1')",
			name: "Employees",
			key: {ID: '1'}
		});
		assert.deepEqual(Helper.parsePathPart("SalesOrderItems(OrderID='1''2',Index=5)"), {
			all: "SalesOrderItems(OrderID='1''2',Index=5)",
			name: "SalesOrderItems",
			key: {OrderID: "1'2", Index: 5}
		});
		assert.deepEqual(Helper.parsePathPart("SalesOrderItems(Index=05,OrderID='1')"), {
			all: "SalesOrderItems(Index=05,OrderID='1')",
			name: "SalesOrderItems",
			key: {OrderID: '1', Index: 5}
		});
		assert.deepEqual(Helper.parsePathPart("Foo(Key='bar''')"), {
			all: "Foo(Key='bar''')",
			name: "Foo",
			key: {Key: "bar'"}
		});
	});
	// TODO error handling
	// TODO other types but string and number

	//*********************************************************************************************
	QUnit.test("findKeyInArray", function (assert) {
		var aArray = [{
				"name" : "foo",
				"index" : 1
			}, {
				"name" : "foo",
				"index" : 2
			}, {
				"name" : "bar",
				"index" : 1
			}, {
				"name" : "bar",
				"index" : 2
			}];

		assert.strictEqual(Helper.findKeyInArray(aArray, {"name": "foo", "index": 1}), aArray[0]);
		assert.strictEqual(Helper.findKeyInArray(aArray, {"name": "foo", "index": 2}), aArray[1]);
		assert.strictEqual(Helper.findKeyInArray(aArray, {"name": "foo", "index": 3}), undefined);
		assert.strictEqual(Helper.findKeyInArray(aArray, {"name": "bar", "index": 1}), aArray[2]);
		assert.strictEqual(Helper.findKeyInArray(aArray, {"name": "bar", "index": 2}), aArray[3]);
		assert.strictEqual(Helper.findKeyInArray(aArray, {"name": "bar", "index": 3}), undefined);
		assert.strictEqual(Helper.findKeyInArray(aArray, {"name": "baz", "index": 1}), undefined);
	});

	//*********************************************************************************************
	QUnit.test("requestEntitySet", function (assert) {
		var oEntityContainer = {
				QualifiedName : "foo.bar.Container"
			},
			oEntitySet = {
				Fullname : "foo.bar.Container/Employees"
			},
			oModel = {
				read: function () {}
			},
			oModelMock = this.oSandbox.mock(oModel);

		oModelMock.expects("read").withExactArgs("/EntityContainer")
			.returns(Promise.resolve(oEntityContainer));
		oModelMock.expects("read")
			.withExactArgs("/EntityContainer/EntitySets(Fullname='foo.bar.Container%2FEmployees')")
			.returns(Promise.resolve(oEntitySet));
		return Helper.requestEntitySet(oModel, "Employees").then(function (oResult) {
			assert.deepEqual(oResult, oEntitySet);
		});
	});
	// requestEntitySet: TODO caching


	//*********************************************************************************************
	[{
		body: JSON.stringify({error: {message: "foo"}}),
		message: "foo"
	}, {
		body: JSON.stringify({error: "foo"}),
		message: "default"
	}, {
		body: "HTTP request failed",
		message: "default"
	}].forEach(function (oFixture) {
		var sComponent = "sap.ui.model.odata.v4._ODataHelper",
			sUrl = "/url";

		QUnit.test("handleODataError: " + oFixture.body, function (assert) {
			this.oLogMock.expects("error").withExactArgs(oFixture.message, sUrl, sComponent);

			assert.strictEqual(Helper.handleODataError({
				request: {
					requestUri: sUrl
				},
				response: {
					body: oFixture.body
				}
			}, "default", sComponent), oFixture.message);
		});
	});
});
