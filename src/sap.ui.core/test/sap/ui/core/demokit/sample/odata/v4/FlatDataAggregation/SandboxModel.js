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
			"BusinessPartners?$apply=groupby((Region),aggregate(SalesNumber))/filter(SalesNumber%20gt%200)/orderby(Region%20desc)/concat(aggregate(SalesNumber,$count%20as%20UI5__count),top(0))" : {
				source : "BusinessPartners_0_1.json"
			},
			"BusinessPartners?$apply=groupby((Region),aggregate(SalesNumber))/filter(SalesNumber%20gt%200)/orderby(Region%20desc)/concat(aggregate(SalesNumber,$count%20as%20UI5__count),top(4))" : {
				source : "BusinessPartners_0_5.json"
			},
			"BusinessPartners?$apply=groupby((Region),aggregate(SalesNumber))/filter(SalesNumber%20gt%200)/orderby(Region%20desc)/concat(aggregate(SalesNumber,$count%20as%20UI5__count),top(9))" : {
				source : "BusinessPartners_0_10.json"
			},
			"BusinessPartners?$apply=groupby((Region),aggregate(SalesNumber))/filter(SalesNumber%20gt%200)/orderby(Region%20desc)/concat(aggregate(SalesNumber,$count%20as%20UI5__count),top(14))" : {
				source : "BusinessPartners_0_15.json"
			},
			"BusinessPartners?$apply=groupby((Region),aggregate(SalesNumber))/filter(SalesNumber%20gt%200)/orderby(Region%20desc)/skip(1)/top(4)" : {
				source : "BusinessPartners_2_6.json"
			},
			"BusinessPartners?$apply=groupby((Region),aggregate(SalesNumber))/filter(SalesNumber%20gt%200)/orderby(Region%20desc)/skip(4)/top(5)" : {
				source : "BusinessPartners_5_10.json"
			},
			"BusinessPartners?$apply=groupby((Region),aggregate(SalesNumber))/filter(SalesNumber%20gt%200)/orderby(Region%20desc)/skip(9)/top(5)" : {
				source : "BusinessPartners_10_15.json"
			}
		},
		sFilterBase : "/serviceroot.svc/",
		sSourceBase : "sap/ui/core/sample/odata/v4/FlatDataAggregation/data"
	};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.FlatDataAggregation.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});