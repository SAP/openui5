sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	'sap/ui/demo/mock/qunit/SampleTester'
], function(createAndAppendDiv, SampleTester) {
	"use strict";

	createAndAppendDiv("content");

	new SampleTester(
		'sap.ui.core',
		[
			'sap.ui.core.sample.View.async', // fails due to delayed rendering cycle
			'sap.ui.core.sample.ViewTemplate.scenario', // fails due to annotations
			'sap.ui.core.sample.ViewTemplate.scenario.extension', // fails due to annotations
			'sap.ui.core.sample.ViewTemplate.tiny', // fails due to the need for a proxy
			// the following apps all fail due to issue about coexistence of mockserver and
			// sinon.FakeXMLHttpRequest, see also BCP: 1680005252
			'sap.ui.core.sample.ViewTemplate.types',
			'sap.ui.core.sample.odata.v4.ConsumeV2Service',
			'sap.ui.core.sample.odata.v4.ListBinding',
			'sap.ui.core.sample.odata.v4.SalesOrders',
			'sap.ui.core.sample.odata.v4.SalesOrdersTemplate',
			'sap.ui.core.sample.odata.v4.SalesOrderTP100_V2',
			'sap.ui.core.sample.odata.v4.SalesOrderTP100_V4',
			'sap.ui.core.sample.HyphenationAPI' // seems to fail due to WebAssembly trying to allocate memory after test destroyed, BCP: 1880639167
		]
	).placeAt('content');

});
