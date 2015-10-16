/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/_OlingoDocument",
	"sap/ui/test/TestUtils"
], function (Helper, OlingoDocument, TestUtils) {
	/*global odatajs, QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	/*
	 * You can run various tests in this module against a real OData v4 service using the request
	 * property "realOData". See src/sap/ui/test/TestUtils.js for details.
	 */

	var mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata": {source: "metadata.xml"},
			"/foo/$metadata": {code: 404} //TODO does not simulate an Olingo error
		},
		sDocumentUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata";

	/**
	 * Creates a fake model with the given URL.
	 *
	 * @param {string} [sUrl=sDocumentUrl]
	 *   the service URL
	 * @returns {object}
	 *   the fake model
	 */
	function createModel(sUrl) {
		return {
			sDocumentUrl : TestUtils.proxy(sUrl || sDocumentUrl)
		};
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._OlingoDocument", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.setupODataV4Server(this.oSandbox, mFixture);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		},

		withMetamodel : function (fnCallback) {
			var that = this;

			return OlingoDocument.requestDocument(createModel()).then(function (oDocument) {
				fnCallback.call(that, oDocument);
			});
		}
	});

	//*********************************************************************************************
	QUnit.test("getSchemaName", function (assert) {
		assert.strictEqual(OlingoDocument.getSchemaName("Baz"), "");
		assert.strictEqual(OlingoDocument.getSchemaName("bar.Baz"), "bar");
		assert.strictEqual(OlingoDocument.getSchemaName("foo.bar.Baz"), "foo.bar");
	});

	//*********************************************************************************************
	QUnit.test("getUnqualifiedName", function (assert) {
		assert.strictEqual(OlingoDocument.getUnqualifiedName("Baz"), "Baz");
		assert.strictEqual(OlingoDocument.getUnqualifiedName("bar.Baz"), "Baz");
		assert.strictEqual(OlingoDocument.getUnqualifiedName("foo.bar.Baz"), "Baz");
	});

	//*********************************************************************************************
	QUnit.test("parseTypeRef", function (assert) {
		assert.deepEqual(OlingoDocument.parseTypeRef("Edm.String"), {
			collection: false,
			qualifiedName: "Edm.String"
		});
		assert.deepEqual(OlingoDocument.parseTypeRef("Collection(Edm.String)"), {
			collection: true,
			qualifiedName: "Edm.String"
		});
	});

	//*********************************************************************************************
	QUnit.test("requestDocument: success", function (assert) {
		var oModel = createModel();

		this.oSandbox.spy(odatajs.oData, "request");

		OlingoDocument.requestDocument(oModel).then(function (oDocument) {
			TestUtils.deepContains(odatajs.oData.request.args[0][0], {
				requestUri: oModel.sDocumentUrl,
				method: "GET"
			});
			assert.strictEqual(odatajs.oData.request.args[0][3], odatajs.oData.metadataHandler);
			assert.ok("dataServices" in oDocument);
		});
		// a second request must not trigger a read
		return OlingoDocument.requestDocument(oModel).then(function (oDocument) {
			assert.strictEqual(odatajs.oData.request.callCount, 1);
			assert.ok("dataServices" in oDocument);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestDocument: read error", function (assert) {
		var oError = new Error("foo"),
			oModel = createModel("/foo/$metadata");

		this.oSandbox.mock(Helper).expects("createError").returns(oError);
		this.oLogMock.expects("error").withExactArgs("foo",
			"GET " + TestUtils.proxy("/foo/$metadata"),
			"sap.ui.model.odata.v4.ODataDocumentModel");

		return OlingoDocument.requestDocument(oModel).then(function () {
			assert.ok(false, "unexpected success");
		})["catch"](function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("findSchemaWithEntityContainer: success", function (assert) {
		var oDocument = {
				"dataServices" : {
					"schema" : [{
						"namespace" : "com.sap.gateway.iwbep.tea_busi.v0001"
					}, {
						"namespace" : "com.sap.gateway.iwbep.tea_busi.v0002",
						"entityContainer" : {
							"name" : "Container"
						}
					}]
				}
			},
			oResult = OlingoDocument.findSchemaWithEntityContainer(oDocument);

		assert.strictEqual(oResult, oDocument.dataServices.schema[1]);
	});

	//*********************************************************************************************
	QUnit.test("findSchemaWithEntityContainer: failure", function (assert) {
		var oDocument = {
				"dataServices" : {
					"schema" : [{
						"namespace" : "com.sap.gateway.iwbep.tea_busi.v0001"
					}, {
						"namespace" : "com.sap.gateway.iwbep.tea_busi.v0002"
					}]
				}
		};

		assert.throws(function() {
			OlingoDocument.findSchemaWithEntityContainer(oDocument);
		}, /EntityContainer not found/);
	});

	//*********************************************************************************************
	QUnit.test("findEntityType: success", function (assert) {
		return this.withMetamodel(function (oDocument) {
			var oResult = OlingoDocument.findEntityType(oDocument,
					"com.sap.gateway.iwbep.tea_busi.v0001.Worker");

			assert.strictEqual(oResult.name, "Worker");
			assert.strictEqual(oResult, oDocument.dataServices.schema[0].entityType[4]);
		});
	});

	//*********************************************************************************************
	QUnit.test("findEntityType: failures", function (assert) {
		return this.withMetamodel(function (oDocument) {
			[
				"Worker",
				"unknown.Worker",
				"com.sap.gateway.iwbep.tea_busi.v0001.Unknown"
			].forEach(function (sName) {
				assert.throws(function () {
					OlingoDocument.findEntityType(oDocument, sName);
				}, new Error("Unknown entity type: " + sName));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("findComplexType: success", function (assert) {
		return this.withMetamodel(function (oDocument) {
			var oResult = OlingoDocument.findComplexType(oDocument,
					"com.sap.gateway.iwbep.tea_busi.v0001.ComplexType_City");

			assert.strictEqual(oResult.name, "ComplexType_City");
			assert.strictEqual(oResult, oDocument.dataServices.schema[0].complexType[0]);
		});
	});

	//*********************************************************************************************
	QUnit.test("findComplexType: failures", function (assert) {
		return this.withMetamodel(function (oDocument) {
			[
				"unknown.ComplexType_City",
				"com.sap.gateway.iwbep.tea_busi.v0001.Unknown"
			].forEach(function (sName) {
				assert.throws(function () {
					OlingoDocument.findComplexType(oDocument, sName);
				}, new Error("Unknown complex type: " + sName));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("transformEntityContainer", function (assert) {
		var oEntityContainer = {
				"Name" : "Container",
				"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Container",
				"EntitySets" : [{
					"Name" : "Departments",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/Departments",
					"NavigationPropertyBindings" : 1,
					"EntityType" : {
						"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Department"
					}
				}, {
					"Name" : "EMPLOYEES",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/EMPLOYEES",
					"NavigationPropertyBindings" : 2,
					"EntityType" : {
						"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Worker"
					}
				},{
					"Name" : "Equipments",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/Equipments",
					"NavigationPropertyBindings" : 3,
					"EntityType" : {
						"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.EQUIPMENT"
					}
				}, {
					"Name" : "MANAGERS",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/MANAGERS",
					"NavigationPropertyBindings" : 4,
					"EntityType" : {
						"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.MANAGER"
					}
				}, {
					"Name" : "TEAMS",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/TEAMS",
					"NavigationPropertyBindings" : 5,
					"EntityType" : {
						"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM"
					}
				}],
				"Singletons" : [{
					"Name" : "Me",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/Me",
					"NavigationPropertyBindings" : 6,
					"Type" : {
						"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Worker"
					}
				}]
			},
			oMock = this.oSandbox.mock(OlingoDocument);

		return this.withMetamodel(function (oDocument) {
			var oContainer = oDocument.dataServices.schema[0].entityContainer;

			oMock.expects("transformNavigationPropertyBindings")
				.withExactArgs(oContainer.entitySet[0].navigationPropertyBinding,
					oEntityContainer.QualifiedName).returns(1);
			oMock.expects("transformNavigationPropertyBindings")
				.withExactArgs(oContainer.entitySet[1].navigationPropertyBinding,
					oEntityContainer.QualifiedName).returns(2);
			oMock.expects("transformNavigationPropertyBindings")
				.withExactArgs(oContainer.entitySet[2].navigationPropertyBinding,
					oEntityContainer.QualifiedName).returns(3);
			oMock.expects("transformNavigationPropertyBindings")
				.withExactArgs(oContainer.entitySet[3].navigationPropertyBinding,
					oEntityContainer.QualifiedName).returns(4);
			oMock.expects("transformNavigationPropertyBindings")
				.withExactArgs(oContainer.entitySet[4].navigationPropertyBinding,
					oEntityContainer.QualifiedName).returns(5);
			if (TestUtils.isRealOData()) { //TODO enhance backend service
				oEntityContainer.Singletons = [];
			} else {
				oMock.expects("transformNavigationPropertyBindings")
					.withExactArgs(oContainer.singleton[0].navigationPropertyBinding,
					oEntityContainer.QualifiedName).returns(6);
			}

			assert.deepEqual(OlingoDocument.transformEntityContainer(oDocument), oEntityContainer);
		});
	});

	//*********************************************************************************************
	QUnit.test("transformEntityContainer, no data", function (assert) {
		var oDocument = {
				"dataServices" : {
					"schema" : [{
						"namespace" : "com.sap.gateway.iwbep.tea_busi.v0001",
						"entityContainer" : {
							"name" : "Container"
						}
					}]
				}
			};

		assert.deepEqual(OlingoDocument.transformEntityContainer(oDocument), {
			"Name" : "Container",
			"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Container",
			"EntitySets" : [],
			"Singletons" : []
		});
	});

	//*********************************************************************************************
	QUnit.test("transformNavigationPropertyBindings", function (assert) {
		assert.deepEqual(OlingoDocument.transformNavigationPropertyBindings(undefined), []);

		return this.withMetamodel(function (oDocument) {
			var aBindings = oDocument.dataServices.schema[0].entityContainer.entitySet[1]
					.navigationPropertyBinding,
				sContainerName = "com.sap.gateway.iwbep.tea_busi.v0001.Container",
				aResult = [{
					"Path" : "EMPLOYEE_2_TEAM",
					"Target" : {
						"Fullname" : sContainerName + "/TEAMS"
					}
				}, {
					"Path" : "EMPLOYEE_2_EQUIPMENTS",
					"Target" : {
						"Fullname" : sContainerName + "/Equipments"
					}
				}];
			assert.deepEqual(OlingoDocument.transformNavigationPropertyBindings(aBindings,
				sContainerName), aResult);
		});
	});
	// TODO set Fullname. But what is the Fullname of NavigationPropertyBindings?

	//*********************************************************************************************
	QUnit.test("transformType: primitive type", function (assert) {
		var oEDMType = {
				"Name" : "String",
				"QualifiedName" : "Edm.String"
			};

		assert.deepEqual(OlingoDocument.transformType({}, "Edm.String"), oEDMType);
	});

	//*********************************************************************************************
	QUnit.test("transformStructuredType", function (assert) {
		var sQualifiedName = "com.sap.gateway.iwbep.tea_busi.v0001.ComplexType_Location",
			oType = {
				"Name" : "ComplexType_Location",
				"QualifiedName" : sQualifiedName,
				"Abstract" : false,
				"OpenType" : false,
				"Properties" : [{
					"Name" : "COUNTRY",
					"Fullname" : sQualifiedName + "/COUNTRY",
					"Nullable" : false,
					"Facets" : [{
						"Name" : "MaxLength",
						"Value" : "255"
					}],
					"Type" : {
						"Name" : "String",
						"QualifiedName" : "Edm.String"
					}
				}, {
					"Name" : "City",
					"Fullname" : sQualifiedName + "/City",
					"Nullable" : false,
					"Facets" : [],
					"Type" : {
						"Name" : "ComplexType_City",
						"QualifiedName" :
							"com.sap.gateway.iwbep.tea_busi.v0001.ComplexType_City",
						"Abstract" : false,
						"OpenType" : false,
						"Properties" : [{
							"Name" : "POSTALCODE",
							"Fullname" :
								"com.sap.gateway.iwbep.tea_busi.v0001.ComplexType_City/POSTALCODE",
							"Nullable" : false,
							"Facets" : [{
								"Name" : "MaxLength",
								"Value" : "16"
							}],
							"Type" : {
								"Name" : "String",
								"QualifiedName" : "Edm.String"
							}
						},{
							"Name" : "CITYNAME",
							"Fullname" :
								"com.sap.gateway.iwbep.tea_busi.v0001.ComplexType_City/CITYNAME",
							"Nullable" : false,
							"Facets" : [{
								"Name" : "MaxLength",
								"Value" : "255"
							}],
							"Type" : {
								"Name" : "String",
								"QualifiedName" : "Edm.String"
							}
						}]
					}
				}]
			};

		return this.withMetamodel(function (oDocument) {
			var oComplexType = oDocument.dataServices.schema[0].complexType[1];

			assert.deepEqual(OlingoDocument.transformStructuredType(oDocument, sQualifiedName,
				oComplexType), oType);
		});
	});
	// TODO Read all property types immediately or asynchronously like with navigation properties?
	//   Is it possible to read all primitive types of the document schema(s) with the first req?

	//*********************************************************************************************
	QUnit.test("transformType: structured type", function (assert) {
		var	oOlingoDocumentMock = this.oSandbox.mock(OlingoDocument),
			sQualifiedName = "com.sap.gateway.iwbep.tea_busi.v0001.ComplexType_City";

		return this.withMetamodel(function (oDocument) {
			oOlingoDocumentMock.expects("transformStructuredType")
				.withExactArgs(oDocument, sQualifiedName,
						oDocument.dataServices.schema[0].complexType[0])
				.returns({QualifiedName: sQualifiedName});

			assert.deepEqual(OlingoDocument.transformType(oDocument, sQualifiedName), {
				"QualifiedName" : sQualifiedName
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("transformType: Edm.Metadata.EntityType", function (assert) {
		var oComplexType = {
				name: "EntityType"
			},
			oDocument = {dataServices: {}},
			sTypeName = "Edm.Metadata.EntityType",
			oType = {QualifiedName: sTypeName},
			oMock = this.mock(OlingoDocument);

		oMock.expects("findComplexType").withExactArgs(oDocument, sTypeName)
			.returns(oComplexType);
		oMock.expects("transformStructuredType")
			.withExactArgs(oDocument, sTypeName, oComplexType)
			.returns(oType);

		assert.deepEqual(OlingoDocument.transformType(oDocument, sTypeName), oType);
	});

	//*********************************************************************************************
	[{
		"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM",
		"Key" : [{
			"PropertyPath" : "Team_Id"
		}],
		"NavigationProperties" : [{
			"Name" : "TEAM_2_EMPLOYEES",
			"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/TEAM_2_EMPLOYEES",
			"Nullable" : true,
			"ContainsTarget" : false,
			"IsCollection" : true,
			"Type" : {
				"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Worker"
			}
		}, {
			"Name" : "TEAM_2_MANAGER",
			"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/TEAM_2_MANAGER",
			"Nullable" : false,
			"ContainsTarget" : false,
			"IsCollection" : false,
			"Type" : {
				"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.MANAGER"
			}
		}]
	}, {
		"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Department",
		"Key" : [{
			"PropertyPath" : "Sector"
		}, {
			"PropertyPath" : "ID"
		}],
		"NavigationProperties" : []
	}].forEach(function (oEntityType, i) {
		QUnit.test("transformEntityType: " + oEntityType.QualifiedName, function (assert) {
			var that = this;

			return this.withMetamodel(function (oDocument) {
				that.oSandbox.mock(OlingoDocument).expects("transformStructuredType")
					.withExactArgs(oDocument, oEntityType.QualifiedName,
						oDocument.dataServices.schema[0].entityType[i > 0 ? 0 : 3])
					.returns({"QualifiedName" : oEntityType.QualifiedName});

				assert.deepEqual(
					OlingoDocument.transformEntityType(oDocument, oEntityType.QualifiedName),
					oEntityType);
			});
		});
	});

	// TODO unknown entity type
	// TODO in the Olingo document the key of an entityType is array of array?
	// TODO set "@odata.type" at the property's type?
});
