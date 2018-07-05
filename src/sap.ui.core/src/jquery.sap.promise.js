/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/*global ES6Promise */

	if (!window.Promise) {
		sap.ui.requireSync("sap/ui/thirdparty/es6-promise");
		ES6Promise.polyfill();
	}

});
