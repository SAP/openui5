/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   zui5_epm_sample OData service.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/HBox",
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/URI"
], function (jQuery, HBox, View, ViewType, BaseComponent, JSONModel, OperationMode, ODataModel,
		TestUtils, URI) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var sGroupId = jQuery.sap.getUriParameters().get("$direct")
					? "$direct" // switch off batch
					: undefined,
				oGroupProperties,
				bHasOwnProxy = this.proxy !== BaseComponent.prototype.proxy,
				oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				sQuery,
				bRealOData = TestUtils.isRealOData(),
				sServiceUrl = fnProxy(oModel.sServiceUrl),
				sUpdateGroupId = jQuery.sap.getUriParameters().get("updateGroupId")
					|| this.getComponentData() && this.getComponentData().updateGroupId;

			if (oModel.sServiceUrl !== sServiceUrl || sGroupId || sUpdateGroupId) {
				//replace model from manifest in case of proxy
				sQuery = URI.buildQuery(oModel.mUriParameters);
				sQuery = sQuery ? "?" + sQuery : "";
				sUpdateGroupId = sUpdateGroupId || oModel.getUpdateGroupId();
				oGroupProperties = this.getManifestEntry(
					"/sap.ui5/models//settings/groupProperties");
				oModel.destroy();
				oModel = new ODataModel({
					autoExpandSelect : true,
					groupId : sGroupId,
					groupProperties : oGroupProperties,
					operationMode : OperationMode.Server,
					serviceUrl : sServiceUrl + sQuery,
					synchronizationMode : "None",
					updateGroupId : sUpdateGroupId
				});
				this.setModel(oModel);
			}

			// the same model can be accessed via two names to allow for different binding contexts
			this.setModel(oModel, "headerContext");

			// TODO: Add Mockdata for single sales orders *with expand*
			// http://localhost:8080/testsuite/proxy/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/SalesOrderList('050001110')?custom-option=value&$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))
			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
					"$metadata?custom-option=value" : {source : "metadata.xml"},
					"BusinessPartnerList?custom-option=value&$select=BusinessPartnerID,CompanyName&$skip=0&$top=100" : {
						source : "BusinessPartnerList.json"
					},
					"BusinessPartnerList('0100000000')?custom-option=value" : {
						source : "BusinessPartnerList_0.json"
					},
					"ProductList('HT-1000')/Name?custom-option=value" : {
						source : "ProductList.json"
					},
					"ProductList('HT-1000')/ProductID?custom-option=value" : {
						source : "ProductListId.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
						source : "SalesOrderList_skip0.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=5&$top=5" : {
						source : "SalesOrderList_skip5.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=5&$top=4" : {
						source : "SalesOrderList_skip5_top4.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=10" : {
						source : "SalesOrderList_skip0_top10.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=4&$top=1" : {
						source : "SalesOrderListReplacementForDelete.json"
					},
					"SalesOrderList('0500000000')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_0.json"
					},
					"SalesOrderList('0500000000')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_0.json"
					},
					"SalesOrderList('0500000000')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ProductID%20eq%20'HT-1001'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_0_Filter.opa.json"
					},
					"SalesOrderList('0500000001')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_1.json"
					},
					"SalesOrderList('0500000001')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_1.json"
					},
					"SalesOrderList('0500000002')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_2.json"
					},
					"SalesOrderList('0500000002')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_2.json"
					},
					"SalesOrderList('0500000003')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_3.json"
					},
					"SalesOrderList('0500000003')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_3.json"
					},
					"SalesOrderList('0500000004')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_4.json"
					},
					"SalesOrderList('0500000004')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_4.json"
					},
					"SalesOrderList('0500000005')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_5.json"
					},
					"SalesOrderList('0500000005')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_5.json"
					},
					"SalesOrderList('0500000005')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=(ItemPosition%20gt%20'0000000000')%20and%20(ProductID%20eq%20'HT-1061')&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_5_Filter_via_changeParameter.opa.json"
					},
					"SalesOrderList('0500000006')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_6.json"
					},
					"SalesOrderList('0500000006')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_6.json"
					},
					"SalesOrderList('0500000007')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_7.json"
					},
					"SalesOrderList('0500000007')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_7.json"
					},
					"SalesOrderList('0500000008')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_8.json"
					},
					"SalesOrderList('0500000008')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_8.json"
					},
					"SalesOrderList('0500000009')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_9.json"
					},
					"SalesOrderList('0500000009')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_9.json"
					},
					"SalesOrderList('')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
						source : "SalesOrderList_new.json"
					},
					"SalesOrderList('')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
						source : "SalesOrderItemsList_new.json"
					},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-SALESORDER.CURRENCY_CODE%27/$metadata" : {
						source : "VH_CurrencyCode.xml"
					},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-SALESORDER.CURRENCY_CODE%27/H_TCURC_SH_SET?$skip=0&$top=20" : {
						source : "VH_CurrencyCode.json"
					},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_epm_pd_cats-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.CATEGORY%27/$metadata" : {
						source : "VH_ProductCategory.xml"
					},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_epm_pd_cats-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.CATEGORY%27/H_EPM_PD_CATS_SH_SET?$skip=0&$top=20" : {
						source : "VH_ProductCategory.json"
					},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_pr_type-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.TYPE_CODE%27/$metadata" : {
						source : "VH_ProductTypeCode.xml"
					},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_pr_type-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.TYPE_CODE%27/D_PR_TYPE_FV_SET?$skip=0&$top=100" : {
						source : "VH_ProductTypeCode.json"
					},
					"SalesOrderList('0500000000')/SO_2_SOITEM(SalesOrderID='0500000000',ItemPosition='0000000010')/SOITEM_2_PRODUCT/PRODUCT_2_BP?custom-option=value&$select=CompanyName,LegalForm,PhoneNumber" : {
						source : "BusinessPartner_SalesOrder_0_Item_0.json"
					},
					"SalesOrderList('0500000000')/SO_2_SOITEM(SalesOrderID='0500000000',ItemPosition='0000000020')/SOITEM_2_PRODUCT/PRODUCT_2_BP?custom-option=value&$select=CompanyName,LegalForm,PhoneNumber" : {
						source : "BusinessPartner_SalesOrder_0_Item_1.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(GrossAmount%20gt%201000)%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
						source : "SalesOrderList_filtered_by_GrossAmount.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(GrossAmount%20gt%201000)%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=GrossAmount&$skip=0&$top=5" : {
						source : "SalesOrderList_sorted_by_GrossAmount.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(GrossAmount%20gt%201000)%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=GrossAmount%20desc&$skip=0&$top=5" : {
						source : "SalesOrderList_sorted_by_GrossAmount_desc.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(GrossAmount%20gt%201000)%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=SalesOrderID&$skip=0&$top=5" : {
						source : "SalesOrderList_sorted_by_SalesOrderID.json"
					},
					"SalesOrderList?custom-option=value&$count=true&$filter=(GrossAmount%20gt%201000)%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=SalesOrderID%20desc&$skip=0&$top=5" : {
						source : "SalesOrderList_sorted_by_SalesOrderID_desc.json"
					}
				}, "sap/ui/core/sample/odata/v4/SalesOrders/data",
				"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/");
			}

			// simulate a Fiori Elements app, where the view is only created after
			// $metadata has been loaded
			oModel.getMetaModel().requestObject("/SalesOrderList/").then(function () {
				var oLastModified = oModel.getMetaModel().getLastModified();

				jQuery.sap.log.debug("Last-Modified: " + oLastModified,
					oLastModified && oLastModified.toISOString(),
					"sap.ui.core.sample.odata.v4.SalesOrders.Component");

				oLayout.addItem(sap.ui.view({
					async : true,
					id : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
					models : { undefined : oModel,
						ui : new JSONModel({
								bCreateItemPending : false,
								bLineItemSelected : false,
								bRealOData : bRealOData,
								bSalesOrderSelected : false,
								bScheduleSelected : false,
								bSelectedSalesOrderTransient : false,
								bSortGrossAmountDescending : undefined,
								bSortSalesOrderIDDescending : undefined,
								sSortGrossAmountIcon : "",
								sSortSalesOrderIDIcon : ""
							}
					)},
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main"
				}));
			});
			return oLayout;
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});
