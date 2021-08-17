/*!
 * ${copyright}
 */

/* global XMLHttpRequest */
(function() {

	"use strict";

	/*
	 * This script loads and executes the ui5loader.js and ui5loader-autoconfig.js
	 * in a way (sync XHR)  that is not visible to the ui5loader-autoconfig.js (which checks only script tags).
	 *
	 * This is necessary to check the resource root detection in ui5loader-autoconfig
	 * for those cases that don't use a known script name.
	 */

	function loadAndExecSync(url) {
		var xhr = new XMLHttpRequest();
		var code = '';
		xhr.addEventListener('load', function(e) {
			if ( xhr.status === 200 ) {
				code = xhr.responseText;
				code = code +  "\n//# sourceURL=" + url + "?fancyboot";
			}
		});
		xhr.open('GET', url, false);
		xhr.send();

		// eslint-disable-next-line no-eval
		window.eval(code);  // legacy-relevant
	}

	loadAndExecSync('../../../../../../resources/ui5loader.js');
	loadAndExecSync('../../../../../../resources/ui5loader-autoconfig.js');

}());
