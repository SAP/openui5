/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// For the "realOData" case, the URL is adapted to a proxy URL and certain constructor parameters
// are taken from URL parameters.
// For the "non-realOData" case, a mock server for the backend requests is set up.
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon-4"
], function (UriParameters, ODataModel, TestUtils, sinon) {
	"use strict";

	var mFixture = {
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
		};

	function adaptParameters(mParameters) {
		var oUriParameters = UriParameters.fromQuery(window.location.search),
			sUpdateGroupId = oUriParameters.get("updateGroupId");

		if (!TestUtils.isRealOData() && !sUpdateGroupId) {
			return mParameters;
		}

		// clone: do not modify constructor call parameter
		mParameters = Object.assign({}, mParameters, {
			earlyRequests : oUriParameters.get("earlyRequests") !== "false",
			groupId : oUriParameters.get("$direct") ? "$direct" : mParameters.groupId,
			serviceUrl : TestUtils.proxy(mParameters.serviceUrl),
			updateGroupId : sUpdateGroupId || mParameters.updateGroupId
		});

		return mParameters;
	}

	return ODataModel.extend("sap.ui.core.sample.odata.v4.Sticky.SandboxModel", {
		constructor : function (mParameters) {
			var oModel, oSandbox;

			if (!TestUtils.isRealOData()) {
				oSandbox = sinon.sandbox.create();
				TestUtils.setupODataV4Server(oSandbox, mFixture,
					"sap/ui/core/sample/odata/v4/Sticky/data",
					"/sap/opu/odata4/sap/zrc_rap_sticky/srvd/sap/zrc_rap_sticky/0001/");
			}

			oModel = new ODataModel(adaptParameters(mParameters));
			oModel.destroy = function () {
				if (oSandbox) {
					oSandbox.restore();
					oSandbox = undefined;
				}
				return ODataModel.prototype.destroy.apply(this, arguments);
			};
			return oModel;
		}
	});
});