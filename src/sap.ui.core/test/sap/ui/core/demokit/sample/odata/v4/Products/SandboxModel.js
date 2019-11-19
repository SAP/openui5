/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// For the "realOData" case, the URL is adapted to a proxy URL and certain constructor parameters
// are taken from URL parameters.
// For the "non-realOData" case, a mock server for the backend requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			mFixture : {
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
			},
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			sSourceBase : "sap/ui/core/sample/odata/v4/Products/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.Products.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});