sap.ui.define([], function() {
	"use strict";

	/*
	 * The module returns a promise.
	 * Any referring API call (define or require) should expose that Promise and not its fulfillment.
	 */
	return Promise.resolve(42);
});