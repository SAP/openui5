/*global QUnit*/

/**
 * General consistency checks on designtime metadata of controls in the sap.ui.fl library
 */
sap.ui.require([
	"sap/ui/dt/test/LibraryTest",
	"sap/ui/thirdparty/jquery"
], function (
	LibraryTest,
	jQuery
) {
	"use strict";

	var pTestsCreated = LibraryTest("sap.ui.fl", QUnit);

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});

	return pTestsCreated;
});