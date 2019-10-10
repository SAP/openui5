/*!
 * ${copyright}
 */

// Provides a sandbox for this component:
// For the "realOData" case when the component runs with backend, the v4.ODataModel constructor
//   is wrapped so that the URL is adapted to a proxy URL and certain constructor parameters are
//   taken from URL parameters
// For the "non-realOData" case, sets up a mock server for the backend requests.
//
// Note: For setup to work properly, this module has to be loaded *before* model instantiation
//   from the component's manifest. Add it as "js" resource to sap.ui5/resources in the
//   manifest.json to achieve that.
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (UriParameters, ODataModel, TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function setupMockServer() {
		TestUtils.setupODataV4Server(oSandbox, {
				"$metadata?custom-option=value" : {
					source : "metadata.xml"
				},
				"BusinessPartnerList?custom-option=value&$filter=BusinessPartnerID%20lt%20'0100000030'&$select=BusinessPartnerID,CompanyName&$skip=0&$top=21" : {
					source : "BusinessPartnerList_skip0_top21.json"
				},
				"BusinessPartnerList?custom-option=value&$filter=BusinessPartnerID%20lt%20'0100000030'&$select=BusinessPartnerID,CompanyName&$skip=20&$top=22" : {
					source : "BusinessPartnerList_skip20_top22.json"
				},
				"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000030'&$select=BusinessPartnerID,CompanyName&$skip=0&$top=21" : {
					source : "BusinessPartnerList_skip0_top21_count.json"
				},
				"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000030'&$select=BusinessPartnerID,CompanyName&$skip=20&$top=10" : {
					source : "BusinessPartnerList_skip20_top10_count.json"
				}
			}, "sap/ui/core/sample/odata/v4/ServerDrivenPaging/data",
			"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/");
	}

	function adaptModelConstructor() {
		var Constructor = sap.ui.model.odata.v4.ODataModel;

		oSandbox.stub(sap.ui.model.odata.v4, "ODataModel", function (mParameters) {
			var b$Direct = UriParameters.fromQuery(window.location.search).has("$direct");

			// clone: do not modify constructor call parameter
			mParameters = Object.assign({}, mParameters, {
				groupId : b$Direct ? "$direct" : "$auto",
				serviceUrl : TestUtils.proxy(mParameters.serviceUrl),
				updateGroupId : b$Direct ? "$direct" : "$auto"
			});
			return new Constructor(mParameters);
		});
	}

	if (TestUtils.isRealOData()) {
		adaptModelConstructor();
	} else {
		setupMockServer();
	}

	TestUtils.setData("sap.ui.core.sample.odata.v4.ServerDrivenPaging.sandbox", oSandbox);
});