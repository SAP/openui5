/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display supplier of "/ProductSet('HT-1021')"
 *   from GWSAMPLE_BASIC via XML Templating.
 * @version @version@
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/Title",
	"sap/m/VBox",
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/model/odata/v2/ODataModel"
], function(MessageBox, Title, VBox, library, UIComponent, View, ODataModel) {
	"use strict";

	var TitleLevel = library.TitleLevel, // shortcut for sap.ui.core.TitleLevel
		ViewType = library.mvc.ViewType; // shortcut for sap.ui.core.mvc.ViewType

	return UIComponent.extend("sap.ui.core.sample.ViewTemplate.tiny.Component", {
		metadata : "json",

		createContent : function () {
			var oModel = new ODataModel(
					"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/", {
					annotationURI : "/test-resources/sap/ui/core/demokit/sample/ViewTemplate/tiny"
						+ "/annotations.xml",
					json : true,
					loadMetadataAsync : true
				}),
				oMetaModel = oModel.getMetaModel(),
				sPath = "/ProductSet('HT-1021')/ToSupplier",
				oViewContainer = new VBox({
					items : [
						new Title({text : "This is meant to be a pure code sample. "
							+ "(To run it, you would need a proxy which is configured properly.)",
							titleStyle : TitleLevel.H3})
					]
				});

			oMetaModel.loaded().then(function () {
				View.create({
					async : true,
					models : oModel,
					preprocessors : {
						xml : {
							bindingContexts : {
								meta : oMetaModel.getMetaContext(sPath)
							},
							models : {
								meta : oMetaModel
							}
						}
					},
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.ViewTemplate.tiny.Template"
				}).then(function (oTemplateView) {
					oTemplateView.bindElement(sPath);
					oViewContainer.destroyItems();
					oViewContainer.addItem(oTemplateView);
				}, function (oError) {
					MessageBox.alert(oError.message, {
						icon : MessageBox.Icon.ERROR,
						title : "Missing Proxy?"});
				});
			});

			// Note: synchronously return s.th. here and add content to it later on
			return oViewContainer;
		}
	});
});
