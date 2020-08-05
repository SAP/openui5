/*global QUnit */

/**
 * General consistency checks on designtime metadata of controls in the sap.f library
 */
sap.ui.define([
	"sap/ui/dt/enablement/libraryTest"
], function (
	libraryValidator
) {
	"use strict";

	return libraryValidator("sap.tnt", QUnit);
});