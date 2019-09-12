/*!
 * ${copyright}
 */

// Provides a sandbox for this component:
// For the "realOData" case when the component runs with backend, the v4.ODataModel constructor
//   is wrapped so that the URL is adapted to a proxy URL and certain constructor parameters are
//   taken from URL parameters
// For the "non-realOData" case, sets up a mock server for the backend requests.
//
// Note: For setup to work properly, this module has to be loaded *before* model instantiation
//   from the component's manifest. Add it as "js" resource to sap.ui5/resources in the
//   manifest.json to achieve that.
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (UriParameters, TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function setupMockServer() {
		TestUtils.setupODataV4Server(oSandbox, {
				"$metadata?custom-option=value" : {
					source : "metadata.xml"
				},
				"/sap/opu/odata4/sap/zui5_testv4/default/iwbep/common/0001/$metadata" : {
					source : "common_metadata.xml"
				},
				"ProductList('H-1001')?custom-option=value&$select=CurrencyCode,Messages,Name,Price,ProductID,WeightMeasure,WeightUnit" : {
					source : "ProductList(H-1001).json"
				},
				"ProductList?custom-option=value&$count=true&$select=CurrencyCode,Messages,Name,Price,ProductID,WeightMeasure,WeightUnit&$skip=0&$top=5" : {
					source : "ProductList.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/default/iwbep/common/0001/Currencies?$select=CurrencyCode,DecimalPlaces,Text,ISOCode" : {
					source : "Currencies.json"
				},
				"/sap/opu/odata4/sap/zui5_testv4/default/iwbep/common/0001/UnitsOfMeasure?$select=ExternalCode,DecimalPlaces,Text,ISOCode" : {
					source : "UnitsOfMeasure.json"
				},
				"POST ProductList?custom-option=value" : [{
					code : 400,
					ifMatch : /,"ProductID":"H-100",/g,
					source : "POST-ProductList('H-100').Error.json"
				}, {
					code : 200,
					source : "POST-ProductList('H-1001').json"
				}]
			}, "sap/ui/core/sample/odata/v4/Products/data",
			"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/");
	}

	function adaptModelConstructor() {
		var Constructor = sap.ui.model.odata.v4.ODataModel;

		oSandbox.stub(sap.ui.model.odata.v4, "ODataModel", function (mParameters) {
			var b$Direct = UriParameters.fromQuery(window.location.search).has("$direct");

			// clone: do not modify constructor call parameter
			mParameters = Object.assign({}, mParameters, {
				groupId : b$Direct ? "$direct" : "$auto",
				serviceUrl : TestUtils.proxy(mParameters.serviceUrl),
				updateGroupId : b$Direct ? "$direct" : "$auto"
			});
			return new Constructor(mParameters);
		});
	}

	if (TestUtils.isRealOData()) {
		adaptModelConstructor();
	} else {
		setupMockServer();
	}

	TestUtils.setData("sap.ui.core.sample.odata.v4.Products.sandbox", oSandbox);
});