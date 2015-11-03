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
	"sap/ui/thirdparty/sinon"
], function (View, BaseComponent, JSONModel, ODataModel, TestUtils, sinon) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== sap.ui.core.sample.common.Component.prototype.proxy,
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				oModel = new ODataModel({
					serviceUrl: fnProxy("/sap/opu/local_V4/IWBEP/V4_GW_SAMPLE_BASIC/")
				}),
				bRealOData = TestUtils.isRealOData();

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(sinon.sandbox.create(), {
					"/sap/opu/local_V4/IWBEP/V4_GW_SAMPLE_BASIC/$metadata"
						: {source : "metadata.xml"},
					"/sap/opu/local_V4/IWBEP/V4_GW_SAMPLE_BASIC/BusinessPartnerList?$skip=0&$top=50"
						: {source : "BusinessPartnerList.json"},
					"/sap/opu/local_V4/IWBEP/V4_GW_SAMPLE_BASIC/SalesOrderList?$expand=SO_2_SOITEM(%24expand%3DSOITEM_2_PRODUCT(%24expand%3DPRODUCT_2_BP(%24expand%3DBP_2_CONTACT)))&$skip=0&$top=50"
						: {source : "SalesOrderList.json"},
				}, "sap/ui/core/demokit/sample/odata/v4/SalesOrders/data");
			}

			return sap.ui.view({
				type : sap.ui.core.mvc.ViewType.XML,
				id : "MainView",
				viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
				models : { undefined: oModel,
					ui : new JSONModel({
						bRealOData : bRealOData,
						icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
						iconTooltip : bRealOData ? "real OData service" : "mock OData service"}
				)}
			});
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});
