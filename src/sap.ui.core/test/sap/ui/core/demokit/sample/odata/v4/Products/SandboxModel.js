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
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			mFixture : {
				"/sap/opu/odata4/sap/zui5_testv4/default/iwbep/common/0001/$metadata" : {
					source : "common_metadata.xml"
				},
				"ProductList('H-1001')?custom-option=value&$select=CurrencyCode,Messages,Name,Price,ProductID,WeightMeasure,WeightUnit" : {
					source : "ProductList('H-1001').json"
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
					message : {
						"error" : {
							"code" : "/IWBEP/CM_V4_GWS/005",
							"message" : "Error occurred while processing the request",
							"details" : [{
								"code" : "SEPM_BO_COMMON/032",
								"message" : "Value 'H-100' is not unique",
								"target" : "ProductID",
								"@Common.numericSeverity" : 4
							}]
						}
					}
				}, {
					code : 200,
					source : "ProductList('H-1001').json"
				}]
			},
			sSourceBase : "sap/ui/core/sample/odata/v4/Products/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.Products.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
