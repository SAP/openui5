(function() {
	"use strict";
	// Ignore the resize observer error in chrome
	window.onerror = function(msg) {
		return /ResizeObserver loop limit exceeded/.test(msg);
	};
}());
