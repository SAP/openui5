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
	"sap/ui/core/library",
	"sap/ui/core/LocaleData",
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (FlexItemData, MessageBox, library, LocaleData, View, BaseComponent, BindingMode,
		JSONModel, ODataModelV2, ODataModelV4, TestUtils) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return BaseComponent.extend("sap.ui.core.sample.ViewTemplate.types.Component", {
		metadata : "json",
		createContent : function () {
			var oLocaleData = new LocaleData(sap.ui.getCore().getConfiguration().getLocale()),
				oModelV2,
				oModelV4,
				bRealOData = TestUtils.isRealOData(),
				oRootView,
				sUriV2 = "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
				sUriV4 = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_edm_types_v4/0001/",
				mViews = {
					"false" : null, // V2 templating view
					"true" : null // V4 templating view
				},
				onError = function (oError) {
					MessageBox.alert(oError.message, {
						icon : MessageBox.Icon.ERROR,
						title : "Error"});
				};

			if (bRealOData) {
				sUriV2 = this.proxy(sUriV2);
				sUriV4 = this.proxy(sUriV4);
			} else {
				TestUtils.useFakeServer(this.oSandbox,
					"sap/ui/core/sample/ViewTemplate/types/data", {
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
			}

			oModelV2 = new ODataModelV2({
				annotationURI : sap.ui.require.toUrl("sap/ui/core/sample/ViewTemplate/types/data/annotationsV2.xml"),
				defaultBindingMode : BindingMode.TwoWay,
				serviceUrl : sUriV2,
				useBatch : bRealOData
			});

			oModelV4 = new ODataModelV4({
				serviceUrl : sUriV4,
				synchronizationMode : "None",
				updateGroupId : "EDMTypes"
			});

			oModelV2.getMetaModel().loaded().then(function () {
				var oMetaModel = oModelV2.getMetaModel();

				View.create({
					preprocessors : {
						xml : {
							bindingContexts : {meta : oMetaModel.createBindingContext(
								"/dataServices/schema/0/entityType/0")
							},
							models : {meta : oMetaModel}
						}
					},
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.ViewTemplate.types.TemplateV2"
				}).then(function (oView) {
					oView.setLayoutData(new FlexItemData({growFactor : 1.0, baseSize : "0%"}));
					oRootView.loaded().then(function() {
						oRootView.byId("identificationBox").addItem(oView);
					});
					mViews["false"] = oView;
				});
			}, onError);

			oModelV4.getMetaModel()
				.requestObject("/com.sap.gateway.default.zui5_edm_types_v4.v0001.EdmTypes")
				.then(function () {
					var oMetaModel = oModelV4.getMetaModel();

					View.create({
						preprocessors : {
							xml : {
								bindingContexts : {meta : oMetaModel.createBindingContext(
									"/com.sap.gateway.default.zui5_edm_types_v4.v0001.EdmTypes")
								},
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

			oRootView = sap.ui.view({
				async : true,
				models : {
					undefined : oModelV2,
					ui : new JSONModel({
						sCode : "",
						bCodeVisible : false,
						iMessages : 0,
						patterns : {
							dateMedium : oLocaleData.getDatePattern("medium"),
							dateShort : oLocaleData.getDatePattern("short"),
							dateTimeLong :
								oLocaleData.getCombinedDateTimePattern("long", "long"),
							dateTimeMedium :
								oLocaleData.getCombinedDateTimePattern("medium", "medium"),
							timeLong : oLocaleData.getTimePattern("long"),
							timeMedium : oLocaleData.getTimePattern("medium"),
							timeShort : oLocaleData.getTimePattern("short")
						},
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
			});
			return oRootView;
		}
	});
});