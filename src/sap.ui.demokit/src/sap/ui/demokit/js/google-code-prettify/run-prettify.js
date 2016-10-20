/*!
 * ${copyright}
 */
(function() {

	/*global document,prettyPrint */

	function prettify() {
		if ( typeof prettyPrint === 'function' ) {
			prettyPrint();
		}
	}

	function onLoaded() {
		document.removeEventListener( "DOMContentLoaded", onLoaded, false );
		prettify();
	}

	if ( document.readyState === 'complete' ) {
		prettify();
	} else {
		document.addEventListener( "DOMContentLoaded", onLoaded, false );
	}

}());