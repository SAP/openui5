/*global QUnit */
(function() {
	"use strict";

	QUnit.test("Check Resource Root", function(assert) {
		var tag = document.querySelector("[data-expected-root]");
		var expected = tag && tag.getAttribute("data-expected-root");
		assert.notEqual(expected, null, "Test Page must contain a 'data-expected-root' attribute");
		assert.equal(sap.ui.require.toUrl("") + "/", expected);
	});

}());
