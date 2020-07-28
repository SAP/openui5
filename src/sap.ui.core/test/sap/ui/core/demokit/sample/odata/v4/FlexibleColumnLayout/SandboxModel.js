/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// For the "realOData" case, the URL is adapted to a proxy URL and certain constructor parameters
// are taken from URL parameters.
// For the "non-realOData" case, a mock server for the backend requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			mFixture : {
				"$metadata" : {
					source : "metadata.xml"
				},
				"SalesOrderList?$count=true&$filter=SalesOrderID%20ge%20'0500000000'%20and%20LifecycleStatus%20eq%20'N'&$select=CurrencyCode,GrossAmount,Note,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
					source : "SalesOrderList.json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?$count=true&$orderby=ItemPosition&$select=CurrencyCode,GrossAmount,ItemPosition,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=5" : {
					source : "SalesOrderList('0500000000')-SO_2_ITEM.json"
				},
				"SalesOrderList('0500000000')?$select=ChangedAt,CreatedAt,LifecycleStatusDesc" : {
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
				}
			},
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			sSourceBase : "sap/ui/core/sample/odata/v4/FlexibleColumnLayout/data"
	};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.FlexibleColumnLayout.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});