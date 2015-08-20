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
	 * You can run various tests in this module against a real OData v4 service. Set the system
	 * property "com.sap.ui5.proxy.REMOTE_LOCATION" to a server containing the Gateway test
	 * service "/sap/opu/local_v4/IWBEP/TEA_BUSI" and load the page with the request property
	 * "realOData=true".
	 */

	var mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata": {source: "metadata.xml"},
			"/foo/$metadata": {code: 404}
		},
		bRealOData = jQuery.sap.getUriParameters().get("realOData") === "true",
		sDocumentUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata";

	/**
	 * Gets the correct service URL. Adjusts it in case of <code>bRealOData</code>, so that it is
	 * passed through the proxy.
	 *
	 * @param {string} sUrl the URL
	 * @returns {string} the adjusted URL
	 */
	function getServiceUrl(sUrl) {
		if (bRealOData) {
			sUrl = "../../../../../../../proxy" + sUrl;
		}
		return sUrl;
	}

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
			sDocumentUrl : getServiceUrl(sUrl || sDocumentUrl)
		};
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._OlingoDocument", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			if (!bRealOData) {
				TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data",
					mFixture);
			}
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
		var oModel = createModel("/foo/$metadata");

		this.oSandbox.mock(Helper).expects("handleODataError")
			.withExactArgs(sinon.match.object, "Could not read metadata",
				"sap.ui.model.odata.v4.ODataDocumentModel")
			.returns("Could not read metadata");

		return OlingoDocument.requestDocument(oModel).then(function () {
			assert.ok(false, "unexpected success");
		})["catch"](function (oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(oError.message, "Could not read metadata");
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
					"EntityType@odata.navigationLink" :
						"Types(QualifiedName='com.sap.gateway.iwbep.tea_busi.v0001.Department')"
				}, {
					"Name" : "EMPLOYEES",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/EMPLOYEES",
					"EntityType@odata.navigationLink" :
						"Types(QualifiedName='com.sap.gateway.iwbep.tea_busi.v0001.Worker')"
				},{
					"Name" : "Equipments",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/Equipments",
					"EntityType@odata.navigationLink" :
						"Types(QualifiedName='com.sap.gateway.iwbep.tea_busi.v0001.EQUIPMENT')"
				}, {
					"Name" : "MANAGERS",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/MANAGERS",
					"EntityType@odata.navigationLink" :
						"Types(QualifiedName='com.sap.gateway.iwbep.tea_busi.v0001.MANAGER')"
				}, {
					"Name" : "TEAMS",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/TEAMS",
					"EntityType@odata.navigationLink" :
						"Types(QualifiedName='com.sap.gateway.iwbep.tea_busi.v0001.TEAM')"
				}],
				"Singletons" : [{
					"Name" : "Me",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/Me",
					"Type@odata.navigationLink" :
						"Types(QualifiedName='com.sap.gateway.iwbep.tea_busi.v0001.Worker')"
				}]
			};
		return this.withMetamodel(function (oDocument) {
			assert.deepEqual(OlingoDocument.transformEntityContainer(oDocument),
				oEntityContainer);
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
	QUnit.test("transformType: primitive type", function (assert) {
		var oEDMType = {
				"Name" : "String",
				"QualifiedName" : "Edm.String"
			};

		return this.withMetamodel(function (oDocument) {
			assert.deepEqual(OlingoDocument.transformType(oDocument, "Edm.String"), oEDMType);
		});
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
				name: "EntityType",
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
	QUnit.test("transformEntityType", function (assert) {
		var sQualifiedName = "com.sap.gateway.iwbep.tea_busi.v0001.TEAM",
			oEntityType = {
				"QualifiedName" : sQualifiedName,
				"Key" : [{
					"PropertyPath" : "Team_Id"
				}],
				"NavigationProperties" : [{
					"Name" : "TEAM_2_EMPLOYEES",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/TEAM_2_EMPLOYEES",
					"Nullable" : true,
					"ContainsTarget" : false,
					"IsCollection" : true,
					"Type@odata.navigationLink" :
						"Types(QualifiedName='com.sap.gateway.iwbep.tea_busi.v0001.Worker')"
				}, {
					"Name" : "TEAM_2_MANAGER",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/TEAM_2_MANAGER",
					"Nullable" : false,
					"ContainsTarget" : false,
					"IsCollection" : false,
					"Type@odata.navigationLink" :
						"Types(QualifiedName='com.sap.gateway.iwbep.tea_busi.v0001.MANAGER')"
				}]
			},
			that = this;

		return this.withMetamodel(function (oDocument) {
			that.oSandbox.mock(OlingoDocument).expects("transformStructuredType")
				.withExactArgs(oDocument,
						sQualifiedName, oDocument.dataServices.schema[0].entityType[3])
				.returns({"QualifiedName": sQualifiedName})

			assert.deepEqual(OlingoDocument.transformEntityType(oDocument,
				sQualifiedName), oEntityType);
		});

		return oDocumentModel.requestDocument().then(function (oDocument) {
			that.oSandbox.mock(oDocumentModel).expects("transformStructuredType")
				.withExactArgs(oDocument,
					sQualifiedName, oDocument.dataServices.schema[0].entityType[3])
				.returns({"QualifiedName": sQualifiedName})

			assert.deepEqual(oDocumentModel.transformEntityType(oDocument,
				sQualifiedName), oEntityType);
		});
	});

	// TODO unknown entity type
	// TODO in the Olingo document the key of an entityType is array of array?
	// TODO set "@odata.type" at the property's type?
});
