/*global QUnit, jQuery */
(function() {
	"use strict";

	QUnit.test("no jQuery compat applied", function(assert) {
		assert.ok(!jQuery.fn.size, "jQuery compat should not be applied");

		assert.ok(window.aErrorMessages.some(function(sMessage) {
			return sMessage === "The current jQuery version 4.0.0 differs at the major version than the version 3.6.0 that is used for testing jquery-compat.js. jquery-compat.js shouldn't be applied in this case!";
		}), "error message is written");
	});
})();
