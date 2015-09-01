/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display supplier of "/ProductSet('HT-1021')"
 *   from GWSAMPLE_BASIC via XML Templating.
 * @version @version@
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/m/VBox',
		'sap/ui/core/UIComponent',
		'sap/ui/core/mvc/View',
		'sap/ui/model/odata/v2/ODataModel'
	], function(jQuery, VBox, UIComponent, View, ODataModel) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.ViewTemplate.tiny.Component", {
		metadata : "json",

		createContent : function () {
			var oModel = new ODataModel(
					"proxy/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/", {
					annotationURI : "proxy/sap/opu/odata/IWFND/CATALOGSERVICE;v=2"
						+ "/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')/$value",
					json : true,
					loadMetadataAsync : true
				}),
				oMetaModel = oModel.getMetaModel(),
				sPath = "/ProductSet('HT-1021')/ToSupplier",
				oViewContainer = new VBox({
					items: [
						new sap.m.Title({text: "This is meant to be a pure code sample. "
							+ "(To run it, you would need a proxy which is configured properly.)",
							titleStyle: sap.ui.core.TitleLevel.H3})
					]
				});

			oMetaModel.loaded().then(function () {
				var oTemplateView = sap.ui.view({
						preprocessors: {
							xml: {
								bindingContexts: {
									meta: oMetaModel.getMetaContext(sPath)
								},
								models: {
									meta: oMetaModel
								}
							}
						},
						type: sap.ui.core.mvc.ViewType.XML,
						viewName: "sap.ui.core.sample.ViewTemplate.tiny.Template"
					});

				oTemplateView.setModel(oModel);
				oTemplateView.bindElement(sPath);
				oViewContainer.destroyItems();
				oViewContainer.addItem(oTemplateView);
			}, function (oError) {
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.alert(oError.message, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Missing Proxy?"});
			});

			// Note: synchronously return s.th. here and add content to it later on
			return oViewContainer;
		}
	});

	return Component;

});
