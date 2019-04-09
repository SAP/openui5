/*global QUnit*/

/**
 * General consistency checks on designtime metadata of controls in the sap.uxap library
 */
sap.ui.define([
	"sap/ui/dt/enablement/libraryTest"
], function (
	libraryValidator
) {
	"use strict";

	return libraryValidator("sap.uxap", QUnit);
});
