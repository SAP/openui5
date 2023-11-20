/*global QUnit, jQuery */
(function() {
	"use strict";

	QUnit.test("no jQuery compat applied", function(assert) {
		assert.ok(!jQuery.fn.size, "jQuery compat should not be applied");
	});
})();
