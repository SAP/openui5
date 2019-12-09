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
				"$metadata?custom-option=value" : {
					source : "metadata.xml"
				},
				"SalesOrderList?custom-option=value&$select=BuyerID,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
					source : "SalesOrderList_skip0_top5.json"
				},
				"SalesOrderList('0500000002')/SO_2_SCHDL?custom-option=value&$select=ItemKey,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderList(0500000002)-SO_2_SCHDL.json"
				},
				"SalesOrderList('0500000002')?custom-option=value&$select=Note,SalesOrderID" : {
					source : "SalesOrderList(0500000002)-Note.json"
				},
				"SalesOrderList('0500000002')/SO_2_BP?custom-option=value&$select=BusinessPartnerID,WebAddress" : {
					source : "SalesOrderList(0500000002)-SO_2_BP-WebAddress.json"
				},
				"GET SalesOrderList('0500000002')/SO_2_SCHDL('FA163E7AD4F11EE9B3F785A8E123EA14')?custom-option=value&$select=DeliveryDate,ScheduleKey" : {
					source : "SalesOrderList(0500000002)-SO_2_SCHDL(FA163E7AD4F11EE9B3F785A8E123EA14)-DeliveryDate.json"
				},
				"GET SalesOrderList('0500000002')/SO_2_SCHDL('FA163E7AD4F11EE9B3F785A8E1242A14')?custom-option=value&$select=DeliveryDate,ScheduleKey" : {
					source : "SalesOrderList(0500000002)-SO_2_SCHDL(FA163E7AD4F11EE9B3F785A8E1242A14)-DeliveryDate.json"
				},
				"SalesOrderList('0500000003')/SO_2_SCHDL?custom-option=value&$select=ItemKey,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderList(0500000003)-SO_2_SCHDL.json"
				},
				"SalesOrderList('0500000003')?custom-option=value&$select=Note,SalesOrderID" : {
					source : "SalesOrderList(0500000003)-Note.json"
				},
				"SalesOrderList('0500000003')/SO_2_BP?custom-option=value&$select=BusinessPartnerID,WebAddress" : {
					source : "SalesOrderList(0500000003)-SO_2_BP-WebAddress.json"
				},
				"GET SalesOrderList('0500000003')/SO_2_SCHDL('FA163E7AD4F11EE9B3F785B28B5E2A14')?custom-option=value&$select=DeliveryDate,ScheduleKey" : {
					source : "SalesOrderList(0500000003)-SO_2_SCHDL(FA163E7AD4F11EE9B3F785B28B5E2A14)-DeliveryDate.json"
				},
				"GET SalesOrderList('0500000003')/SO_2_SCHDL('FA163E7AD4F11EE9B3F785B28B5E6A14')?custom-option=value&$select=DeliveryDate,ScheduleKey" : {
					source : "SalesOrderList(0500000003)-SO_2_SCHDL(FA163E7AD4F11EE9B3F785B28B5E6A14)-DeliveryDate.json"
				}
			},
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			sSourceBase : "sap/ui/core/sample/odata/v4/LateProperties/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.LateProperties.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});