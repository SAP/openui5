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
		assert.deepEqual(Helper.splitPath("/"), []);
		assert.deepEqual(Helper.splitPath("/EntityContainer"), ["EntityContainer"]);
		assert.deepEqual(Helper.splitPath("/EntityContainer/EntitySet/Link"),
			["EntityContainer", "EntitySet", "Link"]);
		assert.deepEqual(Helper.splitPath(
			"/EntityContainer/EntitySet(Fullname='foo.Container%2FBars')/Link"),
			["EntityContainer", "EntitySet(Fullname='foo.Container/Bars')", "Link"]);
	});

	//*********************************************************************************************
	QUnit.test("parsePathSegment", function (assert) {
		assert.deepEqual(Helper.parsePathSegment(undefined), undefined);
		assert.deepEqual(Helper.parsePathSegment("Employees"), {
			all: "Employees",
			name: "Employees"
		});
		assert.deepEqual(Helper.parsePathSegment("Employees(ID='1')"), {
			all: "Employees(ID='1')",
			name: "Employees",
			key: {ID: '1'}
		});
		assert.deepEqual(Helper.parsePathSegment("SalesOrderItems(OrderID='1''2',Index=5)"), {
			all: "SalesOrderItems(OrderID='1''2',Index=5)",
			name: "SalesOrderItems",
			key: {OrderID: "1'2", Index: 5}
		});
		assert.deepEqual(Helper.parsePathSegment("SalesOrderItems(Index=05,OrderID='1')"), {
			all: "SalesOrderItems(Index=05,OrderID='1')",
			name: "SalesOrderItems",
			key: {OrderID: '1', Index: 5}
		});
		assert.deepEqual(Helper.parsePathSegment("Foo(Key='bar''')"), {
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
	QUnit.test("hasProperties", function (assert) {
		assert.strictEqual(Helper.hasProperties({"foo": "bar"}, ["foo"]), true);
		assert.strictEqual(Helper.hasProperties({"foo": "bar"}, ["baz"]), false);
		assert.strictEqual(Helper.hasProperties({"foo": "bar"}, []), false);
		assert.strictEqual(Helper.hasProperties({"foo": "bar", "baz": "qux"}, ["foo", "baz"]),
			true);
		assert.strictEqual(Helper.hasProperties({"foo": "bar", "baz": "qux"}, ["foo"]), false);
		assert.strictEqual(Helper.hasProperties({"foo": "bar", "baz": "qux"}, ["foo", "qux"]),
			false);
		assert.strictEqual(Helper.hasProperties({"foo": "bar"}, ["foo", "baz"]), false);
		assert.strictEqual(Helper.hasProperties(undefined, ["foo"]), false);
		assert.strictEqual(Helper.hasProperties(undefined, []), true);
	});

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

	//*********************************************************************************************
	QUnit.test("requestEntityContainer", function (assert) {
		var oEntityContainer = {
				"Name" : "Container",
				"QualifiedName" : "foo.bar.Container",
				"EntitySets" : [{
					"Name" : "Departments",
					"Fullname" : "foo.bar.Container/Departments"
				}, {
					"Name" : "EMPLOYEES",
					"Fullname" : "foo.bar.Container/EMPLOYEES"
				}],
				"Singletons" : [{
					"Name" : "Me",
					"Fullname" : "foo.bar.Container/Me"
				}]
			},
			oMetaModel = {
				oModel: {
					read: function () {}
				}
			};

		this.oSandbox.mock(oMetaModel.oModel).expects("read")
			.withExactArgs("/EntityContainer")
			.returns(Promise.resolve(JSON.parse(JSON.stringify(oEntityContainer))));

		return Helper.requestEntityContainer(oMetaModel).then(function (oResult) {
			assert.deepEqual(oResult, oEntityContainer);
			return Helper.requestEntityContainer(oMetaModel);
		}).then(function (oResult) {
			assert.deepEqual(oResult, oEntityContainer);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: success", function (assert) {
		var sPath = "EntityContainer/Anything(Fullname='foo.bar.Container/Me')/Foo",
			oAnything = {
				"Foo@odata.navigationLink" : sPath
			},
			oEntityType = {
				"QualifiedName" : "foo.bar.Worker"
			},
			oModel = {
				read: function () {}
			};

		this.oSandbox.mock(oModel).expects("read").withExactArgs("/" + sPath)
			.returns(Promise.resolve(oEntityType));

		return Helper.requestProperty(oModel, oAnything, "Foo").then(function (oResult) {
			assert.deepEqual(oResult, oEntityType);
			assert.strictEqual(oAnything.Foo, oResult);
			return Helper.requestProperty(oModel, oAnything, "Foo");
		}).then(function (oResult) {
			assert.deepEqual(oResult, oEntityType);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: failure", function (assert) {
		var sPath = "/EntityContainer/Anything(Fullname='foo.bar.Container/Me')/Foo",
			oModel = {
				read: function () {}
			};

		this.oSandbox.mock(oModel).expects("read").never();

		assert.throws(function () {
			Helper.requestProperty(oModel, {}, "Foo", sPath);
		}, new Error("Unknown: Foo: " + sPath));
	});
});
