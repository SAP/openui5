/*!
 * ${copyright}
 */

// Provides a sandbox for this component:
// For the "realOData" case when the component runs with backend, the v2.ODataModel constructor
//   is wrapped so that the URL is adapted to a proxy URL
// For the "non-realOData" case, sets up a mock server for the backend requests.
//
// Note: For setup to work properly, this module has to be loaded *before* model instantiation
//   from the component's manifest. Add it as "js" resource to sap.ui5/resources in the
//   manifest.json to achieve that.
sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (ODataModel, TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function setupMockServer() {
		TestUtils.setupODataV4Server(oSandbox, {
			"$metadata?sap-language=EN" : {
				source : "metadata.xml"
			},
			"Items?$select=CompanyCode,AmountInCompanyCodeCurrency,CompanyCodeCurrency&$filter=(DueItemCategory%20eq%20%27N%27)%20and%20(IsCleared%20eq%20%27%20%27)%20and%20(KeyDate%20eq%20datetime%272019-07-01T00%3a00%3a00%27)&$orderby=CompanyCode%20asc&$top=5" : {
				source : "Items_L0_top5.json"
			},
			"Items?$select=CompanyCode,Customer,CustomerName,CompanyCodeCurrency,AmountInCompanyCodeCurrency&$filter=(DueItemCategory%20eq%20%27N%27)%20and%20(IsCleared%20eq%20%27%20%27)%20and%20(KeyDate%20eq%20datetime%272019-07-01T00%3a00%3a00%27)&$orderby=CompanyCode%20asc&$top=8" : {
				source : "Items_L1_top8.json"
			},
			"Items?$select=CompanyCode,Customer,CustomerName,CompanyCodeCurrency,AmountInCompanyCodeCurrency&$filter=(CompanyCode%20eq%20%27A%27)%20and%20(DueItemCategory%20eq%20%27N%27)%20and%20(IsCleared%20eq%20%27%20%27)%20and%20(KeyDate%20eq%20datetime%272019-07-01T00%3a00%3a00%27)&$orderby=CompanyCode%20asc&$skip=8&$top=10005&$inlinecount=allpages" : {
				source : "Items_L1_A_skip8.json"
			},
			"Items?$select=CompanyCode,Customer,CustomerName,CompanyCodeCurrency,AmountInCompanyCodeCurrency&$filter=(CompanyCode%20eq%20%27B%27)%20and%20(DueItemCategory%20eq%20%27N%27)%20and%20(IsCleared%20eq%20%27%20%27)%20and%20(KeyDate%20eq%20datetime%272019-07-01T00%3a00%3a00%27)&$orderby=CompanyCode%20asc&$top=10005&$inlinecount=allpages" : {
				source : "Items_L1_B.json"
			},
			"Items?$select=CompanyCode,Customer,CustomerName,CompanyCodeCurrency,AmountInCompanyCodeCurrency&$filter=(CompanyCode%20eq%20%27C%27)%20and%20(DueItemCategory%20eq%20%27N%27)%20and%20(IsCleared%20eq%20%27%20%27)%20and%20(KeyDate%20eq%20datetime%272019-07-01T00%3a00%3a00%27)&$orderby=CompanyCode%20asc&$top=10005&$inlinecount=allpages" : {
				source : "Items_L1_C.json"
			}
		}, "sap/ui/core/sample/odata/v2/AutoExpand/data",
		"/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/");
	}

	if (!TestUtils.isRealOData()) {
		setupMockServer();
	}

	TestUtils.setData("sap.ui.core.sample.odata.v2.AutoExpand.sandbox", oSandbox);
});