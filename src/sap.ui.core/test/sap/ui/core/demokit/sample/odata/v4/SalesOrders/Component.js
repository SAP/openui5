/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   V4_GW_SAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/m/VBox",
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/URI"
], function (VBox, View, ViewType, BaseComponent, JSONModel, OperationMode, ODataModel, TestUtils,
		sinon, URI) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var sGroupId = jQuery.sap.getUriParameters().get("$direct")
					? "$direct" // switch off batch
					: undefined,
				bHasOwnProxy = this.proxy !== BaseComponent.prototype.proxy,
				oMetaModel,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				sQuery,
				bRealOData = TestUtils.isRealOData(),
				sServiceUrl = fnProxy(oModel.sServiceUrl),
				sUpdateGroupId = jQuery.sap.getUriParameters().get("updateGroupId"),
				oViewContainer = new VBox();

			if (oModel.sServiceUrl !== sServiceUrl || sGroupId || sUpdateGroupId) {
				//replace model from manifest in case of proxy
				sQuery = URI.buildQuery(oModel.mUriParameters);
				sQuery = sQuery ? "?" + sQuery : "";
				sUpdateGroupId = sUpdateGroupId || oModel.getUpdateGroupId();
				oModel.destroy();
				oModel = new ODataModel({
					groupId : sGroupId,
					operationMode : OperationMode.Server,
					serviceUrl : sServiceUrl + sQuery,
					synchronizationMode : "None",
					updateGroupId : sUpdateGroupId
				});
				this.setModel(oModel);
			}

			// the same model can be accessed via two names to allow for different binding contexts
			this.setModel(oModel, "headerContext");

			oMetaModel = oModel.getMetaModel();

			// TODO: Add Mockdata for single sales orders *with expand*
			// http://localhost:8080/testsuite/proxy/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/SalesOrderList('050001110')?custom-option=value&$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))
			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
					"$metadata?custom-option=value" : {source : "metadata.xml"},
					"BusinessPartnerList?custom-option=value&$skip=0&$top=100" : {source : "BusinessPartnerList.json"},
					"BusinessPartnerList('0100000000')?custom-option=value" : {
						source : "BusinessPartnerList_0.json"
					},
					"ProductList('HT-1000')/Name?custom-option=value" : {
						source : "ProductList.json"
					},
					"ProductList('HT-1000')/ProductID?custom-option=value" : {
						source : "ProductListId.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$expand=SO_2_BP&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(BuyerName%20ge%20'M')&$select=BuyerName,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$skip=0&$top=5" : {
						source : "SalesOrderList_skip0.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$expand=SO_2_BP&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(BuyerName%20ge%20'M')&$select=BuyerName,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$skip=5&$top=5" : {
						source : "SalesOrderList_skip5.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$expand=SO_2_BP&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(BuyerName%20ge%20'M')&$select=BuyerName,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$skip=5&$top=4" : {
						source : "SalesOrderList_skip5_top4.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$expand=SO_2_BP&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(BuyerName%20ge%20'M')&$select=BuyerName,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$skip=0&$top=10" : {
						source : "SalesOrderList_skip0_top10.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$expand=SO_2_BP&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(BuyerName%20ge%20'M')&$select=BuyerName,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$skip=4&$top=1" : {
						source : "SalesOrderListReplacementForDelete.json"
					},
					"SalesOrderList('0500000000')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_0.json"
					},
					"SalesOrderList('0500000000')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_0.json"
					},
					"SalesOrderList('0500000000')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=Product/ProductID%20eq%20'HT-1001'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_0_changedFilter.opa.json"
					},
					"SalesOrderList('0500000001')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_1.json"
					},
					"SalesOrderList('0500000001')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_1.json"
					},
					"SalesOrderList('0500000002')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_2.json"
					},
					"SalesOrderList('0500000002')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_2.json"
					},
					"SalesOrderList('0500000003')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_3.json"
					},
					"SalesOrderList('0500000003')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_3.json"
					},
					"SalesOrderList('0500000004')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_4.json"
					},
					"SalesOrderList('0500000004')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_4.json"
					},
					"SalesOrderList('0500000005')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_5.json"
					},
					"SalesOrderList('0500000005')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_5.json"
					},
					"SalesOrderList('0500000006')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_6.json"
					},
					"SalesOrderList('0500000006')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_6.json"
					},
					"SalesOrderList('0500000007')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_7.json"
					},
					"SalesOrderList('0500000007')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_7.json"
					},
					"SalesOrderList('0500000008')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_8.json"
					},
					"SalesOrderList('0500000008')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_8.json"
					},
					"SalesOrderList('0500000009')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_9.json"
					},
					"SalesOrderList('0500000009')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_9.json"
					},
					"SalesOrderList('')?custom-option=value&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber,Address),SO_2_SCHDL($select=ScheduleKey,DeliveryDate)&$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Note,SalesOrderID" : {
						source : "SalesOrderList_new.json"
					},
					"SalesOrderList('')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber))&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_new.json"
					},
					"/sap/opu/odata4/IWBEP/V4_SAMPLE/f4/sap/h_tcurc-sh/0001;ps=%27default-%2Aiwbep%2Av4_gw_sample_basic-0001%27;va=%27com.sap.gateway.default.iwbep.v4_gw_sample_basic.v0001-ET-SALESORDER~CURRENCY_CODE%27/$metadata" : {
						source : "VH_CurrencyCode.xml"
					},
					"/sap/opu/odata4/IWBEP/V4_SAMPLE/f4/sap/h_tcurc-sh/0001;ps=%27default-%2Aiwbep%2Av4_gw_sample_basic-0001%27;va=%27com.sap.gateway.default.iwbep.v4_gw_sample_basic.v0001-ET-SALESORDER~CURRENCY_CODE%27/H_TCURC_SH_SET?$skip=0&$top=20" : {
						source : "VH_CurrencyCode.json"
					},
					"/sap/opu/odata4/IWBEP/V4_SAMPLE/f4/sap/h_epm_pd_cats-sh/0001;ps=%27default-%2Aiwbep%2Av4_gw_sample_basic-0001%27;va=%27com.sap.gateway.default.iwbep.v4_gw_sample_basic.v0001-ET-PRODUCT~CATEGORY%27/$metadata" : {
						source : "VH_ProductCategory.xml"
					},
					"/sap/opu/odata4/IWBEP/V4_SAMPLE/f4/sap/h_epm_pd_cats-sh/0001;ps=%27default-%2Aiwbep%2Av4_gw_sample_basic-0001%27;va=%27com.sap.gateway.default.iwbep.v4_gw_sample_basic.v0001-ET-PRODUCT~CATEGORY%27/H_EPM_PD_CATS_SH_SET?$skip=0&$top=20" : {
						source : "VH_ProductCategory.json"
					},
					"/sap/opu/odata4/IWBEP/V4_SAMPLE/f4/sap/d_pr_type-fv/0001;ps=%27default-%2Aiwbep%2Av4_gw_sample_basic-0001%27;va=%27com.sap.gateway.default.iwbep.v4_gw_sample_basic.v0001-ET-PRODUCT~TYPE_CODE%27/$metadata" : {
						source : "VH_ProductTypeCode.xml"
					},
					"/sap/opu/odata4/IWBEP/V4_SAMPLE/f4/sap/d_pr_type-fv/0001;ps=%27default-%2Aiwbep%2Av4_gw_sample_basic-0001%27;va=%27com.sap.gateway.default.iwbep.v4_gw_sample_basic.v0001-ET-PRODUCT~TYPE_CODE%27/D_PR_TYPE_FV_SET?$skip=0&$top=100" : {
						source : "VH_ProductTypeCode.json"
					}
}, "sap/ui/core/sample/odata/v4/SalesOrders/data",
				"/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/");
			}

			// Simulate a templating-based app: The metadata is already
			// available when the view is created.
			Promise.all([
				oMetaModel.requestObject("/SalesOrderList/"),
				oMetaModel.requestObject("/SOLineItemList/")
			]).then(function () {
				oViewContainer.addItem(sap.ui.view({
					id : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
					models : { undefined : oModel,
						ui : new JSONModel({
								bLineItemSelected : false,
								bRealOData : bRealOData,
								bSalesOrderSelected : false,
								bScheduleSelected : false,
								bSelectedSalesOrderTransient : false,
								bSortGrossAmountDescending : undefined,
								sSortGrossAmountIcon : ""
							}
					)},
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main"
				}));
			});

			return oViewContainer;
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});
