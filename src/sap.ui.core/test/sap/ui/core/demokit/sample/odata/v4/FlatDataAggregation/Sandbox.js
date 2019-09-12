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
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (jQuery, ODataModel, TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function setupMockServer() {
		TestUtils.setupODataV4Server(oSandbox, {
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
		}, "sap/ui/core/sample/odata/v4/FlatDataAggregation/data",
		"/serviceroot.svc/");
	}

	function adaptModelConstructor() {
		oSandbox.stub(sap.ui.model.odata.v4, "ODataModel", function (mParameters) {
			// clone: do not modify constructor call parameter
			mParameters = jQuery.extend({}, mParameters, {
				serviceUrl : TestUtils.proxy(mParameters.serviceUrl)
			});
			return new ODataModel(mParameters);
		});
	}

	if (TestUtils.isRealOData()) {
		adaptModelConstructor();
	} else {
		setupMockServer();
	}

	TestUtils.setData("sap.ui.core.sample.odata.v4.FlatDataAggregation.sandbox", oSandbox);
});