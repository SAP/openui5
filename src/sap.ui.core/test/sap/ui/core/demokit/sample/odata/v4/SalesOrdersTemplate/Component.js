/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *  zui5_epm_sample OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (HBox, View, ViewType, BaseComponent, JSONModel, ODataModel, TestUtils, sinon) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== BaseComponent.prototype.proxy,
				oLayout = new HBox({
					renderType : "Bare"
				}),
				oMetaModel,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				bRealOData = TestUtils.isRealOData(),
				sServiceUrl = fnProxy(oModel.sServiceUrl);

			if (oModel.sServiceUrl !== sServiceUrl) {
				//replace model from manifest in case of proxy
				oMetaModel = oModel.getMetaModel();
				oModel.destroy();
				oModel = new ODataModel({
					annotationURI : oMetaModel.aAnnotationUris,
					serviceUrl : sServiceUrl,
					synchronizationMode : "None"
				});
				this.setModel(oModel);
			}
			oMetaModel = oModel.getMetaModel();
			oMetaModel.setDefaultBindingMode("OneWay");

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
					"$metadata" : {source : "metadata.xml"},
					"BusinessPartnerList?$skip=0&$top=5" : {source : "BusinessPartnerList.json"},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-BUSINESSPARTNER.CURRENCY_CODE%27/$metadata"
						: {source : "metadata_tcurc.xml"},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-BUSINESSPARTNER.CURRENCY_CODE%27/H_TCURC_SH_Set?$skip=0&$top=20"
						: {source : "CurrencyList.json"},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_bp_role-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-BUSINESSPARTNER.BP_ROLE%27/$metadata"
						: {source : "metadata_bp_role.xml"},
					"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_bp_role-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-BUSINESSPARTNER.BP_ROLE%27/D_BP_ROLE_FV_Set?$skip=0&$top=100"
						: {source : "RoleList.json"}
				}, "sap/ui/core/sample/odata/v4/SalesOrdersTemplate/data",
				"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/");
			}

			oMetaModel.requestObject("/$EntityContainer/SalesOrderList/$Type").then(function () {
				oLayout.addItem(sap.ui.view({
					async : true,
					bindingContexts : {
						undefined : oModel.createBindingContext("/BusinessPartnerList")
					},
					models : {
						// Note: XML Templating creates bindings to default model only!
						undefined : oModel,
						metaModel : oMetaModel,
						ui : new JSONModel({
							bRealOData : bRealOData,
							icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
							iconTooltip : bRealOData ? "real OData service" : "mock OData service"
						})
					},
					preprocessors : {
						xml : {
							bindingContexts : {
								data : oModel.createBindingContext("/BusinessPartnerList")
							},
							models : {
								data : oModel,
								meta : oMetaModel
							}
						}
					},
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main"
				}));
			});

			return oLayout;
		}
	});
});
