/*!
 * ${copyright}
 */
/**
 * @fileOverview Application component to test bindings using OData types.
 * @version @version@
 */
sap.ui.define([
	"sap/m/FlexItemData",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (FlexItemData, MessageBox, View, ViewType, BaseComponent, BindingMode, JSONModel,
		ODataModelV2, ODataModelV4, TestUtils) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.ViewTemplate.types.Component", {
		metadata : "json",
		createContent : function () {
			var pIdentificationViewV2, pIdentificationViewV4, oModelV2, oModelV4,
				bRealOData = TestUtils.isRealOData(),
				sResourcePath = "sap/ui/core/sample/ViewTemplate/types/data",
				sUriV2 = "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
				sUriV4 = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_edm_types_v4/0001/",
				mViews = {
					false : null, // V2 templating view
					true : null // V4 templating view
				},
				onError = function (oError) {
					MessageBox.alert(oError.message, {icon : MessageBox.Icon.ERROR,
						title : "Error"});
				};

			if (!bRealOData) {
				/* eslint-disable max-len */
				TestUtils.useFakeServer(this.oSandbox, sResourcePath, {
					"/sap/opu/odata/sap/ZUI5_EDM_TYPES/$metadata" : {
						source : "metadataV2.xml"
					},
					"/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection(ID='1')" : {
						source : "EdmTypesV2.json"
					},
					"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_edm_types_v4/0001/$metadata" : {
						source : "metadataV4.xml"
					},
					"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_edm_types_v4/0001/EdmTypesCollection(ID='1')" : {
						source : "EdmTypesV4.json"
					}
				});
				/* eslint-enable max-len */
			}

			oModelV2 = new ODataModelV2({
				annotationURI : sap.ui.require.toUrl(sResourcePath + "/annotationsV2.xml"),
				defaultBindingMode : BindingMode.TwoWay,
				serviceUrl : sUriV2,
				useBatch : bRealOData
			});

			oModelV4 = new ODataModelV4({
				annotationURI : sap.ui.require.toUrl(sResourcePath + "/annotationsV4.xml"),
				serviceUrl : sUriV4,
				updateGroupId : "EDMTypes"
			});

			pIdentificationViewV2 = oModelV2.getMetaModel().loaded().then(function () {
				var oMetaModel = oModelV2.getMetaModel();

				return View.create({
					preprocessors : {
						xml : {
							bindingContexts : {meta : oMetaModel.createBindingContext(
								"/dataServices/schema/0/entityType/0")},
							models : {meta : oMetaModel}
						}
					},
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.ViewTemplate.types.TemplateV2"
				}).then(function (oView) {
					oView.setLayoutData(new FlexItemData({growFactor : 1.0, baseSize : "0%"}));
					mViews["false"] = oView;
				});
			}, onError);

			pIdentificationViewV4 = oModelV4.getMetaModel()
				.requestObject("/com.sap.gateway.default.zui5_edm_types_v4.v0001.EdmTypes")
				.then(function () {
					var oMetaModel = oModelV4.getMetaModel();

					return View.create({
						preprocessors : {
							xml : {
								bindingContexts : {meta : oMetaModel.createBindingContext(
									"/com.sap.gateway.default.zui5_edm_types_v4.v0001.EdmTypes")},
								models : {meta : oMetaModel}
							}
						},
						type : ViewType.XML,
						viewName : "sap.ui.core.sample.ViewTemplate.types.TemplateV4"
					}).then(function (oView) {
						oView.setLayoutData(new FlexItemData({growFactor : 1.0, baseSize : "0%"}));
						mViews["true"] = oView;
					});
				}, onError);

			return Promise.all([pIdentificationViewV2, pIdentificationViewV4]).then(function () {
				return View.create({
					models : {
						undefined : oModelV2,
						ui : new JSONModel({
							sCode : "",
							bCodeVisible : false,
							iMessages : 0,
							realOData : bRealOData,
							v2 : true,
							v4 : false
						}),
						v2 : oModelV2,
						v4 : oModelV4
					},
					type : ViewType.XML,
					viewData : mViews,
					viewName : "sap.ui.core.sample.ViewTemplate.types.Types"
				}).then(function (oRootView) {
					oRootView.byId("identificationBox").addItem(mViews["false"]);
					return oRootView;
				});
			});
		}
	});
});
