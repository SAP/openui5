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
			"$metadata?custom-option=value" : {
				source : "metadata.xml"
			},
			"BusinessPartnerList?custom-option=value&$filter=BusinessPartnerID%20lt%20'0100000030'&$select=BusinessPartnerID,CompanyName&$skip=0&$top=21" : {
				source : "BusinessPartnerList_skip0_top21.json"
			},
			"BusinessPartnerList?custom-option=value&$filter=BusinessPartnerID%20lt%20'0100000030'&$select=BusinessPartnerID,CompanyName&$skip=20&$top=22" : {
				source : "BusinessPartnerList_skip20_top22.json"
			},
			"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000030'&$select=BusinessPartnerID,CompanyName&$skip=0&$top=21" : {
				source : "BusinessPartnerList_skip0_top21_count30.json"
			},
			"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000030'&$select=BusinessPartnerID,CompanyName&$skip=20&$top=10" : {
				source : "BusinessPartnerList_skip20_top10_count30.json"
			},
			"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000050'&$select=BusinessPartnerID,CompanyName&$skip=0&$top=121" : {
				source : "BusinessPartnerList_skip0_top21_count50.json"
			},
			"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000050'&$select=BusinessPartnerID,CompanyName&$skip=20&$top=1" : {
				source : "BusinessPartnerList_skip20_top1_count50.json"
			},
			"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000050'&$select=BusinessPartnerID,CompanyName&$skip=21&$top=21" : {
				source : "BusinessPartnerList_skip21_top21_count50.json"
			},
			"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000050'&$select=BusinessPartnerID,CompanyName&$skip=41&$top=1" : {
				source : "BusinessPartnerList_skip41_top1_count50.json"
			},
			"BusinessPartnerList?custom-option=value&$count=true&$filter=BusinessPartnerID%20lt%20'0100000050'&$select=BusinessPartnerID,CompanyName&$skip=42&$top=8" : {
				source : "BusinessPartnerList_skip42_top8_count50.json"
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

	return ODataModel.extend("sap.ui.core.sample.odata.v4.ServerDrivenPaging.SandboxModel", {
		constructor : function (mParameters) {
			var oModel, oSandbox;

			if (!TestUtils.isRealOData()) {
				oSandbox = sinon.sandbox.create();
				TestUtils.setupODataV4Server(oSandbox, mFixture,
					"sap/ui/core/sample/odata/v4/ServerDrivenPaging/data",
					"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/");
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