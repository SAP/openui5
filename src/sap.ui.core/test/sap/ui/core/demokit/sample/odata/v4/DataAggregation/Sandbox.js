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
	"jquery.sap.global",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	'sap/ui/thirdparty/sinon'
], function (jQuery, ODataModel, TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function setupMockServer() {
		TestUtils.setupODataV4Server(oSandbox, {
			"$metadata" : {
				source : "ZGK_C_SalesOrderItem.metadata.xml"
			},
			"ZGK_C_SalesOrderItem_RD_V4(P_DateFunction='PREVIOUSYEAR')/Set?$count=true&$orderby=ProductCategory%20desc&$apply=groupby((ProductCategory,DisplayCurrency),aggregate(NetAmountInDisplayCurrency))&$skip=0&$top=110" : {
				source : "ZGK_C_SalesOrderItem_L1.json"
			}
		}, "sap/ui/core/sample/odata/v4/DataAggregation/data",
		"/sap/opu/odata4/sap/zgk_c_salesorderitem_rd_v4_sb/srvd/sap/zgk_c_salesorderitem_rd_v4_sd/0001/");
	}

	function adaptModelConstructor() {
		oSandbox.stub(sap.ui.model.odata.v4, "ODataModel", function (mParameters) {
			var iQueryPos = mParameters.serviceUrl.indexOf("?"),
				sQuery = iQueryPos >= 0 ? mParameters.serviceUrl.slice(iQueryPos) : "";

			// clone: do not modify constructor call parameter
			mParameters = jQuery.extend({}, mParameters, {
				serviceUrl : TestUtils.proxy(mParameters.serviceUrl) + sQuery
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
}, /* bExport= */false);