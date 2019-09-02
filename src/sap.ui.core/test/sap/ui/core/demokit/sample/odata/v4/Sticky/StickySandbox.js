/*!
 * ${copyright}
 */

// Provides a sandbox for this component:
// For the "realOData" case when the component runs with backend, the v4.ODataModel constructor
//   is wrapped so that the URL is adapted to a proxy URL and certain constructor parameters are
//   taken from URL parameters
// For the "non-realOData" case, sets up a mock server for the backend requests.
//
// Note: For setup to work properly, this module has to be loaded *before* model instantiation
//   from the component's manifest. Add it as "js" resource to sap.ui5/resources in the
//   manifest.json to achieve that.
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (UriParameters, TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function setupMockServer() {
		TestUtils.setupODataV4Server(oSandbox, {
				"$metadata" : {
					source : "metadata.xml"
				},
				"GET Sticky?$count=true&$select=Content,Id&$skip=0&$top=5" : {
					source : "Sticky_Skip0_Top5.json"
				},

				"GET Sticky('10')?$select=Content,Id" : {
					source : "Sticky(10)_refresh.json"
				},
				"PATCH Sticky('10')" : [{
					headers : {"SAP-ContextId" : "session1"},
					ifMatch : function (oRequest) {
						return oRequest.requestHeaders["SAP-ContextId"] === "session1";
					},
					source : "PATCH-Sticky(10)_with_some_input.json"
				}, {
					code : 400,
					headers : {"Content-Type" : "text/plain"},
					message: "PATCH request w/o SAP-ContextId header"
				}],
				"POST Sticky('10')/com.sap.gateway.srvd.zrc_rap_sticky.v0001.PrepareForEdit" : {
					headers : {"SAP-ContextId" : "session1"},
					source : "Sticky(10)_PrepareForEdit.json"
				}
			}, "sap/ui/core/sample/odata/v4/Sticky/data",
			"/sap/opu/odata4/sap/zrc_rap_sticky/srvd/sap/zrc_rap_sticky/0001/");
	}

	function adaptModelConstructor() {
		var Constructor = sap.ui.model.odata.v4.ODataModel;

		oSandbox.stub(sap.ui.model.odata.v4, "ODataModel", function (mParameters) {
			var b$Direct = UriParameters.fromQuery(window.location.search).has("$direct");

			// clone: do not modify constructor call parameter
			mParameters = Object.assign({}, mParameters, {
				groupId : b$Direct ? "$direct" : "$auto",
				serviceUrl : TestUtils.proxy(mParameters.serviceUrl),
				updateGroupId : b$Direct ? "$direct" : "$auto"
			});
			return new Constructor(mParameters);
		});
	}

	if (TestUtils.isRealOData()) {
		adaptModelConstructor();
	} else {
		setupMockServer();
	}

	TestUtils.setData("sap.ui.core.sample.odata.v4.Sticky.sandbox", oSandbox);
});