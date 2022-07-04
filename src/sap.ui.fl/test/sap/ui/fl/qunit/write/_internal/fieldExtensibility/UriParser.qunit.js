/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/UriParser"
], function(
	UriParser
) {
	"use strict";

	var oServiceUri = {
		sServiceName: "SOME_SRVC_NM",
		sNamespace: "/namespace/",
		sPrefix: "/someService",
		sODataPrefix: "/sap/opu/odata",
		sSapPrefix: "/SAP",
		sVersion: ";v=0007"
	};

	var checkService = function(assert, sUri, sExpectedServiceName, sExpectedServiceVersion) {
		var oService = UriParser.parseServiceUri(sUri);
		assert.equal(oService.serviceName, sExpectedServiceName, "ServiceName correct");
		assert.equal(oService.serviceVersion, sExpectedServiceVersion, "ServiceVersion correct");
	};

	var checkServiceName = function(assert, sUri, sExpectedServiceName) {
		var oService = UriParser.parseServiceUri(sUri);
		assert.equal(oService.serviceName, sExpectedServiceName);
	};

	var checkServiceVersion = function(assert, sUri, sExpectedServiceVersion) {
		var oService = UriParser.parseServiceUri(sUri);
		assert.equal(oService.serviceVersion, sExpectedServiceVersion);
	};

	QUnit.module("sap.ui.fl.write._internal.fieldExtensibility.UriParser", {}, function() {
		QUnit.test("parseServiceName can extract a service name from an uri without a namespace", function(assert) {
			var sServiceName = oServiceUri.sServiceName;
			var sDeterminedServiceName = UriParser.parseServiceUri(sServiceName).serviceName;
			assert.equal(sDeterminedServiceName, sServiceName);
		});

		QUnit.test("parseServiceName can extract a service name from an 'sap/opu/odata/' uri", function(assert) {
			var sServiceNameWithNamespace = oServiceUri.sNamespace + oServiceUri.sServiceName;
			var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + sServiceNameWithNamespace;
			var sDeterminedServiceName = UriParser.parseServiceUri(sServiceUri).serviceName;
			assert.equal(sDeterminedServiceName, sServiceNameWithNamespace);
		});

		QUnit.test("parseServiceName can extract a simple service name from an 'sap/opu/odata/' uri with version information", function(assert) {
			var sServiceNameWithNamespace = oServiceUri.sNamespace + oServiceUri.sServiceName;
			var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + sServiceNameWithNamespace + oServiceUri.sVersion;
			var sDeterminedServiceName = UriParser.parseServiceUri(sServiceUri).serviceName;
			assert.equal(sDeterminedServiceName, sServiceNameWithNamespace);
		});

		QUnit.test("parseServiceName can extract a service name from an 'sap/opu/odata/SAP/' uri", function(assert) {
			var sServiceName = oServiceUri.sServiceName;
			var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + oServiceUri.sSapPrefix + "/" + sServiceName;
			var sDeterminedServiceName = UriParser.parseServiceUri(sServiceUri).serviceName;
			assert.equal(sDeterminedServiceName, sServiceName);
		});

		QUnit.test("parseServiceName can extract a simple service name from an 'sap/opu/odata/SAP/' uri with version information", function(
			assert) {
			var sServiceName = oServiceUri.sServiceName;
			var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + oServiceUri.sSapPrefix + "/" + sServiceName + oServiceUri.sVersion;
			var sDeterminedServiceName = UriParser.parseServiceUri(sServiceUri).serviceName;
			assert.equal(sDeterminedServiceName, sServiceName);
		});

		QUnit.test("Parse service version of relative uri", function(assert) {
			checkServiceVersion(assert, "sap/opu/odata/SAP/someService;v=0002", "0002");
			checkServiceVersion(assert, "/sap/opu/odata/SAP/someService;v=0002/", "0002");
			checkServiceVersion(assert, "sap/opu/odata/ns/someService;v=0002", "0002");
			checkServiceVersion(assert, "/sap/opu/odata/ns/someService;v=0002/", "0002");
			checkServiceVersion(assert, "/foo/opu/odata/ns/someService;v=0002/", "0002");
			checkServiceVersion(assert, "/foo/opu/odata/ns/someService;v=0002", "0002");
			checkServiceVersion(assert, "foo/opu/odata/ns/someService;v=0002/", "0002");
			checkServiceVersion(assert, "foo/opu/odata/ns/someService;v=0002", "0002");
			checkServiceVersion(assert, "foo/opu/odata/ns/someService;v=0002;w=foo", "0002");
			checkServiceVersion(assert, "sap/opu/odata/SAP/someService", "0001");
			checkServiceVersion(assert, "sap/opu/odata/SAP/someService;v=0002;v=0004", "0002");
			checkServiceVersion(assert, "foo/opu/odata/ns/someService;v=0002;w=foo?$format=json", "0002");
			checkServiceVersion(assert, "sap/opu/odata/ns/someService;v=0002;w=foo?$format=json", "0002");
		});

		QUnit.test("Parse service name (OData v2)", function(assert) {
			// 1.) Case
			checkServiceName(assert, "/sap/opu/odata/SAP/someService", "someService");
			checkServiceName(assert, "/sap/opu/odata/SAP/someService/", "someService");
			checkServiceName(assert, "/sap/opu/odata/SAP/someService;v=0002", "someService");
			checkServiceName(assert, "/sap/opu/odata/SAP/someService;v=0002/", "someService");

			checkServiceName(assert, "sap/opu/odata/SAP/someService", "someService");
			checkServiceName(assert, "sap/opu/odata/SAP/someService/", "someService");
			checkServiceName(assert, "sap/opu/odata/SAP/someService;v=0002", "someService");
			checkServiceName(assert, "sap/opu/odata/SAP/someService;v=0002/", "someService");

			checkServiceName(assert, "/sap/opu/odata/sap/someService", "someService");
			checkServiceName(assert, "/sap/opu/odata/SaP/someService/", "someService");
			checkServiceName(assert, "/sap/opu/oData/SAP/someService;v=0002", "someService");
			checkServiceName(assert, "/sap/Opu/odata/SAP/someService;v=0002/", "someService");
			checkServiceName(assert, "/Sap/Opu/odata/SAP/someService;v=0002/", "someService");
			checkServiceName(assert, "/Sap/Opu/odata/SAP/someService;v=0002/", "someService");

			checkServiceName(assert, "sap/opu/odata/SAP/someService;v=0002;w=foo?$format=xml", "someService");

			// 2.) Case
			checkServiceName(assert, "/sap/opu/odata/PAS/someService", "/PAS/someService");
			checkServiceName(assert, "/sap/opu/odata/PAS/someService/", "/PAS/someService");
			checkServiceName(assert, "/sap/opu/odata/PAS/someService;v=0002", "/PAS/someService");
			checkServiceName(assert, "/sap/opu/odata/PAS/someService;v=0002/", "/PAS/someService");
			checkServiceName(assert, "sap/opu/odata/PAS/someService", "/PAS/someService");
			checkServiceName(assert, "sap/opu/odata/PAS/someService/", "/PAS/someService");
			checkServiceName(assert, "sap/opu/odata/PAS/someService;v=0002", "/PAS/someService");
			checkServiceName(assert, "sap/opu/odata/PAS/someService;v=0002/", "/PAS/someService");

			// 3.) Case
			checkServiceName(assert, "/foo/opu/odata/SAP/someService", "someService");
			checkServiceName(assert, "/foo/opu/odata/SAP/someService/", "someService");
			checkServiceName(assert, "/foo/opu/odata/SAP/someService;v=0002", "someService");
			checkServiceName(assert, "/foo/opu/odata/SAP/someService;v=0002/", "someService");

			checkServiceName(assert, "foo/opu/odata/SAP/someService", "someService");
			checkServiceName(assert, "foo/opu/odata/SAP/someService/", "someService");
			checkServiceName(assert, "foo/opu/odata/SAP/someService;v=0002", "someService");
			checkServiceName(assert, "foo/opu/odata/SAP/someService;v=0002/", "someService");

			checkServiceName(assert, "/foo/opu/odata/PAS/someService", "someService");
			checkServiceName(assert, "/foo/opu/odata/PAS/someService/", "someService");
			checkServiceName(assert, "/foo/opu/odata/PAS/someService;v=0002", "someService");
			checkServiceName(assert, "/foo/opu/odata/PAS/someService;v=0002/", "someService");

			checkServiceName(assert, "foo/opu/odata/PAS/someService", "someService");
			checkServiceName(assert, "foo/opu/odata/PAS/someService/", "someService");
			checkServiceName(assert, "foo/opu/odata/PAS/someService;v=0002", "someService");
			checkServiceName(assert, "foo/opu/odata/PAS/someService;v=0002/", "someService");
		});

		QUnit.test("Parse OData v4 service document (relative, no segment or query parameters)", function(assert) {
			checkService(assert, "sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001", "sadl/sap/i_cfd_tsm_so_core", "0001");
		});

		QUnit.test("Parse OData v4 service document (no segment or query parameters)", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001", "sadl/sap/i_cfd_tsm_so_core", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0002/", "sadl/sap/i_cfd_tsm_so_core", "0002");
		});

		QUnit.test("Parse OData v4 service document (no segment or query parameters) - case sensitive", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/I_CFD_TSM_SO_CORE/0001", "sadl/sap/I_CFD_TSM_SO_CORE", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/I_CFD_TSM_SO_CORE/0002/", "sadl/sap/I_CFD_TSM_SO_CORE", "0002");
		});

		QUnit.test("Parse OData v4 service document (with segment but no query parameters)", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW", "sadl/sap/i_cfd_tsm_so_core", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0002;o=LOCAL_TGW/", "sadl/sap/i_cfd_tsm_so_core", "0002");
		});

		QUnit.test("Parse OData v4 service entity (with segment and query parameters)", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW/I_CfdTsm_Bupa?$format=json", "sadl/sap/i_cfd_tsm_so_core", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW/I_CfdTsm_Bupa/?$format=json", "sadl/sap/i_cfd_tsm_so_core", "0001");
		});

		QUnit.test("Parse OData v4 service entity navigation (with segment and query parameters)", function(assert) {
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW/I_CfdTsm_Bupa/toAss?$format=json", "sadl/sap/i_cfd_tsm_so_core", "0001");
			checkService(assert, "/sap/opu/odata4/grpNs/grpName/sadl/sap/i_cfd_tsm_so_core/0001;o=LOCAL_TGW/I_CfdTsm_Bupa/toAss/?$format=json", "sadl/sap/i_cfd_tsm_so_core", "0001");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});