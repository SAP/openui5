/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Context",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/_ODataHelper"
], function (Context, ODataUtils, Helper) {
	/*global odatajs, QUnit, sinon */
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
	QUnit.test("headerValue", function (assert) {
		assert.strictEqual(Helper.headerValue("my-header"), undefined,
			"headers need not be present");
		assert.strictEqual(Helper.headerValue("toString", {}), undefined);
		assert.strictEqual(Helper.headerValue("my-header", {}), undefined);
		assert.strictEqual(Helper.headerValue("my-header", {foo: "bar"}), undefined);
		assert.strictEqual(Helper.headerValue("my-header", {'My-Header': "bar"}), "bar");
		assert.strictEqual(Helper.headerValue("my-header", {'MY-HEADER': "bar"}), "bar");
		assert.strictEqual(Helper.headerValue("My-Header", {'my-header': "bar"}), "bar");
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
		assert.strictEqual(Helper.hasProperties(undefined, []), false);
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
		var oEntityContainer = {},
			oMetaModel = {
				oModel: {
					read: function () {}
				}
			},
			oPromise;

		this.oSandbox.mock(oMetaModel.oModel).expects("read")
			.withExactArgs("/EntityContainer")
			.returns(Promise.resolve(oEntityContainer));

		oPromise = Helper.requestEntityContainer(oMetaModel);
		assert.strictEqual(Helper.requestEntityContainer(oMetaModel), oPromise);

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, oEntityContainer);
			assert.strictEqual(Helper.requestEntityContainer(oMetaModel), oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: successful read, empty cache", function (assert) {
		var sPath = "Anything(Fullname='foo.bar.Container%2FBar')",
			oSource = {
				"Foo@odata.navigationLink" : sPath
			},
			oAnything = {/*"Fullname" : "foo.bar.Container/Bar"*/},
			oEntityContainer = {},
			oMetaModel = {
				_oEntityContainerPromise : Promise.resolve(oEntityContainer),
				oModel : {
					read: function () {}
				}
			};

		this.oSandbox.mock(oMetaModel.oModel).expects("read").withExactArgs("/" + sPath)
			.returns(Promise.resolve(oAnything));

		return Helper.requestProperty(oMetaModel, oSource, "Foo").then(function (oResult) {
			assert.strictEqual(oResult, oAnything);
			assert.strictEqual(oSource.Foo, oAnything);
			assert.strictEqual(oEntityContainer.Anything[0], oAnything);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: successful read, non-empty cache", function (assert) {
		var sPath = "Anything(Fullname='foo.bar.Container%2FBar')",
			oSource = {
				"Foo@odata.navigationLink" : sPath
			},
			oAnything = {/*"Fullname" : "foo.bar.Container/Bar"*/},
			oEntityContainer = {
				"Anything" : [{}]
			},
			oMetaModel = {
				_oEntityContainerPromise : Promise.resolve(oEntityContainer),
				oModel : {
					read: function () {}
				}
			};

		this.oSandbox.mock(oMetaModel.oModel).expects("read").withExactArgs("/" + sPath)
			.returns(Promise.resolve(oAnything));

		return Helper.requestProperty(oMetaModel, oSource, "Foo").then(function (oResult) {
			assert.strictEqual(oResult, oAnything);
			assert.strictEqual(oSource.Foo, oAnything);
			assert.strictEqual(oEntityContainer.Anything[1], oAnything);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: from source", function (assert) {
		var sPath = "---ignored---",
			oAnything = {/*"Fullname" : "foo.bar.Container/Bar"*/},
			oSource = {
				"Foo" : oAnything,
				"Foo@odata.navigationLink" : sPath
			},
			oMetaModel = {
				oModel : {
					read: function () {}
				}
			};

		this.oSandbox.mock(oMetaModel.oModel).expects("read").never();

		return Helper.requestProperty(oMetaModel, oSource, "Foo").then(function (oResult) {
			assert.strictEqual(oResult, oAnything);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: from cache", function (assert) {
		var sPath = "Anything(Fullname='foo.bar.Container%2FBar')",
			oSource = {
				"Foo@odata.navigationLink" : sPath
			},
			oAnything = {
				"Fullname" : "foo.bar.Container/Bar"
			},
			oEntityContainer = {
				"Anything" : [oAnything]
			},
			oMetaModel = {
				_oEntityContainerPromise : Promise.resolve(oEntityContainer),
				oModel : {
					read: function () {}
				}
			};

		this.oSandbox.mock(oMetaModel.oModel).expects("read").never();

		return Helper.requestProperty(oMetaModel, oSource, "Foo").then(function (oResult) {
			assert.strictEqual(oResult, oAnything);
		});
	});

	//*********************************************************************************************
	//TODO is "@param {string} sRequestPath the request path (only used for the error message)"
	//     really such a good idea?
	QUnit.test("requestProperty: no @odata.navigationLink", function (assert) {
		var sPath = "Anything(Fullname='foo.bar.Container%2FBar')",
			oModel = {
				read: function () {}
			};

		this.oSandbox.mock(oModel).expects("read").never();

		assert.throws(function () {
			Helper.requestProperty(oModel, {}, "Foo", sPath);
		}, new Error("Unknown: Foo: " + sPath));
	});

	//*********************************************************************************************
	["", "Anything", "Foo(Bar='Baz')/Qux"].forEach(function (sPath) {
		QUnit.test("requestProperty: invalid path: " + sPath, function (assert) {
			var oModel = {
					read: function () {}
				},
				oSource = {
					"Foo@odata.navigationLink" : sPath
				};

			this.oSandbox.mock(oModel).expects("read").never();

			assert.throws(function () {
				Helper.requestProperty(oModel, oSource, "Foo", sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("extractSingleKey", function (assert) {
		var sPath = "/EntitySets(Name='foo')/EntityType/NavigationProperties(Name='bar')";

		assert.strictEqual(Helper.extractSingleKey(
			"/EntitySets(Name='foo')", "EntitySets", "Name"),
			'foo');
		assert.strictEqual(Helper.extractSingleKey(
			"/Types(QualifiedName='§.TEAM')", "Types", "QualifiedName"),
			'§.TEAM');
		assert.strictEqual(Helper.extractSingleKey(
			"/EntitySets(Fullname='§.Container%2FEMPLOYEES')", "EntitySets", "Fullname"),
			'§.Container/EMPLOYEES');

		assert.throws(function () {
			Helper.extractSingleKey("/EntityTypes(Name='foo')", "EntitySets", "Name");
		}, new Error(
			"Expected 'EntitySets', but instead saw 'EntityTypes': /EntityTypes(Name='foo')"));
		assert.throws(function () {
			Helper.extractSingleKey(sPath, "EntitySets", "Name");
		}, new Error("Expected a single selector, but instead saw: " + sPath));
	});

	//*********************************************************************************************
	[{
		bRequestSucceeds : true, sTitle : "success"
	}, {
		bRequestSucceeds : false, sTitle : "failure"
	}, {
		sRequired : "Required", sTitle : "CSRF token Required"
	}, {
		sRequired : "required", sTitle : "CSRF token required"
	}, {
		bReadFails : true, sTitle : "fetch CSRF token fails"
	}, {
		bDoNotDeliverToken : true, sTitle : "no CSRF token can be fetched"
	}].forEach(function (o) {
		QUnit.test("_request: " + o.sTitle, function (assert) {
			var oData = {},
				vExpectedResult,
				oRequest = {
					headers : {}
				},
				oModel = {
					mHeaders : {
						"X-CSRF-Token" : "Fetch"
					},
					refreshSecurityToken : function () {}
				},
				sReadError = "HTTP request failed - 400 Bad Request: ",
				oRequestError = {
					"message" : "HTTP request failed",
					"response" : {
						"body" : "CSRF token validation failed",
						"headers" : {
							"x-csrf-token" : o.sRequired || "Required"
						},
						"statusCode" : 403,
						"statusText" : "Forbidden"
					}
				},
				bSuccess = o.bRequestSucceeds !== false && !o.bReadFails && !o.bDoNotDeliverToken;

			if (o.bRequestSucceeds === false) {
				// simulate a server which does not require a CSRF token, but fails otherwise
				delete oRequestError.response.headers["x-csrf-token"];
			}

			// With <code>bRequestSucceeds === false</code>, "request" always fails,
			// with <code>bRequestSucceeds === true</code>, "request" always succeeds,
			// else "request" first fails due to missing CSRF token which can be fetched via
			// "ODataModel#refreshSecurityToken".
			this.oSandbox.stub(odatajs.oData, "request",
				function (oRequest0, fnSuccess, fnFailure) {
					assert.strictEqual(oRequest0, oRequest);

					if (o.bRequestSucceeds === true
						|| o.bRequestSucceeds === undefined
						&& oRequest.headers["X-CSRF-Token"] === "abc123") {
						setTimeout(fnSuccess.bind(null, oData), 0);
					} else {
						setTimeout(fnFailure.bind(null, oRequestError), 0);
					}
				});

			if (o.bRequestSucceeds !== undefined) {
				this.oSandbox.mock(oModel).expects("refreshSecurityToken").never();
			} else {
				this.oSandbox.stub(oModel, "refreshSecurityToken", function () {
					return new Promise(function (fnResolve, fnReject) {
						setTimeout(function () {
							if (o.bReadFails) { // reading of CSRF token fails
								fnReject(new Error(sReadError));
							} else {
								// HEAD might succeed, but not deliver a valid CSRF token
								oModel.mHeaders["X-CSRF-Token"]
									= o.bDoNotDeliverToken ? undefined : "abc123";
								fnResolve();
							}
						}, 0);
					});
				});
			}

			if (o.bRequestSucceeds === false || o.bDoNotDeliverToken) {
				// expect failure
				vExpectedResult
					= "HTTP request failed - 403 Forbidden: CSRF token validation failed";
			} else if (o.bReadFails) {
				// expect failure
				vExpectedResult = sReadError;
			} else {
				vExpectedResult = oData; // expect success
			}

			return Helper.request(oModel, oRequest).then(function (oData) {
				assert.ok(bSuccess, "success possible");
				assert.strictEqual(oData, vExpectedResult);
			}, function (oError) {
				assert.ok(!bSuccess, "certain failure");
				assert.ok(oError instanceof Error);
				assert.strictEqual(oError.message, vExpectedResult);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getEntitySetName", function (assert) {
		var oEntityContainer = { // § = com.sap.gateway.iwbep.tea_busi.v0001
				"Name" : "Container",
				"QualifiedName" : "§.Container",
				"EntitySets" : [{
					"Name" : "Departments",
					"Fullname" : "§.Container/Departments",
					"NavigationPropertyBindings" : [],
					"EntityType@odata.navigationLink" : "Types(QualifiedName='§.Department')"
				}, {
					"Name" : "EMPLOYEES",
					"Fullname" : "§.Container/EMPLOYEES",
					"NavigationPropertyBindings" : [{
						"Path" : "EMPLOYEE_2_TEAM",
						"Target@odata.navigationLink"
							: "EntitySets(Fullname='§.Container%2FTEAMS')"
					}, {
						"Path" : "EMPLOYEE_2_EQUIPMENTS",
						"Target@odata.navigationLink"
							: "EntitySets(Fullname='§.Container%2FEquipments')"
					}],
					"EntityType@odata.navigationLink" : "Types(QualifiedName='§.Worker')"
				}, {
					"Name" : "MANAGERS",
					"Fullname" : "§.Container/MANAGERS",
					"NavigationPropertyBindings" : [{
						"Path" : "_2_EMPLOYEES",
						"Target@odata.navigationLink"
							: "EntitySets(Fullname='§.Container%2FTEAMS')"
					}],
					"EntityType@odata.navigationLink" : "Types(QualifiedName='§.MANAGER')"
				}, {
					"Name" : "TEAMS",
					"Fullname" : "§.Container/TEAMS",
					"NavigationPropertyBindings" : [{
						"Path" : "_2_EMPLOYEES",
						"Target@odata.navigationLink"
							: "EntitySets(Fullname='§.Container%2FEMPLOYEES')"
					}, {
						"Path" : "TEAM_2_MANAGER",
						"Target@odata.navigationLink"
							: "EntitySets(Fullname='§.Container%2FMANAGERS')"
					}],
					"EntityType@odata.navigationLink" : "Types(QualifiedName='§.TEAM')"
				}]
			};

		assert.strictEqual(
			Helper.getEntitySetName(oEntityContainer, "§.TEAM", "_2_EMPLOYEES"),
			"EMPLOYEES");
		assert.strictEqual(
			Helper.getEntitySetName(oEntityContainer, "§.MANAGER", "_2_EMPLOYEES"),
			"TEAMS");

		assert.throws(function () {
			Helper.getEntitySetName(oEntityContainer, "§.MANAGER", "n/a");
		}, new Error("No target entity set found for source entity type '§.MANAGER'"
			+ " and navigation property 'n/a'"));
		assert.throws(function () {
			Helper.getEntitySetName(oEntityContainer, undefined, "_2_EMPLOYEES");
		}, new Error("No target entity set found for source entity type 'undefined'"
			+ " and navigation property '_2_EMPLOYEES'"));
	});
	//TODO case where "13.4.1 Attribute Path" contains slashes
	//TODO case where <NavigationPropertyBinding Target="..."> is not a SimpleIdentifier
	//TODO what about targets in other entity containers?

	//*********************************************************************************************
	[{
		sEntitySetName : "EMPLOYEES",
		sMetaPath : "/EntitySets(Name='EMPLOYEES')"
	}, {
		sEntitySetName : "Departments",
		sMetaPath : "/EntitySets(Name='Departments')"
	}, {
		sEntitySetName : "Foo",
		sMetaPath : "/EntitySets(Name='TEAMS')/EntityType"
			+ "/NavigationProperties(Name='TEAM_2_EMPLOYEES')"
	}].forEach(function (oFixture) {
		QUnit.test("requestEntitySetName: " + oFixture.sMetaPath, function (assert) {
			var oEntityContainer = {},
				oMetaModel = {
					// @see Helper.requestEntityContainer
					_oEntityContainerPromise : Promise.resolve(oEntityContainer),
					requestObject : function () {}
				},
				oMetaContext = new Context(oMetaModel, oFixture.sMetaPath);

			this.oSandbox.mock(oMetaModel).expects("requestObject").atLeast(0)
				.withExactArgs("/EntitySets(Name='TEAMS')/EntityType")
				.returns(Promise.resolve({"QualifiedName" : "§.TEAM"}));
			this.oSandbox.mock(Helper).expects("getEntitySetName").atLeast(0)
				.withExactArgs(oEntityContainer, "§.TEAM", "TEAM_2_EMPLOYEES")
				.returns("Foo");

			return Helper.requestEntitySetName(oMetaContext).then(function (sEntitySetName) {
				assert.strictEqual(sEntitySetName, oFixture.sEntitySetName);
			})["catch"](function (oError) {
				assert.ok(false, oError.message + "@" + oError.stack);
			});
		});
	});
	//TODO "/EntitySets(Fullname='...tea_busi_product.v0001.Container/Products')"
	//     Fullname vs. Name, is this really conformant to spec, how to use within URL, ...

	//*********************************************************************************************
	[{
		sKeyPredicate : "(ID='42')",
		oEntityInstance : {"ID" : "42"},
		oEntityType : {
			"Properties" : [{
				"Name" : "ID",
				"Type" : {
					"QualifiedName" : "Edm.String"
				}
			}],
			"Key" : [{
				"PropertyPath" : "ID"
			}]
		}
	}, {
		sKeyPredicate : "(Sector='DevOps',ID='42')",
		oEntityInstance : {"ID" : "42", "Sector" : "DevOps"},
		oEntityType : {
			"Properties" : [{
				"Name" : "Sector",
				"Type" : {
					"QualifiedName" : "Edm.String"
				}
			}, {
				"Name" : "ID",
				"Type" : {
					"QualifiedName" : "Edm.String"
				}
			}],
			"Key" : [{
				"PropertyPath" : "Sector"
			}, {
				"PropertyPath" : "ID"
			}]
		}
	}, {
		sKeyPredicate : "(Bar=42,Fo%3Do='Walter%22s%20Win''s')",
		oEntityInstance : {
			"Bar" : 42,
			"Fo=o" : "Walter\"s Win's"
		},
		oEntityType : {
			"Properties" : [{
				"Name" : "Bar",
				"Type" : {
					"QualifiedName" : "Edm.Int16"
				}
			}, {
				"Name" : "Fo=o",
				"Type" : {
					"QualifiedName" : "Edm.String"
				}
			}],
			"Key" : [{
				"PropertyPath" : "Bar"
			}, {
				"PropertyPath" : "Fo=o"
			}]
		}
	}].forEach(function (oFixture) {
		QUnit.test("getKeyPredicate: " + oFixture.sKeyPredicate, function (assert) {
			this.oSandbox.spy(ODataUtils, "formatValue"); //TODO v2 vs. v4?

			assert.strictEqual(
				Helper.getKeyPredicate(oFixture.oEntityType, oFixture.oEntityInstance),
				oFixture.sKeyPredicate);

			// check that ODataUtils.formatValue() is called for each property
			oFixture.oEntityType.Properties.forEach(function (oProperty) {
				assert.ok(
					ODataUtils.formatValue.calledWithExactly(
						oFixture.oEntityInstance[oProperty.Name], oProperty.Type.QualifiedName),
					ODataUtils.formatValue.printf(
						"ODataUtils.formatValue('" + oProperty.Name + "',...) %C"));
			});
		});
	});
});
