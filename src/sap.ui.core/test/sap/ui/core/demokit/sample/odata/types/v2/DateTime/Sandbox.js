/*!
 * ${copyright}
 */

// Provides a sandbox for this component
sap.ui.define([
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function setupMockServer() {
		TestUtils.useFakeServer(oSandbox, "sap/ui/core/sample/odata/types/v2/DateTime/data", {
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
	}

	setupMockServer();
	TestUtils.setData("sap.ui.core.sample.odata.types.v2.DateTime.sandbox", oSandbox);
});
