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
	/**
	 * Test Connector which breaks on every call to test failing behavior as well as custom connector registration
	 */
	var BrokenConnector = merge({}, BaseConnector, {
		testCheckProperty: true,

		loadFlexData: function () {
			return Promise.reject("loadFlexData is broken");
		},

		loadFeatures: function () {
			return Promise.reject("loadFeatures is broken");
		}

	});

	return BrokenConnector;
});