/*global QUnit, jQuery */
(function() {
	"use strict";

	QUnit.test("no jQuery compat applied", function(assert) {
		assert.ok(jQuery.fn.size, "jQuery compat should be applied");

		assert.ok(window.aWarnMessages.some(function(sMessage) {
			return sMessage === "The current jQuery version 3.7.0 is different than the version 3.6.0 that is used for testing jquery-compat.js. jquery-compat.js is applied but it may not work properly.";
		}), "warning message is written");
	});
})();
