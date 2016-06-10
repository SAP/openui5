/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   V4_GW_SAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/URI"
], function (View, ViewType, BaseComponent, JSONModel, ODataModel, TestUtils, sinon, URI) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== BaseComponent.prototype.proxy,
				oModel = this.getModel(),
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
				oModel.destroy();
				oModel = new ODataModel({
					groupId : jQuery.sap.getUriParameters().get("$direct")
						? "$direct" // switch off batch
						: undefined,
					serviceUrl : sServiceUrl + sQuery,
					synchronizationMode : "None",
					updateGroupId : jQuery.sap.getUriParameters().get("updateGroupId") || undefined
				});
				this.setModel(oModel);
			}

			// TODO: Add Mockdata for single sales orders *with expand*
			// http://localhost:8080/testsuite/proxy/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/SalesOrderList('050001110')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))
			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
					"$metadata" : {source : "metadata.xml"},
					"BusinessPartnerList?$skip=0&$top=100" : {source : "BusinessPartnerList.json"},
					"BusinessPartnerList('0100000000')" : {
						source : "BusinessPartnerList_0.json"
					},
					"ProductList('HT-1000')/Name" : {
						source : "ProductList.json"
					},
					"SalesOrderList?$expand=SO_2_BP&$filter=BuyerName%20ge%20'M'&$select=BuyerName,CurrencyCode,GrossAmount,Note,SalesOrderID&$skip=0&$top=5" : {
						source : "SalesOrderList.json"
					},
					"SalesOrderList?$expand=SO_2_BP&$filter=BuyerName%20ge%20'M'&$select=BuyerName,CurrencyCode,GrossAmount,Note,SalesOrderID&$skip=0&$top=10" : {
						source : "SalesOrderList.json"
					},
					"SalesOrderList?$expand=SO_2_BP&$filter=BuyerName%20ge%20'M'&$select=BuyerName,CurrencyCode,GrossAmount,Note,SalesOrderID&$skip=5&$top=5" : {
						source : "SalesOrderListNoMoreData.json"
					},
					"SalesOrderList('0500000000')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))),SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_0.json"
					},
					"SalesOrderList('0500000002')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))),SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_1.json"
					},
					"SalesOrderList('0500000006')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))),SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_2.json"
					},
					"SalesOrderList('0500000007')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))),SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_3.json"
					},
					"SalesOrderList('0500000008')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))),SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_4.json"
					},
					"SOLineItemList(SalesOrderID='0500000000',ItemPosition='0000000010')/SOITEM_2_PRODUCT/PRODUCT_2_BP/BP_2_CONTACT?$select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber&$skip=0&$top=100" : {
						source : "ContactList_0.json"
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
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main"
			});
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});
