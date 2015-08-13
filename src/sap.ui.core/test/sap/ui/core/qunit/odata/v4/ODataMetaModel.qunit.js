/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/MetaModel",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/ODataDocumentModel",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel"
], function (MetaModel, Helper, ODataDocumentModel, ODataMetaModel, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var oEntityContainer = {
			"Name" : "Container",
			"QualifiedName" : "foo.bar.Container",
			"EntitySets" : [{
				"Name" : "Employees",
				"Fullname" : "foo.bar.Container/Employees",
				"EntityType@odata.navigationLink" : "EntityContainer/EntitySets(Fullname="
					+ "'foo.bar.Container%2FEmployees')/EntityType"
			}],
			"Singletons" : [{
				"Name" : "Me",
				"Fullname" : "foo.bar.Container/Me",
				"Type@odata.navigationLink" : "EntityContainer/Singletons(Fullname="
					+ "'foo.bar.Container%2FMe')/Type"
			}]
		},
		oEntityType = {
			"Name" : "Worker",
			"QualifiedName" : "foo.bar.Worker",
			"Abstract" : false,
			"Properties" : [{
				"Name" : "ID",
				"Fullname" : "foo.bar.Worker/ID"
			}, {
				"Name" : "ENTRYDATE",
				"Fullname" : "foo.bar.Worker/ENTRYDATE"
			}, {
				"Name" : "LOCATION",
				"Fullname" : "foo.bar.Worker/LOCATION",
				"Type" : {
					"Name" : "ComplexType_Location",
					"QualifiedName" : "foo.bar.ComplexType_Location",
					"Properties" : [{
						"Name" : "City",
						"Fullname" : "foo.bar.ComplexType_Location/City",
						"Type" : {
							"Name" : "ComplexType_City",
							"QualifiedName" : "foo.bar.ComplexType_City",
							"Properties" : [{
								"Name" : "CITYNAME",
								"Fullname" : "foo.bar.ComplexType_City/CITYNAME",
								"Type" : {
									"Name" : "String",
									"QualifiedName" : "Edm.String"
								}
							}]
						}

					}]
				}
			}],
			"NavigationProperties" : []
		},
		sMetaEmployees = "/EntityContainer/EntitySets(Fullname='foo.bar.Container%2FEmployees')",
		sMetaMe = "/EntityContainer/Singletons(Fullname='foo.bar.Container%2FMe')",
		sMetaCityname = sMetaEmployees + "/EntityType/Properties(Fullname="
			+ "'foo.bar.Worker%2FLOCATION')/Type/Properties(Fullname="
			+ "'foo.bar.ComplexType_Location%2FCity')/Type/Properties(Fullname="
			+ "'foo.bar.ComplexType_City%2FCITYNAME')";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataMetaModel", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oMetaModel = new ODataModel("/Foo").getMetaModel();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		assert.ok(this.oMetaModel instanceof MetaModel);
		assert.ok(this.oMetaModel.oModel instanceof ODataDocumentModel);

		assert.throws(function () {
			return new ODataMetaModel();
		}, new Error("Missing metadata model"));
	});

	//*********************************************************************************************
	[{
		path: "/Employees",
		type: "EntitySet",
		expected: sMetaEmployees + "/EntityType"
	}, {
		path: "/Employees(ID='1')",
		type: "EntitySet",
		expected: sMetaEmployees + "/EntityType"
	}, {
		path: "/Employees[5];list=1",
		type: "EntitySet",
		expected: sMetaEmployees + "/EntityType"
	}, {
		path: "/Employees(ID='1')/ENTRYDATE",
		type: "EntitySet",
		expected: sMetaEmployees + "/EntityType/Properties(Fullname='foo.bar.Worker%2FENTRYDATE')"
	}, {
		path: "/Employees(ID='1')/LOCATION/City/CITYNAME",
		type: "EntitySet",
		expected: sMetaCityname
	}, {
		path: "/Me",
		type: "Singleton",
		expected: sMetaMe + "/Type"
	}, {
		path: "/Me/ENTRYDATE",
		type: "Singleton",
		expected: sMetaMe + "/Type/Properties(Fullname='foo.bar.Worker%2FENTRYDATE')"
	}].forEach(function (oFixture) {
		QUnit.test("requestMetaContext: " + oFixture.path, function (assert) {
			var oMetaModel = this.oMetaModel,
				oHelperMock = this.oSandbox.mock(Helper);

			oHelperMock.expects("requestEntityContainer").withExactArgs(oMetaModel)
				.returns(Promise.resolve(oEntityContainer));
			if (oFixture.type === "EntitySet") {
				oHelperMock.expects("requestProperty")
					.withExactArgs(oMetaModel.oModel, oEntityContainer.EntitySets[0], "EntityType",
						sinon.match.string)
					.returns(Promise.resolve(oEntityType));
			} else {
				oHelperMock.expects("requestProperty")
					.withExactArgs(oMetaModel.oModel, oEntityContainer.Singletons[0], "Type",
						sinon.match.string)
					.returns(Promise.resolve(oEntityType));
			}

			return oMetaModel.requestMetaContext(oFixture.path).then(function (oMetaContext) {
				assert.strictEqual(oMetaContext.getModel(), oMetaModel);
				assert.strictEqual(oMetaContext.getPath(), oFixture.expected);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("requestMetaContext: /Unknown", function (assert) {
		this.oSandbox.mock(Helper).expects("requestEntityContainer").withExactArgs(this.oMetaModel)
			.returns(Promise.resolve({"EntitySets" : [], "Singletons" : []}));

		return this.oMetaModel.requestMetaContext("/Unknown").then(function () {
			assert.ok(false, "Unexpected success");
		})["catch"](function (oError) {
			assert.strictEqual(oError.message, "Type Unknown not found");
		});
	});

	//*********************************************************************************************
	[{
		path: "/Employees(ID='1')/Unknown",
		type: "EntitySet",
		error: "Unknown property: foo.bar.Worker/Unknown: /Employees(ID='1')/Unknown"
	}, {
		path: "/Employees(ID='1')/LOCATION/Unknown",
		type: "EntitySet",
		error: "Unknown property: foo.bar.ComplexType_Location/Unknown: /Employees(ID='1')"
			+ "/LOCATION/Unknown"
	}, {
		path: "/Me/Unknown",
		type: "Singleton",
		error: "Unknown property: foo.bar.Worker/Unknown: /Me/Unknown"
	}
	].forEach(function (oFixture) {
		QUnit.test("requestMetaContext: " + oFixture.type + " " + oFixture.path, function (assert) {
			var oHelperMock = this.oSandbox.mock(Helper);

			oHelperMock.expects("requestEntityContainer").withExactArgs(this.oMetaModel)
				.returns(Promise.resolve(oEntityContainer));
			if (oFixture.type === "EntitySet") {
				oHelperMock.expects("requestProperty")
					.withExactArgs(this.oMetaModel.oModel, oEntityContainer.EntitySets[0],
						"EntityType", sinon.match.string)
					.returns(Promise.resolve(oEntityType));
			} else {
				oHelperMock.expects("requestProperty")
					.withExactArgs(this.oMetaModel.oModel, oEntityContainer.Singletons[0], "Type",
						sinon.match.string)
					.returns(Promise.resolve(oEntityType));
			}

			return this.oMetaModel.requestMetaContext(oFixture.path).then(function () {
				assert.ok(false, "Unexpected success");
			})["catch"](function (oError) {
				assert.strictEqual(oError.message, oFixture.error);
			});
		});
	});

	//*********************************************************************************************
	[{
		path: "/$Employees",
		error: "Unsupported: /$Employees"
	}, {
		path: "/",
		error: "Unsupported: /"
	}].forEach(function (oFixture) {
		QUnit.test("requestMetaContext: " + oFixture.path, function (assert) {
			assert.throws(function () {
				this.oMetaModel.requestMetaContext(oFixture.path);
			}, new Error(oFixture.error));
		});
	});

	// TODO requestMetaContext: simple navigation property
	// TODO requestMetaContext: (navigation) property with key predicate
	// TODO requestMetaContext: use @odata.context to get the name of the initial set/singleton

	//*********************************************************************************************
	[{
		path: "/EntityContainer",
		result: oEntityContainer
	}, {
		path: "EntityContainer",
		error: "Not an absolute path"
	}, {
		path: "/EntitySets",
		error: "Unknown: EntitySets"
	}, {
		path: "/EntitySets",
		error: "Unknown: EntitySets"
	}, {
		context: "/EntityContainer",
		path: "EntitySets",
		result: oEntityContainer.EntitySets
	}, {
		path: "/EntityContainer/UnknownPart",
		reject: "Unknown: UnknownPart"
	}, {
		path: "/EntityContainer/Name(Foo='Bar')",
		reject: '"Name" is not an array'
	}, {
		path: sMetaEmployees,
		result: oEntityContainer.EntitySets[0]
	}, {
		path: "/EntityContainer/EntitySets(Fullname='foo.bar.Container%2FTeams')",
		reject: "Unknown: EntitySets(Fullname='foo.bar.Container/Teams')"
	}, {
		path: sMetaMe,
		result: oEntityContainer.Singletons[0]
	}, {
		path: sMetaEmployees + "/Name",
		result: oEntityContainer.EntitySets[0].Name
	}, {
		path: sMetaMe + "/Type",
		nav: {
			object: oEntityContainer.Singletons[0],
			property: "Type"
		},
		result: oEntityType
	}, {
		path: sMetaMe + "/Type/Name",
		nav: {
			object: oEntityContainer.Singletons[0],
			property: "Type"
		},
		result: oEntityType.Name
	}, {
		path: sMetaMe + "/Type/Abstract",
		nav: {
			object: oEntityContainer.Singletons[0],
			property: "Type"
		},
		result: oEntityType.Abstract
	}, {
		path: sMetaCityname,
		nav: {
			object: oEntityContainer.EntitySets[0],
			property: "EntityType"
		},
		result: oEntityType.Properties[2].Type.Properties[0].Type.Properties[0]
	}].forEach(function (oFixture) {
		var sPath = oFixture.context ? oFixture.context + '/' + oFixture.path : oFixture.path;
		QUnit.test("requestObject: " + sPath, function (assert) {
			var oContext = oFixture.context && this.oMetaModel.getContext(oFixture.context),
				oHelperMock = this.oSandbox.mock(Helper);

			if (oFixture.error) {
				assert.throws(function () {
					this.oMetaModel.requestObject(oFixture.path, oContext);
				}, new Error(oFixture.error + ": " + oFixture.path));
				return undefined;
			}
			oHelperMock.expects("requestEntityContainer")
				.withExactArgs(this.oMetaModel)
				.returns(Promise.resolve(oEntityContainer));
			if (oFixture.nav) {
				oHelperMock.expects("requestProperty")
					.withExactArgs(this.oMetaModel.oModel, oFixture.nav.object,
						oFixture.nav.property, sinon.match.string)
					.returns(Promise.resolve(oEntityType));
			}

			return this.oMetaModel.requestObject(oFixture.path, oContext).then(function (oResult) {
				if ("result" in oFixture) {
					assert.deepEqual(oResult, oFixture.result);
				} else {
					assert.ok(false, "unexpected success");
				}
			})["catch"](function (oError) {
				if (oFixture.reject) {
					assert.strictEqual(oError.message,
						oFixture.reject + ": " + oFixture.path);
				} else {
					assert.ok(false, "unexpected error:" + oError);
				}
			});
		});
	});
});
