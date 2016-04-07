/*!
 * ${copyright}
 */
/**
 * @fileOverview Application component to test bindings using OData types.
 * @version @version@
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/m/FlexItemData',
		'sap/m/HBox',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/View', // sap.ui.view()
		'sap/ui/core/mvc/ViewType',
		'sap/ui/core/sample/common/Component',
		'sap/ui/core/util/MockServer',
		'sap/ui/model/BindingMode',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/odata/AnnotationHelper',
		'sap/ui/model/odata/v2/ODataModel',
		'jquery.sap.script'
	], function(jQuery, FlexItemData, HBox, MessageBox, View, ViewType, BaseComponent, MockServer,
		BindingMode, JSONModel, AnnotationHelper, ODataModel/*, jQuerySapScript*/) {
	"use strict";

	var Component = BaseComponent.extend("sap.ui.core.sample.ViewTemplate.types.Component", {
		metadata : "json",
		createContent : function () {
			var sUri = "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
				oLayout = new HBox(),
				sMockServerBaseUri =
					jQuery.sap.getModulePath("sap.ui.core.sample.ViewTemplate.types.data", "/"),
				oModel,
				bRealOData = (jQuery.sap.getUriParameters().get("realOData") === "true");

			if (bRealOData) {
				sUri = this.proxy(sUri);
			} else {
				this.aMockServers.push(new MockServer({rootUri: sUri}));
				this.aMockServers[0].simulate(sMockServerBaseUri + "metadata.xml", {
					sMockdataBaseUrl: sMockServerBaseUri
				});
				this.aMockServers[0].start();
			}

			oModel = new ODataModel(sUri, {
				annotationURI : sMockServerBaseUri + "annotations.xml",
				defaultBindingMode : BindingMode.TwoWay
			});

			oModel.getMetaModel().loaded().then(function () {
				var oMetaModel = oModel.getMetaModel(),
					oView = sap.ui.view({
						models : {
							undefined : oModel,
							ui : new JSONModel({realOData : bRealOData, codeVisible : false})
						},
						preprocessors : {
							xml : {
								bindingContexts : {meta : oMetaModel.createBindingContext(
									"/dataServices/schema/0/entityType/0")
								},
								models : {meta : oMetaModel}
							}
						},
						type : ViewType.XML,
						viewName : "sap.ui.core.sample.ViewTemplate.types.Types"
					});

				oView.setLayoutData(new FlexItemData({growFactor : 1.0, baseSize : "0%"}));
				oLayout.addItem(oView);
			}, function (oError) {
				MessageBox.alert(oError.message, {
					icon : MessageBox.Icon.ERROR,
					title : "Error"});
			});
			return oLayout;
		}
	});

	return Component;
});
