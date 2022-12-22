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
		TestUtils.setupODataV4Server(oSandbox, {
				"EdmTypesCollection('1')?$select=Date,EndDate,ID": {
					source: "EdmTypesV4.json"
				}
			},
			"sap/ui/core/sample/odata/types/v4/Date/data",
			"/sap/demo/zui5_edm_types_v4/",
			/*aRegExpFixture*/[{
				regExp: /GET .*\/\$metadata/,
				response: {
					source: "metadataV4.xml"
				}
			}]);
	}

	setupMockServer();
	TestUtils.setData("sap.ui.core.sample.odata.types.v4.Date.sandbox", oSandbox);
});
