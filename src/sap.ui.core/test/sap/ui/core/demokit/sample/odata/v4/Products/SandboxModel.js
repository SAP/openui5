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
				"ProductList('H-1001')?custom-option=value&$select=CurrencyCode,Messages,Name,Price,ProductID,WeightMeasure,WeightUnit" : {
					source : "ProductList('H-1001').json"
				},
				"ProductList?custom-option=value&$count=true&$select=CurrencyCode,Messages,Name,Price,ProductID,WeightMeasure,WeightUnit&$skip=0&$top=5" : {
					source : "ProductList.json"
				},
				"POST ProductList?custom-option=value" : [{
					code : 400,
					ifMatch : /,"ProductID":"H-100",/g,
					message : {
						error : {
							code : "/IWBEP/CM_V4_GWS/005",
							message : "Error occurred while processing the request",
							details : [{
								code : "SEPM_BO_COMMON/032",
								message : "Value 'H-100' is not unique",
								target : "ProductID",
								"@Common.numericSeverity" : 4
							}]
						}
					}
				}, {
					code : 200,
					source : "ProductList('H-1001').json"
				}]
			},
			aRegExps : [{
				regExp : /^GET [\w\/]+\/zui5_epm_sample\/0002\/\$metadata\?custom-option=value\&sap-language=..$/,
				response : {source : "metadata.xml"}
			}, {
				regExp : /^GET [\w\/]+\/common\/0001\/\$metadata\?sap-language=..$/,
				response : {source : "common_metadata.xml"}
			}, {
				regExp : /^GET [\w\/]+\/common\/0001\/Currencies\?sap-language=..&\$select=CurrencyCode,DecimalPlaces,Text,ISOCode$/,
				response : {source : "Currencies.json"}
			}, {
				regExp : /^GET [\w\/]+\/common\/0001\/UnitsOfMeasure\?sap-language=..&\$select=ExternalCode,DecimalPlaces,Text,ISOCode$/,
				response : {source : "UnitsOfMeasure.json"}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/Products/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.Products.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
