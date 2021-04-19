/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// For the "realOData" case, the URL is adapted to a proxy URL and certain constructor parameters
// are taken from URL parameters.
// For the "non-realOData" case, a mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	// Note: DO NOT reuse the same source file with a different $top if that leads to a short read!
	var oMockData = {
			mFixture : {
				"$metadata" : {
					source : "metadata.xml"
				},
				"BusinessPartners?$apply=concat(aggregate(SalesAmountLocalCurrency,LocalCurrency),groupby((Country,CountryText),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(CountryText%20desc)/concat(aggregate($count%20as%20UI5__count),top(4)))" : {
					source : "BusinessPartners_L1.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'3')/groupby((Region,RegionText),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(RegionText%20desc)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_top5.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'3')/groupby((Region,RegionText),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(RegionText%20desc)&$skip=5&$top=2" : {
					source : "BusinessPartners_Germany_skip5.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'3'%20and%20Region%20eq%20'1')/groupby((Segment),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Segment)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_BW.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'3'%20and%20Region%20eq%20'1'%20and%20Segment%20eq%20'Small')/groupby((AccountResponsible),aggregate(SalesAmountLocalCurrency,LocalCurrency,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_BW_Small.json"
				},
				"BusinessPartners?$apply=filter(RegionText%20gt%20'M')/concat(aggregate(SalesAmountLocalCurrency,LocalCurrency),groupby((Country,CountryText),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(CountryText%20desc)/concat(aggregate($count%20as%20UI5__count),top(4)))" : {
					source : "BusinessPartners_M_L1.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'3'%20and%20(RegionText%20gt%20'M'))/groupby((Region,RegionText),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(RegionText%20desc)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_M_Germany.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'3'%20and%20Region%20eq%20'6'%20and%20(RegionText%20gt%20'M'))/groupby((Segment),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Segment)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_Saxony.json"
				},
				"BusinessPartners?$apply=filter(Country%20eq%20'3'%20and%20Region%20eq%20'6'%20and%20Segment%20eq%20'Small'%20and%20(RegionText%20gt%20'M'))/groupby((AccountResponsible),aggregate(SalesAmountLocalCurrency,LocalCurrency,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_Saxony_Small.json"
				}
			},
			sFilterBase : "/serviceroot.svc/",
			sSourceBase : "sap/ui/core/sample/odata/v4/DataAggregation/data"
		};

	/*
	 * Adds duplicate entries to fixture where old substring of URL is replaced by new one.
	 *
	 * @param {string} sOld - old substring to match
	 * @param {string} sNew - new replacement substring
	 */
	function duplicate(sOld, sNew) {
		Object.keys(oMockData.mFixture).forEach(function (sOldUrl) {
			oMockData.mFixture[sOldUrl.replace(sOld, sNew)] = oMockData.mFixture[sOldUrl];
		});
	}

	// for simplicity, accept minor differences due to position of grand total row
	duplicate("$top=5", "$top=4");

	return ODataModel.extend("sap.ui.core.sample.odata.v4.DataAggregation.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});