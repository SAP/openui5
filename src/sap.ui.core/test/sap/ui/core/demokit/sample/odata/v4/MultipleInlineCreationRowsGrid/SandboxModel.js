/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model so that we can modify model
// parameters via query options.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {};

	return ODataModel.extend(
		"sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
