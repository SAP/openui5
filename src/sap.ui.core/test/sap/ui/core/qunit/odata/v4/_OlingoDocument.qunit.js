/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/_OlingoDocument",
	"sap/ui/test/TestUtils"
], function (Helper, OlingoDocument, TestUtils) {
	/*global odatajs, QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	/*
	 * You can run various tests in this module against a real OData v4 service. Set the system
	 * property "com.sap.ui5.proxy.REMOTE_LOCATION" to a server containing the Gateway test
	 * service "/sap/opu/local_v4/IWBEP/TEA_BUSI" and load the page with the request property
	 * "realOData=true".
	 */

	var mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata": {source: "metadata.xml"}
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
	QUnit.test("unqualfiedName", function (assert) {
		assert.strictEqual(OlingoDocument.unqualifiedName("Baz"), "Baz");
		assert.strictEqual(OlingoDocument.unqualifiedName("bar.Baz"), "Baz");
		assert.strictEqual(OlingoDocument.unqualifiedName("foo.bar.Baz"), "Baz");
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
	QUnit.test("findEntitySet: success", function (assert) {
		return this.withMetamodel(function (oDocument) {
			var oResult = OlingoDocument.findEntitySet(oDocument,
					"com.sap.gateway.iwbep.tea_busi.v0001.Container/EMPLOYEES");

			assert.strictEqual(oResult.name, "EMPLOYEES");
			assert.strictEqual(oResult,
				oDocument.dataServices.schema[0].entityContainer.entitySet[1]);
		});
	});

	//*********************************************************************************************
	QUnit.test("findEntitySet: failure", function (assert) {
		return this.withMetamodel(function (oDocument) {
			[
				"foo.Container/EMPLOYEES",
				"com.sap.gateway.iwbep.tea_busi.v0001.Container/Unknown"
			].forEach(function (sName) {
				assert.throws(function () {
					OlingoDocument.findEntitySet(oDocument, sName);
				}, new Error("Unknown entity set: " + sName));
			});
		});
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
	QUnit.test("transformEntityContainer", function (assert) {
		var oEntityContainer = {
				"Name" : "Container",
				"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Container"
			};
		return this.withMetamodel(function (oDocument) {
			assert.deepEqual(OlingoDocument.transformEntityContainer(oDocument), oEntityContainer);
		});
	});

	//*********************************************************************************************
	QUnit.test("transformEntitySet", function (assert) {
		var oEntityType = {
				"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.MANAGER"
			},
			oEntitySet = {
				"Name" : "MANAGERS",
				"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.Container/MANAGERS",
				"EntityType" : oEntityType
			};

		this.oSandbox.mock(OlingoDocument).expects("transformEntityType")
			.withExactArgs(sinon.match.object, "com.sap.gateway.iwbep.tea_busi.v0001.MANAGER")
			.returns(oEntityType);

		return this.withMetamodel(function (oDocument) {
			assert.deepEqual(OlingoDocument.transformEntitySet(oDocument,
				"com.sap.gateway.iwbep.tea_busi.v0001.Container/MANAGERS"), oEntitySet);
		});
	});

	//*********************************************************************************************
	QUnit.test("transformEntityType", function (assert) {
		var oEntityType = {
				"Name" : "TEAM",
				"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM",
				"Abstract" : false,
				"OpenType" : false,
				"Key" : [{
					"PropertyPath" : "Team_Id"
				}],
				"Properties" : [{
					"Name" : "Team_Id",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/Team_Id",
					"Nullable" : false,
					"Facets" : [{
						"Name" : "MaxLength",
						"Value" : "10"
					}],
					"Type" : {
						"Name" : "String",
						"QualifiedName" : "Edm.String"
					}
				}, {
					"Name" : "Name",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/Name",
					"Nullable" : false,
					"Facets" : [{
						"Name" : "MaxLength",
						"Value" : "40"
					}],
					"Type" : {
						"Name" : "String",
						"QualifiedName" : "Edm.String"
					}
				}, {
					"Name" : "MEMBER_COUNT",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/MEMBER_COUNT",
					"Nullable" : false,
					"Facets" : [],
					"Type" : {
						"Name" : "Int32",
						"QualifiedName" : "Edm.Int32"
					}
				}, {
					"Name" : "MANAGER_ID",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/MANAGER_ID",
					"Nullable" : false,
					"Facets" : [{
						"Name" : "MaxLength",
						"Value" : "4"
					}],
					"Type" : {
						"Name" : "String",
						"QualifiedName" : "Edm.String"
					}
				}, {
					"Name" : "BudgetCurrency",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/BudgetCurrency",
					"Nullable" : false,
					"Facets" : [{
						"Name" : "MaxLength",
						"Value" : "5"
					}],
					"Type" : {
						"Name" : "String",
						"QualifiedName" : "Edm.String"
					}
				}, {
					"Name" : "Budget",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/Budget",
					"Nullable" : false,
					"Facets" : [{
						"Name" : "Precision",
						"Value" : "16"
					}, {
						"Name" : "Scale",
						"Value" : "variable"
					}],
					"Type" : {
						"Name" : "Decimal",
						"QualifiedName" : "Edm.Decimal"
					}
				}],
				"NavigationProperties" : [{
					"Name" : "TEAM_2_EMPLOYEES",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/TEAM_2_EMPLOYEES",
					"Nullable" : true,
					"ContainsTarget" : false,
					"IsCollection" : true
				}, {
					"Name" : "TEAM_2_MANAGER",
					"Fullname" : "com.sap.gateway.iwbep.tea_busi.v0001.TEAM/TEAM_2_MANAGER",
					"Nullable" : false,
					"ContainsTarget" : false,
					"IsCollection" : false
				}]
			};
		return this.withMetamodel(function (oDocument) {
			assert.deepEqual(OlingoDocument.transformEntityType(oDocument,
				"com.sap.gateway.iwbep.tea_busi.v0001.TEAM"), oEntityType);
		});
	});
	// TODO unknown entity type
	// TODO in the Olingo document the key of an entityType is array of array?
	// TODO set "@odata.type" at the property's type?
});
