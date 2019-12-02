/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// For the "realOData" case, the URL is adapted to a proxy URL and certain constructor parameters
// are taken from URL parameters.
// For the "non-realOData" case, a mock server for the backend requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			mFixture : {
				"$metadata" : {
					source : "metadataV2.xml"
				},
				"SEPM_C_SLSORDER_TP_100?$inlinecount=allpages&$expand=to_Item&$filter=SalesOrder%20ge%20'500000000'&$select=Customer,OverallStatus,SalesOrder,SalesOrderUUID,to_Item/GrossAmount,to_Item/Product,to_Item/SalesOrder,to_Item/SalesOrderItem,to_Item/SalesOrderItemUUID,to_Item/SalesOrderUUID&$skip=0&$top=5" : {
					source : "SEPM_C_SLSORDER_TP_100_Skip0_Top5_V2.json"
				},
				"SEPM_C_SLSORDER_TP_100?$inlinecount=allpages&$expand=to_Item&$filter=SalesOrder%20ge%20'500000000'&$select=Customer,OverallStatus,SalesOrder,SalesOrderUUID,to_Item/GrossAmount,to_Item/Product,to_Item/SalesOrder,to_Item/SalesOrderItem,to_Item/SalesOrderItemUUID,to_Item/SalesOrderUUID&$skip=5&$top=5" : {
					source : "SEPM_C_SLSORDER_TP_100_Skip5_Top5_V2.json"
				}
			},
			sFilterBase : "/sap/opu/odata/sap/sepm_c_slsorder_tp_100_cds/",
			sSourceBase : "sap/ui/core/sample/odata/v4/SalesOrderTP100_V2/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.SalesOrderTP100_V2.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});