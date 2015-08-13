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
	/*eslint no-warning-comments: 0 */
	"use strict";

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
	[
		"/Employees",
		"/Employees(ID='1')",
		"/Employees[5];list=1"
	].forEach(function (sPath) {
		QUnit.test("requestMetaContext: " + sPath, function (assert) {
			var oEntitySet = {
					"Fullname" : "foo.bar.Container/Employees"
				},
				that = this;

			this.oSandbox.mock(Helper).expects("requestEntitySet")
				.withExactArgs(this.oMetaModel.oModel, "Employees")
				.returns(Promise.resolve(oEntitySet));

			return this.oMetaModel.requestMetaContext(sPath).then(function (oMetaContext) {
				assert.strictEqual(oMetaContext.getModel(), that.oMetaModel);
				assert.strictEqual(oMetaContext.getPath(), "/EntityContainer/EntitySets(Fullname="
					+ "'foo.bar.Container%2FEmployees')/EntityType");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("requestMetaContext: /UnknownSet", function (assert) {
		this.oSandbox.mock(Helper).expects("requestEntitySet")
			.withExactArgs(this.oMetaModel.oModel, "UnknownSet")
			.returns(Promise.reject(new Error("EntitySet not found")));

		return this.oMetaModel.requestMetaContext("/UnknownSet").then(function () {
			assert.ok(false, "Unexpected success");
		})["catch"](function (oError) {
			assert.strictEqual(oError.message, "EntitySet not found");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestMetaContext: /Employees(ID='1')/ENTRYDATE", function (assert) {
		var oEntitySet = {
				"Fullname" : "foo.bar.Container/Employees",
				"EntityType" : {
					"QualifiedName" : "foo.bar.Worker",
					"Properties" : [{
						"Name" : "ID",
						"Fullname" : "foo.bar.Worker/ID"
					}, {
						"Name" : "ENTRYDATE",
						"Fullname" : "foo.bar.Worker/ENTRYDATE"
					}]
				}
			},
			that = this;

		this.oSandbox.mock(Helper).expects("requestEntitySet")
			.withExactArgs(this.oMetaModel.oModel, "Employees")
			.returns(Promise.resolve(oEntitySet));

		return this.oMetaModel.requestMetaContext(
			"/Employees(ID='1')/ENTRYDATE"
		).then(function (oMetaContext) {
			assert.strictEqual(oMetaContext.getModel(), that.oMetaModel);
			assert.strictEqual(oMetaContext.getPath(), "/EntityContainer/EntitySets(Fullname="
				+ "'foo.bar.Container%2FEmployees')/EntityType/Properties(Fullname="
				+ "'foo.bar.Worker%2FENTRYDATE')");
		});
	});

	//*********************************************************************************************
	[{
		path: "/Employees(ID='1')/Unknown",
		error: "Unknown property: foo.bar.Worker/Unknown"
	}, {
		path: "/Employees(ID='1')/LOCATION/Unknown",
		error: "Unknown property: foo.bar.ComplexType_Location/Unknown"
	}].forEach(function (oFixture) {
		QUnit.test("requestMetaContext: " + oFixture.path, function (assert) {
			var oMetaModelMock = this.oSandbox.mock(this.oMetaModel.oModel),
				oEntitySet = {
					"Fullname" : "foo.bar.Container/Employees",
					"EntityType" : {
						"QualifiedName" : "foo.bar.Worker",
						"Properties" : [{
							"Name" : "LOCATION",
							"Fullname" : "foo.bar.Worker/LOCATION",
							"Type" : {
								"Name" : "ComplexType_Location",
								"QualifiedName" : "foo.bar.ComplexType_Location",
								"Properties" : []
							}
						}]
					}
				};

			this.oSandbox.mock(Helper).expects("requestEntitySet")
				.withExactArgs(this.oMetaModel.oModel, "Employees")
				.returns(Promise.resolve(oEntitySet));

			return this.oMetaModel.requestMetaContext(oFixture.path).then(function () {
				assert.ok(false, "Unexpected success");
			})["catch"](function (oError) {
				assert.strictEqual(oError.message, oFixture.error + ": " + oFixture.path);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("requestMetaContext: /Employees(ID='1')/LOCATION/City/CITYNAME", function (assert) {
		var oEntitySet = {
				"Fullname" : "foo.bar.Container/Employees",
				"EntityType" : {
					"QualifiedName" : "foo.bar.Worker",
					"Properties" : [{
						"Name" : "ID",
						"Fullname" : "foo.bar.Worker/ID"
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
					}]
				}
			},
			that = this;

		this.oSandbox.mock(Helper).expects("requestEntitySet")
			.withExactArgs(this.oMetaModel.oModel, "Employees")
			.returns(Promise.resolve(oEntitySet));

		return this.oMetaModel.requestMetaContext(
			"/Employees(ID='1')/LOCATION/City/CITYNAME"
		).then(function (oMetaContext) {
			assert.strictEqual(oMetaContext.getModel(), that.oMetaModel);
			assert.strictEqual(oMetaContext.getPath(), "/EntityContainer/EntitySets(Fullname="
				+ "'foo.bar.Container%2FEmployees')/EntityType/Properties(Fullname="
				+ "'foo.bar.Worker%2FLOCATION')/Type/Properties(Fullname="
				+ "'foo.bar.ComplexType_Location%2FCity')/Type/Properties(Fullname="
				+ "'foo.bar.ComplexType_City%2FCITYNAME')");
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
	// TODO requestMetaContext: singleton
	// TODO requestMetaContext: simple navigation property
	// TODO requestMetaContext: (navigation) property with key predicate
	// TODO requestMetaContext: use @odata.context to get the name of the initial set/singleton

	//*********************************************************************************************
	QUnit.test("requestObject", function (assert) {
		var oContext = this.oMetaModel.oModel.getContext("/"),
			sPath = "my/metamodel/path",
			oPromise = {};

		this.oSandbox.mock(this.oMetaModel.oModel).expects("requestObject")
			.withExactArgs(oContext.getPath() + sPath).returns(oPromise);

		assert.strictEqual(this.oMetaModel.requestObject(sPath, oContext), oPromise);
	});
});
