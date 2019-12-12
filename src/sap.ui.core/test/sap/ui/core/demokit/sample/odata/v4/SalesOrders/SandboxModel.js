/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// For the "realOData" case, the URL is adapted to a proxy URL and certain constructor parameters
// are taken from URL parameters.
// For the "non-realOData" case, a mock server for the backend requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/test/TestUtils"
], function (SandboxModelHelper, ODataModel, SubmitMode, TestUtils) {
	"use strict";

	var oMockData = {
			mFixture : {
				"$metadata?custom-option=value" : {source : "metadata.xml"},
				"BusinessPartnerList?custom-option=value&$orderby=CompanyName&$filter=BusinessPartnerRole%20eq%20'01'&$select=BusinessPartnerID,CompanyName&$skip=0&$top=100" : {
					source : "BusinessPartnerList.json"
				},
				"BusinessPartnerList('0100000000')?custom-option=value" : {
					source : "BusinessPartnerList_0.json"
				},
				"Messages(0)" : {
					source : "UnboundMessage_0.txt"
				},
				"Messages(2)" : {
					source : "MessageLongtextAbsolute_2.txt"
				},
				"ProductList('HT-1000')/Name?custom-option=value" : {
					headers : {
						"sap-messages" : JSON.stringify([{
							"code" : "42",
							"message" : "Example for an unbound message",
							"numericSeverity" : 2,
							"longtextUrl" : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/Messages(0)"
						}])
					},
					source : "ProductList.json"
				},
				"ProductList('HT-1000')/ProductID?custom-option=value" : {
					source : "ProductListId.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
					source : "SalesOrderList_skip0.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=5&$top=5" : {
					source : "SalesOrderList_skip5.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=5&$top=3" : {
					source : "SalesOrderList_skip5_top3.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=5&$top=4" : {
					source : "SalesOrderList_skip5_top4.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=8&$top=2" : {
					source : "SalesOrderList_skip8_top2.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=10" : {
					source : "SalesOrderList_skip0_top10.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=4&$top=1" : {
					source : "SalesOrderListReplacementForDelete.json"
				},
				"SalesOrderList('0500000000')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_0.json"
				},
				"SalesOrderList('0500000000')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_0.json"
				},
				"SalesOrderList('0500000000')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList_0_refresh.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_0.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ProductID%20eq%20'HT-1001'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_0_Filter.opa.json"
				},
				"SalesOrderList('0500000001')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_1.json"
				},
				"SalesOrderList('0500000001')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_1.json"
				},
				"SalesOrderList('0500000001')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_1.json"
				},
				"SalesOrderList('0500000001')/Messages(1)" : {
					source : "MessageLongtext_1.txt"
				},
				"SalesOrderList('0500000002')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_2.json"
				},
				"SalesOrderList('0500000002')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_2.json"
				},
				"SalesOrderList('0500000002')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_2.json"
				},
				"SalesOrderList('0500000003')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_3.json"
				},
				"SalesOrderList('0500000003')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_3.json"
				},
				"SalesOrderList('0500000003')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_3.json"
				},
				"SalesOrderList('0500000004')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_4.json"
				},
				"SalesOrderList('0500000004')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_4.json"
				},
				"SalesOrderList('0500000004')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_4.json"
				},
				"SalesOrderList('0500000004')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList_4_refresh.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'0500000004'&$select=ChangedAt,GrossAmount,Note,SalesOrderID" : {
					source : "SalesOrderList_4_sideEffects1.json"
				},
				"SalesOrderList('0500000004')?custom-option=value&$select=ChangedAt,Note" : {
					source : "SalesOrderList_4_sideEffects2.json"
				},
				"SalesOrderList('0500000004')?custom-option=value&$select=ChangedAt,Note&$expand=SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
					source : "SalesOrderList_4_sideEffects3.json"
				},
				"SalesOrderList('0500000004')/SO_2_SOITEM(SalesOrderID='0500000004',ItemPosition='0000000070')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderIist('05000000004')-SO_2_SOITEM('70').json"
				},
				"SalesOrderList('0500000005')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_5.json"
				},
				"SalesOrderList('0500000005')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_5.json"
				},
				"SalesOrderList('0500000005')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_5.json"
				},
				"SalesOrderList('0500000005')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'%20and%20(ProductID%20eq%20'HT-1061')&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_5_Filter_via_changeParameter.opa.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'0500000005'&$select=ChangedAt,GrossAmount,Note,SalesOrderID" : {
					source : "SalesOrderList_5_sideEffects1.json"
				},
				"SalesOrderList('0500000005')?custom-option=value&$select=ChangedAt,Note" : {
					source : "SalesOrderList_5_sideEffects2.json"
				},
				"SalesOrderList('0500000005')?custom-option=value&$select=ChangedAt,Note&$expand=SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
					source : "SalesOrderList_5_sideEffects3.json"
				},
				"SalesOrderList('0500000006')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_6.json"
				},
				"SalesOrderList('0500000006')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_6.json"
				},
				"SalesOrderList('0500000006')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_6.json"
				},
				"SalesOrderList('0500000007')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_7.json"
				},
				"SalesOrderList('0500000007')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_7.json"
				},
				"SalesOrderList('0500000007')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_7.json"
				},
				"SalesOrderList('0500000008')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_8.json"
				},
				"SalesOrderList('0500000008')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_8.json"
				},
				"SalesOrderList('0500000008')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_8.json"
				},
				"SalesOrderList('0500000009')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_9.json"
				},
				"SalesOrderList('0500000009')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_9.json"
				},
				"SalesOrderList('0500000009')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_9.json"
				},
				"SalesOrderList('NEW1')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList('NEW1').json"
				},
				"SalesOrderList('NEW1')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_empty.json"
				},
				"SalesOrderList('NEW1')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('NEW1')_refresh.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'NEW1'&$select=ChangedAt,GrossAmount,Note,SalesOrderID" : {
					source : "SalesOrderList('NEW1')_sideEffects1.json"
				},
				"SalesOrderList('NEW1')?custom-option=value&$select=ChangedAt,Note" : {
					source : "SalesOrderList('NEW1')_sideEffects2.json"
				},
				"SalesOrderList('NEW1')?custom-option=value&$select=ChangedAt,Note&$expand=SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
					source : "SalesOrderList('NEW1')_sideEffects3.json"
				},
				"SalesOrderList('NEW1')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_empty.json"
				},
				"SalesOrderList('NEW1')/SO_2_SOITEM(SalesOrderID='NEW1',ItemPosition='10')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderList('NEW1')-SO_2_SOITEM('10').json"
				},
				"POST SalesOrderList('NEW1')/SO_2_SOITEM?custom-option=value" : {
					source : "POST-SalesOrderList('NEW1')-SO_2_SOITEM.json"
				},
				"SalesOrderList('NEW2')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList('NEW2').json"
				},
				"SalesOrderList('NEW2')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_empty.json"
				},
				"SalesOrderList('NEW2')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('NEW2')_refresh.json"
				},
				"SalesOrderList('NEW2')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_empty.json"
				},
				"SalesOrderList('NEW3')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList('NEW3').json"
				},
				"SalesOrderList('NEW3')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_empty.json"
				},
				"SalesOrderList('NEW3')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('NEW3')_refresh.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'NEW3'&$select=ChangedAt,GrossAmount,Note,SalesOrderID" : {
					source : "SalesOrderList('NEW3')_sideEffects1.json"
				},
				"SalesOrderList('NEW3')?custom-option=value&$select=ChangedAt,Note" : {
					source : "SalesOrderList('NEW3')_sideEffects2.json"
				},
				"SalesOrderList('NEW3')?custom-option=value&$select=ChangedAt,Note&$expand=SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
					source : "SalesOrderList('NEW3')_sideEffects3.json"
				},
				"SalesOrderList('NEW3')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_empty.json"
				},
				"SalesOrderList('NEW3')/SO_2_SOITEM(SalesOrderID='NEW3',ItemPosition='10')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderList('NEW3')-SO_2_SOITEM('10').json"
				},
				"SalesOrderList('NEW3')/SO_2_SOITEM(SalesOrderID='NEW3',ItemPosition='20')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderList('NEW3')-SO_2_SOITEM('20').json"
				},
				"POST SalesOrderList('NEW3')/SO_2_SOITEM?custom-option=value" : [{
					ifMatch : /,"Note":"new 10"/g,
					source : "POST-SalesOrderList('NEW3')-SO_2_SOITEM_10.json"
				}, {
					ifMatch : /,"Note":"new 20"/g,
					source : "POST-SalesOrderList('NEW3')-SO_2_SOITEM_20.json"
				}],
				"SalesOrderList('NEW4')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList('NEW4').json"
				},
				"SalesOrderList('NEW4')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_empty.json"
				},
				"SalesOrderList('NEW4')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('NEW4')_refresh.json"
				},
				"SalesOrderList('NEW4')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_empty.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-SALESORDER.CURRENCY_CODE%27/$metadata" : {
					source : "VH_CurrencyCode.xml"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-SALESORDER.CURRENCY_CODE%27/H_TCURC_SH_SET?$select=LTEXT,WAERS&$skip=0&$top=20" : {
					source : "VH_CurrencyCode.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_epm_pd_cats-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.CATEGORY%27/$metadata" : {
					source : "VH_ProductCategory.xml"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_epm_pd_cats-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.CATEGORY%27/H_EPM_PD_CATS_SH_Set?$select=CATEGORY&$skip=0&$top=20" : {
					source : "VH_ProductCategory.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_pr_type-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.TYPE_CODE%27/$metadata" : {
					source : "VH_ProductTypeCode.xml"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_pr_type-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.TYPE_CODE%27/D_PR_TYPE_FV_SET?$select=FIELD_VALUE&$skip=0&$top=100" : {
					source : "VH_ProductTypeCode.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM(SalesOrderID='0500000000',ItemPosition='0000000010')/SOITEM_2_PRODUCT/PRODUCT_2_BP?custom-option=value&$select=CompanyName,LegalForm,PhoneNumber" : {
					source : "BusinessPartner_SalesOrder_0_Item_0.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM(SalesOrderID='0500000000',ItemPosition='0000000020')/SOITEM_2_PRODUCT/PRODUCT_2_BP?custom-option=value&$select=CompanyName,LegalForm,PhoneNumber" : {
					source : "BusinessPartner_SalesOrder_0_Item_1.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=GrossAmount%20gt%201000%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
					source : "SalesOrderList_filtered_by_GrossAmount.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=GrossAmount%20gt%201000%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=GrossAmount&$skip=0&$top=5" : {
					source : "SalesOrderList_sorted_by_GrossAmount.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=GrossAmount%20gt%201000%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=GrossAmount%20desc&$skip=0&$top=5" : {
					source : "SalesOrderList_sorted_by_GrossAmount_desc.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=GrossAmount%20gt%201000%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=SalesOrderID&$skip=0&$top=5" : {
					source : "SalesOrderList_sorted_by_SalesOrderID.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=GrossAmount%20gt%201000%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=SalesOrderID%20desc&$skip=0&$top=5" : {
					source : "SalesOrderList_sorted_by_SalesOrderID_desc.json"
				},
				"SalesOrderList('0500000001')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,BusinessPartnerRole,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_1RTA.json"
				},
				"SalesOrderList('0500000001')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$select=DeliveryDate,GrossAmount,ItemPosition,Messages,Note,NoteLanguage,Quantity,QuantityUnit,SalesOrderID&$filter=ItemPosition%20gt%20'0000000000'&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_1.json"
				},
				"SalesOrderList('0500000002')/com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrderSimulateDiscount(Discount=75)?custom-option=value" : {
					code : 400,
					source : "SalesOrderSimulateDiscount(Discount=75).json"
				},
				"SalesOrderList('0500000002')/com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrderSimulateDiscount(Discount=25)?custom-option=value" : {
					source : "SalesOrderSimulateDiscount(Discount=25).json"
				},
				"POST SalesOrderList?custom-option=value" : [{
					code : 400,
					ifMatch : /,"Note":"RAISE_ERROR"/g,
					source : "POST-SalesOrderList.Error.json"
				}, {
					ifMatch : /,"Note":"new 2"/g,
					source : "POST-SalesOrderList_NEW2.json"
				}, {
					ifMatch : /,"Note":"new 3"/g,
					source : "POST-SalesOrderList_NEW3.json"
				}, {
					ifMatch : /,"Note":"new 4"/g,
					source : "POST-SalesOrderList_NEW4.json"
				}, {
					source : "POST-SalesOrderList_NEW1.json"
				}],
				"POST SalesOrderList('0500000004')/SO_2_SOITEM?custom-option=value" : [{
					code : 400,
					ifMatch : /,"Quantity":"0",/g,
					source : "POST-SalesOrderList('0500000004')-SO_2_SOITEM.Error.json"
				}, {
					source : "POST-SalesOrderList('0500000004')-SO_2_SOITEM.json"
				}],
				"PATCH SalesOrderList('0500000004')?custom-option=value" : [{
					code : 400,
					ifMatch : /{"Note":"RAISE_ERROR"}/g,
					source : "PATCH-SalesOrderList('0500000004').Error.json"
				}],
				"PATCH SalesOrderList('0500000001')?custom-option=value" : [{
					code : 204,
					headers : {"ETag" : "New ETag"},
					ifMatch : /{"Note":"204"}/g
				}, {
					headers : {"ETag" : "New ETag"},
					ifMatch : /{"Note":"ETag"}/g,
					message : {"Note" : "Sending ETag header..."}
				}, {
					ifMatch : function (oRequest) {
						return oRequest.requestHeaders["If-Match"] === "New ETag";
					},
					message : {"Note" : "You have used the new ETag!"}
				}]
			},
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			sSourceBase : "sap/ui/core/sample/odata/v4/SalesOrders/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.SalesOrders.SandboxModel", {
		constructor : function (mParameters) {
			var mModelParameters = SandboxModelHelper.adaptModelParameters(mParameters,
					TestUtils.retrieveData("sap.ui.core.sample.odata.v4.SalesOrders" +
						".updateGroupId")), // updateGroupId controlled by OPA
				sUpdateGroupId = mParameters.updateGroupId !== mModelParameters.updateGroupId
					? mModelParameters.updateGroupId
					: undefined;

			if (sUpdateGroupId) {
				// "SalesOrderUpdateGroup" should have same submit mode as default update group
				if (sUpdateGroupId in mModelParameters.groupProperties) {
					mModelParameters.groupProperties.SalesOrderUpdateGroup
						= mModelParameters.groupProperties[sUpdateGroupId];
				} else if (sUpdateGroupId.startsWith("$auto")) {
					mModelParameters.groupProperties.SalesOrderUpdateGroup.submit
						= SubmitMode.Auto;
				} else if (sUpdateGroupId === "$direct") {
					mModelParameters.groupProperties.SalesOrderUpdateGroup.submit
						= SubmitMode.Direct;
				}
			}

			return SandboxModelHelper.createModel(mModelParameters, oMockData);
		}
	});
});