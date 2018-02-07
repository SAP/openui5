/*global QUnit*/

QUnit.config.autostart = false;

/**
 * General consistency checks on designtime metadata of controls in the sap.ui.fl library
 */
sap.ui.require(["sap/ui/dt/test/LibraryTest"], function (LibraryTest) {
	"use strict";
	LibraryTest("sap.ui.fl", QUnit);
});
