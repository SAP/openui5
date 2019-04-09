/*global QUnit*/

/**
 * General consistency checks on designtime metadata of controls in the sap.ui.fl library
 */
sap.ui.define([
	"sap/ui/dt/enablement/libraryTest"
], function (
	libraryValidator
) {
	"use strict";

	return libraryValidator("sap.ui.fl", QUnit);
});