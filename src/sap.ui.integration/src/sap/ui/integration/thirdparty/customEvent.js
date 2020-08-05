/**
 * Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/
 *
 * Code copied from Mozilla Developer Network:
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
 */

(function () {
	"use strict";

	if ( typeof window.CustomEvent === "function" ) {
		return false;
	}

	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: null };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}

	window.CustomEvent = CustomEvent;
})();