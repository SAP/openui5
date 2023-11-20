(function() {
	"use strict";
	// ignore "error" event fired via jQuery.trigger() (e.g. from sap.m.Image control in FF)
	// Browsers may prefix the msg with an error type (e.g. "Error:" or "Uncaught Exception:")
	// therefore we test with a regular expression
	window.onerror = function(msg) {
		return /\[object Object\]/.test(msg);
	};
}());