/*global QUnit */

/**
 * General consistency checks on designtime metadata of controls in the sap.ui.webc.main library
 */
 sap.ui.define([
	"sap/ui/dt/enablement/libraryTest"
], function (
	libraryValidator
) {
	"use strict";

	return libraryValidator("sap.ui.webc.main", QUnit);
});