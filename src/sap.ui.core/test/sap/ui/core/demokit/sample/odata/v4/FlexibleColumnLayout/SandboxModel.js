/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (SandboxModelHelper, ODataModel, TestUtils) {
	"use strict";

	var oMockData = {
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			mFixture : {
				"SalesOrderList?$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'&$select=CurrencyCode,GrossAmount,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
					source : "SalesOrderList.json"
				},
				"SalesOrderList?$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'&$top=0" : {
					message : {
						"@odata.count" : "9",
						value : []
					}
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?$count=true&$orderby=ItemPosition&$select=CurrencyCode,GrossAmount,ItemPosition,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=5" : {
					source : "SalesOrderList('0500000000')-SO_2_ITEM.json"
				},
				"SalesOrderList('0500000000')?$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Messages" : {
					source : "SalesOrderList('0500000000')-ChangedAt+CreatedAt+LifecycleStatusDesc.json"
				},
				"SalesOrderList?$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'&$select=CurrencyCode,GrossAmount,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=SalesOrderID%20desc&$skip=0&$top=5" : {
					source : "SalesOrderList-OrderBySalesOrderID,desc.json"
				},
				"SalesOrderList?$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'&$select=CurrencyCode,GrossAmount,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$orderby=SalesOrderID&$skip=0&$top=5" : {
					source : "SalesOrderList.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?$count=true&$orderby=GrossAmount,ItemPosition&$select=CurrencyCode,GrossAmount,ItemPosition,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=5" : {
					source : "SalesOrderList('0500000000')-SO_2_ITEM-OrderByGrossAmount.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?$count=true&$orderby=GrossAmount,ItemPosition&$select=CurrencyCode,GrossAmount,ItemPosition,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=5&$top=5" : {
					source : "SalesOrderList('0500000000')-SO_2_ITEM-OrderByGrossAmount_skip5_top5.json"
				},
				"SalesOrderList('0500000009')/SO_2_SOITEM?$count=true&$orderby=ItemPosition&$select=CurrencyCode,GrossAmount,ItemPosition,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=5" : {
					source : "SalesOrderList('0500000009')-SO_2_ITEM.json"
				},
				"SalesOrderList('0500000009')?$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Messages" : {
					source : "SalesOrderList('0500000009')-ChangedAt+CreatedAt+LifecycleStatusDesc.json"
				},
				"SalesOrderList?$filter=SalesOrderID%20eq%20'0500000000'&$select=ChangedAt,CreatedAt,CurrencyCode,GrossAmount,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('0500000000')-Refresh_Existence.json"
				},
				"SalesOrderList?$filter=(GrossAmount%20gt%201000)%20and%20SalesOrderID%20eq%20'0500000000'&$count=true&$top=0" : {
					message : {
						"@odata.count" : "0",
						value : []
					}
				},
				"SalesOrderList?$filter=SalesOrderID%20eq%20'0500000009'&$select=ChangedAt,CreatedAt,CurrencyCode,GrossAmount,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					message : {value : []}
				},
				"SalesOrderList?$count=true&$filter=GrossAmount%20gt%201000&$select=CurrencyCode,GrossAmount,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : [{
					ifMatch : function (_oRequest) {
						return TestUtils.retrieveData(
							"SalesOrderList_Refresh_with_GrossAmount_GT_1000.json");
					},
					source : "SalesOrderList_Refresh_with_GrossAmount_GT_1000.json"
				}, {
					source : "SalesOrderList_GrossAmount_GT_1000.json"
				}],
				"SalesOrderList?$count=true&$filter=GrossAmount%20gt%201000&$select=CurrencyCode,GrossAmount,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=4&$top=1" : {
					source : "SalesOrderList_GrossAmount_GT_1000_skip4_top1.json"
				},
				"SalesOrderList('0500000004')?$select=ChangedAt,CreatedAt,LifecycleStatusDesc,Messages" : {
					source : "SalesOrderList('0500000004')-ChangedAt+CreatedAt+LifecycleStatusDesc.json"
				},
				"SalesOrderList('0500000004')/SO_2_SOITEM?$count=true&$orderby=ItemPosition&$select=CurrencyCode,GrossAmount,ItemPosition,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=5" : {
					message : {
						"@odata.count" : "0",
						value : []
					}
				},
				"SalesOrderList?$count=true&$filter=(GrossAmount%20gt%201000)%20and%20not%20(SalesOrderID%20eq%20'0500000004')&$top=0" : {
					message : {
						"@odata.count" : "7",
						value : []
					}
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?$count=true&$filter=not%20(SalesOrderID%20eq%20'0500000000'%20and%20ItemPosition%20eq%20'0000000010')&$top=0" : {
					message : {
						"@odata.count" : "26",
						value : []
					}
				},
				"SalesOrderList?$filter=SalesOrderID%20eq%20'0500000004'&$select=ChangedAt,CreatedAt,CurrencyCode,GrossAmount,LifecycleStatusDesc,Messages,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('0500000004')-Refresh_Existence.json"
				},
				"SalesOrderList?$filter=SalesOrderID%20eq%20'0500000000'&$select=GrossAmount,SalesOrderID" : {
					message : {value : [{
						"@odata.etag" : "W/\"20210113145715.2782530 \"",
						GrossAmount : "24540.06",
						SalesOrderID : "0500000000"
					}]}
				},
				"POST SalesOrderList('0500000000')/com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrderIncreaseItemsQuantity?$select=GrossAmount,Note" : {
					message : {
						"@odata.etag" : 'W/"20200807145436.8614010 "',
						GrossAmount : "32768.42",
						Note : "10 items' quantities increased by 1",
						SalesOrderID : "0500000000"
					}
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?$select=GrossAmount,ItemPosition,Quantity,SalesOrderID&$filter=SalesOrderID%20eq%20'0500000000'%20and%20ItemPosition%20eq%20'0000000080'%20or%20SalesOrderID%20eq%20'0500000000'%20and%20ItemPosition%20eq%20'0000000090'%20or%20SalesOrderID%20eq%20'0500000000'%20and%20ItemPosition%20eq%20'0000000050'%20or%20SalesOrderID%20eq%20'0500000000'%20and%20ItemPosition%20eq%20'0000000030'%20or%20SalesOrderID%20eq%20'0500000000'%20and%20ItemPosition%20eq%20'0000000100'%20or%20SalesOrderID%20eq%20'0500000000'%20and%20ItemPosition%20eq%20'0000000010'&$top=6" : {
					source : "SalesOrderList('0500000000')-requestSideEffects.json"
				},
				"POST SalesOrderList" : {
					source : "POST-SalesOrderList.json"
				},
				"SalesOrderList('0500000005')?$select=SO_2_BP&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					message : {
						"@odata.etag" : "W/\"202302051220000.9682750 \"",
						SO_2_BP : {
							BusinessPartnerID : "010000000",
							CompanyName : "SAP"
						}
					}
				},
				"SalesOrderList?$filter=SalesOrderID%20eq%20'0500000005'&$select=GrossAmount,SalesOrderID" : {
					message : {
						value : [{
							GrossAmount : "12404.77",
							SalesOrderID : "0500000005"
						}]
					}
				}
			},
			sSourceBase : "sap/ui/core/sample/odata/v4/FlexibleColumnLayout/data"
	};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.FlexibleColumnLayout.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
