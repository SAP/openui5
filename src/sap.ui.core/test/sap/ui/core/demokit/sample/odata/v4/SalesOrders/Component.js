/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   V4_GW_SAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/URI"
], function (View, BaseComponent, JSONModel, ODataModel, TestUtils, sinon, URI) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== sap.ui.core.sample.common.Component.prototype.proxy,
				oModel = this.getModel(),
				mModelParameters,
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				bRealOData = TestUtils.isRealOData(),
				sServiceUrl = fnProxy(oModel.sServiceUrl),
				sQuery;

			if (oModel.sServiceUrl !== sServiceUrl) {
				//replace model from manifest in case of proxy
				sQuery = URI.buildQuery(oModel.mUriParameters);
				sQuery = sQuery ? "?" + sQuery : "";
				if (jQuery.sap.getUriParameters().get("$direct")) { // switch off batch
					mModelParameters = {defaultGroup : "$direct"}
				}
				oModel = new ODataModel(sServiceUrl + sQuery, mModelParameters);
				this.setModel(oModel);
			}

			// TODO: Add Mockdata for single sales orders *with expand*
			// http://localhost:8080/testsuite/proxy/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/SalesOrderList('050001110')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))
			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
					"$metadata" : {source : "metadata.xml" },
					"$batch" : {
						"SalesOrderList\?$expand=SO_2_BP\&$select=SalesOrderID,BuyerName,GrossAmount,CurrencyCode&$skip=0&$top=5" : {
							source : "SalesOrderAndBusinessPartnerList.txt"
						},
						"SalesOrderList?$expand=SO_2_BP&$select=SalesOrderID,BuyerName,GrossAmount,CurrencyCode&$skip=5&$top=5" : {
							source : "SalesOrderListNoMoreData.txt"
						},
						"SalesOrderList(SalesOrderID='0500000000')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
							source : "SalesOrderList_0.txt"
						},
						"SalesOrderList(SalesOrderID='0500000001')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
							source : "SalesOrderList_1.txt"
						},
						"SalesOrderList(SalesOrderID='0500000002')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
							source : "SalesOrderList_2.txt"
						},
						"SalesOrderList(SalesOrderID='0500000003')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
							source : "SalesOrderList_3.txt"
						},
						"SalesOrderList(SalesOrderID='0500000004')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
							source : "SalesOrderList_4.txt"
						}
					}
				}, "sap/ui/core/demokit/sample/odata/v4/SalesOrders/data",
				"/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/");
			}

			return sap.ui.view({
				id : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
				models : { undefined : oModel,
					ui : new JSONModel({
						bRealOData : bRealOData,
						icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
						iconTooltip : bRealOData ? "real OData service" : "mock OData service"}
				)},
				type : sap.ui.core.mvc.ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main"
			});
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});
