/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display supplier of "/ProductSet('HT-1021')"
 *   from GWSAMPLE_BASIC via XML Templating.
 * @version @version@
 */
sap.ui.define([
		'sap/m/VBox',
		'sap/ui/core/UIComponent',
		'sap/ui/core/mvc/View',
		'sap/ui/model/odata/AnnotationHelper',
		'sap/ui/model/odata/v2/ODataModel'
	], function(VBox, UIComponent, View, AnnotationHelper, ODataModel) {
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
				oViewContainer = new VBox();

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
				oViewContainer.addItem(oTemplateView);
			});

			// Note: synchronously return s.th. here and add content to it later on
			return oViewContainer;
		}
	});

	return Component;

});
