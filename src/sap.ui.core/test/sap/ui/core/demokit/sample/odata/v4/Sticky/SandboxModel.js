/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			sFilterBase : "/sap/opu/odata4/sap/zrc_rap_sticky/srvd/sap/zrc_rap_sticky/0001/",
			mFixture : {
				"GET Sticky?$count=true&$select=Content,Id&$skip=0&$top=5" : {
					message : {
						"@odata.count" : "1",
						value : [{
							Id : "10",
							Content : "Test Data 10"
						}]
					}
				},
				"GET Sticky('10')?$select=Content,Id" : {
					message : {
						Id : "10",
						Content : "Test Data 10"
					}
				},
				"PATCH Sticky('10')" : [{
					headers : {"SAP-ContextId" : "session1"},
					ifMatch : function (oRequest) {
						return oRequest.requestHeaders["SAP-ContextId"] === "session1";
					},
					message : {
						Id : "10",
						Content : "returned from server"
					}
				}, {
					code : 400,
					headers : {"Content-Type" : "text/plain"},
					message : "PATCH request w/o SAP-ContextId header"
				}],
				"POST Sticky('10')/com.sap.gateway.srvd.zrc_rap_sticky.v0001.PrepareForEdit" : {
					headers : {"SAP-ContextId" : "session1"},
					message : {
						Id : "10",
						Content : "prepared for edit"
					}
				}
			},
			sSourceBase : "sap/ui/core/sample/odata/v4/Sticky/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.Sticky.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
