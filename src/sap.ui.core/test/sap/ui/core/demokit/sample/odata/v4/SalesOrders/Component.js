/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   V4_GW_SAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/URI"
], function (View, BaseComponent, JSONModel, ODataModel, TestUtils, sinon, URI) {
	/*eslint no-multi-str: 0*/
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== sap.ui.core.sample.common.Component.prototype.proxy,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				bRealOData = TestUtils.isRealOData(),
				sServiceUrl = fnProxy(oModel.sServiceUrl),
				sQuery;

			if (oModel.sServiceUrl !== sServiceUrl) {
				//replace model from manifest in case of proxy
				sQuery = URI.buildQuery(oModel.mUriParameters);
				sQuery = sQuery ? "?" + sQuery : "";
				oModel = new ODataModel(sServiceUrl + sQuery);
				this.setModel(oModel);
			}

			// TODO: Add Mockdata for single sales orders *with expand*
			// http://localhost:8080/testsuite/proxy/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/SalesOrderList('050001110')?$expand=SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP($expand=BP_2_CONTACT)))
			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(sinon.sandbox.create(), {
					"/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/$metadata"
						: {source : "metadata.xml"},
					"/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/BusinessPartnerList?$skip=0&$top=100"
						: {source : "BusinessPartnerList.json"},
					"/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/SalesOrderList?\
$expand=SO_2_BP&$skip=0&$top=5"
						: {source : "SalesOrderList.json"},
					"/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/SalesOrderList('0500001110')"
						: {source : "SalesOrderList_0500001110.json"},
					"/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/SalesOrderList('0500001111')"
						: {source : "SalesOrderList_0500001111.json"},
					"/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/SalesOrderList('0500001112')"
						: {source : "SalesOrderList_0500001112.json"},
					"/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/SalesOrderList('0500001113')"
						: {source : "SalesOrderList_0500001113.json"},
					"/sap/opu/local_V4/SAP/V4_GW_SAMPLE_BASIC/SalesOrderList('0500001114')"
						: {source : "SalesOrderList_0500001114.json"}
				}, "sap/ui/core/demokit/sample/odata/v4/SalesOrders/data");
			}

			return sap.ui.view({
				id : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
				models : { undefined: oModel,
					ui : new JSONModel({
						bRealOData : bRealOData,
						icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
						iconTooltip : bRealOData ? "real OData service" : "mock OData service"}
				)},
				type : sap.ui.core.mvc.ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main"
			});
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});
