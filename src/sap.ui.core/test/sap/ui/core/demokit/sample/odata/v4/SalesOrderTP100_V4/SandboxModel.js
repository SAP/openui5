/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			sFilterBase :
				"/sap/opu/odata4/sap/sepm_odata_ref/sadl/sap/sepm_c_slsorder_tp_100/0001/",
			mFixture : {
				"SEPM_C_SLSORDER_TP_100?$count=true&$expand=_Item($select=GrossAmount,Product,SalesOrder,SalesOrderItem,SalesOrderItemUUID,SalesOrderUUID)&$select=Customer,OverallStatus,SalesOrder,SalesOrderUUID&$skip=0&$top=5" : {
					source : "SEPM_C_SLSORDER_TP_100_Skip0_Top5_V4.json"
				},
				"SEPM_C_SLSORDER_TP_100?$count=true&$expand=_Item($select=GrossAmount,Product,SalesOrder,SalesOrderItem,SalesOrderItemUUID,SalesOrderUUID)&$select=Customer,OverallStatus,SalesOrder,SalesOrderUUID&$skip=5&$top=5" : {
					source : "SEPM_C_SLSORDER_TP_100_Skip5_Top5_V4.json"
				}
			},
			aRegExps : [{
				regExp : /^GET [\w\/]+slsorder_tp_100\/0001\/\$metadata\?sap-language=..$/,
				response : {source : "metadata.xml"}
			}, {
				regExp : /^GET [\w\/]+slsorderitem_tp_100\/0001\/\$metadata\?sap-language=..$/,
				response : {source : "metadata_item.xml"}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.SalesOrderTP100_V4.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
