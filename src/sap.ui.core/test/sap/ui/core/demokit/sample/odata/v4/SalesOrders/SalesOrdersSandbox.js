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
		// TODO: Add Mockdata for single sales orders *with expand*
		// http://localhost:8080/testsuite/proxy/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/SalesOrderList('050001110')?custom-option=value&$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))
		TestUtils.setupODataV4Server(oSandbox, {
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
			"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
				source : "SalesOrderList_skip0.json"
			},
			"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=5&$top=5" : {
				source : "SalesOrderList_skip5.json"
			},
			"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=5&$top=4" : {
				source : "SalesOrderList_skip5_top4.json"
			},
			"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=10" : {
				source : "SalesOrderList_skip0_top10.json"
			},
			"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N')%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=4&$top=1" : {
				source : "SalesOrderListReplacementForDelete.json"
			},
			"SalesOrderList('0500000000')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber),SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
				source : "SalesOrderList_0.json"
			},
			"SalesOrderList('0500000000')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
				source : "SalesOrderList_0_refresh.json"
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
			"SalesOrderList('')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
				source : "SalesOrderList_new_refresh.json"
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

	function adaptModelConstructor() {
		var Constructor = sap.ui.model.odata.v4.ODataModel;

		oSandbox.stub(sap.ui.model.odata.v4, "ODataModel", function (mParameters) {
			var iQueryPos = mParameters.serviceUrl.indexOf("?"),
				sQuery = iQueryPos >= 0 ? mParameters.serviceUrl.slice(iQueryPos) : "",
				sUpdateGroupId = jQuery.sap.getUriParameters().get("updateGroupId")
					|| TestUtils.retrieveData(
						"sap.ui.core.sample.odata.v4.SalesOrders.updateGroupId")
					|| undefined;

			// clone: do not modify constructor call parameter
			mParameters = jQuery.extend({}, mParameters, {
				earlyRequests : jQuery.sap.getUriParameters().get("earlyRequests") !== "false",
				groupId : jQuery.sap.getUriParameters().get("$direct") ? "$direct" : undefined,
				serviceUrl : TestUtils.proxy(mParameters.serviceUrl) + sQuery,
				updateGroupId : sUpdateGroupId
			});
			return new Constructor(mParameters);
		});
	}

	if (TestUtils.isRealOData()) {
		adaptModelConstructor();
	} else {
		setupMockServer();
	}

	TestUtils.setData("sap.ui.core.sample.odata.v4.SalesOrders.sandbox", oSandbox);
}, /* bExport= */false);