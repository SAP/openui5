/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/test/TestUtils"
], function (SandboxModelHelper, ODataModel, SubmitMode, TestUtils) {
	"use strict";

	var oMockData = {
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			mFixture : {
				"BusinessPartnerList?custom-option=value&$orderby=CompanyName&$filter=BusinessPartnerRole%20eq%20'01'&$select=BusinessPartnerID,CompanyName&$skip=0&$top=100" : {
					source : "BusinessPartnerList.json"
				},
				"BusinessPartnerList('0100000000')?custom-option=value" : {
					source : "BusinessPartnerList_0.json"
				},
				"Messages(0)" : {
					message :
						"Details for \"Example for an unbound message\" (absolute longtext URL)."
				},
				"Messages(2)" : {
					message : 'Details for "Minimum order quantity is 2" (absolute longtext URL).'
				},
				"ProductList('HT-1000')/Name?custom-option=value" : {
					headers : {
						"sap-messages" : JSON.stringify([{
							code : "42",
							message : "Example for an unbound message",
							numericSeverity : 2,
							longtextUrl : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/Messages(0)"
						}])
					},
					message : {
						value : "Notebook Basic 15"
					}
				},
				"ProductList('HT-1000')/ProductID?custom-option=value" : {
					message : {
						value : "HT-1000"
					}
				},
				"SalesOrderList/$count?custom-option=value" : {
					message : "23"
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
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=9" : {
					source : "SalesOrderList_skip0_top10.json" // Note: $top=9, but never mind
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=10" : {
					source : "SalesOrderList_skip0_top10.json"
				},
				"SalesOrderList?custom-option=value&$count=true&$filter=(SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M'))%20and%20not%20(SalesOrderID%20eq%20'0500000002')&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=4&$top=1" : {
					source : "SalesOrderListReplacementForDelete.json"
				},
				"SalesOrderList('0500000000')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_0.json"
				},
				"SalesOrderList('0500000000')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_0.json"
				},
				"SalesOrderList('0500000000')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList_0_refresh.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_0.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ProductID%20eq%20'HT-1001'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_0_Filter.opa.json"
				},
				"SalesOrderList('0500000001')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_1.json"
				},
				"SalesOrderList('0500000001')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_1.json"
				},
				"SalesOrderList('0500000001')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_1.json"
				},
				"SalesOrderList('0500000001')/Messages(1)" : {
					message : 'Details for "Enter customer reference if available" (relative'
						+ " longtext URL)."
				},
				"SalesOrderList('0500000002')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_2.json"
				},
				"SalesOrderList('0500000002')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_2.json"
				},
				"SalesOrderList('0500000002')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_2.json"
				},
				"SalesOrderList('0500000003')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_3.json"
				},
				"SalesOrderList('0500000003')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_3.json"
				},
				"SalesOrderList('0500000003')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_3.json"
				},
				"SalesOrderList('0500000004')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_4.json"
				},
				"SalesOrderList('0500000004')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_4.json"
				},
				"SalesOrderList('0500000004')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_4.json"
				},
				"SalesOrderList('0500000004')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList_4_refresh.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'0500000004'&$select=ChangedAt,GrossAmount,Messages,Note,SalesOrderID" : {
					source : "SalesOrderList_4_sideEffects1.json"
				},
				"SalesOrderList('0500000004')?custom-option=value&$select=ChangedAt,Note" : {
					message : {
						"@odata.etag" : 'W/"20160619220000.0000000"',
						ChangedAt : "2016-06-26T22:00:00.000000Z",
						Note : "EPM DG: SO ID 0500000004 Deliver as fast as possible",
						SalesOrderID : "0500000004"
					}
				},
				"SalesOrderList('0500000004')?custom-option=value&$select=ChangedAt,Note&$expand=SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
					source : "SalesOrderList_4_sideEffects3.json"
				},
				"SalesOrderList('0500000004')/SO_2_SOITEM(SalesOrderID='0500000004',ItemPosition='0000000070')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderIist('05000000004')-SO_2_SOITEM('70').json"
				},
				"SalesOrderList('0500000004')/SO_2_SOITEM(SalesOrderID='0500000004',ItemPosition='0000000070')?custom-option=value&$select=SOITEM_2_PRODUCT&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID);$select=ProductID)" : {
					source : "SalesOrderIist('05000000004')-SO_2_SOITEM('70')-SOITEM_2_PRODUCT-PRODUCT_2_BP-BP_2_CONTACT.json"
				},
				"SalesOrderList('0500000005')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_5.json"
				},
				"SalesOrderList('0500000005')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_5.json"
				},
				"SalesOrderList('0500000005')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_5.json"
				},
				"SalesOrderList('0500000005')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'%20and%20(ProductID%20eq%20'HT-1061')&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_5_Filter_via_changeParameter.opa.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'0500000005'&$select=ChangedAt,GrossAmount,Messages,Note,SalesOrderID" : {
					source : "SalesOrderList_5_sideEffects1.json"
				},
				"SalesOrderList('0500000005')?custom-option=value&$select=ChangedAt,Note" : {
					message : {
						"@odata.etag" : 'W/"20160619220000.0000000"',
						ChangedAt : "2016-06-26T22:00:00.000000Z",
						Note : "EPM DG: SO ID 0500000005 Deliver as fast as possible",
						SalesOrderID : "0500000005"
					}
				},
				"SalesOrderList('0500000005')?custom-option=value&$select=ChangedAt,Note&$expand=SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
					source : "SalesOrderList_5_sideEffects3.json"
				},
				"SalesOrderList('0500000006')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_6.json"
				},
				"SalesOrderList('0500000006')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_6.json"
				},
				"SalesOrderList('0500000006')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_6.json"
				},
				"SalesOrderList('0500000006')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=SalesOrderID%20eq%20'0500000006'%20and%20ItemPosition%20eq%20'0000000020'%20and%20ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_6-FilteredByError.json"
				},
				"SalesOrderList('0500000007')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_7.json"
				},
				"SalesOrderList('0500000007')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_7.json"
				},
				"SalesOrderList('0500000007')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_7.json"
				},
				"SalesOrderList('0500000008')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_8.json"
				},
				"SalesOrderList('0500000008')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_8.json"
				},
				"SalesOrderList('0500000008')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_8.json"
				},
				"SalesOrderList('0500000009')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList_9.json"
				},
				"SalesOrderList('0500000009')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderSchedules_9.json"
				},
				"SalesOrderList('0500000009')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_9.json"
				},
				"SalesOrderList('NEW1')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList('NEW1').json"
				},
				"SalesOrderList('NEW1')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					message : {value : []}
				},
				"SalesOrderList('NEW1')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('NEW1')_refresh.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'NEW1'&$select=ChangedAt,GrossAmount,Messages,Note,SalesOrderID" : {
					source : "SalesOrderList('NEW1')_sideEffects1.json"
				},
				"SalesOrderList('NEW1')?custom-option=value&$select=ChangedAt,Note" : {
					message : {
						"@odata.etag" : 'W/"20160619220000.0000000"',
						ChangedAt : "2016-06-26T22:00:00.000000Z",
						Note : "new 1",
						SalesOrderID : "NEW1"
					}
				},
				"SalesOrderList('NEW1')?custom-option=value&$select=ChangedAt,Note&$expand=SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
					source : "SalesOrderList('NEW1')_sideEffects3.json"
				},
				"SalesOrderList('NEW1')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					message : {
						"@odata.count" : "6",
						value : []
					}
				},
				"SalesOrderList('NEW1')/SO_2_SOITEM(SalesOrderID='NEW1',ItemPosition='10')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderList('NEW1')-SO_2_SOITEM('10').json"
				},
				"SalesOrderList('NEW1')/SO_2_SOITEM(SalesOrderID='NEW1',ItemPosition='11')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderList('NEW1')-SO_2_SOITEM('11').json"
				},
				"POST SalesOrderList('NEW1')/SO_2_SOITEM?custom-option=value" : [{
					code : 400,
					ifMatch : /"ProductID":"HT-1003","Quantity":"1",/,
					message : {
						error : {
							code : "OO/000",
							message : "Quantity for Product HT-1003 has to be a multiple of 3",
							"@SAP__common.numericSeverity" : 4,
							"@SAP__Common.longtextUrl" : "",
							target : "Quantity",
							"@SAP__Common.additionalTargets" : ["ProductID"],
							details : []
						}
					}
				}, {
					code : 200,
					ifMatch : /"ProductID":"HT-1003","Quantity":"3",/,
					source : "POST-SalesOrderList('NEW1')-SO_2_SOITEM_11.json"
				}, {
					source : "POST-SalesOrderList('NEW1')-SO_2_SOITEM.json"
				}],
				"SalesOrderList('NEW1')/SO_2_SOITEM(SalesOrderID='NEW1',ItemPosition='10')?custom-option=value&$select=SOITEM_2_PRODUCT&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID);$select=ProductID)" : {
					source : "SalesOrderList('NEW1')-SO_2_SOITEM('10')-SOITEM_2_PRODUCT-PRODUCT_2_BP-BP_2_CONTACT.json"
				},
				"SalesOrderList('NEW1')/SO_2_SOITEM(SalesOrderID='NEW1',ItemPosition='11')?custom-option=value&$select=SOITEM_2_PRODUCT&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID);$select=ProductID)" : {
					source : "SalesOrderList('NEW1')-SO_2_SOITEM('11')-SOITEM_2_PRODUCT-PRODUCT_2_BP-BP_2_CONTACT.json"
				},
				"SalesOrderList('NEW2')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList('NEW2').json"
				},
				"SalesOrderList('NEW2')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					message : {value : []}
				},
				"SalesOrderList('NEW2')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('NEW2')_refresh.json"
				},
				"SalesOrderList('NEW2')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					message : {value : []}
				},
				"SalesOrderList('NEW3')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList('NEW3').json"
				},
				"SalesOrderList('NEW3')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					message : {value : []}
				},
				"SalesOrderList('NEW3')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('NEW3')_refresh.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'NEW3'&$select=ChangedAt,GrossAmount,Messages,Note,SalesOrderID" : {
					source : "SalesOrderList('NEW3')_sideEffects1.json"
				},
				"SalesOrderList('NEW3')?custom-option=value&$select=ChangedAt,Note" : {
					message : {
						"@odata.etag" : 'W/"20160619220000.0000000"',
						ChangedAt : "2016-06-26T22:00:00.000000Z",
						Note : "new 3",
						SalesOrderID : "NEW3"
					}
				},
				"SalesOrderList('NEW3')?custom-option=value&$select=ChangedAt,Note&$expand=SO_2_SCHDL($select=DeliveryDate,ScheduleKey)" : {
					source : "SalesOrderList('NEW3')_sideEffects3.json"
				},
				"SalesOrderList('NEW3')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					message : {value : []}
				},
				"SalesOrderList('NEW3')/SO_2_SOITEM(SalesOrderID='NEW3',ItemPosition='10')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderList('NEW3')-SO_2_SOITEM('10').json"
				},
				"SalesOrderList('NEW3')/SO_2_SOITEM(SalesOrderID='NEW3',ItemPosition='20')?custom-option=value&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID" : {
					source : "SalesOrderList('NEW3')-SO_2_SOITEM('20').json"
				},
				"SalesOrderList('NEW3')/SO_2_SOITEM(SalesOrderID='NEW3',ItemPosition='20')?custom-option=value&$select=SOITEM_2_PRODUCT&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID);$select=ProductID)" : {
					source : "SalesOrderList('NEW3')-SO_2_SOITEM('20')-SOITEM_2_PRODUCT-PRODUCT_2_BP-BP_2_CONTACT.json"
				},
				"POST SalesOrderList('NEW3')/SO_2_SOITEM?custom-option=value" : [{
					ifMatch : /,"Note":"new 10"/,
					source : "POST-SalesOrderList('NEW3')-SO_2_SOITEM_10.json"
				}, {
					ifMatch : /,"Note":"new 20"/,
					source : "POST-SalesOrderList('NEW3')-SO_2_SOITEM_20.json"
				}],
				"SalesOrderList('NEW4')?custom-option=value&$select=ChangedAt,CreatedAt,LifecycleStatus,LifecycleStatusDesc,Note,SalesOrderID&$expand=SO_2_BP($select=Address/City,Address/PostalCode,BusinessPartnerID,CompanyName,PhoneNumber)" : {
					source : "SalesOrderList('NEW4').json"
				},
				"SalesOrderList('NEW4')/SO_2_SCHDL?custom-option=value&$select=DeliveryDate,ScheduleKey&$skip=0&$top=100" : {
					message : {value : []}
				},
				"SalesOrderList('NEW4')?custom-option=value&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('NEW4')_refresh.json"
				},
				"SalesOrderList('NEW4')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					message : {value : []}
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-SALESORDER.CURRENCY_CODE%27/H_TCURC_SH_Set?$select=LTEXT,WAERS&$skip=0&$top=20" : {
					source : "VH_CurrencyCode.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_epm_pd_cats-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.CATEGORY%27/H_EPM_PD_CATS_SH_Set?$select=CATEGORY&$skip=0&$top=20" : {
					source : "VH_ProductCategory.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_pr_type-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-PRODUCT.TYPE_CODE%27/D_PR_TYPE_FV_Set?$select=FIELD_VALUE&$skip=0&$top=100" : {
					source : "VH_ProductTypeCode.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_epm_pr-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-SO_ITEM.PRODUCT_ID%27/H_EPM_PR_SH_Set?$select=LANGU,NODE_KEY,PRODUCT_ID,SUPPLIER_ID,SUPPLIER_KEY,TEXT&$skip=0&$top=20" : {
					source : "VH_ProductID.json"
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
				"SalesOrderList('0500000001')/SO_2_BP?custom-option=value&$select=BusinessPartnerID,BusinessPartnerRole" : {
					message : {
						"@odata.etag" : 'W/"20160613065313.0000000"',
						BusinessPartnerID : "0100000005",
						BusinessPartnerRole : "01"
					}
				},
				"SalesOrderList('0500000001')/SO_2_SOITEM?custom-option=value&$count=true&$expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT($select=ContactGUID,DateOfBirth,EmailAddress,FirstName,LastName,PhoneNumber);$select=BusinessPartnerID,CompanyName,LegalForm,PhoneNumber);$select=Category,Name,ProductID,SupplierName,TypeCode)&$orderby=ItemPosition&$filter=ItemPosition%20gt%20'0000000000'&$select=DeliveryDate,GrossAmount,ItemPosition,Note,NoteLanguage,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=100" : {
					source : "SalesOrderItemsList_1.json"
				},
				"SalesOrderList('0500000002')/com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrderSimulateDiscount(Discount=75,Approver='')?custom-option=value" : {
					code : 400,
					message : {
						error : {
							code : "OO/000",
							message : "User John Doe is not authorized to approve more than 50%"
								+ " discount w/o approver",
							target : "Discount",
							"@SAP__Common.additionalTargets" : ["Approver"]
						}
					}
				},
				"SalesOrderList('0500000002')/com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrderSimulateDiscount(Discount=25,Approver='')?custom-option=value" : {
					message : {value : "188.05"}
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'0500000000'%20or%20SalesOrderID%20eq%20'0500000001'%20or%20SalesOrderID%20eq%20'0500000002'%20or%20SalesOrderID%20eq%20'0500000003'%20or%20SalesOrderID%20eq%20'0500000004'%20or%20SalesOrderID%20eq%20'0500000005'%20or%20SalesOrderID%20eq%20'0500000006'%20or%20SalesOrderID%20eq%20'0500000007'%20or%20SalesOrderID%20eq%20'0500000008'%20or%20SalesOrderID%20eq%20'0500000009'&$select=SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$top=10" : {
					source : "SalesOrderList_CompanyName_top10_sideEffects.json"
				},
				"SalesOrderList('0500000000')?custom-option=value&$select=SO_2_BP&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('0500000000')_CompanyName_sideEffects.json"
				},
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'0500000000'&$select=ChangedAt,GrossAmount,Messages,Note,SalesOrderID" : {
					source : "SalesOrderList('0500000000')_ChangeAt-GrossAmount-Note_sideEffects.json"
				},
				"SalesOrderList('0500000000')?custom-option=value&$select=ChangedAt,Note" : {
					source : "SalesOrderList('0500000000')_ChangeAt-Note_sideEffects.json"
				},
				"POST SalesOrderList?custom-option=value" : [{
					code : 400,
					ifMatch : /,"Note":"RAISE_ERROR"/,
					message : {
						error : {
							code : "OO/000",
							message : "Property `Note` value `RAISE_ERROR` not allowed!",
							"@SAP__common.numericSeverity" : 4,
							"@SAP__Common.longtextUrl" : "",
							target : "Note",
							details : []
						}
					}
				}, {
					ifMatch : /,"Note":"new 2"/,
					message : {
						BuyerID : "0100000000",
						Note : "new 2",
						SalesOrderID : "NEW2"
					}
				}, {
					ifMatch : /,"Note":"new 3"/,
					message : {
						BuyerID : "0100000000",
						Note : "new 3",
						SalesOrderID : "NEW3"
					}
				}, {
					ifMatch : /,"Note":"new 4"/,
					message : {
						BuyerID : "0100000000",
						Note : "new 4",
						SalesOrderID : "NEW4"
					}
				}, {
					message : {
						BuyerID : "0100000000",
						Note : "new 1",
						SalesOrderID : "NEW1"
					}
				}],
				"POST SalesOrderList('0500000004')/SO_2_SOITEM?custom-option=value" : [{
					code : 400,
					ifMatch : /,"Quantity":"0",/,
					message : {
						error : {
							code : "SEPM_BO_COMMON/022",
							message : "Value must be greater than 0",
							"@SAP__common.numericSeverity" : 4,
							"@SAP__Common.longtextUrl" : "",
							target : "Quantity",
							details : []
						}
					}
				}, {
					source : "POST-SalesOrderList('0500000004')-SO_2_SOITEM.json"
				}],
				"POST SalesOrderList('0500000006')/com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrder_Confirm?custom-option=value" : [{
					code : 412,
					headers : {
						"Preference-Applied" : "handling=strict"
					},
					ifMatch : function (oRequest) {
						return oRequest.requestHeaders["Prefer"] === "handling=strict";
					},
					message : {
						error : {
							code : "OO/000",
							message : "n/a",
							details : [{
								"@SAP__common.numericSeverity" : 3,
								code : "ZUI5_EPM_SAMPLE/000",
								message : "Enter a note",
								target : "SalesOrder/SO_2_SOITEM(SalesOrderID='0500000006',ItemPosition='0000000010')/Note"
							}, {
								"@SAP__common.numericSeverity" : 4,
								code : "ZUI5_EPM_SAMPLE/000",
								message : "Enter a minimum quantity of 2",
								target : "SalesOrder/SO_2_SOITEM(SalesOrderID='0500000006',ItemPosition='0000000020')/Quantity"
							}]
						}
					}
				}],
				"PATCH SalesOrderList('0500000000')?custom-option=value" : {
					ifMatch : /{"Note":"HEADER_MESSAGE"}/,
					headers : {
						"sap-messages" : JSON.stringify([{
							code : "42",
							message : "This is your requested bound header message",
							numericSeverity : 1,
							target : "Note"
						}])
					}
				},
				"PATCH SalesOrderList('0500000004')?custom-option=value" : [{
					code : 400,
					ifMatch : /{"Note":"RAISE_ERROR"}/,
					message : {
						error : {
							code : "OO/000",
							message : "Property `Note` value `RAISE_ERROR` not allowed!",
							"@SAP__common.numericSeverity" : 4,
							"@SAP__Common.longtextUrl" : "",
							 // Note: we assume that it is the 2nd request in a change set
							"@SAP__core.ContentID" : "1.0",
							target : "Note",
							details : []
						}
					}
				}],
				"SalesOrderList?custom-option=value&$filter=SalesOrderID%20eq%20'0500000006'&$select=ChangedAt,GrossAmount,Messages,Note,SalesOrderID" : {
					source : "SalesOrderList_6_sideEffects1.json"
				},
				"SalesOrderList('0500000006')?custom-option=value&$select=ChangedAt,Note" : {
					source : "SalesOrderList_6.json"
				},
				"SalesOrderList?custom-option=value&$filter=(SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'%20and%20(SO_2_BP/CompanyName%20ge%20'M'))%20and%20SalesOrderID%20eq%20'0500000006'&$select=BuyerID,ChangedAt,CurrencyCode,GrossAmount,LifecycleStatus,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					message : {value : []}
				}
			},
			aRegExps : [{
				regExp : /^GET [\w\/]+\/zui5_epm_sample\/0002\/\$metadata\?custom-option=value\&sap-language=..$/,
				response : {source : "metadata.xml"}
			}, {
				regExp : /^GET [-\w\/;=%.]+\.ET-SALESORDER.CURRENCY_CODE%27\/\$metadata\?sap-language=..$/,
				response : {source : "VH_CurrencyCode.xml"}
			}, {
				regExp : /^GET [-\w\/;=%.]+\.ET-PRODUCT.CATEGORY%27\/\$metadata\?sap-language=..$/,
				response : {source : "VH_ProductCategory.xml"}
			}, {
				regExp : /^GET [-\w\/;=%.]+\.ET-PRODUCT.TYPE_CODE%27\/\$metadata\?sap-language=..$/,
				response : {source : "VH_ProductTypeCode.xml"}
			}, {
				regExp : /^GET [-\w\/;=%.]+\.ET-SO_ITEM.PRODUCT_ID%27\/\$metadata\?sap-language=..$/,
				response : {source : "VH_ProductID.xml"}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/SalesOrders/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.SalesOrders.SandboxModel", {
		constructor : function (mParameters) {
			var mModelParameters = SandboxModelHelper.adaptModelParameters(mParameters,
					TestUtils.retrieveData("sap.ui.core.sample.odata.v4.SalesOrders"
						+ ".updateGroupId")), // updateGroupId controlled by OPA
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
