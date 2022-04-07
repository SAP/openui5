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

	// Note: DO NOT reuse the same source file with a different $top if that leads to a short read!
	var oMockData = {
			sFilterBase : "/odata/v4/sap.fe.managepartners.ManagePartnersService/",
			mFixture : {
				"BusinessPartners?$apply=concat(aggregate(SalesAmountLocalCurrency,LocalCurrency),groupby((Country_Code,Country),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Country%20desc)/concat(aggregate($count%20as%20UI5__count),top(4)))" : {
					source : "BusinessPartners_L1.json"
				},
				"BusinessPartners?$apply=concat(groupby((AccountResponsible,Country_Code,Region,Segment))/aggregate($count%20as%20UI5__leaves),aggregate(SalesAmountLocalCurrency,LocalCurrency),groupby((Country_Code,Country),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Country%20desc)/concat(aggregate($count%20as%20UI5__count),top(4)))" : {
					source : "BusinessPartners_L1_leaves.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'3')/groupby((Region),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Region%20desc)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_top5.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'3')/groupby((Region),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Region%20desc)&$skip=5&$top=2" : {
					source : "BusinessPartners_Germany_skip5.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'3'%20and%20Region%20eq%20'Baden-W%C3%BCrttemberg')/groupby((Segment),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Segment)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_BW.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'3'%20and%20Region%20eq%20'Baden-W%C3%BCrttemberg'%20and%20Segment%20eq%20'Small')/groupby((AccountResponsible),aggregate(SalesAmountLocalCurrency,LocalCurrency,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_BW_Small.json"
				},
				"BusinessPartners?$apply=filter(Region%20gt%20'M')/concat(aggregate(SalesAmountLocalCurrency,LocalCurrency),groupby((Country_Code,Country),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Country%20desc)/concat(aggregate($count%20as%20UI5__count),top(4)))" : {
					source : "BusinessPartners_M_L1.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'3'%20and%20(Region%20gt%20'M'))/groupby((Region),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Region%20desc)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_M_Germany.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'3'%20and%20Region%20eq%20'Saxony'%20and%20(Region%20gt%20'M'))/groupby((Segment),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Segment)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_Saxony.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'3'%20and%20Region%20eq%20'Saxony'%20and%20Segment%20eq%20'Small'%20and%20(Region%20gt%20'M'))/groupby((AccountResponsible),aggregate(SalesAmountLocalCurrency,LocalCurrency,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_Germany_Saxony_Small.json"
				},
				"BusinessPartners?$apply=filter(Region%20gt%20'M')/search(Carol%20Johnson)/concat(aggregate(SalesAmountLocalCurrency,LocalCurrency),groupby((Country_Code,Country),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Country%20desc)/concat(aggregate($count%20as%20UI5__count),top(4)))" : {
					source : "BusinessPartners_M_Carol.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'UK'%20and%20(Region%20gt%20'M'))/search(Carol%20Johnson)/groupby((Region),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Region%20desc)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_M_Carol_L1.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'UK'%20and%20Region%20eq%20'Wales'%20and%20(Region%20gt%20'M'))/search(Carol%20Johnson)/groupby((Segment),aggregate(SalesAmountLocalCurrency,LocalCurrency))/orderby(Segment)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_M_Carol_L2.json"
				},
				"BusinessPartners?$apply=filter(Country_Code%20eq%20'UK'%20and%20Region%20eq%20'Wales'%20and%20Segment%20eq%20'Large'%20and%20(Region%20gt%20'M'))/search(Carol%20Johnson)/groupby((AccountResponsible),aggregate(SalesAmountLocalCurrency,LocalCurrency,SalesNumber))/orderby(AccountResponsible)&$count=true&$skip=0&$top=5" : {
					source : "BusinessPartners_M_Carol_L3.json"
				}
			},
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
