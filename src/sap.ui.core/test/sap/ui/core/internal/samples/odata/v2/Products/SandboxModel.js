/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V2 model for the following purposes:
// For the "non-realOData" case, a mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (ODataModel, TestUtils, sinon) {
	"use strict";

	var oMockData = {
			mFixture : {
				"ProductSet?customAll='custom%2Fall'&customService='custom%2Fservice'&$skip=0&$top=5&$inlinecount=allpages" :
				{
					source : "ProductSet_0_5.json"
				},
				"SAP__Currencies?customAll='custom%2Fall'&customService='custom%2Fservice'&$skip=0&$top=5000" : {
					source : "../../data/SAP__Currencies.json"
				},
				"SAP__UnitsOfMeasure?customAll='custom%2Fall'&customService='custom%2Fservice'&$skip=0&$top=5000" : {
					source : "../../data/SAP__UnitsOfMeasure.json"
				}
			},
			aRegExpFixture : [{
				regExp : /\/sap\/opu\/odata\/sap\/ZUI5_GWSAMPLE_BASIC\/\$metadata/,
				response : {
					source : "metadata.xml"
				}
			}]
		};

	return ODataModel.extend("sap.ui.core.internal.samples.odata.v2.Products.SandboxModel", {
		constructor : function (mParameters) {
			var oModel, oSandbox;

			if (!TestUtils.isRealOData()) {
				oSandbox = sinon.sandbox.create();
				TestUtils.setupODataV4Server(oSandbox, oMockData.mFixture,
					"sap/ui/core/internal/samples/odata/v2/Products/data",
					"/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/", oMockData.aRegExpFixture);
			}

			oModel = new ODataModel(mParameters);
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