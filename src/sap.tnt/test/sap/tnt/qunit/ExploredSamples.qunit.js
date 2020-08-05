sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	'sap/ui/demo/mock/qunit/SampleTester'
], function(createAndAppendDiv, SampleTester) {
	"use strict";

	createAndAppendDiv("content");

	new SampleTester('sap.tnt', [] /*Excludes*/).placeAt('content');

});
