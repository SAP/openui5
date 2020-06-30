sap.ui.define(
	[
		"sap/ui/model/odata/v4/ODataModel",
		"sap/ui/model/odata/OperationMode",
		"sap/ui/test/TestUtils",
		"sap/ui/thirdparty/sinon"
	],
	function (ODataModel, OperationMode, TestUtils, sinon) {
		"use strict";
		/* CONSTANTS */
		var sSourceBase = "sap/ui/mdc/demokit/apps/table",
			oMetaModelConfig = {
				mFixture: {
					"Product": { source: "ProductList.json" },
					"$metadata": { source: "metadata.xml" }
				},
				sServiceUrl: "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/"
			};

		function createModel(oSandbox, oConfig) {
			TestUtils.setupODataV4Server(oSandbox, oConfig.mFixture, sSourceBase, oConfig.sServiceUrl);
			return new ODataModel({ operationMode: OperationMode.Server, serviceUrl: oConfig.sServiceUrl, synchronizationMode: "None" });
		}

		function createModelWithSandbox(oConfig) {
			var oSandbox = sinon.sandbox.create(),
				oModel = createModel(oSandbox, oConfig),
				fnOrgDestroy = oModel.destroy.bind(oModel);
			oModel.destroy = function() {
				fnOrgDestroy();
				oSandbox.verifyAndRestore();
			};
			return oModel;
		}

		return {
			createModelForConfig: createModelWithSandbox,
			createMetaModel: function() {
				return createModelWithSandbox(oMetaModelConfig);
			}
		};

	}
);
