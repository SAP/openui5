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
				oLayout = new HBox(),
				oMetaModel,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				bRealOData = TestUtils.isRealOData(),
				sServiceUrl = fnProxy(oModel.sServiceUrl);

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
					"/sap/opu/local_V4/IWBEP/V4_GW_SAMPLE_BASIC/BusinessPartnerList?$skip=0&$top=5"
						: {source : "BusinessPartnerList.json"},
				}, "sap/ui/core/demokit/sample/odata/v4/SalesOrdersTemplate/data");
			}

			oMetaModel.requestObject("/$EntityContainer/SalesOrderList/$Type").then(function () {
				oLayout.addItem(sap.ui.view({
					async : true,
					models : {
						undefined : oModel,
						ui : new JSONModel({
							bRealOData : bRealOData,
							icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
							iconTooltip : bRealOData ? "real OData service" : "mock OData service"
						})
					},
					preprocessors : {
						xml : {
							models : {
								meta : oMetaModel
							}
						}
					},
					type : sap.ui.core.mvc.ViewType.XML,
					viewName : "sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main"
				}));
			});

			return oLayout;
		}
	});
});
