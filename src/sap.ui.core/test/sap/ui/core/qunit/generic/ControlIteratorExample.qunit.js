/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/ControlIterator"
], function(ControlIterator) {
	"use strict";

	ControlIterator.run(function(sControlName, oControlClass, oInfo) { // loop over all controls

		QUnit.test("Testing control " + sControlName, function(assert) { // create one test per control
			assert.ok(true, sControlName + " would be tested now");
		});

	},{
		done: function(oResult) {
			// do something when all control callbacks have been executed (tests have been created)

			QUnit.start(); // tell QUnit that all tests have now been created (due to autostart=false)
		}
	});

});
