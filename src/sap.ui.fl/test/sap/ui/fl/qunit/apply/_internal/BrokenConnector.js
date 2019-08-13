/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector"
], function(
	merge,
	BaseConnector
) {
	"use strict";

	/**
	 * Test Connector which breaks on every call to test failing behavior as well as custom connector registration
	 */
	return merge({}, BaseConnector, {
		testCheckProperty: true
	});
});