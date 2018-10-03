(function() {
	"use strict";

	// ignore "error" event fired via jQuery.trigger() (e.g. from sap.m.Image control in FF or PhantomJS)
	// FF adds a prefix "uncaught exception: ", PhantomJS simply calls toString().
	// therefore we test with a regular expression
	window.onerror = function(e) {
		return /\[object Object\]/.test(e);
	};

	sap.ui.define([
		"sap/ui/demo/mock/qunit/SampleTester"
	], function(SampleTester) {
		new SampleTester('sap.uxap',
				[
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

})();