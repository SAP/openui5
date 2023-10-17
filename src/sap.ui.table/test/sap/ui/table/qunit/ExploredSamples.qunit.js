sap.ui.define([
	"sap/ui/demo/mock/qunit/SampleTester"
], function(SampleTester) {
	"use strict";

	new SampleTester('sap.ui.table', [
		"sap.ui.table.sample.SelectCopyPaste"
	] /*Excludes*/).placeAt('content');

});