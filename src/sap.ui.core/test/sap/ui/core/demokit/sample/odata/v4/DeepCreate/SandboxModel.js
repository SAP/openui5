/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			mFixture : {
				"SalesOrderList?$count=true&$select=CurrencyCode,GrossAmount,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=10" : {
					source : "SalesOrderList.json"
				},
				"SalesOrderList('0500000000')?$select=LifecycleStatusDesc,Messages,Note" : {
					source : "SalesOrderList('0500000000').json"
				},
				"SalesOrderList('0500000000')/SO_2_SOITEM?$count=true&$select=CurrencyCode,GrossAmount,ItemPosition,Note,ProductID,Quantity,QuantityUnit,SalesOrderID&$skip=0&$top=5" : {
					source : "SalesOrderList('0500000000')-SO_2_SOITEM.json"
				},
				"POST SalesOrderList" : {
					source : "POST-SalesOrderList.json"
				},
				"SalesOrderList('0500000007')?$select=Messages&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)" : {
					source : "SalesOrderList('0500000007')-SO_2_BP.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-SALESORDER.CURRENCY_CODE%27/H_TCURC_SH_Set?$select=LTEXT,WAERS&$skip=0&$top=20" : {
					source : "VH_CurrencyCode.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_epm_pr-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-SO_ITEM.PRODUCT_ID%27/H_EPM_PR_SH_Set?$select=LANGU,NODE_KEY,PRODUCT_ID,SUPPLIER_ID,SUPPLIER_KEY,TEXT&$skip=0&$top=20" : {
					source : "VH_ProductID.json"
				}
			},
			aRegExps : [{
				regExp : /^GET [\w\/]+\/zui5_epm_sample\/0002\/\$metadata\?sap-language=..$/,
				response : {source : "metadata.xml"}
			}, {
				regExp : /^GET [-\w\/;=%.]+\.ET-SALESORDER.CURRENCY_CODE%27\/\$metadata\?sap-language=..$/,
				response : {source : "VH_CurrencyCode.xml"}
			}, {
				regExp : /^GET [-\w\/;=%.]+\.ET-SO_ITEM.PRODUCT_ID%27\/\$metadata\?sap-language=..$/,
				response : {source : "VH_ProductID.xml"}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/DeepCreate/data"
	};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.DeepCreate.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
