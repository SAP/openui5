/*!
 * ${copyright}
 */

// Provides a sandbox model for this component
sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (ODataModel, TestUtils, sinon) {
	"use strict";

	function SandboxModel(mParameters) {
		var oModel,
			oSandbox = sinon.sandbox.create();

		TestUtils.useFakeServer(oSandbox, "sap/ui/core/sample/odata/types/v2/Time/data", {
				"/sap/demo/ZUI5_EDM_TYPES/EdmTypesCollection(ID='1')" : {
					source : "EdmTypesV2.json"
				}
			},
			/*aRegExpFixture*/[{
				regExp : /GET .*\/\$metadata/,
				response : {
					source : "metadataV2.xml"
				}
			}], "/sap/demo/ZUI5_EDM_TYPES/");

		oModel = new ODataModel(mParameters);
		oModel.restoreSandbox = () => {
			oSandbox?.restore();
			oSandbox = undefined;
		};

		return oModel;
	}
	SandboxModel.getMetadata = ODataModel.getMetadata;

	return SandboxModel;
});
