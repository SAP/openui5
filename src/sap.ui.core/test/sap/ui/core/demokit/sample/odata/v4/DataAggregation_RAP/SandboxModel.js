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

	// Note: DO NOT reuse the same source file with a different $top if that leads to a short read!
	var oMockData = {
			sFilterBase : "/sap/opu/odata4/sap/zsadl_anly_flight_v4/srvd/sap/zsadl_anly_flight/0001/",
			mFixture : {
			},
			sSourceBase : "sap/ui/core/sample/odata/v4/DataAggregation_RAP/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.DataAggregation_RAP.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
