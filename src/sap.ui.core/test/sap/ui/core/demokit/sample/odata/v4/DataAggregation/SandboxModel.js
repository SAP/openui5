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
				"BusinessPartners?$apply=groupby((Country),aggregate(SalesAmount))/orderby(Country%20desc)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_L1_top5.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'Germany')/groupby((Region),aggregate(SalesAmount))/orderby(Region%20desc)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Country_Germany_top5.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'Germany')/groupby((Region),aggregate(SalesAmount))/orderby(Region%20desc)&$count=true&$skip=5&$top=2" : {
					source : "BusinessPartners_Country_Germany_skip5_top2.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'Germany'%20and%20Region%20eq%20'Baden-W%C3%BCrttemberg')/groupby((Segment),aggregate(SalesAmount))/orderby(Segment)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Country_Germany_Region_BW_top5.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'Germany'%20and%20Region%20eq%20'Baden-W%C3%BCrttemberg'%20and%20Segment%20eq%20'Mid-size')/groupby((AccountResponsible),aggregate(SalesAmount,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Country_Germany_Region_BW_Segment_MidSize_top5.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'Germany'%20and%20Region%20eq%20'Baden-W%C3%BCrttemberg'%20and%20Segment%20eq%20'Small')/groupby((AccountResponsible),aggregate(SalesAmount,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Country_Germany_Region_BW_Segment_Small_top5.json"
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