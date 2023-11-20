/*global jQuery */
(function(jQuery) {
	"use strict";
	jQuery.fn.jquery = "3.7.0";

	/* eslint-disable no-console */
	var fnConsoleWarn = console.warn;
	window.aWarnMessages = [];

	console.warn = function(sMessage) {
		window.aWarnMessages.push(sMessage);
		fnConsoleWarn.apply(this, arguments);
	};
	/* eslint-enable no-console */
})(jQuery);

