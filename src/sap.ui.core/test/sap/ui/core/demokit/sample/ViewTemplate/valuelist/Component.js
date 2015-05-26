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
			var sMetadataUri,
				oMockServer,
				sMockServerBaseUri
					= "test-resources/sap/ui/core/demokit/sample/ViewTemplate/valuelist/data/",
				oModel,
				sServiceUri = "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/",
				oUriParameters = jQuery.sap.getUriParameters(),
				sClient = oUriParameters.get("sap-client"),
				sValueList = oUriParameters.get("sap-value-list");

			if (oUriParameters.get("realOData") !== "true") {
				oMockServer = new MockServer({rootUri : sServiceUri});
				oMockServer.simulate(sMockServerBaseUri + "metadata.xml", {
					sMockdataBaseUrl : sMockServerBaseUri,
					bGenerateMissingMockData : false
				});
				// mock server only simulates $metadata request without query parameters
				oMockServer.getRequests().some(function (oRequest) {
					if (jQuery.sap.startsWith(oRequest.path.source, "\\$metadata")) {
						oRequest.path = /\$metadata$/;
						return true;
					}
				});
				oMockServer.start();
				// yet another mock server to handle value list requests
				new MockServer({
					requests : [{ // mock server responses for value list requests
						valueList : "none",
						response : "metadata_none.xml"
					}, {
						valueList : "FAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer",
						response : "metadata_ItemCustomer.xml"
					}, {
						valueList : "FAR_CUSTOMER_LINE_ITEMS.Item%2FCompanyCode",
						response : "metadata_ItemCompanyCode.xml"
					}].map(function (oMockData) {
						return {
							method : "GET",
							//TODO have MockServer fixed and pass just the URL!
							path : new RegExp(MockServer.prototype
								._escapeStringForRegExp(sServiceUri + "$metadata?sap-value-list="
									+ oMockData.valueList)),
							response : function (oXHR) {
								oXHR.respondFile(200, {}, sMockServerBaseUri + oMockData.response);
							}
						};
					})
				}).start();
			} else {
				if (sClient) {
					sServiceUri += "?sap-client=" + sClient;
				}
				if (location.hostname === "localhost") { // for local testing prefix with proxy
					sServiceUri = "proxy" + sServiceUri;
				}
			}
			oModel = new ODataModel(sServiceUri, {
				metadataUrlParams : sValueList ? {"sap-value-list" : sValueList} : undefined,
				useBatch : false // make network trace easier to read
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
