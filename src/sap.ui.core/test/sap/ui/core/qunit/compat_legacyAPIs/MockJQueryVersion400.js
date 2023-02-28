/*global jQuery */
(function(jQuery) {
	"use strict";
	jQuery.fn.jquery = "4.0.0";

	/* eslint-disable no-console */
	var fnConsoleError = console.error;
	window.aErrorMessages = [];

	console.error = function(sMessage) {
		window.aErrorMessages.push(sMessage);
		fnConsoleError.apply(this, arguments);
	};
	/* eslint-enable no-console */
})(jQuery);

