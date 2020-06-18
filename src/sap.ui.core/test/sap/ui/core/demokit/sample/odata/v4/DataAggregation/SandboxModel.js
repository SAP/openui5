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
				"$metadata" : {
					source : "metadata.xml"
				},
				"BusinessPartners?$apply=groupby((Region),aggregate(SalesAmount))/orderby(Region%20desc)&$count=true&$skip=0&$top=10" : {
					source : "BusinessPartners_L1_top10.json"
				},
				"BusinessPartners?$apply=filter(Region%20eq%20'West')/groupby((AccountResponsible),aggregate(SalesAmount,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=10" : {
					source : "BusinessPartners_Region_West_top10.json"
				},
				"BusinessPartners?$apply=groupby((Region),aggregate(SalesAmount))/orderby(Region%20desc)&$count=true&$skip=10&$top=4" : {
					source : "BusinessPartners_L1_skip10_top4.json"
				},
				"BusinessPartners?$apply=filter(Region%20eq%20'East')/groupby((AccountResponsible),aggregate(SalesAmount,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=10" : {
					source : "BusinessPartners_Region_East_top10.json"
				}
			},
			sFilterBase : "/serviceroot.svc/",
			sSourceBase : "sap/ui/core/sample/odata/v4/DataAggregation/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.DataAggregation.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});