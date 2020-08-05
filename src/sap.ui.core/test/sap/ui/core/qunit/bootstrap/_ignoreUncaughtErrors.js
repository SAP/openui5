(function() {
	"use strict";

	/*
	 * FireFix 10 throws an exception for failed script loads and newer QUnit versions
	 * register an onerror handler and report global errors as test failures.
	 *
	 * This test intentionally references non-existing files and therefore fails
	 * in FireFox 10, when newer QUnit versions are used.
	 *
	 * As a workarund, a 'Don't care' global event handler is used, which is honored by QUnit.
	 */
	window.onerror = function(e) {
		return true;
	};

}());
