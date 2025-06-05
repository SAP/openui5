sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	'sap/ui/demo/mock/qunit/SampleTester'
], function(createAndAppendDiv, SampleTester) {
	"use strict";

	createAndAppendDiv("content");

	new SampleTester(
		'sap.m',
		[
			"sap.m.sample.PageListReportIconTabBar",
			"sap.m.sample.PageListReportToolbar",
			"sap.m.sample.PDFViewerEmbedded",
			"sap.m.sample.PDFViewerPopup",
			"sap.m.sample.PDFViewerMultiple"
		]
	).placeAt('content');

});
