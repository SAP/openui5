/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to show separate loading of value lists for UI5 controls
 *   which request value help from a UI5 ODataModel.
 * @version @version@
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/util/MockServer',
		'sap/ui/core/UIComponent',
		'sap/ui/model/odata/v2/ODataModel'
	], function(jQuery, MockServer, UIComponent, ODataModel) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.ViewTemplate.valuelist.Component", {
		metadata : "json",

		createContent : function () {
			var sAnnotationUri,
				oMockServer,
				sMockServerBaseUri
					= "test-resources/sap/ui/core/demokit/sample/ViewTemplate/valuelist/data/",
				oModel,
				sServiceUri = "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/",
				oUriParameters = jQuery.sap.getUriParameters(),
				sClient = oUriParameters.get("sap-client");

			if (sClient) {
				sServiceUri += "?sap-client=" + sClient;
			}
			sAnnotationUri = sServiceUri.replace(/$|(?=\?)/, "$metadata");

			if (oUriParameters.get("realOData") !== "true") {
				oMockServer = new MockServer({rootUri : sServiceUri});
				oMockServer.simulate(sMockServerBaseUri + "metadata.xml", {
					sMockdataBaseUrl : sMockServerBaseUri,
					bGenerateMissingMockData : false
				});
				oMockServer.start();
			} else if (location.hostname === "localhost") { //for local testing prefix with proxy
				sServiceUri = "proxy" + sServiceUri;
				sAnnotationUri = "proxy" + sAnnotationUri;
			}
			oModel = new ODataModel(sServiceUri, {
				//FIXME workaround for annotations in metadata loaded event fired too late
				annotationURI : sAnnotationUri,
				//TODO set via URL parameter? metadataUrlParams : "sap-value-list=none",
				useBatch : false //make network trace easier to read
			});
			return sap.ui.view({
				async : true,
				models : oModel,
				type : sap.ui.core.mvc.ViewType.XML,
				viewName : "sap.ui.core.sample.ViewTemplate.valuelist.Main"
			});
		}
	});

	return Component;

});
