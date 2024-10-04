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
		mFixture : {
		},
		sFilterBase : "/analytics/",
		sSourceBase : "sap/ui/core/sample/odata/v4/FlatDataAggregation/data"
	};

	function SandboxModel(mParameters) {
		return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
	}
	SandboxModel.getMetadata = ODataModel.getMetadata;

	return SandboxModel;
});
