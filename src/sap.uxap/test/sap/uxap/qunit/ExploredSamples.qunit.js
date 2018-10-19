sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	'sap/ui/demo/mock/qunit/SampleTester'
], function(createAndAppendDiv, SampleTester) {
	"use strict";

	createAndAppendDiv("content");

	new SampleTester('sap.uxap', [
		"sap.uxap.sample.ObjectPageSubSectionSized", // access to outer control 'splitApp'
		"sap.uxap.sample.ObjectPageSubSectionMultiView",  // access to outer control 'splitApp'
		"sap.uxap.sample.ObjectPageState",  // access to outer control 'splitApp'
		"sap.uxap.sample.ObjectPageBlockBase",  // access to outer control 'splitApp'
		"sap.uxap.sample.ProfileObjectPageHeader",  // access to outer control 'splitApp'
		"sap.uxap.sample.ProfileObjectPageHeader",  // access to outer control 'splitApp'
		"sap.uxap.sample.ModeAwareness", // non-existing sample?
		"sap.uxap.sample.MixedBlock" // non-existing sample?
	]).placeAt('qunit-fixture');

});
