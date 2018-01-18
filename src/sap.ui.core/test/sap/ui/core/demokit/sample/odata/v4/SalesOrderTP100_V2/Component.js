/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component: Consumption of an OData V2 Service via an OData V4 data
 * model.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (View, ViewType, BaseComponent, OperationMode, ODataModel, TestUtils) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrderTP100_V2.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== BaseComponent.prototype.proxy,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				sServiceUrl = fnProxy(oModel.sServiceUrl);


			if (oModel.sServiceUrl !== sServiceUrl) {
				//replace model from manifest in case of proxy
				oModel.destroy();
				oModel = new ODataModel({
					autoExpandSelect : true,
					odataVersion : "2.0",
					operationMode : OperationMode.Server,
					serviceUrl : sServiceUrl,
					synchronizationMode : "None"
				});
				this.setModel(oModel);
			}

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
						"$metadata" : {
							source : "metadataV2.xml"
						},
						"SEPM_C_SLSORDER_TP_100?$inlinecount=allpages&$expand=to_Item&$filter=SalesOrder%20ge%20'500000000'&$select=Customer,OverallStatus,SalesOrder,SalesOrderUUID,to_Item/GrossAmount,to_Item/Product,to_Item/SalesOrder,to_Item/SalesOrderItem,to_Item/SalesOrderItemUUID,to_Item/SalesOrderUUID&$skip=0&$top=5" : {
							source : "SEPM_C_SLSORDER_TP_100_Skip0_Top5_V2.json"
						},
						"SEPM_C_SLSORDER_TP_100?$inlinecount=allpages&$expand=to_Item&$filter=SalesOrder%20ge%20'500000000'&$select=Customer,OverallStatus,SalesOrder,SalesOrderUUID,to_Item/GrossAmount,to_Item/Product,to_Item/SalesOrder,to_Item/SalesOrderItem,to_Item/SalesOrderItemUUID,to_Item/SalesOrderUUID&$skip=5&$top=5" : {
							source : "SEPM_C_SLSORDER_TP_100_Skip5_Top5_V2.json"
						}
					}, "sap/ui/core/sample/odata/v4/SalesOrderTP100_V2/data", sServiceUrl);
			}

			return sap.ui.view({
				async : true,
				models : {
					undefined : oModel
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.SalesOrderTP100_V2.Main"
			});
		}
	});
});
