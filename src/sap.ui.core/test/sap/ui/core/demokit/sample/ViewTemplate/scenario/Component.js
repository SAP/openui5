/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the GWSAMPLE_BASIC
 *   OData service.
 * @version @version@
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/UIComponent',
		'sap/ui/core/mvc/View',
		'sap/ui/core/util/MockServer',
		'sap/ui/model/odata/AnnotationHelper',
		'sap/m/HBox',
		'sap/m/MessageBox',
		'jquery.sap.script'
	], function(jQuery, UIComponent, View, MockServer, AnnotationHelper, HBox, MessageBox/*, jQuerySapScript*/) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.ViewTemplate.scenario.Component", {
		metadata : "json", //TODO Use component metadata from manifest file

		createContent : function () {
			var sAnnotationUri,
				sAnnotationUri2,
				sServiceUri,
				sMockServerBaseUri
					= "test-resources/sap/ui/core/demokit/sample/ViewTemplate/scenario/data/",
				oLayout = new HBox(),
				oMockServer,
				oUriParameters = jQuery.sap.getUriParameters(),
				fnModel = oUriParameters.get("oldOData") === "true"
					? sap.ui.model.odata.ODataModel
					: sap.ui.model.odata.v2.ODataModel,
				oModel,
				oMetaModel;

			// GWSAMPLE_BASIC with external annotations
			sAnnotationUri = "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2"
				+ "/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')/$value";
			sAnnotationUri2 = "/sap(====)/bc/bsp/sap/zanno_gwsample/annotations.xml";
			sServiceUri = "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/";

			if (oUriParameters.get("realOData") !== "true") {
				jQuery.sap.require("sap.ui.core.util.MockServer");

				oMockServer = new MockServer({rootUri : sServiceUri});
				oMockServer.simulate(/*TODO sServiceUri?!*/sMockServerBaseUri + "metadata.xml", {
					sMockdataBaseUrl : sMockServerBaseUri,
					bGenerateMissingMockData : true
				});
				oMockServer.start();
				// yet another mock server to handle annotations
				new MockServer({
					requests : [{
						method : "GET",
						//TODO have MockServer fixed and pass just the URL!
						path : new RegExp(MockServer.prototype
							._escapeStringForRegExp(sAnnotationUri)),
						response : function(oXHR) {
							oXHR.respondFile(200, {}, sMockServerBaseUri + "annotations.xml");
						}
					}, {
						method : "GET",
						//TODO have MockServer fixed and pass just the URL!
						path : new RegExp(MockServer.prototype
							._escapeStringForRegExp(sAnnotationUri2)),
						response : function(oXHR) {
							oXHR.respondFile(200, {}, sMockServerBaseUri + "annotations2.xml");
						}
					}]
				}).start();
			} else if (location.hostname === "localhost") { //for local testing prefix with proxy
				sAnnotationUri = "proxy" + sAnnotationUri;
				sAnnotationUri2 = "proxy" + sAnnotationUri2;
				sServiceUri = "proxy" + sServiceUri;
			}

			oModel = new fnModel(sServiceUri, {
				annotationURI : [sAnnotationUri, sAnnotationUri2],
				json : true,
				loadMetadataAsync : true
			});

			oModel.getMetaModel().loaded().then(function () {
				oLayout.addItem(sap.ui.view({
					type : sap.ui.core.mvc.ViewType.XML,
					viewName : "sap.ui.core.sample.ViewTemplate.scenario.Main",
					models : oModel
				}));
			}, function (oError) {
				MessageBox.alert(oError.message, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error"});
			});

			return oLayout;
		}
	});


	return Component;

});
