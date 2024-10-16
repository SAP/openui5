(function() {
	"use strict";

	const jQuery = function () {};
	jQuery.fn = jQuery.prototype = {
		jquery: ""
	};
	jQuery.fx = {};
	jQuery.expr = {
		pseudos: {}
	};

	// expose jQuery as a global
	// ui5lint-disable-next-line no-globals
	globalThis.$ = globalThis.jQuery = jQuery;
}());
