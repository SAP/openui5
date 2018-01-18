/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component: Consumption of an OData V4 service.
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

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrderTP100_V4.Component", {
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
					operationMode : OperationMode.Server,
					serviceUrl : sServiceUrl,
					synchronizationMode : "None"
				});
				this.setModel(oModel);
			}

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
						"/sap/opu/odata4/sap/sepm_odata_ref/sadl/sap/sepm_c_slsorder_tp_100/0001/$metadata" : {
							source : "metadataV4.xml"
						},
						"/sap/opu/odata4/sap/sepm_odata_ref/sadl/sap/sepm_c_slsorderitem_tp_100/0001/$metadata" : {
							source : "metadataV4_item.xml"
						},
						"SEPM_C_SLSORDER_TP_100?$count=true&$expand=_Item($select=GrossAmount,Product,SalesOrder,SalesOrderItem,SalesOrderItemUUID,SalesOrderUUID)&$select=Customer,OverallStatus,SalesOrder,SalesOrderUUID&$skip=0&$top=5" : {
							source : "SEPM_C_SLSORDER_TP_100_Skip0_Top5_V4.json"
						},
						"SEPM_C_SLSORDER_TP_100?$count=true&$expand=_Item($select=GrossAmount,Product,SalesOrder,SalesOrderItem,SalesOrderItemUUID,SalesOrderUUID)&$select=Customer,OverallStatus,SalesOrder,SalesOrderUUID&$skip=5&$top=5" : {
							source : "SEPM_C_SLSORDER_TP_100_Skip5_Top5_V4.json"
						}
					}, "sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/data", sServiceUrl);
			}

			return sap.ui.view({
				async : true,
				models : {
					undefined : oModel
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.SalesOrderTP100_V4.Main"
			});
		}
	});
});
