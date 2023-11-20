sap.ui.define(function() {
	"use strict";

	var promise, resolve, reject;

	promise =  new Promise(function(_resolve,_reject) {
		resolve = _resolve;
		reject = _reject;
	});

	return {
		then: promise.then.bind(promise),
		resolve: resolve,
		reject: reject
	};

});