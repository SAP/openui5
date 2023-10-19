/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to show separate loading of value lists for UI5 controls
 *   which request value help from a UI5 ODataModel.
 * @version @version@
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/mvc/XMLView", // type : ViewType.XML
	"sap/ui/core/sample/common/Component",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils"
], function (Log, _View, _XMLView, BaseComponent, MockServer, JSONModel,
		ODataModel, TestUtils) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType

	return BaseComponent.extend("sap.ui.core.sample.ViewTemplate.valuelist.Component", {
		metadata : "json",

		createContent : function () {
			var sMockServerBaseUri
					= "test-resources/sap/ui/core/demokit/sample/ViewTemplate/valuelist/data/",
				oModel,
				sServiceUri = "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/",
				oUriParameters = new URLSearchParams(window.location.search),
				sClient = oUriParameters.get("sap-client"),
				sValueList = oUriParameters.get("sap-value-list");

			if (TestUtils.isRealOData()) {
				if (sClient) {
					sServiceUri += "?sap-client=" + sClient;
				}
			} else {
				this.aMockServers.push(new MockServer({rootUri : sServiceUri}));
				this.aMockServers[0].simulate(sMockServerBaseUri + (sValueList === "none" ?
						"metadata_none.xml" : "metadata.xml"), {
					sMockdataBaseUrl : sMockServerBaseUri,
					bGenerateMissingMockData : false
				});
				// mock server only simulates $metadata request without query parameters
				this.aMockServers[0].getRequests().some(function (oRequest) {
					if (oRequest.path.source.startsWith("\\$metadata")) {
						oRequest.path = /\$metadata$/;
						return true;
					}
				});
				this.aMockServers[0].start();

				// yet another mock server to handle value list requests
				this.aMockServers.push(new MockServer({
					requests : [{ // mock server responses for value list requests
						valueList : "none",
						response : "metadata_none.xml"
					}, {
						valueList : "FAR_CUSTOMER_LINE_ITEMS.Item%2FCompanyCode"
							+ ",FAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer",
						response : "metadata_ItemCompanyCode_ItemCustomer.xml"
					}, {
						valueList : "FAR_CUSTOMER_LINE_ITEMS.VL_SH_DEBIA%2FLAND1",
						response : "metadata_VL_SH_DEBIALAND1.xml"
					}, {
						valueList : "FAR_CUSTOMER_LINE_ITEMS.VL_SH_H_T001%2FWAERS",
						response : "metadata_VL_SH_H_T001WAERS.xml"
					}].map(function (oMockData) {
						return {
							method : "GET",
							//TODO: have MockServer fixed and pass just the URL!
							path :  new RegExp(MockServer.prototype
								._escapeStringForRegExp(sServiceUri + "$metadata?sap-value-list="
									+ oMockData.valueList)),
							response : function (oXHR) {
								Log.debug("Mocked response sent:" + oXHR.url, null,
									"sap.ui.core.sample.ViewTemplate.valuelist.Component");
								oXHR.respondFile(200, {}, sMockServerBaseUri + oMockData.response);
							}
						};
					})
				}));
				this.aMockServers[1].start();
				if (sValueList === "none") {
					// yet another mock server to handle value list data requests
					this.aMockServers.push(new MockServer({
						requests : [{
							param : "VL_SH_H_T001/$count"
						}, {
							param : "VL_SH_H_T001?$skip=0&$top=100",
							response : "VL_SH_H_T001.json"
						}, {
							param : "VL_SH_DEBIA/$count"
						}, {
							param : "VL_SH_DEBIA?$skip=0&$top=100",
							response : "VL_SH_DEBIA.json"
						}, {
							param : "VL_SH_DEBID/$count"
						}, {
							param : "VL_SH_DEBID?$skip=0&$top=100",
							response : "VL_SH_DEBID.json"
						}, {
							param : "VL_CT_TCURC/$count"
						}, {
							param : "VL_CT_TCURC?$skip=0&$top=100",
							response : "VL_CT_TCURC.json"
						}, {
							param : "VL_SH_FARP_T005/$count"
						}, {
							param : "VL_SH_FARP_T005?$skip=0&$top=100",
							response : "VL_SH_FARP_T005.json"
						}].map(function (oMockData) {
							return {
								method : "GET",
								path : new RegExp(MockServer.prototype
									._escapeStringForRegExp(sServiceUri + oMockData.param)),
								response : function (oXHR) {
									Log.debug("Mocked response sent:" + oXHR.url, null,
										"sap.ui.core.sample.ViewTemplate.valuelist.Component");
									if  (oMockData.response){
										oXHR.respondFile(200, {}, sMockServerBaseUri +
											oMockData.response);
									} else {
										oXHR.respond(204, {}, "100");
									}
								}
							};
						})
					}));
					this.aMockServers[2].start();
				}
			}
			oModel = new ODataModel(sServiceUri, {
				metadataUrlParams : sValueList ? {"sap-value-list" : sValueList} : undefined,
				useBatch : false // make network trace easier to read
			});
			return _XMLView.create({
				models : {
					undefined : oModel,
					ui : new JSONModel({valueHelpDetails : false})
				},
				viewName : "sap.ui.core.sample.ViewTemplate.valuelist.Main"
			});
		}
	});
});
