/*
 * ! ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Test Connector which breaks on every call to test failing behavior as well as custom connector registration
	 */
	return {
		loadFlexData: function () {
			return Promise.reject();
		},
		testInitialCheckProperty: true
	};
});