/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/ControlIterator"
], function(ControlIterator) {
	"use strict";

	QUnit.test("Testing all controls", function(assert) { // one single QUnit test for all controls
		var testDone = assert.async();                    // this test is asynchronous, hence need to tell QUnit later when done

		ControlIterator.run(function(sControlName, oControlClass, oInfo) { // loop over all controls
			assert.ok(true, sControlName + " would be tested now");        // do one or more asserts per control
		},{
			done: function(oResult) {
				// do something when all control tests have been executed

				testDone(); // tell QUnit that this test is done
			}
		});
	});

});
