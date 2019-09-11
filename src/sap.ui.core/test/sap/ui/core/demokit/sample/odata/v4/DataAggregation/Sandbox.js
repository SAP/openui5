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
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (jQuery, ODataModel, TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function setupMockServer() {
		TestUtils.setupODataV4Server(oSandbox, {
			"$metadata" : {
				source : "metadata.xml"
			},
			"BusinessPartners?$orderby=Region%20desc&$apply=groupby((Region),aggregate(SalesAmount))&$count=true&$skip=0&$top=110" : {
				source : "BusinessPartners_L1.json"
			}
		}, "sap/ui/core/sample/odata/v4/DataAggregation/data",
		"/serviceroot.svc/");
	}

	function adaptModelConstructor() {
		oSandbox.stub(sap.ui.model.odata.v4, "ODataModel", function (mParameters) {
			// clone: do not modify constructor call parameter
			mParameters = jQuery.extend({}, mParameters, {
				serviceUrl : TestUtils.proxy(mParameters.serviceUrl)
			});
			return new ODataModel(mParameters);
		});
	}

	if (TestUtils.isRealOData()) {
		adaptModelConstructor();
	} else {
		setupMockServer();
	}

	TestUtils.setData("sap.ui.core.sample.odata.v4.DataAggregation.sandbox", oSandbox);
});