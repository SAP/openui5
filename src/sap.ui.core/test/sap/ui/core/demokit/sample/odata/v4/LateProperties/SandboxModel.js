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
				"SalesOrderList?custom-option=value&$select=BuyerID,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
					source : "SalesOrderList_skip0_top5.json"
				},
				"SalesOrderList?custom-option=value&$orderby=SalesOrderID%20desc&$select=BuyerID,SalesOrderID&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=5" : {
					source : "SalesOrderList_skip0_top5.json"
				},
				"SalesOrderList('0500000002')/SO_2_SCHDL?custom-option=value&$select=ItemKey,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderList(0500000002)-SO_2_SCHDL.json"
				},
				"SalesOrderList('0500000002')?custom-option=value&$select=GrossAmount,Note" : {
					message : {
						"@odata.etag" : 'W/"20190904220000.0000000 "',
						SalesOrderID : "0500000002",
						GrossAmount : "5631.08",
						Note : "EPM DG: SO ID 0500000002 Deliver as fast as possible"
					}
				},
				"SalesOrderList('0500000002')/SO_2_BP?custom-option=value&$select=BusinessPartnerID,EmailAddress,WebAddress" : {
					message : {
						"@odata.etag" : 'W/"20190321111935.0000000 "',
						BusinessPartnerID : "0100000006",
						EmailAddress : "customer-bart.koenig@tecum-ag.de",
						WebAddress : "http://www.asia-ht.com"
					}
				},
				"GET SalesOrderList('0500000002')/SO_2_SCHDL('FA163E7AD4F11EE9B3F785A8E123EA14')?custom-option=value&$select=DeliveryDate" : {
					message : {
						ScheduleKey : "FA163E7AD4F11EE9B3F785A8E123EA14",
						DeliveryDate : "2019-09-11T22:00:00Z"
					}
				},
				"GET SalesOrderList('0500000002')/SO_2_SCHDL('FA163E7AD4F11EE9B3F785A8E1242A14')?custom-option=value&$select=DeliveryDate" : {
					message : {
						ScheduleKey : "FA163E7AD4F11EE9B3F785A8E1242A14",
						DeliveryDate : "2019-09-11T22:00:00Z"
					}
				},
				"SalesOrderList('0500000003')/SO_2_SCHDL?custom-option=value&$select=ItemKey,ScheduleKey&$skip=0&$top=100" : {
					source : "SalesOrderList(0500000003)-SO_2_SCHDL.json"
				},
				"SalesOrderList('0500000003')?custom-option=value&$select=GrossAmount,Note" : {
					message : {
						"@odata.etag" : 'W/"20191202100433.1903450 "',
						SalesOrderID : "0500000003",
						GrossAmount : "1704.04",
						Note : "EPM DG: SO ID 0500000003 Deliver as fast as possible"
					}
				},
				"SalesOrderList('0500000003')/SO_2_BP?custom-option=value&$select=BusinessPartnerID,EmailAddress,WebAddress" : {
					message : {
						"@odata.etag" : 'W/"20190321111935.0000000 "',
						BusinessPartnerID : "0100000007",
						EmailAddress : "customer-yoko.nakamura@asia-ht.com",
						WebAddress : "http://www.laurent-paris.com"
					}
				},
				"GET SalesOrderList('0500000003')/SO_2_SCHDL('FA163E7AD4F11EE9B3F785B28B5E2A14')?custom-option=value&$select=DeliveryDate" : {
					message : {
						ScheduleKey : "FA163E7AD4F11EE9B3F785B28B5E2A14",
						DeliveryDate : "2019-09-11T22:00:00Z"
					}
				},
				"GET SalesOrderList('0500000003')/SO_2_SCHDL('FA163E7AD4F11EE9B3F785B28B5E6A14')?custom-option=value&$select=DeliveryDate" : {
					message : {
						ScheduleKey : "FA163E7AD4F11EE9B3F785B28B5E6A14",
						DeliveryDate : "2019-09-11T23:00:00Z"
					}
				}
			},
			sSourceBase : "sap/ui/core/sample/odata/v4/LateProperties/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.LateProperties.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
