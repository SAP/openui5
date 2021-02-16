/*!
 * ${copyright}
 */
/* Provides a sandbox for this component:
 * For the "realOData" (realOData=true/proxy) case when the component runs with
 * backend, the v2.ODataModel constructor is wrapped so that the URL is adapted to a proxy URL
 * For the case realOData=false a mockserver will be set up. Unknown values default to false.
 */
sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (ODataModel, TestUtils, sinon) {
	"use strict";

	var oMockData = {
			mFixture : {
				"$metadata" : {
					source : "metadata.xml"
				},
				"$metadata?sap-language=EN" : {
					source : "metadata.xml"
				},
				"ProductSet?$skip=0&$top=5&$inlinecount=allpages" : {
					source : "ProductSet_0_5.json"
				}
			},
			aRegExpFixture : []
		};

	return ODataModel.extend("sap.ui.core.internal.samples.odata.v2.Products.SandboxModel", {
		constructor : function (mParameters) {
			var oModel, oSandbox;

			if (!TestUtils.isRealOData()) {
				oSandbox = sinon.sandbox.create();
				TestUtils.setupODataV4Server(oSandbox, oMockData.mFixture,
					"sap/ui/core/internal/samples/odata/v2/Products/data",
					"/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/", oMockData.aRegExpFixture);
			} else {
				mParameters = Object.assign({}, mParameters, {
					serviceUrl : TestUtils.proxy(mParameters.serviceUrl)
				});
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