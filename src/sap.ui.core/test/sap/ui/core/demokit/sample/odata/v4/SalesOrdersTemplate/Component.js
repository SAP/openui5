/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   V4_GW_SAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/mvc/View",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (HBox, View, BaseComponent, JSONModel, ODataModel, TestUtils, sinon) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== sap.ui.core.sample.common.Component.prototype.proxy,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				sServiceUrl = fnProxy(oModel.sServiceUrl),
				oLayout = new HBox(),
				oMetaModel,
				bRealOData = TestUtils.isRealOData();

			if (oModel.sServiceUrl !== sServiceUrl) {
				//replace model from manifest in case of proxy
				oModel = new ODataModel(sServiceUrl);
				this.setModel(oModel);
			}
			oMetaModel = oModel.getMetaModel();

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(sinon.sandbox.create(), {
					"/sap/opu/local_V4/IWBEP/V4_GW_SAMPLE_BASIC/$metadata"
						: {source : "metadata.xml"},
					"/sap/opu/local_V4/IWBEP/V4_GW_SAMPLE_BASIC/SalesOrderList"
						: {source : "SalesOrderList.json"}
				}, "sap/ui/core/demokit/sample/odata/v4/SalesOrdersTemplate/data");
			}

			oMetaModel.requestObject("/").then(function () {
				oLayout.addItem(sap.ui.xmlview({
					async : true,
					id : "MainView",
					models : {
						undefined : oModel,
						meta : oMetaModel,
						ui : new JSONModel({
							bRealOData : bRealOData,
							icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
							iconTooltip : bRealOData ? "real OData service" : "mock OData service"
						})
					},
					viewName : "sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main"
				}));
			});

			return oLayout;
		}
	});
});
