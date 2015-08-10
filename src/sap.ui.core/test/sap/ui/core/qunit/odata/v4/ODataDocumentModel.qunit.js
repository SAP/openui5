/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/_OlingoDocument",
	"sap/ui/model/odata/v4/ODataDocumentModel",
	"sap/ui/test/TestUtils"
], function (OlingoDocument, ODataDocumentModel, TestUtils) {
	"use strict";
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */

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

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataDocumentModel", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			if (!bRealOData) {
				TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data",
					mFixture);
			}
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oDocumentModel = new ODataDocumentModel(getServiceUrl(sDocumentUrl));
		},

		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(this.sDefaultLanguage);
			this.oSandbox.verifyAndRestore();
		},

		sDefaultLanguage : sap.ui.getCore().getConfiguration().getLanguage()
	});

	//*********************************************************************************************
	[{
		path: "Foo",
		error: "Not an absolute path"
	}, {
		path: "/EntitySets",
		error: '"EntitySets" unknown'
	}, {
		path: "/EntityContainer/EntityTypes(Fullname='com.sap.gateway.iwbep.tea_busi.v001.Worker')",
		reject: '"EntityTypes" unknown'
	}, {
		path: "/EntityContainer/EntitySets",
		reject: "Missing key"
	}, {
		path: "/EntityContainer/EntitySets(Name='EMPLOYEES')",
		reject: "\"EntitySets(Name='EMPLOYEES')\" unknown"
	}, {
		path: "/EntityContainer/EntitySets(Fullname='com.sap.gateway.iwbep.tea_busi.v0001.Container"
			+ "%2FEMPLOYEES')/Name(foo='bar')",
		reject: '"Name" is not an array'
	}, {
		path: "/EntityContainer/EntitySets(Fullname='com.sap.gateway.iwbep.tea_busi.v0001.Container"
			+ "%2FEMPLOYEES')/Foo",
		reject: '"Foo" unknown'
	}, {
		path: "/EntityContainer/EntitySets(Fullname='com.sap.gateway.iwbep.tea_busi.v0001.Container"
			+ "/EMPLOYEES')",
		reject: "\"EntitySets(Fullname='com.sap.gateway.iwbep.tea_busi.v0001.Container\" unknown"
	}].forEach(function (oFixture) {
		QUnit.test("requestObject: " + oFixture.path, function (assert) {
			if (oFixture.error) {
				assert.throws(function () {
					this.oDocumentModel.requestObject(oFixture.path);
				}, new Error(oFixture.error + ": " + oFixture.path));
			} else {
				return this.oDocumentModel.requestObject(oFixture.path).then(function () {
					assert.ok(false, "unexpected success");
				})["catch"](function (oError) {
					assert.ok(oError instanceof Error);
					assert.strictEqual(oError.message, oFixture.reject + ": " + oFixture.path);
				});
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("requestObject: /EntityContainer", function (assert) {
		var oEntityContainer = {
				"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Container"
			};

		this.oSandbox.mock(OlingoDocument).expects("transformEntityContainer")
			.returns(oEntityContainer);

		return this.oDocumentModel.requestObject("/EntityContainer").then(function (oResult) {
			assert.deepEqual(oResult, oEntityContainer);
		});
	});
	// TODO requestObject("/EntityContainer/QualifiedName")

	//*********************************************************************************************
	QUnit.test("requestObject: /EntityContainer/EntitySets(...)", function (assert) {
		var sEmployees = "com.sap.gateway.iwbep.tea_busi.v0001.Container/EMPLOYEES",
			oEntitySet = {
				"Fullname" : sEmployees
			};

		this.oSandbox.mock(OlingoDocument).expects("transformEntitySet")
			.withExactArgs(sinon.match.object, sEmployees)
			.returns(oEntitySet);

		return this.oDocumentModel.requestObject("/EntityContainer/EntitySets(Fullname='"
				+ encodeURIComponent(sEmployees) + "')"
		).then(function (oResult) {
			assert.deepEqual(oResult, oEntitySet);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestObject: /EntityContainer/EntitySets(...)/Fullname", function (assert) {
		var sEmployees = "com.sap.gateway.iwbep.tea_busi.v0001.Container/EMPLOYEES",
			oEntitySet = {
				"Fullname" : sEmployees
			};

		this.oSandbox.mock(OlingoDocument).expects("transformEntitySet")
			.withExactArgs(sinon.match.object, sEmployees)
			.returns(oEntitySet);

		return this.oDocumentModel.requestObject("/EntityContainer/EntitySets(Fullname='"
				+ encodeURIComponent(sEmployees) + "')/Fullname"
		).then(function (oResult) {
			assert.strictEqual(oResult, oEntitySet.Fullname);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestObject: /EntityContainer/EntitySets(...)/EntityType/Name",
		function (assert) {
			var oContext = this.oDocumentModel.getContext("/EntityContainer"),
				sEmployees = "com.sap.gateway.iwbep.tea_busi.v0001.Container/EMPLOYEES";

			return this.oDocumentModel.requestObject("EntitySets(Fullname='"
				+ encodeURIComponent(sEmployees) + "')/EntityType/Name",
				oContext
			).then(function (oResult) {
				assert.deepEqual(oResult, "Worker");
			});
		});

	//*********************************************************************************************
	QUnit.test("requestObject: navigate from EntityType to EntityType", function (assert) {
		return this.oDocumentModel.requestObject("/EntityContainer/EntitySets(Fullname='"
			+ "com.sap.gateway.iwbep.tea_busi.v0001.Container%2FEMPLOYEES')/EntityType/"
			+ "NavigationProperties(Fullname='com.sap.gateway.iwbep.tea_busi.v0001.Worker%2F"
			+ "EMPLOYEE_2_TEAM')/Name"// TODO /EntityType/Name"
		).then(function (oResult) {
			assert.strictEqual(oResult, "EMPLOYEE_2_TEAM");
		});
	});

	//*********************************************************************************************
	QUnit.test("read", function (assert) {
		var sPath = "/any/path/you/like",
			oData = {
				"foo" : "bar"
			};

		this.oSandbox.mock(this.oDocumentModel).expects("requestObject")
			.withExactArgs(sPath).returns(Promise.resolve(oData));

		return this.oDocumentModel.read(sPath + "?$expand=foo/bar").then(function (oResult) {
			assert.deepEqual(oResult, oData);
		});
	});
	// TODO requestObject: handle more cases
});
