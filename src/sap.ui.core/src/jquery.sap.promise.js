/*!
 * ${copyright}
 */

/*global ES6Promise */

if (!window.Promise) {
	jQuery.sap.require("sap.ui.thirdparty.es6-promise");
	ES6Promise.polyfill();
}
